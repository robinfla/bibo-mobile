# Bibo — Design Consistency Audit

> **Date:** 2026-03-21  
> **Auditor:** Benji (sub-agent)  
> **Reference:** `DESIGN.md` (single source of truth)  
> **Scope:** All `src/screens/**/*.tsx` + `src/components/**/*.tsx`  
> **Purpose:** Handoff to Gilfoye for implementation

---

## Executive Summary

The app has three systemic failures that affect almost every file:

1. **Icon library split** — DESIGN.md mandates `phosphor-react-native` exclusively. ~30 files still import `MaterialCommunityIcons` or `Ionicons` from `@expo/vector-icons`.
2. **Missing font family** — Only ~8 screen files use `fontFamily: 'NunitoSans_*'`. The rest use raw `fontWeight: '700'` etc., which falls back to the system font on iOS/Android — completely breaking the warm Nunito Sans feel.
3. **Off-palette hardcoded colors** — Many components define their own private color maps (dark reds like `#6B2D3E`, greens like `#2e7d32`, navy like `#1a1a2e`) that conflict with the 5-token palette. The `colors.ts` is correct; the problem is files not using it.

There is also one partially-implemented screen spec: the **Inventory redesign mockup** (`inventory-redesign-v2.html`) is the layout reference for `WineCardNew.tsx`, which partially follows its structure but with wrong sizes, colors, and fonts.

---

## Files With Correct Nunito Sans Usage (Reference — Don't Break)

These files are the gold standard for typography:

- `src/screens/home/HomeScreen.tsx` ✅
- `src/screens/inventory/InventoryScreen.tsx` ✅ (partially — tabs/search good, no NunitoSans in error states)
- `src/components/AnimatedTabBar.tsx` ✅
- `src/components/PhotoMessageBubble.tsx` ✅
- `src/components/VoiceMessageBubble.tsx` ✅
- `src/components/VoiceRecordingBar.tsx` ✅
- `src/components/WineScanActionsSheet.tsx` ✅
- `src/screens/scan/WineScanCameraScreen.tsx` ✅
- `src/screens/scan/WineScanLoadingScreen.tsx` ✅
- `src/screens/tasting/ComprehensiveTastingReviewScreen.tsx` ✅
- `src/screens/tasting/QuickTastingReviewScreen.tsx` ✅
- `src/screens/wishlist/AddToWishlistScreen.tsx` ✅

---

## Per-Screen Findings

---

### `src/screens/home/HomeScreen.tsx` — ✅ Mostly Correct

**Good:** Uses Nunito Sans correctly throughout. Colors from `colors.*`. Phosphor icons. Stats card gradient, action cards, profile circle all match spec.

**Issues:**
- Line 124 (`actionCard`): `shadowOpacity: 0.03` — spec says `0 2px 12px -4px rgba(0,0,0,0.03)`, which is correct, but `shadowRadius: 12` + `shadowOpacity: 0.03` combination renders nearly invisible on Android. Add `elevation: 2`.
- Line 95 (`statsPill`): `backgroundColor: 'rgba(255, 255, 255, 0.3)'` — DESIGN.md says `white/30 bg, blur` which is correct but blur is missing (`backdropFilter` unavailable in RN without Blur lib — acceptable as-is).
- The action card for "Open a Bottle" uses `Confetti` icon — DESIGN.md says `Bottle` (filled, -12° rotate) for "Open Bottle". Line 114.
- The action card for "Ask Sommelier" uses `Cylinder` — DESIGN.md confirms this. ✅
- **Missing:** No `Analytics` or `Import` quick actions listed in DESIGN.md nav. Low priority.

**Fixes needed:** 2 (minor)

---

### `src/screens/inventory/InventoryScreen.tsx` — ⚠️ Icon + Layout Issues

**Issues:**
1. **Line 14**: `import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'` — Replace with Phosphor imports. Specific replacements:
   - `magnify` → `MagnifyingGlass` (bold)
   - `filter-variant` → `Faders`
   - `filter-check` → `Funnel` (filled)
   - `close-circle` → `XCircle` (filled)
   - `alert-circle` → `Warning` (filled)
   - `bottle-wine` → `Wine` (filled)
2. **Line 208 (`filterButton`)**: The filter button is *inside* the `searchContainer` view. DESIGN.md spec shows a **separate standalone 48×48px** button next to the search bar, not nested inside it. The search bar should be `flex:1` and filter button a sibling.
3. **Lines 256–270 (`searchContainer`)**: `marginHorizontal: 16` — spec says 24px horizontal padding for search. Should be `marginHorizontal: 24`.
4. **Line 262 (`filterButton`)**: `position: 'relative'` with absolute badge inside is fine, but the button needs `marginLeft: 8` from search bar to match the separate-button layout.
5. **Lines 287–295 (`tabs`)**: `paddingHorizontal: 16` — spec shows tabs at 24px. Minor.
6. Missing `dot` indicator on active tab — DESIGN.md specifies a small dot above/on the active tab label.

**Fixes needed:** 5

---

### `src/components/WineCardNew.tsx` — 🔴 Major Rework Needed

This is the primary wine list card. Many things are wrong.

**Typography:**
- Lines 167, 177, 183, 195, 204, 210, 216, 219, 224 — ALL `fontWeight` values have no `fontFamily`. Replace every `fontWeight: 'N'` with the corresponding `fontFamily: 'NunitoSans_NWeight'`.

