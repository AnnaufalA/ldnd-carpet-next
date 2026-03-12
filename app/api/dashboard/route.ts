import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { buildDashboardData } from '@/lib/dashboard'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
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
        const data = buildDashboardData({
            carpetItems,
            totalAircraft,
            prematureHistory,
            rawmatRecords,
        })

        return NextResponse.json(data)
    } catch (err) {
        console.error('Dashboard API error:', err)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
