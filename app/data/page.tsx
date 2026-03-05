'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

/* ── Types ── */
interface ReplacementHistory {
    id: string; doneNumber: number; doneDate: string; isPremature: boolean
}
interface CarpetItemData {
    id: string; carpetType: string; intervalMonths: number
    lastDone: string | null; nextDue: string | null; remark: string | null
    vendor: string | null; coatroom: string | null
    replacementHistory: ReplacementHistory[]
}
interface AircraftData {
    id: string; acType: string; acTypeGroup: string
    registration: string; airline: string; carpetItems: CarpetItemData[]
}

/* ── Colors ── */
const C = {
    bg: '#f1f5f9', surface: '#ffffff', border: '#e2e8f0', borderLight: '#f1f5f9',
    text: '#0f172a', muted: '#64748b', light: '#94a3b8',
    blue: '#4f46e5', blueLight: '#ede9fe', blueBorder: '#c4b5fd',
    danger: '#dc2626', dangerLight: '#fef2f2', dangerBorder: '#fca5a5',
    warning: '#b45309', warningLight: '#fffbeb',
    green: '#059669', greenLight: '#ecfdf5', greenBorder: '#86efac',
    gaColor: '#0369a1', gaLight: '#e0f2fe',
    qgColor: '#15803d', qgLight: '#f0fdf4',
    orange: '#ea580c', orangeLight: '#fff7ed',
}

const AC_TYPES: Record<string, string[]> = {
    GA: ['B737-800', 'A330-200', 'A330-300', 'A330-900', 'B777-300'],
    QG: ['A320', 'ATR'],
}

function getGroup(acType: string): string {
    if (acType.startsWith('B737')) return 'B737'
    if (acType.startsWith('A330')) return 'A330'
    if (acType.startsWith('A320')) return 'A320'
    if (acType.startsWith('B777')) return 'B777'
    if (acType.startsWith('ATR')) return 'ATR'
    return acType
}

function fmtDate(d: string | null) {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysUntil(d: string | null): number | null {
    if (!d) return null
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

/* ───────────── Add Aircraft Modal ───────────── */
function AddAircraftModal({ airline, onClose, onSaved }: {
    airline: string; onClose: () => void; onSaved: () => void
}) {
    const [acType, setAcType] = useState(AC_TYPES[airline]?.[0] ?? '')
    const [reg, setReg] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!reg.trim()) { setError('Registrasi harus diisi'); return }
        setSaving(true); setError('')
        try {
            const res = await fetch('/api/aircraft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ acType, acTypeGroup: getGroup(acType), registration: reg.trim(), airline }),
            })
            if (res.status === 409) { setError('Registrasi sudah ada'); setSaving(false); return }
            if (!res.ok) throw new Error()
            onSaved(); onClose()
        } catch { setError('Gagal menyimpan'); setSaving(false) }
    }

    return (
        <Overlay onClose={onClose}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>
                ✈️ Tambah Pesawat {airline === 'GA' ? 'Garuda' : 'Citilink'}
            </h3>
            <form onSubmit={handleSubmit}>
                <Field label="Tipe Pesawat">
                    <select value={acType} onChange={e => setAcType(e.target.value)} style={inputStyle}>
                        {(AC_TYPES[airline] ?? []).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </Field>
                <Field label="Registrasi">
                    <input value={reg} onChange={e => setReg(e.target.value.toUpperCase())} placeholder="Contoh: PK-GDC"
                        style={{ ...inputStyle, fontFamily: 'monospace', fontWeight: 700 }} />
                </Field>
                {error && <p style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>}
                <ModalActions onClose={onClose} saving={saving} label="Simpan" />
            </form>
        </Overlay>
    )
}

