import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, slugify, formatDate, formatShortDate, renderMenuIcon } from './src/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.set('trust proxy', 1);

// Ensure uploads directory exists (with serverless /tmp fallback)
let uploadsDir = path.join(process.cwd(), 'public', 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  uploadsDir = path.join('/tmp', 'uploads');
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (err) {}
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'upload-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }
});

// Configure EJS view engine with flexible path resolution for Netlify serverless
const candidateViewsPaths = [
  path.join(process.cwd(), 'views'),
  path.resolve(__dirname, 'views'),
  path.resolve(__dirname, '../views'),
  path.resolve(__dirname, '../../views')
];
const viewsDir = candidateViewsPaths.find(p => fs.existsSync(p)) || path.join(process.cwd(), 'views');
app.set('view engine', 'ejs');
app.set('views', viewsDir);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser('northstar-legal-secret-2026'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'northstar-legal-secret-2026',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'none',
    secure: true,
    httpOnly: true
  }
}));

// Static files
const publicDir = [
  path.join(process.cwd(), 'public'),
  path.resolve(__dirname, 'public'),
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '../../public')
].find(p => fs.existsSync(p)) || path.join(process.cwd(), 'public');

app.use(express.static(publicDir));
app.use('/assets', express.static(path.join(publicDir, 'assets')));
app.use('/uploads', express.static(uploadsDir));

// Global template helpers
app.use((req: Request, res: Response, next: NextFunction) => {
  // Sync admin user from cookie fallback if session was lost in iframe
  if (!(req.session as any)?.admin && req.cookies?.admin_auth) {
    try {
      const parsed = typeof req.cookies.admin_auth === 'string'
        ? JSON.parse(req.cookies.admin_auth)
        : req.cookies.admin_auth;
      if (parsed && parsed.email) {
        (req.session as any).admin = parsed;
      }
    } catch (e) {}
  }

  res.locals.setting = (key: string, fallback = '') => db.getSetting(key, fallback);
  res.locals.sectionStyle = (key: string) => db.sectionStyle(key);
  res.locals.formatDate = formatDate;
  res.locals.formatShortDate = formatShortDate;
  res.locals.renderMenuIcon = renderMenuIcon;
  res.locals.navTree = db.getNavTree();
  res.locals.current_slug = '';
  res.locals.footer_pages = db.pages.filter(p => p.status === 'published');
  res.locals.flash_message = (req.session as any)?.flash_message || null;
  if ((req.session as any)?.flash_message) {
    delete (req.session as any).flash_message;
  }
  next();
});

// Auth helper
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if ((req.session as any)?.admin) {
    return next();
  }
  if (req.cookies?.admin_auth) {
    try {
      const parsed = typeof req.cookies.admin_auth === 'string'
        ? JSON.parse(req.cookies.admin_auth)
        : req.cookies.admin_auth;
      if (parsed && parsed.email) {
        (req.session as any).admin = parsed;
        return next();
      }
    } catch (e) {}
  }
  res.redirect('/admin/login.php');
}

// ----------------------------------------------------
// Public Routes (Supporting both clean & .php URLs)
// ----------------------------------------------------

// Home
const handleHome = (_req: Request, res: Response) => {
  const services = db.services.filter(s => Boolean(s.is_active) || s.is_active === undefined).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const testimonials = db.testimonials.filter(t => Boolean(t.is_active) || t.is_active === undefined).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const articles = db.articles.filter(a => a.status !== 'draft').slice(0, 3);
  const hero_slides = db.heroSlides.filter(h => Boolean(h.is_active) || h.is_active === undefined).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const clients = db.clients.filter(c => Boolean(c.is_active) || c.is_active === undefined).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const hero_dropdown = db.getResolvedHeroDropdownOptions();

  res.render('index', {
    page_title: 'Immigration support, tailored to you',
    current: 'index',
    services,
    testimonials,
    articles,
    hero_slides,
    clients,
    hero_dropdown
  });
};
app.get('/', handleHome);
app.get('/index.php', handleHome);

// About Us
const handleAbout = (_req: Request, res: Response) => {
  const team = db.teamMembers.filter(m => m.is_active).sort((a, b) => a.sort_order - b.sort_order);
  res.render('about', {
    page_title: 'About us',
    current: 'about',
    team
  });
};
app.get('/about', handleAbout);
app.get('/about.php', handleAbout);

