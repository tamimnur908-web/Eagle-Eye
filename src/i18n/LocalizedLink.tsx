// ============================================================================
// Eagle Eye Digital — Localized Link Component
// Drop-in replacement for react-router-dom's Link that adds language prefix.
// ============================================================================

import React from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';
import { useLanguage } from './LanguageContext';

interface LocalizedLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
}

/**
 * Wraps react-router-dom Link to automatically prefix the current language.
 * Admin routes (/admin/*) are NOT prefixed.
 * External URLs (http://, https://, mailto:, tel:) are NOT prefixed.
 */
export const LocalizedLink: React.FC<LocalizedLinkProps> = ({ to, ...props }) => {
  const { localizedPath } = useLanguage();

  // Don't localize external URLs or special protocols
  if (
    typeof to === 'string' &&
    (to.startsWith('http') || to.startsWith('mailto:') || to.startsWith('tel:') || to.startsWith('#'))
  ) {
    return <RouterLink to={to} {...props} />;
  }

  // Don't localize admin routes
  if (typeof to === 'string' && to.startsWith('/admin')) {
    return <RouterLink to={to} {...props} />;
  }

  const localTo = typeof to === 'string' ? localizedPath(to) : to;
  return <RouterLink to={localTo} {...props} />;
};

export default LocalizedLink;
