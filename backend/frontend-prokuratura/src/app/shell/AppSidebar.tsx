import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './nav'
import { cn } from '../../shared/lib/cn'
import { Shield } from 'lucide-react'

export function AppSidebar() {
  return (
    <aside className="hidden w-[320px] shrink-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-slate-900 text-white">
            <Shield className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold leading-5">
              Общественная безопасность
            </div>
            <div className="truncate text-xs text-slate-500">
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
                  'group rounded-xl border px-3 py-2 transition',
                  'border-transparent hover:bg-slate-50 hover:border-slate-200',
                  isActive && 'bg-slate-50 border-slate-200',
                )
              }
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-white">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium leading-5">
                    {item.label}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {item.description}
                  </div>
                </div>
              </div>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
        Подсказка: начните с раздела <span className="font-semibold">«Карта»</span> —
        там все слои и районы.
      </div>
    </aside>
  )
}

