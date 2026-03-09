export const COLORS = {
    bg: 'var(--color-bg)',
    surface: 'var(--color-surface)',
    border: 'var(--color-border)',
    borderLight: 'var(--color-borderLight)',
    text: 'var(--color-text)',
    muted: 'var(--color-muted)',
    light: 'var(--color-light)',

    danger: 'var(--color-danger)',
    dangerLight: 'var(--color-dangerLight)',
    dangerBorder: 'var(--color-dangerBorder)',
    dangerDark: 'var(--color-dangerDark)',

    warning: 'var(--color-warning)',
    warningLight: 'var(--color-warningLight)',
    warningBorder: 'var(--color-warningBorder)',
    warningDark: 'var(--color-warningDark)',

    blue: 'var(--color-blue)',
    blueLight: 'var(--color-blueLight)',
    blueBorder: 'var(--color-blueBorder)',

    green: 'var(--color-green)',
    greenLight: 'var(--color-greenLight)',

    gaColor: 'var(--color-ga)',
    gaLight: 'var(--color-gaLight)',
    qgColor: 'var(--color-qg)',
    qgLight: 'var(--color-qgLight)',

    orange: 'var(--color-orange)',
    orangeLight: 'var(--color-orangeLight)',
}

export const GA_TYPES = ['B737-800', 'B737 MAX 8', 'B777-300', 'A330-200', 'A330-300', 'A330-900']
export const QG_TYPES = ['A320', 'ATR']

export function formatDate(d: Date) {
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
