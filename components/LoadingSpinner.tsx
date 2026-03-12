'use client'

export function LoadingSpinner({ size = 36, color, label = 'Memuat data...' }: { size?: number; color: string; label?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: size,
          height: size,
          border: `3px solid ${color}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 14, opacity: 0.85 }}>{label}</p>
    </div>
  )
}

