import { describe, it, expect, vi, afterEach } from 'vitest'
import { playBeep } from '@/lib/sound'

describe('playBeep', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('não lança erro quando AudioContext não existe', () => {
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('webkitAudioContext', undefined)

    expect(() => playBeep(880, 100)).not.toThrow()
  })

  it('cria oscilador quando AudioContext disponível', () => {
    const gain = {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    }
    const osc = { type: '', frequency: { value: 0 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
    const ctx = {
      currentTime: 0,
      state: 'running',
      resume: vi.fn(),
      createOscillator: vi.fn(() => osc),
      createGain: vi.fn(() => gain),
      destination: {},
    }
    vi.stubGlobal(
      'AudioContext',
      vi.fn(function () {
        return ctx
      }),
    )

    playBeep(440, 320)

    expect(ctx.createOscillator).toHaveBeenCalledTimes(1)
    expect(osc.frequency.value).toBe(440)
    expect(osc.start).toHaveBeenCalledTimes(1)
    expect(osc.stop).toHaveBeenCalledTimes(1)
  })
})
