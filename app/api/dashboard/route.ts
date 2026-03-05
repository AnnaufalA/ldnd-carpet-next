import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { DashboardData, AirlineBreakdown, CarpetBreakdown, TypeCount } from '@/lib/types'

function emptyTypeCount(): TypeCount {
    return { B737: 0, A320: 0, A330: 0, B777: 0, ATR: 0 }
}

function emptyCarpetBreakdown(): CarpetBreakdown {
    return { aisle: emptyTypeCount(), underseat: emptyTypeCount() }
}

function emptyAirlineBreakdown(): AirlineBreakdown {
    return { GA: emptyCarpetBreakdown(), QG: emptyCarpetBreakdown() }
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

        const data: DashboardData = {
            nearDue,
            alreadyDue,
            nearDueItems: nearDueItems as DashboardData['nearDueItems'],
            alreadyDueItems: alreadyDueItems as DashboardData['alreadyDueItems'],
            totalAircraft,
            totalNearDue: nearDueItems.length,
            totalAlreadyDue: alreadyDueItems.length,
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
