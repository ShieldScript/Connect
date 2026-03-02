# Gemini AI Integration - Phase 1: HEXACO Insights

## Overview

Phase 1 implements AI-powered personality insights for users who complete the HEXACO-60 assessment during onboarding. This provides meaningful spiritual interpretations of their personality profile.

## What's Implemented

### ✅ Core Services
- **`geminiService.ts`**: Core wrapper for Google Gemini API
  - Text generation with configurable parameters
  - Embedding generation (for future phases)
  - Rate limiting and error handling
  - Graceful fallback when API unavailable

- **`hexacoInsightsService.ts`**: HEXACO-specific insights generator
  - Generates 3-paragraph spiritual interpretations
  - Template-based fallback when AI unavailable
  - Customized prompts for Christian spiritual context

### ✅ Database Schema
Added fields to `Person` model:
```prisma
hexacoInsights          String?    @db.Text
hexacoInsightsGeneratedAt DateTime?
```

### ✅ API Routes
- **POST `/api/onboarding/complete`**: Updated to generate insights during onboarding
- **POST `/api/ai/hexaco-insights`**: Regenerate insights on demand

### ✅ UI Components
- **`HexacoInsightsCard.tsx`**: Displays AI insights on profile page
  - Shows archetype badge
  - Formatted 3-paragraph insights
  - "Regenerate" button for fresh insights
  - AI-powered indicator

### ✅ Integration Points
- Profile page displays insights automatically
- Onboarding completion triggers insight generation
- User can regenerate insights from profile

## Setup Instructions

### 1. Get Gemini API Key
1. Visit https://aistudio.google.com/apikey
2. Sign in with Google account
3. Click "Create API key"
4. Copy the key

### 2. Configure Environment
Add to `.env.local`:
```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Database Migration
Already completed via `prisma db push`

### 4. Test the Integration
```bash
# Test Gemini API connection
npx tsx scripts/test-gemini.ts
```

## How It Works

### Onboarding Flow
1. User completes 60 HEXACO questions
2. System calculates scores and archetype
3. **NEW**: System calls Gemini API to generate insights
4. Insights saved to database with timestamp
5. Profile page displays insights automatically

### Insights Generation
**Prompt Template**:
- Input: 6 HEXACO dimension scores (1-5 scale) + archetype
- Output: 3 paragraphs (200-250 words)
  1. Natural Wiring (how God designed them)
  2. Kingdom Service (how they can serve)
  3. Growth Edge (gentle growth opportunity)
- Tone: Warm, pastoral, Biblical (1-2 Scripture references)

**Example Output**:
```
Your personality profile as THE DILIGENT STEWARD reveals a person marked
by integrity and compassion. With Honesty-Humility at 4.2 and Agreeableness
at 4.5, you're naturally wired to approach life with a balance of these
strengths...

These traits position you well for leadership and stewardship contexts.
Your natural inclinations make you effective in situations that value
integrity, while your capacity for compassion allows you to serve with
both strength and sensitivity...

As you continue growing, consider exploring stepping into community and
connection. This isn't about changing who you are, but about expanding
your capacity to serve in new ways.
```

### Caching Strategy
- Insights cached indefinitely (personality doesn't change)
- User can manually regenerate via "Regenerate" button
- Timestamp tracked: `hexacoInsightsGeneratedAt`

### Fallback Behavior
If Gemini API fails or unavailable:
1. Template-based insights generated using score patterns
2. User experience unaffected (no errors shown)
3. Logged for debugging: "Gemini API not available, using fallback"

## Rate Limits

**Gemini Free Tier**:
- 15 requests per minute (RPM)
- 1,500 requests per day (RPD)
- 1 million tokens per minute (TPM)

**Our Usage**:
- Max 1 insight generation per user per onboarding (~200 tokens)
- Manual regenerations: occasional, user-initiated
- Well within free tier limits for typical usage

## Privacy & Security

### What's Sent to Gemini
✅ **Allowed**:
- HEXACO scores (anonymous personality data)
- Calculated archetype

❌ **Never Sent**:
- User names, emails, or contact info
- Location data (coordinates, addresses)
- Private profile fields
- Any PII or sensitive data

### API Key Security
- Stored in environment variables (never in code)
- Only accessible server-side (Next.js API routes)
- Not exposed to client browsers
- `.env.example` documents requirement

## Testing

### Manual Test
1. Set `GEMINI_API_KEY` in `.env.local`
2. Run test script: `npx tsx scripts/test-gemini.ts`
3. Verify output contains 3 paragraphs
4. Check for Biblical/spiritual language

### Integration Test
1. Complete onboarding with HEXACO assessment
2. Navigate to profile page
3. Verify "AI Personality Insights" card appears
4. Click "Regenerate" to test API endpoint

### Fallback Test
1. Remove or invalidate `GEMINI_API_KEY`
2. Complete onboarding
3. Verify template-based insights generated (no errors)

## Known Limitations

1. **Cold Start Latency**: First Gemini API call may take 2-5 seconds
2. **Rate Limits**: Free tier limits may affect high-traffic scenarios
3. **Insights Quality**: Depends on Gemini model quality (generally good)
4. **No Personalization**: Insights don't incorporate other profile data yet (that's Phase 2)

## Next Steps (Phase 2)

- **Profile Analysis**: Holistic analysis across all 11 spiritual resume layers
- **Privacy Filtering**: More sophisticated PUBLIC/GROUP/PRIVATE filtering
- **Caching Strategy**: 30-day expiry for profile-wide analysis
- **UI Enhancements**: Additional cards for profile-wide insights

## Files Modified/Created

### New Files (7)
1. `src/lib/services/geminiService.ts` - Core Gemini API wrapper
2. `src/lib/services/hexacoInsightsService.ts` - HEXACO insights generator
3. `src/app/api/ai/hexaco-insights/route.ts` - Regenerate insights endpoint
4. `src/components/profile/HexacoInsightsCard.tsx` - UI component
5. `scripts/test-gemini.ts` - Test script
6. `GEMINI_PHASE1_README.md` - This file
7. `.env.example` - Updated with GEMINI_API_KEY

### Modified Files (4)
1. `prisma/schema.prisma` - Added hexacoInsights fields
2. `src/app/api/onboarding/complete/route.ts` - Generate insights on onboarding
3. `src/components/ProfileClient.tsx` - Display insights card
4. `src/app/profile/page.tsx` - Fetch HEXACO fields

### Database Changes
- Added `hexacoInsights` (Text) to Person table
- Added `hexacoInsightsGeneratedAt` (DateTime) to Person table

## Troubleshooting

### "GEMINI_API_KEY not configured"
- Add key to `.env.local`
- Restart dev server after adding env vars

### "Gemini API error: 429"
- Rate limit exceeded (15 RPM)
- Wait 1 minute and retry
- Consider upgrading to paid tier for higher limits

### Insights not appearing on profile
- Check if user completed HEXACO assessment
- Verify `hexacoInsights` field populated in database
- Check browser console for errors

### Template insights instead of AI
- Verify API key is correct
- Check API key permissions (should allow Gemini API)
- Check logs for specific Gemini errors

## Support

- Gemini API Docs: https://ai.google.dev/docs
- API Key Management: https://aistudio.google.com/apikey
- Rate Limits Info: https://ai.google.dev/pricing

---

**Status**: ✅ Phase 1 Complete (HEXACO Insights)
**Next**: Phase 2 (Profile Analysis) - See `GEMINI_AI_INTEGRATION_PLAN.md`