/* ───────────── Add Done Modal ───────────── */
function AddDoneModal({ carpetItem, registration, onClose, onSaved }: {
    carpetItem: CarpetItemData; registration: string; onClose: () => void; onSaved: () => void
}) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const doneCount = carpetItem.replacementHistory.length

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!date) { setError('Tanggal harus diisi'); return }
        setSaving(true); setError('')
        try {
            const res = await fetch(`/api/carpet-items/${carpetItem.id}/done`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doneDate: date }),
            })
            if (!res.ok) throw new Error()
            onSaved(); onClose()
        } catch { setError('Gagal menyimpan'); setSaving(false) }
    }

    const isPremature = carpetItem.nextDue && new Date(date) < new Date(carpetItem.nextDue)

    return (
        <Overlay onClose={onClose}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                📝 Catat Penggantian
            </h3>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
                <strong>{registration}</strong> — {carpetItem.carpetType} Carpet → Done-{doneCount + 1}
            </p>
            <form onSubmit={handleSubmit}>
                <Field label="Tanggal Penggantian">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
                </Field>
                {isPremature && (
                    <div style={{ background: C.warningLight, border: '1px solid #fcd34d', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: C.warning }}>
                        ⚠️ Sebelum Next Due ({fmtDate(carpetItem.nextDue)}) — ditandai <strong>prematur</strong>
                    </div>
                )}
                {error && <p style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>}
                <ModalActions onClose={onClose} saving={saving} label="Catat Done" color={C.green} />
            </form>
        </Overlay>
    )
}

