// Central constants for Vblivestream Activity Types

export const ACTIVITY_TYPES = [
  'dictation',
  'drag-drop',
  'find-multiple-hotspot',
  'find-hotspot',
  'memory',
  'word-scramble',
  'flashcards',
  'crossword',
  'drag-words'
];

export const ACTIVITY_TYPE_ALIASES = {
  'multiple-hotspot': 'find-multiple-hotspot',
  'find-multiple-hotspots': 'find-multiple-hotspot',
  'memory-game': 'memory',
  'drag-the-words': 'drag-words'
};

export function normalizeActivityType(type) {
  if (!type) return 'dictation';
  const lower = type.toLowerCase().trim();
  if (ACTIVITY_TYPES.includes(lower)) {
    return lower;
  }
  if (ACTIVITY_TYPE_ALIASES[lower]) {
    return ACTIVITY_TYPE_ALIASES[lower];
  }
  return lower;
}
