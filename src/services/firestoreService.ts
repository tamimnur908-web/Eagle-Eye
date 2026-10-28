import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, ADMIN_UID, BUSINESS_EMAIL } from '../lib/firebase';
import {
  Service,
  DigitalProduct,
  ProductCategory,
  PortfolioItem,
  CaseStudy,
  Lead,
  MeetingDetails,
  NotificationSettings,
  Quotation,
  Order,
  DownloadEntitlement,
  FAQ,
  BentoConfig,
  HeroSlide,
  AdminUser,
  AdminRole,
  AdminPermissions,
  PasswordChangeRequest,
  SocialLink,
  HeaderConfig,
  FooterConfig,
  SiteSettings
} from '../types';

// ================= HOMEPAGE BENTO & COLLECTIONS SETTINGS =================
export const defaultHeroSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    tag: 'Next-Gen Digital Agency & Products Hub',
    title: 'Empower Your Growth With Intelligent Strategy',
    description: 'From performance marketing to ready-to-deploy UI assets, Eagle Eye Digital fuels modern brands with commercial clarity.',
    btn1Text: 'Browse Products',
    btn1Link: '/products',
    btn2Text: 'Agency Services',
    btn2Link: '/services',
    bgImage: '',
    image3D: '',
    visualType: '3d',
    textAnimation: 'typewriter',
    badge1Text: 'Instant Deploy',
    badgeCenterText: 'Verified 4K',
    badge2Text: '4.9/5 Rating'
  },
  {
    id: 'slide-2',
    tag: 'High-Converting Digital Assets',
    title: 'Modern Templates & 3D Resource Vault',
    description: 'Explore curated UI kits, production-ready software tools, and digital creative templates crafted for scale.',
    btn1Text: 'Explore Vault',
    btn1Link: '/products',
    btn2Text: 'Custom Projects',
    btn2Link: '/services',
    bgImage: '',
    image3D: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    visualType: 'image',
    textAnimation: 'gradient'
  },
  {
    id: 'slide-3',
    tag: 'Performance Marketing Retainers',
    title: 'Full-Funnel Growth & Social Ad Engines',
    description: 'Tailored Meta, Google, and LinkedIn ad strategies delivering measurable revenue for high-growth enterprises.',
    btn1Text: 'Book Strategy Call',
    btn1Link: '/contact',
    btn2Text: 'View Case Studies',
    btn2Link: '/case-studies',
    bgImage: '',
    image3D: '',
    visualType: 'text',
    textAnimation: 'fade',
    terminalText: 'npm run eagle:scale --boost=revenue'
  }
];

export const defaultBentoConfig: BentoConfig = {
  heroTag: 'Next-Gen Digital Agency & Products Hub',
  heroTitle: 'Empower Your Growth With Intelligent Strategy',
  heroDescription: 'From performance marketing to ready-to-deploy UI assets, Eagle Eye Digital fuels modern brands with commercial clarity.',
  heroBtn1Text: 'Browse Products',
  heroBtn1Link: '/products',
  heroBtn2Text: 'Agency Services',
  heroBtn2Link: '/services',
  heroBgImage: '',
  heroSlides: defaultHeroSlides,

  card1Tag: 'Performance Media',
  card1Title: 'Social Growth & Ads',
  card1Description: 'Bespoke ad creatives tailored for scale.',
  card1LinkText: 'Explore Retainers',
  card1LinkUrl: '/services',
  card1IconText: 'in',
  card1Image: '',

  card2Tag: 'Custom Web Engine',
  card2Title: 'ubuntu:~$ sudo',
  card2Description: 'Custom Web & Infrastructure Development',
  card2LinkUrl: '/services',
  card2Image: '',

  card3Tag: 'AI & Kits',
  card3Title: 'ChatGPT & UI Vault',
  card3LinkText: 'View Assets',
  card3LinkUrl: '/products',
  card3Image: '',

  collections: [
    { title: 'All Products', tag: 'Complete Vault', link: '/products' },
    { title: 'Eagle Eye Retainers', tag: 'Core Agency', link: '/services' },
    { title: 'UI & Figma Kits', tag: 'Design Systems', link: '/products?category=UI Kits' },
    { title: 'Social Media', tag: 'Ad Templates', link: '/products?category=Templates' },
    { title: 'Web Platforms', tag: 'E-Commerce', link: '/services' },
    { title: 'Case Studies', tag: 'Verified Outcomes', link: '/case-studies' },
  ]
};

