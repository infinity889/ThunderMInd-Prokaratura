import { useState } from 'react'
import { PageShell } from '../_ui/PageShell'
import { env } from '../../shared/config/env'

export function DataSourcesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string>('')

  const handleUpload = async () => {
    if (!file) return;
    setStatus('Загрузка...');
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${env.apiBaseUrl}/map-data/upload-excel/`, {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        setStatus('Успешно загружено!')
      } else {
        const errorData = await res.json()
        setStatus(`Ошибка: ${errorData.error || 'Неизвестная ошибка'}`)
      }
    } catch (e: any) {
      setStatus(`Ошибка сети: ${e.message}`)
    }
  }

  return (
    <PageShell
      title="Источники данных"
      subtitle="Ручное управление источниками и правилами загрузки."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold mb-2">Загрузка Excel данных</div>
          <div className="mt-2 text-sm text-slate-600 mb-4">
            Загрузите Excel-файл (CSV/XLSX) с данными о правонарушениях. Необходимые столбцы: district, title, crime_type, latitude, longitude, description.
          </div>
          <input 
             type="file" 
             accept=".xlsx, .xls, .csv" 
             onChange={e => setFile(e.target.files?.[0] || null)}
             className="block w-full text-sm text-slate-500 mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button 
             onClick={handleUpload}
             disabled={!file}
             className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-slate-300"
          >
            Загрузить
          </button>
          {status && <div className="mt-2 text-sm font-medium">{status}</div>}
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

