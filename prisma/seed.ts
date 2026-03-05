import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Seeding database...')

    // Clear existing data
    await prisma.replacementHistory.deleteMany()
    await prisma.carpetItem.deleteMany()
    await prisma.aircraft.deleteMany()
    console.log('  ✓ Cleared existing data')

    // Create Aircraft (GA = Garuda Indonesia)
    const aircraft = await Promise.all([
        prisma.aircraft.create({ data: { acType: 'B737-800', acTypeGroup: 'B737', registration: 'PK-GDC', airline: 'GA' } }),
        prisma.aircraft.create({ data: { acType: 'B737-800', acTypeGroup: 'B737', registration: 'PK-GFK', airline: 'GA' } }),
        prisma.aircraft.create({ data: { acType: 'B737-800', acTypeGroup: 'B737', registration: 'PK-GFQ', airline: 'GA' } }),
        prisma.aircraft.create({ data: { acType: 'A330-300', acTypeGroup: 'A330', registration: 'PK-GHC', airline: 'GA' } }),
        prisma.aircraft.create({ data: { acType: 'A330-200', acTypeGroup: 'A330', registration: 'PK-GPJ', airline: 'GA' } }),
        prisma.aircraft.create({ data: { acType: 'A330-900', acTypeGroup: 'A330', registration: 'PK-GHE', airline: 'GA' } }),
        prisma.aircraft.create({ data: { acType: 'B777-300', acTypeGroup: 'B777', registration: 'PK-GIA', airline: 'GA' } }),
        prisma.aircraft.create({ data: { acType: 'B777-300', acTypeGroup: 'B777', registration: 'PK-GIC', airline: 'GA' } }),
    ])
    console.log(`  ✓ Created ${aircraft.length} aircraft`)

    const [gdc, gfk, gfq, ghc, gpj, ghe, gia, gic] = aircraft

    // B737: Aisle=8mo, Underseat=12mo | A330: Aisle=6mo, Underseat=12mo | B777: Aisle=6mo, Underseat=12mo
    const carpetItems = await Promise.all([
        // PK-GDC B737-800 (safe)
        prisma.carpetItem.create({ data: { aircraftId: gdc.id, carpetType: 'Underseat', intervalMonths: 12, lastDone: new Date('2025-08-25'), nextDue: new Date('2026-08-25') } }),
        prisma.carpetItem.create({ data: { aircraftId: gdc.id, carpetType: 'Aisle', intervalMonths: 8, lastDone: new Date('2026-01-26'), nextDue: new Date('2026-09-26') } }),
        // PK-GFK B737-800 — Aisle ALREADY DUE
        prisma.carpetItem.create({ data: { aircraftId: gfk.id, carpetType: 'Aisle', intervalMonths: 8, lastDone: new Date('2025-06-15'), nextDue: new Date('2026-02-15') } }),
        prisma.carpetItem.create({ data: { aircraftId: gfk.id, carpetType: 'Underseat', intervalMonths: 12, lastDone: new Date('2025-03-25'), nextDue: new Date('2026-03-25') } }),
        // PK-GFQ B737-800 — Aisle NEAR DUE
        prisma.carpetItem.create({ data: { aircraftId: gfq.id, carpetType: 'Aisle', intervalMonths: 8, lastDone: new Date('2025-07-30'), nextDue: new Date('2026-03-30') } }),
        prisma.carpetItem.create({ data: { aircraftId: gfq.id, carpetType: 'Underseat', intervalMonths: 12, lastDone: new Date('2025-08-10'), nextDue: new Date('2026-08-10') } }),
        // PK-GHC A330-300 — Aisle NEAR DUE
        prisma.carpetItem.create({ data: { aircraftId: ghc.id, carpetType: 'Aisle', intervalMonths: 6, lastDone: new Date('2025-09-15'), nextDue: new Date('2026-03-15') } }),
        prisma.carpetItem.create({ data: { aircraftId: ghc.id, carpetType: 'Underseat', intervalMonths: 12, lastDone: new Date('2025-04-20'), nextDue: new Date('2026-04-20') } }),
        // PK-GPJ A330-200 — Aisle NEAR DUE
        prisma.carpetItem.create({ data: { aircraftId: gpj.id, carpetType: 'Aisle', intervalMonths: 6, lastDone: new Date('2025-09-20'), nextDue: new Date('2026-03-20') } }),
        prisma.carpetItem.create({ data: { aircraftId: gpj.id, carpetType: 'Underseat', intervalMonths: 12, lastDone: new Date('2025-12-01'), nextDue: new Date('2026-12-01') } }),
        // PK-GHE A330-900 — Aisle ALREADY DUE
        prisma.carpetItem.create({ data: { aircraftId: ghe.id, carpetType: 'Aisle', intervalMonths: 6, lastDone: new Date('2025-08-01'), nextDue: new Date('2026-02-01') } }),
        prisma.carpetItem.create({ data: { aircraftId: ghe.id, carpetType: 'Underseat', intervalMonths: 12, lastDone: new Date('2025-10-15'), nextDue: new Date('2026-10-15') } }),
        // PK-GIA B777-300 — BOTH ALREADY DUE
        prisma.carpetItem.create({ data: { aircraftId: gia.id, carpetType: 'Aisle', intervalMonths: 6, lastDone: new Date('2025-08-10'), nextDue: new Date('2026-02-10') } }),
        prisma.carpetItem.create({ data: { aircraftId: gia.id, carpetType: 'Underseat', intervalMonths: 12, lastDone: new Date('2025-02-05'), nextDue: new Date('2026-02-05') } }),
        // PK-GIC B777-300 — Aisle NEAR DUE
        prisma.carpetItem.create({ data: { aircraftId: gic.id, carpetType: 'Aisle', intervalMonths: 6, lastDone: new Date('2025-09-25'), nextDue: new Date('2026-03-25') } }),
        prisma.carpetItem.create({ data: { aircraftId: gic.id, carpetType: 'Underseat', intervalMonths: 12, lastDone: new Date('2025-06-01'), nextDue: new Date('2026-06-01') } }),
    ])
    console.log(`  ✓ Created ${carpetItems.length} carpet items`)

    // Replacement history
    await Promise.all([
        prisma.replacementHistory.create({ data: { carpetItemId: carpetItems[2].id, doneNumber: 1, doneDate: new Date('2024-02-15'), isPremature: false } }),
        prisma.replacementHistory.create({ data: { carpetItemId: carpetItems[2].id, doneNumber: 2, doneDate: new Date('2024-10-15'), isPremature: false } }),
        prisma.replacementHistory.create({ data: { carpetItemId: carpetItems[2].id, doneNumber: 3, doneDate: new Date('2025-06-15'), isPremature: false } }),
        prisma.replacementHistory.create({ data: { carpetItemId: carpetItems[12].id, doneNumber: 1, doneDate: new Date('2024-08-10'), isPremature: false } }),
        prisma.replacementHistory.create({ data: { carpetItemId: carpetItems[12].id, doneNumber: 2, doneDate: new Date('2025-02-10'), isPremature: true } }),
        prisma.replacementHistory.create({ data: { carpetItemId: carpetItems[12].id, doneNumber: 3, doneDate: new Date('2025-08-10'), isPremature: false } }),
    ])
    console.log('  ✓ Created replacement history')

    console.log('\n✅ Seed complete!')
}

main()
    .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
