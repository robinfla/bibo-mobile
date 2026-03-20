# Comprehensive Tasting Sheet — Implementation Plan

**Status:** Ready for Implementation  
**Spec:** `/home/robin/projects/bibo/wine-cellar-mobile/docs/TASTING-SHEET-SPEC.md`  
**Estimated Time:** 3-4 days (phased approach)

---

## Implementation Summary

This feature transforms the simple text-based tasting notes into a sophisticated, multi-screen structured tasting review system with visual pickers, sliders, aroma wheel, and photo uploads.

**Key Changes:**
- **Frontend:** 7 new screens + reusable components (color picker, sliders, aroma wheel)
- **Backend:** New `tastings` table + 5 API endpoints
- **Migration:** Existing `tasting_notes` table remains untouched (backward compatible)

---

## Phase 1: Backend Foundation (Day 1)

### 1.1 Database Schema

Create new `tastings` table in `/home/robin/projects/bibo/wine-cellar/server/db/schema.ts`:

```typescript
export const tastings = pgTable('tastings', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  wineId: integer('wine_id').references(() => wines.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  vintage: integer('vintage'),
  
  // Overall rating
  rating: integer('rating'), // 0-100
  
  // Visual assessment
  visualColor: text('visual_color'),
  visualColorPosition: integer('visual_color_position'), // 0-100
  visualIntensity: text('visual_intensity'),
  visualIntensityValue: integer('visual_intensity_value'), // 0-100
  visualClarity: text('visual_clarity'),
  visualClarityValue: integer('visual_clarity_value'), // 0-100
  visualViscosity: text('visual_viscosity'),
  visualViscosityValue: integer('visual_viscosity_value'), // 0-100
  
  // Nose
  noseIntensity: text('nose_intensity'),
  noseIntensityValue: integer('nose_intensity_value'), // 0-100
  noseDevelopment: text('nose_development'),
  noseDevelopmentValue: integer('nose_development_value'), // 0-100
  noseAromas: text('nose_aromas').array(), // JSON array of strings
  
  // Palate
  palateSweetness: text('palate_sweetness'),
  palateSweetnessValue: integer('palate_sweetness_value'), // 0-100
  palateAcidity: text('palate_acidity'),
  palateAcidityValue: integer('palate_acidity_value'), // 0-100
  palateTannin: text('palate_tannin'),
  palateTanninValue: integer('palate_tannin_value'), // 0-100
  palateBody: text('palate_body'),
  palateBodyValue: integer('palate_body_value'), // 0-100
  palateAlcohol: integer('palate_alcohol'), // Actual ABV or percentage value
  palateAlcoholValue: integer('palate_alcohol_value'), // 0-100 for slider position
  palateFinish: text('palate_finish'),
  palateFinishValue: integer('palate_finish_value'), // 0-100
  palateFlavors: text('palate_flavors').array(), // JSON array of strings
  
  // Context
  contextPeople: text('context_people').array(), // JSON array of strings
  contextPlace: text('context_place'),
  contextMeal: text('context_meal'),
  contextTemperature: integer('context_temperature'), // Celsius
  contextDecantedMinutes: integer('context_decanted_minutes'),
  
  // Notes & Photos
  notes: text('notes'),
  photos: text('photos').array(), // JSON array of URLs/paths
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  wineIdx: index('tastings_wine_idx').on(table.wineId),
  userIdx: index('tastings_user_idx').on(table.userId),
  createdAtIdx: index('tastings_created_at_idx').on(table.createdAt),
}))

export type Tasting = typeof tastings.$inferSelect
```

**Migration file:** `server/db/migrations/XXXX_create_tastings_table.sql`

### 1.2 API Endpoints

Create in `/home/robin/projects/bibo/wine-cellar/server/api/`:

**File: `tastings/index.post.ts`** — Create tasting
```typescript
// POST /api/tastings
// Body: Complete tasting data (matches spec schema)
// Returns: Created tasting object
```

**File: `tastings/[id].get.ts`** — Get single tasting
```typescript
// GET /api/tastings/:id
// Returns: Full tasting object
```

**File: `tastings/[id].put.ts`** — Update tasting
```typescript
// PUT /api/tastings/:id
// Body: Partial tasting data
// Returns: Updated tasting object
```

**File: `tastings/[id].delete.ts`** — Delete tasting
```typescript
// DELETE /api/tastings/:id
// Returns: 204 No Content
```

**File: `wines/[id]/tastings.get.ts`** — List tastings for wine
```typescript
// GET /api/wines/:id/tastings
// Returns: Array of tastings for wine, sorted by createdAt DESC
```

**Validation:** Use Zod schemas matching the TypeScript interface from the spec.

---

## Phase 2: Core Components (Day 1-2)

### 2.1 Reusable Components

Create in `/home/robin/projects/bibo/wine-cellar-mobile/src/components/`:

