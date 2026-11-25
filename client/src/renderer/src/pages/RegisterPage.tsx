import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import Field from '../components/Field'
import { errorMessage } from '../lib/errors'
import { useAuthStore } from '../store/AuthStore'

export default function RegisterPage() 
{
    const { status, register } = useAuthStore()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    if (status === 'authenticated') return <Navigate to="/" replace />

    async function onSubmit(e: FormEvent): Promise<void> 
    {
        e.preventDefault()
        setError('')
        setBusy(true)
        try { await register(name, email, password) } 
        catch (err) { setError(errorMessage(err)) } 
        finally { setBusy(false) }
    }

    return (
        <form onSubmit={onSubmit} className="mx-auto mt-10 max-w-sm space-y-4">
            <h1 className="text-2xl font-semibold">Create account</h1>
            <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Field
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required/>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={busy}className="w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {busy ? 'Creating...' : 'Register'}
            </button>
            <p className="text-sm text-slate-600">
                Already registered?{' '}
                <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
            </p>
        </form>
    )
}