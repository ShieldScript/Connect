import { HEXACO_QUESTIONS } from '@/data/hexacoQuestions';

export interface HexacoScores {
  H: number;
  E: number;
  X: number;
  A: number;
  C: number;
  O: number;
}

export function calculateHexacoScores(
  responses: Map<number, number>
): HexacoScores | null {
  if (responses.size < 60) return null;

  const dimensionScores: Record<string, number[]> = {
    H: [],
    E: [],
    X: [],
    A: [],
    C: [],
    O: [],
  };

  HEXACO_QUESTIONS.forEach((q) => {
    const response = responses.get(q.id);
    if (!response) return;

    // Reverse-scored items: flip scale (1→5, 2→4, 3→3, 4→2, 5→1)
    const adjustedScore = q.reverse ? (6 - response) : response;

    dimensionScores[q.dimension].push(adjustedScore);
  });

  // Calculate average for each dimension
  const averages: Record<string, number> = {};
  Object.entries(dimensionScores).forEach(([dim, scores]) => {
    if (scores.length === 0) {
      averages[dim] = 3; // Default neutral if no scores
    } else {
      const sum = scores.reduce((a, b) => a + b, 0);
      averages[dim] = Math.round((sum / scores.length) * 10) / 10; // Round to 1 decimal
    }
  });

  return averages as HexacoScores;
}

export function getArchetype(scores: HexacoScores): string {
  // Find top 2 dimensions
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([dim]) => dim);

  const [top1, top2] = sorted.slice(0, 2);
  const combo = [top1, top2].sort().join('');

  // Map combinations to archetypes (alphabetically sorted keys)
  const archetypes: Record<string, string> = {
    // Honesty-Humility combinations
    'AH': 'THE HUMBLE PEACEMAKER',
    'CH': 'THE DILIGENT STEWARD',
    'EH': 'THE SINCERE GUARDIAN',
    'HO': 'THE PRINCIPLED EXPLORER',
    'HX': 'THE AUTHENTIC CONNECTOR',

    // Emotionality combinations
    'AE': 'THE COMPASSIONATE HARMONIZER',
    'CE': 'THE RELIABLE NURTURER',
    'EO': 'THE SENSITIVE SEEKER',
    'EX': 'THE WARM ADVOCATE',

    // Extraversion combinations
    'AX': 'THE FRIENDLY DIPLOMAT',
    'CX': 'THE ENERGETIC ORGANIZER',
    'OX': 'THE BOLD VISIONARY',

    // Agreeableness combinations
    'AC': 'THE STEADY SUPPORTER',
    'AO': 'THE GENTLE INNOVATOR',

    // Conscientiousness combinations
    'CO': 'THE SYSTEMATIC THINKER',

    // Default fallback
    'DEFAULT': 'THE BALANCED DISCIPLE',
  };

  return archetypes[combo] || archetypes['DEFAULT'];
}

export function getDimensionDescription(dimension: keyof HexacoScores, score: number): string {
  const isHigh = score >= 4;
  const isLow = score <= 2;

  const descriptions: Record<keyof HexacoScores, { high: string; low: string; mid: string }> = {
    H: {
      high: 'You value fairness, sincerity, and modesty. You avoid manipulation and genuinely care about ethical conduct.',
      low: 'You may be comfortable with self-promotion and strategic positioning. You prioritize results over strict adherence to rules.',
      mid: 'You balance integrity with pragmatism, knowing when to stand firm and when to be flexible.',
    },
    E: {
      high: 'You experience emotions deeply and value emotional connection. You seek support and express feelings openly.',
      low: 'You remain emotionally stable under pressure. You handle stress independently without needing reassurance.',
      mid: 'You balance emotional awareness with resilience, connecting with others while maintaining composure.',
    },
    X: {
      high: 'You thrive in social settings and actively seek connection. You energize groups and enjoy being around people.',
      low: 'You prefer solitude or small groups. You recharge through quiet reflection rather than social interaction.',
      mid: 'You adapt to both social and solitary contexts, comfortable in groups but also valuing alone time.',
    },
    A: {
      high: 'You are patient, forgiving, and slow to anger. You prioritize harmony and give others the benefit of the doubt.',
      low: 'You hold firm boundaries and don\'t tolerate mistreatment. You express disagreement directly when needed.',
      mid: 'You balance grace with accountability, extending patience while maintaining healthy boundaries.',
    },
    C: {
      high: 'You are organized, disciplined, and detail-oriented. You plan ahead and follow through on commitments.',
      low: 'You prefer spontaneity and flexibility. You adapt quickly and don\'t let structure constrain you.',
      mid: 'You balance planning with adaptability, organized when needed but comfortable with improvisation.',
    },
    O: {
      high: 'You are intellectually curious and creative. You enjoy exploring new ideas, art, and unconventional perspectives.',
      low: 'You prefer practical, concrete approaches. You value tradition and established methods over novelty.',
      mid: 'You appreciate both innovation and tradition, open to new ideas while respecting what works.',
    },
  };

  const desc = descriptions[dimension];
  if (isHigh) return desc.high;
  if (isLow) return desc.low;
  return desc.mid;
}
