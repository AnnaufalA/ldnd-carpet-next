import type { DashboardData, AirlineBreakdown, CarpetBreakdown, TypeCount, PrematureCounts, RawmatQtyData } from '@/lib/types'
import { DEFAULT_RAWMAT_UNIT, NEAR_DUE_DAYS } from '@/lib/constants'

function emptyTypeCount(): TypeCount {
  return { B737: 0, A320: 0, A330: 0, B777: 0, ATR: 0 }
}

function emptyCarpetBreakdown(): CarpetBreakdown {
  return { aisle: emptyTypeCount(), underseat: emptyTypeCount() }
}

function emptyAirlineBreakdown(): AirlineBreakdown {
  return { GA: emptyCarpetBreakdown(), QG: emptyCarpetBreakdown() }
}

function emptyPrematureCounts(): PrematureCounts {
  return { aisle: emptyTypeCount(), underseat: emptyTypeCount() }
}

export function buildDashboardData(args: {
  carpetItems: Array<{
    id: string
    nextDue: Date | null
    carpetType: string
    aircraft: null | {
      airline: string
      acTypeGroup: string
    }
  }>
  totalAircraft: number
  prematureHistory: Array<{
    carpetItem: null | {
      carpetType: string
      aircraft: null | { acTypeGroup: string }
    }
  }>
  rawmatRecords: Array<{ airline: string; qty: number; unit: string }>
  today?: Date
}): DashboardData {
  const today = args.today ?? new Date()
  const nearDueCutoff = new Date(today)
  nearDueCutoff.setDate(nearDueCutoff.getDate() + NEAR_DUE_DAYS)

  const nearDue = emptyAirlineBreakdown()
  const alreadyDue = emptyAirlineBreakdown()
  const nearDueItems: typeof args.carpetItems = []
  const alreadyDueItems: typeof args.carpetItems = []

  for (const item of args.carpetItems) {
    const nextDue = item.nextDue
    const aircraft = item.aircraft
    if (!nextDue || !aircraft) continue

    const airline = aircraft.airline as 'GA' | 'QG'
    const typeGroup = aircraft.acTypeGroup as keyof TypeCount
    const carpetType = item.carpetType.toLowerCase() as 'aisle' | 'underseat'

    if (nextDue <= today) {
      alreadyDue[airline][carpetType][typeGroup]++
      alreadyDueItems.push(item)
    } else if (nextDue <= nearDueCutoff) {
      nearDue[airline][carpetType][typeGroup]++
      nearDueItems.push(item)
    }
  }

  const prematureCounts = emptyPrematureCounts()
  for (const h of args.prematureHistory) {
    const ci = h.carpetItem
    if (!ci || !ci.aircraft) continue
    const typeGroup = ci.aircraft.acTypeGroup as keyof TypeCount
    const carpetType = ci.carpetType.toLowerCase() as 'aisle' | 'underseat'
    prematureCounts[carpetType][typeGroup]++
  }

  const rawmatQty: RawmatQtyData = {
    GA: { qty: 0, unit: DEFAULT_RAWMAT_UNIT },
    QG: { qty: 0, unit: DEFAULT_RAWMAT_UNIT },
  }
  for (const r of args.rawmatRecords) {
    const airline = r.airline as 'GA' | 'QG'
    if (rawmatQty[airline]) rawmatQty[airline] = { qty: r.qty, unit: r.unit }
  }

  return {
    nearDue,
    alreadyDue,
    nearDueItems: nearDueItems as unknown as DashboardData['nearDueItems'],
    alreadyDueItems: alreadyDueItems as unknown as DashboardData['alreadyDueItems'],
    totalAircraft: args.totalAircraft,
    totalNearDue: nearDueItems.length,
    totalAlreadyDue: alreadyDueItems.length,
    prematureCounts,
    rawmatQty,
  }
}

