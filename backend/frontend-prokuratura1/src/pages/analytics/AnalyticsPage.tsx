import { useState, useRef } from 'react'
import { PageShell } from '../_ui/PageShell'
import { apiFetch } from '../../shared/api/apiClient'
import { FileUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function AnalyticsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      await apiFetch<any>('/map-data/upload-excel/', {
        method: 'POST',
        body: formData,
      })
      setResult({ status: 'success', message: 'Данные успешно обработаны AI и добавлены на карту.' })
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      setResult({ status: 'error', message: err.message || 'Ошибка загрузки файла' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <PageShell
      title="Аналитика"
      subtitle="Еженедельный AI‑анализ: рейтинг районов, тренды, повторяемость правонарушений."
    >
      <div className="grid gap-6 md:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <FileUp className="size-5 text-indigo-500" />
              Загрузка данных (Excel)
            </h3>
            <p className="text-[13px] text-slate-500 mb-4">
              Загрузите Excel файл со списком инцидентов. Наш AI проанализирует данные, определит координаты и типы правонарушений, и автоматически добавит их на карту.
            </p>
            
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Обработка AI...
                </>
              ) : (
                'Отправить и обработать'
              )}
            </button>

            {result && (
              <div className={`mt-4 p-3 rounded-xl text-[13px] flex items-start gap-2 ${result.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {result.status === 'success' ? <CheckCircle2 className="size-4 shrink-0 mt-0.5" /> : <AlertCircle className="size-4 shrink-0 mt-0.5" />}
                <span className="leading-snug">{result.message}</span>
              </div>
            )}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-bold text-slate-800">Рейтинг районов (скоро)</div>
              <div className="mt-2 text-[13px] leading-relaxed text-slate-500">
                Таблица/график: район → индекс опасности → факторы (кражи, хулиганство,
                избиения…).
              </div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-bold text-slate-800">Уведомления (скоро)</div>
              <div className="mt-2 text-[13px] leading-relaxed text-slate-500">
                Авто‑оповещения о систематических инцидентах и “пояснение модели”: что
                повлияло на рост риска.
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

