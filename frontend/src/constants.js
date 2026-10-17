export const TYPES = ['dump', 'overflow', 'burning', 'recycling', 'water', 'other'];
export const STATUSES = ['reported', 'in_progress', 'resolved', 'rejected'];

export const TYPE_LABELS = {
  dump: 'Décharge sauvage',
  overflow: 'Poubelle débordante',
  burning: 'Brûlage',
  recycling: 'Recyclage',
  water: 'Déchet aquatique',
  other: 'Autre',
};

export const TYPE_ICONS = {
  dump: '🗑️',
  overflow: '🛢️',
  burning: '🔥',
  recycling: '♻️',
  water: '💧',
  other: '⚠️',
};

export const STATUS_LABELS = {
  reported: 'Signalé',
  in_progress: 'En cours',
  resolved: 'Résolu',
  rejected: 'Rejeté',
};

export const STATUS_COLORS = {
  reported: '#f59e0b',
  in_progress: '#3b82f6',
  resolved: '#10b981',
  rejected: '#6b7280',
};

export function formatDate(value) {
  if (!value) return '';
  const iso = String(value).replace(' ', 'T') + 'Z';
  return new Date(iso).toLocaleString('fr-TN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function geolocate() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Géolocalisation non supportée'));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => reject(new Error('Impossible de récupérer votre position')),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}
