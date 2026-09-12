import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lightbulb, Brain, HeartPulse } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import InstructionSlides from '../components/InstructionSlides';
import PersonaShell from '../components/PersonaShell';

const PILLARS = [
  { icon: Crown, title: 'Strategic Moves', desc: "Navigate a chess-themed board through life's challenges", color: 'from-blue-500 to-purple-600' },
  { icon: Lightbulb, title: 'Quest for Knowledge', desc: 'Answer 21 guided questions to unlock self-awareness', color: 'from-purple-500 to-pink-600' },
  { icon: Brain, title: 'Inner Balance', desc: 'Get stress, anxiety and depression insights at the end', color: 'from-rose-500 to-red-600' },
];

export default function PersonaHome() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showInstructions, setShowInstructions] = useState(false);

  const handleStartGame = () => {
    if (!user) {
      navigate('/persona/auth');
      return;
    }
    setShowInstructions(true);
  };

  if (loading) {
    return (
      <PersonaShell>
        <div className="text-center text-slate-400 py-20">Preparing your journey...</div>
      </PersonaShell>
    );
  }

  return (
    <PersonaShell>
      <div className="text-center space-y-10 max-w-4xl mx-auto">
        <div>
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
            <HeartPulse className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Persona
          </h1>
          <p className="text-slate-400 mt-2">Mental Wellness Companion</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 card-hover">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r ${pillar.color} flex items-center justify-center`}>
                <pillar.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">{pillar.title}</h3>
              <p className="text-sm text-slate-400">{pillar.desc}</p>
            </div>
          ))}
        </div>

        <button onClick={handleStartGame} className="btn-primary text-lg px-10 py-4">
          🎲 Start Your Journey
        </button>
        <p className="text-xs text-slate-500 italic">
          Roll the dice, answer with honesty, and discover your inner balance. This is a supportive self-check-in —
          not a diagnosis.
        </p>
      </div>

      <InstructionSlides
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
        onStartGame={() => navigate('/persona/game')}
      />
    </PersonaShell>
  );
}
