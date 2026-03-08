# TestID Props Needed for Maestro E2E Tests

This document lists all screens and components that need `testID` props added for reliable E2E testing.

## Priority: HIGH (Core Flows)

### LoginScreen.tsx
- [ ] Email input field: `testID="login-email-input"`
- [ ] Password input field: `testID="login-password-input"`
- [ ] Sign in button: `testID="login-submit-button"`
- [ ] Error message: `testID="login-error-message"`

### HomeScreen.tsx
- [ ] Profile button (top right): `testID="home-profile-button"`
- [ ] Quick action buttons:
  - [ ] Open a Bottle: `testID="home-action-consume"`
  - [ ] Add Wine: `testID="home-action-add-wine"`
  - [ ] Ask Sommelier: `testID="home-action-sommelier"`
  - [ ] Locate in Cellar: `testID="home-action-locate"`
- [ ] Ready Tonight wine cards: `testID="home-ready-wine-{index}"`
- [ ] Stats cards: `testID="home-stats-{type}"`

### InventoryScreen.tsx
- [ ] Search input: `testID="inventory-search-input"`
- [ ] Filter button: `testID="inventory-filter-button"`
- [ ] Tab buttons:
  - [ ] Cellar: `testID="inventory-tab-cellar"`
  - [ ] Wishlist: `testID="inventory-tab-wishlist"`
  - [ ] History: `testID="inventory-tab-history"`
- [ ] Wine cards: `testID="inventory-wine-card-{wineId}"`
- [ ] Back button: `testID="inventory-back-button"`

### WineDetailScreenV3.tsx
- [ ] Back button: `testID="wine-detail-back-button"`
- [ ] FAB menu: `testID="wine-detail-fab"`
- [ ] FAB actions:
  - [ ] Consume: `testID="wine-detail-consume"`
  - [ ] Edit: `testID="wine-detail-edit"`
  - [ ] Locate: `testID="wine-detail-locate"`
  - [ ] Remove: `testID="wine-detail-remove"`
- [ ] Vintage chips: `testID="wine-detail-vintage-{year}"`
- [ ] Menu dropdown: `testID="wine-detail-menu"`

## Priority: MEDIUM (Feature Flows)

### ConsumeWineModal.tsx
- [ ] Search step:
  - [ ] Search input: `testID="consume-search-input"`
  - [ ] Search results: `testID="consume-search-result-{index}"`
- [ ] Details step:
  - [ ] Quantity picker: `testID="consume-quantity-picker"`
  - [ ] Rating stars: `testID="consume-rating-star-{index}"`
  - [ ] Notes input: `testID="consume-notes-input"`
  - [ ] Submit button: `testID="consume-submit-button"`
- [ ] Close button: `testID="consume-close-button"`

### QuickConsumeModal.tsx
- [ ] Remove button: `testID="quick-consume-remove-button"`
- [ ] Transfer button: `testID="quick-consume-transfer-button"`
- [ ] Close button: `testID="quick-consume-close-button"`

### SommelierScreen.tsx
- [ ] Input field: `testID="sommelier-input"`
- [ ] Send button: `testID="sommelier-send-button"`
- [ ] Message bubbles: `testID="sommelier-message-{index}"`
- [ ] Wine suggestion cards: `testID="sommelier-wine-{wineId}"`

### AddWineStep1.tsx (AI Search)
- [ ] Description input: `testID="add-wine-description-input"`
- [ ] Search button: `testID="add-wine-search-button"`
- [ ] Loading indicator: `testID="add-wine-loading"`

### AddWineStep2.tsx (Details)
- [ ] Quantity input: `testID="add-wine-quantity-input"`
- [ ] Cellar selector: `testID="add-wine-cellar-selector"`
- [ ] Notes input: `testID="add-wine-notes-input"`
- [ ] Submit button: `testID="add-wine-submit-button"`

## Priority: LOW (Navigation & Secondary Flows)

### CellarsScreen.tsx
- [ ] Cellar cards: `testID="cellar-card-{cellarId}"`
- [ ] Add cellar button: `testID="cellars-add-button"`

### SpacesListScreen.tsx
- [ ] Space cards: `testID="space-card-{spaceId}"`
- [ ] Add space button: `testID="spaces-add-button"`
- [ ] Unplaced bottles section: `testID="spaces-unplaced-section"`

### SpaceDetailScreen.tsx
- [ ] Rack/bin cards: `testID="rack-card-{rackId}"`
- [ ] Add rack button: `testID="space-add-rack-button"`

