# EAGLE EYE DIGITAL — COMPLETE PLATFORM SPECIFICATION & SETUP GUIDE

Digital Marketing • Agency Services • Digital Products • Admin Dashboard • Firebase

---

## 1. Project Overview & Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + React Router v6
- **Backend & Cloud Architecture**: Firebase Web SDK (v10), Cloud Firestore, Firebase Authentication, Firebase Storage, and Firebase Hosting configuration
- **Branding**: Official Eagle Eye Digital Logo (`/public/logo.jpg`), Primary Gold (`#E5A93C`, `#F3C96B`), Luxury Dark background (`#08090C`, `#12141C`), Silver highlights (`#E1E4EA`).
- **Policy**: Absolute no-demo-data policy. Real datasets only; clean empty states provided.

---

## 2. Environment Variables (.env)
Create a `.env` file in the root directory (based on `.env.example`):
```env
VITE_FIREBASE_API_KEY="AIzaSyB2nACPdON_r3sxBWECIp8ZLJbZFV8ZAwI"
VITE_FIREBASE_AUTH_DOMAIN="eagle-eye-digital-50a4f.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="eagle-eye-digital-50a4f"
VITE_FIREBASE_STORAGE_BUCKET="eagle-eye-digital-50a4f.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="879367302348"
VITE_FIREBASE_APP_ID="1:879367302348:web:718b9a0062065cfb512669"
VITE_SITE_URL="http://localhost:5173"
VITE_WHATSAPP_NUMBER="01836126791"
VITE_ADMIN_UID="cOpR7FgKjGeBkeWwIysygHvswwv1"
VITE_BUSINESS_EMAIL="Tamimnur908@gmail.com"
```

---

## 3. Installation & Local Development
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 4. Integration Markers & Verification Checklist

| Integration | Code / Config Marker Location | Status & Notes |
| :--- | :--- | :--- |
| **Firebase Web SDK** | 🔴 [INSERT FIREBASE WEB SDK CONFIGURATION HERE] in `src/lib/firebase.ts` | **Connected**: Initialized with environment credentials. |
| **Authentication** | 🔴 [CONNECT FIREBASE AUTHENTICATION HERE] in `src/context/AuthContext.tsx` & `src/pages/AccountPage.tsx` | **Connected**: Email/password, password reset, session persistence. |
| **Firestore Database** | 🔴 [CONNECT FIRESTORE DATABASE HERE] in `src/services/firestoreService.ts` | **Connected**: Modular data access for services, products, leads, orders, and case studies. |
| **Firebase Storage** | 🔴 [CONNECT FIREBASE STORAGE HERE] in `src/lib/firebase.ts` & `storage.rules` | **Configured**: Public previews separated from private `/protected_downloads/`. |
| **Admin Authorization** | 🔴 [CONFIGURE AUTHORIZED ADMIN UID OR CUSTOM CLAIM HERE] in `src/context/AuthContext.tsx` & `firestore.rules` | **Configured**: Authorized UID: `cOpR7FgKjGeBkeWwIysygHvswwv1` & custom claims support. |
| **Firestore Security Rules** | 🔴 [ADD FIRESTORE SECURITY RULES HERE] in `firestore.rules` | **Complete**: Enforces least-privilege access; public cannot tamper with prices or view private leads. |
| **Storage Security Rules** | 🔴 [ADD FIREBASE STORAGE RULES HERE] in `storage.rules` | **Complete**: Protects paid downloadable archives from unauthorized direct access. |
| **Cloud Functions** | 🔴 [CONFIGURE CLOUD FUNCTIONS HERE] | **Pending External Account**: To be deployed when an automated payment webhook (e.g. Stripe / bKash merchant API) is integrated. |
| **Payment Gateway** | 🔴 [ADD PAYMENT GATEWAY CONFIGURATION HERE] in `src/pages/CartPage.tsx` | **Manual In-Place**: Configured for local manual payment verification via bKash/Nagad/Bank Transfer until automated gateway credentials are provided. |
| **Email Service** | 🔴 [ADD EMAIL SERVICE CONFIGURATION HERE] | **Configurable**: Business email set to `Tamimnur908@gmail.com`. |
| **Custom Domain** | 🔴 [ADD CUSTOM DOMAIN HERE] | **Pending User Domain**: Deployment ready in `firebase.json`. |

---

## 5. Security Architecture
1. **Least-Privilege Database Access**: `firestore.rules` restricts write access on services, products, settings, and orders strictly to the verified administrator UID (`cOpR7FgKjGeBkeWwIysygHvswwv1`) or token claim `admin: true`.
2. **Inquiry / CRM Protection**: Leads submitted by visitors through public consultation forms are private to the administrator. Visitors cannot read or query inquiries submitted by others.
3. **No-Demo-Data Policy**: When collections are empty, clean and informative empty states are displayed with call-to-actions, ensuring no fraudulent client testimonials, results, or products are fabricated.
