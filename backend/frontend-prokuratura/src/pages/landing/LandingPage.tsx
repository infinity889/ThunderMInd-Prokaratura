import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from './AuthModal';

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleServiceClick = (route: string) => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate(route);
    } else {
      setPendingRoute(route);
      setShowAuthModal(true);
    }
  };

  const onAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingRoute) {
      navigate(pendingRoute);
    } else {
      navigate('/map');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white px-8 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo mock replacing kaspi logo */}
          <div className="w-10 h-10 bg-[#f14635] rounded-full flex items-center justify-center text-white font-bold text-xl">
            T
          </div>
          <span className="font-bold text-xl tracking-tight">ThunderMInd.kz</span>
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-red-500">Гражданам</a>
          <a href="#" className="hover:text-red-500">Правоохранительным структурам</a>
          <a href="#" className="hover:text-red-500">Гид</a>
        </nav>

        <div className="flex items-center gap-4 text-sm font-medium border border-slate-200 rounded-full px-1 py-1">
          <button className="px-3 py-1 text-slate-400 hover:text-slate-800 rounded-full">Қаз</button>
          <button className="px-3 py-1 bg-white shadow-sm text-slate-800 rounded-full">Рус</button>
        </div>
      </header>

      {/* Hero section equivalent to Kaspi */}
      <div className="bg-[#f2f2f2] flex flex-col md:flex-row items-center justify-center gap-12 py-16 px-6">
        <div className="max-w-md text-center md:text-left flex flex-col items-center md:items-start gap-4">
          <div className="w-40 h-40 bg-[#f14635] rounded-3xl flex items-center justify-center shadow-lg transform rotate-3 mb-6">
            <span className="text-white text-8xl font-black">T/M</span>
          </div>
          <h1 className="text-6xl font-black mb-2 tracking-tighter">ThunderMInd<span className="text-[#f14635]">.kz</span></h1>
          <p className="text-2xl font-semibold mb-6">Цифровая платформа №1 по Общественной безопасности</p>
          <button 
            onClick={() => handleServiceClick('/map')}
            className="bg-[#0089d0] hover:bg-[#0070a8] text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-md transition-transform hover:scale-105"
          >
            Войти в систему
          </button>
        </div>

        {/* Mock phone/app */}
        <div className="hidden md:block">
          <div className="w-72 h-[550px] bg-white rounded-[3rem] border-[8px] border-slate-800 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-xl flex justify-center w-32 mx-auto"></div>
            <div className="bg-[#f4f4f4] h-full p-4 flex flex-col pt-10">
              <input readOnly value="Поиск районов и инцидентов..." className="w-full bg-white rounded-xl py-3 px-4 shadow-sm text-xs mb-6 text-slate-400" />
              <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="bg-white h-24 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2">
                   <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold">🗺️</div>
                   <span className="text-xs font-semibold">Карта</span>
                 </div>
                 <div className="bg-white h-24 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2">
                   <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">📊</div>
                   <span className="text-xs font-semibold">Аналитика</span>
                 </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-xs font-medium text-slate-500">
                Новое обновление безопасности
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="bg-white py-16 px-6">
        <h2 className="text-center text-4xl font-bold mb-12">Сервисы ThunderMInd</h2>
        
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { id: 'map', title: 'Карта Инцидентов', icon: '📍', route: '/map' },
            { id: 'analytics', title: 'ИИ-Аналитика', icon: '📈', route: '/analytics' },
            { id: 'sources', title: 'Источники Данных', icon: '🗄️', route: '/data-sources' },
            { id: 'incidents', title: 'Правонарушения', icon: '🚨', route: '/incidents' },
          ].map((srv) => (
             <div 
               key={srv.id} 
               onClick={() => handleServiceClick(srv.route)}
               className="flex flex-col items-center gap-4 cursor-pointer group"
             >
               <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-4xl shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md">
                 {srv.icon}
               </div>
               <span className="font-semibold text-center group-hover:text-[#f14635]">{srv.title}</span>
             </div>
          ))}
        </div>
      </section>

      {/* Auth Modal overlay */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={onAuthSuccess} 
        />
      )}
    </div>
  );
}
