import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';

interface UserAvatarProps {
  user?: UserProfile | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackIcon?: React.ReactNode;
  showRing?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'sm',
  className = '',
  fallbackIcon,
  showRing = true,
}) => {
  const [imageError, setImageError] = useState(false);

  // Determine avatar type
  const rawAvatar = user?.avatar;
  const isUrl = Boolean(rawAvatar && rawAvatar.startsWith('http'));
  const isEmoji = Boolean(rawAvatar && !rawAvatar.startsWith('http'));
  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'T';

  // For high-DPI crispness on Google avatars, upgrade resolution parameter safely
  const optimizedUrl = isUrl && rawAvatar
    ? rawAvatar.replace(/=s96-c/, '=s256-c')
    : null;

  // Fallback initial SVG avatar if no URL provided or if image fails to load
  const initialAvatarUrl = user?.name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=d97706&color=ffffff&bold=true&format=svg`
    : null;

  // Determine target image source
  const targetSrc = !imageError && isUrl
    ? optimizedUrl
    : (!isEmoji && !imageError && initialAvatarUrl ? initialAvatarUrl : null);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 bg-stone-850 font-bold text-amber-300 select-none transition-transform ${
        showRing ? 'ring-2 ring-amber-500/40 shadow-md shadow-amber-500/10' : ''
      } ${SIZE_CLASSES[size]} ${className}`}
    >
      {targetSrc ? (
        <img
          src={targetSrc}
          alt={user?.name || 'Explorer Avatar'}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
        />
      ) : (
        <span className="flex items-center justify-center w-full h-full bg-gradient-to-br from-amber-500/30 to-amber-900/40 text-amber-200">
          {user?.avatar && !user.avatar.startsWith('http') ? user.avatar : (fallbackIcon || initial)}
        </span>
      )}
    </div>
  );
};
