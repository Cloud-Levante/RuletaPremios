import { useState, useEffect, useRef } from 'react'

// ===== Crypto helper =====
async function sha256(text) {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ===== Auth config from env =====
const ENV_USER = import.meta.env.VITE_ADMIN_USER || ''
const ENV_HASH = import.meta.env.VITE_ADMIN_PASS_HASH || ''
const HAS_CREDENTIALS = ENV_USER.length > 0 && ENV_HASH.length > 0

// ===== Login / Register Modal =====
function AuthModal({ onSuccess, onClose }) {
  const isRegister = !HAS_CREDENTIALS
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [passConfirm, setPassConfirm] = useState('')
  const [error, setError] = useState('')
  const [generatedHash, setGeneratedHash] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (isRegister) {
      if (!user.trim() || !pass.trim()) {
        setError('Rellena usuario y contraseña')
        return
      }
      if (pass !== passConfirm) {
        setError('Las contraseñas no coinciden')
        return
      }
      const hash = await sha256(pass)
      setGeneratedHash({ user: user.trim(), hash })
      sessionStorage.setItem('admin_auth', 'true')
      sessionStorage.setItem('admin_user', user.trim())
      sessionStorage.setItem('admin_hash', hash)
    } else {
      if (user.trim() !== ENV_USER) {
        setError('Usuario incorrecto')
        return
      }
      const hash = await sha256(pass)
      if (hash !== ENV_HASH) {
        setError('Contraseña incorrecta')
        return
      }
      sessionStorage.setItem('admin_auth', 'true')
      onSuccess()
    }
  }

  if (generatedHash) {
    return (
      <div className="admin-overlay" onClick={onClose}>
        <div className="auth-modal" onClick={e => e.stopPropagation()}>
          <h2 className="auth-title">Credenciales creadas</h2>
          <p className="auth-subtitle">Añade estas lineas a tu archivo <code>.env</code> y reinicia:</p>
          <div className="auth-hash-box">
            <code>VITE_ADMIN_USER={generatedHash.user}</code>
            <code>VITE_ADMIN_PASS_HASH={generatedHash.hash}</code>
          </div>
          <p className="auth-note">Para esta sesion ya puedes acceder al panel.</p>
          <button className="auth-btn" onClick={onSuccess}>Entrar al panel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>&times;</button>
        <h2 className="auth-title">{isRegister ? 'Crear acceso admin' : 'Acceso admin'}</h2>
        <p className="auth-subtitle">
          {isRegister
            ? 'No hay credenciales configuradas. Crea las tuyas:'
            : 'Introduce tus credenciales'}
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="text"
            placeholder="Usuario"
            value={user}
            onChange={e => setUser(e.target.value)}
            autoFocus
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
          {isRegister && (
            <input
              className="auth-input"
              type="password"
              placeholder="Confirmar contraseña"
              value={passConfirm}
              onChange={e => setPassConfirm(e.target.value)}
            />
          )}
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-btn" type="submit">
            {isRegister ? 'Crear y entrar' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ===== Admin Panel (settings modal with sidebar) =====
const SECTIONS = [
  { id: 'prizes', label: 'Premios', icon: 'gift' },
  { id: 'wheel', label: 'Ruleta', icon: 'settings' },
  { id: 'display', label: 'Pantalla', icon: 'monitor' },
]

const ICONS = {
  gift: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  monitor: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
}

function SettingsPanel({ prizes, onClose, onLoadFile, dark, onToggleDark, onSignOut }) {
  const [section, setSection] = useState('prizes')
  const fileRef = useRef(null)

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={e => e.stopPropagation()}>
        {/* Sidebar */}
        <nav className="admin-sidebar">
          <div className="admin-sidebar-header">Ajustes</div>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`admin-nav-item ${section === s.id ? 'active' : ''}`}
              onClick={() => setSection(s.id)}
            >
              {ICONS[s.icon]}
              {s.label}
            </button>
          ))}
          <div className="admin-sidebar-spacer" />
          <button className="admin-signout" onClick={onSignOut}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </nav>

        {/* Content */}
        <div className="admin-content">
          <button className="admin-close" onClick={onClose}>&times;</button>

          {section === 'prizes' && (
            <div className="admin-section">
              <h3 className="admin-section-title">Premios</h3>
              <button className="admin-action-btn" onClick={() => { onLoadFile(); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Cargar archivo de premios (.json)
              </button>
              <h4 className="admin-section-subtitle">Probabilidades actuales</h4>
              <div className="admin-prizes-table">
                <div className="admin-table-header">
                  <span>Premio</span>
                  <span>Peso</span>
                  <span>Prob.</span>
                </div>
                {prizes.map((p, i) => {
                  const totalWeight = prizes.reduce((sum, pr) => sum + (pr.weight || 1), 0)
                  const weight = p.weight || 1
                  const prob = ((weight / totalWeight) * 100).toFixed(1)
                  return (
                    <div key={i} className="admin-table-row">
                      <span className="admin-prize-name">
                        <span className="admin-prize-dot" style={{ background: p.style.backgroundColor }} />
                        {p.option}
                      </span>
                      <span className="admin-prize-weight">{weight}</span>
                      <span className="admin-prize-prob">{prob}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {section === 'wheel' && (
            <div className="admin-section">
              <h3 className="admin-section-title">Ruleta</h3>
              <div className="admin-control-row">
                <span className="admin-control-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Velocidad del giro
                </span>
                <span className="admin-badge">proximamente</span>
              </div>
              <div className="admin-control-row">
                <span className="admin-control-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Numero de vueltas antes de frenar
                </span>
                <span className="admin-badge">proximamente</span>
              </div>
            </div>
          )}

          {section === 'display' && (
            <div className="admin-section">
              <h3 className="admin-section-title">Pantalla</h3>
              <div className="admin-control-row">
                <span className="admin-control-label">
                  {dark ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                  Apariencia
                </span>
                <button className="admin-action-btn" onClick={onToggleDark}>
                  {dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                </button>
              </div>
              <div className="admin-control-row">
                <span className="admin-control-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                  Pantalla completa
                </span>
                <button className="admin-action-btn" onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen()
                  } else {
                    document.documentElement.requestFullscreen()
                  }
                }}>
                  {document.fullscreenElement ? 'Salir de pantalla completa' : 'Activar pantalla completa'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ===== Main export: handles auth flow =====
export default function AdminPanel({ prizes, onClose, onLoadFile, dark, onToggleDark }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === 'true')

  // If already registered in this session (no env), validate session
  useEffect(() => {
    if (authed && !HAS_CREDENTIALS) {
      const sessionHash = sessionStorage.getItem('admin_hash')
      if (!sessionHash) setAuthed(false)
    }
  }, [authed])

  if (!authed) {
    return <AuthModal onSuccess={() => setAuthed(true)} onClose={onClose} />
  }

  function handleSignOut() {
    sessionStorage.removeItem('admin_auth')
    sessionStorage.removeItem('admin_user')
    sessionStorage.removeItem('admin_hash')
    setAuthed(false)
    onClose()
  }

  return (
    <SettingsPanel
      prizes={prizes}
      onClose={onClose}
      onLoadFile={onLoadFile}
      dark={dark}
      onToggleDark={onToggleDark}
      onSignOut={handleSignOut}
    />
  )
}
