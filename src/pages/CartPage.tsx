import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { createOrder } from '../services/firestoreService';
import { EmptyState } from '../components/EmptyState';
import { WHATSAPP_NUMBER } from '../lib/firebase';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, clearCart, totalPrice } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Bank Transfer'>('bKash');
  const [submitting, setSubmitting] = useState(false);
  const [orderCompleteId, setOrderCompleteId] = useState<string | null>(null);

  const isFreeOrder = totalPrice === 0;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerName) {
      alert('Please fill out your name and email address.');
      return;
    }

    setSubmitting(true);
    try {
      const orderId = await createOrder({
        userId: currentUser?.uid || 'guest_' + Date.now(),
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
        <h2 className="text-3xl font-extrabold text-slate-900">
          {isFreeOrder ? 'Download Ready!' : 'Order Placed (Pending Verification)'}
        </h2>
        <p className="text-sm text-slate-700">
          Order ID: <span className="font-mono text-amber-600 font-bold">{orderCompleteId}</span>
        </p>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          {isFreeOrder
            ? 'Your free download entitlements have been authorized. You can view your files in your customer account.'
            : 'Paid downloads are securely locked until payment verification. Our team will verify your transaction details and unlock your downloads promptly.'}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/account"
            className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm"
          >
            Go to My Account
          </Link>
          <a
            href={`https://wa.me/88${WHATSAPP_NUMBER}?text=Hi%20Eagle%20Eye%20Digital,%20I%20have%20placed%20order%20${orderCompleteId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
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
      <h1 className="text-3xl font-extrabold text-slate-900">Cart & Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-sm">
            {cart.map(({ product }) => (
              <div key={product.id} className="p-4 sm:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={product.thumbnailUrl || '/logo.jpg'}
                    alt={product.name}
                    className="w-16 h-16 rounded object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{product.name}</h4>
                    <span className="text-[11px] text-slate-500 capitalize">{product.productType.replace('_', ' ')}</span>
                    <div className="text-xs font-semibold text-amber-600 mt-1">
                      {product.price === 0 ? 'FREE' : `৳${product.salePrice ?? product.price}`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(product.id)}
                  className="text-slate-400 hover:text-red-500 p-2"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Items: {cart.length}</span>
            <button
              onClick={clearCart}
              className="text-red-500 hover:underline font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Order Summary</h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="text-slate-900 font-medium">৳{totalPrice}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Discount / Promo:</span>
              <span className="text-emerald-600 font-medium">৳0</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-100">
              <span className="text-slate-900">Total:</span>
              <span className="text-amber-600 font-extrabold">
                {isFreeOrder ? 'FREE' : `৳${totalPrice} BDT`}
              </span>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email (for delivery) *</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            {!isFreeOrder && (
              <>
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bKash', 'Nagad', 'Bank Transfer'] as const).map((method) => (
                      <button
                        type="button"
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`text-xs py-2 px-1 rounded-lg border text-center font-semibold transition-colors ${
                          paymentMethod === method
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-slate-700 space-y-1">
                  <span className="font-bold text-amber-800">Manual Payment Instructions:</span>
                  <p>Send ৳{totalPrice} BDT to Merchant/Personal Wallet: <strong className="text-slate-900">01836126791</strong></p>
                  <p className="text-slate-500">Reference: Digital Product Order</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sender Phone / Account Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction ID (TrxID)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 9J8K2LA19"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-all disabled:opacity-50 shadow-md shadow-amber-500/20"
            >
              {submitting ? 'Processing...' : isFreeOrder ? 'Complete Free Order' : 'Submit Order for Verification'}
            </button>
          </form>

          <div className="flex items-center space-x-2 text-[10px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Files are securely provisioned under Eagle Eye Digital commercial license.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
