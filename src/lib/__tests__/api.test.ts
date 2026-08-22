import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from '@/lib/api'
import { tokenStorage } from '@/lib/token'
import { AUTH_EVENTS } from '@/lib/auth-events'

describe('api interceptors', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds Authorization header when token exists', async () => {
    tokenStorage.set('test-jwt-token', 'refresh')

    const config = { headers: {} as Record<string, string> }
    const handlers = api.interceptors.request.handlers
    const interceptor = handlers?.[0]

    if (interceptor?.fulfilled) {
      const result = await interceptor.fulfilled(config as never)
      expect(result.headers.Authorization).toBe('Bearer test-jwt-token')
    }
  })

  it('does not add Authorization header when no token', async () => {
    const config = { headers: {} as Record<string, string> }
    const handlers = api.interceptors.request.handlers
    const interceptor = handlers?.[0]

    if (interceptor?.fulfilled) {
      const result = await interceptor.fulfilled(config as never)
      expect(result.headers.Authorization).toBeUndefined()
    }
  })

  it('adds X-Academia-Id header when stored', async () => {
    localStorage.setItem('proinsight_academia_id', 'acad-123')

    const config = { headers: {} as Record<string, string> }
    const handlers = api.interceptors.request.handlers
    const interceptor = handlers?.[0]

    if (interceptor?.fulfilled) {
      const result = await interceptor.fulfilled(config as never)
      expect(result.headers['X-Academia-Id']).toBe('acad-123')
    }
  })

  it('destroys session when /auth/me fails with 403', async () => {
    tokenStorage.set('jwt', 'refresh')
    localStorage.setItem('proinsight_academia_id', 'acad-123')
    const spy = vi.fn()
    window.addEventListener(AUTH_EVENTS.sessionExpired, spy)

    const config = { url: '/auth/me', headers: {} as Record<string, string>, _retry: false } as never
    const error = {
      isAxiosError: true,
      config,
      response: { status: 403, data: {} },
    } as never

    const handlers = api.interceptors.response.handlers
    const interceptor = handlers?.[0]

    await expect(interceptor?.rejected?.(error)).rejects.toBeDefined()

    expect(tokenStorage.getToken()).toBeNull()
    expect(localStorage.getItem('proinsight_academia_id')).toBeNull()
    expect(spy).toHaveBeenCalledTimes(1)
    window.removeEventListener(AUTH_EVENTS.sessionExpired, spy)
  })

  it('destroys session when /auth/me fails with network error', async () => {
    tokenStorage.set('jwt', 'refresh')
    localStorage.setItem('proinsight_academia_id', 'acad-123')
    const spy = vi.fn()
    window.addEventListener(AUTH_EVENTS.sessionExpired, spy)

    const config = { url: '/auth/me', headers: {} } as never
    const error = { isAxiosError: true, config, response: undefined } as never

    const handlers = api.interceptors.response.handlers
    const interceptor = handlers?.[0]

    await expect(interceptor?.rejected?.(error)).rejects.toBeDefined()

    expect(tokenStorage.getToken()).toBeNull()
    expect(localStorage.getItem('proinsight_academia_id')).toBeNull()
    expect(spy).toHaveBeenCalledTimes(1)
    window.removeEventListener(AUTH_EVENTS.sessionExpired, spy)
  })
})
