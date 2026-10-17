import StatusBadge from './StatusBadge.jsx';
import { assetUrl } from '../api';
import { STATUS_COLORS, TYPE_ICONS, TYPE_LABELS } from '../constants';

export default function ReportList({ reports, selectedId, onSelect }) {
  return (
    <aside className="absolute top-4 right-4 bottom-4 z-[900] hidden w-80 flex-col overflow-hidden rounded-2xl bg-white shadow-lg md:flex">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-900">Signalements ({reports.length})</h2>
        <p className="text-xs text-gray-400">Cliquez pour localiser sur la carte</p>
      </div>

      <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
        {reports.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">Aucun signalement pour ces filtres.</p>
        )}
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => onSelect(report.id)}
            className={`block w-full px-4 py-3 text-left transition hover:bg-gray-50 ${
              selectedId === report.id ? 'bg-emerald-50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[report.status] }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {TYPE_ICONS[report.type]} {TYPE_LABELS[report.type]}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {report.city || 'Lieu inconnu'} · {report.author_name || 'Anonyme'}
                  {report.distance_km != null && ` · ${report.distance_km} km`}
                </p>
                <div className="mt-1.5">
                  <StatusBadge status={report.status} />
                </div>
              </div>
              {report.photo && (
                <img src={assetUrl(report.photo)} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              )}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
