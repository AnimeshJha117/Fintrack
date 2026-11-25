import { useState, type FormEvent } from 'react'
import Field from '../components/Field'
import { UseCreateExpense, UseDeleteExpense, UseExpenses } from '../hooks/UseExpenses'
import { errorMessage } from '../lib/errors'
import { FormatMoney, ToMinor } from '../lib/money'

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Bills', 'Shopping', 'Health', 'Entertainment']

const today = (): string => new Date().toLocaleDateString('en-CA')

export default function ExpensesPage() 
{
    const { data, isLoading, error } = UseExpenses()
    const create = UseCreateExpense()
    const remove = UseDeleteExpense()

    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState(today())
    const [formError, setFormError] = useState('')

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
                <button disabled={create.isPending} className="rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:col-span-2">
                    {create.isPending ? 'Adding' : 'Add expense'}
                </button>
            </form>

            {isLoading && <p className="text-slate-500">Loading</p>}
            {error && <p className="text-red-600">{errorMessage(error)}</p>}
            {data?.length === 0 && <p className="text-slate-500">No expenses yet.</p>}

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
                        <button
                            onClick={() => remove.mutate(expense.id)}
                            disabled={remove.isPending}
                            className="text-sm text-red-600 hover:underline disabled:opacity-50">
                                Delete
                            </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}