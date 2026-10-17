import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          city: form.city || undefined,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const input =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200';

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex rounded-full bg-gray-100 p-1">
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError('');
              }}
              className={`flex-1 rounded-full py-1.5 text-sm font-medium transition ${
                mode === m ? 'bg-white text-emerald-700 shadow' : 'text-gray-500'
              }`}
            >
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <>
              <input className={input} placeholder="Nom complet" value={form.name} onChange={set('name')} required />
              <input className={input} placeholder="Ville (ex : Tunis)" value={form.city} onChange={set('city')} />
            </>
          )}
          <input
            className={input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={set('email')}
            required
          />
          <input
            className={input}
            type="password"
            placeholder="Mot de passe (6+ caractères)"
            value={form.password}
            onChange={set('password')}
            required
            minLength={6}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy ? 'Patientez…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Gagnez des points en signalant les déchets de votre quartier.
        </p>
      </div>
    </div>
  );
}
