import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LendersPage from './pages/LendersPage';
import ProspectsPage from './pages/ProspectsPage';
import CreditsPage from './pages/CreditsPage';

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Ruta por defecto para usuarios no logueados */}
      <Route path="/" element={<LoginPage />} />

      {/* Rutas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/prospects" element={<ProspectsPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          {/* Aquí añadiremos las rutas a /prospects, /credits y /lenders (funders) */}
          <Route path="/lenders" element={<LendersPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
