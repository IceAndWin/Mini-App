import { motion } from 'framer-motion'
import { useMasters } from '@/features/masters/hooks'
import { AnimatedPage } from '@/shared/ui/AnimatedPage'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < Math.round(rating) ? 'text-warning' : 'text-border'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export default function MastersPage() {
  const { data: masters, isLoading } = useMasters()

  return (
    <AnimatedPage>
      <h1 className="mb-4 text-xl font-bold">Наши мастера</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
              <Skeleton variant="circular" width={56} height={56} />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : masters && masters.length > 0 ? (
        <div className="space-y-3">
          {masters.map((master, i) => (
            <motion.div
              key={master.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {master.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium">{master.name}</h3>
                {master.bio && (
                  <p className="mt-0.5 truncate text-xs text-text-secondary">{master.bio}</p>
                )}
                <div className="mt-1.5 flex items-center gap-2">
                  <StarRating rating={master.rating} />
                  <span className="text-xs text-text-secondary">
                    {master.rating.toFixed(1)} · {master.reviews_count} отзыв{master.reviews_count === 1 ? '' : master.reviews_count >= 2 && master.reviews_count <= 4 ? 'а' : 'ов'}
                  </span>
                </div>
              </div>
              <svg
                className="h-5 w-5 shrink-0 text-text-secondary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Мастера не найдены"
          description="Список мастеров пока пуст"
        />
      )}
    </AnimatedPage>
  )
}
