const TOKEN_KEY = 'proinsight_token'
const REFRESH_KEY = 'proinsight_refresh'

export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY)
  },

  set(token: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(REFRESH_KEY, refreshToken)
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}
