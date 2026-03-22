import { useMemo, useState } from 'react'
import { useProgressVersion } from '../../hooks/useProgressVersion'
import type { ManifestChapter, ManifestCourse } from '../../types/manifest'
import {
  getLessonProgress,
  toggleLessonCompleted,
} from '../../lib/progressStorage'
import { formatDurationSeconds } from '../../lib/formatDuration'
import { IconChevronPlayer, IconPlaySmall } from './PlayerIcons'
import './CourseContentSidebar.css'

type Props = {
  course: ManifestCourse
  activeLessonId: string | null
  onSelectLesson: (lessonId: string) => void
  lessonDurations: Record<string, number>
}

function chapterStats(
  ch: ManifestChapter,
  courseId: string,
  lessonDurations: Record<string, number>,
) {
  let completed = 0
  let duration = 0
  for (const le of ch.lessons) {
    const p = getLessonProgress(courseId, le.id)
    if (p?.completed) completed += 1
    duration += lessonDurations[le.id] ?? p?.duration ?? 0
  }
  return { completed, total: ch.lessons.length, duration }
}

export function CourseContentSidebar({
  course,
  activeLessonId,
  onSelectLesson,
  lessonDurations,
}: Props) {
  useProgressVersion()
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const ch of course.chapters) init[ch.id] = true
    return init
  })

  const globalIndex = useMemo(() => {
    const map = new Map<string, number>()
    let n = 0
    for (const ch of course.chapters) {
      for (const le of ch.lessons) {
        n += 1
        map.set(le.id, n)
      }
    }
    return map
  }, [course])

  return (
    <aside className="cc-sidebar">
      <div className="cc-sidebar__tabs" role="tablist">
        <button type="button" className="cc-sidebar__tab cc-sidebar__tab--active">
          Course content
        </button>
        <button type="button" className="cc-sidebar__tab" disabled>
          AI Assistant
        </button>
      </div>
      <div className="cc-sidebar__scroll">
        {course.chapters.map((ch, chIdx) => {
          const stats = chapterStats(ch, course.id, lessonDurations)
          const isOpen = open[ch.id] !== false
          return (
            <div key={ch.id} className="cc-chapter">
              <button
                type="button"
                className="cc-chapter__head"
                onClick={() =>
                  setOpen((o) => ({ ...o, [ch.id]: !isOpen }))
                }
                aria-expanded={isOpen}
              >
                <div className="cc-chapter__head-text">
                  <span className="cc-chapter__title">
                    Section {chIdx + 1}: {ch.title}
                  </span>
                  <span className="cc-chapter__meta">
                    {stats.completed} / {stats.total} |{' '}
                    {formatDurationSeconds(stats.duration)}
                  </span>
                </div>
                <IconChevronPlayer
                  className={
                    isOpen
                      ? 'cc-chapter__chev cc-chapter__chev--open'
                      : 'cc-chapter__chev'
                  }
                />
              </button>
              {isOpen && (
                <ul className="cc-lessons" role="list">
                  {ch.lessons.map((le) => {
                    const p = getLessonProgress(course.id, le.id)
                    const done = Boolean(p?.completed)
                    const active = le.id === activeLessonId
                    const idx = globalIndex.get(le.id) ?? 0
                    const dur =
                      lessonDurations[le.id] ?? p?.duration ?? 0
                    return (
                      <li key={le.id}>
                        <div
                          className={
                            active ? 'cc-lesson cc-lesson--active' : 'cc-lesson'
                          }
                        >
                          <button
                            type="button"
                            className={
                              done
                                ? 'cc-check cc-check--done'
                                : 'cc-check cc-check--todo'
                            }
                            aria-label={
                              done ? 'Mark as not completed' : 'Mark as completed'
                            }
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleLessonCompleted(course.id, le.id)
                            }}
                          >
                            {done ? '✓' : ''}
                          </button>
                          <button
                            type="button"
                            className="cc-lesson__main"
                            onClick={() => onSelectLesson(le.id)}
                          >
                            <IconPlaySmall className="cc-lesson__icon" />
                            <span className="cc-lesson__body">
                              <span className="cc-lesson__title">
                                {idx}. {le.title}
                              </span>
                              <span className="cc-lesson__dur">
                                {dur > 0
                                  ? formatDurationSeconds(dur)
                                  : '—'}
                              </span>
                            </span>
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
