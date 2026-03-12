export { COLORS } from '@/lib/theme'
export { GA_TYPES, QG_TYPES } from '@/lib/constants'
import { LOCALE_ID } from '@/lib/constants'

export function formatDate(d: Date) {
    return d.toLocaleDateString(LOCALE_ID, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
