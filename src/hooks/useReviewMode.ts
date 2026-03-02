import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Hook to handle "edit from review" mode
 * When user clicks edit on review page, they can save and return directly
 */
export function useReviewMode() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromReview = searchParams.get('from') === 'review';

  const returnToReview = () => {
    router.push('/onboarding/review');
  };

  const getBackHandler = (defaultBackHandler: () => void) => {
    return fromReview ? returnToReview : defaultBackHandler;
  };

  const getNextButtonText = (defaultText?: string) => {
    return fromReview ? 'Save' : defaultText;
  };

  return {
    fromReview,
    returnToReview,
    getBackHandler,
    getNextButtonText,
  };
}
