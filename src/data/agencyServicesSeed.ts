import { Service, ServiceCategory, SubService } from '../types';

export const INITIAL_SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-digital-marketing',
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'Data-driven growth marketing, performance advertising, SEO, and omnichannel brand expansion.',
    sortOrder: 1
  },
  {
    id: 'cat-web-creative',
    name: 'Web Development and Creative Services',
    slug: 'web-development-creative-services',
    description: 'High-performance web architecture, conversion-focused landing pages, UI/UX systems, and brand identities.',
    sortOrder: 2
  },
  {
    id: 'cat-ai-automation',
    name: 'AI and Business Automation',
    slug: 'ai-business-automation',
    description: 'Intelligent workflow automations, customer support chatbots, and CRM integrations for operational velocity.',
    sortOrder: 3
  }
];

export interface SeedServiceDefinition {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId: string;
  shortDescription: string;
  longDescription: string;
  iconName: string;
  imageUrl?: string;
  benefits: string[];
  deliverables: string[];
  scopeOfWork: string[];
  timeline: string;
  price?: number | null;
  pricingType: 'fixed' | 'monthly' | 'custom' | 'on_request';
  status: 'published' | 'draft' | 'archived';
  isFeatured: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  faqs: { question: string; answer: string }[];
  subservices: {
    name: string;
    slug: string;
    shortDescription: string;
    sortOrder: number;
  }[];
}

