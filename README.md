# PEJA VENTURES NIG. — Official Corporate Digital Platform

> **"Building Tomorrow. Delivering Today."**

A premium, cinematic corporate web platform for **PEJA VENTURES NIG.**, a diversified Nigerian conglomerate with established market leadership across five business divisions:

1. **Peja Cleaning Solutions**: Industrial-grade surface hygiene formulations, chemical supply, facility maintenance, and professional staff training.
2. **Peja Logistics**: Interstate charter haulage, commercial fleet services, and structured hire-purchase solutions.
3. **Peja Agro Products**: Premium farmgate cold-pressed palm oil, virgin coconut oil, and authentic kuli-kuli derivatives.
4. **Peja Interiors**: Architectural surface finishing, corporate fit-outs, spatial transformations, and material procurement.
5. **Peja Clothings**: Bespoke executive tailoring, corporate uniform production, and curated apparel lines.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Turbopack, Partial Prefetching, Static Page Generation)
- **Language**: TypeScript (Strict typing across company data, divisions, and API boundaries)
- **Styling**: Tailwind CSS v4 & Vanilla CSS design system tokens (Obsidian, Brand Gold `#D4AF37`, Emerald `#10B981`)
- **Icons**: Lucide React
- **Validation**: Zod schema validation (shared client & server validation)
- **Email Delivery**: Nodemailer transactional transport
- **SEO & Social**: Automated XML Sitemap (`/sitemap.xml`), Robots (`/robots.txt`), OpenGraph, and Twitter Cards

---

## 📂 Project Structure

```
peja-app/
├── app/
│   ├── layout.tsx                     # Root Layout (Glassmorphism Nav, Footer, Floating WhatsApp)
│   ├── page.tsx                       # Cinematic Homepage (Hero, Narrative, Divisions, CTA)
│   ├── about/page.tsx                 # Corporate Profile, Mission, Vision, 4 Pillars, Milestones
│   ├── businesses/
│   │   ├── page.tsx                   # Multi-Division Portfolio Hub
│   │   └── [slug]/page.tsx            # Dynamic Division Detail Pages (Products, Services, CTAs)
│   ├── projects/page.tsx              # Operations Showcase & Verified Delivery Gallery
│   ├── contact/page.tsx               # Interactive Contact Hub & Sidebar
│   ├── api/contact/route.ts           # Zod-validated transactional email endpoint
│   ├── sitemap.ts                     # Dynamic XML sitemap generator
│   └── robots.ts                      # Search engine crawl directives
├── components/
│   ├── forms/
│   │   └── ContactForm.tsx            # Accessible, client-validated interactive contact form
│   ├── home/
│   │   ├── HeroSection.tsx            # Headline typography, CTA buttons, metrics
│   │   ├── CompanyIntro.tsx           # Institutional narrative & 4 strategic pillars
│   │   ├── DivisionShowcase.tsx       # Interactive division carousel & highlights
│   │   └── ContactCta.tsx             # Conversion strip
│   └── layout/
│       ├── Navbar.tsx                 # Sticky glassmorphism header & mobile drawer
│       └── Footer.tsx                 # Comprehensive corporate footer & social links
├── data/
│   ├── company.ts                     # Corporate metadata, contacts, social channels
│   └── divisions.ts                   # Central typed source of truth for all 5 business divisions
├── lib/
│   ├── email.ts                       # Nodemailer transport utility
│   └── validation.ts                  # Zod validation schema for contact submissions
└── public/
    ├── brand/                         # Official PEJA VENTURES & division logos
    └── divisions/                     # Authentic product catalog and division photography
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v20+` or `v22+`
- npm `v10+`

### Installation & Development

```bash
cd peja-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the platform.

### Production Build

```bash
cd peja-app
npm run build
npm run start
```
