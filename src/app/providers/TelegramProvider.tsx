import { useEffect, type ReactNode } from 'react'
import { useTelegramStore } from '@/entities/telegram/store'

function applyTheme(colorScheme: 'light' | 'dark', themeParams: TelegramThemeParams) {
  const root = document.documentElement

  if (colorScheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  const map: Record<string, string | undefined> = {
    '--tg-bg': themeParams.bg_color,
    '--tg-text': themeParams.text_color,
    '--tg-hint': themeParams.hint_color,
    '--tg-button': themeParams.button_color,
    '--tg-button-text': themeParams.button_text_color,
    '--tg-secondary-bg': themeParams.secondary_bg_color,
    '--tg-header-bg': themeParams.header_bg_color,
    '--tg-accent-text': themeParams.accent_text_color,
    '--tg-section-bg': themeParams.section_bg_color,
    '--tg-subtitle-text': themeParams.subtitle_text_color,
    '--tg-destructive-text': themeParams.destructive_text_color,
  }

  for (const [key, value] of Object.entries(map)) {
    if (value) {
      root.style.setProperty(key, value)
    }
  }
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const initWebApp = useTelegramStore((s) => s.initWebApp)
  const setColorScheme = useTelegramStore((s) => s.setColorScheme)
  const setThemeParams = useTelegramStore((s) => s.setThemeParams)

  useEffect(() => {
    const webApp = window.Telegram?.WebApp
    if (!webApp) return

    webApp.ready()

    initWebApp(webApp)
    applyTheme(webApp.colorScheme, webApp.themeParams)

    webApp.onEvent('themeChanged', () => {
      const scheme = webApp.colorScheme
      const params = webApp.themeParams
      setColorScheme(scheme)
      setThemeParams(params)
      applyTheme(scheme, params)
    })
  }, [initWebApp, setColorScheme, setThemeParams])

  return <>{children}</>
}
