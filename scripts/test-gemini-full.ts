import { generateHexacoInsights } from '../src/lib/services/hexacoInsightsService';

async function main() {
  console.log('🧪 Testing Gemini API Integration\n');

  const testScores = {
    H: 4.2,
    E: 3.1,
    X: 2.8,
    A: 4.5,
    C: 3.9,
    O: 4.1,
  };

  const testArchetype = 'THE DILIGENT STEWARD';

  console.log('Generating insights...\n');

  try {
    const insights = await generateHexacoInsights(testScores, testArchetype);

    console.log('✅ Full Insights:\n');
    console.log('─'.repeat(80));
    console.log(insights);
    console.log('─'.repeat(80));
    console.log(`\nLength: ${insights.length} characters`);
    console.log(`Paragraphs: ${insights.split('\n\n').length}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
