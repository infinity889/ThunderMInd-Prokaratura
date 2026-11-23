import { PageShell } from '../_ui/PageShell'

export function SettingsPage() {
  return (
    <PageShell
      title="Настройки"
      subtitle="Город, отображение слоёв и предпочтения уведомлений."
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Тут будут настройки: выбранный город/регион, провайдер карты (Google/Yandex/2GIS/Apple),
        роли пользователя и каналы уведомлений.
      </div>
    </PageShell>
  )
}

