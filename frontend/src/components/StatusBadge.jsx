import { STATUS_COLORS, STATUS_LABELS } from '../constants';

export default function StatusBadge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${className}`}
      style={{ backgroundColor: STATUS_COLORS[status] }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
