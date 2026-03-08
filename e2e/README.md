# Bibo Wine Cellar - Maestro E2E Tests

End-to-end test flows for the Bibo Wine Cellar mobile app using [Maestro](https://maestro.mobile.dev/).

## Prerequisites

1. **Install Maestro**
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. **Android Emulator or iOS Simulator**
   - Android: Install Android Studio with an AVD (API 30+)
   - iOS: Xcode with a simulator (iOS 14+)

3. **Build the App**
   - For Android: `npx expo prebuild --platform android` then build APK/AAB
   - For iOS: `npx expo prebuild --platform ios` then build via Xcode
   - Or use `eas build` for cloud builds

## Configuration

1. **Update App ID**
   
   Edit `config.yaml` and replace the placeholder app ID with your actual bundle identifier:
   ```yaml
   appId: com.yourcompany.winecellar # Update this
   ```

2. **Set Test Credentials**
   
   The tests use environment variables for login credentials. Update in `config.yaml`:
   ```yaml
   env:
     TEST_EMAIL: your-test-email@example.com
     TEST_PASSWORD: your-test-password
   ```

## Running Tests

### Run Individual Flows

```bash
# Run a specific test flow
maestro test e2e/flows/01-login.yaml

# Run with app ID override
maestro test --app-id com.myapp e2e/flows/01-login.yaml
```

### Run Full Test Suite

```bash
# Run all flows in sequence
maestro test e2e/flows/00-full-suite.yaml
```

### Run with Device Selection

```bash
# List available devices
maestro test --list-devices

# Run on specific device
maestro test --device "Pixel_7_API_33" e2e/flows/01-login.yaml
```

### Continuous Mode (Watch for Changes)

```bash
# Re-run tests on file changes
maestro test --continuous e2e/flows/01-login.yaml
```

## Test Flows

| Flow | File | Description |
|------|------|-------------|
| Reset State | `00-reset-state.yaml` | Clear app data and keychain |
| Login | `01-login.yaml` | Sign in with test credentials |
| Browse Inventory | `02-browse-inventory.yaml` | Navigate inventory, use search/filters |
| Wine Detail | `03-wine-detail.yaml` | View wine information |
| Consume Wine | `04-consume-wine.yaml` | Record bottle consumption |
| Cellars Navigation | `05-cellars-navigation.yaml` | Browse cellars, spaces, racks |
| Rack Interaction | `06-rack-interaction.yaml` | Add bottles to rack slots |
| Home Screen | `07-home-screen.yaml` | Verify dashboard elements |
| Analytics | `08-analytics.yaml` | View charts and statistics |
| Sommelier Chat | `09-sommelier-chat.yaml` | Wine pairing recommendations |
| Add Wine | `10-add-wine.yaml` | AI search and add to inventory |
| Locate in Cellar | `11-locate-in-cellar.yaml` | Find wine physical location |
| **Full Suite** | `00-full-suite.yaml` | Run all flows in sequence |

## Screenshots

Test screenshots are saved to `./screenshots/` by default. Configure location in `config.yaml`:

```yaml
screenshotDirectory: ./screenshots
```

## Adding testID Props

Many flows currently use approximate `point:` coordinates for tapping elements. For more reliable tests:

1. **See `TESTID-TODO.md`** for a complete list of components that need testID props
2. **Add testID props** to React Native components:
   ```tsx
   <TouchableOpacity testID="login-submit-button">
   ```
3. **Update flows** to use testID instead of coordinates:
   ```yaml
   # Before (fragile)
   - tapOn:
       point: "50%,80%"
   
   # After (reliable)
   - tapOn:
       id: "login-submit-button"
   ```

## Troubleshooting

### Tests fail with "Element not found"

- Check if the app is fully loaded (`waitForAnimationToEnd`)
- Verify text/element exists (use `optional: true` for variable content)
- Add testID props for more reliable selectors

### Tests timeout

- Increase timeout in config.yaml: `timeout: 15000`
- Add explicit waits: `waitForAnimationToEnd: { timeout: 5000 }`

### Screenshots not saving

- Ensure `screenshotDirectory` exists or Maestro can create it
- Check file permissions

### Login fails

- Verify `TEST_EMAIL` and `TEST_PASSWORD` are correct
- Check if test account exists in the backend
- Ensure backend API is running and accessible

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash
      
      - name: Build iOS app
        run: |
          npx expo prebuild --platform ios
          xcodebuild -workspace ios/App.xcworkspace -scheme App -sdk iphonesimulator
      
      - name: Run E2E tests
        run: maestro test e2e/flows/00-full-suite.yaml
      
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: e2e/screenshots/
```

## Development Workflow

1. **Write feature** → Add testID props
2. **Write Maestro flow** → Test locally
3. **Commit** → CI runs full suite
4. **Review** → Check screenshots on failures

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Maestro Cloud](https://cloud.mobile.dev/) - Run tests on real devices
- [TESTID-TODO.md](./TESTID-TODO.md) - Components needing testID props

## Next Steps

- [ ] Build APK/IPA for testing
- [ ] Add testID props (see TESTID-TODO.md)
- [ ] Update flows to use testID instead of coordinates
- [ ] Set up CI/CD pipeline
- [ ] Add more test flows for edge cases
- [ ] Test on real devices via Maestro Cloud