export const getBentoConfig = async (): Promise<BentoConfig> => {
  try {
    const docRef = doc(db, 'settings', 'homepage_bento');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        ...defaultBentoConfig,
        ...data,
        heroSlides: data.heroSlides && data.heroSlides.length > 0 ? data.heroSlides : defaultHeroSlides
      } as BentoConfig;
    }
  } catch (err) {
    console.error('Failed to load bento config:', err);
  }
  return defaultBentoConfig;
};

export const saveBentoConfig = async (config: BentoConfig) => {
  const docRef = doc(db, 'settings', 'homepage_bento');
  await setDoc(docRef, config, { merge: true });
};

// ================= SITE SETTINGS, HEADER, FOOTER & SOCIAL =================
export const defaultSocialLinks: SocialLink[] = [
  {
    id: 'facebook',
    platform: 'Facebook',
    url: 'https://facebook.com/eagleeyedigital',
    iconKey: 'facebook',
    isActive: true,
    showInHeader: false,
    showInFooter: true,
    showInFloatingSidebar: true,
  },
  {
    id: 'whatsapp',
    platform: 'WhatsApp',
    url: 'https://wa.me/8801836126791',
    iconKey: 'whatsapp',
    isActive: true,
    showInHeader: true,
    showInFooter: true,
    showInFloatingSidebar: true,
  },
  {
    id: 'instagram',
    platform: 'Instagram',
    url: 'https://instagram.com/eagleeyedigital',
    iconKey: 'instagram',
    isActive: true,
    showInHeader: false,
    showInFooter: true,
    showInFloatingSidebar: true,
  },
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    url: 'https://linkedin.com/company/eagleeyedigital',
    iconKey: 'linkedin',
    isActive: true,
    showInHeader: false,
    showInFooter: true,
    showInFloatingSidebar: true,
  },
  {
    id: 'youtube',
    platform: 'YouTube',
    url: 'https://youtube.com/@eagleeyedigital',
    iconKey: 'youtube',
    isActive: true,
    showInHeader: false,
    showInFooter: true,
    showInFloatingSidebar: true,
  },
];

