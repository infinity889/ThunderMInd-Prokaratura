import { useState } from 'react';
import { apiFetch } from '../../shared/api/apiClient';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login endpoint
        const data = await apiFetch<any>('/users/login/', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('is_admin', data.is_admin ? 'true' : 'false');
        onSuccess();
      } else {
        // Register endpoint
        await apiFetch<any>('/users/register/', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });
        
        // After register automatically login
        const data = await apiFetch<any>('/users/login/', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('is_admin', data.is_admin ? 'true' : 'false');
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
        <h2 className="mb-6 text-2xl font-bold text-center text-slate-900">
          {isLogin ? 'Вход в систему' : 'Регистрация'}
        </h2>

        {!isLogin && (
          <p className="mb-4 text-xs text-center text-slate-500">
            Регистрация доступна только для обычных пользователей. Администраторы назначаются системой заранее.
          </p>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Имя пользователя</label>
            <input 
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="введите имя"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Пароль</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-[#f14635] px-4 py-3 font-semibold text-white shadow-md hover:bg-[#d63d2e] disabled:opacity-70"
          >
            {loading ? 'Подождите...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button 
            type="button"
            className="font-semibold text-[#f14635] hover:underline"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти (в т.ч. Администратор)'}
          </button>
        </div>
      </div>
    </div>
  );
}
