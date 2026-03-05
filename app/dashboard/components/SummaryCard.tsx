import { COLORS } from '../constants'

export default function SummaryCard({ label, value, icon, bg, numColor, sub }: {
    label: string; value: number; icon: React.ReactNode; bg: string; numColor: string; sub?: string
}) {
    return (
        <div style={{
            background: bg, borderRadius: 16, padding: '20px 24px',
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ color: numColor }}>{icon}</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{label}</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: numColor, lineHeight: 1.1 }}>{value}</div>
            {sub && <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{sub}</p>}
        </div>
    )
}
