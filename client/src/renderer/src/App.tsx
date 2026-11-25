import { useEffect } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { useAuthStore } from './store/AuthStore'
import ExpensesPage from './pages/ExpensesPage'

export default function App() 
{
  const { status, init, logout } = useAuthStore()

  useEffect(() => { void init() }, [init])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="flex gap-4 border-b border-slate-200 bg-white px-6 py-3">
        <Link to="/" className="font-medium hover:text-blue-600">Dashboard</Link>
        <Link to="/expenses" className="font-medium hover:text-blue-600">Expenses</Link>
        {status === 'authenticated' && (
          <button onClick={() => void logout()} className="ml-auto font-medium hover:text-blue-600">Log Out</button>
        )}
      </nav>
      <main className="p-6">
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}