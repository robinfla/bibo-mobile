# DESIGN.md — Bibo Wine Cellar

> **Single source of truth for the app's design system.**
> Last updated: 2026-03-20

---

## Brand Identity

**Bibo** is a personal wine cellar management app with an AI sommelier. The design feels warm, premium, and approachable — like a knowledgeable friend who loves wine, not a stuffy sommelier in a Michelin restaurant.

**Tagline:** Your personal wine companion.

### Design Principles

1. **Warm over clinical** — Creams, corals, soft gradients, and organic shapes. Never cold blues or stark whites.
2. **Premium but accessible** — Feels high-end but never intimidating. Wine is for everyone.
3. **Content-first** — Wine details, tasting notes, and imagery take center stage. UI chrome stays minimal.
4. **Conversational** — The sommelier is a chat-based experience. The UI should feel like texting a friend who knows wine.
5. **Tactile** — Cards feel like real objects with subtle shadows. Interactions have gentle feedback.

---

## Color Palette

### Core 5 Colors (DEFINITIVE)

| Token | Hex | Name | Usage |
|-------|-----|------|-------|
| `coral` | `#F28482` | Light Coral | **Primary** — buttons, active tab, profile avatar, scan button, CTA accents |
| `honey` | `#F6BD60` | Honey Bronze | **Secondary** — gradients, highlights, icons, warm accents |
| `linen` | `#F7EDE2` | Linen | **Background** — page backgrounds, surfaces |
| `rose` | `#F5CAC3` | Cotton Rose | **Soft accent** — subtle highlights, badges, muted surfaces |
| `teal` | `#84A59D` | Muted Teal | **Tertiary** — status indicators, success states, balance color |

### Derived Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `coral-dark` | `#e85d75` | Icon foreground on coral backgrounds |
| `coral-shadow` | `rgba(242, 132, 130, 0.4)` | Shadow for coral elements |
| `coral-light` | `#f28482/20` (20% opacity) | Icon circle backgrounds |
| `honey-dark` | `#d48c00` | Icon foreground on honey backgrounds |
| `honey-light` | `#f6bd60/20` (20% opacity) | Icon circle backgrounds |
| `text-primary` | `#111827` | Headings, primary content (gray-900) |
| `text-secondary` | `#6b7280` | Subtext, metadata (gray-500) |
| `text-tertiary` | `#9ca3af` | Inactive tabs, placeholders (gray-400) |
| `text-inverse` | `#FFFFFF` | Text on dark/gradient backgrounds |
| `surface` | `#FFFFFF` | Card backgrounds |
| `border-subtle` | `rgba(249, 250, 251, 0.5)` | Card borders (gray-50/50) |

### Gradient: Stats Card (Coral → Gold)
```
background: linear-gradient(to bottom-right, #f28482, #f6bd60)
shadow: 0 8px 20px -6px rgba(242, 132, 130, 0.4)
```

### Status / Maturity Colors
| Status | Color | Background | Usage |
|--------|-------|------------|-------|
| Peak / Ready | `#84A59D` (teal) | `#84A59D/15` | Peak wines, positive |
| Approaching | `#F6BD60` (honey) | `#F6BD60/15` | Approaching maturity |
| Young / To Age | `#5B8DBE` | `#5B8DBE/15` | Young wines |
| Past Prime | `#F28482` (coral) | `#F28482/15` | Past prime, declining |

### Wine Type Colors
| Wine | Hex |
|------|-----|
| Red | `#F28482` (coral) |
| White | `#F6BD60` (honey) |
| Rosé | `#F5CAC3` (rose) |
| Sparkling | `#F6BD60` (honey) |
| Dessert | `#d48c00` |
| Fortified | `#84A59D` (teal) |

---

## Typography

### Font Family
**Nunito Sans** — warm, rounded, friendly.

```
fontFamily: 'NunitoSans_400Regular' | 'NunitoSans_600SemiBold' | 'NunitoSans_700Bold' | 'NunitoSans_800ExtraBold'
```

> **All screens must use Nunito Sans.** No system font, no Inter, no DM Sans. Install `@expo-google-fonts/nunito-sans` if not already present.

