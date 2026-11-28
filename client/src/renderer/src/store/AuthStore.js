import { create } from 'zustand'
import { api, endSession, restoreSession, setSessionExpiredHandler, startSession } from '../lib/api'
import { queryClient } from '../lib/queryclient'
export const useAuthStore = create((set, get) => ({
  user: null,
  status: 'loading',
  init: async () => {
    try {
      if (await restoreSession()) {
        const user = await api('/auth/me')
        set({ user, status: 'authenticated' })
        return
      }
    } catch {}
    set({ user: null, status: 'unauthenticated' })
  },
  login: async (email, password) => {
    const res = await api('/auth/login', {
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
    if (RefreshToken) {
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
