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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#101828] to-[#246BFD] text-white flex items-center justify-center shadow-md shadow-[#246BFD]/25">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#246BFD] block">
            Eagle Eye Digital • Protected Cart
          </span>
          <h2 className="text-2xl font-black text-[#101828]">Login Required</h2>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed max-w-sm mx-auto">
            Please log in to your account to add products to your cart and continue shopping.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/account?mode=login&redirect=/cart"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#246BFD] hover:bg-[#1A56DB] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#246BFD]/25 transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In</span>
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
            <span>Cancel</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-center space-x-1.5 text-[11px] text-[#667085]">
          <ArrowLeft className="w-3.5 h-3.5" />
          <Link to="/products" className="hover:text-[#246BFD] font-medium transition-colors">
            Continue guest browsing in Digital Products Store
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerName) {
      alert('Please fill out your name and email address.');
      return;
    }

    if (!currentUser) {
      alert('Please log in to your account to complete checkout.');
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
      alert('An error occurred during order processing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderCompleteId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
        <h2 className="text-3xl font-extrabold text-[#101828]">
          {isFreeOrder ? 'Download Ready!' : 'Order Placed (Pending Verification)'}
        </h2>
        <p className="text-sm text-[#172033]">
          Order ID: <span className="font-mono text-[#246BFD] font-bold">{orderCompleteId}</span>
        </p>
        <p className="text-xs text-[#667085] max-w-lg mx-auto">
          {isFreeOrder
            ? 'Your free download entitlements have been authorized. You can view your files in your customer account.'
            : 'Paid downloads are securely locked until payment verification. Our team will verify your transaction details and unlock your downloads promptly.'}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/account"
            className="px-6 py-2.5 rounded-lg bg-[#246BFD] hover:bg-[#1A56DB] text-white font-bold text-xs shadow-sm transition-colors"
          >
            Go to My Account
          </Link>
          <a
            href={`https://wa.me/88${WHATSAPP_NUMBER}?text=Hi%20Eagle%20Eye%20Digital,%20I%20have%20placed%20order%20${orderCompleteId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Confirm on WhatsApp
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
          title="Your Cart is Empty"
          description="You haven't added any digital products or templates to your cart yet."
          actionText="Explore Digital Products"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-3xl font-extrabold text-[#101828]">Cart & Checkout</h1>

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
                    <h4 className="text-sm font-bold text-[#101828] truncate">{product.name}</h4>
                    <span className="text-[11px] text-[#667085] capitalize block">{product.productType.replace('_', ' ')}</span>
                    <div className="text-xs font-bold text-[#246BFD] mt-0.5">
                      {product.price === 0 ? 'FREE' : `৳${product.salePrice ?? product.price}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end border-t border-slate-50 pt-2 sm:border-0 sm:pt-0">
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-xs text-slate-400 hover:text-red-500 p-1.5 transition-colors flex items-center space-x-1 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sm:hidden text-[11px] font-medium text-red-500">Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs text-[#667085]">
            <span>Items: {cart.length}</span>
            <button
              onClick={clearCart}
              className="text-red-500 hover:underline font-medium cursor-pointer"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#101828] border-b border-slate-100 pb-3">Order Summary</h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#667085]">
              <span>Subtotal:</span>
              <span className="text-[#172033] font-medium">৳{totalPrice}</span>
            </div>
            <div className="flex justify-between text-[#667085]">
              <span>Discount / Promo:</span>
              <span className="text-emerald-600 font-medium">৳0</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-100">
              <span className="text-[#101828]">Total:</span>
              <span className="text-[#246BFD] font-extrabold">
                {isFreeOrder ? 'FREE' : `৳${totalPrice} BDT`}
              </span>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#246BFD] focus:ring-1 focus:ring-[#246BFD] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">Your Email (for delivery) *</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#246BFD] focus:ring-1 focus:ring-[#246BFD] focus:bg-white transition-colors"
              />
            </div>

            {!isFreeOrder && (
              <>
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-[#172033] mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {(['bKash', 'Nagad', 'Bank Transfer'] as const).map((method) => (
                      <button
                        type="button"
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`text-[11px] sm:text-xs py-2 px-1 rounded-lg border text-center font-semibold transition-colors truncate cursor-pointer ${
                          paymentMethod === method
                            ? 'bg-[#246BFD] text-white border-[#246BFD]'
                            : 'bg-[#F3F5F9] text-[#667085] border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-[11px] text-[#172033] space-y-1">
                  <span className="font-bold text-[#101828]">Manual Payment Instructions:</span>
                  <p>Send ৳{totalPrice} BDT to Merchant/Personal Wallet: <strong className="text-[#101828]">01836126791</strong></p>
                  <p className="text-[#667085]">Reference: Digital Product Order</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    Sender Phone / Account Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#246BFD] focus:ring-1 focus:ring-[#246BFD] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    Transaction ID (TrxID)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 9J8K2LA19"
                    className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#246BFD] focus:ring-1 focus:ring-[#246BFD] focus:bg-white transition-colors"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#246BFD] hover:bg-[#1A56DB] text-white font-black text-xs transition-all disabled:opacity-50 shadow-md shadow-[#246BFD]/25 cursor-pointer active:scale-[0.99]"
            >
              {submitting ? 'Processing...' : isFreeOrder ? 'Complete Free Order' : 'Submit Order for Verification'}
            </button>
          </form>

          <div className="flex items-center space-x-2 text-[10px] text-[#667085]">
            <ShieldCheck className="w-4 h-4 text-[#246BFD] flex-shrink-0" />
            <span>Files are securely provisioned under Eagle Eye Digital commercial license.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
