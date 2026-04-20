import { useState } from "react";
import { CheckCircle, Circle, ExternalLink } from "lucide-react";

export default function TaskCard({ task, onComplete }) {
  const [done, setDone] = useState(task.completed ?? false);

  function handleToggle() {
    setDone((prev) => {
      const next = !prev;
      onComplete(task, next);
      return next;
    });
  }

  const typeColors = {
    video: "bg-purple-50 text-purple-800 border-purple-200",
    reading: "bg-blue-50 text-blue-800 border-blue-200",
    practice: "bg-amber-50 text-amber-800 border-amber-200",
  };

  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300
      ${done ? "opacity-60 bg-gray-50 border-transparent" : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200"}`}>
      <button
        onClick={handleToggle}
        className={`mt-1 flex-shrink-0 transition-transform active:scale-90
          ${done ? "text-green-500" : "text-gray-300 hover:text-purple-400"}`}
      >
        {done ? <CheckCircle size={24} /> : <Circle size={24} />}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-semibold leading-tight ${done ? "line-through text-gray-400" : "text-gray-800"}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${typeColors[task.type] ?? typeColors.reading}`}>
            {task.type}
          </span>
          <span className="text-xs text-gray-400">{task.estimatedMinutes} min</span>
          {task.resourceUrl && (
            <a href={task.resourceUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 font-medium transition-colors">
              Resource <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {!done && (
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">+10 XP</span>
        </div>
      )}
    </div>
  );
}
