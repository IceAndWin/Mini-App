import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useBookingStore } from '@/features/booking/store'
import { fetchAvailableSlots } from '@/shared/api/endpoints'
import { Skeleton } from '@/shared/ui/Skeleton'

function getNext7Days(): { dateStr: string; dayName: string; dayNum: number }[] {
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  const result = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    result.push({
      dateStr: iso ?? '',
      dayName: days[d.getDay()] ?? '',
      dayNum: d.getDate(),
    })
  }
  return result
}

export function SelectDateTimeStep() {
  const selectedMaster = useBookingStore((s) => s.selectedMaster)
  const selectedService = useBookingStore((s) => s.selectedService)
  const selectedDate = useBookingStore((s) => s.selectedDate)
  const setDate = useBookingStore((s) => s.setDate)
  const selectedTime = useBookingStore((s) => s.selectedTime)
  const setTime = useBookingStore((s) => s.setTime)
  const nextStep = useBookingStore((s) => s.nextStep)

  const defaultDate = getNext7Days()[0]
  const [localDate, setLocalDate] = useState(selectedDate ?? defaultDate?.dateStr ?? '')

  const { data: slotsData, isLoading } = useQuery({
    queryKey: ['available-slots', selectedMaster?.id, localDate, selectedService?.id],
    queryFn: () => fetchAvailableSlots(selectedMaster?.id ?? '', localDate, selectedService?.id),
    enabled: !!selectedMaster && !!localDate,
  })

  const days = getNext7Days()
  const availableSlots = slotsData?.slots.filter((s: { available: boolean }) => s.available) ?? []
  const allSlots = slotsData?.slots ?? []

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Дата и время</h2>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => (
          <button
            key={day.dateStr}
            onClick={() => {
              setLocalDate(day.dateStr)
              setDate(day.dateStr)
              setTime(null)
            }}
            className={`flex shrink-0 flex-col items-center rounded-xl px-4 py-2.5 text-xs font-medium transition-colors ${
              localDate === day.dateStr
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary hover:bg-border'
            }`}
          >
            <span>{day.dayName}</span>
            <span className="mt-0.5 text-base font-bold">{day.dayNum}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="h-10" />
          ))}
        </div>
      ) : allSlots.length > 0 ? (
        <>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {allSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => {
                  setTime(slot.time)
                  nextStep()
                }}
                className={`rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  selectedTime === slot.time
                    ? 'bg-primary text-white'
                    : slot.available
                      ? 'border border-border bg-surface text-text-primary hover:border-primary'
                      : 'cursor-not-allowed border border-border bg-surface/50 text-text-secondary/40 line-through'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
          {availableSlots.length === 0 && (
            <p className="text-center text-sm text-text-secondary">Нет свободных слотов на этот день</p>
          )}
        </>
      ) : (
        <p className="text-center text-sm text-text-secondary">Мастер не работает в этот день</p>
      )}
    </div>
  )
}
