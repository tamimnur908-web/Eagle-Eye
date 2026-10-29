import React, { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';

export interface UserAvatarProps {
  user?: {
    photoURL?: string | null;
    email?: string | null;
    displayName?: string | null;
  } | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackBg?: string;
  rounded?: 'full' | 'lg';
  showBorder?: boolean;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-2xl',
};

const ICON_SIZE_MAP = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-10 h-10',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'sm',
  className = '',
  fallbackBg = 'bg-[#FFC629] text-[#08152F]',
  rounded = 'full',
  showBorder = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // Compute primary image source
  const rawEmail = (user?.email || '').trim().toLowerCase();
  
  // 1. Direct photoURL from Firebase Auth (Google Sign-In or manual avatar)
  // 2. Unavatar service for Gmail/Google/Gravatar profile picture by email
  const directPhoto = user?.photoURL?.trim() || null;
  const emailAvatar = rawEmail ? `https://unavatar.io/${encodeURIComponent(rawEmail)}` : null;
  const avatarSrc = directPhoto || emailAvatar;

  // Reset error state if user changes
  useEffect(() => {
    setImgError(false);
  }, [user?.photoURL, user?.email]);

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.sm;
  const iconSizeClass = ICON_SIZE_MAP[size] || ICON_SIZE_MAP.sm;
  const roundClass = rounded === 'lg' ? 'rounded-xl' : 'rounded-full';
  const borderClass = showBorder ? 'ring-2 ring-white shadow-xs' : '';

  const initial = (user?.displayName || user?.email || '')
    .trim()
    .charAt(0)
    .toUpperCase();

  // If avatar URL exists and hasn't failed to load
  if (avatarSrc && !imgError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center flex-shrink-0 overflow-hidden ${sizeClass} ${roundClass} ${borderClass} bg-slate-100 ${className}`}
      >
        <img
          src={avatarSrc}
          alt={user?.displayName || user?.email || 'User Avatar'}
          referrerPolicy="no-referrer"
          loading="eager"
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover ${roundClass}`}
        />
      </div>
    );
  }

  // Graceful fallback to initial letter or user icon
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 font-bold shadow-xs select-none ${sizeClass} ${roundClass} ${borderClass} ${fallbackBg} ${className}`}
      title={user?.displayName || user?.email || 'User'}
    >
      {initial ? initial : <UserIcon className={iconSizeClass} />}
    </div>
  );
};
