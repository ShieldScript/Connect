'use client';

import { useState } from 'react';
import { Send, Loader2, HandHeart } from 'lucide-react';

interface CreatePrayerFormProps {
  onPrayerCreated?: (prayer: any) => void;
}

export function CreatePrayerForm({ onPrayerCreated }: CreatePrayerFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxLength = 500;
  const currentLength = content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create prayer');
      }

      const data = await response.json();

      // Clear form
      setContent('');

      // Notify parent (closes the form)
      if (onPrayerCreated) {
        onPrayerCreated(data.prayer);
      }
    } catch (err: any) {
      console.error('Failed to create prayer:', err);
      setError(err.message || 'Failed to create prayer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = content.trim().length > 0 && content.length <= maxLength;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share what you'd like the brotherhood to pray for..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 transition text-gray-800"
              rows={4}
              maxLength={maxLength}
              disabled={isSubmitting}
              autoFocus
            />
            {/* Character Counter - Top Right */}
            <div
              className={`absolute top-2 right-3 text-xs font-medium px-2 py-1 rounded ${
                currentLength > maxLength * 0.9
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {currentLength}/{maxLength}
            </div>
          </div>

          <div className="flex items-center justify-end mt-3">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post Prayer
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
