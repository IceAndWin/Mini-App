import { useEffect, useState } from 'react'
import { useBookingStore } from '@/features/booking/store'
import { useTelegram } from '@/shared/hooks/useTelegram'
import { formatPrice } from '@/shared/lib/format'
import { createBooking } from '@/shared/api/endpoints'
import { Button } from '@/shared/ui/Button'

export function ConfirmStep() {
  const service = useBookingStore((s) => s.selectedService)
  const master = useBookingStore((s) => s.selectedMaster)
  const date = useBookingStore((s) => s.selectedDate)
  const time = useBookingStore((s) => s.selectedTime)
  const isSubmitting = useBookingStore((s) => s.isSubmitting)
  const isSuccess = useBookingStore((s) => s.isSuccess)
  const setSubmitting = useBookingStore((s) => s.setSubmitting)
  const setSuccess = useBookingStore((s) => s.setSuccess)
  const reset = useBookingStore((s) => s.reset)
  const { showMainButton, hideMainButton, user } = useTelegram()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleConfirm = async () => {
      if (!service || !master || !date || !time) return
      setError('')
      setSubmitting(true)
      try {
        await createBooking({
          master_id: master.id,
          service_id: service.id,
          date,
          time,
          client_name: user?.first_name ?? 'Клиент',
          client_phone: '',
        })
        setSuccess(true)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Ошибка при создании записи'
        setError(msg)
      } finally {
        setSubmitting(false)
      }
    }

    showMainButton('Подтвердить запись', () => { void handleConfirm() })
    return () => { hideMainButton() }
  }, [service, master, date, time, showMainButton, hideMainButton, setSubmitting, setSuccess, user])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h2 className="text-xl font-bold">Запись подтверждена!</h2>
        <p className="mt-2 text-sm text-text-secondary">Мы напомним вам за час до записи</p>
        <Button className="mt-8" onClick={reset}>На главную</Button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Подтверждение</h2>
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Услуга</p>
          <p className="mt-0.5 font-medium">{service?.name}</p>
          <p className="text-xs text-text-secondary">
            {service?.duration} мин · {service ? formatPrice(service.price) : ''}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Мастер</p>
          <p className="mt-0.5 font-medium">{master?.name}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Дата и время</p>
          <p className="mt-0.5 font-medium">
            {date ? formatDate(date) : ''} в {time}
          </p>
        </div>
      </div>
      {isSubmitting && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-text-secondary">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Оформляем запись...
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}