// Services
const handleServices = (_req: Request, res: Response) => {
  const services = db.services.filter(s => s.is_active).sort((a, b) => a.sort_order - b.sort_order);
  res.render('services', {
    page_title: 'Services',
    current: 'services',
    services
  });
};
app.get('/services', handleServices);
app.get('/services.php', handleServices);

// Insights / Articles list
const handleArticles = (_req: Request, res: Response) => {
  const articles = db.articles.filter(a => a.status === 'published');
  res.render('articles', {
    page_title: 'Insights',
    current: 'articles',
    articles
  });
};
app.get('/articles', handleArticles);
app.get('/articles.php', handleArticles);

// Single Article
const handleArticle = (req: Request, res: Response) => {
  const slug = (req.query.slug as string) || (req.params.slug as string) || '';
  const article = db.articles.find(a => a.slug === slug && a.status === 'published');

  if (!article) {
    return res.status(404).render('article', {
      page_title: 'Article not found',
      current: 'article',
      article: {
        title: 'Article not found',
        category: 'Information',
        published_at: '',
        excerpt: 'The article you requested could not be found.',
        body: 'Please check the URL or return to the insights hub to explore other publications.',
        image_path: null
      }
    });
  }

  res.render('article', {
    page_title: article.title,
    current: 'article',
    article
  });
};
app.get('/article', handleArticle);
app.get('/article.php', handleArticle);
app.get('/article/:slug', handleArticle);

// Contact
const handleContact = (req: Request, res: Response) => {
  const topic = (req.query.topic as string) || '';
  const sent = req.query.sent === '1';
  const services = db.services.filter(s => s.is_active).sort((a, b) => a.sort_order - b.sort_order);

  res.render('contact', {
    page_title: 'Contact',
    current: 'contact',
    topic,
    sent,
    services
  });
};
app.get('/contact', handleContact);
app.get('/contact.php', handleContact);

// Form Submit
const handleSubmit = async (req: Request, res: Response) => {
  const { form_type, first_name, last_name, email, phone, service, message, consent } = req.body;
  if (form_type === 'consultation') {
    await db.insert('enquiries', {
      first_name: (first_name || '').trim(),
      last_name: (last_name || '').trim(),
      email: (email || '').trim(),
      phone: (phone || '').trim(),
      service: (service || '').trim(),
      message: (message || '').trim(),
      consent: consent ? 1 : 0,
      status: 'new'
    });
  }
  res.redirect('/contact.php?sent=1#consultation');
};
app.post('/submit', handleSubmit);
app.post('/submit.php', handleSubmit);

// Custom Pages
const handlePage = (req: Request, res: Response) => {
  const slug = (req.query.slug as string) || (req.params.slug as string) || '';
  const page = db.pages.find(p => p.slug === slug && p.status === 'published');

  if (!page) {
    return res.status(404).render('page', {
      page_title: 'Page not found',
      current: 'page',
      current_slug: '',
      page: {
        title: 'Page not found',
        content: '<p>The requested page could not be located. Please check the address or return to the home page.</p>',
        image_path: null
      },
      parentPage: null,
      childPages: [],
      siblingPages: []
    });
  }

  // Find parent page if this is a Level 3 child page
  const parentPage = page.parent_page_id ? db.pages.find(p => Number(p.id) === Number(page.parent_page_id)) : null;
  // Find children if this is a Level 2 parent page
  const childPages = db.pages.filter(p => Number(p.parent_page_id) === Number(page.id) && p.status === 'published');
  // Find siblings
  const siblingPages = page.parent_page_id
    ? db.pages.filter(p => Number(p.parent_page_id) === Number(page.parent_page_id) && Number(p.id) !== Number(page.id) && p.status === 'published')
    : [];

  res.render('page', {
    page_title: page.title,
    current: 'page',
    current_slug: page.slug,
    page,
    parentPage,
    childPages,
    siblingPages
  });
};
app.get('/page', handlePage);
app.get('/page.php', handlePage);
app.get('/page/:slug', handlePage);

// ----------------------------------------------------
// Admin Routes
// ----------------------------------------------------

// Admin Login
const handleAdminLoginGet = (req: Request, res: Response) => {
  if ((req.session as any)?.admin) {
    return res.redirect('/admin/index.php');
  }
  res.render('admin/login', { error: null });
};
app.get('/admin/login', handleAdminLoginGet);
app.get('/admin/login.php', handleAdminLoginGet);

