/**
 * Tiny WebAudio feedback tones for exercise answers — no audio assets needed.
 * The AudioContext is created lazily on first use (always after a user tap,
 * so autoplay policies are satisfied).
 */

let ctx: AudioContext | null = null

function ensureCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(
  c: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType,
  volume: number,
) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  // Short attack/release envelope to avoid clicks
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

/** Play a short "ding" (correct) or low "buzz" (wrong). Silently no-ops when audio is unavailable. */
export function playFeedback(correct: boolean) {
  const c = ensureCtx()
  if (!c) return
  const t = c.currentTime
  if (correct) {
    tone(c, 660, t, 0.09, 'sine', 0.08)
    tone(c, 880, t + 0.09, 0.14, 'sine', 0.08)
  } else {
    tone(c, 200, t, 0.18, 'square', 0.04)
  }
}
