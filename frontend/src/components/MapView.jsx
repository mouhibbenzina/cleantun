import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { assetUrl } from '../api';
import { STATUS_COLORS, STATUS_LABELS, TYPE_ICONS, TYPE_LABELS, formatDate } from '../constants';

const statusIcon = (status) =>
  L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${STATUS_COLORS[status]};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const previewIcon = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;background:#dc2626;border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 18],
});

function ClickHandler({ enabled, onClick }) {
  useMapEvents({
    click: (e) => enabled && onClick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
  }, [target, map]);
  return null;
}

export default function MapView({ reports, selectedId, onSelect, userPos, preview, picking, onMapClick }) {
  const selected = reports.find((r) => r.id === selectedId);

  return (
    <MapContainer
      center={[34.0, 9.5]}
      zoom={6}
      className={`h-full w-full ${picking ? 'cursor-crosshair' : ''}`}
      scrollWheelZoom
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler enabled={picking} onClick={onMapClick} />
      <FlyTo target={selected ? { lat: selected.lat, lng: selected.lng } : null} />

      {userPos && (
        <CircleMarker
          center={[userPos.lat, userPos.lng]}
          radius={9}
          pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.35 }}
        />
      )}

      {preview && <Marker position={[preview.lat, preview.lng]} icon={previewIcon} />}

      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.lat, report.lng]}
          icon={statusIcon(report.status)}
          eventHandlers={{ click: () => onSelect(report.id) }}
        >
          <Popup>
            <div style={{ width: 220 }}>
              <b style={{ fontSize: 14 }}>
                {TYPE_ICONS[report.type]} {TYPE_LABELS[report.type]}
              </b>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                {report.city || '—'} · {report.author_name || 'Anonyme'}
                <br />
                {formatDate(report.created_at)}
              </div>
              {report.photo && (
                <img
                  src={assetUrl(report.photo)}
                  alt=""
                  style={{ width: '100%', borderRadius: 8, marginTop: 8 }}
                />
              )}
              {report.description && <p style={{ fontSize: 13, marginTop: 8 }}>{report.description}</p>}
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 8,
                  fontSize: 11,
                  backgroundColor: STATUS_COLORS[report.status],
                  color: '#fff',
                  padding: '2px 10px',
                  borderRadius: 999,
                }}
              >
                {STATUS_LABELS[report.status]}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
