import { useState, type FormEvent } from 'react'
import Field from '../components/Field'
import { UseCategories, UseCreateExpense, UseDeleteExpense, UseExpenses, UseUpdateExpense, type Expense } from '../hooks/UseExpenses'
import { errorMessage } from '../lib/errors'
import { FormatMoney, FromMinor, ToMinor } from '../lib/money'

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Bills', 'Shopping', 'Health', 'Entertainment']

const today = (): string => new Date().toLocaleDateString('en-CA')

export default function ExpensesPage() 
{
    const [month, setMonth] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const { data, isLoading, error } = UseExpenses({ month, category: filterCategory })
    const { data: categories } = UseCategories()
    const create = UseCreateExpense()
    const update = UseUpdateExpense()
    const remove = UseDeleteExpense()
    const [editing, setEditing] = useState<Expense | null>(null)

    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState(today())
    const [formError, setFormError] = useState('')

    function startEdit(expense: Expense): void 
    {
        setEditing(expense)
        setAmount(FromMinor(expense.amount))
        setCategory(expense.category)
        setDescription(expense.description)
        setDate(expense.date.slice(0, 10))
        setFormError('')
    }

    function cancelEdit(): void {
        setEditing(null)
        setAmount('')
        setCategory('')
        setDescription('')
        setDate(today())
        setFormError('')
    }

    async function onSubmit(e: FormEvent): Promise<void> 
    {
        e.preventDefault()
        setFormError('')

        const minor = ToMinor(amount)
        if (minor === null) 
        {
            setFormError('Enter a valid amount')
            return
        }

        try 
        {
            if (editing) 
            {
                await update.mutateAsync
                ({
                    id: editing.id,
                    input: { amount: minor, category, description, date }
                })

                cancelEdit()
            } 
            else 
            {
                await create.mutateAsync
                ({
                    amount: minor,
                    category,
                    description: description || undefined,
                    date
                })

                setAmount('')
                setDescription('')
            }
        } 
        catch (err) { setFormError(errorMessage(err)) }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Expenses</h1>

            <form onSubmit={onSubmit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
                <Field
                    label="Amount (₹)"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
                <Field
                    label="Category"
                    list="categories"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                />
                <datalist id="categories">
                    {CATEGORIES.map((c) => ( <option key={c} value={c} /> ))}
                </datalist>
                <Field
                    label="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <Field
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
                {formError && <p className="text-sm text-red-600 sm:col-span-2">{formError}</p>}
                <div className="flex gap-3 sm:col-span-2">
                    <button disabled={create.isPending || update.isPending} className="flex-1 rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                        {editing ? 'Save changes' : 'Add expense'}
                    </button>
                    {editing && (
                        <button type="button" onClick={cancelEdit} className="rounded-md border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100">
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="flex max-w-2xl flex-wrap items-end gap-4">
                <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Month</span>
                <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="rounded-md border border-slate-300 px-3 py-2"
                />
                </label>
                <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Category</span>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="rounded-md border border-slate-300 px-3 py-2"
                >
                    <option value="">All</option>
                    {categories?.map((c) => (
                    <option key={c} value={c}>
                        {c}
                    </option>
                    ))}
                </select>
                </label>
                {(month || filterCategory) && (
                    <button type="button" onClick={() => { setMonth(''); setFilterCategory(''); }}
                        className="pb-2 text-sm text-blue-600 hover:underline">
                            Clear filters
                    </button>
                )}
            </div>

            {isLoading && <p className="text-slate-500">Loading...</p>}
            {error && <p className="text-red-600">{errorMessage(error)}</p>}
            {data?.length === 0 && <p className="text-slate-500">No expenses found.</p>}

            <ul className="max-w-2xl divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
                {data?.map((expense) => (
                    <li key={expense.id} className="flex items-center gap-4 px-4 py-3">
                        <div className="flex-1">
                            <p className="font-medium">{expense.category}</p>
                            <p className="text-sm text-slate-500">
                                {new Date(expense.date).toLocaleDateString('en-IN', { timeZone: 'UTC' })}
                                {expense.description && ` · ${expense.description}`}
                            </p>
                        </div>
                        <p className="font-medium">{FormatMoney(expense.amount)}</p>
                        <button onClick={() => startEdit(expense)} className="text-sm text-blue-600 hover:underline">
                            Edit
                        </button>
                            <button onClick={() => {
                                remove.mutate(expense.id)
                                if (editing?.id === expense.id) cancelEdit()
                            }} disabled={remove.isPending} className="text-sm text-red-600 hover:underline disabled:opacity-50">
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}