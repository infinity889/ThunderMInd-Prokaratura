import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

if (typeof window !== 'undefined') {
  // @ts-ignore
  window.L = L
}

import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useAdmin } from '../../shared/lib/useAdmin'
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import { PageShell } from '../_ui/PageShell'
import { apiFetch } from '../../shared/api/apiClient'
import { cn } from '../../shared/lib/cn'

function pointInPolygon(point: [number, number], polygon: number[][][]) {
  const [x, y] = point;
  let inside = false;
  const ring = polygon[0];
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInArea(point: [number, number], coordinates: any[], type: string): boolean {
  if (type === 'Polygon') {
    return pointInPolygon(point, coordinates as number[][][]);
  } else if (type === 'MultiPolygon') {
    for (const poly of coordinates) {
      if (pointInPolygon(point, poly as number[][][])) return true;
    }
  }
  return false;
}

function MarkerModal({
  markerData,
  districtsFC,
  onClose,
  onSave
}: {
  markerData: any
  districtsFC: FeatureCollection
  onClose: () => void
  onSave: () => void
}) {
  const [step, setStep] = useState<1 | 1.5 | 2>(1)
  const [type, setType] = useState<'1' | '2' | '3'>('1')
  const [name, setName] = useState('')
  const [detectedDistrict, setDetectedDistrict] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const geojson = markerData.layer.toGeoJSON()
    const lng = geojson.geometry.coordinates[0]
    const lat = geojson.geometry.coordinates[1]
    let detectedId = null
    for (const d of districtsFC.features) {
      if (d.geometry && pointInArea([lng, lat], (d.geometry as any).coordinates, d.geometry.type)) {
        detectedId = parseInt(d.properties?.id as string, 10)
        break
      }
    }
    setDetectedDistrict(detectedId)
  }, [markerData, districtsFC])

  const handleNext = () => {
    if (step === 1) {
      if (!detectedDistrict) setStep(1.5)
      else setStep(2)
    } else if (step === 1.5) {
      setStep(2)
    } else if (step === 2) {
      submit()
    }
  }

  const submit = async () => {
    if (!name.trim()) {
      alert('Пожалуйста, введите название.')
      return
    }
    setIsSubmitting(true)
    const geojson = markerData.layer.toGeoJSON()
    const lng = geojson.geometry.coordinates[0]
    const lat = geojson.geometry.coordinates[1]

    try {
      if (type === '1') {
        await apiFetch('/map-data/crimes/', {
          method: 'POST',
          body: JSON.stringify({
            title: name,
            crime_type: 'other',
            district: detectedDistrict,
            latitude: lat,
            longitude: lng,
            date_committed: new Date().toISOString(),
          }),
        })
      } else if (type === '2') {
        await apiFetch('/map-data/cameras/', {
          method: 'POST',
          body: JSON.stringify({
            name,
            district: detectedDistrict,
            latitude: lat,
            longitude: lng,
            status: 'online',
          }),
        })
      } else if (type === '3') {
        await apiFetch('/map-data/social-objects/', {
          method: 'POST',
          body: JSON.stringify({
            name,
            object_type: 'other',
            district: detectedDistrict,
            latitude: lat,
            longitude: lng,
          }),
        })
      }
      onSave()
    } catch (err: any) {
      console.error(err)
      const details = err.details ? JSON.stringify(err.details) : err.message
      alert(`Ошибка при сохранении: ${details}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-[20px] font-bold tracking-tight text-slate-800">
            {step === 1 && 'Новый объект'}
            {step === 1.5 && 'Предупреждение'}
            {step === 2 && 'Введите данные'}
          </h3>
          <p className="mt-1.5 text-sm font-medium text-slate-500">
            {step === 1 && 'Что вы хотите добавить на карту?'}
            {step === 1.5 && 'Локация находится за пределами районов.'}
            {step === 2 && 'Укажите название нового объекта.'}
          </p>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-3">
              {[
                { id: '1', label: 'Инцидент', icon: '🔴', desc: 'Правонарушение или опасное событие' },
                { id: '2', label: 'Камера видеонаблюдения', icon: '📹', desc: 'Автоматическая система фиксации' },
                { id: '3', label: 'Социальный объект', icon: '🏥', desc: 'Школа, больница и др.' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setType(opt.id as any)}
                  className={`w-full flex items-center gap-4 p-4 rounded-[16px] border-[2px] transition-all text-left group ${
                    type === opt.id
                      ? 'border-slate-800 bg-slate-50 shadow-sm shadow-slate-200/50'
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`text-2xl transition-transform ${type === opt.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {opt.icon}
                  </div>
                  <div>
                    <div className={`font-bold transition-colors ${type === opt.id ? 'text-slate-900' : 'text-slate-600'}`}>
                      {opt.label}
                    </div>
                    <div className="text-[13px] text-slate-500 mt-0.5 font-medium">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 1.5 && (
            <div className="text-slate-700 leading-relaxed text-[15px] font-medium">
              <div className="p-4 rounded-[16px] bg-amber-50 text-amber-900 border border-amber-200/50 mb-5 shadow-sm">
                Выбранная вами точка на карте не входит ни в один из зарегистрированных районов города.
              </div>
              <p>Сохранить эту метку без привязки к району?</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-[16px] bg-slate-50 border border-slate-100 shadow-sm mb-2">
                 <div className="text-xl">{type === '1' ? '🔴' : type === '2' ? '📹' : '🏥'}</div>
                 <div className="text-sm font-bold text-slate-800">
                   {type === '1' ? 'Инцидент' : type === '2' ? 'Камера' : 'Социальный объект'}
                 </div>
              </div>
              <label className="block">
                <span className="block text-[14px] font-bold text-slate-700 mb-2">Название объекта</span>
                <input
                  type="text"
                  autoFocus
                  placeholder={
                    type === '1' ? 'Напр: Кража в магазине' :
                    type === '2' ? 'Напр: Перекресток Абая' :
                    'Напр: Детский сад №5'
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  className="w-full px-4 py-3.5 text-[15px] font-medium rounded-[14px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </label>
            </div>
          )}
        </div>

        <div className="px-6 py-5 bg-slate-50 border-t border-slate-200/60 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-[12px] font-bold text-[14px] text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
          >
            Отмена
          </button>
          
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-[12px] font-bold text-[14px] text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                Сохранение...
              </>
            ) : (
               step === 1 ? 'Далее' : step === 1.5 ? 'Все равно сохранить' : 'Добавить объект'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function GeomanControls({ reloadData, districtsFC }: { reloadData: () => void, districtsFC: FeatureCollection }) {
  const map = useMap()
  const [pendingMarker, setPendingMarker] = useState<any>(null)

  useEffect(() => {
    try {
      const isAdmin = localStorage.getItem('is_admin') === 'true'
      if (map.pm && isAdmin) {
        map.pm.addControls({
          position: 'topleft',
          drawCircle: false,
          drawMarker: true,
          drawCircleMarker: false,
          drawPolyline: false,
          drawRectangle: true,
          drawPolygon: true,
          drawText: false,
          editMode: true,
          dragMode: true,
          cutPolygon: false,
          removalMode: true,
          rotateMode: true,
        })
        
        const handleCreate = async (e: any) => {
          if (e.shape === 'Marker') {
             setPendingMarker(e)
             return
          }
          
          // Polygon/Rectangle (District)
          const geojson = e.layer.toGeoJSON()
          try {
            await apiFetch('/map-data/districts/', {
              method: 'POST',
              body: JSON.stringify({
                name: 'Новый район ' + Date.now().toString().slice(-4),
                risk_score: 5.0,
                coordinates: geojson.geometry
              })
            })
            map.removeLayer(e.layer)
            reloadData()
          } catch (error) {
            console.error(error)
            alert('Ошибка при сохранении района')
          }
        }

        const handleRemove = async (e: any) => {
          if (e.layer.feature && e.layer.feature.properties && e.layer.feature.properties.id) {
            const id = e.layer.feature.properties.id
            try {
              await apiFetch(`/map-data/districts/${id}/`, {
                method: 'DELETE'
              })
              reloadData()
            } catch (error) {
              console.error(error)
              alert('Ошибка при удалении района')
            }
          }
        }

        map.on('pm:create', handleCreate)
        map.on('pm:remove', handleRemove)
        
        return () => {
          map.off('pm:create', handleCreate)
          map.off('pm:remove', handleRemove)
        }
      } else if (map.pm && !isAdmin) {
         map.pm.addControls({
           position: 'topleft',
           drawCircle: false,
           drawMarker: false,
           drawCircleMarker: false,
           drawPolyline: false,
           drawRectangle: false,
           drawPolygon: false,
           drawText: false,
           editMode: false,
           dragMode: false,
           cutPolygon: false,
           removalMode: false,
           rotateMode: false,
         })
      }
    } catch (err) {
      console.error('Geoman setup error', err)
    }
  }, [map, reloadData, districtsFC])

  return pendingMarker ? createPortal(
    <MarkerModal
      markerData={pendingMarker}
      districtsFC={districtsFC}
      onClose={() => {
        map.removeLayer(pendingMarker.layer)
        setPendingMarker(null)
      }}
      onSave={() => {
        map.removeLayer(pendingMarker.layer)
        setPendingMarker(null)
        reloadData()
      }}
    />,
    document.body
  ) : null
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
  const isAdmin = useAdmin()
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    districts: true,
    incidents: true,
    cameras: true,
    objects: true,
  })
  const [mapType, setMapType] = useState<'schema' | 'satellite'>('schema')
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null)
  
  const [districtsFC, setDistrictsFC] = useState<FeatureCollection>({ type: 'FeatureCollection', features: [] })
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS)
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS)
  const [objects, setObjects] = useState<SocialObject[]>(INITIAL_OBJECTS)
  const [districtDanger, setDistrictDanger] = useState<Record<string, DangerLevel>>({})

  const fetchMapData = useCallback(async () => {
    try {
      const [crimesData, camerasData, objectsData, districtsData] = await Promise.all([
        apiFetch<any[]>('/map-data/crimes/'),
        apiFetch<any[]>('/map-data/cameras/'),
        apiFetch<any[]>('/map-data/social-objects/'),
        apiFetch<any[]>('/map-data/districts/')
      ]);

      setIncidents(crimesData.map(c => ({
        id: String(c.id),
        title: c.title,
        type: c.crime_type,
        lat: c.latitude,
        lng: c.longitude,
        districtId: String(c.district),
        occurredAt: new Date(c.date_committed).toLocaleString()
      })));

      setCameras(camerasData.map(c => ({
        id: String(c.id),
        name: c.name,
        lat: c.latitude,
        lng: c.longitude,
        districtId: String(c.district),
        status: 'online'
      })));

      setObjects(objectsData.map(o => ({
        id: String(o.id),
        name: o.name,
        kind: o.object_type,
        lat: o.latitude,
        lng: o.longitude,
        districtId: String(o.district)
      })));

      const features: Feature[] = [];
      const dDanger: Record<string, DangerLevel> = {};
      districtsData.forEach(d => {
         let level: DangerLevel = 'low';
         if (d.risk_score > 3 && d.risk_score < 7) level = 'medium';
         if (d.risk_score >= 7) level = 'high';
         dDanger[String(d.id)] = level;
         
         if (d.coordinates) {
           features.push({
             type: 'Feature',
             properties: { id: String(d.id), name: d.name },
             geometry: d.coordinates
           });
         }
      });
      setDistrictDanger(dDanger);
      setDistrictsFC({ type: 'FeatureCollection', features });
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  const districtNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const f of districtsFC.features) {
      const id = (f.properties as { id?: string }).id
      const name = (f.properties as { name?: string }).name
      if (id && name) map.set(id, name)
    }
    return map
  }, [districtsFC])



  const updateDistrictDanger = async (id: string, risk_score: number) => {
    try {
      await apiFetch(`/map-data/districts/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ risk_score }),
      });
      fetchMapData();
    } catch (e) {
      alert('Ошибка при обновлении уровня опасности');
    }
  };

  const renameDistrict = async (id: string, currentName: string) => {
    const newName = prompt('Введите новое название района:', currentName);
    if (!newName || newName === currentName) return;
    try {
      await apiFetch(`/map-data/districts/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ name: newName }),
      });
      fetchMapData();
    } catch (e) {
      alert('Ошибка при переименовании района');
    }
  };

  const deleteMarker = async (type: string, id: string) => {
    if (!confirm('Удалить этот объект?')) return;
    try {
      await apiFetch(`/map-data/${type}/${id}/`, { method: 'DELETE' });
      fetchMapData();
    } catch (e) {
      alert('Ошибка при удалении');
    }
  };

  const renameMarker = async (type: string, id: string, currentName: string, nameField: string = 'name') => {
    const newName = prompt('Введите новое название:', currentName);
    if (!newName || newName === currentName) return;
    try {
      await apiFetch(`/map-data/${type}/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ [nameField]: newName }),
      });
      fetchMapData();
    } catch (e) {
      alert('Ошибка при переименовании');
    }
  };

  const selectedSummary = useMemo(() => {
    if (!selectedDistrictId) return null
    const danger = districtDanger[selectedDistrictId] ?? 'medium'
    const name = districtNameById.get(selectedDistrictId) ?? selectedDistrictId
    
    // Find district geometry to filter objects geographically
    const districtFeature = districtsFC.features.find((f: any) => String(f.properties?.id) === selectedDistrictId);
    let districtIncidents = incidents;
    let districtCameras = cameras;
    let districtObjects = objects;

    if (districtFeature && districtFeature.geometry) {
       const geom = districtFeature.geometry;
       districtIncidents = incidents.filter(i => pointInArea([i.lng, i.lat], (geom as any).coordinates as any, geom.type));
       districtCameras = cameras.filter(c => pointInArea([c.lng, c.lat], (geom as any).coordinates as any, geom.type));
       districtObjects = objects.filter(o => pointInArea([o.lng, o.lat], (geom as any).coordinates as any, geom.type));
    } else {
       // fallback if geometry missing
       districtIncidents = incidents.filter((i) => i.districtId === selectedDistrictId);
       districtCameras = cameras.filter((c) => c.districtId === selectedDistrictId);
       districtObjects = objects.filter((o) => o.districtId === selectedDistrictId);
    }

    return {
      districtId: selectedDistrictId,
      districtName: name,
      danger,
      incidents: districtIncidents,
      cameras: districtCameras,
      objects: districtObjects,
    }
  }, [districtNameById, selectedDistrictId, districtDanger, incidents, cameras, objects, districtsFC])

  return (
    <PageShell
      title="Карта"
      right={
        <div className="flex flex-wrap items-center justify-end gap-3 lg:gap-4">
          <div className="flex items-center gap-1 rounded-[100px] bg-[#f1f5f9] p-1 border border-slate-200">
            {(['districts', 'incidents', 'cameras', 'objects'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setLayers((p) => ({ ...p, [k]: !p[k] }))}
                className={cn(
                  'rounded-[100px] px-4 py-1.5 text-[13px] font-medium transition outline-none',
                  layers[k]
                    ? 'bg-[#0B1221] text-white shadow-md shadow-[#0B1221]/20'
                    : 'text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-200'
                )}
              >
                {layerLabel(k)}
              </button>
            ))}
          </div>

          <div className="hidden h-5 w-px bg-slate-200 xl:block" />

          <div className="hidden items-center gap-3 text-[13px] xl:flex">
            <span className="text-slate-400">Опасность:</span>
            <span className="flex items-center gap-1.5">
              <span className="size-[6px] rounded-full bg-[#22c55e]" />
              <span className="text-slate-700">низк.</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-[6px] rounded-full bg-[#eab308]" />
              <span className="text-slate-700">средн.</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-[6px] rounded-full bg-[#ef4444]" />
              <span className="text-slate-700">высок.</span>
            </span>
          </div>

          <div className="hidden h-5 w-px bg-slate-200 xl:block" />

          <div className="flex items-center gap-1 rounded-[100px] bg-[#f1f5f9] p-1 border border-slate-200">
            <button
              onClick={() => setMapType('schema')}
              className={cn(
                'rounded-[100px] px-3 py-1.5 text-[13px] font-medium transition cursor-pointer',
                mapType === 'schema' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              )}
            >
              Схема
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={cn(
                'rounded-[100px] px-3 py-1.5 text-[13px] font-medium transition cursor-pointer',
                mapType === 'satellite' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              )}
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
            bounds={[
              [46.95, 51.82],
              [47.25, 52.08],
            ]}
          >
            <GeomanControls reloadData={fetchMapData} districtsFC={districtsFC} />
            {mapType === 'schema' ? (
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            ) : (
              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            )}

            {layers.districts && districtsFC.features.length > 0 ? (
              <GeoJSON
                key={JSON.stringify(districtsFC)} // Force remount to apply color changes accurately on leaflet layers
                data={districtsFC as never}
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
                        {isAdmin && (
                          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                            <button className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100" onClick={() => renameMarker('crimes', i.id, i.title, 'title')}>Изменить</button>
                            <button className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100" onClick={() => deleteMarker('crimes', i.id)}>Удалить</button>
                          </div>
                        )}
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
                        {isAdmin && (
                          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                            <button className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100" onClick={() => renameMarker('cameras', c.id, c.name, 'name')}>Изменить</button>
                            <button className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100" onClick={() => deleteMarker('cameras', c.id)}>Удалить</button>
                          </div>
                        )}
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
                        {isAdmin && (
                          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                            <button className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100" onClick={() => renameMarker('social-objects', o.id, o.name, 'name')}>Изменить</button>
                            <button className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100" onClick={() => deleteMarker('social-objects', o.id)}>Удалить</button>
                          </div>
                        )}
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
              <div className="font-semibold text-slate-900">Районы Атырау</div>
              <div className="mt-2 text-sm text-slate-600">
                Нажмите на район на карте, чтобы посмотреть подробную информацию об инцидентах, камерах и объектах.
              </div>

              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                Сейчас уровни опасности заданы вручную (зел/жёлт/красн). Позже их
                будет рассчитывать AI‑анализ.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold">{selectedSummary.districtName}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Район ID: {selectedSummary.districtId}
                  </div>
                </div>
                {isAdmin && (
                  <button onClick={() => renameDistrict(selectedSummary.districtId, selectedSummary.districtName)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-lg">Изменить название</button>
                )}
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

              {isAdmin && (
                <div className="flex flex-wrap gap-2 mt-1 mb-2">
                   <span className="text-xs w-full text-slate-500">Задать опасность (Админ):</span>
                   <button onClick={() => updateDistrictDanger(selectedSummary.districtId, 1.0)} className="text-[11px] font-semibold border px-2 py-1 rounded-lg bg-green-50 text-green-700 border-green-200 hover:bg-green-100">Низкий (Зел)</button>
                   <button onClick={() => updateDistrictDanger(selectedSummary.districtId, 5.0)} className="text-[11px] font-semibold border px-2 py-1 rounded-lg bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Средний (Жел)</button>
                   <button onClick={() => updateDistrictDanger(selectedSummary.districtId, 9.0)} className="text-[11px] font-semibold border px-2 py-1 rounded-lg bg-red-50 text-red-700 border-red-200 hover:bg-red-100">Высокий (Красн)</button>
                </div>
              )}

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

              {isAdmin && (
                <button
                  type="button"
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  onClick={() => alert('Скоро: запуск еженедельного AI‑анализа для выбранного района')}
                >
                  Запустить AI‑анализ района (демо)
                </button>
              )}

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

