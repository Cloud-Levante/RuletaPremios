import { useState, useEffect, useRef } from 'react'
import { Wheel } from 'react-custom-roulette'
import './App.css'

function ThemeToggle({ dark, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} aria-label="Cambiar tema">
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
  )
}

function Pointer({ idle }) {
  return (
    <div className={`custom-pointer ${idle ? 'pointer-idle' : ''}`}>
      <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pointer-body" x1="30" y1="0" x2="30" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--pointer-top)" />
            <stop offset="50%" stopColor="var(--pointer-mid)" />
            <stop offset="100%" stopColor="var(--pointer-bottom)" />
          </linearGradient>
          <linearGradient id="pointer-shine" x1="18" y1="0" x2="42" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="pointer-shadow" x="-10" y="-6" width="80" height="100">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.5" />
          </filter>
        </defs>
        {/* Main body */}
        <path
          d="M30 74 L6 16 A26 26 0 0 1 54 16 Z"
          fill="url(#pointer-body)"
          filter="url(#pointer-shadow)"
        />
        {/* Highlight / shine */}
        <path
          d="M30 74 L6 16 A26 26 0 0 1 54 16 Z"
          fill="url(#pointer-shine)"
        />
        {/* Border */}
        <path
          d="M30 74 L6 16 A26 26 0 0 1 54 16 Z"
          fill="none"
          stroke="var(--pointer-stroke)"
          strokeWidth="2"
        />
        {/* Center bolt */}
        <circle cx="30" cy="22" r="9" fill="var(--pointer-bolt-bg)" />
        <circle cx="30" cy="22" r="9" fill="none" stroke="var(--pointer-stroke)" strokeWidth="1.5" />
        <circle cx="30" cy="22" r="4" fill="var(--pointer-bolt-dot)" />
        {/* Bolt shine */}
        <ellipse cx="27" cy="19" rx="3" ry="2" fill="#ffffff" opacity="0.25" />
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
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetch('/prizes.json')
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
    setWinner(null)
    setShowModal(false)
  }

  function handleStopSpinning() {
    setMustSpin(false)
    setWinner(prizes[prizeNumber])
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
  }

  const theme = dark ? 'dark' : 'light'
  const idle = !mustSpin && !showModal

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
        <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
        <p className="error-text">Error: {error}</p>
        <button className="upload-button" onClick={() => fileInputRef.current?.click()}>
          Cargar prizes.json
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          hidden
        />
      </div>
    )
  }

  return (
    <div className={`app ${theme} ${mustSpin ? 'wheel-spinning' : 'wheel-idle'}`}>
      <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />

      <header className="header">
        <div className="header-logos">
          <span className="logo-text cl">Cloud<br />Levante</span>
          <span className="header-x">&times;</span>
          <span className="logo-text ionos">IONOS</span>
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
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={prizes}
              onStopSpinning={handleStopSpinning}
              outerBorderColor="var(--wheel-border)"
              outerBorderWidth={3}
              innerRadius={0}
              innerBorderColor="transparent"
              innerBorderWidth={0}
              radiusLineColor="var(--wheel-line)"
              radiusLineWidth={1}
              fontSize={12}
              fontFamily="Inter"
              fontWeight="600"
              perpendicularText={false}
              textDistance={68}
              spinDuration={0.8}
              disableInitialAnimation={true}
              pointerProps={{ style: { display: 'none' } }}
            />
            <div className="wheel-3d-overlay" />
            <div className="wheel-center-hub" />
          </div>
        </div>

        <button
          className={`spin-button ${mustSpin ? 'spinning' : ''}`}
          onClick={handleSpin}
          disabled={mustSpin}
        >
          {mustSpin ? 'Girando...' : '¡GIRAR!'}
        </button>

        <button className="upload-button" onClick={() => fileInputRef.current?.click()}>
          Cargar premios
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          hidden
        />
      </main>

      {showModal && winner && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {winner.fullName === null ? (
              <>
                <div className="modal-icon">🔄</div>
                <h2 className="modal-title">¡Inténtalo de nuevo!</h2>
                <p className="modal-subtitle">La ruleta te da otra oportunidad</p>
                <button className="modal-close" onClick={() => { closeModal(); handleSpin() }}>
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
                <button className="modal-close" onClick={closeModal}>
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
