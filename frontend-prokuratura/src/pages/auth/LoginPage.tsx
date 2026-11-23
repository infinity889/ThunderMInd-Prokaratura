import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validation = useMemo(() => {
    const issues: string[] = []
    if (!email.trim()) issues.push('Введите email')
    else if (!isEmail(email.trim())) issues.push('Проверьте формат email')
    if (!password) issues.push('Введите пароль')
    return issues
  }, [email, password])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    setError(null)
    if (validation.length) return

    setLoading(true)
    try {
      // TODO: подключить Django: POST /auth/login
      await new Promise((r) => setTimeout(r, 450))
      navigate('/map')
    } catch {
      setError('Не удалось войти. Проверьте данные и попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="text-xl font-semibold">Вход</div>
      <div className="mt-1 text-sm text-slate-500">
        Войдите, чтобы управлять слоями, источниками и аналитикой.
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block">
          <div className="text-sm font-medium">Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            placeholder="name@example.com"
            autoComplete="email"
            inputMode="email"
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Пароль</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched(true)}
            type="password"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
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
          className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? 'Входим…' : 'Войти'}
        </button>

        <div className="text-sm text-slate-600">
          Нет аккаунта?{' '}
          <Link to="/register" className="font-medium text-slate-900 underline underline-offset-4">
            Зарегистрироваться
          </Link>
        </div>
      </form>
    </div>
  )
}

