import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dice from './Dice';
import Modal from './Modal';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { saveUserScore } from '../services/scoreService';
import SeraChatbot from './SeraChatbot';

type PieceType = 'pawn' | 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | null;
interface Piece {
  type: PieceType;
  symbol: string;
}
interface Question {
  id: number;
  position: number;
  funFact: string;
  question: string;
  options: { emoji: string; text: string }[];
}

// The 21-item DASS-21-style assessment, distributed across the board and
// localized with Indian cultural references (Persona Health's original
// content — preserved verbatim, this is real assessment content, not demo
// filler).
const QUESTIONS: Question[] = [
  { id: 1, position: 5, funFact: 'Delhi Metro is the busiest and longest metro system in India, approximately 389 km and 285 stations and nearly 4 million passengers daily.', question: 'I feel like my mind runs constantly as Delhi Metro, finding it hard to wind down.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 2, position: 9, funFact: "World's largest integrated film studio complex is Ramoji Film City, located in Hyderabad, India, and was opened in 1996.", question: 'My reactions are mostly cinematic and I tend to overreact to situations.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 3, position: 14, funFact: 'The Bhangarh Fort, once grand and powerful, became abandoned due to the curse of a strong ascetic Guru Balunath with a lot of nervous energy.', question: 'I feel I use a lot of nervous energy.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 4, position: 18, funFact: 'The 2004 Indian Ocean tsunami was caused by a magnitude 9.1 earthquake and its energy was equivalent to 23,000 Hiroshima-sized atomic bombs.', question: 'Like the oceans during the tsunami, I find myself getting agitated.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 5, position: 23, funFact: 'Coorg is famously known as "Scotland of India" due to its cool climate, hilly terrain, and scenic beauty.', question: 'I think I may find it difficult to relax even in places like Coorg.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 6, position: 27, funFact: 'The 2002 Gujarat riots in India erupted like a volcano due to intolerance among humans.', question: 'I am intolerant of anything that keeps me from getting on with what I was doing.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 7, position: 30, funFact: 'The Taj Mahal in Agra is a UNESCO World Heritage site that appears to change color throughout the day.', question: 'I feel I am rather touchy, like a delicate petal in the shadow of the Taj Mahal, sensitive to every ripple of the world around me.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 8, position: 33, funFact: 'Thar Desert of India is the most densely populated desert in the world.', question: 'My mouth feels dry like the wind of the Thar Desert.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 9, position: 37, funFact: "Shimla is a world heritage site. It is the only Indian place where natural ice skating takes place.", question: "I experience breathing difficulty sometimes, like I am running across Shimla's cold mountains up and down.", options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 10, position: 40, funFact: 'The massive energy released by the 2004 Sumatra–Andaman Earthquake caused the entire planet to vibrate as much as 1 mm.', question: 'I experience trembling often like an earthquake.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 11, position: 48, funFact: "'Thenali,' an Indian Tamil comedy film shot at Kodaikanal, tells the story of a man who is both neurotic and multiphobic.", question: 'I am worried about situations in which I might panic and make a fool of myself just like Thenali.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 12, position: 52, funFact: "Dumas Beach in Surat is known for its black sand and its reputation as one of the country's most haunted places.", question: 'I feel like I am close to panic as though I am in Dumas Beach.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 13, position: 56, funFact: 'Leh–Ladakh offers rugged terrain ideal for high-altitude trekking and extensive mountain biking, making our hearts skip a beat.', question: 'I am aware of the action of my heart in the absence of physical exertion.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 14, position: 60, funFact: 'Rani Lakshmibai, Queen of Jhansi, was a fearless leader of the Indian Rebellion of 1857.', question: 'Sometimes I feel scared without any good reason, unlike Rani Lakshmibai.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 15, position: 64, funFact: 'Rishikesh of Uttarakhand is known as the Yoga Capital of the World, surrounded by the Himalayas.', question: "I couldn't seem to experience any positive feeling at all. I think I need to go to Rishikesh.", options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 16, position: 70, funFact: 'The first sunrise in India is at Dong village in Anjaw District of Arunachal Pradesh.', question: 'I watch opportunities appear like sunrise in Dong village but find it difficult to work up the initiative to do things.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 17, position: 75, funFact: "Kanchenjunga is the third highest mountain in the world and its name means 'five treasures of snow'.", question: 'When I look forward toward Kanchenjunga, I see five high peaks but personally I feel like I have nothing to look forward to.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 18, position: 80, funFact: "Siachen Glacier is the world's highest and coldest battlefield.", question: 'I feel down-hearted and blue, like I am at Siachen Glacier, losing a battle.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 19, position: 87, funFact: 'Wonderla Kochi is the first park in India to get ISO 14001 certification for eco-friendliness.', question: 'Even if I am in Wonderla, I feel I am unable to become enthusiastic about anything.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 20, position: 95, funFact: "Dr. A. P. J. Abdul Kalam, born in Rameswaram, is lovingly called the 'People's President' and 'Missile Man of India.'", question: 'I feel I am not worth much as a person. But I need to strive to be like our beloved president.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
  { id: 21, position: 98, funFact: 'Bhakra–Nangal Multipurpose River Valley Project is a joint venture providing irrigation and hydroelectric power.', question: 'I feel life is meaningless without any purpose.', options: [{ emoji: '☀', text: 'Not at all' }, { emoji: '🌤', text: 'Sometimes' }, { emoji: '🌧', text: 'Often' }, { emoji: '⛈', text: 'Always' }] },
];

const STRESS_POSITIONS = [5, 9, 13, 18, 23, 27, 30];
const ANXIETY_POSITIONS = [33, 37, 40, 48, 52, 56, 60];
const DEPRESSION_POSITIONS = [64, 70, 75, 80, 87, 95, 98];

const PIECES: Record<number, Piece> = {
  1: { type: 'pawn', symbol: '♙' },
  7: { type: 'rook', symbol: '♖' },
  19: { type: 'bishop', symbol: '♗' },
  28: { type: 'queen', symbol: '♕' },
  36: { type: 'bishop', symbol: '♗' },
  39: { type: 'knight', symbol: '♘' },
  43: { type: 'rook', symbol: '♖' },
  47: { type: 'bishop', symbol: '♗' },
  49: { type: 'knight', symbol: '♘' },
  51: { type: 'queen', symbol: '♕' },
  59: { type: 'knight', symbol: '♘' },
  76: { type: 'rook', symbol: '♖' },
  82: { type: 'knight', symbol: '♘' },
  88: { type: 'knight', symbol: '♘' },
  92: { type: 'rook', symbol: '♖' },
  97: { type: 'knight', symbol: '♘' },
  100: { type: 'king', symbol: '♔' },
};

function getRowCol(position: number) {
  const row = Math.floor((position - 1) / 10);
  const col = (position - 1) % 10;
  const isEvenRow = row % 2 === 0;
  return { row, col: isEvenRow ? col : 9 - col };
}

function getPosition(row: number, col: number) {
  const isEvenRow = row % 2 === 0;
  const actualCol = isEvenRow ? col : 9 - col;
  return row * 10 + actualCol + 1;
}

function getDiagonalMoves(position: number, steps: number): number[] {
  const { row, col } = getRowCol(position);
  const moves: number[] = [];
  const isWhiteSquare = position % 2 === 1;
  const directions = [{ dr: 1, dc: 1 }, { dr: 1, dc: -1 }, { dr: -1, dc: 1 }, { dr: -1, dc: -1 }];
  for (const { dr, dc } of directions) {
    const newRow = row + dr * steps;
    const newCol = col + dc * steps;
    if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
      const newPos = getPosition(newRow, newCol);
      if (newPos % 2 === 1 === isWhiteSquare && newPos <= 100) moves.push(newPos);
    }
  }
  return moves;
}

