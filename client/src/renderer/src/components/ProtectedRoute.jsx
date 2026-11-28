import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../store/AuthStore'
export default function ProtectedRoute() {
  const status = useAuthStore((s) => s.status)
  if (status === 'loading') return <p className="text-slate-500">Loading</p>
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  return <Outlet />
}
