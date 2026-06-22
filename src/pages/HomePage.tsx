import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useServices } from '@/features/services/hooks'
import { AnimatedPage } from '@/shared/ui/AnimatedPage'
import { Button } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'
import { formatPrice } from '@/shared/lib/format'

export default function HomePage() {
  const { data: services, isLoading } = useServices()

  return (
    <AnimatedPage>
      <section className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-hover px-6 py-10 text-white">
        <div className="relative z-10">
          <p className="mb-1 text-sm opacity-80">Добро пожаловать</p>
          <h1 className="text-2xl font-bold leading-tight">
            Записывайтесь <br />к лучшим мастерам
          </h1>
          <p className="mt-2 text-sm opacity-80">Удобная онлайн-запись 24/7</p>
          <Link to="/services">
            <Button variant="secondary" size="sm" className="mt-4 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
              Записаться
            </Button>
          </Link>
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Популярные услуги</h2>
          <Link to="/services" className="text-sm text-primary">Все</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-surface p-4">
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {services?.slice(0, 4).map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="cursor-pointer rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
              >
                <h3 className="font-medium text-sm leading-tight">{service.name}</h3>
                <p className="mt-1 text-xs text-text-secondary">{service.duration} мин</p>
                <p className="mt-2 font-semibold text-sm text-primary">{formatPrice(service.price)}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Быстрый переход</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link to="/services" className="flex flex-col items-center gap-2 rounded-xl bg-surface p-4 transition-colors hover:bg-border">
            <span className="text-2xl">💇</span>
            <span className="text-xs font-medium">Услуги</span>
          </Link>
          <Link to="/masters" className="flex flex-col items-center gap-2 rounded-xl bg-surface p-4 transition-colors hover:bg-border">
            <span className="text-2xl">👨‍🎤</span>
            <span className="text-xs font-medium">Мастера</span>
          </Link>
          <Link to="/booking" className="flex flex-col items-center gap-2 rounded-xl bg-surface p-4 transition-colors hover:bg-border">
            <span className="text-2xl">📅</span>
            <span className="text-xs font-medium">Запись</span>
          </Link>
        </div>
      </section>
    </AnimatedPage>
  )
}
