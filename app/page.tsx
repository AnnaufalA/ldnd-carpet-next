'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { DashboardData, TypeCount } from '@/lib/types'

const AC_TYPES = ['B737', 'A320', 'A330', 'B777'] as const

const COLORS = {
  bg: '#f1f5f9',
  surface: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  muted: '#64748b',
  light: '#94a3b8',

  danger: '#dc2626',
  dangerLight: '#fef2f2',
  dangerBorder: '#fca5a5',
  dangerDark: '#7f1d1d',

  warning: '#b45309',
  warningLight: '#fffbeb',
  warningBorder: '#fcd34d',
  warningDark: '#78350f',

  blue: '#4f46e5',
  blueLight: '#ede9fe',
  blueBorder: '#c4b5fd',

  green: '#059669',
  greenLight: '#ecfdf5',

  gaColor: '#0369a1',
  gaLight: '#e0f2fe',
  qgColor: '#15803d',
  qgLight: '#f0fdf4',
}

function formatDate(d: Date) {
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

/* ── Type count card ── */
function TypeCard({ type, count, isDanger }: { type: string; count: number; isDanger: boolean }) {
  const bg = isDanger ? COLORS.dangerLight : COLORS.warningLight
  const border = isDanger ? COLORS.dangerBorder : COLORS.warningBorder
  const numClr = isDanger ? COLORS.danger : COLORS.warning
  const lblClr = isDanger ? COLORS.dangerDark : COLORS.warningDark

  return (
    <div style={{
      background: bg, border: `1px solid ${border}`,
      borderRadius: 12, padding: '12px 8px', textAlign: 'center', flex: 1,
    }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: numClr, lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: lblClr, marginTop: 4 }}>{type}</div>
    </div>
  )
}

/* ── Carpet type row ── */
function CarpetRow({ label, counts, isDanger, dotColor }: {
  label: string; counts: TypeCount; isDanger: boolean; dotColor: string
}) {
  const total = AC_TYPES.reduce((s, t) => s + (counts[t] ?? 0), 0)
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{label}</span>
        <span style={{ fontSize: 12, color: COLORS.muted }}>({total} item{total !== 1 ? 's' : ''})</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {AC_TYPES.map(t => <TypeCard key={t} type={t} count={counts[t] ?? 0} isDanger={isDanger} />)}
      </div>
    </div>
  )
}

/* ── GA / QG tabs ── */
function AirlinePanel({ data, isDanger }: {
  data: { GA: { aisle: TypeCount; underseat: TypeCount }; QG: { aisle: TypeCount; underseat: TypeCount } }
  isDanger: boolean
}) {
  const [tab, setTab] = useState<'GA' | 'QG'>('GA')

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${COLORS.border}`, marginBottom: 20 }}>
        {(['GA', 'QG'] as const).map(key => {
          const active = tab === key
          const isGA = key === 'GA'
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: '8px 16px',
                border: active ? `1px solid ${COLORS.border}` : 'none',
                borderBottom: active ? `1px solid ${COLORS.surface}` : 'none',
                borderRadius: '8px 8px 0 0',
                marginBottom: active ? -1 : 0,
                background: active ? COLORS.surface : 'transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                color: active ? COLORS.blue : COLORS.muted,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {isGA ? 'Garuda Indonesia' : 'Citilink'}
              <span style={{
                background: isGA ? COLORS.gaLight : COLORS.qgLight,
                color: isGA ? COLORS.gaColor : COLORS.qgColor,
                fontSize: 10, fontWeight: 700,
                padding: '1px 6px', borderRadius: 99,
              }}>{key}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <CarpetRow label="Aisle Carpet" counts={data[tab].aisle} isDanger={isDanger} dotColor={COLORS.blue} />
      <CarpetRow label="Underseat Carpet" counts={data[tab].underseat} isDanger={isDanger} dotColor={COLORS.green} />
    </div>
  )
}

/* ── Detail table ── */
function DetailTable({ items }: { items: DashboardData['nearDueItems'] }) {
  const [open, setOpen] = useState(false)
  if (!items.length) return null

  const sorted = [...items].sort((a, b) =>
    new Date(a.next_due ?? '').getTime() - new Date(b.next_due ?? '').getTime()
  )

  return (
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: COLORS.blue, fontWeight: 600, fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        <span style={{ fontSize: 10, display: 'inline-block', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>▶</span>
        {open ? 'Sembunyikan' : 'Lihat'} Detail ({items.length} item)
      </button>

      {open && (
        <div style={{ marginTop: 12, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${COLORS.border}` }}>
                {['Registrasi', 'Tipe A/C', 'Carpet', 'Last Done', 'Next Due', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((item, i) => {
                const days = item.next_due
                  ? Math.ceil((new Date(item.next_due).getTime() - Date.now()) / 86400000)
                  : 0
                const overdue = days <= 0
                return (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? COLORS.surface : '#f8fafc', borderBottom: i < sorted.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: COLORS.text }}>{item.aircraft?.registration}</td>
                    <td style={{ padding: '10px 14px', color: COLORS.muted }}>{item.aircraft?.ac_type}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: item.carpet_type === 'Aisle' ? COLORS.blueLight : COLORS.greenLight,
                        color: item.carpet_type === 'Aisle' ? COLORS.blue : COLORS.green,
                      }}>{item.carpet_type}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: COLORS.muted }}>{item.last_done ?? '-'}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: COLORS.text }}>{item.next_due ?? '-'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: overdue ? COLORS.dangerLight : COLORS.warningLight,
                        color: overdue ? COLORS.danger : COLORS.warningDark,
                      }}>
                        {overdue ? `${Math.abs(days)}h lewat` : `${days}h lagi`}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ── Status section card ── */
