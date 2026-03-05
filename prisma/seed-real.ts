import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function getGroup(acType: string): string {
    if (acType.startsWith('B737')) return 'B737'
    if (acType.startsWith('A330')) return 'A330'
    if (acType.startsWith('A320')) return 'A320'
    if (acType.startsWith('B777')) return 'B777'
    if (acType.startsWith('ATR')) return 'ATR'
    return acType
}

const INTERVALS: Record<string, Record<string, number>> = {
    B737: { Aisle: 8, Underseat: 12 },
    A320: { Aisle: 12 },
    A330: { Aisle: 6, Underseat: 12 },
    B777: { Aisle: 6, Underseat: 12 },
    ATR: {},
}

const GA_AIRCRAFT: [string, string][] = [
    ['B737-800', 'PK-GDC'],
    ['B737-800', 'PK-GFD'],
    ['B737-800', 'PK-GFF'],
    ['B737-800', 'PK-GFG'],
    ['B737-800', 'PK-GFH'],
    ['B737-800', 'PK-GFI'],
    ['B737-800', 'PK-GFJ'],
    ['B737-800', 'PK-GFM'],
    ['B737-800', 'PK-GFP'],
    ['B737-800', 'PK-GFQ'],
    ['B737-800', 'PK-GFR'],
    ['B737-800', 'PK-GFS'],
    ['B737-800', 'PK-GFU'],
    ['B737-800', 'PK-GFV'],
    ['B737-800', 'PK-GFW'],
    ['B737-800', 'PK-GFX'],
    ['B737-800', 'PK-GMA'],
    ['B737-800', 'PK-GMC'],
    ['B737-800', 'PK-GMD'],
    ['B737-800', 'PK-GMF'],
    ['B737-800', 'PK-GMI'],
    ['B737-800', 'PK-GMP'],
    ['B737-800', 'PK-GMU'],
    ['B737-800', 'PK-GMV'],
    ['B737-800', 'PK-GMW'],
    ['B737-800', 'PK-GMX'],
    ['B737-800', 'PK-GMY'],
    ['B737-800', 'PK-GNA'],
    ['B737-800', 'PK-GNC'],
    ['B737-800', 'PK-GNE'],
    ['B737-800', 'PK-GNF'],
    ['B737-800', 'PK-GNG'],
    ['B737-800', 'PK-GNH'],
    ['B737-800', 'PK-GNM'],
    ['B737-800', 'PK-GNN'],
    ['B737-800', 'PK-GNQ'],
    ['B737-800', 'PK-GUA'],
    ['B737-800', 'PK-GUC'],
    ['B737-800', 'PK-GUD'],
    ['B737-800', 'PK-GUE'],
    ['B737-800', 'PK-GUF'],
    ['B737-800', 'PK-GUG'],
    ['B737-800', 'PK-GUH'],
    ['B737-800', 'PK-GUI'],
    ['A330-300', 'PK-GHA'],
    ['A330-300', 'PK-GHC'],
    ['A330-300', 'PK-GHD'],
    ['A330-300', 'PK-GHF'],
    ['A330-300', 'PK-GHG'],
    ['A330-300', 'PK-GHH'],
    ['A330-300', 'PK-GHI'],
    ['A330-300', 'PK-GPU'],
    ['A330-300', 'PK-GPV'],
    ['A330-300', 'PK-GPW'],
    ['A330-300', 'PK-GPY'],
    ['A330-300', 'PK-GPZ'],
    ['A330-200', 'PK-GPM'],
    ['B777-300', 'PK-GIA'],
    ['B777-300', 'PK-GIC'],
    ['B777-300', 'PK-GIG'],
    ['B777-300', 'PK-GIH'],
    ['B777-300', 'PK-GII'],
    ['B777-300', 'PK-GIJ'],
    ['B777-300', 'PK-GIK'],
]

async function main() {
    console.log('Menghapus semua data lama...')
    await prisma.replacementHistory.deleteMany()
    await prisma.carpetItem.deleteMany()
    await prisma.aircraft.deleteMany()
    await prisma.rawmatQty.deleteMany()
    console.log('Data lama dihapus.\n')

    console.log(`Memasukkan ${GA_AIRCRAFT.length} pesawat GA...`)

    for (const [acType, registration] of GA_AIRCRAFT) {
        const group = getGroup(acType)
        const intervals = INTERVALS[group] ?? {}

        const aircraft = await prisma.aircraft.create({
            data: {
                acType,
                acTypeGroup: group,
                registration,
                airline: 'GA',
            },
        })

        for (const [carpetType, months] of Object.entries(intervals)) {
            await prisma.carpetItem.create({
                data: {
                    aircraftId: aircraft.id,
                    carpetType,
                    intervalMonths: months,
                },
            })
        }

        console.log(`  ${registration} (${acType}) - ${Object.keys(intervals).length} carpet items`)
    }

    console.log(`\nSelesai! Total ${GA_AIRCRAFT.length} pesawat GA berhasil dimasukkan.`)
}

main()
    .catch((e) => { console.error('Seed failed:', e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
