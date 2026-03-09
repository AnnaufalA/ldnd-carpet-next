'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { C } from '@/app/data/constants'

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    // Prevent Hydration Mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div style={{ width: 36, height: 36 }} /> // placeholder
    }

    const isDark = theme === 'dark'

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 18,
                border: `1px solid ${C.border}`,
                background: C.surface,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: C.text
            }}
            aria-label="Toggle Dark Mode"
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    )
}
