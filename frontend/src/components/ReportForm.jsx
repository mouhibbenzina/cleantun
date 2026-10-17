import { useState } from 'react';
import { api } from '../api';
import { toast } from '../toast.jsx';
import { TYPES, TYPE_ICONS, TYPE_LABELS, geolocate } from '../constants';

export default function ReportForm({ onClose, onSuccess, position, setPosition, picking, setPicking }) {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onPhoto = (e) => {
    const file = e.target.files?.[0] || null;
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhoto(file);
    setPhotoUrl(file ? URL.createObjectURL(file) : null);
  };

  const locateMe = async () => {
    setError('');
    try {
      setPosition(await geolocate());
    } catch (err) {
      setError(err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!type || !position) {
      setError('Type et position sont obligatoires');
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.set('type', type);
      form.set('lat', String(position.lat));
      form.set('lng', String(position.lng));
      if (description) form.set('description', description);
      if (city) form.set('city', city);
      if (photo) form.set('photo', photo);
      await api.createReport(form);
      toast('Signalement envoyé · +10 points');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const chip = (value) =>
    `flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition cursor-pointer ${
      type === value
        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-medium'
        : 'border-gray-300 text-gray-600 hover:border-gray-400'
    }`;

  return (
    <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Nouveau signalement</h2>
          <button onClick={onClose} className="text-2xl leading-none text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Type de problème</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((value) => (
                <button key={value} type="button" onClick={() => setType(value)} className={chip(value)}>
                  <span>{TYPE_ICONS[value]}</span>
                  {TYPE_LABELS[value]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Position</label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPicking(!picking)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  picking ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-300 text-gray-600'
                }`}
              >
                {picking ? 'Cliquez sur la carte…' : '📍 Placer sur la carte'}
              </button>
              <button
                type="button"
                onClick={locateMe}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:border-gray-400"
              >
                🎯 Ma position
              </button>
            </div>
            {position && (
              <p className="mt-2 text-xs text-gray-500">
                {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Photo (optionnelle)</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onPhoto}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-emerald-700"
            />
            {photoUrl && <img src={photoUrl} alt="Aperçu" className="mt-3 h-32 rounded-lg object-cover" />}
          </div>

          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder="Ville / quartier (ex : Bab Souika, Tunis)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder="Description (optionnelle)"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy ? 'Envoi…' : 'Envoyer le signalement'}
          </button>
        </form>
      </div>
    </div>
  );
}