#### `TastingSlider.tsx`
- Horizontal slider with bordeaux gradient fill
- Props: `value`, `onChange`, `min`, `max`, `labels` (start/end text)
- Displays current value as text label
- Uses `@react-native-community/slider`

#### `ColorGradientPicker.tsx`
- 8-stop gradient bar (pale yellow → garnet)
- Draggable white circular selector (36×36px)
- Returns position percentage (0-100)
- Maps to color names per spec

#### `AromaChip.tsx`
- Bordeaux-styled chip with text + remove button (×)
- Used for selected aromas/flavors

#### `PhotoPickerRow.tsx`
- "Add Photos" button with camera icon
- Photo grid display after selection
- Uses `expo-image-picker`
- Delete functionality

### 2.2 Aroma Wheel

#### `AromaWheelModal.tsx`
Multi-screen bottom sheet:
- **Screen 1:** SVG aroma wheel (350×350px)
  - 6 category segments (Fruity, Spicy, Oak, Earthy, Vegetal, Floral)
  - Tap category → expands to show specific aromas
  - Selected aromas highlighted
- **Screen 2:** Bottom sheet with selected chips + "Done" button
- Uses `@gorhom/bottom-sheet`

**SVG Generation:**
- Create aromas as data structure (6 categories × ~5-10 aromas each)
- Generate wheel programmatically with `react-native-svg`
- Each segment is touchable (`<Path>` with `onPress`)

**Data file:** `src/data/aromaWheel.ts`
```typescript
export const AROMA_CATEGORIES = [
  {
    id: 'fruity',
    label: 'Fruity',
    color: '#dc2626',
    aromas: ['Blackcurrant', 'Cherry', 'Plum', 'Raspberry', 'Strawberry', ...],
  },
  // ... 5 more categories
]
```

---

## Phase 3: Tasting Flow Screens (Day 2-3)

Screens go in `/home/robin/projects/bibo/wine-cellar-mobile/src/screens/tasting/`:

### 3.1 Main Flow Component

**File: `ComprehensiveTastingFlow.tsx`**
- Multi-step wizard (7 screens)
- Bottom navigation: "Back" / "Next" / "Save"
- Progress indicator (1/7, 2/7, etc.)
- State management: Single `useState` hook with full tasting object
- Auto-save draft to AsyncStorage every step

### 3.2 Individual Screen Components

All screens are sub-components within the flow:

1. **`WineInfoStep.tsx`**
   - Wine card (image + name + vintage)
   - Rating button → opens `ScorePickerModal` (already exists!)
   - Actions dropdown → bottom sheet

2. **`VisualAssessmentStep.tsx`**
   - Color gradient picker
   - 3 sliders (Intensity, Clarity, Viscosity)

3. **`NoseStep.tsx`**
   - 2 sliders (Intensity, Development)
   - "Add Aromas" button → opens `AromaWheelModal`
   - Selected aromas as chips

4. **`PalateStep.tsx`**
   - 6 sliders (Sweetness, Acidity, Tannin, Body, Alcohol, Finish)
   - "Add Flavor Notes" button → opens `AromaWheelModal`
   - Selected flavors as chips

5. **`ContextStep.tsx`**
   - 3 text input rows with icons (👥 People, 📍 Place, 🍽️ Meal)
   - 2-column grid for serving conditions (🌡️ Temp, 🍷 Decanted)

6. **`NotesPhotosStep.tsx`**
   - Textarea for additional notes
   - Photo picker + grid display

7. **`ReviewStep.tsx` (optional, nice-to-have)**
   - Summary of all inputs before final save
   - Edit buttons to jump back to any step

---

## Phase 4: Entry Points & Integration (Day 3)

### 4.1 Entry Point 1: Scan Flow

**File:** `src/screens/scan/WineScanActionsSheet.tsx`

Add "Comprehensive Tasting Review" option:
```typescript
{
  label: 'Comprehensive Tasting Review',
  icon: 'clipboard-text-outline',
  onPress: () => {
    navigation.navigate('ComprehensiveTasting', { wineId: wine.id })
  }
}
```

### 4.2 Entry Point 2: Wine Detail Page

**File:** `src/components/WineMenuDropdown.tsx`

Add "Add Tasting" menu item.

### 4.3 Entry Point 3: History Tab

Add "+ Add Tasting" FAB button (similar to existing patterns).

### 4.4 Navigation Setup

**File:** `src/navigation/RootNavigator.tsx`

Add route:
```typescript
<Stack.Screen
  name="ComprehensiveTasting"
  component={ComprehensiveTastingFlow}
  options={{ headerShown: false }}
/>
```

---

## Phase 5: API Integration & Polish (Day 4)

### 5.1 Frontend API Client

**File:** `src/api/tastings.ts`

