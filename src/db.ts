import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { getFirebaseDb, testConnection } from './firebase';

export interface Setting {
  setting_key: string;
  setting_value: string;
}

export interface Service {
  id: number;
  title: string;
  tagline: string;
  excerpt: string;
  content: string;
  image_path?: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image_path?: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export interface Testimonial {
  id: number;
  client_name: string;
  client_role: string;
  quote: string;
  image_path?: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  image_path?: string | null;
  status: 'draft' | 'published';
  published_at: string;
  created_at: string;
  updated_at?: string;
}

export interface Enquiry {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  message: string;
  consent: number;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_path?: string | null;
  parent_menu?: string; // 'none' | 'personal_immigration' | 'business_immigrations'
  parent_page_id?: number | null; // ID of parent Level 2 page if this is a Level 3 child page
  icon?: string;
  sort_order: number;
  status: 'draft' | 'published';
  created_at: string;
  updated_at?: string;
}

export interface NavSubmenuNode {
  page: Page;
  children: Page[];
}

export interface NavTreeNode {
  item: MenuItem;
  submenus: NavSubmenuNode[];
}

export interface MenuItem {
  id: number;
  title: string;
  url: string;
  icon: string; // 'home' | 'list' | 'database' | 'contact' | 'gift' | 'document' | 'briefcase' | 'shield' | 'star' | 'scale' | 'award' | 'user'
  parent_key?: string; // '' for top level, or 'personal_immigration', 'business_immigrations'
  is_dropdown?: number; // 1 or 0
  sort_order: number;
  is_active: number;
  created_at?: string;
}

export interface HeroSlide {
  id: number;
  eyebrow: string;
  title: string;
  text: string;
  button_text: string;
  button_url: string;
  image_path?: string | null;
  sort_order: number;
  is_active: number;
}

export interface SectionBackground {
  id: number;
  label: string;
  section_key: string;
  image_path?: string | null;
  sort_order: number;
  is_active: number;
}

export interface ClientLogo {
  id: number;
  name: string;
  website_url?: string | null;
  image_path?: string | null;
  sort_order: number;
  is_active: number;
  created_at?: string;
}

export interface HeroDropdownOption {
  id: number;
  title: string;
  page_id?: number | null;
  target_url?: string | null;
  sort_order: number;
  is_active: number;
  created_at?: string;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  password: string; // ChangeMe123!
}

class FirestoreDB {
  settings: Map<string, string> = new Map([
    ['site_name', 'NORTHSTAR LEGAL'],
    ['company_legal', 'Northstar Legal Ltd.'],
    ['phone', '+44 20 0000 0000'],
    ['email', 'hello@northstarlegal.co.uk'],
    ['address', '20 Example Street\nLondon, United Kingdom'],
    ['meta_description', 'Straightforward immigration advice and representation for individuals, families and businesses.'],
    ['hero_title', "From paperwork to possibilities.\nWe've got you covered."],
    ['hero_text', 'Clear advice, experienced guidance and a plan tailored around you.'],
    ['hero_dropdown_placeholder', 'What can we help you with?'],
    ['clients_title', 'Our Client'],
    ['stat_consultations', '500'],
    ['stat_cases', '1,200'],
    ['stat_success', '98'],
    ['stat_reviews', '300'],
    ['intro_heading', 'NORTHSTAR LEGAL'],
    ['intro_text', 'We make immigration processes feel manageable. Our team combines technical excellence with thoughtful, one-to-one guidance from your first conversation to the final decision.'],
    ['about_heading', 'A clear path through complex decisions.'],
    ['about_text', 'Every immigration matter is personal. We listen carefully, explain the options in plain language and manage the process proactively—keeping you informed at each stage.'],
    ['footer_about', 'Practical immigration advice, handled with clarity and care.'],
    ['brochure_eyebrow', 'DOWNLOAD OUR PRACTICE GUIDE'],
    ['brochure_title', 'Comprehensive Legal & Immigration Services Brochure'],
    ['brochure_desc', 'Download our official guidance pack containing fee structures, document checklists, and UK immigration process roadmaps.'],
    ['brochure_btn_text', 'Download PDF Guide'],
    ['brochure_url', '/assets/docs/northstar-legal-brochure.pdf']
  ]);

  menuItems: MenuItem[] = [
    {
      id: 1,
      title: 'Home',
      url: '/',
      icon: 'home',
      parent_key: '',
      is_dropdown: 0,
      sort_order: 1,
      is_active: 1
    },
    {
      id: 2,
      title: 'Personal Immigration',
      url: '/services.php#personal',
      icon: 'list',
      parent_key: '',
      is_dropdown: 1,
      sort_order: 2,
      is_active: 1
    },
    {
      id: 3,
      title: 'Business Immigrations',
      url: '/services.php#business',
      icon: 'list',
      parent_key: '',
      is_dropdown: 1,
      sort_order: 3,
      is_active: 1
    },
    {
      id: 4,
      title: 'About Us',
      url: '/about.php',
      icon: 'database',
      parent_key: '',
      is_dropdown: 0,
      sort_order: 4,
      is_active: 1
    },
    {
      id: 5,
      title: 'Contact Us',
      url: '/contact.php',
      icon: 'contact',
      parent_key: '',
      is_dropdown: 0,
      sort_order: 5,
      is_active: 1
    },
    {
      id: 6,
      title: 'Free Legal Surgery',
      url: '/contact.php#consultation',
      icon: 'gift',
      parent_key: '',
      is_dropdown: 0,
      sort_order: 6,
      is_active: 1
    }
  ];

