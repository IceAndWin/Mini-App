import { useEffect, useState } from 'react'
import { fetchAllBookings, fetchAdminMasters } from '@/shared/api/endpoints'
import type { AdminBooking, AdminMaster } from '@/shared/api/types'

const statusColors: Record<string, string> = {
  pending: 'text-yellow-600 bg-yellow-50',
  confirmed: 'text-green-600 bg-green-50',
  cancelled: 'text-gray-500 bg-gray-100',
  completed: 'text-blue-600 bg-blue-50',
}

const statusLabels: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждена',
  cancelled: 'Отменена',
  completed: 'Завершена',
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [masters, setMasters] = useState<AdminMaster[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [masterFilter, setMasterFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminMasters().then(setMasters)
  }, [])

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (statusFilter) params.status = statusFilter
    if (masterFilter) params.master_id = masterFilter
    fetchAllBookings(params).then((data) => { setBookings(data); setLoading(false) })
  }, [statusFilter, masterFilter])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Записи</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none"
        >
          <option value="">Все статусы</option>
          <option value="pending">Ожидает</option>
          <option value="confirmed">Подтверждена</option>
          <option value="cancelled">Отменена</option>
          <option value="completed">Завершена</option>
        </select>
        <select
          value={masterFilter}
          onChange={(e) => setMasterFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none"
        >
          <option value="">Все мастера</option>
          {masters.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-gray-50 text-xs uppercase text-text-secondary">
            <tr>
              <th className="px-4 py-3">Клиент</th>
              <th className="px-4 py-3">Услуга</th>
              <th className="px-4 py-3">Мастер</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Время</th>
              <th className="px-4 py-3">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-secondary">Загрузка...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-secondary">Нет записей</td></tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.client_name}</div>
                    <div className="text-xs text-text-secondary">{b.client_phone}</div>
                  </td>
                  <td className="px-4 py-3">{b.service.name}</td>
                  <td className="px-4 py-3">{b.master.name}</td>
                  <td className="px-4 py-3">{b.date}</td>
                  <td className="px-4 py-3">{b.time}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[b.status] ?? ''}`}>
                      {statusLabels[b.status] ?? b.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
