import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INTEREST_LABELS, INTEREST_CATEGORY_MAP } from '@/../../prisma/enums/interestTypes';

/**
 * GET /api/onboarding/data
 *
 * Returns all data needed for onboarding:
 * - Interest categories with activities
 * - Enum options for all 11 spiritual layers
 */
export async function GET() {
  try {
    // Fetch categories with activities
    const categories = await prisma.interestCategory.findMany({
      include: {
        activities: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Generate interest types from enum
    const interestTypes = Object.keys(INTEREST_LABELS).map((key) => ({
      value: key,
      label: INTEREST_LABELS[key],
      category: INTEREST_CATEGORY_MAP[key],
    }));

    // Enum options for all layers
    const enums = {
      interestTypes,

      giftingTypes: [
        // INTERPERSONAL
        { value: 'COMMUNICATION', label: 'Communication', category: 'INTERPERSONAL' },
        { value: 'EMPATHY', label: 'Empathy & Listening', category: 'INTERPERSONAL' },
        { value: 'HOSPITALITY', label: 'Hospitality', category: 'INTERPERSONAL' },
        { value: 'TEACHING', label: 'Teaching', category: 'INTERPERSONAL' },

        // PROBLEM SOLVING
        { value: 'STRATEGIC_PLANNING', label: 'Strategic Planning', category: 'PROBLEM_SOLVING' },
        { value: 'ANALYTICAL_THINKING', label: 'Analytical Thinking', category: 'PROBLEM_SOLVING' },
        { value: 'ORGANIZATION', label: 'Organization', category: 'PROBLEM_SOLVING' },
        { value: 'PROBLEM_SOLVING', label: 'Problem Solving', category: 'PROBLEM_SOLVING' },

        // CREATIVE & TALENT
        { value: 'ARTISTIC_ABILITY', label: 'Artistic Ability', category: 'CREATIVE_TALENT' },
        { value: 'MUSICAL_ABILITY', label: 'Musical Ability', category: 'CREATIVE_TALENT' },
        { value: 'CREATIVITY', label: 'Creativity', category: 'CREATIVE_TALENT' },
        { value: 'ATHLETICISM', label: 'Athleticism', category: 'CREATIVE_TALENT' },

        // FUNCTIONAL
        { value: 'LEADERSHIP', label: 'Leadership', category: 'FUNCTIONAL' },
        { value: 'SERVICE', label: 'Service', category: 'FUNCTIONAL' },
        { value: 'TECHNICAL_SKILLS', label: 'Technical Skills', category: 'FUNCTIONAL' },
      ],

      supernaturalGiftTypes: [
        // REVELATORY
        { value: 'WISDOM', label: 'Word of Wisdom', category: 'REVELATORY' },
        { value: 'KNOWLEDGE', label: 'Word of Knowledge', category: 'REVELATORY' },
        { value: 'DISCERNMENT', label: 'Discernment of Spirits', category: 'REVELATORY' },
        { value: 'PROPHECY', label: 'Prophecy', category: 'REVELATORY' },

        // POWER & SIGN
        { value: 'HEALING', label: 'Healing', category: 'POWER_SIGN' },
        { value: 'MIRACLES', label: 'Miracles', category: 'POWER_SIGN' },
        { value: 'FAITH', label: 'Faith', category: 'POWER_SIGN' },
        { value: 'TONGUES', label: 'Speaking in Tongues', category: 'POWER_SIGN' },
        { value: 'INTERPRETATION', label: 'Interpretation of Tongues', category: 'POWER_SIGN' },

        // EQUIPPING & SERVICE
        { value: 'APOSTLESHIP', label: 'Apostleship', category: 'EQUIPPING_SERVICE' },
        { value: 'EVANGELISM', label: 'Evangelism', category: 'EQUIPPING_SERVICE' },
        { value: 'SHEPHERDING', label: 'Shepherding/Pastor', category: 'EQUIPPING_SERVICE' },
        { value: 'TEACHING', label: 'Teaching', category: 'EQUIPPING_SERVICE' },

        // EXPRESSIVE
        { value: 'EXHORTATION', label: 'Exhortation', category: 'EXPRESSIVE' },
        { value: 'GIVING', label: 'Giving', category: 'EXPRESSIVE' },
        { value: 'LEADERSHIP', label: 'Leadership', category: 'EXPRESSIVE' },
        { value: 'MERCY', label: 'Mercy', category: 'EXPRESSIVE' },
      ],

      ministryTypes: [
        // WORD & SHEPHERDING
        { value: 'TEACHING', label: 'Teaching', category: 'WORD_SHEPHERDING' },
        { value: 'PREACHING', label: 'Preaching', category: 'WORD_SHEPHERDING' },
        { value: 'PASTORAL_CARE', label: 'Pastoral Care', category: 'WORD_SHEPHERDING' },
        { value: 'SMALL_GROUP', label: 'Small Group Leadership', category: 'WORD_SHEPHERDING' },

        // OUTREACH & COMMUNITY
        { value: 'YOUTH_MINISTRY', label: 'Youth Ministry', category: 'OUTREACH_COMMUNITY' },
        { value: 'MENS_MINISTRY', label: "Men's Ministry", category: 'OUTREACH_COMMUNITY' },
        { value: 'OUTREACH', label: 'Outreach & Evangelism', category: 'OUTREACH_COMMUNITY' },
        { value: 'MISSIONS', label: 'Missions', category: 'OUTREACH_COMMUNITY' },

        // PRESENCE & WORSHIP
        { value: 'WORSHIP_LEADING', label: 'Worship Leading', category: 'PRESENCE_WORSHIP' },
        { value: 'CREATIVE_ARTS', label: 'Creative Arts', category: 'PRESENCE_WORSHIP' },
        { value: 'PRAYER_MINISTRY', label: 'Prayer Ministry', category: 'PRESENCE_WORSHIP' },

        // SERVICE & OPERATIONS
        { value: 'ADMINISTRATION', label: 'Administration', category: 'SERVICE_OPERATIONS' },
        { value: 'HOSPITALITY', label: 'Hospitality', category: 'SERVICE_OPERATIONS' },
        { value: 'SERVICE', label: 'Service & Helps', category: 'SERVICE_OPERATIONS' },
        { value: 'TECHNICAL_AV', label: 'Technical/AV Ministry', category: 'SERVICE_OPERATIONS' },
        { value: 'COUNSELING', label: 'Counseling', category: 'SERVICE_OPERATIONS' },
      ],

      milestoneTypes: [
        // FOUNDATIONS
        { value: 'CONVERSION_BAPTISM', label: 'Conversion & Baptism', category: 'FOUNDATIONS' },
        { value: 'CALLING', label: 'Calling Discovery', category: 'FOUNDATIONS' },
        { value: 'SPIRITUAL_AWAKENING', label: 'Spiritual Awakening', category: 'FOUNDATIONS' },

        // LIFE SEASONS
        { value: 'MARRIAGE_FAMILY', label: 'Marriage/Family Milestone', category: 'LIFE_SEASONS' },
        { value: 'CAREER_SHIFT', label: 'Career Shift', category: 'LIFE_SEASONS' },
        { value: 'LIFE_TRANSITION', label: 'Major Life Transition', category: 'LIFE_SEASONS' },

        // REFINING FIRES
        { value: 'CRISIS_TRIAL', label: 'Crisis or Trial', category: 'REFINING_FIRES' },
        { value: 'LOSS_GRIEF', label: 'Loss & Grief', category: 'REFINING_FIRES' },
        { value: 'SABBATICAL', label: 'Sabbatical/Rest Season', category: 'REFINING_FIRES' },

        // BREAKTHROUGHS
        { value: 'HEALING_DELIVERANCE', label: 'Deliverance', category: 'BREAKTHROUGHS' },
        { value: 'BREAKTHROUGH', label: 'Breakthrough', category: 'BREAKTHROUGHS' },
        { value: 'RECONCILIATION', label: 'Reconciliation', category: 'BREAKTHROUGHS' },
      ],

      growthAreaTypes: [
        // RESTORATION
        { value: 'FORGIVENESS', label: 'Forgiveness', category: 'RESTORATION' },
        { value: 'RELEASING_RESENTMENT', label: 'Releasing Resentment', category: 'RESTORATION' },
        { value: 'HEALING_RELATIONSHIPS', label: 'Healing Relationships', category: 'RESTORATION' },

        // INNER PEACE
        { value: 'MINDFULNESS', label: 'Mindfulness & Presence', category: 'INNER_PEACE' },
        { value: 'INNER_STILLNESS', label: 'Inner Stillness', category: 'INNER_PEACE' },
        { value: 'LETTING_GO_ATTACHMENTS', label: 'Letting Go of Attachments', category: 'INNER_PEACE' },

        // SURRENDER
        { value: 'SELF_REFLECTION', label: 'Self-Reflection', category: 'SURRENDER' },
        { value: 'SURRENDERING_CONTROL', label: 'Surrendering Control', category: 'SURRENDER' },
        { value: 'TRUSTING_GUIDANCE', label: 'Trusting Divine Guidance', category: 'SURRENDER' },
      ],

      leadershipStyles: [
        // RELATIONAL
        { value: 'MENTORING', label: 'Mentoring', category: 'RELATIONAL' },
        { value: 'ENCOURAGING', label: 'Encouraging', category: 'RELATIONAL' },
        { value: 'MEDIATING', label: 'Mediating', category: 'RELATIONAL' },
        { value: 'SHEPHERDING', label: 'Shepherding', category: 'RELATIONAL' },

        // STRATEGIC
        { value: 'VISION_CASTING', label: 'Vision-casting', category: 'STRATEGIC' },
        { value: 'PROBLEM_SOLVING', label: 'Problem-solving', category: 'STRATEGIC' },
        { value: 'PLANNING', label: 'Planning', category: 'STRATEGIC' },
        { value: 'DISCERNMENT', label: 'Discernment', category: 'STRATEGIC' },

        // OPERATIONAL
        { value: 'ORGANIZING', label: 'Organizing', category: 'OPERATIONAL' },
        { value: 'EXECUTING', label: 'Executing', category: 'OPERATIONAL' },
        { value: 'MANAGING', label: 'Managing', category: 'OPERATIONAL' },
        { value: 'ADMINISTRATION', label: 'Administration', category: 'OPERATIONAL' },

        // SPIRITUAL
        { value: 'INTERCEDING', label: 'Interceding', category: 'SPIRITUAL' },
        { value: 'PROPHETIC_EDGE', label: 'Prophetic Edge', category: 'SPIRITUAL' },
        { value: 'TEACHING', label: 'Teaching', category: 'SPIRITUAL' },
        { value: 'FAITH_BUILDING', label: 'Faith-Building', category: 'SPIRITUAL' },
      ],

      lifeStageTypes: [
        // EARLY HORIZONS
        { value: 'SINGLE_YOUNG_ADULT', label: 'Single Young Adult', category: 'EARLY_HORIZONS' },
        { value: 'NEWLY_MARRIED', label: 'Newly Married', category: 'EARLY_HORIZONS' },

        // FAMILY SEASONS
        { value: 'PARENTING_YOUNG', label: 'Parenting Young Children', category: 'FAMILY_SEASONS' },
        { value: 'PARENTING_TEENS', label: 'Parenting Teenagers', category: 'FAMILY_SEASONS' },
        { value: 'EMPTY_NEST', label: 'Empty Nest', category: 'FAMILY_SEASONS' },
        { value: 'GRANDPARENTING', label: 'Grandparenting', category: 'FAMILY_SEASONS' },

        // SHIFTING GEARS
        { value: 'CAREER_CHANGE', label: 'Career Change', category: 'SHIFTING_GEARS' },
        { value: 'MIDLIFE_TRANSITION', label: 'Midlife Transition', category: 'SHIFTING_GEARS' },
        { value: 'RETIREMENT', label: 'Retirement', category: 'SHIFTING_GEARS' },

        // NAVIGATING CHANGE
        { value: 'HEALTH_TRANSITION', label: 'Health Transition', category: 'NAVIGATING_CHANGE' },
        { value: 'GRIEF_LOSS', label: 'Grief & Loss', category: 'NAVIGATING_CHANGE' },
      ],

      callingTypes: [
        // PERSONAL GROWTH
        { value: 'DIVINE_PURPOSE', label: 'Divine Purpose', category: 'PERSONAL_GROWTH' },
        { value: 'INNER_GUIDANCE', label: 'Inner Guidance', category: 'PERSONAL_GROWTH' },
        { value: 'LIFE_PATH_CLARITY', label: 'Life Path Clarity', category: 'PERSONAL_GROWTH' },
        { value: 'SPIRITUAL_EXPLORATION', label: 'Spiritual Exploration', category: 'PERSONAL_GROWTH' },

        // EQUIPPING
        { value: 'LEADERSHIP', label: 'Leadership', category: 'EQUIPPING' },
        { value: 'TEACHING_MENTORSHIP', label: 'Teaching & Mentorship', category: 'EQUIPPING' },
        { value: 'CREATIVE_EXPRESSION', label: 'Creative Expression', category: 'EQUIPPING' },

        // RESTORATIVE
        { value: 'HEALING_RESTORATION', label: 'Healing & Restoration', category: 'RESTORATIVE' },
        { value: 'JUSTICE_ADVOCACY', label: 'Justice & Advocacy', category: 'RESTORATIVE' },
        { value: 'SERVICE_ORIENTED', label: 'Service-Oriented Calling', category: 'RESTORATIVE' },
      ],

      healingThemeTypes: [
        // THE INWARD PATH
        { value: 'INNER_HEALING', label: 'Inner Healing', category: 'INWARD_PATH' },
        { value: 'SELF_COMPASSION', label: 'Self-Compassion', category: 'INWARD_PATH' },
        { value: 'ACCEPTANCE', label: 'Acceptance', category: 'INWARD_PATH' },
        { value: 'COMPASSIONATE_REFLECTION', label: 'Compassionate Reflection', category: 'INWARD_PATH' },

        // THE RELATIONAL PATH
        { value: 'RELEASING_RESENTMENT', label: 'Releasing Resentment', category: 'RELATIONAL_PATH' },
        { value: 'HEALING_RELATIONSHIPS', label: 'Healing Relationships', category: 'RELATIONAL_PATH' },
        { value: 'FORGIVENESS', label: 'Forgiveness Journey', category: 'RELATIONAL_PATH' },

        // THE RECOVERY PATH
        { value: 'TRAUMA_RECOVERY', label: 'Trauma Recovery', category: 'RECOVERY_PATH' },
        { value: 'LETTING_GO_ATTACHMENTS', label: 'Letting Go of Attachments', category: 'RECOVERY_PATH' },
        { value: 'EMOTIONAL_RESTORATION', label: 'Emotional Restoration', category: 'RECOVERY_PATH' },
      ],

      practiceTypes: [
        // PERSONAL DEVOTION
        { value: 'BIBLE_STUDY', label: 'Bible Study', category: 'PERSONAL_DEVOTION' },
        { value: 'JOURNALING', label: 'Journaling', category: 'PERSONAL_DEVOTION' },
        { value: 'MEDITATION', label: 'Meditation', category: 'PERSONAL_DEVOTION' },
        { value: 'GRATITUDE', label: 'Gratitude Practice', category: 'PERSONAL_DEVOTION' },

        // COMMUNION
        { value: 'PRAYER', label: 'Prayer', category: 'COMMUNION' },
        { value: 'WORSHIP', label: 'Worship', category: 'COMMUNION' },
        { value: 'SABBATH_REST', label: 'Sabbath Rest', category: 'COMMUNION' },
        { value: 'FASTING', label: 'Fasting', category: 'COMMUNION' },

        // OUTWARD EXPRESSION
        { value: 'SERVICE', label: 'Service', category: 'OUTWARD_EXPRESSION' },
        { value: 'COMMUNITY_GATHERING', label: 'Community Gathering', category: 'OUTWARD_EXPRESSION' },
        { value: 'ACTS_OF_KINDNESS', label: 'Acts of Kindness', category: 'OUTWARD_EXPRESSION' },
        { value: 'NATURE_IMMERSION', label: 'Nature Immersion', category: 'OUTWARD_EXPRESSION' },
      ],

      boundaryTypes: [
        // WEEKLY WINDOWS
        { value: 'WEEKDAY', label: 'Weekday', category: 'WEEKLY_WINDOWS' },
        { value: 'WEEKEND', label: 'Weekend', category: 'WEEKLY_WINDOWS' },
        { value: 'EVENING', label: 'Evening', category: 'WEEKLY_WINDOWS' },
        { value: 'EARLY_MORNING', label: 'Early Morning', category: 'WEEKLY_WINDOWS' },

        // CURRENT LOAD
        { value: 'FAMILY_COMMITMENTS', label: 'Family Commitments', category: 'CURRENT_LOAD' },
        { value: 'WORK_COMMITMENTS', label: 'Work Commitments', category: 'CURRENT_LOAD' },
        { value: 'MINISTRY_COMMITMENTS', label: 'Ministry Commitments', category: 'CURRENT_LOAD' },
        { value: 'SABBATICAL', label: 'On Sabbatical', category: 'CURRENT_LOAD' },

        // SOCIAL STYLE
        { value: 'OPEN_SPONTANEOUS', label: 'Spontaneous Gatherings', category: 'SOCIAL_STYLE' },
        { value: 'PREFERS_SCHEDULED', label: 'Scheduled Events', category: 'SOCIAL_STYLE' },
        { value: 'TRAVEL_FLEXIBLE', label: 'Travel Flexible', category: 'SOCIAL_STYLE' },
        { value: 'HEALTH_LIMITATIONS', label: 'Health Limitations', category: 'SOCIAL_STYLE' },
      ],
    };

    return NextResponse.json({
      success: true,
      data: {
        categories,
        enums,
      },
    });
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch onboarding data',
      },
      { status: 500 }
    );
  }
}
