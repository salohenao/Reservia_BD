export const CATEGORIES = [
  { id: 'SALUD', label: 'Salud', emoji: '🏥' },
  { id: 'BELLEZA', label: 'Belleza', emoji: '✂️' },
  { id: 'DEPORTES', label: 'Deportes', emoji: '🏋️' },
  { id: 'BIENESTAR', label: 'Bienestar', emoji: '🧘' },
  { id: 'ODONTOLOGIA', label: 'Odontología', emoji: '🦷' },
  { id: 'FISIOTERAPIA', label: 'Fisioterapia', emoji: '🤕' },
  { id: 'OTRO', label: 'Otro', emoji: '📋' },
];

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function categoryEmoji(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.emoji ?? '📋';
}