### Scale
| Element | Size | Weight | Letter Spacing | Usage |
|---------|------|--------|----------------|-------|
| Hero greeting | 38px | 800 (ExtraBold) | tight (-0.5px) | Home screen "Hello Robin" |
| Screen title (H1) | 28px | 700 | — | Screen titles |
| Section heading | 22px | 700 | tight (-0.5px) | "Quick Actions", section headers |
| Card title | 16px | 700 | tight | Action card labels, wine names |
| Body large | 17px | 400 | tight | Subtitles, descriptions |
| Body | 15px | 400-500 | — | Standard body text, inputs |
| Body small | 14px | 400-500 | — | Metadata, secondary info |
| Caption | 13px | 400-500 | — | Captions, helper text |
| Badge / Label | 11px | 600 | 0.08em (wide) | Stats labels, uppercase badges |
| Tab label | 10px | 500-700 | — | Bottom tab bar labels |

### Font Weight Usage
| Weight | Token | Usage |
|--------|-------|-------|
| 400 | `NunitoSans_400Regular` | Body text, descriptions, placeholders |
| 500 | `NunitoSans_500Medium` | Secondary labels, inactive tabs |
| 600 | `NunitoSans_600SemiBold` | Labels, buttons, emphasis |
| 700 | `NunitoSans_700Bold` | Headings, CTAs, active tabs, card titles |
| 800 | `NunitoSans_800ExtraBold` | Hero numbers (881), greeting text |

---

## Layout & Spacing

### Viewport Reference
- **Design target:** 400×867px (iPhone 14/15)
- **Safe area top:** ~47px
- **Safe area bottom:** ~34px
- **Tab bar area:** Fixed bottom, 6px from bottom edge

### Spacing
| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tiny gaps |
| `sm` | 8px | Icon-text gaps |
| `md` | 12px | Component gaps |
| `lg` | 16px | Card padding, gaps |
| `xl` | 24px | Screen horizontal padding (px-6) |
| `2xl` | 28px | Major padding (stats card p-7) |
| `3xl` | 32px | Section margins |

### Screen Horizontal Padding
- Standard: `24px` (px-6)
- Header area: `28px` (px-7)

---

## Components

### Stats Card (Home)
```
background: linear-gradient(to-br, #f28482, #f6bd60)
border-radius: 28px
padding: 28px
shadow: 0 8px 20px -6px rgba(242, 132, 130, 0.4)
watermark: Wine icon 220px, white, 20% opacity, mix-blend-overlay
layout: 2-column with white/20 border divider
left: label (11px uppercase white/80) + number (64px extrabold white)
right: label (11px uppercase white/70) + trend badge (white/30 bg, blur, rounded-full)
```

### Action Cards (Home)
```
layout: 2×2 grid, gap 16px
aspect: square
background: #FFFFFF
border-radius: 28px
padding: 16px
border: 1px solid gray-50/50
shadow: 0 2px 12px -4px rgba(0,0,0,0.03)
press: scale(0.96) transition
content: centered, icon circle (52px) + title (16px bold)
```

### Icon Circles (Action Cards)
```
size: 52px round
coral variant: bg #f28482/20, icon color #e85d75
honey variant: bg #f6bd60/20, icon color #d48c00
icon size: 26-28px (Phosphor filled)
```

### Bottom Tab Bar
```
layout: Scan button (separate, left) + Nav pill (flex-1, right)
position: fixed bottom-6, left-4 right-4
gap: 12px between scan and pill

Scan button:
  size: 60×60px
  background: #F28482 (coral)
  border-radius: full (circle)
  icon: CornersOut 28px bold white
  shadow: 0 0 0 rgba(242,132,130,0.4) — shadow-lg
  press: scale(0.90)

Nav pill:
  background: white/95, backdrop-blur-xl
  border-radius: full
  padding: 8px
  shadow: 0 12px 40px -8px rgba(0,0,0,0.08)
  border: 1px solid gray-100/60
  4 tabs: Home | Inventory | Somm | Cellars

Tab (active):
  color: #F28482 (coral)
  icon: filled variant, 22px
  label: 10px bold

Tab (inactive):
  color: #9ca3af (gray-400)
  icon: regular variant, 22px
  label: 10px medium
```

### Profile Avatar (Home)
```
size: 54px
border-radius: full
background: #F28482 (coral)
text: white, bold, 20px, initials (e.g., "RO")
shadow: sm
```