function getKnightMoves(position: number): number[] {
  const { row, col } = getRowCol(position);
  const moves: number[] = [];
  const knightDeltas = [{ dr: 2, dc: 1 }, { dr: 2, dc: -1 }, { dr: -2, dc: 1 }, { dr: -2, dc: -1 }, { dr: 1, dc: 2 }, { dr: 1, dc: -2 }, { dr: -1, dc: 2 }, { dr: -1, dc: -2 }];
  for (const { dr, dc } of knightDeltas) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
      const newPos = getPosition(newRow, newCol);
      if (newPos <= 100 && newPos < position) moves.push(newPos);
    }
  }
  return moves;
}

function getDepressionLevel(score: number) {
  if (score <= 9) return 'Normal';
  if (score <= 13) return 'Mild';
  if (score <= 20) return 'Moderate';
  if (score <= 27) return 'Severe';
  return 'Extremely Severe';
}
function getAnxietyLevel(score: number) {
  if (score <= 7) return 'Normal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  if (score <= 19) return 'Severe';
  return 'Extremely Severe';
}
function getStressLevel(score: number) {
  if (score <= 14) return 'Normal';
  if (score <= 18) return 'Mild';
  if (score <= 25) return 'Moderate';
  if (score <= 33) return 'Severe';
  return 'Extremely Severe';
}