  services: Service[] = [
    {
      id: 1,
      title: 'Transparent pricing',
      tagline: 'Clarity from the first call',
      excerpt: 'Receive a clear, fixed-fee quote once we understand the scope of your case.',
      content: 'Once we have assessed your circumstances, we will explain the work involved and provide a fixed-fee quote. You will know what to expect before any work begins.',
      image_path: null,
      sort_order: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Trusted expertise',
      tagline: 'Experience that listens',
      excerpt: 'Specialist guidance built around your specific circumstances and ambitions.',
      content: 'Our advisers bring practical immigration knowledge to every matter. We listen carefully, identify the key issues and shape a strategy around your goals.',
      image_path: null,
      sort_order: 2,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Honest evaluation',
      tagline: 'Advice you can rely on',
      excerpt: 'A candid view of your options, risks and the strength of your case.',
      content: 'We provide direct, realistic advice. Before you proceed, we will outline the possible routes, the evidence required and the factors that may affect an application.',
      image_path: null,
      sort_order: 3,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: 'Proactive management',
      tagline: 'A process kept on track',
      excerpt: 'Clear milestones and document management from first instruction to decision.',
      content: 'We manage the process proactively, keep documents organised and communicate at meaningful milestones so your application remains on track.',
      image_path: null,
      sort_order: 4,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      title: 'Personal immigration',
      tagline: 'For individuals and families',
      excerpt: 'Support for visas, extensions, settlement and citizenship.',
      content: 'Whether you are planning a move, extending a visa or applying to settle, we provide structured support with a personal approach.',
      image_path: null,
      sort_order: 5,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      title: 'Business immigration',
      tagline: 'For employers and founders',
      excerpt: 'Practical support with sponsorship and international hiring.',
      content: 'We help organisations navigate sponsor duties, recruitment planning and business immigration requirements with confidence.',
      image_path: null,
      sort_order: 6,
      is_active: 1,
      created_at: new Date().toISOString()
    }
  ];

  teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Amelia Hart',
      role: 'Senior Immigration Adviser',
      bio: 'Focused on thoughtful, practical support for individuals and families.',
      image_path: null,
      sort_order: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Daniel Morgan',
      role: 'Business Immigration Lead',
      bio: 'Advises employers on sponsorship and global mobility matters.',
      image_path: null,
      sort_order: 2,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Sofia Patel',
      role: 'Casework Manager',
      bio: 'Keeps applications organised, clear and moving forward.',
      image_path: null,
      sort_order: 3,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Oliver Reed',
      role: 'Client Services',
      bio: 'Your first point of contact for a calm, helpful start.',
      image_path: null,
      sort_order: 4,
      is_active: 1,
      created_at: new Date().toISOString()
    }
  ];

  testimonials: Testimonial[] = [
    {
      id: 1,
      client_name: 'Rebecca Williams',
      client_role: 'HR Director',
      quote: 'The process was clear from the beginning. The team was knowledgeable, organised and proactive at every stage.',
      image_path: null,
      sort_order: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      client_name: 'James Thornton',
      client_role: 'IT Consultant',
      quote: 'I felt informed and supported throughout. Every detail was handled carefully and the advice was always straightforward.',
      image_path: null,
      sort_order: 2,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      client_name: 'Olivia Bennett',
      client_role: 'Teacher',
      quote: 'A complex process became manageable. The communication was excellent and I always knew what to expect next.',
      image_path: null,
      sort_order: 3,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      client_name: 'Daniel Whitmore',
      client_role: 'Financial Analyst',
      quote: 'Professional, responsive and genuinely supportive. I would not hesitate to recommend the team.',
      image_path: null,
      sort_order: 4,
      is_active: 1,
      created_at: new Date().toISOString()
    }
  ];

  articles: Article[] = [
    {
      id: 1,
      title: 'Planning a successful Skilled Worker application',
      slug: 'planning-a-successful-skilled-worker-application',
      category: 'Work visas',
      excerpt: 'A practical outline of the preparation, evidence and planning that helps a Skilled Worker application run smoothly.',
      body: 'A strong application starts with a clear understanding of the route and the evidence required.\n\nBegin by confirming that the role, sponsor and salary meet the relevant requirements. Collect personal documents early, keep copies of all correspondence and allow time for each stage of the process.\n\nEvery situation is different, so professional advice can help identify the most appropriate route and avoid avoidable delays.',
      image_path: null,
      status: 'published',
      published_at: '2026-07-19 09:00:00',
      created_at: '2026-07-19 09:00:00'
    },
    {
      id: 2,
      title: 'Family immigration: preparing the evidence',
      slug: 'family-immigration-preparing-the-evidence',
      category: 'Family visas',
      excerpt: 'The documents that often help explain a family application clearly and consistently.',
      body: 'Family applications are strongest when the documents tell a coherent story. Evidence may include relationship documents, financial information, correspondence and proof of living arrangements.\n\nStart early, use clear labels and ensure that dates and names match throughout the application. A well-organised bundle makes it easier for a decision maker to understand your circumstances.',
      image_path: null,
      status: 'published',
      published_at: '2026-06-27 09:00:00',
      created_at: '2026-06-27 09:00:00'
    },
    {
      id: 3,
      title: 'What to consider before applying for settlement',
      slug: 'what-to-consider-before-applying-for-settlement',
      category: 'Settlement',
      excerpt: 'Key questions to ask before submitting an application for indefinite leave to remain.',
      body: 'Settlement is an important milestone. Before applying, check the qualifying period, absences, evidence of residence and any applicable language or knowledge requirements.\n\nCareful preparation helps ensure that the application accurately reflects your immigration history and current circumstances.',
      image_path: null,
      status: 'published',
      published_at: '2026-05-30 09:00:00',
      created_at: '2026-05-30 09:00:00'
    }
  ];

  enquiries: Enquiry[] = [
    {
      id: 1,
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@example.com',
      phone: '+44 7700 900123',
      service: 'Business immigration',
      message: 'Looking for assistance with sponsor licence renewal and expanding skilled worker assignments for our London office.',
      consent: 1,
      status: 'new',
      created_at: '2026-08-15 14:30:00'
    }
  ];

  pages: Page[] = [
    // --- Personal Immigration Level 2 Pages ---
    {
      id: 1,
      title: 'Family & Partner Visas',
      slug: 'family-partner-visas',
      parent_menu: 'personal_immigration',
      parent_page_id: 0,
      icon: 'user',
      content: '<p>Comprehensive immigration solutions for partners, spouses, children, and dependent family members looking to join or remain with family in the UK.</p><h3>Why Choose Northstar Legal for Family Applications</h3><p>Family visa applications require rigorous evidence of relationship genuineness, financial sufficiency, and suitable accommodation. Our specialist advisers guide you through every requirement to secure your family life in the UK.</p>',
      image_path: null,
      sort_order: 1,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 2,
      title: 'Work & Employment Visas',
      slug: 'work-employment-visas',
      parent_menu: 'personal_immigration',
      parent_page_id: 0,
      icon: 'briefcase',
      content: '<p>Direct legal advice for professionals, healthcare staff, and global talent seeking to work and advance their careers in the United Kingdom.</p><h3>Tailored Representation for Professionals</h3><p>We review Certificate of Sponsorship (CoS) allocations, salary thresholds, and occupation codes to ensure seamless visa approval.</p>',
      image_path: null,
      sort_order: 2,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 3,
      title: 'Settlement & British Citizenship',
      slug: 'settlement-citizenship',
      parent_menu: 'personal_immigration',
      parent_page_id: 0,
      icon: 'shield',
      content: '<p>Expert representation for indefinite leave to remain (ILR), permanent settlement, and British citizenship by naturalisation or registration.</p><h3>Your Path to Permanent Residence</h3><p>We evaluate qualifying residence periods, allowable absences, and Life in the UK criteria to help you become a permanent resident or British citizen.</p>',
      image_path: null,
      sort_order: 3,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 4,
      title: 'Visitor & Short Stay Visas',
      slug: 'visitor-short-stay',
      parent_menu: 'personal_immigration',
      parent_page_id: 0,
      icon: 'document',
      content: '<p>Strategic support for standard tourist, family visits, business meetings, and short-term study visits to the UK.</p>',
      image_path: null,
      sort_order: 4,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },

    // --- Personal Immigration Level 3 Pages (Children of Level 2) ---
    {
      id: 5,
      title: 'Spouse & Civil Partner Visa',
      slug: 'spouse-partner-visas',
      parent_menu: 'personal_immigration',
      parent_page_id: 1,
      icon: 'document',
      content: '<p>Comprehensive guidance for UK Spouse and Civil Partner visa applications. We ensure all financial, accommodation, and relationship requirements are documented clearly to minimize delays.</p><h3>Key Requirements</h3><ul><li>Minimum income requirement and financial proofs</li><li>Genuine and subsisting relationship evidence</li><li>Adequate accommodation in the UK</li><li>English language proficiency test</li></ul><p>Contact our legal advisers for a bespoke consultation on your family application.</p>',
      image_path: null,
      sort_order: 1,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 6,
      title: 'Fiancé & Proposed Civil Partner',
      slug: 'fiance-visa',
      parent_menu: 'personal_immigration',
      parent_page_id: 1,
      icon: 'gift',
      content: '<p>Apply to enter the UK to marry or enter into a civil partnership within 6 months. Once married in the UK, we assist you in transitioning directly to a Spouse Visa.</p>',
      image_path: null,
      sort_order: 2,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 7,
      title: 'Unmarried Partner Visa',
      slug: 'unmarried-partner-visa',
      parent_menu: 'personal_immigration',
      parent_page_id: 1,
      icon: 'user',
      content: '<p>For long-term partners who have lived together or been in a relationship akin to marriage. We prepare rigorous cohabitation and relationship bundles.</p>',
      image_path: null,
      sort_order: 3,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 8,
      title: 'Parent & Child Family Visas',
      slug: 'parent-child-visas',
      parent_menu: 'personal_immigration',
      parent_page_id: 1,
      icon: 'award',
      content: '<p>Specialist support for parents of British or settled children, and applications for children joining their parents in the UK.</p>',
      image_path: null,
      sort_order: 4,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 9,
      title: 'Skilled Worker Visas',
      slug: 'skilled-worker-visas',
      parent_menu: 'personal_immigration',
      parent_page_id: 2,
      icon: 'briefcase',
      content: '<p>Direct legal advice for professionals relocating to the UK under the Skilled Worker route. We review Certificate of Sponsorship (CoS) allocations, salary thresholds, and occupation codes.</p><h3>Application Steps</h3><ol><li>Verify job offer meets eligible occupation codes</li><li>Confirm valid Certificate of Sponsorship from a licensed employer</li><li>Prepare maintenance and English language credentials</li><li>Submit biometrics and track decision</li></ol>',
      image_path: null,
      sort_order: 1,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 10,
      title: 'Health and Care Worker Visa',
      slug: 'health-care-worker-visa',
      parent_menu: 'personal_immigration',
      parent_page_id: 2,
      icon: 'shield',
      content: '<p>Dedicated visa pathway for medical professionals, doctors, nurses, and adult social care specialists joining the NHS or licensed healthcare providers.</p>',
      image_path: null,
      sort_order: 2,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 11,
      title: 'Global Talent Visa',
      slug: 'global-talent-visa',
      parent_menu: 'personal_immigration',
      parent_page_id: 2,
      icon: 'star',
      content: '<p>For leaders and potential leaders in academia, research, arts and culture, and digital technology seeking to work in the UK without employer sponsorship.</p>',
      image_path: null,
      sort_order: 3,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 12,
      title: 'Graduate Visa Route',
      slug: 'graduate-route',
      parent_menu: 'personal_immigration',
      parent_page_id: 2,
      icon: 'award',
      content: '<p>Allows international students who have completed an eligible UK degree to stay and work for 2 or 3 years without requiring a sponsor.</p>',
      image_path: null,
      sort_order: 4,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 13,
      title: 'Indefinite Leave to Remain (ILR)',
      slug: 'indefinite-leave-to-remain',
      parent_menu: 'personal_immigration',
      parent_page_id: 3,
      icon: 'shield',
      content: '<p>Settlement advice for individuals and families after qualifying periods of residence in the UK. We check continuous residence records, absences, and Life in the UK test requirements.</p>',
      image_path: null,
      sort_order: 1,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 14,
      title: 'British Citizenship by Naturalisation',
      slug: 'british-citizenship',
      parent_menu: 'personal_immigration',
      parent_page_id: 3,
      icon: 'award',
      content: '<p>Naturalisation and registration as a British citizen. Our advisers guide you through good character requirements, ceremony bookings, and passport issuance.</p>',
      image_path: null,
      sort_order: 2,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 15,
      title: '10-Year Long Residence ILR',
      slug: '10-year-long-residence',
      parent_menu: 'personal_immigration',
      parent_page_id: 3,
      icon: 'scale',
      content: '<p>Settlement pathway based on 10 years of continuous lawful residence in the United Kingdom.</p>',
      image_path: null,
      sort_order: 3,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },

    // --- Business Immigrations Level 2 Pages ---
    {
      id: 16,
      title: 'Sponsor Licence Services',
      slug: 'sponsor-licence-services',
      parent_menu: 'business_immigrations',
      parent_page_id: 0,
      icon: 'database',
      content: '<p>Complete assistance for UK employers wishing to recruit and sponsor overseas talent. We manage initial applications, renewals, and compliance audits.</p><h3>Why Employers Trust Northstar</h3><p>We audit your HR processes before submission to avoid Home Office compliance suspensions and penalties.</p>',
      image_path: null,
      sort_order: 1,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 17,
      title: 'Global Business Mobility',
      slug: 'global-business-mobility',
      parent_menu: 'business_immigrations',
      parent_page_id: 0,
      icon: 'briefcase',
      content: '<p>Routes for overseas businesses establishing a UK branch, transferring senior staff, or fulfilling high-value international contracts.</p>',
      image_path: null,
      sort_order: 2,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 18,
      title: 'Founders & Business Investors',
      slug: 'founders-investors',
      parent_menu: 'business_immigrations',
      parent_page_id: 0,
      icon: 'star',
      content: '<p>Innovative pathways for founders, venture-backed entrepreneurs, and self-sponsored business owners setting up in the UK.</p>',
      image_path: null,
      sort_order: 3,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },

    // --- Business Immigrations Level 3 Pages (Children of Level 2) ---
    {
      id: 19,
      title: 'Sponsor Licence Applications',
      slug: 'sponsor-licence-applications',
      parent_menu: 'business_immigrations',
      parent_page_id: 16,
      icon: 'database',
      content: '<p>Complete assistance for UK employers wishing to sponsor overseas workers. We help set up Key Personnel, HR compliance systems, and submit robust documentary bundles.</p>',
      image_path: null,
      sort_order: 1,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 20,
      title: 'Sponsor Licence Renewals & Audits',
      slug: 'sponsor-licence-audits',
      parent_menu: 'business_immigrations',
      parent_page_id: 16,
      icon: 'shield',
      content: '<p>Mock compliance audits, right to work checks, and Key Personnel management to protect your Sponsor Licence rating.</p>',
      image_path: null,
      sort_order: 2,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 21,
      title: 'Certificate of Sponsorship (CoS) Allocation',
      slug: 'cos-allocations',
      parent_menu: 'business_immigrations',
      parent_page_id: 16,
      icon: 'document',
      content: '<p>Guidance on applying for Defined and Undefined Certificates of Sponsorship, annual allocation increases, and SMS portal management.</p>',
      image_path: null,
      sort_order: 3,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 22,
      title: 'Senior or Specialist Worker Visa',
      slug: 'senior-specialist-worker',
      parent_menu: 'business_immigrations',
      parent_page_id: 17,
      icon: 'briefcase',
      content: '<p>For senior managers and specialist employees being transferred to a UK branch of their overseas employer under Global Business Mobility.</p>',
      image_path: null,
      sort_order: 1,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 23,
      title: 'UK Expansion Worker Visa',
      slug: 'uk-expansion-worker',
      parent_menu: 'business_immigrations',
      parent_page_id: 17,
      icon: 'award',
      content: '<p>Allows overseas businesses to send a senior employee to the UK to establish and expand the company’s first UK branch or subsidiary.</p>',
      image_path: null,
      sort_order: 2,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 24,
      title: 'Secondment Worker Route',
      slug: 'secondment-worker',
      parent_menu: 'business_immigrations',
      parent_page_id: 17,
      icon: 'document',
      content: '<p>Facilitates temporary transfers of overseas staff to the UK as part of high-value international trade contracts.</p>',
      image_path: null,
      sort_order: 3,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 25,
      title: 'Innovator Founder Visas',
      slug: 'innovator-founder-visas',
      parent_menu: 'business_immigrations',
      parent_page_id: 18,
      icon: 'star',
      content: '<p>Guidance for entrepreneurs with innovative, viable, and scalable business ideas seeking endorsement by Home Office approved endorsing bodies.</p>',
      image_path: null,
      sort_order: 1,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 26,
      title: 'Self-Sponsorship Visa',
      slug: 'self-sponsorship-visa',
      parent_menu: 'business_immigrations',
      parent_page_id: 18,
      icon: 'user',
      content: '<p>Strategic route allowing international entrepreneurs to establish a UK company, obtain a sponsor licence, and sponsor themselves as a Skilled Worker.</p>',
      image_path: null,
      sort_order: 2,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 27,
      title: 'Scale-up Worker Route',
      slug: 'scale-up-worker',
      parent_menu: 'business_immigrations',
      parent_page_id: 18,
      icon: 'scale',
      content: '<p>Enables qualifying fast-growing UK scale-up businesses to recruit highly skilled talent with reduced administrative burden.</p>',
      image_path: null,
      sort_order: 3,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },

    // --- Standalone Pages ---
    {
      id: 28,
      title: 'Terms of Business',
      slug: 'terms-of-business',
      parent_menu: 'none',
      parent_page_id: 0,
      icon: 'document',
      content: '<p>Welcome to Northstar Legal. These Terms of Business set out the basis on which we provide legal guidance and immigration casework services.</p><h3>1. Professional Standards</h3><p>We provide immigration advice in accordance with the relevant codes of professional conduct. All advice is tailored to client requirements.</p><h3>2. Client Care</h3><p>We keep clients updated on case developments and provide transparent cost estimates prior to undertaking billable casework.</p>',
      image_path: null,
      sort_order: 9,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 29,
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      parent_menu: 'none',
      parent_page_id: 0,
      icon: 'document',
      content: '<p>Northstar Legal is committed to safeguarding personal information collected via this website and our client consultation forms.</p><h3>Data Collection</h3><p>We process details submitted through contact forms solely to assess enquiries and deliver requested immigration advice.</p>',
      image_path: null,
      sort_order: 10,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 30,
      title: 'Human Rights & Discretionary Claims',
      slug: 'human-rights-claims',
      parent_menu: 'personal_immigration',
      parent_page_id: 1,
      icon: 'shield',
      content: '<p>Specialist advice and robust casework for Article 8 ECHR family and private life claims, medical grounds, outside the immigration rules discretionary leave, and asylum representations.</p><h3>Human Rights Applications</h3><p>We build detailed bundles substantiating exceptional circumstances, insurmountable obstacles, and the best interests of affected children under Section 55.</p>',
      image_path: null,
      sort_order: 5,
      status: 'published',
      created_at: '2026-01-01 00:00:00'
    }
  ];

  heroSlides: HeroSlide[] = [
    {
      id: 1,
      eyebrow: 'IMMIGRATION SPECIALISTS',
      title: "From paperwork to possibilities.\nWe've got you covered.",
      text: 'Clear advice, experienced guidance and a plan tailored around you.',
      button_text: 'Book consultation',
      button_url: 'contact.php#consultation',
      image_path: null,
      sort_order: 1,
      is_active: 1
    },
    {
      id: 2,
      eyebrow: 'PERSONAL & BUSINESS IMMIGRATION',
      title: "Specialist guidance for\nindividuals and businesses.",
      text: 'Direct, realistic advice on visas, settlement, citizenship and sponsor licensing.',
      button_text: 'Explore services',
      button_url: 'services.php',
      image_path: null,
      sort_order: 2,
      is_active: 1
    }
  ];

  sectionBackgrounds: SectionBackground[] = [
    { id: 1, label: 'Home Intro', section_key: 'home_intro', image_path: null, sort_order: 1, is_active: 1 },
    { id: 2, label: 'Home Features', section_key: 'home_features', image_path: null, sort_order: 2, is_active: 1 },
    { id: 3, label: 'Home Testimonials', section_key: 'home_testimonials', image_path: null, sort_order: 3, is_active: 1 },
    { id: 4, label: 'Home Articles', section_key: 'home_articles', image_path: null, sort_order: 4, is_active: 1 },
    { id: 5, label: 'Home Consultation', section_key: 'home_consultation', image_path: null, sort_order: 5, is_active: 1 },
    { id: 6, label: 'Site Footer', section_key: 'site_footer', image_path: null, sort_order: 6, is_active: 1 },
    { id: 7, label: 'About Hero', section_key: 'about_hero', image_path: null, sort_order: 7, is_active: 1 },
    { id: 8, label: 'About Story', section_key: 'about_story', image_path: null, sort_order: 8, is_active: 1 },
    { id: 9, label: 'About Story Image', section_key: 'about_story_image', image_path: null, sort_order: 9, is_active: 1 },
    { id: 10, label: 'About Team', section_key: 'about_team', image_path: null, sort_order: 10, is_active: 1 },
    { id: 11, label: 'Services Hero', section_key: 'services_hero', image_path: null, sort_order: 11, is_active: 1 },
    { id: 12, label: 'Services List', section_key: 'services_list', image_path: null, sort_order: 12, is_active: 1 },
    { id: 13, label: 'Contact Hero', section_key: 'contact_hero', image_path: null, sort_order: 13, is_active: 1 },
    { id: 14, label: 'Contact Form', section_key: 'contact_form', image_path: null, sort_order: 14, is_active: 1 },
    { id: 15, label: 'Articles Hero', section_key: 'articles_hero', image_path: null, sort_order: 15, is_active: 1 },
    { id: 16, label: 'Articles List', section_key: 'articles_list', image_path: null, sort_order: 16, is_active: 1 },
    { id: 17, label: 'Home Clients', section_key: 'home_clients', image_path: null, sort_order: 17, is_active: 1 }
  ];

  clients: ClientLogo[] = [
    {
      id: 1,
      name: 'Lee Garden',
      website_url: '',
      image_path: '/uploads/logo-lee-garden.svg',
      sort_order: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'POLYSURANCE',
      website_url: '',
      image_path: '/uploads/logo-polysurance.svg',
      sort_order: 2,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'SUNNAMUSK LONDON',
      website_url: '',
      image_path: '/uploads/logo-sunnamusk.svg',
      sort_order: 3,
      is_active: 1,
      created_at: new Date().toISOString()
    }
  ];

  heroDropdownOptions: HeroDropdownOption[] = [
    {
      id: 1,
      title: 'Spouse visa',
      page_id: 5,
      target_url: '/page.php?slug=spouse-partner-visas',
      sort_order: 1,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Finance visa',
      page_id: 6,
      target_url: '/page.php?slug=fiance-visa',
      sort_order: 2,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Graduate visa',
      page_id: 12,
      target_url: '/page.php?slug=graduate-route',
      sort_order: 3,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: 'Human right',
      page_id: 30,
      target_url: '/page.php?slug=human-rights-claims',
      sort_order: 4,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      title: 'Skilled worker visa',
      page_id: 9,
      target_url: '/page.php?slug=skilled-worker-visas',
      sort_order: 5,
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      title: 'Settlement / ILR',
      page_id: 13,
      target_url: '/page.php?slug=indefinite-leave-to-remain',
      sort_order: 6,
      is_active: 1,
      created_at: new Date().toISOString()
    }
  ];

  admins: Admin[] = [
    {
      id: 1,
      name: 'Site Administrator',
      email: 'admin@example.com',
      password: 'ChangeMe123!'
    }
  ];

  nextId = 100;
  initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      await testConnection();
      const firestore = getFirebaseDb();

      // Load Settings
      const settingsSnap = await getDocs(collection(firestore, 'settings'));
      if (settingsSnap.empty) {
        // Seed default settings
        const batch = writeBatch(firestore);
        for (const [key, value] of this.settings.entries()) {
          const docRef = doc(firestore, 'settings', key);
          batch.set(docRef, { key, value, updated_at: new Date().toISOString() });
        }
        await batch.commit();
      } else {
        this.settings.clear();
        settingsSnap.forEach(d => {
          const data = d.data();
          if (data && data.key && data.value !== undefined) {
            this.settings.set(data.key, data.value);
          }
        });
      }

      // Sync Table Helper
      const syncCollection = async <T extends { id: number }>(
        collName: string,
        initialList: T[],
        setter: (list: T[]) => void
      ) => {
        const snap = await getDocs(collection(firestore, collName));
        if (snap.empty) {
          const batch = writeBatch(firestore);
          for (const item of initialList) {
            const docRef = doc(firestore, collName, String(item.id));
            batch.set(docRef, item);
          }
          await batch.commit();
        } else {
          const items: T[] = [];
          snap.forEach(d => {
            items.push(d.data() as T);
          });
          setter(items);
        }
      };

      await syncCollection('menu_items', this.menuItems, l => { this.menuItems = l; });
      await syncCollection('services', this.services, l => { this.services = l; });
      await syncCollection('team_members', this.teamMembers, l => { this.teamMembers = l; });
      await syncCollection('testimonials', this.testimonials, l => { this.testimonials = l; });
      await syncCollection('articles', this.articles, l => { this.articles = l; });
      await syncCollection('enquiries', this.enquiries, l => { this.enquiries = l; });
      await syncCollection('pages', this.pages, l => { this.pages = l; });
      await syncCollection('hero_slides', this.heroSlides, l => { this.heroSlides = l; });
      await syncCollection('section_backgrounds', this.sectionBackgrounds, l => { this.sectionBackgrounds = l; });
      await syncCollection('clients', this.clients, l => { this.clients = l; });
      await syncCollection('hero_dropdown', this.heroDropdownOptions, l => { this.heroDropdownOptions = l; });
      await syncCollection('admins', this.admins, l => {
        if (!l || l.length === 0) {
          // Keep initial
        } else {
          const hasAdmin = l.some(a => a.email.toLowerCase() === 'admin@example.com');
          if (!hasAdmin) {
            l.push({
              id: 1,
              name: 'Site Administrator',
              email: 'admin@example.com',
              password: 'ChangeMe123!'
            });
          }
          this.admins = l;
        }
      });

      // Determine nextId
      const allIds = [
        ...this.menuItems.map(i => i.id),
        ...this.services.map(i => i.id),
        ...this.teamMembers.map(i => i.id),
        ...this.testimonials.map(i => i.id),
        ...this.articles.map(i => i.id),
        ...this.enquiries.map(i => i.id),
        ...this.pages.map(i => i.id),
        ...this.heroSlides.map(i => i.id),
        ...this.sectionBackgrounds.map(i => i.id),
        ...this.clients.map(i => i.id),
        ...this.heroDropdownOptions.map(i => i.id)
      ];
      if (allIds.length > 0) {
        this.nextId = Math.max(...allIds, 100);
      }

      this.initialized = true;
      console.log('Firebase Firestore initialized and synchronized successfully.');
    } catch (err) {
      console.error('Failed to initialize Firestore, running with in-memory persistence:', err);
    }
  }

  getSetting(key: string, fallback = ''): string {
    return this.settings.get(key) ?? fallback;
  }

  async setSetting(key: string, value: string): Promise<void> {
    this.settings.set(key, value);
    try {
      const firestore = getFirebaseDb();
      const docRef = doc(firestore, 'settings', key);
      await setDoc(docRef, { key, value, updated_at: new Date().toISOString() });
    } catch (err) {
      console.error('Error updating setting in Firestore:', err);
    }
  }

  getAllSettings(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [k, v] of this.settings.entries()) {
      result[k] = v;
    }
    return result;
  }

  getTableCollectionName(type: string): string {
    switch (type) {
      case 'menus':
      case 'menu_items':
      case 'menu': return 'menu_items';
      case 'services':
      case 'service': return 'services';
      case 'team':
      case 'team_members':
      case 'team_member': return 'team_members';
      case 'testimonials':
      case 'testimonial': return 'testimonials';
      case 'articles':
      case 'article': return 'articles';
      case 'enquiries':
      case 'enquiry': return 'enquiries';
      case 'pages':
      case 'page': return 'pages';
      case 'hero_slides':
      case 'hero_slide':
      case 'slides': return 'hero_slides';
      case 'backgrounds':
      case 'section_backgrounds': return 'section_backgrounds';
      case 'clients':
      case 'client':
      case 'client_logos': return 'clients';
      case 'hero_dropdown':
      case 'hero_dropdowns':
      case 'hero_dropdown_options':
      case 'hero_options': return 'hero_dropdown';
      case 'admins':
      case 'admin': return 'admins';
      default: return type;
    }
  }

  getTable(type: string): any[] | null {
    switch (type) {
      case 'menus':
      case 'menu_items':
      case 'menu': return this.menuItems;
      case 'services':
      case 'service': return this.services;
      case 'team':
      case 'team_members':
      case 'team_member': return this.teamMembers;
      case 'testimonials':
      case 'testimonial': return this.testimonials;
      case 'articles':
      case 'article': return this.articles;
      case 'enquiries':
      case 'enquiry': return this.enquiries;
      case 'pages':
      case 'page': return this.pages;
      case 'hero_slides':
      case 'hero_slide':
      case 'slides': return this.heroSlides;
      case 'backgrounds':
      case 'section_backgrounds': return this.sectionBackgrounds;
      case 'clients':
      case 'client':
      case 'client_logos': return this.clients;
      case 'hero_dropdown':
      case 'hero_dropdowns':
      case 'hero_dropdown_options':
      case 'hero_options': return this.heroDropdownOptions;
      case 'admins':
      case 'admin': return this.admins;
      default: return null;
    }
  }

  getResolvedHeroDropdownOptions(): Array<HeroDropdownOption & { resolved_url: string }> {
    const list = this.heroDropdownOptions.filter(o => Boolean(o.is_active) || o.is_active === undefined);
    list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    return list.map(opt => {
      let resolved_url = (opt.target_url || '').trim();
      if (opt.page_id) {
        const p = this.pages.find(page => Number(page.id) === Number(opt.page_id));
        if (p) {
          resolved_url = `/page.php?slug=${p.slug}`;
        }
      }
      if (!resolved_url) {
        resolved_url = '#';
      }
      return {
        ...opt,
        resolved_url
      };
    });
  }

  findOne(table: string, id: number | string): any {
    const list = this.getTable(table);
    if (!list) return null;
    return list.find(item => Number(item.id) === Number(id) || String(item.id) === String(id)) || null;
  }

  async insert(table: string, data: any): Promise<any> {
    const list = this.getTable(table);
    if (!list) return null;
    const newItem = {
      ...data,
      id: ++this.nextId,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    list.unshift(newItem);

    try {
      const firestore = getFirebaseDb();
      const collName = this.getTableCollectionName(table);
      const docRef = doc(firestore, collName, String(newItem.id));
      await setDoc(docRef, newItem);
    } catch (err) {
      console.error(`Error writing to Firestore ${table}:`, err);
    }

    return newItem;
  }

  async update(table: string, id: number | string, data: any): Promise<any> {
    const list = this.getTable(table);
    if (!list) return null;
    const numId = Number(id);
    const index = list.findIndex(item => Number(item.id) === numId || String(item.id) === String(id));
    if (index === -1) return null;
    list[index] = { ...list[index], ...data, updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19) };

    try {
      const firestore = getFirebaseDb();
      const collName = this.getTableCollectionName(table);
      const docRef = doc(firestore, collName, String(list[index].id || id));
      await setDoc(docRef, list[index]);
    } catch (err) {
      console.error(`Error updating Firestore ${table}:`, err);
    }

    return list[index];
  }

  async delete(table: string, id: number | string): Promise<boolean> {
    const list = this.getTable(table);
    if (!list) return false;
    const numId = Number(id);
    const index = list.findIndex(item => Number(item.id) === numId || String(item.id) === String(id));
    if (index === -1) return false;
    const deletedItem = list[index];
    list.splice(index, 1);

    // If deleting a page, also reset any child pages' parent_page_id to prevent broken nesting
    if (table === 'pages' || table === 'page') {
      this.pages.forEach(p => {
        if (Number(p.parent_page_id) === numId || String(p.parent_page_id) === String(id)) {
          p.parent_page_id = 0;
          this.update('pages', p.id, { parent_page_id: 0 });
        }
      });
    }

    try {
      const firestore = getFirebaseDb();
      const collName = this.getTableCollectionName(table);
      const docRef = doc(firestore, collName, String(deletedItem.id || id));
      await deleteDoc(docRef);
    } catch (err) {
      console.error(`Error deleting from Firestore ${table}:`, err);
    }

    return true;
  }

  sectionStyle(key: string): string {
    const bg = this.sectionBackgrounds.find(b => b.section_key === key && b.is_active && b.image_path);
    if (bg && bg.image_path) {
      return ` style="--section-bg-image: url('${bg.image_path}')"`;
    }
    return '';
  }

  getNavTree(): NavTreeNode[] {
    const activeMenus = this.menuItems
      .filter(m => m.is_active)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const publishedPages = this.pages
      .filter(p => p.status === 'published')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    return activeMenus.map(item => {
      let categoryKey = '';
      const titleLower = item.title.toLowerCase();
      if (titleLower.includes('personal')) {
        categoryKey = 'personal_immigration';
      } else if (titleLower.includes('business')) {
        categoryKey = 'business_immigrations';
      } else if (item.parent_key) {
        categoryKey = item.parent_key;
      }

      if (!categoryKey) {
        return {
          item,
          submenus: []
        };
      }

      // Find all Level 2 pages under this category (no parent_page_id or parent_page_id === 0)
      const level2Pages = publishedPages.filter(p =>
        p.parent_menu === categoryKey && (!p.parent_page_id || Number(p.parent_page_id) === 0)
      );

      // For each Level 2 page, find its Level 3 child pages
      const submenus: NavSubmenuNode[] = level2Pages.map(l2Page => {
        const children = publishedPages.filter(p => Number(p.parent_page_id) === Number(l2Page.id));
        return {
          page: l2Page,
          children
        };
      });

      return {
        item,
        submenus
      };
    });
  }
}

