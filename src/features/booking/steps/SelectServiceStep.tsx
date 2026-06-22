import { motion } from 'framer-motion'
import { useServices } from '@/features/services/hooks'
import { useBookingStore } from '@/features/booking/store'
import { Skeleton } from '@/shared/ui/Skeleton'
import { formatPrice } from '@/shared/lib/format'

export function SelectServiceStep() {
  const { data: services, isLoading } = useServices()
  const setService = useBookingStore((s) => s.setService)
  const nextStep = useBookingStore((s) => s.nextStep)
  const selected = useBookingStore((s) => s.selectedService)

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Выберите услугу</h2>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface p-4">
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {services?.map((service, i) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => {
                setService(service)
                nextStep()
              }}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                selected?.id === service.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface hover:border-primary/50'
              }`}
            >
              <div>
                <h3 className="font-medium text-sm">{service.name}</h3>
                <p className="mt-0.5 text-xs text-text-secondary">{service.duration} мин</p>
              </div>
              <p className="font-semibold text-sm text-primary">{formatPrice(service.price)}</p>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
