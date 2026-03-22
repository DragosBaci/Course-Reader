import type { ManifestCourse } from '../types/manifest'

const STORAGE_KEY = 'udemyclone-lesson-progress-v1'
const PROGRESS_EVENT = 'udemyclone-progress'

function notifyProgress() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PROGRESS_EVENT))
  }
}

export type LessonProgress = {
  completed: boolean
  lastTime: number
  duration: number
  updatedAt: number
}

type Store = Record<string, Record<string, LessonProgress>>

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Store
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function save(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  notifyProgress()
}

export function getLessonProgress(
  courseId: string,
  lessonId: string,
): LessonProgress | undefined {
  return load()[courseId]?.[lessonId]
}

export function upsertLessonProgress(
  courseId: string,
  lessonId: string,
  patch: Partial<LessonProgress>,
): LessonProgress {
  const store = load()
  const prev = store[courseId]?.[lessonId]
  const next: LessonProgress = {
    completed: patch.completed ?? prev?.completed ?? false,
    lastTime: patch.lastTime ?? prev?.lastTime ?? 0,
    duration: patch.duration ?? prev?.duration ?? 0,
    updatedAt: Date.now(),
  }
  if (!store[courseId]) store[courseId] = {}
  store[courseId][lessonId] = next
  save(store)
  return next
}

export function setLessonCompleted(
  courseId: string,
  lessonId: string,
  completed: boolean,
) {
  upsertLessonProgress(courseId, lessonId, { completed })
}

export function toggleLessonCompleted(courseId: string, lessonId: string) {
  const prev = getLessonProgress(courseId, lessonId)
  const next = !(prev?.completed ?? false)
  setLessonCompleted(courseId, lessonId, next)
  return next
}

export function countCourseLessons(course: ManifestCourse): number {
  return course.chapters.reduce((n, ch) => n + ch.lessons.length, 0)
}

export function getCourseProgressPercent(course: ManifestCourse): number {
  const store = load()
  const map = store[course.id] ?? {}
  const total = countCourseLessons(course)
  if (total === 0) return 0
  let completed = 0
  for (const ch of course.chapters) {
    for (const le of ch.lessons) {
      if (map[le.id]?.completed) completed += 1
    }
  }
  return Math.round((completed / total) * 100)
}

export function flattenLessons(course: ManifestCourse) {
  const list: { lesson: (typeof course.chapters)[0]['lessons'][0]; chapterIndex: number }[] =
    []
  course.chapters.forEach((ch, chapterIndex) => {
    ch.lessons.forEach((lesson) => list.push({ lesson, chapterIndex }))
  })
  return list
}

export function findAdjacentLesson(
  course: ManifestCourse,
  lessonId: string,
  direction: -1 | 1,
) {
  const flat = flattenLessons(course)
  const idx = flat.findIndex((x) => x.lesson.id === lessonId)
  if (idx < 0) return undefined
  return flat[idx + direction]?.lesson
}
