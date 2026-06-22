import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { TelegramProvider } from './providers/TelegramProvider'
import { QueryProvider } from './providers/QueryProvider'

export function App() {
  return (
    <TelegramProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </TelegramProvider>
  )
}
