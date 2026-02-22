'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
  icon?: LucideIcon;
  iconColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Shared confirmation modal component
 * Provides consistent UI for confirmation dialogs across the app
 *
 * @example
 * <ConfirmationModal
 *   isOpen={showConfirm}
 *   title="Delete Item?"
 *   message="This action cannot be undone."
 *   confirmLabel="Delete"
 *   confirmVariant="danger"
 *   icon={Trash2}
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowConfirm(false)}
 * />
 */
export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  icon: Icon,
  iconColor = 'blue',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  // Variant-specific button styling
  const confirmButtonStyles = {
    primary: 'bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:from-blue-800 hover:to-blue-700',
    danger: 'bg-gradient-to-r from-red-700 to-red-600 text-white hover:from-red-800 hover:to-red-700',
    success: 'bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-800 hover:to-green-700',
  };

  const iconBgStyles = {
    blue: 'bg-blue-100',
    red: 'bg-red-100',
    green: 'bg-green-100',
    yellow: 'bg-yellow-100',
    gray: 'bg-gray-100',
  };

  const iconTextStyles = {
    blue: 'text-blue-700',
    red: 'text-red-700',
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    gray: 'text-gray-700',
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 transform transition-all">
        <div className="text-center mb-6">
          {/* Icon */}
          {Icon && (
            <div className={`w-16 h-16 ${iconBgStyles[iconColor as keyof typeof iconBgStyles] || iconBgStyles.blue} rounded-full mx-auto mb-4 flex items-center justify-center`}>
              <Icon className={`w-8 h-8 ${iconTextStyles[iconColor as keyof typeof iconTextStyles] || iconTextStyles.blue}`} strokeWidth={2} />
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>

          {/* Message */}
          <p className="text-gray-600 leading-relaxed mb-6">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full px-6 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonStyles[confirmVariant]}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
