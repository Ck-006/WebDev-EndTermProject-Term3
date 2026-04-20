import { useMemo } from "react";
import { usePlan } from "../context/PlanContext";

export function useTodayTasks() {
  const { activePlan } = usePlan();

  return useMemo(() => {
    if (!activePlan?.schedule) return [];
    const today = new Date().toISOString().split("T")[0];
    const todayEntry = activePlan.schedule.find((d) => d.date === today);
    return todayEntry?.tasks ?? [];
  }, [activePlan]);
}
