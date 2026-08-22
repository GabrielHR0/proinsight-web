export const AUTH_EVENTS = {
  sessionExpired: 'proinsight:auth:session-expired',
  tokenRefreshed: 'proinsight:auth:token-refreshed',
}

export function dispatchSessionExpired() {
  window.dispatchEvent(new CustomEvent(AUTH_EVENTS.sessionExpired))
}

export function dispatchTokenRefreshed(token: string) {
  window.dispatchEvent(new CustomEvent(AUTH_EVENTS.tokenRefreshed, { detail: { token } }))
}
