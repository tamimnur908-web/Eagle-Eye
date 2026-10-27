import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductBySlug } from '../services/firestoreService';
import { DigitalProduct } from '../types';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ShoppingBag, Download, ShieldCheck, Key, BookOpen, Copy, Check } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<DigitalProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedPass, setCopiedPass] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        const data = await getProductBySlug(slug);
        setProduct(data);
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-600">The product you are looking for has not been published or does not exist.</p>
        <Link to="/products" className="inline-block px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm">
          Back to Store
        </Link>
      </div>
    );
  }

  const isFree = product.price === 0 || product.isFree;
  const downloadUrl = product.googleDriveLink || product.downloadableFileUrl;
  const buttonText = product.customDownloadBtnText || (isFree ? 'Instant Google Drive Download' : 'Add to Cart / Purchase');

  const handleAction = () => {
    if (isFree && downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    addToCart(product);
    navigate('/cart');
  };

  const copyPassword = () => {
    if (product.zipPassword) {
      navigator.clipboard.writeText(product.zipPassword);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div>
        <Link to="/products" className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-amber-600">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Digital Store</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Product Visual Previews */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
            <img
              src={product.thumbnailUrl || '/logo.jpg'}
              alt={product.name}
              className="w-full h-auto max-h-[480px] object-cover"
            />
          </div>

          {product.previewImages && product.previewImages.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {product.previewImages.map((img, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-lg overflow-hidden h-24 shadow-sm">
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Installation / Setup Guide */}
          {product.installGuide && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center space-x-2 text-indigo-700">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Installation & Setup Guide</h3>
              </div>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-lg border border-slate-200 font-mono">
                {product.installGuide}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Product Overview</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>

        {/* Purchase & Metadata Card */}
        <div className="lg:col-span-5 space-y-6 sticky top-28">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-md">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                  {product.category}
                </span>
                {product.itemType && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {product.itemType}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {product.name}
              </h1>
            </div>

            {/* Price display */}
            <div className="flex items-baseline space-x-3 border-y border-slate-200 py-4">
              {isFree ? (
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-black text-emerald-600">FREE</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    GIVEAWAY
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-3xl font-black text-slate-900">
                    ৳{product.salePrice ?? product.price}
                  </span>
                  {product.salePrice && (
                    <span className="text-sm text-slate-400 line-through">৳{product.price}</span>
                  )}
                  {product.showDiscountBadge && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                      ON SALE
                    </span>
                  )}
                </>
              )}
            </div>

            {/* ZIP Password box if present */}
            {product.zipPassword && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-700" />
                    <span>Archive / ZIP Password:</span>
                  </span>
                  <button
                    type="button"
                    onClick={copyPassword}
                    className="flex items-center space-x-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-200/60 px-2 py-0.5 rounded transition"
                  >
                    {copiedPass ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-sm font-bold bg-white px-3 py-1.5 rounded border border-amber-200 text-slate-800">
                  {product.zipPassword}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-3">
              <button
                onClick={handleAction}
                className={`w-full py-3.5 px-6 rounded-xl text-white font-extrabold text-sm transition-all flex items-center justify-center space-x-2 shadow-md ${
                  isFree
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                }`}
              >
                {isFree ? (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{buttonText}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{buttonText}</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-500">
                {isFree
                  ? 'Instant high-speed download link available.'
                  : 'Instant download link unlocked upon payment verification.'}
              </p>
            </div>

            {/* Technical Specs */}
            <div className="space-y-3 pt-4 border-t border-slate-200 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Format:</span>
                <span className="font-semibold text-slate-800">{product.format || 'Digital Archive (.ZIP)'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Delivery:</span>
                <span className="font-semibold text-slate-800">
                  {product.googleDriveLink ? 'Direct Google Drive' : 'Digital Cloud Download'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">License:</span>
                <span className="font-semibold text-slate-800">{product.license || 'Standard Commercial'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Version:</span>
                <span className="font-semibold text-slate-800">{product.version || '1.0.0'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Product Type:</span>
                <span className="font-semibold text-slate-800 capitalize">{(product.productType || 'digital').replace('_', ' ')}</span>
              </div>
            </div>

            {/* License Note */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                Licensed for personal and commercial projects. Resale, sub-licensing, or redistribution of the raw source files is strictly prohibited.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
