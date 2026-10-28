import React from 'react';
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Github,
  Send,
  Globe,
  Share2,
  MessageCircle,
  Video,
  Music,
  Mail,
  Phone
} from 'lucide-react';
import { SocialLink } from '../types';

export const SOCIAL_ICON_OPTIONS = [
  { key: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: '#E4405F' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, color: '#FF0000' },
  { key: 'twitter', label: 'X (Twitter)', icon: Twitter, color: '#000000' },
  { key: 'tiktok', label: 'TikTok', icon: Music, color: '#000000' },
  { key: 'github', label: 'GitHub', icon: Github, color: '#24292e' },
  { key: 'telegram', label: 'Telegram', icon: Send, color: '#229ED9' },
  { key: 'discord', label: 'Discord', icon: MessageCircle, color: '#5865F2' },
  { key: 'behance', label: 'Behance / Design', icon: Globe, color: '#053eff' },
  { key: 'dribbble', label: 'Dribbble', icon: Share2, color: '#ea4c89' },
  { key: 'video', label: 'Vimeo / Video', icon: Video, color: '#1ab7ea' },
  { key: 'globe', label: 'Website / Other', icon: Globe, color: '#4F46E5' },
  { key: 'custom', label: 'Custom URL / SVG', icon: Share2, color: '#F59E0B' },
];

export const SocialIcon: React.FC<{
  link: SocialLink;
  className?: string;
  size?: number;
}> = ({ link, className = 'w-4 h-4', size = 16 }) => {
  // If custom icon URL is provided, display image
  if (link.customIconUrl) {
    return (
      <img
        src={link.customIconUrl}
        alt={link.platform}
        className={`${className} object-contain rounded`}
        style={{ width: size, height: size }}
      />
    );
  }

  const option = SOCIAL_ICON_OPTIONS.find(
    (o) => o.key.toLowerCase() === (link.iconKey || '').toLowerCase()
  );

  const IconComp = option ? option.icon : Globe;
  return <IconComp className={className} style={{ width: size, height: size }} />;
};
