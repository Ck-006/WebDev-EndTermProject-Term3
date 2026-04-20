import { auth, db } from "../services/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Sparkles, GraduationCap } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      // ✅ Navigate immediately — don't block on Firestore
      navigate("/dashboard");

      // Init user profile in Firestore in the background (non-blocking)
      const userRef = doc(db, "users", fbUser.uid);
      getDoc(userRef)
        .then((snap) => {
          if (!snap.exists()) {
            return setDoc(userRef, {
              uid: fbUser.uid,
              displayName: fbUser.displayName,
              email: fbUser.email,
              photoURL: fbUser.photoURL,
              xp: 0,
              streak: 0,
              joinedAt: new Date().toISOString(),
            });
          }
        })
        .catch((err) => console.error("Firestore profile init error:", err));

    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please try again or check your browser's popup blocker.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd] px-6">
      <div className="max-w-md w-full relative">
        {/* Background glow Decor */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700" />
        
        <div className="relative bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-purple-100/50 p-10 md:p-14 text-center space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-xl shadow-purple-200 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-500">
              <GraduationCap size={40} className="text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
                <Sparkles size={12} /> The Future of Learning
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">AI Study Planner</h1>
            </div>
          </div>

          <p className="text-gray-500 text-[15px] font-medium leading-relaxed">
            Organize your syllabus, generate daily tasks, and track your progress with AI-powered focus.
          </p>

          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full group flex items-center justify-center gap-4 bg-gray-900 hover:bg-black text-white rounded-2xl py-4 font-bold transition-all transform active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 filter grayscale group-hover:grayscale-0 transition-all" />
                Get Started with Google
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 font-medium text-left flex items-start gap-2">
              <span className="text-red-400 mt-0.5">⚠</span>
              {error}
            </div>
          )}

          <p className="text-[10px] text-gray-400 font-medium">
            By continuing, you agree to optimize your study habits and conquer your goals.
          </p>
        </div>
      </div>
    </div>
  );
}
