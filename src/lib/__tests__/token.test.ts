import { describe, it, expect, beforeEach } from 'vitest'
import { tokenStorage } from '@/lib/token'

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when no token is stored', () => {
    expect(tokenStorage.getToken()).toBeNull()
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })

  it('stores and retrieves token and refresh token', () => {
    tokenStorage.set('jwt-token-123', 'refresh-token-456')

    expect(tokenStorage.getToken()).toBe('jwt-token-123')
    expect(tokenStorage.getRefreshToken()).toBe('refresh-token-456')
  })

  it('clears both tokens', () => {
    tokenStorage.set('jwt-token-123', 'refresh-token-456')
    tokenStorage.clear()

    expect(tokenStorage.getToken()).toBeNull()
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })

  it('overwrites previous tokens on set', () => {
    tokenStorage.set('old-token', 'old-refresh')
    tokenStorage.set('new-token', 'new-refresh')

    expect(tokenStorage.getToken()).toBe('new-token')
    expect(tokenStorage.getRefreshToken()).toBe('new-refresh')
  })

  it('clear does not affect other localStorage keys', () => {
    localStorage.setItem('theme', 'dark')
    tokenStorage.set('token', 'refresh')
    tokenStorage.clear()

    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
