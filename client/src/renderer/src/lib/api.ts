const BASE_URL = import.meta.env.RENDERER_VITE_API_URL

export class ApiError extends Error 
{
    constructor(public status: number, message: string, public details?: unknown) 
    {
        super(message)
    }
}

interface Tokens 
{
    AccessToken: string
    RefreshToken: string
}

let AccessToken: string | null = null
let onSessionExpired: (() => void) | null = null
let refreshing: Promise<boolean> | null = null

export function setSessionExpiredHandler(handler: () => void): void 
{
    onSessionExpired = handler
}

export async function startSession(tokens: Tokens): Promise<void> 
{
    AccessToken = tokens.AccessToken
    await window.api.session.save(tokens.RefreshToken)
}

export async function endSession(): Promise<void> 
{
    AccessToken = null
    await window.api.session.clear()
}

function refreshSession(): Promise<boolean> 
{
    refreshing ??= (async () => {
        try {
            const RefreshToken = await window.api.session.load()
            if (!RefreshToken) return false

            const res = await fetch(`${BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ RefreshToken })
            })
            if (!res.ok) return false

            await startSession((await res.json()) as Tokens)
            return true
        } 
        finally { refreshing = null }
    })()

    return refreshing
}

export const restoreSession = refreshSession
interface RequestOptions 
{
    method?: string
    body?: unknown
    auth?: boolean
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> 
{
    const { method = 'GET', body, auth = true } = options

    const send = (): Promise<Response> => {
        const headers: Record<string, string> = {}
        if (body !== undefined) headers['Content-Type'] = 'application/json'
        if (auth && AccessToken) headers['Authorization'] = `Bearer ${AccessToken}`
        return fetch(`${BASE_URL}${path}`, 
        {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined
        })
    }

    let res = await send()

    if (res.status === 401 && auth) 
    {
        if (await refreshSession()) { res = await send() } 
        else 
        {
            await endSession()
            onSessionExpired?.()
        }
    }

    if (res.status === 204) return undefined as T

    const data = await res.json().catch(() => null)
    if (!res.ok) 
    {
        throw new ApiError(res.status, data?.message ?? 'Request failed', data?.errors)
    }

    return data as T
}