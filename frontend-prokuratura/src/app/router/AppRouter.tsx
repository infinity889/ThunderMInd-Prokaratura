import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../shell/AppLayout'
import { AuthLayout } from '../shell/AuthLayout'
import { AnalyticsPage } from '../../pages/analytics/AnalyticsPage'
import { LoginPage } from '../../pages/auth/LoginPage'
import { RegisterPage } from '../../pages/auth/RegisterPage'
import { CamerasPage } from '../../pages/cameras/CamerasPage'
import { DataSourcesPage } from '../../pages/data-sources/DataSourcesPage'
import { HelpPage } from '../../pages/help/HelpPage'
import { IncidentsPage } from '../../pages/incidents/IncidentsPage'
import { MapPage } from '../../pages/map/MapPage'
import { ObjectsPage } from '../../pages/objects/ObjectsPage'
import { SettingsPage } from '../../pages/settings/SettingsPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/map" replace />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/cameras" element={<CamerasPage />} />
        <Route path="/objects" element={<ObjectsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/data-sources" element={<DataSourcesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="*" element={<Navigate to="/map" replace />} />
      </Route>
    </Routes>
  )
}

