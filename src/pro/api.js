// Pro on the web talks to tasa-dolar-api directly: rates come from the same
// endpoint the mobile app uses, and the license endpoints check the Google
// Play subscription. (The public pages use Netlify proxies instead; here the
// license rate limits need each visitor's own IP.)
// VITE_PRO_API_URL points a local build at a local API for testing.
const API = import.meta.env.VITE_PRO_API_URL || 'https://tasa-dolar-api-58e5e9d2d0fe.herokuapp.com/api/v1'

const TOKEN_KEY = 'tasa-dolar-pro-token'

// Kept in memory too, so the session still lasts for this tab when the
// browser blocks storage.
let memoryToken = null

export const storedToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || memoryToken
  } catch {
    return memoryToken
  }
}

export const storeToken = (token) => {
  memoryToken = token || null
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage blocked: memoryToken covers this tab.
  }
}

const request = async (path, options = {}) => {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { accept: 'application/json', 'content-type': 'application/json', ...options.headers },
  })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, ok: res.ok, body }
}

// Trades the code shown in the app for a web token.
// Resolves to { token, license } or { error }.
export const redeemCode = async (code) => {
  const { ok, status, body } = await request('/pro/sessions', { method: 'POST', body: JSON.stringify({ code }) })
  if (ok) return body
  return { error: body.error || (status === 429 ? 'too_many_attempts' : 'request_failed') }
}

// This browser's license: { license: { active, plan, expires_at } }, or
// { error: 'signed_out' } when another computer took it over.
export const fetchSession = async (token) => {
  const { ok, status, body } = await request('/pro/session', { headers: { authorization: `Bearer ${token}` } })
  if (ok) return body
  return { error: status === 401 ? 'signed_out' : 'request_failed' }
}

export const fetchRates = async () => {
  const { ok, body } = await request('/data')
  if (!ok || !body.rates) throw new Error('rates unavailable')
  return body.rates
}
