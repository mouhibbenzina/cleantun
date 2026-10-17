import { useEffect, useState } from 'react';

const listeners = new Set();

export function toast(message) {
  listeners.forEach((listener) => listener(message));
}

export function ToastHost() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let timer;
    const listener = (m) => {
      setMessage(m);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 2800);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      clearTimeout(timer);
    };
  }, []);

  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-[1200] -translate-x-1/2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
      {message}
    </div>
  );
}
