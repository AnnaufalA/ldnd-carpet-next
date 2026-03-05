'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plane, AlertTriangle, Clock, LayoutDashboard, Database } from 'lucide-react'
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

const GA_TYPES = ['B737-800', 'B777-300', 'A330-200', 'A330-300', 'A330-900']
const QG_TYPES = ['A320', 'ATR']

/* ── Aircraft Type Vertical Row ── */
function TypeRow({ type, count, isDanger }: { type: string; count: number; isDanger: boolean }) {
  const safe = count === 0

  if (safe) {
    return (
      <div style={{
        border: `1px solid ${COLORS.border}`, background: COLORS.surface,
        borderRadius: 8, padding: '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600 }}>{type}</span>
        <span style={{ color: COLORS.light, fontSize: 13, fontWeight: 700 }}>{count}</span>
      </div>
    )
  }

  const bg = isDanger ? COLORS.dangerLight : COLORS.warningLight
  const border = isDanger ? COLORS.dangerBorder : COLORS.warningBorder
  const numClr = isDanger ? COLORS.danger : COLORS.warning
  const lblClr = isDanger ? COLORS.dangerDark : COLORS.warningDark

  return (
    <div style={{
      border: `1px solid ${border}`, background: bg,
      borderRadius: 8, padding: '8px 12px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ color: lblClr, fontSize: 12, fontWeight: 700 }}>{type}</span>
      <span style={{ color: numClr, fontSize: 14, fontWeight: 800 }}>{count}</span>
    </div>
  )
}

/* ── Airline Column (GA / QG) ── */
function AirlineColumn({ name, badge, color, items, isDanger, types }: {
  name: string; badge: string; color: string;
  items: DashboardData['nearDueItems']
  isDanger: boolean; types: string[]
}) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, border: `1px solid ${COLORS.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: `2px solid ${COLORS.border}`, paddingBottom: 12 }}>
        <span style={{ fontWeight: 800, fontSize: 15, color }}>{name}</span>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: COLORS.border, color: COLORS.muted, fontWeight: 700 }}>{badge}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
        {/* Aisle Left */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.blue }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>Aisle Carpet</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {types.map(t => {
              const count = items.filter(i => i.carpetType === 'Aisle' && i.aircraft?.acType === t).length
              return <TypeRow key={t} type={t} count={count} isDanger={isDanger} />
            })}
          </div>
        </div>

        {/* Underseat Right */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.green }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>Underseat</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {types.map(t => {
              const count = items.filter(i => i.carpetType === 'Underseat' && i.aircraft?.acType === t).length
              return <TypeRow key={t} type={t} count={count} isDanger={isDanger} />
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Detail table ── */
function DetailTable({ items }: { items: DashboardData['nearDueItems'] }) {
  const [open, setOpen] = useState(false)
  if (!items.length) return null

  const sorted = [...items].sort((a, b) =>
    new Date(a.nextDue ?? '').getTime() - new Date(b.nextDue ?? '').getTime()
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
                const days = item.nextDue
                  ? Math.ceil((new Date(item.nextDue).getTime() - Date.now()) / 86400000)
                  : 0
                const overdue = days <= 0
                return (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? COLORS.surface : '#f8fafc', borderBottom: i < sorted.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: COLORS.text }}>{item.aircraft?.registration}</td>
                    <td style={{ padding: '10px 14px', color: COLORS.muted }}>{item.aircraft?.acType}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: item.carpetType === 'Aisle' ? COLORS.blueLight : COLORS.greenLight,
                        color: item.carpetType === 'Aisle' ? COLORS.blue : COLORS.green,
                      }}>{item.carpetType}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: COLORS.muted }}>{item.lastDone ?? '-'}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: COLORS.text }}>{item.nextDue ?? '-'}</td>
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
  title: string; subtitle: string; icon: React.ReactNode; accentColor: string
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor }}>
          {icon}
        </div>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: COLORS.text }}>{title}</h2>
          <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{subtitle}</p>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32, marginBottom: 20 }}>
          <AirlineColumn name="Garuda Indonesia" badge="GA" color={COLORS.gaColor} items={items.filter(i => i.aircraft?.airline === 'GA')} isDanger={isDanger} types={GA_TYPES} />
          <AirlineColumn name="Citilink" badge="QG" color={COLORS.qgColor} items={items.filter(i => i.aircraft?.airline === 'QG')} isDanger={isDanger} types={QG_TYPES} />
        </div>
        <DetailTable items={items} />
      </div>
    </div>
  )
}

/* ── Summary card ── */
function SummaryCard({ label, value, icon, bg, numColor, sub }: {
  label: string; value: number; icon: React.ReactNode; bg: string; numColor: string; sub?: string
}) {
  return (
    <div style={{
      background: bg, borderRadius: 16,
      border: `1px solid ${COLORS.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{label}</div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: numColor, padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.5)'
        }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 40, fontWeight: 800, color: numColor, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 6 }}>{sub}</div>}
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