export const SEED_SERVICES_CATALOG: SeedServiceDefinition[] = [
  // ==========================================
  // CATEGORY A: DIGITAL MARKETING
  // ==========================================
  {
    id: 'srv-social-media-management',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80',
    name: 'Social Media Management',
    slug: 'social-media-management',
    category: 'Digital Marketing',
    categoryId: 'cat-digital-marketing',
    iconName: 'Share2',
    shortDescription: 'End-to-end social media growth, engaging visual post production, strategic scheduling, and community management.',
    longDescription: `Build an authentic, high-impact presence across premier social channels. Eagle Eye Digital crafts bespoke social strategies tailored to your target audience. We oversee content ideation, creative production, publishing calendars, and performance analytics to turn passive followers into active brand advocates.`,
    benefits: [
      'Consistent, cohesive brand visibility across top social networks',
      'High-quality visual creatives and copy tailored to your industry',
      'Active community engagement and audience relationship nurturing',
      'Comprehensive monthly data audits and actionable performance reports'
    ],
    deliverables: [
      'Comprehensive social media strategic roadmap',
      'Monthly editorial and visual content calendar',
      'Custom branded graphic post and story designs',
      'Optimized scheduling and caption copywriting',
      'Community moderation and engagement handling',
      'Detailed monthly analytics and performance audit'
    ],
    scopeOfWork: [
      'Profile setup, audit, and bio optimization',
      'Content ideation, pillar development, and copy writing',
      'Static, carousel, and video post asset creation',
      'Audience interaction, comment moderation, and DM triage',
      'Weekly publishing oversight and bi-weekly growth tracking'
    ],
    timeline: 'Ongoing Monthly Engagement',
    price: null,
    pricingType: 'on_request',
    status: 'published',
    isFeatured: true,
    sortOrder: 1,
    seoTitle: 'Social Media Management Services | Eagle Eye Digital',
    seoDescription: 'Elevate your online presence with strategic social media management, creative post designs, content calendars, and community engagement from Eagle Eye Digital.',
    faqs: [
      {
        question: 'Which social platforms do you manage?',
        answer: 'We actively manage Facebook, Instagram, LinkedIn, and YouTube channels tailored to where your target demographic spends attention.'
      },
      {
        question: 'Do we get to approve posts before they go live?',
        answer: 'Yes. All social posts, captions, and creative assets are shared in an advance monthly content calendar for your review and approval.'
      }
    ],
    subservices: [
      {
        name: 'Social Media Strategy',
        slug: 'social-media-strategy',
        shortDescription: 'In-depth market positioning, channel selection, and audience profiling for sustainable social expansion.',
        sortOrder: 1
      },
      {
        name: 'Facebook Page Management',
        slug: 'facebook-page-management',
        shortDescription: 'Complete administration, updates, story publications, and audience interactions on your Facebook business page.',
        sortOrder: 2
      },
      {
        name: 'Instagram Management',
        slug: 'instagram-management',
        shortDescription: 'Grid curation, aesthetic visual storytelling, Reels coordination, and bio optimization for Instagram.',
        sortOrder: 3
      },
      {
        name: 'Social Media Content Planning',
        slug: 'social-media-content-planning',
        shortDescription: 'Thematic content pillars, campaign brainstorming, and high-engagement post topic roadmaps.',
        sortOrder: 4
      },
      {
        name: 'Content Calendar Creation',
        slug: 'content-calendar-creation',
        shortDescription: 'Structured monthly publication schedules ensuring consistent and predictable publishing frequencies.',
        sortOrder: 5
      },
      {
        name: 'Social Media Post Design',
        slug: 'social-media-post-design',
        shortDescription: 'Custom graphic designs, carousel templates, and visual layouts aligned with your brand identity.',
        sortOrder: 6
      },
      {
        name: 'Content Publishing and Scheduling',
        slug: 'content-publishing-and-scheduling',
        shortDescription: 'Timely automated and manual distribution during peak engagement hours across target channels.',
        sortOrder: 7
      },
      {
        name: 'Audience Engagement Management',
        slug: 'audience-engagement-management',
        shortDescription: 'Proactive comment response, inquiry routing, and community dialogue fostering authentic brand loyalty.',
        sortOrder: 8
      },
      {
        name: 'Social Media Account Audit',
        slug: 'social-media-account-audit',
        shortDescription: 'Thorough evaluation of profile setups, visual consistency, engagement ratios, and growth hurdles.',
        sortOrder: 9
      },
      {
        name: 'Social Media Performance Reporting',
        slug: 'social-media-performance-reporting',
        shortDescription: 'Transparent monthly reporting analyzing follower growth, reach metrics, engagement rates, and key findings.',
        sortOrder: 10
      }
    ]
  },
  {
    id: 'srv-meta-ads-management',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    name: 'Meta Ads Management',
    slug: 'meta-ads-management',
    category: 'Digital Marketing',
    categoryId: 'cat-digital-marketing',
    iconName: 'Target',
    shortDescription: 'Targeted advertising across Facebook and Instagram engineered for verified lead generation, e-commerce purchases, and scalable return on ad spend.',
    longDescription: `Maximize your advertising capital across Meta's powerful consumer platforms. We design full-funnel ad architectures including audience segmentation, creative copywriting, conversion pixel integrations, dynamic retargeting, and rigorous split-testing. Our data-guided methodology delivers commercial outcomes and transparent ROAS.`,
    benefits: [
      'Granular demographic, behavioral, and lookalike audience targeting',
      'High-converting ad copy, visual variations, and video hooks',
      'Advanced Conversion API (CAPI) and Meta Pixel setup for precise tracking',
      'Active campaign budget optimization (CBO/ABO) to prevent wasted spend'
    ],
    deliverables: [
      'Comprehensive Meta advertising campaign roadmap',
      'Audience research matrix and custom segment builder',
      'High-converting ad creative copy and visual assets',
      'Meta Pixel and Conversions API technical configuration',
      'Retargeting funnels for abandoned carts and warm visitors',
      'Live dashboard access and weekly performance reporting'
    ],
    scopeOfWork: [
      'Ads Manager structure audit and technical setup',
      'Ad creative briefing, copy variations, and graphic design',
      'Full-funnel campaign launches: Top, Middle, and Bottom of Funnel',
      'Daily bid, creative, and budget optimizations',
      'A/B split testing of creative angles, audiences, and headlines'
    ],
    timeline: 'Monthly Retainer with Weekly Sprints',
    price: null,
    pricingType: 'on_request',
    status: 'published',
    isFeatured: true,
    sortOrder: 2,
    seoTitle: 'Meta Ads Management (Facebook & Instagram) | Eagle Eye Digital',
    seoDescription: 'Scale your revenue with expert Meta Ads management. Targeted Facebook and Instagram ad campaigns, creative optimization, and conversion tracking.',
    faqs: [
      {
        question: 'Is ad spend included in the service fee?',
        answer: 'No. Advertising spend is billed directly by Meta to your credit card or payment method. Our fee covers strategy, creative production, execution, and daily optimization.'
      },
      {
        question: 'How do you track campaign conversions?',
        answer: 'We configure both the client-side Meta Pixel and server-side Conversions API (CAPI) through Google Tag Manager to ensure resilient data capture.'
      }
    ],
    subservices: [
      {
        name: 'Facebook Advertising',
        slug: 'facebook-advertising',
        shortDescription: 'Feed, story, and in-stream ads reaching precise consumer and business demographics on Facebook.',
        sortOrder: 1
      },
      {
        name: 'Instagram Advertising',
        slug: 'instagram-advertising',
        shortDescription: 'Visually compelling visual and Reels ads capturing high-intent shoppers and modern audiences on Instagram.',
        sortOrder: 2
      },
      {
        name: 'Campaign Strategy and Setup',
        slug: 'campaign-strategy-and-setup',
        shortDescription: 'Full-funnel campaign structuring tailored to brand awareness, consideration, and conversion goals.',
        sortOrder: 3
      },
      {
        name: 'Audience Research and Targeting',
        slug: 'audience-research-and-targeting',
        shortDescription: 'Identification of interest matrices, custom audience segments, and high-affinity lookalike profiles.',
        sortOrder: 4
      },
      {
        name: 'Retargeting Campaigns',
        slug: 'retargeting-campaigns',
        shortDescription: 'Strategic re-engagement of website visitors, video viewers, and previous shoppers to finalize conversions.',
        sortOrder: 5
      },
      {
        name: 'Lead Generation Campaigns',
        slug: 'lead-generation-campaigns',
        shortDescription: 'Instant form workflows and dedicated landing page funnels capturing qualified commercial inquiries.',
        sortOrder: 6
      },
      {
        name: 'E-commerce Advertising',
        slug: 'ecommerce-advertising',
        shortDescription: 'Dynamic catalog product ads and multi-product carousel campaigns scaling direct store sales.',
        sortOrder: 7
      },
      {
        name: 'Ad Creative Planning',
        slug: 'ad-creative-planning',
        shortDescription: 'Hook ideation, visual format selection, and copy angle testing ensuring high click-through rates.',
        sortOrder: 8
      },
      {
        name: 'Campaign Optimization',
        slug: 'campaign-optimization',
        shortDescription: 'Continuous adjustments to bids, placements, audience fatigue, and creative frequency caps.',
        sortOrder: 9
      },
      {
        name: 'Conversion Tracking Setup',
        slug: 'conversion-tracking-setup',
        shortDescription: 'Meta Pixel and Conversions API implementation for reliable event attribution and reporting.',
        sortOrder: 10
      },
      {
        name: 'Advertising Performance Reporting',
        slug: 'advertising-performance-reporting',
        shortDescription: 'In-depth performance reviews tracking cost-per-acquisition, click-through rates, and ROAS.',
        sortOrder: 11
      }
    ]
  },
  {
    id: 'srv-google-ads-management',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    name: 'Google Ads Management',
    slug: 'google-ads-management',
    category: 'Digital Marketing',
    categoryId: 'cat-digital-marketing',
    iconName: 'Compass',
    shortDescription: 'High-intent search, display, and YouTube ad campaigns capturing prospective buyers right when they search for your offerings.',
    longDescription: `Capture customers at their highest point of commercial intent. Our Google Ads management services cover keyword architecture, responsive search ads, negative keyword sculpting, Google Display Network outreach, YouTube video campaigns, and Google Tag Manager conversion attribution.`,
    benefits: [
      'Immediate capture of high-intent search queries for your products or services',
      'Negative keyword sculpting to eliminate irrelevant click waste',
      'Multi-touch conversion tracking for form submissions, phone calls, and purchases',
      'Continuous Quality Score improvements reducing your cost-per-click'
    ],
    deliverables: [
      'Comprehensive keyword research and commercial intent map',
      'Single-theme ad group structure (STAG) for maximum relevance',
      'Compelling responsive search ad (RSA) copy with dynamic assets',
      'Conversion tracking setup via Google Tag Manager and GA4',
      'Bid strategy optimization (Max Conversions, Target CPA, Target ROAS)',
      'Transparent monthly executive performance reports'
    ],
    scopeOfWork: [
      'Competitor keyword and auction insights analysis',
      'Campaign setup: Search, Display, Remarketing, and YouTube',
      'Ad extension configuration: Callouts, Sitelinks, Structured Snippets',
      'Daily search term query analysis and negative keyword maintenance',
      'Bid optimization and landing page alignment reviews'
    ],
    timeline: 'Monthly Management Engagement',
    price: null,
    pricingType: 'on_request',
    status: 'published',
    isFeatured: false,
    sortOrder: 3,
    seoTitle: 'Google Ads Management Services | Eagle Eye Digital',
    seoDescription: 'Capture high-intent prospective customers with Google Search, Display, Remarketing, and YouTube ad campaigns engineered for ROI by Eagle Eye Digital.',
    faqs: [
      {
        question: 'What campaign types do you manage on Google Ads?',
        answer: 'We manage Google Search Ads, Display Network, YouTube Video Ads, Performance Max (PMax), and Remarketing campaigns.'
      },
      {
        question: 'How do you prevent wasted ad spend on Google?',
        answer: 'We rigorously manage negative keyword lists, utilize exact and phrase match types strategically, and continuously review search query reports.'
      }
    ],
    subservices: [
      {
        name: 'Google Search Ads',
        slug: 'google-search-ads',
        shortDescription: 'Text ads triggered by exact commercial keywords on Google search engine results pages.',
        sortOrder: 1
      },
      {
        name: 'Google Display Ads',
        slug: 'google-display-ads',
        shortDescription: 'Visual banner advertising across millions of partner websites and mobile applications.',
        sortOrder: 2
      },
      {
        name: 'YouTube Advertising',
        slug: 'youtube-advertising',
        shortDescription: 'Skippable and non-skippable video ad placements targeted by audience interests and topics.',
        sortOrder: 3
      },
      {
        name: 'Remarketing Campaigns',
        slug: 'remarketing-campaigns',
        shortDescription: 'Targeted visual and search reminders keeping your brand top-of-mind for previous site visitors.',
        sortOrder: 4
      },
      {
        name: 'Keyword Research',
        slug: 'keyword-research',
        shortDescription: 'Discovery of high-intent, cost-effective search queries and commercial phrases.',
        sortOrder: 5
      },
      {
        name: 'Campaign Structure and Setup',
        slug: 'campaign-structure-and-setup',
        shortDescription: 'Logical grouping of ad sets, match types, ad assets, and extensions for peak Quality Score.',
        sortOrder: 6
      },
      {
        name: 'Audience Targeting',
        slug: 'audience-targeting',
        shortDescription: 'In-market, custom intent, and demographic segmentation for enhanced relevance.',
        sortOrder: 7
      },
      {
        name: 'Conversion Tracking',
        slug: 'conversion-tracking',
        shortDescription: 'Accurate technical attribution for phone inquiries, leads, and online transactions.',
        sortOrder: 8
      },
      {
        name: 'Campaign Optimization',
        slug: 'campaign-optimization',
        shortDescription: 'Bid adjustments, ad copy rotation, and budget reallocation toward highest-performing assets.',
        sortOrder: 9
      },
      {
        name: 'Performance Reporting',
        slug: 'performance-reporting',
        shortDescription: 'Clear analytical breakdowns of impressions, clicks, conversions, and acquisition cost.',
        sortOrder: 10
      }
    ]
  },
  {
    id: 'srv-search-engine-optimization',
    imageUrl: 'https://images.unsplash.com/photo-1571786256017-aee7a0c009b6?auto=format&fit=crop&w=1200&q=80',
    name: 'Search Engine Optimization (SEO)',
    slug: 'search-engine-optimization',
    category: 'Digital Marketing',
    categoryId: 'cat-digital-marketing',
    iconName: 'BarChart3',
    shortDescription: 'Sustainable organic visibility, technical site audits, high-intent keyword optimization, and authoritative backlink profiles.',
    longDescription: `Earn predictable, lasting organic traffic from Google. Our SEO methodology addresses every critical rank factor: technical website health, page speed, structured data schema, on-page keyword positioning, informative content planning, and reputable digital PR backlinks.`,
    benefits: [
      'Compounding long-term organic traffic without ongoing per-click ad costs',
      'Technical health improvements boosting site speed, crawlability, and indexation',
      'Targeting of commercial search queries with high purchase intent',
      'Transparent rankings and organic keyword growth tracking'
    ],
    deliverables: [
      'Comprehensive technical SEO website audit and fix recommendations',
      'Competitor organic keyword gap analysis',
      'On-page optimization of primary titles, meta tags, and headings',
      'Schema markup implementation for rich search snippets',
      'SEO content roadmap for industry-specific topical authority',
      'Monthly organic search performance and keyword ranking reports'
    ],
    scopeOfWork: [
      'Crawl analysis, sitemap validation, and robots.txt optimization',
      'Core Web Vitals diagnostic and speed enhancement recommendations',
      'Target keyword mapping across existing and new landing pages',
      'Internal linking optimization and image alt text curation',
      'Local SEO setup including Google Business Profile optimization'
    ],
    timeline: '3 - 6 Month Strategic Retainer',
    price: null,
    pricingType: 'on_request',
    status: 'published',
    isFeatured: true,
    sortOrder: 4,
    seoTitle: 'Professional SEO Services | Eagle Eye Digital',
    seoDescription: 'Grow your organic search presence with Eagle Eye Digital. Technical SEO audits, on-page optimization, content strategy, and keyword ranking growth.',
    faqs: [
      {
        question: 'How long does SEO take to produce measurable results?',
        answer: 'While technical fixes yield immediate crawl improvements, significant organic ranking and traffic growth typically compounds over 3 to 6 months of consistent optimization.'
      },
      {
        question: 'Do you follow ethical, white-hat SEO practices?',
        answer: 'Always. We adhere strictly to Google Search Essentials guidelines, ensuring lasting organic growth free from algorithmic penalties.'
      }
    ],
    subservices: [
      {
        name: 'Technical SEO Audit',
        slug: 'technical-seo-audit',
        shortDescription: 'Exhaustive examination of crawl errors, indexability, site structure, and server performance.',
        sortOrder: 1
      },
      {
        name: 'On-Page SEO',
        slug: 'on-page-seo',
        shortDescription: 'Strategic keyword positioning in headings, body copy, URL slugs, and content formatting.',
        sortOrder: 2
      },
      {
        name: 'Off-Page SEO',
        slug: 'off-page-seo',
        shortDescription: 'Brand mention outreach, digital PR, and authoritative backlink profile development.',
        sortOrder: 3
      },
      {
        name: 'Keyword Research',
        slug: 'keyword-research',
        shortDescription: 'Identification of search volume, difficulty ratings, and commercial search queries.',
        sortOrder: 4
      },
      {
        name: 'Competitor SEO Analysis',
        slug: 'competitor-seo-analysis',
        shortDescription: 'Deconstruction of top-ranking competitor search strategies, backlinks, and keyword gaps.',
        sortOrder: 5
      },
      {
        name: 'Website Structure Optimization',
        slug: 'website-structure-optimization',
        shortDescription: 'Logical page hierarchy and navigation taxonomy facilitating search crawler exploration.',
        sortOrder: 6
      },
      {
        name: 'Metadata Optimization',
        slug: 'metadata-optimization',
        shortDescription: 'Compelling title tags and meta descriptions engineered for higher organic click-through rates.',
        sortOrder: 7
      },
      {
        name: 'Image SEO',
        slug: 'image-seo',
        shortDescription: 'Image compression, descriptive file naming, and keyword-rich alt attribute integration.',
        sortOrder: 8
      },
      {
        name: 'Internal Linking',
        slug: 'internal-linking',
        shortDescription: 'Contextual internal hyperlink architectures distributing link equity to key conversion pages.',
        sortOrder: 9
      },
      {
        name: 'Local SEO',
        slug: 'local-seo',
        shortDescription: 'Google Business Profile optimization, local citations, and geo-targeted keyword positioning.',
        sortOrder: 10
      },
      {
        name: 'SEO Content Planning',
        slug: 'seo-content-planning',
        shortDescription: 'Strategic editorial roadmaps covering customer questions and industry topical clusters.',
        sortOrder: 11
      },
      {
        name: 'Search Performance Monitoring',
        slug: 'search-performance-monitoring',
        shortDescription: 'Ongoing Google Search Console and analytics tracking monitoring organic visibility trends.',
        sortOrder: 12
      }
    ]
  },
  {
    id: 'srv-content-marketing',
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    name: 'Content Marketing',
    slug: 'content-marketing',
    category: 'Digital Marketing',
    categoryId: 'cat-digital-marketing',
    iconName: 'PenTool',
    shortDescription: 'Editorial content planning, authoritative articles, persuasive website copywriting, and multi-format content repurposing.',
    longDescription: `Establish undisputed industry authority with high-value content. Eagle Eye Digital plans and produces editorial assets that solve customer pain points, nurture leads through complex buying cycles, and boost organic search authority across digital touchpoints.`,
    benefits: [
      'Position your leadership and expertise within your commercial niche',
      'Educate potential clients to shorten sales cycles and increase conversion rates',
      'Create versatile content assets that can be repurposed across multiple channels',
      'Increase organic search footprints through targeted, keyword-aligned articles'
    ],
    deliverables: [
      'Comprehensive content marketing strategy and audience persona guidelines',
      'Editorial calendar with prioritized topics and target keywords',
      'Thoroughly researched, professionally written blog articles',
      'High-converting marketing copy for digital campaigns and landing pages',
      'Repurposed micro-content snippets for social platforms',
      'Quarterly content engagement and performance reviews'
    ],
    scopeOfWork: [
      'Audience research and competitive content gap audit',
      'Topic ideation, outline structuring, and draft copywriting',
      'Proofreading, fact-checking, and editorial revisions',
      'SEO on-page formatting and featured image curation',
      'Publishing and social distribution coordination'
    ],
    timeline: 'Monthly Content Retainer',
    price: null,
    pricingType: 'on_request',
    status: 'published',
    isFeatured: false,
    sortOrder: 5,
    seoTitle: 'Strategic Content Marketing Services | Eagle Eye Digital',
    seoDescription: 'Build brand authority and drive organic traffic with content marketing, blog article writing, copywriting, and strategic content planning from Eagle Eye Digital.',
    faqs: [
      {
        question: 'Who writes the content for our brand?',
        answer: 'Our professional copywriters and content strategists research your specific industry and match your brand voice and commercial objectives.'
      },
      {
        question: 'Can content be repurposed for our social channels?',
        answer: 'Yes, we extract key quotes, statistics, and takeaways from long-form articles into social posts, carousels, and newsletter blurbs.'
      }
    ],
    subservices: [
      {
        name: 'Content Strategy',
        slug: 'content-strategy',
        shortDescription: 'Strategic blueprints aligning editorial production with commercial business milestones.',
        sortOrder: 1
      },
      {
        name: 'Blog Content Planning',
        slug: 'blog-content-planning',
        shortDescription: 'Systematic topic calendars mapped to customer purchase journeys and search intent.',
        sortOrder: 2
      },
      {
        name: 'Website Copywriting',
        slug: 'website-copywriting',
        shortDescription: 'Clear, persuasive messaging for homepages, service offerings, and about pages.',
        sortOrder: 3
      },
      {
        name: 'Blog Article Writing',
        slug: 'blog-article-writing',
        shortDescription: 'In-depth, well-researched educational articles establishing niche expertise.',
        sortOrder: 4
      },
      {
        name: 'Marketing Copywriting',
        slug: 'marketing-copywriting',
        shortDescription: 'Action-oriented copy for promotional collateral, sales decks, and marketing campaigns.',
        sortOrder: 5
      },
      {
        name: 'Social Media Content',
        slug: 'social-media-content',
        shortDescription: 'Engaging, concise captions and storytelling snippets designed for social feeds.',
        sortOrder: 6
      },
      {
        name: 'Content Calendar Development',
        slug: 'content-calendar-development',
        shortDescription: 'Structured timeline management ensuring consistent and timely asset delivery.',
        sortOrder: 7
      },
      {
        name: 'Content Optimization',
        slug: 'content-optimization',
        shortDescription: 'Refreshing existing published content for improved clarity, freshness, and SEO rankings.',
        sortOrder: 8
      },
      {
        name: 'Content Repurposing',
        slug: 'content-repurposing',
        shortDescription: 'Transforming key articles into infographics, email newsletters, and carousel slides.',
        sortOrder: 9
      },
      {
        name: 'Content Performance Analysis',
        slug: 'content-performance-analysis',
        shortDescription: 'Measuring time-on-page, bounce rate, social shares, and reader conversions.',
        sortOrder: 10
      }
    ]
  },
  {
    id: 'srv-email-marketing',
    imageUrl: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1200&q=80',
    name: 'Email Marketing',
    slug: 'email-marketing',
    category: 'Digital Marketing',
    categoryId: 'cat-digital-marketing',
    iconName: 'Mail',
    shortDescription: 'High-converting email campaigns, automated customer lifecycle workflows, responsive newsletter design, and list segmentation.',
    longDescription: `Turn subscribers into repeat purchasers with owned marketing channels. Eagle Eye Digital builds automated email sequences, transactional notification triggers, promotional broadcast campaigns, and subscriber segmentation frameworks that drive sustainable retention and client lifetime value.`,
    benefits: [
      'Direct communication channel with your audience independent of social algorithms',
      'Automated email sequences working 24/7 to welcome, nurture, and convert leads',
      'Precise segmentation delivering relevant messages to specific customer groups',
      'Measurable revenue attribution from newsletters and promotional broadcasts'
    ],
    deliverables: [
      'Email marketing strategy and subscriber journey map',
      'Custom branded, mobile-responsive HTML email templates',
      'Automated workflow implementation: Welcome series, abandoned cart, post-purchase',
      'Audience segmentation based on purchase history and engagement',
      'A/B subject line and content testing setup',
      'Monthly deliverability, open rate, and click-through analytics'
    ],
    scopeOfWork: [
      'Email platform integration (Mailchimp, Klaviyo, Brevo, or custom SMTP)',
      'List hygiene audit, domain authentication (SPF, DKIM, DMARC)',
      'Copywriting, layout design, and call-to-action optimization',
      'Trigger rule configuration, delay logic, and automated branching',
      'Campaign performance reporting and iterative sequence refinement'
    ],
    timeline: 'Setup in 2 Weeks + Monthly Retainer',
    price: null,
    pricingType: 'on_request',
    status: 'published',
    isFeatured: false,
    sortOrder: 6,
    seoTitle: 'Email Marketing & Automation Services | Eagle Eye Digital',
    seoDescription: 'Drive repeat sales with Eagle Eye Digital email marketing services. Automated email workflows, newsletter design, segmentation, and campaign optimization.',
    faqs: [
      {
        question: 'Which email platforms do you work with?',
        answer: 'We support all leading email marketing platforms including Klaviyo, Mailchimp, ActiveCampaign, Brevo, and custom transactional SMTP services.'
      },
      {
        question: 'How do you ensure emails land in the primary inbox?',
        answer: 'We establish proper domain authentication (DKIM, SPF, DMARC), practice list hygiene, optimize sender reputation, and maintain clean text-to-image ratios.'
      }
    ],
    subservices: [
      {
        name: 'Email Marketing Strategy',
        slug: 'email-marketing-strategy',
        shortDescription: 'Overall communication strategy, campaign frequency, and promotional scheduling.',
        sortOrder: 1
      },
      {
        name: 'Newsletter Design',
        slug: 'newsletter-design',
        shortDescription: 'Visually polished, mobile-responsive email layouts consistent with brand guidelines.',
        sortOrder: 2
      },
      {
        name: 'Email Campaign Setup',
        slug: 'email-campaign-setup',
        shortDescription: 'Drafting, scheduling, and distribution of time-sensitive promotional announcements.',
        sortOrder: 3
      },
      {
        name: 'Email List Segmentation',
        slug: 'email-list-segmentation',
        shortDescription: 'Categorizing subscribers by engagement level, purchase history, and interests.',
        sortOrder: 4
      },
      {
        name: 'Automated Email Workflows',
        slug: 'automated-email-workflows',
        shortDescription: 'Behavior-triggered communication sequences delivering timely messages on autopilot.',
        sortOrder: 5
      },
      {
        name: 'Welcome Email Sequences',
        slug: 'welcome-email-sequences',
        shortDescription: 'Multi-part onboarding series introducing your brand and encouraging first transactions.',
        sortOrder: 6
      },
      {
        name: 'Promotional Email Campaigns',
        slug: 'promotional-email-campaigns',
        shortDescription: 'Persuasive sales announcements, seasonal offers, and product release notifications.',
        sortOrder: 7
      },
      {
        name: 'Abandoned Cart Email Setup',
        slug: 'abandoned-cart-email-setup',
        shortDescription: 'Automated reminders recovering lost e-commerce checkouts and uncompleted orders.',
        sortOrder: 8
      },
      {
        name: 'Email Template Design',
        slug: 'email-template-design',
        shortDescription: 'Reusable component-based email templates easy to update for routine updates.',
        sortOrder: 9
      },
      {
        name: 'Campaign Performance Reporting',
        slug: 'campaign-performance-reporting',
        shortDescription: 'Comprehensive tracking of open rates, click-through rates, unsubscribe metrics, and revenue.',
        sortOrder: 10
      }
    ]
  },

  // ==========================================
  // CATEGORY B: WEB DEVELOPMENT AND CREATIVE SERVICES
  // ==========================================
  {
    id: 'srv-website-design-development',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    name: 'Website Design and Development',
    slug: 'website-design-development',
    category: 'Web Development and Creative Services',
    categoryId: 'cat-web-creative',
    iconName: 'Laptop',
    shortDescription: 'Bespoke corporate and business websites engineered with modern frontend frameworks, responsive UI, ultra-fast loading, and robust CMS backends.',
    longDescription: `Empower your digital identity with a bespoke web platform built for high performance and commercial conversion. Eagle Eye Digital engineers modern web experiences utilizing clean code, responsive layouts, intuitive CMS dashboards, and seamless third-party API integrations that represent your brand with prestige.`,
    benefits: [
      'Custom frontend architecture tailored to your unique brand aesthetic',
      'Fully responsive across smartphones, tablets, laptops, and ultra-wide screens',
      'Intuitive admin dashboard for effortless content updates without touching code',
      'Optimized performance achieving top Core Web Vitals and fast page loads'
    ],
    deliverables: [
      'Modern, custom web design tailored to your brand identity',
      'Responsive, accessible frontend implementation (React, TypeScript, Tailwind)',
      'Secure backend and database architecture (Firebase/Node.js)',
      'Content management dashboard for ongoing self-service updates',
      'Domain, SSL, and production cloud hosting deployment',
      '30-day post-launch technical warranty and maintenance support'
    ],
    scopeOfWork: [
      'Discovery, wireframing, and interactive UI prototyping',
      'Component-driven frontend engineering with modular design systems',
      'Database schema modeling, API integration, and security rule hardening',
      'Cross-browser and multi-device compatibility testing',
      'Deployment to global CDN infrastructure with automated backups'
    ],
    timeline: '3 - 6 Weeks Dependent on Scope',
    price: null,
    pricingType: 'on_request',
    status: 'published',
    isFeatured: true,
    sortOrder: 7,
    seoTitle: 'Custom Website Design & Development | Eagle Eye Digital',
    seoDescription: 'Transform your brand with professional website design and development services from Eagle Eye Digital. Fast, responsive, secure, and built for growth.',
    faqs: [
      {
        question: 'Will our team be able to update content after launch?',
        answer: 'Yes. We deliver intuitive content management controls allowing you to edit text, update media, and manage services without writing any code.'
      },
      {
        question: 'Is the website optimized for mobile devices?',
        answer: 'Every website we engineer is designed mobile-first and rigorously tested across iOS, Android, tablets, and desktop screen sizes.'
      }
    ],
    subservices: [
      {
        name: 'Business Website Development',
        slug: 'business-website-development',
        shortDescription: 'Professional corporate web platforms presenting company credentials and commercial solutions.',
        sortOrder: 1
      },
      {
        name: 'Corporate Website Design',
        slug: 'corporate-website-design',
        shortDescription: 'Executive visual design conveying trust, industry stature, and modern brand prestige.',
        sortOrder: 2
      },
      {
        name: 'Responsive Website Development',
        slug: 'responsive-website-development',
        shortDescription: 'Adaptive layout architectures rendering flawlessly across all viewport dimensions.',
        sortOrder: 3
      },
      {
        name: 'Website Redesign',
        slug: 'website-redesign',
        shortDescription: 'Modernizing outdated interfaces, improving UX flow, and elevating visual identity.',
        sortOrder: 4
      },
      {
        name: 'Landing Page Implementation',
        slug: 'landing-page-implementation',
        shortDescription: 'Dedicated marketing single-page builds engineered for specific campaigns.',
        sortOrder: 5
      },
      {
        name: 'Frontend Development',
        slug: 'frontend-development',
        shortDescription: 'Modern interactive web UI built with React, TypeScript, and clean CSS frameworks.',
        sortOrder: 6
      },
      {
        name: 'Backend Integration',
        slug: 'backend-integration',
        shortDescription: 'Secure database connectivity, serverless endpoints, and data validation layers.',
        sortOrder: 7
      },
      {
        name: 'Website Speed Optimization',
        slug: 'website-speed-optimization',
        shortDescription: 'Asset minification, caching configurations, and image optimization for rapid load times.',
        sortOrder: 8
      },
      {
        name: 'Website Maintenance',
        slug: 'website-maintenance',
        shortDescription: 'Ongoing security patching, framework updates, uptime monitoring, and backup routines.',
        sortOrder: 9
      },
      {
        name: 'Website Bug Fixing',
        slug: 'website-bug-fixing',
        shortDescription: 'Rapid troubleshooting and resolution of rendering errors, broken links, and form issues.',
        sortOrder: 10
      },
      {
        name: 'Website Deployment',
        slug: 'website-deployment',
        shortDescription: 'Smooth deployment to production servers, DNS records setup, and SSL certificate installation.',
        sortOrder: 11
      },
      {
        name: 'Third-Party API Integration',
        slug: 'third-party-api-integration',
        shortDescription: 'Connecting CRM systems, payment gateways, live chat widgets, and external services.',
        sortOrder: 12
      }
    ]
  },
  {
    id: 'srv-landing-page-design',
    imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200&q=80',
    name: 'Landing Page Design',
    slug: 'landing-page-design',
    category: 'Web Development and Creative Services',
    categoryId: 'cat-web-creative',
    iconName: 'Layout',
    shortDescription: 'High-converting single-page landing experiences designed specifically for advertising campaigns, product launches, and lead capture.',
    longDescription: `Eliminate conversion leaks in your advertising funnels. Eagle Eye Digital designs and develops single-minded landing pages structured around persuasive visual hierarchy, clear value propositions, trust signals, and streamlined lead capture forms that maximize your return on ad spend.`,
    benefits: [
      'Laser-focused layouts tailored specifically to drive single conversion goals',
      'Dramatic reduction in bounce rates through relevant headline and ad messaging alignment',
      'Fast mobile loading times keeping paid traffic on the page',
      'Frictionless inquiry forms and instant call-to-action routing'
    ],
    deliverables: [
      'Conversion-focused UI design in Figma with responsive mobile views',
      'Production-ready landing page code with clean animations',
      'Inquiry form integration connecting directly to your email or CRM',
      'Advertising tracking pixels and event configuration',
      'A/B test variation preparation for headlines and hero elements'
    ],
    scopeOfWork: [
      'Offer analysis, audience intent review, and messaging hierarchy',
      'Wireframe layout focusing on trust indicators and social proof',
      'High-fidelity visual design and interactive prototyping',
      'Frontend development and responsive layout testing',
      'Form validation, thank you page, and conversion tracking setup'
    ],
    timeline: '5 - 10 Business Days',
    price: null,
    pricingType: 'on_request',
    status: 'published',
    isFeatured: false,
    sortOrder: 8,
    seoTitle: 'High-Converting Landing Page Design | Eagle Eye Digital',
    seoDescription: 'Boost marketing conversions with custom landing page design and development by Eagle Eye Digital. Fast, persuasive, responsive, and ad-ready.',
    faqs: [
      {
        question: 'Can you integrate our landing page with our existing CRM?',
        answer: 'Yes, form submissions can be seamlessly routed to your CRM, Google Sheets, WhatsApp, or email notification workflows.'
      },
      {
        question: 'Are landing pages optimized for paid advertising campaigns?',
        answer: 'Every landing page is built specifically for campaign performance with fast load times, message matching, and clear conversion tracking.'
      }
    ],
    subservices: [
      {
        name: 'Campaign Landing Page Design',
        slug: 'campaign-landing-page-design',
        shortDescription: 'Targeted pages built to convert specific paid advertising campaigns on Google or Meta.',
        sortOrder: 1
      },
      {
        name: 'Lead Generation Landing Pages',
        slug: 'lead-generation-landing-pages',
        shortDescription: 'Inquiry-focused pages with optimized contact forms capturing prospective buyers.',
        sortOrder: 2
      },
      {
        name: 'Product Landing Pages',
        slug: 'product-landing-pages',
        shortDescription: 'Dedicated feature showcases detailing specific product benefits and purchase paths.',
        sortOrder: 3
      },
      {
        name: 'Service Landing Pages',
        slug: 'service-landing-pages',
        shortDescription: 'Focused presentations of individual agency services designed for inbound search.',
        sortOrder: 4
      },
      {
        name: 'Conversion-Focused Layout Design',
        slug: 'conversion-focused-layout-design',
        shortDescription: 'Visual hierarchy directing visitor attention directly toward conversion goals.',
        sortOrder: 5
      },
      {
        name: 'Landing Page Development',
        slug: 'landing-page-development',
        shortDescription: 'Clean, lightweight frontend code ensuring instantaneous initial page rendering.',
        sortOrder: 6
      },
      {
        name: 'Form Integration',
        slug: 'form-integration',
        shortDescription: 'Secure contact and inquiry forms with automated submission handling and alerts.',
        sortOrder: 7
      },
      {
        name: 'Analytics Integration',
        slug: 'analytics-integration',
        shortDescription: 'Google Analytics 4, Meta Pixel, and heatmapping event tracking configurations.',
        sortOrder: 8
      },
      {
        name: 'Mobile Responsive Optimization',
        slug: 'mobile-responsive-optimization',
        shortDescription: 'Tailored touch-friendly experiences for mobile and tablet traffic.',
        sortOrder: 9
      },
      {
        name: 'Landing Page Performance Review',
        slug: 'landing-page-performance-review',
        shortDescription: 'Post-launch data analysis evaluating conversion rates, drop-off points, and revisions.',
        sortOrder: 10
      }
    ]
  },
  {
    id: 'srv-ui-ux-design-figma',
    imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    name: 'UI/UX Design and Figma',
    slug: 'ui-ux-design-figma',
    category: 'Web Development and Creative Services',
    categoryId: 'cat-web-creative',
    iconName: 'Palette',
    shortDescription: 'User-centric interface design, comprehensive design systems, interactive prototypes, and scalable Figma component libraries.',
    longDescription: `Transform abstract concepts into intuitive digital interfaces. Eagle Eye Digital crafts clean, user-centric visual designs using Figma. We build cohesive design systems, clear user journeys, wireframe frameworks, and clickable prototypes that ensure superior user experience before writing a single line of code.`,
    benefits: [
      'Intuitive user experiences that reduce customer friction and increase retention',
      'Modular Figma component libraries ensuring consistency across all screens',
      'Clickable interactive prototypes for early stakeholder and user testing',
      'Detailed design handoff documentation accelerating development velocity'
    ],
    deliverables: [
      'Comprehensive Figma project file with organized pages and layers',
      'Scalable design system with typography, color tokens, and UI components',
      'Interactive clickable prototype for mobile and desktop viewports',
      'Complete user flow diagrams and wireframe blueprints',
      'Developer handoff documentation with asset exports (SVG, PNG)'
    ],
    scopeOfWork: [
      'User research, competitor benchmarking, and information architecture',
      'Low-fidelity wireframing and layout exploration',
      'High-fidelity visual design applying brand guidelines',
      'Component variants, auto-layout, and responsive constraint configuration',
      'Usability review and design iteration based on feedback'
    ],
    timeline: '2 - 4 Weeks',
    price: null,
    pricingType: 'on_request',
    status: 'published',
    isFeatured: true,
    sortOrder: 9,
    seoTitle: 'UI/UX Design & Figma Prototyping | Eagle Eye Digital',
    seoDescription: 'Elevate your digital product with expert UI/UX design in Figma. Wireframes, user flows, design systems, and interactive prototypes from Eagle Eye Digital.',
    faqs: [
      {
        question: 'Do we receive the original Figma design files?',
        answer: 'Yes. Upon completion, full edit ownership of all Figma source files, component libraries, and assets is transferred to your team.'
      },
      {
        question: 'Can you work with our existing brand guidelines?',
        answer: 'Absolutely. We will seamlessly incorporate your existing color palettes, typography, and logos, or expand upon them if needed.'
      }
    ],
    subservices: [
      {
        name: 'User Interface Design',
        slug: 'user-interface-design',
        shortDescription: 'Visual styling of buttons, cards, typography, navigation, and interactive elements.',
        sortOrder: 1
      },
      {
        name: 'User Experience Design',
        slug: 'user-experience-design',
        shortDescription: 'Optimizing product flows, usability patterns, and information architecture.',
        sortOrder: 2
      },
      {
        name: 'Website Wireframing',
        slug: 'website-wireframing',
        shortDescription: 'Low-fidelity structural blueprints defining layout spacing and content hierarchy.',
        sortOrder: 3
      },
      {
        name: 'Interactive Prototyping',
        slug: 'interactive-prototyping',
        shortDescription: 'Clickable realistic previews simulating true user journeys and interface animations.',
        sortOrder: 4
      },
      {
        name: 'User Flow Design',
        slug: 'user-flow-design',
        shortDescription: 'Diagramming paths and decision trees taken by users to achieve key milestones.',
        sortOrder: 5
      },
      {
        name: 'Design System Creation',
        slug: 'design-system-creation',
        shortDescription: 'Centralized source of truth for UI components, color palettes, and typography tokens.',
        sortOrder: 6
      },
      {
        name: 'Figma Component Libraries',
        slug: 'figma-component-libraries',
        shortDescription: 'Modular, reusable components with auto-layout and interactive variants.',
        sortOrder: 7
      },
      {
        name: 'Responsive Interface Design',
        slug: 'responsive-interface-design',
        shortDescription: 'Screen variations meticulously adapting to phone, tablet, and desktop views.',
        sortOrder: 8
      },
      {
        name: 'Dashboard UI Design',
        slug: 'dashboard-ui-design',
        shortDescription: 'Data-dense portal and web app interfaces presenting metrics with clarity.',
        sortOrder: 9
      },
      {
        name: 'Website Redesign Concepts',
        slug: 'website-redesign-concepts',
        shortDescription: 'Fresh visual aesthetics revitalizing tired digital web presences.',
        sortOrder: 10
      },
      {
        name: 'Design Handoff Documentation',
        slug: 'design-handoff-documentation',
        shortDescription: 'Clear development guidelines with spacing, interaction states, and asset exports.',
        sortOrder: 11
      }
    ]
  },
  {
    id: 'srv-branding-graphic-design',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',
    name: 'Branding and Graphic Design',
    slug: 'branding-graphic-design',
    category: 'Web Development and Creative Services',
    categoryId: 'cat-web-creative',
    iconName: 'Sparkles',
    shortDescription: 'Distinctive brand identity creation, logo systems, brand style guides, marketing graphics, and consistent corporate visual assets.',
    longDescription: `Define a memorable visual presence that commands respect in your industry. Eagle Eye Digital develops complete brand identity systems including logo architecture, bespoke color palettes, typographic standards, marketing presentations, and social media creative collateral that communicate quality at every touchpoint.`,
    benefits: [
      'Instantly recognizable and cohesive visual identity across all marketing channels',
      'Comprehensive brand guidelines empowering your internal team and partners',
      'Vector logo packages optimized for print, digital, and embroidered merchandise',
      'Professional marketing graphics that elevate customer trust and brand equity'
    ],
    deliverables: [
      'Primary, secondary, and sub-mark logo design variations in full vector formats',
      'Comprehensive Brand Style Guide PDF detailing typography, colors, and usage',
      'Social media profile kits (avatars, cover banners, post templates)',
      'Digital stationery templates (business cards, letterheads, email signatures)',
      'Marketing presentation pitch deck template (PowerPoint/Keynote/Figma)'
    ],
    scopeOfWork: [
      'Brand discovery session and visual moodboard development',
      'Logo conceptualization with multiple distinct creative directions',
      'Color psychology system and accessible typography pairings',
      'Application mockups demonstrating brand assets in real-world environments',
      'Final asset packaging with web (SVG, PNG, WebP) and print (AI, EPS, PDF) files'
    ],
    timeline: '2 - 3 Weeks',
    price: null,
    pricingType: 'on_request',
    status: 'published',
    isFeatured: false,
    sortOrder: 10,
    seoTitle: 'Brand Identity & Graphic Design | Eagle Eye Digital',
    seoDescription: 'Define a memorable brand with Eagle Eye Digital. Logo design, brand style guides, corporate color systems, typography, and marketing graphics.',
    faqs: [
      {
        question: 'Do we own full copyright to our logo and brand assets?',
        answer: 'Yes. All intellectual property and copyright rights are fully transferred to you upon final project delivery.'
      },
      {
        question: 'In what file formats will our logo be delivered?',
        answer: 'You will receive vector formats (AI, EPS, SVG, PDF) for infinite scaling and high-resolution raster files (PNG, JPG) with transparent backgrounds.'
      }
    ],
    subservices: [
      {
        name: 'Brand Identity Design',
        slug: 'brand-identity-design',
        shortDescription: 'Complete visual identity architecture defining how your brand communicates visually.',
        sortOrder: 1
      },
      {
        name: 'Logo Design',
        slug: 'logo-design',
        shortDescription: 'Memorable, timeless logo marks and logotype treatments representing brand values.',
        sortOrder: 2
      },
      {
        name: 'Brand Style Guide',
        slug: 'brand-style-guide',
        shortDescription: 'Comprehensive manual outlining acceptable usage rules, fonts, and spacing.',
        sortOrder: 3
      },
      {
        name: 'Social Media Graphics',
        slug: 'social-media-graphics',
        shortDescription: 'Branded visual templates and feed graphics for consistent profile presentation.',
        sortOrder: 4
      },
      {
        name: 'Advertising Creative Design',
        slug: 'advertising-creative-design',
        shortDescription: 'Eye-catching banner and carousel creatives engineered for paid marketing campaigns.',
        sortOrder: 5
      },
      {
        name: 'Banner Design',
        slug: 'banner-design',
        shortDescription: 'Large-format digital display banners and web header graphics.',
        sortOrder: 6
      },
      {
        name: 'Marketing Presentation Design',
        slug: 'marketing-presentation-design',
        shortDescription: 'Professional slide decks and investor pitch templates that win new business.',
        sortOrder: 7
      },
      {
        name: 'Promotional Graphics',
        slug: 'promotional-graphics',
        shortDescription: 'Special event flyers, seasonal sales graphics, and announcement visuals.',
        sortOrder: 8
      },
      {
        name: 'Brand Color System',
        slug: 'brand-color-system',
        shortDescription: 'Curated color palettes with exact HEX, RGB, CMYK, and accessibility standards.',
        sortOrder: 9
      },
      {
        name: 'Typography and Visual Guidelines',
        slug: 'typography-and-visual-guidelines',
        shortDescription: 'Hierarchical font pairings and rules for readable, authoritative communication.',
        sortOrder: 10
      }
    ]
  },
  {
    id: 'srv-ecommerce-website-development',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    name: 'E-commerce Website Development',
    slug: 'ecommerce-website-development',
    category: 'Web Development and Creative Services',
    categoryId: 'cat-web-creative',
    iconName: 'ShoppingBag',
    shortDescription: 'Custom online stores, seamless checkout flows, secure payment gateway integrations (bKash, Nagad, Cards), and order management.',
    longDescription: `Launch and scale an online storefront that turns visitors into repeat buyers. Eagle Eye Digital develops high-performing e-commerce platforms featuring streamlined shopping carts, friction-free checkouts, localized payment gateways, customer account portals, and real-time inventory management.`,
    benefits: [
      'High-conversion checkout experience minimizing shopping cart abandonment',
      'Integration with local and global payment gateways (bKash, Nagad, Cards, Stripe)',
      'Intuitive admin dashboard for product catalog, stock, and order fulfillment',
      'Mobile-optimized shopping flows designed for handheld convenience'
    ],
    deliverables: [
      'Fully functional e-commerce storefront with custom design',
      'Product catalog and category architecture with filtering capabilities',
      'Shopping cart and streamlined single-page or multi-step checkout',
      'Payment gateway integration with automated transaction verification',
      'Customer account portal with order history and downloadable receipts',
      'Admin order management panel with status update notifications'
    ],
    scopeOfWork: [
      'Catalog data modeling, product attribute structuring, and variant setup',
      'Payment processor sandbox configuration, webhooks, and live activation',
      'Automated customer transaction emails and order confirmation notifications',
      'Security auditing for customer data protection and safe checkout handling',
      'Speed optimization for rapid image rendering across catalog pages'
    ],
    timeline: '4 - 8 Weeks',
    price: null,
    pricingType: 'on_request',
    status: 'published',
    isFeatured: true,
    sortOrder: 11,
    seoTitle: 'E-commerce Website Development Services | Eagle Eye Digital',
    seoDescription: 'Scale your online sales with custom e-commerce website development from Eagle Eye Digital. Fast storefronts, secure payment gateways, and inventory management.',
    faqs: [
      {
        question: 'Which payment gateways can be integrated?',
        answer: 'We integrate local payment methods including bKash, Nagad, Rocket, and Bank transfer, as well as global processors like Stripe and SSLCommerz.'
      },
      {
        question: 'Can we manage products and inventory on our own?',
        answer: 'Yes. Our e-commerce solutions include an administrative panel where you can add products, update prices, adjust inventory, and process orders.'
      }
    ],
    subservices: [
      {
        name: 'E-commerce Website Design',
        slug: 'ecommerce-website-design',
        shortDescription: 'Modern visual store layouts designed to highlight product value and encourage shopping.',
        sortOrder: 1
      },
      {
        name: 'Online Store Development',
        slug: 'online-store-development',
        shortDescription: 'Full frontend and backend web architecture powering reliable e-commerce transactions.',
        sortOrder: 2
      },
      {
        name: 'Storefront Customization',
        slug: 'storefront-customization',
        shortDescription: 'Tailoring themes, navigation, banner carousels, and promotional sections to your brand.',
        sortOrder: 3
      },
      {
        name: 'Product Catalog Configuration',
        slug: 'product-catalog-configuration',
        shortDescription: 'Setting up structured product records, descriptions, imagery, and specifications.',
        sortOrder: 4
      },
      {
        name: 'Product Category Setup',
        slug: 'product-category-setup',
        shortDescription: 'Organizing items into intuitive collections with multi-facet filtering and search.',
        sortOrder: 5
      },
      {
        name: 'Shopping Cart Integration',
        slug: 'shopping-cart-integration',
        shortDescription: 'Dynamic cart drawers and pages with real-time price totals and quantity adjustments.',
        sortOrder: 6
      },
      {
        name: 'Checkout Integration',
        slug: 'checkout-integration',
        shortDescription: 'Optimized checkout flows minimizing form fields to reduce cart abandonment.',
        sortOrder: 7
      },
      {
        name: 'Payment Gateway Integration',
        slug: 'payment-gateway-integration',
        shortDescription: 'Connecting secure payment processors for seamless card and mobile financial services.',
        sortOrder: 8
      },
      {
        name: 'Order Management Setup',
        slug: 'order-management-setup',
        shortDescription: 'Backend workflows for order status tracking, invoice creation, and fulfillment.',
        sortOrder: 9
      },
      {
        name: 'Customer Account Features',
        slug: 'customer-account-features',
        shortDescription: 'User portals for order histories, profile editing, and saved shipping addresses.',
        sortOrder: 10
      },
      {
        name: 'E-commerce Responsive Design',
        slug: 'ecommerce-responsive-design',
        shortDescription: 'Frictionless shopping experiences tailored for smartphone shoppers.',
        sortOrder: 11
      },
      {
        name: 'E-commerce Performance Optimization',
        slug: 'ecommerce-performance-optimization',
        shortDescription: 'Speed improvements ensuring swift browsing through dense product catalogs.',
        sortOrder: 12
      }
    ]
  },
  {
    id: 'srv-analytics-conversion-tracking',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    name: 'Analytics and Conversion Tracking',
    slug: 'analytics-conversion-tracking',
    category: 'Web Development and Creative Services',
    categoryId: 'cat-web-creative',
    iconName: 'LineChart',
    shortDescription: 'Robust Google Analytics 4, Google Tag Manager, ad pixel integrations, and funnel attribution dashboards for data-backed decisions.',
    longDescription: `Eliminate guesswork from your marketing investments. Eagle Eye Digital implements comprehensive analytics architectures using Google Analytics 4, Google Tag Manager, Meta Pixel, and custom event tracking to measure every critical step of your user journey with verifiable precision.`,
    benefits: [
      'Accurate attribution of leads, sales, and conversions back to original marketing sources',
      'Clean Google Tag Manager container setup avoiding messy, hardcoded website scripts',
      'Clear identification of drop-off points in your conversion funnel',
      'Custom reporting dashboards delivering executive clarity on marketing ROI'
    ],
    deliverables: [
      'Comprehensive Google Analytics 4 (GA4) property configuration',
      'Google Tag Manager (GTM) container with structured tag, trigger, and variable naming',
      'Conversion tracking setup for contact forms, click-to-call, and e-commerce purchases',
      'Advertising pixel integrations (Meta, Google, LinkedIn) with event matching',
      'Custom Google Looker Studio analytics dashboard'
    ],
    scopeOfWork: [
      'Measurement plan development identifying key business KPI events',
      'GTM container audit, data layer setup, and trigger testing in preview mode',
      'Server-side and client-side event verification',
      'Cross-domain tracking and referral exclusion setup',
      'Documentation of all active tags and event schemas'
    ],
    timeline: '1 - 2 Weeks',
    price: null,
    pricingType: 'on_request',
    status: 'published',
    isFeatured: false,
    sortOrder: 12,
    seoTitle: 'Web Analytics & Conversion Tracking | Eagle Eye Digital',
    seoDescription: 'Accurately measure your marketing with Eagle Eye Digital. GA4 configuration, Google Tag Manager setup, Meta Pixel tracking, and conversion funnels.',
    faqs: [
      {
        question: 'Why is Google Tag Manager preferred over hardcoding tracking scripts?',
        answer: 'GTM centralizes all tracking tags in one manageable container, significantly improves website loading speed, and allows updates without altering site source code.'
      },
      {
        question: 'Can you track WhatsApp clicks and phone call inquiries?',
        answer: 'Yes. We track outbound clicks to WhatsApp, tel: links, email links, and contact form submissions as distinct conversion events.'
      }
    ],
    subservices: [
      {
        name: 'Website Analytics Setup',
        slug: 'website-analytics-setup',
        shortDescription: 'Foundational installation of web analytics tracking across all digital properties.',
        sortOrder: 1
      },
      {
        name: 'Google Analytics 4 Configuration',
        slug: 'google-analytics-4-configuration',
        shortDescription: 'Modern event-based measurement model tailored to specific business milestones.',
        sortOrder: 2
      },
      {
        name: 'Google Tag Manager Setup',
        slug: 'google-tag-manager-setup',
        shortDescription: 'Centralized container management organizing tags, triggers, and data layer variables.',
        sortOrder: 3
      },
      {
        name: 'Conversion Tracking',
        slug: 'conversion-tracking',
        shortDescription: 'Accurate technical attribution for primary and secondary commercial actions.',
        sortOrder: 4
      },
      {
        name: 'Advertising Pixel Integration',
        slug: 'advertising-pixel-integration',
        shortDescription: 'Deploying Meta, Google, TikTok, and LinkedIn tracking tags for campaign retargeting.',
        sortOrder: 5
      },
      {
        name: 'Event Tracking Configuration',
        slug: 'event-tracking-configuration',
        shortDescription: 'Tracking button clicks, video plays, scroll depth, and file downloads.',
        sortOrder: 6
      },
      {
        name: 'Lead Tracking Setup',
        slug: 'lead-tracking-setup',
        shortDescription: 'Verifying form completions and identifying which channels produce high-quality inquiries.',
        sortOrder: 7
      },
      {
        name: 'E-commerce Event Tracking',
        slug: 'ecommerce-event-tracking',
        shortDescription: 'Item views, add-to-carts, checkout initiations, and completed purchase attribution.',
        sortOrder: 8
      },
      {
        name: 'Traffic Analysis',
        slug: 'traffic-analysis',
        shortDescription: 'Evaluating channel acquisition sources, user demographics, and geographic distribution.',
        sortOrder: 9
      },
      {
        name: 'Conversion Funnel Analysis',
        slug: 'conversion-funnel-analysis',
        shortDescription: 'Identifying where prospective customers drop off before completing target actions.',
        sortOrder: 10
      },
      {
        name: 'Reporting Dashboard Setup',
        slug: 'reporting-dashboard-setup',
        shortDescription: 'Visual executive dashboards consolidating key business metrics in real time.',
        sortOrder: 11
      }
    ]
  },

  // ==========================================
  // CATEGORY C: AI AND BUSINESS AUTOMATION
  // ==========================================
  {
    id: 'srv-ai-workflow-automation',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    name: 'AI Workflow Automation',
    slug: 'ai-workflow-automation',
    category: 'AI and Business Automation',
    categoryId: 'cat-ai-automation',
    iconName: 'Bot',
    shortDescription: 'Custom workflow automations, repetitive task elimination, AI content pipelines, and multi-app data synchronization.',
    longDescription: `Scale your business output without increasing headcount. Eagle Eye Digital designs and integrates intelligent workflow automations connecting your forms, CRM, databases, and communication channels. We automate repetitive manual tasks using modern AI tools and webhook pipelines so your team can focus on high-value strategy.`,
    benefits: [
      'Eliminate dozens of hours of repetitive manual data entry every week',
      'Instant lead routing and automated customer notifications reducing response times',
      'Seamless data transfer across your website, CRM, email, and Google Workspace',
      'AI-assisted content generation and processing tailored to your workflow'
    ],
    deliverables: [
      'Business process audit identifying prime automation opportunities',
      'Custom webhook and API integration workflows (Make/Zapier/Node)',
      'Automated lead qualification and CRM sync pipeline',
      'AI-assisted document, summary, or response generation workflows',
      'Error monitoring, notification alerts, and technical documentation'
    ],
    scopeOfWork: [
      'Mapping existing operational bottlenecks and manual handover points',
      'Configuring trigger and action sequences across connected platforms',
      'Building data transformation filters, deduplication, and conditional logic',
      'Rigorous edge-case testing and payload validation',
      'Team training and ongoing workflow health monitoring'
    ],
    timeline: '1 - 3 Weeks',
    price: null,
    pricingType: 'on_request',
    status: 'published',
    isFeatured: true,
    sortOrder: 13,
    seoTitle: 'AI Workflow Automation Services | Eagle Eye Digital',
    seoDescription: 'Automate repetitive tasks and accelerate business growth with AI workflow automation services from Eagle Eye Digital. CRM sync, lead routing, and integrations.',
    faqs: [
      {
        question: 'Which tools do you use for workflow automation?',
        answer: 'We utilize Make (Integromat), Zapier, n8n, OpenAI APIs, and custom serverless webhooks depending on your technical infrastructure and cost preferences.'
      },
      {
        question: 'Will our data remain secure during automated transfers?',
        answer: 'Yes. All API connections use encrypted protocols, token authentication, and strict least-privilege permissions to protect your business data.'
      }
    ],
    subservices: [
      {
        name: 'Business Workflow Analysis',
        slug: 'business-workflow-analysis',
        shortDescription: 'Evaluating day-to-day operations to identify high-impact automation opportunities.',
        sortOrder: 1
      },
      {
        name: 'Repetitive Task Automation',
        slug: 'repetitive-task-automation',
        shortDescription: 'Replacing manual copy-paste routines and spreadsheet updates with automated triggers.',
        sortOrder: 2
      },
      {
        name: 'AI-Assisted Content Workflows',
        slug: 'ai-assisted-content-workflows',
        shortDescription: 'Automating content drafts, translation, summarization, and tag generation.',
        sortOrder: 3
      },
      {
        name: 'AI Tool Integration',
        slug: 'ai-tool-integration',
        shortDescription: 'Connecting OpenAI, Anthropic, or specialized AI models into existing business systems.',
        sortOrder: 4
      },
      {
        name: 'Workflow Automation Design',
        slug: 'workflow-automation-design',
        shortDescription: 'Architecting resilient multi-step logic pathways with error fallbacks.',
        sortOrder: 5
      },
      {
        name: 'Marketing Workflow Automation',
        slug: 'marketing-workflow-automation',
        shortDescription: 'Automating lead scoring, tag application, and personalized email trigger sequences.',
        sortOrder: 6
      },
      {
        name: 'Data Transfer Automation',
        slug: 'data-transfer-automation',
        shortDescription: 'Synchronizing customer information across disparate databases, CRMs, and spreadsheets.',
        sortOrder: 7
      },
      {
        name: 'Form and Lead Automation',
        slug: 'form-and-lead-automation',
        shortDescription: 'Routing website form inquiries instantly to internal teams via email or WhatsApp.',
        sortOrder: 8
      },
      {
        name: 'Notification Automation',
        slug: 'notification-automation',
        shortDescription: 'Automated SMS, WhatsApp, or Slack alerts triggered by key customer actions.',
        sortOrder: 9
      },
      {
        name: 'Third-Party Automation Integration',
        slug: 'third-party-automation-integration',
        shortDescription: 'Connecting external SaaS tools and payment webhooks into a unified data flow.',
        sortOrder: 10
      }
    ]
  },
  {
    id: 'srv-chatbot-customer-support-automation',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    name: 'Chatbot and Customer Support Automation',
    slug: 'chatbot-customer-support-automation',
    category: 'AI and Business Automation',
    categoryId: 'cat-ai-automation',
    iconName: 'MessageSquare',
    shortDescription: '24/7 intelligent website chatbots, automated lead qualification, FAQ resolution, and instant WhatsApp support routing.',
    longDescription: `Deliver immediate customer support at any hour of the day. Eagle Eye Digital implements conversational website chatbots and automated support workflows. Our solutions answer frequent client inquiries, capture and qualify leads, schedule consultation meetings, and smoothly escalate complex requests to human team members.`,
    benefits: [
      'Instantaneous 24/7 inquiry responses preventing potential clients from leaving for competitors',
      'Automated qualification capturing contact details and project requirements',
      'Significant reduction in routine support burden on internal staff',
      'Direct integration with WhatsApp, CRM, and email notification systems'
    ],
    deliverables: [
      'Custom website chatbot interface branded to match your website design',
      'Knowledge base and conversation logic mapping for common customer questions',
      'Lead qualification sequence routing new opportunities to your sales pipeline',
      'Integration with WhatsApp for seamless human handoff',
      'Analytics dashboard tracking conversation volume, sentiment, and resolution rates'
    ],
    scopeOfWork: [
      'Customer support inquiry audit and FAQ categorization',
      'Conversation flow design, tone-of-voice alignment, and prompt engineering',
      'Widget integration and mobile responsiveness optimization',
      'Live testing of edge cases, fallback triggers, and lead submission routing',
      'Ongoing knowledge base updates and conversation review'
    ],
    timeline: '1 - 2 Weeks',
    price: null,
    pricingType: 'on_request',
    status: 'published',
    isFeatured: false,
    sortOrder: 14,
    seoTitle: 'Chatbot & Customer Support Automation | Eagle Eye Digital',
    seoDescription: 'Provide 24/7 client support with intelligent website chatbots and customer service automations from Eagle Eye Digital. Lead qualification, FAQ answers, and WhatsApp routing.',
    faqs: [
      {
        question: 'What happens when a question exceeds the chatbot knowledge?',
        answer: 'The chatbot gracefully collects the visitor contact details and routes the inquiry directly to your team via WhatsApp or email for personal follow-up.'
      },
      {
        question: 'Can the chatbot capture leads and book meetings?',
        answer: 'Yes. The bot can qualify visitor intent, collect contact numbers, and provide a direct link to schedule a strategy meeting.'
      }
    ],
    subservices: [
      {
        name: 'Website Chatbot Integration',
        slug: 'website-chatbot-integration',
        shortDescription: 'Embedding lightweight, responsive chat widgets on key website conversion pages.',
        sortOrder: 1
      },
      {
        name: 'Customer Inquiry Automation',
        slug: 'customer-inquiry-automation',
        shortDescription: 'Instantly greeting visitors and collecting initial project requirements.',
        sortOrder: 2
      },
      {
        name: 'FAQ Chatbot Setup',
        slug: 'faq-chatbot-setup',
        shortDescription: 'Automated answers to recurring questions regarding services, timelines, and processes.',
        sortOrder: 3
      },
      {
        name: 'Lead Qualification Workflows',
        slug: 'lead-qualification-workflows',
        shortDescription: 'Asking targeted questions to identify prospect budget, timeline, and project scope.',
        sortOrder: 4
      },
      {
        name: 'Automated Customer Notifications',
        slug: 'automated-customer-notifications',
        shortDescription: 'Immediate confirmation emails and inquiry receipts sent to prospective clients.',
        sortOrder: 5
      },
      {
        name: 'Chatbot Conversation Design',
        slug: 'chatbot-conversation-design',
        shortDescription: 'Crafting natural, helpful conversational dialogue reflecting your brand tone.',
        sortOrder: 6
      },
      {
        name: 'Contact Form Automation',
        slug: 'contact-form-automation',
        shortDescription: 'Replacing static forms with conversational step-by-step interactive questions.',
        sortOrder: 7
      },
      {
        name: 'Support Workflow Integration',
        slug: 'support-workflow-integration',
        shortDescription: 'Syncing chat transcripts and visitor details into your CRM or ticketing platform.',
        sortOrder: 8
      },
      {
        name: 'Chatbot Testing and Optimization',
        slug: 'chatbot-testing-and-optimization',
        shortDescription: 'Iterative refinement of conversation prompts based on real visitor interactions.',
        sortOrder: 9
      },
      {
        name: 'Customer Support Reporting',
        slug: 'customer-support-reporting',
        shortDescription: 'Analytics tracking inquiry topics, resolution satisfaction, and lead volumes.',
        sortOrder: 10
      }
    ]
  }
];

