import { useEffect, useState } from 'react'
import { PageShell } from '../_ui/PageShell'
import { useAdmin } from '../../shared/lib/useAdmin'
import { apiFetch } from '../../shared/api/apiClient'
import { useNavigate } from 'react-router-dom'

type UserRecord = {
  id: number
  username: string
  email: string
  is_admin: boolean
  is_staff: boolean
  is_superuser: boolean
  date_joined: string
}

export function AdminPanelPage() {
  const isAdmin = useAdmin()
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      navigate('/map')
      return
    }
    fetchUsers()
  }, [isAdmin, navigate])

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<UserRecord[]>('/users/list/')
      setUsers(data)
    } catch {
      setError('Не удалось загрузить список пользователей')
    } finally {
      setLoading(false)
    }
  }

  async function toggleAdmin(userId: number, currentStatus: boolean) {
    setActionLoading(userId)
    try {
      const result = await apiFetch<{ id: number; username: string; is_admin: boolean }>(
        `/users/${userId}/toggle-admin/`,
        {
          method: 'POST',
          body: JSON.stringify({ is_admin: !currentStatus }),
        }
      )
      setUsers((prev) =>
        prev.map((u) => (u.id === result.id ? { ...u, is_admin: result.is_admin } : u))
      )
    } catch {
      alert('Ошибка при изменении статуса')
    } finally {
      setActionLoading(null)
    }
  }

  async function deleteUser(userId: number, username: string) {
    if (!confirm(`Вы уверены, что хотите удалить пользователя "${username}"?`)) return
    setActionLoading(userId)
    try {
      await apiFetch(`/users/${userId}/delete/`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch {
      alert('Ошибка при удалении пользователя')
    } finally {
      setActionLoading(null)
    }
  }

  const currentUsername = localStorage.getItem('username')

  if (!isAdmin) return null

  return (
    <PageShell
      title="Панель администратора"
      subtitle="Управление зарегистрированными пользователями: назначение и снятие админ-прав, удаление аккаунтов."
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
            <svg
              className="size-5 animate-spin text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm text-slate-600">Загрузка пользователей…</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
          <button
            onClick={fetchUsers}
            className="ml-3 rounded-xl bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
          >
            Повторить
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Stats bar */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Всего пользователей</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{users.length}</div>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
              <div className="text-xs text-indigo-600">Администраторы</div>
              <div className="mt-1 text-2xl font-bold text-indigo-700">
                {users.filter((u) => u.is_admin || u.is_staff || u.is_superuser).length}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Обычные пользователи</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {users.filter((u) => !u.is_admin && !u.is_staff && !u.is_superuser).length}
              </div>
            </div>
          </div>

          {/* Users table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-600">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Имя пользователя</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Дата регистрации</th>
                  <th className="px-4 py-3 text-center">Админ</th>
                  <th className="px-4 py-3 text-center">Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.username === currentUsername
                  const isUserAdmin = user.is_admin || user.is_staff || user.is_superuser
                  const isLoading = actionLoading === user.id
                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-slate-100 text-sm transition-colors ${
                        isSelf ? 'bg-indigo-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-500">{user.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {user.username}
                        {isSelf && (
                          <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                            Вы
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{user.email || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {new Date(user.date_joined).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          disabled={isSelf || isLoading}
                          onClick={() => toggleAdmin(user.id, user.is_admin)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                            isUserAdmin ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                          title={isSelf ? 'Нельзя изменить свой статус' : (isUserAdmin ? 'Снять админ' : 'Сделать админом')}
                        >
                          <span
                            className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${
                              isUserAdmin ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          disabled={isSelf || isLoading}
                          onClick={() => deleteUser(user.id, user.username)}
                          className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                          title={isSelf ? 'Нельзя удалить себя' : 'Удалить'}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            💡 Вы не можете изменить свой статус админа или удалить свой аккаунт через эту панель.
            Используйте Django Admin-панель (<code>/admin/</code>) для дополнительного управления.
          </div>
        </div>
      )}
    </PageShell>
  )
}
