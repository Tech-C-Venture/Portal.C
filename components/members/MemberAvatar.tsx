/**
 * MemberAvatar コンポーネント
 * メンバーのアイコン表示
 */

'use client';

interface MemberAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses: Record<NonNullable<MemberAvatarProps['size']>, string> = {
  sm: 'w-10 h-10 text-base',
  md: 'w-12 h-12 text-lg',
  lg: 'w-24 h-24 text-2xl',
};

export function MemberAvatar({
  name,
  avatarUrl,
  size = 'md',
  className = '',
}: MemberAvatarProps) {
  const initial = name.charAt(0);

  return (
    <div
      className={`bg-gray-300 rounded-full flex items-center justify-center text-white font-bold overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={`${name}のアイコン`} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}
