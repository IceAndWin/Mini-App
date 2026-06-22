import { useEffect, type ComponentType } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useBookingStore } from '@/features/booking/store'
import { SelectServiceStep } from '@/features/booking/steps/SelectServiceStep'
import { SelectMasterStep } from '@/features/booking/steps/SelectMasterStep'
import { SelectDateTimeStep } from '@/features/booking/steps/SelectDateTimeStep'
import { ConfirmStep } from '@/features/booking/steps/ConfirmStep'
import { useTelegram } from '@/shared/hooks/useTelegram'

const stepVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
}

const steps: Record<number, ComponentType> = {
  1: SelectServiceStep,
  2: SelectMasterStep,
  3: SelectDateTimeStep,
  4: ConfirmStep,
}

export default function BookingPage() {
  const currentStep = useBookingStore((s) => s.currentStep)
  const prevStep = useBookingStore((s) => s.prevStep)
  const { showBackButton, hideBackButton } = useTelegram()

  const stepLabels = ['Услуга', 'Мастер', 'Дата и время', 'Подтверждение']

  useEffect(() => {
    if (currentStep > 1) {
      showBackButton(prevStep)
    } else {
      hideBackButton()
    }
  }, [currentStep, prevStep, showBackButton, hideBackButton])

  const Component = steps[currentStep]
  if (!Component) return null

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-6 flex items-center gap-1.5">
        {stepLabels.map((label, i) => {
          const stepNum = (i + 1) as 1 | 2 | 3 | 4
          const isActive = stepNum === currentStep
          const isDone = stepNum < currentStep
          return (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isDone
                    ? 'bg-primary text-white'
                    : isActive
                      ? 'bg-primary text-white'
                      : 'bg-surface text-text-secondary'
                }`}
              >
                {isDone ? '✓' : stepNum}
              </div>
              {i < stepLabels.length - 1 && (
                <div
                  className={`h-0.5 w-6 rounded transition-colors ${
                    isDone ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait" custom={currentStep}>
        <motion.div
          key={currentStep}
          custom={currentStep}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <Component />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
