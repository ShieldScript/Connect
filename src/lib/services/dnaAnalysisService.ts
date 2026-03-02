/**
 * DNA Analysis Service
 *
 * Creates the "Bridge" between Identity (HEXACO DNA) and Stewardship/Community (Active Life)
 * This is the crown jewel reveal that shows how God's design (passive temperament)
 * aligns with their calling (active ministry).
 */

import { generateContent, isGeminiAvailable } from './geminiService';

interface HexacoScores {
  H: number; // Honesty-Humility
  E: number; // Emotionality
  X: number; // Extraversion
  A: number; // Agreeableness
  C: number; // Conscientiousness
  O: number; // Openness
}

interface StewardshipData {
  naturalGiftings: Array<{ type: string; level: number }>;
  supernaturalGiftings: Array<{ type: string; level: number }>;
  ministryExperiences: Array<{ type: string; level: number }>;
  practices: Array<{ type: string; frequency: number }>;
  leadershipPatterns: Array<{ style: string; frequency: number }>;
  callings: Array<{ type: string; clarity: number }>;
}

interface DNAAnalysis {
  overallAlignment: number; // 0-100 score of DNA/Stewardship alignment
  naturalFit: string[]; // Areas where DNA naturally supports their calling
  growthOpportunities: string[]; // Areas where DNA challenges their calling (growth edges)
  spiritualInsight: string; // 2-3 paragraph AI-generated insight
  dimensionInsights: {
    H: string; // How Honesty-Humility shows up in their life
    E: string; // How Emotionality shows up
    X: string; // How Extraversion shows up
    A: string; // How Agreeableness shows up
    C: string; // How Conscientiousness shows up
    O: string; // How Openness shows up
  };
}

/**
 * Generate comprehensive DNA analysis showing how temperament aligns with calling
 */
export async function generateDNAAnalysis(
  hexacoScores: HexacoScores,
  archetype: string,
  stewardship: StewardshipData
): Promise<DNAAnalysis> {
  // Check if AI is available
  if (!isGeminiAvailable()) {
    console.warn('Gemini API not available, using fallback DNA analysis');
    return generateFallbackAnalysis(hexacoScores, archetype, stewardship);
  }

  const prompt = buildDNAAnalysisPrompt(hexacoScores, archetype, stewardship);
  const aiResponse = await generateContent(prompt, {
    temperature: 0.4, // Lower for consistency
    maxTokens: 3000,
    systemInstruction:
      'You are a Christian spiritual director analyzing how God has uniquely designed someone for their calling. Show the beautiful alignment between their natural temperament (HEXACO) and their active ministry/stewardship. Be insightful, affirming, and strategic.',
  });

  // Parse AI response or fallback
  if (!aiResponse) {
    console.warn('Gemini API returned null, using fallback DNA analysis');
    return generateFallbackAnalysis(hexacoScores, archetype, stewardship);
  }

  // Parse structured response from AI
  return parseAIResponse(aiResponse, hexacoScores, stewardship);
}

/**
 * Build comprehensive prompt for DNA analysis
 */
