# DESIGNS.md — Approved Bibo Designs

This file tracks all approved screen designs with mockup paths and key specs.

## Design System
- **Background**: `linear-gradient(135deg, #fef9f5 0%, #f8f4f0 100%)`
- **Wine-red gradient**: `linear-gradient(135deg, #722F37 0%, #944654 100%)`
- **Cards**: white bg, border `rgba(228, 213, 203, 0.15)`, shadow `0 4px 16px rgba(114, 47, 55, 0.06)`
- **Card radius**: 16-24px
- **Typography**: SF Pro / -apple-system, bold 700-800, tight letter-spacing
- **Viewport**: 390×844px (iPhone)

## Approved Screens

### Home Screen
**Mockup**: `mockup-home-v2.png`
**Status**: ✅ Approved
**Key elements**:
- Centered "Bibo" title (gradient)
- Profile icon top-right
- Stats card (bottles/lots/ready)
- Quick actions (vertical stack)
- Ready Tonight suggestions
- Tab bar (4 tabs)

### Inventory List
**Mockup**: TBD (needs update)
**Status**: ⚠️ Needs refresh
**Key elements**:
- 72×90px wine images
- Color badges (20px circle, bottom-right)
- Vintage chips
- 18px rounded cards
- Maturity badges (Peak/Ready/Young)

### Wine Detail
**Mockup**: Wine Detail V3
**Status**: ✅ Approved
**Key elements**:
- Hero image with overlaid back button
- Sticky sub-header
- Aging timeline with colored phases
- Expandable FAB + top menu

### Tasting Notes
**Mockup**: TBD
**Status**: ✅ Approved
**Key elements**:
- Score circle (92/100)
- Text box
- Meal suggestions 2×2 grid
- Comments card

### History Tab
**Mockup**: `mockup-history-final.png` (needs confirmation)
**Status**: ⚠️ Needs screenshot from Robin
**Key elements**:
- 4 card states (score+notes, empty, notes only, score only)
- Inline CTAs (⭐ Rate, 📝 Add notes)
- Score picker modal (circular 5-star slider)

### Analytics
**Mockup**: `mockup-analytics-final.png`
**Status**: ✅ Approved
**Key elements**:
- Pastel pie chart (130×130px donut)
- Top 3 lists with progress bars
- "See all ›" links
- All items clickable

### Wishlist
**Mockup**: TBD
**Status**: ✅ Approved
**Key elements**:
- Priority badges (🔥 Must Have / ⭐ Nice / 💭 Someday)
- Budget field
- Notes preview

### Add Wine Flow
**Mockup**: `mockup-add-wine-flow.png`
**Status**: ✅ Approved
**Key elements**:
- Step 1: AI search or manual entry
- Step 2: Details form (wine info + cellar + purchase)

### Consume Wine Flow
**Mockup**: `mockup-consume-flow-step1-v2.png`, `mockup-consume-flow-step2.png`
**Status**: ✅ Implemented
**Key elements**:
- Step 1: Inline search modal
- Step 2: Quantity + rating (10-point scale, not 5-star) + notes
**Note**: Rating uses existing circular slider from History tab (10-point system)

### Profile
**Mockup**: `mockup-profile.png` (updating header)
**Status**: 🔄 In review
**Key elements**:
- Centered "Bibo" title
- User avatar/info
- CSV Import/Export (highlighted)
- Settings sections

---

## To Do
- [ ] Get screenshot of current History tab from Robin
- [ ] Get screenshot of current Inventory list from Robin
- [ ] Update this file after each design approval
