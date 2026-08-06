import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

if (typeof window !== 'undefined') {
  ;(window as unknown as { L?: typeof L }).L = L
}

import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import { useSearchParams } from 'react-router-dom'
import type { FeatureCollection } from 'geojson'
import { PageShell } from '../_ui/PageShell'
import { apiFetch } from '../../shared/api/apiClient'
import atyrayMap from '../../shared/data/atyrau-map.json'

function GeomanControls() {
  const map = useMap();
  useEffect(() => {
    try {
      if (map.pm) {
        map.pm.addControls({
          position: 'topleft',
          drawCircle: false,
          drawMarker: false,
          drawCircleMarker: false,
          drawPolyline: false,
          drawRectangle: true,
          drawPolygon: true,
          drawText: false,
          editMode: true,
          dragMode: true,
          cutPolygon: false,
          removalMode: true,
        });
        
        map.on('pm:create', (e: unknown) => {
          const anyE = e as { layer?: unknown }
          console.log('Shape created', anyE.layer);
          alert('Новый район добавлен локально! (Для сохранения необходима интеграция с бекендом)');
        });
      }
    } catch (err) {
      console.error('Geoman setup error', err);
    }
  }, [map]);
  return null;
}

type LayerKey = 'districts' | 'incidents' | 'cameras' | 'objects'

type DangerLevel = 'low' | 'medium' | 'high'

type Incident = {
  id: string
  title: string
  type: 'Кража' | 'Хулиганство' | 'Избиение' | 'ДТП' | 'Другое'
  lat: number
  lng: number
  districtId: string
  occurredAt: string
}

type Camera = {
  id: string
  name: string
  lat: number
  lng: number
  districtId: string
  status: 'online' | 'offline'
}

type SocialObject = {
  id: string
  name: string
  kind: string
  lat: number
  lng: number
  districtId: string
}

const DISTRICTS: FeatureCollection = ((): FeatureCollection => {
  const fc = atyrayMap as unknown as FeatureCollection
  return {
    ...fc,
    features: fc.features.map((f, idx) => {
      const props = (f.properties ?? {}) as Record<string, unknown>
      const name = String(props.NAME ?? props.name ?? `Район ${idx + 1}`)
      const id = String(
        props.id ??
          props.ID ??
          (props.NAME ? `${props.NAME}-${idx}` : f.id ?? `district-${idx}`),
      )
      return { ...f, properties: { ...props, id, name } }
    }),
  }
})()

const INITIAL_INCIDENTS: Incident[] = []
const INITIAL_CAMERAS: Camera[] = []
const INITIAL_OBJECTS: SocialObject[] = []

function dangerLabel(level: DangerLevel) {
  switch (level) {
    case 'low':
      return 'низкий'
    case 'medium':
      return 'средний'
    case 'high':
      return 'высокий'
  }
}

function dangerColors(level: DangerLevel) {
  switch (level) {
    case 'low':
      return { stroke: '#166534', fill: '#22c55e' } // green
    case 'medium':
      return { stroke: '#a16207', fill: '#eab308' } // yellow
    case 'high':
      return { stroke: '#991b1b', fill: '#ef4444' } // red
  }
}

type DistrictCard = {
  id: string
  name: string
  danger: DangerLevel
  riskScore: number
  rank: number
  incidentsCount: number
  camerasCount: number
  objectsCount: number
}

function layerLabel(k: LayerKey) {
  switch (k) {
    case 'districts':
      return 'Районы'
    case 'incidents':
      return 'Инциденты'
    case 'cameras':
      return 'Камеры'
    case 'objects':
      return 'Объекты'
  }
}

