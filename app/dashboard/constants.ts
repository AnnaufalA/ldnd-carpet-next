export const COLORS = {
    bg: '#f1f5f9',
    surface: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
    muted: '#64748b',
    light: '#94a3b8',

    danger: '#dc2626',
    dangerLight: '#fef2f2',
    dangerBorder: '#fca5a5',
    dangerDark: '#7f1d1d',

    warning: '#b45309',
    warningLight: '#fffbeb',
    warningBorder: '#fcd34d',
    warningDark: '#78350f',

    blue: '#4f46e5',
    blueLight: '#ede9fe',
    blueBorder: '#c4b5fd',

    green: '#059669',
    greenLight: '#ecfdf5',

    gaColor: '#0369a1',
    gaLight: '#e0f2fe',
    qgColor: '#15803d',
    qgLight: '#f0fdf4',
}

export const GA_TYPES = ['B737-800', 'B777-300', 'A330-200', 'A330-300', 'A330-900']
export const QG_TYPES = ['A320', 'ATR']

export function formatDate(d: Date) {
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
