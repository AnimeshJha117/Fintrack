import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface Expense 
{
    id: string
    amount: number
    category: string
    description: string
    date: string
}

export interface ExpenseInput 
{
    amount: number
    category: string
    description?: string
    date?: string
}

const KEY = ['expenses']

export interface ExpenseFilters 
{
    month?: string
    category?: string
}

export function UseExpenses(filters: ExpenseFilters = {}) 
{
    const params = new URLSearchParams()
    if (filters.month) params.set('month', filters.month)
    if (filters.category) params.set('category', filters.category)
    const query = params.toString()

    return useQuery
    ({
        queryKey: [...KEY, 'list', filters],
        queryFn: () => api<Expense[]>(`/expenses${query ? `?${query}` : ''}`)
    })
}

export function UseCategories() 
{
    return useQuery
    ({
        queryKey: [...KEY, 'categories'],
        queryFn: () => api<string[]>('/expenses/categories')
    })
}

export function UseUpdateExpense() 
{
    const qc = useQueryClient()
    return useMutation
    ({
        mutationFn: ({ id, input }: { id: string; input: Partial<ExpenseInput> }) =>
        api<Expense>(`/expenses/${id}`, { method: 'PATCH', body: input }),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY })
    })
}

export function UseCreateExpense() 
{
    const qc = useQueryClient()
    return useMutation
    ({
        mutationFn: (input: ExpenseInput) => api<Expense>('/expenses', { method: 'POST', body: input }),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY })
    })
}

export function UseDeleteExpense() 
{
    const qc = useQueryClient()
    return useMutation
    ({
        mutationFn: (id: string) => api<void>(`/expenses/${id}`, { method: 'DELETE' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY })
    })
}