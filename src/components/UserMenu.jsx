import { useState, useRef, useEffect } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { useAuth } from '../hooks/useAuth'

export default function UserMenu({ onOpenAuth }) {
  const { user, userProfile, isAdmin } = useAuthContext()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!user) {
    return (
      <button className="btn-seal-ghost btn-sm" onClick={onOpenAuth}>
        Đăng nhập
      </button>
    )
  }

  const avatar = userProfile?.avatar || user.photoURL
  const name = userProfile?.displayName || user.displayName || user.email?.split('@')[0]
  const initial = (name || 'U').charAt(0).toUpperCase()

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="user-menu-trigger" onClick={() => setOpen(!open)}>
        {avatar ? (
          <img src={avatar} alt={name} className="user-avatar" />
        ) : (
          <span className="user-avatar user-avatar-initial">{initial}</span>
        )}
      </button>
      {open && (
        <div className="user-menu-dropdown card-ancient">
          <div className="user-menu-header">
            <strong>{name}</strong>
            <span className="user-menu-email">{user.email}</span>
            {isAdmin && <span className="user-menu-badge">Admin</span>}
          </div>
          <hr />
          {isAdmin && (
            <a href="/admin" className="user-menu-item" onClick={() => setOpen(false)}>
              ⚙ Quản trị
            </a>
          )}
          <button
            className="user-menu-item user-menu-logout"
            onClick={() => { logout(); setOpen(false) }}
          >
            ↩ Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
