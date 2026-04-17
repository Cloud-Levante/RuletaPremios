import { useState, useEffect, useRef } from 'react'
import { Wheel } from 'react-custom-roulette'
import './App.css'

function TopBar({ dark, onToggleDark, onLoadFile }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!settingsOpen) return
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [settingsOpen])

  return (
    <div className="top-bar">
      <button className="top-btn" onClick={onToggleDark} aria-label="Cambiar tema">
        {dark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
      <div className="settings-wrap" ref={menuRef}>
        <button className="top-btn" onClick={() => setSettingsOpen(o => !o)} aria-label="Ajustes">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        {settingsOpen && (
          <div className="settings-menu">
            <button className="settings-item" onClick={() => { onLoadFile(); setSettingsOpen(false) }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Cargar premios
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Pointer({ idle }) {
  return (
    <div className={`custom-pointer ${idle ? 'pointer-idle' : ''}`}>
      <svg width="52" height="90" viewBox="0 0 52 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pointer-body" x1="26" y1="0" x2="26" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--pointer-top)" />
            <stop offset="50%" stopColor="var(--pointer-mid)" />
            <stop offset="100%" stopColor="var(--pointer-bottom)" />
          </linearGradient>
          <linearGradient id="pointer-shine" x1="14" y1="0" x2="38" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="pointer-shadow" x="-10" y="-6" width="72" height="110">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.5" />
          </filter>
        </defs>
        <path
          d="M26 86 L5 18 A22 22 0 0 1 47 18 Z"
          fill="url(#pointer-body)"
          filter="url(#pointer-shadow)"
        />
        <path
          d="M26 86 L5 18 A22 22 0 0 1 47 18 Z"
          fill="url(#pointer-shine)"
        />
        <path
          d="M26 86 L5 18 A22 22 0 0 1 47 18 Z"
          fill="none"
          stroke="var(--pointer-stroke)"
          strokeWidth="2"
        />
        <circle cx="26" cy="24" r="9" fill="var(--pointer-bolt-bg)" />
        <circle cx="26" cy="24" r="9" fill="none" stroke="var(--pointer-stroke)" strokeWidth="1.5" />
        <circle cx="26" cy="24" r="4" fill="var(--pointer-bolt-dot)" />
        <ellipse cx="23" cy="21" rx="3" ry="2" fill="#ffffff" opacity="0.25" />
      </svg>
    </div>
  )
}


export default function App() {
  const [prizes, setPrizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [winner, setWinner] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [dark, setDark] = useState(true)
  const [showSpinBtn, setShowSpinBtn] = useState(true)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetch('/prizes/prizes.json')
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar prizes.json')
        return res.json()
      })
      .then(data => {
        setPrizes(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (!Array.isArray(data) || data.length === 0) {
          alert('El archivo debe contener un array de premios con al menos un elemento.')
          return
        }
        const valid = data.every(p => p.option && p.style?.backgroundColor && p.style?.textColor)
        if (!valid) {
          alert('Cada premio debe tener al menos: option, style.backgroundColor y style.textColor')
          return
        }
        setPrizes(data)
        setWinner(null)
        setShowModal(false)
        setError(null)
      } catch {
        alert('El archivo no contiene JSON válido.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleSpin() {
    if (mustSpin) return
    const randomPrize = Math.floor(Math.random() * prizes.length)
    setPrizeNumber(randomPrize)
    setMustSpin(true)
    setShowSpinBtn(false)
    setWinner(null)
    setShowModal(false)
  }

  function handleStopSpinning() {
    setMustSpin(false)
    setWinner(prizes[prizeNumber])
    setShowModal(true)
  }

  function closeModal(restoreBtn = false) {
    setShowModal(false)
    if (restoreBtn) setShowSpinBtn(true)
  }

  const theme = dark ? 'dark' : 'light'
  const idle = !mustSpin && !showModal
  // No JS offset — alignment is handled by CSS rotation on the wheel

  if (loading) {
    return (
      <div className={`app ${theme}`}>
        <p className="loading-text">Cargando premios...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`app ${theme}`}>
        <TopBar dark={dark} onToggleDark={() => setDark(d => !d)} onLoadFile={() => fileInputRef.current?.click()} />
        <p className="error-text">Error: {error}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          hidden
        />
        <button className="upload-button" onClick={() => fileInputRef.current?.click()}>
          Cargar prizes.json
        </button>
      </div>
    )
  }

  return (
    <div className={`app ${theme} ${mustSpin ? 'wheel-spinning' : 'wheel-idle'}`}>
      <TopBar dark={dark} onToggleDark={() => setDark(d => !d)} onLoadFile={() => fileInputRef.current?.click()} />

      <header className="header">
        <div className="header-logos">
          <img src="/images/cloudlevante-logo.jpg" alt="Cloud Levante" className="header-logo cl-logo" />
          <img src="/images/cross-logo-transparent.png" alt="×" className="header-x-logo" />
          <img src="/images/ionos-logo.jpg" alt="IONOS" className="header-logo ionos-logo" />
        </div>
        <h1 className="title">Ruleta de la Nube</h1>
        <p className="subtitle">Gira y descubre tu premio</p>
      </header>

      <main className="main">
        <div className="wheel-wrapper">
          <div className="wheel-leds">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="led" style={{ '--i': i, '--total': 24 }} />
            ))}
          </div>
          <Pointer idle={idle} />
          <div className="wheel-container">
            <div
              className="wheel-rotation-offset"
              style={{ '--num-prizes': prizes.length }}
            >
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={prizes}
                onStopSpinning={handleStopSpinning}
                outerBorderColor="#1a1a1f"
                outerBorderWidth={8}
                innerRadius={15}
                innerBorderColor="transparent"
                innerBorderWidth={0}
                radiusLineColor="rgba(0,0,0,0.5)"
                radiusLineWidth={2}
                fontSize={13}
                fontFamily="Inter"
                fontWeight="700"
                perpendicularText={false}
                textDistance={65}
                spinDuration={0.8}
                disableInitialAnimation={true}
                pointerProps={{ style: { display: 'none' } }}
              />
            </div>
            <div className="wheel-3d-overlay" />
            <div className="wheel-center-hub">
              <img src="/images/CL_IONOS-logo.png" alt="Cloud Levante × IONOS" className="hub-logo" />
            </div>
          </div>
          {showSpinBtn && (
            <button className="spin-overlay" onClick={handleSpin}>
              ¡GIRAR!
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          hidden
        />
      </main>

      {showModal && winner && (
        <div className="modal-overlay" onClick={() => closeModal(winner?.fullName !== null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {winner.fullName === null ? (
              <>
                <div className="modal-icon">🔄</div>
                <h2 className="modal-title">¡Inténtalo de nuevo!</h2>
                <p className="modal-subtitle">La ruleta te da otra oportunidad</p>
                <button className="modal-close" onClick={() => { closeModal(false); handleSpin() }}>
                  ¡Girar de nuevo!
                </button>
              </>
            ) : (
              <>
                <div className="modal-icon">🎉</div>
                <h2 className="modal-title">¡Enhorabuena!</h2>
                <p className="modal-subtitle">Tu premio es:</p>
                <div className="modal-prize">{winner.fullName}</div>
                <p className="modal-note">Pásate por nuestro stand para canjearlo</p>
                <button className="modal-close" onClick={() => closeModal(true)}>
                  ¡Genial!
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
