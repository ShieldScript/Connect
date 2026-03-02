/**
 * Pure HEXACO Personality Analysis Service
 *
 * Analyzes HEXACO scores independently of stewardship/calling.
 * This is the "who you are" before "how you serve".
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

interface HexacoAnalysis {
  overallDescription: string; // 2-3 paragraph personality overview
  theBraid: string[]; // 2-3 explicit connections between HEXACO and interests
  dimensionInsights: {
    H: string;
    E: string;
    X: string;
    A: string;
    C: string;
    O: string;
  };
  strengths: string[]; // 3-5 natural strengths based on high scores
  growthEdges: string[]; // 2-3 areas that may need development
  relationshipTendencies: string; // How they typically relate to others
  workStyle: string; // How they approach tasks and responsibilities
  spiritualTendencies: string; // General spiritual/religious tendencies
}

/**
 * Generate pure HEXACO personality analysis
 */
export async function generateHexacoAnalysis(
  hexacoScores: HexacoScores,
  archetype: string,
  interests?: Array<{ type: string; proficiency: number }>
): Promise<HexacoAnalysis> {
  // Check if AI is available
  if (!isGeminiAvailable()) {
    console.warn('Gemini API not available, using fallback HEXACO analysis');
    return generateFallbackHexacoAnalysis(hexacoScores, archetype);
  }

  const prompt = buildHexacoPrompt(hexacoScores, archetype, interests);
  const aiResponse = await generateContent(prompt, {
    temperature: 0.4, // Lower for consistency
    maxTokens: 2500,
    systemInstruction:
      'You are a Senior Behavioral Psychologist with expertise in the HEXACO model. Provide insightful, accurate personality analysis. Be authoritative, masculine, affirming, and highly specific. No generic fluff.',
  });

  // Parse AI response or fallback
  if (!aiResponse) {
    console.warn('Gemini API returned null, using fallback HEXACO analysis');
    return generateFallbackHexacoAnalysis(hexacoScores, archetype);
  }

  // Parse structured response from AI
  return parseHexacoResponse(aiResponse, hexacoScores, archetype);
}

/**
 * Build prompt for pure HEXACO analysis
 */
function buildHexacoPrompt(
  scores: HexacoScores,
  archetype: string,
  interests?: Array<{ type: string; proficiency: number }>
): string {
  // Format interests if provided
  const interestsText = interests && interests.length > 0
    ? interests
        .sort((a, b) => b.proficiency - a.proficiency)
        .slice(0, 5)
        .map(i => `${i.type} (${i.proficiency}/5)`)
        .join(', ')
    : 'None reported';

  return `You are analyzing a person's HEXACO personality profile. Provide a comprehensive personality analysis based on their temperament and interests.

# HEXACO PERSONALITY PROFILE
- Honesty-Humility: ${scores.H.toFixed(1)}/5
- Emotionality: ${scores.E.toFixed(1)}/5
- Extraversion: ${scores.X.toFixed(1)}/5
- Agreeableness: ${scores.A.toFixed(1)}/5
- Conscientiousness: ${scores.C.toFixed(1)}/5
- Openness to Experience: ${scores.O.toFixed(1)}/5
- Archetype: ${archetype}

# INTERESTS (Top Activities)
${interestsText}

# YOUR TASK
Provide a pure personality analysis. Do NOT reference calling, ministry, or career. Focus on natural temperament.

## 1. OVERALL DESCRIPTION (200-250 words, 2-3 paragraphs)
Write an authoritative, insightful description of this person's natural temperament. Focus on the INTERPLAY between dimensions (e.g., how high Conscientiousness + low Extraversion creates a 'Quiet Craftsman' profile). What is it like to be them? How do they experience the world?

## 2. THE BRAID (2-3 explicit connections)
If interests are provided, draw direct lines between specific HEXACO dimensions and their interests. Show how personality FUELS their pursuits. Examples:
- "Your high Openness (${scores.O.toFixed(1)}) is the engine behind your Philosophy interest—you crave deep, abstract thinking"
- "Conscientiousness (${scores.C.toFixed(1)}) + Woodworking reveals your precision-driven, hands-on mastery"
- "Low Extraversion (${scores.X.toFixed(1)}) + Reading shows you recharge through solitary intellectual pursuits"

Be specific and masculine. Show the WHY behind each interest through personality lens.

## 3. DIMENSION INSIGHTS (1-2 sentences each)
For each HEXACO dimension, explain what this score reveals about their personality:
- H: [How Honesty-Humility shows up in their character and relationships]
- E: [How Emotionality influences their inner experience and responses]
- X: [How Extraversion shapes their social energy and engagement]
- A: [How Agreeableness affects their interpersonal approach]
- C: [How Conscientiousness drives their organization and goals]
- O: [How Openness influences their curiosity and perspective]

## 4. NATURAL STRENGTHS (3-5 bullet points)
What are the clear strengths that emerge from this profile? Be specific about which dimensions create these strengths.

## 5. GROWTH EDGES (2-3 bullet points)
Where might this temperament face challenges or need intentional development? Frame positively.

## 6. RELATIONSHIP TENDENCIES (75-100 words)
How does this person naturally show up in relationships? What do they bring? What might they need to be aware of?

## 7. WORK STYLE (75-100 words)
How does this temperament approach tasks, projects, and responsibilities? What environments suit them?

## 8. SPIRITUAL TENDENCIES (75-100 words)
Based on personality research, what spiritual/religious tendencies might this temperament naturally lean toward? (e.g., contemplative vs active, structured vs spontaneous, communal vs individual)

FORMAT YOUR RESPONSE AS JSON:
{
  "overallDescription": "...",
  "theBraid": ["...", "...", "..."],
  "dimensionInsights": {
    "H": "...",
    "E": "...",
    "X": "...",
    "A": "...",
    "C": "...",
    "O": "..."
  },
  "strengths": ["...", "...", "..."],
  "growthEdges": ["...", "..."],
  "relationshipTendencies": "...",
  "workStyle": "...",
  "spiritualTendencies": "..."
}

Be insightful, specific, and affirming. This is a pivotal moment of self-understanding.`;
}

