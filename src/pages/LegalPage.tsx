import React from 'react';
import { useLanguage } from '../i18n';

export const LegalPage: React.FC<{ type: 'privacy' | 'terms' | 'refund' | 'license' | 'faq' | 'support' }> = ({ type }) => {
  const { t, language } = useLanguage();

  const titles: Record<string, string> = {
    privacy: t('legal.titles.privacy'),
    terms: t('legal.titles.terms'),
    refund: t('legal.titles.refund'),
    license: t('legal.titles.license'),
    faq: t('legal.titles.faq'),
    support: t('legal.titles.support')
  };

  const isBn = language === 'bn';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs uppercase tracking-widest text-[#2563EB] font-bold">
          {t('legal.pageTitle')}
        </span>
        <h1 className="text-3xl font-extrabold text-[#08152F] mt-1">{titles[type]}</h1>
        <p className="text-xs text-[#667085] mt-1">{t('legal.lastRevised')}</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-[#08152F] leading-relaxed">
        {type === 'privacy' && (
          isBn ? (
            <>
              <h3 className="text-lg font-bold text-[#08152F]">১. তথ্য সংগ্রহ ও ব্যবহার</h3>
              <p>
                Eagle Eye Digital ক্লায়েন্টের ব্যবসায়িক তথ্য, ইমেইল ঠিকানা, ফোন/হোয়াটসঅ্যাপ নম্বর এবং প্রজেক্টের স্পেসিফিকেশন শুধুমাত্র কৌশলগত বিপণন, ওয়েব ডেভেলপমেন্ট এবং ডিজিটাল সেবা প্রদানের জন্য সংগ্রহ করে। আমরা তৃতীয় পক্ষের ডেটা ব্রোকারদের কাছে কোনো তথ্য বিক্রয় বা বিনিময় করি না।
              </p>
              <h3 className="text-lg font-bold text-[#08152F]">২. ডেটা নিরাপত্তা ও এনক্রিপশন</h3>
              <p>
                সকল গ্রাহকের ডেটা ট্রান্সমিশন স্ট্যান্ডার্ড SSL/TLS এনক্রিপশন এবং গুগল ক্লাউড ফায়ারস্টোরের কঠোর নিরাপত্তা নীতিমালার মাধ্যমে সংরক্ষিত থাকে।
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-[#08152F]">1. Information Collection & Usage</h3>
              <p>
                Eagle Eye Digital collects client business details, email addresses, phone/WhatsApp numbers, and project specifications exclusively to deliver strategic marketing, web development, and digital services. We never sell or exchange client lists with third-party data brokers.
              </p>
              <h3 className="text-lg font-bold text-[#08152F]">2. Data Security & Encryption</h3>
              <p>
                All customer transmissions are encrypted using standard SSL/TLS and saved in Google Cloud Firestore with least-privilege security rules.
              </p>
            </>
          )
        )}

        {type === 'terms' && (
          isBn ? (
            <>
              <h3 className="text-lg font-bold text-[#08152F]">১. সার্ভিস চুক্তি ও রিটেইনার</h3>
              <p>
                সকল মার্কেটিং রিটেইনার এবং প্রজেক্ট চুক্তি উভয় পক্ষের মাইলফলক অনুমোদনের ভিত্তিতে পরিচালিত হয়। ইনভয়েস তৈরির আগে আনুষ্ঠানিক কোটেশনে কাজের পরিধি বিস্তারিতভাবে উল্লেখ করা হয়।
              </p>
              <h3 className="text-lg font-bold text-[#08152F]">২. বুদ্ধিবৃত্তিক সম্পদ অধিকার (IP Rights)</h3>
              <p>
                চুক্তির সম্পূর্ণ ফি পরিশোধের পর, কাস্টম ডিজাইন এবং কোডবেসের মালিকানা সম্পূর্ণভাবে ক্লায়েন্টের হবে, এজেন্সির বিদ্যমান প্রোপাইটারি টুলকিট ব্যতীত।
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-[#08152F]">1. Service Engagements & Retainers</h3>
              <p>
                All marketing retainers and project contracts are governed by mutual milestone approvals. Deliverables are specified in formal quotations prior to invoice generation.
              </p>
              <h3 className="text-lg font-bold text-[#08152F]">2. Intellectual Property Rights</h3>
              <p>
                Upon complete settlement of agreed contract fees, bespoke design and codebase deliverables belong entirely to the client, excluding proprietary pre-existing agency toolkits.
              </p>
            </>
          )
        )}

        {type === 'refund' && (
          isBn ? (
            <>
              <h3 className="text-lg font-bold text-[#08152F]">১. এজেন্সি সার্ভিসসমূহ</h3>
              <p>
                নির্দিষ্ট রিসোর্স বরাদ্দ, রিসার্চের সময় এবং বিজ্ঞাপন খরচের কারণে সম্পন্ন হওয়া মাইলফলক কাজের ফি অফেরতযোগ্য। মাইলফলক শুরুর পূর্বে বাতিলকরণের ক্ষেত্রে আনুপাতিক হিসাব বিবেচনা করা হবে।
              </p>
              <h3 className="text-lg font-bold text-[#08152F]">২. ডিজিটাল প্রোডাক্টস</h3>
              <p>
                ডিজিটাল অ্যাসেটস (ফিগমা কিট, কোড টেমপ্লেট ইত্যাদি) তাৎক্ষণিক ডাউনলোডযোগ্য এবং ফেরতযোগ্য নয় বলে বিক্রয় সাধারণত চূড়ান্ত, যদি না কোনো কারিগরি ত্রুটি ফাইল এক্সট্রাকশনে বাধা দেয়।
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-[#08152F]">1. Agency Services</h3>
              <p>
                Due to dedicated resource allocation, research hours, and ad spend execution, fees for completed milestone work are non-refundable. Cancellations prior to milestone kickoff are eligible for pro-rated account reconciliation.
              </p>
              <h3 className="text-lg font-bold text-[#08152F]">2. Digital Products</h3>
              <p>
                Because digital assets (Figma kits, code templates, documents) are instantly downloadable and non-returnable, sales are generally final unless a technical defect prevents file extraction.
              </p>
            </>
          )
        )}

        {type === 'license' && (
          isBn ? (
            <>
              <h3 className="text-lg font-bold text-[#08152F]">১. স্ট্যান্ডার্ড কমার্শিয়াল লাইসেন্স</h3>
              <p>
                সীমাহীন ব্যক্তিগত বা ক্লায়েন্টের বাণিজ্যিক প্রজেক্টে ব্যবহারের অনুমতি দেয়। আপনি মূল সোর্স ফাইলগুলো একক টেমপ্লেট হিসেবে পুনরায় বিক্রি, সাব-লাইসেন্স বা বিতরণ করতে পারবেন না।
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-[#08152F]">1. Standard Commercial License</h3>
              <p>
                Permits use in unlimited personal or client commercial projects. You may not resell, sub-license, or redistribute raw source files as standalone templates.
              </p>
            </>
          )
        )}

        {type === 'faq' && (
          isBn ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-[#08152F]">আপনারা কি নির্দিষ্ট বিক্রয় বা ROAS-এর গ্যারান্টি দেন?</h4>
                <p className="text-xs text-[#667085] mt-1">
                  কোনো দায়িত্বশীল এজেন্সি বিক্রয়ের গ্যারান্টি দিতে পারে না কারণ প্রোডাক্ট-মার্কেট ফিট, ইনভেন্টরি ইত্যাদি ক্লায়েন্টের নিয়ন্ত্রণে থাকে। আমরা নির্ভুল পরীক্ষা, বিজ্ঞাপন অপ্টিমাইজেশন এবং ডেটা-চালিত ক্রিয়েটিভ সম্পাদনের গ্যারান্টি দিই।
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-[#08152F]">চলমান ক্যাম্পেইনের সময় আমরা কীভাবে যোগাযোগ করব?</h4>
                <p className="text-xs text-[#667085] mt-1">
                  আমরা সার্বক্ষণিক WhatsApp চ্যানেল, শিডিউল করা স্ট্র্যাটেজি কল এবং রিয়েল-টাইম প্রজেক্ট ট্র্যাকিং প্রদান করি।
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-[#08152F]">Do you guarantee specific sales or ROAS?</h4>
                <p className="text-xs text-[#667085] mt-1">
                  No ethical agency can guarantee sales because variables such as product market fit, inventory, and supply chain remain under client control. We guarantee precision testing, ad optimization, and data-backed creative execution.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-[#08152F]">How do we communicate during active campaigns?</h4>
                <p className="text-xs text-[#667085] mt-1">
                  We provide dedicated WhatsApp channels, scheduled strategy calls, and real-time project milestone tracking.
                </p>
              </div>
            </div>
          )
        )}

        {type === 'support' && (
          isBn ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#08152F]">প্রযুক্তিগত বা বাণিজ্যিক সহায়তার প্রয়োজন?</h3>
              <p>
                আমাদের সাপোর্ট টিম ইমেইলের মাধ্যমে <strong className="text-[#08152F]">Tamimnur908@gmail.com</strong> অথবা WhatsApp-এ <strong className="text-emerald-700 font-bold">01836126791</strong> নম্বরে সার্বক্ষণিক উপলব্ধ।
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#08152F]">Need Technical or Commercial Assistance?</h3>
              <p>
                Our support team is available via email at <strong className="text-[#08152F]">Tamimnur908@gmail.com</strong> or via WhatsApp at <strong className="text-emerald-700 font-bold">01836126791</strong>.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
