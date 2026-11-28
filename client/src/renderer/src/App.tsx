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
      <nav className="flex items-center gap-8 border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
        <Link to="/" className="rounded-md border border-transparent px-4 py-2 font-medium text-black transition-colors duration-200 hover:border-black hover:bg-black hover:text-white">
          Dashboard
        </Link>

        <Link to="/expenses" className="rounded-md border border-transparent px-4 py-2 font-medium text-black transition-colors duration-200 hover:border-black hover:bg-black hover:text-white">
          Expenses
        </Link>

        {status === 'authenticated' && (
          <button onClick={() => void logout()} className="ml-auto rounded-md border border-black bg-black px-5 py-2 font-medium text-white transition-colors duration-200 hover:bg-white hover:text-black">
            Log Out
          </button>
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