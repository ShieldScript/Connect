export interface HexacoQuestion {
  id: number;
  batch: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  dimension: 'H' | 'E' | 'X' | 'A' | 'C' | 'O';
  reverse: boolean;
}

export const HEXACO_QUESTIONS: HexacoQuestion[] = [
  // Batch 1: Integrity & Resilience (H + E Mix)
  { id: 1, batch: 1, text: "I wouldn't use flattery to get a raise or promotion, even if it worked.", dimension: 'H', reverse: false },
  { id: 2, batch: 1, text: "I would feel afraid if I had to travel in bad weather conditions.", dimension: 'E', reverse: false },
  { id: 3, batch: 1, text: "If I knew I could never be caught, I would steal a million dollars.", dimension: 'H', reverse: true },
  { id: 4, batch: 1, text: "I would feel nervous approaching a group of people I don't know.", dimension: 'E', reverse: false },
  { id: 5, batch: 1, text: "I wouldn't pretend to like someone just to get that person to do favors for me.", dimension: 'H', reverse: false },
  { id: 6, batch: 1, text: "I rarely express my opinions in group meetings.", dimension: 'X', reverse: true },
  { id: 7, batch: 1, text: "I would be quite bored by a visit to an art gallery.", dimension: 'O', reverse: true },
  { id: 8, batch: 1, text: "I plan ahead and organize things, to avoid scrambling at the last minute.", dimension: 'C', reverse: false },
  { id: 9, batch: 1, text: "I rarely hold a grudge, even against people who have badly wronged me.", dimension: 'A', reverse: false },
  { id: 10, batch: 1, text: "I feel reasonably satisfied with myself overall.", dimension: 'E', reverse: true },

  // Batch 2: Social Dynamics (X + A Mix)
  { id: 11, batch: 2, text: "I feel that I am an unpopular person.", dimension: 'E', reverse: false },
  { id: 12, batch: 2, text: "When I suffer from a painful experience, I need someone to make me feel comfortable.", dimension: 'E', reverse: false },
  { id: 13, batch: 2, text: "People have often told me that I have a good imagination.", dimension: 'O', reverse: false },
  { id: 14, batch: 2, text: "I make decisions based on the feeling of the moment rather than careful thought.", dimension: 'C', reverse: true },
  { id: 15, batch: 2, text: "People sometimes tell me that I am too critical of others.", dimension: 'A', reverse: true },
  { id: 16, batch: 2, text: "The first thing I always do in a new place is make friends.", dimension: 'X', reverse: false },
  { id: 17, batch: 2, text: "I prefer jobs that involve active social interaction to those that involve working alone.", dimension: 'X', reverse: false },
  { id: 18, batch: 2, text: "When people tell me that I'm wrong, my first reaction is to argue with them.", dimension: 'A', reverse: true },
  { id: 19, batch: 2, text: "I avoid making small talk with people.", dimension: 'X', reverse: true },
  { id: 20, batch: 2, text: "Most people tend to get angry more quickly than I do.", dimension: 'A', reverse: false },

  // Batch 3: Order & Innovation (C + O Mix)
  { id: 21, batch: 3, text: "I worry a lot less than most people do.", dimension: 'E', reverse: true },
  { id: 22, batch: 3, text: "I would enjoy creating a work of art, such as a novel, a song, or a painting.", dimension: 'O', reverse: false },
  { id: 23, batch: 3, text: "People often joke with me about the messiness of my room or desk.", dimension: 'C', reverse: true },
  { id: 24, batch: 3, text: "I am interested in learning about the history and politics of other countries.", dimension: 'O', reverse: false },
  { id: 25, batch: 3, text: "I often check my work repeatedly to find possible errors.", dimension: 'C', reverse: false },
  { id: 26, batch: 3, text: "People sometimes call me stuck-up or snobbish.", dimension: 'H', reverse: true },
  { id: 27, batch: 3, text: "I think science is boring.", dimension: 'O', reverse: true },
  { id: 28, batch: 3, text: "I clean my office or home quite frequently.", dimension: 'C', reverse: false },
  { id: 29, batch: 3, text: "If someone has cheated me once, I won't give them a chance to do it again.", dimension: 'A', reverse: true },
  { id: 30, batch: 3, text: "I am usually quite flexible in my opinions when people disagree with me.", dimension: 'A', reverse: false },

  // Batch 4: Emotional Depth (E + H Mix)
  { id: 31, batch: 4, text: "I sometimes can't help worrying about little things.", dimension: 'E', reverse: false },
  { id: 32, batch: 4, text: "If I want something from someone, I will laugh at that person's worst jokes.", dimension: 'H', reverse: true },
  { id: 33, batch: 4, text: "I would never accept a bribe, even if it were very large.", dimension: 'H', reverse: false },
  { id: 34, batch: 4, text: "I find it hard to keep my temper when people insult me.", dimension: 'A', reverse: true },
  { id: 35, batch: 4, text: "When making decisions, I usually rely on my intuition rather than on careful analysis.", dimension: 'C', reverse: true },
  { id: 36, batch: 4, text: "I remain unemotional even in situations where most people get very sentimental.", dimension: 'E', reverse: true },
  { id: 37, batch: 4, text: "I would like a job that requires following a routine rather than being creative.", dimension: 'O', reverse: true },
  { id: 38, batch: 4, text: "I tend to be lenient in judging other people.", dimension: 'A', reverse: false },
  { id: 39, batch: 4, text: "When working, I sometimes have difficulties due to being disorganized.", dimension: 'C', reverse: true },
  { id: 40, batch: 4, text: "I have sympathy for people who are less fortunate than I am.", dimension: 'E', reverse: false },

  // Batch 5: Exploration & Boldness (O + X Mix)
  { id: 41, batch: 5, text: "I try to give generously to those in need.", dimension: 'H', reverse: false },
  { id: 42, batch: 5, text: "I think that paying attention to radical ideas is a waste of time.", dimension: 'O', reverse: true },
  { id: 43, batch: 5, text: "I make a lot of mistakes because I don't think before I act.", dimension: 'C', reverse: true },
  { id: 44, batch: 5, text: "I rarely, if ever, have trouble sleeping due to stress or worry.", dimension: 'E', reverse: true },
  { id: 45, batch: 5, text: "In social situations, I'm usually the one who makes the first move.", dimension: 'X', reverse: false },
  { id: 46, batch: 5, text: "People think of me as someone who has a quick temper.", dimension: 'A', reverse: true },
  { id: 47, batch: 5, text: "I am energized when I'm in a large group of people.", dimension: 'X', reverse: false },
  { id: 48, batch: 5, text: "I am fascinated by learning about new ideas and perspectives.", dimension: 'O', reverse: false },
  { id: 49, batch: 5, text: "I can handle difficult situations without needing emotional support from anyone else.", dimension: 'E', reverse: true },
  { id: 50, batch: 5, text: "I have never really enjoyed looking through an encyclopedia.", dimension: 'O', reverse: true },

  // Batch 6: Reliability & Fairness (C + H Mix)
  { id: 51, batch: 6, text: "Even when I'm treated badly, I remain calm and forgiving.", dimension: 'A', reverse: false },
  { id: 52, batch: 6, text: "If I had the opportunity, I would gladly exploit someone.", dimension: 'H', reverse: true },
  { id: 53, batch: 6, text: "I always finish tasks on time, even if it requires working late.", dimension: 'C', reverse: false },
  { id: 54, batch: 6, text: "I could easily manipulate people if I wanted to.", dimension: 'H', reverse: true },
  { id: 55, batch: 6, text: "I prefer to do whatever comes naturally rather than following rules and regulations.", dimension: 'C', reverse: true },
  { id: 56, batch: 6, text: "When someone has hurt me, I want to get back at them.", dimension: 'A', reverse: true },
  { id: 57, batch: 6, text: "I would get a lot of pleasure from owning expensive luxury goods.", dimension: 'H', reverse: true },
  { id: 58, batch: 6, text: "I tend to bounce back quickly after experiencing a setback or disappointment.", dimension: 'E', reverse: true },
  { id: 59, batch: 6, text: "I often push myself very hard when trying to achieve a goal.", dimension: 'C', reverse: false },
  { id: 60, batch: 6, text: "I want people to know that I am an important person of high status.", dimension: 'H', reverse: true },
];

export const BATCH_THEMES = {
  1: { title: "Integrity & Resilience", subtitle: "How you respond to moral choices and stress" },
  2: { title: "Social Dynamics", subtitle: "Your natural approach to relationships" },
  3: { title: "Order & Innovation", subtitle: "How you balance structure and creativity" },
  4: { title: "Emotional Depth", subtitle: "Your capacity for empathy and connection" },
  5: { title: "Exploration & Boldness", subtitle: "Curiosity and social energy" },
  6: { title: "Reliability & Fairness", subtitle: "Long-term consistency and integrity" },
};

export const DIMENSION_LABELS = {
  H: 'Honesty-Humility',
  E: 'Emotionality',
  X: 'Extraversion',
  A: 'Agreeableness',
  C: 'Conscientiousness',
  O: 'Openness to Experience',
};

export const RESPONSE_LABELS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];
