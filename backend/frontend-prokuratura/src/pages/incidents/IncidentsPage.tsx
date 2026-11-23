import { PageShell } from '../_ui/PageShell'

export function IncidentsPage() {
  return (
    <PageShell
      title="Инциденты"
      subtitle="Преступления и административные правонарушения (в демо — мок‑данные)."
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Скоро здесь будет таблица с фильтрами (район, тип, дата, статус), быстрый
        переход на карту и карточка инцидента.
      </div>
    </PageShell>
  )
}

