import { Link } from 'react-router-dom'
import type { Course } from '../data/courses'
import { IconDotsVertical, IconStar } from './Icons'
import './CourseCard.css'

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const partial = rating - full >= 0.5
  return (
    <span className="ud-stars" aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <IconStar key={i} filled={i < full || (i === full && partial)} />
      ))}
    </span>
  )
}

export function CourseCard({ course }: { course: Course }) {
  const inner = (
    <>
      <div className="ud-course-card__thumb-wrap">
        <img
          className="ud-course-card__thumb"
          src={course.image}
          alt=""
          loading="lazy"
        />
        <button
          type="button"
          className="ud-course-card__menu"
          aria-label="Course options"
          onClick={(e) => e.preventDefault()}
        >
          <IconDotsVertical />
        </button>
      </div>
      <div className="ud-course-card__body">
        <h3 className="ud-course-card__title">{course.title}</h3>
        <p className="ud-course-card__instructor">{course.instructor}</p>
        <div
          className="ud-course-card__progress-track"
          role="progressbar"
          aria-valuenow={course.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Course progress"
        >
          <div
            className="ud-course-card__progress-fill"
            style={{ width: `${course.progress}%` }}
          />
        </div>
        <div className="ud-course-card__rating">
          {course.rating > 0 ? (
            <>
              <Stars rating={Math.min(5, course.rating)} />
              <span className="ud-course-card__rating-num">{course.rating}</span>
            </>
          ) : (
            <span className="ud-course-card__rating-num ud-course-card__local">
              Local
            </span>
          )}
          <span className="ud-course-card__rating-count">
            {course.ratingCount}
          </span>
        </div>
      </div>
    </>
  )

  return (
    <article
      className={
        course.href ? 'ud-course-card ud-course-card--link' : 'ud-course-card'
      }
    >
      {course.href ? (
        <Link to={course.href} className="ud-course-card__link">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </article>
  )
}
