import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// GHE~GHI were in seed as A330-300 but should be A330-900
// They already exist in the DB, just need type fix
const TO_FIX: [string, string][] = [
    ['PK-GHE', 'A330-900'],
    ['PK-GHF', 'A330-900'],
    ['PK-GHG', 'A330-900'],
    ['PK-GHH', 'A330-900'],
    ['PK-GHI', 'A330-900'],
]

async function main() {
    for (const [reg, acType] of TO_FIX) {
        const existing = await prisma.aircraft.findUnique({ where: { registration: reg } })
        if (existing) {
            await prisma.aircraft.update({
                where: { registration: reg },
                data: { acType, acTypeGroup: 'A330' },
            })
            console.log(`  ✅ ${reg}: ${existing.acType} -> ${acType}`)
        } else {
            console.log(`  ⚠️ ${reg}: tidak ditemukan di DB, skip`)
        }
    }
    console.log('\nSelesai!')
}

main()
    .catch((e) => { console.error('Failed:', e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
