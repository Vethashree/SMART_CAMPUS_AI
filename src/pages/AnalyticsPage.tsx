import { BarChart3, TrendingUp, Brain } from 'lucide-react';

const STATS = [
  { label: 'Attendance Rate', value: '87%', trend: '+2.3%', color: 'text-green-400' },
  { label: 'Performance Score', value: '8.4/10', trend: '+0.7', color: 'text-blue-400' },
  { label: 'AI Predictions', value: '94%', trend: '+1.2%', color: 'text-purple-400' },
  { label: 'Campus Activities', value: '12', trend: '+3', color: 'text-yellow-400' },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Predictive Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, idx) => (
          <div key={idx} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
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
                Based on current trends, focus on Database Management to improve overall grade by
                12%
              </p>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center mb-2">
                <Brain className="w-5 h-5 text-blue-400 mr-2" />
                <span className="font-medium">Study Recommendation</span>
              </div>
              <p className="text-sm text-slate-400">
                AI suggests 2 hours of Machine Learning study this week for optimal exam
                preparation
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Career Guidance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-sm">Software Development</span>
              <span className="text-green-400 text-sm font-medium">92% match</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-sm">Data Science</span>
              <span className="text-blue-400 text-sm font-medium">87% match</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-sm">AI/ML Engineering</span>
              <span className="text-purple-400 text-sm font-medium">84% match</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
