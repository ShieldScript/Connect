/**
 * Test script for DNA Analysis feature
 * Tests the complete flow from HEXACO scores to DNA analysis
 */

import { generateDNAAnalysis } from '../src/lib/services/dnaAnalysisService';

async function main() {
  console.log('🧬 Testing DNA Analysis Feature\n');

  // Check if API key is set
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set in environment');
    process.exit(1);
  }

  console.log('✅ GEMINI_API_KEY found\n');

  // Test HEXACO scores
  const testScores = {
    H: 4.2, // Honesty-Humility
    E: 3.1, // Emotionality
    X: 2.8, // Extraversion
    A: 4.5, // Agreeableness
    C: 3.9, // Conscientiousness
    O: 4.1, // Openness
  };

  const testArchetype = 'THE DILIGENT STEWARD';

  // Test stewardship data
  const testStewardship = {
    naturalGiftings: [
      { type: 'TEACHING', level: 5 },
      { type: 'ADMINISTRATION', level: 4 },
      { type: 'SHEPHERDING', level: 3 },
    ],
    supernaturalGiftings: [
      { type: 'WISDOM', level: 4 },
      { type: 'EXHORTATION', level: 4 },
    ],
    ministryExperiences: [
      { type: 'SMALL_GROUP_LEADERSHIP', level: 4 },
      { type: 'TEACHING_BIBLE_STUDY', level: 5 },
    ],
    practices: [
      { type: 'DAILY_BIBLE_READING', frequency: 5 },
      { type: 'WEEKLY_SABBATH', frequency: 4 },
    ],
    leadershipPatterns: [
      { style: 'COLLABORATIVE_DECISION_MAKER', frequency: 5 },
    ],
    callings: [
      { type: 'DISCIPLESHIP', clarity: 4 },
      { type: 'KINGDOM_BUILDING', clarity: 3 },
    ],
  };

  console.log('📊 Test Data:');
  console.log('HEXACO Scores:', testScores);
  console.log('Archetype:', testArchetype);
  console.log('Natural Gifts:', testStewardship.naturalGiftings.length);
  console.log('Supernatural Gifts:', testStewardship.supernaturalGiftings.length);
  console.log('Callings:', testStewardship.callings.length);
  console.log('\n🔄 Generating DNA analysis...\n');

  try {
    const analysis = await generateDNAAnalysis(
      testScores,
      testArchetype,
      testStewardship
    );

    console.log('✅ DNA Analysis generated successfully!\n');
    console.log('═'.repeat(80));
    console.log('RESULTS:');
    console.log('═'.repeat(80));

    console.log('\n📈 Overall Alignment Score:', analysis.overallAlignment + '%');

    console.log('\n✅ Natural Fit (Where DNA supports calling):');
    analysis.naturalFit.forEach((fit, i) => {
      console.log(`   ${i + 1}. ${fit}`);
    });

    console.log('\n🎯 Growth Opportunities (Healthy tensions):');
    analysis.growthOpportunities.forEach((opp, i) => {
      console.log(`   ${i + 1}. ${opp}`);
    });

    console.log('\n💫 Spiritual Insight:');
    console.log('─'.repeat(80));
    console.log(analysis.spiritualInsight);
    console.log('─'.repeat(80));

    console.log('\n🔬 Dimension Insights:');
    Object.entries(analysis.dimensionInsights).forEach(([key, insight]) => {
      const labels: Record<string, string> = {
        H: 'Honesty-Humility',
        E: 'Emotionality',
        X: 'Extraversion',
        A: 'Agreeableness',
        C: 'Conscientiousness',
        O: 'Openness',
      };
      console.log(`\n   ${labels[key]} (${testScores[key as keyof typeof testScores].toFixed(1)}/5):`);
      console.log(`   ${insight}`);
    });

    console.log('\n');
    console.log('═'.repeat(80));
    console.log('✅ All tests passed!');
    console.log('═'.repeat(80));

    // Calculate some stats
    const insightLength = analysis.spiritualInsight.length;
    const paragraphs = analysis.spiritualInsight.split('\n\n').length;

    console.log('\n📊 Analysis Quality Metrics:');
    console.log(`   Alignment Score: ${analysis.overallAlignment}%`);
    console.log(`   Natural Fits: ${analysis.naturalFit.length}`);
    console.log(`   Growth Opportunities: ${analysis.growthOpportunities.length}`);
    console.log(`   Spiritual Insight Length: ${insightLength} characters`);
    console.log(`   Paragraphs: ${paragraphs}`);

    if (analysis.overallAlignment >= 70) {
      console.log('\n✨ Strong alignment detected!');
    }

    if (insightLength < 100) {
      console.log('\n⚠️  Warning: Spiritual insight seems short - may be using fallback');
    } else {
      console.log('\n✨ AI-generated content detected!');
    }

  } catch (error) {
    console.error('\n❌ Error generating DNA analysis:', error);
    process.exit(1);
  }
}

main();
