# Design Guidelines for "Unsaid Thoughts"

## Design Approach
**Reference-Based Minimalism**: Drawing inspiration from Medium's reading experience, Linear's typography-first approach, and Apple's restraint. The design preserves the contemplative, distraction-free philosophy while enhancing usability and visual hierarchy.

**Core Principle**: Every element serves the content. No decorative flourishes, no engagement hooks. Clarity through simplicity.

---

## Typography System

**Font Families** (Google Fonts):
- **Primary**: "Inter" (400, 500, 600) for UI elements, labels, navigation
- **Reading**: "Merriweather" or "Lora" (400, 600) for thought content and body text
- **Accent**: "JetBrains Mono" (400) for tags, metadata, stats

**Hierarchy**:
- **Hero Headlines**: 4xl to 6xl, tracking-tight, font-semibold
- **Thought Titles**: 3xl to 4xl, leading-tight
- **Section Headers**: 2xl, font-medium
- **Body Text**: lg (18-20px), leading-relaxed (1.75-1.8) for optimal reading
- **Metadata**: sm to base, uppercase tracking for tags
- **UI Labels**: base, font-medium

---

## Layout System

**Spacing Units**: Tailwind scale of **4, 6, 8, 12, 16, 24** for consistency
- Tight spacing: p-4, gap-4
- Standard spacing: p-8, gap-8, my-12
- Generous spacing: py-16, py-24 between major sections

**Container Strategy**:
- **Reading Content**: max-w-2xl (optimal line length ~65-75 characters)
- **Thought Lists**: max-w-4xl
- **General Layouts**: max-w-6xl
- All containers: mx-auto px-6 md:px-8

**Grid Usage**:
- **Thought Cards**: Single column on mobile, 2-column on md:, max 3-column on xl:
- **Tag Clouds**: flex-wrap with gap-2 for organic flow
- **Dashboard Stats**: 3-column grid for metrics

---

## Component Library

### Navigation
- **Header**: Sticky top bar, backdrop-blur-md, minimal height (h-16)
- **Logo/Title**: Left-aligned, simple wordmark, no graphic
- **Nav Links**: Right-aligned, subtle underline on hover, 4-6 max items
- **Mobile**: Slide-in drawer from right, full-screen overlay

### Thought Cards
- **Structure**: Vertical card, no border, subtle hover lift (scale-[1.01])
- **Content Order**: Date/read time → Title (large, bold) → Excerpt (2-3 lines) → Tags (bottom)
- **Padding**: p-6 to p-8
- **Background**: Subtle contrast from page background

### Thought Detail Page
- **Hero**: Minimal - just title, metadata (date, read time, author), tags
- **Content**: Wide margins, generous line-height, max-w-2xl
- **Related**: "More Thoughts" section at bottom, 2-3 cards

### Tags
- **Style**: Pill-shaped (rounded-full), px-3 py-1, text-xs uppercase tracking-wide
- **Interactive**: Clickable, subtle hover state (slight opacity shift)
- **Display**: Inline-flex with gap-2, wrap naturally

### Forms (Auth, Thought Creation)
- **Layout**: Centered card, max-w-md for auth, max-w-3xl for editor
- **Inputs**: Full-width, py-3 px-4, simple border, focus ring
- **Buttons**: Solid primary, py-3 px-6, rounded-lg, font-medium
- **Rich Editor**: Full-width, min-height 400px, toolbar at top

### Dashboard/Admin
- **Stats Cards**: Grid layout (3-col), centered numbers (large), small labels
- **Tables**: Clean borders, alternating row backgrounds, sortable headers
- **Sidebar**: Left navigation, 240px width, collapsible on mobile

### Authentication UI
- **Login/Register**: Centered card (max-w-md), logo at top, form fields, "or" divider
- **Social**: Not required (email-only is fine for this aesthetic)

---

## Page Layouts

### Homepage
- **Hero**: Text-focused, large headline ("A digital space for thoughts..."), subheading, minimal CTA
- **Recent Thoughts**: 2-3 featured cards in grid
- **About Section**: Single column prose, max-w-2xl, centered
- **Stats Bar**: Small footer-like section with counts

### Thoughts Archive
- **Filter Bar**: Tags as pills, search input (optional)
- **Grid**: Masonry or equal-height cards, 2-3 columns
- **Pagination**: Simple numbered links, centered

### Individual Thought
- **Width**: Narrow, reading-optimized (max-w-2xl)
- **Spacing**: Generous top/bottom padding (py-16)
- **Footer**: Author info, share options (subtle), related thoughts

### Dashboard
- **Two-column**: Sidebar + main content area
- **Cards**: Stats overview at top, recent activity list below
- **Actions**: Floating "New Thought" button (bottom-right)

---

## Interactive Elements

**Buttons**:
- **Primary**: Solid background, px-6 py-3, rounded-lg, font-medium
- **Secondary**: Border only, same padding
- **Text**: No background, underline on hover

**Hover States**:
- Cards: Subtle lift (translateY(-2px)) + shadow
- Links: Underline appear/thicken
- Buttons: Slight opacity shift (0.9)

**Loading States**:
- Skeleton screens for thought cards (pulsing rectangles)
- Spinner for form submissions (small, centered)

---

## Theme Toggle
- **Light Mode**: Default, clean white/light gray backgrounds
- **Dark Mode**: True black or very dark gray, high contrast for text
- **Toggle**: Small icon button in header, smooth transition (duration-200)

---

## Images

**Hero Image**: Not required for homepage (text-focused hero is more aligned with the minimalist aesthetic)

**Thought Thumbnails**: Optional, user-uploaded feature images
- **Placement**: Top of thought card, aspect-ratio-video (16:9)
- **Size**: Full card width, object-cover
- **Fallback**: Elegant gradient or solid background if no image

**Profile Avatars**: Small circles (w-8 h-8) next to author names

---

## Key Design Decisions

1. **No hero image on homepage** - keeps focus on the written message
2. **Maximum 3-column grids** - maintains readability, avoids overwhelming layout
3. **Generous whitespace** - every section breathes, py-16 to py-24 standard
4. **Typography contrast** - serif for reading, sans-serif for UI creates clear separation
5. **Minimal animations** - only on hover/interactive states, nothing distracting
6. **Monochrome-first** - rely on typography and spacing over color variety