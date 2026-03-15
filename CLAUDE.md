# Bibo Wine Cellar — Mobile App

## Overview
React Native mobile app for wine inventory management. Scan labels, browse cellar, get AI recommendations.

**Stack:** React Native, Expo 54, TypeScript  
**Dev Server:** VPS port 8083, socat proxy on 19083  
**URL:** exp://46.225.12.54:19083

## Architecture

```
src/
├── api/
│   └── client.ts       # API fetch wrapper with auth
├── auth/
│   └── AuthContext.tsx # Auth state management
├── components/         # Reusable UI components
├── navigation/
│   └── AppNavigator.tsx # Tab + stack navigation
├── screens/
│   ├── home/           # Home, quick actions
│   ├── inventory/      # Wine list, details
│   ├── wine/           # Add wine flow, wine detail
│   ├── search/         # Knowledge base search (NEW)
│   ├── sommelier/      # AI chat, taste profile
│   ├── cellars/        # Rack visualization
│   └── analytics/      # Stats and charts
├── theme/
│   └── colors.ts       # Design tokens
└── types/
    └── api.ts          # API response types
```

## Design System

### Theme: "Warm Sommelier"
- Cozy wine bar aesthetic, not cold/clinical
- Background: `#FEF9F5` (warm off-white)
- Wine red: `#722F37` (accent, sparingly)
- Cards: `#FFFFFF` with subtle shadows
- Border radius: 16-24px

### Typography
- Titles: 24-28px, weight 700
- Body: 16px, weight 400
- Secondary: 14px, `#666666`

### Components
- Rounded cards with soft shadows
- Bottom tab bar with elevated scan button
- Pull-to-refresh on lists

## Navigation Structure

```
Tab Navigator
├── HomeTab (HomeStack)
│   ├── HomeMain
│   ├── Profile
│   ├── AddWineStep1/2
│   ├── WineSearch      ← NEW
│   ├── KBWineDetail    ← NEW
│   └── Sommelier
├── InventoryTab (InventoryStack)
│   ├── InventoryList
│   ├── InventoryDetail
│   └── WineDetail
├── ScanTab (opens modal)
├── SommelierTab (SommelierStack)
│   ├── SommelierChat
│   ├── TasteProfile
│   └── SommelierOnboarding
└── CellarsTab (CellarsStack)
    ├── CellarsList
    ├── SpacesList
    ├── CreateSpace
    ├── RoomSetup / FridgeSetup
    └── RackView
```

## Key Features

### Label Scanning
- Camera → base64 image → `POST /api/wines/scan`
- Claude Vision extracts producer, wine, vintage, color
- Shows matches from user inventory + KB suggestions

### Knowledge Base Search (NEW)
- `WineSearchScreen` — search 493K wines
- `KBWineDetailScreen` — full details with critic reviews
- Images, food pairings, taste structure, aging windows

### Sommelier AI
- Chat interface with Claude
- Taste profile onboarding (10 questions)
- Context-aware recommendations from cellar

### Cellar Rack Visualization
- Room → Walls → Racks (grids) → Slots
- Fridge → Shelves → Slots
- Color-coded by wine color
- Tap slot to assign/consume bottle

## API Integration

```typescript
// src/api/client.ts
apiFetch<T>(path, { method, body, query })

// Auth token stored in SecureStore
// Auto-attached to all requests
```

## Current State (March 2026)

### Completed
- Full inventory management
- Label scanning
- Sommelier chat with taste profiles
- Knowledge base search (493K wines)
- Cellar space/rack creation

### In Progress
- Rack visualization (slot assignment)
- Move bottle between slots
- Analytics fixes

### Design Reference
See `~/.openclaw/workspace-johnny/DESIGN-SYSTEM.md` for full design spec.

## Development

```bash
# Start Metro (on VPS)
npx expo start --port 8083

# Connect from phone
exp://46.225.12.54:19083

# Clear cache if issues
rm -rf .expo node_modules/.cache
npx expo start --clear
```

## Design Resources

All design docs and mockups are in `docs/`:

```
docs/
├── DESIGN-SYSTEM.md      # Full design system (colors, spacing, components)
├── DESIGN_TOKENS.md      # Design tokens for implementation
├── DESIGNS.md            # Design decisions log
├── sommelier-design-spec.md    # Sommelier AI UX spec
├── sommelier-handoff-spec.md   # Sommelier implementation spec
├── INVENTORY_REDESIGN_SPEC.md  # Inventory screens spec
└── mockups/              # Final approved mockups (PNGs)
    ├── inventory-list-final.png
    ├── detail-v5.png
    ├── sommelier-final.png
    ├── taste-profile-summary-v2.png
    ├── home-with-analytics-widget.png
    ├── mockup-add-wine-final.png
    ├── mockup-analytics-final.png
    └── ...
```

### Design Principles
- **Theme:** "Warm Sommelier" — cozy wine bar, not clinical
- **Colors:** Warm off-white (`#FEF9F5`), wine red sparingly (`#722F37`)
- **Corners:** 16-24px radius
- **Touch targets:** 44px minimum
- **No harsh borders** — use shadows instead

### Full Mockup Archive
Additional mockups (iterations, alternatives) are in:
`~/.openclaw/workspace-johnny/` (Johnny's design workspace)

## Related Projects
- `../wine-cellar/` — Backend API
- `../bibo-knowledge/` — Wine reference database
