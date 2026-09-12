import React, { useState, useEffect } from 'react';
import {
  Bot,
  Users,
  Calendar,
  BookOpen,
  Calculator,
  Shield,
  TrendingUp,
  Bell,
  Settings,
  ChevronRight,
  Zap,
  Brain,
  Camera,
  MessageSquare,
  BarChart3,
  CreditCard,
  Star,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import LoginModal from './components/LoginModal';
import AIChat from './components/AIChat';
import SmartAttendance from './components/SmartAttendance';
import AITimetable from './components/AITimetable';
import TestMarks from './components/TestMarks';
import SmartSecurity from './components/SmartSecurity';
import CareerPrediction from './components/CareerPrediction';
import CGPACalculator from './components/CGPACalculator';

interface User {
  name: string;
  role: 'student' | 'faculty' | 'admin';
  id: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User>({
    name: 'Guest',
    role: 'student',
    id: 'GUEST',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [notifications] = useState<Notification[]>([
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
  ]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setCurrentUser({ name: 'Guest', role: 'student', id: 'GUEST' });
    setIsLoggedIn(false);
    setShowLogin(true);
    setActiveModule('dashboard');
    setShowNotifications(false);
    setShowAIChat(false);
    setMobileMenuOpen(false);
  };
  const features = [
    {
      icon: Bot,
      title: 'AI Assistant',
      description: '24/7 virtual assistant for students and staff',
      color: 'from-blue-500 to-purple-600',
      module: 'ai-assistant',
    },
    {
      icon: Camera,
      title: 'Smart Attendance',
      description: 'Face recognition and voice-based attendance',
      color: 'from-green-500 to-teal-600',
      module: 'attendance',
    },
    {
      icon: Brain,
      title: 'Predictive Analytics',
      description: 'Performance prediction and personalized insights',
      color: 'from-orange-500 to-red-600',
      module: 'career-prediction',
    },
    {
      icon: Calendar,
      title: 'Timetable',
      description: 'Intelligent scheduling and conflict resolution',
      color: 'from-indigo-500 to-blue-600',
      module: 'timetable',
    },
    {
      icon: Calculator,
      title: 'CGPA Calculator',
      description: 'Calculate and track your academic performance',
      color: 'from-pink-500 to-rose-600',
      module: 'cgpa-calculator',
    },
    {
      icon: Shield,
      title: 'Smart Security',
      description: 'AI-powered surveillance and anomaly detection',
      color: 'from-yellow-500 to-orange-600',
      module: 'security',
    },
  ];

  const quickActions = [
    {
      icon: Users,
      label: 'My Profile',
      action: () => setActiveModule('profile'),
    },
    {
      icon: BookOpen,
      label: 'Library',
      action: () => setActiveModule('library'),
    },
    {
      icon: CreditCard,
      label: 'Payments',
      action: () => setActiveModule('payments'),
    },
    { icon: Star, label: 'Rating', action: () => setActiveModule('rating') },
  ];

  const stats = [
    {
      label: 'Attendance Rate',
      value: '87%',
      trend: '+2.3%',
      color: 'text-green-400',
    },
    {
      label: 'Performance Score',
      value: '8.4/10',
      trend: '+0.7',
      color: 'text-blue-400',
    },
    {
      label: 'AI Predictions',
      value: '94%',
      trend: '+1.2%',
      color: 'text-purple-400',
    },
    {
      label: 'Campus Activities',
      value: '12',
      trend: '+3',
      color: 'text-yellow-400',
    },
  ];

  const AIRobot = () => (
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

  const ModuleContent = () => {
    switch (activeModule) {
      case 'ai-assistant':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <AIRobot />
              <h2 className="text-2xl font-bold mt-4 mb-2">
                Smart Campus AI Assistant
              </h2>
              <p className="text-slate-400">
                Your intelligent campus companion
              </p>
            </div>

            <div className="text-center mb-8">
              <button
                onClick={() => setShowAIChat(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-8 py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Start Chatting with AI Assistant
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  AI Capabilities
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Natural Language Processing
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Personalized Recommendations
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                    Predictive Analytics
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                    Multi-language Support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <SmartAttendance currentUser={currentUser} />
        );

      case 'timetable':
        return (
          <AITimetable currentUser={currentUser} />
        );

      case 'test-marks':
        return (
          <TestMarks currentUser={currentUser} />
        );

      case 'security':
        return (
          <SmartSecurity currentUser={currentUser} />
        );

      case 'career-prediction':
        return (
          <CareerPrediction currentUser={currentUser} />
        );

      case 'cgpa-calculator':
        return (
          <CGPACalculator currentUser={currentUser} />
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              Predictive Analytics Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 p-6 rounded-xl border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-slate-400">{stat.label}</h3>
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className={`text-sm ${stat.color}`}>{stat.trend}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">AI Predictions</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-5 h-5 text-orange-400 mr-2" />
                      <span className="font-medium">Performance Alert</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Based on current trends, focus on Database Management to
                      improve overall grade by 12%
                    </p>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Brain className="w-5 h-5 text-blue-400 mr-2" />
                      <span className="font-medium">Study Recommendation</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      AI suggests 2 hours of Machine Learning study this week
                      for optimal exam preparation
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Career Guidance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-sm">Software Development</span>
                    <span className="text-green-400 text-sm font-medium">
                      92% match
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-sm">Data Science</span>
                    <span className="text-blue-400 text-sm font-medium">
                      87% match
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-sm">AI/ML Engineering</span>
                    <span className="text-purple-400 text-sm font-medium">
                      84% match
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="text-center mb-12">
              <AIRobot />
              <h1 className="text-4xl font-bold mt-6 mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Welcome {isLoggedIn ? currentUser.name : 'to Smart Campus AI'}
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                {isLoggedIn 
                  ? `Your intelligent ${currentUser.role} dashboard with AI-powered insights and automation`
                  : 'Revolutionizing campus management with artificial intelligence, predictive analytics, and seamless automation'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveModule(feature.module)}
                  className="group cursor-pointer bg-slate-800/30 hover:bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-blue-400 text-sm group-hover:translate-x-1 transition-transform">
                    Explore <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 p-6 rounded-xl border border-slate-700"
                >
                  <div className="text-2xl font-bold mb-2">{stat.value}</div>
                  <div className="text-slate-400 text-sm mb-2">
                    {stat.label}
                  </div>
                  <div className={`text-sm ${stat.color}`}>{stat.trend}</div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  Smart Campus AI
                </span>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              {[
                { label: 'Dashboard', module: 'dashboard' },
                { label: 'Assistant', module: 'ai-assistant' },
                { label: 'Test Marks', module: 'test-marks' },
                { label: 'Settings', module: 'settings' },
              ].map((item) => (
                <button
                  key={item.module}
                  onClick={() => setActiveModule(item.module)}
                  className={`text-sm font-medium transition-colors ${
                    activeModule === item.module
                      ? 'text-blue-400'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
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
                {isLoggedIn && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>}
              </button>

              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-white">
                      {currentUser.name}
                    </div>
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
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-4 py-4 space-y-2">
              {[
                { label: 'Dashboard', module: 'dashboard' },
                { label: 'Assistant', module: 'ai-assistant' },
                { label: 'Test Marks', module: 'test-marks' },
                { label: 'Settings', module: 'settings' },
              ].map((item) => (
                <button
                  key={item.module}
                  onClick={() => {
                    setActiveModule(item.module);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeModule === item.module
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Quick Actions Sidebar */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30 hidden lg:block">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-2 space-y-2">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.action}
              className="w-12 h-12 bg-slate-700 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors group"
              title={action.label}
            >
              <action.icon className="w-5 h-5 text-slate-300 group-hover:text-white" />
            </button>
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
            {notifications.map((notif) => (
              <div key={notif.id} className="p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">
                    {notif.title}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{notif.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Chat Panel */}
      <AIChat
        isOpen={showAIChat && isLoggedIn}
        onClose={() => setShowAIChat(false)}
        currentUser={currentUser}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => !isLoggedIn && setShowLogin(false)}
        onLogin={handleLogin}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoggedIn ? <ModuleContent /> : (
          <div className="text-center py-20">
            <div className="mb-8">
              <AIRobot />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to Smart Campus AI
            </h2>
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
              <span className="text-lg font-semibold text-white">
                Smart Campus AI
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Empowering education through artificial intelligence and smart
              automation
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-sm text-slate-400">
              <span>© 2025 Smart Campus AI</span>
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

export default App;