import type { ReactNode } from 'react'

export function StateCard(props: {
  icon?: ReactNode
  title: string
  subtitle?: string
  borderColor: string
  background: string
  titleColor: string
  subtitleColor?: string
  padding?: number
}) {
  const { icon, title, subtitle, borderColor, background, titleColor, subtitleColor, padding = 32 } = props

  return (
    <div style={{ background, borderRadius: 16, padding, textAlign: 'center', border: `1px solid ${borderColor}` }}>
      {icon ? <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div> : null}
      <p style={{ color: titleColor, fontWeight: 700 }}>{title}</p>
      {subtitle ? <p style={{ color: subtitleColor ?? titleColor, marginTop: 6, fontSize: 13, opacity: 0.9 }}>{subtitle}</p> : null}
    </div>
  )
}

