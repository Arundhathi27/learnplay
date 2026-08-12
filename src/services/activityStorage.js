import { normalizeActivityType } from '../constants/activityTypes';

const STORAGE_KEY = 'vblivestream_created_activities';

export function normalizeActivity(act = {}) {
  const now = new Date().toISOString();
  const id = act.id || `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const type = normalizeActivityType(act.type);
  const status = act.status === 'published' ? 'published' : 'draft';

  return {
    id,
    type,
    title: act.title || 'Untitled Activity',
    description: act.description || '',
    content: act.content || {},
    settings: act.settings || {},
    feedback: {
      correct: act.feedback?.correct || 'Great job!',
      incorrect: act.feedback?.incorrect || 'Try again!',
      completion: act.feedback?.completion || 'Activity completed!'
    },
    status,
    createdAt: act.createdAt || now,
    updatedAt: act.updatedAt || now
  };
}

export function getActivities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeActivity);
  } catch (err) {
    console.error('Error reading activities from localStorage:', err);
    return [];
  }
}

export function getActivity(id) {
  const activities = getActivities();
  return activities.find((act) => act.id === id) || null;
}

export function getActivityById(id) {
  return getActivity(id);
}

export function getActivitiesByType(type) {
  const targetType = normalizeActivityType(type);
  const activities = getActivities();
  return activities.filter((act) => act.type === targetType);
}

export function saveActivity(activityData) {
  return createActivity(activityData);
}

export function createActivity(activityData) {
  const activities = getActivities();
  const now = new Date().toISOString();
  const normalized = normalizeActivity({
    ...activityData,
    createdAt: activityData.createdAt || now,
    updatedAt: now
  });

  // Prepend new activity
  const updatedList = [normalized, ...activities.filter((a) => a.id !== normalized.id)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Error saving activity to localStorage:', err);
  }
  return normalized;
}

export function updateActivity(id, updatedFields) {
  const activities = getActivities();
  const index = activities.findIndex((act) => act.id === id);
  if (index === -1) {
    // Fallback: create if missing
    return createActivity({ ...updatedFields, id });
  }

  const existing = activities[index];
  const now = new Date().toISOString();
  const merged = normalizeActivity({
    ...existing,
    ...updatedFields,
    id: existing.id,
    createdAt: existing.createdAt || now,
    updatedAt: now
  });

  activities[index] = merged;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch (err) {
    console.error('Error updating activity in localStorage:', err);
  }
  return merged;
}

export function deleteActivity(id) {
  const activities = getActivities();
  const filtered = activities.filter((act) => act.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error deleting activity from localStorage:', err);
  }
  return true;
}

export function clearActivities() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing activities in localStorage:', err);
  }
}
