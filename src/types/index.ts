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

export interface Lead {
  id: string;
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
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost' | 'Archived';
  internalNotes?: string;
  createdAt: number;
  updatedAt: number;
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

export interface SiteSettings {
  brandName: string;
  tagline: string;
  businessEmail: string;
  whatsappNumber: string;
  currency: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
}

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
