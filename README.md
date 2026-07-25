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
