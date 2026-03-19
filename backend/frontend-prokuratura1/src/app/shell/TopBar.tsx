import { Link, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from './nav'
import { Search } from 'lucide-react'

function useCurrentPageTitle() {
  const location = useLocation()
  const current = NAV_ITEMS.find((i) => i.to === location.pathname)
  return current?.label ?? 'Платформа'
}

export function TopBar() {
  const title = useCurrentPageTitle()

  return (
    <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="truncate text-lg font-semibold leading-6">{title}</div>
        <div className="truncate text-sm text-slate-500">
          Интерактивная карта, аналитика и управление источниками данных
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="hidden w-full max-w-[520px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 md:flex">
          <Search className="size-4 text-slate-500" />
          <input
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
            placeholder="Поиск: район, камера, школа, инцидент… (скоро)"
            disabled
          />
        </div>
        {localStorage.getItem('token') ? (
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('username');
              localStorage.removeItem('is_admin');
              window.location.href = '/';
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Выйти
          </button>
        ) : (
          <Link
            to="/login"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Войти
          </Link>
        )}
        <Link
          to="/help"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Как пользоваться
        </Link>
      </div>
    </header>
  )
}

