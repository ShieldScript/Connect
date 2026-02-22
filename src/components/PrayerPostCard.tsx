'use client';

import { useState } from 'react';
import { Heart, Loader2, Trash2, Pencil, X, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PrayerPostCardProps {
  prayer: {
    id: string;
    content: string;
    prayerCount: number;
    createdAt: string | Date;
    author: {
      id: string;
      displayName: string;
    };
    userPrayed: boolean;
  };
  currentUserId?: string;
  onPrayed?: (prayerId: string, newCount: number) => void;
  onDeleted?: (prayerId: string) => void;
  onUpdated?: (prayerId: string, newContent: string) => void;
}

export function PrayerPostCard({
  prayer,
  currentUserId,
  onPrayed,
  onDeleted,
  onUpdated,
}: PrayerPostCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userPrayed, setUserPrayed] = useState(prayer.userPrayed);
  const [prayerCount, setPrayerCount] = useState(prayer.prayerCount);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(prayer.content);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState(prayer.content);

  const isOwnPrayer = currentUserId && prayer.author.id === currentUserId;
  const maxLength = 500;

  const handlePray = async () => {
    if (userPrayed || isLoading) return;

    setIsLoading(true);
    // Optimistic update
    setUserPrayed(true);
    setPrayerCount((prev) => prev + 1);

    try {
      const response = await fetch(`/api/prayers/${prayer.id}/pray`, {
        method: 'POST',
      });

      if (!response.ok) {
        // Rollback on error
        setUserPrayed(false);
        setPrayerCount((prev) => prev - 1);

        const error = await response.json();
        console.error('Failed to pray:', error);
      } else {
        const data = await response.json();
        // Update with server response
        setPrayerCount(data.prayer.prayerCount);
        onPrayed?.(prayer.id, data.prayer.prayerCount);
      }
    } catch (error) {
      // Rollback on error
      setUserPrayed(false);
      setPrayerCount((prev) => prev - 1);
      console.error('Error praying:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setEditContent(content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!isOwnPrayer || isSaving || editContent.trim().length === 0) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/prayers/${prayer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.prayer.content);
        setIsEditing(false);
        onUpdated?.(prayer.id, data.prayer.content);
      } else {
        const error = await response.json();
        console.error('Failed to update:', error);
        alert(error.error || 'Failed to update prayer');
      }
    } catch (error) {
      console.error('Error updating:', error);
      alert('Failed to update prayer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwnPrayer || isDeleting) return;

    if (!confirm('Are you sure you want to delete this prayer?')) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/prayers/${prayer.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDeleted?.(prayer.id);
      } else {
        const error = await response.json();
        console.error('Failed to delete:', error);
        alert('Failed to delete prayer');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete prayer');
    } finally {
      setIsDeleting(false);
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

  const getRelativeTime = (date: string | Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="rounded-lg border-2 border-blue-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md flex flex-col h-full">
      {/* Header - Author Info */}
      <div className="flex items-start gap-2 mb-3">
        {/* Author Avatar */}
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-blue-700">
            {getInitials(prayer.author.displayName)}
          </span>
        </div>

        {/* Author Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 truncate">
            {prayer.author.displayName}
          </div>
          <div className="text-xs text-gray-500">
            {getRelativeTime(prayer.createdAt)}
          </div>
        </div>

        {/* Edit and Delete Buttons for Own Prayers */}
        {isOwnPrayer && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleEdit}
              disabled={isEditing}
              className="p-1 hover:bg-blue-50 rounded transition disabled:opacity-50"
              title="Edit prayer"
            >
              <Pencil className="w-3.5 h-3.5 text-blue-600" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 hover:bg-red-50 rounded transition disabled:opacity-50"
              title="Delete prayer"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 text-red-600 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Prayer Content or Edit Form */}
      {isEditing ? (
        <div className="mb-3 flex-1">
          <div className="relative">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-blue-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 transition text-gray-800"
              rows={4}
              maxLength={maxLength}
              disabled={isSaving}
            />
            {/* Character Counter */}
            <div
              className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded ${
                editContent.length > maxLength * 0.9
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {editContent.length}/{maxLength}
            </div>
          </div>
          {/* Edit Actions */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleSaveEdit}
              disabled={isSaving || editContent.trim().length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300 disabled:opacity-50 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-700 mb-3 leading-relaxed whitespace-pre-wrap break-words line-clamp-4 flex-1">
          {content}
        </p>
      )}

      {/* Footer */}
      <div className="space-y-2">
        {/* Prayer Count Badge */}
        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
          <Heart className="w-3.5 h-3.5" />
          <span>
            {prayerCount} {prayerCount === 1 ? 'prayer' : 'prayers'}
          </span>
        </div>

        {/* I Prayed Button */}
        {!isOwnPrayer && (
          <button
            onClick={handlePray}
            disabled={userPrayed || isLoading}
            className={`w-full px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 ${
              userPrayed
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 cursor-default'
                : 'border-2 border-blue-600 text-blue-700 hover:bg-blue-50 active:bg-blue-100'
            } disabled:opacity-70`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Praying...</span>
              </>
            ) : userPrayed ? (
              <>
                <Heart className="w-3.5 h-3.5" fill="currentColor" />
                <span>You prayed</span>
              </>
            ) : (
              <>
                <Heart className="w-3.5 h-3.5" />
                <span>I Prayed</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