/* ───────────── Edit Details Modal ───────────── */
function EditDetailsModal({ carpetItem, registration, onClose, onSaved }: {
    carpetItem: CarpetItemData; registration: string; onClose: () => void; onSaved: () => void
}) {
    const [remark, setRemark] = useState(carpetItem.remark ?? '')
    const [coatroom, setCoatroom] = useState(carpetItem.coatroom ?? '')
    const [vendor, setVendor] = useState(carpetItem.vendor ?? '')
    const [saving, setSaving] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        try {
            await fetch(`/api/carpet-items/${carpetItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    remark: remark || null,
                    coatroom: coatroom || null,
                    vendor: vendor || null
                }),
            })
            onSaved(); onClose()
        } catch { setSaving(false) }
    }

    return (
        <Overlay onClose={onClose}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                ✏️ Edit Detail
            </h3>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
                <strong>{registration}</strong> — {carpetItem.carpetType} Carpet
            </p>
            <form onSubmit={handleSubmit}>
                <Field label="Remark">
                    <input value={remark} onChange={e => setRemark(e.target.value)} style={inputStyle} placeholder="Kosong" />
                </Field>
                <Field label="Coatroom">
                    <input value={coatroom} onChange={e => setCoatroom(e.target.value)} style={inputStyle} placeholder="Kosong" />
                </Field>
                <Field label="Vendor">
                    <input value={vendor} onChange={e => setVendor(e.target.value)} style={inputStyle} placeholder="Contoh: Sanhua / Anker" />
                </Field>
                <ModalActions onClose={onClose} saving={saving} label="Simpan" />
            </form>
        </Overlay>
    )
}

/* ───────────── Carpet Section (redesigned with visible Done history) ───────────── */
function CarpetSection({ item, registration, onRefresh }: {
    item: CarpetItemData; registration: string; onRefresh: () => void
}) {
    const [showDoneModal, setShowDoneModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const isAisle = item.carpetType === 'Aisle'
    const days = daysUntil(item.nextDue)
    const overdue = days !== null && days <= 0
    const nearDue = days !== null && days > 0 && days <= 30

    let statusBg = C.greenLight, statusColor = C.green, statusText = 'Aman'
    if (overdue) { statusBg = C.dangerLight; statusColor = C.danger; statusText = `${Math.abs(days!)}h lewat` }
    else if (nearDue) { statusBg = C.warningLight; statusColor = C.warning; statusText = `${days}h lagi` }
    else if (days !== null) { statusText = `${days}h lagi` }

    return (
        <>
            <div style={{ background: C.bg, borderRadius: 12, padding: 16 }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: isAisle ? C.blue : C.green }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.carpetType} Carpet</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: statusBg, color: statusColor }}>{statusText}</span>
                    </div>
                    <button onClick={() => setShowDoneModal(true)} style={{
                        padding: '5px 14px', borderRadius: 8, border: 'none',
                        background: C.green, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>+ Tambah Done</button>
                </div>

                {/* Info row: Interval, Last Done, Next Due */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    {[
                        { label: 'Interval', value: `${item.intervalMonths} bulan`, bg: C.surface },
                        { label: 'Last Done', value: fmtDate(item.lastDone), bg: C.surface },
                        { label: 'Next Due', value: fmtDate(item.nextDue), bg: overdue ? C.dangerLight : nearDue ? C.warningLight : C.surface, color: overdue ? C.danger : nearDue ? C.warning : C.text },
                    ].map(info => (
                        <div key={info.label} style={{ flex: 1, background: info.bg, borderRadius: 8, padding: '8px 12px', border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: C.light, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{info.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: ('color' in info ? info.color : undefined) ?? C.text, marginTop: 2 }}>{info.value}</div>
                        </div>
                    ))}
                </div>

                {/* Remark, Coatroom, Vendor — non-editable display with edit button */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    {[
                        { label: 'Remark', value: item.remark },
                        { label: 'Coatroom', value: item.coatroom },
                        { label: 'Vendor', value: item.vendor },
                    ].map(info => (
                        <div key={info.label} style={{ flex: 1, background: C.surface, borderRadius: 8, padding: '8px 12px', border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: C.light, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{info.label}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: info.value ? C.text : C.light, minHeight: 18 }}>
                                {info.value || '—'}
                            </div>
                        </div>
                    ))}
                    <button onClick={() => setShowEditModal(true)} style={{
                        width: 32, background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, color: C.muted
                    }} title="Edit Detail">
                        ✏️
                    </button>
                </div>

                {/* ── Done History — always visible ── */}
                {item.replacementHistory.length > 0 && (
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.light, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                            Riwayat Penggantian
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6 }}>
                            {item.replacementHistory.map(h => (
                                <div key={h.id} style={{
                                    background: h.isPremature ? C.warningLight : C.surface,
                                    border: `1px solid ${h.isPremature ? '#fcd34d' : C.border}`,
                                    borderRadius: 8, padding: '6px 10px',
                                }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: h.isPremature ? C.warning : C.light }}>
                                        Done-{h.doneNumber} {h.isPremature ? '⚡' : ''}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: h.isPremature ? C.warning : C.text, marginTop: 1 }}>
                                        {fmtDate(h.doneDate)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {item.replacementHistory.length === 0 && (
                    <p style={{ fontSize: 12, color: C.light, fontStyle: 'italic' }}>Belum ada riwayat penggantian</p>
                )}
            </div>

            {showDoneModal && (
                <AddDoneModal carpetItem={item} registration={registration} onClose={() => setShowDoneModal(false)} onSaved={onRefresh} />
            )}
            {showEditModal && (
                <EditDetailsModal carpetItem={item} registration={registration} onClose={() => setShowEditModal(false)} onSaved={onRefresh} />
            )}
        </>
    )
}

/* ───────────── Aircraft Card ───────────── */
function AircraftCard({ ac, onRefresh }: { ac: AircraftData; onRefresh: () => void }) {
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        if (!confirm(`Hapus ${ac.registration}? Semua data carpet & riwayat akan ikut terhapus.`)) return
        setDeleting(true)
        try { await fetch(`/api/aircraft/${ac.id}`, { method: 'DELETE' }); onRefresh() }
        catch { setDeleting(false) }
    }

    // Count status
    const statuses = ac.carpetItems.map(ci => {
        const d = daysUntil(ci.nextDue)
        if (d !== null && d <= 0) return 'overdue'
        if (d !== null && d <= 30) return 'neardue'
        return 'ok'
    })
    const hasOverdue = statuses.includes('overdue')
    const hasNearDue = statuses.includes('neardue')

    let cardBorder = C.border
    if (hasOverdue) cardBorder = C.dangerBorder
    else if (hasNearDue) cardBorder = '#fcd34d'

    return (
        <div style={{
            background: C.surface, borderRadius: 16,
            border: `1px solid ${cardBorder}`,
            borderTop: hasOverdue ? `3px solid ${C.danger}` : hasNearDue ? `3px solid ${C.warning}` : `1px solid ${cardBorder}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden',
        }}>
            {/* Card header */}
            <div style={{
                padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>✈️</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: 'monospace' }}>{ac.registration}</span>
                    <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                        background: C.blueLight, color: C.blue,
                    }}>{ac.acType}</span>
                    {hasOverdue && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: C.dangerLight, color: C.danger }}>OVERDUE</span>}
                    {!hasOverdue && hasNearDue && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: C.warningLight, color: C.warning }}>NEAR DUE</span>}
                </div>
                <button onClick={handleDelete} disabled={deleting} style={{
                    padding: '5px 10px', borderRadius: 8, border: `1px solid ${C.dangerBorder}`,
                    background: C.dangerLight, color: C.danger, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', opacity: deleting ? 0.5 : 1,
                }}>🗑️</button>
            </div>

            {/* Carpet items */}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ac.carpetItems.map(ci => (
                    <CarpetSection key={ci.id} item={ci} registration={ac.registration} onRefresh={onRefresh} />
                ))}
                {ac.carpetItems.length === 0 && (
                    <p style={{ fontSize: 13, color: C.light, fontStyle: 'italic', textAlign: 'center', padding: 20 }}>Belum ada data carpet</p>
                )}
            </div>
        </div>
    )
}

