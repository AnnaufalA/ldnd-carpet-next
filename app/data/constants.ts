export { C } from '@/lib/theme'
export { AC_TYPES, getGroup } from '@/lib/constants'
import { LOCALE_ID, MS_PER_DAY } from '@/lib/constants'

export function fmtDate(d: string | null) {
    if (!d) return '-'
    return new Date(d).toLocaleDateString(LOCALE_ID, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function daysUntil(d: string | null): number | null {
    if (!d) return null
    return Math.ceil((new Date(d).getTime() - Date.now()) / MS_PER_DAY)
}
