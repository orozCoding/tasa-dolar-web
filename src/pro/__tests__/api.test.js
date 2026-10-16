import { afterEach, describe, expect, it, vi } from 'vitest'

describe('session token storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('keeps the token for this tab when storage is blocked', async () => {
    const blocked = () => { throw new Error('SecurityError') }
    vi.stubGlobal('localStorage', { getItem: blocked, setItem: blocked, removeItem: blocked })
    const { storeToken, storedToken } = await import('../api')

    storeToken('web-token')
    expect(storedToken()).toBe('web-token')

    storeToken(null)
    expect(storedToken()).toBeNull()
  })

  it('uses localStorage when it works', async () => {
    const store = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => store.set(k, v),
      removeItem: (k) => store.delete(k),
    })
    const { storeToken, storedToken } = await import('../api')

    storeToken('web-token')
    expect(store.get('tasa-dolar-pro-token')).toBe('web-token')
    expect(storedToken()).toBe('web-token')
  })
})