export const db = new FirestoreDB();

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') || `item-${Date.now()}`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  return `${day} ${month}`;
}

export function renderMenuIcon(icon?: string): string {
  const iconKey = (icon || '').toLowerCase().trim();
  switch (iconKey) {
    case 'home':
      return `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19.5v-9z"/><path d="M9 21V12h6v9"/></svg>`;
    
    case 'list':
      return `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>`;

    case 'database':
      return `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`;

    case 'contact':
      return `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="15" height="18" rx="2"/><line x1="2" y1="7" x2="5" y2="7"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="2" y1="17" x2="5" y2="17"/><circle cx="12.5" cy="10" r="2.2"/><path d="M9.5 16c0-1.5 1.5-2.2 3-2.2s3 .7 3 2.2"/></svg>`;

    case 'gift':
      return `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`;

    case 'document':
    case 'file':
      return `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;

    case 'briefcase':
      return `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;

    case 'shield':
      return `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;

    case 'award':
      return `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`;

    case 'star':
      return `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

    case 'user':
      return `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

    case 'scale':
      return `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M5 6l7-3 7 3"/><path d="M2 13l3-7 3 7a3 3 0 0 1-6 0z"/><path d="M16 13l3-7 3 7a3 3 0 0 1-6 0z"/><path d="M4 21h16"/></svg>`;

    default:
      return `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/></svg>`;
  }
}
