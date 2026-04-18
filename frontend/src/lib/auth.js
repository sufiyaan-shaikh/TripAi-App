const TOKEN_KEY   = "tripai_token"
const REFRESH_KEY = "tripai_refresh"
const USER_KEY    = "tripai_user"

let BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"
// Force IPv4 loopback to avoid Windows fetch issues without needing a dev server restart
if (BACKEND_URL.includes("localhost")) {
  BACKEND_URL = BACKEND_URL.replace("localhost", "127.0.0.1")
}

export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem(TOKEN_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

export const saveUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const getStoredUser = () => {
  const u = localStorage.getItem(USER_KEY)
  return u ? JSON.parse(u) : null
}

export const registerUser = async (email, password, fullName) => {
  const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name: fullName })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || "Registration failed")
  return data
}

export const loginUser = async (email, password) => {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || "Login failed")
  return data
}

export const logoutUser = async () => {
  const token = getToken()
  if (token) {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {})
  }
  clearTokens()
}

export const getCurrentUser = async () => {
  const token = getToken()
  if (!token) return null
  const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) { clearTokens(); return null }
  return res.json()
}

export const isLoggedIn = () => !!getToken()