export default function GameBoard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playerPosition, setPlayerPosition] = useState(1);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showQueenDialog, setShowQueenDialog] = useState(false);
  const [validMoves, setValidMoves] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const answeredRef = useRef<number[]>([]);
  useEffect(() => {
    answeredRef.current = answeredQuestions;
  }, [answeredQuestions]);

  const [stressScore, setStressScore] = useState(0);
  const [anxietyScore, setAnxietyScore] = useState(0);
  const [depressionScore, setDepressionScore] = useState(0);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSeraChat, setShowSeraChat] = useState(false);
  const [scoresSaved, setScoresSaved] = useState(false);

  const saveScoresToDatabase = async (finalStress = stressScore, finalAnxiety = anxietyScore, finalDepression = depressionScore) => {
    if (!user || scoresSaved || !supabase) return;
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { success } = await saveUserScore({
        userId: user.id,
        stressScore: finalStress * 2,
        anxietyScore: finalAnxiety * 2,
        depressionScore: finalDepression * 2,
        fullName: profile?.full_name ?? (user.user_metadata?.full_name as string),
        department: profile?.department,
        year: profile?.class,
        section: profile?.section,
        registerNumber: profile?.register_number ?? (user.user_metadata?.register_number as string),
      });
      if (success) setScoresSaved(true);
    } catch (error) {
      console.error('Error saving scores:', error);
    }
  };

  const rollDice = () => {
    if (!gameStarted) return;
    setIsRolling(true);
    const value = Math.floor(Math.random() * 6) + 1;
    setTimeout(() => {
      setDiceValue(value);
      setIsRolling(false);
      if (playerPosition + value > 100) return;
      movePlayerStepByStep(value);
    }, 500);
  };

  const movePlayerStepByStep = (steps: number) => {
    setIsMoving(true);
    let currentStep = 0;
    const startPosition = playerPosition;
    const interval = setInterval(() => {
      currentStep++;
      const newPosition = startPosition + currentStep;
      setPlayerPosition(newPosition);

      if (currentStep >= steps) {
        clearInterval(interval);
        setIsMoving(false);

        const skipped = QUESTIONS.filter((q) => q.position > startPosition && q.position <= newPosition && !answeredRef.current.includes(q.id));
        if (skipped.length > 0) {
          setTimeout(() => {
            setCurrentQuestion(skipped[0]);
            setShowQuestionDialog(true);
          }, 500);
          return;
        }
        if (newPosition === 100) {
          setTimeout(async () => {
            await saveScoresToDatabase();
            setShowFinalResults(true);
          }, 500);
          return;
        }
        const landed = PIECES[newPosition];
        if (landed) setTimeout(() => handlePieceLanding(landed.type, newPosition), 500);
      }
    }, 400);
  };

  const startGame = () => {
    if (!user) {
      navigate('/persona/auth');
      return;
    }
    setGameStarted(true);
    setPlayerPosition(1);
    setDiceValue(null);
  };

  const resetGame = () => {
    setPlayerPosition(1);
    setDiceValue(null);
    setGameStarted(false);
    setIsMoving(false);
    setValidMoves([]);
    setShowQueenDialog(false);
    setShowQuestionDialog(false);
    setAnsweredQuestions([]);
    answeredRef.current = [];
    setCurrentQuestion(null);
    setStressScore(0);
    setAnxietyScore(0);
    setDepressionScore(0);
    setShowFinalResults(false);
    setScoresSaved(false);
  };

  const handlePieceLanding = (pieceType: PieceType, position: number) => {
    if (!pieceType) return;
    switch (pieceType) {
      case 'bishop': {
        const moves = getDiagonalMoves(position, 3);
        if (moves.length > 0) {
          setValidMoves(moves);
          setTimeout(() => {
            const move = moves[0];
            const skipped = QUESTIONS.filter((q) => move >= q.position && position < q.position && !answeredRef.current.includes(q.id));
            setPlayerPosition(move);
            setValidMoves([]);
            if (skipped.length > 0) {
              setTimeout(() => {
                setCurrentQuestion(skipped[0]);
                setShowQuestionDialog(true);
              }, 500);
            }
          }, 1500);
        }
        break;
      }
      case 'rook': {
        const move = Math.min(position + 5, 100);
        const skipped = QUESTIONS.filter((q) => move >= q.position && position < q.position && !answeredRef.current.includes(q.id));
        setTimeout(() => {
          setPlayerPosition(move);
          if (skipped.length > 0) {
            setTimeout(() => {
              setCurrentQuestion(skipped[0]);
              setShowQuestionDialog(true);
            }, 500);
          } else if (move === 100) {
            setTimeout(() => setShowFinalResults(true), 500);
          }
        }, 1000);
        break;
      }
      case 'queen':
        setShowQueenDialog(true);
        break;
      case 'knight': {
        const moves = getKnightMoves(position);
        if (moves.length > 0) {
          setValidMoves(moves);
          setTimeout(() => {
            const move = moves[0];
            const skipped = QUESTIONS.filter((q) => move <= q.position && q.position <= position && !answeredRef.current.includes(q.id));
            setPlayerPosition(move);
            setValidMoves([]);
            if (skipped.length > 0) {
              setTimeout(() => {
                setCurrentQuestion(skipped[0]);
                setShowQuestionDialog(true);
              }, 500);
            }
          }, 1500);
        }
        break;
      }
    }
  };

  const handleQueenChoice = (choice: 'diagonal' | 'forward') => {
    const currentPos = playerPosition;
    let newPos: number;
    if (choice === 'diagonal') {
      const moves = getDiagonalMoves(currentPos, 3);
      if (moves.length === 0) {
        setShowQueenDialog(false);
        return;
      }
      newPos = moves[0];
    } else {
      newPos = Math.min(currentPos + 5, 100);
    }
    const skipped = QUESTIONS.filter((q) => newPos >= q.position && currentPos < q.position && !answeredRef.current.includes(q.id));
    setPlayerPosition(newPos);
    setShowQueenDialog(false);
    if (skipped.length > 0) {
      setTimeout(() => {
        setCurrentQuestion(skipped[0]);
        setShowQuestionDialog(true);
      }, 500);
    } else if (newPos === 100) {
      setTimeout(() => setShowFinalResults(true), 500);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!currentQuestion) {
      setShowQuestionDialog(false);
      return;
    }
    const points = answerIndex;
    let newStress = stressScore;
    let newAnxiety = anxietyScore;
    let newDepression = depressionScore;

    if (STRESS_POSITIONS.includes(currentQuestion.position)) {
      newStress += points;
      setStressScore((prev) => prev + points);
    } else if (ANXIETY_POSITIONS.includes(currentQuestion.position)) {
      newAnxiety += points;
      setAnxietyScore((prev) => prev + points);
    } else if (DEPRESSION_POSITIONS.includes(currentQuestion.position)) {
      newDepression += points;
      setDepressionScore((prev) => prev + points);
    }

    const updatedAnswered = [...answeredQuestions, currentQuestion.id];
    setAnsweredQuestions(updatedAnswered);
    setShowQuestionDialog(false);

    const nextQuestion = QUESTIONS.find((q) => q.position <= playerPosition && !updatedAnswered.includes(q.id));
    if (nextQuestion) {
      setTimeout(() => {
        setCurrentQuestion(nextQuestion);
        setShowQuestionDialog(true);
      }, 500);
      return;
    }

    if (playerPosition === 100) {
      setTimeout(async () => {
        await saveScoresToDatabase(newStress, newAnxiety, newDepression);
        setShowFinalResults(true);
      }, 500);
      return;
    }

    const landed = PIECES[playerPosition];
    if (landed) setTimeout(() => handlePieceLanding(landed.type, playerPosition), 500);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 sm:gap-6">
      <div className="flex justify-between items-center w-full gap-2">
        <button onClick={() => setShowExitDialog(true)} className="btn-secondary text-sm px-4 py-2">
          ← Back
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          🪷 Persona
        </h1>
        <button onClick={resetGame} className="btn-secondary text-sm px-4 py-2">
          Reset 🔄
        </button>
      </div>

      {gameStarted && (
        <div className="w-full max-w-4xl bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm sm:text-lg font-bold text-white">📊 Progress</h3>
            <span className="text-lg sm:text-2xl font-bold text-blue-400">{answeredQuestions.length}/21</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
            <div
              className="progress-bar h-full flex items-center justify-end pr-2"
              style={{ width: `${(answeredQuestions.length / 21) * 100}%` }}
            >
              {answeredQuestions.length > 0 && (
                <span className="text-white text-[10px] font-bold">{Math.round((answeredQuestions.length / 21) * 100)}%</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm sm:max-w-2xl md:max-w-4xl aspect-square">
        <div className="grid grid-cols-10 gap-0 border-4 border-slate-600 rounded-xl overflow-hidden bg-slate-800 w-full aspect-square">
          {Array.from({ length: 100 }, (_, i) => {
            const row = Math.floor(i / 10);
            const col = i % 10;
            const isEvenRow = row % 2 === 0;
            const actualPosition = isEvenRow ? 100 - (row * 10 + col) : 100 - (row * 10 + (9 - col));
            const isWhiteSquare = actualPosition % 2 === 1;
            const piece = PIECES[actualPosition];
            const isPlayerHere = playerPosition === actualPosition;
            const isValidMove = validMoves.includes(actualPosition);

            return (
              <div
                key={actualPosition}
                className={`flex flex-col items-center justify-center border border-slate-700 relative aspect-square text-[8px] sm:text-xs transition-all ${
                  isWhiteSquare ? 'bg-slate-700/50' : 'bg-slate-800/80'
                } ${isPlayerHere ? 'ring-2 ring-inset ring-green-500' : ''} ${
                  isValidMove ? 'ring-2 ring-inset ring-yellow-400 bg-yellow-500/20' : ''
                }`}
              >
                <span className="absolute top-0.5 left-0.5 text-[6px] sm:text-[10px] font-bold text-slate-400">{actualPosition}</span>
                {actualPosition === 1 && <span className="text-[8px] sm:text-xs font-bold text-green-400">START</span>}
                {actualPosition === 100 && <span className="text-lg sm:text-2xl animate-pulse">👑</span>}
                {piece && actualPosition !== 1 && actualPosition !== 100 && !isPlayerHere && (
                  <span className="text-sm sm:text-xl opacity-80">{piece.symbol}</span>
                )}
                {isPlayerHere && <span className="text-base sm:text-2xl animate-bounce">🎯</span>}
              </div>
            );
          })}
        </div>
      </div>

      {gameStarted ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <Dice value={diceValue} isRolling={isRolling} />
          <button onClick={rollDice} disabled={isRolling || isMoving || playerPosition === 100} className="btn-primary px-8 py-3 disabled:opacity-50">
            {isRolling ? 'Rolling...' : isMoving ? 'Moving...' : 'Roll Dice 🎲'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-sm text-slate-400 text-center">Navigate through awareness & reach the crown!</p>
          <button onClick={startGame} className="btn-primary text-lg px-12 py-4">
            START GAME 🎮
          </button>
        </div>
      )}

      <Modal open={showQueenDialog} title="Queen's Choice ♕" dismissible={false}>
        <p className="text-sm text-slate-300 mb-4">Choose your move: diagonal like a Bishop or forward like a Rook?</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => handleQueenChoice('diagonal')} className="btn-secondary px-5 py-2">
            Diagonal (3 steps) ♗
          </button>
          <button onClick={() => handleQueenChoice('forward')} className="btn-primary px-5 py-2">
            Forward (+5 steps) ♖
          </button>
        </div>
      </Modal>

      <Modal open={showQuestionDialog} dismissible={false} maxWidth="max-w-md">
        {currentQuestion && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full bg-slate-700/40 rounded-lg p-4 border border-slate-600">
              <p className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-wide">📚 Fun Fact</p>
              <p className="text-sm text-slate-300">{currentQuestion.funFact}</p>
            </div>
            <p className="text-base font-semibold text-white text-center">{currentQuestion.question}</p>
            <p className="text-xs text-amber-400">⚠️ This question is mandatory</p>
            <div className="flex flex-col gap-2 w-full">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-600 bg-slate-700/40 hover:border-blue-500 hover:bg-slate-700 transition-all text-left"
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-sm font-medium text-white">{option.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showFinalResults} title="Your Mental Wellness Assessment Results" maxWidth="max-w-2xl">
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            This is a supportive self-check-in, not a clinical diagnosis. If anything here concerns you, please talk to a
            counsellor or a trusted person.
          </p>
          {[
            { label: 'Depression', score: depressionScore * 2, level: getDepressionLevel(depressionScore * 2), color: 'blue' },
            { label: 'Anxiety', score: anxietyScore * 2, level: getAnxietyLevel(anxietyScore * 2), color: 'amber' },
            { label: 'Stress', score: stressScore * 2, level: getStressLevel(stressScore * 2), color: 'rose' },
          ].map((item) => (
            <div
              key={item.label}
              className={`p-4 rounded-lg border ${
                item.level === 'Extremely Severe' ? 'border-red-500 ring-2 ring-red-500/30' : 'border-slate-700'
              } bg-slate-700/30`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">{item.label} Score</h3>
                  <p className="text-sm text-slate-400">Level: {item.level}</p>
                  <p className="text-xl font-bold text-white mt-1">{item.score}/42</p>
                </div>
                {item.level === 'Extremely Severe' && <span className="text-4xl animate-pulse">⚠️</span>}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button onClick={resetGame} className="btn-secondary px-6 py-2">
              Play Again 🔄
            </button>
            <button onClick={() => setShowSeraChat(true)} className="btn-primary px-6 py-2">
              Talk to SERA
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={showExitDialog} onClose={() => setShowExitDialog(false)} title="Exit the game?">
        <p className="text-sm text-slate-300 mb-4">Your current progress will not be saved.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowExitDialog(false)} className="btn-secondary px-4 py-2">
            No
          </button>
          <button onClick={() => navigate('/persona')} className="btn-primary px-4 py-2">
            Yes, exit
          </button>
        </div>
      </Modal>

      {showSeraChat && (
        <SeraChatbot
          stressScore={stressScore * 2}
          anxietyScore={anxietyScore * 2}
          depressionScore={depressionScore * 2}
          onClose={() => setShowSeraChat(false)}
        />
      )}
    </div>
  );
}
