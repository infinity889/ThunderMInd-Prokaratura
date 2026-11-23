import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validation = useMemo(() => {
    const issues: string[] = []
    if (!fullName.trim()) issues.push('Введите ФИО')
    if (!email.trim()) issues.push('Введите email')
    else if (!isEmail(email.trim())) issues.push('Проверьте формат email')
    if (!password) issues.push('Введите пароль')
    else if (password.length < 8) issues.push('Пароль должен быть минимум 8 символов')
    if (password2 !== password) issues.push('Пароли не совпадают')
    return issues
  }, [email, fullName, password, password2])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    setError(null)
    if (validation.length) return

    setLoading(true)
    try {
      // TODO: подключить Django: POST /auth/register
      await new Promise((r) => setTimeout(r, 600))
      navigate('/login')
    } catch {
      setError('Не удалось зарегистрироваться. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="text-xl font-semibold">Регистрация</div>
      <div className="mt-1 text-sm text-slate-500">
        Создайте аккаунт для доступа к платформе общественной безопасности.
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block">
          <div className="text-sm font-medium">ФИО</div>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => setTouched(true)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            placeholder="Например: Иванов Иван Иванович"
            autoComplete="name"
          />
        </label>

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
            placeholder="Минимум 8 символов"
            autoComplete="new-password"
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Повторите пароль</div>
          <input
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            onBlur={() => setTouched(true)}
            type="password"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            placeholder="••••••••"
            autoComplete="new-password"
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
          {loading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </button>

        <div className="text-sm text-slate-600">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-medium text-slate-900 underline underline-offset-4">
            Войти
          </Link>
        </div>
      </form>
    </div>
  )
}

