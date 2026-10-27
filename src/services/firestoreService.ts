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
import { db } from '../lib/firebase';
import {
  Service,
  DigitalProduct,
  ProductCategory,
  PortfolioItem,
  CaseStudy,
  Lead,
  Quotation,
  Order,
  DownloadEntitlement,
  FAQ,
  BentoConfig
} from '../types';

// ================= HOMEPAGE BENTO & COLLECTIONS SETTINGS =================
export const defaultBentoConfig: BentoConfig = {
  heroTag: 'Next-Gen Digital Agency & Products Hub',
  heroTitle: 'Empower Your Growth With Intelligent Strategy',
  heroDescription: 'From performance marketing to ready-to-deploy UI assets, Eagle Eye Digital fuels modern brands with commercial clarity.',
  heroBtn1Text: 'Browse Products',
  heroBtn1Link: '/products',
  heroBtn2Text: 'Agency Services',
  heroBtn2Link: '/services',
  heroBgImage: '',

  card1Tag: 'Performance Media',
  card1Title: 'Social Growth & Ads',
  card1Description: 'Bespoke ad creatives tailored for scale.',
  card1LinkText: 'Explore Retainers',
  card1LinkUrl: '/services',
  card1IconText: 'in',

  card2Tag: 'Custom Web Engine',
  card2Title: 'ubuntu:~$ sudo',
  card2Description: 'Custom Web & Infrastructure Development',
  card2LinkUrl: '/services',

  card3Tag: 'AI & Kits',
  card3Title: 'ChatGPT & UI Vault',
  card3LinkText: 'View Assets',
  card3LinkUrl: '/products',

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
      return { ...defaultBentoConfig, ...snap.data() } as BentoConfig;
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

// ================= LEADS & INQUIRIES =================
export const createLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
  const ref = await addDoc(collection(db, 'leads'), {
    ...leadData,
    status: 'New',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  return ref.id;
};

export const getAllLeads = async (): Promise<Lead[]> => {
  const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead));
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
