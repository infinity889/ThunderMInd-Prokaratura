import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../shared/lib/LanguageContext';
import { ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';

export function WelcomePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect them to the map
    if (localStorage.getItem('token')) {
      navigate('/map', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <ShieldAlert className="size-16 text-slate-800 mb-6" />
      <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-4">
        {t('welcome_title')}
      </h1>
      <p className="text-slate-500 mb-8 max-w-xs mx-auto">
        {t('welcome_desc2')}
      </p>

      <div className="space-y-4 w-full px-4">
        <Link 
          to="/login"
          className="block w-full rounded-2xl bg-[#0089d0] px-4 py-4 font-bold text-white shadow hover:bg-[#0070a8] transition-transform hover:scale-105"
        >
          {t('btn_login')}
        </Link>
        
        <Link 
          to="/register"
          className="block w-full rounded-2xl bg-white border border-slate-300 px-4 py-4 font-bold text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-transform hover:scale-105"
        >
          {t('btn_register')}
        </Link>
      </div>

    </div>
  );
}