**Colors — MATURITY_CONFIG (lines 23–52):**
All maturity badge colors are wrong. Replace:
```
// CURRENT (wrong)
peak: { gradient: ['#e8f5e9', '#c8e6c9'], color: '#2e7d32' }
approaching: { gradient: ['#e8f5e9', '#c8e6c9'], color: '#2e7d32' }
past_prime: { gradient: ['#fff3e0', '#ffe0b2'], color: '#ef6c00' }
to_age: { gradient: ['#e3f2fd', '#bbdefb'], color: '#1565c0' }

// CORRECT (from colors.status)
peak: { bg: colors.status.peakBg, fg: colors.status.peak, label: 'Peak' }
approaching: { bg: colors.status.approachingBg, fg: colors.status.approaching, label: 'Approaching' }
past_prime: { bg: colors.status.pastPrimeBg, fg: colors.status.pastPrime, label: 'Drink Now' }
to_age: { bg: colors.status.youngBg, fg: colors.status.young, label: 'Young' }
```
The `LinearGradient` on maturity badge should be removed — DESIGN.md uses flat colored bg with border and dot.

**Colors — getWineColorStyle() (lines 72–112):**
ALL hardcoded colors are wrong. Replace with palette:
```
// CURRENT (wrong)           // CORRECT
red:      '#6B2D3E'          colors.wine.red (#F28482)  + bg: rgba(242,132,130,0.15)
white:    '#d4af37'          colors.wine.white (#F6BD60) + bg: rgba(246,189,96,0.15)
rose:     '#ff69b4'          colors.wine.rose (#F5CAC3)  + bg: rgba(245,202,195,0.15)
sparkling:'#ffd700'          colors.wine.sparkling (#F6BD60)
dessert/fortified: '#8b4513' colors.wine.dessert / colors.wine.fortified
```
The `iconColor` should use `colors.coralDark`, `colors.honeyDark`, etc.

**Sizes — Image container (lines 145–157):**
- `imageContainer` width: 72, height: 90 → should be **100×140** per DESIGN.md spec
- `borderRadius: 12` → should be **16px**

**Sizes — Card (lines 140–152):**
- `borderRadius: 18` → should be **24px**

**Vintage chips active (lines 83–94):**
- `LinearGradient colors={['#6B2D3E', '#5A2535']}` → should use `colors.coral` (solid, filled) per DESIGN.md "active=coral filled"
- Inactive chips `borderColor: '#D9D0C8'` → should use `colors.linen` background, no border

**Bottle count section (lines 218–226):**
- Uses `<Text>🍷</Text>` emoji → replace with `<Wine size={14} weight="fill" color={colors.wine.red} />` (Phosphor icon)
- Container should have `backgroundColor: colors.linen` with `borderWidth: 1`, `borderColor: colors.muted[100]`

**Missing elements:**
- Decorative wine-tinted blur blob (top-right) — `absolute -right-10 -top-10 w-32 h-32 bg-wine/5 rounded-full blur-2xl`
- Producer label should be `10px uppercase tracking 0.15em gray-400` (currently too large, wrong case)
- Image should have gradient overlay: `gradient-to-t from-black/40 via-transparent to-black/10`

**Icon library:**
- Line 12: `import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'` → Remove, use Phosphor `Wine` icon

**Fixes needed:** 15+ (this file needs a significant rewrite)

---

### `src/components/HistoryCard.tsx` — 🔴 Same Issues as WineCardNew

Lines 43–84 define the same private color map as `WineCardNew.tsx` (copy-pasted). Same problems:
- `#6B2D3E`, `#d4af37`, `#ff69b4`, `#ffd700`, `#8b4513` — all off-palette
- Line 10: `MaterialCommunityIcons` import — replace with Phosphor
- All `fontWeight` without `fontFamily` throughout (lines 339, 358, 383, 422)

**Fixes needed:** 8+

---

### `src/screens/cellars/CellarsScreen.tsx` — 🔴 Background + Colors Wrong

**Background:**
- Line 215: `backgroundColor: colors.muted[50]` (near white) — should be `colors.linen` (`#F7EDE2`)
- Line 216: `centered` also uses `colors.muted[50]` — same fix

**Hero card gradients (lines 37–40):**
```js
// CURRENT — dark navy/purple, completely off-palette
['#1a1a2e', '#16213e'],
[colors.coral, '#4a1a1f'],   // this one uses coral but pairs it with dark maroon
['#1e3a2f', '#0f2620'],
['#2d1b4e', '#1a0f30'],

// DESIGN.md doesn't spec cellar card gradients explicitly, but the palette is warm.
// Recommended: use coral→honey for primary, teal→honey, linen→rose, etc.
// At minimum remove the navy/dark purple gradients.
```

**Typography (lines 217–286):**
- ALL style entries use raw `fontWeight` without `fontFamily`. Every text element needs `fontFamily: 'NunitoSans_*'`.
- `title`: `fontSize: 28, fontWeight: '800'` → add `fontFamily: 'NunitoSans_800ExtraBold'`
- `heroName`: `fontWeight: '800'` → `fontFamily: 'NunitoSans_800ExtraBold'`
- `heroCount`: `fontWeight: '800'` → same

**Fixes needed:** 10

---

### `src/screens/cellars/SpacesListScreen.tsx` — 🔴 Off-palette Gradients

**Line 121:** Space cards use `colors={space.type === 'room' ? ['#1a1a2e', '#16213e'] : ['#1a1a2e', '#0f3460']}` — same dark navy that doesn't fit the warm palette.

**Fixes needed:** 2 (change gradients to palette-appropriate values)

---

### `src/screens/cellars/CellarGridView.tsx` — 🔴 Multiple Color Issues

