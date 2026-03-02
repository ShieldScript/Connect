import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Onboarding | Brotherhood Connect',
  description: 'Join the Brotherhood Connect community',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
