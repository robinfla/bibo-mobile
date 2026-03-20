# Comprehensive Tasting Sheet — Complete Design Spec

**Status:** Robin Approved ✅  
**Designer:** Johnny  
**Ready for:** Gilfoyle (implementation)

---

## Overview

Full tasting review form for detailed wine assessment. Entry points:
- Scan flow → "Comprehensive Tasting Review"
- Wine detail page menu → "Add Tasting"
- History tab → "+ Add Tasting" button

---

## Screen Flow

1. **Wine Info + Action Buttons**
2. **Visual Assessment**
3. **Nose**
4. **Palate**
5. **Context**
6. **Notes + Photos**
7. **Aroma Wheel Modal** (opens from Nose/Palate sections)

---

## Screen 1: Wine Info Card + Action Buttons

### Wine Info Card

**Layout:** Horizontal split

**Left side (90px width):**
- Wine bottle image (90×120px)
- Rounded corners (8px)
- Shadow: `0 4px 12px rgba(0, 0, 0, 0.1)`
- Background: `#f8f4f0`

**Right side (flexible):**
- Wine name + vintage inline: "Château Margaux 2019"
  - Font: 18px, weight 700, color `#722F37`
  - Vintage: weight 600, color `rgba(45, 45, 45, 0.6)`
- Producer below: "Château Margaux"
  - Font: 14px, color `rgba(45, 45, 45, 0.5)`
- "Change wine" link at bottom
  - Font: 12px, color `#722F37`, underlined

**Card styling:**
- Background: white
- Border radius: 20px
- Padding: 20px
- Border: 1px `rgba(228, 213, 203, 0.3)`
- Shadow: `0 4px 16px rgba(114, 47, 55, 0.08)`

### Action Buttons

**Two equal-width buttons:**

**Rating Button (left):**
- Icon: ⭐ (20px)
- Label: "RATING" (12px, uppercase)
- Value: "85/100" (18px weight 700, bordeaux gradient)
- Tap → opens rating picker (0-100 slider)

**Actions Button (right):**
- Icon: ••• (20px)
- Text: "Actions" (14px, weight 600, `#722F37`)
- Tap → bottom sheet: Add to Cellar / Add to Wishlist

---

## Screen 2: Visual Assessment

### Color Gradient Picker

**Gradient Bar:**
- Height: 48px, border radius: 24px
- Gradient: `#fef9c3` → `#7f1d1d` (8 stops)
- Draggable white selector (36×36px)

**Color mapping:**
- 0-14%: Pale Yellow
- 14-28%: Lemon Yellow
- 28-42%: Gold
- 42-57%: Amber
- 57-71%: Copper
- 71-85%: Ruby
- 85-100%: Garnet

### Sliders

| Slider | Range | Default |
|--------|-------|---------|
| Intensity | Pale → Deep | 60% |
| Clarity | Cloudy → Brilliant | 80% |
| Viscosity | Watery → Syrupy | 50% |

---

## Screen 3: Nose

### Sliders
- Intensity: Light → Pronounced (65%)
- Development: Simple → Complex (30%)

### Aroma Selection
- "Add Aromas" button → opens aroma wheel modal
- Selected aromas as bordeaux chips with × remove

---

## Screen 4: Palate

### Sliders (6 total)

| Slider | Range | Default |
|--------|-------|---------|
| Sweetness | Dry → Sweet | 10% |
| Acidity | Low → High | 65% |
| Tannin | Low → High | 50% |
| Body | Light → Full | 80% |
| Alcohol | <11% → >15% | 55% |
| Finish | Short → Very Long | 75% |

### Flavor Notes
- "Add Flavor Notes" button (bordeaux gradient)
- Opens same aroma wheel

---

## Screen 5: Context

### Context Rows
- 👥 People: "Add tasting companions"
- 📍 Place: "Château Margaux"
- 🍽️ Meal: "Grilled ribeye steak"

