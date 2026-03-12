import React, { useState } from 'react'
import { Zap, ChevronDown, ChevronRight } from 'lucide-react'
import type { PrematureCounts, PrematureDetails } from '@/lib/types'
import { COLORS } from '../constants'

export default function PrematureSection({ prematureCounts, prematureDetails }: { prematureCounts: PrematureCounts, prematureDetails: PrematureDetails }) {
    const types = ['B737', 'A320', 'A330', 'B777', 'ATR'] as const
    const [expandedType, setExpandedType] = useState<string | null>(null)
    const totalAisle = types.reduce((s, t) => s + prematureCounts.aisle[t], 0)
    const totalUnderseat = types.reduce((s, t) => s + prematureCounts.underseat[t], 0)

    return (
        <div style={{ background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.orangeLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.orange }}>
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
                        const details = prematureDetails[t]
                        const isExpanded = expandedType === t
                        const hasData = a > 0 || u > 0

                        return (
                            <React.Fragment key={t}>
                                <tr 
                                  onClick={() => hasData && setExpandedType(isExpanded ? null : t)}
                                  style={{ 
                                      borderBottom: `1px solid ${COLORS.border}`, 
                                      cursor: hasData ? 'pointer' : 'default',
                                      background: isExpanded ? COLORS.borderLight : 'transparent'
                                  }}
                                >
                                    <td style={{ padding: '10px 12px', fontWeight: 700, fontFamily: 'monospace', color: COLORS.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {hasData ? (isExpanded ? <ChevronDown size={14} color={COLORS.muted}/> : <ChevronRight size={14} color={COLORS.muted}/>) : <span style={{width:14}}/>}
                                        {t}
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: a > 0 ? COLORS.orange : COLORS.light }}>{a > 0 ? `${a} EA` : '—'}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: u > 0 ? COLORS.orange : COLORS.light }}>{u > 0 ? `${u} EA` : '—'}</td>
                                </tr>
                                {isExpanded && (
                                    <tr style={{ background: '#fdfdfd', borderBottom: `1px solid ${COLORS.border}` }}>
                                        <td colSpan={3} style={{ padding: '12px 24px', fontSize: 12 }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                                {/* Aisle Details */}
                                                <div>
                                                    <div style={{ fontWeight: 600, color: COLORS.muted, marginBottom: 8, fontSize: 11, textTransform: 'uppercase' }}>Aisle ({a} EA)</div>
                                                    {details.aisle.length === 0 ? <span style={{color: COLORS.light}}>—</span> : (
                                                        <ul style={{ margin: 0, paddingLeft: 16, color: COLORS.text }}>
                                                            {details.aisle.map(d => (
                                                                <li key={d.registration} style={{ marginBottom: 4 }}>
                                                                    <strong>{d.registration}</strong>: {d.total} EA
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                                {/* Underseat Details */}
                                                <div>
                                                    <div style={{ fontWeight: 600, color: COLORS.muted, marginBottom: 8, fontSize: 11, textTransform: 'uppercase' }}>Underseat ({u} EA)</div>
                                                    {details.underseat.length === 0 ? <span style={{color: COLORS.light}}>—</span> : (
                                                        <ul style={{ margin: 0, paddingLeft: 16, color: COLORS.text }}>
                                                            {details.underseat.map(d => (
                                                                <li key={d.registration} style={{ marginBottom: 4 }}>
                                                                    <strong>{d.registration}</strong>: {d.total} EA
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        )
                    })}
                    <tr style={{ background: COLORS.borderLight }}>
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: COLORS.text }}>Total</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: totalAisle > 0 ? COLORS.orange : COLORS.light }}>{totalAisle > 0 ? `${totalAisle} EA` : '—'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: totalUnderseat > 0 ? COLORS.orange : COLORS.light }}>{totalUnderseat > 0 ? `${totalUnderseat} EA` : '—'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