function buildDNAAnalysisPrompt(
  scores: HexacoScores,
  archetype: string,
  stewardship: StewardshipData
): string {
  // Extract stewardship data (ALL items, sorted by level/frequency)
  const naturalGiftings = stewardship.naturalGiftings
    .sort((a, b) => b.level - a.level)
    .map(g => `${g.type} (${g.level}/5)`)
    .join(', ');

  const supernaturalGiftings = stewardship.supernaturalGiftings
    .sort((a, b) => b.level - a.level)
    .map(g => `${g.type} (${g.level}/5)`)
    .join(', ');

  const callings = stewardship.callings
    .sort((a, b) => b.clarity - a.clarity)
    .map(c => `${c.type} (${c.clarity}/5 clarity)`)
    .join(', ');

  const leadershipPatterns = stewardship.leadershipPatterns
    .sort((a, b) => b.frequency - a.frequency)
    .map(p => `${p.style} (${p.frequency}/5)`)
    .join(', ');

  const ministryExperiences = stewardship.ministryExperiences
    .sort((a, b) => b.level - a.level)
    .map(m => `${m.type} (${m.level}/5)`)
    .join(', ');

  const practices = stewardship.practices
    .sort((a, b) => b.frequency - a.frequency)
    .map(p => `${p.type} (${p.frequency}/5)`)
    .join(', ');

  return `You are analyzing how God's design (HEXACO temperament) aligns with a man's calling and stewardship.

# HEXACO DNA (Natural Temperament)
- Honesty-Humility: ${scores.H.toFixed(1)}/5
- Emotionality: ${scores.E.toFixed(1)}/5
- Extraversion: ${scores.X.toFixed(1)}/5
- Agreeableness: ${scores.A.toFixed(1)}/5
- Conscientiousness: ${scores.C.toFixed(1)}/5
- Openness: ${scores.O.toFixed(1)}/5
- Archetype: ${archetype}

# STEWARDSHIP DATA (How They Serve)
- Natural Gifts: ${naturalGiftings || 'None reported'}
- Supernatural Gifts: ${supernaturalGiftings || 'None reported'}
- Callings: ${callings || 'None reported'}
- Leadership Patterns: ${leadershipPatterns || 'None reported'}
- Ministry Experiences: ${ministryExperiences || 'None reported'}
- Spiritual Practices: ${practices || 'None reported'}

# YOUR TASK
Analyze how this man's HEXACO DNA aligns with his stewardship and calling. Provide:

## 1. OVERALL ALIGNMENT SCORE (0-100)
A number representing how well their natural temperament supports their calling.
- 80-100: Exceptional alignment, "called to this"
- 60-79: Strong alignment, natural fit with some growth edges
- 40-59: Moderate alignment, will require intentionality
- 20-39: Challenging alignment, significant growth needed
- 0-19: Misalignment, may need to reconsider calling or develop new strengths

## 2. NATURAL FIT (3-5 bullet points)
Where does their DNA naturally support their calling? Be specific. Example:
- "High Conscientiousness (${scores.C.toFixed(1)}) perfectly supports your Administration gift - you bring order and follow-through"

## 3. GROWTH OPPORTUNITIES (2-3 bullet points)
Where does their DNA create healthy tension with their calling? Frame positively. Example:
- "Lower Extraversion (${scores.X.toFixed(1)}) means Evangelism may require more energy - consider pairing it with your relational depth"

## 4. SPIRITUAL INSIGHT (200-250 words, 2-3 paragraphs)
Write a pastoral reflection on how beautifully God has designed them for their calling. Show:
- The divine intentionality in their wiring
- How their DNA + Stewardship create a unique Kingdom contribution
- Biblical framework (1-2 Scripture references)

## 5. DIMENSION INSIGHTS (one sentence each)
For each HEXACO dimension, explain how it shows up in their active life:
- H: [How Honesty-Humility manifests in their gifts/calling]
- E: [How Emotionality manifests]
- X: [How Extraversion manifests]
- A: [How Agreeableness manifests]
- C: [How Conscientiousness manifests]
- O: [How Openness manifests]

FORMAT YOUR RESPONSE AS JSON:
{
  "overallAlignment": 85,
  "naturalFit": ["...", "...", "..."],
  "growthOpportunities": ["...", "..."],
  "spiritualInsight": "...",
  "dimensionInsights": {
    "H": "...",
    "E": "...",
    "X": "...",
    "A": "...",
    "C": "...",
    "O": "..."
  }
}

Be specific, insightful, and encouraging. This is a pivotal "Mirror Moment" in their spiritual journey.`;
}

/**
 * Parse AI response into structured DNA analysis
 */
function parseAIResponse(
  response: string,
  scores: HexacoScores,
  stewardship: StewardshipData
): DNAAnalysis {
  try {
    // Try to extract JSON from response (AI might wrap it in markdown)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        overallAlignment: parsed.overallAlignment || 70,
        naturalFit: parsed.naturalFit || [],
        growthOpportunities: parsed.growthOpportunities || [],
        spiritualInsight: parsed.spiritualInsight || '',
        dimensionInsights: parsed.dimensionInsights || {},
      };
    }
  } catch (error) {
    console.error('Failed to parse AI DNA analysis response:', error);
  }

  // Fallback if parsing fails
  return generateFallbackAnalysis(scores, '', stewardship);
}

/**
 * Generate fallback analysis when AI unavailable
 */
function generateFallbackAnalysis(
  scores: HexacoScores,
  archetype: string,
  stewardship: StewardshipData
): DNAAnalysis {
  // Calculate simple alignment score based on gift-dimension correlations
  const alignment = calculateSimpleAlignment(scores, stewardship);

  // Generate basic insights
  const naturalFit = generateNaturalFit(scores, stewardship);
  const growthOpportunities = generateGrowthOpportunities(scores, stewardship);

  return {
    overallAlignment: alignment,
    naturalFit,
    growthOpportunities,
    spiritualInsight: generateFallbackInsight(scores, archetype, alignment),
    dimensionInsights: {
      H: `Your Honesty-Humility (${scores.H.toFixed(1)}/5) shapes your integrity in leadership and stewardship.`,
      E: `Your Emotionality (${scores.E.toFixed(1)}/5) influences your pastoral sensitivity and emotional availability.`,
      X: `Your Extraversion (${scores.X.toFixed(1)}/5) determines your energy for public ministry and community building.`,
      A: `Your Agreeableness (${scores.A.toFixed(1)}/5) affects your collaborative approach and conflict navigation.`,
      C: `Your Conscientiousness (${scores.C.toFixed(1)}/5) drives your organizational capacity and follow-through.`,
      O: `Your Openness (${scores.O.toFixed(1)}/5) shapes your receptivity to new ideas and theological exploration.`,
    },
  };
}

