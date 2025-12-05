import { Tier } from './types';

let nextId = 1;
export const generateId = () => nextId++;

export const getTieredValue = (tiers: Tier[], pax: number): number => {
  if (!tiers || tiers.length === 0) return 0;
  
  // Find tier where min <= pax <= max
  const match = tiers.find(t => pax >= t.min && pax <= t.max);
  if (!match) {
    // Fallback logic: if pax > highest max, use highest value; if < lowest min, use lowest
    const sorted = [...tiers].sort((a, b) => a.min - b.min);
    if (sorted.length > 0 && pax > sorted[sorted.length - 1].max) {
      return sorted[sorted.length - 1].value;
    }
    return sorted[0]?.value || 0;
  }
  return match.value;
};
