'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PrayerPostCard } from './PrayerPostCard';
import { Loader2, HandHeart } from 'lucide-react';

interface Prayer {
  id: string;
  content: string;
  prayerCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    displayName: string;
  };
  userPrayed: boolean;
}

interface PrayerWallFeedProps {
  currentUserId?: string;
  onNewPrayer?: (prayer: Prayer) => void;
  filterMode?: 'all' | 'prayed' | 'mine';
}

export function PrayerWallFeed({ currentUserId, onNewPrayer, filterMode = 'all' }: PrayerWallFeedProps) {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch initial prayers
  useEffect(() => {
    fetchPrayers();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('prayer-wall')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'PrayerPost',
        },
        (payload) => {
          console.log('New prayer received:', payload);
          fetchNewPrayer(payload.new.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'PrayerPost',
        },
        (payload) => {
          console.log('Prayer updated:', payload);
          // Update prayer in list if it exists
          setPrayers((prev) =>
            prev.map((p) =>
              p.id === payload.new.id
                ? { ...p, prayerCount: (payload.new as any).prayerCount }
                : p
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'PrayerPost',
        },
        (payload) => {
          console.log('Prayer deleted:', payload);
          // Remove prayer from list
          setPrayers((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPrayers = async () => {
    try {
      const response = await fetch('/api/prayers');
      if (!response.ok) {
        throw new Error('Failed to fetch prayers');
      }

      const data = await response.json();
      setPrayers(data.prayers || []);
    } catch (err: any) {
      console.error('Failed to fetch prayers:', err);
      setError(err.message || 'Failed to load prayers');
    } finally {
      setLoading(false);
    }
  };

  const fetchNewPrayer = async (prayerId: string) => {
    try {
      const response = await fetch(`/api/prayers/${prayerId}`);
      if (!response.ok) return;

      const data = await response.json();
      if (data.prayer) {
        setPrayers((prev) => {
          // Avoid duplicates
          if (prev.some((p) => p.id === data.prayer.id)) return prev;
          // Add to top of feed
          const newPrayer = {
            ...data.prayer,
            createdAt: data.prayer.createdAt,
          };
          onNewPrayer?.(newPrayer);
          return [newPrayer, ...prev];
        });
      }
    } catch (err) {
      console.error('Failed to fetch new prayer:', err);
    }
  };

  const handlePrayed = (prayerId: string, newCount: number) => {
    // Update prayer count in list
    setPrayers((prev) =>
      prev.map((p) => (p.id === prayerId ? { ...p, prayerCount: newCount } : p))
    );
  };

  const handleUpdated = (prayerId: string, newContent: string) => {
    // Update prayer content in list
    setPrayers((prev) =>
      prev.map((p) => (p.id === prayerId ? { ...p, content: newContent } : p))
    );
  };

  const handleDeleted = (prayerId: string) => {
    // Remove prayer from list
    setPrayers((prev) => prev.filter((p) => p.id !== prayerId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
        <p className="text-red-800 font-medium">{error}</p>
      </div>
    );
  }

  // Filter prayers based on selected tab
  const filteredPrayers = prayers.filter((prayer) => {
    if (filterMode === 'prayed') {
      return prayer.userPrayed;
    }
    if (filterMode === 'mine') {
      return prayer.author.id === currentUserId;
    }
    // 'all' - show only new requests (prayers user hasn't prayed for yet, excluding own prayers)
    return !prayer.userPrayed && prayer.author.id !== currentUserId;
  });

  if (filteredPrayers.length === 0) {
    const emptyMessages = {
      all: {
        title: 'No new prayer requests',
        message: "You've prayed for all current requests. Check back later for more!",
      },
      prayed: {
        title: 'No prayers yet',
        message: "You haven't prayed for any requests yet",
      },
      mine: {
        title: 'No prayer requests',
        message: "You haven't posted any prayer requests yet",
      },
    };

    const { title, message } = emptyMessages[filterMode];

    return (
      <div className="col-span-full p-12 text-center bg-blue-50/50 rounded-lg border-2 border-blue-200">
        <HandHeart className="w-12 h-12 text-blue-400 mx-auto mb-3" />
        <p className="text-gray-700 text-lg font-semibold mb-1">{title}</p>
        <p className="text-gray-600">{message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredPrayers.map((prayer) => (
        <PrayerPostCard
          key={prayer.id}
          prayer={prayer}
          currentUserId={currentUserId}
          onPrayed={handlePrayed}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}
