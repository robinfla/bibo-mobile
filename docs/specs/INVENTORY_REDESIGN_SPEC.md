# Inventory List Redesign — Design Specification

## Overview
Complete redesign of the Inventory List screen from small text-heavy rows to large, visual, image-based cards. Focus on making bottles instantly recognizable and showing key decision-making data at a glance.

---

## What Changed

### Before (Old Design)
- Small compact rows (~60px height)
- No images — just colored dots for wine type
- Tiny text showing: name, producer, year, status, quantity
- Felt cramped and hard to scan
- No visual hierarchy

### After (New Design)
- Large visual cards (~180px height)
- **Bottle image** front and center on wine-red gradient
- **Vintage badge** overlaid on image (e.g., "2015 x2")
- Key info clearly separated
- Much easier to scan and recognize bottles

---

## Layout & Components

### Header
```
┌─────────────────────────────────────┐
│  My Wines                       [+] │  ← Title + Add button
│  ┌─────┐ ┌─────┐ ┌─────┐           │
│  │ My  │ │Wish │ │Hist │           │  ← Tab pills
│  │Wines│ │list │ │ory  │           │
│  └─────┘ └─────┘ └─────┘           │
│  🔍 Search for a wine...            │  ← Search bar
└─────────────────────────────────────┘
```