### RackViewScreen.tsx
- [ ] Rack grid: `testID="rack-grid"`
- [ ] Rack slots: `testID="rack-slot-{row}-{column}"`
- [ ] Empty slot modal: `testID="rack-empty-slot-modal"`
- [ ] Add wine to slot: `testID="rack-add-wine-button"`
- [ ] See wine list link: `testID="rack-see-wine-list"`

### CellarLocateScreen.tsx
- [ ] Zoomed grid: `testID="locate-zoomed-grid"`
- [ ] Highlighted bottles: `testID="locate-bottle-{row}-{column}"`
- [ ] Back to rack button: `testID="locate-back-button"`

### AnalyticsScreen.tsx
- [ ] Pie chart: `testID="analytics-pie-chart"`
- [ ] Stats cards: `testID="analytics-stats-{type}"`
- [ ] By Grape section: `testID="analytics-by-grape"`
- [ ] By Region section: `testID="analytics-by-region"`
- [ ] See all buttons: `testID="analytics-see-all-{type}"`

### AnalyticsDetailScreen.tsx
- [ ] Search input: `testID="analytics-detail-search"`
- [ ] Items list: `testID="analytics-detail-item-{index}"`
- [ ] Back button: `testID="analytics-detail-back"`

### FiltersScreen.tsx
- [ ] Color filters: `testID="filter-color-{color}"`
- [ ] Maturity filter: `testID="filter-maturity"`
- [ ] Cellar selector: `testID="filter-cellar-selector"`
- [ ] Price range: `testID="filter-price-range"`
- [ ] Apply button: `testID="filter-apply-button"`
- [ ] Reset button: `testID="filter-reset-button"`

### ProfileScreen.tsx
- [ ] User card: `testID="profile-user-card"`
- [ ] Menu items: `testID="profile-menu-{item}"`
- [ ] Logout button: `testID="profile-logout-button"`

## Bottom Tab Navigation

### AppNavigator.tsx
- [ ] Tab bar tabs:
  - [ ] Home: `testID="tab-home"`
  - [ ] Inventory: `testID="tab-inventory"`
  - [ ] Scan: `testID="tab-scan"`
  - [ ] Analytics: `testID="tab-analytics"`
  - [ ] Cellars: `testID="tab-cellars"`

## Common Components

### WineCardNew.tsx
- [ ] Card container: `testID="wine-card-{wineId}"`
- [ ] Bottle icon: `testID="wine-card-icon-{wineId}"`
- [ ] Vintage chips: `testID="wine-card-vintage-{year}"`
- [ ] Maturity badge: `testID="wine-card-maturity-{wineId}"`

### HistoryCard.tsx
- [ ] Card container: `testID="history-card-{eventId}"`
- [ ] Date: `testID="history-card-date-{eventId}"`
- [ ] Rating: `testID="history-card-rating-{eventId}"`

### WishlistCard.tsx
- [ ] Card container: `testID="wishlist-card-{wishlistId}"`
- [ ] Priority badge: `testID="wishlist-priority-{wishlistId}"`
- [ ] Edit button: `testID="wishlist-edit-{wishlistId}"`

## Implementation Notes

1. **Naming Convention**: Use kebab-case for testID values
2. **Dynamic IDs**: Include entity IDs (wineId, cellarId, etc.) in testID when rendering lists
3. **Accessibility**: testID props don't affect accessibility - add both `accessibilityLabel` and `testID`
4. **Platform**: testID works on both iOS and Android

## Example Implementation

```tsx
// Before
<TouchableOpacity onPress={handlePress}>
  <Text>Sign in</Text>
</TouchableOpacity>

// After
<TouchableOpacity 
  onPress={handlePress}
  testID="login-submit-button"
  accessibilityLabel="Sign in button"
>
  <Text>Sign in</Text>
</TouchableOpacity>
```

## Priority Order for Implementation

1. **Phase 1** (Core Auth & Navigation): LoginScreen, Bottom Tabs, HomeScreen
2. **Phase 2** (Inventory Flows): InventoryScreen, WineDetailScreenV3, WineCardNew
3. **Phase 3** (Actions): ConsumeWineModal, AddWine flows, QuickConsumeModal
4. **Phase 4** (Features): SommelierScreen, CellarLocateScreen, RackViewScreen
5. **Phase 5** (Analytics & Settings): AnalyticsScreen, ProfileScreen, FiltersScreen

Estimated effort: ~4-6 hours to add all testIDs across the app.
