import { create } from 'zustand'

interface TelegramState {
  isReady: boolean
  user: TelegramUser | null
  colorScheme: 'light' | 'dark'
  themeParams: TelegramThemeParams

  initWebApp: (webApp: TelegramWebApp) => void
  setColorScheme: (scheme: 'light' | 'dark') => void
  setThemeParams: (params: TelegramThemeParams) => void
}

export const useTelegramStore = create<TelegramState>()((set) => ({
  isReady: false,
  user: null,
  colorScheme: 'light',
  themeParams: {},

  initWebApp: (webApp) => {
    set({
      isReady: true,
      user: webApp.initDataUnsafe.user ?? null,
      colorScheme: webApp.colorScheme,
      themeParams: webApp.themeParams,
    })
  },

  setColorScheme: (colorScheme) => { set({ colorScheme }) },

  setThemeParams: (themeParams) => { set({ themeParams }) },
}))
