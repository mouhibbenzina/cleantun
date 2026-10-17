import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { TYPES, STATUSES, TYPE_LABELS, STATUS_LABELS, geolocate } from '../constants';
import MapView from '../components/MapView.jsx';
import ReportForm from '../components/ReportForm.jsx';
import ReportList from '../components/ReportList.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { toast } from '../toast.jsx';

export default function MapPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({ type: '', status: '', near: false });
  const [selectedId, setSelectedId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const [picking, setPicking] = useState(false);
  const [userPos, setUserPos] = useState(null);

  const load = useCallback(async () => {
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.status) params.status = filters.status;
    if (filters.near && userPos) {
      params.lat = userPos.lat;
      params.lng = userPos.lng;
      params.radius = 5;
    }
    try {
      setReports(await api.reports(params));
    } catch (err) {
      toast(err.message);
    }
  }, [filters, userPos]);

  useEffect(() => {
    load();
  }, [load]);

  const enableNear = async () => {
    try {
      const pos = await geolocate();
      setUserPos(pos);
      setFilters((f) => ({ ...f, near: true }));
    } catch (err) {
      toast(err.message);
    }
  };

  const openForm = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setPosition(null);
    setFormOpen(true);
  };

  const select = (id) => {
    setSelectedId(id === selectedId ? null : id);
  };

  const selectClass =
    'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none';

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      <MapView
        reports={reports}
        selectedId={selectedId}
        onSelect={select}
        userPos={userPos}
        preview={position}
        picking={picking}
        onMapClick={(latlng) => {
          setPosition(latlng);
          setPicking(false);
        }}
      />

      <div className="absolute top-4 left-4 z-[900] flex flex-wrap items-center gap-2 rounded-2xl bg-white/95 p-2 shadow-lg backdrop-blur">
        <select
          className={selectClass}
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">Tous les types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Tous les statuts</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          onClick={filters.near ? () => setFilters({ ...filters, near: false }) : enableNear}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            filters.near ? 'bg-emerald-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          }`}
        >
          📍 Près de moi
        </button>
      </div>

      <button
        onClick={openForm}
        className="absolute right-4 bottom-6 z-[900] flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 md:right-[22rem]"
      >
        ＋ Signaler
      </button>

      <ReportList reports={reports} selectedId={selectedId} onSelect={select} />

      {formOpen && (
        <ReportForm
          onClose={() => {
            setFormOpen(false);
            setPicking(false);
          }}
          onSuccess={load}
          position={position}
          setPosition={setPosition}
          picking={picking}
          setPicking={setPicking}
        />
      )}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}