### Serving Conditions (2-column grid)
- 🌡️ Temperature: "16°C"
- 🍷 Decanted: "45 min"

---

## Screen 6: Notes + Photos

### Additional Notes
- Textarea, min height 120px
- Placeholder: "Write your tasting impressions..."

### Photos
- "Add Photos" button with camera icon
- Grid display after upload

---

## Screen 7: Aroma Wheel Modal

### Structure (SVG 350×350px)
- **Outer ring:** Specific aromas (15+ per category)
- **Middle ring:** Category labels
- **Center circle:** Selected aroma display

### Categories + Colors

| Category | Color | Aromas |
|----------|-------|--------|
| Fruity | `#dc2626` | Blackcurrant, Cherry, Plum, Raspberry, Strawberry |
| Spicy | `#f59e0b` | Black Pepper, Cinnamon, Clove, Nutmeg |
| Oak | `#92400e` | Vanilla, Toast, Cedar, Smoke, Coffee |
| Earthy | `#065f46` | Mushroom, Truffle, Wet Leaves, Forest Floor |
| Vegetal | `#84cc16` | Bell Pepper, Eucalyptus, Mint, Grass |
| Floral | `#ec4899` | Violet, Rose, Jasmine, Elderflower |

### Bottom Sheet
- Selected aromas with remove buttons
- "Done" saves and closes

---

## Data Schema

```typescript
interface Tasting {
  tastingId: string
  wineId: string
  userId: string
  rating: number  // 0-100
  vintage: number | null
  
  visual: {
    color: string
    colorPosition: number
    intensity: string
    intensityValue: number
    clarity: string
    clarityValue: number
    viscosity: string
    viscosityValue: number
  }
  
  nose: {
    intensity: string
    intensityValue: number
    development: string
    developmentValue: number
    aromas: string[]
  }
  
  palate: {
    sweetness: string
    sweetnessValue: number
    acidity: string
    acidityValue: number
    tannin: string
    tanninValue: number
    body: string
    bodyValue: number
    alcohol: number
    alcoholValue: number
    finish: string
    finishValue: number
    flavors: string[]
  }
  
  context: {
    people: string[]
    place: string | null
    meal: string | null
    temperature: number | null
    decantedMinutes: number | null
  }
  
  notes: string | null
  photos: string[]
  createdAt: string
  updatedAt: string
}
```

---

## API Endpoints

```
POST   /api/tastings          Create tasting
GET    /api/tastings/:id      Get tasting
PUT    /api/tastings/:id      Update tasting
DELETE /api/tastings/:id      Delete tasting
GET    /api/wines/:id/tastings  List tastings for wine
```

---

## Mockup Files

Located at `~/.openclaw/workspace-johnny/`:

- `tasting-screen-v8.png` — Wine info + action buttons
- `tasting-screen-2.png` — Nose + Palate
- `tasting-screen-3.png` — Context + Notes + Photos
- `aroma-wheel-v2.png` — Aroma wheel modal

---

## Design Tokens

**Colors:**
- Bordeaux gradient: `linear-gradient(135deg, #722F37, #944654)`
- Background: `#fef9f5`
- Wine color gradient: 8 stops from `#fef9c3` to `#7f1d1d`

**Typography:**
- Wine name: 18px, weight 700, `#722F37`
- Section titles: 18px, weight 700
- Labels: 14px, weight 600
- Body: 15px

**Spacing:**
- Card padding: 20px
- Section margin: 16-20px
- Gap: 8-16px

**Border Radius:**
- Cards: 20px
- Buttons: 14-16px
- Chips: 16-20px

**Shadows:**
- Cards: `0 4px 16px rgba(114, 47, 55, 0.08)`
- Buttons: `0 2px 8px rgba(114, 47, 55, 0.06)`
- CTA: `0 4px 12px rgba(114, 47, 55, 0.3)`
