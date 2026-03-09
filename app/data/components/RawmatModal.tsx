'use client'

import { useState, useEffect } from 'react'
import { Package, Save, RefreshCw } from 'lucide-react'
import { C } from '../constants'
import { Overlay } from './Modals'

// Extracted style for inputs
const inputStyle: React.CSSProperties = {
    width: 60, padding: '8px 12px', borderRadius: 8, textAlign: 'center',
    border: `1px solid ${C.border}`, fontSize: 14, color: C.text, outline: 'none',
}

export function RawmatModal({ onClose, onSaved }: { onClose: () => void, onSaved: () => void }) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<'GA' | 'QG' | null>(null)
    const [savedGroup, setSavedGroup] = useState<'GA' | 'QG' | null>(null)
    const [qtyGA, setQtyGA] = useState<number | string>('')
    const [qtyQG, setQtyQG] = useState<number | string>('')
    const [unitGA, setUnitGA] = useState('YD')
    const [unitQG, setUnitQG] = useState('YD')

    useEffect(() => {
        fetch('/api/rawmat')
            .then(res => res.json())
            .then(data => {
                if (data.GA) { setQtyGA(data.GA.qty); setUnitGA(data.GA.unit || 'YD') }
                if (data.QG) { setQtyQG(data.QG.qty); setUnitQG(data.QG.unit || 'YD') }
                setLoading(false)
            })
            .catch(console.error)
    }, [])

    const handleSave = async (airline: 'GA' | 'QG') => {
        setSaving(airline)
        setSavedGroup(null) // reset previous success state

        const qty = airline === 'GA' ? Number(qtyGA) : Number(qtyQG)
        const unit = airline === 'GA' ? unitGA : unitQG

        try {
            await fetch('/api/rawmat', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ airline, qty, unit }),
            })
            onSaved() // trigger parent refresh if necessary, though Dashboard updates on its own mount
            setSavedGroup(airline)
            setTimeout(() => setSavedGroup(null), 2000)
        } catch (err) {
            console.error('Failed to save rawmat', err)
            alert('Gagal menyimpan rawmat')
        } finally {
            setSaving(null)
        }
    }

    return (
        <Overlay onClose={onClose}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ background: C.blueLight, padding: 8, borderRadius: 10, color: C.blue }}>
                    <Package size={20} />
                </div>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Input QYT Rawmat</h2>
                    <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Jumlah QYT Rawmat Tersedia.</p>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: C.muted }}><RefreshCw size={24} className="spin" /></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* GA Box */}
                    <div style={{ background: C.gaLight, border: `1px solid ${C.gaColor}40`, padding: '16px', borderRadius: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.gaColor, fontWeight: 700, fontSize: 13, marginBottom: 16 }}>
                            <span>✈️</span> Garuda Indonesia (GA)
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <input type="number" value={qtyGA} onChange={e => setQtyGA(e.target.value)} style={{ ...inputStyle, width: 90, flex: 1, fontWeight: 700, fontSize: 16 }} />
                            <input value={unitGA} onChange={e => setUnitGA(e.target.value)} style={{ ...inputStyle, width: 60, textTransform: 'uppercase' }} placeholder="YD" />
                            <button onClick={() => handleSave('GA')} disabled={saving === 'GA'} style={{ background: savedGroup === 'GA' ? C.green : C.blue, color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700, cursor: saving === 'GA' ? 'not-allowed' : 'pointer', width: 110, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {saving === 'GA' ? <RefreshCw size={16} className="spin" /> : savedGroup === 'GA' ? 'Berhasil ✓' : 'Simpan'}
                            </button>
                        </div>
                    </div>

                    {/* QG Box */}
                    <div style={{ background: C.qgLight, border: `1px solid ${C.qgColor}40`, padding: '16px', borderRadius: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.qgColor, fontWeight: 700, fontSize: 13, marginBottom: 16 }}>
                            <span>✈️</span> Citilink (QG)
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <input type="number" value={qtyQG} onChange={e => setQtyQG(e.target.value)} style={{ ...inputStyle, width: 90, flex: 1, fontWeight: 700, fontSize: 16 }} />
                            <input value={unitQG} onChange={e => setUnitQG(e.target.value)} style={{ ...inputStyle, width: 60, textTransform: 'uppercase' }} placeholder="YD" />
                            <button onClick={() => handleSave('QG')} disabled={saving === 'QG'} style={{ background: savedGroup === 'QG' ? C.green : C.blue, color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700, cursor: saving === 'QG' ? 'not-allowed' : 'pointer', width: 110, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {saving === 'QG' ? <RefreshCw size={16} className="spin" /> : savedGroup === 'QG' ? 'Berhasil ✓' : 'Simpan'}
                            </button>
                        </div>
                    </div>

                    <button type="button" onClick={onClose} style={{ width: '100%', marginTop: 16, padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontWeight: 600, cursor: 'pointer' }}>
                        Tutup
                    </button>
                </div>
            )}
        </Overlay>
    )
}
