import { Link, Navigate, Route, Routes } from 'react-router'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'

export default function App() 
{
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="flex gap-4 border-b border-slate-200 bg-white px-6 py-3">
        <Link to="/" className="font-medium hover:text-blue-600">Dashboard</Link>
        <Link to="/login" className="font-medium hover:text-blue-600">Login</Link>
      </nav>
      <main className="p-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}