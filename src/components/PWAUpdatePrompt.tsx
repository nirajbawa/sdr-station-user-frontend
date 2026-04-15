import { useRegisterSW } from 'virtual:pwa-register/react'
import { useState, useEffect } from 'react'

/**
 * Displays an unobtrusive banner at the bottom of the screen when a new
 * service worker version is available, giving the user a choice to update.
 */
export default function PWAUpdatePrompt() {
  const [isVisible, setIsVisible] = useState(false)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('[PWA] Service worker registered:', r)
    },
    onRegisterError(error) {
      console.error('[PWA] Service worker registration error:', error)
    },
  })

  useEffect(() => {
    if (needRefresh) {
      // Small delay so it doesn't pop up immediately on first load
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [needRefresh])

  const handleUpdate = () => {
    updateServiceWorker(true)
    setNeedRefresh(false)
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setNeedRefresh(false)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1.25rem',
        borderRadius: '0.75rem',
        backdropFilter: 'blur(12px)',
        background: 'rgba(23, 23, 23, 0.92)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        color: '#fff',
        fontSize: '0.875rem',
        fontFamily: 'Inter, system-ui, sans-serif',
        whiteSpace: 'nowrap',
        animation: 'slideUp 0.3s ease-out',
      }}
      role="alert"
      aria-live="polite"
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(1rem); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Signal icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#pwa-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="pwa-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <circle cx="12" cy="20" r="1" fill="url(#pwa-grad)" stroke="none" />
      </svg>

      <span style={{ color: '#d4d4d4' }}>
        New version available
      </span>

      <button
        id="pwa-update-btn"
        onClick={handleUpdate}
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          color: '#fff',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.375rem 0.875rem',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          fontWeight: 600,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Update
      </button>

      <button
        id="pwa-dismiss-btn"
        onClick={handleDismiss}
        style={{
          background: 'transparent',
          color: '#737373',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.375rem 0.5rem',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = '#737373')}
        aria-label="Dismiss update prompt"
      >
        ✕
      </button>
    </div>
  )
}
