import { useCallback } from 'react'
import { useTelegramStore } from '@/entities/telegram/store'

let mainClickHandler: (() => void) | null = null
let mainButtonInitialized = false

function initMainButton() {
  if (mainButtonInitialized) return
  mainButtonInitialized = true
  const webApp = window.Telegram?.WebApp
  if (!webApp?.MainButton) return
  webApp.MainButton.onClick(() => {
    mainClickHandler?.()
  })
}

export function useTelegram() {
  const webApp = window.Telegram?.WebApp ?? null
  const user = useTelegramStore((s) => s.user)
  const colorScheme = useTelegramStore((s) => s.colorScheme)
  const isReady = useTelegramStore((s) => s.isReady)
  const themeParams = useTelegramStore((s) => s.themeParams)

  if (webApp?.MainButton && !mainButtonInitialized) {
    initMainButton()
  }

  const showMainButton = useCallback(
    (text: string, callback: () => void) => {
      if (!webApp?.MainButton) return
      mainClickHandler = callback
      webApp.MainButton.setText(text)
      webApp.MainButton.show()
    },
    [webApp],
  )

  const hideMainButton = useCallback(() => {
    if (!webApp?.MainButton) return
    mainClickHandler = null
    webApp.MainButton.hide()
  }, [webApp])

  const showBackButton = useCallback(
    (callback: () => void) => {
      if (!webApp?.BackButton) return
      webApp.BackButton.onClick(callback)
      webApp.BackButton.show()
    },
    [webApp],
  )

  const hideBackButton = useCallback(() => {
    if (!webApp?.BackButton) return
    webApp.BackButton.hide()
  }, [webApp])

  return {
    webApp,
    user,
    colorScheme,
    isReady,
    themeParams,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
  } as const
}