// TypeScript types for the LDND Carpet database

export type Airline = 'GA' | 'QG'
export type CarpetType = 'Aisle' | 'Underseat'
export type AircraftTypeGroup = 'B737' | 'A320' | 'A330' | 'B777' | 'ATR'

export interface Aircraft {
    id: string
    acType: string
    acTypeGroup: AircraftTypeGroup
    registration: string
    airline: Airline
    createdAt: string
}

export interface CarpetItem {
    id: string
    aircraftId: string
    carpetType: CarpetType
    intervalMonths: number
    lastDone: string | null
    nextDue: string | null
    remark: string | null
    coatroom: string | null
    vendor: string | null
    createdAt: string
    aircraft?: Aircraft
}

export interface ReplacementHistory {
    id: string
    carpetItemId: string
    doneNumber: number
    doneDate: string
    isPremature: boolean
    createdAt: string
}

export interface TypeCount {
    B737: number
    A320: number
    A330: number
    B777: number
    ATR: number
}

export interface CarpetBreakdown {
    aisle: TypeCount
    underseat: TypeCount
}

export interface AirlineBreakdown {
    GA: CarpetBreakdown
    QG: CarpetBreakdown
}

export interface DashboardData {
    nearDue: AirlineBreakdown
    alreadyDue: AirlineBreakdown
    nearDueItems: (CarpetItem & { aircraft: Aircraft })[]
    alreadyDueItems: (CarpetItem & { aircraft: Aircraft })[]
    totalAircraft: number
    totalNearDue: number
    totalAlreadyDue: number
    prematureCounts: PrematureCounts
    rawmatQty: RawmatQtyData
}

export interface PrematureCounts {
    aisle: TypeCount
    underseat: TypeCount
}

export interface RawmatQtyData {
    GA: { qty: number; unit: string }
    QG: { qty: number; unit: string }
}

export const INTERVALS: Record<string, Record<string, number>> = {
    B737: { Aisle: 8, Underseat: 12 },
    A320: { Aisle: 12 },
    A330: { Aisle: 6, Underseat: 12 },
    B777: { Aisle: 6, Underseat: 12 },
    ATR: {},
}
