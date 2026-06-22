import { motion } from 'framer-motion'
import { useMasters } from '@/features/masters/hooks'
import { useBookingStore } from '@/features/booking/store'
import { Skeleton } from '@/shared/ui/Skeleton'

export function SelectMasterStep() {
  const { data: masters, isLoading } = useMasters()
  const setMaster = useBookingStore((s) => s.setMaster)
  const nextStep = useBookingStore((s) => s.nextStep)
  const selected = useBookingStore((s) => s.selectedMaster)
  const selectedService = useBookingStore((s) => s.selectedService)

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">
        {selectedService ? `Мастер для «${selectedService.name}»` : 'Выберите мастера'}
      </h2>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl bg-surface p-4">
              <Skeleton variant="circular" width={52} height={52} />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {masters?.map((master, i) => (
            <motion.button
              key={master.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => {
                setMaster(master)
                nextStep()
              }}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                selected?.id === master.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface hover:border-primary/50'
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {master.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm">{master.name}</h3>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-text-secondary">
                  <span>★ {master.rating.toFixed(1)}</span>
                  <span>{master.reviews_count} отзывов</span>
                </div>
              </div>
              <svg className="h-5 w-5 shrink-0 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
