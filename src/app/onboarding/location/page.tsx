'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStep } from '@/components/onboarding';
import { MapPin, Loader2, Check, Lock } from 'lucide-react';
import { useReviewMode } from '@/hooks/useReviewMode';

export default function LocationPage() {
  const router = useRouter();
  const { fromReview, returnToReview, getBackHandler, getNextButtonText } = useReviewMode();
  const {
    displayName,
    community: storedCommunity,
    city: storedCity,
    region: storedRegion,
    latitude: storedLatitude,
    longitude: storedLongitude,
    setLocation,
    setCurrentStep,
    markStepComplete,
  } = useOnboardingStore();

  const [community, setCommunity] = useState(storedCommunity);
  const [city, setCity] = useState(storedCity);
  const [region, setRegion] = useState(storedRegion);
  const [latitude, setLatitude] = useState(storedLatitude);
  const [longitude, setLongitude] = useState(storedLongitude);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleGeocode = async () => {
    if (!city || !region) return;

    setIsGeocoding(true);

    try {
      // Use Nominatim (OpenStreetMap) for free geocoding
      const query = `${city}, ${region}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setLatitude(lat);
        setLongitude(lon);
      } else {
        alert('Location not found. Please check your city and region.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Failed to geocode location. You can skip coordinates for now.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleNext = () => {
    setLocation({
      community,
      city,
      region,
      latitude,
      longitude,
    });

    if (fromReview) {
      returnToReview();
    } else {
      setCurrentStep(4);
      markStepComplete(3);
      router.push('/onboarding/interests');
    }
  };

  const handleBack = () => {
    setCurrentStep(2);
    router.push('/onboarding/identity');
  };

  const isValid = community.trim().length > 0 && city.trim().length > 0 && region.trim().length > 0;

  return (
    <OnboardingStep
      stepNumber={3}
      totalSteps={17}
      title="Where are you located?"
      description="Help us connect you with brothers in your area. Your exact location is never shared—we use this for proximity matching."
      quote="For where two or three gather in my name, there am I with them. — Matthew 18:20"
      onNext={handleNext}
      onBack={getBackHandler(handleBack)}
      nextButtonDisabled={!isValid}
      nextButtonText={getNextButtonText()}
      displayName={displayName}
    >
      <div className="space-y-6">
        {/* Community/Neighborhood */}
        <div>
          <label
            htmlFor="community"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Community or Neighborhood <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="community"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              placeholder="e.g., Downtown, North Side, Mission District, or nearby landmark"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
              required
            />
            {community.trim().length > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Check className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Required for accurate proximity matching within your city while keeping your exact address private
          </p>
        </div>

        {/* City */}
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            City <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Calgary, Phoenix, Austin"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
              required
            />
            {city.trim().length > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Check className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
              </div>
            )}
          </div>
        </div>

        {/* Region/State */}
        <div>
          <label
            htmlFor="region"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            State/Province/Region <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g., Alberta, Arizona, Texas"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
              required
            />
            {region.trim().length > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Check className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
              </div>
            )}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-5 bg-purple-50 rounded-xl border-l-4 border-l-purple-500 border border-purple-200">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-purple-600 stroke-[2.5px] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-purple-900 mb-1">
                Your Privacy Protected
              </p>
              <p className="text-xs text-purple-800 leading-relaxed">
                Your exact location is never shared with other members. We use approximate distance (within 5-10 km radius) to suggest nearby connections while keeping your specific address completely private.
              </p>
            </div>
          </div>
        </div>
      </div>
    </OnboardingStep>
  );
}
