/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

type Language = 'ru' | 'kz';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ru: {
    login: 'Вход',
    register: 'Регистрация',
    welcome_title: 'Общественная безопасность',
    welcome_subtitle: 'г. Атырау, Казахстан',
    welcome_desc: 'Единая карта города',
    welcome_desc2: 'Инциденты, камеры, социальные объекты и еженедельная AI‑аналитика по районам.',
    goto_map: 'Перейти к системе',
    no_account: 'Нет аккаунта?',
    have_account: 'Уже есть аккаунт?',
    enter_username: 'Введите имя',
    username: 'Имя пользователя',
    password: 'Пароль',
    loading: 'Загрузка...',
    error_login: 'Не удалось войти',
    error_register: 'Ошибка регистрации',
    btn_login: 'Войти',
    btn_register: 'Зарегистрироваться',
    fio: 'ФИО',
    password_repeat: 'Повторите пароль',
    password_mismatch: 'Пароли не совпадают',
    profile: 'Профиль',
    profile_subtitle: 'Данные пользователя и настройки аккаунта',
    organization: 'Организация',
    role: 'Роль',
    save: 'Сохранить',
    edit: 'Редактировать',
    cancel: 'Отмена'
  },
  kz: {
    login: 'Кіру',
    register: 'Тіркелу',
    welcome_title: 'Қоғамдық қауіпсіздік',
    welcome_subtitle: 'Атырау қ., Қазақстан',
    welcome_desc: 'Қаланың бірыңғай картасы',
    welcome_desc2: 'Оқиғалар, камералар, әлеуметтік нысандар және апта сайынғы AI-аналитика.',
    goto_map: 'Жүйеге өту',
    no_account: 'Аккаунтыңыз жоқ па?',
    have_account: 'Аккаунтыңыз бар ма?',
    enter_username: 'Атыңызды енгізіңіз',
    username: 'Пайдаланушы аты',
    password: 'Құпия сөз',
    loading: 'Жүктелуде...',
    error_login: 'Кіру сәтсіз аяқталды',
    error_register: 'Тіркелу қатесі',
    btn_login: 'Кіру',
    btn_register: 'Тіркелу',
    fio: 'Аты-жөні',
    password_repeat: 'Құпия сөзді қайталаңыз',
    password_mismatch: 'Құпия сөздер сәйкес келмейді',
    profile: 'Профиль',
    profile_subtitle: 'Пайдаланушы деректері және аккаунт баптаулары',
    organization: 'Ұйым',
    role: 'Рөл',
    save: 'Сақтау',
    edit: 'Өңдеу',
    cancel: 'Болдырмау'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ru');

  const t = (key: string) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