/* ───────────── Shared UI Helpers ───────────── */
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: `1px solid ${C.border}`, fontSize: 14, color: C.text, outline: 'none',
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
            <div style={{
                position: 'relative', background: C.surface, borderRadius: 16, padding: 28, width: 420,
                border: `1px solid ${C.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }} onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 6 }}>{label}</label>
            {children}
        </div>
    )
}

function ModalActions({ onClose, saving, label, color }: { onClose: () => void; saving: boolean; label: string; color?: string }) {
    return (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{
                padding: '9px 18px', borderRadius: 10, border: `1px solid ${C.border}`,
                background: C.surface, fontSize: 13, fontWeight: 600, color: C.muted, cursor: 'pointer',
            }}>Batal</button>
            <button type="submit" disabled={saving} style={{
                padding: '9px 18px', borderRadius: 10, border: 'none',
                background: color ?? C.blue, color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            }}>{saving ? 'Menyimpan...' : label}</button>
        </div>
    )
}

/* ───────────── Main Data Page ───────────── */
export default function DataPage() {
    const [aircraft, setAircraft] = useState<AircraftData[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'GA' | 'QG'>('GA')
    const [showAdd, setShowAdd] = useState(false)
    const [search, setSearch] = useState('')

    const fetchData = useCallback(() => {
        setLoading(true)
        fetch('/api/aircraft').then(r => r.json()).then(setAircraft).catch(console.error).finally(() => setLoading(false))
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const filtered = aircraft
        .filter(ac => ac.airline === tab)
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
                            color: '#fff', fontSize: 18, fontWeight: 700, boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
                        }}>✈</div>
                        <div>
                            <h1 style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>LDND Carpet Monitor</h1>
                            <p style={{ fontSize: 12, color: C.muted }}>Data Management</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Link href="/" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.muted, textDecoration: 'none', border: `1px solid ${C.border}` }}>📊 Dashboard</Link>
                        <Link href="/data" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.blue, textDecoration: 'none', background: C.blueLight, border: `1px solid ${C.blueBorder}` }}>📋 Data</Link>
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

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari registrasi..."
                            style={{ padding: '9px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, width: 200, outline: 'none' }} />
                        <button onClick={() => setShowAdd(true)} style={{
                            padding: '10px 20px', borderRadius: 10, border: 'none',
                            background: C.blue, color: '#fff', fontSize: 13, fontWeight: 700,
                            cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
                        }}>+ Tambah Pesawat</button>
                    </div>
                </div>

                {/* Aircraft grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{ width: 36, height: 36, border: `3px solid ${C.blue}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <p style={{ fontSize: 14, color: C.muted }}>Memuat data...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>✈️</span>
                        <p style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{search ? 'Tidak ditemukan' : `Belum ada pesawat ${tab === 'GA' ? 'Garuda' : 'Citilink'}`}</p>
                        <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Klik &quot;Tambah Pesawat&quot; untuk menambahkan</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                        {filtered.map(ac => <AircraftCard key={ac.id} ac={ac} onRefresh={fetchData} />)}
                    </div>
                )}
            </main>

            {showAdd && <AddAircraftModal airline={tab} onClose={() => setShowAdd(false)} onSaved={fetchData} />}
        </div>
    )
}
