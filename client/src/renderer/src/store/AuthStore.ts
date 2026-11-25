import { create } from 'zustand'
import { api, endSession, restoreSession, setSessionExpiredHandler, startSession } from '../lib/api'
import { queryClient } from '../lib/queryclient'

export interface User 
{
    id: string
    name: string
    email: string
}

type Status = 'loading' | 'authenticated' | 'unauthenticated'

interface LoginResponse 
{
    AccessToken: string
    RefreshToken: string
    user: User
}

interface AuthState 
{
    user: User | null
    status: Status
    init: () => Promise<void>
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    status: 'loading',

    init: async () => {
        try 
        {
            if (await restoreSession()) 
            {
                const user = await api<User>('/auth/me')
                set({ user, status: 'authenticated' })
                return
            }
        } 
        catch {}
        set({ user: null, status: 'unauthenticated' })
    },

    login: async (email, password) => {
        const res = await api<LoginResponse>('/auth/login', 
        {
            method: 'POST',
            body: { email, password },
            auth: false
        })

        await startSession(res)
        set({ user: res.user, status: 'authenticated' })
    },

    register: async (name, email, password) => {
        await api('/auth/register', { method: 'POST', body: { name, email, password }, auth: false })
        await get().login(email, password)
    },

    logout: async () => {
        const RefreshToken = await window.api.session.load()
        if (RefreshToken) 
        {
            await api('/auth/logout', {
                method: 'POST',
                body: { RefreshToken },
                auth: false
            }).catch(() => undefined)
        }
        
        await endSession()
        queryClient.clear()
        set({ user: null, status: 'unauthenticated' })
    }
}))

setSessionExpiredHandler(() => {
    queryClient.clear()
    useAuthStore.setState({ user: null, status: 'unauthenticated' })
})