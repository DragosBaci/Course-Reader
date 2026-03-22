import { IconChevronDown, IconSearch } from './Icons'
import './CourseToolbar.css'

export function CourseToolbar() {
  return (
    <div className="ud-toolbar">
      <div className="ud-toolbar__filters">
        <button type="button" className="ud-filter-btn">
          Categories
          <IconChevronDown />
        </button>
        <button type="button" className="ud-filter-btn">
          Progress
          <IconChevronDown />
        </button>
        <button type="button" className="ud-filter-btn">
          Instructor
          <IconChevronDown />
        </button>
      </div>
      <div className="ud-toolbar__search">
        <input
          type="search"
          className="ud-toolbar__input"
          placeholder="Search my courses"
          aria-label="Search my courses"
        />
        <button type="button" className="ud-toolbar__search-btn" aria-label="Search">
          <IconSearch />
        </button>
      </div>
    </div>
  )
}
