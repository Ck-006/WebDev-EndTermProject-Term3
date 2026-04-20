import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    let unsubProfile = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up previous profile listener when auth state changes
      if (unsubProfile) { unsubProfile(); unsubProfile = null; }

      if (firebaseUser) {
        // ✅ Set user IMMEDIATELY from Auth — keeps app snappy, no spinner
        const baseUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          xp: 0,
          streak: 0,
        };
        setUser(baseUser);

        // Then update xp/streak silently in the background from Firestore
        const profileRef = doc(db, "users", firebaseUser.uid);
        unsubProfile = onSnapshot(
          profileRef,
          (snap) => {
            if (snap.exists()) {
              // Merge only — auth fields stay authoritative
              setUser((prev) => ({ ...prev, ...snap.data() }));
            }
          },
          (err) => {
            console.error("Profile listener error:", err);
            // Base user already set above — no fallback needed
          }
        );
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
