import { useCallback, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: ReactNode
  threshold?: number
  className?: string
}

export function PullToRefresh({ onRefresh, children, threshold = 60, className }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const pulling = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startY.current = touch.clientY
      pulling.current = true
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    if (!pulling.current || refreshing) return
    const diff = touch.clientY - startY.current
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, threshold * 1.5))
    }
  }, [refreshing, threshold])

  const handleTouchEnd = useCallback(async (_e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return
    pulling.current = false

    if (pullDistance >= threshold) {
      setRefreshing(true)
      setPullDistance(threshold)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [onRefresh, pullDistance, refreshing, threshold])

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={(e) => { void handleTouchEnd(e) }}
    >
      <motion.div
        className="flex items-center justify-center text-text-secondary"
        style={{ height: pullDistance, overflow: 'hidden' }}
        animate={{ height: pullDistance }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {refreshing ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <motion.svg
            className="h-5 w-5"
            animate={{ rotate: pullDistance >= threshold ? 180 : 0 }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </motion.svg>
        )}
      </motion.div>
      {children}
    </div>
  )
}
