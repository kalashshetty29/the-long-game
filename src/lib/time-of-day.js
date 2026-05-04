// Time-of-day detection + copy.
// 4 modes: morning, afternoon, evening, night.

export const TOD_CONFIG = {
  morning: {
    id: 'morning',
    greeting: 'Good morning.',
    accent: 'Run far.',
    label: "Today's intent",
    line: 'The plan only fails one way: stopping.',
    em: 'Never zero.',
    bgClass: 'bg-ink-900',
  },
  afternoon: {
    id: 'afternoon',
    greeting: 'Good afternoon.',
    accent: 'Steady on.',
    label: 'Halfway through',
    line: 'You are training the habit, not just the skill.',
    em: 'Keep showing up.',
    bgClass: 'bg-ink-700',
  },
  evening: {
    id: 'evening',
    greeting: 'Good evening.',
    accent: 'Wind down.',
    label: 'Today, in review',
    line: 'Almost everything will work again if you unplug it.',
    em: 'Including you.',
    bgClass: 'bg-stone-800',
  },
  night: {
    id: 'night',
    greeting: 'Good night.',
    accent: 'Be gentle.',
    label: 'Quiet hours',
    line: 'Sleep is part of training.',
    em: 'Tomorrow needs you whole.',
    bgClass: 'bg-stone-900',
  },
}

export function getTimeOfDay(date = new Date()) {
  const h = date.getHours()
  if (h >= 5 && h < 12) return TOD_CONFIG.morning
  if (h >= 12 && h < 17) return TOD_CONFIG.afternoon
  if (h >= 17 && h < 22) return TOD_CONFIG.evening
  return TOD_CONFIG.night
}
