import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export function useProgress(uid, planId) {
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    if (!uid || !planId) return;
    const q = query(
      collection(db, "dailyProgress"),
      where("uid", "==", uid),
      where("planId", "==", planId)
    );
    return onSnapshot(q, (snap) => {
      setProgress(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [uid, planId]);

  return progress;
}
