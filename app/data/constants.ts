export const C = {
    bg: '#f1f5f9', surface: '#ffffff', border: '#e2e8f0', borderLight: '#f1f5f9',
    text: '#0f172a', muted: '#64748b', light: '#94a3b8',
    blue: '#4f46e5', blueLight: '#ede9fe', blueBorder: '#c4b5fd',
    danger: '#dc2626', dangerLight: '#fef2f2', dangerBorder: '#fca5a5',
    warning: '#b45309', warningLight: '#fffbeb',
    green: '#059669', greenLight: '#ecfdf5', greenBorder: '#86efac',
    gaColor: '#0369a1', gaLight: '#e0f2fe',
    qgColor: '#15803d', qgLight: '#f0fdf4',
    orange: '#ea580c', orangeLight: '#fff7ed',
}

export const AC_TYPES: Record<string, string[]> = {
    GA: ['B737-800', 'A330-200', 'A330-300', 'A330-900', 'B777-300'],
    QG: ['A320', 'ATR'],
}

export function getGroup(acType: string): string {
    if (acType.startsWith('B737')) return 'B737'
    if (acType.startsWith('A330')) return 'A330'
    if (acType.startsWith('A320')) return 'A320'
    if (acType.startsWith('B777')) return 'B777'
    if (acType.startsWith('ATR')) return 'ATR'
    return acType
}

export function fmtDate(d: string | null) {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function daysUntil(d: string | null): number | null {
    if (!d) return null
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}
