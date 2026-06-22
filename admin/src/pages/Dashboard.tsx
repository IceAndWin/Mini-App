import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { fetchStatsBookings, fetchStatsTopServices, fetchStatsMasterLoad, fetchStatsClients, fetchStatsTotal } from '@/shared/api/endpoints'
import type { StatsBookings, StatsClients, StatsMasterLoad, StatsTopServices, StatsTotal } from '@/shared/api/types'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16']

export default function Dashboard() {
  const [bookings, setBookings] = useState<StatsBookings | null>(null)
  const [topServices, setTopServices] = useState<StatsTopServices | null>(null)
  const [masterLoad, setMasterLoad] = useState<StatsMasterLoad | null>(null)
  const [clients, setClients] = useState<StatsClients | null>(null)
  const [total, setTotal] = useState<StatsTotal | null>(null)
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    fetchStatsBookings(period).then(setBookings)
    fetchStatsTopServices().then(setTopServices)
    fetchStatsMasterLoad().then(setMasterLoad)
    fetchStatsClients().then(setClients)
    fetchStatsTotal().then(setTotal)
  }, [period])

  const bookingsChartData = bookings?.labels.map((l, i) => ({ date: l.slice(5), count: bookings.values[i] })) ?? []
  const servicesPieData = topServices?.labels.map((l, i) => ({ name: l, value: topServices.values[i] })) ?? []
  const masterBarData = masterLoad?.labels.map((l, i) => ({ name: l, bookings: masterLoad.values[i] })) ?? []

  const StatCard = ({ label, value }: { label: string; value: string | number }) => (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Дашборд</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Всего записей" value={total?.total_bookings ?? 0} />
        <StatCard label="Мастеров" value={total?.total_masters ?? 0} />
        <StatCard label="Услуг" value={total?.total_services ?? 0} />
        <StatCard label="Пользователей" value={total?.total_users ?? 0} />
      </div>

      {/* Bookings chart */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Динамика записей</h3>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none"
          >
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={bookingsChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top services */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-4 font-semibold">ТОП-услуг</h3>
          {servicesPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={servicesPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name }) => name}>
                  {servicesPieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length] ?? '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-text-secondary">Нет данных</p>}
        </div>

        {/* Master load */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-4 font-semibold">Загрузка мастеров (30 дней)</h3>
          {masterBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={masterBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-text-secondary">Нет данных</p>}
        </div>
      </div>

      {/* Clients */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 font-semibold">Клиенты</h3>
        <div className="flex gap-8">
          <div>
            <p className="text-sm text-text-secondary">Новые</p>
            <p className="text-2xl font-bold text-blue-500">{clients?.new_clients ?? 0}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Повторные</p>
            <p className="text-2xl font-bold text-green-500">{clients?.returning_clients ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
