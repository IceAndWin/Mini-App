import { useState } from 'react'
import { AnimatedPage } from '@/shared/ui/AnimatedPage'
import { Button } from '@/shared/ui/Button'
import { Skeleton, ListSkeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useTelegram } from '@/shared/hooks/useTelegram'
import { useMyBookings, useMe, useCancelBooking, useRescheduleBooking } from '@/features/bookings/hooks'
import { formatPrice } from '@/shared/lib/format'
import type { ApiBookingFull } from '@/shared/api/types'

type Tab = 'active' | 'history'

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Ожидает подтверждения',
    confirmed: 'Подтверждено',
    cancelled: 'Отменено',
    completed: 'Завершено',
  }
  return labels[status] ?? status
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-500',
    confirmed: 'text-green-500',
    cancelled: 'text-text-secondary',
    completed: 'text-text-secondary',
  }
  return colors[status] ?? 'text-text-secondary'
}

function BookingCard({
  booking,
  onCancel,
  onReschedule,
}: {
  booking: ApiBookingFull
  onCancel: () => void
  onReschedule: () => void
}) {
  const isActive = booking.status === 'pending' || booking.status === 'confirmed'

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="font-semibold text-text-primary">{booking.service.name}</p>
          <p className="text-sm text-text-secondary">{booking.master.name}</p>
        </div>
        <span className={`whitespace-nowrap text-xs font-medium ${getStatusColor(booking.status)}`}>
          {getStatusLabel(booking.status)}
        </span>
      </div>
      <div className="mb-3 flex items-center gap-4 text-sm text-text-secondary">
        <span>{booking.date}</span>
        <span>{booking.time}</span>
        <span>{formatPrice(booking.service.price)}</span>
      </div>
      {isActive && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onReschedule}>
            Перенести
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={onCancel}>
            Отменить
          </Button>
        </div>
      )}
    </div>
  )
}

function CancelModal({ booking, onClose }: { booking: ApiBookingFull; onClose: () => void }) {
  const cancelMutation = useCancelBooking()

  const handleCancel = () => {
    cancelMutation.mutate(booking.id, {
      onSuccess: () => { onClose() },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 pb-8 sm:items-center sm:pb-0">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6">
        <h3 className="mb-2 text-lg font-semibold">Отменить запись?</h3>
        <p className="mb-6 text-sm text-text-secondary">
          {booking.service.name} — {booking.date} в {booking.time}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Назад
          </Button>
          <Button variant="primary" className="flex-1" loading={cancelMutation.isPending} onClick={handleCancel}>
            Отменить
          </Button>
        </div>
      </div>
    </div>
  )
}

function RescheduleModal({ booking, onClose }: { booking: ApiBookingFull; onClose: () => void }) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const rescheduleMutation = useRescheduleBooking()

  const handleReschedule = () => {
    if (!selectedDate || !selectedTime) return
    rescheduleMutation.mutate(
      { bookingId: booking.id, date: selectedDate, time: selectedTime },
      { onSuccess: () => { onClose() } },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 pb-8 sm:items-center sm:pb-0">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6">
        <h3 className="mb-4 text-lg font-semibold">Перенести запись</h3>
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-text-secondary">Новая дата</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value) }}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary outline-none focus:border-primary"
          />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-text-secondary">Новое время</label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => { setSelectedTime(e.target.value) }}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Назад
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            disabled={!selectedDate || !selectedTime}
            loading={rescheduleMutation.isPending}
            onClick={handleReschedule}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>('active')
  const [cancelBookingItem, setCancelBookingItem] = useState<ApiBookingFull | null>(null)
  const [rescheduleBookingItem, setRescheduleBookingItem] = useState<ApiBookingFull | null>(null)

  const { user: tgUser } = useTelegram()
  const { data: userData, isLoading: userLoading } = useMe()
  const { data: bookings, isLoading: bookingsLoading } = useMyBookings()

  const activeBookings = bookings?.filter((b) => b.status === 'pending' || b.status === 'confirmed') ?? []
  const historyBookings = bookings?.filter((b) => b.status === 'cancelled' || b.status === 'completed') ?? []
  const currentList = tab === 'active' ? activeBookings : historyBookings

  return (
    <AnimatedPage>
      {/* Profile card */}
      <div className="mb-6 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {tgUser?.first_name.charAt(0) ?? '?'}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-text-primary">
              {tgUser?.first_name ?? (userLoading ? <Skeleton className="w-32" /> : 'Пользователь')}
            </h2>
            <p className="text-sm text-text-secondary">
              {tgUser?.username ? `@${tgUser.username}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Bonus & Promo */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary mb-0.5">Бонусы</p>
          <p className="text-2xl font-bold text-text-primary">
            {userLoading ? <Skeleton className="w-16 h-8" /> : String(userData?.bonus_points ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary mb-0.5">Промокод</p>
          <input
            type="text"
            placeholder="Введите код"
            maxLength={64}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-primary"
          />
        </div>
      </div>

      {/* Bookings tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-surface p-1">
        <button
          onClick={() => { setTab('active') }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === 'active' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Активные {activeBookings.length > 0 && `(${String(activeBookings.length)})`}
        </button>
        <button
          onClick={() => { setTab('history') }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === 'history' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          История {historyBookings.length > 0 && `(${String(historyBookings.length)})`}
        </button>
      </div>

      {/* Bookings list */}
      {bookingsLoading ? (
        <ListSkeleton count={3} />
      ) : currentList.length === 0 ? (
        <EmptyState
          title={tab === 'active' ? 'Нет активных записей' : 'История пуста'}
          description={tab === 'active' ? 'Запишитесь на услугу, чтобы она появилась здесь' : 'Завершённые записи появятся здесь'}
        />
      ) : (
        <div className="space-y-3">
          {currentList.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={() => { setCancelBookingItem(booking) }}
              onReschedule={() => { setRescheduleBookingItem(booking) }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {cancelBookingItem && (
        <CancelModal booking={cancelBookingItem} onClose={() => { setCancelBookingItem(null) }} />
      )}
      {rescheduleBookingItem && (
        <RescheduleModal booking={rescheduleBookingItem} onClose={() => { setRescheduleBookingItem(null) }} />
      )}
    </AnimatedPage>
  )
}
