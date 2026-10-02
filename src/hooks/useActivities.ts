import { useState, useEffect, useCallback, useMemo } from 'react';
import { ActivityItem, ActivityCategory, SubTask, ActivityHistoryEntry } from '../types';
import {
  loadActivitiesFromStorage,
  saveActivitiesToStorage,
  formatDateKey,
  loadBackupConfigFromStorage,
  saveBackupConfigToStorage,
} from '../utils/storage';

export function useActivities() {
  const [activities, setActivities] = useState<ActivityItem[]>(() => loadActivitiesFromStorage());
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateKey());
  const todayKey = useMemo(() => formatDateKey(), []);

  // Save changes to localStorage whenever activities change
  useEffect(() => {
    saveActivitiesToStorage(activities);
  }, [activities]);

  // Check if an activity is scheduled for a given date
  const isScheduledForDate = useCallback((act: ActivityItem, dateStr: string): boolean => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return true;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday

    if (act.schedule === 'daily') return true;
    if (act.schedule === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
    if (act.schedule === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
    if (act.schedule === 'custom' && act.customDays) {
      return act.customDays.includes(dayOfWeek);
    }
    return true;
  }, []);

  // Helper to extract or derive activity state for a specific date
  const getActivityStateForDate = useCallback((act: ActivityItem, dateKey: string) => {
    const isToday = dateKey === todayKey;
    const hist = act.history?.[dateKey];

    if (isToday) {
      return {
        completed: act.completed,
        value: act.currentValue,
        targetValue: act.targetValue,
        subtasks: act.subtasks,
      };
    }

    if (hist) {
      return {
        completed: hist.completed,
        value: hist.value,
        targetValue: hist.targetValue,
        subtasks: act.subtasks.map((st, idx) => ({
          ...st,
          completed: idx < hist.subtasksCompleted,
        })),
      };
    }

    // Default historical state if never recorded
    return {
      completed: false,
      value: 0,
      targetValue: act.targetValue,
      subtasks: act.subtasks.map((st) => ({ ...st, completed: false })),
    };
  }, [todayKey]);

  // Filter activities scheduled for the selected date
  const scheduledActivities = useMemo(() => {
    return activities.filter((act) => isScheduledForDate(act, selectedDate));
  }, [activities, selectedDate, isScheduledForDate]);

  // Calculate daily collective score for the selected date
  const dailyMetrics = useMemo(() => {
    if (scheduledActivities.length === 0) {
      return {
        total: 0,
        completed: 0,
        percentage: 0,
        totalTargetSum: 0,
        currentProgressSum: 0,
      };
    }

    let completedCount = 0;
    let totalScoreSum = 0;

    scheduledActivities.forEach((act) => {
      const state = getActivityStateForDate(act, selectedDate);
      if (state.completed) {
        completedCount++;
        totalScoreSum += 100;
      } else if (act.type === 'counter' || act.type === 'duration') {
        const ratio = state.targetValue > 0 ? Math.min(100, Math.round((state.value / state.targetValue) * 100)) : 0;
        totalScoreSum += ratio;
      } else if (act.subtasks && act.subtasks.length > 0) {
        const completedSub = state.subtasks.filter((st) => st.completed).length;
        const subRatio = Math.round((completedSub / act.subtasks.length) * 100);
        totalScoreSum += subRatio;
      }
    });

    const collectivePercentage = Math.round(totalScoreSum / scheduledActivities.length);

    return {
      total: scheduledActivities.length,
      completed: completedCount,
      percentage: Math.min(100, Math.max(0, collectivePercentage)),
    };
  }, [scheduledActivities, selectedDate, getActivityStateForDate]);

  // Toggle completion of an activity on the selected date
  const toggleComplete = useCallback((id: string) => {
    const isToday = selectedDate === todayKey;

    setActivities((prev) =>
      prev.map((act) => {
        if (act.id !== id) return act;

        const currentState = getActivityStateForDate(act, selectedDate);
        const newCompleted = !currentState.completed;
        const newValue = newCompleted
          ? act.targetValue
          : act.type === 'counter' || act.type === 'duration'
          ? 0
          : 0;

        const updatedSubtasks = act.subtasks.map((st) => ({
          ...st,
          completed: newCompleted,
        }));

        const newHistoryEntry: ActivityHistoryEntry = {
          completed: newCompleted,
          value: newValue,
          targetValue: act.targetValue,
          subtasksCompleted: newCompleted ? act.subtasks.length : 0,
          totalSubtasks: act.subtasks.length,
          timestamp: new Date().toISOString(),
        };

        const updatedHistory = {
          ...act.history,
          [selectedDate]: newHistoryEntry,
        };

        if (isToday) {
          return {
            ...act,
            completed: newCompleted,
            currentValue: newValue,
            subtasks: updatedSubtasks,
            history: updatedHistory,
            updatedAt: new Date().toISOString(),
          };
        }

        return {
          ...act,
          history: updatedHistory,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [selectedDate, todayKey, getActivityStateForDate]);

  // Increment or decrement counter
  const updateCounterValue = useCallback((id: string, delta: number) => {
    const isToday = selectedDate === todayKey;

    setActivities((prev) =>
      prev.map((act) => {
        if (act.id !== id) return act;

        const currentState = getActivityStateForDate(act, selectedDate);
        const step = act.stepSize || 1;
        const nextVal = Math.max(0, currentState.value + delta * step);
        const isCompleted = nextVal >= act.targetValue;

        const newHistoryEntry: ActivityHistoryEntry = {
          completed: isCompleted,
          value: nextVal,
          targetValue: act.targetValue,
          subtasksCompleted: currentState.subtasks.filter((s) => s.completed).length,
          totalSubtasks: act.subtasks.length,
          timestamp: new Date().toISOString(),
        };

        const updatedHistory = {
          ...act.history,
          [selectedDate]: newHistoryEntry,
        };

        if (isToday) {
          return {
            ...act,
            currentValue: nextVal,
            completed: isCompleted,
            history: updatedHistory,
            updatedAt: new Date().toISOString(),
          };
        }

        return {
          ...act,
          history: updatedHistory,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [selectedDate, todayKey, getActivityStateForDate]);

  // Toggle a single subtask
  const toggleSubtask = useCallback((activityId: string, subtaskId: string) => {
    const isToday = selectedDate === todayKey;

    setActivities((prev) =>
      prev.map((act) => {
        if (act.id !== activityId) return act;

        const updatedSubtasks = act.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );

        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
        const completedCount = updatedSubtasks.filter((st) => st.completed).length;

        const newHistoryEntry: ActivityHistoryEntry = {
          completed: allDone,
          value: allDone ? act.targetValue : act.currentValue,
          targetValue: act.targetValue,
          subtasksCompleted: completedCount,
          totalSubtasks: updatedSubtasks.length,
          timestamp: new Date().toISOString(),
        };

        const updatedHistory = {
          ...act.history,
          [selectedDate]: newHistoryEntry,
        };

        if (isToday) {
          return {
            ...act,
            subtasks: updatedSubtasks,
            completed: allDone,
            history: updatedHistory,
            updatedAt: new Date().toISOString(),
          };
        }

        return {
          ...act,
          history: updatedHistory,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [selectedDate, todayKey]);

  // Add new activity
  const addActivity = useCallback((newAct: Omit<ActivityItem, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'completed' | 'currentValue'>) => {
    const id = 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const activity: ActivityItem = {
      ...newAct,
      id,
      completed: false,
      currentValue: 0,
      history: {},
      createdAt: now,
      updatedAt: now,
    };

    setActivities((prev) => [activity, ...prev]);
    return activity;
  }, []);

  // Update existing activity
  const updateActivity = useCallback((id: string, updates: Partial<ActivityItem>) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, ...updates, updatedAt: new Date().toISOString() } : act))
    );
  }, []);

  // Delete activity
  const deleteActivity = useCallback((id: string) => {
    setActivities((prev) => prev.filter((act) => act.id !== id));
  }, []);

  // Bulk replace activities (e.g. after cloud restore)
  const replaceAllActivities = useCallback((newActivities: ActivityItem[]) => {
    setActivities(newActivities);
    saveActivitiesToStorage(newActivities);
  }, []);

  return {
    activities,
    scheduledActivities,
    selectedDate,
    setSelectedDate,
    todayKey,
    dailyMetrics,
    getActivityStateForDate,
    toggleComplete,
    updateCounterValue,
    toggleSubtask,
    addActivity,
    updateActivity,
    deleteActivity,
    replaceAllActivities,
  };
}
