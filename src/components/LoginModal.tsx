import React, { useState } from 'react';
import { X, User, GraduationCap, Building, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { name: string; role: 'student' | 'faculty' | 'admin'; id: string }) => void;
}

type LoginType = 'student' | 'staff' | 'institute';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [loginType, setLoginType] = useState<LoginType>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo credentials
  const credentials: Record<LoginType, Record<string, { password: string; name: string; id: string }>> = {
    student: {
      kirishipathi: { password: '2205', name: 'Kirishipathi', id: 'ST2024001' },
      hariharan: { password: '3855', name: 'Hariharan', id: 'ST2024004' },
      student1: { password: 'pass123', name: 'Rahul Kumar', id: 'ST2024002' },
      student2: { password: 'pass456', name: 'Priya Sharma', id: 'ST2024003' }
    },
    staff: {
      teacher1: { password: 'staff123', name: 'Dr. Rajesh Gupta', id: 'FC2024001' },
      teacher2: { password: 'staff456', name: 'Prof. Meera Singh', id: 'FC2024002' }
    },
    institute: {
      admin: { password: 'admin123', name: 'Admin User', id: 'AD2024001' },
      principal: { password: 'principal123', name: 'Dr. Principal', id: 'AD2024002' }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const userCreds = credentials[loginType][username.toLowerCase()];
    
    if (userCreds && userCreds.password === password) {
      const roleMap = {
        student: 'student' as const,
        staff: 'faculty' as const,
        institute: 'admin' as const
      };

      onLogin({
        name: userCreds.name,
        role: roleMap[loginType],
        id: userCreds.id
      });
      
      // Reset form
      setUsername('');
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Invalid username or password');
    }
    
    setIsLoading(false);
  };

  const loginOptions = [
    {
      type: 'student' as LoginType,
      icon: GraduationCap,
      title: 'Student Login',
      description: 'Access your academic dashboard',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      type: 'staff' as LoginType,
      icon: User,
      title: 'Staff Login',
      description: 'Faculty and teaching staff portal',
      color: 'from-green-500 to-emerald-500'
    },
    {
      type: 'institute' as LoginType,
      icon: Building,
      title: 'Institute Login',
      description: 'Administrative access panel',
      color: 'from-purple-500 to-violet-500'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Login to Smart Campus</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Login Type Selection */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Select Login Type</h3>
            {loginOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setLoginType(option.type)}
                className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                  loginType === option.type
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                    <option.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{option.title}</div>
                    <div className="text-xs text-slate-400">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;