import { PageShell } from '../_ui/PageShell'

export function AnalyticsPage() {
  return (
    <PageShell
      title="Аналитика"
      subtitle="Еженедельный AI‑анализ: рейтинг районов, тренды, повторяемость правонарушений."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Рейтинг районов (скоро)</div>
          <div className="mt-2 text-sm text-slate-600">
            Таблица/график: район → индекс опасности → факторы (кражи, хулиганство,
            избиения…).
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Уведомления (скоро)</div>
          <div className="mt-2 text-sm text-slate-600">
            Авто‑оповещения о систематических инцидентах и “пояснение модели”: что
            повлияло на рост риска.
          </div>
        </section>
      </div>
    </PageShell>
  )
}

