/**
 * Core Gemini AI Service
 *
 * Provides centralized access to Google Gemini API with:
 * - Rate limiting compliance (15 RPM free tier)
 * - Error handling and fallback logic
 * - Caching to minimize API calls
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Models
const GENERATION_MODEL = 'gemini-2.5-flash'; // Latest stable Flash model (fast, 1M tokens)
const EMBEDDING_MODEL = 'text-embedding-004'; // 768 dimensions, free

/**
 * Generate text content using Gemini
 * @param prompt - The prompt to send to Gemini
 * @param options - Optional configuration (temperature, maxTokens, etc.)
 * @returns Generated text or null on error
 */
export async function generateContent(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
  }
): Promise<string | null> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return null;
    }

    const model = genAI.getGenerativeModel({
      model: GENERATION_MODEL,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 1000,
      },
      systemInstruction: options?.systemInstruction,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);

    // Log specific error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }

    return null;
  }
}

/**
 * Generate embeddings for semantic similarity
 * @param text - Text to embed
 * @returns 768-dimensional vector or null on error
 */
export async function generateEmbedding(
  text: string
): Promise<number[] | null> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return null;
    }

    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Gemini embedding error:', error);
    return null;
  }
}

/**
 * Batch generate embeddings (respects rate limits)
 * @param texts - Array of texts to embed
 * @param delayMs - Delay between requests (default: 4000ms = 15 RPM)
 * @returns Array of embeddings (null for failed items)
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  delayMs: number = 4000
): Promise<(number[] | null)[]> {
  const embeddings: (number[] | null)[] = [];

  for (let i = 0; i < texts.length; i++) {
    embeddings.push(await generateEmbedding(texts[i]));

    // Rate limit: wait between requests (except last one)
    if (i < texts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return embeddings;
}

/**
 * Check if Gemini API is configured and accessible
 * @returns true if API key exists and client can be initialized
 */
export function isGeminiAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
