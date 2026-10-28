import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Image,
  Globe,
  Settings,
  ShieldAlert,
  Plus,
  Trash2,
  ExternalLink,
  LogOut,
  Edit2,
  Package,
  Layers,
  Inbox,
  Clock,
  Save,
  Check,
  Search,
  KeyRound,
  FileText,
  Upload,
  Gamepad2,
  Laptop,
  Palette,
  FileCode,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  Menu,
  X,
  Clipboard,
  ImagePlus,
  FolderPlus,
  Sliders,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Eye,
  Maximize2,
  ShieldCheck,
  Users,
  UserCheck,
  UserPlus,
  Shield,
  Crown,
  Briefcase,
  Edit3,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Copy,
  Calendar,
  Video,
  Bell,
  BellOff,
  MessageSquare,
  AlertTriangle,
  EyeOff,
  Unlock,
  Key,
  Send,
  Terminal,
  Box,
  Type,
  Wand2
} from 'lucide-react';
import {
  getAllServices,
  saveService,
  deleteService,
  getAllProducts,
  saveProduct,
  deleteProduct,
  getAllCategories,
  saveCategory,
  deleteCategory,
  getAllLeads,
  updateLeadStatus,
  deleteLead,
  updateLeadMeeting,
  getNotificationSettings,
  saveNotificationSettings,
  DEFAULT_RECIPIENT_EMAIL,
  getAllOrders,
  updateOrderStatus,
  getBentoConfig,
  saveBentoConfig,
  defaultBentoConfig,
  defaultHeroSlides,
  getAllAdmins,
  saveAdmin,
  deleteAdmin,
  getDefaultRolePermissions,
  findRegisteredUserByEmail,
  requestAdminPasswordChange,
  approveAdminPasswordChange,
  rejectAdminPasswordChange,
  defaultSocialLinks,
  defaultHeaderConfig,
  defaultFooterConfig,
  defaultSiteSettings
} from '../services/firestoreService';
import {
  Service,
  DigitalProduct,
  ProductCategory,
  Lead,
  MeetingDetails,
  NotificationSettings,
  Order,
  BentoConfig,
  HeroSlide,
  AdminUser,
  AdminRole,
  AdminPermissions,
  PasswordChangeRequest,
  SocialLink,
  HeaderConfig,
  FooterConfig,
  SiteSettings,
  TextAnimationStyle,
  SlideVisualType
} from '../types';
import { useSettings } from '../context/SettingsContext';
import { SocialIcon, SOCIAL_ICON_OPTIONS } from '../components/SocialIcon';
import { ADMIN_UID, BUSINESS_EMAIL } from '../lib/firebase';
import { EmptyState } from '../components/EmptyState';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, isAdmin, adminRole, logout, refreshAdminStatus, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  type AdminTab =
    | 'dashboard'
    | 'orders'
    | 'products'
    | 'services'
    | 'categories'
    | 'leads'
    | 'homepage'
    | 'footer'
    | 'settings'
    | 'admins';

  const validTabs: AdminTab[] = [
    'dashboard',
    'orders',
    'products',
    'services',
    'categories',
    'leads',
    'homepage',
    'footer',
    'settings',
    'admins'
  ];

  // Active Menu Selection (Defaults to 'dashboard', persists across page reloads via URL & localStorage)
  const [activeMenu, setActiveMenu] = useState<AdminTab>(() => {
    // 1. Check URL query param (e.g., ?tab=dashboard or ?tab=homepage)
    const tabParam = searchParams.get('tab') as AdminTab;
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam;
    }
    // 2. Check localStorage if user was previously on a tab
    const savedTab = localStorage.getItem('eagle_admin_active_tab') as AdminTab;
    if (savedTab && validTabs.includes(savedTab)) {
      return savedTab;
    }
    // 3. Default to 'dashboard' (Overview)
    return 'dashboard';
  });

  // Keep URL query param and localStorage synced
  const handleSelectMenu = (tab: AdminTab) => {
    setActiveMenu(tab);
    localStorage.setItem('eagle_admin_active_tab', tab);
    setSearchParams({ tab }, { replace: true });
    if (tab === 'products') setProductViewMode('list');
  };

  // Sync state if user navigates back/forward or if no param provided
  useEffect(() => {
    const tabParam = searchParams.get('tab') as AdminTab;
    if (tabParam && validTabs.includes(tabParam)) {
      if (tabParam !== activeMenu) {
        setActiveMenu(tabParam);
        localStorage.setItem('eagle_admin_active_tab', tabParam);
      }
    } else {
      setSearchParams({ tab: activeMenu }, { replace: true });
      localStorage.setItem('eagle_admin_active_tab', activeMenu);
    }
  }, [searchParams]);

  // Sub-view: 'list' | 'create'
  const [productViewMode, setProductViewMode] = useState<'list' | 'create'>('list');
  const [productSearch, setProductSearch] = useState('');

  // Datasets
  const [bentoForm, setBentoForm] = useState<BentoConfig>(defaultBentoConfig);
  const [bentoSaved, setBentoSaved] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Category creation & editing form state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [newCatOrder, setNewCatOrder] = useState(0);
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isCategoryDragging, setIsCategoryDragging] = useState(false);
  const categoryFileInputRef = React.useRef<HTMLInputElement>(null);

  // Full Vyrqonix Multi-step Product Form State
  const [prodForm, setProdForm] = useState<Partial<DigitalProduct>>({
    name: '',
    slug: '',
    category: 'Templates',
    productType: 'Template',
    shortDescription: '',
    description: '',
    isFree: true,
    price: 0,
    salePrice: 0,
    showDiscountBadge: false,
    googleDriveLink: '',
    customDownloadBtnText: 'Download File',
    zipPassword: '',
    installGuide: '',
    thumbnailUrl: '',
    previewImages: [],
    status: 'published'
  });

  // Custom Item Types & Category Selection in Product Form
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [isAddingCustomType, setIsAddingCustomType] = useState(false);
  const [newCustomTypeName, setNewCustomTypeName] = useState('');
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [isAddingQuickCategory, setIsAddingQuickCategory] = useState(false);

  // Product Image Upload & Clipboard Paste State
  const [isProductImageDragging, setIsProductImageDragging] = useState(false);
  const productFileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(null);

  // Vyrqonix Hero Banners & Side Posters States (Exact Screenshot Layout)
  const [bentoActiveTab, setBentoActiveTab] = useState<'slider' | 'posters'>('slider');
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [newSlideImg, setNewSlideImg] = useState('');
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideLink, setNewSlideLink] = useState('/products');
  const [newSlideIsPureBanner, setNewSlideIsPureBanner] = useState(false);
  
  // Dynamic Slide Animation & Visual Mode Form States
  const [newSlideTextAnimation, setNewSlideTextAnimation] = useState<TextAnimationStyle>('typewriter');
  const [newSlideTextSpeed, setNewSlideTextSpeed] = useState<'fast' | 'normal' | 'slow'>('normal');
  const [newSlideVisualType, setNewSlideVisualType] = useState<SlideVisualType>('3d');
  const [newSlideBadge1, setNewSlideBadge1] = useState('Instant Deploy');
  const [newSlideBadgeCenter, setNewSlideBadgeCenter] = useState('Verified 4K');
  const [newSlideBadge2, setNewSlideBadge2] = useState('4.9/5 Rating');
  const [newSlideImage3D, setNewSlideImage3D] = useState('');
  const [newSlideTerminalText, setNewSlideTerminalText] = useState('deploy --mode=scale');

  const heroSlideFileInputRef = React.useRef<HTMLInputElement>(null);

  const [posterSlot, setPosterSlot] = useState<'top' | 'bottom-left' | 'bottom-right'>('top');
  const [newPosterImg, setNewPosterImg] = useState('');
  const [newPosterTitle, setNewPosterTitle] = useState('');
  const [newPosterLink, setNewPosterLink] = useState('/products');
  const sidePosterFileInputRef = React.useRef<HTMLInputElement>(null);

  // Real-time Preview States & Dynamic Typewriter for Admin
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [previewAutoPlay, setPreviewAutoPlay] = useState(true);
  const [previewViewMode, setPreviewViewMode] = useState<'slider' | 'full-layout' | 'full-website'>('slider');
  const [previewTypedTitle, setPreviewTypedTitle] = useState('');
  const [previewFocusUploaded, setPreviewFocusUploaded] = useState(false);

  // When a new image is uploaded or pasted, automatically focus the preview on it
  useEffect(() => {
    if (newSlideImg) {
      setPreviewFocusUploaded(true);
    }
  }, [newSlideImg]);

  // Auto-advance preview slides if previewAutoPlay is enabled and not locked on uploaded draft
  useEffect(() => {
    if (!previewAutoPlay || previewFocusUploaded) return;
    const slidesList = bentoForm.heroSlides && bentoForm.heroSlides.length > 0
      ? bentoForm.heroSlides
      : defaultHeroSlides;
    if (slidesList.length <= 1) return;
    const timer = setInterval(() => {
      setPreviewSlideIndex((prev) => (prev + 1) % slidesList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [previewAutoPlay, previewFocusUploaded, bentoForm.heroSlides]);

  // Jump preview to active slide when starting an edit
  useEffect(() => {
    if (editingSlideIndex !== null) {
      setPreviewSlideIndex(editingSlideIndex);
    }
  }, [editingSlideIndex]);

  // Typewriter effect in preview title
  useEffect(() => {
    const slidesList = bentoForm.heroSlides && bentoForm.heroSlides.length > 0
      ? bentoForm.heroSlides
      : defaultHeroSlides;
    const current = slidesList[previewSlideIndex] || slidesList[0];
    const targetTitle = (editingSlideIndex === previewSlideIndex && newSlideTitle)
      ? newSlideTitle
      : (current?.title || 'Empower Your Growth With Intelligent Strategy');

    setPreviewTypedTitle('');
    let charIdx = 0;
    const interval = setInterval(() => {
      charIdx++;
      setPreviewTypedTitle(targetTitle.slice(0, charIdx));
      if (charIdx >= targetTitle.length) {
        clearInterval(interval);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [previewSlideIndex, editingSlideIndex, newSlideTitle, bentoForm.heroSlides]);

  const [serviceForm, setServiceForm] = useState<Partial<Service>>({
    name: '',
    slug: '',
    shortDescription: '',
    longDescription: '',
    category: 'Digital Marketing & Ads',
    timeline: '2-4 Weeks',
    status: 'published'
  });
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mobile Navigation Drawer State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Admins & Roles Management States
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState<'all' | AdminRole>('all');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [adminForm, setAdminForm] = useState<{
    name: string;
    email: string;
    role: AdminRole;
    designation: string;
    phone: string;
    status: 'active' | 'suspended';
    adminPassword: string;
    permissions: AdminPermissions;
  }>({
    name: '',
    email: '',
    role: 'editor',
    designation: '',
    phone: '',
    status: 'active',
    adminPassword: '',
    permissions: getDefaultRolePermissions('editor')
  });
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminActionMsg, setAdminActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [adminFormError, setAdminFormError] = useState<string | null>(null);
  const [userCheckStatus, setUserCheckStatus] = useState<'idle' | 'checking' | 'registered' | 'not-registered'>('idle');
  const [registeredUserInfo, setRegisteredUserInfo] = useState<{ name?: string; uid?: string } | null>(null);

  // Dedicated Admin Passwords & Visibility States
  const [showAdminFormPass, setShowAdminFormPass] = useState(false);
  const [showAdminTablePasswords, setShowAdminTablePasswords] = useState<Record<string, boolean>>({});
  const [showRequestedPasswords, setShowRequestedPasswords] = useState<Record<string, boolean>>({});

  // Super Admin check
  const isSuperAdminUser =
    currentUser?.uid === 'CopR7FgKjGeBkeWwIysygHvswwv1' ||
    currentUser?.uid === 'cOpR7FgKjGeBkeWwIysygHvswwv1' ||
    currentUser?.uid === ADMIN_UID ||
    (currentUser?.email && currentUser.email.toLowerCase() === (BUSINESS_EMAIL || 'tamimnur908@gmail.com').toLowerCase());

  const currentAdminProfile = admins.find(
    (a) =>
      a.uid === currentUser?.uid ||
      (currentUser?.email && a.email.toLowerCase() === currentUser.email.toLowerCase())
  );

  // Admin Security Password Gate (Unlocked for Super Admin, requires passkey for other admins)
  const [isGateUnlocked, setIsGateUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('eagle_admin_unlocked_' + (currentUser?.uid || 'guest')) === 'true';
  });
  const [gatePasswordInput, setGatePasswordInput] = useState('');
  const [showGatePassword, setShowGatePassword] = useState(false);
  const [gatePasswordError, setGatePasswordError] = useState<string | null>(null);

  // Staff Admin Password Change Request Modal
  const [isPassChangeModalOpen, setIsPassChangeModalOpen] = useState(false);
  const [newRequestedPassInput, setNewRequestedPassInput] = useState('');
  const [showNewRequestedPass, setShowNewRequestedPass] = useState(false);
  const [passRequestSubmitting, setPassRequestSubmitting] = useState(false);
  const [passRequestMsg, setPassRequestMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notification Recipient Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    leadRecipientEmails: [DEFAULT_RECIPIENT_EMAIL]
  });
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [newRecipientInput, setNewRecipientInput] = useState('');
  const [notificationSaving, setNotificationSaving] = useState(false);

  // Meeting Scheduling Modal State
  const [selectedLeadForMeeting, setSelectedLeadForMeeting] = useState<Lead | null>(null);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('16:00');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/');
  const [meetingHost, setMeetingHost] = useState('Eagle Eye Digital Strategist');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [isMeetingSubmitting, setIsMeetingSubmitting] = useState(false);

  // Leads Filter & Search State
  const [leadsFilter, setLeadsFilter] = useState<'all' | 'new' | 'scheduled' | 'confirmed' | 'cancelled' | 'archived'>('all');
  const [leadsSearch, setLeadsSearch] = useState('');
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);

  const handleCopyMeetingLink = (leadId: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLeadId(leadId);
    setTimeout(() => setCopiedLeadId(null), 2500);
  };

  const formatDateTime = (dateVal?: string | number) => {
    if (!dateVal) return 'Not set';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(dateVal);
    }
  };

  // Global Dynamic Site Settings & Header/Footer Context
  const {
    settings: globalSiteSettings,
    headerConfig: globalHeaderConfig,
    footerConfig: globalFooterConfig,
    socialLinks: globalSocialLinks,
    saveSettings: persistSiteSettings
  } = useSettings();

  // Site Settings Form State
  const [siteForm, setSiteForm] = useState<SiteSettings>(globalSiteSettings || defaultSiteSettings);
  const [siteSettingsSaved, setSiteSettingsSaved] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const logoFileInputRef = React.useRef<HTMLInputElement>(null);

  // Full Website Live Preview State
  const [isLiveWebPreviewOpen, setIsLiveWebPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'laptop' | 'tablet' | 'phone'>('laptop');
  const [webPreviewDevice, setWebPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewMobileNavOpen, setPreviewMobileNavOpen] = useState(false);
  // Side Panel Preview Mode: 'section' (focused component default) vs 'full' (complete website)
  const [sidePreviewScope, setSidePreviewScope] = useState<'section' | 'full'>('section');

  const handleToggleSideFullPreview = () => {
    setSidePreviewScope((prev) => (prev === 'full' ? 'section' : 'full'));
    const el = document.getElementById('admin-side-preview-pane');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  useEffect(() => {
    if (globalSiteSettings) {
      setSiteForm(globalSiteSettings);
    }
  }, [globalSiteSettings]);

  // Header, Footer & Social Sub-tabs
  const [headerFooterActiveTab, setHeaderFooterActiveTab] = useState<'social' | 'header' | 'footer'>('social');

  // Header Config Form State
  const [headerForm, setHeaderForm] = useState<HeaderConfig>(globalHeaderConfig || defaultHeaderConfig);
  const [headerSaved, setHeaderSaved] = useState(false);
  const [newNavLink, setNewNavLink] = useState({ label: '', path: '' });

  useEffect(() => {
    if (globalHeaderConfig) {
      setHeaderForm(globalHeaderConfig);
    }
  }, [globalHeaderConfig]);

  // Footer Config Form State
  const [footerForm, setFooterForm] = useState<FooterConfig>(globalFooterConfig || defaultFooterConfig);
  const [footerSaved, setFooterSaved] = useState(false);
  const [newServiceLink, setNewServiceLink] = useState({ label: '', path: '/services' });
  const [newResourceLink, setNewResourceLink] = useState({ label: '', path: '/products' });

  useEffect(() => {
    if (globalFooterConfig) {
      setFooterForm(globalFooterConfig);
    }
  }, [globalFooterConfig]);

  // Social Media Manager State
  const [socialList, setSocialList] = useState<SocialLink[]>(globalSocialLinks || defaultSocialLinks);
  const [socialSaved, setSocialSaved] = useState(false);
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [newSocialForm, setNewSocialForm] = useState<Partial<SocialLink>>({
    platform: '',
    url: '',
    iconKey: 'facebook',
    isActive: true,
    showInHeader: false,
    showInFooter: true,
    showInFloatingSidebar: true,
  });

  useEffect(() => {
    if (globalSocialLinks) {
      setSocialList(globalSocialLinks);
    }
  }, [globalSocialLinks]);

  // Handler: Save Site Settings
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistSiteSettings(siteForm);
    setSiteSettingsSaved(true);
    setTimeout(() => setSiteSettingsSaved(false), 3000);
  };

  // Handler: Logo file upload
  const handleLogoUpload = (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo file size should be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSiteForm((prev) => ({ ...prev, logoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handler: Save Header Settings
  const handleSaveHeaderConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistSiteSettings({ headerConfig: headerForm });
    setHeaderSaved(true);
    setTimeout(() => setHeaderSaved(false), 3000);
  };

  // Handler: Add Nav Link
  const handleAddNavLink = () => {
    if (!newNavLink.label.trim() || !newNavLink.path.trim()) {
      alert('Please enter both navigation label and link path.');
      return;
    }
    setHeaderForm((prev) => ({
      ...prev,
      navLinks: [...(prev.navLinks || []), { label: newNavLink.label.trim(), path: newNavLink.path.trim() }]
    }));
    setNewNavLink({ label: '', path: '' });
  };

  // Handler: Remove Nav Link
  const handleRemoveNavLink = (index: number) => {
    setHeaderForm((prev) => ({
      ...prev,
      navLinks: prev.navLinks.filter((_, i) => i !== index)
    }));
  };

  // Handler: Save Footer Settings
  const handleSaveFooterConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistSiteSettings({ footerConfig: footerForm });
    setFooterSaved(true);
    setTimeout(() => setFooterSaved(false), 3000);
  };

  // Handler: Add Service Link in Footer
  const handleAddServiceLink = () => {
    if (!newServiceLink.label.trim() || !newServiceLink.path.trim()) return;
    setFooterForm((prev) => ({
      ...prev,
      servicesLinks: [...(prev.servicesLinks || []), { ...newServiceLink }]
    }));
    setNewServiceLink({ label: '', path: '/services' });
  };

  // Handler: Remove Service Link in Footer
  const handleRemoveServiceLink = (index: number) => {
    setFooterForm((prev) => ({
      ...prev,
      servicesLinks: prev.servicesLinks.filter((_, i) => i !== index)
    }));
  };

  // Handler: Add Resource Link in Footer
  const handleAddResourceLink = () => {
    if (!newResourceLink.label.trim() || !newResourceLink.path.trim()) return;
    setFooterForm((prev) => ({
      ...prev,
      resourcesLinks: [...(prev.resourcesLinks || []), { ...newResourceLink }]
    }));
    setNewResourceLink({ label: '', path: '/products' });
  };

  // Handler: Remove Resource Link in Footer
  const handleRemoveResourceLink = (index: number) => {
    setFooterForm((prev) => ({
      ...prev,
      resourcesLinks: prev.resourcesLinks.filter((_, i) => i !== index)
    }));
  };

  // Handler: Save Social Links
  const handleSaveSocialLinks = async (updatedList?: SocialLink[]) => {
    const listToSave = updatedList || socialList;
    await persistSiteSettings({ socialLinks: listToSave });
    setSocialSaved(true);
    setTimeout(() => setSocialSaved(false), 3000);
  };

  // Handler: Add Custom Social Media
  const handleAddNewSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocialForm.platform?.trim() || !newSocialForm.url?.trim()) {
      alert('Please enter platform name and URL.');
      return;
    }
    const newLink: SocialLink = {
      id: 'social-' + Date.now(),
      platform: newSocialForm.platform.trim(),
      url: newSocialForm.url.trim(),
      iconKey: newSocialForm.iconKey || 'globe',
      customIconUrl: newSocialForm.customIconUrl?.trim() || '',
      isActive: newSocialForm.isActive ?? true,
      showInHeader: newSocialForm.showInHeader ?? false,
      showInFooter: newSocialForm.showInFooter ?? true,
      showInFloatingSidebar: newSocialForm.showInFloatingSidebar ?? true,
    };
    const updated = [...socialList, newLink];
    setSocialList(updated);
    handleSaveSocialLinks(updated);
    setIsAddingSocial(false);
    setNewSocialForm({
      platform: '',
      url: '',
      iconKey: 'facebook',
      isActive: true,
      showInHeader: false,
      showInFooter: true,
      showInFloatingSidebar: true,
    });
  };

  // Handler: Delete Social Link
  const handleDeleteSocial = (id: string) => {
    if (confirm('Delete this social media item?')) {
      const updated = socialList.filter((s) => s.id !== id);
      setSocialList(updated);
      handleSaveSocialLinks(updated);
    }
  };

  // Handler: Toggle Social Active
  const handleToggleSocialActive = (id: string) => {
    const updated = socialList.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    setSocialList(updated);
  };

  // Handler: Toggle Social Placement
  const handleToggleSocialPlacement = (id: string, placement: 'header' | 'footer' | 'sidebar') => {
    const updated = socialList.map((s) => {
      if (s.id !== id) return s;
      if (placement === 'header') return { ...s, showInHeader: !s.showInHeader };
      if (placement === 'footer') return { ...s, showInFooter: !s.showInFooter };
      if (placement === 'sidebar') return { ...s, showInFloatingSidebar: !s.showInFloatingSidebar };
      return s;
    });
    setSocialList(updated);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [bData, sData, pData, cData, lData, oData, aData, nData] = await Promise.all([
        getBentoConfig().catch(() => defaultBentoConfig),
        getAllServices().catch(() => []),
        getAllProducts().catch(() => []),
        getAllCategories().catch(() => []),
        getAllLeads().catch(() => []),
        getAllOrders().catch(() => []),
        getAllAdmins().catch(() => []),
        getNotificationSettings().catch(() => ({ leadRecipientEmails: [DEFAULT_RECIPIENT_EMAIL] }))
      ]);
      setBentoForm(bData);
      setServices(sData);
      setProducts(pData);
      setCategories(cData);
      setLeads(lData);
      setOrders(oData);
      setAdmins(aData);
      setNotificationSettings(nData);
    } catch (err) {
      console.error('Failed to load admin collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Verifying administrator credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Access Denied: Administrator Only</h2>
        <p className="text-xs text-slate-500">
          This console requires verified administrator permissions.
        </p>
        <Link to="/account" className="inline-block px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-sm">
          Sign In as Admin
        </Link>
      </div>
    );
  }

  // Check Admin Security Password Gate
  // If user is not the permanent Super Admin, and they have an adminPassword assigned,
  // they must enter the password assigned by Super Admin to unlock the console.
  const isSessionUnlocked = isSuperAdminUser || isGateUnlocked || !currentAdminProfile?.adminPassword;

  if (!isSessionUnlocked && currentAdminProfile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200/90 shadow-2xl rounded-3xl max-w-md w-full p-8 text-center space-y-5 animate-in fade-in zoom-in duration-150">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block mb-1">
              Admin Access Verification
            </span>
            <h2 className="text-xl font-black text-slate-900">
              Enter Admin Security Password
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              স্বাগতম, <strong>{currentAdminProfile.name}</strong> ({currentAdminProfile.email})। অ্যাডমিন প্যানেলে ঢুকতে সুপার অ্যাডমিন কর্তৃক প্রদত্ত পাসওয়ার্ডটি দিন।
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                gatePasswordInput.trim() === currentAdminProfile.adminPassword?.trim()
              ) {
                sessionStorage.setItem(
                  'eagle_admin_unlocked_' + (currentUser?.uid || 'guest'),
                  'true'
                );
                setIsGateUnlocked(true);
                setGatePasswordError(null);
              } else {
                setGatePasswordError(
                  'ভুল পাসওয়ার্ড! সুপার অ্যাডমিন কর্তৃক প্রদত্ত সঠিক পাসওয়ার্ডটি লিখুন।'
                );
              }
            }}
            className="space-y-4 text-left"
          >
            {gatePasswordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{gatePasswordError}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">
                Admin Panel Security Password *
              </label>
              <div className="relative">
                <input
                  type={showGatePassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your security password..."
                  value={gatePasswordInput}
                  onChange={(e) => {
                    setGatePasswordInput(e.target.value);
                    setGatePasswordError(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowGatePassword(!showGatePassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showGatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Panel (প্যানেলে প্রবেশ করুন)</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-slate-400 hover:text-slate-600 font-semibold"
            >
              Sign Out
            </button>
            <span className="text-[11px] text-slate-400">
              Role: <strong className="capitalize text-slate-700">{currentAdminProfile.role}</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Real-time Stats
  const totalProductsCount = products.length;
  const verifiedRevenue = orders
    .filter((o) => o.paymentStatus === 'verified')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.paymentStatus === 'pending').length;
  const activeCategoriesCount = categories.length || 1;

  // Notification Recipient Handlers
  const handleAddRecipientEmail = async () => {
    const email = newRecipientInput.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    const currentList = notificationSettings.leadRecipientEmails || [];
    if (currentList.includes(email)) {
      alert('This email is already added to recipients.');
      return;
    }
    const updated = [...currentList, email];
    setNotificationSaving(true);
    try {
      await saveNotificationSettings({ leadRecipientEmails: updated });
      setNotificationSettings({ leadRecipientEmails: updated });
      setNewRecipientInput('');
    } finally {
      setNotificationSaving(false);
    }
  };

  const handleRemoveRecipientEmail = async (emailToRemove: string) => {
    const updated = (notificationSettings.leadRecipientEmails || []).filter((e) => e !== emailToRemove);
    setNotificationSaving(true);
    try {
      await saveNotificationSettings({ leadRecipientEmails: updated });
      setNotificationSettings({ leadRecipientEmails: updated });
    } finally {
      setNotificationSaving(false);
    }
  };

  const handleClearAllRecipients = async () => {
    if (window.confirm('Remove all notification recipient emails? No emails will be sent when new leads are submitted.')) {
      setNotificationSaving(true);
      try {
        await saveNotificationSettings({ leadRecipientEmails: [] });
        setNotificationSettings({ leadRecipientEmails: [] });
      } finally {
        setNotificationSaving(false);
      }
    }
  };

  const handleRestoreDefaultRecipient = async () => {
    setNotificationSaving(true);
    try {
      await saveNotificationSettings({ leadRecipientEmails: [DEFAULT_RECIPIENT_EMAIL] });
      setNotificationSettings({ leadRecipientEmails: [DEFAULT_RECIPIENT_EMAIL] });
    } finally {
      setNotificationSaving(false);
    }
  };

  // Meeting Modal Handlers
  const handleOpenMeetingModal = (lead: Lead) => {
    setSelectedLeadForMeeting(lead);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setMeetingDate(tomorrow.toISOString().split('T')[0]);
    setMeetingTime('16:00');
    if (lead.meetingDetails?.scheduledTime) {
      const dt = new Date(lead.meetingDetails.scheduledTime);
      setMeetingDate(dt.toISOString().split('T')[0]);
      setMeetingTime(dt.toTimeString().substring(0, 5));
    }
    setMeetingLink(lead.meetingDetails?.meetingLink || 'https://meet.google.com/');
    setMeetingHost(lead.meetingDetails?.scheduledBy || currentUser?.displayName || currentUser?.email || 'Eagle Eye Digital Strategist');
    setMeetingNotes(lead.meetingDetails?.notes || '');
  };

  const handleSaveMeetingSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForMeeting) return;
    if (!meetingDate || !meetingTime || !meetingLink.trim()) {
      alert('Please fill out meeting date, time, and link.');
      return;
    }

    setIsMeetingSubmitting(true);
    try {
      const combinedDateTime = `${meetingDate}T${meetingTime}:00`;
      await updateLeadMeeting(selectedLeadForMeeting.id, {
        scheduledTime: combinedDateTime,
        meetingLink: meetingLink.trim(),
        scheduledBy: meetingHost.trim() || 'Admin Strategist',
        meetingStatus: 'proposed',
        notes: meetingNotes.trim()
      });

      setSelectedLeadForMeeting(null);
      await loadData();
      alert('Meeting scheduled! Invitation email dispatched to client.');
    } catch (err: any) {
      alert('Failed to schedule meeting: ' + (err.message || 'Unknown error'));
    } finally {
      setIsMeetingSubmitting(false);
    }
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (window.confirm(`Delete inquiry from "${lead.name}"?`)) {
      await deleteLead(lead.id);
      await loadData();
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    await updateLeadStatus(leadId, newStatus);
    await loadData();
  };

  // Leads & Consultation Pipeline Stats
  const leadStats = {
    total: leads.length,
    newCount: leads.filter((l) => l.status === 'New').length,
    scheduledCount: leads.filter((l) => l.status === 'Meeting Scheduled' || l.meetingDetails?.meetingStatus === 'proposed').length,
    confirmedCount: leads.filter((l) => l.status === 'Meeting Confirmed' || l.meetingDetails?.meetingStatus === 'confirmed').length,
    cancelledCount: leads.filter((l) => l.status === 'Meeting Cancelled' || l.meetingDetails?.meetingStatus === 'cancelled' || l.status === 'Lost').length,
    completedCount: leads.filter((l) => l.status === 'Won' || l.meetingDetails?.meetingStatus === 'completed').length,
  };

  // Filtered Leads for Inquiries Tab & Dashboard
  const filteredLeads = leads.filter((lead) => {
    const q = leadsSearch.toLowerCase().trim();
    const matchesSearch = !q || (
      (lead.name || '').toLowerCase().includes(q) ||
      (lead.email || '').toLowerCase().includes(q) ||
      (lead.phoneOrWhatsApp || '').toLowerCase().includes(q) ||
      (lead.businessName || '').toLowerCase().includes(q) ||
      (lead.serviceInterest || '').toLowerCase().includes(q) ||
      (lead.projectDescription || '').toLowerCase().includes(q)
    );

    if (!matchesSearch) return false;

    if (leadsFilter === 'all') return true;
    if (leadsFilter === 'new') return lead.status === 'New';
    if (leadsFilter === 'scheduled') {
      return lead.status === 'Meeting Scheduled' || lead.meetingDetails?.meetingStatus === 'proposed';
    }
    if (leadsFilter === 'confirmed') {
      return lead.status === 'Meeting Confirmed' || lead.meetingDetails?.meetingStatus === 'confirmed';
    }
    if (leadsFilter === 'cancelled') {
      return lead.status === 'Meeting Cancelled' || lead.meetingDetails?.meetingStatus === 'cancelled' || lead.status === 'Lost';
    }
    if (leadsFilter === 'archived') {
      return lead.status === 'Won' || lead.status === 'Lost' || lead.meetingDetails?.meetingStatus === 'completed';
    }
    return true;
  });

  const upcomingConsultations = leads
    .filter((l) => Boolean(l.meetingDetails?.scheduledTime))
    .sort((a, b) => {
      const timeA = new Date(a.meetingDetails?.scheduledTime || 0).getTime();
      const timeB = new Date(b.meetingDetails?.scheduledTime || 0).getTime();
      return timeA - timeB;
    });

  // Filtered Products for List Table
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Submit Product Form
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.slug) {
      alert('Please enter Product Title and Slug.');
      return;
    }

    const payload: Partial<DigitalProduct> = {
      ...prodForm,
      price: prodForm.isFree ? 0 : Number(prodForm.price) || 0,
      salePrice: prodForm.isFree ? 0 : Number(prodForm.salePrice) || 0,
      downloadableFileUrl: prodForm.googleDriveLink || prodForm.downloadableFileUrl || '',
      updatedAt: Date.now()
    };

    await saveProduct(payload);
    setProductViewMode('list');
    loadData();
  };

  // Submit Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatSlug.trim()) {
      alert('Please enter Category Name and Slug.');
      return;
    }
    await saveCategory({
      ...(editingCategoryId ? { id: editingCategoryId } : {}),
      name: newCatName.trim(),
      slug: newCatSlug.trim(),
      iconUrl: newCatIcon.trim(),
      displayOrder: Number(newCatOrder) || 0,
      description: newCatDesc.trim()
    });
    handleCancelEditCategory();
    loadData();
  };

  const handleStartEditCategory = (c: ProductCategory) => {
    setEditingCategoryId(c.id);
    setNewCatName(c.name);
    setNewCatSlug(c.slug);
    setNewCatIcon(c.iconUrl || '');
    setNewCatOrder(c.displayOrder ?? 0);
    setNewCatDesc(c.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setNewCatName('');
    setNewCatSlug('');
    setNewCatIcon('');
    setNewCatOrder(0);
    setNewCatDesc('');
  };

  const handleDeleteCategory = async (c: ProductCategory) => {
    if (window.confirm(`Delete category "${c.name}"?`)) {
      await deleteCategory(c.id);
      if (editingCategoryId === c.id) {
        handleCancelEditCategory();
      }
      loadData();
    }
  };

  const handleCategoryFileUpload = (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size should be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewCatIcon(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Custom Item Type with + icon
  const handleAddCustomType = () => {
    const trimmed = newCustomTypeName.trim();
    if (!trimmed) return;
    if (!customTypes.includes(trimmed)) {
      setCustomTypes((prev) => [...prev, trimmed]);
    }
    setProdForm((prev) => ({
      ...prev,
      productType: trimmed,
      customDownloadBtnText: `Download ${trimmed}`
    }));
    setNewCustomTypeName('');
    setIsAddingCustomType(false);
  };

  // Quick Add Category from Product Form
  const handleQuickAddCategory = async () => {
    const trimmed = quickCategoryName.trim();
    if (!trimmed) {
      alert('অনুগ্রহ করে ক্যাটাগরির নাম লিখুন।');
      return;
    }
    const slug = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    try {
      await saveCategory({
        name: trimmed,
        slug,
        displayOrder: categories.length
      });
      const updated = await getAllCategories().catch(() => []);
      setCategories(updated);
      setProdForm((prev) => ({ ...prev, category: trimmed }));
      setQuickCategoryName('');
      setIsAddingQuickCategory(false);
    } catch (err) {
      console.error('Failed to quick add category:', err);
      const newCat: ProductCategory = {
        id: 'cat_' + Date.now(),
        name: trimmed,
        slug,
        displayOrder: categories.length
      };
      setCategories((prev) => [...prev, newCat]);
      setProdForm((prev) => ({ ...prev, category: trimmed }));
      setQuickCategoryName('');
      setIsAddingQuickCategory(false);
    }
  };

  // Product Image File Upload (Local file / Drag-and-Drop)
  const handleProductFileUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size should be under 10MB.');
      return;
    }
    setImageUploadStatus('Loading photo...');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProdForm((prev) => ({ ...prev, thumbnailUrl: reader.result as string }));
        setImageUploadStatus(null);
      }
    };
    reader.onerror = () => {
      alert('Failed to process image file.');
      setImageUploadStatus(null);
    };
    reader.readAsDataURL(file);
  };

  // Product Image Clipboard Paste Handler (Ctrl + V)
  const handleProductImagePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleProductFileUpload(file);
            return;
          }
        }
      }
    }
    const text = e.clipboardData?.getData('text');
    if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
      setProdForm((prev) => ({ ...prev, thumbnailUrl: text.trim() }));
    }
  };

  // Paste from Clipboard Button
  const handlePasteFromClipboardBtn = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((type) => type.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], 'pasted-image.png', { type: imageType });
            handleProductFileUpload(file);
            return;
          }
        }
      }
      const text = await navigator.clipboard.readText();
      if (text && (text.startsWith('http') || text.startsWith('data:image'))) {
        setProdForm((prev) => ({ ...prev, thumbnailUrl: text.trim() }));
        return;
      }
      alert('Clipboard-এ কোনো ছবি বা ইমেজ লিংক পাওয়া যায়নি। ছবি কপি করে এখানে Ctrl + V চাপুন।');
    } catch (err) {
      alert('ছবিটি কপি করে এই বক্সে Ctrl + V চাপুন, স্বয়ংক্রিয়ভাবে অ্যাড হয়ে যাবে!');
    }
  };

  // Submit Service
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.slug) return;
    await saveService(serviceForm);
    setIsServiceModalOpen(false);
    loadData();
  };

  // Submit Bento
  const handleSaveBento = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveBentoConfig(bentoForm);
    setBentoSaved(true);
    setTimeout(() => setBentoSaved(false), 3000);
  };

  // Hero Slide File Upload
  const handleNewSlideFileUpload = (file?: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('File size should be under 8MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewSlideImg(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartEditSlide = (slide: HeroSlide, index: number) => {
    setEditingSlideIndex(index);
    setNewSlideImg(slide.bgImage || '');
    setNewSlideTitle(slide.title || '');
    setNewSlideLink(slide.btn1Link || '/products');
    setNewSlideIsPureBanner(slide.isPureBanner !== undefined ? slide.isPureBanner : (slide.visualType === 'pure-banner'));
    setNewSlideTextAnimation(slide.textAnimation || 'typewriter');
    setNewSlideTextSpeed(slide.textAnimationSpeed || 'normal');
    setNewSlideVisualType(slide.visualType || (slide.isPureBanner ? 'pure-banner' : slide.image3D ? 'image' : '3d'));
    setNewSlideBadge1(slide.badge1Text || 'Instant Deploy');
    setNewSlideBadgeCenter(slide.badgeCenterText || 'Verified 4K');
    setNewSlideBadge2(slide.badge2Text || '4.9/5 Rating');
    setNewSlideImage3D(slide.image3D || '');
    setNewSlideTerminalText(slide.terminalText || 'deploy --mode=scale');
    setPreviewFocusUploaded(true);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleCancelEditSlide = () => {
    setEditingSlideIndex(null);
    setNewSlideImg('');
    setNewSlideTitle('');
    setNewSlideLink('/products');
    setNewSlideIsPureBanner(false);
    setNewSlideTextAnimation('typewriter');
    setNewSlideTextSpeed('normal');
    setNewSlideVisualType('3d');
    setNewSlideBadge1('Instant Deploy');
    setNewSlideBadgeCenter('Verified 4K');
    setNewSlideBadge2('4.9/5 Rating');
    setNewSlideImage3D('');
    setNewSlideTerminalText('deploy --mode=scale');
    setPreviewFocusUploaded(false);
  };

  // Clear demo placeholder slides and leave only custom uploads
  const handleClearDemoSlides = async () => {
    if (confirm('Delete demo placeholder banners and keep only your uploaded banners?')) {
      const currentSlides = (bentoForm.heroSlides && bentoForm.heroSlides.length > 0
        ? bentoForm.heroSlides
        : defaultHeroSlides);
      const filtered = currentSlides.filter(
        (s) => s.bgImage && !s.id.startsWith('slide-1') && !s.id.startsWith('slide-2') && !s.id.startsWith('slide-3')
      );
      const updatedBento = { ...bentoForm, heroSlides: filtered };
      setBentoForm(updatedBento);
      await saveBentoConfig(updatedBento);
      setPreviewSlideIndex(0);
      setBentoSaved(true);
      setTimeout(() => setBentoSaved(false), 3000);
    }
  };

  // Add or Update Hero Slide Action
  const handleCreateHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideImg.trim()) {
      alert('Slide image is required. Please choose an image or enter an image URL.');
      return;
    }

    const existingSlides = bentoForm.heroSlides || [];
    const hasOnlyDemoSlides =
      existingSlides.length === 0 ||
      existingSlides.every(
        (s) => !s.bgImage || s.id.startsWith('slide-1') || s.id.startsWith('slide-2') || s.id.startsWith('slide-3')
      );

    const isPure = newSlideVisualType === 'pure-banner' || newSlideIsPureBanner;

    const newSlide: HeroSlide = {
      id: 'slide-' + Date.now(),
      tag: 'Featured Highlight',
      title: isPure ? '' : (newSlideTitle.trim() || 'Premium Digital Products for Smart Buyers'),
      description: isPure ? '' : 'Explore verified digital tools, agency retainers, and graphic vault.',
      btn1Text: 'Browse Store',
      btn1Link: newSlideLink.trim() || '/products',
      btn2Text: 'Agency Services',
      btn2Link: '/services',
      bgImage: newSlideImg.trim(),
      image3D: newSlideVisualType === 'image' ? (newSlideImage3D.trim() || newSlideImg.trim()) : '',
      isPureBanner: isPure,
      textAnimation: newSlideTextAnimation,
      textAnimationSpeed: newSlideTextSpeed,
      visualType: newSlideVisualType,
      badge1Text: newSlideBadge1.trim() || 'Instant Deploy',
      badgeCenterText: newSlideBadgeCenter.trim() || 'Verified 4K',
      badge2Text: newSlideBadge2.trim() || '4.9/5 Rating',
      terminalText: newSlideTerminalText.trim() || 'deploy --mode=scale'
    };

    let updatedSlides: HeroSlide[] = [];
    if (editingSlideIndex !== null) {
      const currentSlides = [...(existingSlides.length > 0 ? existingSlides : defaultHeroSlides)];
      currentSlides[editingSlideIndex] = {
        ...currentSlides[editingSlideIndex],
        bgImage: newSlideImg.trim(),
        title: isPure ? '' : (newSlideTitle.trim() || currentSlides[editingSlideIndex].title),
        btn1Link: newSlideLink.trim() || '/products',
        isPureBanner: isPure,
        textAnimation: newSlideTextAnimation,
        textAnimationSpeed: newSlideTextSpeed,
        visualType: newSlideVisualType,
        badge1Text: newSlideBadge1.trim() || 'Instant Deploy',
        badgeCenterText: newSlideBadgeCenter.trim() || 'Verified 4K',
        badge2Text: newSlideBadge2.trim() || '4.9/5 Rating',
        image3D: newSlideVisualType === 'image' ? (newSlideImage3D.trim() || newSlideImg.trim()) : '',
        terminalText: newSlideTerminalText.trim() || 'deploy --mode=scale'
      };
      updatedSlides = currentSlides;
    } else if (hasOnlyDemoSlides) {
      // If only demo placeholder slides exist, let this first uploaded custom slide replace them directly!
      updatedSlides = [newSlide];
    } else {
      updatedSlides = [...existingSlides, newSlide];
    }

    const updatedBento = { ...bentoForm, heroSlides: updatedSlides };
    setBentoForm(updatedBento);
    await saveBentoConfig(updatedBento);
    handleCancelEditSlide();
    setBentoSaved(true);
    setTimeout(() => setBentoSaved(false), 3000);
  };

  const handleDeleteHeroSlide = async (index: number) => {
    if (confirm('Delete this slider banner?')) {
      const currentSlides = [...(bentoForm.heroSlides && bentoForm.heroSlides.length > 0 ? bentoForm.heroSlides : defaultHeroSlides)];
      currentSlides.splice(index, 1);
      const updatedBento = { ...bentoForm, heroSlides: currentSlides };
      setBentoForm(updatedBento);
      await saveBentoConfig(updatedBento);
    }
  };

  // Side Poster File Upload
  const handleNewPosterFileUpload = (file?: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('File size should be under 8MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPosterImg(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Side Promo Poster to Selected Slot
  const handleSaveSidePoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosterImg.trim()) {
      alert('Poster image is required. Please choose an image or enter an image URL.');
      return;
    }
    let updatedBento = { ...bentoForm };
    if (posterSlot === 'top') {
      updatedBento = {
        ...updatedBento,
        card1Image: newPosterImg.trim(),
        card1Title: newPosterTitle.trim() || 'LinkedIn Premium Up To 90% Discount',
        card1LinkUrl: newPosterLink.trim() || '/services'
      };
    } else if (posterSlot === 'bottom-left') {
      updatedBento = {
        ...updatedBento,
        card2Image: newPosterImg.trim(),
        card2Title: newPosterTitle.trim() || 'Custom Web & Infra Engine',
        card2LinkUrl: newPosterLink.trim() || '/services'
      };
    } else if (posterSlot === 'bottom-right') {
      updatedBento = {
        ...updatedBento,
        card3Image: newPosterImg.trim(),
        card3Title: newPosterTitle.trim() || 'AI Vault & Creative Kits',
        card3LinkUrl: newPosterLink.trim() || '/products'
      };
    }
    setBentoForm(updatedBento);
    await saveBentoConfig(updatedBento);
    setNewPosterImg('');
    setNewPosterTitle('');
    setNewPosterLink('/products');
    setBentoSaved(true);
    setTimeout(() => setBentoSaved(false), 3000);
  };

  // Remove Poster from Slot
  const handleRemovePosterSlot = async (slot: 'top' | 'bottom-left' | 'bottom-right') => {
    let updatedBento = { ...bentoForm };
    if (slot === 'top') updatedBento.card1Image = '';
    if (slot === 'bottom-left') updatedBento.card2Image = '';
    if (slot === 'bottom-right') updatedBento.card3Image = '';
    setBentoForm(updatedBento);
    await saveBentoConfig(updatedBento);
  };

  // ================= ADMIN & ROLES MANAGEMENT HANDLERS =================
  const handleOpenAddAdmin = () => {
    setEditingAdminId(null);
    const generatedPass = 'EED@' + Math.floor(100000 + Math.random() * 900000);
    setAdminForm({
      name: '',
      email: '',
      role: 'editor',
      designation: '',
      phone: '',
      status: 'active',
      adminPassword: generatedPass,
      permissions: getDefaultRolePermissions('editor')
    });
    setShowAdminFormPass(true);
    setAdminFormError(null);
    setUserCheckStatus('idle');
    setRegisteredUserInfo(null);
    setAdminActionMsg(null);
    setIsAdminModalOpen(true);
  };

  const handleOpenEditAdmin = (admin: AdminUser) => {
    setEditingAdminId(admin.id);
    setAdminForm({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      designation: admin.designation || '',
      phone: admin.phone || '',
      status: admin.status || 'active',
      adminPassword: admin.adminPassword || '',
      permissions: admin.permissions || getDefaultRolePermissions(admin.role)
    });
    setShowAdminFormPass(false);
    setAdminFormError(null);
    setUserCheckStatus('registered');
    setRegisteredUserInfo({ name: admin.name, uid: admin.uid });
    setAdminActionMsg(null);
    setIsAdminModalOpen(true);
  };

  const handleCheckEmailRegistration = async (emailToCheck: string) => {
    const clean = emailToCheck.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setUserCheckStatus('idle');
      setRegisteredUserInfo(null);
      setAdminFormError(null);
      return;
    }

    setUserCheckStatus('checking');
    setAdminFormError(null);
    try {
      const user = await findRegisteredUserByEmail(clean);
      if (user) {
        setUserCheckStatus('registered');
        setRegisteredUserInfo({ name: user.fullName || user.displayName, uid: user.uid });
        if (!adminForm.name.trim() && user.fullName) {
          setAdminForm((prev) => ({ ...prev, name: user.fullName }));
        }
      } else {
        setUserCheckStatus('not-registered');
        setRegisteredUserInfo(null);
        setAdminFormError('This user must register or log in before becoming an Admin. (যাকে অ্যাডমিন বানাবেন, তাকে প্রথমে এই ওয়েবসাইটে লগইন বা সাইন-আপ করতে হবে।)');
      }
    } catch {
      setUserCheckStatus('idle');
    }
  };

  const handleRoleChangeInForm = (newRole: AdminRole) => {
    setAdminForm((prev) => ({
      ...prev,
      role: newRole,
      permissions: getDefaultRolePermissions(newRole)
    }));
  };

  const handleTogglePermission = (key: keyof AdminPermissions) => {
    setAdminForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  const handleSaveAdminForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormError(null);

    const emailClean = adminForm.email.trim().toLowerCase();
    if (!emailClean) {
      setAdminFormError('Please enter a valid Gmail / Email address.');
      return;
    }

    const passClean = adminForm.adminPassword.trim();
    if (!passClean) {
      setAdminFormError('অনুগ্রহ করে এই অ্যাডমিনের জন্য একটি সিকিউরিটি পাসওয়ার্ড নির্ধারণ করুন।');
      return;
    }

    setAdminSaving(true);
    try {
      let resolvedUid = registeredUserInfo?.uid;
      if (!resolvedUid) {
        const regUser = await findRegisteredUserByEmail(emailClean);
        if (regUser) {
          resolvedUid = regUser.uid;
        }
      }

      if (!editingAdminId && !resolvedUid) {
        setAdminSaving(false);
        setUserCheckStatus('not-registered');
        setAdminFormError('This user must register or log in before becoming an Admin. (এই ইউজার এখনো ওয়েবসাইটে সাইন-ইন বা লগইন করেননি। অ্যাডমিন দেওয়ার পূর্বে তাকে ওয়েবসাইটে একবার লগইন করতে হবে।)');
        return;
      }

      await saveAdmin({
        ...(editingAdminId ? { id: editingAdminId } : (resolvedUid ? { id: resolvedUid } : {})),
        ...(resolvedUid ? { uid: resolvedUid } : {}),
        name: adminForm.name.trim() || emailClean.split('@')[0],
        email: emailClean,
        role: adminForm.role,
        designation: adminForm.designation.trim(),
        phone: adminForm.phone.trim(),
        status: adminForm.status,
        adminPassword: passClean,
        permissions: adminForm.permissions,
        addedBy: currentUser?.email || 'Admin'
      });

      await loadData();
      await refreshAdminStatus();
      setIsAdminModalOpen(false);
      setAdminActionMsg({
        type: 'success',
        text: `অ্যাডমিন ${adminForm.name || emailClean} (${adminForm.role.toUpperCase()}) সফলভাবে পাসওয়ার্ডসহ সংরক্ষণ করা হয়েছে!`
      });
      setTimeout(() => setAdminActionMsg(null), 5000);
    } catch (err: any) {
      setAdminFormError(err.message || 'অ্যাডমিন সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setAdminSaving(false);
    }
  };

  // Super Admin Password Approval Handlers
  const handleApprovePassword = async (adminId: string, adminName: string) => {
    if (!confirm(`${adminName}-এর নতুন পাসওয়ার্ড কি অনুমোদন (Approve) করতে চান?`)) return;
    try {
      await approveAdminPasswordChange(adminId);
      await loadData();
      setAdminActionMsg({
        type: 'success',
        text: `${adminName}-এর নতুন পাসওয়ার্ড সফলভাবে অনুমোদন করা হয়েছে!`
      });
      setTimeout(() => setAdminActionMsg(null), 5000);
    } catch (err: any) {
      alert('অনুমোদন ব্যর্থ হয়েছে: ' + (err.message || 'ত্রুটি'));
    }
  };

  const handleRejectPassword = async (adminId: string, adminName: string) => {
    if (!confirm(`${adminName}-এর পাসওয়ার্ড পরিবর্তনের আবেদন বাতিল (Reject) করবেন?`)) return;
    try {
      await rejectAdminPasswordChange(adminId);
      await loadData();
      setAdminActionMsg({
        type: 'success',
        text: `${adminName}-এর পাসওয়ার্ড পরিবর্তনের আবেদন বাতিল করা হয়েছে।`
      });
      setTimeout(() => setAdminActionMsg(null), 5000);
    } catch (err: any) {
      alert('বাতিল করতে ব্যর্থ হয়েছে: ' + (err.message || 'ত্রুটি'));
    }
  };

  // Staff Admin Password Change Request Handler
  const handleRequestOwnPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const pass = newRequestedPassInput.trim();
    if (!pass) {
      setPassRequestMsg({ type: 'error', text: 'অনুগ্রহ করে নতুন পাসওয়ার্ডটি লিখুন।' });
      return;
    }
    if (pass.length < 4) {
      setPassRequestMsg({ type: 'error', text: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' });
      return;
    }
    if (!currentAdminProfile?.id) {
      setPassRequestMsg({ type: 'error', text: 'অ্যাডমিন প্রোফাইল পাওয়া যায়নি।' });
      return;
    }
    setPassRequestSubmitting(true);
    try {
      await requestAdminPasswordChange(currentAdminProfile.id, pass);
      await loadData();
      setPassRequestMsg({
        type: 'success',
        text: 'পাসওয়ার্ড পরিবর্তনের আবেদন সুপার অ্যাডমিনের কাছে পাঠানো হয়েছে! সুপার অ্যাডমিন অনুমোদন দিলে এটি পরিবর্তন হবে।'
      });
      setTimeout(() => {
        setIsPassChangeModalOpen(false);
        setPassRequestMsg(null);
        setNewRequestedPassInput('');
      }, 3500);
    } catch (err: any) {
      setPassRequestMsg({ type: 'error', text: err.message || 'আবেদন পাঠাতে সমস্যা হয়েছে।' });
    } finally {
      setPassRequestSubmitting(false);
    }
  };

  const handleQuickRoleChange = async (admin: AdminUser, newRole: AdminRole) => {
    const isPrimary =
      admin.id === 'primary-owner' ||
      admin.uid === ADMIN_UID ||
      admin.email.toLowerCase() === (BUSINESS_EMAIL || 'tamimnur908@gmail.com').toLowerCase();

    if (isPrimary && newRole !== 'owner') {
      alert('সিস্টেমের প্রধান মালিককে (Primary Owner) ওনার রোল ব্যতীত অন্য রোলে পরিবর্তন করা যাবে না।');
      return;
    }

    if (!confirm(`${admin.name} (${admin.email})-এর রোল পরিবর্তন করে "${newRole.toUpperCase()}" করতে চান?`)) {
      return;
    }

    try {
      await saveAdmin({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: newRole,
        status: admin.status,
        permissions: getDefaultRolePermissions(newRole)
      });
      await loadData();
      await refreshAdminStatus();
      setAdminActionMsg({
        type: 'success',
        text: `${admin.name}-এর রোল "${newRole.toUpperCase()}" এ পরিবর্তন করা হয়েছে।`
      });
      setTimeout(() => setAdminActionMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'রোল আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    const isPrimary =
      admin.id === 'primary-owner' ||
      admin.uid === ADMIN_UID ||
      admin.email.toLowerCase() === (BUSINESS_EMAIL || 'tamimnur908@gmail.com').toLowerCase();

    if (isPrimary) {
      alert('প্রধান মালিকের অ্যাকাউন্ট ডিলিট করা যাবে না।');
      return;
    }

    if (currentUser?.email && currentUser.email.toLowerCase() === admin.email.toLowerCase()) {
      alert('আপনি বর্তমানে যে অ্যাকাউন্ট দিয়ে লগইন আছেন সেটি ডিলিট করতে পারবেন না।');
      return;
    }

    if (!confirm(`আপনি কি নিশ্চিত যে ${admin.name} (${admin.email})-এর অ্যাডমিন এক্সেস সম্পূর্ণরূপে বাতিল করতে চান?`)) {
      return;
    }

    try {
      await deleteAdmin(admin.id);
      await loadData();
      await refreshAdminStatus();
      setAdminActionMsg({
        type: 'success',
        text: `${admin.name}-এর অ্যাডমিন এক্সেস রিমুভ করা হয়েছে।`
      });
      setTimeout(() => setAdminActionMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'অ্যাডমিন ডিলিট করতে সমস্যা হয়েছে।');
    }
  };

  const handleToggleAdminStatus = async (admin: AdminUser) => {
    const isPrimary =
      admin.id === 'primary-owner' ||
      admin.uid === ADMIN_UID ||
      admin.email.toLowerCase() === (BUSINESS_EMAIL || 'tamimnur908@gmail.com').toLowerCase();

    if (isPrimary) {
      alert('প্রধান মালিকের অ্যাকাউন্ট স্থগিত (Suspend) করা যাবে না।');
      return;
    }

    const nextStatus = admin.status === 'active' ? 'suspended' : 'active';
    try {
      await saveAdmin({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: nextStatus,
        permissions: admin.permissions
      });
      await loadData();
      await refreshAdminStatus();
    } catch (err: any) {
      alert(err.message || 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।');
    }
  };

  const renderRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500/15 to-purple-500/15 text-amber-700 border border-amber-300">
            <Crown className="w-3 h-3 text-amber-600" />
            <span>Owner (মালিক)</span>
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Briefcase className="w-3 h-3 text-blue-600" />
            <span>Manager (ম্যানেজার)</span>
          </span>
        );
      case 'editor':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Edit3 className="w-3 h-3 text-emerald-600" />
            <span>Editor (এডিটর)</span>
          </span>
        );
      case 'viewer':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Eye className="w-3 h-3 text-slate-500" />
            <span>Viewer (সাপোর্ট)</span>
          </span>
        );
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(adminSearch.toLowerCase()) ||
      (a.designation && a.designation.toLowerCase().includes(adminSearch.toLowerCase()));
    const matchesRole = adminRoleFilter === 'all' || a.role === adminRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Interactive Live Website Preview Pane (Sticky on the right side)
  const renderInteractiveWebsitePreviewPane = () => {
    const activeHeaderSocials = socialList.filter((s) => s.isActive && s.showInHeader && s.url);
    const activeFooterSocials = socialList.filter((s) => s.isActive && s.showInFooter && s.url);
    const activeSidebarSocials = socialList.filter((s) => s.isActive && s.showInFloatingSidebar && s.url);
    const currentSlide = (bentoForm.heroSlides && bentoForm.heroSlides[previewSlideIndex]) || bentoForm.heroSlides?.[0];

    return (
      <div
        id="admin-side-preview-pane"
        className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col h-[calc(100vh-5.5rem)] max-h-[calc(100vh-5.5rem)] sticky top-2 sm:top-4 z-30 select-none"
      >
        {/* Top Control Bar: Title, Scope Switcher & Device Switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Live Preview (সাইড প্রিভিউ)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Real-time Draft Sync" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Scope Switcher: Section Only vs Full Website */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSidePreviewScope('section')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  sidePreviewScope === 'section'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="কারেন্ট সেকশন প্রিভিউ (ডিফল্ট)"
              >
                <Sliders className="w-3 h-3" />
                <span>Section Only</span>
              </button>

              <button
                type="button"
                onClick={() => setSidePreviewScope('full')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  sidePreviewScope === 'full'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="সম্পূর্ণ লাইভ ওয়েবসাইট প্রিভিউ"
              >
                <Globe className="w-3 h-3" />
                <span>Full Website</span>
              </button>
            </div>

            {/* 3 Device Options: Phone, Laptop, Tablet */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setPreviewDevice('phone')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  previewDevice === 'phone'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span className="hidden sm:inline">Phone</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('laptop')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  previewDevice === 'laptop'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Laptop className="w-3 h-3" />
                <span className="hidden sm:inline">Laptop</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  previewDevice === 'tablet'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3 h-3" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Guidance badge */}
        <div className="py-1.5 px-2 text-[10px] text-slate-400 flex items-center justify-between">
          <span className="text-amber-300 font-medium">
            💡 {sidePreviewScope === 'section' ? 'কারেন্ট সেকশন প্রিভিউ (ডিফল্ট) — ফুল ওয়েবসাইট দেখতে "Full Website" চাপুন' : 'ফুল ওয়েবসাইট প্রিভিউ — স্ক্রোল করুন ও সব লিঙ্ক লাইভ ক্লিক করুন'}
          </span>
          <span className="font-mono text-indigo-400 font-bold capitalize">
            {previewDevice === 'phone' ? '📱 Mobile Frame' : previewDevice === 'laptop' ? '💻 Widescreen' : '📟 Tablet Frame'}
          </span>
        </div>

        {/* Canvas Viewport */}
        <div className="flex-1 overflow-y-auto bg-slate-950/80 rounded-2xl border border-slate-800 p-2 sm:p-3 flex justify-center items-start">
          <div
            className={`bg-white text-slate-900 shadow-2xl transition-all duration-300 relative flex flex-col ${
              previewDevice === 'laptop'
                ? 'w-full rounded-xl overflow-hidden'
                : previewDevice === 'tablet'
                ? 'w-[520px] max-w-full rounded-2xl overflow-hidden border-4 border-slate-800'
                : 'w-[330px] max-w-full rounded-[38px] overflow-hidden border-[7px] border-slate-800 shadow-2xl'
            }`}
          >
            {/* Phone Top Notch Bar */}
            {previewDevice === 'phone' && (
              <div className="bg-slate-950 text-slate-400 px-5 pt-2 pb-1 flex items-center justify-between text-[10px] font-mono border-b border-slate-800 select-none">
                <span>9:41</span>
                <div className="w-16 h-3 bg-slate-900 rounded-full border border-slate-700/60" />
                <div className="flex items-center gap-1 text-[9px]">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* ================= CONDITION 1: SECTION-FOCUSED PREVIEW ================= */}
            {sidePreviewScope === 'section' ? (
              <div className="p-4 space-y-4 bg-slate-50 text-slate-800 text-xs">
                {/* 1.1 SITE SETTINGS SPECIFIC SECTION PREVIEW */}
                {activeMenu === 'settings' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5" />
                        Site Identity & Header Preview
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Live Sync
                      </span>
                    </div>

                    {/* Announcement Bar */}
                    {headerForm.showAnnouncement !== false && (
                      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-800 text-white px-3 py-1.5 rounded-lg text-center text-[10px] font-semibold flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-300 animate-spin-slow flex-shrink-0" />
                        <span className="truncate">{headerForm.announcementText || 'Special Offer Available'}</span>
                      </div>
                    )}

                    {/* Live Brand Navbar Card */}
                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 via-indigo-600 to-indigo-800 p-0.5 shadow-sm flex items-center justify-center">
                          {siteForm.logoUrl ? (
                            <img src={siteForm.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-md" />
                          ) : (
                            <span className="text-[9px] font-black text-white">EE</span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900 leading-none">
                            {siteForm.brandName || 'Eagle Eye Digital'}
                          </div>
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                            {siteForm.tagline || 'YOUR DIGITAL WORLD'}
                          </div>
                        </div>
                      </div>

                      {/* Chat Support WhatsApp Pill */}
                      {headerForm.showChatSupport !== false && (
                        <a
                          href={`https://wa.me/${(headerForm.chatSupportNumber || siteForm.whatsappNumber || '01836126791').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[9px] flex items-center gap-1 hover:bg-emerald-100 transition-colors shadow-2xs"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{headerForm.chatSupportText || 'Chat Support'}</span>
                        </a>
                      )}
                    </div>

                    {/* Support Coordinates Details */}
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-[11px]">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Official Helpline & Email
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Official Helpline:</span>
                        <a
                          href={`https://wa.me/${(siteForm.whatsappNumber || '01836126791').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-emerald-700 font-bold hover:underline"
                        >
                          {siteForm.whatsappNumber || '+880 1836-126791'}
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Official Email:</span>
                        <a
                          href={`mailto:${siteForm.businessEmail || 'support@eagleeyedigital.com'}`}
                          className="font-mono text-indigo-700 font-bold hover:underline truncate max-w-[180px]"
                        >
                          {siteForm.businessEmail || 'support@eagleeyedigital.com'}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1.2 HEADER, FOOTER & SOCIAL SPECIFIC SECTION PREVIEW */}
                {activeMenu === 'footer' && (
                  <div className="space-y-3">
                    {/* Subtab 1: Social Placements Preview */}
                    {headerFooterActiveTab === 'social' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            Social Presence Placements
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {socialList.filter((s) => s.isActive).length} Active
                          </span>
                        </div>

                        {/* Floating Sidebar Dock Preview */}
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                            <span>1. Sticky Floating Sidebar Dock</span>
                            <span className="text-indigo-600 font-mono">
                              {activeSidebarSocials.length} Icons
                            </span>
                          </div>
                          <div className="h-16 bg-slate-900 rounded-lg p-2 flex items-center justify-end">
                            <div className="flex gap-1.5 p-1 bg-slate-950/90 rounded-xl border border-slate-700 shadow-md">
                              {activeSidebarSocials.length > 0 ? (
                                activeSidebarSocials.map((item) => (
                                  <a
                                    key={item.id}
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={item.platform}
                                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-indigo-600 text-white flex items-center justify-center transition-all hover:scale-110"
                                  >
                                    <SocialIcon link={item} className="w-3 h-3" size={12} />
                                  </a>
                                ))
                              ) : (
                                <span className="text-[9px] text-slate-500 italic px-2">No sidebar icons selected</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Header & Footer Social Preview */}
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                            <span>2. Header & Footer Social Icons</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {activeFooterSocials.map((item) => (
                              <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                title={item.platform}
                                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-indigo-600 text-white flex items-center justify-center transition-all shadow-xs"
                              >
                                <SocialIcon link={item} className="w-3.5 h-3.5" size={14} />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subtab 2: Header & Nav Preview */}
                    {headerFooterActiveTab === 'header' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5" />
                            Header & Nav Preview
                          </span>
                        </div>

                        {/* Announcement Bar */}
                        {headerForm.showAnnouncement !== false && (
                          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-800 text-white px-3 py-1.5 rounded-lg text-center text-[10px] font-semibold flex items-center justify-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-amber-300 animate-spin-slow flex-shrink-0" />
                            <span className="truncate">{headerForm.announcementText || 'Special Offer!'}</span>
                          </div>
                        )}

                        {/* Navbar Preview */}
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-xs text-slate-900">{siteForm.brandName || 'Eagle Eye'}</div>
                            {headerForm.showChatSupport !== false && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                                {headerForm.chatSupportText || 'Chat Support'}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(headerForm.navLinks || []).map((l, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">
                                {l.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subtab 3: Footer Preview */}
                    {headerFooterActiveTab === 'footer' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            Footer Columns Preview
                          </span>
                        </div>

                        <div className="p-3 bg-slate-900 text-slate-300 rounded-xl space-y-3">
                          <div className="text-xs font-black text-white">{siteForm.brandName || 'Eagle Eye Digital'}</div>
                          <p className="text-[10px] text-slate-400 line-clamp-2">
                            {footerForm.aboutText || 'Empowering businesses worldwide.'}
                          </p>
                          <div className="pt-2 border-t border-slate-800 text-[10px] flex justify-between text-slate-500">
                            <span>{footerForm.copyrightText || '© 2026 Eagle Eye Digital.'}</span>
                            <span className="text-indigo-400">{siteForm.tagline || 'YOUR DIGITAL WORLD'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 1.3 PRODUCTS SPECIFIC SECTION PREVIEW */}
                {activeMenu === 'products' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        Live Product Card Preview
                      </span>
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                        {prodForm.productType || 'Template'}
                      </span>
                    </div>

                    {/* Product Card Mockup */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2.5 shadow-sm">
                      <div className="h-32 w-full bg-slate-100 rounded-xl overflow-hidden relative flex items-center justify-center">
                        {prodForm.thumbnailUrl ? (
                          <img src={prodForm.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-10 h-10 text-slate-300" />
                        )}
                        {prodForm.showDiscountBadge && (
                          <span className="absolute top-2 right-2 bg-rose-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm">
                            HOT SALE
                          </span>
                        )}
                        <span className="absolute bottom-2 left-2 bg-black/60 text-white font-bold text-[8px] px-2 py-0.5 rounded-md backdrop-blur-xs">
                          {prodForm.category || 'Digital'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-slate-900 leading-snug">
                          {prodForm.name || 'Sample Digital Product Title'}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                          {prodForm.shortDescription || 'High performance graphic asset and digital files ready for download.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-blue-600">
                            ৳{prodForm.salePrice || prodForm.price || 0} BDT
                          </span>
                          {prodForm.salePrice && prodForm.price && prodForm.price > prodForm.salePrice ? (
                            <span className="text-[9px] text-slate-400 line-through ml-1.5">
                              ৳{prodForm.price}
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-[10px] shadow-xs hover:bg-blue-700"
                        >
                          {prodForm.customDownloadBtnText || 'Order Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1.4 SERVICES SPECIFIC SECTION PREVIEW */}
                {activeMenu === 'services' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Live Service Card Preview
                      </span>
                      <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                        Agency Service
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-sm">
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {serviceForm.category || 'Client Service'}
                      </span>
                      <h4 className="text-sm font-black text-slate-900">
                        {serviceForm.name || 'Premium Agency Web Development'}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {serviceForm.shortDescription || 'Full bespoke delivery, custom animations, integrations, and continuous support.'}
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <a
                          href={`https://wa.me/${(siteForm.whatsappNumber || '01836126791').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10px] shadow-xs"
                        >
                          Book Strategy Call →
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1.5 HOMEPAGE SPECIFIC SECTION PREVIEW */}
                {activeMenu === 'homepage' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
                        <ImagePlus className="w-3.5 h-3.5" />
                        Hero Banner Preview
                      </span>
                    </div>

                    {/* Hero Slider Box */}
                    <div className="rounded-xl bg-slate-950 text-white p-4 relative overflow-hidden shadow-md min-h-[140px] flex flex-col justify-between">
                      {currentSlide?.bgImage && (
                        <div className="absolute inset-0 z-0">
                          <img src={currentSlide.bgImage} alt="Banner" className="w-full h-full object-cover opacity-40" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                        </div>
                      )}
                      <div className="relative z-10 space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                          {currentSlide?.tag || 'Next-Gen Solutions'}
                        </span>
                        <h4 className="text-xs font-black text-white leading-tight">
                          {currentSlide?.title || 'Empower Your Growth'}
                        </h4>
                      </div>
                      <div className="relative z-10 pt-2 flex items-center justify-between">
                        <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded">
                          {currentSlide?.btn1Text || 'Browse'}
                        </span>
                        <div className="flex items-center gap-1">
                          {(bentoForm.heroSlides || []).map((_, idx) => (
                            <div
                              key={idx}
                              className={`rounded-full ${previewSlideIndex === idx ? 'w-2.5 h-1 bg-amber-400' : 'w-1 h-1 bg-white/40'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ================= CONDITION 2: FULL SCROLLABLE WEBSITE PREVIEW ================= */
              <div className="w-full flex flex-col">
                {/* 1. Announcement Bar */}
                {headerForm.showAnnouncement !== false && (
                  <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-800 text-white px-3 py-1.5 text-center text-[10px] font-semibold flex items-center justify-center gap-1.5 leading-tight">
                    <Sparkles className="w-3 h-3 text-amber-300 animate-spin-slow flex-shrink-0" />
                    <span className="truncate">
                      {headerForm.announcementText || '⚡ SPECIAL OFFER: Empower your digital presence with Eagle Eye Digital!'}
                    </span>
                    {headerForm.announcementLink && (
                      <a
                        href={headerForm.announcementLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] underline font-bold bg-white/20 px-1.5 py-0.5 rounded ml-0.5 hover:bg-white/30"
                      >
                        View →
                      </a>
                    )}
                  </div>
                )}

                {/* 2. Navbar */}
                <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 py-2 flex items-center justify-between gap-2 shadow-xs">
                  {/* Brand Logo & Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-700 via-indigo-600 to-indigo-800 p-0.5 shadow-sm flex items-center justify-center flex-shrink-0">
                      {siteForm.logoUrl ? (
                        <img src={siteForm.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <div className="w-full h-full bg-slate-900 rounded-md flex items-center justify-center text-white font-black text-[9px]">
                          EE
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black tracking-tight text-slate-900 truncate flex items-center gap-1">
                        <span>{siteForm.brandName ? siteForm.brandName.split(' ')[0] : 'Eagle'}</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                          {siteForm.brandName ? siteForm.brandName.split(' ').slice(1).join(' ') : 'Eye Digital'}
                        </span>
                      </div>
                      <div className="text-[7px] font-extrabold tracking-widest text-slate-400 uppercase truncate">
                        {siteForm.tagline || 'YOUR DIGITAL WORLD'}
                      </div>
                    </div>
                  </div>

                  {/* Laptop Navigation Links */}
                  {previewDevice === 'laptop' && (
                    <nav className="flex items-center gap-2.5 text-[11px] font-bold text-slate-700">
                      {(headerForm.navLinks || []).slice(0, 5).map((link, idx) => (
                        <a
                          key={idx}
                          href={link.path}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-indigo-600 transition-colors py-0.5"
                        >
                          {link.label}
                        </a>
                      ))}
                    </nav>
                  )}

                  {/* Right: CTA & Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Header Social Icons (Laptop & Tablet) */}
                    {previewDevice !== 'phone' && (
                      <div className="flex items-center gap-1">
                        {activeHeaderSocials.map((item) => (
                          <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            title={item.platform}
                            className="p-1 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors"
                          >
                            <SocialIcon link={item} className="w-3 h-3" size={12} />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Chat Support WhatsApp Pill */}
                    {headerForm.showChatSupport !== false && (
                      <a
                        href={`https://wa.me/${(headerForm.chatSupportNumber || siteForm.whatsappNumber || '01836126791').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Click to test WhatsApp Link"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[9px] shadow-xs hover:bg-emerald-100 transition-all cursor-pointer"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="truncate">{headerForm.chatSupportText || 'Chat Support'}</span>
                      </a>
                    )}

                    {/* Phone Hamburger Menu Toggle */}
                    {previewDevice === 'phone' && (
                      <button
                        type="button"
                        onClick={() => setPreviewMobileNavOpen(!previewMobileNavOpen)}
                        className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Toggle Mobile Menu"
                      >
                        {previewMobileNavOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </header>

                {/* Phone Mobile Drawer Menu */}
                {previewDevice === 'phone' && previewMobileNavOpen && (
                  <div className="bg-slate-50 border-b border-slate-200 p-3 space-y-2 text-xs animate-in fade-in">
                    <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Navigation Menu</div>
                    <div className="flex flex-col gap-1.5">
                      {(headerForm.navLinks || []).map((link, idx) => (
                        <a
                          key={idx}
                          href={link.path}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-white border border-slate-200 font-semibold text-slate-800 flex items-center justify-between"
                        >
                          <span>{link.label}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </a>
                      ))}
                    </div>

                    {activeHeaderSocials.length > 0 && (
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-[9px] text-slate-400 font-bold block mb-1">Official Channels</span>
                        <div className="flex items-center gap-1.5">
                          {activeHeaderSocials.map((item) => (
                            <a
                              key={item.id}
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-white border border-slate-200 text-slate-700"
                            >
                              <SocialIcon link={item} className="w-3.5 h-3.5" size={14} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Hero Banner & Bento Section */}
                <div className="p-3 bg-slate-50 space-y-3">
                  {/* Main Slider Box */}
                  <div className="rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white p-4 relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[160px]">
                    {currentSlide?.bgImage && (
                      <div className="absolute inset-0 z-0">
                        <img
                          src={currentSlide.bgImage}
                          alt="Banner"
                          className="w-full h-full object-cover opacity-35"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                      </div>
                    )}

                    <div className="relative z-10 space-y-1">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[8px] font-black uppercase tracking-wider">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                        <span>{currentSlide?.tag || 'Premium Digital Solutions'}</span>
                      </div>
                      <h3 className="text-sm font-black text-white leading-tight line-clamp-2">
                        {previewTypedTitle || currentSlide?.title || 'Elevate Your Digital Brand with Eagle Eye'}
                      </h3>
                      <p className="text-[10px] text-slate-300 line-clamp-2">
                        {currentSlide?.description || 'Custom web systems and digital marketing for growth.'}
                      </p>
                    </div>

                    <div className="relative z-10 pt-2 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={currentSlide?.btn1Link || '/products'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[9px] shadow-xs hover:bg-amber-300 transition-colors"
                        >
                          {currentSlide?.btn1Text || 'Products'}
                        </a>
                        <a
                          href={currentSlide?.btn2Link || '/services'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white font-bold text-[9px] hover:bg-white/20 transition-colors"
                        >
                          {currentSlide?.btn2Text || 'Services'}
                        </a>
                      </div>

                      {/* Indicator Dots */}
                      <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full border border-white/15">
                        {(bentoForm.heroSlides || []).map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPreviewSlideIndex(idx)}
                            className={`rounded-full transition-all ${
                              previewSlideIndex === idx ? 'w-3 h-1 bg-amber-400' : 'w-1 h-1 bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Side Bento Posters */}
                  {previewDevice !== 'phone' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-slate-900 text-white p-2 border border-slate-800">
                        <span className="text-[8px] font-bold text-sky-400 uppercase block">{bentoForm.card1Tag || 'Growth'}</span>
                        <div className="text-[10px] font-black truncate">{bentoForm.card1Title || 'Social Media'}</div>
                      </div>
                      <div className="rounded-lg bg-slate-900 text-white p-2 border border-slate-800">
                        <span className="text-[8px] font-bold text-amber-400 uppercase block">{bentoForm.card2Tag || 'Ready'}</span>
                        <div className="text-[10px] font-black truncate">{bentoForm.card2Title || 'Products'}</div>
                      </div>
                      <div className="rounded-lg bg-slate-900 text-white p-2 border border-slate-800">
                        <span className="text-[8px] font-bold text-emerald-400 uppercase block">{bentoForm.card3Tag || 'Enterprise'}</span>
                        <div className="text-[10px] font-black truncate">{bentoForm.card3Title || 'Web Design'}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Popular Services Showcase */}
                <div className="p-3 bg-white space-y-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                      Agency Services
                    </span>
                    <span className="text-[9px] text-blue-600 font-bold">Solutions</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(services || []).slice(0, 2).map((srv) => (
                      <div key={srv.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {srv.category || 'Service'}
                        </span>
                        <div className="text-[10px] font-black text-slate-900 truncate">{srv.name}</div>
                        <p className="text-[8px] text-slate-500 line-clamp-1">{srv.shortDescription}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Popular Products Showcase */}
                <div className="p-3 bg-slate-50 space-y-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                      Digital Resources
                    </span>
                    <span className="text-[9px] text-blue-600 font-bold">Catalog</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(products || []).slice(0, 2).map((prod) => (
                      <div key={prod.id} className="p-2 rounded-xl bg-white border border-slate-200/80 space-y-1 shadow-2xs">
                        <div className="h-14 w-full bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {prod.thumbnailUrl ? (
                            <img src={prod.thumbnailUrl} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="text-[9px] font-bold text-slate-900 truncate">{prod.name}</div>
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="font-extrabold text-blue-600">৳{prod.salePrice || prod.price || 0}</span>
                          <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1 rounded font-bold">Order</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Sticky Floating Sidebar Simulation inside Preview */}
                {activeSidebarSocials.length > 0 && (
                  <div className="absolute right-2 top-32 z-30 flex flex-col gap-1 p-1 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl">
                    {activeSidebarSocials.map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        title={`Open ${item.platform}: ${item.url}`}
                        className="w-6 h-6 rounded-lg flex items-center justify-center bg-white/10 hover:bg-indigo-600 text-white transition-all hover:scale-110 shadow-xs"
                      >
                        <SocialIcon link={item} className="w-3 h-3" size={12} />
                      </a>
                    ))}
                  </div>
                )}

                {/* 7. Footer */}
                <footer className="bg-slate-950 text-slate-300 p-4 space-y-4 border-t border-slate-800">
                  <div className={`grid gap-4 ${previewDevice === 'phone' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    {/* Brand & Bio */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-indigo-600/30 border border-indigo-400/40 p-0.5 flex items-center justify-center">
                          {siteForm.logoUrl ? (
                            <img src={siteForm.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-sm" />
                          ) : (
                            <span className="text-[8px] font-black text-white">EE</span>
                          )}
                        </div>
                        <div className="text-xs font-black text-white truncate">
                          {siteForm.brandName || 'Eagle Eye Digital'}
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                        {footerForm.aboutText || 'Premier digital agency providing bespoke web development.'}
                      </p>

                      {/* Footer Social Icons */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {activeFooterSocials.map((item) => (
                          <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            title={item.platform}
                            className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 hover:bg-indigo-600 text-white flex items-center justify-center transition-all hover:scale-110"
                          >
                            <SocialIcon link={item} className="w-3 h-3" size={12} />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Quick Links */}
                    {previewDevice !== 'phone' && (
                      <div className="space-y-1.5 text-[10px]">
                        <div className="font-bold text-white uppercase tracking-wider">Services & Products</div>
                        <ul className="space-y-1 text-slate-400">
                          {(footerForm.servicesLinks || []).slice(0, 3).map((l, i) => (
                            <li key={i}>
                              <a href={l.path} target="_blank" rel="noreferrer" className="hover:text-white">
                                • {l.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Contact */}
                    <div className="space-y-1 text-[10px] text-slate-400">
                      <div className="font-bold text-white uppercase tracking-wider">Helpline</div>
                      <div>
                        <a
                          href={`mailto:${footerForm.contactEmail || siteForm.businessEmail || 'support@eagleeyedigital.com'}`}
                          className="hover:text-indigo-400 font-mono block truncate"
                        >
                          ✉ {footerForm.contactEmail || siteForm.businessEmail || 'support@eagleeyedigital.com'}
                        </a>
                      </div>
                      <div>
                        <a
                          href={`https://wa.me/${(footerForm.contactPhone || siteForm.whatsappNumber || '01836126791').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-emerald-400 font-mono block truncate"
                        >
                          📞 {footerForm.contactPhone || siteForm.whatsappNumber || '01836126791'}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500">
                    <span>{footerForm.copyrightText || '© 2026 Eagle Eye Digital.'}</span>
                    <span className="text-indigo-400 font-semibold">{siteForm.tagline || 'YOUR DIGITAL WORLD'}</span>
                  </div>
                </footer>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex font-sans text-slate-800 overflow-hidden relative">
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-in fade-in"
        />
      )}

      {/* ================= LEFT SIDEBAR (EXACT VYRQONIX STYLE) ================= */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 h-full overflow-y-auto select-none shadow-2xl transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0 lg:shadow-none lg:flex-shrink-0
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="space-y-6">
          {/* Logo & Console Badge + Mobile Close Button */}
          <div className="px-2 pt-1 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2.5">
              <img
                src="/logo.jpg"
                alt="Logo"
                className="h-8 w-auto object-contain rounded border border-slate-200"
              />
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-slate-900 leading-none">
                  Eagle Eye
                </span>
                <span className="text-[9px] uppercase tracking-wider text-blue-600 font-extrabold mt-0.5">
                  Admin Console
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders & Sales', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : null },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'services', label: 'Agency Services', icon: Layers },
              { id: 'categories', label: 'Categories', icon: FolderTree },
              {
                id: 'admins',
                label: 'Admins & Roles',
                icon: ShieldCheck,
                badge: admins.filter((a) => a.pendingPasswordRequest?.status === 'pending').length > 0
                  ? `🔔 ${admins.filter((a) => a.pendingPasswordRequest?.status === 'pending').length}`
                  : (admins.length || null)
              },
              { id: 'leads', label: 'Leads & Inquiries', icon: Inbox, badge: leads.filter(l => l.status === 'New').length || null },
              { id: 'homepage', label: 'Homepage Banners', icon: Image },
              { id: 'footer', label: 'Header, Footer & Social', icon: Globe },
              { id: 'settings', label: 'Site Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleSelectMenu(item.id as AdminTab);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-blue-600' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
          {/* Logged in Admin Profile Card */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {(currentUser?.displayName || currentUser?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-slate-800 block truncate">
                  {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin'}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {currentUser?.email}
                </span>
              </div>
            </div>
            <div className="pt-1 flex items-center justify-between border-t border-slate-200/60 text-[10px]">
              <span className="text-slate-500 font-medium">Logged in:</span>
              <div>{renderRoleBadge(adminRole || 'owner')}</div>
            </div>

            {/* Password Change Button */}
            <button
              type="button"
              onClick={() => {
                setIsPassChangeModalOpen(true);
                setPassRequestMsg(null);
                setNewRequestedPassInput('');
              }}
              className="w-full mt-2 py-1.5 px-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[10px] font-bold text-slate-700 hover:text-blue-600 flex items-center justify-center space-x-1.5 transition-all shadow-xs"
            >
              <Key className="w-3 h-3 text-blue-500" />
              <span>
                {currentAdminProfile?.pendingPasswordRequest?.status === 'pending'
                  ? 'Password Pending ⏳'
                  : 'Change Password (পাসওয়ার্ড বদল)'}
              </span>
            </button>
          </div>

          <Link
            to="/"
            target="_blank"
            className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Customer Storefront</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* ================= RIGHT MAIN CONTENT AREA ================= */}
      <main className="flex-1 h-full p-3 sm:p-5 lg:p-8 max-w-[1800px] w-full overflow-y-auto">
        {/* Mobile Top Navigation Bar (Visible only on small screens < lg) */}
        <div className="lg:hidden flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>
            <div className="flex items-center space-x-2">
              <img src="/logo.jpg" alt="Logo" className="h-7 w-auto object-contain rounded border border-slate-200" />
              <span className="font-black text-sm text-slate-900">Eagle Eye Admin</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            {activeMenu}
          </span>
        </div>
        
        {/* ================= PRODUCTS TAB (EXACT VYRQONIX SETUP) ================= */}
        {activeMenu === 'products' && (
          <div className="space-y-6">
            
            {productViewMode === 'list' ? (
              /* PRODUCTS TABLE VIEW (Screen 1) */
              <div className="space-y-6">
                {/* Title & Top Action */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                      Products ({products.length})
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage files, formats, pricing, and Google Drive links
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setProdForm({
                        name: '',
                        slug: '',
                        category: categories[0]?.name || 'Templates',
                        productType: 'Template',
                        shortDescription: '',
                        description: '',
                        isFree: true,
                        price: 0,
                        salePrice: 0,
                        showDiscountBadge: false,
                        googleDriveLink: '',
                        customDownloadBtnText: 'Download File',
                        zipPassword: '',
                        installGuide: '',
                        thumbnailUrl: '',
                        previewImages: [],
                        status: 'published'
                      });
                      setProductViewMode('create');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                  </button>
                </div>

                {/* Search Bar (Screen 1 Filter bar) */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Filter products by title or category..."
                    className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm"
                  />
                </div>

                {/* Table (Screen 1 Columns: PRODUCT, CATEGORY, PRICE, DELIVERY, SALES / DL, STATUS, ACTIONS) */}
                <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3.5 px-5">PRODUCT</th>
                        <th className="py-3.5 px-5">CATEGORY</th>
                        <th className="py-3.5 px-5">PRICE</th>
                        <th className="py-3.5 px-5">DELIVERY</th>
                        <th className="py-3.5 px-5">SALES / DL</th>
                        <th className="py-3.5 px-5">STATUS</th>
                        <th className="py-3.5 px-5 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-5">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={p.thumbnailUrl || '/logo.jpg'}
                                  alt={p.name}
                                  className="w-9 h-9 rounded-lg object-cover border border-slate-200 bg-slate-900"
                                />
                                <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                                  <span>{p.name}</span>
                                  <Link
                                    to={`/products/${p.slug}`}
                                    target="_blank"
                                    className="text-slate-400 hover:text-blue-600"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 font-semibold text-slate-600">
                              {p.category}
                            </td>
                            <td className="py-3.5 px-5">
                              {p.price === 0 || p.isFree ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  FREE
                                </span>
                              ) : (
                                <span className="font-extrabold text-slate-900">৳{p.salePrice ?? p.price}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-5">
                              {p.googleDriveLink || p.downloadableFileUrl ? (
                                <a
                                  href={p.googleDriveLink || p.downloadableFileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold hover:bg-sky-100"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Drive</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[11px]">ΓÇö</span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 font-medium text-slate-600 text-[11px]">
                              <strong className="text-slate-900">{p.salesCount || 0}</strong> orders ΓÇó <strong className="text-slate-900">{p.downloadsCount || 0}</strong> dl
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {p.status === 'published' ? 'ACTIVE' : p.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setProdForm(p);
                                  setProductViewMode('create');
                                }}
                                className="p-1 text-slate-400 hover:text-blue-600"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Delete product ${p.name}?`)) {
                                    await deleteProduct(p.id);
                                    loadData();
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                            No products found. Click "+ Add Product" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* ================= COMPLETE CREATE NEW PRODUCT FORM (Screens 2, 3, 4, 5) ================= */
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-7 space-y-6">
                  {/* Back Button & Header */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setProductViewMode('list')}
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                      {prodForm.id ? 'Edit Product' : 'Create New Product'}
                    </h1>
                    <p className="text-xs text-slate-500">
                      Set pricing, upload previews, and configure digital delivery
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
                  
                  {/* SECTION 1: TITLE, SLUG & CATEGORY */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      1. TITLE, SLUG & CATEGORY
                    </h3>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={prodForm.name || ''}
                        onChange={(e) =>
                          setProdForm({
                            ...prodForm,
                            name: e.target.value,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                          })
                        }
                        placeholder="e.g. Modern Ramadan Social Media Post Bundle"
                        className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">URL Slug *</label>
                        <input
                          type="text"
                          required
                          value={prodForm.slug || ''}
                          onChange={(e) => setProdForm({ ...prodForm, slug: e.target.value })}
                          placeholder="modern-ramadan-post-bundle"
                          className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-bold text-slate-700">Category *</label>
                          <button
                            type="button"
                            onClick={() => setIsAddingQuickCategory(!isAddingQuickCategory)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ New Category</span>
                          </button>
                        </div>
                        <select
                          value={prodForm.category || ''}
                          onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                          className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
                        >
                          {categories.map((c) => (
                            <option key={c.id || c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Asset Type *</label>
                      <select
                        value={prodForm.productType || 'Template'}
                        onChange={(e) => setProdForm({ ...prodForm, productType: e.target.value as any })}
                        className="w-full sm:w-64 bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
                      >
                        <option value="Template">📄 Template</option>
                        <option value="Graphic Asset">🎨 Graphic Asset</option>
                        <option value="Software">💻 Software</option>
                        <option value="Game">🎮 Game</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                      <input
                        type="text"
                        value={prodForm.shortDescription || ''}
                        onChange={(e) => setProdForm({ ...prodForm, shortDescription: e.target.value })}
                        placeholder="Brief summary for product card..."
                        className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Full Detailed Description</label>
                      <textarea
                        rows={4}
                        value={prodForm.description || ''}
                        onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                        placeholder="Comprehensive overview of design assets, features, and instructions..."
                        className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* SECTION 2: PRICING (FREE OR PAID) */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      2. PRICING (FREE OR PAID)
                    </h3>

                    {/* Paid vs Free Pill Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setProdForm({ ...prodForm, isFree: false })}
                        className={`py-3 rounded-xl border text-center font-bold text-xs transition-all ${
                          !prodForm.isFree
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        PAID PRODUCT (BDT ৳)
                      </button>
                      <button
                        type="button"
                        onClick={() => setProdForm({ ...prodForm, isFree: true, price: 0 })}
                        className={`py-3 rounded-xl border text-center font-bold text-xs transition-all ${
                          prodForm.isFree
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        FREE GIVEAWAY (৳0)
                      </button>
                    </div>

                    {!prodForm.isFree && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Selling Price (BDT ৳) *</label>
                          <input
                            type="number"
                            value={prodForm.price ?? 0}
                            onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                            className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Compare-at Price (Optional strike-through)</label>
                          <input
                            type="number"
                            value={prodForm.salePrice ?? 0}
                            onChange={(e) => setProdForm({ ...prodForm, salePrice: Number(e.target.value) })}
                            className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Show Offer / Discount Badge */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="discountBadge"
                          checked={prodForm.showDiscountBadge || false}
                          onChange={(e) => setProdForm({ ...prodForm, showDiscountBadge: e.target.checked })}
                          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                        />
                        <div>
                          <label htmlFor="discountBadge" className="font-bold text-slate-800 cursor-pointer">
                            Show Offer / Discount Badge (% OFF) on Product Card
                          </label>
                          <p className="text-[10px] text-slate-500">
                            টিক চিহ্ন দিলে কার্ডের উপর "50% OFF" স্টিকার শো করবে। আনচেক রাখলে কোনো অফার ব্যাজ দেখাবে না।
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                        {prodForm.showDiscountBadge ? 'VISIBLE' : 'HIDDEN'}
                      </span>
                    </div>
                  </div>

                  {/* SECTION 3: DIGITAL DELIVERY METHOD & DOWNLOAD SETTINGS */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          3. DIGITAL DELIVERY METHOD & DOWNLOAD SETTINGS
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Google Drive লিংক এবং কাস্টমার কী ধরনের আইটেম (Game, Software নাকি Graphic Resource) ডাউনলোড করবে তা নির্ধারণ করুন।
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                        Google Drive Delivery
                      </span>
                    </div>

                    {/* এটি কী ধরনের আইটেম? (Game, Software নাকি Graphic Asset) */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-slate-700">
                          এটি কী ধরনের আইটেম? (Game, Software নাকি Graphic Asset) *
                        </label>
                        <span className="text-[11px] text-purple-600 font-semibold">
                          সিলেক্ট করলে বাটনের লিখা স্বয়ংক্রিয়ভাবে সেট হবে
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'Game', label: 'Game', sub: 'PC / Mobile গেম', icon: Gamepad2 },
                          { id: 'Software', label: 'Software', sub: 'টুলস বা সফটওয়্যার', icon: Laptop },
                          { id: 'Graphic Asset', label: 'Graphic Asset', sub: 'গ্রাফিক্স বা ডিজাইন', icon: Palette },
                          { id: 'Template', label: 'Template', sub: 'টেমপ্লেট বা থিম', icon: FileCode },
                          ...customTypes.map((ct) => ({
                            id: ct,
                            label: ct,
                            sub: 'কাস্টম আইটেম',
                            icon: Sparkles
                          }))
                        ].map((item) => {
                          const Icon = item.icon;
                          const isSel = prodForm.productType === item.id;
                          return (
                            <button
                              type="button"
                              key={item.id}
                              onClick={() => {
                                setProdForm({
                                  ...prodForm,
                                  productType: item.id as any,
                                  customDownloadBtnText: `Download ${item.label}`
                                });
                              }}
                              className={`p-3.5 rounded-xl border text-left transition-all ${
                                isSel
                                  ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                                  : 'border-slate-200 bg-white hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <Icon className={`w-4 h-4 ${isSel ? 'text-amber-600' : 'text-slate-400'}`} />
                                <span className="font-bold text-slate-800 text-xs">{item.label}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-1">{item.sub}</span>
                            </button>
                          );
                        })}

                        {/* + Add Custom Item Type Button */}
                        <button
                          type="button"
                          onClick={() => setIsAddingCustomType(!isAddingCustomType)}
                          className="p-3.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/60 hover:bg-amber-50/30 text-left transition-all flex flex-col justify-center items-center text-center group"
                        >
                          <Plus className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                          <span className="font-bold text-slate-700 group-hover:text-amber-700 text-xs mt-1">+ কাস্টম টাইপ</span>
                          <span className="text-[10px] text-slate-400">নতুন টাইপ যোগ করুন</span>
                        </button>
                      </div>

                      {/* Inline Custom Item Type Creator */}
                      {isAddingCustomType && (
                        <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mt-3 animate-fadeIn">
                          <input
                            type="text"
                            placeholder="নতুন আইটেম টাইপের নাম লিখুন (যেমন: eBook, Plugin, Presets, Course)..."
                            value={newCustomTypeName}
                            onChange={(e) => setNewCustomTypeName(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600 font-semibold"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomType();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomType}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>যোগ করুন</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingCustomType(false);
                              setNewCustomTypeName('');
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Google Drive Shareable Link Card */}
                    <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 space-y-2">
                      <div className="flex items-center space-x-1.5 font-bold text-sky-800">
                        <ExternalLink className="w-4 h-4" />
                        <span>Google Drive Shareable Link *</span>
                      </div>
                      <input
                        type="text"
                        value={prodForm.googleDriveLink || ''}
                        onChange={(e) => setProdForm({ ...prodForm, googleDriveLink: e.target.value })}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-xs focus:outline-none focus:border-blue-600"
                      />
                      <p className="text-[10px] text-slate-500">
                        Google Drive-এ ফাইল (গেম, সফটওয়্যার, অথবা জিপ ফাইল) আপলোড করে "Anyone with the link can view" পারমিশন দিয়ে শেয়ার লিংকটি এখানে দিন। কাস্টমার অর্ডার কনফার্ম হলে এই সুরক্ষিত লিংক থেকে ফাইল ডাউনলোড করতে পারবেন।
                      </p>
                    </div>

                    {/* ডাউনলোড বাটন লিখা / Download Button Text */}
                    <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-purple-900">
                          🏷️ ডাউনলোড বাটন লিখা / Download Button Text (কাস্টমাইজেশন)
                        </span>
                        <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-semibold">
                          ওয়েবসাইটে বাটনের উপর সরাসরি দেখাবে
                        </span>
                      </div>

                      <input
                        type="text"
                        value={prodForm.customDownloadBtnText || ''}
                        onChange={(e) => setProdForm({ ...prodForm, customDownloadBtnText: e.target.value })}
                        placeholder="Download Source File"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600"
                      />

                      {/* Quick Select Buttons */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-600 block">এক ক্লিকে বাটনের টেক্সট পছন্দ করুন:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Download Free Game',
                            'Download Game',
                            'Download Free Software',
                            'Download Software',
                            'Download Free Resource',
                            'Download Resource',
                            'Download Free Template',
                            'Download File'
                          ].map((text) => (
                            <button
                              key={text}
                              type="button"
                              onClick={() => setProdForm({ ...prodForm, customDownloadBtnText: text })}
                              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-purple-500 text-[10px] font-medium text-slate-700 transition-colors"
                            >
                              {text}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-500 pt-1">
                          💡 ফাঁকা রাখলে প্রোডাক্টের টাইপ (Game / Software / Resource) অনুযায়ী স্বয়ংক্রিয়ভাবে সঠিক নাম বাটনে চলে আসবে।
                        </p>
                      </div>
                    </div>

                    {/* ZIP / ফাইল আনজিপ করার পাসওয়ার্ড (ঐচ্ছিক / Optional) */}
                    <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/20 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-purple-900 flex items-center space-x-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                          <span>ZIP / ফাইল আনজিপ করার পাসওয়ার্ড (ঐচ্ছিক / Optional)</span>
                        </span>
                        <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-semibold">
                          পাসওয়ার্ড না থাকলে ফাঁকা রাখুন
                        </span>
                      </div>
                      <input
                        type="text"
                        value={prodForm.zipPassword || ''}
                        onChange={(e) => setProdForm({ ...prodForm, zipPassword: e.target.value })}
                        placeholder="যেমন: 1234 বা MG2026 (না থাকলে খালি রাখুন)"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600"
                      />
                      <p className="text-[10px] text-slate-500">
                        💡 <strong>কখন দিবেন?</strong> ফাইলটিতে যদি আনজিপ করার কোনো পাসওয়ার্ড থাকে (যেমন ৪ সংখ্যার পাসওয়ার্ড), তবে সেটি এখানে দিন। কাস্টমার অর্ডার সফল হওয়ার পর স্বয়ংক্রিয়ভাবে একটি সুন্দর নোটিশে পাসওয়ার্ড ও কপি বাটন দেখতে পাবে।
                      </p>
                    </div>

                    {/* কীভাবে কি করতে হবে / ইন্সটলেশন গাইড (ঐচ্ছিক / Optional) */}
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-900 flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-amber-600" />
                          <span>কীভাবে কি করতে হবে / ইন্সটলেশন গাইড (ঐচ্ছিক / Optional)</span>
                        </span>
                        <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                          ডাউনলোড পপআপে কাস্টমার দেখতে পাবে
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={prodForm.installGuide || ''}
                        onChange={(e) => setProdForm({ ...prodForm, installGuide: e.target.value })}
                        placeholder="যেমন: ১. জিপ ফাইলটি ডাউনলোড করে আনজিপ করুন। ২. আনজিপ করতে পাসওয়ার্ড MG2026 দিন। ৩. Setup.exe রান করে ইন্সটল করুন..."
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                      />

                      {/* Quick preset guidelines */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-slate-600">দ্রুত গাইডলাইন সিলেক্ট করুন:</span>
                        <button
                          type="button"
                          onClick={() => setProdForm({ ...prodForm, installGuide: '১. ফাইলটি ডাউনলোড করে আনজিপ করুন।\n২. প্রয়োজনীয় ফোল্ডার এক্সট্রাক্ট করে গেমটি চালু করুন।' })}
                          className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-amber-500 text-[10px] font-semibold text-slate-700"
                        >
                          🎮 গেম ইন্সটল গাইড
                        </button>
                        <button
                          type="button"
                          onClick={() => setProdForm({ ...prodForm, installGuide: '১. জিপ ফাইলটি ডাউনলোড করুন।\n২. সেটআপ ফাইলটি রান করে নির্দেশনা অনুযায়ী ইন্সটল সম্পন্ন করুন।' })}
                          className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-amber-500 text-[10px] font-semibold text-slate-700"
                        >
                          💻 সফটওয়্যার গাইড
                        </button>
                        <button
                          type="button"
                          onClick={() => setProdForm({ ...prodForm, installGuide: '১. ভেক্টর বা টেমপ্লেট ফাইলটি ওপেন করুন।\n২. ফন্ট ও কালার আপনার ব্র্যান্ড অনুযায়ী পরিবর্তন করুন।' })}
                          className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-amber-500 text-[10px] font-semibold text-slate-700"
                        >
                          🎨 গ্রাফিক্স / ডিজাইন গাইড
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        💡 কাস্টমার যখন ডাউনলোড বাটনে ক্লিক করবে, তখন এই নিয়মাবলীটি পপআপে দেখতে পাবে।
                      </p>
                    </div>

                    {/* CATEGORY SELECTION OPTION AT THE END (All created categories + Add Category button) */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                            <FolderTree className="w-3.5 h-3.5 text-blue-600" />
                            <span>ক্যাটাগরি নির্বাচন / Category Selection (আপনার সমস্ত তৈরি করা ক্যাটাগরি) *</span>
                          </span>
                          <p className="text-[10px] text-slate-500">
                            আগে তৈরি করা যেকোনো ক্যাটাগরি নির্বাচন করুন অথবা নতুন ক্যাটাগরি যোগ করুন।
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => setIsAddingQuickCategory(!isAddingQuickCategory)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm transition-colors self-start sm:self-auto"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Category</span>
                        </button>
                      </div>

                      {/* Quick Category Add Input if open */}
                      {isAddingQuickCategory && (
                        <div className="p-3 bg-white border border-blue-200 rounded-xl space-y-2 shadow-sm animate-fadeIn">
                          <span className="text-[11px] font-bold text-blue-900 block">নতুন ক্যাটাগরি যোগ করুন:</span>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="ক্যাটাগরির নাম লিখুন (যেমন: Gaming Mods, Software Tools)..."
                              value={quickCategoryName}
                              onChange={(e) => setQuickCategoryName(e.target.value)}
                              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleQuickAddCategory();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleQuickAddCategory}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Save & Select</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingQuickCategory(false);
                                setQuickCategoryName('');
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* All Existing Categories Visual Selector Pills */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {categories.map((c) => {
                          const isSel = prodForm.category === c.name;
                          return (
                            <button
                              key={c.id || c.name}
                              type="button"
                              onClick={() => setProdForm({ ...prodForm, category: c.name })}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                                isSel
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/40'
                              }`}
                            >
                              {c.iconUrl ? (
                                <img src={c.iconUrl} alt={c.name} className="w-3.5 h-3.5 rounded object-cover" />
                              ) : (
                                <span>📁</span>
                              )}
                              <span>{c.name}</span>
                              {isSel && <Check className="w-3 h-3 text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* SECTION 4: PREVIEW IMAGES & PHOTOS (Paste Image / File Upload / Direct Link) */}
                  <div
                    onPaste={handleProductImagePaste}
                    className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                          <ImagePlus className="w-4 h-4 text-blue-600" />
                          <span>4. PREVIEW IMAGES & PHOTOS</span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          ছবি ড্র্যাগ ও ড্রপ করুন, সরাসরি <strong className="text-blue-700">Ctrl + V দিয়ে পেস্ট</strong> করুন, অথবা কম্পিউটার থেকে সিলেক্ট করুন (1080×1080 রেশিও)।
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] self-start sm:self-auto">
                        {prodForm.thumbnailUrl ? '✅ 1 Photo Active' : '0 Photos Selected'}
                      </span>
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      ref={productFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProductFileUpload(e.target.files?.[0])}
                      className="hidden"
                    />

                    {/* Interactive Dropzone / Preview Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                      <div
                        onClick={() => productFileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsProductImageDragging(true);
                        }}
                        onDragLeave={() => setIsProductImageDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsProductImageDragging(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleProductFileUpload(file);
                        }}
                        className={`sm:col-span-4 h-48 sm:h-52 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-3 cursor-pointer group transition-all relative overflow-hidden ${
                          isProductImageDragging
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                            : prodForm.thumbnailUrl
                            ? 'border-blue-200 bg-slate-900'
                            : 'border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/20'
                        }`}
                      >
                        {prodForm.thumbnailUrl ? (
                          <>
                            <img
                              src={prodForm.thumbnailUrl}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-xl"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white space-y-1">
                              <Upload className="w-5 h-5" />
                              <span className="font-bold text-xs">Change Photo</span>
                              <span className="text-[10px] text-white/80">Click or Drag new file</span>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-1.5 p-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                              <Upload className="w-5 h-5 stroke-[2.2]" />
                            </div>
                            <span className="font-bold text-xs text-slate-800 block">
                              Click to Upload Photo
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              বা ড্র্যাগ করে ফাইল ছাড়ুন
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Controls, Paste Button & URL Option */}
                      <div className="sm:col-span-8 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => productFileInputRef.current?.click()}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Browse Computer File</span>
                          </button>

                          <button
                            type="button"
                            onClick={handlePasteFromClipboardBtn}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                          >
                            <Clipboard className="w-3.5 h-3.5 text-blue-600" />
                            <span>Paste (Ctrl + V)</span>
                          </button>

                          {prodForm.thumbnailUrl && (
                            <button
                              type="button"
                              onClick={() => setProdForm({ ...prodForm, thumbnailUrl: '' })}
                              className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs flex items-center space-x-1 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        {/* Direct URL input */}
                        <div>
                          <label className="block font-bold text-slate-600 mb-1 text-[11px]">
                            অথবা সরাসরি ইমেজ লিংক (Image URL) পেস্ট করুন:
                          </label>
                          <input
                            type="text"
                            value={prodForm.thumbnailUrl || ''}
                            onChange={(e) => setProdForm({ ...prodForm, thumbnailUrl: e.target.value })}
                            placeholder="https://images.unsplash.com/... অথবা যেকোনো ছবি URL"
                            className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                          />
                        </div>

                        {/* Status Message or Tips */}
                        <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 text-[10px] text-blue-800">
                          {imageUploadStatus ? (
                            <span className="font-bold animate-pulse">{imageUploadStatus}</span>
                          ) : (
                            <span>
                              💡 <strong>টিপস:</strong> আপনি Snipping Tool, Photoshop বা ওয়েবসাইট থেকে যেকোনো ছবি কপি করে সরাসরি এই পেজে <kbd className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-mono font-bold text-slate-700">Ctrl + V</kbd> প্রেস করলেই ছবি তাৎক্ষণিক যুক্ত হয়ে যাবে!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit / Save Bar */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setProductViewMode('list')}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center space-x-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Product</span>
                    </button>
                  </div>

                </form>
              </div>

              {/* Right Column: Live Product Card & Full Website Preview (Pinned) */}
              <div className="xl:col-span-5 sticky top-2 sm:top-4 self-start z-20">
                {renderInteractiveWebsitePreviewPane()}
              </div>
            </div>
          )}

          </div>
        )}

        {/* ================= CATEGORIES MANAGEMENT TAB (Screen 5) ================= */}
        {activeMenu === 'categories' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Categories Management
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Organize graphic resources, templates, and apps with custom icons
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: ADD / EDIT CATEGORY FORM */}
              <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-black text-slate-800 text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>{editingCategoryId ? 'EDIT CATEGORY' : 'ADD NEW CATEGORY'}</span>
                  </div>
                  {editingCategoryId && (
                    <button
                      type="button"
                      onClick={handleCancelEditCategory}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Category Name *</label>
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        if (!editingCategoryId) {
                          setNewCatSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-+|-+$/g, '')
                          );
                        }
                      }}
                      placeholder="e.g. ElevenLabs, WordPress, Themes"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Slug (URL) *</label>
                    <input
                      type="text"
                      required
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      placeholder="e.g. elevenlabs, themes, logo-design"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Category Photo / Icon */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-700">Category Photo / Icon *</label>
                      <span className="text-[10px] text-purple-600 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded font-bold">
                        300×225 (4:3 Card)
                      </span>
                    </div>

                    <input
                      ref={categoryFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCategoryFileUpload(e.target.files?.[0])}
                      className="hidden"
                    />

                    <div
                      onClick={() => categoryFileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsCategoryDragging(true);
                      }}
                      onDragLeave={() => setIsCategoryDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsCategoryDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleCategoryFileUpload(file);
                      }}
                      className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                        isCategoryDragging
                          ? 'border-purple-500 bg-purple-50/50'
                          : 'border-purple-200/90 bg-purple-50/20 hover:bg-purple-50/40'
                      }`}
                    >
                      {newCatIcon ? (
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-15 rounded-lg overflow-hidden border border-purple-200 bg-slate-900 mb-2 shadow-xs">
                            <img src={newCatIcon} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <span className="font-bold text-xs text-slate-800">Click to change photo</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, SVG, WebP</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center mx-auto mb-2">
                            <Upload className="w-5 h-5 stroke-[2.2]" />
                          </div>
                          <span className="font-bold text-xs text-slate-800 block">
                            Click to Upload Photo from Device / Mobile
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            PNG, JPG, SVG, WebP (Like Adobe CC, All Products card)
                          </span>
                        </>
                      )}
                    </div>

                    <input
                      type="text"
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      placeholder="Or paste image URL (https://... or /categories/...)"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Display Order</label>
                    <input
                      type="number"
                      value={newCatOrder}
                      onChange={(e) => setNewCatOrder(Number(e.target.value))}
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Description (Optional)</label>
                    <textarea
                      rows={3}
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="Brief description for SEO and category banner..."
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all"
                  >
                    Save Category
                  </button>
                </form>
              </div>

              {/* Right Column: EXISTING CATEGORIES TABLE */}
              <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                    EXISTING CATEGORIES ({categories.length})
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Drag or set Order number to rearrange
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-2.5 px-2">ICON</th>
                        <th className="py-2.5 px-2">NAME</th>
                        <th className="py-2.5 px-2">SLUG</th>
                        <th className="py-2.5 px-2 text-center">ORDER</th>
                        <th className="py-2.5 px-2 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categories.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-2">
                            <div className="w-8 h-8 rounded-lg bg-black border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                              {c.iconUrl ? (
                                <img src={c.iconUrl} alt={c.name} className="w-full h-full object-cover" />
                              ) : (
                                <FolderTree className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 font-bold text-slate-900">{c.name}</td>
                          <td className="py-3 px-2 font-mono text-slate-500 text-[11px]">{c.slug}</td>
                          <td className="py-3 px-2 font-bold text-slate-700 text-center">{c.displayOrder ?? 0}</td>
                          <td className="py-3 px-2 text-right space-x-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleStartEditCategory(c)}
                              title="Edit Category"
                              className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(c)}
                              title="Delete Category"
                              className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {categories.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                            No categories yet. Create your first category on the left.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= DASHBOARD OVERVIEW ================= */}
        {activeMenu === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Administrator Overview
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time metrics and store health from Firebase Firestore
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    handleSelectMenu('products');
                    setProductViewMode('create');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>

                <button
                  onClick={() => handleSelectMenu('categories')}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5"
                >
                  <FolderTree className="w-3.5 h-3.5 text-slate-400" />
                  <span>Manage Categories</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">TOTAL PRODUCTS</span>
                <div className="text-3xl font-black text-slate-900 mt-2">{totalProductsCount}</div>
                <span className="text-[11px] text-slate-400 mt-1 block">{products.filter(p => p.status === 'published').length} active</span>
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">VERIFIED REVENUE</span>
                <div className="text-3xl font-black text-emerald-600 mt-2">৳{verifiedRevenue}</div>
                <span className="text-[11px] text-slate-400 mt-1 block">From {orders.filter(o => o.paymentStatus === 'verified').length} orders</span>
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">PENDING ORDERS</span>
                <div className="text-3xl font-black text-amber-600 mt-2">{pendingOrdersCount}</div>
                <span className="text-[11px] text-slate-400 mt-1 block">Needs verification</span>
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">CATEGORIES</span>
                <div className="text-3xl font-black text-slate-900 mt-2">{activeCategoriesCount}</div>
                <span className="text-[11px] text-slate-400 mt-1 block">{categories.length} configured</span>
              </div>
            </div>

            {/* Leads & Consultation Pipeline Summary */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span>Leads & Consultation Pipeline</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Live tracking of client inquiries, scheduled meetings, and client confirmations
                  </p>
                </div>
                <button
                  onClick={() => handleSelectMenu('leads')}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto"
                >
                  <span>Open Leads & Consultations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div
                  onClick={() => {
                    setLeadsFilter('all');
                    handleSelectMenu('leads');
                  }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TOTAL INQUIRIES</span>
                    <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Inbox className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mt-2">{leadStats.total}</div>
                  <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
                    {leadStats.newCount} new pending follow-up
                  </span>
                </div>

                <div
                  onClick={() => {
                    setLeadsFilter('scheduled');
                    handleSelectMenu('leads');
                  }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">SCHEDULED MEETINGS</span>
                    <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Calendar className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-black text-amber-600 mt-2">{leadStats.scheduledCount}</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Awaiting client response</span>
                </div>

                <div
                  onClick={() => {
                    setLeadsFilter('confirmed');
                    handleSelectMenu('leads');
                  }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CONFIRMED MEETINGS</span>
                    <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-black text-emerald-600 mt-2">{leadStats.confirmedCount}</div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Ready to join</span>
                </div>

                <div
                  onClick={() => {
                    setLeadsFilter('cancelled');
                    handleSelectMenu('leads');
                  }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CANCELLED / LOST</span>
                    <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Clock className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-black text-rose-600 mt-2">{leadStats.cancelledCount}</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Declined or closed</span>
                </div>
              </div>
            </div>

            {/* Upcoming Consultations Preview */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Upcoming Client Consultations ({upcomingConsultations.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sessions scheduled with clients, showing meeting time, link & response
                  </p>
                </div>
                <button
                  onClick={() => handleSelectMenu('leads')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View All &rarr;
                </button>
              </div>

              {upcomingConsultations.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {upcomingConsultations.slice(0, 5).map((l) => {
                    const status = l.meetingDetails?.meetingStatus || 'proposed';
                    return (
                      <div key={l.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-slate-900">{l.name}</span>
                            <span className="text-xs text-slate-400">({l.businessName || 'Direct Client'})</span>
                            {status === 'confirmed' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                Confirmed
                              </span>
                            )}
                            {status === 'proposed' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                                Awaiting Client
                              </span>
                            )}
                            {status === 'cancelled' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                                Cancelled
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="font-semibold text-blue-600">{l.serviceInterest}</span>
                            <span>•</span>
                            <span className="flex items-center space-x-1 font-mono text-[11px] text-slate-700">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatDateTime(l.meetingDetails?.scheduledTime)}</span>
                            </span>
                            <span>•</span>
                            <span className="text-[11px]">Host: {l.meetingDetails?.scheduledBy || 'Admin'}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {l.meetingDetails?.meetingLink && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleCopyMeetingLink(l.id, l.meetingDetails!.meetingLink)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1"
                              >
                                {copiedLeadId === l.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Link</span>
                                  </>
                                )}
                              </button>
                              <a
                                href={l.meetingDetails.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Join</span>
                              </a>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenMeetingModal(l)}
                            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                          >
                            Reschedule
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  No upcoming meetings scheduled yet. Click on any inquiry under Leads & Consultations to propose a meeting time.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= AGENCY SERVICES ================= */}
        {activeMenu === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Agency Services</h2>
                <p className="text-xs text-slate-500">Manage client service packages, timelines, and deliverables</p>
              </div>
              <button
                onClick={() => {
                  setServiceForm({
                    name: '',
                    slug: '',
                    shortDescription: '',
                    longDescription: '',
                    category: 'Digital Marketing & Ads',
                    timeline: '2-4 Weeks',
                    status: 'published'
                  });
                  setIsServiceModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-5">
                {services.map((srv) => (
                  <div key={srv.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-blue-600">{srv.category}</span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">{srv.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {srv.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{srv.shortDescription}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setServiceForm(srv);
                          setIsServiceModalOpen(true);
                        }}
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                        Edit Service
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete service: ${srv.name}?`)) {
                            await deleteService(srv.id);
                            loadData();
                          }
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Live Service Card & Full Website Preview (Pinned) */}
              <div className="xl:col-span-5 sticky top-2 sm:top-4 self-start z-20">
                {renderInteractiveWebsitePreviewPane()}
              </div>
            </div>
          </div>
        )}

        {/* ================= ORDERS & SALES ================= */}
        {activeMenu === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Orders & Sales Verification</h2>
              <p className="text-xs text-slate-500">Verify customer bKash/Nagad/Bank transactions to unlock downloads</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-5">Order ID</th>
                    <th className="py-3 px-5">Customer</th>
                    <th className="py-3 px-5">Total</th>
                    <th className="py-3 px-5">Payment Method</th>
                    <th className="py-3 px-5">Payment Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-800">#{ord.id}</td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-900 block">{ord.customerName}</span>
                        <span className="text-[11px] text-slate-400">{ord.customerEmail}</span>
                      </td>
                      <td className="py-3.5 px-5 font-black text-slate-900">৳{ord.totalAmount}</td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium">
                        {ord.paymentMethod}
                        {ord.paymentDetails?.transactionId && (
                          <span className="block text-[10px] font-mono text-blue-600 font-bold">
                            Trx: {ord.paymentDetails.transactionId}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <select
                          value={ord.paymentStatus}
                          onChange={async (e) => {
                            await updateOrderStatus(ord.id, e.target.value as any);
                            loadData();
                          }}
                          className="bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 px-2 py-1 font-bold"
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= HERO BANNERS & SIDE POSTERS (Exact Vyrqonix Layout) ================= */}
        {activeMenu === 'homepage' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 text-blue-600">
                <ImagePlus className="w-6 h-6 stroke-[2.2]" />
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Hero Banners & Side Posters
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Manage the Main Hero Carousel slider (left) and the Promotional Side Posters (right) independently.
              </p>
            </div>

            {/* Sub-Tabs: Main Hero Slider vs Side Promo Posters */}
            <div className="flex space-x-8 border-b border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setBentoActiveTab('slider')}
                className={`pb-3 font-bold flex items-center space-x-2 transition-all border-b-2 -mb-px ${
                  bentoActiveTab === 'slider'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>
                  Main Hero Slider ({(bentoForm.heroSlides || defaultHeroSlides).length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBentoActiveTab('posters')}
                className={`pb-3 font-bold flex items-center space-x-2 transition-all border-b-2 -mb-px ${
                  bentoActiveTab === 'posters'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>
                  Side Promo Posters ({[bentoForm.card1Image, bentoForm.card2Image, bentoForm.card3Image].filter(Boolean).length})
                </span>
              </button>
            </div>

            {bentoSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Changes saved and updated live on the website!</span>
              </div>
            )}

            {/* TAB 1: MAIN HERO SLIDER (SCREEN 1 WITH EDIT & REAL-TIME PREVIEW) */}
            {bentoActiveTab === 'slider' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: + ADD / EDIT HERO SLIDE */}
                <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-blue-600">
                        {editingSlideIndex !== null ? (
                          <>
                            <Edit2 className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-900">EDIT HERO SLIDE (SLIDE #{editingSlideIndex + 1})</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-900">+ ADD HERO SLIDE (LEFT SLIDER)</span>
                          </>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {editingSlideIndex !== null
                          ? 'Modify picture, title or destination for this slide.'
                          : 'These slides appear in the left carousel on the homepage and rotate automatically.'}
                      </p>
                    </div>

                    {editingSlideIndex !== null && (
                      <button
                        type="button"
                        onClick={handleCancelEditSlide}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleCreateHeroSlide} className="space-y-4 text-xs">
                    {/* Slide Image Box */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700">
                        Slide Image (Recommended: 1200×520px or 1024×440px | 2.3:1 Wide Ratio) *
                      </label>

                      <input
                        ref={heroSlideFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleNewSlideFileUpload(e.target.files?.[0])}
                        className="hidden"
                      />

                      <div className="p-6 border-2 border-dashed border-sky-300 bg-sky-50/20 hover:bg-sky-50/40 rounded-2xl text-center space-y-3 transition-colors">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => heroSlideFileInputRef.current?.click()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Choose Slide Image</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNewSlideImg('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80');
                              if (!newSlideTitle) setNewSlideTitle('Exclusive Digital Assets & 3D Resource Vault');
                            }}
                            className="px-3.5 py-1.5 bg-purple-50 text-purple-700 border border-purple-200/80 rounded-full font-bold text-[11px] hover:bg-purple-100 transition-colors flex items-center space-x-1"
                          >
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>Use Perfect 1200×520 Banner</span>
                          </button>
                        </div>

                        <span className="text-[10px] text-slate-400 block">
                          PNG, JPG, WEBP formats supported (Auto-compressed)
                        </span>

                        <input
                          type="text"
                          value={newSlideImg}
                          onChange={(e) => setNewSlideImg(e.target.value)}
                          placeholder="Or paste direct image URL (ImgBB, Unsplash, etc.)"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                        />

                        {newSlideImg && (
                          <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 h-28 w-full group">
                            <img src={newSlideImg} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setNewSlideImg('')}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Visual Mode Selector: 3D, Picture, Text, Hybrid, Pure Banner */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700 text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-indigo-700 uppercase tracking-wider text-[11px] font-black">
                          <Wand2 className="w-3.5 h-3.5" />
                          ডান পাশের মিডিয়ার রূপ (Visual Media Mode)
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ইচ্ছামতো ছবি, ৩ডি বা টেক্সট বেছে নিন
                        </span>
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { id: '3d', label: '3D Orb & Badges', icon: '🔮', desc: 'ভাসমান থ্রি-ডি অর্ব ও ব্যাজ' },
                          { id: 'image', label: 'Picture / Art', icon: '🖼️', desc: 'আলাদা ৩ডি ছবি বা আর্টওয়ার্ক' },
                          { id: 'text', label: 'Terminal / Text', icon: '💻', desc: 'অ্যানিমেটেড কোড টার্মিনাল' },
                          { id: 'hybrid', label: 'Hybrid (৩টিই)', icon: '🔄', desc: 'Text ➔ 3D ➔ Pic ঘুরবে' },
                          { id: 'pure-banner', label: 'Full Banner', icon: '🎨', desc: 'পুরো ছবিতেই ব্যানার' },
                        ].map((m) => {
                          const active = newSlideVisualType === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setNewSlideVisualType(m.id as SlideVisualType);
                                if (m.id === 'pure-banner') {
                                  setNewSlideIsPureBanner(true);
                                } else {
                                  setNewSlideIsPureBanner(false);
                                }
                              }}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                active
                                  ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-xs ring-2 ring-indigo-500/20'
                                  : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                              }`}
                            >
                              <div className="text-base mb-1">{m.icon}</div>
                              <div className="font-extrabold text-[11px] leading-tight">{m.label}</div>
                              <div className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">{m.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Contextual Visual Configuration Details */}
                    {newSlideVisualType === '3d' && (
                      <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2.5 animate-fadeIn">
                        <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider block">
                          3D Orb & Badges Customizer:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Center Text</label>
                            <input
                              type="text"
                              value={newSlideBadgeCenter}
                              onChange={(e) => setNewSlideBadgeCenter(e.target.value)}
                              placeholder="Verified 4K"
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Top Left Badge</label>
                            <input
                              type="text"
                              value={newSlideBadge1}
                              onChange={(e) => setNewSlideBadge1(e.target.value)}
                              placeholder="Instant Deploy"
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Bottom Right Badge</label>
                            <input
                              type="text"
                              value={newSlideBadge2}
                              onChange={(e) => setNewSlideBadge2(e.target.value)}
                              placeholder="4.9/5 Rating"
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {newSlideVisualType === 'image' && (
                      <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">
                            Feature 3D Picture / Graphic Artwork URL:
                          </label>
                          <button
                            type="button"
                            onClick={() => setNewSlideImage3D('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80')}
                            className="text-[10px] font-bold text-purple-600 hover:underline"
                          >
                            Sample 3D Image
                          </button>
                        </div>
                        <input
                          type="url"
                          value={newSlideImage3D}
                          onChange={(e) => setNewSlideImage3D(e.target.value)}
                          placeholder="https://images.unsplash.com/... or paste image URL"
                          className="w-full text-xs px-3 py-1.5 rounded-lg bg-white border border-purple-200 font-mono"
                        />
                      </div>
                    )}

                    {newSlideVisualType === 'text' && (
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-white animate-fadeIn">
                        <label className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider block">
                          Terminal Command & Live Text:
                        </label>
                        <input
                          type="text"
                          value={newSlideTerminalText}
                          onChange={(e) => setNewSlideTerminalText(e.target.value)}
                          placeholder="npm run eagle:grow --scale=10x"
                          className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 font-mono text-amber-300"
                        />
                      </div>
                    )}

                    {newSlideVisualType === 'hybrid' && (
                      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 font-semibold flex items-center gap-2 animate-fadeIn">
                        <span>🔄</span>
                        <span>
                          <strong>Hybrid Active:</strong> স্লাইড চলাকালীন ডান পাশে স্বয়ংক্রিয়ভাবে চক্রাকারে <strong>Text (টার্মিনাল) ➔ 3D (অর্ব) ➔ Picture (ছবি)</strong> ঘুরবে।
                        </span>
                      </div>
                    )}

                    {/* Text Animation Options (When NOT Pure Banner) */}
                    {newSlideVisualType !== 'pure-banner' && !newSlideIsPureBanner && (
                      <div className="space-y-2 p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5 text-blue-600" />
                            টেক্সট অ্যানিমেশন স্টাইল (Text Animation)
                          </label>
                          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                            <span className="text-slate-400 px-1">Speed:</span>
                            {(['fast', 'normal', 'slow'] as const).map((spd) => (
                              <button
                                key={spd}
                                type="button"
                                onClick={() => setNewSlideTextSpeed(spd)}
                                className={`px-2 py-0.5 rounded capitalize transition-colors ${
                                  newSlideTextSpeed === spd
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {spd}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                          {[
                            { id: 'typewriter', label: 'Typewriter', icon: '⌨️', note: 'এক এক অক্ষর টাইপ হবে' },
                            { id: 'fade', label: 'Smooth Fade', icon: '🌊', note: 'স্মুথ ফেড ইন' },
                            { id: 'gradient', label: 'Gradient Glow', icon: '🌈', note: 'কালার মোশন' },
                            { id: 'bounce', label: 'Pop Bounce', icon: '⚡', note: 'স্কেল বাউন্স' },
                            { id: 'none', label: 'Static Crisp', icon: '⏹️', note: 'স্থির টেক্সট' },
                          ].map((anim) => {
                            const isSelected = newSlideTextAnimation === anim.id;
                            return (
                              <button
                                key={anim.id}
                                type="button"
                                onClick={() => setNewSlideTextAnimation(anim.id as TextAnimationStyle)}
                                className={`p-2 rounded-xl border text-center transition-all ${
                                  isSelected
                                    ? 'border-blue-600 bg-white text-blue-900 shadow-xs ring-2 ring-blue-500/20 font-bold'
                                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                }`}
                              >
                                <span className="text-sm block">{anim.icon}</span>
                                <span className="text-[10px] block font-bold mt-0.5">{anim.label}</span>
                                <span className="text-[8px] text-slate-400 block">{anim.note}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Slide Title / Description (Optional when Pure Banner is selected) */}
                    {newSlideVisualType !== 'pure-banner' && !newSlideIsPureBanner && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Slide Title / Headline
                        </label>
                        <input
                          type="text"
                          value={newSlideTitle}
                          onChange={(e) => setNewSlideTitle(e.target.value)}
                          placeholder="e.g. Empower Your Growth With Intelligent Strategy"
                          className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all font-semibold"
                        />
                      </div>
                    )}

                    {/* Click Destination Link */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Click Destination Link
                      </label>
                      <input
                        type="text"
                        value={newSlideLink}
                        onChange={(e) => setNewSlideLink(e.target.value)}
                        placeholder="/products"
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center space-x-3 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center justify-center space-x-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>
                          {editingSlideIndex !== null
                            ? `Save & Update Slide #${editingSlideIndex + 1}`
                            : 'Add to Hero Slider'}
                        </span>
                      </button>

                      {editingSlideIndex !== null && (
                        <button
                          type="button"
                          onClick={handleCancelEditSlide}
                          className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Right Column: LIVE HOMEPAGE PREVIEW & ACTIVE BANNERS (Pinned) */}
                <div className="lg:col-span-6 space-y-6 sticky top-2 sm:top-4 self-start z-20">
                  
                  {/* REAL-TIME WEBSITE LIVE PREVIEW CARD (Interactive, Full Layout Toggle & Animated, Pinned) */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-md space-y-4 max-h-[calc(100vh-5.5rem)] overflow-y-auto">
                    
                    {/* Preview Top Header & Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-indigo-700">
                          <Sparkles className="w-4 h-4 text-indigo-600 animate-spin-slow" />
                          <span>LIVE HOMEPAGE PREVIEW (ওয়েবসাইটে যেমন দেখাবে)</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          স্লাইড করে দেখুন, লেখা ও ছবির অ্যানিমেশন দেখুন এবং ফুল ওয়েব লেআউট প্রিভিউ করুন:
                        </p>
                      </div>

                      {/* View Mode Toggle: Slider vs Full Web Layout vs Full Website */}
                      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setPreviewViewMode('slider')}
                          className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                            previewViewMode === 'slider'
                              ? 'bg-white text-indigo-700 shadow-sm'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Slider Only</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewViewMode('full-layout')}
                          className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                            previewViewMode === 'full-layout'
                              ? 'bg-white text-indigo-700 shadow-sm'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          <span>Full Bento Layout</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewViewMode('full-website')}
                          className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                            previewViewMode === 'full-website'
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Full Website</span>
                        </button>
                      </div>
                    </div>

                    {/* Conditional: Full Website Live Preview in Side Panel OR Hero Bento Slider */}
                    {previewViewMode === 'full-website' ? (
                      <div className="pt-2">
                        {renderInteractiveWebsitePreviewPane()}
                      </div>
                    ) : (() => {
                      const previewSlides = bentoForm.heroSlides && bentoForm.heroSlides.length > 0
                        ? bentoForm.heroSlides
                        : defaultHeroSlides;
                      const isUploadedFocused = previewFocusUploaded && Boolean(newSlideImg);
                      const currentPreview = previewSlides[previewSlideIndex] || previewSlides[0];
                      const activeBg = isUploadedFocused
                        ? newSlideImg
                        : (editingSlideIndex === previewSlideIndex && newSlideImg)
                        ? newSlideImg
                        : currentPreview?.bgImage;
                      const previewIsPure = isUploadedFocused
                        ? newSlideIsPureBanner
                        : Boolean(currentPreview?.isPureBanner || (currentPreview?.bgImage && !currentPreview?.title));
                      const active3D = currentPreview?.image3D;

                      return (
                        <div className="space-y-3">
                          {/* Live Switcher between Uploaded Banner and Saved Slides */}
                          {newSlideImg && (
                            <div className="flex flex-wrap items-center gap-2 pb-1">
                              <button
                                type="button"
                                onClick={() => setPreviewFocusUploaded(true)}
                                className={`text-[11px] font-extrabold px-3 py-1.5 rounded-xl border transition-all flex items-center space-x-1.5 ${
                                  previewFocusUploaded
                                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                                <span>Preview Uploaded Picture (লাইভ আপনার ছবি)</span>
                                {previewFocusUploaded && <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewFocusUploaded(false)}
                                className={`text-[11px] font-extrabold px-3 py-1.5 rounded-xl border transition-all flex items-center space-x-1.5 ${
                                  !previewFocusUploaded
                                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Cycle Saved Slides ({previewSlides.length})</span>
                                {!previewFocusUploaded && <Check className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-700 text-[11px] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                {isUploadedFocused ? 'Uploaded Draft' : `Slide ${previewSlideIndex + 1} of ${previewSlides.length}`}
                              </span>
                              {editingSlideIndex === previewSlideIndex && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                  Live Editing
                                </span>
                              )}
                              {previewIsPure && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300">
                                  Pure Graphic
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-1.5">
                              {/* Slide Prev Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewFocusUploaded(false);
                                  setPreviewSlideIndex(
                                    (prev) => (prev - 1 + previewSlides.length) % previewSlides.length
                                  );
                                }}
                                className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                                title="Previous Slide"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>

                              {/* Play / Pause Toggle Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewFocusUploaded(false);
                                  setPreviewAutoPlay(!previewAutoPlay);
                                }}
                                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center space-x-1 transition-colors ${
                                  previewAutoPlay && !isUploadedFocused
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 bg-slate-50 text-slate-600'
                                }`}
                                title={previewAutoPlay ? 'Pause Auto Slide' : 'Play Auto Slide'}
                              >
                                {previewAutoPlay && !isUploadedFocused ? (
                                  <>
                                    <Pause className="w-3 h-3 text-emerald-600" />
                                    <span>Auto-Slide ON</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3 text-slate-500" />
                                    <span>Paused</span>
                                  </>
                                )}
                              </button>

                              {/* Slide Next Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewFocusUploaded(false);
                                  setPreviewSlideIndex((prev) => (prev + 1) % previewSlides.length);
                                }}
                                className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                                title="Next Slide"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Full Bento Grid Preview Layout Container */}
                          <div
                            className={
                              previewViewMode === 'full-layout'
                                ? 'grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch'
                                : 'w-full'
                            }
                          >
                            {/* The Interactive Hero Slider Mockup */}
                            <div
                              className={`${
                                previewViewMode === 'full-layout' ? 'md:col-span-8' : 'w-full'
                              } rounded-2xl overflow-hidden relative min-h-[250px] sm:min-h-[280px] bg-slate-950 p-6 flex flex-col justify-between text-white shadow-xl transition-all duration-700 group`}
                            >
                              {/* Ken Burns Animated Background Image */}
                              <div
                                key={`preview-bg-${previewSlideIndex}-${isUploadedFocused ? 'up' : 'saved'}`}
                                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out animate-ken-burns scale-100"
                                style={
                                  activeBg
                                    ? { backgroundImage: `url(${activeBg})` }
                                    : { backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 50%, #0f172a 100%)' }
                                }
                              />

                              {/* Light Sweep Beam across the banner image */}
                              <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none animate-light-sweep z-10" />

                              {!previewIsPure ? (
                                <>
                                  {/* Dark Gradient Overlay for text banner */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-transparent pointer-events-none z-10" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none z-10" />
                                  <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/25 rounded-full blur-2xl pointer-events-none animate-pulse-glow z-10" />
                                </>
                              ) : (
                                /* Clean bottom subtle vignette for pure graphic banners */
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />
                              )}

                              {/* Slide Prev/Next Overlay Buttons inside Mockup */}
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewFocusUploaded(false);
                                  setPreviewSlideIndex(
                                    (prev) => (prev - 1 + previewSlides.length) % previewSlides.length
                                  );
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all z-30 shadow-md"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewFocusUploaded(false);
                                  setPreviewSlideIndex((prev) => (prev + 1) % previewSlides.length);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all z-30 shadow-md"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>

                              {!previewIsPure ? (
                                <>
                                  {(() => {
                                    const effectiveVisualType: SlideVisualType = isUploadedFocused
                                      ? newSlideVisualType
                                      : (editingSlideIndex === previewSlideIndex ? newSlideVisualType : (currentPreview?.visualType || (currentPreview?.image3D ? 'image' : '3d')));

                                    const effectiveTextAnim: TextAnimationStyle = isUploadedFocused
                                      ? newSlideTextAnimation
                                      : (editingSlideIndex === previewSlideIndex ? newSlideTextAnimation : (currentPreview?.textAnimation || 'typewriter'));

                                    const effectiveBadgeCenter = isUploadedFocused
                                      ? newSlideBadgeCenter
                                      : (editingSlideIndex === previewSlideIndex ? newSlideBadgeCenter : (currentPreview?.badgeCenterText || 'Verified 4K'));

                                    const effectiveBadge1 = isUploadedFocused
                                      ? newSlideBadge1
                                      : (editingSlideIndex === previewSlideIndex ? newSlideBadge1 : (currentPreview?.badge1Text || 'Instant Deploy'));

                                    const effectiveTerminal = isUploadedFocused
                                      ? newSlideTerminalText
                                      : (editingSlideIndex === previewSlideIndex ? newSlideTerminalText : (currentPreview?.terminalText || 'deploy --mode=scale'));

                                    return (
                                      <div className="relative z-20 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                    <div className="sm:col-span-8 space-y-2 max-w-sm">
                                      {/* Pop-in Animated Tag Badge */}
                                      <div
                                        key={`preview-tag-${previewSlideIndex}`}
                                        className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-sky-200 animate-pop-in"
                                      >
                                        <Sparkles className="w-3 h-3 text-amber-300" />
                                        <span>
                                          {currentPreview?.tag || 'Eagle Eye Digital ΓÇó Featured'}
                                        </span>
                                      </div>

                                      {/* Animated Color Gradient & Typewriter Title */}
                                      <h4 className="text-base sm:text-xl font-black tracking-tight leading-tight min-h-[44px]">
                                        <span className={`bg-clip-text text-transparent transition-all ${
                                          effectiveTextAnim === 'gradient'
                                            ? 'bg-gradient-to-r from-amber-200 via-rose-300 to-cyan-300 animate-gradient-text'
                                            : effectiveTextAnim === 'fade'
                                            ? 'bg-gradient-to-r from-white via-slate-100 to-sky-200 animate-pop-in'
                                            : effectiveTextAnim === 'bounce'
                                            ? 'bg-gradient-to-r from-white via-amber-200 to-cyan-300 animate-pop-in'
                                            : effectiveTextAnim === 'none'
                                            ? 'bg-gradient-to-r from-white via-slate-100 to-sky-100'
                                            : 'bg-gradient-to-r from-white via-amber-200 to-cyan-300 animate-gradient-text'
                                        }`}>
                                          {effectiveTextAnim === 'typewriter'
                                            ? previewTypedTitle
                                            : (isUploadedFocused ? (newSlideTitle || 'Preview Headline') : (currentPreview?.title || 'Empower Your Growth With Intelligent Strategy'))}
                                        </span>
                                        {effectiveTextAnim === 'typewriter' && (
                                          <span className="inline-block w-1 h-4 sm:h-5 ml-1 bg-amber-400 animate-pulse align-middle" />
                                        )}
                                      </h4>

                                      <p
                                        key={`preview-desc-${previewSlideIndex}`}
                                        className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed animate-pop-in"
                                      >
                                        {currentPreview?.description ||
                                          'From performance marketing to ready-to-deploy UI assets and digital products.'}
                                      </p>
                                    </div>

                                    {/* Floating Visual Based on Selected Visual Mode in Preview */}
                                    <div className="sm:col-span-4 hidden sm:flex items-center justify-center">
                                      {effectiveVisualType === 'image' ? (
                                        <div
                                          key={`preview-3d-${previewSlideIndex}`}
                                          className="w-24 h-24 rounded-xl overflow-hidden p-1.5 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl animate-pop-in animate-float"
                                        >
                                          <img
                                            src={newSlideImage3D || active3D || activeBg || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
                                            alt="3D Preview"
                                            className="w-full h-full object-cover rounded-lg"
                                          />
                                        </div>
                                      ) : effectiveVisualType === 'text' ? (
                                        <div className="w-28 h-24 rounded-xl bg-slate-950/95 border border-indigo-500/40 p-2 shadow-xl flex flex-col justify-between text-[8px] font-mono animate-pop-in animate-float">
                                          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                                            <div className="flex gap-1">
                                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                            </div>
                                            <span className="text-[7px] text-slate-500">code</span>
                                          </div>
                                          <div className="text-emerald-400 font-bold truncate">
                                            $ {effectiveTerminal}
                                          </div>
                                          <div className="text-amber-300 text-[7px] font-semibold">
                                            ⚡ Strategy: +320%
                                          </div>
                                          <div className="text-emerald-400 text-[7px] border-t border-slate-800/80 pt-0.5">
                                            ● ONLINE
                                          </div>
                                        </div>
                                      ) : effectiveVisualType === 'hybrid' ? (
                                        <div className="w-24 h-24 rounded-xl bg-blue-950/80 border border-blue-400/40 p-2 text-center flex flex-col items-center justify-center space-y-1 text-white shadow-xl animate-pop-in animate-float">
                                          <span className="text-base">🔄</span>
                                          <span className="text-[9px] font-extrabold text-sky-300">Hybrid Mode</span>
                                          <span className="text-[7px] text-slate-300 leading-tight">Text ➔ 3D ➔ Pic</span>
                                        </div>
                                      ) : (
                                        /* 3D Orb & Floating Badges */
                                        <div
                                          key={`preview-orb-${previewSlideIndex}`}
                                          className="relative w-24 h-24 flex items-center justify-center animate-pop-in"
                                        >
                                          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600/40 via-indigo-500/30 to-amber-400/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg animate-float">
                                            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                                          </div>
                                          <div className="absolute -top-1 -left-1 px-2 py-0.5 rounded-lg bg-slate-900/80 border border-amber-400/40 text-[8px] font-black text-amber-300 animate-float flex items-center space-x-1">
                                            <span>🚀</span>
                                            <span>{effectiveBadge1 || 'Instant'}</span>
                                          </div>
                                          <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-lg bg-indigo-950/80 border border-sky-400/40 text-[7px] font-bold text-sky-300 animate-float-reverse">
                                            {effectiveBadgeCenter || 'Verified 4K'}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}

                                  {/* Buttons and Indicator Dots */}
                                  <div className="relative z-20 pt-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] shadow-sm flex items-center space-x-1">
                                        <span>Browse Products</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </span>
                                      <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[10px] backdrop-blur-md">
                                        Agency Services
                                      </span>
                                    </div>

                                    {/* Clickable Slide Indicator Dots in Preview */}
                                    <div className="flex items-center space-x-1.5 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                                      {previewSlides.map((_, idx) => (
                                        <button
                                          key={idx}
                                          type="button"
                                          onClick={() => {
                                            setPreviewFocusUploaded(false);
                                            setPreviewSlideIndex(idx);
                                          }}
                                          aria-label={`Slide ${idx + 1}`}
                                          className={`transition-all duration-300 rounded-full ${
                                            previewSlideIndex === idx && !isUploadedFocused
                                              ? 'w-5 h-2 bg-gradient-to-r from-amber-400 to-amber-300 shadow-sm'
                                              : 'w-2 h-2 bg-white/35 hover:bg-white'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                /* Pure Banner Display in Preview (Clean, unobstructed with animations) */
                                <div className="relative z-20 h-full flex flex-col justify-between">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-white/20 flex items-center space-x-1.5 shadow-md">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                                      <span>
                                        {isUploadedFocused
                                          ? '✨ Live Uploaded Picture (আপনার ছবি অ্যানিমেশনসহ)'
                                          : '✨ Clean Graphic Banner (ফুল ব্যানার মোড)'}
                                      </span>
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between pt-16">
                                    <span className="text-[10px] font-bold text-white/80 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10">
                                      Click opens: {newSlideLink || '/products'}
                                    </span>

                                    {/* Indicator Dots */}
                                    <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                                      {previewSlides.map((_, idx) => (
                                        <button
                                          key={idx}
                                          type="button"
                                          onClick={() => {
                                            setPreviewFocusUploaded(false);
                                            setPreviewSlideIndex(idx);
                                          }}
                                          aria-label={`Slide ${idx + 1}`}
                                          className={`transition-all duration-300 rounded-full ${
                                            previewSlideIndex === idx && !isUploadedFocused
                                              ? 'w-5 h-2 bg-gradient-to-r from-amber-400 to-amber-300 shadow-sm'
                                              : 'w-2 h-2 bg-white/40 hover:bg-white'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Side Promo Posters Column (Rendered when in 'full-layout' view) */}
                            {previewViewMode === 'full-layout' && (
                              <div className="md:col-span-4 flex flex-col gap-2.5">
                                {/* Card 1 */}
                                <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 flex items-center justify-between overflow-hidden shadow-sm">
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] uppercase font-bold text-sky-400">
                                      {bentoForm.card1Tag || 'Growth Partner'}
                                    </span>
                                    <h5 className="text-xs font-black text-white line-clamp-1">
                                      {bentoForm.card1Title || 'Social Growth & Media'}
                                    </h5>
                                    <span className="text-[9px] text-sky-400 font-bold block">
                                      {bentoForm.card1LinkText || 'Explore Retainers ΓåÆ'}
                                    </span>
                                  </div>
                                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                                    {bentoForm.card1Image ? (
                                      <img src={bentoForm.card1Image} alt="Card 1" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-base font-black text-white">in</span>
                                    )}
                                  </div>
                                </div>

                                {/* Card 2 */}
                                <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 flex items-center justify-between overflow-hidden shadow-sm">
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] uppercase font-bold text-amber-400">
                                      {bentoForm.card2Tag || 'Ready Code'}
                                    </span>
                                    <h5 className="text-xs font-black text-white line-clamp-1">
                                      {bentoForm.card2Title || 'Deployable UI Assets'}
                                    </h5>
                                    <span className="text-[9px] text-amber-400 font-bold block">
                                      Get Products ΓåÆ
                                    </span>
                                  </div>
                                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                                    {bentoForm.card2Image ? (
                                      <img src={bentoForm.card2Image} alt="Card 2" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-base font-black text-white">ui</span>
                                    )}
                                  </div>
                                </div>

                                {/* Card 3 */}
                                <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 flex items-center justify-between overflow-hidden shadow-sm">
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] uppercase font-bold text-emerald-400">
                                      {bentoForm.card3Tag || 'Store'}
                                    </span>
                                    <h5 className="text-xs font-black text-white line-clamp-1">
                                      {bentoForm.card3Title || 'Official Digital Store'}
                                    </h5>
                                    <span className="text-[9px] text-emerald-400 font-bold block">
                                      {bentoForm.card3LinkText || 'Shop Store ΓåÆ'}
                                    </span>
                                  </div>
                                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                                    {bentoForm.card3Image ? (
                                      <img src={bentoForm.card3Image} alt="Card 3" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-base font-black text-white">shop</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* ACTIVE HERO SLIDER BANNERS LIST */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                          ACTIVE HERO SLIDER BANNERS ({(bentoForm.heroSlides || defaultHeroSlides).length})
                        </h3>
                        <span className="text-[10px] text-slate-400">
                          Rotates automatically on Homepage with smooth animation
                        </span>
                      </div>

                      {/* Remove Demo Placeholders button */}
                      <button
                        type="button"
                        onClick={handleClearDemoSlides}
                        className="text-[11px] font-extrabold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition-colors flex items-center space-x-1 shadow-sm"
                        title="Remove placeholder demo banners and keep only your custom uploads"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Demo Placeholders</span>
                      </button>
                    </div>

                    {(bentoForm.heroSlides || defaultHeroSlides).length === 0 ? (
                      <div className="py-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                          <Image className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-700">No custom slider banners uploaded yet</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Default marketplace banners are currently showing. Upload your custom banners using the form on the left.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(bentoForm.heroSlides || defaultHeroSlides).map((slide, idx) => {
                          const isEditingThis = editingSlideIndex === idx;
                          return (
                            <div
                              key={slide.id || idx}
                              className={`p-4 rounded-xl border transition-all space-y-2 group ${
                                isEditingThis
                                  ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20'
                                  : 'border-slate-200/90 hover:border-blue-400 bg-slate-50/50 hover:bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                    Slide #{idx + 1}
                                  </span>
                                  {isEditingThis && (
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                      Editing Now
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditSlide(slide, idx)}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 p-1"
                                    title="Edit Slide"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteHeroSlide(idx)}
                                    className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                                    title="Delete Slide"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-4 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                                  {slide.bgImage ? (
                                    <img src={slide.bgImage} alt={slide.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-bold">
                                      Default Wave
                                    </div>
                                  )}
                                </div>
                                <div className="col-span-8 space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <h5 className="font-bold text-slate-900 text-xs line-clamp-1">
                                      {slide.title || 'Pure Graphic Banner'}
                                    </h5>
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                                      {slide.visualType === 'image'
                                        ? '🖼️ Picture'
                                        : slide.visualType === 'text'
                                        ? '💻 Terminal'
                                        : slide.visualType === 'hybrid'
                                        ? '🔄 Hybrid'
                                        : slide.visualType === 'pure-banner' || slide.isPureBanner
                                        ? '🎨 Pure Banner'
                                        : '🔮 3D Orb'}
                                    </span>
                                    {!(slide.visualType === 'pure-banner' || slide.isPureBanner) && (
                                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                        {slide.textAnimation === 'fade'
                                          ? '🌊 Fade'
                                          : slide.textAnimation === 'gradient'
                                          ? '🌈 Gradient'
                                          : slide.textAnimation === 'bounce'
                                          ? '⚡ Bounce'
                                          : slide.textAnimation === 'none'
                                          ? '⏹️ Static'
                                          : '⌨️ Typewriter'}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 font-mono line-clamp-1">
                                    Destination: {slide.btn1Link || '/products'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: SIDE PROMO POSTERS (SCREEN 2) */}
            {bentoActiveTab === 'posters' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: + UPLOAD SIDE PROMO POSTER */}
                <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
                  <div>
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-blue-600">
                      <Plus className="w-4 h-4 text-blue-600" />
                      <span className="text-slate-900">+ UPLOAD SIDE PROMO POSTER</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      These posters appear on the right side of the Hero section (Fixed promos, do not slide).
                    </p>
                  </div>

                  <form onSubmit={handleSaveSidePoster} className="space-y-4 text-xs">
                    {/* Select Poster Slot / Position */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700">
                        Select Poster Slot / Position *
                      </label>

                      <div className="space-y-2">
                        {/* Slot 1: Top Poster */}
                        <div
                          onClick={() => setPosterSlot('top')}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                            posterSlot === 'top'
                              ? 'border-blue-600 bg-blue-50/20 ring-1 ring-blue-600'
                              : 'border-slate-200 bg-white hover:bg-slate-50/60'
                          }`}
                        >
                          <input
                            type="radio"
                            name="posterSlot"
                            checked={posterSlot === 'top'}
                            onChange={() => setPosterSlot('top')}
                            className="mt-1 text-blue-600 accent-blue-600"
                          />
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">
                              Top Poster (Wide Banner)
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              e.g. LinkedIn Premium Up To 90% Discount (~800×380px)
                            </span>
                          </div>
                        </div>

                        {/* Slot 2: Bottom-Left Poster */}
                        <div
                          onClick={() => setPosterSlot('bottom-left')}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                            posterSlot === 'bottom-left'
                              ? 'border-blue-600 bg-blue-50/20 ring-1 ring-blue-600'
                              : 'border-slate-200 bg-white hover:bg-slate-50/60'
                          }`}
                        >
                          <input
                            type="radio"
                            name="posterSlot"
                            checked={posterSlot === 'bottom-left'}
                            onChange={() => setPosterSlot('bottom-left')}
                            className="mt-1 text-blue-600 accent-blue-600"
                          />
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">
                              Bottom-Left Poster
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              e.g. Canva / Promo (~400×320px or 16:10)
                            </span>
                          </div>
                        </div>

                        {/* Slot 3: Bottom-Right Poster */}
                        <div
                          onClick={() => setPosterSlot('bottom-right')}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                            posterSlot === 'bottom-right'
                              ? 'border-blue-600 bg-blue-50/20 ring-1 ring-blue-600'
                              : 'border-slate-200 bg-white hover:bg-slate-50/60'
                          }`}
                        >
                          <input
                            type="radio"
                            name="posterSlot"
                            checked={posterSlot === 'bottom-right'}
                            onChange={() => setPosterSlot('bottom-right')}
                            className="mt-1 text-blue-600 accent-blue-600"
                          />
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">
                              Bottom-Right Poster
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              e.g. Adobe / Promo (~400×320px or 16:10)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Poster Image Box */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700">
                        Poster Image *
                      </label>

                      <input
                        ref={sidePosterFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleNewPosterFileUpload(e.target.files?.[0])}
                        className="hidden"
                      />

                      <div className="p-6 border-2 border-dashed border-sky-300 bg-sky-50/20 hover:bg-sky-50/40 rounded-2xl text-center space-y-3 transition-colors">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => sidePosterFileInputRef.current?.click()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Choose Poster Image</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNewPosterImg('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
                              if (!newPosterTitle) setNewPosterTitle('LinkedIn Premium 90% Off Special');
                            }}
                            className="px-3.5 py-1.5 bg-purple-50 text-purple-700 border border-purple-200/80 rounded-full font-bold text-[11px] hover:bg-purple-100 transition-colors flex items-center space-x-1"
                          >
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>Use Perfect 720×380 Side Poster</span>
                          </button>
                        </div>

                        <span className="text-[10px] text-slate-400 block">
                          PNG, JPG, WEBP formats supported (Auto-compressed)
                        </span>

                        <input
                          type="text"
                          value={newPosterImg}
                          onChange={(e) => setNewPosterImg(e.target.value)}
                          placeholder="Or paste direct image URL (ImgBB, Unsplash, etc.)"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                        />

                        {newPosterImg && (
                          <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 h-28 w-full group">
                            <img src={newPosterImg} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setNewPosterImg('')}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Poster Title / Name */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Poster Title / Name
                      </label>
                      <input
                        type="text"
                        value={newPosterTitle}
                        onChange={(e) => setNewPosterTitle(e.target.value)}
                        placeholder="e.g. LinkedIn Premium 90% Off"
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all font-semibold"
                      />
                    </div>

                    {/* Click Destination Link */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Click Destination Link
                      </label>
                      <input
                        type="text"
                        value={newPosterLink}
                        onChange={(e) => setNewPosterLink(e.target.value)}
                        placeholder="/shop"
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all"
                    >
                      Save Poster to Selected Slot
                    </button>
                  </form>
                </div>

                {/* Right Column: CURRENT SIDE POSTERS LAYOUT (Pinned) */}
                <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm sticky top-2 sm:top-4 self-start z-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto">
                  <div>
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                      CURRENT SIDE POSTERS LAYOUT
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Here is how the right side of your homepage looks currently. You can remove any poster to revert to the default or replace it with a new one.
                    </p>
                  </div>

                  {/* Visual Layout Preview Container matching the Homepage Bento */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    {/* Top Poster Box */}
                    <div className="h-40 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-center p-3 relative overflow-hidden group">
                      {bentoForm.card1Image ? (
                        <>
                          <img src={bentoForm.card1Image} alt="Top Poster" className="w-full h-full object-cover rounded-xl" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleRemovePosterSlot('top')}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] shadow-sm flex items-center space-x-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove Poster</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1">
                          <span className="font-bold text-xs text-slate-700 block">
                            Top Poster: Default Demo Active
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Upload to slot "Top Poster" to customize
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Split: Left & Right */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Bottom Left Box */}
                      <div className="h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-center p-3 relative overflow-hidden group">
                        {bentoForm.card2Image ? (
                          <>
                            <img src={bentoForm.card2Image} alt="Bottom Left" className="w-full h-full object-cover rounded-xl" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePosterSlot('bottom-left')}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10px] shadow-sm flex items-center space-x-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="font-bold text-xs text-slate-700 block">Bottom Left</span>
                            <span className="text-[10px] text-slate-400 block">Default Demo Active</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Right Box */}
                      <div className="h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-center p-3 relative overflow-hidden group">
                        {bentoForm.card3Image ? (
                          <>
                            <img src={bentoForm.card3Image} alt="Bottom Right" className="w-full h-full object-cover rounded-xl" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePosterSlot('bottom-right')}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10px] shadow-sm flex items-center space-x-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="font-bold text-xs text-slate-700 block">Bottom Right</span>
                            <span className="text-[10px] text-slate-400 block">Default Demo Active</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* UPLOADED CUSTOM POSTERS LIST */}
                  <div className="space-y-3 pt-2">
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                      UPLOADED CUSTOM POSTERS ({[bentoForm.card1Image, bentoForm.card2Image, bentoForm.card3Image].filter(Boolean).length})
                    </h4>

                    {[
                      { slot: 'top' as const, name: 'Top Poster (Wide)', img: bentoForm.card1Image, title: bentoForm.card1Title },
                      { slot: 'bottom-left' as const, name: 'Bottom-Left Poster', img: bentoForm.card2Image, title: bentoForm.card2Title },
                      { slot: 'bottom-right' as const, name: 'Bottom-Right Poster', img: bentoForm.card3Image, title: bentoForm.card3Title }
                    ].filter(p => !!p.img).length === 0 ? (
                      <p className="text-slate-400 text-xs italic py-4 text-center">
                        No custom posters active. Default cards are active on homepage.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {[
                          { slot: 'top' as const, name: 'Top Poster (Wide)', img: bentoForm.card1Image, title: bentoForm.card1Title },
                          { slot: 'bottom-left' as const, name: 'Bottom-Left Poster', img: bentoForm.card2Image, title: bentoForm.card2Title },
                          { slot: 'bottom-right' as const, name: 'Bottom-Right Poster', img: bentoForm.card3Image, title: bentoForm.card3Title }
                        ]
                          .filter((p) => !!p.img)
                          .map((item) => (
                            <div
                              key={item.slot}
                              className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
                                  <img src={item.img!} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <span className="font-bold text-xs text-slate-900 block">{item.name}</span>
                                  <span className="text-[10px] text-slate-400 block">{item.title}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePosterSlot(item.slot)}
                                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                title="Remove Poster"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ================= ADMINS & ROLE MANAGEMENT ================= */}
        {activeMenu === 'admins' && (
          <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Admins & Roles Management
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                    {admins.length} Staff
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  নতুন অ্যাডমিন যুক্ত করুন, রোল নির্ধারণ করুন (Owner, Manager, Editor, Viewer) এবং পারমিশন নিয়ন্ত্রণ করুন
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleOpenAddAdmin}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-2 transition-all shadow-blue-600/20 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Add New Admin (নতুন অ্যাডমিন)</span>
                </button>
              </div>
            </div>

            {/* Notification Alert Message */}
            {adminActionMsg && (
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  adminActionMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{adminActionMsg.text}</span>
                </div>
                <button
                  onClick={() => setAdminActionMsg(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Pending Password Change Requests Alert Section */}
            {admins.filter((a) => a.pendingPasswordRequest?.status === 'pending').length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-950 flex items-center space-x-2">
                      <span>পাসওয়ার্ড পরিবর্তনের মেসেজ ও আবেদন ({admins.filter((a) => a.pendingPasswordRequest?.status === 'pending').length} টি)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 animate-pulse">
                        Pending Approval
                      </span>
                    </h3>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      অ্যাডমিন তাদের পাসওয়ার্ড পরিবর্তন করতে চেয়ে আবেদন করেছেন। নিচে তাদের নতুন পাসওয়ার্ডটি দেখে অনুমোদন (Approve) বা বাতিল (Reject) করুন:
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {admins
                    .filter((a) => a.pendingPasswordRequest?.status === 'pending')
                    .map((reqAdmin) => {
                      const req = reqAdmin.pendingPasswordRequest!;
                      const isRevealed = !!showRequestedPasswords[reqAdmin.id];
                      return (
                        <div
                          key={reqAdmin.id}
                          className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 text-xs">{reqAdmin.name}</span>
                              <span className="text-[11px] text-slate-500 font-mono">({reqAdmin.email})</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 capitalize">
                                {reqAdmin.role}
                              </span>
                            </div>

                            {/* Show the requested password with eye toggle */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              <span className="text-[11px] font-bold text-slate-600">
                                কাঙ্ক্ষিত নতুন পাসওয়ার্ড:
                              </span>
                              <div className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg">
                                <span className="font-mono text-xs font-black text-slate-900 tracking-wider">
                                  {isRevealed ? req.requestedPassword : '••••••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowRequestedPasswords((prev) => ({
                                      ...prev,
                                      [reqAdmin.id]: !prev[reqAdmin.id]
                                    }))
                                  }
                                  className="text-slate-500 hover:text-slate-800 p-0.5"
                                  title={isRevealed ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                                >
                                  {isRevealed ? <EyeOff className="w-3.5 h-3.5 text-blue-600" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                (আবেদনের সময়: {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleApprovePassword(reqAdmin.id, reqAdmin.name)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all shadow-emerald-600/20 active:scale-95"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve (অনুমোদন করুন)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectPassword(reqAdmin.id, reqAdmin.name)}
                              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl transition-all active:scale-95"
                            >
                              <X className="w-4 h-4" />
                              <span>Reject (বাতিল)</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    OWNERS (মালিক)
                  </span>
                  <span className="text-xl font-black text-slate-900 block">
                    {admins.filter((a) => a.role === 'owner').length}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    MANAGERS (ম্যানেজার)
                  </span>
                  <span className="text-xl font-black text-slate-900 block">
                    {admins.filter((a) => a.role === 'manager').length}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    EDITORS (এডিটর)
                  </span>
                  <span className="text-xl font-black text-slate-900 block">
                    {admins.filter((a) => a.role === 'editor').length}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-600 border border-slate-500/20">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    VIEWERS (সাপোর্ট)
                  </span>
                  <span className="text-xl font-black text-slate-900 block">
                    {admins.filter((a) => a.role === 'viewer').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Guide Cards */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Role & Permissions Guide (অ্যাডমিন রোলের ক্ষমতা ও সুবিধা)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span>Owner (প্রধান মালিক)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    সম্পূর্ণ অ্যাক্সেস। নতুন অ্যাডমিন যোগ, এডিট ও ডিলিট, সেটিংস পরিবর্তন, পণ্য ও অর্ডার মুছে ফেলা সহ সব নিয়ন্ত্রণ।
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-blue-900">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>Manager (ম্যানেজার)</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    অপারেশন ও ক্যাটালগ। প্রোডাক্ট, সার্ভিস, ক্যাটাগরি, হোমপেজ ব্যানার ম্যানেজ এবং অর্ডার ভেরিফাই ও লিডস প্রসেস।
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Editor (কনটেন্ট এডিটর)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    কনটেন্ট তৈরি ও এডিট। নতুন প্রোডাক্ট যোগ, ইমেজ আপলোড, ড্রাইভ লিংক বসানো ও সার্ভিস আপডেট (ডিলিট বা অর্ডারে হাত দেওয়া নিষেধ)।
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>Viewer / Support (সাপোর্ট)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    কাস্টমার সার্ভিস। ইনকোয়ারি ও লিডস হ্যান্ডল করা, নোট লেখা এবং অর্ডার দেখা (রিড-অনলি ক্যাটালগ এক্সেস)।
                  </p>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="খুঁজুন - নাম, ইমেইল বা পদবী দিয়ে..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 shadow-sm"
                />
              </div>

              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'owner', 'manager', 'editor', 'viewer'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setAdminRoleFilter(role)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors whitespace-nowrap ${
                      adminRoleFilter === role
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {role === 'all' ? 'All Roles' : role}
                  </button>
                ))}
              </div>
            </div>

            {/* Admins Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-5">Admin / Staff Member</th>
                      <th className="py-3.5 px-5">Email & Contact</th>
                      <th className="py-3.5 px-5">Assigned Role</th>
                      <th className="py-3.5 px-5">Access Password</th>
                      <th className="py-3.5 px-5">Permissions</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredAdmins.length > 0 ? (
                      filteredAdmins.map((admin) => {
                        const isPrimary =
                          admin.id === 'primary-owner' ||
                          admin.uid === ADMIN_UID ||
                          admin.email.toLowerCase() === (BUSINESS_EMAIL || 'tamimnur908@gmail.com').toLowerCase();
                        const isMe = Boolean(currentUser?.email && currentUser.email.toLowerCase() === admin.email.toLowerCase());

                        return (
                          <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                            {/* Member */}
                            <td className="py-4 px-5">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                                  {admin.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-bold text-slate-900 block truncate">
                                      {admin.name}
                                    </span>
                                    {isMe && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-400 block truncate">
                                    {admin.designation || (isPrimary ? 'Founder & CEO' : 'Staff Admin')}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="py-4 px-5 text-slate-600">
                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-1.5">
                                  <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                  <span className="font-mono text-slate-800 text-[11px]">{admin.email}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(admin.email);
                                      alert(`Copied ${admin.email} to clipboard!`);
                                    }}
                                    className="text-slate-300 hover:text-slate-600 p-0.5"
                                    title="Copy Email"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                                {admin.phone && (
                                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                                    <Phone className="w-2.5 h-2.5" />
                                    <span>{admin.phone}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Role */}
                            <td className="py-4 px-5">
                              <div className="space-y-1.5">
                                <div>{renderRoleBadge(admin.role)}</div>
                                {!isPrimary && (
                                  <select
                                    value={admin.role}
                                    onChange={(e) => handleQuickRoleChange(admin, e.target.value as AdminRole)}
                                    className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 font-semibold focus:outline-none"
                                  >
                                    <option value="owner">Change to Owner</option>
                                    <option value="manager">Change to Manager</option>
                                    <option value="editor">Change to Editor</option>
                                    <option value="viewer">Change to Viewer</option>
                                  </select>
                                )}
                              </div>
                            </td>

                            {/* Access Password */}
                            <td className="py-4 px-5">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                    {showAdminTablePasswords[admin.id]
                                      ? (admin.adminPassword || 'None')
                                      : (admin.adminPassword ? '••••••••' : 'None')}
                                  </span>
                                  {admin.adminPassword && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setShowAdminTablePasswords((prev) => ({
                                          ...prev,
                                          [admin.id]: !prev[admin.id]
                                        }))
                                      }
                                      className="text-slate-400 hover:text-slate-700 p-0.5"
                                      title={showAdminTablePasswords[admin.id] ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                                    >
                                      {showAdminTablePasswords[admin.id] ? (
                                        <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                                      ) : (
                                        <Eye className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}
                                </div>
                                {admin.pendingPasswordRequest?.status === 'pending' && (
                                  <div className="flex items-center space-x-1 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                                    <span>Req:</span>
                                    <span className="font-mono font-bold">
                                      {showRequestedPasswords[admin.id]
                                        ? admin.pendingPasswordRequest.requestedPassword
                                        : '••••••'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setShowRequestedPasswords((prev) => ({
                                          ...prev,
                                          [admin.id]: !prev[admin.id]
                                        }))
                                      }
                                      className="text-amber-600 hover:text-amber-800"
                                      title="Toggle reveal"
                                    >
                                      {showRequestedPasswords[admin.id] ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleApprovePassword(admin.id, admin.name)}
                                      className="ml-1 text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold hover:bg-emerald-700"
                                    >
                                      Approve
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Permissions */}
                            <td className="py-4 px-5">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {admin.role === 'owner' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    Full Access (All Permissions)
                                  </span>
                                ) : (
                                  <>
                                    {admin.permissions?.canManageProducts && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-700">
                                        Products
                                      </span>
                                    )}
                                    {admin.permissions?.canDeleteProducts && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-red-50 text-red-700">
                                        Delete Prod
                                      </span>
                                    )}
                                    {admin.permissions?.canManageServices && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-700">
                                        Services
                                      </span>
                                    )}
                                    {admin.permissions?.canManageOrders && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-700">
                                        Orders
                                      </span>
                                    )}
                                    {admin.permissions?.canManageLeads && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700">
                                        Leads
                                      </span>
                                    )}
                                    {admin.permissions?.canManageHomepage && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700">
                                        Banners
                                      </span>
                                    )}
                                    {admin.permissions?.canManageSettings && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-50 text-purple-700">
                                        Settings
                                      </span>
                                    )}
                                    {admin.permissions?.canManageAdmins && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-700">
                                        Admins
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-5">
                              {admin.status === 'suspended' ? (
                                <button
                                  onClick={() => handleToggleAdminStatus(admin)}
                                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                  title="Click to Activate"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                  <span>Suspended</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => !isPrimary && handleToggleAdminStatus(admin)}
                                  disabled={isPrimary}
                                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ${
                                    isPrimary ? 'cursor-default' : 'hover:bg-emerald-100 transition-colors'
                                  }`}
                                  title={isPrimary ? 'Primary Owner is always active' : 'Click to Suspend'}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Active</span>
                                </button>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => handleOpenEditAdmin(admin)}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Permissions & Details"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteAdmin(admin)}
                                  disabled={Boolean(isPrimary || isMe)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isPrimary || isMe
                                      ? 'text-slate-200 cursor-not-allowed'
                                      : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                  }`}
                                  title={
                                    isPrimary
                                      ? 'Primary Owner cannot be deleted'
                                      : isMe
                                      ? 'Cannot delete your own account while logged in'
                                      : 'Revoke Admin Access'
                                  }
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 text-xs italic">
                          কোনো অ্যাডমিন পাওয়া যায়নি। "+ Add New Admin" বাটনে ক্লিক করে নতুন অ্যাডমিন যুক্ত করুন।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= LEADS & INQUIRIES TAB ================= */}
        {activeMenu === 'leads' && (
          <div className="space-y-6">
            {/* Header & Notification Settings Bar */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
                  <Inbox className="w-6 h-6 text-blue-600" />
                  <span>Leads & Client Inquiries ({leads.length})</span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review customer project inquiries, schedule video consultations, and manage automated email notification recipients
                </p>
              </div>

              {/* Notification Recipient Settings Trigger */}
              <button
                type="button"
                onClick={() => setIsNotificationModalOpen(true)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-sm ${
                  notificationSettings.leadRecipientEmails.length === 0
                    ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                {notificationSettings.leadRecipientEmails.length === 0 ? (
                  <>
                    <BellOff className="w-4 h-4 text-white" />
                    <span>Email Notifications: PAUSED (0 recipients)</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span>Notification Emails: {notificationSettings.leadRecipientEmails.length} Configured</span>
                  </>
                )}
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Settings
                </span>
              </button>
            </div>

            {/* Notification Recipient Alert Banner if 0 emails */}
            {notificationSettings.leadRecipientEmails.length === 0 && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>Notice:</strong> No notification recipient emails are currently set. Inquiries will be saved to the database but no alert emails will be dispatched until an email is added.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotificationModalOpen(true)}
                  className="underline font-bold hover:text-amber-950 flex-shrink-0 ml-3"
                >
                  Configure Now
                </button>
              </div>
            )}

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <button
                type="button"
                onClick={() => setLeadsFilter('all')}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  leadsFilter === 'all'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-wider block ${
                  leadsFilter === 'all' ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  TOTAL INQUIRIES
                </span>
                <span className="text-2xl font-black block mt-1">{leadStats.total}</span>
                <span className={`text-[11px] block mt-0.5 ${
                  leadsFilter === 'all' ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  All received
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLeadsFilter('new')}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  leadsFilter === 'new'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-wider block ${
                  leadsFilter === 'new' ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  NEW & UNREAD
                </span>
                <span className="text-2xl font-black block mt-1 text-blue-500">{leadStats.newCount}</span>
                <span className={`text-[11px] block mt-0.5 ${
                  leadsFilter === 'new' ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  Needs response
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLeadsFilter('scheduled')}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  leadsFilter === 'scheduled'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20'
                    : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-wider block ${
                  leadsFilter === 'scheduled' ? 'text-amber-100' : 'text-slate-400'
                }`}>
                  SCHEDULED
                </span>
                <span className="text-2xl font-black block mt-1 text-amber-500">{leadStats.scheduledCount}</span>
                <span className={`text-[11px] block mt-0.5 ${
                  leadsFilter === 'scheduled' ? 'text-amber-100' : 'text-slate-400'
                }`}>
                  Pending client
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLeadsFilter('confirmed')}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  leadsFilter === 'confirmed'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                    : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-wider block ${
                  leadsFilter === 'confirmed' ? 'text-emerald-100' : 'text-slate-400'
                }`}>
                  CONFIRMED
                </span>
                <span className="text-2xl font-black block mt-1 text-emerald-500">{leadStats.confirmedCount}</span>
                <span className={`text-[11px] block mt-0.5 ${
                  leadsFilter === 'confirmed' ? 'text-emerald-100' : 'text-slate-400'
                }`}>
                  Client accepted
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLeadsFilter('cancelled')}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  leadsFilter === 'cancelled'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20'
                    : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-wider block ${
                  leadsFilter === 'cancelled' ? 'text-rose-100' : 'text-slate-400'
                }`}>
                  CANCELLED / LOST
                </span>
                <span className="text-2xl font-black block mt-1 text-rose-500">{leadStats.cancelledCount}</span>
                <span className={`text-[11px] block mt-0.5 ${
                  leadsFilter === 'cancelled' ? 'text-rose-100' : 'text-slate-400'
                }`}>
                  Declined or closed
                </span>
              </button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by client name, email, phone, business or service..."
                  value={leadsSearch}
                  onChange={(e) => setLeadsSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                {leadsSearch && (
                  <button
                    type="button"
                    onClick={() => setLeadsSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {(['all', 'new', 'scheduled', 'confirmed', 'cancelled', 'archived'] as const).map((filterKey) => {
                  const labelMap: Record<string, string> = {
                    all: 'All',
                    new: 'New',
                    scheduled: 'Scheduled',
                    confirmed: 'Confirmed',
                    cancelled: 'Cancelled',
                    archived: 'Archived / Won'
                  };
                  const active = leadsFilter === filterKey;
                  return (
                    <button
                      key={filterKey}
                      type="button"
                      onClick={() => setLeadsFilter(filterKey)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                        active
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {labelMap[filterKey]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Leads Table & Cards */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-5">Client & Contact</th>
                      <th className="py-3.5 px-5">Service & Budget</th>
                      <th className="py-3.5 px-5">Requirement & Message</th>
                      <th className="py-3.5 px-5">Meeting / Consultation</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map((lead) => {
                        const hasMeeting = Boolean(lead.meetingDetails?.scheduledTime);
                        const meetingStatus = lead.meetingDetails?.meetingStatus || 'proposed';
                        return (
                          <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                            {/* Client & Contact */}
                            <td className="py-4 px-5 align-top">
                              <div className="space-y-1">
                                <span className="font-bold text-slate-900 text-sm block">{lead.name}</span>
                                <span className="text-[11px] text-slate-500 block font-medium">
                                  {lead.businessName || 'Individual Client'}
                                </span>
                                <div className="pt-1 flex flex-col space-y-1">
                                  <a
                                    href={`mailto:${lead.email}`}
                                    className="inline-flex items-center space-x-1 font-mono text-[11px] text-blue-600 hover:underline"
                                  >
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span>{lead.email}</span>
                                  </a>
                                  {lead.phoneOrWhatsApp && (
                                    <div className="flex items-center space-x-2">
                                      <a
                                        href={`https://wa.me/${lead.phoneOrWhatsApp.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-600 hover:underline"
                                      >
                                        <MessageSquare className="w-3 h-3 text-emerald-500" />
                                        <span>WhatsApp</span>
                                      </a>
                                      <span className="text-slate-300">•</span>
                                      <a
                                        href={`tel:${lead.phoneOrWhatsApp}`}
                                        className="text-[11px] text-slate-500 hover:text-slate-700 font-mono"
                                      >
                                        {lead.phoneOrWhatsApp}
                                      </a>
                                    </div>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 block pt-1">
                                  Submitted: {formatDateTime(lead.createdAt)}
                                </span>
                              </div>
                            </td>

                            {/* Service & Budget */}
                            <td className="py-4 px-5 align-top">
                              <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                {lead.serviceInterest}
                              </span>
                              <div className="mt-1.5">
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Budget</span>
                                <span className="text-xs font-bold text-slate-800">{lead.budgetRange}</span>
                              </div>
                            </td>

                            {/* Requirement / Message */}
                            <td className="py-4 px-5 align-top max-w-xs">
                              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-[11px] leading-relaxed max-h-28 overflow-y-auto whitespace-pre-wrap">
                                {lead.projectDescription || 'No additional notes provided.'}
                              </div>
                            </td>

                            {/* Meeting / Consultation */}
                            <td className="py-4 px-5 align-top">
                              {hasMeeting ? (
                                <div className="space-y-1.5 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200">
                                  <div className="flex items-center space-x-1.5">
                                    {meetingStatus === 'confirmed' && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Client Confirmed</span>
                                      </span>
                                    )}
                                    {meetingStatus === 'proposed' && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 flex items-center space-x-1">
                                        <Clock className="w-3 h-3" />
                                        <span>Awaiting Confirmation</span>
                                      </span>
                                    )}
                                    {meetingStatus === 'cancelled' && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 flex items-center space-x-1">
                                        <X className="w-3 h-3" />
                                        <span>Meeting Cancelled</span>
                                      </span>
                                    )}
                                    {meetingStatus === 'completed' && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 flex items-center space-x-1">
                                        <Check className="w-3 h-3" />
                                        <span>Completed</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-[11px] text-slate-700 font-bold flex items-center space-x-1 pt-0.5">
                                    <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                    <span>{formatDateTime(lead.meetingDetails?.scheduledTime)}</span>
                                  </div>

                                  <div className="text-[10px] text-slate-400">
                                    Host: {lead.meetingDetails?.scheduledBy || 'Admin'}
                                  </div>

                                  {lead.meetingDetails?.meetingLink && (
                                    <div className="pt-1 flex items-center space-x-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleCopyMeetingLink(lead.id, lead.meetingDetails!.meetingLink)}
                                        className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg flex items-center space-x-1 shadow-sm"
                                        title={lead.meetingDetails.meetingLink}
                                      >
                                        {copiedLeadId === lead.id ? (
                                          <>
                                            <Check className="w-3 h-3 text-emerald-600" />
                                            <span className="text-emerald-700">Copied</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            <span>Copy Link</span>
                                          </>
                                        )}
                                      </button>

                                      <a
                                        href={lead.meetingDetails.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg flex items-center space-x-1 shadow-sm"
                                      >
                                        <Video className="w-3 h-3" />
                                        <span>Join</span>
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1 text-slate-400">
                                  <span className="text-[11px] italic block">No meeting scheduled yet</span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenMeetingModal(lead)}
                                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                                  >
                                    <Calendar className="w-3 h-3" />
                                    <span>Schedule Consultation &rarr;</span>
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Status Selector */}
                            <td className="py-4 px-5 align-top">
                              <select
                                value={lead.status}
                                onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Proposal Sent">Proposal Sent</option>
                                <option value="Negotiation">Negotiation</option>
                                <option value="Won">Won</option>
                                <option value="Lost">Lost</option>
                                <option value="Meeting Scheduled">Meeting Scheduled</option>
                                <option value="Meeting Confirmed">Meeting Confirmed</option>
                                <option value="Meeting Cancelled">Meeting Cancelled</option>
                              </select>
                            </td>

                            {/* Actions Column */}
                            <td className="py-4 px-5 align-top text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenMeetingModal(lead)}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition-colors"
                                  title="Schedule or Reschedule Video Meeting"
                                >
                                  <Video className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{hasMeeting ? 'Edit Time' : 'Book Time'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLead(lead)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete Lead"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <div className="max-w-xs mx-auto space-y-2">
                            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-sm font-bold text-slate-700">No Inquiries Found</p>
                            <p className="text-xs text-slate-400">
                              {leadsSearch || leadsFilter !== 'all'
                                ? 'No leads matched your current search filters.'
                                : 'Submitted client inquiries will appear here automatically.'}
                            </p>
                            {(leadsSearch || leadsFilter !== 'all') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setLeadsSearch('');
                                  setLeadsFilter('all');
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl mt-2"
                              >
                                Reset Search & Filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= SITE SETTINGS TAB ================= */}
        {activeMenu === 'settings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Settings className="w-6 h-6 text-indigo-600" />
                  Site & Brand Settings
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dynamic brand identity, agency logo, support credentials, and store configurations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {siteSettingsSaved && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Saved & Synced Live!
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleToggleSideFullPreview}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.01]"
                  title="Toggle between Section Preview and Full Website in the side panel"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>
                    {sidePreviewScope === 'full'
                      ? '🎯 View Section Preview'
                      : '🌐 View Full Website Preview'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveSiteSettings}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>

            {/* Settings Form Grid (Side-by-Side with Live Preview) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column: Editable Fields (7 cols) */}
              <div className="xl:col-span-7 space-y-6">
                {/* Brand Identity Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Brand Identity & Logo
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Brand & Agency Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={siteForm.brandName || ''}
                        onChange={(e) => setSiteForm({ ...siteForm, brandName: e.target.value })}
                        placeholder="Eagle Eye Digital"
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Renders across Navbar, Footer, and page metadata.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Brand Tagline <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={siteForm.tagline || ''}
                        onChange={(e) => setSiteForm({ ...siteForm, tagline: e.target.value })}
                        placeholder="YOUR DIGITAL WORLD"
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Sub-badge beneath the brand name in Header & Footer.</span>
                    </div>
                  </div>

                  {/* Brand Logo Upload & URL */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <label className="block text-xs font-bold text-slate-700">
                      Brand Logo (Image or URL)
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                      {/* Logo Preview */}
                      <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-sm overflow-hidden flex-shrink-0">
                        {siteForm.logoUrl ? (
                          <img src={siteForm.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                        ) : (
                          <span className="text-[10px] font-black text-indigo-600 text-center leading-tight">EAGLE EYE</span>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="file"
                            ref={logoFileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                          />
                          <button
                            type="button"
                            onClick={() => logoFileInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Upload Logo Image
                          </button>
                          {siteForm.logoUrl && (
                            <button
                              type="button"
                              onClick={() => setSiteForm({ ...siteForm, logoUrl: '' })}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Reset to Default
                            </button>
                          )}
                        </div>
                        <input
                          type="url"
                          value={siteForm.logoUrl || ''}
                          onChange={(e) => setSiteForm({ ...siteForm, logoUrl: e.target.value })}
                          placeholder="Or paste direct image URL (https://...)"
                          className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-slate-200 focus:border-indigo-500 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Helplines & Contact Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    Official Support & Helplines
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Official Support Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={siteForm.businessEmail || ''}
                          onChange={(e) => setSiteForm({ ...siteForm, businessEmail: e.target.value })}
                          placeholder="support@eagleeyedigital.com"
                          className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Receives client contacts and displays in footer.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        WhatsApp Helpline Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={siteForm.whatsappNumber || ''}
                          onChange={(e) => setSiteForm({ ...siteForm, whatsappNumber: e.target.value })}
                          placeholder="01836126791"
                          className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Live WhatsApp click-to-chat across Navbar and Footer.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Currency Symbol
                      </label>
                      <input
                        type="text"
                        value={siteForm.currency || '৳'}
                        onChange={(e) => setSiteForm({ ...siteForm, currency: e.target.value })}
                        placeholder="৳"
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-mono"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Currency displayed across services & products (e.g. ৳ or $).</span>
                    </div>
                  </div>
                </div>

                {/* Primary Super Admin UID (Read-Only Security) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Primary Super Admin UID
                      </h2>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Read-Only Security Safeguard
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    For system safety, the root Super Admin UID is protected in configuration and cannot be modified from the browser.
                  </p>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Super Admin UID</span>
                      <span className="text-slate-900 font-mono text-xs font-bold select-all">{ADMIN_UID}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(ADMIN_UID);
                        setCopiedUid(true);
                        setTimeout(() => setCopiedUid(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                    >
                      {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedUid ? 'Copied!' : 'Copy UID'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Live Preview Pane (5 cols, Pinned) */}
              <div className="xl:col-span-5 sticky top-2 sm:top-4 self-start z-20">
                {renderInteractiveWebsitePreviewPane()}
              </div>
            </div>
          </div>
        )}

        {/* ================= HEADER, FOOTER & SOCIAL TAB ================= */}
        {activeMenu === 'footer' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Globe className="w-6 h-6 text-indigo-600" />
                  Header, Footer & Social Presence
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage social links with placement controls (Header, Footer, Floating Sidebar), announcement banner, and footer navigation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSideFullPreview}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.01]"
                  title="Toggle between Section Preview and Full Website in the side panel"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>
                    {sidePreviewScope === 'full'
                      ? '🎯 View Section Preview'
                      : '🌐 View Full Website Preview'}
                  </span>
                </button>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 max-w-full">
              <button
                type="button"
                onClick={() => setHeaderFooterActiveTab('social')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  headerFooterActiveTab === 'social'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-4 h-4" />
                Social Media Manager
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700">
                  {socialList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setHeaderFooterActiveTab('header')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  headerFooterActiveTab === 'header'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                Header & Announcement
              </button>

              <button
                type="button"
                onClick={() => setHeaderFooterActiveTab('footer')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  headerFooterActiveTab === 'footer'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                Footer & Navigation
              </button>
            </div>

            {/* Split Layout: Settings Controls on Left (7 cols) & Interactive Live Preview on Right (5 cols) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-7 space-y-6">
                {/* ================= SUB-TAB 1: SOCIAL MEDIA MANAGER ================= */}
            {headerFooterActiveTab === 'social' && (
              <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      Dynamic Social Channels ({socialList.length})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Toggle active channels and choose where each icon appears: Header, Footer, and Sticky Floating Sidebar.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {socialSaved && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs animate-in fade-in">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Saved & Published!
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsAddingSocial(!isAddingSocial)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {isAddingSocial ? 'Close Form' : 'Add Platform'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveSocialLinks()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Save Social Links
                    </button>
                  </div>
                </div>

                {/* Add New Social Drawer Form */}
                {isAddingSocial && (
                  <form
                    onSubmit={handleAddNewSocial}
                    className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between border-b border-indigo-200/80 pb-3">
                      <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                        <Plus className="w-4 h-4 text-indigo-600" />
                        Add New Social Platform
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddingSocial(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Platform Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newSocialForm.platform || ''}
                          onChange={(e) => setNewSocialForm({ ...newSocialForm, platform: e.target.value })}
                          placeholder="e.g. TikTok, Behance, X"
                          className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-indigo-200 focus:border-indigo-500 text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Select Icon
                        </label>
                        <select
                          value={newSocialForm.iconKey || 'globe'}
                          onChange={(e) => setNewSocialForm({ ...newSocialForm, iconKey: e.target.value })}
                          className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-indigo-200 focus:border-indigo-500 text-slate-900"
                        >
                          {SOCIAL_ICON_OPTIONS.map((opt) => (
                            <option key={opt.key} value={opt.key}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Profile / Page URL <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="url"
                          required
                          value={newSocialForm.url || ''}
                          onChange={(e) => setNewSocialForm({ ...newSocialForm, url: e.target.value })}
                          placeholder="https://tiktok.com/@eagleeye"
                          className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-indigo-200 focus:border-indigo-500 text-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    {newSocialForm.iconKey === 'custom' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Custom Icon Image URL / SVG
                        </label>
                        <input
                          type="url"
                          value={newSocialForm.customIconUrl || ''}
                          onChange={(e) => setNewSocialForm({ ...newSocialForm, customIconUrl: e.target.value })}
                          placeholder="https://example.com/icon.svg"
                          className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-indigo-200 text-slate-900 font-mono"
                        />
                      </div>
                    )}

                    {/* Placements */}
                    <div className="pt-2 border-t border-indigo-200/80 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
                      <span className="text-slate-500 text-[11px] uppercase tracking-wider">Placement Options:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-indigo-100">
                        <input
                          type="checkbox"
                          checked={newSocialForm.showInHeader ?? false}
                          onChange={(e) => setNewSocialForm({ ...newSocialForm, showInHeader: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        Show in Header
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-indigo-100">
                        <input
                          type="checkbox"
                          checked={newSocialForm.showInFooter ?? true}
                          onChange={(e) => setNewSocialForm({ ...newSocialForm, showInFooter: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        Show in Footer
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-indigo-100">
                        <input
                          type="checkbox"
                          checked={newSocialForm.showInFloatingSidebar ?? true}
                          onChange={(e) => setNewSocialForm({ ...newSocialForm, showInFloatingSidebar: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        Show in Sticky Sidebar
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingSocial(false)}
                        className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-white text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                      >
                        Add Platform
                      </button>
                    </div>
                  </form>
                )}

                {/* Social Links List */}
                <div className="space-y-3">
                  {socialList.map((item) => {
                    const iconOpt = SOCIAL_ICON_OPTIONS.find((o) => o.key === item.iconKey);
                    return (
                      <div
                        key={item.id}
                        className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-sm transition-all space-y-3.5 ${
                          item.isActive ? 'border-slate-200/90 hover:border-slate-300' : 'border-slate-200 bg-slate-50/60 opacity-60'
                        }`}
                      >
                        {/* Row 1: Icon, Platform Input & Icon Dropdown, Active Button, Delete Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                            {/* Icon preview badge */}
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm"
                              style={{ backgroundColor: iconOpt?.color || '#4F46E5' }}
                            >
                              <SocialIcon link={item} className="w-5 h-5" size={20} />
                            </div>

                            {/* Platform name editable input (Fluid width, min 100px, max 200px) */}
                            <input
                              type="text"
                              value={item.platform}
                              onChange={(e) => {
                                const updated = socialList.map((s) =>
                                  s.id === item.id ? { ...s, platform: e.target.value } : s
                                );
                                setSocialList(updated);
                              }}
                              placeholder="Platform name"
                              className="flex-1 min-w-[100px] max-w-[200px] text-xs sm:text-sm font-black text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all"
                            />

                            {/* Icon selector dropdown */}
                            <select
                              value={item.iconKey}
                              onChange={(e) => {
                                const updated = socialList.map((s) =>
                                  s.id === item.id ? { ...s, iconKey: e.target.value } : s
                                );
                                setSocialList(updated);
                              }}
                              className="text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer flex-shrink-0"
                            >
                              {SOCIAL_ICON_OPTIONS.map((opt) => (
                                <option key={opt.key} value={opt.key}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Right: Active Toggle & Delete */}
                          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleToggleSocialActive(item.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                item.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {item.isActive ? 'Active' : 'Disabled'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSocial(item.id)}
                              title="Delete Social Channel"
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Row 2: Full-Width Profile URL Input with Test Link */}
                        <div className="flex items-center gap-2 w-full">
                          <div className="relative flex-1 min-w-0">
                            <input
                              type="url"
                              value={item.url}
                              onChange={(e) => {
                                const updated = socialList.map((s) =>
                                  s.id === item.id ? { ...s, url: e.target.value } : s
                                );
                                setSocialList(updated);
                              }}
                              placeholder="https://..."
                              className="w-full text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-9 focus:border-indigo-500 focus:bg-white focus:outline-none"
                            />
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                title="Test Link"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Row 3: Dedicated Placements Checkboxes Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Placements:</span>
                            <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors">
                              <input
                                type="checkbox"
                                checked={item.showInHeader}
                                onChange={() => handleToggleSocialPlacement(item.id, 'header')}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>Header</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors">
                              <input
                                type="checkbox"
                                checked={item.showInFooter}
                                onChange={() => handleToggleSocialPlacement(item.id, 'footer')}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>Footer</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors">
                              <input
                                type="checkbox"
                                checked={item.showInFloatingSidebar}
                                onChange={() => handleToggleSocialPlacement(item.id, 'sidebar')}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>Sidebar</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Save Bar */}
                <div className="flex items-center justify-between p-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
                  <span className="text-xs text-slate-500">
                    Changes take effect across the live website immediately upon saving.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSaveSocialLinks()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save All Social Changes
                  </button>
                </div>
              </div>
            )}

            {/* ================= SUB-TAB 2: HEADER & ANNOUNCEMENT ================= */}
            {headerFooterActiveTab === 'header' && (
              <form onSubmit={handleSaveHeaderConfig} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-600" />
                      Header Navigation & Announcement Bar
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure the top announcement banner, WhatsApp quick chat, and main navigation links.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {headerSaved && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs animate-in fade-in">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Header Saved & Published!
                      </div>
                    )}
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Save Header Settings
                    </button>
                  </div>
                </div>

                {/* Top Announcement Bar Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Top Announcement Banner
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={headerForm.showAnnouncement ?? true}
                        onChange={(e) => setHeaderForm({ ...headerForm, showAnnouncement: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      Enable Announcement Banner
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Announcement Text
                      </label>
                      <input
                        type="text"
                        value={headerForm.announcementText || ''}
                        onChange={(e) => setHeaderForm({ ...headerForm, announcementText: e.target.value })}
                        placeholder="⚡ SPECIAL OFFER: Get 20% off on all Premium Web Design & Digital Marketing bundles this week!"
                        className="w-full text-xs font-medium px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Announcement Link URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={headerForm.announcementLink || ''}
                        onChange={(e) => setHeaderForm({ ...headerForm, announcementLink: e.target.value })}
                        placeholder="/services or https://..."
                        className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Header Chat Support Button Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      Chat Support Button (Navbar Top-Right)
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={headerForm.showChatSupport ?? true}
                        onChange={(e) => setHeaderForm({ ...headerForm, showChatSupport: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      Show Chat Support Pill
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={headerForm.chatSupportText || 'Chat Support'}
                        onChange={(e) => setHeaderForm({ ...headerForm, chatSupportText: e.target.value })}
                        placeholder="Chat Support"
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        WhatsApp Number (override or default)
                      </label>
                      <input
                        type="text"
                        value={headerForm.chatSupportNumber || '01836126791'}
                        onChange={(e) => setHeaderForm({ ...headerForm, chatSupportNumber: e.target.value })}
                        placeholder="01836126791"
                        className="w-full text-xs font-mono px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Header Navigation Links Manager */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    Header Navigation Menu Items ({(headerForm.navLinks || []).length})
                  </h3>

                  {/* Nav Links List */}
                  <div className="space-y-2">
                    {(headerForm.navLinks || []).map((link, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
                      >
                        <span className="text-[10px] font-mono text-slate-400 w-6 text-center font-bold hidden sm:inline-block">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => {
                            const updated = [...(headerForm.navLinks || [])];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            setHeaderForm({ ...headerForm, navLinks: updated });
                          }}
                          placeholder="Menu Label"
                          className="w-full sm:w-40 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-indigo-500 text-slate-900"
                        />
                        <input
                          type="text"
                          value={link.path}
                          onChange={(e) => {
                            const updated = [...(headerForm.navLinks || [])];
                            updated[idx] = { ...updated[idx], path: e.target.value };
                            setHeaderForm({ ...headerForm, navLinks: updated });
                          }}
                          placeholder="/path"
                          className="w-full sm:flex-1 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-indigo-500 text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNavLink(idx)}
                          className="self-end sm:self-auto p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Nav Link Row */}
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={newNavLink.label}
                      onChange={(e) => setNewNavLink({ ...newNavLink, label: e.target.value })}
                      placeholder="New Label (e.g. Portfolio)"
                      className="w-full sm:w-44 text-xs font-bold px-3 py-2 rounded-xl bg-white border border-indigo-200 focus:border-indigo-500 text-slate-900"
                    />
                    <input
                      type="text"
                      value={newNavLink.path}
                      onChange={(e) => setNewNavLink({ ...newNavLink, path: e.target.value })}
                      placeholder="/portfolio or https://..."
                      className="w-full sm:flex-1 text-xs font-mono px-3 py-2 rounded-xl bg-white border border-indigo-200 focus:border-indigo-500 text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddNavLink}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Link
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ================= SUB-TAB 3: FOOTER & NAVIGATION ================= */}
            {headerFooterActiveTab === 'footer' && (
              <form onSubmit={handleSaveFooterConfig} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      Footer Content & Link Columns
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure agency bio, contact coordinates, copyright notice, and categorized footer links.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {footerSaved && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs animate-in fade-in">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Footer Saved & Published!
                      </div>
                    )}
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Save Footer Settings
                    </button>
                  </div>
                </div>

                {/* Brand & Bio Text */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                    Agency Bio & Taglines
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Footer Tagline / Motto
                      </label>
                      <input
                        type="text"
                        value={footerForm.tagline || ''}
                        onChange={(e) => setFooterForm({ ...footerForm, tagline: e.target.value })}
                        placeholder="Empowering businesses through cutting-edge digital experiences."
                        className="w-full text-xs font-medium px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Copyright Notice
                      </label>
                      <input
                        type="text"
                        value={footerForm.copyrightText || ''}
                        onChange={(e) => setFooterForm({ ...footerForm, copyrightText: e.target.value })}
                        placeholder="© 2026 Eagle Eye Digital. All rights reserved."
                        className="w-full text-xs font-medium px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Footer About Agency Description
                    </label>
                    <textarea
                      rows={3}
                      value={footerForm.aboutText || ''}
                      onChange={(e) => setFooterForm({ ...footerForm, aboutText: e.target.value })}
                      placeholder="Eagle Eye Digital is a premier digital agency providing bespoke web development, design systems, and enterprise digital solutions."
                      className="w-full text-xs font-medium px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 text-slate-900"
                    />
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                    Footer Contact & Support Coordinates
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={footerForm.contactEmail || ''}
                        onChange={(e) => setFooterForm({ ...footerForm, contactEmail: e.target.value })}
                        placeholder="support@eagleeyedigital.com"
                        className="w-full text-xs font-mono px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={footerForm.contactPhone || ''}
                        onChange={(e) => setFooterForm({ ...footerForm, contactPhone: e.target.value })}
                        placeholder="+880 1836-126791"
                        className="w-full text-xs font-mono px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Operating Hours
                      </label>
                      <input
                        type="text"
                        value={footerForm.operatingHours || ''}
                        onChange={(e) => setFooterForm({ ...footerForm, operatingHours: e.target.value })}
                        placeholder="Sat - Thu: 9:00 AM - 10:00 PM (GMT+6)"
                        className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Link Lists: Services and Resources */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Services Column */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
                      <span>Services Column Links ({(footerForm.servicesLinks || []).length})</span>
                    </h3>

                    <div className="space-y-2">
                      {(footerForm.servicesLinks || []).map((link, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => {
                              const updated = [...(footerForm.servicesLinks || [])];
                              updated[idx] = { ...updated[idx], label: e.target.value };
                              setFooterForm({ ...footerForm, servicesLinks: updated });
                            }}
                            placeholder="Link Title"
                            className="w-full sm:w-36 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                          />
                          <input
                            type="text"
                            value={link.path}
                            onChange={(e) => {
                              const updated = [...(footerForm.servicesLinks || [])];
                              updated[idx] = { ...updated[idx], path: e.target.value };
                              setFooterForm({ ...footerForm, servicesLinks: updated });
                            }}
                            placeholder="/path"
                            className="w-full sm:flex-1 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveServiceLink(idx)}
                            className="self-end sm:self-auto p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={newServiceLink.label}
                        onChange={(e) => setNewServiceLink({ ...newServiceLink, label: e.target.value })}
                        placeholder="Link Name"
                        className="w-full sm:w-32 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-slate-900"
                      />
                      <input
                        type="text"
                        value={newServiceLink.path}
                        onChange={(e) => setNewServiceLink({ ...newServiceLink, path: e.target.value })}
                        placeholder="/services"
                        className="w-full sm:flex-1 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddServiceLink}
                        className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Resources / Solutions Column */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
                      <span>Resources & Products Links ({(footerForm.resourcesLinks || []).length})</span>
                    </h3>

                    <div className="space-y-2">
                      {(footerForm.resourcesLinks || []).map((link, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => {
                              const updated = [...(footerForm.resourcesLinks || [])];
                              updated[idx] = { ...updated[idx], label: e.target.value };
                              setFooterForm({ ...footerForm, resourcesLinks: updated });
                            }}
                            placeholder="Link Title"
                            className="w-full sm:w-36 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                          />
                          <input
                            type="text"
                            value={link.path}
                            onChange={(e) => {
                              const updated = [...(footerForm.resourcesLinks || [])];
                              updated[idx] = { ...updated[idx], path: e.target.value };
                              setFooterForm({ ...footerForm, resourcesLinks: updated });
                            }}
                            placeholder="/path"
                            className="w-full sm:flex-1 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveResourceLink(idx)}
                            className="self-end sm:self-auto p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={newResourceLink.label}
                        onChange={(e) => setNewResourceLink({ ...newResourceLink, label: e.target.value })}
                        placeholder="Link Name"
                        className="w-full sm:w-32 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-slate-900"
                      />
                      <input
                        type="text"
                        value={newResourceLink.path}
                        onChange={(e) => setNewResourceLink({ ...newResourceLink, path: e.target.value })}
                        placeholder="/products"
                        className="w-full sm:flex-1 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddResourceLink}
                        className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
              </div>

              {/* Right Column: Interactive Live Website Preview Pane (5 cols, Pinned) */}
              <div className="xl:col-span-5 sticky top-2 sm:top-4 self-start z-20">
                {renderInteractiveWebsitePreviewPane()}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* SERVICE MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">
              {serviceForm.id ? 'Edit Service' : 'Add Agency Service'}
            </h3>
            <form onSubmit={handleSaveService} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={serviceForm.name || ''}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Category</label>
                <input
                  type="text"
                  value={serviceForm.category || ''}
                  onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Short Description *</label>
                <textarea
                  rows={3}
                  required
                  value={serviceForm.shortDescription || ''}
                  onChange={(e) => setServiceForm({ ...serviceForm, shortDescription: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Order Details #{selectedOrder.id}
            </h3>
            <div className="space-y-2 text-slate-600">
              <p><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerEmail})</p>
              <p><strong>Total Amount:</strong> ৳{selectedOrder.totalAmount} BDT</p>
              <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
              {selectedOrder.paymentDetails?.transactionId && (
                <p><strong>Trx ID:</strong> <span className="font-mono text-blue-600">{selectedOrder.paymentDetails.transactionId}</span></p>
              )}
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NOTIFICATION RECIPIENT SETTINGS MODAL ================= */}
      {isNotificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Lead Notification Email Settings</h3>
                  <p className="text-[11px] text-slate-500">Configure who receives incoming inquiry alerts</p>
                </div>
              </div>
              <button
                onClick={() => setIsNotificationModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ×
              </button>
            </div>

            {/* Notification Logic Explanation Card */}
            <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1.5 text-slate-700">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 block">Notification Rules:</span>
              <p className="leading-relaxed">
                • <strong>If 1 or more emails are listed:</strong> Every newly submitted client inquiry automatically sends an email with full details and a 1-click scheduling link to ALL listed emails.
              </p>
              <p className="leading-relaxed text-amber-800">
                • <strong>If NO emails are listed:</strong> Notification emails are strictly disabled until an address is configured.
              </p>
            </div>

            {/* Recipient Emails List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">
                  Active Recipient Emails ({(notificationSettings.leadRecipientEmails || []).length}):
                </label>
                {(notificationSettings.leadRecipientEmails || []).length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllRecipients}
                    className="text-[10px] text-red-600 hover:underline font-bold"
                  >
                    Remove All
                  </button>
                )}
              </div>

              {(notificationSettings.leadRecipientEmails || []).length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(notificationSettings.leadRecipientEmails || []).map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{email}</span>
                        {email === DEFAULT_RECIPIENT_EMAIL && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            Default
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipientEmail(email)}
                        className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                        title="Remove Recipient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center text-amber-800 font-semibold">
                  No recipient emails configured. Inquiry notification emails are currently PAUSED.
                </div>
              )}
            </div>

            {/* Add New Email Form */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-700 block">Add Recipient Email Address</label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={newRecipientInput}
                  onChange={(e) => setNewRecipientInput(e.target.value)}
                  placeholder="e.g. support@eagleeyedigital.com"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddRecipientEmail}
                  disabled={notificationSaving || !newRecipientInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm whitespace-nowrap"
                >
                  {notificationSaving ? 'Saving...' : 'Add Email'}
                </button>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleRestoreDefaultRecipient}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                Reset to Default ({DEFAULT_RECIPIENT_EMAIL})
              </button>

              <button
                type="button"
                onClick={() => setIsNotificationModalOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MEETING SCHEDULING MODAL ================= */}
      {selectedLeadForMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Schedule Consultation: {selectedLeadForMeeting.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Service: {selectedLeadForMeeting.serviceInterest}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLeadForMeeting(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveMeetingSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Meeting Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Meeting Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Meeting Link (Google Meet, Zoom) <span className="text-red-500">*</span>
                  </label>
                  <a
                    href="https://meet.google.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-600 hover:underline font-bold flex items-center space-x-1"
                  >
                    <span>Create in Google Meet</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <Video className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    required
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/... or Zoom link"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  This video link unlocks on the client portal once they click "Accept / Confirm".
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Host / Strategist Name</label>
                <input
                  type="text"
                  value={meetingHost}
                  onChange={(e) => setMeetingHost(e.target.value)}
                  placeholder="e.g. Tamim Nur"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Agenda / Notes (Visible to Client)</label>
                <textarea
                  rows={2}
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="e.g. 30-min discovery call to discuss campaign targets and monthly deliverables."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLeadForMeeting(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMeetingSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 flex items-center space-x-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isMeetingSubmitting ? 'Dispatching...' : 'Save & Send Client Invitation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT ADMIN MODAL ================= */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col text-xs animate-in fade-in zoom-in duration-150 overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100 flex-shrink-0 bg-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingAdminId ? 'Edit Administrator / অ্যাডমিন এডিট' : 'Add New Admin / নতুন অ্যাডমিন যোগ করুন'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Assign role and permissions for store and agency management
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminForm} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {/* Registration Error Alert */}
                {adminFormError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start space-x-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <strong className="block font-bold">লগইন ছাড়া অ্যাডমিন দেওয়া যাবে না!</strong>
                      <span className="text-[11px] leading-relaxed block mt-0.5 break-words font-medium">{adminFormError}</span>
                    </div>
                  </div>
                )}

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Full Name (পুরো নাম)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tanvir Ahmed"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    (ইউজার একাউন্ট পেলে স্বয়ংক্রিয়ভাবে নাম বসে যাবে)
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Registered Gmail (নিবন্ধিত জিমেইল) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. user@gmail.com"
                    value={adminForm.email}
                    onChange={(e) => {
                      setAdminForm({ ...adminForm, email: e.target.value });
                      if (userCheckStatus !== 'idle') {
                        setUserCheckStatus('idle');
                        setAdminFormError(null);
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value.includes('@') && !editingAdminId) {
                        handleCheckEmailRegistration(e.target.value);
                      }
                    }}
                    className={`w-full bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 font-medium ${
                      userCheckStatus === 'registered'
                        ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20'
                        : userCheckStatus === 'not-registered'
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleCheckEmailRegistration(adminForm.email)}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline"
                    >
                      🔍 Check Registration (যাচাই করুন)
                    </button>
                    {userCheckStatus === 'checking' && (
                      <span className="text-[10px] text-slate-500 animate-pulse">যাচাই করা হচ্ছে...</span>
                    )}
                    {userCheckStatus === 'registered' && (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>একাউন্ট পাওয়া গেছে ({registeredUserInfo?.name || 'Registered'})</span>
                      </span>
                    )}
                    {userCheckStatus === 'not-registered' && (
                      <span className="text-[10px] text-red-600 font-bold">
                        ⚠️ একাউন্ট খোলা হয়নি
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Designation & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Designation (পদবী / ডিপার্টমেন্ট)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Operations Lead, Lead Editor"
                    value={adminForm.designation}
                    onChange={(e) => setAdminForm({ ...adminForm, designation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Phone / WhatsApp (মোবাইল নম্বর)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 01700000000"
                    value={adminForm.phone}
                    onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Admin Panel Access Password */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-bold text-xs">
                    Admin Panel Security Password (প্যানেল অ্যাক্সেস পাসওয়ার্ড) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const randPass = 'EED@' + Math.floor(100000 + Math.random() * 900000);
                      setAdminForm((prev) => ({ ...prev, adminPassword: randPass }));
                      setShowAdminFormPass(true);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
                  >
                    <span>🎲 Auto-Generate Strong Password</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showAdminFormPass ? 'text' : 'password'}
                    required
                    placeholder="পাসওয়ার্ড লিখুন..."
                    value={adminForm.adminPassword}
                    onChange={(e) => setAdminForm({ ...adminForm, adminPassword: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminFormPass(!showAdminFormPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showAdminFormPass ? <EyeOff className="w-4 h-4 text-blue-600" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  👉 <strong>সুপার অ্যাডমিনের নিয়ন্ত্রণ:</strong> প্রতিটি ইউজারের জন্য এই পাসওয়ার্ডটি আপনি দিবেন। এই ইউজার অ্যাডমিন প্যানেলে ঢুকতে গেলে এই পাসওয়ার্ডটি দিতে হবে। পরবর্তীতে ইউজার নিজ থেকে পাসওয়ার্ড পরিবর্তন করতে চাইলে আপনার কাছে আবেদন আসবে এবং আপনি অনুমোদন করলেই কেবল পাসওয়ার্ড পরিবর্তন হবে।
                </p>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-slate-800 font-bold mb-1.5">
                  Select Role (অ্যাডমিন রোল নির্বাচন করুন) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    {
                      id: 'owner' as const,
                      title: 'Owner',
                      bn: 'মালিক',
                      icon: Crown,
                      desc: 'Full Control'
                    },
                    {
                      id: 'manager' as const,
                      title: 'Manager',
                      bn: 'ম্যানেজার',
                      icon: Briefcase,
                      desc: 'Operations'
                    },
                    {
                      id: 'editor' as const,
                      title: 'Editor',
                      bn: 'এডিটর',
                      icon: Edit3,
                      desc: 'Catalog/Content'
                    },
                    {
                      id: 'viewer' as const,
                      title: 'Viewer',
                      bn: 'সাপোর্ট',
                      icon: Eye,
                      desc: 'Leads & Read'
                    }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = adminForm.role === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => handleRoleChangeInForm(item.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-sm'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Icon
                            className={`w-4 h-4 ${
                              isSelected ? 'text-blue-600' : 'text-slate-400'
                            }`}
                          />
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-blue-600 font-black" />
                          )}
                        </div>
                        <span className="font-bold text-xs text-slate-900 block">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {item.bn} • {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    Granular Permissions (কাস্টম পারমিশন)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Pre-selected based on role, customizable
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                  {[
                    { key: 'canManageAdmins' as const, label: 'Admins & Role Management', bn: 'অ্যাডমিন পরিচালনা' },
                    { key: 'canManageProducts' as const, label: 'Create & Edit Products', bn: 'পণ্য তৈরি ও এডিট' },
                    { key: 'canDeleteProducts' as const, label: 'Delete Products', bn: 'পণ্য মুছে ফেলা' },
                    { key: 'canManageServices' as const, label: 'Agency Services', bn: 'সার্ভিস প্যাকেজ' },
                    { key: 'canManageOrders' as const, label: 'Verify & Manage Orders', bn: 'অর্ডার ভেরিফিকেশন' },
                    { key: 'canManageLeads' as const, label: 'Customer Leads & Queries', bn: 'লিডস ও মেসেজ' },
                    { key: 'canManageHomepage' as const, label: 'Homepage Banners', bn: 'ব্যানার ও স্লাইডার' },
                    { key: 'canManageSettings' as const, label: 'Site & Brand Settings', bn: 'সাইট সেটিংস' }
                  ].map((p) => {
                    const isChecked = !!adminForm.permissions[p.key];
                    return (
                      <label
                        key={p.key}
                        className="flex items-start space-x-2 text-[11px] text-slate-700 cursor-pointer select-none p-1 rounded hover:bg-slate-100/60"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(p.key)}
                          className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="min-w-0">
                          <span className="font-bold block leading-tight">{p.label}</span>
                          <span className="text-[10px] text-slate-400 leading-none">{p.bn}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Status Radio */}
              <div className="flex items-center space-x-6 pt-1">
                <span className="font-bold text-slate-800 text-xs">Account Status:</span>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="adminStatus"
                    value="active"
                    checked={adminForm.status === 'active'}
                    onChange={() => setAdminForm({ ...adminForm, status: 'active' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-emerald-700">Active (সক্রিয়)</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="adminStatus"
                    value="suspended"
                    checked={adminForm.status === 'suspended'}
                    onChange={() => setAdminForm({ ...adminForm, status: 'suspended' })}
                    className="text-red-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-red-600">Suspended (স্থগিত)</span>
                </label>
              </div>

              {/* Info Note */}
              <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 leading-relaxed space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-blue-950">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>অ্যাডমিন দেওয়ার আবশ্যিক শর্ত:</span>
                </div>
                <p>
                  <strong>১.</strong> যাকে অ্যাডমিন বানাতে চান, তাকে <strong>অবশ্যই আগে</strong> আপনার ওয়েবসাইটের <code>/account</code> পেজে গিয়ে তার জিমেইল দিয়ে সাইন-ইন বা লগইন করতে হবে।
                </p>
                <p>
                  <strong>২.</strong> যদি তিনি লগইন না করে থাকেন, তবে সিস্টেম তাকে অ্যাডমিন হতে দিবে না। লগইন সম্পন্ন করার পর এখানে তার জিমেইলটি দিয়ে <strong>Save & Assign Role</strong> বাটনে ক্লিক করলে তিনি তাৎক্ষণিক অ্যাডমিন ক্ষমতা পাবেন।
                </p>
              </div>
            </div>

            {/* Actions Footer (Pinned at bottom) */}
            <div className="flex justify-end space-x-2.5 p-4 sm:p-5 border-t border-slate-100 flex-shrink-0 bg-slate-50/90 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adminSaving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/25 transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                {adminSaving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingAdminId ? 'Update Admin' : 'Save & Assign Role'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

      {/* ================= STAFF ADMIN CHANGE PASSWORD REQUEST MODAL ================= */}
      {isPassChangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-hidden">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Request Password Change
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    পাসওয়ার্ড পরিবর্তনের আবেদন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPassChangeModalOpen(false);
                  setPassRequestMsg(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passRequestMsg && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  passRequestMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {passRequestMsg.text}
              </div>
            )}

            {currentAdminProfile?.pendingPasswordRequest?.status === 'pending' ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                <div className="flex items-center space-x-2 font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>আপনার পূর্বের আবেদন পেন্ডিং রয়েছে</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  আপনি ইতোমধ্যে নতুন পাসওয়ার্ড পরিবর্তনের আবেদন করেছেন। সুপার অ্যাডমিন সেটি অনুমোদন দিলে পাসওয়ার্ডটি কার্যকর হবে।
                </p>
                <div className="pt-2 flex items-center justify-between font-mono text-[11px] bg-white p-2 rounded-lg border border-amber-200">
                  <span className="text-slate-500 font-sans">আবেদনকৃত পাসওয়ার্ড:</span>
                  <span className="font-bold text-slate-900">
                    {currentAdminProfile.pendingPasswordRequest.requestedPassword}
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestOwnPasswordChange} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    New Desired Password (নতুন যে পাসওয়ার্ড দিতে চান) *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewRequestedPass ? 'text' : 'password'}
                      required
                      minLength={4}
                      placeholder="নতুন পাসওয়ার্ড লিখুন..."
                      value={newRequestedPassInput}
                      onChange={(e) => setNewRequestedPassInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewRequestedPass(!showNewRequestedPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showNewRequestedPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                  🔔 <strong>মনোযোগ দিন:</strong> পাসওয়ার্ড সাবমিট করলে এটি সাথে সাথে কার্যকর হবে না। আপনার দেওয়া পাসওয়ার্ডটি সুপার অ্যাডমিনের প্যানেলে মেসেজ হিসেবে যাবে। সুপার অ্যাডমিন সেটি দেখে <strong>Approve (অনুমোদন)</strong> করলেই পাসওয়ার্ড কার্যকর হবে।
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPassChangeModalOpen(false);
                      setPassRequestMsg(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passRequestSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{passRequestSubmitting ? 'Sending Request...' : 'Send Request to Super Admin'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= FULL WEBSITE LIVE INTERACTIVE PREVIEW MODAL ================= */}
      {isLiveWebPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-in fade-in">
          {/* Modal Chrome Header */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-t-3xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white">Live Website Preview (ওয়েবসাইট প্রিভিউ)</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Interactive Draft
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Real-time full website rendering with all your draft settings, banners, and links.
                </p>
              </div>
            </div>

            {/* Device Viewport Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setWebPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  webPreviewDevice === 'desktop'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>

              <button
                type="button"
                onClick={() => setWebPreviewDevice('tablet')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  webPreviewDevice === 'tablet'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablet</span>
              </button>

              <button
                type="button"
                onClick={() => setWebPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  webPreviewDevice === 'mobile'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Close Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLiveWebPreviewOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Close Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Browser Address Bar */}
          <div className="bg-slate-950 border-x border-slate-700/80 px-4 py-2 flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="flex-1 max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-center font-mono text-[11px] text-slate-300 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>https://eagleeye-tau.vercel.app</span>
            </div>
          </div>

          {/* Scrollable Website Canvas */}
          <div className="flex-1 bg-slate-950 border-x border-b border-slate-700/80 rounded-b-3xl overflow-y-auto flex justify-center p-2 sm:p-4">
            <div
              className={`bg-white text-slate-900 shadow-2xl transition-all duration-300 relative flex flex-col ${
                webPreviewDevice === 'desktop'
                  ? 'w-full max-w-6xl rounded-2xl overflow-hidden'
                  : webPreviewDevice === 'tablet'
                  ? 'w-full max-w-[768px] rounded-2xl overflow-hidden border-8 border-slate-900 shadow-2xl'
                  : 'w-full max-w-[390px] rounded-[36px] overflow-hidden border-8 border-slate-900 shadow-2xl my-2'
              }`}
            >
              {/* 1. Announcement Bar */}
              {headerForm.showAnnouncement !== false && (
                <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-800 text-white px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow flex-shrink-0" />
                  <span className="truncate">
                    {headerForm.announcementText || '⚡ SPECIAL OFFER: Empower your digital presence with Eagle Eye Digital!'}
                  </span>
                  {headerForm.announcementLink && (
                    <span className="text-[10px] underline font-bold bg-white/20 px-2 py-0.5 rounded-full ml-1">
                      Learn More →
                    </span>
                  )}
                </div>
              )}

              {/* 2. Dynamic Navbar */}
              <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between gap-4">
                {/* Brand Logo & Name */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-indigo-800 p-0.5 shadow-md flex items-center justify-center">
                    {siteForm.logoUrl ? (
                      <img src={siteForm.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-[10px]" />
                    ) : (
                      <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-white font-black text-xs">
                        EE
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-base font-black tracking-tight text-slate-900 flex items-center gap-1">
                      <span>{siteForm.brandName ? siteForm.brandName.split(' ')[0] : 'Eagle'}</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        {siteForm.brandName ? siteForm.brandName.split(' ').slice(1).join(' ') : 'Eye Digital'}
                      </span>
                    </div>
                    <div className="text-[8px] font-extrabold tracking-widest text-slate-400 uppercase">
                      {siteForm.tagline || 'YOUR DIGITAL WORLD'}
                    </div>
                  </div>
                </div>

                {/* Nav Links (Desktop) */}
                {webPreviewDevice !== 'mobile' && (
                  <nav className="flex items-center gap-4 text-xs font-bold text-slate-700">
                    {(headerForm.navLinks || []).map((link, idx) => (
                      <span
                        key={idx}
                        className="hover:text-indigo-600 transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-indigo-600"
                      >
                        {link.label}
                      </span>
                    ))}
                  </nav>
                )}

                {/* Header CTA & Social */}
                <div className="flex items-center gap-2">
                  {/* Social Icons in Header */}
                  {webPreviewDevice === 'desktop' && (
                    <div className="flex items-center gap-1">
                      {socialList
                        .filter((s) => s.isActive && s.showInHeader)
                        .map((item) => (
                          <span
                            key={item.id}
                            title={item.platform}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-indigo-600"
                          >
                            <SocialIcon link={item} className="w-3.5 h-3.5" size={14} />
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Chat Support Pill */}
                  {headerForm.showChatSupport !== false && (
                    <a
                      href={`https://wa.me/${(headerForm.chatSupportNumber || siteForm.whatsappNumber || '01836126791').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px] shadow-xs hover:bg-emerald-100 transition-all"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{headerForm.chatSupportText || 'Chat Support'}</span>
                    </a>
                  )}
                </div>
              </header>

              {/* 3. Hero Banner & Bento Section */}
              <div className="p-4 sm:p-6 bg-slate-50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Main Slider (8 cols) */}
                  <div className="md:col-span-8 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white p-6 relative overflow-hidden shadow-md flex flex-col justify-between min-h-[260px]">
                    {/* Background Slide Image */}
                    {bentoForm.heroSlides?.[previewSlideIndex]?.bgImage && (
                      <div className="absolute inset-0 z-0">
                        <img
                          src={bentoForm.heroSlides[previewSlideIndex].bgImage}
                          alt="Banner"
                          className="w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                      </div>
                    )}

                    <div className="relative z-10 space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-amber-300 animate-spin-slow" />
                        <span>
                          {bentoForm.heroSlides?.[previewSlideIndex]?.tag || 'Premium Digital Solutions'}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                        {previewTypedTitle || bentoForm.heroSlides?.[previewSlideIndex]?.title || 'Elevate Your Digital Brand with Eagle Eye'}
                      </h2>
                      <p className="text-xs text-slate-300 max-w-lg line-clamp-2">
                        {bentoForm.heroSlides?.[previewSlideIndex]?.description || 'Custom software development, UI/UX systems, and marketing solutions tailored for high growth.'}
                      </p>
                    </div>

                    <div className="relative z-10 pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                          {bentoForm.heroSlides?.[previewSlideIndex]?.btn1Text || 'Explore Products'}
                        </button>
                        <button className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs backdrop-blur-md">
                          {bentoForm.heroSlides?.[previewSlideIndex]?.btn2Text || 'Agency Services'}
                        </button>
                      </div>

                      {/* Indicator Dots */}
                      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                        {(bentoForm.heroSlides || []).map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPreviewSlideIndex(idx)}
                            className={`rounded-full transition-all ${
                              previewSlideIndex === idx
                                ? 'w-4 h-1.5 bg-amber-400'
                                : 'w-1.5 h-1.5 bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Side Bento Posters (4 cols) */}
                  <div className="md:col-span-4 flex flex-col gap-3">
                    <div className="rounded-xl bg-slate-900 text-white p-3 border border-slate-800 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-sky-400 uppercase tracking-wider">
                          {bentoForm.card1Tag || 'Growth Partner'}
                        </span>
                        <h5 className="text-xs font-black text-white">{bentoForm.card1Title || 'Social Growth & Media'}</h5>
                        <span className="text-[9px] text-sky-400 font-bold block mt-1">Explore Services →</span>
                      </div>
                      <Sparkles className="w-5 h-5 text-sky-400" />
                    </div>

                    <div className="rounded-xl bg-slate-900 text-white p-3 border border-slate-800 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                          {bentoForm.card2Tag || 'Ready Made'}
                        </span>
                        <h5 className="text-xs font-black text-white">{bentoForm.card2Title || 'Premium Digital Products'}</h5>
                        <span className="text-[9px] text-amber-400 font-bold block mt-1">Browse Catalog →</span>
                      </div>
                      <Package className="w-5 h-5 text-amber-400" />
                    </div>

                    <div className="rounded-xl bg-slate-900 text-white p-3 border border-slate-800 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                          {bentoForm.card3Tag || 'Enterprise'}
                        </span>
                        <h5 className="text-xs font-black text-white">{bentoForm.card3Title || 'Custom App & Web Design'}</h5>
                        <span className="text-[9px] text-emerald-400 font-bold block mt-1">Schedule Meeting →</span>
                      </div>
                      <Phone className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Sticky Floating Sidebar Simulation inside Canvas */}
              {socialList.filter((s) => s.isActive && s.showInFloatingSidebar).length > 0 && (
                <div className="absolute right-3 top-48 z-40 flex flex-col gap-1.5 p-1.5 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl">
                  {socialList
                    .filter((s) => s.isActive && s.showInFloatingSidebar)
                    .map((item) => (
                      <span
                        key={item.id}
                        title={item.platform}
                        className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all shadow-sm"
                      >
                        <SocialIcon link={item} className="w-4 h-4" size={16} />
                      </span>
                    ))}
                </div>
              )}

              {/* 5. Full Dynamic Footer */}
              <footer className="bg-slate-950 text-slate-300 p-6 md:p-8 space-y-6 border-t border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Col 1 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 p-0.5 flex items-center justify-center">
                        {siteForm.logoUrl ? (
                          <img src={siteForm.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-[10px] font-black text-white">EE</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-black tracking-tight text-white">
                          {siteForm.brandName || 'Eagle Eye Digital'}
                        </div>
                        <div className="text-[8px] font-semibold text-indigo-400 uppercase tracking-wider">
                          {siteForm.tagline || 'YOUR DIGITAL WORLD'}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {footerForm.aboutText ||
                        'Empowering businesses worldwide through modern digital solutions, web design, and cutting-edge software.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {socialList
                        .filter((s) => s.isActive && s.showInFooter)
                        .map((item) => (
                          <span
                            key={item.id}
                            title={item.platform}
                            className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-white flex items-center justify-center text-xs"
                          >
                            <SocialIcon link={item} className="w-3.5 h-3.5" size={14} />
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Col 2 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-800 pb-2">
                      Services
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      {(footerForm.servicesLinks || []).map((l, i) => (
                        <li key={i}>• {l.label}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Col 3 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-800 pb-2">
                      Resources
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      {(footerForm.resourcesLinks || []).map((l, i) => (
                        <li key={i}>• {l.label}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Col 4 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-800 pb-2">
                      Helpline & Contact
                    </h4>
                    <div className="space-y-1.5 text-xs text-slate-400">
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold">Email:</span>
                        <span className="text-slate-300 font-mono">
                          {footerForm.contactEmail || siteForm.businessEmail || 'support@eagleeyedigital.com'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold">WhatsApp Helpline:</span>
                        <span className="text-slate-300 font-mono">
                          {footerForm.contactPhone || siteForm.whatsappNumber || '01836126791'}
                        </span>
                      </div>
                      {footerForm.operatingHours && (
                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold">Hours:</span>
                          <span className="text-slate-300">{footerForm.operatingHours}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                  <span>{footerForm.copyrightText || '© 2026 Eagle Eye Digital. All rights reserved.'}</span>
                  <span className="text-indigo-400 font-semibold">{footerForm.tagline || 'YOUR DIGITAL WORLD'}</span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