export const defaultHeaderConfig: HeaderConfig = {
  announcementText: '⚡ Special Offer: Up to 50% discount on UI Kits & Software resources! Instant Digital Delivery.',
  showAnnouncement: true,
  announcementLink: '/products',
  showChatSupport: true,
  chatSupportText: 'Chat Support',
  chatSupportNumber: '01836126791',
  navLinks: [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/products' },
    { label: 'Services', path: '/services' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Case Studies', path: '/case-studies' },
    { label: 'About', path: '/about' },
    { label: 'Our Contacts', path: '/contact' },
  ],
};

export const defaultFooterConfig: FooterConfig = {
  aboutText: 'Your dedicated commercial partner. Specialized in performance marketing, growth retainers, bespoke web development, and production-ready digital assets.',
  tagline: 'Focus • Strategy • Growth',
  copyrightText: 'Eagle Eye Digital. All rights reserved.',
  contactEmail: 'Tamimnur908@gmail.com',
  contactPhone: '01836126791',
  contactWhatsapp: '01836126791',
  operatingHours: 'Saturday - Thursday: 10:00 AM - 8:00 PM',
  timezoneText: 'Operating Timezone: Asia/Dhaka (GMT+6)',
  currencyText: 'Primary Currency: BDT (৳) & USD ($)',
  servicesLinks: [
    { label: 'Digital Marketing & Ads', path: '/services' },
    { label: 'Social Media Management', path: '/services' },
    { label: 'Web & E-Commerce Development', path: '/services' },
    { label: 'Branding & Visual Design', path: '/services' },
    { label: 'Consultation & Strategy', path: '/services' },
  ],
  resourcesLinks: [
    { label: 'Digital Products Store', path: '/products' },
    { label: 'Client Portfolio', path: '/portfolio' },
    { label: 'Case Studies', path: '/case-studies' },
    { label: 'Agency FAQ', path: '/faq' },
    { label: 'Client Support Desk', path: '/support' },
  ],
};

export const defaultSiteSettings: SiteSettings = {
  brandName: 'Eagle Eye Digital',
  tagline: 'YOUR DIGITAL WORLD',
  logoUrl: '/logo.jpg',
  businessEmail: 'Tamimnur908@gmail.com',
  whatsappNumber: '01836126791',
  currency: 'BDT',
  headerConfig: defaultHeaderConfig,
  footerConfig: defaultFooterConfig,
  socialLinks: defaultSocialLinks,
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const docRef = doc(db, 'settings', 'site_settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        brandName: data.brandName || defaultSiteSettings.brandName,
        tagline: data.tagline || defaultSiteSettings.tagline,
        logoUrl: data.logoUrl || defaultSiteSettings.logoUrl,
        businessEmail: data.businessEmail || defaultSiteSettings.businessEmail,
        whatsappNumber: data.whatsappNumber || defaultSiteSettings.whatsappNumber,
        currency: data.currency || defaultSiteSettings.currency,
        headerConfig: {
          ...defaultHeaderConfig,
          ...(data.headerConfig || {}),
          navLinks: data.headerConfig?.navLinks && data.headerConfig.navLinks.length > 0
            ? data.headerConfig.navLinks
            : defaultHeaderConfig.navLinks
        },
        footerConfig: {
          ...defaultFooterConfig,
          ...(data.footerConfig || {}),
          servicesLinks: data.footerConfig?.servicesLinks && data.footerConfig.servicesLinks.length > 0
            ? data.footerConfig.servicesLinks
            : defaultFooterConfig.servicesLinks,
          resourcesLinks: data.footerConfig?.resourcesLinks && data.footerConfig.resourcesLinks.length > 0
            ? data.footerConfig.resourcesLinks
            : defaultFooterConfig.resourcesLinks
        },
        socialLinks: data.socialLinks && data.socialLinks.length > 0
          ? data.socialLinks
          : defaultSocialLinks,
      };
    }
  } catch (err) {
    console.error('Failed to load site settings from Firestore:', err);
  }
  return defaultSiteSettings;
};

export const saveSiteSettings = async (settings: Partial<SiteSettings>) => {
  const docRef = doc(db, 'settings', 'site_settings');
  await setDoc(docRef, settings, { merge: true });
};

