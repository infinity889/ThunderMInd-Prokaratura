import { useMemo, useState } from 'react'
import { PageShell } from '../_ui/PageShell'
import { useLanguage } from '../../shared/lib/LanguageContext'

type ProfileDraft = {
  fullName: string
  username: string
  email: string
  organization: string
  role: string
}

const LS_KEY = 'user_profile'

function loadProfile(): ProfileDraft {
  const username = localStorage.getItem('username') ?? ''
  const raw = localStorage.getItem(LS_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<ProfileDraft>
      return {
        fullName: parsed.fullName ?? '',
        username: parsed.username ?? username,
        email: parsed.email ?? '',
        organization: parsed.organization ?? 'Прокуратура',
        role: parsed.role ?? (localStorage.getItem('is_admin') === 'true' ? 'Администратор' : 'Пользователь'),
      }
    } catch {
      // ignore
    }
  }
  return {
    fullName: '',
    username,
    email: '',
    organization: 'Прокуратура',
    role: localStorage.getItem('is_admin') === 'true' ? 'Администратор' : 'Пользователь',
  }
}

export function ProfilePage() {
  const { t } = useLanguage()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<ProfileDraft>(() => loadProfile())
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const canSave = useMemo(() => {
    return draft.username.trim().length > 0
  }, [draft.username])

  function save() {
    if (!canSave) return
    localStorage.setItem(LS_KEY, JSON.stringify(draft))
    setSavedAt(Date.now())
    setEditing(false)
  }

  function cancel() {
    setDraft(loadProfile())
    setEditing(false)
  }

  return (
    <PageShell
      title={t('profile')}
      subtitle={t('profile_subtitle')}
      right={
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                type="button"
                onClick={cancel}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={!canSave}
                onClick={save}
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {t('save')}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              {t('edit')}
            </button>
          )}
        </div>
      }
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <div className="text-sm font-medium">{t('fio')}</div>
              <input
                value={draft.fullName}
                onChange={(e) => setDraft((p) => ({ ...p, fullName: e.target.value }))}
                disabled={!editing}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none disabled:bg-slate-50"
                placeholder="Иванов Иван Иванович"
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium">{t('username')}</div>
              <input
                value={draft.username}
                onChange={(e) => setDraft((p) => ({ ...p, username: e.target.value }))}
                disabled={!editing}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none disabled:bg-slate-50"
                placeholder="user123"
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium">Email</div>
              <input
                value={draft.email}
                onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
                disabled={!editing}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none disabled:bg-slate-50"
                placeholder="name@example.com"
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium">{t('organization')}</div>
              <input
                value={draft.organization}
                onChange={(e) => setDraft((p) => ({ ...p, organization: e.target.value }))}
                disabled={!editing}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none disabled:bg-slate-50"
                placeholder="Прокуратура"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="text-sm font-medium">{t('role')}</div>
              <input
                value={draft.role}
                onChange={(e) => setDraft((p) => ({ ...p, role: e.target.value }))}
                disabled={!editing}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none disabled:bg-slate-50"
                placeholder="Пользователь"
              />
            </label>
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="font-semibold text-slate-900">Статус</div>
          <div className="mt-2">
            Авторизация: <span className="font-medium">активна</span>
          </div>
          <div className="mt-1">
            Токен: <span className="font-medium">в localStorage</span>
          </div>
          {savedAt ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
              Сохранено: {new Date(savedAt).toLocaleString()}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
              Профиль хранится локально для демо. Позже подключим Django: `GET/PUT /users/me/`.
            </div>
          )}
        </aside>
      </div>
    </PageShell>
  )
}

