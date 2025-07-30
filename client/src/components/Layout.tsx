import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { HouseDoorFill, PeopleFill, List, BarChartLineFill } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Manejo de usuario no autenticado
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-blue-50">
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <p className="text-lg text-gray-700 mb-4 font-semibold">No estás autenticado.</p>
          <NavLink to="/login" className="text-blue-600 hover:underline font-medium">Iniciar sesión</NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-blue-50 font-sans">
      {/* --- Barra Lateral (Sidebar) --- */}
      <aside 
        className={`relative transition-all duration-300 ease-in-out flex flex-col border-r border-gray-200 shadow-xl ${isCollapsed ? 'w-24' : 'w-64'} bg-white/90 backdrop-blur`}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center pt-6 pb-4 border-b border-gray-100">
            <a href="/dashboard" className="flex items-center justify-center w-full">
              <div className="bg-blue-50 rounded-full p-2 shadow-sm">
                <img 
                  src="/logo-icon.png" 
                  alt="MyKap Logo" 
                  className="h-10 mx-auto transition-all duration-300"
                />
              </div>
            </a>
            <button
              onClick={() => setIsCollapsed(false)}
              className="mt-6 p-2 rounded-full hover:bg-blue-100 transition-colors mx-auto shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Expandir barra lateral"
            >
              <List size={28} />
            </button>
          </div>
        ) : (
          <div className="flex flex-row items-center justify-center pt-8 pb-4 border-b border-gray-100 gap-4">
            <a href="/dashboard" className="flex items-center">
              <div className="bg-blue-50 rounded-2xl p-2 shadow-md flex items-center justify-center">
                <img 
                  src="/logo-full.png" 
                  alt="MyKap Logo" 
                  className="h-16 transition-all duration-300"
                />
              </div>
            </a>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 rounded-full hover:bg-blue-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Colapsar barra lateral"
            >
              <List size={28} />
            </button>
          </div>
        )}
        <nav className="flex-grow p-2 mt-2">
          <ul>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg transition-all duration-200 text-gray-600 hover:bg-blue-100 hover:text-blue-700 ${isActive ? 'bg-blue-200 text-blue-800 font-bold shadow' : ''} ${isCollapsed ? 'justify-center' : ''}`}> 
                <HouseDoorFill size={22} className="transition-colors" />
                {!isCollapsed && <span className="ml-4 text-base">Dashboard</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/prospects" className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg transition-all duration-200 text-gray-600 hover:bg-blue-100 hover:text-blue-700 ${isActive ? 'bg-blue-200 text-blue-800 font-bold shadow' : ''} ${isCollapsed ? 'justify-center' : ''}`}> 
                <BarChartLineFill size={22} className="transition-colors" />
                {!isCollapsed && <span className="ml-4 text-base">Prospects</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/credits" className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg transition-all duration-200 text-gray-600 hover:bg-blue-100 hover:text-blue-700 ${isActive ? 'bg-blue-200 text-blue-800 font-bold shadow' : ''} ${isCollapsed ? 'justify-center' : ''}`}> 
                <PeopleFill size={22} className="transition-colors" />
                {!isCollapsed && <span className="ml-4 text-base">Credits</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/lenders" className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg transition-all duration-200 text-gray-600 hover:bg-blue-100 hover:text-blue-700 ${isActive ? 'bg-blue-200 text-blue-800 font-bold shadow' : ''} ${isCollapsed ? 'justify-center' : ''}`}> 
                <PeopleFill size={22} className="transition-colors" />
                {!isCollapsed && <span className="ml-4 text-base">Lenders</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* --- Contenido Principal --- */}
      <main className="flex-1 flex flex-col min-h-0">
         <header className="bg-white/90 backdrop-blur shadow-md border-b border-gray-200 p-6 flex items-center justify-end">
            <div className="relative" ref={dropdownRef}>
                <button
                  className="bg-blue-50 text-blue-700 rounded-full font-bold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md transition-all duration-200 hover:bg-blue-100"
                  style={{width: '44px', height: '44px'}}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  aria-label="Menú de usuario"
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  {userInitial}
                </button>
                {dropdownOpen && (
                  <ul
                    className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 animate-fade-in"
                    role="menu"
                    aria-label="Menú de usuario"
                  >
                    <li className="px-4 pt-2 pb-1">
                      <span className="font-bold block text-lg">{user.firstName} {user.lastName}</span>
                      <small className="text-gray-500">{user.email}</small>
                    </li>
                    <li><hr className="my-2 border-gray-200" /></li>
                    <li>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded transition-colors"
                        role="menuitem"
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate('/settings');
                        }}
                      >
                        Settings
                      </button>
                    </li>
                    <li><hr className="my-2 border-gray-200" /></li>
                    <li>
                      <button
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        role="menuitem"
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                      >
                        Log Out
                      </button>
                    </li>
                  </ul>
                )}
            </div>
         </header>
         <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-white via-blue-50 to-gray-100">
           <div className="max-w-7xl mx-auto">
             <Outlet />
           </div>
         </div>
      </main>
    </div>
  );
}

// Animación fade-in para el menú de usuario
// Agrega esto a tu CSS global o tailwind.config.js si usas Tailwind JIT:
// .animate-fade-in { animation: fadeIn 0.2s ease; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }