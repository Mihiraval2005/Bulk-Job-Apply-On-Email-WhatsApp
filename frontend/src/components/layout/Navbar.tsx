import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store.ts';

const navLinks = [
  { path: '/resume',    label: 'Resume' },
  { path: '/jobs',      label: 'Jobs' },
  { path: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/dashboard" className="text-xl font-bold text-blue-600">
        BulkApply
      </Link>

      <div className="flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-sm font-medium transition-colors ${
              location.pathname === link.path
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user?.fullName}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
