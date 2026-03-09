export const C = {
    bg: 'var(--color-bg)', surface: 'var(--color-surface)', border: 'var(--color-border)', borderLight: 'var(--color-borderLight)',
    text: 'var(--color-text)', muted: 'var(--color-muted)', light: 'var(--color-light)',
    blue: 'var(--color-blue)', blueLight: 'var(--color-blueLight)', blueBorder: 'var(--color-blueBorder)',
    danger: 'var(--color-danger)', dangerLight: 'var(--color-dangerLight)', dangerBorder: 'var(--color-dangerBorder)', dangerDark: 'var(--color-dangerDark)',
    warning: 'var(--color-warning)', warningLight: 'var(--color-warningLight)', warningBorder: 'var(--color-warningBorder)', warningDark: 'var(--color-warningDark)',
    green: 'var(--color-green)', greenLight: 'var(--color-greenLight)', greenBorder: 'var(--color-greenBorder)',
    gaColor: 'var(--color-ga)', gaLight: 'var(--color-gaLight)',
    qgColor: 'var(--color-qg)', qgLight: 'var(--color-qgLight)',
    orange: 'var(--color-orange)', orangeLight: 'var(--color-orangeLight)',
}

export const AC_TYPES: Record<string, string[]> = {
    GA: ['B737-800', 'B737 MAX 8', 'A330-200', 'A330-300', 'A330-900', 'B777-300'],
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
