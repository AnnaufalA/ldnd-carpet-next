import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const QG_A320: string[] = [
    'PK-GLE', 'PK-GLG', 'PK-GLL', 'PK-GLR', 'PK-GLS', 'PK-GLT', 'PK-GLU', 'PK-GLV', 'PK-GLX', 'PK-GLY',
    'PK-GQA', 'PK-GQE', 'PK-GQF', 'PK-GQG', 'PK-GQH', 'PK-GQI', 'PK-GQK', 'PK-GQL', 'PK-GQM', 'PK-GQN',
    'PK-GQO', 'PK-GQP', 'PK-GQQ', 'PK-GQR', 'PK-GQS', 'PK-GQU',
    'PK-GTA', 'PK-GTD', 'PK-GTE', 'PK-GTK',
]

async function main() {
    console.log(`Memasukkan ${QG_A320.length} pesawat QG (A320)...`)
    for (const reg of QG_A320) {
        const ac = await prisma.aircraft.create({
            data: { acType: 'A320', acTypeGroup: 'A320', registration: reg, airline: 'QG' },
        })
        await prisma.carpetItem.create({
            data: { aircraftId: ac.id, carpetType: 'Aisle', intervalMonths: 12 },
        })
        console.log(`  ${reg} (A320) - 1 carpet item`)
    }
    console.log(`\nSelesai! ${QG_A320.length} pesawat QG berhasil ditambahkan.`)
}

main()
    .catch((e) => { console.error('Failed:', e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
