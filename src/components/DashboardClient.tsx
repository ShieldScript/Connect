'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { WelcomeLetterModal } from './WelcomeLetterModal';
import { ConfirmationModal } from './shared/ConfirmationModal';
import { TopBar } from './TopBar';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { DevMenu } from './DevMenu';

interface DashboardClientProps {
  personId: string;
  displayName: string;
  email: string;
  onboardingLevel: number;
  isMentor: boolean;
  archetypeName: string;
  primaryCraftName?: string;
  station?: string;
  city?: string;
  region?: string;
  connectionStyle?: string;
  latitude?: number;
  longitude?: number;
  children: React.ReactNode;
}

export function DashboardClient({
  personId,
  displayName,
  email,
  onboardingLevel,
  isMentor,
  archetypeName,
  primaryCraftName,
  station,
  city,
  region,
  connectionStyle,
  latitude,
  longitude,
  children,
}: DashboardClientProps) {
  const router = useRouter();
  const [showWelcomeLetter, setShowWelcomeLetter] = useState(false);
  const [checklistPulse, setChecklistPulse] = useState(false);
  const [showIdentityNeededPopup, setShowIdentityNeededPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [highlightJourney, setHighlightJourney] = useState(false);

  useEffect(() => {
    // Streamlined Flow: When user completes onboarding, unlock dashboard and show welcome letter
    if (onboardingLevel >= 1) {
      const welcomeLetterKey = `welcome-letter-shown-${personId}`;
      const hasSeenWelcomeLetter = localStorage.getItem(welcomeLetterKey);

      if (!hasSeenWelcomeLetter) {
        // Show Welcome Letter Modal automatically (very brief delay for smooth transition)
        setTimeout(() => {
          setShowWelcomeLetter(true);
        }, 100);
      }
    }

    // Load sidebar preference from localStorage
    const sidebarPref = localStorage.getItem('sidebar-open');
    if (sidebarPref !== null) {
      setSidebarOpen(sidebarPref === 'true');
    }
  }, [personId, onboardingLevel]);

  const handleStartJourney = () => {
    // Expand sidebar if collapsed
    if (!sidebarOpen) {
      setSidebarOpen(true);
      localStorage.setItem('sidebar-open', 'true');
    }

    // Highlight the journey widget
    setHighlightJourney(true);
    setTimeout(() => setHighlightJourney(false), 2000);

    // Navigate to onboarding page after brief delay
    setTimeout(() => {
      router.push('/onboarding');
    }, 500);
  };

  const handleGroupsClick = (e: React.MouseEvent) => {
    if (onboardingLevel === 0) {
      e.preventDefault();
      setShowIdentityNeededPopup(true);
    }
  };

  const handleDismissWelcomeLetter = () => {
    // User clicks "Enter the Fellowship"
    // Mark welcome letter as seen
    localStorage.setItem(`welcome-letter-shown-${personId}`, 'true');
    setShowWelcomeLetter(false);

    // Trigger checklist pulse animation for visual feedback
    setTimeout(() => {
      setChecklistPulse(true);
      setTimeout(() => setChecklistPulse(false), 2000);
    }, 500);
  };

  const handleToggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebar-open', String(newState));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <TopBar
        displayName={displayName}
        email={email}
        personId={personId}
        onToggleSidebar={handleToggleSidebar}
        onboardingLevel={onboardingLevel}
      />

      {/* Collapsible Sidebar */}
      <CollapsibleSidebar
        isOpen={sidebarOpen}
        onboardingLevel={onboardingLevel}
        onStartJourney={onboardingLevel === 0 ? handleStartJourney : undefined}
        onGroupsClick={handleGroupsClick}
        highlightJourney={highlightJourney}
        station={station}
        city={city}
        region={region}
        connectionStyle={connectionStyle}
        latitude={latitude}
        longitude={longitude}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 pt-14 ${
          sidebarOpen ? 'ml-72' : 'ml-16'
        }`}
      >
        {/* Wrap children in a div that can receive the pulse animation */}
        <div className={checklistPulse ? 'animate-pulse-once' : ''}>
          {children}
        </div>

        {/* Identity Needed Popup */}
        <ConfirmationModal
          isOpen={showIdentityNeededPopup}
          title="Identity Needed"
          message="Brother, we need to know your craft before we can show you your crew."
          confirmLabel="Finish Onboarding"
          cancelLabel="Not Yet"
          confirmVariant="primary"
          icon={Lock}
          iconColor="blue"
          onConfirm={() => {
            setShowIdentityNeededPopup(false);
            handleStartJourney();
          }}
          onCancel={() => setShowIdentityNeededPopup(false)}
        />

        {/* Welcome Letter Modal - Appears automatically after onboarding completion */}
        {showWelcomeLetter && onboardingLevel >= 1 && (
          <WelcomeLetterModal
            isMentor={isMentor}
            archetypeName={archetypeName}
            primaryCraftName={primaryCraftName}
            displayName={displayName}
            onDismiss={handleDismissWelcomeLetter}
          />
        )}

        {/* Dev Menu - Temporary for testing (only shows in development) */}
        <DevMenu personId={personId} currentOnboardingLevel={onboardingLevel} />
      </div>
    </div>
  );
}
