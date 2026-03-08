# TestID TODO

This file tracks which screens and components need `testID` props added for more reliable Maestro E2E testing.

## Priority 1: Critical User Flows

### LoginScreen (`src/screens/LoginScreen.tsx`)
- [ ] Email input: `testID="login-email-input"`
- [ ] Password input: `testID="login-password-input"`
- [ ] Sign In button: `testID="login-submit-button"`
- [ ] Error message container: `testID="login-error-message"`

### HomeScreen (`src/screens/home/HomeScreen.tsx`)
- [ ] Profile button: `testID="home-profile-button"`
- [ ] Stats card: `testID="home-stats-card"`
- [ ] Bottle count: `testID="home-bottle-count"`
- [ ] "Add a Wine" action: `testID="home-add-wine-button"`
- [ ] "Open a Bottle" action: `testID="home-consume-button"`
- [ ] "Ask the Sommelier" action: `testID="home-sommelier-button"`
- [ ] Ready Tonight section: `testID="home-ready-wines-section"`
- [ ] Each wine card: `testID="wine-card-${wineId}"`

### InventoryScreen (`src/screens/inventory/InventoryScreen.tsx`)
- [ ] Tab buttons:
  - `testID="inventory-tab-cellar"`
  - `testID="inventory-tab-wishlist"`
  - `testID="inventory-tab-history"`
- [ ] Search input: `testID="inventory-search-input"`
- [ ] Filter button: `testID="inventory-filter-button"`
- [ ] Wine cards list: `testID="inventory-wine-list"`
- [ ] Each wine card: `testID="inventory-wine-card-${index}"`

### InventoryDetailScreen (`src/screens/inventory/InventoryDetailScreen.tsx`)
- [ ] Consume button: `testID="wine-detail-consume-button"`
- [ ] Wine name: `testID="wine-detail-name"`
- [ ] Maturity badge: `testID="wine-detail-maturity-badge"`
- [ ] Quantity: `testID="wine-detail-quantity"`

### ConsumeWineModal (component)
- [ ] Wine selector: `testID="consume-wine-selector"`
- [ ] Quantity input: `testID="consume-quantity-input"`
- [ ] Score input: `testID="consume-score-input"`
- [ ] Comment input: `testID="consume-comment-input"`
- [ ] Pairing input: `testID="consume-pairing-input"`
- [ ] Consume button: `testID="consume-submit-button"`
- [ ] Cancel button: `testID="consume-cancel-button"`

## Priority 2: Cellars & Physical Layout

### CellarsScreen (`src/screens/cellars/CellarsScreen.tsx`)
- [ ] Cellars list: `testID="cellars-list"`
- [ ] Each cellar card: `testID="cellar-card-${cellarId}"`
- [ ] Create cellar button: `testID="cellars-create-button"`

### SpacesListScreen
- [ ] Spaces list: `testID="spaces-list"`
- [ ] Each space card: `testID="space-card-${spaceId}"`
- [ ] Create space button: `testID="spaces-create-button"`

### SpaceDetailScreen
- [ ] Racks list: `testID="space-racks-list"`
- [ ] Each rack card: `testID="rack-card-${rackId}"`
- [ ] Create rack button: `testID="space-create-rack-button"`

### RackViewScreen (`src/screens/cellars/RackViewScreen.tsx`)
- [ ] Grid container: `testID="rack-grid-container"`
- [ ] Each grid slot: `testID="rack-slot-${row}-${col}"`
- [ ] Bin container: `testID="rack-bin-container"`
- [ ] Each bin cell: `testID="bin-cell-${row}-${col}"`
- [ ] Search input (for adding wine): `testID="rack-search-input"`
- [ ] Add bottle button: `testID="rack-add-bottle-button"`

## Priority 3: Scan & Analytics

### ScanWineModal (`src/screens/home/ScanWineModal.tsx`)
- [ ] Take photo button: `testID="scan-take-photo-button"`
- [ ] Upload photo button: `testID="scan-upload-photo-button"`
- [ ] Manual search button: `testID="scan-manual-search-button"`
- [ ] Manual search input: `testID="scan-search-input"`
- [ ] Scan results list: `testID="scan-results-list"`
- [ ] Close button: `testID="scan-close-button"`

### AnalyticsScreen (`src/screens/analytics/AnalyticsScreen.tsx`)
- [ ] Composition tab: `testID="analytics-tab-composition"`
- [ ] Finance tab: `testID="analytics-tab-finance"`
- [ ] Stats summary: `testID="analytics-stats-summary"`
- [ ] Color chart: `testID="analytics-color-chart"`
- [ ] Grapes list: `testID="analytics-grapes-list"`
- [ ] Regions list: `testID="analytics-regions-list"`

## Priority 4: Secondary Flows

### FiltersScreen
- [ ] Sort dropdown: `testID="filter-sort-dropdown"`
- [ ] Color filter: `testID="filter-color-${color}"`
- [ ] Maturity filter: `testID="filter-maturity-${status}"`
- [ ] Price range slider: `testID="filter-price-slider"`
- [ ] Apply button: `testID="filter-apply-button"`
- [ ] Reset button: `testID="filter-reset-button"`

### WineDetailScreenV3
- [ ] About section: `testID="wine-about-section"`
- [ ] Info section: `testID="wine-info-section"`
- [ ] Tasting notes: `testID="wine-tasting-notes"`
- [ ] Add to inventory button: `testID="wine-add-to-inventory"`

### AddWineStep1 & AddWineStep2
- [ ] Search input: `testID="add-wine-search-input"`
- [ ] Manual entry toggle: `testID="add-wine-manual-toggle"`
- [ ] Form fields: `testID="add-wine-${fieldName}"`
- [ ] Next/Submit button: `testID="add-wine-submit-button"`

## Implementation Pattern

When adding testIDs, follow this pattern:

```tsx
<TouchableOpacity
  testID="component-action-name"
  onPress={handlePress}
>
  <Text>Label</Text>
</TouchableOpacity>
```

For lists, use dynamic testIDs:
```tsx
<FlatList
  data={items}
  renderItem={({ item, index }) => (
    <View testID={`list-item-${item.id}`}>
      {/* content */}
    </View>
  )}
/>
```

## Benefits of TestIDs

1. **Stability**: Tests won't break when text changes
2. **Clarity**: Intent is explicit in the test code
3. **Performance**: Faster element lookup than text matching
4. **Accessibility**: Better screen reader support
5. **Localization**: Tests work across languages

## Notes

- Use kebab-case for testID values
- Prefix with screen/component name for clarity
- For dynamic lists, include unique identifiers (ID, index)
- Avoid generic testIDs like "button-1" — be descriptive