### Search Bar
```
height: 48px
background: #FFFFFF
border: 1px solid linen-dark or gray-200
border-radius: 16px (rounded-2xl)
padding: 12px 16px
icon: MagnifyingGlass 20px, gray-400
focus border: coral/30
focus ring: coral/10
```

### Wine Cards (Inventory)
```
background: #FFFFFF
border-radius: 24px
padding: 14px (p-3.5)
layout: image (100×140px) + info column
border: 1px solid gray-100
shadow: 0 4px 20px -2px rgba(0,0,0,0.04)
decorative: wine-tinted blur blob top-right

Image section:
  size: 100×140px
  border-radius: 16px
  overlay: gradient-to-t from-black/40 via-transparent to-black/10

Info section:
  producer: 10px uppercase, tracking 0.15em, gray-400
  wine name: 20-22px, semibold (consider Nunito Sans 700)
  region: 13px, italic, gray-500, dot-separated from wine color
  status pill: colored bg + border + dot (Ready=green, Young=blue, Approaching=honey)
  vintage chips: scrollable horizontal, active=coral filled, inactive=linen bg
  bottle count: linen bg badge with wine icon
```

### Page Tabs (Inventory: Cellar/Wishlist/History)
```
active: text coral, border-bottom 2px coral, dot indicator
inactive: text gray-400, no border
spacing: gap-8
font: 15px semibold (active) / medium (inactive)
```

### Filter Button
```
size: 48px square
background: #FFFFFF
border: 1px solid gray-200
border-radius: 16px
icon: Faders 20px, gray-600
hover: text coral, border coral/30
```

### Buttons
| Variant | Background | Text | Radius | Shadow |
|---------|-----------|------|--------|--------|
| Primary | `#F28482` (coral) | white | 16px | coral shadow |
| Secondary | `#F7EDE2` (linen) | `#111827` | 16px | subtle |
| Outline | transparent | coral | 16px | — |
| Ghost | transparent | coral | — | — |
| Gradient | coral → honey | white | 16px | coral shadow |
| Destructive | `#ef4444` | white | 12px | — |

**Interaction:** `scale(0.96)` on press, transition-transform

### Chat Bubbles (Sommelier)

**User messages:**
```
background: #F5CAC3 at 30% opacity (rose/30)
border: 1px solid white/50
border-radius: 24px top, 8px bottom-right
text: 15px, dark brown
```

**Assistant messages:**
```
background: white at 45% opacity (frosted glass)
border: 1px solid white/50
border-radius: 24px top, 8px bottom-left
text: 15px
```

**Sommelier theme background:** `#F7EDE2` (linen) or slightly warmer

### Input Fields
```
height: 48px
padding: 12px 16px
border: 1px solid gray-200
border (focus): 2px solid #F28482 (coral)
border (error): 2px solid #ef4444
background: #FFFFFF
border-radius: 16px
font: 15px / 500
placeholder: #9ca3af
```

---

## Iconography

**Library:** Phosphor Icons (`phosphor-react-native`)
- Use **filled** variants for active/selected states
- Use **regular** variants for inactive/default states
- Use **bold** for emphasis (scan icon, trend arrows)

### Icon Sizes
| Context | Size |
|---------|------|
| Tab bar | 22px |
| Action card | 26-28px |
| Inline / body | 18-24px |
| Small / metadata | 16px |
| Watermark | 220px |
| Scan button | 28px |

### Key Icons (Phosphor)
| Screen | Icon |
|--------|------|
| Home tab | `House` (filled when active) |
| Inventory tab | `List` |
| Sommelier tab | `ChatTeardropText` |
| Cellars tab | `HouseLine` |
| Scan button | `CornersOut` (bold) |
| Add Wine | `Wine` (filled) |
| Open Bottle | `Bottle` (filled, -12° rotate) |
| Ask Sommelier | `Cylinder` (filled) |
| Search | `MagnifyingGlass` (bold) |
| Profile | Initials in coral circle |
| Stats watermark | `Wine` (filled) |
| Trend up | `TrendUp` (bold) |
| Filter | `Faders` |

---

## Motion & Interaction

### Durations
| Type | Duration |
|------|----------|
| Instant | 100ms |
| Fast | 200ms |
| Normal | 300ms |
| Slow | 500ms |