**Components:**
- **Title**: "My Wines" (28px, bold)
- **Add button**: White rounded square with "+" icon
- **Tab pills**: Active tab has wine-red background (#722F37), others white with border
- **Search bar**: White rounded input with magnifying glass icon

---

### Wine Card (Main Component)

```
┌─────────────────────────────────────┐
│ ┌───────────────────────────────┐   │
│ │  2015 x2         [Bottle Img] │   │  ← Image section
│ │                               │   │    Wine-red gradient bg
│ │         🍷                    │   │    Vintage badge overlay
│ └───────────────────────────────┘   │
│                                     │
│ Chateau Jean Faure          🍷 Approaching │  ← Wine info
│ Saint-Émilion Grand Cru              │
│                                     │
│ Purchase: €42.00        +18% 📈     │  ← Value tracking
└─────────────────────────────────────┘
```

#### Image Section (Top)
- **Height**: 140px
- **Background**: Linear gradient (#8B4049 → #722F37)
- **Bottle image**: Centered, ~110px tall, white/translucent with drop shadow
- **Vintage badge**: 
  - Position: Top-left corner
  - Style: Black background (60% opacity), white text
  - Content: "YYYY (xN)" — e.g., "2015 (x2)"
  - Font: 15px, semibold

#### Wine Info Section (Middle)
- **Padding**: 16px
- **Wine name**: 18px, bold, dark gray (#1a1a1a)
- **Region/Appellation**: 14px, medium gray (#666)
- **Status badge**:
  - Float right, aligned with wine name
  - Pill shape with emoji + text
  - Background: Light yellow for "Approaching", light green for "Peak"
  - Examples: "🍷 Approaching", "✨ Peak"

#### Value Row (Bottom)
- **Border top**: 1px light gray divider
- **Left side**: "Purchase: €42.00" (gray text, bold price)
- **Right side**: "+18% 📈" (green text if positive, red if negative)
- **Font**: 13px

---

## Card Interactions

### Tap Behavior
- **Entire card is tappable** → navigates to Wine Detail screen
- **Subtle press state**: Card scales down slightly (0.98) and increases shadow
- **No swipe actions** (for now — could add "Open Bottle" / "Move" later)

### Loading States
- **Skeleton cards**: Gray placeholders with shimmer animation while data loads
- **Pull-to-refresh**: Standard iOS/Android pull gesture

---

## Data Displayed

Each card shows:

| Field | Source | Format |
|-------|--------|--------|
| Bottle Image | `wines.bottle_image_url` or default | PNG/JPG, centered |
| Vintage | `inventoryLots.vintage` | "YYYY" |
| Quantity | `SUM(inventoryLots.quantity)` | "(xN)" |
| Wine Name | `wines.name` | Plain text, 18px bold |
| Region/Appellation | `wines.region` + `wines.appellation` | "Region, Appellation" |
| Maturity Status | `inventoryLots.maturity` | Emoji + text badge |
| Purchase Price | `inventoryLots.purchase_price_per_bottle` | "€XX.XX" |
| Current Value | `wineValuations.price_eur` (latest) | "€XX.XX" |
| Value Change | Calculated: `((current - purchase) / purchase) * 100` | "+/-XX% 📈📉" |

---

## Sorting & Filtering

### Default Sort
- **By maturity urgency**: "Peak" wines first, then "Approaching", then "To Age"
- **Secondary sort**: By value change % (highest ROI first)

### Search
- Filters by: wine name, producer, region, appellation, vintage
- Real-time as user types
- Shows "No results" empty state if nothing matches

### Filter Options (Future)
- By maturity status (Peak, Approaching, To Age, etc.)
- By wine type (Red, White, Rosé, Sparkling)
- By region
- By value change (gainers vs. losers)

---

## Empty States

### No Wines Yet
```
    🍷
    
  No wines in your cellar yet
  
  Tap + to add your first bottle
```

### Search No Results
```
    🔍
    
  No wines match "château"
  
  Try a different search term
```

---

## Design Constants

### Colors
- **Wine red accent**: #722F37
- **Gradient start**: #8B4049
- **Gradient end**: #722F37
- **Background**: #f8f8f8
- **Card background**: white
- **Text primary**: #1a1a1a
- **Text secondary**: #666
- **Text tertiary**: #999
- **Border**: #e8e8e8

### Typography
- **System font**: -apple-system, SF Pro
- **Title**: 28px, 700 weight
- **Wine name**: 18px, 600 weight
- **Body text**: 14-15px, 400-500 weight
- **Small text**: 12-13px

### Spacing
- **Card padding**: 16px (internal), 16px (horizontal margins)
- **Card gap**: 12px vertical between cards
- **Border radius**: 16px for cards, 12px for badges

### Shadows
- **Card**: `0 2px 8px rgba(0,0,0,0.04)`
- **Card pressed**: `0 4px 16px rgba(0,0,0,0.08)`
- **Bottle image**: Drop shadow built into image

---

## Accessibility

- **VoiceOver/TalkBack**: Each card announces: "Wine name, vintage, quantity, maturity status, current value. Double tap to view details."
- **Touch target**: Entire card is 180px tall (well above 44px minimum)
- **Color contrast**: All text meets WCAG AA standards
- **Focus indicators**: Blue outline on keyboard navigation (web/desktop)

---

## Performance Considerations

### Images
- **Lazy load**: Images load as cards scroll into view
- **Placeholder**: Gray rounded rectangle while loading
- **Caching**: Cache bottle images locally after first load
- **Fallback**: If no image, show wine glass icon on gradient

### List Optimization
- **Virtualization**: Only render visible cards + buffer (use FlatList on React Native)
- **Pagination**: Load 20 cards at a time, infinite scroll for more
- **Debounce search**: Wait 300ms after typing stops before filtering

---

## Technical Notes

### API Endpoint
```
GET /api/user/inventory?include=valuations,wines

Response:
[
  {
    wine: { id, name, producer, region, appellation, bottle_image_url },
    vintage: 2015,
    total_quantity: 2,
    maturity: "approaching",
    avg_purchase_price: 42.00,
    current_value: 49.60,
    value_change_percent: 18.1
  },
  ...
]
```

### Component Structure (React Native)
```jsx
<InventoryListScreen>
  <Header>
    <Title />
    <AddButton />
  </Header>
  <Tabs>
    <Tab active>My Wines</Tab>
    <Tab>Wishlist</Tab>
    <Tab>History</Tab>
  </Tabs>
  <SearchBar />
  <FlatList>
    <WineCard onPress={navigateToDetail} />
    <WineCard onPress={navigateToDetail} />
    ...
  </FlatList>
</InventoryListScreen>
```

---

## Next Steps (Post-Launch)

### Enhancements
- [ ] Filter chips (by maturity, type, region)
- [ ] Swipe actions (Open Bottle, Move, Delete)
- [ ] Bulk selection mode (move multiple bottles)
- [ ] Sort options dropdown (by name, value, date added)
- [ ] Grid view toggle (2-column layout for tablets)

### Analytics to Track
- Card tap rate (are users exploring details?)
- Search usage (what are they searching for?)
- Most viewed wines (which bottles get the most attention?)

---

## Design Files

- Mockup: `/home/robin/.openclaw/workspace-bibo-designer/inventory-v3.png`
- HTML prototype: `/tmp/mockup-inventory-v3.html`
- Screenshot timestamp: 2026-02-26

---

**Approved by**: Robin Flamant  
**Designed by**: Bibo Designer (Johnny)  
**Date**: February 26, 2026
