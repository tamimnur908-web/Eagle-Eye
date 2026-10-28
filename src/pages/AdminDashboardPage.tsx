import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
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
  Maximize2
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
  getAllOrders,
  updateOrderStatus,
  getBentoConfig,
  saveBentoConfig,
  defaultBentoConfig,
  defaultHeroSlides
} from '../services/firestoreService';
import { Service, DigitalProduct, ProductCategory, Lead, Order, BentoConfig, HeroSlide } from '../types';
import { EmptyState } from '../components/EmptyState';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Active Menu Selection (Exact Vyrqonix Left Sidebar)
  const [activeMenu, setActiveMenu] = useState<
    | 'dashboard'
    | 'orders'
    | 'products'
    | 'services'
    | 'categories'
    | 'leads'
    | 'homepage'
    | 'footer'
    | 'settings'
  >('products');

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

  // Auto-advance preview slides if previewAutoPlay is enabled
  useEffect(() => {
    if (!previewAutoPlay) return;
    const slidesList = bentoForm.heroSlides && bentoForm.heroSlides.length > 0
      ? bentoForm.heroSlides
      : defaultHeroSlides;
    if (slidesList.length <= 1) return;
    const timer = setInterval(() => {
      setPreviewSlideIndex((prev) => (prev + 1) % slidesList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [previewAutoPlay, bentoForm.heroSlides]);

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [bData, sData, pData, cData, lData, oData] = await Promise.all([
        getBentoConfig().catch(() => defaultBentoConfig),
        getAllServices().catch(() => []),
        getAllProducts().catch(() => []),
        getAllCategories().catch(() => []),
        getAllLeads().catch(() => []),
        getAllOrders().catch(() => [])
      ]);
      setBentoForm(bData);
      setServices(sData);
      setProducts(pData);
      setCategories(cData);
      setLeads(lData);
      setOrders(oData);
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
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleCancelEditSlide = () => {
    setEditingSlideIndex(null);
    setNewSlideImg('');
    setNewSlideTitle('');
    setNewSlideLink('/products');
  };

  // Add or Update Hero Slide Action
  const handleCreateHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideImg.trim()) {
      alert('Slide image is required. Please choose an image or enter an image URL.');
      return;
    }

    const currentSlides = [...(bentoForm.heroSlides && bentoForm.heroSlides.length > 0
      ? bentoForm.heroSlides
      : defaultHeroSlides)];

    if (editingSlideIndex !== null) {
      currentSlides[editingSlideIndex] = {
        ...currentSlides[editingSlideIndex],
        bgImage: newSlideImg.trim(),
        title: newSlideTitle.trim() || currentSlides[editingSlideIndex].title,
        btn1Link: newSlideLink.trim() || '/products'
      };
      const updatedBento = { ...bentoForm, heroSlides: currentSlides };
      setBentoForm(updatedBento);
      await saveBentoConfig(updatedBento);
      handleCancelEditSlide();
      setBentoSaved(true);
      setTimeout(() => setBentoSaved(false), 3000);
      return;
    }

    const newSlide: HeroSlide = {
      id: 'slide-' + Date.now(),
      tag: 'Featured Highlight',
      title: newSlideTitle.trim() || 'Premium Digital Products for Smart Buyers',
      description: 'Explore verified digital tools, agency retainers, and graphic vault.',
      btn1Text: 'Browse Store',
      btn1Link: newSlideLink.trim() || '/products',
      btn2Text: 'Agency Services',
      btn2Link: '/services',
      bgImage: newSlideImg.trim(),
      image3D: ''
    };
    const updatedSlides = [...currentSlides, newSlide];
    const updatedBento = { ...bentoForm, heroSlides: updatedSlides };
    setBentoForm(updatedBento);
    await saveBentoConfig(updatedBento);
    setNewSlideImg('');
    setNewSlideTitle('');
    setNewSlideLink('/products');
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
                  onClick={() => {
                    setActiveMenu(item.id as any);
                    if (item.id === 'products') setProductViewMode('list');
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
        <div className="space-y-1 pt-4 border-t border-slate-100 text-xs">
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
                                <span className="text-slate-400 text-[11px]">—</span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 font-medium text-slate-600 text-[11px]">
                              <strong className="text-slate-900">{p.salesCount || 0}</strong> orders • <strong className="text-slate-900">{p.downloadsCount || 0}</strong> dl
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
                    setActiveMenu('products');
                    setProductViewMode('create');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>

                <button
                  onClick={() => setActiveMenu('categories')}
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

                    {/* Slide Title / Description */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Slide Title / Description
                      </label>
                      <input
                        type="text"
                        value={newSlideTitle}
                        onChange={(e) => setNewSlideTitle(e.target.value)}
                        placeholder="e.g. Premium Digital Products for Smart Buyers"
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
                        value={newSlideLink}
                        onChange={(e) => setNewSlideLink(e.target.value)}
                        placeholder="/shop"
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
                          <span>LIVE HOMEPAGE PREVIEW (ওয়েবসাইটে যেমন দেখাবে)</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          স্লাইড করে দেখুন, লেখা ও ছবির অ্যানিমেশন দেখুন এবং ফুল ওয়েব লেআউট প্রিভিউ করুন:
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
                      const currentPreview = previewSlides[previewSlideIndex] || previewSlides[0];
                      const activeBg = (editingSlideIndex === previewSlideIndex && newSlideImg)
                        ? newSlideImg
                        : (editingSlideIndex === null && newSlideImg)
                        ? newSlideImg
                        : currentPreview?.bgImage;
                      const active3D = currentPreview?.image3D;

                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-700 text-[11px] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                Slide {previewSlideIndex + 1} of {previewSlides.length}
                              </span>
                              {editingSlideIndex === previewSlideIndex && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                  Live Editing
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-1.5">
                              {/* Slide Prev Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewSlideIndex(
                                    (prev) => (prev - 1 + previewSlides.length) % previewSlides.length
                                  )
                                }
                                className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                                title="Previous Slide"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>

                              {/* Play / Pause Toggle Button */}
                              <button
                                type="button"
                                onClick={() => setPreviewAutoPlay(!previewAutoPlay)}
                                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center space-x-1 transition-colors ${
                                  previewAutoPlay
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 bg-slate-50 text-slate-600'
                                }`}
                                title={previewAutoPlay ? 'Pause Auto Slide' : 'Play Auto Slide'}
                              >
                                {previewAutoPlay ? (
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
                                onClick={() =>
                                  setPreviewSlideIndex((prev) => (prev + 1) % previewSlides.length)
                                }
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
                                key={`preview-bg-${previewSlideIndex}`}
                                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out animate-ken-burns scale-100"
                                style={
                                  activeBg
                                    ? { backgroundImage: `url(${activeBg})` }
                                    : { backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 50%, #0f172a 100%)' }
                                }
                              />

                              {/* Dark Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-transparent pointer-events-none" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />
                              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/25 rounded-full blur-2xl pointer-events-none animate-pulse-glow" />

                              {/* Slide Prev/Next Overlay Buttons inside Mockup */}
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewSlideIndex(
                                    (prev) => (prev - 1 + previewSlides.length) % previewSlides.length
                                  )
                                }
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all z-30 shadow-md"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewSlideIndex((prev) => (prev + 1) % previewSlides.length)
                                }
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all z-30 shadow-md"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>

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
                                      {currentPreview?.tag || 'Eagle Eye Digital • Featured'}
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
                                        <span>🚀</span>
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
                                      onClick={() => setPreviewSlideIndex(idx)}
                                      aria-label={`Slide ${idx + 1}`}
                                      className={`transition-all duration-300 rounded-full ${
                                        previewSlideIndex === idx
                                          ? 'w-5 h-2 bg-gradient-to-r from-amber-400 to-amber-300 shadow-sm'
                                          : 'w-2 h-2 bg-white/35 hover:bg-white'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
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
                                      {bentoForm.card1LinkText || 'Explore Retainers →'}
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
                                      Get Products →
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
                                      {bentoForm.card3LinkText || 'Shop Store →'}
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
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                        ACTIVE HERO SLIDER BANNERS ({(bentoForm.heroSlides || defaultHeroSlides).length})
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        Rotates every 4.5s on Homepage
                      </span>
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

    </div>
  );
};