/**
 * Calculate simple alignment score
 */
function calculateSimpleAlignment(
  scores: HexacoScores,
  stewardship: StewardshipData
): number {
  // Base score: average of all dimensions
  const avgScore =
    (scores.H + scores.E + scores.X + scores.A + scores.C + scores.O) / 6;

  // Bonus for having clear gifts and callings
  const hasGifts = stewardship.naturalGiftings.length > 0;
  const hasCallings = stewardship.callings.length > 0;

  let alignment = avgScore * 15; // 0-75 base

  if (hasGifts) alignment += 10;
  if (hasCallings) alignment += 10;

  // Bonus for high conscientiousness (indicates intentionality)
  if (scores.C >= 4.0) alignment += 5;

  return Math.min(100, Math.round(alignment));
}

/**
 * Generate natural fit insights
 */
function generateNaturalFit(
  scores: HexacoScores,
  stewardship: StewardshipData
): string[] {
  const fits: string[] = [];

  // Check Administration gift + Conscientiousness
  if (
    stewardship.naturalGiftings.some(g => g.type.includes('Administration')) &&
    scores.C >= 3.5
  ) {
    fits.push(
      `High Conscientiousness (${scores.C.toFixed(1)}) naturally supports your Administration gift - you bring order and follow-through.`
    );
  }

  // Check Teaching + Openness
  if (
    stewardship.naturalGiftings.some(g => g.type.includes('Teaching')) &&
    scores.O >= 3.5
  ) {
    fits.push(
      `Strong Openness (${scores.O.toFixed(1)}) enhances your Teaching gift - you're curious and explore ideas deeply.`
    );
  }

  // Check Shepherding + Agreeableness
  if (
    stewardship.naturalGiftings.some(g =>
      g.type.toLowerCase().includes('shepherd')
    ) &&
    scores.A >= 3.5
  ) {
    fits.push(
      `High Agreeableness (${scores.A.toFixed(1)}) aligns with your pastoral heart - you naturally create harmony and care for others.`
    );
  }

  // Default insights if no specific matches
  if (fits.length === 0) {
    if (scores.H >= 4.0) {
      fits.push(
        'Your exceptional Honesty-Humility makes you trustworthy in any leadership context.'
      );
    }
    if (scores.C >= 4.0) {
      fits.push(
        'Your strong Conscientiousness ensures you serve with excellence and reliability.'
      );
    }
  }

  return fits.length > 0
    ? fits
    : ['Your unique temperament brings valuable perspective to the body of Christ.'];
}

/**
 * Generate growth opportunities
 */
function generateGrowthOpportunities(
  scores: HexacoScores,
  stewardship: StewardshipData
): string[] {
  const opportunities: string[] = [];

  // Low Extraversion + Evangelism calling
  if (
    scores.X < 3.0 &&
    stewardship.callings.some(c => c.type.includes('Evangelism'))
  ) {
    opportunities.push(
      'Your Evangelism calling may require more energy than your natural Extraversion - consider smaller, relational contexts.'
    );
  }

  // Low Openness + Teaching gift
  if (
    scores.O < 3.0 &&
    stewardship.naturalGiftings.some(g => g.type.includes('Teaching'))
  ) {
    opportunities.push(
      'Teaching may challenge you to explore new ideas beyond your comfort zone - lean into curiosity.'
    );
  }

  // Default opportunity
  if (opportunities.length === 0) {
    const lowestDimension = Object.entries(scores).sort(
      ([, a], [, b]) => a - b
    )[0];
    const dimensionNames: Record<string, string> = {
      H: 'Honesty-Humility',
      E: 'Emotionality',
      X: 'Extraversion',
      A: 'Agreeableness',
      C: 'Conscientiousness',
      O: 'Openness',
    };
    opportunities.push(
      `Consider how growing in ${dimensionNames[lowestDimension[0]]} might expand your ministry capacity.`
    );
  }

  return opportunities;
}

/**
 * Generate fallback spiritual insight
 */
function generateFallbackInsight(
  scores: HexacoScores,
  archetype: string,
  alignment: number
): string {
  const archetypePhrase = archetype ? `as ${archetype}` : 'in your unique design';

  return `God has wonderfully crafted you ${archetypePhrase}, and your temperament aligns beautifully with how you're stepping into Kingdom service. With an alignment of ${alignment}%, you're seeing clear evidence of divine intentionality - your natural wiring supports your calling in meaningful ways.

Your HEXACO profile reveals strengths that position you well for the gifts and callings you've identified. The areas where your temperament creates healthy tension are not obstacles, but invitations to grow in Christlikeness and expand your capacity to serve.

As you continue this journey, trust that God who began this good work in you - both in how He wired you and how He's calling you - will be faithful to complete it (Philippians 1:6). Your unique contribution to the body of Christ flows from this beautiful intersection of design and calling.`;
}
