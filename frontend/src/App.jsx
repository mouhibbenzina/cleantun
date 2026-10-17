import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Header from './components/Header.jsx';
import MapPage from './pages/MapPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import { ToastHost } from './toast.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/classement" element={<LeaderboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <ToastHost />
      </BrowserRouter>
    </AuthProvider>
  );
}