// ================= SERVICES =================
export const getPublishedServices = async (): Promise<Service[]> => {
  const q = query(collection(db, 'services'), where('status', '==', 'published'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
};

export const getAllServices = async (): Promise<Service[]> => {
  const snap = await getDocs(collection(db, 'services'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
};

export const getServiceBySlug = async (slug: string): Promise<Service | null> => {
  const q = query(collection(db, 'services'), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Service;
};

export const saveService = async (service: Partial<Service> & { id?: string }) => {
  if (service.id) {
    const docRef = doc(db, 'services', service.id);
    await updateDoc(docRef, { ...service, updatedAt: Date.now() });
    return service.id;
  } else {
    const docRef = await addDoc(collection(db, 'services'), {
      ...service,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return docRef.id;
  }
};

export const deleteService = async (id: string) => {
  await deleteDoc(doc(db, 'services', id));
};

// ================= DIGITAL PRODUCTS =================
export const getPublishedProducts = async (): Promise<DigitalProduct[]> => {
  const q = query(collection(db, 'products'), where('status', '==', 'published'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as DigitalProduct));
};

export const getAllProducts = async (): Promise<DigitalProduct[]> => {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as DigitalProduct));
};

export const getProductBySlug = async (slug: string): Promise<DigitalProduct | null> => {
  const q = query(collection(db, 'products'), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as DigitalProduct;
};

export const saveProduct = async (product: Partial<DigitalProduct> & { id?: string }) => {
  if (product.id) {
    const docRef = doc(db, 'products', product.id);
    await updateDoc(docRef, { ...product, updatedAt: Date.now() });
    return product.id;
  } else {
    const docRef = await addDoc(collection(db, 'products'), {
      ...product,
      salesCount: 0,
      downloadsCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return docRef.id;
  }
};

export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, 'products', id));
};

// ================= CATEGORIES =================
export const getAllCategories = async (): Promise<ProductCategory[]> => {
  const snap = await getDocs(collection(db, 'productCategories'));
  if (snap.empty) {
    return [
      { id: '1', name: 'Templates', slug: 'templates', displayOrder: 0 },
      { id: '2', name: 'UI Kits', slug: 'ui-kits', displayOrder: 1 },
      { id: '3', name: 'Software', slug: 'software', displayOrder: 2 },
      { id: '4', name: 'Games', slug: 'games', displayOrder: 3 }
    ];
  }
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductCategory));
};

export const saveCategory = async (cat: Partial<ProductCategory> & { id?: string }) => {
  if (cat.id) {
    const docRef = doc(db, 'productCategories', cat.id);
    await updateDoc(docRef, cat);
    return cat.id;
  } else {
    const docRef = await addDoc(collection(db, 'productCategories'), cat);
    return docRef.id;
  }
};

export const deleteCategory = async (id: string) => {
  await deleteDoc(doc(db, 'productCategories', id));
};

// ================= PORTFOLIO & CASE STUDIES =================
export const getPublishedPortfolio = async (): Promise<PortfolioItem[]> => {
  const q = query(collection(db, 'portfolio'), where('status', '==', 'published'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioItem));
};

export const getAllPortfolio = async (): Promise<PortfolioItem[]> => {
  const snap = await getDocs(collection(db, 'portfolio'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioItem));
};

export const savePortfolio = async (item: Partial<PortfolioItem> & { id?: string }) => {
  if (item.id) {
    await updateDoc(doc(db, 'portfolio', item.id), item);
    return item.id;
  } else {
    const ref = await addDoc(collection(db, 'portfolio'), { ...item, createdAt: Date.now() });
    return ref.id;
  }
};

export const deletePortfolio = async (id: string) => {
  await deleteDoc(doc(db, 'portfolio', id));
};

export const getPublishedCaseStudies = async (): Promise<CaseStudy[]> => {
  const q = query(collection(db, 'caseStudies'), where('status', '==', 'published'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CaseStudy));
};

export const getAllCaseStudies = async (): Promise<CaseStudy[]> => {
  const snap = await getDocs(collection(db, 'caseStudies'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CaseStudy));
};

export const saveCaseStudy = async (study: Partial<CaseStudy> & { id?: string }) => {
  if (study.id) {
    await updateDoc(doc(db, 'caseStudies', study.id), study);
    return study.id;
  } else {
    const ref = await addDoc(collection(db, 'caseStudies'), { ...study, createdAt: Date.now() });
    return ref.id;
  }
};

export const deleteCaseStudy = async (id: string) => {
  await deleteDoc(doc(db, 'caseStudies', id));
};

import {
  sendLeadNotificationEmails,
  sendMeetingScheduledEmail,
  sendMeetingStatusAlert
} from './emailService';

export const DEFAULT_RECIPIENT_EMAIL = 'tamimnur908@gmail.com';

// ================= NOTIFICATION SETTINGS =================
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const docRef = doc(db, 'settings', 'leadNotifications');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      // Ensure it respects empty array if admin removed all emails
      const emails = Array.isArray(data.leadRecipientEmails)
        ? data.leadRecipientEmails
        : [DEFAULT_RECIPIENT_EMAIL];
      return {
        leadRecipientEmails: emails,
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy
      };
    }
  } catch (err) {
    console.warn('Error reading notification settings:', err);
  }
  return {
    leadRecipientEmails: [DEFAULT_RECIPIENT_EMAIL]
  };
};

