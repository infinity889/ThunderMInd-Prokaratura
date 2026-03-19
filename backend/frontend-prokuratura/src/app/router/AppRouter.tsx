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
import React from 'react'
import { LandingPage } from '../../pages/landing/LandingPage'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/" replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/map" element={<MapPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/cameras" element={<CamerasPage />} />
        <Route path="/objects" element={<ObjectsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/data-sources" element={<DataSourcesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

