import { Link, useLocation, useNavigate } from 'react-router-dom'
import { NAV_ITEMS } from './nav'
import { Search } from 'lucide-react'
import { useState } from 'react'

function useCurrentPageTitle() {
  const location = useLocation()
  const current = NAV_ITEMS.find((i) => i.to === location.pathname)
  return current?.label ?? 'Платформа'
}

export function TopBar() {
  const title = useCurrentPageTitle()
  const username = localStorage.getItem('username') ?? ''
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function submitSearch() {
    const q = query.trim()
    if (!q) return
    navigate(`/map?search=${encodeURIComponent(q)}`)
  }

  return (
    <header className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-800" />
      
      <div className="min-w-0 pt-1">
        <div className="truncate text-lg font-bold tracking-tight text-slate-900 leading-6">{title}</div>
        <div className="truncate text-sm font-medium text-slate-500">
          Интерактивная карта, аналитика и управление источниками данных
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 pt-1">
        <div className="hidden w-full max-w-[520px] items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] md:flex">
          <Search className="size-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submitSearch()
              }
            }}
            className="w-full bg-transparent font-medium outline-none placeholder:text-slate-400"
            placeholder="Поиск: район, камера, школа, инцидент…"
          />
        </div>
        {localStorage.getItem('token') ? (
          <>
            <Link
              to="/profile"
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 md:inline-flex"
              title="Профиль"
            >
              {username ? `Профиль: ${username}` : 'Профиль'}
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('username')
                localStorage.removeItem('is_admin')
                window.location.href = '/'
              }}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800"
            >
              Выйти
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
          >
            Войти
          </Link>
        )}
        <Link
          to="/help"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          Как пользоваться
        </Link>
      </div>
    </header>
  )
}

