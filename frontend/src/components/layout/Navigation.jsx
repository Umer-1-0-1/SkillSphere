import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Home, BookOpen, Users, Compass, User, LogOut } from 'lucide-react';

export const Navigation = () => {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };
  
  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'STUDENT') return '/student';
    if (user.role === 'INSTRUCTOR') return '/instructor';
    if (user.role === 'ADMIN') return '/admin';
    return '/';
  };
  
  const getHomeLink = () => {
    if (isAuthenticated) return getDashboardLink();
    return '/';
  };
  
  const isActive = (path) => {
    if (path === '/' && isAuthenticated) {
      // When logged in, home icon should be active on dashboard pages
      return location.pathname === getDashboardLink();
    }
    return location.pathname === path;
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={getHomeLink()} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#0F0F0F] border border-[#252525] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <span className="text-2xl font-bold text-white" style={{fontFamily: "'Suisse Int'l', sans-serif"}}>SKILLSPHERE</span>
          </Link>
          
          {/* Center Navigation - Icon Based */}
          <div className="hidden md:flex items-center gap-6 bg-[#202020] px-6 py-2 rounded-2xl absolute left-1/2 transform -translate-x-1/2">
            <Link to={getHomeLink()} className={`px-4 py-2 rounded-2xl hover:bg-white transition-all group ${isActive('/') ? 'bg-white' : ''}`} title={isAuthenticated ? "Dashboard" : "Home"}>
              <Home size={24} className={`transition-colors ${isActive('/') ? 'text-black' : 'text-white group-hover:text-black'}`} strokeWidth={2.5} />
            </Link>
            <Link to="/courses" className={`px-4 py-2 rounded-2xl hover:bg-white transition-all group ${isActive('/courses') ? 'bg-white' : ''}`} title="Courses">
              <BookOpen size={24} className={`transition-colors ${isActive('/courses') ? 'text-black' : 'text-white group-hover:text-black'}`} strokeWidth={2.5} />
            </Link>
            <Link to="#" className="px-4 py-2 rounded-2xl hover:bg-white transition-all group" title="Community">
              <Users size={24} className="text-white group-hover:text-black transition-colors" strokeWidth={2.5} />
            </Link>
            <Link to="#" className="px-4 py-2 rounded-2xl hover:bg-white transition-all group" title="Resources">
              <Compass size={24} className="text-white group-hover:text-black transition-colors" strokeWidth={2.5} />
            </Link>
          </div>
          
          {/* Right Navigation */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-[#202020] px-8 py-3 rounded-2xl hover:bg-[var(--muted)] transition-all text-white text-lg"
              >
                Sign Out
              </button>
            ) : (
              <Link 
                to="/login"
                className="bg-[#202020] px-8 py-3 rounded-2xl hover:bg-[var(--muted)] transition-all text-white text-lg"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
