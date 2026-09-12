import { useState } from 'react';
import { ChevronRight, Crown, Lightbulb, Gamepad2, Star } from 'lucide-react';
import Modal from './Modal';

interface InstructionSlidesProps {
  open: boolean;
  onClose: () => void;
  onStartGame: () => void;
}

const STEPS = [
  {
    title: 'Game Rules & Instructions',
    icon: Gamepad2,
    content: (
      <div className="space-y-3 text-slate-300 text-sm">
        <p>
          Welcome to the <span className="font-semibold text-white">Chess-Quiz Journey!</span>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Your goal is to travel from Box 1 → Box 100</li>
          <li>Reach the Crown 👑 at the end</li>
          <li>Answer 21 guided questions along the way</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Example Gameplay',
    icon: Star,
    content: (
      <div className="space-y-2 text-sm text-slate-300">
        <p className="font-medium text-white mb-2">How a typical turn works:</p>
        <p className="p-2 bg-slate-700/40 rounded-lg">1. Player starts at Box 1</p>
        <p className="p-2 bg-slate-700/40 rounded-lg">2. Moves 1 step per turn</p>
        <p className="p-2 bg-slate-700/40 rounded-lg">3. Lands on Rook (♖) → moves +5 steps forward</p>
        <p className="p-2 bg-slate-700/40 rounded-lg">4. Lands on Knight (♘) → moves backward in an L-shape</p>
      </div>
    ),
  },
  {
    title: 'Game Features',
    icon: Crown,
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="text-left border-b border-slate-700">
              <th className="py-2 pr-4">Piece</th>
              <th className="py-2 pr-4">Symbol</th>
              <th className="py-2">Power / Move</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-700/50">
              <td className="py-2 pr-4">Queen</td>
              <td className="py-2 pr-4 text-xl">♕</td>
              <td className="py-2">+5 forward or +3 diagonal</td>
            </tr>
            <tr className="border-b border-slate-700/50">
              <td className="py-2 pr-4">Rook</td>
              <td className="py-2 pr-4 text-xl">♖</td>
              <td className="py-2">+5 forward</td>
            </tr>
            <tr className="border-b border-slate-700/50">
              <td className="py-2 pr-4">Bishop</td>
              <td className="py-2 pr-4 text-xl">♗</td>
              <td className="py-2">+3 diagonal</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Knight</td>
              <td className="py-2 pr-4 text-xl">♘</td>
              <td className="py-2">Random L-shape, backward</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    title: 'Quiz Logic',
    icon: Lightbulb,
    content: (
      <div className="bg-slate-700/30 p-4 rounded-lg text-sm text-slate-300 space-y-2">
        <p>
          Between Box 1 and Box 100, <span className="font-semibold text-white">21 questions</span> will appear.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Each answer contributes to your stress, anxiety or depression score</li>
          <li>If you skip a box with a question, you'll still be asked it</li>
          <li>This is a supportive self-check-in, not a diagnosis</li>
        </ul>
      </div>
    ),
  },
];

export default function InstructionSlides({ open, onClose, onStartGame }: InstructionSlidesProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} maxWidth="max-w-2xl">
      <div className="flex flex-col items-center text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <current.icon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">{current.title}</h2>
        <div className="w-full text-left">{current.content}</div>

        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-blue-500' : 'w-2 bg-slate-600'}`} />
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="btn-secondary px-6 py-2">
              Previous
            </button>
          )}
          {!isLast ? (
            <button onClick={() => setStep((s) => s + 1)} className="btn-primary px-6 py-2 flex items-center gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onStartGame();
                handleClose();
              }}
              className="btn-primary px-8 py-2"
            >
              🎮 Start to Play
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
