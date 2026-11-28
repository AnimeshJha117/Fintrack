import { ApiError } from './api'
export function errorMessage(err) {
  if (err instanceof ApiError) {
    if (err.details && typeof err.details === 'object') {
      const first = Object.entries(err.details)[0]
      if (first) return `${first[0]}: ${first[1][0]}`
    }
    return err.message
  }
  return 'Could not reach the server'
}
