import { useEffect, useState } from 'react'
import { useBookingStore } from '@/features/booking/store'
import { useTelegram } from '@/shared/hooks/useTelegram'
import { formatPrice } from '@/shared/lib/format'
import { createBooking, validatePromoCode } from '@/shared/api/endpoints'
import { Button } from '@/shared/ui/Button'

export function ConfirmStep() {
  const service = useBookingStore((s) => s.selectedService)
  const master = useBookingStore((s) => s.selectedMaster)
  const date = useBookingStore((s) => s.selectedDate)
  const time = useBookingStore((s) => s.selectedTime)
  const promoCode = useBookingStore((s) => s.promoCode)
  const discountPercent = useBookingStore((s) => s.discountPercent)
  const isSubmitting = useBookingStore((s) => s.isSubmitting)
  const isSuccess = useBookingStore((s) => s.isSuccess)
  const setSubmitting = useBookingStore((s) => s.setSubmitting)
  const setSuccess = useBookingStore((s) => s.setSuccess)
  const setPromoCode = useBookingStore((s) => s.setPromoCode)
  const setDiscountPercent = useBookingStore((s) => s.setDiscountPercent)
  const reset = useBookingStore((s) => s.reset)
  const { showMainButton, hideMainButton, user } = useTelegram()
  const [error, setError] = useState('')
  const [promoMsg, setPromoMsg] = useState('')
  const [inputCode, setInputCode] = useState(promoCode)

  useEffect(() => {
    const handleConfirm = async () => {
      if (!service || !master || !date || !time) return
      setError('')
      setSubmitting(true)

      let finalPromoCode = promoCode

      const code = inputCode.trim()
      if (code && !promoCode) {
        try {
          const res = await validatePromoCode(code)
          if (res.valid) {
            finalPromoCode = code
            setPromoCode(code)
            setDiscountPercent(res.discount_percent)
          }
        } catch {
          // ignore promo error on confirm
        }
      }

      try {
        await createBooking({
          master_id: master.id,
          service_id: service.id,
          date,
          time,
          client_name: user?.first_name ?? 'Клиент',
          client_phone: '',
          promo_code: finalPromoCode || undefined,
        })
        setSuccess(true)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Ошибка при создании записи'
        setError(msg)
      } finally {
        setSubmitting(false)
      }
    }

    showMainButton('Подтвердить запись', handleConfirm)
    return () => { hideMainButton() }
  }, [service, master, date, time, promoCode, inputCode, showMainButton, hideMainButton, setSubmitting, setSuccess, setPromoCode, setDiscountPercent, user])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  }

  const fullPrice = service?.price ?? 0
  const discountAmount = fullPrice * discountPercent / 100
  const finalPrice = fullPrice - discountAmount

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

      {discountPercent > 0 && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Цена</span>
            <span>{formatPrice(fullPrice)}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Скидка {discountPercent}%</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
          <div className="mt-1 flex justify-between font-semibold">
            <span>Итого</span>
            <span>{formatPrice(finalPrice)}</span>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="text-xs text-text-secondary">Промокод</label>
        <input
          type="text"
          value={inputCode}
          onChange={(e) => { setInputCode(e.target.value); setPromoMsg(''); setError('') }}
          className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          placeholder="Введите промокод и нажмите «Подтвердить запись»"
          disabled={isSubmitting}
        />
        {promoMsg && <p className="mt-1 text-xs text-green-600">{promoMsg}</p>}
      </div>

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