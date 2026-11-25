import { useAuthStore } from '../store/AuthStore'

export default function DashboardPage() 
{
  const user = useAuthStore((s) => s.user)

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-slate-600">Welcome, {user?.name}.</p>
    </div>
  )
}