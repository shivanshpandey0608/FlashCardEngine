interface StatsPanelProps {
  stats: {
    total: number;
    due: number;
    mastered: number;
    learning: number;
    new: number;
  };
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const boxes = [
    { label: 'New', value: stats.new, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Learning', value: stats.learning, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Due', value: stats.due, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Mastered', value: stats.mastered, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {boxes.map(b => (
        <div key={b.label} className={`${b.bg} rounded-xl p-3 text-center`}>
          <div className={`text-2xl font-bold ${b.color}`}>{b.value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{b.label}</div>
        </div>
      ))}
    </div>
  );
}
