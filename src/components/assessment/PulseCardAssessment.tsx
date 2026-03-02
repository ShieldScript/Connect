'use client';

import { useState } from 'react';
import { HexacoQuestion } from '@/data/hexacoQuestions';
import HexacoQuestionCard from './HexacoQuestionCard';
import HexacoCompletionCard from './HexacoCompletionCard';

interface PulseCardAssessmentProps {
  questions: HexacoQuestion[];
  responses: Map<number, number>;
  currentQuestionIndex: number;
  onAnswer: (questionId: number, score: 1 | 2 | 3 | 4 | 5) => void;
  onQuestionChange: (index: number) => void;
  onComplete: () => void;
}

export default function PulseCardAssessment({
  questions,
  responses,
  currentQuestionIndex,
  onAnswer,
  onQuestionChange,
  onComplete,
}: PulseCardAssessmentProps) {
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  // Check if all questions are answered
  const allQuestionsAnswered = responses.size === questions.length;

  // Show completion card if all questions answered and we're at the last question
  const [showCompletion, setShowCompletion] = useState(allQuestionsAnswered && currentQuestionIndex === questions.length - 1);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = responses.get(currentQuestion.id);
  const canGoBack = currentQuestionIndex > 0;

  // Can go forward if:
  // 1. There's a response for the current question AND we're not at the last question
  // 2. OR we're at the last question and all questions are answered (to show completion)
  const canGoForward = (currentAnswer !== undefined && currentQuestionIndex < questions.length - 1) ||
    (currentQuestionIndex === questions.length - 1 && allQuestionsAnswered);

  const handleAnswer = (score: 1 | 2 | 3 | 4 | 5) => {
    // Save response
    onAnswer(currentQuestion.id, score);

    // Check if this is the last question
    if (currentQuestionIndex === questions.length - 1) {
      // Show completion card
      setShowCompletion(true);
      return;
    }

    // Move to next question
    setDirection('forward');
    setTimeout(() => {
      onQuestionChange(currentQuestionIndex + 1);
    }, 150);
  };

  const handleBack = () => {
    if (!canGoBack) return;

    setDirection('back');
    setTimeout(() => {
      onQuestionChange(currentQuestionIndex - 1);
    }, 150);
  };

  const handleForward = () => {
    // If we're at the last question and all are answered, show completion card
    if (currentQuestionIndex === questions.length - 1 && allQuestionsAnswered) {
      setShowCompletion(true);
      return;
    }

    if (!canGoForward) return;

    setDirection('forward');
    setTimeout(() => {
      onQuestionChange(currentQuestionIndex + 1);
    }, 150);
  };

  const handleBackFromCompletion = () => {
    setShowCompletion(false);
    setDirection('back');
    // No need to navigate - we're already on the last question (59)
    // Just hide the completion card to show question 60 again
  };

  // Show completion card after last question
  if (showCompletion) {
    return (
      <div className="w-full">
        <HexacoCompletionCard
          onComplete={onComplete}
          onBack={handleBackFromCompletion}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <HexacoQuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        currentAnswer={currentAnswer}
        onAnswer={handleAnswer}
        onBack={handleBack}
        onForward={handleForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        direction={direction}
      />
    </div>
  );
}
