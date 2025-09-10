# Olympay Landing Page

A modern, responsive landing page for Olympay built with Next.js, TypeScript, Tailwind CSS, and DaisyUI.

## Features

- **Dark Theme**: Custom dark theme with Olympay brand colors
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Modern UI**: Clean, professional design with smooth animations
- **Component-Based**: Modular React components for maintainability
- **TypeScript**: Full type safety throughout the application

## Design Elements

### Header
- Dark-themed navbar with Olympay logo
- Navigation links: StableCoin, On/Off Ramp, CCIP, RWA, Earning
- Green "Launch App" button
- Mobile-responsive hamburger menu

### Hero Section
- Large, bold headline with color-coded text
- Descriptive subheading
- Three action buttons with hover effects
- Centered layout with gradient background

### Features Section
- Five feature cards with icons from Heroicons
- Hover animations and shadow effects
- Responsive grid layout
- Consistent styling with DaisyUI components

### Footer
- Company information and links
- Quick links and product navigation
- Copyright and legal links

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **DaisyUI**: Component library for Tailwind CSS
- **Heroicons**: Beautiful SVG icons

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles and Tailwind imports
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Main landing page
├── components/
│   ├── Header.tsx       # Navigation header
│   ├── Hero.tsx         # Hero section
│   ├── Features.tsx     # Features section
│   └── Footer.tsx       # Footer component
```

## Customization

### Colors
The color scheme is defined in `tailwind.config.js`:
- Primary: `#00FF88` (Green)
- Secondary: `#00FFFF` (Cyan)
- Base: `#1A1F2E` (Dark blue)

### Components
Each component is self-contained and can be easily modified:
- Update text content in component files
- Modify styling using Tailwind classes
- Add new features by creating additional components

## Performance

- Optimized for Core Web Vitals
- Responsive images and lazy loading
- Minimal bundle size with tree shaking
- Fast loading with Next.js optimizations

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Progressive enhancement for older browsers