function StatusSection({ title, subtitle, icon, accentColor, data, items, isDanger }: {
  title: string; subtitle: string; icon: string; accentColor: string
  data: DashboardData['nearDue'] | DashboardData['alreadyDue']
  items: DashboardData['nearDueItems']
  isDanger: boolean
}) {
  return (
    <div style={{
      background: COLORS.surface,
      borderRadius: 16,
      border: `1px solid ${COLORS.border}`,
      borderLeft: `4px solid ${accentColor}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: COLORS.text }}>{title}</h2>
          <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{subtitle}</p>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '20px 24px' }}>
        <AirlinePanel data={data} isDanger={isDanger} />
        <DetailTable items={items} />
      </div>
    </div>
  )
}

/* ── Summary card ── */
function SummaryCard({ label, value, icon, bg, numColor, sub }: {
  label: string; value: number; icon: string; bg: string; numColor: string; sub?: string
}) {
  return (
    <div style={{
      background: bg, borderRadius: 16,
      border: `1px solid ${COLORS.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <span style={{ fontSize: 32 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 40, fontWeight: 800, color: numColor, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

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
              color: '#fff', fontSize: 18, fontWeight: 700,
              boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
            }}>✈</div>
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
            <Link href="/" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: COLORS.blue, textDecoration: 'none', background: COLORS.blueLight, border: `1px solid ${COLORS.blueBorder}` }}>📊 Dashboard</Link>
            <Link href="/data" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: COLORS.muted, textDecoration: 'none', border: `1px solid ${COLORS.border}` }}>📋 Data</Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }} className="fade-up">
          <SummaryCard label="Total Pesawat" value={data.totalAircraft} icon="✈️" bg={COLORS.surface} numColor={COLORS.blue} />
          <SummaryCard label="Already Due" value={data.totalAlreadyDue} icon="🚨" bg={COLORS.dangerLight} numColor={COLORS.danger} sub="melewati jadwal penggantian" />
          <SummaryCard label="Near Due" value={data.totalNearDue} icon="⏰" bg={COLORS.warningLight} numColor={COLORS.warning} sub="dalam 30 hari ke depan" />
        </div>

        {/* Already Due */}
        <div style={{ marginBottom: 20 }} className="fade-up delay-1">
          <StatusSection
            title="Already Due" subtitle="Carpet yang sudah melewati jadwal penggantian"
            icon="🚨" accentColor={COLORS.danger}
            data={data.alreadyDue} items={data.alreadyDueItems} isDanger={true}
          />
        </div>

        {/* Near Due */}
        <div className="fade-up delay-2">
          <StatusSection
            title="Near Due" subtitle="Carpet yang mendekati jadwal penggantian (dalam 30 hari)"
            icon="⏰" accentColor={COLORS.warning}
            data={data.nearDue} items={data.nearDueItems} isDanger={false}
          />
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
