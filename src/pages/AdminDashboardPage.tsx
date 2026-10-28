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
  AlertTriangle
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
  findRegisteredUserByEmail
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
  AdminPermissions
} from '../types';
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
  const [newSlideIsPureBanner, setNewSlideIsPureBanner] = useState(true);
  const heroSlideFileInputRef = React.useRef<HTMLInputElement>(null);

  const [posterSlot, setPosterSlot] = useState<'top' | 'bottom-left' | 'bottom-right'>('top');
  const [newPosterImg, setNewPosterImg] = useState('');
  const [newPosterTitle, setNewPosterTitle] = useState('');
  const [newPosterLink, setNewPosterLink] = useState('/products');
  const sidePosterFileInputRef = React.useRef<HTMLInputElement>(null);

  // Real-time Preview States & Dynamic Typewriter for Admin
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [previewAutoPlay, setPreviewAutoPlay] = useState(true);
  const [previewViewMode, setPreviewViewMode] = useState<'slider' | 'full-layout'>('slider');
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
    permissions: AdminPermissions;
  }>({
    name: '',
    email: '',
    role: 'editor',
    designation: '',
    phone: '',
    status: 'active',
    permissions: getDefaultRolePermissions('editor')
  });
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminActionMsg, setAdminActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [adminFormError, setAdminFormError] = useState<string | null>(null);
  const [userCheckStatus, setUserCheckStatus] = useState<'idle' | 'checking' | 'registered' | 'not-registered'>('idle');
  const [registeredUserInfo, setRegisteredUserInfo] = useState<{ name?: string; uid?: string } | null>(null);

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
      alert('αªàαª¿αºüαªùαºìαª░αª╣ αªòαª░αºç αªòαºìαª»αª╛αªƒαª╛αªùαª░αª┐αª░ αª¿αª╛αª« αª▓αª┐αªûαºüαª¿αÑñ');
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
      alert('Clipboard-αªÅ αªòαºïαª¿αºï αª¢αª¼αª┐ αª¼αª╛ αªçαª«αºçαª£ αª▓αª┐αªéαªò αª¬αª╛αªôαª»αª╝αª╛ αª»αª╛αª»αª╝αª¿αª┐αÑñ αª¢αª¼αª┐ αªòαª¬αª┐ αªòαª░αºç αªÅαªûαª╛αª¿αºç Ctrl + V αªÜαª╛αª¬αºüαª¿αÑñ');
    } catch (err) {
      alert('αª¢αª¼αª┐αªƒαª┐ αªòαª¬αª┐ αªòαª░αºç αªÅαªç αª¼αªòαºìαª╕αºç Ctrl + V αªÜαª╛αª¬αºüαª¿, αª╕αºìαª¼αºƒαªéαªòαºìαª░αª┐αºƒαª¡αª╛αª¼αºç αªàαºìαª»αª╛αªí αª╣αºƒαºç αª»αª╛αª¼αºç!');
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
    setNewSlideIsPureBanner(slide.isPureBanner !== undefined ? slide.isPureBanner : !slide.title);
    setPreviewFocusUploaded(true);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleCancelEditSlide = () => {
    setEditingSlideIndex(null);
    setNewSlideImg('');
    setNewSlideTitle('');
    setNewSlideLink('/products');
    setNewSlideIsPureBanner(true);
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

    const newSlide: HeroSlide = {
      id: 'slide-' + Date.now(),
      tag: 'Featured Highlight',
      title: newSlideIsPureBanner ? '' : (newSlideTitle.trim() || 'Premium Digital Products for Smart Buyers'),
      description: newSlideIsPureBanner ? '' : 'Explore verified digital tools, agency retainers, and graphic vault.',
      btn1Text: 'Browse Store',
      btn1Link: newSlideLink.trim() || '/products',
      btn2Text: 'Agency Services',
      btn2Link: '/services',
      bgImage: newSlideImg.trim(),
      image3D: '',
      isPureBanner: newSlideIsPureBanner
    };

    let updatedSlides: HeroSlide[] = [];
    if (editingSlideIndex !== null) {
      const currentSlides = [...(existingSlides.length > 0 ? existingSlides : defaultHeroSlides)];
      currentSlides[editingSlideIndex] = {
        ...currentSlides[editingSlideIndex],
        bgImage: newSlideImg.trim(),
        title: newSlideIsPureBanner ? '' : (newSlideTitle.trim() || currentSlides[editingSlideIndex].title),
        btn1Link: newSlideLink.trim() || '/products',
        isPureBanner: newSlideIsPureBanner
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
    setAdminForm({
      name: '',
      email: '',
      role: 'editor',
      designation: '',
      phone: '',
      status: 'active',
      permissions: getDefaultRolePermissions('editor')
    });
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
      permissions: admin.permissions || getDefaultRolePermissions(admin.role)
    });
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

    // Step: Verify that the user has registered or logged in
    if (!editingAdminId) {
      setAdminSaving(true);
      const registeredUser = await findRegisteredUserByEmail(emailClean);
      if (!registeredUser) {
        setAdminSaving(false);
        setUserCheckStatus('not-registered');
        setAdminFormError('This user must register or log in before becoming an Admin. (এই ইউজার এখনো ওয়েবসাইটে সাইন-ইন বা লগইন করেননি। অ্যাডমিন দেওয়ার পূর্বে তাকে ওয়েবসাইটে একবার লগইন করতে হবে।)');
        return;
      }
    }

    setAdminSaving(true);
    try {
      await saveAdmin({
        ...(editingAdminId ? { id: editingAdminId } : {}),
        name: adminForm.name.trim() || emailClean.split('@')[0],
        email: emailClean,
        role: adminForm.role,
        designation: adminForm.designation.trim(),
        phone: adminForm.phone.trim(),
        status: adminForm.status,
        permissions: adminForm.permissions,
        addedBy: currentUser?.email || 'Admin'
      });

      await loadData();
      await refreshAdminStatus();
      setIsAdminModalOpen(false);
      setAdminActionMsg({
        type: 'success',
        text: `অ্যাডমিন ${adminForm.name || emailClean} (${adminForm.role.toUpperCase()}) সফলভাবে সংরক্ষণ করা হয়েছে!`
      });
      setTimeout(() => setAdminActionMsg(null), 5000);
    } catch (err: any) {
      setAdminFormError(err.message || 'অ্যাডমিন সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setAdminSaving(false);
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      
      {/* ================= LEFT SIDEBAR (EXACT VYRQONIX STYLE) ================= */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 sticky top-0 h-screen select-none">
        <div className="space-y-6">
          
          {/* Logo & Console Badge */}
          <div className="px-2 pt-1">
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
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders & Sales', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : null },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'services', label: 'Agency Services', icon: Layers },
              { id: 'categories', label: 'Categories', icon: FolderTree },
              { id: 'admins', label: 'Admins & Roles', icon: ShieldCheck, badge: admins.length || null },
              { id: 'leads', label: 'Leads & Inquiries', icon: Inbox, badge: leads.filter(l => l.status === 'New').length || null },
              { id: 'homepage', label: 'Homepage Banners', icon: Image },
              { id: 'footer', label: 'Footer & Social', icon: Globe },
              { id: 'settings', label: 'Site Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectMenu(item.id as AdminTab)}
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
      <main className="flex-1 p-6 sm:p-10 max-w-7xl overflow-y-auto">
        
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
                                <span className="font-extrabold text-slate-900">αº│{p.salePrice ?? p.price}</span>
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
              <div className="space-y-6 max-w-4xl">
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
                        <option value="Template">≡ƒôä Template</option>
                        <option value="Graphic Asset">≡ƒÄ¿ Graphic Asset</option>
                        <option value="Software">≡ƒÆ╗ Software</option>
                        <option value="Game">≡ƒÄ« Game</option>
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
                        PAID PRODUCT (BDT αº│)
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
                        FREE GIVEAWAY (αº│0)
                      </button>
                    </div>

                    {!prodForm.isFree && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Selling Price (BDT αº│) *</label>
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
                            αªƒαª┐αªò αªÜαª┐αª╣αºìαª¿ αªªαª┐αª▓αºç αªòαª╛αª░αºìαªíαºçαª░ αªëαª¬αª░ "50% OFF" αª╕αºìαªƒαª┐αªòαª╛αª░ αª╢αºï αªòαª░αª¼αºçαÑñ αªåαª¿αªÜαºçαªò αª░αª╛αªûαª▓αºç αªòαºïαª¿αºï αªàαª½αª╛αª░ αª¼αºìαª»αª╛αª£ αªªαºçαªûαª╛αª¼αºç αª¿αª╛αÑñ
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
                          Google Drive αª▓αª┐αªéαªò αªÅαª¼αªé αªòαª╛αª╕αºìαªƒαª«αª╛αª░ αªòαºÇ αªºαª░αª¿αºçαª░ αªåαªçαªƒαºçαª« (Game, Software αª¿αª╛αªòαª┐ Graphic Resource) αªíαª╛αªëαª¿αª▓αºïαªí αªòαª░αª¼αºç αªñαª╛ αª¿αª┐αª░αºìαªºαª╛αª░αªú αªòαª░αºüαª¿αÑñ
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                        Google Drive Delivery
                      </span>
                    </div>

                    {/* αªÅαªƒαª┐ αªòαºÇ αªºαª░αª¿αºçαª░ αªåαªçαªƒαºçαª«? (Game, Software αª¿αª╛αªòαª┐ Graphic Asset) */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-slate-700">
                          αªÅαªƒαª┐ αªòαºÇ αªºαª░αª¿αºçαª░ αªåαªçαªƒαºçαª«? (Game, Software αª¿αª╛αªòαª┐ Graphic Asset) *
                        </label>
                        <span className="text-[11px] text-purple-600 font-semibold">
                          αª╕αª┐αª▓αºçαªòαºìαªƒ αªòαª░αª▓αºç αª¼αª╛αªƒαª¿αºçαª░ αª▓αª┐αªûαª╛ αª╕αºìαª¼αºƒαªéαªòαºìαª░αª┐αºƒαª¡αª╛αª¼αºç αª╕αºçαªƒ αª╣αª¼αºç
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'Game', label: 'Game', sub: 'PC / Mobile αªùαºçαª«', icon: Gamepad2 },
                          { id: 'Software', label: 'Software', sub: 'αªƒαºüαª▓αª╕ αª¼αª╛ αª╕αª½αªƒαªôαºƒαºìαª»αª╛αª░', icon: Laptop },
                          { id: 'Graphic Asset', label: 'Graphic Asset', sub: 'αªùαºìαª░αª╛αª½αª┐αªòαºìαª╕ αª¼αª╛ αªíαª┐αª£αª╛αªçαª¿', icon: Palette },
                          { id: 'Template', label: 'Template', sub: 'αªƒαºçαª«αª¬αºìαª▓αºçαªƒ αª¼αª╛ αªÑαª┐αª«', icon: FileCode },
                          ...customTypes.map((ct) => ({
                            id: ct,
                            label: ct,
                            sub: 'αªòαª╛αª╕αºìαªƒαª« αªåαªçαªƒαºçαª«',
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
                          <span className="font-bold text-slate-700 group-hover:text-amber-700 text-xs mt-1">+ αªòαª╛αª╕αºìαªƒαª« αªƒαª╛αªçαª¬</span>
                          <span className="text-[10px] text-slate-400">αª¿αªñαºüαª¿ αªƒαª╛αªçαª¬ αª»αºïαªù αªòαª░αºüαª¿</span>
                        </button>
                      </div>

                      {/* Inline Custom Item Type Creator */}
                      {isAddingCustomType && (
                        <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mt-3 animate-fadeIn">
                          <input
                            type="text"
                            placeholder="αª¿αªñαºüαª¿ αªåαªçαªƒαºçαª« αªƒαª╛αªçαª¬αºçαª░ αª¿αª╛αª« αª▓αª┐αªûαºüαª¿ (αª»αºçαª«αª¿: eBook, Plugin, Presets, Course)..."
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
                            <span>αª»αºïαªù αªòαª░αºüαª¿</span>
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
                        Google Drive-αªÅ αª½αª╛αªçαª▓ (αªùαºçαª«, αª╕αª½αªƒαªôαºƒαºìαª»αª╛αª░, αªàαªÑαª¼αª╛ αª£αª┐αª¬ αª½αª╛αªçαª▓) αªåαª¬αª▓αºïαªí αªòαª░αºç "Anyone with the link can view" αª¬αª╛αª░αª«αª┐αª╢αª¿ αªªαª┐αºƒαºç αª╢αºçαºƒαª╛αª░ αª▓αª┐αªéαªòαªƒαª┐ αªÅαªûαª╛αª¿αºç αªªαª┐αª¿αÑñ αªòαª╛αª╕αºìαªƒαª«αª╛αª░ αªàαª░αºìαªíαª╛αª░ αªòαª¿αª½αª╛αª░αºìαª« αª╣αª▓αºç αªÅαªç αª╕αºüαª░αªòαºìαª╖αª┐αªñ αª▓αª┐αªéαªò αªÑαºçαªòαºç αª½αª╛αªçαª▓ αªíαª╛αªëαª¿αª▓αºïαªí αªòαª░αªñαºç αª¬αª╛αª░αª¼αºçαª¿αÑñ
                      </p>
                    </div>

                    {/* αªíαª╛αªëαª¿αª▓αºïαªí αª¼αª╛αªƒαª¿ αª▓αª┐αªûαª╛ / Download Button Text */}
                    <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-purple-900">
                          ≡ƒÅ╖∩╕Å αªíαª╛αªëαª¿αª▓αºïαªí αª¼αª╛αªƒαª¿ αª▓αª┐αªûαª╛ / Download Button Text (αªòαª╛αª╕αºìαªƒαª«αª╛αªçαª£αºçαª╢αª¿)
                        </span>
                        <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-semibold">
                          αªôαºƒαºçαª¼αª╕αª╛αªçαªƒαºç αª¼αª╛αªƒαª¿αºçαª░ αªëαª¬αª░ αª╕αª░αª╛αª╕αª░αª┐ αªªαºçαªûαª╛αª¼αºç
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
                        <span className="text-[10px] font-bold text-slate-600 block">αªÅαªò αªòαºìαª▓αª┐αªòαºç αª¼αª╛αªƒαª¿αºçαª░ αªƒαºçαªòαºìαª╕αªƒ αª¬αª¢αª¿αºìαªª αªòαª░αºüαª¿:</span>
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
                          ≡ƒÆí αª½αª╛αªüαªòαª╛ αª░αª╛αªûαª▓αºç αª¬αºìαª░αºïαªíαª╛αªòαºìαªƒαºçαª░ αªƒαª╛αªçαª¬ (Game / Software / Resource) αªàαª¿αºüαª»αª╛αºƒαºÇ αª╕αºìαª¼αºƒαªéαªòαºìαª░αª┐αºƒαª¡αª╛αª¼αºç αª╕αªáαª┐αªò αª¿αª╛αª« αª¼αª╛αªƒαª¿αºç αªÜαª▓αºç αªåαª╕αª¼αºçαÑñ
                        </p>
                      </div>
                    </div>

                    {/* ZIP / αª½αª╛αªçαª▓ αªåαª¿αª£αª┐αª¬ αªòαª░αª╛αª░ αª¬αª╛αª╕αªôαºƒαª╛αª░αºìαªí (αªÉαªÜαºìαª¢αª┐αªò / Optional) */}
                    <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/20 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-purple-900 flex items-center space-x-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                          <span>ZIP / αª½αª╛αªçαª▓ αªåαª¿αª£αª┐αª¬ αªòαª░αª╛αª░ αª¬αª╛αª╕αªôαºƒαª╛αª░αºìαªí (αªÉαªÜαºìαª¢αª┐αªò / Optional)</span>
                        </span>
                        <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-semibold">
                          αª¬αª╛αª╕αªôαºƒαª╛αª░αºìαªí αª¿αª╛ αªÑαª╛αªòαª▓αºç αª½αª╛αªüαªòαª╛ αª░αª╛αªûαºüαª¿
                        </span>
                      </div>
                      <input
                        type="text"
                        value={prodForm.zipPassword || ''}
                        onChange={(e) => setProdForm({ ...prodForm, zipPassword: e.target.value })}
                        placeholder="αª»αºçαª«αª¿: 1234 αª¼αª╛ MG2026 (αª¿αª╛ αªÑαª╛αªòαª▓αºç αªûαª╛αª▓αª┐ αª░αª╛αªûαºüαª¿)"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600"
                      />
                      <p className="text-[10px] text-slate-500">
                        ≡ƒÆí <strong>αªòαªûαª¿ αªªαª┐αª¼αºçαª¿?</strong> αª½αª╛αªçαª▓αªƒαª┐αªñαºç αª»αªªαª┐ αªåαª¿αª£αª┐αª¬ αªòαª░αª╛αª░ αªòαºïαª¿αºï αª¬αª╛αª╕αªôαºƒαª╛αª░αºìαªí αªÑαª╛αªòαºç (αª»αºçαª«αª¿ αº¬ αª╕αªéαªûαºìαª»αª╛αª░ αª¬αª╛αª╕αªôαºƒαª╛αª░αºìαªí), αªñαª¼αºç αª╕αºçαªƒαª┐ αªÅαªûαª╛αª¿αºç αªªαª┐αª¿αÑñ αªòαª╛αª╕αºìαªƒαª«αª╛αª░ αªàαª░αºìαªíαª╛αª░ αª╕αª½αª▓ αª╣αªôαºƒαª╛αª░ αª¬αª░ αª╕αºìαª¼αºƒαªéαªòαºìαª░αª┐αºƒαª¡αª╛αª¼αºç αªÅαªòαªƒαª┐ αª╕αºüαª¿αºìαªªαª░ αª¿αºïαªƒαª┐αª╢αºç αª¬αª╛αª╕αªôαºƒαª╛αª░αºìαªí αªô αªòαª¬αª┐ αª¼αª╛αªƒαª¿ αªªαºçαªûαªñαºç αª¬αª╛αª¼αºçαÑñ
                      </p>
                    </div>

                    {/* αªòαºÇαª¡αª╛αª¼αºç αªòαª┐ αªòαª░αªñαºç αª╣αª¼αºç / αªçαª¿αºìαª╕αªƒαª▓αºçαª╢αª¿ αªùαª╛αªçαªí (αªÉαªÜαºìαª¢αª┐αªò / Optional) */}
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-900 flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-amber-600" />
                          <span>αªòαºÇαª¡αª╛αª¼αºç αªòαª┐ αªòαª░αªñαºç αª╣αª¼αºç / αªçαª¿αºìαª╕αªƒαª▓αºçαª╢αª¿ αªùαª╛αªçαªí (αªÉαªÜαºìαª¢αª┐αªò / Optional)</span>
                        </span>
                        <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                          αªíαª╛αªëαª¿αª▓αºïαªí αª¬αª¬αªåαª¬αºç αªòαª╛αª╕αºìαªƒαª«αª╛αª░ αªªαºçαªûαªñαºç αª¬αª╛αª¼αºç
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={prodForm.installGuide || ''}
                        onChange={(e) => setProdForm({ ...prodForm, installGuide: e.target.value })}
                        placeholder="αª»αºçαª«αª¿: αºº. αª£αª┐αª¬ αª½αª╛αªçαª▓αªƒαª┐ αªíαª╛αªëαª¿αª▓αºïαªí αªòαª░αºç αªåαª¿αª£αª┐αª¬ αªòαª░αºüαª¿αÑñ αº¿. αªåαª¿αª£αª┐αª¬ αªòαª░αªñαºç αª¬αª╛αª╕αªôαºƒαª╛αª░αºìαªí MG2026 αªªαª┐αª¿αÑñ αº⌐. Setup.exe αª░αª╛αª¿ αªòαª░αºç αªçαª¿αºìαª╕αªƒαª▓ αªòαª░αºüαª¿..."
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                      />

                      {/* Quick preset guidelines */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-slate-600">αªªαºìαª░αºüαªñ αªùαª╛αªçαªíαª▓αª╛αªçαª¿ αª╕αª┐αª▓αºçαªòαºìαªƒ αªòαª░αºüαª¿:</span>
                        <button
                          type="button"
                          onClick={() => setProdForm({ ...prodForm, installGuide: 'αºº. αª½αª╛αªçαª▓αªƒαª┐ αªíαª╛αªëαª¿αª▓αºïαªí αªòαª░αºç αªåαª¿αª£αª┐αª¬ αªòαª░αºüαª¿αÑñ\nαº¿. αª¬αºìαª░αª»αª╝αºïαª£αª¿αºÇαª»αª╝ αª½αºïαª▓αºìαªíαª╛αª░ αªÅαªòαºìαª╕αªƒαºìαª░αª╛αªòαºìαªƒ αªòαª░αºç αªùαºçαª«αªƒαª┐ αªÜαª╛αª▓αºü αªòαª░αºüαª¿αÑñ' })}
                          className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-amber-500 text-[10px] font-semibold text-slate-700"
                        >
                          ≡ƒÄ« αªùαºçαª« αªçαª¿αºìαª╕αªƒαª▓ αªùαª╛αªçαªí
                        </button>
                        <button
                          type="button"
                          onClick={() => setProdForm({ ...prodForm, installGuide: 'αºº. αª£αª┐αª¬ αª½αª╛αªçαª▓αªƒαª┐ αªíαª╛αªëαª¿αª▓αºïαªí αªòαª░αºüαª¿αÑñ\nαº¿. αª╕αºçαªƒαªåαª¬ αª½αª╛αªçαª▓αªƒαª┐ αª░αª╛αª¿ αªòαª░αºç αª¿αª┐αª░αºìαªªαºçαª╢αª¿αª╛ αªàαª¿αºüαª»αª╛αºƒαºÇ αªçαª¿αºìαª╕αªƒαª▓ αª╕αª«αºìαª¬αª¿αºìαª¿ αªòαª░αºüαª¿αÑñ' })}
                          className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-amber-500 text-[10px] font-semibold text-slate-700"
                        >
                          ≡ƒÆ╗ αª╕αª½αªƒαªôαºƒαºìαª»αª╛αª░ αªùαª╛αªçαªí
                        </button>
                        <button
                          type="button"
                          onClick={() => setProdForm({ ...prodForm, installGuide: 'αºº. αª¡αºçαªòαºìαªƒαª░ αª¼αª╛ αªƒαºçαª«αª¬αºìαª▓αºçαªƒ αª½αª╛αªçαª▓αªƒαª┐ αªôαª¬αºçαª¿ αªòαª░αºüαª¿αÑñ\nαº¿. αª½αª¿αºìαªƒ αªô αªòαª╛αª▓αª╛αª░ αªåαª¬αª¿αª╛αª░ αª¼αºìαª░αºìαª»αª╛αª¿αºìαªí αªàαª¿αºüαª»αª╛αºƒαºÇ αª¬αª░αª┐αª¼αª░αºìαªñαª¿ αªòαª░αºüαª¿αÑñ' })}
                          className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-amber-500 text-[10px] font-semibold text-slate-700"
                        >
                          ≡ƒÄ¿ αªùαºìαª░αª╛αª½αª┐αªòαºìαª╕ / αªíαª┐αª£αª╛αªçαª¿ αªùαª╛αªçαªí
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        ≡ƒÆí αªòαª╛αª╕αºìαªƒαª«αª╛αª░ αª»αªûαª¿ αªíαª╛αªëαª¿αª▓αºïαªí αª¼αª╛αªƒαª¿αºç αªòαºìαª▓αª┐αªò αªòαª░αª¼αºç, αªñαªûαª¿ αªÅαªç αª¿αª┐αºƒαª«αª╛αª¼αª▓αºÇαªƒαª┐ αª¬αª¬αªåαª¬αºç αªªαºçαªûαªñαºç αª¬αª╛αª¼αºçαÑñ
                      </p>
                    </div>

                    {/* CATEGORY SELECTION OPTION AT THE END (All created categories + Add Category button) */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                            <FolderTree className="w-3.5 h-3.5 text-blue-600" />
                            <span>αªòαºìαª»αª╛αªƒαª╛αªùαª░αª┐ αª¿αª┐αª░αºìαª¼αª╛αªÜαª¿ / Category Selection (αªåαª¬αª¿αª╛αª░ αª╕αª«αª╕αºìαªñ αªñαºêαª░αª┐ αªòαª░αª╛ αªòαºìαª»αª╛αªƒαª╛αªùαª░αª┐) *</span>
                          </span>
                          <p className="text-[10px] text-slate-500">
                            αªåαªùαºç αªñαºêαª░αª┐ αªòαª░αª╛ αª»αºçαªòαºïαª¿αºï αªòαºìαª»αª╛αªƒαª╛αªùαª░αª┐ αª¿αª┐αª░αºìαª¼αª╛αªÜαª¿ αªòαª░αºüαª¿ αªàαªÑαª¼αª╛ αª¿αªñαºüαª¿ αªòαºìαª»αª╛αªƒαª╛αªùαª░αª┐ αª»αºïαªù αªòαª░αºüαª¿αÑñ
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
                          <span className="text-[11px] font-bold text-blue-900 block">αª¿αªñαºüαª¿ αªòαºìαª»αª╛αªƒαª╛αªùαª░αª┐ αª»αºïαªù αªòαª░αºüαª¿:</span>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="αªòαºìαª»αª╛αªƒαª╛αªùαª░αª┐αª░ αª¿αª╛αª« αª▓αª┐αªûαºüαª¿ (αª»αºçαª«αª¿: Gaming Mods, Software Tools)..."
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
                                <span>≡ƒôü</span>
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
                          αª¢αª¼αª┐ αªíαºìαª░αºìαª»αª╛αªù αªô αªíαºìαª░αª¬ αªòαª░αºüαª¿, αª╕αª░αª╛αª╕αª░αª┐ <strong className="text-blue-700">Ctrl + V αªªαª┐αºƒαºç αª¬αºçαª╕αºìαªƒ</strong> αªòαª░αºüαª¿, αªàαªÑαª¼αª╛ αªòαª«αºìαª¬αª┐αªëαªƒαª╛αª░ αªÑαºçαªòαºç αª╕αª┐αª▓αºçαªòαºìαªƒ αªòαª░αºüαª¿ (1080├ù1080 αª░αºçαª╢αª┐αªô)αÑñ
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] self-start sm:self-auto">
                        {prodForm.thumbnailUrl ? 'Γ£à 1 Photo Active' : '0 Photos Selected'}
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
                              αª¼αª╛ αªíαºìαª░αºìαª»αª╛αªù αªòαª░αºç αª½αª╛αªçαª▓ αª¢αª╛αº£αºüαª¿
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
                            αªàαªÑαª¼αª╛ αª╕αª░αª╛αª╕αª░αª┐ αªçαª«αºçαª£ αª▓αª┐αªéαªò (Image URL) αª¬αºçαª╕αºìαªƒ αªòαª░αºüαª¿:
                          </label>
                          <input
                            type="text"
                            value={prodForm.thumbnailUrl || ''}
                            onChange={(e) => setProdForm({ ...prodForm, thumbnailUrl: e.target.value })}
                            placeholder="https://images.unsplash.com/... αªàαªÑαª¼αª╛ αª»αºçαªòαºïαª¿αºï αª¢αª¼αª┐ URL"
                            className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                          />
                        </div>

                        {/* Status Message or Tips */}
                        <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 text-[10px] text-blue-800">
                          {imageUploadStatus ? (
                            <span className="font-bold animate-pulse">{imageUploadStatus}</span>
                          ) : (
                            <span>
                              ≡ƒÆí <strong>αªƒαª┐αª¬αª╕:</strong> αªåαª¬αª¿αª┐ Snipping Tool, Photoshop αª¼αª╛ αªôαºƒαºçαª¼αª╕αª╛αªçαªƒ αªÑαºçαªòαºç αª»αºçαªòαºïαª¿αºï αª¢αª¼αª┐ αªòαª¬αª┐ αªòαª░αºç αª╕αª░αª╛αª╕αª░αª┐ αªÅαªç αª¬αºçαª£αºç <kbd className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-mono font-bold text-slate-700">Ctrl + V</kbd> αª¬αºìαª░αºçαª╕ αªòαª░αª▓αºçαªç αª¢αª¼αª┐ αªñαª╛αºÄαªòαºìαª╖αªúαª┐αªò αª»αºüαªòαºìαªñ αª╣αºƒαºç αª»αª╛αª¼αºç!
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
                        300├ù225 (4:3 Card)
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
                <div className="text-3xl font-black text-emerald-600 mt-2">αº│{verifiedRevenue}</div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <td className="py-3.5 px-5 font-black text-slate-900">αº│{ord.totalAmount}</td>
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
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
                        Slide Image (Recommended: 1200├ù520px or 1024├ù440px | 2.3:1 Wide Ratio) *
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
                            <span>Use Perfect 1200├ù520 Banner</span>
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

                    {/* Pure Banner Graphic Mode Toggle */}
                    <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3 flex items-start space-x-2.5">
                      <input
                        type="checkbox"
                        id="pureBannerCheckbox"
                        checked={newSlideIsPureBanner}
                        onChange={(e) => setNewSlideIsPureBanner(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="pureBannerCheckbox" className="text-xs text-slate-800 cursor-pointer">
                        <span className="font-extrabold text-amber-950 block">
                          Full Banner Graphic (αª¢αª¼αª┐αªñαºçαªç αªíαª┐αª£αª╛αªçαª¿ αªô αª▓αºçαªûαª╛ αªåαª¢αºç)
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          αªƒαª┐αªò αªªαºçαªôαºƒαª╛ αªÑαª╛αªòαª▓αºç αª¢αª¼αª┐αª░ αªôαª¬αª░ αªåαª▓αª╛αªªαª╛ αªòαºïαª¿αºï αªòαª╛αª▓αºï αª╢αºìαª»αª╛αªíαºï αª¼αª╛ αªíαºüαª¬αºìαª▓αª┐αªòαºçαªƒ αª▓αºçαªûαª╛ αª¼αª╕αª¼αºç αª¿αª╛αÑñ αªåαª¬αª¿αª╛αª░ αªåαª¬αª▓αºïαªí αªòαª░αª╛ αª¢αª¼αª┐αªƒαª┐ αª½αºüαª▓ αªòαºìαª▓αª┐αºƒαª╛αª░ αªÑαª╛αªòαª¼αºç αªÅαª¼αªé αªàαºìαª»αª╛αª¿αª┐αª«αºçαª╢αª¿ αª╣αª¼αºçαÑñ
                        </span>
                      </label>
                    </div>

                    {/* Slide Title / Description (Optional when Pure Banner is selected) */}
                    {!newSlideIsPureBanner && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Slide Title / Description (Text Overlay)
                        </label>
                        <input
                          type="text"
                          value={newSlideTitle}
                          onChange={(e) => setNewSlideTitle(e.target.value)}
                          placeholder="e.g. Premium Digital Products for Smart Buyers"
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

                {/* Right Column: LIVE HOMEPAGE PREVIEW & ACTIVE BANNERS */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* REAL-TIME WEBSITE LIVE PREVIEW CARD (Interactive, Full Layout Toggle & Animated) */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                    
                    {/* Preview Top Header & Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-indigo-700">
                          <Sparkles className="w-4 h-4 text-indigo-600 animate-spin-slow" />
                          <span>LIVE HOMEPAGE PREVIEW (αªôαºƒαºçαª¼αª╕αª╛αªçαªƒαºç αª»αºçαª«αª¿ αªªαºçαªûαª╛αª¼αºç)</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          αª╕αºìαª▓αª╛αªçαªí αªòαª░αºç αªªαºçαªûαºüαª¿, αª▓αºçαªûαª╛ αªô αª¢αª¼αª┐αª░ αªàαºìαª»αª╛αª¿αª┐αª«αºçαª╢αª¿ αªªαºçαªûαºüαª¿ αªÅαª¼αªé αª½αºüαª▓ αªôαºƒαºçαª¼ αª▓αºçαªåαªëαªƒ αª¬αºìαª░αª┐αª¡αª┐αªë αªòαª░αºüαª¿:
                        </p>
                      </div>

                      {/* View Mode Toggle: Slider vs Full Web Layout */}
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
                      </div>
                    </div>

                    {/* Quick Preview Toolbar: Prev, Next, Play/Pause, Slide Indicator */}
                    {(() => {
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
                                <span>Preview Uploaded Picture (αª▓αª╛αªçαª¡ αªåαª¬αª¿αª╛αª░ αª¢αª¼αª┐)</span>
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
                                  {/* Typography & Floating Vectors */}
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
                                        <span className="bg-gradient-to-r from-white via-amber-200 to-cyan-300 bg-clip-text text-transparent animate-gradient-text">
                                          {previewTypedTitle}
                                        </span>
                                        <span className="inline-block w-1 h-4 sm:h-5 ml-1 bg-amber-400 animate-pulse align-middle" />
                                      </h4>

                                      <p
                                        key={`preview-desc-${previewSlideIndex}`}
                                        className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed animate-pop-in"
                                      >
                                        {currentPreview?.description ||
                                          'From performance marketing to ready-to-deploy UI assets and digital products.'}
                                      </p>
                                    </div>

                                    {/* Floating 3D Graphic / Pop-up Vectors in Preview */}
                                    <div className="sm:col-span-4 hidden sm:flex items-center justify-center">
                                      {active3D ? (
                                        <div
                                          key={`preview-3d-${previewSlideIndex}`}
                                          className="w-24 h-24 rounded-xl overflow-hidden p-1.5 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl animate-pop-in animate-float"
                                        >
                                          <img
                                            src={active3D}
                                            alt="3D Preview"
                                            className="w-full h-full object-cover rounded-lg"
                                          />
                                        </div>
                                      ) : (
                                        <div
                                          key={`preview-orb-${previewSlideIndex}`}
                                          className="relative w-24 h-24 flex items-center justify-center animate-pop-in"
                                        >
                                          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600/40 via-indigo-500/30 to-amber-400/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg animate-float">
                                            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                                          </div>
                                          <div className="absolute -top-1 -left-1 px-2 py-0.5 rounded-lg bg-slate-900/80 border border-amber-400/40 text-[8px] font-black text-amber-300 animate-float flex items-center space-x-1">
                                            <span>≡ƒÜÇ</span>
                                            <span>Instant</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

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
                                          ? 'Γ£¿ Live Uploaded Picture (αªåαª¬αª¿αª╛αª░ αª¢αª¼αª┐ αªàαºìαª»αª╛αª¿αª┐αª«αºçαª╢αª¿αª╕αª╣)'
                                          : 'Γ£¿ Clean Graphic Banner (αª½αºüαª▓ αª¼αºìαª»αª╛αª¿αª╛αª░ αª«αºïαªí)'}
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
                                  <h5 className="font-bold text-slate-900 text-xs line-clamp-1">
                                    {slide.title}
                                  </h5>
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
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
                              e.g. LinkedIn Premium Up To 90% Discount (~800├ù380px)
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
                              e.g. Canva / Promo (~400├ù320px or 16:10)
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
                              e.g. Adobe / Promo (~400├ù320px or 16:10)
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
                            <span>Use Perfect 720├ù380 Side Poster</span>
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

                {/* Right Column: CURRENT SIDE POSTERS LAYOUT (Exact Visual Box from Screen 2) */}
                <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
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
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs italic">
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

        {/* ================= SITE SETTINGS & FOOTER TABS ================= */}
        {(activeMenu === 'settings' || activeMenu === 'footer') && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {activeMenu === 'settings' ? 'Site & System Settings' : 'Footer & Social Presence'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized brand credentials and store metadata
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4 max-w-2xl text-xs">
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="font-bold text-slate-700 block">Brand & Agency Name</span>
                  <span className="text-slate-900 font-black text-sm">Eagle Eye Digital</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="font-bold text-slate-700 block">Official Support Email</span>
                  <span className="text-slate-900 font-mono">{BUSINESS_EMAIL}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="font-bold text-slate-700 block">WhatsApp Helpline</span>
                  <span className="text-slate-900 font-mono">01836126791</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="font-bold text-slate-700 block">Primary Super Admin UID</span>
                  <span className="text-slate-900 font-mono text-[11px]">{ADMIN_UID}</span>
                </div>
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
              <p><strong>Total Amount:</strong> αº│{selectedOrder.totalAmount} BDT</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 text-xs animate-in fade-in zoom-in duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
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

            <form onSubmit={handleSaveAdminForm} className="space-y-4">
              {/* Registration Error Alert */}
              {adminFormError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start space-x-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">লগইন ছাড়া অ্যাডমিন দেওয়া যাবে না!</strong>
                    <span className="text-[11px] leading-relaxed block mt-0.5">{adminFormError}</span>
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

              {/* Actions */}
              <div className="flex justify-end space-x-2.5 pt-3 border-t border-slate-100">
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

    </div>
  );
};
