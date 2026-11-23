import { PageShell } from '../_ui/PageShell'

export function ObjectsPage() {
  return (
    <PageShell
      title="Социальные объекты"
      subtitle="Школы, детские сады, больницы и другие важные объекты."
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Здесь будет каталог объектов с категориями, карточками и привязкой к
        районам.
      </div>
    </PageShell>
  )
}

