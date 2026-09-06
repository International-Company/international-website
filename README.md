# International — Financial Holding Company | إنترنشونال

موقع شركة قابضة مالية — تصميم Monochrome فاخر مع وضعين Dark/Light ولغتين (عربي RTL / إنجليزي LTR).

Corporate website for a financial holding company — premium monochrome design, dark/light themes, bilingual (Arabic RTL / English LTR).

## التقنيات — Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** + custom design-system CSS variables
- **Framer Motion** — scroll reveals, parallax, micro-interactions
- Custom i18n (`/ar`, `/en`) with full RTL/LTR support

## المميزات — Features

- 🎬 Cinematic preloader, film grain, custom cursor, magnetic buttons
- 💹 Live market ticker + interactive currency converter + gold price cards — **real rates** from [open.er-api.com](https://open.er-api.com) (FX, cached 30 min) and [gold-api.com](https://gold-api.com) (metals, cached 10 min), with graceful fallbacks
- 📜 Pinned scrollytelling services section (desktop) with mobile fallback
- 🌍 Animated global-network canvas (transfer arcs + pulses)
- 🌓 Animated theme switcher with saved preference (localStorage)
- 🤝 Timeline, partners marquee, testimonials, branches, FAQ
- 📱 Fully responsive (desktop / tablet / mobile)
- 🔐 Arabic admin panel (`/admin`): rates, requests, site copy (AR/EN), branches, images, announcement bar
- 📋 Structured service-request form saved to PostgreSQL (Prisma)
- 📊 Google Analytics 4 with WhatsApp-click and request-submitted events

## التشغيل — Getting Started

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /ar
npm run build      # production build
npm start          # serve production build
```

## البنية — Structure

```
src/
├── middleware.ts            # locale redirect (/ → /ar)
├── lib/i18n.ts              # locales, direction helpers
├── dictionaries/            # ar.ts / en.ts — ALL site copy lives here
├── app/
│   ├── globals.css          # design system (colors, components, themes)
│   └── [locale]/
│       ├── layout.tsx       # fonts, theme init, navbar/footer shell
│       ├── page.tsx         # home
│       ├── about/ services/ contact/
└── components/              # Hero, Converter, Ticker, GoldMarkets,
                             # ServicesScrolly, NetworkSection, ...
```

## قبل الإطلاق — Before Going Live (TODO)

- [x] بيانات التواصل الرسمية (هاتف، إيميل، عنوان دير البلح)
- [x] زر واتساب فعّال
- [x] نموذج تواصل يرسل فعليًا (FormSubmit → support@international0.com)
- [x] خريطة Google Maps للمقر
- [x] صفحة الخصوصية والشروط + SEO (sitemap / JSON-LD / OG)
- [ ] استبدال تواريخ الخط الزمني وأسماء الشركاء وآراء العملاء بالحقيقية
- [ ] إضافة أرقام التراخيص الرسمية (صفحة legal + FAQ)
- [ ] تحديث `SITE_URL` في `src/lib/site.ts` عند اعتماد الدومين النهائي

## لوحة التحكم — Admin panel

`/admin` — لوحة تشغيلية بالعربية (محمية بكلمة مرور) تتيح:

| القسم | ماذا تتحكم به |
|---|---|
| **نظرة عامة** | ملخّص الطلبات الجديدة وطلبات اليوم، رسم بياني لآخر 14 يومًا، والخدمات الأكثر طلبًا |
| **أسعار الشركة** | سعر الشراء/البيع لكل عملة وللذهب (عيار 24/21/18)، وتفعيل أو إخفاء أي بند — تظهر فورًا في `/ar/rates` |
| **الطلبات** | كل طلبات نموذج `/ar/request` مع بحث وفلترة حسب الحالة والخدمة، تصدير CSV، وزر واتساب لكل عميل |
| **محتوى الموقع** | نصوص الهيرو وقسم العرض والأرقام ومن نحن والخدمات وآراء العملاء والأسئلة الشائعة والتذييل — بالعربية والإنجليزية |
| **الفروع والتواصل** | إضافة وحذف الفروع، وأرقام الهاتف والواتساب والبريد المستخدمة في كل أنحاء الموقع |
| **الصور** | استبدال الشعار وصورة الواجهة وصور الخدمات وصورة المشاركة الاجتماعية |
| **الإعدادات** | شريط الإعلانات الذي يظهر أعلى كل صفحة (نص عربي/إنجليزي، رابط، لون) |

### كيف يعمل تعديل المحتوى

النصوص في `src/dictionaries/` تبقى المرجع الأصلي. اللوحة تحفظ **فرقًا** فقط بما عدّلته،
ويُدمج فوق النصوص الأصلية عند العرض. لذلك:

- أي نص لم تلمسه يبقى كما كتبه المطوّر، وأي نص جديد يضيفه المطوّر يظهر فورًا
- زر **«استعادة النصوص الأصلية»** يمسح تعديلات لغة واحدة ويعيدها لأصلها
- الصور المرفوعة تُحفظ في قاعدة البيانات، فتبقى بعد كل إعادة نشر

### الإعداد على Railway (مرة واحدة)

1. في مشروع Railway: **New → Database → Add PostgreSQL**
2. افتح خدمة الموقع → **Variables** وأضف:

   | المتغير | القيمة |
   |---|---|
   | `DATABASE_URL` | اربطها بمتغير `DATABASE_URL` الخاص بخدمة PostgreSQL |
   | `ADMIN_PASSWORD` | كلمة مرور قوية تدخل بها للوحة |
   | `AUTH_SECRET` | نص عشوائي طويل (32 حرفًا فأكثر) |
   | `NEXT_PUBLIC_SITE_URL` | رابط الموقع النهائي |
   | `NEXT_PUBLIC_GA_ID` | معرّف Google Analytics (اختياري) |

3. أعد النشر — `prisma migrate deploy` ينشئ الجداول تلقائيًا عند الإقلاع
4. افتح `/admin` → أدخل كلمة المرور → **إنشاء قائمة الأسعار** ثم عدّل أسعارك

> الموقع لا يتعطل إن غابت قاعدة البيانات: صفحة الأسعار تعرض قيمًا افتراضية والطلبات تُسجَّل في السجلات.

## النشر — Deployment

الأسهل: [Vercel](https://vercel.com) — اربط مستودع GitHub وسيُنشر تلقائيًا.

```bash
git init
git add .
git commit -m "Initial commit: International Financial Holding website"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```
