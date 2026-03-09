'use client'

import { useState } from 'react'
import { Plane, Package } from 'lucide-react'
import type { DashboardData } from '@/lib/types'
import { COLORS } from '../constants'

export default function RawmatSection({ rawmatQty, onUpdate }: {
    rawmatQty: DashboardData['rawmatQty']
    onUpdate: (airline: string, qty: number, unit: string) => void
}) {
    const [gaQty, setGaQty] = useState(String(rawmatQty.GA.qty))
    const [gaUnit, setGaUnit] = useState(rawmatQty.GA.unit)
    const [qgQty, setQgQty] = useState(String(rawmatQty.QG.qty))
    const [qgUnit, setQgUnit] = useState(rawmatQty.QG.unit)

    function handleSave(airline: 'GA' | 'QG') {
        const qty = parseFloat(airline === 'GA' ? gaQty : qgQty) || 0
        const unit = airline === 'GA' ? gaUnit : qgUnit
        onUpdate(airline, qty, unit)
    }

    const inputS: React.CSSProperties = {
        padding: '8px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`,
        fontSize: 14, fontWeight: 700, color: COLORS.text, outline: 'none', width: 80, textAlign: 'center',
    }
    const unitS: React.CSSProperties = {
        padding: '8px 10px', borderRadius: 8, border: `1px solid ${COLORS.border}`,
        fontSize: 13, color: COLORS.text, outline: 'none', width: 60,
    }
    const saveS: React.CSSProperties = {
        padding: '8px 14px', borderRadius: 8, border: 'none',
        background: COLORS.blue, color: '#fff', fontSize: 12, fontWeight: 700,
        cursor: 'pointer', boxShadow: '0 2px 6px rgba(79,70,229,0.2)',
    }

    return (
        <div style={{ background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.blue }}>
                    <Package size={20} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>QTY Rawmat</h3>
                    <p style={{ fontSize: 12, color: COLORS.muted }}>Input manual oleh planner</p>
                </div>
            </div>

            {/* GA */}
            <div style={{ background: COLORS.gaLight, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.gaColor, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plane size={14} /> Garuda Indonesia (GA)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input value={gaQty} onChange={e => setGaQty(e.target.value)} style={{ ...inputS, background: COLORS.surface }} placeholder="0" />
                    <input value={gaUnit} onChange={e => setGaUnit(e.target.value.toUpperCase())} style={{ ...unitS, background: COLORS.surface }} placeholder="YD" />
                    <button onClick={() => handleSave('GA')} style={saveS}>Simpan</button>
                </div>
            </div>

            {/* QG */}
            <div style={{ background: COLORS.qgLight, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.qgColor, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plane size={14} /> Citilink (QG)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input value={qgQty} onChange={e => setQgQty(e.target.value)} style={{ ...inputS, background: COLORS.surface }} placeholder="0" />
                    <input value={qgUnit} onChange={e => setQgUnit(e.target.value.toUpperCase())} style={{ ...unitS, background: COLORS.surface }} placeholder="YD" />
                    <button onClick={() => handleSave('QG')} style={saveS}>Simpan</button>
                </div>
            </div>
        </div>
    )
}
