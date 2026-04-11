'use client';

type RichTextContentProps = {
  html: string;
  className?: string;
};

/**
 * Renders stored HTML event descriptions.
 * Falls back to plain text display for legacy content without HTML tags.
 */
export function RichTextContent({ html, className = '' }: RichTextContentProps) {
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(html);

  if (!hasHtmlTags) {
    return <p className={`whitespace-pre-line text-gray-700 ${className}`}>{html}</p>;
  }

  return (
    <div
      className={`event-description-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