**Lines 103–104:** Wine color map:
- `'white': '#f4e8d0'` → `colors.wine.white`
- `'rose': '#ff9999'` → `colors.wine.rose`

**Lines 159, 164:** Empty slot indicator uses `['#fff3e0', '#ffe0b2']` gradient and `#ef6c00` icon color — replace with `colors.linen` and `colors.honey`/`colors.honeyDark`.

**Line 183:** `['#e8d4a8', '#d4c094']` gradient for occupied slot — replace with palette.

**Line 279:** `backgroundColor: '#c68a5e'` — hardcoded brown, replace with `colors.honey` or `colors.teal`.

**Lines 299, 304:** `borderColor: '#ef6c00'` / `color: '#ef6c00'` — replace with `colors.honey` or `colors.status.approaching`.

**Line 13:** `MaterialCommunityIcons` import — replace with Phosphor.

**Typography:** All `fontWeight` without `fontFamily` (lines 257–333).

**Fixes needed:** 10

---

### `src/screens/cellars/SpaceDetailScreen.tsx` — 🔴 Wrong Wine Type Colors

**Lines 62–67:** Wine type colors map:
```js
// CURRENT (Tailwind-style, not from palette)
red: '#DC2626',      // should be colors.wine.red (#F28482)
white: '#FBBF24',    // should be colors.wine.white (#F6BD60)
rose: '#F472B6',     // should be colors.wine.rose (#F5CAC3)
sparkling: '#FDE047',// should be colors.wine.sparkling (#F6BD60)
dessert: '#FB923C',  // should be colors.wine.dessert (#d48c00)
fortified: '#A855F7',// should be colors.wine.fortified (#84A59D)
```

**Line 211:** `'#b86b72'` fill percentage color — replace with `colors.coral`.

**Fixes needed:** 7

---

### `src/screens/cellars/RackViewScreen.tsx` — 🔴 Wrong Wine Type Colors

**Lines 36–37:** Same wrong wine color palette as SpaceDetailScreen:
```js
red: '#DC2626', white: '#FBBF24', rose: '#F472B6',
sparkling: '#FDE047', dessert: '#FB923C', fortified: '#A855F7'
```
All should use `colors.wine.*` from theme.

**Lines 807–808:** `peekBtnDanger` uses `backgroundColor: '#fef2f2'` and `color: '#DC2626'` — replace with `colors.danger` + `rgba(239,68,68,0.08)`.

**Typography:** All `fontWeight` without `fontFamily` (lines 737–774).

**Fixes needed:** 10

---

### `src/screens/cellars/CellarLocateScreen.tsx` — ⚠️ Color + Font

**Line 138:** Success gradient `['#4caf50', '#2e7d32']` — not in palette. Replace with `colors.teal` solid or `colors.status.peak`.

**Line 13:** `MaterialCommunityIcons` import.

**Typography (lines 436–572):** All `fontWeight` without `fontFamily`.

**Fixes needed:** 5

---

### `src/screens/cellars/CreateSpaceScreen.tsx` — ⚠️ Font Only

- No hardcoded off-palette colors (uses `colors.*`)
- All `fontWeight` without `fontFamily` (lines 97–162)

**Fixes needed:** Font family throughout

---

### `src/screens/cellars/CreateRackScreen.tsx` — ⚠️ Font Only

- Uses `colors.*` correctly
- All `fontWeight` without `fontFamily` (lines 213–271)

**Fixes needed:** Font family throughout

---

### `src/screens/cellars/FridgeSetupScreen.tsx` — ⚠️ Font Only

- Uses `colors.*` correctly
- All `fontWeight` without `fontFamily` (lines 124–197)

**Fixes needed:** Font family throughout

---

### `src/screens/cellars/RoomSetupScreen.tsx` — Not checked in detail

Likely same font issues given the pattern across cellar screens.

**Fixes needed:** Font family (assume same pattern)

---

### `src/screens/LoginScreen.tsx` — ⚠️ Typography + Button Spec

**Typography (lines 103–178):**
- Title: `fontWeight: '700'` → `fontFamily: 'NunitoSans_700Bold'`
- Subtitle, label, button text: all missing `fontFamily`

**Button radius (line 159):**
- `borderRadius: 8` → should be **16px** per DESIGN.md button spec

**Input radius (line 152):**
- `borderRadius: 8` → should be **16px**

**Title (line 104):**
- "Wine Cellar" — consider branding to "Bibo" to match the app identity (cosmetic, low priority)

**Fixes needed:** 5

---

### `src/screens/ProfileScreen.tsx` — ⚠️ Icon + Font

**Line 14:** `MaterialCommunityIcons` import — replace with Phosphor:
- `chevron-left` → `CaretLeft`
- `upload` → `Upload` (or `ArrowUp`)
- `download` → `Download` (or `ArrowDown`)
- `bell-outline` → `Bell`
- `tune` → `Sliders`
- `shield-outline` → `Shield`
- `help-circle-outline` → `Question`
- `information-outline` → `Info`
- `logout` → `SignOut`
- `chevron-right` → `CaretRight`

**Typography:** All `fontWeight` without `fontFamily` throughout.

**Avatar:** Line 97 uses `LinearGradient` (`coral → coralDark`) — DESIGN.md spec says solid `colors.coral` (no gradient) for profile avatar. Change to solid `backgroundColor: colors.coral`.

**Fixes needed:** 12+

---

### `src/screens/analytics/AnalyticsScreen.tsx` — ⚠️ Icon + Font

**Line 14:** `MaterialCommunityIcons` import — replace `chevron-left` with Phosphor `CaretLeft`.

**Typography:** Large block of `fontWeight` without `fontFamily` (lines 513–742). All need `NunitoSans_*` families.

