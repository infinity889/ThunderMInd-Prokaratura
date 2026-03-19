import { PageShell } from '../_ui/PageShell'

export function DataSourcesPage() {
  return (
    <PageShell
      title="Источники данных"
      subtitle="Ручное управление источниками и правилами загрузки (в демо — заглушка)."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Подключения</div>
          <div className="mt-2 text-sm text-slate-600">
            Здесь будут тумблеры и статусы источников: МВД/учёты, камеры, 2GIS,
            ведомственные реестры, ручной импорт CSV/Excel.
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Правила</div>
          <div className="mt-2 text-sm text-slate-600">
            Настройка соответствия типов, частоты обновления, дедупликации и
            геокодинга адресов.
          </div>
        </section>
      </div>
    </PageShell>
  )
}

