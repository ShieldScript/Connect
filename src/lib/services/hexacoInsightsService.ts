/**
 * HEXACO Insights Service
 *
 * Generates AI-powered spiritual interpretations of HEXACO personality assessments
 * using Google Gemini API.
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

/**
 * Generate spiritual insights from HEXACO scores
 * @param scores - The six HEXACO dimension scores (1-5 scale)
 * @param archetype - The calculated archetype (e.g., "THE DILIGENT STEWARD")
 * @returns AI-generated insights or fallback template
 */
export async function generateHexacoInsights(
  scores: HexacoScores,
  archetype: string
): Promise<string> {
  // Check if AI is available
  if (!isGeminiAvailable()) {
    console.warn('Gemini API not available, using fallback insights');
    return generateFallbackInsights(scores, archetype);
  }

  const prompt = buildInsightsPrompt(scores, archetype);
  const aiInsights = await generateContent(prompt, {
    temperature: 0.7,
    maxTokens: 2000, // Increased to allow full 3-paragraph output (~250 words = ~400-500 tokens)
    systemInstruction:
      'You are a Christian spiritual director analyzing personality assessments. Provide warm, Biblical, insightful interpretations that help people understand how God wired them for Kingdom work.',
  });

  // Fallback if AI fails
  if (!aiInsights) {
    console.warn('Gemini API returned null, using fallback insights');
    return generateFallbackInsights(scores, archetype);
  }

  return aiInsights;
}

/**
 * Build the prompt for Gemini
 */
function buildInsightsPrompt(
  scores: HexacoScores,
  archetype: string
): string {
  return `Analyze this HEXACO personality profile and provide a spiritual interpretation.

HEXACO Scores (1-5 scale):
- Honesty-Humility: ${scores.H.toFixed(1)}
- Emotionality: ${scores.E.toFixed(1)}
- Extraversion: ${scores.X.toFixed(1)}
- Agreeableness: ${scores.A.toFixed(1)}
- Conscientiousness: ${scores.C.toFixed(1)}
- Openness: ${scores.O.toFixed(1)}

Archetype: ${archetype}

Task: Write a 3-paragraph spiritual interpretation (200-250 words total):

1. **Natural Wiring** (80-100 words): What this profile reveals about how God uniquely designed this person. Reference their strongest traits and how these show up in daily life.

2. **Kingdom Service** (80-100 words): How these traits can serve in Christian community and Kingdom work. Be specific about ministry contexts where they'll thrive.

3. **Growth Edge** (40-50 words): One gentle growth opportunity aligned with their temperament. Frame it positively as an invitation, not a criticism.

Guidelines:
- Tone: Warm, insightful, affirming, pastoral
- Include 1-2 brief Scripture references naturally woven in (no full verses)
- Avoid psychology jargon; use accessible spiritual language
- Focus on strengths and calling, not pathology
- Be specific to their actual scores, not generic

Format: Plain text with paragraph breaks. No headings, bullets, or markdown.`;
}

/**
 * Generate fallback insights when AI is unavailable
 * Template-based approach using score patterns
 */
function generateFallbackInsights(
  scores: HexacoScores,
  archetype: string
): string {
  const { H, E, X, A, C, O } = scores;

  // Identify strongest dimensions
  const dimensions = [
    { name: 'Honesty-Humility', score: H, trait: 'integrity and humility' },
    { name: 'Emotionality', score: E, trait: 'emotional awareness' },
    { name: 'Extraversion', score: X, trait: 'social energy' },
    { name: 'Agreeableness', score: A, trait: 'compassion and harmony' },
    {
      name: 'Conscientiousness',
      score: C,
      trait: 'diligence and organization',
    },
    { name: 'Openness', score: O, trait: 'creativity and curiosity' },
  ];

  const sorted = dimensions.sort((a, b) => b.score - a.score);
  const top1 = sorted[0];
  const top2 = sorted[1];

  // Build paragraphs
  const p1 = `Your personality profile as ${archetype} reveals a person marked by ${top1.trait} and ${top2.trait}. With ${top1.name} at ${top1.score.toFixed(1)} and ${top2.name} at ${top2.score.toFixed(1)}, you're naturally wired to approach life with a balance of these strengths. This unique combination reflects how God has designed you to bring His Kingdom to the world around you.`;

  const p2 = `These traits position you well for ${getServiceContext(top1.name, top2.name)}. Your natural inclinations make you effective in contexts that value ${top1.trait}, while your capacity for ${top2.trait} allows you to serve with both strength and sensitivity. Communities benefit from your unique blend of gifts.`;

  const growthArea = getGrowthArea(sorted[sorted.length - 1].name);
  const p3 = `As you continue growing, consider exploring ${growthArea}. This isn't about changing who you are, but about expanding your capacity to serve in new ways.`;

  return `${p1}\n\n${p2}\n\n${p3}`;
}

/**
 * Helper: Determine service context based on top traits
 */
function getServiceContext(trait1: string, trait2: string): string {
  const contexts: Record<string, string> = {
    'Honesty-Humility': 'leadership and stewardship',
    Emotionality: 'pastoral care and counseling',
    Extraversion: 'hospitality and outreach',
    Agreeableness: 'peacemaking and team collaboration',
    Conscientiousness: 'administration and project management',
    Openness: 'creative ministry and innovation',
  };

  return contexts[trait1] || 'serving with your unique strengths';
}

/**
 * Helper: Suggest growth area based on weakest dimension
 */
function getGrowthArea(weakestTrait: string): string {
  const growthAreas: Record<string, string> = {
    'Honesty-Humility': 'deeper humility and surrender',
    Emotionality: 'emotional intelligence and self-awareness',
    Extraversion: 'stepping into community and connection',
    Agreeableness: 'compassion and grace for others',
    Conscientiousness: 'intentionality and follow-through',
    Openness: 'curiosity and openness to new perspectives',
  };

  return growthAreas[weakestTrait] || 'personal and spiritual growth';
}
