import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './nav'
import { cn } from '../../shared/lib/cn'
import { Shield } from 'lucide-react'
import { useAdmin } from '../../shared/lib/useAdmin'

export function AppSidebar() {
  const isAdmin = useAdmin()
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <aside className="hidden w-[320px] shrink-0 flex-col gap-4 rounded-[1.5rem] bg-[#0B1121] p-4 text-white shadow-xl md:flex">
      <div className="flex items-start justify-between gap-3 px-2 pt-2">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white">
            <Shield className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold tracking-wide text-white">
              Общественная безопасность
            </div>
            <div className="truncate text-[11px] font-medium text-slate-400">
              г. Атырау, Казахстан
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="mx-2 flex items-center gap-2 rounded-xl bg-[#1e293b]/50 border border-slate-700/50 px-3 py-2">
          <span className="inline-block size-2 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold text-blue-400">Режим администратора</span>
        </div>
      )}

      <nav className="mt-2 flex flex-col gap-1">
        {visibleItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group rounded-[1rem] border px-3 py-2.5 transition',
                  'border-transparent hover:bg-[#151f38] hover:border-[#1e2a47]',
                  isActive && 'bg-[#151f38] border-[#1e2a47]',
                  !isActive && 'opacity-80 hover:opacity-100'
                )
              }
            >
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-[10px] bg-[#1e2a47]/50 text-blue-400/80 group-hover:text-blue-400 transition">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-medium leading-5 text-slate-200">
                    {item.label}
                  </div>
                  <div className="truncate text-[11px] text-slate-500">
                    {item.description}
                  </div>
                </div>
              </div>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto mx-2 mb-2 rounded-[1rem] bg-[#151f38]/50 p-4 border border-[#1e2a47]">
        <div className="text-xs text-slate-400 leading-relaxed">
          Подсказка: начните с раздела <span className="font-semibold text-white">«Карта»</span> —
          там все слои и районы.
        </div>
      </div>
    </aside>
  )
}

