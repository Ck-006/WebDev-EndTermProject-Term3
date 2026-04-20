import { useEffect, useCallback, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePlan } from "../context/PlanContext";
import { useTodayTasks } from "../hooks/useTodayTasks";
import { useProgress } from "../hooks/useProgress";
import TaskCard from "../components/TaskCard";
import ProgressRing from "../components/ProgressRing";
import { db } from "../services/firebase";
import { doc, setDoc, updateDoc, increment, getDoc } from "firebase/firestore";
import { Trophy, Flame, Target, Trash2 } from "lucide-react";

export default function Dashboard() {
  const user = useAuth();
  const { activePlan, loadPlan, deletePlan } = usePlan();
  const todayTasks = useTodayTasks();
  const progress = useProgress(user?.uid, activePlan?.id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) loadPlan(user.uid);
  }, [user, loadPlan]);

  const handleComplete = useCallback(async (task, isDone) => {
    if (!user || !activePlan) return;
    const today = new Date().toISOString().split("T")[0];
    const ref = doc(db, "dailyProgress", `${user.uid}_${today}`);
    
    const docSnap = await getDoc(ref);
    if (!docSnap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        planId: activePlan.id,
        date: today,
        completedCount: 0,
        xpEarned: 0,
        tasks: []
      });
    }

    if (isDone) {
      await updateDoc(ref, { 
        completedCount: increment(1), 
        xpEarned: increment(10),
        tasks: [...(docSnap.data()?.tasks || []), { ...task, completed: true, completedAt: new Date().toISOString() }]
      });
      await updateDoc(doc(db, "users", user.uid), { xp: increment(10) });
    }
  }, [user, activePlan]);

  const handleDeletePlan = useCallback(async () => {
    if (!activePlan) return;
    setDeleting(true);
    try {
      await deletePlan(activePlan.id);
    } catch (err) {
      console.error("Delete plan error:", err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [activePlan, deletePlan]);

  const completedToday = progress.find(p => p.date === new Date().toISOString().split("T")[0])?.completedCount || 0;
  const totalToday = todayTasks.length;
  
  const topicProgress = activePlan?.syllabusTopics?.map(topic => {
    const done = progress.flatMap(p => p.tasks ?? [])
      .filter(t => t.topic === topic && t.completed).length;
    const total = activePlan.schedule?.flatMap(d => d.tasks)
      .filter(t => t.topic === topic).length ?? 1;
    return { topic, percent: Math.min(100, Math.round((done / total) * 100)) };
  }) ?? [];

  if (!activePlan) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="bg-gray-50 p-6 rounded-full">
        <Target size={48} className="text-gray-300" />
      </div>
      <p className="text-gray-500 font-medium max-w-xs">
        No active study plan found. Ready to reach your goals?
      </p>
      <a href="/onboarding" className="text-purple-600 font-bold hover:underline">
        Create your first plan →
      </a>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Today's Focus</h1>
          <p className="text-gray-500 mt-1 font-medium">Keep up the great work, {user?.displayName || 'Student'}.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white px-4 py-2 rounded-2xl shadow-lg shadow-purple-100">
            <Trophy size={18} />
            <span className="font-bold">{user?.xp ?? 0} XP</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-2xl shadow-sm text-amber-600">
            <Flame size={18} />
            <span className="font-bold">{user?.streak ?? 0} Days</span>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all px-3 py-2 rounded-xl text-sm font-bold border border-transparent hover:border-red-100"
            title="Reset study plan"
          >
            <Trash2 size={16} /> <span className="hidden md:inline">Reset Plan</span>
          </button>
        </div>
      </header>

      {/* Delete Confirmation Card */}
      {showDeleteConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-red-800 text-[15px]">Delete this study plan?</p>
            <p className="text-red-500 text-sm mt-0.5">This will permanently remove your plan and cannot be undone.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePlan}
              disabled={deleting}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Tasks Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              Daily Schedule
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-md font-bold">
                {completedToday}/{totalToday}
              </span>
            </h2>
          </div>
          
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">Relax! No tasks scheduled for today.</p>
              </div>
            ) : (
              todayTasks.map((task, i) => (
                <TaskCard key={i} task={task} onComplete={handleComplete} />
              ))
            )}
          </div>
        </div>

        {/* Sidebar/Progress Column */}
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Subject Progress</h2>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {topicProgress.map(({ topic, percent }) => (
                <ProgressRing key={topic} percent={percent} label={topic} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