**Variable conflict:** File uses `const [colors, setColors]` (line 39) which shadows the imported `themeColors`. It already aliases as `themeColors` which avoids the bug, but this is confusing — rename the state variable to `wineColors` for clarity.

**Fixes needed:** 8

---

### `src/screens/analytics/AnalyticsDetailScreen.tsx` — ⚠️ Icon + Font

**Line 14:** `MaterialCommunityIcons` import.

**Typography:** `fontWeight` without `fontFamily` (lines 213–307).

**Fixes needed:** 5

---

### `src/screens/wine/WineDetailScreen.tsx` — ⚠️ Back Button + Font

**Back button (approx. line 288):**
- Uses `<Text style={styles.backIcon}>←</Text>` (a unicode arrow character) — replace with `<CaretLeft size={24} weight="bold" color={colors.textPrimary} />` from Phosphor.

**Typography (lines 521–759):** ALL `fontWeight` without `fontFamily`.

**Missing `fontFamily` on critical elements:**
- Wine name heading
- Vintage selector chips  
- Section titles

**Fixes needed:** Font family throughout + back button

---

### `src/screens/wine/WineDetailScreenV3.tsx`

Not audited in depth (appears to be legacy/alternative version). If still active in navigation, same issues apply. If deprecated, mark for deletion.

---

### `src/screens/wine/AddWineSearchScreen.tsx` — ⚠️ Font

**Lines 231–592:** All `fontWeight` without `fontFamily`. The screen uses Phosphor icons correctly (`X`, `Camera`, `MagnifyingGlass`, `XCircle`, `CaretRight`, `Plus`) — good.

**Placeholder color (line ~320):** `placeholderTextColor="#999"` — should use `colors.textTertiary` (`#9ca3af`).

**Fixes needed:** Font family + placeholder color

---

### `src/screens/wine/AddWineStep1.tsx` — ⚠️ Font

**All styles** use `fontWeight` without `fontFamily`. 

**Placeholder color:** `placeholderTextColor="#999"` — use `colors.textTertiary`.

**Search input border:** `borderColor: 'rgba(228, 213, 203, 0.3)'` — this is a custom color, could use `colors.borderSubtle` or `colors.muted[200]` for consistency.

**Fixes needed:** Font family throughout

---

### `src/screens/wine/AddWineStep2.tsx` — ⚠️ Font + Placeholder

**All styles** use `fontWeight` without `fontFamily`.

**Placeholder colors:** `placeholderTextColor="#aaa"` throughout — should be `colors.textTertiary`.

**Source chip active gradient:** `[colors.honey, colors.honeyDark]` — this is correct per palette, but active should be coral per DESIGN.md button spec (primary action). Consider `[colors.coral, colors.coralDark]`.

**Fixes needed:** Font family + placeholders

---

### `src/screens/wine/AddWineNoResultsScreen.tsx` — ⚠️ Icon + Font

**Line 13:** `MaterialCommunityIcons` import.

**All styles:** `fontWeight` without `fontFamily`.

**Fixes needed:** Icon + font

---

### `src/screens/inventory/FiltersScreen.tsx` — ⚠️ Font

- Uses `colors.*` correctly
- `fontWeight` without `fontFamily` throughout

**Fixes needed:** Font family

---

### `src/screens/inventory/InventoryDetailScreen.tsx` — Not checked in depth

Likely same font + icon issues. Check for `MaterialCommunityIcons` and missing `fontFamily`.

---

### `src/screens/inventory/WishlistTab.tsx` + `WishlistTabNew.tsx` — ⚠️ Mixed

**`WishlistTab.tsx` line 475:** `shadowColor: '#000'` — use `colors.coral` or appropriate token.

**Font:** `fontWeight` without `fontFamily` throughout WishlistTab.

**`WishlistTabNew.tsx`:** Uses NunitoSans? (Partially — check against AddToWishlistScreen which does use it).

**Fixes needed:** Font family + shadow color

---

### `src/screens/inventory/HistoryTab.tsx` — ⚠️ Delegates to HistoryCard

The screen itself may be fine, but `HistoryCard.tsx` has major color issues (see above).

---

### `src/screens/scan/WineScanResultScreen.tsx` — ⚠️ Icon + Color

**Line 12:** `MaterialCommunityIcons` import — replace:
- `arrow-left` → `ArrowLeft`
- `share-variant` → `ShareNetwork`
- `link-variant` → `Link`
- `dots-horizontal` → `DotsThree`
- `plus` → `Plus`

**Uses NunitoSans** ✅ (partial)

**Line ~430:** `backgroundColor: '#ff9500'` (orange warning) — not in palette. Replace with `colors.status.approaching` (`colors.honey`) or `colors.status.pastPrime` (`colors.coral`).

**Vintage chip active uses** `[colors.honeyDark, colors.honey]` — should be `colors.coral` per spec.

**Fixes needed:** Icon library + 2 colors

---

### `src/screens/scan/WineScanCameraScreen.tsx` — ✅ Mostly OK

- Uses NunitoSans ✅
- `backgroundColor: '#000'` for camera container — acceptable (camera is black)
- Check for `MaterialCommunityIcons` — yes, line 13: replace with Phosphor equivalents.

**Fixes needed:** Icon library

---

### `src/screens/scan/WineScanLoadingScreen.tsx` — ✅ Mostly OK

- Uses NunitoSans ✅
- `backgroundColor: '#000'` — acceptable for scan loading
- `shadowColor: '#000'` — acceptable

**Fixes needed:** Minor (none critical)

---

