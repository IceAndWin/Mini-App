import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/widgets/BottomNav/BottomNav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <main className="mx-auto max-w-lg px-4 pb-20 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
