import { useEffect, useState } from 'react';
import { api } from '../api';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const [stats, setStats] = useState(null);
  const [board, setBoard] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.stats(), api.leaderboard()])
      .then(([s, b]) => {
        setStats(s);
        setBoard(b);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
  if (!stats) return <p className="p-8 text-center text-gray-400">Chargement…</p>;

  const resolved = stats.byStatus.find((s) => s.status === 'resolved')?.count || 0;

  const cards = [
    { label: 'Signalements', value: stats.reports, icon: '🗑️' },
    { label: 'Résolus', value: resolved, icon: '✅' },
    { label: 'Citoyens engagés', value: stats.users, icon: '🇹🇳' },
    { label: 'Points cumulés', value: stats.points, icon: '⭐' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Impact communautaire</h1>
      <p className="mb-6 text-sm text-gray-500">
        Ensemble, les citoyens améliorent leur quartier — chaque signalement compte.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="text-2xl">{card.icon}</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-500">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <h2 className="border-b border-gray-100 px-5 py-4 font-bold text-gray-900">Top 10 citoyens</h2>
          {board.length === 0 ? (
            <p className="p-5 text-sm text-gray-400">Aucun citoyen inscrit pour le moment.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {board.map((user, i) => (
                <li key={user.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-8 text-lg">{MEDALS[i] || `#${i + 1}`}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.city || 'Tunisie'}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{user.points} pts</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <h2 className="border-b border-gray-100 px-5 py-4 font-bold text-gray-900">Par ville</h2>
            <ul className="divide-y divide-gray-100">
              {stats.byCity.length === 0 && (
                <li className="px-5 py-4 text-sm text-gray-400">Aucune donnée.</li>
              )}
              {stats.byCity.map((row) => (
                <li key={row.city} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span className="text-gray-700">{row.city}</span>
                  <span className="font-semibold text-gray-900">{row.count}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <h2 className="border-b border-gray-100 px-5 py-4 font-bold text-gray-900">Par statut</h2>
            <ul className="divide-y divide-gray-100">
              {stats.byStatus.length === 0 && (
                <li className="px-5 py-4 text-sm text-gray-400">Aucune donnée.</li>
              )}
              {stats.byStatus.map((row) => (
                <li key={row.status} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span className="flex items-center gap-2 text-gray-700">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[row.status] }}
                    />
                    {STATUS_LABELS[row.status]}
                  </span>
                  <span className="font-semibold text-gray-900">{row.count}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
