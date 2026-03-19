import 'leaflet/dist/leaflet.css'
import { useMemo, useState } from 'react'
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer } from 'react-leaflet'
import type { FeatureCollection } from 'geojson'
import { PageShell } from '../_ui/PageShell'

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
  kind: 'Школа' | 'Детский сад' | 'Больница' | 'Другое'
  lat: number
  lng: number
  districtId: string
}

const DISTRICTS: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'd1', name: 'Атырау — Север' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [51.85, 47.14],
            [52.03, 47.14],
            [52.03, 47.22],
            [51.85, 47.22],
            [51.85, 47.14],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'd2', name: 'Атырау — Центр' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [51.85, 47.06],
            [52.03, 47.06],
            [52.03, 47.14],
            [51.85, 47.14],
            [51.85, 47.06],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'd3', name: 'Атырау — Юг' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [51.85, 46.98],
            [52.03, 46.98],
            [52.03, 47.06],
            [51.85, 47.06],
            [51.85, 46.98],
          ],
        ],
      },
    },
  ],
}

const INCIDENTS: Incident[] = [
  {
    id: 'i-001',
    title: 'Кража телефона',
    type: 'Кража',
    lat: 47.098,
    lng: 51.923,
    districtId: 'd2',
    occurredAt: '2026-03-16 21:10',
  },
  {
    id: 'i-002',
    title: 'Хулиганство во дворе',
    type: 'Хулиганство',
    lat: 47.185,
    lng: 51.95,
    districtId: 'd1',
    occurredAt: '2026-03-14 23:45',
  },
  {
    id: 'i-003',
    title: 'Избиение у остановки',
    type: 'Избиение',
    lat: 47.02,
    lng: 51.9,
    districtId: 'd3',
    occurredAt: '2026-03-12 19:05',
  },
]

const CAMERAS: Camera[] = [
  {
    id: 'c-01',
    name: 'Камера №1 (перекрёсток)',
    lat: 47.11,
    lng: 51.91,
    districtId: 'd2',
    status: 'online',
  },
  {
    id: 'c-02',
    name: 'Камера №2 (парк)',
    lat: 47.19,
    lng: 51.89,
    districtId: 'd1',
    status: 'offline',
  },
  {
    id: 'c-03',
    name: 'Камера №3 (школа)',
    lat: 47.01,
    lng: 51.98,
    districtId: 'd3',
    status: 'online',
  },
]

const OBJECTS: SocialObject[] = [
  { id: 'o-01', name: 'Школа №12', kind: 'Школа', lat: 47.085, lng: 51.96, districtId: 'd2' },
  {
    id: 'o-02',
    name: 'Детский сад «Солнышко»',
    kind: 'Детский сад',
    lat: 47.205,
    lng: 51.94,
    districtId: 'd1',
  },
  { id: 'o-03', name: 'Городская больница', kind: 'Больница', lat: 47.0, lng: 51.9, districtId: 'd3' },
]

const DISTRICT_DANGER: Record<string, DangerLevel> = {
  d1: 'medium',
  d2: 'low',
  d3: 'high',
}

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
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null)

  const districtNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const f of DISTRICTS.features) {
      const id = (f.properties as { id?: string }).id
      const name = (f.properties as { name?: string }).name
      if (id && name) map.set(id, name)
    }
    return map
  }, [])

  const selectedSummary = useMemo(() => {
    if (!selectedDistrictId) return null
    const danger = DISTRICT_DANGER[selectedDistrictId] ?? 'medium'
    return {
      districtId: selectedDistrictId,
      districtName: districtNameById.get(selectedDistrictId) ?? selectedDistrictId,
      danger,
      incidents: INCIDENTS.filter((i) => i.districtId === selectedDistrictId),
      cameras: CAMERAS.filter((c) => c.districtId === selectedDistrictId),
      objects: OBJECTS.filter((o) => o.districtId === selectedDistrictId),
    }
  }, [districtNameById, selectedDistrictId])

  return (
    <PageShell
      title="Карта"
      subtitle="Слои: районы, инциденты, видеокамеры и социальные объекты. Кликните по району — справа появится сводка."
      right={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {(['districts', 'incidents', 'cameras', 'objects'] as const).map((k) => (
            <label
              key={k}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={layers[k]}
                onChange={(e) => setLayers((p) => ({ ...p, [k]: e.target.checked }))}
              />
              <span>{layerLabel(k)}</span>
            </label>
          ))}

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <span className="text-slate-500">Опасность:</span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-3 rounded-sm" style={{ background: '#22c55e' }} />
              <span className="text-xs">низк.</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-3 rounded-sm" style={{ background: '#eab308' }} />
              <span className="text-xs">средн.</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-3 rounded-sm" style={{ background: '#ef4444' }} />
              <span className="text-xs">высок.</span>
            </span>
          </div>
        </div>
      }
    >
      <div className="grid h-full min-h-[520px] gap-3 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <MapContainer
            className="h-full min-h-[520px] w-full"
            bounds={[
              [46.95, 51.82],
              [47.25, 52.08],
            ]}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {layers.districts ? (
              <GeoJSON
                data={DISTRICTS as never}
                style={(feature: { properties?: unknown } | null | undefined) => {
                  const id = (feature?.properties as { id?: string } | undefined)?.id
                  const selected = id && id === selectedDistrictId
                  const danger: DangerLevel = id ? (DISTRICT_DANGER[id] ?? 'medium') : 'medium'
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
              ? INCIDENTS.map((i) => (
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
              ? CAMERAS.map((c) => (
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
              ? OBJECTS.map((o) => (
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
                Кликните по району на карте — здесь появится количество инцидентов, камер и объектов.
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                Под демо: районы — условные. В боевой версии будут реальные границы и источники.
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
            </div>
          )}
        </aside>
      </div>
    </PageShell>
  )
}

