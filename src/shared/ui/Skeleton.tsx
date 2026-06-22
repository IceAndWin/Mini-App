import { cn } from '@/shared/lib/cn'

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  className?: string
  count?: number
}

const variantStyles: Record<string, string> = {
  text: 'rounded-md h-4',
  circular: 'rounded-full',
  rectangular: 'rounded-xl',
}

export function Skeleton({ variant = 'text', width, height, className, count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count })

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-border',
            variantStyles[variant],
            count > 1 && i < count - 1 && 'mb-2',
            className,
          )}
          style={{ width, height }}
        />
      ))}
    </>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton className="mb-2 w-3/4" />
          <Skeleton className="w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
