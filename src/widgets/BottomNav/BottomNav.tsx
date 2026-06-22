import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Главная', icon: '🏠' },
  { to: '/services', label: 'Услуги', icon: '💇' },
  { to: '/booking', label: 'Запись', icon: '📅' },
  { to: '/profile', label: 'Профиль', icon: '👤' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface">
      <div className="mx-auto flex max-w-lg justify-around">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-text-secondary'
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
