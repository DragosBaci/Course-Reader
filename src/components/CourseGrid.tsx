import { courses as demoCourses } from '../data/courses'
import { useCourseManifest } from '../hooks/useCourseManifest'
import { useProgressVersion } from '../hooks/useProgressVersion'
import { getCourseProgressPercent } from '../lib/progressStorage'
import type { Course } from '../data/courses'
import { IconChevronDown } from './Icons'
import { CourseCard } from './CourseCard'
import './CourseGrid.css'

export function CourseGrid() {
  const { data, loading } = useCourseManifest()
  useProgressVersion()

  const local: Course[] = (data?.courses ?? []).map((c) => ({
    id: `local-${c.id}`,
    title: c.title,
    instructor: c.instructor,
    progress: getCourseProgressPercent(c),
    rating: c.rating,
    ratingCount: c.ratingCount,
    image: c.image,
    href: `/course/${encodeURIComponent(c.id)}`,
    isLocal: true,
  }))

  const demos: Course[] = demoCourses.map((c) => ({
    ...c,
    href: undefined,
    isLocal: false,
  }))

  const list = [...local, ...demos]

  return (
    <section className="ud-grid-section" aria-label="Your courses">
      <div className="ud-grid-head">
        <span className="ud-grid-count">
          {loading ? '…' : list.length} courses
        </span>
        <div className="ud-grid-sort">
          <label htmlFor="sort-courses" className="ud-visually-hidden">
            Sort courses
          </label>
          <button type="button" id="sort-courses" className="ud-sort-btn">
            Recently Accessed
            <IconChevronDown />
          </button>
        </div>
      </div>
      {data && data.courses.length === 0 && (
        <p className="ud-grid-hint">
          Add your own courses under{' '}
          <code>public/course-content/</code>, then run{' '}
          <code>npm run scan-courses</code> (or restart the dev server).
          See <code>public/course-content/README.txt</code> for the folder layout.
        </p>
      )}
      <div className="ud-course-grid">
        {list.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </section>
  )
}
