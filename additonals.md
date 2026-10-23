# PEJA Ventures NIG — Implementation & Additional Features

This document outlines the core architecture, components, and enhancements implemented for the PEJA Ventures website.

## 1. Design System & Theming
- **Colors**:
  - Primary Dark Green: `#1a3a2a` / `#132b1e`
  - Accent Gold: `#c9a84c` / `#e2c97e`
  - Neutral Cream: `#f5f0e8` / `#faf7f2`
  - High Contrast Dark: `#0d1f15`
- **Typography**:
  - Headlines: `Cormorant Garamond` (editorial serif)
  - Body & UI: `Inter` (sans-serif)
- **Visual Effects**:
  - Glassmorphic navigation bar on scroll
  - Ken Burns slow cinematic image zoom
  - Smooth crossfade transitions between slide layers

## 2. Key Modules & Components
- **Navbar**: Sticky navigation with scroll-sensitive blur, dynamic mobile slide-out drawer, and "Let's Talk" CTA.
- **Hero Slideshow**:
  - 5 high-resolution photography slides (`hero1.png` - `hero5.jpeg`)
  - 6-second auto-rotation with real-time linear progress bar
  - Vertical dot indicator rail with active/hover labels
  - Prev/Next arrow navigation and counter (`01 / 05`)
  - Full mobile responsiveness with horizontal dot layout
- **Businesses (Subsidiaries)**:
  - PEJA Cleaning, PEJA Agriculture, PEJA Logistics, PEJA Clothing
  - Interactive cards with imagery, tags, and detail drawers
- **Our Approach**:
  - Conglomerate philosophy, core pillars, and group impact metrics
- **Contact**:
  - Inquiry form with business unit selector and direct contact details
- **Footer**:
  - Group links, legal disclosures, and newsletter subscription

## 3. Brand Assets
- Vector SVG favicon and brand icons in `app/icon.svg` and `public/favicon.svg`.
