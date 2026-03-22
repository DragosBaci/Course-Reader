import { Link } from 'react-router-dom'
import { IconBell, IconCart, IconHeart, IconSearch } from './Icons'
import './Header.css'

export function Header() {
  return (
    <header className="ud-header">
      <div className="ud-header__inner">
        <div className="ud-header__left">
          <Link to="/" className="ud-logo" aria-label="Udemy home">
            Udemy
          </Link>
          <nav className="ud-header__nav" aria-label="Primary">
            <a href="#" className="ud-link">
              Explore
            </a>
            <a href="#" className="ud-link">
              Subscribe
            </a>
          </nav>
        </div>

        <div className="ud-header__search-wrap">
          <label className="ud-search" htmlFor="global-search">
            <span className="ud-search__icon" aria-hidden>
              <IconSearch />
            </span>
            <input
              id="global-search"
              type="search"
              className="ud-search__input"
              placeholder="Search for anything"
              autoComplete="off"
            />
          </label>
        </div>

        <div className="ud-header__right">
          <nav className="ud-header__links" aria-label="Account">
            <a href="#" className="ud-link ud-link--muted">
              Udemy Business
            </a>
            <a href="#" className="ud-link ud-link--muted">
              Teach on Udemy
            </a>
            <a href="#" className="ud-link ud-link--active">
              My learning
            </a>
          </nav>
          <div className="ud-header__icons">
            <button type="button" className="ud-icon-btn" aria-label="Wishlist">
              <IconHeart />
            </button>
            <button type="button" className="ud-icon-btn" aria-label="Cart">
              <IconCart />
            </button>
            <button type="button" className="ud-icon-btn" aria-label="Notifications">
              <IconBell />
            </button>
            <button
              type="button"
              className="ud-avatar"
              aria-label="User menu"
            >
              DB
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
