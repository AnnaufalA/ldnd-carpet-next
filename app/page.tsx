'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plane, AlertTriangle, Clock, Database } from 'lucide-react'
import type { DashboardData } from '@/lib/types'
import { ThemeToggle } from '@/components/ThemeToggle'

import { COLORS, formatDate } from './dashboard/constants'
import StatusSection from './dashboard/components/StatusSection'
import SummaryCard from './dashboard/components/SummaryCard'
import RawmatSection from './dashboard/components/RawmatSection'
import PrematureSection from './dashboard/components/PrematureSection'

/* ── Main page ── */
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => { if (!r.ok) throw new Error('Gagal mengambil data'); return r.json() })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 36, height: 36, border: `3px solid ${COLORS.blue}`,
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 14, color: COLORS.muted }}>Memuat data...</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.bg }}>
      <div style={{ background: COLORS.surface, borderRadius: 16, padding: 32, textAlign: 'center', border: `1px solid ${COLORS.dangerBorder}` }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <p style={{ color: COLORS.danger, fontWeight: 700 }}>{error ?? 'Tidak ada data'}</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg }}>
      {/* Header */}
      <header style={{
        background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`,
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: COLORS.blue,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
            }}>
              <Plane size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, lineHeight: 1.2 }}>LDND Carpet Monitor</h1>
              <p style={{ fontSize: 12, color: COLORS.muted }}>Last Done / Next Due Tracking</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right', marginRight: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{formatDate(new Date())}</p>
              <p style={{ fontSize: 12, color: COLORS.muted }}>Data real-time</p>
            </div>
            <ThemeToggle />
            <Link href="/data" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: COLORS.blue, textDecoration: 'none', background: COLORS.blueLight, border: `1px solid ${COLORS.blueBorder}` }}>
              <Database size={16} strokeWidth={2.5} />
              Kelola Data
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }} className="fade-up">
          <SummaryCard label="Total Pesawat" value={data.totalAircraft} icon={<Plane size={24} strokeWidth={2.5} />} bg={COLORS.surface} numColor={COLORS.blue} />
          <SummaryCard label="Already Due" value={data.totalAlreadyDue} icon={<AlertTriangle size={24} strokeWidth={2.5} />} bg={COLORS.dangerLight} numColor={COLORS.danger} sub="melewati jadwal penggantian" />
          <SummaryCard label="Near Due" value={data.totalNearDue} icon={<Clock size={24} strokeWidth={2.5} />} bg={COLORS.warningLight} numColor={COLORS.warning} sub="dalam 30 hari ke depan" />
        </div>

        {/* Near Due */}
        <div style={{ marginBottom: 24 }} className="fade-up delay-1">
          <StatusSection
            title="Near Due" subtitle="Carpet yang mendekati jadwal penggantian (dalam 30 hari)"
            icon={<Clock size={24} strokeWidth={2.5} />} accentColor={COLORS.warning}
            data={data.nearDue} items={data.nearDueItems} isDanger={false}
          />
        </div>

        {/* Already Due */}
        <div className="fade-up delay-2">
          <StatusSection
            title="Already Due" subtitle="Carpet yang sudah melewati jadwal penggantian"
            icon={<AlertTriangle size={24} strokeWidth={2.5} />} accentColor={COLORS.danger}
            data={data.alreadyDue} items={data.alreadyDueItems} isDanger={true}
          />
        </div>

        {/* QTY Rawmat + Premature Replacement */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }} className="fade-up delay-2">
          <RawmatSection rawmatQty={data.rawmatQty} onUpdate={(airline, qty, unit) => {
            fetch('/api/rawmat', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ airline, qty, unit }),
            }).then(() => {
              setData(prev => prev ? {
                ...prev,
                rawmatQty: { ...prev.rawmatQty, [airline]: { qty, unit } }
              } : prev)
            })
          }} />

          <PrematureSection prematureCounts={data.prematureCounts} />
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${COLORS.border}`, background: COLORS.surface, marginTop: 48 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px', textAlign: 'center', fontSize: 12, color: COLORS.muted }}>
          LDND Carpet Monitor — GMF AeroAsia © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}
