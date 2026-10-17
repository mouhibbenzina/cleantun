import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition ${
      isActive ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <header className="relative z-[1000] flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
        <span className="text-2xl">♻️</span>
        Clean<span className="text-emerald-600">Tun</span>
      </Link>

      <nav className="flex items-center gap-1">
        <NavLink to="/" className={linkClass} end>
          Carte
        </NavLink>
        <NavLink to="/classement" className={linkClass}>
          Classement
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={linkClass}>
            Admin
          </NavLink>
        )}
      </nav>

      <div className="flex items-center gap-3 text-sm">
        {user ? (
          <>
            <span className="hidden text-gray-600 sm:inline">
              {user.name} · <b className="text-emerald-600">{user.points} pts</b>
            </span>
            <button
              onClick={logout}
              className="rounded-full border border-gray-300 px-3 py-1.5 text-gray-600 hover:bg-gray-50"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <span className="text-xs text-gray-400">Invité</span>
        )}
      </div>
    </header>
  );
}
