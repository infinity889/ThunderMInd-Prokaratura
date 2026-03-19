import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

if (typeof window !== 'undefined') {
  // @ts-ignore
  window.L = L
}

import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useAdmin } from '../../shared/lib/useAdmin'
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import { PageShell } from '../_ui/PageShell'
import { apiFetch } from '../../shared/api/apiClient'

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

function GeomanControls({ reloadData, districtsFC }: { reloadData: () => void, districtsFC: FeatureCollection }) {
  const map = useMap();
  useEffect(() => {
    try {
      const isAdmin = localStorage.getItem('is_admin') === 'true';
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
        });
        
        const handleCreate = async (e: any) => {
          const geojson = e.layer.toGeoJSON();
          
          if (e.shape === 'Marker') {
             const typeStr = prompt('Что добавляем?\n1 - Инцидент\n2 - Камера\n3 - Социальный объект');
             if (!typeStr) {
                map.removeLayer(e.layer);
                return;
             }
             const lng = geojson.geometry.coordinates[0];
             const lat = geojson.geometry.coordinates[1];
             
             let detectedDistrictId: number | null = null;
             for (const d of districtsFC.features) {
                if (d.geometry && pointInArea([lng, lat], (d.geometry as any).coordinates as any, d.geometry.type)) {
                   detectedDistrictId = parseInt(d.properties?.id as string, 10);
                   break;
                }
             }

             if (!detectedDistrictId) {
                const proceed = confirm('Точка находится вне зарегистрированных районов. Сохранить без привязки к району?');
                if (!proceed) {
                   map.removeLayer(e.layer);
                   return;
                }
             }
             
             const districtPK = detectedDistrictId;
             
             try {
                 if (typeStr === '1') {
                    const title = prompt('Название инцидента (например: Кража велосипеда):') || 'Без названия';
                    await apiFetch('/map-data/crimes/', {
                      method: 'POST',
                      body: JSON.stringify({
                        title,
                        crime_type: 'other',
                        district: districtPK,
                        latitude: lat,
                        longitude: lng,
                        date_committed: new Date().toISOString()
                      })
                    });
                 } else if (typeStr === '2') {
                    const name = prompt('Название камеры (например: Перекресток Абая):') || 'Новая камера';
                    await apiFetch('/map-data/cameras/', {
                      method: 'POST',
                      body: JSON.stringify({
                        name,
                        district: districtPK,
                        latitude: lat,
                        longitude: lng,
                        status: 'online'
                      })
                    });
                 } else if (typeStr === '3') {
                    const name = prompt('Название соц. объекта (например: Школа №1):') || 'Новый объект';
                    await apiFetch('/map-data/social-objects/', {
                      method: 'POST',
                      body: JSON.stringify({
                        name,
                        object_type: 'other',
                        district: districtPK,
                        latitude: lat,
                        longitude: lng
                      })
                    });
                 } else {
                    alert('Неверный выбор.');
                 }
             } catch (err: any) {
                 console.error(err);
                 const details = err.details ? JSON.stringify(err.details) : err.message;
                 alert(`Ошибка при сохранении объекта. Детали: ${details}`);
             }
             map.removeLayer(e.layer);
             reloadData();
             return;
          }
          
          // If shape is Polygon/Rectangle (District)
          try {
            await apiFetch('/map-data/districts/', {
              method: 'POST',
              body: JSON.stringify({
                name: 'Новый район ' + Date.now().toString().slice(-4),
                risk_score: 5.0,
                coordinates: geojson.geometry
              })
            });
            map.removeLayer(e.layer);
            reloadData();
          } catch (error) {
            console.error(error);
            alert('Ошибка при сохранении района');
          }
        };

        const handleRemove = async (e: any) => {
          if (e.layer.feature && e.layer.feature.properties && e.layer.feature.properties.id) {
            const id = e.layer.feature.properties.id;
            try {
              await apiFetch(`/map-data/districts/${id}/`, {
                method: 'DELETE'
              });
              reloadData();
            } catch (error) {
              console.error(error);
              alert('Ошибка при удалении района');
            }
          }
        };

        map.on('pm:create', handleCreate);
        map.on('pm:remove', handleRemove);
        
        return () => {
          map.off('pm:create', handleCreate);
          map.off('pm:remove', handleRemove);
        };
      } else if (map.pm && !isAdmin) {
         // ensure controls are removed if previously added but admin status changed
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
         });
      }
    } catch (err) {
      console.error('Geoman setup error', err);
    }
  }, [map, reloadData, districtsFC]);
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
  const isAdmin = useAdmin()
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    districts: true,
    incidents: true,
    cameras: true,
    objects: true,
  })
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

  const districtCards = useMemo((): DistrictCard[] => {
    const cards: DistrictCard[] = []
    for (const f of districtsFC.features) {
      const id = (f.properties as { id?: string }).id
      const name = (f.properties as { name?: string }).name
      if (!id || !name) continue
      const danger = districtDanger[id] ?? 'medium'
      
      const geom = f.geometry;
      let incCount = 0, camCount = 0, objCount = 0;
      
      if (geom) {
        incCount = incidents.filter(i => pointInArea([i.lng, i.lat], (geom as any).coordinates as any, geom.type)).length;
        camCount = cameras.filter(c => pointInArea([c.lng, c.lat], (geom as any).coordinates as any, geom.type)).length;
        objCount = objects.filter(o => pointInArea([o.lng, o.lat], (geom as any).coordinates as any, geom.type)).length;
      }
      
      cards.push({
        id,
        name,
        danger,
        incidentsCount: incCount,
        camerasCount: camCount,
        objectsCount: objCount,
      })
    }
    return cards
  }, [districtsFC, districtDanger, incidents, cameras, objects])

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
            <GeomanControls reloadData={fetchMapData} districtsFC={districtsFC} />
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

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
                Нажмите на карточку района или кликните по району на карте.
              </div>

              <div className="mt-3 grid gap-2">
                {districtCards.map((d) => {
                  const colors = dangerColors(d.danger)
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDistrictId(d.id)}
                      className="group w-full rounded-2xl border border-slate-200 bg-white p-3 text-left hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {d.name}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <span
                              className="inline-block size-3 rounded-sm"
                              style={{ background: colors.fill }}
                              aria-hidden
                            />
                            <span className="capitalize">
                              опасность: {dangerLabel(d.danger)}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-xs text-slate-500">ID: {d.id}</div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                          <div className="text-[11px] text-slate-500">Инциденты</div>
                          <div className="mt-0.5 text-base font-semibold text-slate-900">
                            {d.incidentsCount}
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                          <div className="text-[11px] text-slate-500">Камеры</div>
                          <div className="mt-0.5 text-base font-semibold text-slate-900">
                            {d.camerasCount}
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                          <div className="text-[11px] text-slate-500">Объекты</div>
                          <div className="mt-0.5 text-base font-semibold text-slate-900">
                            {d.objectsCount}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
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

