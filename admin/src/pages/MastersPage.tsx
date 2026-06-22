import { useEffect, useState } from 'react'
import { fetchAdminMasters, createAdminMaster, updateAdminMaster, deleteAdminMaster, uploadMasterPhoto } from '@/shared/api/endpoints'
import type { AdminMaster } from '@/shared/api/types'

function MasterModal({
  master,
  onClose,
  onSave,
}: {
  master?: AdminMaster | null
  onClose: () => void
  onSave: () => void
}) {
  const [name, setName] = useState(master?.name ?? '')
  const [bio, setBio] = useState(master?.bio ?? '')
  const [isActive, setIsActive] = useState(master?.is_active ?? true)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setSaving(true)
    try {
      if (master) {
        await updateAdminMaster(master.id, { name, bio, is_active: isActive })
        if (photoFile) {
          await uploadMasterPhoto(master.id, photoFile)
        }
      } else {
        const created = await createAdminMaster({ name, bio, is_active: isActive })
        if (photoFile && created?.id) {
          await uploadMasterPhoto(created.id, photoFile)
        }
      }
      onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">{master ? 'Редактировать' : 'Добавить'} мастера</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Имя</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Описание</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Фото</label>
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} className="w-full text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Активен
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

export default function MastersPage() {
  const [masters, setMasters] = useState<AdminMaster[]>([])
  const [editItem, setEditItem] = useState<AdminMaster | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetchAdminMasters().then((data) => { setMasters(data); setLoading(false) })
  }

  useEffect(load, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить мастера?')) return
    await deleteAdminMaster(id)
    load()
  }

  const closeModal = () => { setEditItem(null); setShowCreate(false) }
  const saved = () => { closeModal(); load() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Мастера</h2>
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110">
          + Добавить
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-gray-50 text-xs uppercase text-text-secondary">
            <tr>
              <th className="px-4 py-3">Имя</th>
              <th className="px-4 py-3">Рейтинг</th>
              <th className="px-4 py-3">Отзывы</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-text-secondary">Загрузка...</td></tr>
            ) : masters.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-text-secondary">Нет мастеров</td></tr>
            ) : (
              masters.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {m.avatar_url ? (
                        <img src={`http://127.0.0.1:8000${m.avatar_url}`} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{m.rating.toFixed(1)}</td>
                  <td className="px-4 py-3">{m.reviews_count}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${m.is_active ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                      {m.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditItem(m)} className="text-sm text-primary hover:underline">Ред.</button>
                      <button onClick={() => handleDelete(m.id)} className="text-sm text-red-500 hover:underline">Удал.</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(editItem || showCreate) && (
        <MasterModal master={editItem} onClose={closeModal} onSave={saved} />
      )}
    </div>
  )
}
