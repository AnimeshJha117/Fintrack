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

export function UseExpenses() 
{
    return useQuery({ queryKey: KEY, queryFn: () => api<Expense[]>('/expenses') })
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

export function UseDeleteExpense() {
    const qc = useQueryClient()
    return useMutation
    ({
        mutationFn: (id: string) => api<void>(`/expenses/${id}`, { method: 'DELETE' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY })
    })
}