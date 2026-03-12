import type { Airline } from '@/lib/types'

export const LOCALE_ID = 'id-ID' as const

export const MS_PER_DAY = 86_400_000

export const NEAR_DUE_DAYS = 30
export const PREMATURE_GRACE_DAYS = 10

export const DEFAULT_RAWMAT_UNIT = 'YD' as const

// UI/layout constants (centralized magic numbers)
export const SUCCESS_INDICATOR_RESET_MS = 2000
export const PAGE_MAX_WIDTH_DASHBOARD = 1100
export const PAGE_MAX_WIDTH_DATA = 1200
export const OVERLAY_Z_INDEX = 100
export const MODAL_WIDTH_PX = 420
export const MAX_INTERVAL_MONTHS = 60

export const AIRLINES: Record<Airline, { code: Airline; name: string }> = {
  GA: { code: 'GA', name: 'Garuda Indonesia' },
  QG: { code: 'QG', name: 'Citilink' },
} as const

// Widened to `Record<string, ...>` to match current UI props
// that still pass airline codes around as `string`.
export const AC_TYPES: Record<string, string[]> = {
  GA: ['B737-800', 'B737 MAX 8', 'A330-200', 'A330-300', 'A330-900', 'B777-300'],
  QG: ['A320', 'ATR'],
}

export const GA_TYPES = AC_TYPES.GA
export const QG_TYPES = AC_TYPES.QG

export function getGroup(acType: string): string {
  if (acType.startsWith('B737')) return 'B737'
  if (acType.startsWith('A330')) return 'A330'
  if (acType.startsWith('A320')) return 'A320'
  if (acType.startsWith('B777')) return 'B777'
  if (acType.startsWith('ATR')) return 'ATR'
  return acType
}

