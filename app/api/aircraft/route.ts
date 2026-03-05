import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { INTERVALS } from '@/lib/types'

export const dynamic = 'force-dynamic'

// GET — List all aircraft with carpet items & replacement history
export async function GET() {
    try {
        const aircraft = await prisma.aircraft.findMany({
            include: {
                carpetItems: {
                    include: {
                        replacementHistory: { orderBy: { doneNumber: 'asc' } },
                    },
                    orderBy: { carpetType: 'asc' },
                },
            },
            orderBy: [{ airline: 'asc' }, { acTypeGroup: 'asc' }, { registration: 'asc' }],
        })
        return NextResponse.json(aircraft)
    } catch (err) {
        console.error('GET /api/aircraft error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST — Create new aircraft with auto-generated carpet items
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { acType, acTypeGroup, registration, airline } = body

        if (!acType || !acTypeGroup || !registration || !airline) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Get intervals for this aircraft type
        const intervals = INTERVALS[acTypeGroup] || {}

        const aircraft = await prisma.aircraft.create({
            data: {
                acType,
                acTypeGroup,
                registration: registration.toUpperCase(),
                airline,
                carpetItems: {
                    create: [
                        ...(intervals.Aisle !== undefined ? [{
                            carpetType: 'Aisle',
                            intervalMonths: intervals.Aisle,
                        }] : []),
                        ...(intervals.Underseat !== undefined ? [{
                            carpetType: 'Underseat',
                            intervalMonths: intervals.Underseat,
                        }] : []),
                    ],
                },
            },
            include: {
                carpetItems: {
                    include: { replacementHistory: true },
                    orderBy: { carpetType: 'asc' },
                },
            },
        })

        return NextResponse.json(aircraft, { status: 201 })
    } catch (err: unknown) {
        console.error('POST /api/aircraft error:', err)
        if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
            return NextResponse.json({ error: 'Registrasi sudah ada' }, { status: 409 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