### Easing
- Default: `ease-out`
- Spring: `cubic-bezier(0.34, 1.56, 0.64, 1)`

### Interactions
- **Button/card press:** `scale(0.96)` with transition-transform
- **Scan button press:** `scale(0.90)`
- **Tab switch:** fast (200ms)
- **Modal:** slide up from bottom (300ms)
- **Pull to refresh:** native spring

**Performance:** Only animate `transform` and `opacity`.

---

## Navigation Structure

```
App
├── Login Screen
└── Authenticated Tabs
    ├── Home (🏠)
    │   ├── Home Dashboard (greeting + stats + quick actions)
    │   ├── Profile & Settings
    │   ├── Import
    │   ├── Add Wine Flow (Search → Details)
    │   ├── Analytics (+ Detail)
    │   ├── Wine Search (Knowledge Base)
    │   ├── Wine Detail
    │   └── Consume Wine Modal
    ├── Inventory (📋)
    │   ├── Wine List (Cellar tab)
    │   ├── Wishlist Tab
    │   ├── History Tab
    │   ├── Inventory Detail
    │   ├── Wine Detail
    │   └── Filters
    ├── Scan (📷) — Separate button, not in pill
    │   ├── Camera
    │   ├── Processing
    │   ├── Result
    │   └── Tasting Review
    ├── Sommelier (💬)
    │   ├── Chat Interface
    │   ├── Conversation List
    │   ├── Taste Profile
    │   ├── Onboarding
    │   └── Settings
    └── Cellars (🏡)
        ├── Cellars List
        ├── Cellar Locate
        ├── Spaces
        ├── Create Space
        ├── Room/Fridge Setup
        └── Rack View
```

---

## Cellar Rack Visualization

### Hierarchy
Cellar → Space (Room or Fridge) → Walls/Shelves → Racks → Slots

- **Room:** Has walls (left, right, back, front, floor), each holds racks
- **Fridge:** Has shelves with width + depth
- **Rack:** Grid of slots (columns × rows)
- **Slot:** 1 bottle, colored by wine type color from palette above
- **Empty slot:** Dashed border, linen background

---

## Accessibility (WCAG 2.2 AA)

### Contrast Check
```
✅ #111827 on #F7EDE2 = high contrast (passes)
✅ #F28482 on #FFFFFF = needs verification for small text
✅ #6b7280 on #F7EDE2 = ~4.5:1 (passes AA)
⚠️ #9ca3af on #FFFFFF = 2.9:1 (decorative/large only)
```

### Touch Targets
- Minimum: 44×44px
- Tab bar buttons: full width within pill
- Scan button: 60×60px
- Action cards: ~170×170px (aspect-square in 2-col grid)

---

## Platform Notes

- **Framework:** React Native / Expo 54
- **Font package:** `@expo-google-fonts/nunito-sans`
- **Icon library:** `phosphor-react-native` (primary, all screens)
- **Target:** iOS primary, Android secondary

---

## Mockup Files

| File | Screen | Status |
|------|--------|--------|
| `docs/mockups/home-redesign-v3.html` | Home (definitive) | ✅ Approved |
| `docs/mockups/inventory-redesign-v2.html` | Inventory (layout reference) | ✅ Approved (adapt colors) |
| `docs/mockups/sommelier-final.png` | Sommelier | ⚠️ Needs color update |
| `docs/mockups/mockup-add-wine-final.png` | Add Wine | ⚠️ Needs color update |
| `docs/mockups/detail-v5.png` | Wine Detail | ⚠️ Needs color update |

---

## Implementation Priority

1. **Update `src/theme/colors.ts`** — Replace all old tokens with new palette
2. **Install Nunito Sans** — `@expo-google-fonts/nunito-sans`, load in App.tsx
3. **Home Screen** — Match `home-redesign-v3.html` exactly
4. **Tab Bar** — Coral scan button + frosted pill with labels
5. **Inventory Screen** — Match `inventory-redesign-v2.html` layout, adapt to new palette
6. **Sommelier** — Apply linen bg, coral/honey accents
7. **Add Wine** — Apply new palette
8. **All remaining screens** — Cellars, Profile, Analytics, Wine Detail, etc.