const handleAdminLoginPost = (req: Request, res: Response) => {
  const email = (req.body.email || '').trim();
  const password = (req.body.password || '').trim();
  const admin = db.admins.find(a => a.email.toLowerCase() === email.toLowerCase());

  if (admin && admin.password === password) {
    const adminData = { id: admin.id, name: admin.name, email: admin.email };
    (req.session as any).admin = adminData;
    res.cookie('admin_auth', JSON.stringify(adminData), {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    return res.redirect('/admin/index.php');
  }

  res.render('admin/login', {
    error: 'Email or password is incorrect.',
    email
  });
};
app.post('/admin/login', handleAdminLoginPost);
app.post('/admin/login.php', handleAdminLoginPost);

// Admin Logout
const handleAdminLogout = (req: Request, res: Response) => {
  res.clearCookie('admin_auth', { sameSite: 'none', secure: true });
  req.session.destroy(() => {
    res.redirect('/admin/login.php');
  });
};
app.get('/admin/logout', handleAdminLogout);
app.get('/admin/logout.php', handleAdminLogout);

// Admin Overview
const handleAdminIndex = (req: Request, res: Response) => {
  const counts = [
    { label: 'New enquiries', count: db.enquiries.filter(e => e.status === 'new').length, type: 'enquiries' },
    { label: 'Navigation items', count: db.menuItems.length, type: 'menus' },
    { label: 'Custom pages', count: db.pages.length, type: 'pages' },
    { label: 'Hero quick links', count: db.heroDropdownOptions.filter(o => o.is_active).length, type: 'hero_dropdown' },
    { label: 'Client logos', count: db.clients.filter(c => c.is_active).length, type: 'clients' },
    { label: 'Active services', count: db.services.filter(s => s.is_active).length, type: 'services' },
    { label: 'Published articles', count: db.articles.filter(a => a.status === 'published').length, type: 'articles' },
    { label: 'Testimonials', count: db.testimonials.filter(t => t.is_active).length, type: 'testimonials' }
  ];

  res.render('admin/index', {
    admin_title: 'Overview',
    admin_page: 'overview',
    admin_user: (req.session as any).admin,
    counts,
    enquiries: db.enquiries.slice(0, 6)
  });
};
app.get('/admin', requireAdmin, handleAdminIndex);
app.get('/admin/index.php', requireAdmin, handleAdminIndex);

// Content Management Config
const contentTypes: Record<string, any> = {
  menus: {
    table: 'menus',
    label: 'Navigation menu items',
    fields: {
      title: 'Menu item title',
      url: 'Destination link (e.g. / or /about.php or /contact.php)',
      icon: 'Menu icon',
      sort_order: 'Display order',
      is_active: 'Show in navigation'
    }
  },
  pages: {
    table: 'pages',
    label: 'Custom pages',
    image_help: 'This image is the full-width page banner behind the heading. Recommended: 1920 × 850 px; JPG, PNG or WebP.',
    fields: {
      title: 'Page heading',
      parent_menu: 'Primary Menu (Layer 1)',
      parent_page_id: 'Sub-menu Parent Group (Layer 2 / Layer 3 placement)',
      icon: 'Menu icon',
      content: 'Page description / rich content',
      sort_order: 'Display order in submenu',
      status: 'Publish status'
    }
  },
  backgrounds: {
    table: 'backgrounds',
    label: 'Section backgrounds',
    image_help: 'Upload a background image for this exact section. Recommended: 1920 × 1080 px; JPG, PNG or WebP; maximum file size 4 MB.',
    fields: { label: 'Section name', section_key: 'Section key (do not change)', sort_order: 'Display order', is_active: 'Use this background' }
  },
  hero_slides: {
    table: 'hero_slides',
    label: 'Hero slider',
    image_help: 'Recommended hero image: 1920 × 950 px. JPG, PNG or WebP; maximum file size 4 MB.',
    fields: { eyebrow: 'Small label', title: 'Headline', text: 'Supporting text', button_text: 'Button text', button_url: 'Button link', sort_order: 'Slide order', is_active: 'Show this slide' }
  },
  hero_dropdown: {
    table: 'hero_dropdown',
    label: 'Hero Dropdown Links',
    fields: {
      title: 'Dropdown Option Label (e.g. Spouse visa, Finance visa)',
      page_id: 'Link to Site Page (select from list)',
      target_url: 'Custom URL (optional override)',
      sort_order: 'Display order in dropdown',
      is_active: 'Show in dropdown'
    }
  },
  clients: {
    table: 'clients',
    label: 'Our Clients & Logos',
    image_help: 'Upload client / company logo. Transparent PNG, SVG, or JPG recommended (approx. 240 × 80 px); maximum file size 4 MB.',
    fields: {
      name: 'Client / Company name',
      website_url: 'Website link (optional)',
      sort_order: 'Display order in carousel',
      is_active: 'Show in carousel'
    }
  },
  services: {
    table: 'services',
    label: 'Services',
    fields: { title: 'Title', tagline: 'Short label', excerpt: 'Card summary', content: 'Full description', sort_order: 'Display order', is_active: 'Visible' }
  },
  team: {
    table: 'team',
    label: 'Team',
    fields: { name: 'Name', role: 'Role', bio: 'Short bio', sort_order: 'Display order', is_active: 'Visible' }
  },
  testimonials: {
    table: 'testimonials',
    label: 'Testimonials',
    fields: { client_name: 'Client name', client_role: 'Client role', quote: 'Quote', sort_order: 'Display order', is_active: 'Visible' }
  },
  articles: {
    table: 'articles',
    label: 'Articles',
    fields: { title: 'Title', category: 'Category', excerpt: 'Excerpt', body: 'Article body', published_at: 'Publish date', status: 'Status' }
  }
};

const settingFields = [
  { key: 'site_name', label: 'Site name' },
  { key: 'company_legal', label: 'Legal company name' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
  { key: 'meta_description', label: 'SEO description' },
  { key: 'hero_title', label: 'Hero headline' },
  { key: 'hero_text', label: 'Hero supporting text' },
  { key: 'hero_dropdown_placeholder', label: 'Hero dropdown placeholder' },
  { key: 'clients_title', label: 'Clients carousel title' },
  { key: 'stat_consultations', label: 'Consultations figure' },
  { key: 'stat_cases', label: 'Cases figure' },
  { key: 'stat_success', label: 'Success-rate figure' },
  { key: 'stat_reviews', label: 'Reviews figure' },
  { key: 'intro_heading', label: 'Intro heading' },
  { key: 'intro_text', label: 'Intro text' },
  { key: 'about_heading', label: 'About heading' },
  { key: 'about_text', label: 'About text' },
  { key: 'footer_about', label: 'Footer text' }
];

// Admin Content GET
const handleAdminContentGet = async (req: Request, res: Response) => {
  const type = (req.query.type as string) || 'settings';
  const action = (req.query.action as string) || '';
  const id = parseInt(req.query.id as string) || 0;

  if (type === 'settings') {
    return res.render('admin/settings', {
      admin_title: 'Site settings',
      admin_page: 'settings',
      admin_user: (req.session as any).admin,
      setting_fields: settingFields,
      settings: db.getAllSettings()
    });
  }

  if (type === 'enquiries') {
    return res.render('admin/enquiries', {
      admin_title: 'Enquiries',
      admin_page: 'enquiries',
      admin_user: (req.session as any).admin,
      enquiries: db.enquiries
    });
  }

  const config = contentTypes[type];
  if (!config) {
    return res.redirect('/admin/index.php');
  }

  // Handle direct deletion via GET if requested
  if (action === 'delete' && id) {
    await db.delete(type, id);
    (req.session as any).flash_message = 'Item deleted successfully.';
    return res.redirect(`/admin/content.php?type=${type}`);
  }

  if (action === 'edit' || action === 'new') {
    const item = id ? db.findOne(type, id) : null;
    return res.render('admin/content_edit', {
      admin_title: config.label,
      admin_page: type,
      admin_user: (req.session as any).admin,
      type,
      config,
      id,
      item,
      allPages: db.pages
    });
  }

  const rows = db.getTable(type) || [];
  res.render('admin/content_list', {
    admin_title: config.label,
    admin_page: type,
    admin_user: (req.session as any).admin,
    type,
    config,
    rows,
    allPages: db.pages
  });
};
app.get('/admin/content', requireAdmin, handleAdminContentGet);
app.get('/admin/content.php', requireAdmin, handleAdminContentGet);

// Admin Content POST
const handleAdminContentPost = async (req: Request, res: Response) => {
  const type = (req.query.type as string) || (req.body.type as string) || 'settings';
  const action = req.body.action || (req.query.action as string) || '';

  const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
  const getUploadedFile = (fieldName?: string): Express.Multer.File | null => {
    if (!files || files.length === 0) return null;
    if (fieldName) {
      return files.find(f => f.fieldname === fieldName) || null;
    }
    return files[0] || null;
  };

  if (type === 'settings') {
    const newSettings = req.body.settings || {};
    for (const [key, value] of Object.entries(newSettings)) {
      if (value !== undefined) {
        await db.setSetting(key, String(value).trim());
      }
    }

    // Check for uploaded site logo file
    const siteLogoFile = getUploadedFile('site_logo');
    if (siteLogoFile) {
      await db.setSetting('site_logo', '/uploads/' + siteLogoFile.filename);
    } else if (req.body.remove_site_logo === '1') {
      await db.setSetting('site_logo', '');
    }

    // Check for uploaded hero overlay background file
    const heroOverlayFile = getUploadedFile('hero_overlay_image');
    if (heroOverlayFile) {
      await db.setSetting('hero_overlay_image', '/uploads/' + heroOverlayFile.filename);
    } else if (req.body.remove_hero_overlay_image === '1') {
      await db.setSetting('hero_overlay_image', '');
    }

    // Check for uploaded brochure file
    const brochureFile = getUploadedFile('brochure_file');
    if (brochureFile) {
      await db.setSetting('brochure_url', '/uploads/' + brochureFile.filename);
    } else if (req.body.remove_brochure_file === '1') {
      await db.setSetting('brochure_url', '');
    }

    (req.session as any).flash_message = 'Settings saved successfully.';
    return res.redirect('/admin/content.php?type=settings');
  }

  if (type === 'enquiries' && action === 'status') {
    const id = parseInt(req.body.id || req.query.id);
    const enquiry = db.findOne('enquiries', id);
    if (enquiry) {
      enquiry.status = req.body.status;
      await db.update('enquiries', id, { status: req.body.status });
    }
    (req.session as any).flash_message = 'Enquiry status updated.';
    return res.redirect('/admin/content.php?type=enquiries');
  }

  const config = contentTypes[type];
  if (!config) {
    return res.redirect('/admin/index.php');
  }

  if (action === 'delete') {
    const id = parseInt(req.body.id || req.query.id as string) || 0;
    if (id) {
      await db.delete(type, id);
      (req.session as any).flash_message = 'Item deleted successfully.';
    }
    return res.redirect(`/admin/content.php?type=${type}`);
  }

  if (action === 'save') {
    const id = parseInt(req.body.id) || 0;
    const data: Record<string, any> = {};

    for (const field of Object.keys(config.fields)) {
      if (field === 'is_active') {
        data[field] = req.body[field] ? 1 : 0;
      } else if (field === 'sort_order') {
        data[field] = parseInt(req.body[field]) || 0;
      } else if (field === 'parent_page_id') {
        data[field] = parseInt(req.body[field]) || 0;
      } else {
        data[field] = req.body[field] !== undefined ? String(req.body[field]).trim() : '';
      }
    }

    if (type === 'articles') {
      data.slug = slugify(data.title || 'article');
      data.published_at = data.published_at || new Date().toISOString();
    }

    if (type === 'pages') {
      data.slug = slugify(data.title || 'page');
      data.parent_page_id = parseInt(req.body.parent_page_id) || 0;
    }

    // Handle file upload if present
    const uploadedImage = getUploadedFile('image') || getUploadedFile('image_path') || getUploadedFile();
    if (uploadedImage) {
      data.image_path = '/uploads/' + uploadedImage.filename;
    }

    if (id) {
      await db.update(type, id, data);
      (req.session as any).flash_message = 'Changes saved.';
    } else {
      await db.insert(type, data);
      (req.session as any).flash_message = 'New item created.';
    }

    return res.redirect(`/admin/content.php?type=${type}`);
  }

  res.redirect(`/admin/content.php?type=${type}`);
};

app.post('/admin/content', requireAdmin, upload.any(), handleAdminContentPost);
app.post('/admin/content.php', requireAdmin, upload.any(), handleAdminContentPost);

// Fallback 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).render('page', {
    page_title: 'Page Not Found',
    current: '',
    page: {
      title: '404 - Page Not Found',
      content: '<p>The page you requested could not be found. Return to <a href="/">home</a>.</p>',
      image_path: null
    }
  });
});

export async function startServer() {
  await db.init();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Compass Legal CMS server running on port ${PORT}`);
  });
}

// In standard standalone environment (Docker, Cloud Run, Local), start the HTTP server
if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app };
export default app;
