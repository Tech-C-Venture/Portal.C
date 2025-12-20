'use client';

import { useEffect, useState } from 'react';

type CopyButtonProps = {
  value?: string | null;
  label?: string;
};

export function CopyButton({ value, label = 'コピー' }: CopyButtonProps) {
  const isDisabled = !value;
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 2000);
    return () => clearTimeout(timer);
  }, [showToast]);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setShowToast(true);
    } catch {
      // no-op
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        disabled={isDisabled}
        aria-label={label}
        className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-1 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V4zm2 0v11h7V4h-7z" />
          <path d="M5 7a2 2 0 0 1 2-2h1v2H7v11h7v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7z" />
        </svg>
      </button>
      {showToast && (
        <div
          role="status"
          className="fixed right-4 top-20 z-50 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          コピーしました
        </div>
      )}
    </>
  );
}
