# Bibo Mobile E2E Tests (Maestro)

Maestro E2E test flows for the Bibo Wine Cellar mobile app.

## Prerequisites

1. **Install Maestro**:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. **Start Android Emulator** or connect physical device

3. **Start Expo dev server**:
   ```bash
   cd /home/robin/projects/bibo/wine-cellar-mobile
   npm start
   ```

4. **Load app on device/emulator**:
   - Scan QR code or press 'a' for Android

## Running Tests

### Single Flow
```bash
maestro test e2e/login.yaml
```

### All Flows
```bash
maestro test e2e/
```

### Specific Flows
```bash
# Core flows
maestro test e2e/login.yaml
maestro test e2e/home-screen.yaml
maestro test e2e/browse-inventory.yaml

# Wine management
maestro test e2e/wine-detail.yaml
maestro test e2e/consume-wine.yaml
maestro test e2e/scan-wine.yaml

# Physical cellar
maestro test e2e/cellars-navigation.yaml
maestro test e2e/rack-interaction.yaml
maestro test e2e/bin-interaction.yaml

# Analytics
maestro test e2e/analytics.yaml
```

## Test Flows

| Flow | Description | Duration |
|------|-------------|----------|
| `login.yaml` | Login with credentials | ~10s |
| `home-screen.yaml` | Verify home screen elements (stats, actions, suggestions) | ~15s |
| `browse-inventory.yaml` | Navigate inventory, search, filter | ~20s |
| `wine-detail.yaml` | Tap wine card, view detail screen | ~10s |
| `consume-wine.yaml` | Open bottle, rate, confirm consumption | ~25s |
| `cellars-navigation.yaml` | Navigate Cellars → Space → Rack | ~20s |
| `rack-interaction.yaml` | Tap slot, place bottle in grid rack | ~15s |
| `bin-interaction.yaml` | Add bottles to bin rack | ~15s |
| `scan-wine.yaml` | Open scan modal, verify camera/search loads | ~10s |
| `analytics.yaml` | View analytics charts and stats | ~15s |

## Configuration

- **App ID**: `host.exp.Exponent` (Expo Go for dev)
- **Production**: Update `appId` to `com.yourcompany.winecellar` in `config.yaml` and all flows

## Test Data

Tests assume:
- Valid test account: `test@example.com` / `password123`
- Existing inventory with wines
- At least one cellar with spaces and racks

## Known Limitations

### Missing testIDs
Most screens don't have `testID` props yet. Tests use:
- Text matching (fragile)
- Point coordinates (approximate)
- Relative positions

**See `TESTID-TODO.md` for full list of needed testIDs.**

### Workarounds
- Point coordinates are approximate — may need adjustment for different screen sizes
- Some flows use `when:visible` conditional blocks for defensive testing
- Modal dismissal uses `back` as fallback

## Adding TestIDs

To make tests more reliable, add testIDs to components:

```tsx
<TouchableOpacity testID="home-add-wine-button" onPress={handlePress}>
  <Text>Add a Wine</Text>
</TouchableOpacity>
```

Then update tests:
```yaml
- tapOn:
    id: "home-add-wine-button"
```

## Debugging

### View Maestro hierarchy
```bash
maestro hierarchy
```

### Run with verbose logging
```bash
maestro test --debug e2e/login.yaml
```

### Take screenshots manually
Add to any flow:
```yaml
- takeScreenshot: "debug-screenshot"
```

Screenshots saved to: `~/.maestro/tests/<timestamp>/screenshots/`

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Maestro Tests
  run: |
    maestro test e2e/ --format junit --output test-results.xml
```

### Maestro Cloud
```bash
maestro cloud --apiKey $MAESTRO_API_KEY e2e/
```

## Resources

- [Maestro Docs](https://maestro.mobile.dev)
- [Maestro CLI Reference](https://maestro.mobile.dev/reference/commands)
- [Bibo Mobile Repo](https://github.com/your-org/wine-cellar-mobile)

## Troubleshooting

### "App not found"
- Ensure app is installed and running on device/emulator
- Check `appId` in flow files matches your app

### "Element not found"
- Screenshot the current screen: `maestro hierarchy`
- Verify text/element exists
- Add `waitForAnimationToEnd` before assertions

### Flaky tests
- Increase timeouts: `timeout: 5000`
- Add explicit waits: `waitForAnimationToEnd`
- Use testIDs instead of text matching

### Point coordinates wrong
- Different screen sizes need different coordinates
- Use testIDs for reliability
- Fallback: use relative percentage points (50%, 25%, etc.)
