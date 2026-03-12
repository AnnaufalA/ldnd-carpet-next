'use client'

import { Plane, Package } from 'lucide-react'
import type { DashboardData } from '@/lib/types'
import { COLORS } from '../constants'
import { AIRLINES } from '@/lib/constants'

export default function RawmatSection({ rawmatQty }: { rawmatQty: DashboardData['rawmatQty'] }) {
    return (
        <div style={{ background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.blue }}>
                    <Package size={20} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>QTY Rawmat</h3>
                    <p style={{ fontSize: 12, color: COLORS.muted }}>QTY Rawmat Tersedia</p>
                </div>
            </div>

            {/* GA */}
            <div style={{ background: COLORS.gaLight, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.gaColor, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plane size={16} /> {AIRLINES.GA.name} (GA)
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text }}>
                    {rawmatQty.GA.qty} <span style={{ fontSize: 14, color: COLORS.muted, fontWeight: 600 }}>{rawmatQty.GA.unit}</span>
                </div>
            </div>

            {/* QG */}
            <div style={{ background: COLORS.qgLight, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.qgColor, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plane size={16} /> {AIRLINES.QG.name} (QG)
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text }}>
                    {rawmatQty.QG.qty} <span style={{ fontSize: 14, color: COLORS.muted, fontWeight: 600 }}>{rawmatQty.QG.unit}</span>
                </div>
            </div>
        </div>
    )
}
