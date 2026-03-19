import { PageShell } from '../_ui/PageShell'

export function HelpPage() {
  return (
    <PageShell
      title="Помощь"
      subtitle="Короткая инструкция — чтобы не возникало вопросов «куда нажимать»."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">1) Начните с «Карты»</div>
          <div className="mt-2 text-sm text-slate-600">
            Включайте слои (инциденты, камеры, социальные объекты) и кликайте по
            районам, чтобы увидеть сводку.
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">2) «Источники данных»</div>
          <div className="mt-2 text-sm text-slate-600">
            Здесь вручную подключаются/отключаются источники и задаются правила
            загрузки. В демо пока используются мок‑данные.
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">3) «Аналитика»</div>
          <div className="mt-2 text-sm text-slate-600">
            Еженедельный AI‑анализ формирует рейтинг районов по опасности и
            выявляет повторяющиеся типы правонарушений.
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">4) Уведомления</div>
          <div className="mt-2 text-sm text-slate-600">
            По результатам анализа система будет отправлять автоматические
            уведомления о систематических инцидентах. На фронтенде мы подготовим
            UX под это.
          </div>
        </section>
      </div>
    </PageShell>
  )
}

