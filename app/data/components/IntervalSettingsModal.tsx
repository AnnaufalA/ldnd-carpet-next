'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, RefreshCw } from 'lucide-react'
import { C, AC_TYPES } from '../constants'
import { Overlay, Field, inputStyle } from './Modals'

interface IntervalMaster {
    acTypeGroup: string
    carpetType: string
    interval: number
}

export function IntervalSettingsModal({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void }) {
    const [intervals, setIntervals] = useState<Record<string, Record<string, number>>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch('/api/intervals')
            .then(res => res.json())
            .then((data: IntervalMaster[]) => {
                const map: Record<string, Record<string, number>> = {}
                data.forEach(d => {
                    if (!map[d.acTypeGroup]) map[d.acTypeGroup] = {}
                    map[d.acTypeGroup][d.carpetType] = d.interval
                })
                setIntervals(map)
                setLoading(false)
            })
            .catch(console.error)
    }, [])

    const handleChange = (acTypeGroup: string, carpetType: string, val: string) => {
        const num = parseInt(val) || 0
        setIntervals(prev => ({
            ...prev,
            [acTypeGroup]: {
                ...prev[acTypeGroup],
                [carpetType]: num
            }
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // Flatten map into array of updates
            const updates = []
            for (const acTypeGroup of Object.keys(intervals)) {
                for (const carpetType of Object.keys(intervals[acTypeGroup])) {
                    updates.push({
                        acTypeGroup,
                        carpetType,
                        interval: intervals[acTypeGroup][carpetType]
                    })
                }
            }

            // Post each sequentially (Since transaction is handled per type on the backend)
            for (const update of updates) {
                await fetch('/api/intervals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(update)
                })
            }

            if (onRefresh) onRefresh()
            onClose()
        } catch (err) {
            console.error('Failed to save intervals', err)
            alert('Gagal menyimpan pengaturan interval')
            setSaving(false)
        }
    }

    // Get all unique groups
    const groups = Array.from(new Set([...AC_TYPES.GA, ...AC_TYPES.QG].map(t => {
        if (t.startsWith('B737')) return 'B737'
        if (t.startsWith('A330')) return 'A330'
        if (t.startsWith('A320')) return 'A320'
        if (t.startsWith('B777')) return 'B777'
        if (t.startsWith('ATR')) return 'ATR'
        return t
    })))

    return (
        <Overlay onClose={onClose}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ background: C.blueLight, padding: 8, borderRadius: 10, color: C.blue }}>
                    <Settings size={20} />
                </div>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Pengaturan Interval Data</h2>
                    <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Ubah interval bulan secara massal untuk semua pesawat.</p>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: C.muted }}><RefreshCw size={24} className="spin" /></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: C.warningLight, border: `1px solid ${C.warningBorder}`, padding: 12, borderRadius: 10, fontSize: 12, color: C.warning, lineHeight: 1.5 }}>
                        <strong>Peringatan:</strong> Mengubah angka di sini akan otomatis merevisi (menghitung ulang) seluruh tanggal <strong>Next Due</strong> pada semua pesawat terkait.
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                                    <th style={{ padding: '10px 8px', color: C.muted, fontWeight: 600 }}>Tipe Pesawat</th>
                                    <th style={{ padding: '10px 8px', color: C.muted, fontWeight: 600 }}>Aisle (Bulan)</th>
                                    <th style={{ padding: '10px 8px', color: C.muted, fontWeight: 600 }}>Underseat (Bulan)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.map(g => (
                                    <tr key={g} style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <td style={{ padding: '12px 8px', fontWeight: 700, color: C.text }}>{g}</td>
                                        <td style={{ padding: '8px' }}>
                                            <input
                                                type="number" min="1" max="60"
                                                value={intervals[g]?.['Aisle'] || ''}
                                                onChange={e => handleChange(g, 'Aisle', e.target.value)}
                                                style={{ ...inputStyle, width: 80, padding: '8px 12px', textAlign: 'center' }}
                                            />
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            {g !== 'A320' && g !== 'ATR' && ( // Quick hack to hide underseat for non-widebodies that don't have it natively mapped. Alternatively, just show for all.
                                                <input
                                                    type="number" min="1" max="60"
                                                    value={intervals[g]?.['Underseat'] || ''}
                                                    onChange={e => handleChange(g, 'Underseat', e.target.value)}
                                                    style={{ ...inputStyle, width: 80, padding: '8px 12px', textAlign: 'center' }}
                                                />
                                            )}
                                            {(g === 'A320' || g === 'ATR') && <span style={{ color: C.light }}>—</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontWeight: 600, cursor: 'pointer' }}>Batal</button>
                        <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: C.blue, color: '#fff', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                            {saving ? 'Menerapkan Massal...' : 'Simpan & Terapkan'}
                        </button>
                    </div>
                </div>
            )}
        </Overlay>
    )
}
