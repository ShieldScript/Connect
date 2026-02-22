'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HandHeart, ArrowRight, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Prayer {
  id: string;
  content: string;
  prayerCount: number;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
  };
}

export function PrayerWallPreview() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentPrayers();
  }, []);

  const fetchRecentPrayers = async () => {
    try {
      const response = await fetch('/api/prayers');
      if (!response.ok) throw new Error('Failed to fetch prayers');

      const data = await response.json();
      // Get first 3 prayers
      setPrayers((data.prayers || []).slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch prayers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (loading || prayers.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HandHeart className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
            Prayer Wall
          </h2>
        </div>
        <Link
          href="/prayers"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View All Prayers
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {prayers.map((prayer) => (
          <Link
            key={prayer.id}
            href="/prayers"
            className="bg-white border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition flex-shrink-0 w-80"
          >
            {/* Author */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-slate-600">
                  {getInitials(prayer.author.displayName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {prayer.author.displayName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(prayer.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {/* Prayer Content */}
            <p className="text-sm text-gray-700 mb-3 line-clamp-3">
              {truncateText(prayer.content, 120)}
            </p>

            {/* Prayer Count */}
            <div className="flex items-center gap-1.5 text-sm text-blue-600 font-medium">
              <Heart className="w-4 h-4" />
              <span>
                {prayer.prayerCount}{' '}
                {prayer.prayerCount === 1 ? 'brother' : 'brothers'} prayed
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