// Helper to expand seed services into flat list of subservices with parent relationships
export function getSeedSubservicesList(): SubService[] {
  const allSubservices: SubService[] = [];
  const now = Date.now();

  for (const srv of SEED_SERVICES_CATALOG) {
    srv.subservices.forEach((sub, idx) => {
      allSubservices.push({
        id: `sub-${srv.slug}-${sub.slug}`,
        name: sub.name,
        slug: sub.slug,
        shortDescription: sub.shortDescription,
        parentServiceId: srv.id,
        parentServiceName: srv.name,
        category: srv.category,
        sortOrder: sub.sortOrder || idx + 1,
        status: 'active',
        createdAt: now,
        updatedAt: now
      });
    });
  }

  return allSubservices;
}

// Convert seed catalog definitions to full Service model objects
export function getSeedServicesList(): Service[] {
  const now = Date.now();
  return SEED_SERVICES_CATALOG.map((item) => {
    const serviceSubservices: SubService[] = item.subservices.map((sub, idx) => ({
      id: `sub-${item.slug}-${sub.slug}`,
      name: sub.name,
      slug: sub.slug,
      shortDescription: sub.shortDescription,
      parentServiceId: item.id,
      parentServiceName: item.name,
      category: item.category,
      sortOrder: sub.sortOrder || idx + 1,
      status: 'active',
      createdAt: now,
      updatedAt: now
    }));

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      category: item.category,
      categoryId: item.categoryId,
      shortDescription: item.shortDescription,
      longDescription: item.longDescription,
      iconName: item.iconName,
      imageUrl: item.imageUrl || '',
      benefits: item.benefits,
      deliverables: item.deliverables,
      scopeOfWork: item.scopeOfWork,
      timeline: item.timeline,
      price: item.price ?? null,
      pricingType: item.pricingType,
      pricingPackages: [],
      subservices: serviceSubservices,
      faqs: item.faqs,
      seoTitle: item.seoTitle,
      seoDescription: item.seoDescription,
      status: item.status,
      isFeatured: item.isFeatured,
      sortOrder: item.sortOrder,
      createdAt: now,
      updatedAt: now
    };
  });
}
