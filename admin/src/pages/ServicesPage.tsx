import { useEffect, useState } from 'react'
import { fetchAdminServices, createAdminService, updateAdminService, deleteAdminService } from '@/shared/api/endpoints'
import type { AdminService } from '@/shared/api/types'

function ServiceModal({
  service,
  onClose,
  onSave,
}: {
  service?: AdminService | null
  onClose: () => void
  onSave: () => void
}) {
  const [name, setName] = useState(service?.name ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [duration, setDuration] = useState(service?.duration ?? 30)
  const [price, setPrice] = useState(service?.price ?? 0)
  const [category, setCategory] = useState(service?.category ?? '')
  const [isActive, setIsActive] = useState(service?.is_active ?? true)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const body = { name, description: description || null, duration, price, category: category || null, is_active: isActive }
      if (service) {
        await updateAdminService(service.id, body)
      } else {
        await createAdminService(body)
      }
      onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">{service ? 'Редактировать' : 'Добавить'} услугу</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Название</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Описание</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">Длительность (мин)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={5} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">Цена (₽)</label>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} min={0} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Категория</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Активна
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 text-sm hover:bg-gray-50">Отмена</button>
          <button onClick={handleSubmit} disabled={!name || saving} className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:brightness-110 disabled:opacity-50">
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const [services, setServices] = useState<AdminService[]>([])
  const [editItem, setEditItem] = useState<AdminService | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetchAdminServices().then((data) => { setServices(data); setLoading(false) })
  }

  useEffect(load, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить услугу?')) return
    await deleteAdminService(id)
    load()
  }

  const closeModal = () => { setEditItem(null); setShowCreate(false) }
  const saved = () => { closeModal(); load() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Услуги</h2>
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110">
          + Добавить
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-gray-50 text-xs uppercase text-text-secondary">
            <tr>
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Категория</th>
              <th className="px-4 py-3">Длит.</th>
              <th className="px-4 py-3">Цена</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-secondary">Загрузка...</td></tr>
            ) : services.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-secondary">Нет услуг</td></tr>
            ) : (
              services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{s.category ?? '—'}</td>
                  <td className="px-4 py-3">{s.duration} мин</td>
                  <td className="px-4 py-3">{s.price.toLocaleString('ru-RU')} ₽</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${s.is_active ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                      {s.is_active ? 'Активна' : 'Неактивна'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditItem(s)} className="text-sm text-primary hover:underline">Ред.</button>
                      <button onClick={() => handleDelete(s.id)} className="text-sm text-red-500 hover:underline">Удал.</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(editItem || showCreate) && (
        <ServiceModal service={editItem} onClose={closeModal} onSave={saved} />
      )}
    </div>
  )
}
