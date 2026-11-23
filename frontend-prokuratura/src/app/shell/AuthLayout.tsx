import { Outlet } from 'react-router-dom'
import { Shield } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1100px] items-center justify-center p-4">
        <div className="grid w-full gap-6 md:grid-cols-2 md:items-stretch">
          <section className="hidden rounded-3xl bg-slate-900 p-6 text-white md:flex md:flex-col md:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-white/10">
                <Shield className="size-5" />
              </div>
              <div>
                <div className="text-sm font-semibold leading-5">Общественная безопасность</div>
                <div className="text-xs text-white/70">г. Атырау, Казахстан</div>
              </div>
            </div>

            <div className="mt-10 space-y-3">
              <div className="text-lg font-semibold leading-6">Единая карта города</div>
              <div className="text-sm text-white/80">
                Инциденты, камеры, социальные объекты и еженедельная AI‑аналитика по районам.
              </div>
              <div className="rounded-2xl bg-white/10 p-4 text-sm text-white/80">
                Демо‑режим: авторизация пока работает как заглушка, позже подключим Django backend.
              </div>
            </div>

            <div className="text-xs text-white/60">© AI Hackathon • ThunderMInd</div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  )
}

