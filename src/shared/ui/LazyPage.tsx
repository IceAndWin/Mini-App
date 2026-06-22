import { Suspense } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

export function LazyPage({ Component }: { Component: LazyExoticComponent<ComponentType> }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <Component />
    </Suspense>
  )
}
