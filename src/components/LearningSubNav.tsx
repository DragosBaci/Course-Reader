import './LearningSubNav.css'

const tabs = [
  'All courses',
  'My Lists',
  'Wishlist',
  'Certifications',
  'Archived',
  'Learning tools',
] as const

export function LearningSubNav() {
  return (
    <div className="ud-subnav">
      <div className="ud-subnav__inner">
        <h1 className="ud-subnav__title">My learning</h1>
        <nav className="ud-subnav__tabs" aria-label="Learning sections">
          {tabs.map((label, i) => (
            <a
              key={label}
              href="#"
              className={
                i === 0 ? 'ud-tab ud-tab--active' : 'ud-tab'
              }
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
