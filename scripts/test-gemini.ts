/**
 * Test script for Gemini API integration
 * Run with: npx tsx scripts/test-gemini.ts
 */

import { generateHexacoInsights } from '../src/lib/services/hexacoInsightsService';

async function main() {
  console.log('🧪 Testing Gemini API Integration\n');

  // Check if API key is set
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set in environment');
    console.log('\n📝 To set up:');
    console.log('1. Go to https://aistudio.google.com/apikey');
    console.log('2. Create an API key');
    console.log('3. Add to .env.local: GEMINI_API_KEY=your-key-here\n');
    process.exit(1);
  }

  console.log('✅ GEMINI_API_KEY found\n');

  // Test HEXACO insights generation
  console.log('📊 Testing HEXACO insights generation...\n');

  const testScores = {
    H: 4.2, // Honesty-Humility
    E: 3.1, // Emotionality
    X: 2.8, // Extraversion
    A: 4.5, // Agreeableness
    C: 3.9, // Conscientiousness
    O: 4.1, // Openness
  };

  const testArchetype = 'THE DILIGENT STEWARD';

  console.log('Test Scores:', testScores);
  console.log('Test Archetype:', testArchetype);
  console.log('\nGenerating insights...\n');

  try {
    const insights = await generateHexacoInsights(testScores, testArchetype);

    console.log('✅ Insights generated successfully!\n');
    console.log('─'.repeat(80));
    console.log(insights);
    console.log('─'.repeat(80));
    console.log(`\n📏 Length: ${insights.length} characters`);
    console.log(`📝 Paragraphs: ${insights.split('\n\n').length}`);

    if (insights.includes('AI') || insights.includes('API')) {
      console.log('\n⚠️  Warning: Insights may be using fallback template');
    } else {
      console.log('\n✨ Looks like AI-generated content!');
    }

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Error generating insights:', error);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

main();
