import { useCallback, useEffect, useState } from 'react';
import { api, assetUrl } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { TYPES, STATUSES, TYPE_ICONS, TYPE_LABELS, STATUS_LABELS, STATUS_COLORS, formatDate } from '../constants';
import StatusBadge from '../components/StatusBadge.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { toast } from '../toast.jsx';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [r, u, s] = await Promise.all([api.adminReports(), api.adminUsers(), api.stats()]);
      setReports(r);
      setUsers(u);
      setStats(s);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.role === 'admin') load();
  }, [user, load]);

  if (loading) return <p className="p-8 text-center text-gray-400">Chargement…</p>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="text-4xl">🛡️</div>
          <h1 className="mt-3 text-lg font-bold text-gray-900">Espace administrateur</h1>
          <p className="mt-2 text-sm text-gray-500">Connectez-vous avec un compte admin pour modérer les signalements.</p>
          <button
            onClick={() => setAuthOpen(true)}
            className="mt-5 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Se connecter
          </button>
        </div>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="text-4xl">🔒</div>
          <h1 className="mt-3 text-lg font-bold text-gray-900">Accès réservé</h1>
          <p className="mt-2 text-sm text-gray-500">
            Vous êtes connecté en tant que citoyen ({user.name}). Ce tableau de bord est réservé aux administrateurs.
          </p>
        </div>
      </div>
    );
  }

  const changeStatus = async (id, status) => {
    try {
      await api.updateReport(id, { status });
      toast('Statut mis à jour');
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer définitivement ce signalement ?')) return;
    try {
      await api.deleteReport(id);
      toast('Signalement supprimé');
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  const cards = [
    { label: 'Signalements', value: stats?.reports ?? 0, icon: '🗑️' },
    { label: 'Utilisateurs', value: stats?.users ?? 0, icon: '👥' },
    { label: 'Points distribués', value: stats?.points ?? 0, icon: '⭐' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Tableau de bord admin</h1>
      <p className="mb-6 text-sm text-gray-500">Modération des signalements et suivi de la communauté.</p>

      <div className="mb-8 grid grid-cols-3 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="text-xl">{card.icon}</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-500">{card.label}</div>
          </div>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <section className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-gray-900">Signalements ({reports.length})</h2>
          <button onClick={load} className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">
            ↻ Actualiser
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs text-gray-400">
              <tr>
                <th className="px-4 py-3">Lieu</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Auteur</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {report.photo && (
                        <img src={assetUrl(report.photo)} alt="" className="h-9 w-9 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{report.city || '—'}</p>
                        <p className="text-xs text-gray-400">{report.address || `${report.lat.toFixed(3)}, ${report.lng.toFixed(3)}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {TYPE_ICONS[report.type]} {TYPE_LABELS[report.type]}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{report.author_name || 'Anonyme'}</p>
                    <p className="text-xs text-gray-400">{report.author_email || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(report.created_at)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={report.status}
                      onChange={(e) => changeStatus(report.id, e.target.value)}
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                      style={{ color: STATUS_COLORS[report.status] }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(report.id)}
                      className="rounded-lg px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <h2 className="border-b border-gray-100 px-5 py-4 font-bold text-gray-900">Utilisateurs ({users.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs text-gray-400">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3">Signalements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.city || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === 'admin' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {u.role === 'admin' ? 'Admin' : 'Citoyen'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">{u.points}</td>
                  <td className="px-4 py-3 text-gray-600">{u.report_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-4 text-center text-xs text-gray-400">
        <StatusBadge status="reported" className="mr-1" />
        Astuce : créez un compte admin directement en base ou connectez-vous avec admin@cleantun.tn (démo).
      </p>
    </div>
  );
}
