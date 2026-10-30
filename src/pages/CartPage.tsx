import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ShieldCheck, CheckCircle2, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { createOrder } from '../services/firestoreService';
import { EmptyState } from '../components/EmptyState';
import { WHATSAPP_NUMBER } from '../lib/firebase';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, clearCart, totalPrice } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Bank Transfer'>('bKash');
  const [submitting, setSubmitting] = useState(false);
  const [orderCompleteId, setOrderCompleteId] = useState<string | null>(null);

  const isFreeOrder = totalPrice === 0;

  // Unauthenticated visitors must log in before accessing cart or placing orders
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#08152F] to-[#2563EB] text-white flex items-center justify-center shadow-md shadow-[#2563EB]/25">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] block">
            Eagle Eye Digital • সুরক্ষিত কার্ট
          </span>
          <h2 className="text-2xl font-black text-[#08152F]">লগইন প্রয়োজন</h2>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed max-w-sm mx-auto">
            পণ্যটি কার্টে যোগ করতে এবং কেনাকাটা চালিয়ে যেতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/account?mode=login&redirect=/cart"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#2563EB]/25 transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
          >
            <LogIn className="w-4 h-4" />
            <span>লগইন করুন</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/products');
              }
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F3F5F9] hover:bg-slate-200 text-[#172033] font-bold text-xs sm:text-sm border border-slate-200 transition-all flex items-center justify-center cursor-pointer active:scale-[0.99]"
          >
            <span>বাতিল</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-center space-x-1.5 text-[11px] text-[#667085]">
          <ArrowLeft className="w-3.5 h-3.5" />
          <Link to="/products" className="hover:text-[#2563EB] font-medium transition-colors">
            ডিজিটাল প্রোডাক্ট স্টোরে গেস্ট হিসেবে ব্রাউজ চালিয়ে যান
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerName) {
      alert('অনুগ্রহ করে আপনার নাম ও ইমেইল ঠিকানা লিখুন।');
      return;
    }

    if (!currentUser) {
      alert('অর্ডার সম্পন্ন করতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।');
      navigate('/account?mode=login&redirect=/cart');
      return;
    }

    setSubmitting(true);
    try {
      const orderId = await createOrder({
        userId: currentUser.uid,
        customerName,
        customerEmail,
        totalAmount: totalPrice,
        currency: 'BDT',
        paymentStatus: isFreeOrder ? 'verified' : 'pending',
        paymentMethod: isFreeOrder ? 'Free Download' : paymentMethod,
        paymentDetails: isFreeOrder ? {} : { transactionId, bankOrMobileAccount: phone },
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.salePrice ?? item.product.price,
          fileUrl: item.product.googleDriveLink || item.product.downloadableFileUrl || '',
        })),
      });

      clearCart();
      setOrderCompleteId(orderId);
    } catch (err) {
      console.error('Failed to create order:', err);
      alert('অর্ডার প্রসেস করার সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderCompleteId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
        <h2 className="text-3xl font-extrabold text-[#08152F]">
          {isFreeOrder ? 'ডাউনলোড প্রস্তুত!' : 'অর্ডার সফলভাবে জমা হয়েছে (যাচাইাধীন)'}
        </h2>
        <p className="text-sm text-[#172033]">
          অর্ডার আইডি: <span className="font-mono text-[#2563EB] font-bold">{orderCompleteId}</span>
        </p>
        <p className="text-xs text-[#667085] max-w-lg mx-auto">
          {isFreeOrder
            ? 'আপনার ফ্রি ডাউনলোড অনুমোদন সম্পন্ন হয়েছে। আপনি আপনার কাস্টমার অ্যাকাউন্টে ফাইলসমূহ দেখতে পাবেন।'
            : 'পেইড ডাউনলোডসমূহ পেমেন্ট ভেরিফিকেশনের পর আনলক হবে। আমাদের টিম দ্রুত আপনার লেনদেনের তথ্য যাচাই করে ডাউনলোড লিংক আনলক করে দেবে।'}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/account?tab=orders"
            className="px-6 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm transition-colors"
          >
            আমার অ্যাকাউন্টে যান
          </Link>
          <a
            href={`https://wa.me/88${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              `হ্যালো Eagle Eye Digital, আমি একটি অর্ডার জমা দিয়েছি। অর্ডার আইডি: ${orderCompleteId}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            হোয়াটসঅ্যাপে নিশ্চিত করুন
          </a>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <EmptyState
          icon={ShoppingBag}
          title="আপনার কার্ট বর্তমানে খালি"
          description="আপনি এখনো কোনো ডিজিটাল প্রোডাক্ট বা টেমপ্লেট কার্টে যোগ করেননি।"
          actionText="ডিজিটাল প্রোডাক্টসমূহ দেখুন"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-3xl font-extrabold text-[#08152F]">শপিং কার্ট ও চেকআউট</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-sm">
            {cart.map(({ product }) => (
              <div key={product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                  <img
                    src={product.thumbnailUrl || '/logo.jpg'}
                    alt={product.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#08152F] truncate">{product.name}</h4>
                    <span className="text-[11px] text-[#667085] capitalize block">{product.productType.replace('_', ' ')}</span>
                    <div className="text-xs font-bold text-[#2563EB] mt-0.5">
                      {product.price === 0 ? 'FREE' : `৳${product.salePrice ?? product.price}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end border-t border-slate-50 pt-2 sm:border-0 sm:pt-0">
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-xs text-slate-400 hover:text-red-500 p-1.5 transition-colors flex items-center space-x-1 cursor-pointer"
                    title="পণ্যটি সরান"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sm:hidden text-[11px] font-medium text-red-500">সরান</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs text-[#667085]">
            <span>মোট পণ্য: {cart.length}টি</span>
            <button
              onClick={clearCart}
              className="text-red-500 hover:underline font-medium cursor-pointer"
            >
              কার্ট খালি করুন
            </button>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#08152F] border-b border-slate-100 pb-3">অর্ডারের সারসংক্ষেপ</h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#667085]">
              <span>উপমোট:</span>
              <span className="text-[#172033] font-medium">৳{totalPrice}</span>
            </div>
            <div className="flex justify-between text-[#667085]">
              <span>ডিসকাউন্ট:</span>
              <span className="text-emerald-600 font-medium">৳০</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-100">
              <span className="text-[#08152F]">সর্বমোট:</span>
              <span className="text-[#2563EB] font-extrabold">
                {isFreeOrder ? 'FREE' : `৳${totalPrice} BDT`}
              </span>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">আপনার নাম *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="সম্পূর্ণ নাম"
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">ইমেইল ঠিকানা (ডাউনলোড অ্যাক্সেসের জন্য) *</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>

            {!isFreeOrder && (
              <>
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-[#172033] mb-1">পেমেন্ট মাধ্যম</label>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {(['bKash', 'Nagad', 'Bank Transfer'] as const).map((method) => (
                      <button
                        type="button"
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`text-[11px] sm:text-xs py-2 px-1 rounded-lg border text-center font-semibold transition-colors truncate cursor-pointer ${
                          paymentMethod === method
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'bg-[#F3F5F9] text-[#667085] border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {method === 'bKash' ? 'বিকাশ' : method === 'Nagad' ? 'নগদ' : 'ব্যাংক'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-[11px] text-[#172033] space-y-1">
                  <span className="font-bold text-[#08152F]">ম্যানুয়াল পেমেন্ট নির্দেশনা:</span>
                  <p>বিকাশ বা নগদ পার্সোনাল/মার্চেন্ট নম্বরে ৳{totalPrice} টাকা সেন্ড মানি করুন: <strong className="text-[#08152F]">01836126791</strong></p>
                  <p className="text-[#667085]">রেফারেন্স: Digital Product Order</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    প্রেরকের মোবাইল বা অ্যাকাউন্ট নম্বর
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="০১XXXXXXXXX"
                    className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    ট্রানজেকশন আইডি (TrxID)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="যেমন: 9J8K2LA19"
                    className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs transition-all disabled:opacity-50 shadow-md shadow-[#2563EB]/25 cursor-pointer active:scale-[0.99]"
            >
              {submitting ? 'প্রসেসিং হচ্ছে...' : isFreeOrder ? 'ফ্রি অর্ডার সম্পন্ন করুন' : 'অর্ডার নিশ্চিতকরণ জমা দিন'}
            </button>
          </form>

          <div className="flex items-center space-x-2 text-[10px] text-[#667085]">
            <ShieldCheck className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
            <span>ফাইলসমূহ Eagle Eye Digital কমার্শিয়াল লাইসেন্সের অধীনে সুরক্ষিতভাবে প্রদান করা হয়।</span>
          </div>
        </div>

      </div>
    </div>
  );
};
