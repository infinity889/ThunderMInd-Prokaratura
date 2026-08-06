import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1600px] gap-4 p-4">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <TopBar />
          <main className="min-h-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

