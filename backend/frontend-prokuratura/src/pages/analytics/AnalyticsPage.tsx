import { useState, useEffect } from 'react'
import { PageShell } from '../_ui/PageShell'
import { apiFetch } from '../../shared/api/apiClient'

type DistrictRating = {
  id: number;
  name: string;
  risk_score: number;
}

export function AnalyticsPage() {
  const [ratings, setRatings] = useState<DistrictRating[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const fetchRatings = async () => {
    setLoading(true)
    try {
      const data = await apiFetch<DistrictRating[]>('/analytics/ratings/')
      setRatings(data)
    } catch (e: any) {
      console.error("Error fetching ratings:", e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await apiFetch('/analytics/generate-analysis/', { method: 'POST' })
      await fetchRatings()
    } catch (e: any) {
      console.error("Error generating analysis:", e.message)
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    fetchRatings()
  }, [])

  return (
    <PageShell
      title="Аналитика"
      subtitle="Еженедельный AI‑анализ: рейтинг районов, тренды, повторяемость правонарушений."
    >
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleGenerate} 
          disabled={generating}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:bg-indigo-300"
        >
          {generating ? 'Генерация (AI)...' : 'Запустить ИИ-Анализ'}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold mb-4">Рейтинг опасности районов</div>
          {loading ? (
            <div className="text-sm text-slate-500">Загрузка...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2">Район</th>
                    <th className="pb-2">Индекс (из 10)</th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-2">{r.name}</td>
                      <td className="py-2 font-medium">{r.risk_score}</td>
                    </tr>
                  ))}
                  {ratings.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-slate-400">
                        Нет данных. Нажмите "Запустить ИИ-Анализ".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
        
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Уведомления</div>
          <div className="mt-2 text-sm text-slate-600">
            Здесь будут выводиться AI-уведомления о систематических инцидентах. 
            (В разработке)
          </div>
        </section>
      </div>
    </PageShell>
  )
}

