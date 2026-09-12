import { Zap } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { AIRobot } from '../layouts/CampusShell';

export default function AIAssistantPage() {
  const { setShowAIChat } = useSession();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <AIRobot />
        <h2 className="text-2xl font-bold mt-4 mb-2">Smart Campus AI Assistant</h2>
        <p className="text-slate-400">Your intelligent campus companion</p>
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
}
