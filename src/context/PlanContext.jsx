import { createContext, useContext, useState, useCallback } from "react";
import { db } from "../services/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";

const PlanContext = createContext(null);

export function PlanProvider({ children }) {
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPlan = useCallback(async (uid) => {
    setLoading(true);
    try {
      const q = query(collection(db, "studyPlans"), where("uid", "==", uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        // Taking the most recent plan
        const plans = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        plans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setActivePlan(plans[0]);
      }
    } catch (error) {
      console.error("Error loading plan:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePlan = useCallback(async (uid, planData) => {
    const ref = doc(collection(db, "studyPlans"));
    const newPlan = { uid, ...planData, createdAt: new Date().toISOString() };
    await setDoc(ref, newPlan);
    setActivePlan({ id: ref.id, ...newPlan });
  }, []);

  const deletePlan = useCallback(async (planId) => {
    await deleteDoc(doc(db, "studyPlans", planId));
    setActivePlan(null);
  }, []);

  return (
    <PlanContext.Provider value={{ activePlan, loading, loadPlan, savePlan, deletePlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export const usePlan = () => useContext(PlanContext);
