import { useRef, useCallback, useEffect, useState } from 'react'

const SOUND_FILES = {
  whoosh: '/sounds/whoosh.mp3',
  spinTick: '/sounds/spin-tick.mp3',
  win: '/sounds/win.mp3',
  lose: '/sounds/lose.mp3',
  retry: '/sounds/retry.mp3',
}

let audioCtx = null
let gainNode = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    gainNode = audioCtx.createGain()
    gainNode.connect(audioCtx.destination)
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return { ctx: audioCtx, gain: gainNode }
}

export default function useSounds() {
  const [muted, setMuted] = useState(false)
  const audioRefs = useRef({})
  const sourceRefs = useRef({})
  const tickLoopRef = useRef(null)
  const tickStartTimeRef = useRef(0)

  // Preload all sounds and connect to gain node
  useEffect(() => {
    const { ctx, gain } = getAudioContext()
    for (const [key, src] of Object.entries(SOUND_FILES)) {
      const audio = new Audio(src)
      audio.preload = 'auto'
      audioRefs.current[key] = audio
      // Connect to AudioContext via MediaElementSource
      try {
        const source = ctx.createMediaElementSource(audio)
        source.connect(gain)
        sourceRefs.current[key] = source
      } catch {
        // Already connected or not supported
      }
    }
  }, [])

  // Mute/unmute via gain node — affects ALL audio instantly
  useEffect(() => {
    if (gainNode) {
      gainNode.gain.value = muted ? 0 : 1
    }
  }, [muted])

  const toggleMute = useCallback(() => setMuted(m => !m), [])

  const play = useCallback((key) => {
    getAudioContext() // ensure resumed
    const audio = audioRefs.current[key]
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [])

  const startSpinTick = useCallback((totalDurationMs) => {
    getAudioContext()
    const audio = audioRefs.current.spinTick
    if (!audio) return

    const totalDuration = totalDurationMs || 10000
    tickStartTimeRef.current = Date.now()

    // Phases matching react-custom-roulette animation:
    // Acceleration (first ~20%): speed up
    // Constant (20%-55%): steady fast spin
    // Deceleration (55%-90%): slow down gradually
    // Ending (last 10%): play the tail of the audio file for natural stop
    const accelEnd = totalDuration * 0.25
    const constantEnd = totalDuration * 0.40
    const decelEnd = totalDuration * 0.92

    let endingPlayed = false
    const LOOP_POINT = 0.9 // loop the first 0.9 seconds

    const tick = () => {
      const elapsed = Date.now() - tickStartTimeRef.current

      // Last phase: play the ending of the audio (natural deceleration)
      if (elapsed >= decelEnd && !endingPlayed) {
        endingPlayed = true
        audio.playbackRate = 0.7
        const dur = audio.duration || 4
        audio.currentTime = Math.max(0, dur - 1.5)
        audio.loop = false
        audio.play().catch(() => {})
        // Let it finish naturally, no more rAF
        return
      }

      if (elapsed >= totalDuration) {
        audio.pause()
        return
      }

      // Calculate playback rate based on phase
      let rate
      if (elapsed < accelEnd) {
        // Accelerating: 0.8 → 1.5
        const p = elapsed / accelEnd
        rate = 0.8 + p * 0.7
      } else if (elapsed < constantEnd) {
        // Constant fast
        rate = 1.5
      } else {
        // Decelerating: 1.5 → 0.5
        const p = (elapsed - constantEnd) / (decelEnd - constantEnd)
        rate = 1.5 - p * 1.0
      }

      audio.playbackRate = Math.max(0.3, Math.min(2.0, rate))

      // Loop: when past the loop point, restart from beginning
      if (audio.currentTime >= LOOP_POINT || audio.paused) {
        audio.currentTime = 0
        audio.play().catch(() => {})
      }

      tickLoopRef.current = requestAnimationFrame(tick)
    }

    // Start playing
    audio.currentTime = 0
    audio.volume = 0.8
    audio.playbackRate = 0.8
    audio.loop = false
    audio.play().catch(() => {})
    tickLoopRef.current = requestAnimationFrame(tick)
  }, [])

  const stopSpinTick = useCallback(() => {
    if (tickLoopRef.current) {
      cancelAnimationFrame(tickLoopRef.current)
      tickLoopRef.current = null
    }
    const audio = audioRefs.current.spinTick
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }, [])

  useEffect(() => {
    return () => {
      if (tickLoopRef.current) cancelAnimationFrame(tickLoopRef.current)
    }
  }, [])

  return { play, startSpinTick, stopSpinTick, muted, toggleMute }
}