```typescript
import { apiFetch } from './client'
import type { Tasting } from '../types/api'

export const tastingsApi = {
  create: (data: Partial<Tasting>) =>
    apiFetch<Tasting>('/api/tastings', { method: 'POST', body: data }),
  
  get: (id: number) =>
    apiFetch<Tasting>(`/api/tastings/${id}`),
  
  update: (id: number, data: Partial<Tasting>) =>
    apiFetch<Tasting>(`/api/tastings/${id}`, { method: 'PUT', body: data }),
  
  delete: (id: number) =>
    apiFetch(`/api/tastings/${id}`, { method: 'DELETE' }),
  
  listForWine: (wineId: number) =>
    apiFetch<Tasting[]>(`/api/wines/${wineId}/tastings`),
}
```

### 5.2 Type Definitions

**File:** `src/types/api.ts`

Add `Tasting` interface matching the spec schema.

### 5.3 Photo Upload

Use `expo-image-picker` for selection, then:
- Option A: Upload to backend `/api/upload` endpoint, store URLs
- Option B: Store as base64 in tasting record (quick but bloats DB)

**Recommended:** Option A with dedicated upload endpoint.

---

## Phased Rollout Recommendation

### **Phase 1 (MVP):** Core Tasting Flow
- Backend schema + API endpoints
- Screens 1-6 (skip Review step initially)
- Basic slider + text inputs (skip aroma wheel initially)
- Entry point from wine detail page only
- **Deliverable:** Functional comprehensive tasting flow with manual text entry

### **Phase 2:** Enhanced UX
- Color gradient picker
- Custom slider component with gradient fill
- Aroma wheel modal
- Photo upload
- **Deliverable:** Pixel-perfect design matching spec

### **Phase 3:** Full Integration
- All 3 entry points
- Review/summary step
- Auto-save drafts
- **Deliverable:** Production-ready feature

---

## Testing Checklist

- [ ] Create tasting from scan flow
- [ ] Create tasting from wine detail
- [ ] Create tasting from history tab
- [ ] All sliders update correctly
- [ ] Color picker maps to correct color names
- [ ] Aroma wheel selection works
- [ ] Photo upload works
- [ ] Save/update/delete operations work
- [ ] Tasting appears in wine detail history
- [ ] Validation errors display correctly
- [ ] Works on iOS and Android
- [ ] Keyboard handling (doesn't cover inputs)
- [ ] Bottom sheet dismissal works correctly

---

## Technical Notes

### State Management
- Single `useState` hook for tasting object in parent flow component
- Pass `value` + `onChange` props to child step components
- Use `useCallback` for update handlers to prevent re-renders

### Performance
- Aroma wheel SVG: Memoize generation with `useMemo`
- Photo previews: Use thumbnails, not full-res images
- Slider updates: Debounce if laggy (unlikely with React Native)

### Design Tokens
Create `src/theme/tasting.ts`:
```typescript
export const tastingTheme = {
  colors: {
    bordeaux: '#722F37',
    bordeauxLight: '#944654',
    background: '#fef9f5',
    cardBorder: 'rgba(228, 213, 203, 0.3)',
  },
  gradients: {
    bordeaux: ['#722F37', '#944654'],
    wineColor: ['#fef9c3', '#fef9c3', '#fde047', '#fbbf24', '#f59e0b', '#ea580c', '#dc2626', '#7f1d1d'],
  },
  shadows: {
    card: '0 4px 16px rgba(114, 47, 55, 0.08)',
    button: '0 2px 8px rgba(114, 47, 55, 0.06)',
    cta: '0 4px 12px rgba(114, 47, 55, 0.3)',
  },
}
```

### Backward Compatibility
- Keep existing `tasting_notes` table and endpoints
- New comprehensive tastings use separate table
- Old "Quick Tasting" flow still works
- Migration path: Convert old notes to new format (future enhancement)

---

## Estimated Time Breakdown

| Phase | Task | Time |
|-------|------|------|
| 1 | Backend schema + migrations | 2h |
| 1 | API endpoints + validation | 3h |
| 2 | Slider component | 2h |
| 2 | Color gradient picker | 3h |
| 2 | Aroma wheel data structure | 1h |
| 2 | Aroma wheel modal + SVG | 5h |
| 2 | Photo picker component | 2h |
| 3 | Flow scaffold + navigation | 2h |
| 3 | 7 step components | 8h |
| 4 | Entry point integrations | 2h |
| 5 | API client + type definitions | 1h |
| 5 | Photo upload endpoint | 2h |
| 5 | Testing + bug fixes | 4h |
| **Total** | | **37 hours (~4-5 days)** |

---

## Next Steps

1. **Review this plan** with Robin
2. **Confirm phased approach** (MVP first vs. full feature)
3. **Start with Phase 1** (backend foundation)
4. **Prototype aroma wheel** early (highest risk/complexity)

---

**Ready to start?** Let me know which phase to tackle first! 🍷
