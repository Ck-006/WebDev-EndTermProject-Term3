import { lazy, Suspense, Component } from "react";

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fdfdfd", padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: "#1a1a1a", marginBottom: 8, fontSize: 20, fontWeight: 700 }}>App failed to start</h2>
          <p style={{ color: "#888", marginBottom: 16, fontSize: 14 }}>This is usually caused by a missing <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>.env</code> file or incorrect Firebase credentials.</p>
          <pre style={{ background: "#fff0f0", border: "1px solid #fecaca", borderRadius: 8, padding: 12, fontSize: 12, color: "#dc2626", textAlign: "left", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{this.state.error.message}</pre>
          <p style={{ marginTop: 16, fontSize: 13, color: "#888" }}>Copy <strong>.env.example</strong> → <strong>.env</strong> and fill in your Firebase credentials, then restart the dev server.</p>
        </div>
      </div>
    );
    return this.props.children;
  }
}
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PlanProvider } from "./context/PlanContext";
import { LogOut, LayoutDashboard, Sparkles } from "lucide-react";
import { auth } from "./services/firebase";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Login = lazy(() => import("./pages/Login"));

function ProtectedRoute({ children }) {
  const user = useAuth();
  if (user === undefined) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-2xl" />
        <div className="h-4 w-24 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function Navbar() {
  const user = useAuth();
  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
            <Sparkles size={20} />
          </div>
          <span className="font-black text-xl tracking-tight text-gray-900 hidden sm:block">FocusAI</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="/dashboard" className="text-gray-500 hover:text-purple-600 font-bold text-sm transition-colors flex items-center gap-2">
            <LayoutDashboard size={18} /> <span className="hidden md:inline">Dashboard</span>
          </a>
          <div className="h-4 w-[1px] bg-gray-200" />
          <button 
            onClick={() => auth.signOut()}
            className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors font-bold text-sm"
          >
            <LogOut size={18} /> <span className="hidden md:inline">Sign Out</span>
          </button>
          
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-100 bg-gray-100 flex items-center justify-center">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                {user.displayName?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <PlanProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#fdfdfd] selection:bg-purple-100 selection:text-purple-900">
            <Navbar />
            <Suspense fallback={
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
              </div>
            }>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </div>
        </BrowserRouter>
      </PlanProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}
