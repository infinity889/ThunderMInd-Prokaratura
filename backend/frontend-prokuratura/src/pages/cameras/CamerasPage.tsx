import { PageShell } from '../_ui/PageShell'

export function CamerasPage() {
  return (
    <PageShell
      title="Видеокамеры"
      subtitle="Расположение камер, статусы и просмотр потока (позже — через backend)."
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        План: список камер + карта, проверка доступности, и кнопка «Открыть
        трансляцию» (будет проксироваться через Django).
      </div>
    </PageShell>
  )
}