export function MapPage() {
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    districts: true,
    incidents: true,
    cameras: true,
    objects: true,
  })
  const [baseMap, setBaseMap] = useState<'satellite' | 'streets'>('satellite')
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null)
  
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS)
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS)
  const [objects, setObjects] = useState<SocialObject[]>(INITIAL_OBJECTS)
  const [districtDanger, setDistrictDanger] = useState<Record<string, DangerLevel>>({})
  const [districtRiskScore, setDistrictRiskScore] = useState<Record<string, number>>({})
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const [crimesData, camerasData, objectsData, districtsData] = await Promise.all([
          apiFetch<unknown[]>('/map-data/crimes/'),
          apiFetch<unknown[]>('/map-data/cameras/'),
          apiFetch<unknown[]>('/map-data/social-objects/'),
          apiFetch<unknown[]>('/map-data/districts/')
        ]);

        setIncidents(
          crimesData
            .map((c) => c as Record<string, unknown>)
            .map((c) => ({
              id: String(c.id ?? ''),
              title: String(c.title ?? ''),
              type: (String(c.crime_type ?? 'Другое') as Incident['type']) ?? 'Другое',
              lat: Number(c.latitude ?? 0),
              lng: Number(c.longitude ?? 0),
              districtId: String(c.district ?? ''),
              occurredAt: new Date(String(c.date_committed ?? '')).toLocaleString(),
            })),
        )

        setCameras(
          camerasData
            .map((c) => c as Record<string, unknown>)
            .map((c) => ({
              id: String(c.id ?? ''),
              name: String(c.name ?? ''),
              lat: Number(c.latitude ?? 0),
              lng: Number(c.longitude ?? 0),
              districtId: String(c.district ?? ''),
              status: c.is_active ? 'online' : 'offline',
            })),
        )

        setObjects(
          objectsData
            .map((o) => o as Record<string, unknown>)
            .map((o) => ({
              id: String(o.id ?? ''),
              name: String(o.name ?? ''),
              kind: String(o.object_type ?? ''),
              lat: Number(o.latitude ?? 0),
              lng: Number(o.longitude ?? 0),
              districtId: String(o.district ?? ''),
            })),
        )

        const dDanger: Record<string, DangerLevel> = {}
        const risk: Record<string, number> = {}
        districtsData
          .map((d) => d as Record<string, unknown>)
          .forEach((d) => {
            const id = String(d.id ?? '')
            const score = Number(d.risk_score ?? 0)
            let level: DangerLevel = 'low'
            if (score > 3 && score < 7) level = 'medium'
            if (score >= 7) level = 'high'
            dDanger[id] = level
            risk[id] = score
          })
        setDistrictDanger(dDanger);
        setDistrictRiskScore(risk);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMapData();
  }, []);

  const districtNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const f of DISTRICTS.features) {
      const id = (f.properties as { id?: string }).id
      const name = (f.properties as { name?: string }).name
      if (id && name) map.set(id, name)
    }
    return map
  }, [])

  const districtCards = useMemo((): DistrictCard[] => {
    const cardsRaw: Omit<DistrictCard, 'rank'>[] = []
    for (const f of DISTRICTS.features) {
      const id = (f.properties as { id?: string }).id
      const name = (f.properties as { name?: string }).name
      if (!id || !name) continue
      const danger = districtDanger[id] ?? 'medium'
      const fallbackScore = ((String(id).length * 1.7) % 9) + 1
      cardsRaw.push({
        id,
        name,
        danger,
        riskScore: districtRiskScore[id] ?? fallbackScore,
        incidentsCount: incidents.filter((i) => i.districtId === id).length,
        camerasCount: cameras.filter((c) => c.districtId === id).length,
        objectsCount: objects.filter((o) => o.districtId === id).length,
      })
    }
    const sorted = [...cardsRaw].sort((a, b) => b.riskScore - a.riskScore)
    const rankById = new Map(sorted.map((c, idx) => [c.id, idx + 1]))
    return cardsRaw.map((c) => ({ ...c, rank: rankById.get(c.id) ?? 0 }))
  }, [cameras, districtDanger, districtRiskScore, incidents, objects])

  const selectedSummary = useMemo(() => {
    if (!selectedDistrictId) return null
    const danger = districtDanger[selectedDistrictId] ?? 'medium'
    const riskScore = districtRiskScore[selectedDistrictId] ?? 0
    const rank = districtCards.find((d) => d.id === selectedDistrictId)?.rank ?? 0
    const incidentTypes = incidents
      .filter((i) => i.districtId === selectedDistrictId)
      .reduce<Record<string, number>>((acc, i) => {
        acc[i.type] = (acc[i.type] ?? 0) + 1
        return acc
      }, {})
    return {
      districtId: selectedDistrictId,
      districtName: districtNameById.get(selectedDistrictId) ?? selectedDistrictId,
      danger,
      riskScore,
      rank,
      incidentTypes,
      incidents: incidents.filter((i) => i.districtId === selectedDistrictId),
      cameras: cameras.filter((c) => c.districtId === selectedDistrictId),
      objects: objects.filter((o) => o.districtId === selectedDistrictId),
    }
  }, [
    cameras,
    districtCards,
    districtDanger,
    districtNameById,
    districtRiskScore,
    incidents,
    objects,
    selectedDistrictId,
  ])

  // React to search query in ?search=
  useEffect(() => {
    const q = (searchParams.get('search') ?? '').trim().toLowerCase()
    if (!q) return
    const best = districtCards.find((d) => d.name.toLowerCase().includes(q))
    if (!best) return
    if (best.id !== selectedDistrictId) {
      // Select район по поиску (без авто-зума).
      setTimeout(() => setSelectedDistrictId(best.id), 0)
    }
  }, [districtCards, searchParams, selectedDistrictId])

  return (
    <PageShell
      title="Карта"
      subtitle="Слои: районы, инциденты, видеокамеры и социальные объекты. Кликните по району — справа появится сводка."
      right={
        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['districts', 'incidents', 'cameras', 'objects'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setLayers((p) => ({ ...p, [k]: !p[k] }))}
                className={[
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-all',
                  layers[k]
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')}
              >
                {layerLabel(k)}
              </button>
            ))}
          </div>

          <div className="hidden h-5 w-px bg-slate-200 lg:block" />

          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400">Опасность:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-green-500" />
                <span className="text-slate-500">низк.</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-yellow-500" />
                <span className="text-slate-500">средн.</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-red-500" />
                <span className="text-slate-500">высок.</span>
              </span>
            </div>
          </div>

          <div className="hidden h-5 w-px bg-slate-200 lg:block" />

          <div className="flex items-center rounded-full bg-slate-100 p-0.5 text-sm">
            <button
              type="button"
              onClick={() => setBaseMap('streets')}
              className={[
                'rounded-full px-3 py-1.5 font-medium transition-all',
                baseMap === 'streets'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900',
              ].join(' ')}
            >
              Схема
            </button>
            <button
              type="button"
              onClick={() => setBaseMap('satellite')}
              className={[
                'rounded-full px-3 py-1.5 font-medium transition-all',
                baseMap === 'satellite'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900',
              ].join(' ')}
            >
              Спутник
            </button>
          </div>
        </div>
      }
    >
      <div className="grid h-full min-h-[520px] gap-3 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <MapContainer
            className="h-full min-h-[520px] w-full"
            center={[47.0943, 51.9165]}
            zoom={13}
          >
            <GeomanControls />
            {baseMap === 'satellite' ? (
              <TileLayer
                attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            ) : (
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}

            {layers.districts ? (
              <GeoJSON
                data={DISTRICTS as never}
                style={(feature: { properties?: unknown } | null | undefined) => {
                  const id = (feature?.properties as { id?: string } | undefined)?.id
                  const selected = id && id === selectedDistrictId
                  const danger: DangerLevel = id ? (districtDanger[id] ?? 'medium') : 'medium'
                  const colors = dangerColors(danger)
                  return {
                    color: selected ? '#0f172a' : colors.stroke,
                    weight: selected ? 3 : 2,
                    fillOpacity: selected ? 0.22 : 0.18,
                    fillColor: selected ? '#0f172a' : colors.fill,
                  }
                }}
                eventHandlers={{
                  click: (e: unknown) => {
                    const anyE = e as {
                      propagatedFrom?: { feature?: { properties?: unknown } }
                      target?: { feature?: { properties?: unknown } }
                    }
                    const props = (anyE.propagatedFrom?.feature?.properties ??
                      anyE.target?.feature?.properties) as { id?: string } | undefined
                    const id = props?.id
                    if (id) setSelectedDistrictId(id)
                  },
                }}
              />
            ) : null}

            {layers.incidents
              ? incidents.map((i) => (
                  <CircleMarker
                    key={i.id}
                    center={[i.lat, i.lng]}
                    radius={7}
                    pathOptions={{ color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.9 }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{i.type}</div>
                        <div className="text-slate-600">{i.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{i.occurredAt}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          Район: {districtNameById.get(i.districtId) ?? i.districtId}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))
              : null}

            {layers.cameras
              ? cameras.map((c) => (
                  <CircleMarker
                    key={c.id}
                    center={[c.lat, c.lng]}
                    radius={7}
                    pathOptions={{
                      color: c.status === 'online' ? '#16a34a' : '#64748b',
                      fillColor: c.status === 'online' ? '#22c55e' : '#94a3b8',
                      fillOpacity: 0.95,
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{c.name}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          Статус: {c.status === 'online' ? 'онлайн' : 'оффлайн'}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Район: {districtNameById.get(c.districtId) ?? c.districtId}
                        </div>
                        <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
                          Просмотр в реальном времени появится после подключения backend.
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))
              : null}

            {layers.objects
              ? objects.map((o) => (
                  <CircleMarker
                    key={o.id}
                    center={[o.lat, o.lng]}
                    radius={7}
                    pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.95 }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{o.kind}</div>
                        <div className="text-slate-600">{o.name}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          Район: {districtNameById.get(o.districtId) ?? o.districtId}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))
              : null}
          </MapContainer>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4">
          {!selectedSummary ? (
            <div className="text-sm text-slate-600">
              <div className="font-semibold text-slate-900">Сводка по району</div>
              <div className="mt-2">
                Кликните по району на карте или найдите его через поиск сверху, чтобы увидеть
                подробную информацию.
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                После выбора района здесь появятся его рейтинг, индекс опасности и структура
                инцидентов.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-sm font-semibold">{selectedSummary.districtName}</div>
                <div className="mt-1 text-xs text-slate-500">
                  Район ID: {selectedSummary.districtId}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Уровень опасности</div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span
                    className="inline-block size-3 rounded-sm"
                    style={{ background: dangerColors(selectedSummary.danger).fill }}
                  />
                  <span className="capitalize">{dangerLabel(selectedSummary.danger)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Рейтинг района</div>
                  <div className="mt-1 text-lg font-semibold">#{selectedSummary.rank || '—'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Индекс опасности</div>
                  <div className="mt-1 text-lg font-semibold">
                    {Number.isFinite(selectedSummary.riskScore)
                      ? selectedSummary.riskScore.toFixed(1)
                      : '—'}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-3">
                <div className="text-xs font-semibold text-slate-700">Структура инцидентов</div>
                {selectedSummary.incidents.length === 0 ? (
                  <div className="mt-2 text-sm text-slate-500">Нет данных.</div>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {Object.entries(selectedSummary.incidentTypes)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([k, v]) => (
                        <div key={k} className="rounded-xl bg-slate-50 p-2 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{k}</span>
                            <span className="text-xs text-slate-500">{v}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                <div className="mt-3 rounded-xl bg-slate-50 p-2 text-xs text-slate-600">
                  Примечание: показатели берутся из данных системы. Для отчёта “Сводка за 18.12.2025”
                  можно будет загрузить агрегированные значения после согласования формата.
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Инциденты</div>
                  <div className="mt-1 text-lg font-semibold">
                    {selectedSummary.incidents.length}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Камеры</div>
                  <div className="mt-1 text-lg font-semibold">{selectedSummary.cameras.length}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Объекты</div>
                  <div className="mt-1 text-lg font-semibold">{selectedSummary.objects.length}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-3">
                <div className="text-xs font-semibold text-slate-700">Последние инциденты</div>
                {selectedSummary.incidents.length === 0 ? (
                  <div className="mt-2 text-sm text-slate-500">Нет данных.</div>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {selectedSummary.incidents.slice(0, 5).map((i) => (
                      <li key={i.id} className="rounded-xl bg-slate-50 p-2 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{i.type}</span>
                          <span className="text-xs text-slate-500">{i.occurredAt}</span>
                        </div>
                        <div className="text-slate-600">{i.title}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                onClick={() => alert('Скоро: запуск еженедельного AI‑анализа для выбранного района')}
              >
                Запустить AI‑анализ района (демо)
              </button>

              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
                onClick={() => setSelectedDistrictId(null)}
              >
                Вернуться к списку районов
              </button>
            </div>
          )}
        </aside>
      </div>
    </PageShell>
  )
}

