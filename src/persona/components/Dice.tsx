interface DiceProps {
  value: number | null;
  isRolling: boolean;
}

const DOT_POSITIONS: Record<number, string[]> = {
  1: ['center'],
  2: ['top-left', 'bottom-right'],
  3: ['top-left', 'center', 'bottom-right'],
  4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
  6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
};

const POSITION_CLASS: Record<string, string> = {
  'top-left': 'top-2 left-2',
  'top-right': 'top-2 right-2',
  'middle-left': 'top-1/2 -translate-y-1/2 left-2',
  'middle-right': 'top-1/2 -translate-y-1/2 right-2',
  'bottom-left': 'bottom-2 left-2',
  'bottom-right': 'bottom-2 right-2',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

export default function Dice({ value, isRolling }: DiceProps) {
  const positions = value ? DOT_POSITIONS[value] ?? [] : [];

  return (
    <div
      className={`relative bg-slate-700 border-2 border-blue-500 rounded-xl shadow-xl w-20 h-20 transition-all duration-300 ${
        isRolling ? 'animate-spin' : ''
      }`}
    >
      {positions.map((position, i) => (
        <div key={`${position}-${i}`} className={`absolute bg-blue-400 rounded-full w-2.5 h-2.5 ${POSITION_CLASS[position]}`} />
      ))}
    </div>
  );
}
