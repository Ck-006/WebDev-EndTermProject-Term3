export default function ProgressRing({ percent, label, size = 100 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle 
            cx={size/2} 
            cy={size/2} 
            r={r} 
            fill="none"
            stroke="#f3f4f6" 
            strokeWidth="8" 
          />
          <circle 
            cx={size/2} 
            cy={size/2} 
            r={r} 
            fill="none"
            stroke="url(#gradient)" 
            strokeWidth="8"
            strokeDasharray={circ} 
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-800">
            {Math.round(percent)}%
          </span>
        </div>
      </div>
      <span className="text-[12px] font-semibold text-gray-500 text-center uppercase tracking-tight max-w-[100px] line-clamp-2">
        {label}
      </span>
    </div>
  );
}
