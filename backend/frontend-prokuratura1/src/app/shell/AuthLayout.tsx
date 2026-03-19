import { Outlet } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useLanguage } from '../../shared/lib/LanguageContext'

export function AuthLayout() {
  const { t, language, setLanguage } = useLanguage()

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2 border border-slate-200 rounded-full p-1 bg-white shadow-sm z-10">
        <button onClick={() => setLanguage('ru')} className={`px-3 py-1 rounded-full text-xs font-medium ${language === 'ru' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Рус</button>
        <button onClick={() => setLanguage('kz')} className={`px-3 py-1 rounded-full text-xs font-medium ${language === 'kz' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Қаз</button>
      </div>
      <div className="mx-auto flex min-h-dvh w-full max-w-[1100px] items-center justify-center p-4">
        <div className="grid w-full gap-6 md:grid-cols-2 md:items-stretch h-[600px] shadow-2xl rounded-3xl bg-white border border-slate-200">
          <section className="hidden rounded-3xl bg-slate-900 p-8 text-white md:flex md:flex-col md:justify-between m-2">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-white/10 shrink-0">
                  <Shield className="size-6 text-indigo-400" />
                </div>
                <div>
                  <div className="text-base font-bold leading-5 tracking-wide uppercase">{t('welcome_title')}</div>
                  <div className="text-xs font-medium text-white/50">{t('welcome_subtitle')}</div>
                </div>
              </div>

              <div className="mt-16 space-y-4">
                <div className="text-3xl font-extrabold leading-tight">{t('welcome_desc')}</div>
                <div className="text-sm font-medium text-indigo-200/80 leading-relaxed max-w-sm">
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