export const saveNotificationSettings = async (settings: NotificationSettings) => {
  const docRef = doc(db, 'settings', 'leadNotifications');
  await setDoc(docRef, {
    leadRecipientEmails: settings.leadRecipientEmails || [],
    updatedAt: Date.now()
  }, { merge: true });
};

// ================= LEADS & INQUIRIES =================
export const createLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> => {
  const now = Date.now();
  const payload = {
    ...leadData,
    status: 'New' as const,
    createdAt: now,
    updatedAt: now
  };

  const ref = await addDoc(collection(db, 'leads'), payload);
  const createdLead: Lead = {
    id: ref.id,
    ...payload
  };

  // Check Dynamic Notification Recipient Settings
  try {
    const settings = await getNotificationSettings();
    if (settings.leadRecipientEmails && settings.leadRecipientEmails.length > 0) {
      await sendLeadNotificationEmails(createdLead, settings.leadRecipientEmails);
    } else {
      console.info('No email recipient configured. Notification skipped according to settings.');
    }
  } catch (err) {
    console.error('Lead notification email error:', err);
  }

  return ref.id;
};

export const getAllLeads = async (): Promise<Lead[]> => {
  const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead));
};

export const getLeadById = async (id: string): Promise<Lead | null> => {
  const snap = await getDoc(doc(db, 'leads', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Lead;
};

export const getUserLeads = async (userId?: string, userEmail?: string): Promise<Lead[]> => {
  const all = await getAllLeads();
  return all.filter((l) => {
    if (userId && l.userId === userId) return true;
    if (userEmail && l.email && l.email.toLowerCase() === userEmail.toLowerCase()) return true;
    return false;
  });
};

export const updateLeadMeeting = async (
  leadId: string,
  meeting: Omit<MeetingDetails, 'scheduledAt'>
): Promise<void> => {
  const fullMeeting: MeetingDetails = {
    ...meeting,
    scheduledAt: Date.now()
  };

  await updateDoc(doc(db, 'leads', leadId), {
    meetingDetails: fullMeeting,
    status: 'Meeting Scheduled',
    updatedAt: Date.now()
  });

  const lead = await getLeadById(leadId);
  if (lead) {
    await sendMeetingScheduledEmail(lead, fullMeeting);
  }
};

export const respondToMeeting = async (
  leadId: string,
  action: 'accept' | 'cancel',
  reason?: string
): Promise<void> => {
  const lead = await getLeadById(leadId);
  if (!lead || !lead.meetingDetails) {
    throw new Error('Meeting not found for this inquiry.');
  }

  const isAccept = action === 'accept';
  const updatedMeeting: MeetingDetails = {
    ...lead.meetingDetails,
    meetingStatus: isAccept ? 'confirmed' : 'cancelled',
    ...(isAccept ? { confirmedAt: Date.now() } : { cancelledAt: Date.now(), cancellationReason: reason })
  };

  const newStatus: Lead['status'] = isAccept ? 'Meeting Confirmed' : 'Meeting Cancelled';

  await updateDoc(doc(db, 'leads', leadId), {
    meetingDetails: updatedMeeting,
    status: newStatus,
    updatedAt: Date.now()
  });

  const updatedLead: Lead = {
    ...lead,
    meetingDetails: updatedMeeting,
    status: newStatus
  };

  const settings = await getNotificationSettings();
  await sendMeetingStatusAlert(
    updatedLead,
    isAccept ? 'confirmed' : 'cancelled',
    settings.leadRecipientEmails || [],
    reason
  );
};

export const updateLeadStatus = async (leadId: string, status: Lead['status'], internalNotes?: string) => {
  const payload: any = { status, updatedAt: Date.now() };
  if (internalNotes !== undefined) payload.internalNotes = internalNotes;
  await updateDoc(doc(db, 'leads', leadId), payload);
};

export const deleteLead = async (id: string) => {
  await deleteDoc(doc(db, 'leads', id));
};

// ================= QUOTATIONS =================
export const getAllQuotations = async (): Promise<Quotation[]> => {
  const snap = await getDocs(collection(db, 'quotations'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Quotation));
};

export const saveQuotation = async (quote: Partial<Quotation> & { id?: string }) => {
  if (quote.id) {
    await updateDoc(doc(db, 'quotations', quote.id), quote);
    return quote.id;
  } else {
    const ref = await addDoc(collection(db, 'quotations'), { ...quote, createdAt: Date.now() });
    return ref.id;
  }
};

export const deleteQuotation = async (id: string) => {
  await deleteDoc(doc(db, 'quotations', id));
};

// ================= ORDERS & DOWNLOADS =================
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
};

export const getAllOrders = async (): Promise<Order[]> => {
  const snap = await getDocs(collection(db, 'orders'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
  const ref = await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: Date.now()
  });
  return ref.id;
};

export const updateOrderStatus = async (orderId: string, paymentStatus: Order['paymentStatus']) => {
  await updateDoc(doc(db, 'orders', orderId), { paymentStatus });
};

export const getUserEntitlements = async (userId: string): Promise<DownloadEntitlement[]> => {
  const q = query(collection(db, 'downloadEntitlements'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as DownloadEntitlement));
};

// ================= FAQS =================
export const getAllFAQs = async (): Promise<FAQ[]> => {
  const snap = await getDocs(collection(db, 'faqs'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FAQ));
};

export const saveFAQ = async (faq: Partial<FAQ> & { id?: string }) => {
  if (faq.id) {
    await updateDoc(doc(db, 'faqs', faq.id), faq);
    return faq.id;
  } else {
    const ref = await addDoc(collection(db, 'faqs'), faq);
    return ref.id;
  }
};

export const deleteFAQ = async (id: string) => {
  await deleteDoc(doc(db, 'faqs', id));
};

// ================= ADMIN & ROLE MANAGEMENT =================
export const getDefaultRolePermissions = (role: AdminRole): AdminPermissions => {
  switch (role) {
    case 'owner':
      return {
        canManageAdmins: true,
        canManageProducts: true,
        canDeleteProducts: true,
        canManageServices: true,
        canManageOrders: true,
        canManageLeads: true,
        canManageHomepage: true,
        canManageSettings: true,
      };
    case 'manager':
      return {
        canManageAdmins: false,
        canManageProducts: true,
        canDeleteProducts: true,
        canManageServices: true,
        canManageOrders: true,
        canManageLeads: true,
        canManageHomepage: true,
        canManageSettings: false,
      };
    case 'editor':
      return {
        canManageAdmins: false,
        canManageProducts: true,
        canDeleteProducts: false,
        canManageServices: true,
        canManageOrders: false,
        canManageLeads: false,
        canManageHomepage: true,
        canManageSettings: false,
      };
    case 'viewer':
    default:
      return {
        canManageAdmins: false,
        canManageProducts: false,
        canDeleteProducts: false,
        canManageServices: false,
        canManageOrders: false,
        canManageLeads: true,
        canManageHomepage: false,
        canManageSettings: false,
      };
  }
};

export const getAllAdmins = async (): Promise<AdminUser[]> => {
  try {
    const snap = await getDocs(collection(db, 'admins'));
    let adminsList: AdminUser[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

    // Check if the primary system owner is in the list; if not, automatically include them
    const primaryEmail = (BUSINESS_EMAIL || 'Tamimnur908@gmail.com').toLowerCase();
    const hasPrimaryOwner = adminsList.some(
      a => a.uid === ADMIN_UID || a.email.toLowerCase() === primaryEmail
    );

    if (!hasPrimaryOwner) {
      const defaultOwner: AdminUser = {
        id: 'primary-owner',
        uid: ADMIN_UID,
        email: primaryEmail,
        name: 'Super Admin / Owner',
        role: 'owner',
        designation: 'Founder & CEO',
        phone: '01836126791',
        status: 'active',
        permissions: getDefaultRolePermissions('owner'),
        createdAt: 1700000000000,
        addedBy: 'System Default'
      };

      // Persist in Firestore so rules and other queries find it
      try {
        await setDoc(doc(db, 'admins', ADMIN_UID), defaultOwner, { merge: true });
        adminsList = [defaultOwner, ...adminsList];
      } catch (e) {
        adminsList = [defaultOwner, ...adminsList];
      }
    }

    return adminsList.sort((a, b) => {
      // Owners first, then managers, then editors, then viewers
      const rank: Record<AdminRole, number> = { owner: 4, manager: 3, editor: 2, viewer: 1 };
      return (rank[b.role] || 0) - (rank[a.role] || 0);
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    // Fallback to primary owner in case collection query fails
    return [
      {
        id: 'primary-owner',
        uid: ADMIN_UID,
        email: (BUSINESS_EMAIL || 'Tamimnur908@gmail.com').toLowerCase(),
        name: 'Super Admin / Owner',
        role: 'owner',
        designation: 'Founder & CEO',
        status: 'active',
        permissions: getDefaultRolePermissions('owner'),
        createdAt: Date.now(),
        addedBy: 'System Default'
      }
    ];
  }
};

export const findRegisteredUserByEmail = async (email: string) => {
  const emailClean = email.trim().toLowerCase();
  const q = query(collection(db, 'users'), where('email', '==', emailClean));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const userDoc = snap.docs[0];
    return { uid: userDoc.id, ...(userDoc.data() as any) };
  }
  return null;
};

export const saveAdmin = async (
  adminData: Partial<AdminUser> & { email: string; name?: string; role: AdminRole }
): Promise<string> => {
  const emailClean = adminData.email.trim().toLowerCase();

  // Verify that the user has already registered or logged in
  let targetUid = adminData.uid;
  let detectedName = adminData.name?.trim() || '';

  if (!targetUid) {
    if (adminData.id && adminData.id !== 'primary-owner' && !adminData.id.includes('@')) {
      targetUid = adminData.id;
    }
  }

  // Look up user by email if targetUid is still not resolved
  if (!targetUid) {
    const registeredUser = await findRegisteredUserByEmail(emailClean);
    if (registeredUser) {
      targetUid = registeredUser.uid;
      if (!detectedName && registeredUser.fullName) {
        detectedName = registeredUser.fullName;
      }
    } else if (!adminData.id) {
      throw new Error('This user must register or log in before becoming an Admin.');
    }
  }

  // Key admin doc by UID for fast, secure Firestore rule evaluation
  const docId = targetUid || adminData.id || emailClean.replace(/[^a-zA-Z0-9]/g, '_');
  const permissions = adminData.permissions || getDefaultRolePermissions(adminData.role);

  const payload: Record<string, any> = {
    ...adminData,
    id: docId,
    email: emailClean,
    name: detectedName || adminData.name?.trim() || emailClean.split('@')[0],
    role: adminData.role,
    status: adminData.status || 'active',
    designation: adminData.designation || '',
    phone: adminData.phone || '',
    permissions,
    updatedAt: Date.now()
  };

  if (targetUid) {
    payload.uid = targetUid;
  } else {
    delete payload.uid;
  }

  if (!adminData.createdAt) {
    payload.createdAt = Date.now();
  }

  // Crucial: Clean out ANY undefined fields so Firestore never throws "Unsupported field value: undefined"
  const cleanPayload: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) {
      cleanPayload[key] = value;
    }
  }

  // Save to admins collection
  await setDoc(doc(db, 'admins', docId), cleanPayload, { merge: true });

  // Update user document if known
  if (targetUid) {
    try {
      await setDoc(
        doc(db, 'users', targetUid),
        { isAdmin: adminData.status === 'active', role: adminData.role },
        { merge: true }
      );
    } catch {
      // Ignored if client permission restricts
    }
  }

  return docId;
};

export const deleteAdmin = async (adminId: string): Promise<void> => {
  if (adminId === ADMIN_UID || adminId === 'primary-owner') {
    throw new Error('Cannot delete the primary owner account.');
  }
  await deleteDoc(doc(db, 'admins', adminId));
};

export const requestAdminPasswordChange = async (
  adminId: string,
  newRequestedPassword: string
): Promise<void> => {
  const req: PasswordChangeRequest = {
    requestedPassword: newRequestedPassword,
    requestedAt: Date.now(),
    status: 'pending'
  };
  await updateDoc(doc(db, 'admins', adminId), {
    pendingPasswordRequest: req,
    updatedAt: Date.now()
  });
};

export const approveAdminPasswordChange = async (adminId: string): Promise<void> => {
  const adminSnap = await getDoc(doc(db, 'admins', adminId));
  if (!adminSnap.exists()) {
    throw new Error('Admin account not found.');
  }
  const data = adminSnap.data() as AdminUser;
  if (!data.pendingPasswordRequest?.requestedPassword) {
    throw new Error('No pending password request found for this admin.');
  }

  await updateDoc(doc(db, 'admins', adminId), {
    adminPassword: data.pendingPasswordRequest.requestedPassword,
    pendingPasswordRequest: null,
    updatedAt: Date.now()
  });
};

export const rejectAdminPasswordChange = async (adminId: string, reason?: string): Promise<void> => {
  await updateDoc(doc(db, 'admins', adminId), {
    pendingPasswordRequest: null,
    updatedAt: Date.now()
  });
};

export const getAdminByUidOrEmail = async (
  uid: string,
  email?: string | null
): Promise<AdminUser | null> => {
  const primaryEmail = (BUSINESS_EMAIL || 'Tamimnur908@gmail.com').toLowerCase();

  // 1. Direct match with primary system owner
  if (uid === ADMIN_UID || (email && email.toLowerCase() === primaryEmail)) {
    return {
      id: ADMIN_UID,
      uid: ADMIN_UID,
      email: primaryEmail,
      name: 'Owner / Super Admin',
      role: 'owner',
      designation: 'Founder & CEO',
      status: 'active',
      permissions: getDefaultRolePermissions('owner'),
      createdAt: Date.now()
    };
  }

  try {
    // 2. Try doc with ID = uid
    const uidDocRef = doc(db, 'admins', uid);
    const uidDocSnap = await getDoc(uidDocRef);
    if (uidDocSnap.exists()) {
      return { id: uidDocSnap.id, ...(uidDocSnap.data() as any) } as AdminUser;
    }

    // 3. Try doc with ID = sanitized email
    if (email) {
      const emailClean = email.trim().toLowerCase();
      const emailDocId = emailClean.replace(/[^a-zA-Z0-9]/g, '_');
      const emailDocSnap = await getDoc(doc(db, 'admins', emailDocId));
      if (emailDocSnap.exists()) {
        return { id: emailDocSnap.id, ...(emailDocSnap.data() as any) } as AdminUser;
      }

      // 4. Query admins where email == emailClean
      const q = query(collection(db, 'admins'), where('email', '==', emailClean));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const first = querySnap.docs[0];
        return { id: first.id, ...(first.data() as any) } as AdminUser;
      }
    }
  } catch (err) {
    console.error('Error looking up admin status:', err);
  }

  return null;
};

