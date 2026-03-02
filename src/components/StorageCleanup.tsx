'use client';

import { useEffect } from 'react';
import { cleanupOnboardingStorage } from '@/lib/cleanup-localStorage';

/**
 * Auto-cleanup component for localStorage
 * Runs once on mount to migrate old customLabel data
 */
export function StorageCleanup() {
  useEffect(() => {
    cleanupOnboardingStorage();
  }, []);

  return null;
}
