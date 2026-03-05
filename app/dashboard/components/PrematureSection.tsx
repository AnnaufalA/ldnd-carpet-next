import { Zap } from 'lucide-react'
import type { PrematureCounts } from '@/lib/types'
import { COLORS } from '../constants'

export default function PrematureSection({ prematureCounts }: { prematureCounts: PrematureCounts }) {
    const types = ['B737', 'A320', 'A330', 'B777', 'ATR'] as const
    const totalAisle = types.reduce((s, t) => s + prematureCounts.aisle[t], 0)
    const totalUnderseat = types.reduce((s, t) => s + prematureCounts.underseat[t], 0)

    return (
        <div style={{ background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                    <Zap size={20} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>Premature Replacement</h3>
                    <p style={{ fontSize: 12, color: COLORS.muted }}>Jumlah penggantian prematur per tipe</p>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                    <tr>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', borderBottom: `2px solid ${COLORS.border}`, letterSpacing: '0.05em' }}>Type</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', borderBottom: `2px solid ${COLORS.border}`, letterSpacing: '0.05em' }}>Aisle</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', borderBottom: `2px solid ${COLORS.border}`, letterSpacing: '0.05em' }}>Underseat</th>
                    </tr>
                </thead>
                <tbody>
                    {types.map(t => {
                        const a = prematureCounts.aisle[t]
                        const u = prematureCounts.underseat[t]
                        return (
                            <tr key={t} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                                <td style={{ padding: '10px 12px', fontWeight: 700, fontFamily: 'monospace', color: COLORS.text }}>{t}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: a > 0 ? '#ea580c' : COLORS.light }}>{a > 0 ? `${a} EA` : '—'}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: u > 0 ? '#ea580c' : COLORS.light }}>{u > 0 ? `${u} EA` : '—'}</td>
                            </tr>
                        )
                    })}
                    <tr style={{ background: '#f8fafc' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: COLORS.text }}>Total</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: totalAisle > 0 ? '#ea580c' : COLORS.light }}>{totalAisle > 0 ? `${totalAisle} EA` : '—'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: totalUnderseat > 0 ? '#ea580c' : COLORS.light }}>{totalUnderseat > 0 ? `${totalUnderseat} EA` : '—'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
