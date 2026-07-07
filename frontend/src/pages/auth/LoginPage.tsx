import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../shared/lib/LanguageContext'
import { apiFetch } from '../../shared/api/apiClient'

export function LoginPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validation = useMemo(() => {
    const issues: string[] = []
    if (!username.trim()) issues.push(t('enter_username'))
    if (!password) issues.push(t('password'))
    return issues
  }, [username, password, t])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    setError(null)
    if (validation.length) return

    setLoading(true)
    try {
      const data = await apiFetch<any>('/users/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      localStorage.setItem('is_admin', data.is_admin ? 'true' : 'false')
      navigate('/map')
    } catch {
      setError(t('error_login'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="text-2xl font-bold">{t('login')}</div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <div className="text-sm font-medium text-slate-700">{t('username')}</div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setTouched(true)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder={t('username')}
            autoComplete="username"
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium text-slate-700">{t('password')}</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched(true)}
            type="password"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        {touched && validation.length ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <ul className="list-disc pl-5">
              {validation.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors"
        >
          {loading ? t('loading') : t('btn_login')}
        </button>

        <div className="text-sm text-slate-600 text-center mt-4 pt-4 border-t border-slate-100">
          {t('no_account')}{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
            {t('btn_register')}
          </Link>
        </div>
      </form>
    </div>
  )
}
