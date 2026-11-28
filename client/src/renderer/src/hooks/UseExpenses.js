import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
const KEY = ['expenses']
export function UseExpenses(filters = {}) {
  const params = new URLSearchParams()
  if (filters.month) params.set('month', filters.month)
  if (filters.category) params.set('category', filters.category)
  const query = params.toString()
  return useQuery({
    queryKey: [...KEY, 'list', filters],
    queryFn: () => api(`/expenses${query ? `?${query}` : ''}`)
  })
}
export function UseCategories() {
  return useQuery({
    queryKey: [...KEY, 'categories'],
    queryFn: () => api('/expenses/categories')
  })
}
export function UseUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }) => api(`/expenses/${id}`, { method: 'PATCH', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY })
  })
}
export function UseCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input) => api('/expenses', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY })
  })
}
export function UseDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api(`/expenses/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY })
  })
}
