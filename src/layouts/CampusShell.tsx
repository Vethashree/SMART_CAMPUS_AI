import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bot,
  Users,
  BookOpen,
  Bell,
  MessageSquare,
  CreditCard,
  Star,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import AIChat from '../components/AIChat';
import LoginModal from '../components/LoginModal';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/' },
  { label: 'Assistant', to: '/assistant' },
  { label: 'Test Marks', to: '/test-marks' },
  { label: 'Settings', to: '/preferences' },
];

const QUICK_ACTIONS = [
  { icon: Users, label: 'My Profile', to: '/' },
  { icon: BookOpen, label: 'Library', to: '/library' },
  { icon: CreditCard, label: 'Payments', to: '/' },
  { icon: Star, label: 'Rating', to: '/' },
];

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'AI Attendance Alert',
    message:
      'Your attendance in Data Structures is below 75%. Consider attending the next class.',
    type: 'warning',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    title: 'Performance Prediction',
    message:
      'AI suggests focusing on Machine Learning concepts for better exam performance.',
    type: 'info',
    timestamp: '1 day ago',
  },
  {
    id: '3',
    title: 'Smart Timetable Update',
    message:
      'AI has optimized your timetable to avoid conflicts. Check the new schedule.',
    type: 'success',
    timestamp: '2 days ago',
  },
];

export const AIRobot = () => (
  <div className="relative">
    <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
      <Bot className="w-16 h-16 text-white animate-bounce" />
    </div>
    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
      <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white">
        AI Active
      </div>
    </div>
  </div>
);

export default function CampusShell() {
  const { currentUser, isLoggedIn, showAIChat, setShowAIChat, login, logout } = useSession();
  const [showLogin, setShowLogin] = useState(!isLoggedIn);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = (user: Parameters<typeof login>[0]) => {
    login(user);
    setShowLogin(false);
  };

  const handleLogout = () => {
    logout();
    setShowLogin(true);
    setShowNotifications(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SERA</span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.to
                      ? 'text-blue-400'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <button
                onClick={() => setShowAIChat(!showAIChat)}
                className="relative p-2 text-slate-400 hover:text-blue-400 transition-colors"
                disabled={!isLoggedIn}
              >
                <MessageSquare className="w-5 h-5" />
                {isLoggedIn && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                )}
              </button>

              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-white">{currentUser.name}</div>
                    <div className="text-xs text-slate-400 capitalize">
                      {currentUser.role} • {currentUser.id}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300"
                >
                  Login
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-4 py-4 space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.to
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Quick Actions Sidebar */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30 hidden lg:block">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-2 space-y-2">
          {QUICK_ACTIONS.map((action, idx) => (
            <Link
              key={idx}
              to={action.to}
              className="w-12 h-12 bg-slate-700 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors group"
              title={action.label}
            >
              <action.icon className="w-5 h-5 text-slate-300 group-hover:text-white" />
            </Link>
          ))}
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && isLoggedIn && (
        <div className="fixed top-16 right-4 w-80 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
          </div>
          <div className="p-4 space-y-3">
            {NOTIFICATIONS.map((notif) => (
              <div key={notif.id} className="p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">{notif.title}</h4>
                  <span className="text-xs text-slate-400">{notif.timestamp}</span>
                </div>
                <p className="text-sm text-slate-300">{notif.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Chat Panel */}
      <AIChat isOpen={showAIChat && isLoggedIn} onClose={() => setShowAIChat(false)} currentUser={currentUser} />

      {/* Login Modal */}
      <LoginModal isOpen={showLogin} onClose={() => !isLoggedIn && setShowLogin(false)} onLogin={handleLogin} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoggedIn ? (
          <Outlet />
        ) : (
          <div className="text-center py-20">
            <div className="mb-8">
              <AIRobot />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to SERA</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Please login to access your personalized dashboard with AI-powered features,
              smart attendance, predictive analytics, and more.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Get Started - Login Now
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/30 border-t border-slate-700 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Bot className="w-6 h-6 text-blue-400" />
              <span className="text-lg font-semibold text-white">SERA</span>
            </div>
            <p className="text-slate-400 text-sm">
              Student Experience & Resource Assistant — an adaptive campus concierge
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-sm text-slate-400">
              <span>© 2026 SERA</span>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
