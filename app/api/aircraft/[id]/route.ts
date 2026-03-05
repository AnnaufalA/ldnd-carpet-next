import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// DELETE — Delete aircraft (cascades to carpet items & history)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.aircraft.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('DELETE /api/aircraft/[id] error:', err)
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
