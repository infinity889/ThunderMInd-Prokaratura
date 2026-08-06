import { Outlet } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useLanguage } from '../../shared/lib/LanguageContext'

export function AuthLayout() {
  const { t, language, setLanguage } = useLanguage()

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 relative">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        <button onClick={() => setLanguage('ru')} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${language === 'ru' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>Рус</button>
        <button onClick={() => setLanguage('kz')} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${language === 'kz' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>Қаз</button>
      </div>
      <div className="mx-auto flex min-h-dvh w-full max-w-[1100px] items-center justify-center p-4">
        <div className="grid w-full gap-6 md:grid-cols-2 md:items-stretch h-[600px] shadow-2xl rounded-3xl bg-white border border-slate-200">
          <section className="relative m-2 hidden flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white md:flex">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-800" />
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-600 shadow-inner">
                  <Shield className="size-6 text-white" />
                </div>
                <div>
                  <div className="text-base font-bold uppercase leading-5 tracking-wide text-slate-100">{t('welcome_title')}</div>
                  <div className="text-xs font-medium text-blue-200/60">{t('welcome_subtitle')}</div>
                </div>
              </div>

              <div className="mt-16 space-y-4">
                <div className="text-3xl font-extrabold leading-tight tracking-tight text-white">{t('welcome_desc')}</div>
                <div className="max-w-sm text-sm font-medium leading-relaxed text-blue-200/80">
                  {t('welcome_desc2')}
                </div>
              </div>
            </div>

            <div className="text-xs font-semibold text-white/30 tracking-widest uppercase">
              © AI Hackathon • ThunderMInd
            </div>
          </section>

          <section className="p-8 flex items-center justify-center relative">
            <div className="w-full max-w-sm">
               <Outlet />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

