import { API_URL } from '../config/api'

const TOKEN_KEY = 'dhaka_flower_tub_admin_token'

export const getAdminToken = () => window.localStorage.getItem(TOKEN_KEY)

export const saveAdminToken = (token) => window.localStorage.setItem(TOKEN_KEY, token)

export const clearAdminToken = () => window.localStorage.removeItem(TOKEN_KEY)

export const adminRequest = async (path, options = {}) => {
  const token = getAdminToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(payload.message || 'The request could not be completed.')
    error.status = response.status
    throw error
  }

  return payload
}

export { API_URL }
