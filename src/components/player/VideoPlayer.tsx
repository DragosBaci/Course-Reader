import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react'
import './VideoPlayer.css'

/* ─── Types ─── */

export interface VideoPlayerHandle {
    readonly video: HTMLVideoElement | null
}

interface Props {
    src?: string
    autoPlay?: boolean
    onEnded?: () => void
    onTimeUpdate?: (time: number) => void
    onLoadedMetadata?: (duration: number) => void
}

/* ─── Helpers ─── */

function fmt(s: number): string {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
}

/* ─── Component ─── */

export const VideoPlayer = forwardRef<VideoPlayerHandle, Props>(
    ({ src, autoPlay, onEnded, onTimeUpdate, onLoadedMetadata }, ref) => {
        const videoRef = useRef<HTMLVideoElement>(null)
        const wrapRef = useRef<HTMLDivElement>(null)
        const progressRef = useRef<HTMLDivElement>(null)
        const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

        const [playing, setPlaying] = useState(false)
        const [currentTime, setCurrentTime] = useState(0)
        const [duration, setDuration] = useState(0)
        const [volume, setVolume] = useState(1)
        const [muted, setMuted] = useState(false)
        const [showControls, setShowControls] = useState(true)
        const [isFullscreen, setIsFullscreen] = useState(false)
        const [buffered, setBuffered] = useState(0)
        const [showVolSlider, setShowVolSlider] = useState(false)
        const [speed, setSpeed] = useState(() => {
            const saved = localStorage.getItem('vp-speed')
            return saved ? parseFloat(saved) : 1
        })
        const [showSpeedMenu, setShowSpeedMenu] = useState(false)

        const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

        useImperativeHandle(ref, () => ({
            get video() {
                return videoRef.current
            },
        }))

        /* ── Auto-hide controls ── */
        const resetHideTimer = useCallback(() => {
            setShowControls(true)
            clearTimeout(hideTimer.current)
            hideTimer.current = setTimeout(() => {
                if (videoRef.current && !videoRef.current.paused) setShowControls(false)
            }, 3000)
        }, [])

        /* ── Play / Pause ── */
        const togglePlay = useCallback(() => {
            const v = videoRef.current
            if (!v) return
            if (v.paused) {
                v.play()
            } else {
                v.pause()
            }
        }, [])

        /* ── Seek ── */
        const handleSeek = useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                const v = videoRef.current
                const bar = progressRef.current
                if (!v || !bar) return
                const rect = bar.getBoundingClientRect()
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                v.currentTime = ratio * v.duration
            },
            [],
        )

        /* ── Volume ── */
        const handleVolume = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const val = parseFloat(e.target.value)
                setVolume(val)
                setMuted(val === 0)
                if (videoRef.current) {
                    videoRef.current.volume = val
                    videoRef.current.muted = val === 0
                }
            },
            [],
        )

        const toggleMute = useCallback(() => {
            const v = videoRef.current
            if (!v) return
            const next = !muted
            v.muted = next
            setMuted(next)
            if (!next && volume === 0) {
                v.volume = 0.5
                setVolume(0.5)
            }
        }, [muted, volume])

        /* ── Fullscreen ── */
        const toggleFullscreen = useCallback(() => {
            const el = wrapRef.current
            if (!el) return
            if (!document.fullscreenElement) {
                el.requestFullscreen()
            } else {
                document.exitFullscreen()
            }
        }, [])

        /* ── Skip ±10s ── */
        const skip = useCallback((sec: number) => {
            const v = videoRef.current
            if (!v) return
            v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + sec))
        }, [])

        /* ── Playback speed ── */
        const changeSpeed = useCallback((rate: number) => {
            const v = videoRef.current
            if (!v) return
            v.playbackRate = rate
            setSpeed(rate)
            setShowSpeedMenu(false)
            localStorage.setItem('vp-speed', String(rate))
        }, [])

        /* ── Video event listeners ── */
        useEffect(() => {
            const v = videoRef.current
            if (!v) return

            const onPlay = () => setPlaying(true)
            const onPause = () => { setPlaying(false); setShowControls(true) }
            const onTime = () => {
                setCurrentTime(v.currentTime)
                onTimeUpdate?.(v.currentTime)
            }
            const onMeta = () => {
                setDuration(v.duration)
                v.playbackRate = speed
                onLoadedMetadata?.(v.duration)
            }
            const onEnd = () => {
                setPlaying(false)
                setShowControls(true)
                onEnded?.()
            }
            const onProgress = () => {
                if (v.buffered.length > 0) {
                    setBuffered(v.buffered.end(v.buffered.length - 1))
                }
            }

            v.addEventListener('play', onPlay)
            v.addEventListener('pause', onPause)
            v.addEventListener('timeupdate', onTime)
            v.addEventListener('loadedmetadata', onMeta)
            v.addEventListener('ended', onEnd)
            v.addEventListener('progress', onProgress)

            return () => {
                v.removeEventListener('play', onPlay)
                v.removeEventListener('pause', onPause)
                v.removeEventListener('timeupdate', onTime)
                v.removeEventListener('loadedmetadata', onMeta)
                v.removeEventListener('ended', onEnd)
                v.removeEventListener('progress', onProgress)
            }
        }, [src, onEnded, onTimeUpdate, onLoadedMetadata])

        /* ── Fullscreen change ── */
        useEffect(() => {
            const onFs = () => setIsFullscreen(!!document.fullscreenElement)
            document.addEventListener('fullscreenchange', onFs)
            return () => document.removeEventListener('fullscreenchange', onFs)
        }, [])

        /* ── Keyboard shortcuts ── */
        useEffect(() => {
            const onKey = (e: KeyboardEvent) => {
                if (!wrapRef.current?.contains(document.activeElement) &&
                    document.activeElement !== document.body) return

                switch (e.key) {
                    case ' ':
                    case 'k':
                        e.preventDefault()
                        togglePlay()
                        break
                    case 'ArrowRight':
                        e.preventDefault()
                        skip(10)
                        break
                    case 'ArrowLeft':
                        e.preventDefault()
                        skip(-10)
                        break
                    case 'f':
                        e.preventDefault()
                        toggleFullscreen()
                        break
                    case 'm':
                        e.preventDefault()
                        toggleMute()
                        break
                }
                resetHideTimer()
            }
            window.addEventListener('keydown', onKey)
            return () => window.removeEventListener('keydown', onKey)
        }, [togglePlay, skip, toggleFullscreen, toggleMute, resetHideTimer])

        const pct = duration > 0 ? (currentTime / duration) * 100 : 0
        const bufPct = duration > 0 ? (buffered / duration) * 100 : 0

        return (
            <div
                ref={wrapRef}
                className={`vp ${showControls ? 'vp--show' : 'vp--hide'} ${isFullscreen ? 'vp--fs' : ''}`}
                onMouseMove={resetHideTimer}
                onMouseLeave={() => playing && setShowControls(false)}
            >
                {/* Video element */}
                <video
                    ref={videoRef}
                    className="vp__video"
                    src={src}
                    autoPlay={autoPlay}
                    playsInline
                    onClick={togglePlay}
                />

                {/* Big center play button (when paused) */}
                {!playing && (
                    <button className="vp__big-play" onClick={togglePlay} aria-label="Play">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </button>
                )}

                {/* Bottom gradient */}
                <div className="vp__gradient" />

                {/* Controls bar */}
                <div className="vp__controls">
                    {/* Progress bar */}
                    <div className="vp__progress" ref={progressRef} onClick={handleSeek}>
                        <div className="vp__progress-buf" style={{ width: `${bufPct}%` }} />
                        <div className="vp__progress-fill" style={{ width: `${pct}%` }} />
                        <div className="vp__progress-thumb" style={{ left: `${pct}%` }} />
                    </div>

                    <div className="vp__bottom-row">
                        {/* Left controls */}
                        <div className="vp__left">
                            <button className="vp__btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                                {playing ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            <button className="vp__btn" onClick={() => skip(-10)} aria-label="Rewind 10s">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                                    <text x="10" y="16" fontSize="6.5" fontWeight="700" textAnchor="middle" fill="currentColor">10</text>
                                </svg>
                            </button>

                            <button className="vp__btn" onClick={() => skip(10)} aria-label="Forward 10s">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                                    <text x="14" y="16" fontSize="6.5" fontWeight="700" textAnchor="middle" fill="currentColor">10</text>
                                </svg>
                            </button>

                            {/* Volume */}
                            <div
                                className="vp__vol-group"
                                onMouseEnter={() => setShowVolSlider(true)}
                                onMouseLeave={() => setShowVolSlider(false)}
                            >
                                <button className="vp__btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
                                    {muted || volume === 0 ? (
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                        </svg>
                                    ) : volume < 0.5 ? (
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                            <path d="M18.5 12A4.5 4.5 0 0 0 16 8.97v6.06A4.48 4.48 0 0 0 18.5 12zM5 9v6h4l5 5V4L9 9H5z" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.97v6.06A4.48 4.48 0 0 0 16.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                        </svg>
                                    )}
                                </button>
                                {showVolSlider && (
                                    <div className="vp__vol-slider-wrap">
                                        <input
                                            type="range"
                                            className="vp__vol-slider"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={muted ? 0 : volume}
                                            onChange={handleVolume}
                                        />
                                    </div>
                                )}
                            </div>

                            <span className="vp__time">
                                {fmt(currentTime)} / {fmt(duration)}
                            </span>
                        </div>

                        {/* Right controls */}
                        <div className="vp__right">
                            <div className="vp__speed-group">
                                <button
                                    className="vp__btn vp__speed-btn"
                                    onClick={() => setShowSpeedMenu((s) => !s)}
                                    aria-label="Playback speed"
                                >
                                    {speed}x
                                </button>
                                {showSpeedMenu && (
                                    <div className="vp__speed-menu">
                                        {SPEED_OPTIONS.map((s) => (
                                            <button
                                                key={s}
                                                className={`vp__speed-option ${s === speed ? 'vp__speed-option--active' : ''}`}
                                                onClick={() => changeSpeed(s)}
                                            >
                                                {s}x
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button className="vp__btn" onClick={toggleFullscreen} aria-label="Fullscreen">
                                {isFullscreen ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
)

VideoPlayer.displayName = 'VideoPlayer'
