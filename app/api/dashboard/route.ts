import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { DashboardData, AirlineBreakdown, CarpetBreakdown, TypeCount, PrematureCounts, RawmatQtyData } from '@/lib/types'

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

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const today = new Date()
        const oneMonthFromNow = new Date(today)
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)

        // Fetch all carpet items with aircraft data using Prisma
        const carpetItems = await prisma.carpetItem.findMany({
            where: {
                nextDue: { not: null },
            },
            include: {
                aircraft: true,
            },
        })

        // Get total aircraft count
        const totalAircraft = await prisma.aircraft.count()

        // Fetch premature replacement history
        const prematureHistory = await prisma.replacementHistory.findMany({
            where: { isPremature: true },
            include: {
                carpetItem: {
                    include: { aircraft: true }
                }
            }
        })

        // Fetch rawmat qty
        const rawmatRecords = await prisma.rawmatQty.findMany()

        // Categorize items
        const nearDue = emptyAirlineBreakdown()
        const alreadyDue = emptyAirlineBreakdown()
        const nearDueItems: typeof carpetItems = []
        const alreadyDueItems: typeof carpetItems = []

        for (const item of carpetItems) {
            const nextDue = item.nextDue
            const aircraft = item.aircraft
            if (!nextDue || !aircraft) continue

            const airline = aircraft.airline as 'GA' | 'QG'
            const typeGroup = aircraft.acTypeGroup as keyof TypeCount
            const carpetType = item.carpetType.toLowerCase() as 'aisle' | 'underseat'

            if (nextDue <= today) {
                // Already Due (overdue)
                if (alreadyDue[airline] && alreadyDue[airline][carpetType]) {
                    alreadyDue[airline][carpetType][typeGroup]++
                }
                alreadyDueItems.push(item)
            } else if (nextDue <= oneMonthFromNow) {
                // Near Due (within 1 month)
                if (nearDue[airline] && nearDue[airline][carpetType]) {
                    nearDue[airline][carpetType][typeGroup]++
                }
                nearDueItems.push(item)
            }
        }

        // Count premature replacements by type group and carpet type
        const prematureCounts = emptyPrematureCounts()
        for (const h of prematureHistory) {
            const ci = h.carpetItem
            if (!ci || !ci.aircraft) continue
            const typeGroup = ci.aircraft.acTypeGroup as keyof TypeCount
            const carpetType = ci.carpetType.toLowerCase() as 'aisle' | 'underseat'
            if (prematureCounts[carpetType]) {
                prematureCounts[carpetType][typeGroup]++
            }
        }

        // Build rawmat qty data
        const rawmatQty: RawmatQtyData = {
            GA: { qty: 0, unit: 'YD' },
            QG: { qty: 0, unit: 'YD' },
        }
        for (const r of rawmatRecords) {
            const airline = r.airline as 'GA' | 'QG'
            if (rawmatQty[airline]) {
                rawmatQty[airline] = { qty: r.qty, unit: r.unit }
            }
        }

        const data: DashboardData = {
            nearDue,
            alreadyDue,
            nearDueItems: nearDueItems as unknown as DashboardData['nearDueItems'],
            alreadyDueItems: alreadyDueItems as unknown as DashboardData['alreadyDueItems'],
            totalAircraft,
            totalNearDue: nearDueItems.length,
            totalAlreadyDue: alreadyDueItems.length,
            prematureCounts,
            rawmatQty,
        }

        return NextResponse.json(data)
    } catch (err) {
        console.error('Dashboard API error:', err)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
