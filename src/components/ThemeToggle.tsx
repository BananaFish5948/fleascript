'use client'

import { useEffect, useState } from 'react'
import { Palette } from 'lucide-react'

type Theme = 'kinfolk' | 'sunset' | 'stone' | 'linen'

const themes: Theme[] = ['kinfolk', 'sunset', 'stone', 'linen']

const themeNames = {
  kinfolk: 'Kinfolk (オーガニック)',
  sunset: 'Sunset (サンセット)',
  stone: 'Stone & Espresso (カフェモダン)',
  linen: 'Linen & Slate (北欧スローライフ)'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('kinfolk')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedTheme = localStorage.getItem('theme') as Theme
    if (storedTheme && themes.includes(storedTheme)) {
      setTheme(storedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    const newTheme = themes[nextIndex]
    
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'kinfolk') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', newTheme)
    }

    // 他のコンポーネント（設定画面のピッカーなど）へテーマ変更イベントを伝える
    window.dispatchEvent(new Event('themechange'))
  }

  // Hydration mismatchを防ぐため、マウントされるまでUIを表示しない
  if (!mounted) {
    return <div className="w-9 h-9" />
  }

  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length]

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-[var(--color-brand-dim)] transition-colors flex items-center justify-center relative group cursor-pointer"
      title={`テーマを切り替える (現在: ${themeNames[theme]})`}
      aria-label="Toggle theme"
    >
      <Palette className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand)] transition-colors" />
      
      <span className="absolute top-10 right-0 text-xs px-3 py-1.5 bg-[var(--color-text-primary)] text-[var(--color-bg-surface)] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
        次は: {themeNames[nextTheme]}
      </span>
    </button>
  )
}
