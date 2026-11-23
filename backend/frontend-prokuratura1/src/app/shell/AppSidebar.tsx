import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './nav'
import { cn } from '../../shared/lib/cn'
import { Shield } from 'lucide-react'

export function AppSidebar() {
  return (
    <aside className="hidden w-[320px] shrink-0 flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg md:flex text-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white shadow-inner">
            <Shield className="size-5" />
          </div>
          <div className="min-w-0 text-white">
            <div className="truncate text-sm font-semibold leading-5">
              Общественная безопасность
            </div>
            <div className="truncate text-xs text-blue-200/60">
              г. Атырау, Казахстан
            </div>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group rounded-xl border px-3 py-2 transition-all',
                  'border-transparent hover:bg-slate-800 hover:text-white',
                  isActive ? 'bg-slate-800 border-slate-700 text-white shadow-sm' : 'text-slate-300',
                )
              }
            >
              {({ isActive }) => (
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 grid size-9 place-items-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white',
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium leading-5">
                      {item.label}
                    </div>
                    <div className={cn('truncate text-xs transition-colors', isActive ? 'text-blue-200/70' : 'text-slate-500 group-hover:text-slate-400')}>
                      {item.description}
                    </div>
                  </div>
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto rounded-xl bg-blue-950/40 border border-blue-900/50 p-3 text-xs text-blue-200/80">
        Подсказка: начните с раздела <span className="font-semibold text-white">«Карта»</span> —
        там все слои и районы.
      </div>
    </aside>
  )
}

