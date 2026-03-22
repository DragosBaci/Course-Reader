import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useCourseManifest } from '../hooks/useCourseManifest'
import { useProgressVersion } from '../hooks/useProgressVersion'
import {
  findAdjacentLesson,
  getLessonProgress,
  upsertLessonProgress,
} from '../lib/progressStorage'
import { formatClock, formatDurationSeconds } from '../lib/formatDuration'
import type { ManifestLesson } from '../types/manifest'
import { CourseContentSidebar } from '../components/player/CourseContentSidebar'
import { IconArrowNext, IconArrowPrev } from '../components/player/PlayerIcons'
import './CoursePlayerPage.css'

const COMPLETE_AT = 0.92
const SAVE_MS = 2000

export function CoursePlayerPage() {
  const progressSnap = useProgressVersion()
  const { courseId: rawId } = useParams()
  const courseId = rawId ? decodeURIComponent(rawId) : ''
  const [searchParams, setSearchParams] = useSearchParams()
  const { data, loading } = useCourseManifest()
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastSave = useRef(0)

  const [lessonDurations, setLessonDurations] = useState<
    Record<string, number>
  >({})
  const [playbackTime, setPlaybackTime] = useState(0)
  const [tab, setTab] = useState<
    'overview' | 'qa' | 'notes' | 'announcements' | 'reviews' | 'tools'
  >('overview')

  const course = useMemo(
    () => data?.courses.find((c) => c.id === courseId),
    [data, courseId],
  )

  const lessonById = useMemo(() => {
    const m = new Map<string, ManifestLesson>()
    if (!course) return m
    for (const ch of course.chapters) {
      for (const le of ch.lessons) m.set(le.id, le)
    }
    return m
  }, [course])

  const lessonParam = searchParams.get('lesson')

  const activeLessonId = useMemo(() => {
    if (!course) return null
    if (lessonParam && lessonById.has(lessonParam)) return lessonParam
    return course.chapters[0]?.lessons[0]?.id ?? null
  }, [course, lessonParam, lessonById])

  const currentLesson = activeLessonId
    ? lessonById.get(activeLessonId)
    : undefined

  useEffect(() => {
    if (!activeLessonId) return
    if (searchParams.get('lesson') === activeLessonId) return
    setSearchParams({ lesson: activeLessonId }, { replace: true })
  }, [activeLessonId, searchParams, setSearchParams])

  const selectLesson = useCallback(
    (id: string) => {
      setSearchParams({ lesson: id })
    },
    [setSearchParams],
  )

  useEffect(() => {
    const v = videoRef.current
    if (!v || !currentLesson) return

    lastSave.current = 0

    const onMeta = () => {
      const dur = v.duration
      if (Number.isFinite(dur) && dur > 0) {
        setLessonDurations((d) => ({ ...d, [currentLesson.id]: dur }))
        upsertLessonProgress(courseId, currentLesson.id, { duration: dur })
      }
      const p = getLessonProgress(courseId, currentLesson.id)
      const start = p?.lastTime ?? 0
      if (Number.isFinite(dur) && dur > 0 && start > 0 && start < dur * 0.98) {
        v.currentTime = start
      }
      setPlaybackTime(v.currentTime)
    }

    const onTime = () => {
      setPlaybackTime(v.currentTime)
      const now = performance.now()
      if (now - lastSave.current < SAVE_MS) return
      lastSave.current = now
      const t = v.currentTime
      const d = v.duration
      upsertLessonProgress(courseId, currentLesson.id, {
        lastTime: t,
        duration: Number.isFinite(d) ? d : undefined,
      })
      if (Number.isFinite(d) && d > 0 && t / d >= COMPLETE_AT) {
        upsertLessonProgress(courseId, currentLesson.id, {
          completed: true,
          lastTime: t,
          duration: d,
        })
      }
    }

    const onEnd = () => {
      const d = v.duration
      upsertLessonProgress(courseId, currentLesson.id, {
        completed: true,
        lastTime: d,
        duration: d,
      })
    }

    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnd)
    return () => {
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', onEnd)
    }
  }, [courseId, currentLesson])

  const goPrev = () => {
    if (!course || !activeLessonId) return
    const prev = findAdjacentLesson(course, activeLessonId, -1)
    if (prev) selectLesson(prev.id)
  }

  const goNext = () => {
    if (!course || !activeLessonId) return
    const next = findAdjacentLesson(course, activeLessonId, 1)
    if (next) selectLesson(next.id)
  }

  void progressSnap
  let totalDuration = 0
  if (course) {
    for (const ch of course.chapters) {
      for (const le of ch.lessons) {
        totalDuration +=
          lessonDurations[le.id] ??
          getLessonProgress(courseId, le.id)?.duration ??
          0
      }
    }
  }

  const displayDur =
    currentLesson &&
    (lessonDurations[currentLesson.id] ||
      getLessonProgress(courseId, currentLesson.id)?.duration ||
      0)

  if (loading) {
    return (
      <div className="cp-page cp-page--center">
        <p className="cp-muted">Loading course…</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="cp-page cp-page--center">
        <p className="cp-muted">Course not found.</p>
        <Link to="/" className="cp-back">
          Back to My learning
        </Link>
      </div>
    )
  }

  return (
    <div className="cp-page">
      <header className="cp-topbar">
        <Link to="/" className="cp-back">
          ← My learning
        </Link>
        <span className="cp-topbar__title">{course.title}</span>
      </header>

      <div className="cp-layout">
        <div className="cp-main">
          <div className="cp-video-wrap">
            <video
              ref={videoRef}
              className="cp-video"
              controls
              playsInline
              key={currentLesson?.id ?? 'none'}
              src={currentLesson?.src}
            />
            <button
              type="button"
              className="cp-video__nav cp-video__nav--prev"
              aria-label="Previous lesson"
              onClick={goPrev}
            >
              <IconArrowPrev />
            </button>
            <button
              type="button"
              className="cp-video__nav cp-video__nav--next"
              aria-label="Next lesson"
              onClick={goNext}
            >
              <IconArrowNext />
            </button>
          </div>

          <nav className="cp-tabs" aria-label="Course information">
            {(
              [
                ['overview', 'Overview'],
                ['qa', 'Q&A'],
                ['notes', 'Notes'],
                ['announcements', 'Announcements'],
                ['reviews', 'Reviews'],
                ['tools', 'Learning tools'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={
                  tab === id ? 'cp-tab cp-tab--active' : 'cp-tab'
                }
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="cp-tab-panel">
            {tab === 'overview' && (
              <div>
                <h2 className="cp-overview__title">{course.title}</h2>
                <p className="cp-overview__meta">
                  {course.rating > 0 && (
                    <>
                      <span className="cp-star">
                        {course.rating.toFixed(1)}
                      </span>
                      <span className="cp-muted"> rating · </span>
                    </>
                  )}
                  <span className="cp-muted">
                    {formatDurationSeconds(totalDuration)} total
                  </span>
                </p>
                <p className="cp-muted">
                  {currentLesson
                    ? `Now playing: ${currentLesson.title} · ${formatClock(playbackTime)} / ${formatClock(displayDur || playbackTime)}`
                    : 'Select a lesson from the sidebar.'}
                </p>
              </div>
            )}
            {tab !== 'overview' && (
              <p className="cp-muted">This tab is a placeholder.</p>
            )}
          </div>
        </div>

        <CourseContentSidebar
          course={course}
          activeLessonId={activeLessonId}
          onSelectLesson={selectLesson}
          lessonDurations={lessonDurations}
        />
      </div>
    </div>
  )
}