/**
 * Parse AI response into structured HEXACO analysis
 */
function parseHexacoResponse(
  response: string,
  scores: HexacoScores,
  archetype: string
): HexacoAnalysis {
  try {
    // First, try to extract JSON from markdown code blocks
    let jsonText = response;
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    } else {
      // Try to extract JSON object directly
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
    }

    // Clean up common JSON issues
    jsonText = jsonText
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'); // Ensure property names are quoted

    const parsed = JSON.parse(jsonText);
    return {
      overallDescription: parsed.overallDescription || '',
      theBraid: parsed.theBraid || [],
      dimensionInsights: parsed.dimensionInsights || {},
      strengths: parsed.strengths || [],
      growthEdges: parsed.growthEdges || [],
      relationshipTendencies: parsed.relationshipTendencies || '',
      workStyle: parsed.workStyle || '',
      spiritualTendencies: parsed.spiritualTendencies || '',
    };
  } catch (error) {
    console.error('Failed to parse HEXACO analysis response:', error);
    console.error('Raw response:', response.substring(0, 500)); // Log first 500 chars for debugging
  }

  // Fallback if parsing fails
  return generateFallbackHexacoAnalysis(scores, archetype);
}

/**
 * Generate fallback HEXACO analysis when AI unavailable
 */
function generateFallbackHexacoAnalysis(
  scores: HexacoScores,
  archetype: string
): HexacoAnalysis {
  const strengths = generateFallbackStrengths(scores);
  const growthEdges = generateFallbackGrowthEdges(scores);

  return {
    overallDescription: generateFallbackDescription(scores, archetype),
    theBraid: [], // No interests in fallback mode
    dimensionInsights: {
      H: `Your Honesty-Humility (${scores.H.toFixed(1)}/5) reflects your approach to power, status, and fairness. ${
        scores.H >= 3.5
          ? 'You naturally value humility and ethical behavior.'
          : 'You may be comfortable with ambition and self-promotion.'
      }`,
      E: `Your Emotionality (${scores.E.toFixed(1)}/5) shapes your emotional life. ${
        scores.E >= 3.5
          ? 'You experience emotions deeply and value emotional connection.'
          : 'You tend toward emotional stability and calm.'
      }`,
      X: `Your Extraversion (${scores.X.toFixed(1)}/5) determines your social energy. ${
        scores.X >= 3.5
          ? 'You gain energy from social interaction and group settings.'
          : 'You recharge through solitude and prefer smaller gatherings.'
      }`,
      A: `Your Agreeableness (${scores.A.toFixed(1)}/5) influences your interpersonal approach. ${
        scores.A >= 3.5
          ? 'You naturally seek harmony and cooperative relationships.'
          : 'You value honesty and may engage in productive conflict.'
      }`,
      C: `Your Conscientiousness (${scores.C.toFixed(1)}/5) drives your organization and discipline. ${
        scores.C >= 3.5
          ? 'You bring structure, planning, and follow-through to your work.'
          : 'You may prefer flexibility and spontaneity over rigid planning.'
      }`,
      O: `Your Openness (${scores.O.toFixed(1)}/5) shapes your curiosity and perspective. ${
        scores.O >= 3.5
          ? 'You embrace new ideas and diverse perspectives readily.'
          : 'You may value tradition and proven approaches.'
      }`,
    },
    strengths,
    growthEdges,
    relationshipTendencies: generateRelationshipTendencies(scores),
    workStyle: generateWorkStyle(scores),
    spiritualTendencies: generateSpiritualTendencies(scores),
  };
}

/**
 * Generate fallback strengths
 */
