import React, { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';

export interface UserAvatarProps {
  user?: {
    photoURL?: string | null;
    avatarUrl?: string | null;
    avatar?: string | null;
    photo?: string | null;
    email?: string | null;
    displayName?: string | null;
    providerData?: Array<{ photoURL?: string | null; providerId?: string }> | null;
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

  const rawEmail = (user?.email || '').trim().toLowerCase();

  // Resolve best candidate photo URL across all sources
  const resolvePhotoUrl = (): string | null => {
    // 1. Direct Firebase Auth photoURL
    if (user?.photoURL && user.photoURL.trim().length > 0) {
      return user.photoURL.trim();
    }

    // 2. avatarUrl / avatar field (from Firestore user doc or admin profile)
    const anyUser = user as any;
    if (anyUser?.avatarUrl && typeof anyUser.avatarUrl === 'string' && anyUser.avatarUrl.trim()) {
      return anyUser.avatarUrl.trim();
    }
    if (anyUser?.avatar && typeof anyUser.avatar === 'string' && anyUser.avatar.trim()) {
      return anyUser.avatar.trim();
    }
    if (anyUser?.photo && typeof anyUser.photo === 'string' && anyUser.photo.trim()) {
      return anyUser.photo.trim();
    }

    // 3. Provider data (e.g. Google Sign-In provider photo)
    if (user?.providerData && Array.isArray(user.providerData)) {
      const providerWithPhoto = user.providerData.find((p) => p?.photoURL && p.photoURL.trim());
      if (providerWithPhoto?.photoURL) {
        return providerWithPhoto.photoURL.trim();
      }
    }

    // 4. Local storage cached photo for this user/email
    if (rawEmail) {
      try {
        const cached = localStorage.getItem(`eed_avatar_${rawEmail}`);
        if (cached && cached.trim()) return cached.trim();
      } catch {}
    }

    try {
      const genericCached = localStorage.getItem('eed_user_avatar');
      if (genericCached && genericCached.trim() && user?.email) {
        return genericCached.trim();
      }
    } catch {}

    return null;
  };

  const avatarSrc = resolvePhotoUrl();

  // Reset error state if photo source or email changes
  useEffect(() => {
    setImgError(false);
  }, [avatarSrc, rawEmail]);

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.sm;
  const iconSizeClass = ICON_SIZE_MAP[size] || ICON_SIZE_MAP.sm;
  const roundClass = rounded === 'lg' ? 'rounded-xl' : 'rounded-full';
  const borderClass = showBorder ? 'ring-2 ring-white shadow-xs' : '';

  const initial = (user?.displayName || user?.email || '')
    .trim()
    .charAt(0)
    .toUpperCase();

  // If a valid avatar URL exists and hasn't failed to load
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
