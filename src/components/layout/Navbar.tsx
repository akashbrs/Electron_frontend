import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { useCartStore } from "../../store/cartStore"
import { useAuthStore } from "../../store/authStore";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const { totalItemsCount: totalItems } = useCartStore()
  const { user, logout, isAuthenticated } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const dropRef = useRef<HTMLDivElement>(null)

  const isWhite = scrolled || hovered || location.pathname !== "/"

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  // close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setUserOpen(false)
    }
    document.addEventListener("mousedown", fn)
    return () => document.removeEventListener("mousedown", fn)
  }, [])

  // close on route change
  useEffect(() => { setUserOpen(false) }, [location.pathname])

  const handleLogout = () => {
    logout()
    setUserOpen(false)
    navigate("/")
  }

  const links = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
  ]

  const initial = user?.full_name?.charAt(0)?.toUpperCase() ?? ""

  return (
    <>
      <header
        className={`nb ${isWhite ? "nb--white" : "nb--clear"}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="nb__inner">

          <div className="nb__left">
            <Link to="/" className="nb__logo">
              <img src="/Navbar.png" alt="ELECTRON" className="nb__logo-img" />
            </Link>
          </div>

          <div className="nb__center">
            <label className="nb__search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" className="nb__search-icon">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search products, brands and more…"
                className="nb__search-input"
              />
            </label>
          </div>

          <div className="nb__right">
            <nav className="nb__nav">
              {links.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nb__link ${location.pathname === to ? "nb__link--active" : ""}`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* ── Person / Auth icon ── */}
            <div className="nb__user-wrap" ref={dropRef}>
              <button
                className={`nb__user-btn ${userOpen ? "nb__user-btn--open" : ""}`}
                onClick={() => setUserOpen(o => !o)}
                aria-label="Account"
              >
                {isAuthenticated
                  ? <span className="nb__avatar">{initial}</span>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                }
              </button>

              {/* ── Dropdown ── */}
              <div className={`nb__drop ${userOpen ? "nb__drop--open" : ""}`}>
                {isAuthenticated ? (
                  <>
                    <div className="nb__drop-info">
                      <div className="nb__drop-avatar">{initial}</div>
                      <div className="nb__drop-meta">
                        <div className="nb__drop-name">{user?.full_name}</div>
                        <div className="nb__drop-email">{user?.email}</div>
                      </div>
                    </div>
                    <div className="nb__drop-divider" />
                    <Link to="/orders" className="nb__drop-item" onClick={() => setUserOpen(false)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                      My Orders
                    </Link>
                    <button className="nb__drop-item nb__drop-item--red" onClick={handleLogout}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <p className="nb__drop-guest">Welcome</p>
                    <p className="nb__drop-sub">Sign in to your account</p>
                    <div className="nb__drop-divider" />
                    <Link to="/auth" className="nb__drop-signin" onClick={() => setUserOpen(false)}>
                      Sign In
                    </Link>
                    <p className="nb__drop-reg">
                      New here?{" "}
                      <Link to="/auth" className="nb__drop-reg-link" onClick={() => setUserOpen(false)}>
                        Create account
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>

            <Link to="/cart" className="nb__cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="nb__badge">{totalItems}</span>
              )}
            </Link>
          </div>

        </div>
        <div className="nb__underline" />
      </header>

      <style>{`
       @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.nb {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 66px;
  z-index: 1000;
  font-family: 'Outfit', sans-serif;
  transition: background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
  border-bottom: 1px solid transparent;
}
.nb--clear {
  background: transparent;
  border-bottom-color: transparent;
  box-shadow: none;
}
.nb--white {
  background: rgba(248, 250, 252, 0.97);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-bottom-color: #e4eaf2;
  box-shadow: 0 2px 20px rgba(15,17,23,0.08);
}
.nb__underline {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(200,160,48,0.55) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
}
.nb--white .nb__underline { opacity: 1; }

/* ── LAYOUT ── */
.nb__inner {
  height: 100%;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.nb__left { 
  display: flex; 
  align-items: center; 
  flex-shrink: 0;
}
.nb__center { 
  display: flex; 
  justify-content: center; 
  flex: 1;
}
.nb__right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  flex-shrink: 0;
}

/* ── LOGO ── */
.nb__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
  transition: opacity 0.3s;
}
.nb__logo:hover { opacity: 0.8; }
.nb__logo-img {
  height: 28px;
  width: auto;
  object-fit: contain;
}


/* ── SEARCH ── */
.nb__search {
  width: 100%;
  max-width: 480px;
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding: 0 14px;
  gap: 10px;
  height: 40px;
  cursor: text;
  transition: background 0.4s, border-color 0.4s, box-shadow 0.25s;
  background: rgba(255,255,255,0.15);
  border: 1.5px solid rgba(255,255,255,0.25);
}
.nb--white .nb__search {
  background: #ffffff;
  border-color: #e4eaf2;
}
.nb__search:focus-within {
  border-color: #c8a030 !important;
  box-shadow: 0 0 0 3px rgba(200,160,48,0.12);
}
.nb__search-icon {
  color: rgba(255,255,255,0.6);
  flex-shrink: 0;
  transition: color 0.4s;
}
.nb--white .nb__search-icon { color: #9298a8; }
.nb__search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  transition: color 0.4s;
  color: #ffffff;
}
.nb--white .nb__search-input { color: #1a1d26; }
.nb__search-input::placeholder {
  color: rgba(255,255,255,0.5);
  transition: color 0.4s;
}
.nb--white .nb__search-input::placeholder { color: #9298a8; }

/* ── NAV LINKS ── */
.nb__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nb__link {
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  padding: 7px 12px;
  border-radius: 8px;
  white-space: nowrap;
  transition: color 0.4s, background 0.2s;
  color: rgba(255,255,255,0.8);
}
.nb__link:hover {
  color: #ffffff;
  background: rgba(255,255,255,0.12);
}
.nb__link--active {
  color: #ffffff;
  font-weight: 600;
}
.nb--white .nb__link { color: #4a4f60; }
.nb--white .nb__link:hover {
  color: #1a1d26;
  background: rgba(15,17,23,0.05);
}
.nb--white .nb__link--active {
  color: #1a1d26;
  font-weight: 600;
  background: rgba(200,160,48,0.08);
}

/* ── USER BUTTON ── */
.nb__user-wrap {
  position: relative;
  margin: 0 4px;
}
.nb__user-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.10);
  border: 1.5px solid rgba(255,255,255,0.22);
  color: rgba(255,255,255,0.82);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(.22,1,.36,1);
  padding: 0;
  flex-shrink: 0;
}
.nb__user-btn:hover,
.nb__user-btn--open {
  background: rgba(200,160,48,0.15);
  border-color: rgba(200,160,48,0.55);
  color: #c8a030;
  transform: scale(1.06);
  box-shadow: 0 0 0 3px rgba(200,160,48,0.10);
}
.nb--white .nb__user-btn {
  background: #ffffff;
  border-color: #e4eaf2;
  color: #4a4f60;
}
.nb--white .nb__user-btn:hover,
.nb--white .nb__user-btn--open {
  border-color: #c8a030;
  color: #c8a030;
  background: #fffdf5;
  box-shadow: 0 2px 12px rgba(200,160,48,0.15);
}
/* avatar initial inside button */
.nb__avatar {
  width: 20px; height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c8a030, #a07820);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
}

/* ── DROPDOWN ── */
.nb__drop {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 220px;
  background: #ffffff;
  border: 1px solid #e8edf4;
  border-top: 2.5px solid #c8a030;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(15,17,23,0.13), 0 3px 12px rgba(15,17,23,0.07);
  padding: 12px 0 8px;
  opacity: 0;
  transform: translateY(7px) scale(0.97);
  pointer-events: none;
  transition: opacity 0.2s cubic-bezier(.22,1,.36,1),
              transform 0.2s cubic-bezier(.22,1,.36,1);
  z-index: 500;
}
.nb__drop--open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}
/* small caret arrow */
.nb__drop::before {
  content: '';
  position: absolute;
  top: -7px;
  right: 10px;
  width: 12px; height: 12px;
  background: #c8a030;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

/* guest state */
.nb__drop-guest {
  padding: 2px 16px 1px;
  font-size: 14px;
  font-weight: 700;
  color: #1a1d26;
  font-family: 'Outfit', sans-serif;
}
.nb__drop-sub {
  padding: 0 16px 10px;
  font-size: 11.5px;
  color: #9298a8;
  font-family: 'Outfit', sans-serif;
}
.nb__drop-signin {
  display: block;
  margin: 6px 12px 6px;
  padding: 9px 0;
  background: linear-gradient(135deg, #c8a030, #a07820);
  border-radius: 8px;
  text-align: center;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  text-decoration: none;
  letter-spacing: 0.05em;
  transition: opacity 0.2s, box-shadow 0.2s;
  box-shadow: 0 3px 10px rgba(200,160,48,0.28);
}
.nb__drop-signin:hover {
  opacity: 0.88;
  box-shadow: 0 5px 16px rgba(200,160,48,0.4);
}
.nb__drop-reg {
  text-align: center;
  font-size: 11px;
  color: #9298a8;
  padding: 3px 12px 2px;
  font-family: 'Outfit', sans-serif;
}
.nb__drop-reg-link {
  color: #a07820;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}
.nb__drop-reg-link:hover { color: #c8a030; }

/* logged-in state */
.nb__drop-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 14px 12px;
}
.nb__drop-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c8a030, #a07820);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'Outfit', sans-serif;
  box-shadow: 0 2px 8px rgba(200,160,48,0.28);
}
.nb__drop-meta { min-width: 0; }
.nb__drop-name {
  font-size: 13px;
  font-weight: 700;
  color: #1a1d26;
  font-family: 'Outfit', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 136px;
}
.nb__drop-email {
  font-size: 10.5px;
  color: #9298a8;
  font-family: 'Outfit', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 136px;
  margin-top: 1px;
}

/* divider */
.nb__drop-divider {
  height: 1px;
  background: #f0f3f7;
  margin: 0 0 4px;
}

/* menu rows */
.nb__drop-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 16px;
  font-size: 12.5px;
  font-weight: 500;
  color: #4a4f60;
  font-family: 'Outfit', sans-serif;
  text-decoration: none;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.nb__drop-item:hover {
  background: rgba(200,160,48,0.07);
  color: #1a1d26;
}
.nb__drop-item--red { color: #b83232; }
.nb__drop-item--red:hover {
  background: rgba(184,50,50,0.06);
  color: #b83232;
}

/* ── CART ── */
.nb__cart {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 9px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  position: relative;
  margin-left: 4px;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.4s;
  color: rgba(255,255,255,0.9);
  border: 1.5px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.1);
}
.nb__cart:hover {
  color: #ffffff;
  border-color: rgba(255,255,255,0.65);
  background: rgba(255,255,255,0.18);
}
.nb--white .nb__cart {
  color: #252833;
  border-color: #e4eaf2;
  background: #ffffff;
}
.nb--white .nb__cart:hover {
  border-color: #c8a030;
  color: #c8a030;
  box-shadow: 0 2px 12px rgba(200,160,48,0.18);
  background: #fffdf5;
}

/* ── BADGE ── */
.nb__badge {
  position: absolute;
  top: -7px;
  right: -7px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  padding: 0 4px;
  background: #c8a030;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  z-index: 10;
  animation: badgePop 0.3s cubic-bezier(.22,.68,0,1.4);
}
@keyframes badgePop {
  from { transform: scale(0); }
  to   { transform: scale(1); }
}
.nb--clear .nb__badge { border-color: transparent; }
.nb--white .nb__badge { border-color: #f8fafc; }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .nb__search { max-width: 260px; }
}
@media (max-width: 768px) {
  .nb__inner {
    padding: 0 16px;
    gap: 12px;
  }
  .nb__center { display: none; } /* On mobile, usually search is hidden or moved */
  .nb__nav { display: none; }
}
      `}</style>
    </>
  )
}