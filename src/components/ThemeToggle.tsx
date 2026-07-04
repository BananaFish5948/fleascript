'use client'

import { useEffect, useState } from 'react'
import { Palette } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'kinfolk' | 'sunset'>('kinfolk')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedTheme = localStorage.getItem('theme') as 'kinfolk' | 'sunset'
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'kinfolk' ? 'sunset' : 'kinfolk'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'sunset') {
      document.documentElement.setAttribute('data-theme', 'sunset')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  // Hydration mismatchを防ぐため、マウントされるまでUIを表示しない
  if (!mounted) {
    return <div className="w-9 h-9" />
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-[var(--color-brand-dim)] transition-colors flex items-center justify-center relative group"
      title="テーマを切り替える"
      aria-label="Toggle theme"
    >
      <Palette className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand)] transition-colors" />
      
      <span className="absolute top-10 right-0 text-xs px-2 py-1 bg-[var(--color-text-primary)] text-[var(--color-bg-surface)] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {theme === 'kinfolk' ? 'Sunset（グラスモーフィズム）へ' : 'Kinfolk（オーガニック）へ'}
      </span>
    </button>
  )
}
