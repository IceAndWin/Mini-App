import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCategories, useServices } from '@/features/services/hooks'
import { AnimatedPage } from '@/shared/ui/AnimatedPage'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { formatPrice } from '@/shared/lib/format'

export default function ServicesPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { data: services, isLoading } = useServices(
    activeCategory ? { category: activeCategory, search: search || undefined } 
                  : { search: search || undefined }
  )
  const { data: categories } = useCategories()

  return (
    <AnimatedPage>
      <div className="relative mb-4">
        <input
          type="search"
          placeholder="Поиск услуг..."
          value={search}
          onChange={(e) => { setSearch(e.target.value) }}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 pl-10 text-sm outline-none transition-colors placeholder:text-text-secondary focus:border-primary"
        />
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {categories && categories.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => { setActiveCategory(null) }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === null
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary hover:bg-border'
            }`}
          >
            Все
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat) }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary hover:bg-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-4">
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="mb-1 h-3 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : services && services.length > 0 ? (
        <div className="space-y-3">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex-1">
                <h3 className="font-medium text-sm">{service.name}</h3>
                <p className="mt-0.5 text-xs text-text-secondary">{service.duration} мин</p>
                {service.category && (
                  <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {service.category}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{formatPrice(service.price)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Услуги не найдены"
          description={search ? `По запросу "${search}" ничего не найдено` : 'Список услуг пока пуст'}
        />
      )}
    </AnimatedPage>
  )
}