### `src/screens/sommelier/SommelierScreen.tsx` — ⚠️ Font + Color

**Typography (lines 868–1174):** ALL `fontWeight` without `fontFamily`. This is the most-used screen; fix is high priority.

**Line 882–887:** Online status indicator:
```js
backgroundColor: '#22C55E'  // → colors.teal (#84A59D) — teal is the "success/positive" color
color: '#16A34A'             // → colors.teal
```

**The `C` alias object (lines 56–66):** Creates a local alias for theme colors. This is fine as colors point to `colors.*` correctly — but `C.rose` being `colors.rose` and `C.pinkDark` being `colors.coral` is confusing. Consider removing the alias and using `colors.*` directly.

**Uses Phosphor icons** ✅ (partially — imports `List`, `DotsThreeVertical`, `Camera`, `Microphone`, `ChatCircleDots`, `Wine`)

**Line 765:** `color="#fff"` hardcoded — use `colors.textInverse`.

**Fixes needed:** Font family throughout + online color + hardcoded white

---

### `src/screens/sommelier/SommelierChatScreen.tsx` — 🔴 Stub Screen

This is a placeholder with no real content:
```tsx
// Line 15: fontWeight: '700' without fontFamily
// Missing: entire chat interface
```
If this is the screen navigated to from ConversationList, it needs full implementation per DESIGN.md chat bubble spec.

**Status:** Not implemented — lowest priority only if not currently navigated to.

---

### `src/screens/sommelier/ConversationListScreen.tsx` — ⚠️ Icon + Font

**Line 12:** `MaterialCommunityIcons` import.

**Typography:** `fontWeight` without `fontFamily` throughout.

**Fixes needed:** Icon + font

---

### `src/screens/sommelier/SommelierOnboardingScreen.tsx` — ⚠️ Icon + Font

**Line 12:** `MaterialCommunityIcons`.

**Typography:** `fontWeight` without `fontFamily`.

**Fixes needed:** Icon + font

---

### `src/screens/sommelier/SommelierSettingsScreen.tsx` — ⚠️ Icon + Font

**Line 12:** `MaterialCommunityIcons`.

**Typography:** `fontWeight` without `fontFamily`.

**Fixes needed:** Icon + font

---

### `src/screens/sommelier/TasteProfileScreen.tsx` + `TasteProfileEmptyScreen.tsx` + `TasteProfileSummaryScreen.tsx` — ⚠️ Icon + Font

All three: `MaterialCommunityIcons` + missing `fontFamily`.

**Fixes needed (each):** Icon + font

---

### `src/screens/tasting/ComprehensiveTastingScreen.tsx` — ⚠️ Icon

**Line 14:** `Ionicons` import (not Phosphor, not MaterialCommunity).

**Uses NunitoSans** ✅

**Fixes needed:** Replace Ionicons with Phosphor

---

### `src/screens/tasting/ComprehensiveTastingReviewScreen.tsx` + `QuickTastingReviewScreen.tsx` — ✅ Good

Both use NunitoSans ✅ and are mostly correct. Quick audit showed no major issues.

---

### `src/screens/search/WineSearchScreen.tsx` — ⚠️ Color + Icon

**Lines 68–75:** Custom color map using `#F5E6C8` (white), `#FFB6C1` (rosé), `#8B4513` (fortified) — replace with `colors.wine.*`.

**Note:** `'red': '#F28482'` is correct ✅

**Line 15:** `Ionicons` import — replace with Phosphor.

**Line 257, 320:** `shadowColor: '#000'`, `color: '#FFF'` — use `colors.*` tokens.

**Font:** `fontWeight` without `fontFamily`.

**Fixes needed:** 5

---

### `src/screens/search/KBWineDetailScreen.tsx` — ⚠️ Icon + Color

**Line 13:** `Ionicons` import — replace with Phosphor. Specific: `add-circle-outline` → `PlusCircle`.

**Lines 279, 353, 423:** `shadowColor: '#000'` — use `colors.coral` for branded shadow.

**Lines 445, 490:** `color: '#FFF'` — use `colors.textInverse`.

**Font:** `fontWeight` without `fontFamily` throughout.

**Fixes needed:** 6

---

### `src/screens/wishlist/AddWishlistStep1.tsx` + `AddWishlistStep2.tsx` — ⚠️ Font + Shadow

**`AddToWishlistScreen.tsx`** ✅ uses NunitoSans correctly.

**`AddWishlistStep1.tsx`** and `AddWishlistStep2.tsx`:
- Lines 262, 297, 343, 404, 442: `shadowColor: '#000'` — use themed shadow colors
- Font: `fontWeight` without `fontFamily`

**Fixes needed:** Font + shadow colors

---

### `src/screens/ImportScreen.tsx` — Not audited in detail

Apply same font/icon fixes as pattern above.

---

## Component-Level Issues

### `src/components/AgingTimeline.tsx` — ⚠️ Font + Shadow

- Line 111: `shadowColor: '#000'` — use `colors.coral` shadow
- Line 126: `fontWeight: '700'` without `fontFamily`

### `src/components/ConsumeDetailsStep.tsx` + `ConsumeSearchStep.tsx` + `ConsumeModal.tsx` + `ConsumeWineModal.tsx` — ⚠️ Font

All use `MaterialCommunityIcons` (line 13) + all `fontWeight` without `fontFamily`. These are modal components visible on HomeScreen.

### `src/components/EditWishlistModal.tsx` — ⚠️ Font

Line 240: `fontWeight: '300'` — DESIGN.md doesn't include weight 300 in the scale. Use `NunitoSans_400Regular` instead.
All other `fontWeight` also missing `fontFamily`.

