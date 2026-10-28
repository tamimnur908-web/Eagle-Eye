export interface Service {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  iconName?: string;
  imageUrl?: string;
  benefits: string[];
  deliverables: string[];
  timeline: string;
  pricingPackages: {
    name: string;
    price: number;
    billingType: 'one-time' | 'monthly' | 'custom';
    features: string[];
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  seoTitle?: string;
  seoDescription?: string;
  status: 'published' | 'draft' | 'archived';
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface DigitalProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  previewImages: string[];
  price: number;
  salePrice?: number;
  isFree?: boolean;
  showDiscountBadge?: boolean;
  productType: 'Game' | 'Software' | 'Graphic Asset' | 'Template' | (string & {});
  itemType?: string;
  googleDriveLink?: string;
  downloadableFileName?: string;
  downloadableFileUrl?: string;
  customDownloadBtnText?: string;
  zipPassword?: string;
  installGuide?: string;
  format: string;
  version: string;
  license: 'Standard Commercial' | 'Extended' | 'Personal';
  tags: string[];
  salesCount?: number;
  downloadsCount?: number;
  seoTitle?: string;
  seoDescription?: string;
  status: 'published' | 'draft' | 'archived';
  isFeatured?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  displayOrder?: number;
  description?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  clientName?: string;
  thumbnailUrl: string;
  galleryImages: string[];
  description: string;
  servicesProvided: string[];
  liveUrl?: string;
  status: 'published' | 'draft';
  createdAt: number;
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  clientIndustry: string;
  thumbnailUrl: string;
  challenge: string;
  strategy: string;
  implementation: string;
  results: string[];
  status: 'published' | 'draft';
  createdAt: number;
}

export interface MeetingDetails {
  scheduledTime: string; // ISO string e.g. "2026-10-30T15:30"
  meetingLink: string;   // Google Meet / Zoom URL
  scheduledBy: string;   // Admin or recipient email
  meetingStatus: 'proposed' | 'confirmed' | 'cancelled' | 'completed';
  scheduledAt: number;
  confirmedAt?: number;
  cancelledAt?: number;
  cancellationReason?: string;
  notes?: string;
}

export interface Lead {
  id: string;
  userId?: string;
  name: string;
  businessName?: string;
  email: string;
  phoneOrWhatsApp: string;
  serviceInterest: string;
  websiteOrSocial?: string;
  budgetRange: string;
  deadline?: string;
  projectDescription: string;
  preferredContactMethod: 'WhatsApp' | 'Email' | 'Phone';
  status:
    | 'New'
    | 'Contacted'
    | 'Qualified'
    | 'Proposal Sent'
    | 'Negotiation'
    | 'Won'
    | 'Lost'
    | 'Archived'
    | 'Meeting Scheduled'
    | 'Meeting Confirmed'
    | 'Meeting Cancelled';
  meetingDetails?: MeetingDetails;
  internalNotes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NotificationSettings {
  leadRecipientEmails: string[];
  updatedAt?: number;
  updatedBy?: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  leadId?: string;
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  services: string[];
  scope: string;
  deliverables: string[];
  timeline: string;
  currency: string;
  price: number;
  milestones: {
    title: string;
    amount: number;
    description: string;
  }[];
  expiryDate: string;
  terms: string;
  notes?: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';
  createdAt: number;
}

export interface CartItem {
  product: DigitalProduct;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    fileUrl?: string;
  }[];
  totalAmount: number;
  currency: string;
  paymentStatus: 'pending' | 'verified' | 'failed';
  paymentMethod?: string;
  paymentDetails?: {
    transactionId?: string;
    bankOrMobileAccount?: string;
  };
  createdAt: number;
}

export interface DownloadEntitlement {
  id: string;
  userId: string;
  orderId: string;
  productId: string;
  productName: string;
  downloadUrl: string;
  createdAt: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  iconKey: string;
  customIconUrl?: string;
  isActive: boolean;
  showInHeader: boolean;
  showInFooter: boolean;
  showInFloatingSidebar: boolean;
}

export interface HeaderConfig {
  announcementText?: string;
  showAnnouncement?: boolean;
  announcementLink?: string;
  showChatSupport: boolean;
  chatSupportText: string;
  chatSupportNumber: string;
  navLinks: {
    label: string;
    path: string;
  }[];
}

export interface FooterConfig {
  aboutText: string;
  tagline: string;
  copyrightText: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  operatingHours?: string;
  timezoneText?: string;
  currencyText?: string;
  servicesLinks: {
    label: string;
    path: string;
  }[];
  resourcesLinks: {
    label: string;
    path: string;
  }[];
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  logoUrl?: string;
  businessEmail: string;
  whatsappNumber: string;
  currency: string;
  headerConfig?: HeaderConfig;
  footerConfig?: FooterConfig;
  socialLinks?: SocialLink[];
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
}

export type TextAnimationStyle = 'typewriter' | 'fade' | 'gradient' | 'bounce' | 'none';
export type SlideVisualType = '3d' | 'image' | 'text' | 'hybrid' | 'pure-banner';

export interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  description: string;
  btn1Text: string;
  btn1Link: string;
  btn2Text: string;
  btn2Link: string;
  bgImage?: string;
  image3D?: string;
  isPureBanner?: boolean;
  
  // Dynamic Text Animation & Visual Mode Controls
  textAnimation?: TextAnimationStyle;
  textAnimationSpeed?: 'fast' | 'normal' | 'slow';
  visualType?: SlideVisualType;
  badge1Text?: string;
  badge2Text?: string;
  badgeCenterText?: string;
  terminalText?: string;
}

export interface BentoConfig {
  heroTag: string;
  heroTitle: string;
  heroDescription: string;
  heroBtn1Text: string;
  heroBtn1Link: string;
  heroBtn2Text: string;
  heroBtn2Link: string;
  heroBgImage?: string;
  heroSlides?: HeroSlide[];
  defaultTextAnimation?: TextAnimationStyle;
  defaultVisualType?: SlideVisualType;

  card1Tag: string;
  card1Title: string;
  card1Description: string;
  card1LinkText: string;
  card1LinkUrl: string;
  card1IconText: string;
  card1Image?: string;

  card2Tag: string;
  card2Title: string;
  card2Description: string;
  card2LinkUrl: string;
  card2Image?: string;

  card3Tag: string;
  card3Title: string;
  card3LinkText: string;
  card3LinkUrl: string;
  card3Image?: string;

  collections: {
    title: string;
    tag: string;
    link: string;
  }[];
}

export type AdminRole = 'owner' | 'manager' | 'editor' | 'viewer';

export interface AdminPermissions {
  canManageAdmins?: boolean;
  canManageProducts?: boolean;
  canDeleteProducts?: boolean;
  canManageServices?: boolean;
  canManageOrders?: boolean;
  canManageLeads?: boolean;
  canManageHomepage?: boolean;
  canManageSettings?: boolean;
}

export interface PasswordChangeRequest {
  requestedPassword: string;
  requestedAt: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface AdminUser {
  id: string;
  uid?: string;
  email: string;
  name: string;
  role: AdminRole;
  designation?: string;
  phone?: string;
  status: 'active' | 'suspended';
  permissions: AdminPermissions;
  adminPassword?: string;
  pendingPasswordRequest?: PasswordChangeRequest | null;
  createdAt: number;
  updatedAt?: number;
  addedBy?: string;
}

