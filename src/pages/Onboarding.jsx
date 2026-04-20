import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usePlan } from "../context/PlanContext";
import { generateStudyPlan } from "../services/claudeAPI";
import { useNavigate } from "react-router-dom";
import { Sparkles, Calendar, BookOpen, Clock, Plus, Trash2, ArrowRight } from "lucide-react";

export default function Onboarding() {
  const user = useAuth();
  const { savePlan } = usePlan();
  const navigate = useNavigate();

  const [syllabusText, setSyllabusText] = useState("");
  const [resources, setResources] = useState([{ title: "", url: "" }]);
  const [deadline, setDeadline] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [loading, setLoading] = useState(false);
  const [gaps, setGaps] = useState([]);
  const [error, setError] = useState("");
  const syllabusRef = useRef(null);

  // useRef: auto-focus the syllabus field on mount for better UX
  useEffect(() => {
    syllabusRef.current?.focus();
  }, []);

  function addResource() {
    setResources(r => [...r, { title: "", url: "" }]);
  }

  function removeResource(index) {
    if (resources.length > 1) {
      setResources(r => r.filter((_, i) => i !== index));
    }
  }

  function updateResource(i, field, val) {
    setResources(r => r.map((res, idx) => idx === i ? { ...res, [field]: val } : res));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const syllabusTopics = syllabusText.split("\n").map(s => s.trim()).filter(Boolean);
      const result = await generateStudyPlan({ syllabusTopics, resources, deadline, hoursPerDay });

      if (result.gaps.length > 0) {
        setGaps(result.gaps);
      }

      await savePlan(user.uid, {
        title: "My Study Plan",
        syllabusTopics,
        resources,
        gaps: result.gaps,
        schedule: result.schedule,
        deadline,
        hoursPerDay,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong generating your plan. Check your Claude API key and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles size={14} /> AI Powered Planning
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Let's build your path to success.</h1>
        <p className="text-gray-500 text-lg">Input your syllabus and resources, and our AI will craft a personalized daily schedule just for you.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-50/50 p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Syllabus Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen size={18} />
              </div>
              <label className="text-lg font-bold text-gray-800">What are you studying?</label>
            </div>
            <p className="text-sm text-gray-400 mb-2">Enter your syllabus topics, one per line.</p>
            <textarea 
              ref={syllabusRef}
              rows={5} 
              value={syllabusText} 
              onChange={e => setSyllabusText(e.target.value)}
              placeholder="e.g. React Fundamentals&#10;Data structures in JS&#10;Asynchronous algorithms"
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[15px] focus:ring-2 focus:ring-purple-500 transition-all resize-none placeholder:text-gray-300" 
            />
          </div>

          {/* Resources Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <label className="text-lg font-bold text-gray-800">Learning Resources</label>
              </div>
              <button type="button" onClick={addResource}
                className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors">
                + Add Another
              </button>
            </div>
            <div className="space-y-3">
              {resources.map((r, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-3 group">
                  <input 
                    value={r.title} 
                    onChange={e => updateResource(i, "title", e.target.value)}
                    placeholder="Resource Name (e.g. MDN Docs)"
                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 transition-all" 
                  />
                  <div className="flex-1 flex gap-2">
                    <input 
                      value={r.url} 
                      onChange={e => updateResource(i, "url", e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 transition-all" 
                    />
                    {resources.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeResource(i)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Constraints Section */}
          <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-purple-500" />
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Final Deadline</label>
              </div>
              <input 
                type="date" 
                value={deadline} 
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer" 
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-purple-500" />
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Study Hours / Day</label>
              </div>
              <input 
                type="number" 
                min="0.5" 
                max="12" 
                step="0.5" 
                value={hoursPerDay}
                onChange={e => setHoursPerDay(Number(e.target.value))}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 transition-all font-medium" 
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 font-medium flex items-start gap-2">
              <span className="text-red-400 mt-0.5">⚠</span>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !syllabusText || !deadline}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl py-5 text-lg font-bold shadow-xl shadow-purple-200 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI is generating your success path...
              </>
            ) : (
              <>
                Generate Your Study Plan <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      {gaps.length > 0 && (
        <div className="mt-8 bg-amber-50 border border-amber-100 rounded-3xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg">!</div>
            <p className="text-lg font-bold text-amber-900">AI found some resource gaps</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {gaps.map((g, i) => (
              <div key={i} className="bg-white/50 rounded-2xl p-4 border border-amber-100 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-amber-600 tracking-widest">Recommended for {g.topic}</span>
                <a href={g.suggestedUrl} target="_blank" rel="noreferrer"
                  className="text-[15px] font-bold text-amber-900 hover:underline inline-flex items-center gap-1">
                  {g.suggestedResource} <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
