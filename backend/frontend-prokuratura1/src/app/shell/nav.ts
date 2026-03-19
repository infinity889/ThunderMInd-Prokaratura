import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Camera,
  Database,
  HelpCircle,
  LayoutDashboard,
  Map,
  Settings,
  ShieldAlert,
  User,
} from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  description: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/map',
    label: 'Карта',
    description: 'Районы, слои, инциденты и камеры',
    icon: Map,
  },
  {
    to: '/incidents',
    label: 'Инциденты',
    description: 'Преступления и правонарушения',
    icon: ShieldAlert,
  },
  {
    to: '/cameras',
    label: 'Видеокамеры',
    description: 'Список, статус, просмотр (позже)',
    icon: Camera,
  },
  {
    to: '/objects',
    label: 'Объекты',
    description: 'Школы, сады, больницы и др.',
    icon: LayoutDashboard,
  },
  {
    to: '/analytics',
    label: 'Аналитика',
    description: 'Еженедельный AI‑рейтинг районов',
    icon: BarChart3,
  },
  {
    to: '/data-sources',
    label: 'Источники данных',
    description: 'Ручное управление источниками',
    icon: Database,
  },
  {
    to: '/settings',
    label: 'Настройки',
    description: 'Город, отображение, уведомления',
    icon: Settings,
  },
  {
    to: '/profile',
    label: 'Профиль',
    description: 'Данные пользователя и роль',
    icon: User,
  },
  {
    to: '/help',
    label: 'Помощь',
    description: 'Как пользоваться платформой',
    icon: HelpCircle,
  },
]