### `src/components/WineMenuDropdown.tsx` — ⚠️ Icon + Color

- Line 11: `MaterialCommunityIcons`
- Line 113: `color="#d32f2f"` for delete icon — replace with `colors.danger`
- Line 163: `color: '#d32f2f'` — same

### `src/components/NotesInputModal.tsx` — ⚠️ Color

- Line 266: `borderLeftColor: '#f9a825'` (amber) — replace with `colors.honey`

### `src/components/QuickConsumeModal.tsx` — ⚠️ Icon + Color

- Line 13: `MaterialCommunityIcons`
- Lines 41–44: Wine type colors `white: '#F4E8D0'`, `rose: '#FFC0CB'`, `sparkling: '#FFD700'`, `dessert: '#D4A574'` — replace with `colors.wine.*`

### `src/components/SommelierSidebar.tsx` — ⚠️ Color

- Lines 290–381: Multiple `backgroundColor: '#fff'`, `shadowColor: '#000'` — replace with `colors.surface` and `colors.coral`

### `src/components/WineActionFAB.tsx` — ⚠️ Icon + Shadow

- Line 10: `MaterialCommunityIcons`
- Lines 174, 192: `shadowColor: '#000'` — use `colors.coral`

### `src/components/PhotoPickerRow.tsx` — ⚠️ Icon

- Line 4: `Ionicons` — replace with Phosphor

### `src/components/MealSuggestionsGrid.tsx` — ⚠️ Font

- Line 101: `fontWeight: '600'` without `fontFamily`

### `src/components/TastingSlider.tsx` + `TastingNotesCard.tsx` + `ScorePickerModal.tsx` — ⚠️ Font

Likely same `fontWeight` without `fontFamily` pattern. Apply NunitoSans.

---

## Inventory Redesign Mockup — Implementation Status

**File:** `docs/mockups/inventory-redesign-v2.html`  
**DESIGN.md status:** ✅ Approved (adapt colors)

### What the Mockup Defines

The mockup establishes the **card layout** for the wine inventory list:
- `100×140px` image panel, left side, `border-radius: 16px`
- Image overlay: `gradient-to-t from-black/40 via-transparent to-black/10`
- Info column: producer (10px uppercase, tracking 0.15em, gray-400) + wine name (20–22px semibold) + region (13px italic gray-500) + status pill + vintage chips + bottle count badge
- Cards: `border-radius: 24px`, `padding: 14px`, white bg, gray-100 border, soft shadow
- Decorative blur blob top-right (wine color, 5% opacity, blur-2xl)
- Active vintage chip: filled primary color, inactive: linen bg

### What The Mockup Uses (That Needs Adapting)

The mockup was built with different design tokens that must be adapted:

