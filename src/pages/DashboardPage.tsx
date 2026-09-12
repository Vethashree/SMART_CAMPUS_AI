import { Link } from 'react-router-dom';
import {
  Bot,
  Camera,
  Brain,
  Calendar,
  Calculator,
  Shield,
  ChevronRight,
  HeartPulse,
  BookMarked,
  Library,
  Bell,
  SlidersHorizontal,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { AIRobot } from '../layouts/CampusShell';
import NextBestActions from '../components/sera/NextBestActions';

const FEATURES = [
  { icon: Bot, title: 'AI Assistant', description: '24/7 virtual assistant for students and staff', color: 'from-blue-500 to-purple-600', to: '/assistant' },
  { icon: Camera, title: 'Smart Attendance', description: 'Face recognition and voice-based attendance', color: 'from-green-500 to-teal-600', to: '/attendance' },
  { icon: Brain, title: 'Predictive Analytics', description: 'Performance prediction and personalized insights', color: 'from-orange-500 to-red-600', to: '/career-prediction' },
  { icon: Calendar, title: 'Timetable', description: 'Intelligent scheduling and conflict resolution', color: 'from-indigo-500 to-blue-600', to: '/timetable' },
  { icon: Calculator, title: 'CGPA Calculator', description: 'Calculate and track your academic performance', color: 'from-pink-500 to-rose-600', to: '/cgpa-calculator' },
  { icon: Shield, title: 'Smart Security', description: 'AI-powered surveillance and anomaly detection', color: 'from-yellow-500 to-orange-600', to: '/security' },
  { icon: HeartPulse, title: 'Persona Health', description: 'Gamified mental wellness assessment and SERA wellness support', color: 'from-rose-500 to-pink-600', to: '/persona' },
  { icon: BookMarked, title: 'Study Tracker', description: 'Priority-ranked study plan based on exams and mastery', color: 'from-purple-500 to-indigo-600', to: '/study' },
  { icon: Library, title: 'Smart Library', description: 'Quiet-zone and seat-availability aware study spaces', color: 'from-teal-500 to-cyan-600', to: '/library' },
  { icon: Bell, title: 'Campus Notices', description: 'Notices ranked by relevance to your timetable', color: 'from-amber-500 to-orange-600', to: '/notices' },
  { icon: SlidersHorizontal, title: 'Preferences', description: 'Accessibility, study and wellbeing preferences', color: 'from-slate-500 to-slate-600', to: '/preferences' },
];

const STATS = [
  { label: 'Attendance Rate', value: '87%', trend: '+2.3%', color: 'text-green-400' },
  { label: 'Performance Score', value: '8.4/10', trend: '+0.7', color: 'text-blue-400' },
  { label: 'AI Predictions', value: '94%', trend: '+1.2%', color: 'text-purple-400' },
  { label: 'Campus Activities', value: '12', trend: '+3', color: 'text-yellow-400' },
];

export default function DashboardPage() {
  const { currentUser } = useSession();

  return (
    <div className="space-y-10">
      <div className="text-center mb-4">
        <AIRobot />
        <h1 className="text-4xl font-bold mt-6 mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Welcome {currentUser.name}
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Your intelligent {currentUser.role} dashboard with AI-powered insights and automation
        </p>
      </div>

      <NextBestActions />

      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {FEATURES.map((feature, idx) => (
            <Link
              key={idx}
              to={feature.to}
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
              <p className="text-slate-400 text-sm mb-4">{feature.description}</p>
              <div className="flex items-center text-blue-400 text-sm group-hover:translate-x-1 transition-transform">
                Explore <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, idx) => (
            <div key={idx} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <div className="text-2xl font-bold mb-2">{stat.value}</div>
              <div className="text-slate-400 text-sm mb-2">{stat.label}</div>
              <div className={`text-sm ${stat.color}`}>{stat.trend}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
