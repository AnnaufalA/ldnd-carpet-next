// TypeScript types for the LDND Carpet database

export type Airline = 'GA' | 'QG'
export type CarpetType = 'Aisle' | 'Underseat'
export type AircraftTypeGroup = 'B737' | 'A320' | 'A330' | 'B777' | 'ATR'

export interface Aircraft {
    id: string
    ac_type: string
    ac_type_group: AircraftTypeGroup
    registration: string
    airline: Airline
    created_at: string
}

export interface CarpetItem {
    id: string
    aircraft_id: string
    carpet_type: CarpetType
    interval_months: number
    last_done: string | null
    next_due: string | null
    remark: string | null
    created_at: string
    aircraft?: Aircraft
}

export interface ReplacementHistory {
    id: string
    carpet_item_id: string
    done_number: number
    done_date: string
    is_premature: boolean
    created_at: string
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
}

export const INTERVALS: Record<string, Record<string, number>> = {
    B737: { Aisle: 8, Underseat: 12 },
    A320: { Aisle: 12 },
    A330: { Aisle: 6, Underseat: 12 },
    B777: { Aisle: 6, Underseat: 12 },
    ATR: {},
}
