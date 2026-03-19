import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../shell/AppLayout'
import { AnalyticsPage } from '../../pages/analytics/AnalyticsPage'
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

