'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plane, LayoutDashboard } from 'lucide-react'

import { C } from './constants'
import { AircraftData } from './types'
import { AircraftCarpetRows } from './components/AircraftCarpetRows'
import { AddAircraftModal } from './components/Modals'
import { ThemeToggle } from '@/components/ThemeToggle'

/* ───────────── Main Data Page ───────────── */
export default function DataPage() {
    const [aircraft, setAircraft] = useState<AircraftData[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'GA' | 'QG'>('GA')
    const [showAdd, setShowAdd] = useState(false)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('Semua')

    const fetchData = useCallback(() => {
        setLoading(true)
        fetch('/api/aircraft').then(r => r.json()).then(setAircraft).catch(console.error).finally(() => setLoading(false))
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const filtered = aircraft
        .filter(ac => ac.airline === tab)
        .filter(ac => typeFilter === 'Semua' || ac.acTypeGroup.includes(typeFilter))
        .filter(ac => !search || ac.registration.toLowerCase().includes(search.toLowerCase()) || ac.acType.toLowerCase().includes(search.toLowerCase()))

    const gaCount = aircraft.filter(a => a.airline === 'GA').length
    const qgCount = aircraft.filter(a => a.airline === 'QG').length

    return (
        <div style={{ minHeight: '100vh', background: C.bg }}>
            {/* Header */}
            <header style={{
                background: C.surface, borderBottom: `1px solid ${C.border}`,
                position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10, background: C.blue,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
                        }}>
                            <Plane size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>LDND Carpet Monitor</h1>
                            <p style={{ fontSize: 12, color: C.muted }}>Data Management</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <ThemeToggle />
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.blue, textDecoration: 'none', background: C.blueLight, border: `1px solid ${C.blueBorder}` }}>
                            <LayoutDashboard size={16} strokeWidth={2.5} />
                            Ke Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
                {/* Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 6 }}>
                        {([
                            { key: 'GA' as const, label: 'Garuda Indonesia', count: gaCount, color: C.gaColor, light: C.gaLight },
                            { key: 'QG' as const, label: 'Citilink', count: qgCount, color: C.qgColor, light: C.qgLight },
                        ]).map(a => (
                            <button key={a.key} onClick={() => setTab(a.key)} style={{
                                padding: '10px 20px', borderRadius: 12,
                                border: tab === a.key ? `2px solid ${a.color}` : `1px solid ${C.border}`,
                                background: tab === a.key ? a.light : C.surface,
                                fontSize: 14, fontWeight: 700, cursor: 'pointer', color: tab === a.key ? a.color : C.muted,
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                {a.label}
                                <span style={{
                                    background: tab === a.key ? a.color : C.border, color: tab === a.key ? '#fff' : C.muted,
                                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                                }}>{a.count}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Type filter chips */}
                        <div style={{ display: 'flex', gap: 4 }}>
                            {['Semua', ...Array.from(new Set(aircraft.filter(a => a.airline === tab).map(a => a.acTypeGroup)))].map(t => (
                                <button key={t} onClick={() => setTypeFilter(t)} style={{
                                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                    border: typeFilter === t ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                                    background: typeFilter === t ? C.blueLight : C.surface,
                                    color: typeFilter === t ? C.blue : C.muted,
                                }}>{t === 'Semua' ? 'Semua' : t}</button>
                            ))}
                        </div>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari registrasi..."
                            style={{ padding: '9px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, width: 200, outline: 'none' }} />
                        <button onClick={() => setShowAdd(true)} style={{
                            padding: '10px 20px', borderRadius: 10, border: 'none',
                            background: C.blue, color: '#fff', fontSize: 13, fontWeight: 700,
                            cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
                        }}>+ Tambah Pesawat</button>
                    </div>
                </div>

                {/* Aircraft Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{ width: 36, height: 36, border: `3px solid ${C.blue}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <p style={{ fontSize: 14, color: C.muted }}>Memuat data...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: C.muted }}><Plane size={48} strokeWidth={1} /></div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{search ? 'Tidak ditemukan' : `Belum ada pesawat ${tab === 'GA' ? 'Garuda' : 'Citilink'}`}</p>
                        <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Klik &quot;Tambah Pesawat&quot; untuk menambahkan</p>
                    </div>
                ) : (
                    <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th style={{ background: C.borderLight, padding: '14px 16px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}`, width: '12%' }}>Pesawat</th>
                                    <th style={{ background: C.borderLight, padding: '14px 16px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}`, width: '10%' }}>Tipe Carpet</th>
                                    <th style={{ background: C.borderLight, padding: '14px 16px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}`, width: '10%' }}>Status</th>
                                    <th style={{ background: C.borderLight, padding: '14px 16px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}`, width: '12%' }}>Last Done</th>
                                    <th style={{ background: C.borderLight, padding: '14px 16px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}`, width: '12%' }}>Next Due</th>
                                    <th style={{ background: C.borderLight, padding: '14px 16px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}`, width: '10%' }}>Vendor</th>
                                    <th style={{ background: C.borderLight, padding: '14px 16px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}`, width: '10%' }}>Coatroom</th>
                                    <th style={{ background: C.borderLight, padding: '14px 16px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}`, width: '11%' }}>Remark</th>
                                    <th style={{ background: C.borderLight, padding: '14px 16px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}`, width: '8%' }}>Riwayat</th>
                                    <th style={{ background: C.borderLight, padding: '14px 16px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}`, width: '5%', textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(ac => <AircraftCarpetRows key={ac.id} ac={ac} onRefresh={fetchData} />)}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {showAdd && <AddAircraftModal airline={tab} onClose={() => setShowAdd(false)} onSaved={fetchData} />}
        </div>
    )
}
