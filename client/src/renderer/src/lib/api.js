const BASE_URL = import.meta.env.RENDERER_VITE_API_URL
export class ApiError extends Error {
  status
  details
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}
let AccessToken = null
let onSessionExpired = null
let refreshing = null
export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler
}
export async function startSession(tokens) {
  AccessToken = tokens.AccessToken
  await window.api.session.save(tokens.RefreshToken)
}
export async function endSession() {
  AccessToken = null
  await window.api.session.clear()
}
function refreshSession() {
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
      await startSession(await res.json())
      return true
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}
export const restoreSession = refreshSession
export async function api(path, options = {}) {
  const { method = 'GET', body, auth = true } = options
  const send = () => {
    const headers = {}
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (auth && AccessToken) headers['Authorization'] = `Bearer ${AccessToken}`
    return fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  }
  let res = await send()
  if (res.status === 401 && auth) {
    if (await refreshSession()) {
      res = await send()
    } else {
      await endSession()
      onSessionExpired?.()
    }
  }
  if (res.status === 204) return undefined
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? 'Request failed', data?.errors)
  }
  return data
}