function generateFallbackStrengths(scores: HexacoScores): string[] {
  const strengths: string[] = [];

  if (scores.H >= 4.0) strengths.push('Strong integrity and ethical standards');
  if (scores.E >= 4.0) strengths.push('Deep emotional awareness and empathy');
  if (scores.X >= 4.0) strengths.push('Natural social energy and relationship building');
  if (scores.A >= 4.0) strengths.push('Exceptional patience and collaborative spirit');
  if (scores.C >= 4.0) strengths.push('Outstanding organization and reliability');
  if (scores.O >= 4.0) strengths.push('Intellectual curiosity and creative thinking');

  // Add moderate strengths if needed
  if (strengths.length < 3) {
    if (scores.H >= 3.5) strengths.push('Balanced approach to ambition and humility');
    if (scores.C >= 3.5) strengths.push('Good balance of planning and adaptability');
    if (scores.A >= 3.5) strengths.push('Strong interpersonal skills');
  }

  return strengths.slice(0, 5);
}

/**
 * Generate fallback growth edges
 */
function generateFallbackGrowthEdges(scores: HexacoScores): string[] {
  const edges: string[] = [];

  if (scores.X < 3.0)
    edges.push('Building comfort with group settings and public visibility');
  if (scores.O < 3.0)
    edges.push('Embracing new ideas and perspectives beyond your comfort zone');
  if (scores.C < 3.0)
    edges.push('Developing systems and follow-through for long-term goals');

  return edges.length > 0
    ? edges.slice(0, 3)
    : ['Continue developing balanced expression of all dimensions'];
}

/**
 * Generate fallback overall description
 */
function generateFallbackDescription(
  scores: HexacoScores,
  archetype: string
): string {
  const avgScore = (scores.H + scores.E + scores.X + scores.A + scores.C + scores.O) / 6;

  return `Your HEXACO profile reveals a ${
    archetype ? `"${archetype}"` : 'unique'
  } temperament shaped by your natural wiring. With an average score of ${avgScore.toFixed(
    1
  )}/5 across all dimensions, you bring a balanced perspective to life.

Your personality is characterized by ${
    scores.C >= 3.5 ? 'strong organizational capacity' : 'adaptive flexibility'
  }, ${scores.A >= 3.5 ? 'collaborative warmth' : 'direct honesty'}, and ${
    scores.O >= 3.5 ? 'intellectual curiosity' : 'practical wisdom'
  }. The way you ${scores.X >= 3.5 ? 'energize groups' : 'invest deeply in individuals'} reflects your ${
    scores.X >= 3.5 ? 'extraverted' : 'introverted'
  } nature.

This temperament creates both natural strengths and healthy growth edges. Understanding these patterns helps you work with your design rather than against it, maximizing your effectiveness while honoring how God created you.`;
}

/**
 * Generate relationship tendencies
 */
function generateRelationshipTendencies(scores: HexacoScores): string {
  const extraversion = scores.X >= 3.5 ? 'extraverted' : 'introverted';
  const agreeableness = scores.A >= 3.5 ? 'harmonizing' : 'direct';

  return `In relationships, you naturally ${
    scores.X >= 3.5 ? 'seek connection with many people' : 'invest deeply in fewer relationships'
  }. Your ${agreeableness} style means you ${
    scores.A >= 3.5
      ? 'prioritize peace and understanding'
      : 'value honesty even when it creates tension'
  }. Combined with ${
    scores.E >= 3.5 ? 'emotional sensitivity' : 'emotional steadiness'
  }, you ${
    scores.E >= 3.5
      ? 'create space for vulnerable connection'
      : 'provide calm stability for others'
  }. People experience you as ${
    scores.H >= 3.5 ? 'trustworthy and humble' : 'confident and ambitious'
  }.`;
}

/**
 * Generate work style
 */
function generateWorkStyle(scores: HexacoScores): string {
  return `You approach work with ${
    scores.C >= 3.5 ? 'careful planning and systematic execution' : 'flexibility and adaptability'
  }. Your ${scores.O >= 3.5 ? 'openness to new ideas' : 'preference for proven methods'} shapes how you solve problems. ${
    scores.X >= 3.5
      ? 'You thrive in collaborative team environments with regular interaction.'
      : 'You do your best work with focused time and space for deep thinking.'
  } Your ${
    scores.C >= 3.5 ? 'high conscientiousness ensures consistent follow-through' : 'spontaneity allows quick pivots when needed'
  }, making you effective in ${
    scores.C >= 3.5 ? 'structured' : 'dynamic'
  } settings.`;
}

/**
 * Generate spiritual tendencies
 */
function generateSpiritualTendencies(scores: HexacoScores): string {
  return `Your temperament suggests you may naturally lean toward ${
    scores.O >= 3.5
      ? 'exploring diverse spiritual perspectives and theological ideas'
      : 'grounding yourself in established traditions and doctrines'
  }. ${
    scores.C >= 3.5
      ? 'You likely appreciate structured spiritual disciplines like regular prayer times and systematic Bible study.'
      : 'You may prefer spontaneous spiritual practices that flow with your day.'
  } ${
    scores.X >= 3.5
      ? 'Corporate worship and community spiritual formation likely energize you.'
      : 'Contemplative prayer and individual spiritual reflection may be where you encounter God most deeply.'
  } Your ${
    scores.E >= 3.5 ? 'emotional depth' : 'emotional steadiness'
  } shapes how you experience the presence of God.`;
}