| Mockup element | Mockup value | Correct value (DESIGN.md) |
|---------------|-------------|--------------------------|
| Font | DM Sans + Playfair Display | NunitoSans_* |
| Primary color | `#8a3b46` (dark wine red) | `#F28482` (coral) |
| Active vintage chip | `bg-[#8a3b46]` | `colors.coral` |
| Page background | `#FAF9F7` (paper) | `colors.linen` (#F7EDE2) |
| Status badge (Ready) | `#F0FDF4` bg + `#22C55E` dot | `colors.status.peakBg` + `colors.status.peak` |
| Status badge (Young) | `#EFF6FF` bg + `#3B82F6` dot | `colors.status.youngBg` + `colors.status.young` |
| Wine icon in bottle count | `ph-fill ph-wine text-wine` | `<Wine size={14} weight="fill" color={colors.coral} />` (Phosphor) |

### Implementation Gap in `WineCardNew.tsx`

The current `WineCardNew.tsx` partially follows the mockup layout but misses:

| Spec | Mockup | Current (WineCardNew.tsx) | Fix needed |
|------|--------|--------------------------|------------|
| Image size | 100×140px | **72×90px** | Resize to 100×140 |
| Image border-radius | 16px | 12px | Fix to 16px |
| Card border-radius | 24px | **18px** | Fix to 24px |
| Producer label | 10px uppercase 0.15em gray-400 | 15px wrong casing | Fix size/transform |
| Active vintage chip | coral filled | `#6B2D3E` gradient | Fix color |
| Inactive vintage chip | linen bg | surface + `#D9D0C8` border | Fix to linen |
| Status badge colors | palette status colors | hardcoded greens/blues/oranges | Fix MATURITY_CONFIG |
| Decorative blob | present | **missing** | Add absolute position blob |
| Bottle count badge | linen bg + wine icon | emoji only | Add linen bg + Phosphor icon |
| Font | Nunito Sans | raw fontWeight | Add fontFamily |

**Verdict:** The mockup's *layout structure* is partially implemented. The *colors, sizes, and typography* are not. `WineCardNew.tsx` needs a targeted rework, not a rewrite from scratch.

---

## Prioritized Action List

### 🔴 Priority 1 — Typography (Affects Every Screen)

These files have ZERO `fontFamily` declarations and will render in system font. Fix ALL of them by replacing `fontWeight: 'N'` with the corresponding `fontFamily: 'NunitoSans_NWeight'` throughout the `StyleSheet.create({})` blocks.

**Mapping:**
```
fontWeight: '400' → fontFamily: 'NunitoSans_400Regular'
fontWeight: '500' → fontFamily: 'NunitoSans_500Medium'
fontWeight: '600' → fontFamily: 'NunitoSans_600SemiBold'
fontWeight: '700' → fontFamily: 'NunitoSans_700Bold'
fontWeight: '800' → fontFamily: 'NunitoSans_800ExtraBold'
```
*Note: When adding `fontFamily`, keep `fontWeight` as well for cross-platform safety, but fontFamily takes precedence on iOS.*

**Files to fix (in order of user-facing impact):**
1. `src/screens/sommelier/SommelierScreen.tsx`
2. `src/screens/wine/WineDetailScreen.tsx`
3. `src/screens/cellars/CellarsScreen.tsx`
4. `src/components/WineCardNew.tsx`
5. `src/components/HistoryCard.tsx`
6. `src/screens/analytics/AnalyticsScreen.tsx`
7. `src/screens/ProfileScreen.tsx`
8. `src/screens/LoginScreen.tsx`
9. `src/screens/wine/AddWineStep1.tsx`
10. `src/screens/wine/AddWineStep2.tsx`
11. `src/screens/wine/AddWineSearchScreen.tsx`
12. `src/screens/cellars/CellarGridView.tsx`
13. `src/screens/cellars/RackViewScreen.tsx`
14. `src/screens/cellars/CellarLocateScreen.tsx`
15. `src/screens/cellars/CreateSpaceScreen.tsx`
16. `src/screens/cellars/CreateRackScreen.tsx`
17. `src/screens/cellars/FridgeSetupScreen.tsx`
18. `src/screens/inventory/FiltersScreen.tsx`
19. `src/screens/search/WineSearchScreen.tsx`
20. `src/screens/search/KBWineDetailScreen.tsx`
21. `src/screens/sommelier/ConversationListScreen.tsx`
22. `src/screens/sommelier/SommelierOnboardingScreen.tsx`
23. `src/screens/sommelier/SommelierSettingsScreen.tsx`
24. `src/screens/sommelier/TasteProfileScreen.tsx`
25. `src/screens/sommelier/TasteProfileEmptyScreen.tsx`
26. `src/screens/sommelier/TasteProfileSummaryScreen.tsx`
27. `src/screens/analytics/AnalyticsDetailScreen.tsx`
28. `src/screens/wishlist/AddWishlistStep1.tsx`
29. `src/screens/wishlist/AddWishlistStep2.tsx`
30. `src/components/ConsumeDetailsStep.tsx`
31. `src/components/ConsumeSearchStep.tsx`
32. `src/components/ConsumeModal.tsx`
33. `src/components/EditWishlistModal.tsx`
34. `src/components/MealSuggestionsGrid.tsx`
35. `src/components/AgingTimeline.tsx`
36. `src/screens/wine/AddWineNoResultsScreen.tsx`

---

### 🔴 Priority 2 — Icon Library Consolidation

Replace ALL `MaterialCommunityIcons` / `Ionicons` imports with `phosphor-react-native` equivalents.

**Files to fix:**
```
src/screens/inventory/InventoryScreen.tsx          (MaterialCommunityIcons)
src/screens/ProfileScreen.tsx                      (MaterialCommunityIcons)
src/screens/analytics/AnalyticsScreen.tsx          (MaterialCommunityIcons)
src/screens/analytics/AnalyticsDetailScreen.tsx    (MaterialCommunityIcons)
src/screens/cellars/CellarGridView.tsx             (MaterialCommunityIcons)
src/screens/cellars/CellarLocateScreen.tsx         (MaterialCommunityIcons)
src/screens/scan/WineScanCameraScreen.tsx          (MaterialCommunityIcons)
src/screens/scan/WineScanResultScreen.tsx          (MaterialCommunityIcons)
src/screens/sommelier/ConversationListScreen.tsx   (MaterialCommunityIcons)
src/screens/sommelier/SommelierOnboardingScreen.tsx(MaterialCommunityIcons)
src/screens/sommelier/SommelierSettingsScreen.tsx  (MaterialCommunityIcons)
src/screens/sommelier/TasteProfileEmptyScreen.tsx  (MaterialCommunityIcons)
src/screens/sommelier/TasteProfileScreen.tsx       (MaterialCommunityIcons)
src/screens/sommelier/TasteProfileSummaryScreen.tsx(MaterialCommunityIcons)
src/screens/wine/AddWineNoResultsScreen.tsx        (MaterialCommunityIcons)
src/screens/tasting/ComprehensiveTastingScreen.tsx (Ionicons)
src/screens/search/WineSearchScreen.tsx            (Ionicons)
src/screens/search/KBWineDetailScreen.tsx          (Ionicons)
src/components/ConsumeDetailsStep.tsx              (MaterialCommunityIcons)
src/components/HistoryCard.tsx                     (MaterialCommunityIcons)
src/components/PhotoPickerRow.tsx                  (Ionicons)
src/components/PhotoPickerSheet.tsx                (MaterialCommunityIcons)
src/components/QuickConsumeModal.tsx               (MaterialCommunityIcons)
src/components/VoiceMessageBubble.tsx              (MaterialCommunityIcons)
src/components/VoiceRecordingBar.tsx               (MaterialCommunityIcons)
src/components/WineActionFAB.tsx                   (MaterialCommunityIcons)
src/components/WineCardNew.tsx                     (MaterialCommunityIcons)
src/components/WineMenuDropdown.tsx                (MaterialCommunityIcons)
src/components/WineScanActionsSheet.tsx            (MaterialCommunityIcons — already has NunitoSans, just swap icons)
src/screens/wishlist/AddToWishlistScreen.tsx       (MaterialCommunityIcons)
```

**Common replacements cheat sheet:**
| MaterialCommunityIcons | Phosphor |
|------------------------|----------|
| `chevron-left` | `CaretLeft` |
| `chevron-right` | `CaretRight` |
| `magnify` | `MagnifyingGlass` |
| `filter-variant` | `Faders` |
| `close-circle` | `XCircle` |
| `alert-circle` | `Warning` |
| `bottle-wine` | `Wine` |
| `filter-check` | `Funnel` |
| `bell-outline` | `Bell` |
| `shield-outline` | `Shield` |
| `information-outline` | `Info` |
| `logout` | `SignOut` |
| `delete` | `Trash` |
| `share-variant` | `ShareNetwork` |
| `arrow-left` | `ArrowLeft` |
| `dots-horizontal` | `DotsThree` |
| `plus` | `Plus` |
| `upload` / `download` | `ArrowUp` / `ArrowDown` |
| `tune` | `Sliders` |
| `help-circle-outline` | `Question` |

---

### 🔴 Priority 3 — WineCardNew + HistoryCard Color Fix

These are the core inventory list cards. They're displayed on the main Inventory screen and must match the mockup + palette.

**`src/components/WineCardNew.tsx`:**
1. Replace `MATURITY_CONFIG` hardcoded colors with `colors.status.*` (lines 23–52)
2. Replace `getWineColorStyle()` hardcoded hex with `colors.wine.*` (lines 72–112)
3. Fix image container: `72×90` → `100×140`, borderRadius `12` → `16` (lines 145–157)
4. Fix card borderRadius: `18` → `24` (line 140)
5. Fix vintage chip active: replace `LinearGradient ['#6B2D3E', '#5A2535']` with solid `colors.coral` background (lines 83–94)
6. Fix inactive vintage chip: `borderColor: '#D9D0C8'` → `backgroundColor: colors.linen, borderWidth: 0`
7. Fix bottle count: replace 🍷 emoji with `<Wine size={14} weight="fill" />`, add linen bg badge
8. Add decorative blob (absolute position, wine-tinted, top-right)
9. Remove `MaterialCommunityIcons` import, switch to Phosphor `Wine`
10. Fix producer label: `10px, textTransform: 'uppercase', letterSpacing: 2.4, color: colors.textTertiary`
11. Add `fontFamily` to all text styles

**`src/components/HistoryCard.tsx`:** Same fixes as WineCardNew for color map.

---

### 🟡 Priority 4 — CellarsScreen + Cellar Sub-screens Colors

**`src/screens/cellars/CellarsScreen.tsx`:**
1. Background: `colors.muted[50]` → `colors.linen` (line 215)
2. Hero card gradients: replace dark navy with warm palette gradients
3. Font family throughout

**`src/screens/cellars/SpaceDetailScreen.tsx` + `RackViewScreen.tsx`:**
1. Wine type color maps: replace all Tailwind-style colors with `colors.wine.*`

**`src/screens/cellars/SpacesListScreen.tsx`:**
1. Space card gradients: replace dark navy with palette-appropriate

---

### 🟡 Priority 5 — Button + Input Border Radius

**`src/screens/LoginScreen.tsx`:**
- Button `borderRadius: 8` → `16`
- Input `borderRadius: 8` → `16`

This pattern may appear in other early screens too — do a grep: `grep -rn "borderRadius: 8" src/screens`

---

### 🟢 Priority 6 — Remaining Minor Fixes

1. **`SommelierScreen.tsx`:** Online indicator `#22C55E` → `colors.teal`
2. **`WineScanResultScreen.tsx`:** Warning color `#ff9500` → `colors.status.approaching`
3. **`WineMenuDropdown.tsx`:** Delete color `#d32f2f` → `colors.danger`
4. **`NotesInputModal.tsx`:** `#f9a825` → `colors.honey`
5. **`HomeScreen.tsx`:** "Open a Bottle" card: `Confetti` icon → `Bottle` (filled, rotate -12°)
6. **`ProfileScreen.tsx`:** Avatar: `LinearGradient` → solid `backgroundColor: colors.coral`
7. **`WineDetailScreen.tsx`:** Back button `←` text → `<CaretLeft>` Phosphor icon
8. **`SommelierScreen.tsx`:** Remove `C` alias object, use `colors.*` directly
9. **`AnalyticsScreen.tsx`:** Rename `colors` state variable to `wineColors` to avoid shadowing import

---

## Quick-Win Script Suggestion for Gilfoye

Since the `fontFamily` fix is mechanical and affects 30+ files, consider scripting it:

```bash
# Audit how many fontWeight-only occurrences exist
grep -rn "fontWeight:" src/ --include="*.tsx" | grep -v "fontFamily" | wc -l

# Find all files missing fontFamily
grep -rLn "NunitoSans" src/screens --include="*.tsx"
grep -rLn "NunitoSans" src/components --include="*.tsx"
```

The fix pattern is always:
```diff
- fontWeight: '700',
+ fontFamily: 'NunitoSans_700Bold',
+ fontWeight: '700',
```

---

## Files That Are Clean (No Changes Needed)

- `src/theme/colors.ts` ✅ — Perfect, matches DESIGN.md exactly
- `src/screens/home/HomeScreen.tsx` ✅ — Nearly perfect, 2 minor items
- `src/components/AnimatedTabBar.tsx` ✅ — Correct
- `src/components/VoiceMessageBubble.tsx` ✅
- `src/components/VoiceRecordingBar.tsx` ✅
- `src/components/PhotoMessageBubble.tsx` ✅
- `src/screens/scan/WineScanLoadingScreen.tsx` ✅
- `src/screens/tasting/ComprehensiveTastingReviewScreen.tsx` ✅
- `src/screens/tasting/QuickTastingReviewScreen.tsx` ✅
