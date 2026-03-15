# Sommelier AI — Design Specification

**Version:** 1.0  
**Designer:** Johnny  
**Last Updated:** 2026-03-08  
**Status:** ✅ Approved by Robin

---

## Design Philosophy

The Sommelier AI experience is designed to feel **warm, inviting, and approachable** — like texting a knowledgeable friend, not using a premium service.

- **Light & warm:** Cream/beige backgrounds, cozy wine bar vibes — NOT dark or premium
- **Approachable over impressive:** This is a friend, not a Michelin sommelier
- **Conversational & casual:** Something you'd open daily, not for special occasions

---

## Color Palette

### Sommelier Colors

```css
/* Backgrounds */
--bg-warm-start: #fef9f5;
--bg-warm-end: #f8f0e8;
--bg-gradient: linear-gradient(180deg, #fef9f5 0%, #f8f0e8 100%);

/* Accents */
--bordeaux: #722F37;
--bordeaux-light: rgba(114, 47, 55, 0.1);
--bordeaux-glow: rgba(114, 47, 55, 0.15);

/* Text */
--text-primary: #2c1810;
--text-secondary: #8a7568;
--text-tertiary: #b5a89e;

/* Surfaces */
--card-bg: #FFFFFF;
--card-shadow: 0 2px 8px rgba(44, 24, 16, 0.06);
--card-selected-bg: rgba(114, 47, 55, 0.05);
```

### Consistent with Main App

| Element | Value |
|---------|-------|
| Background | Warm cream gradient (#fef9f5 → #f8f0e8) |
| Cards | White with soft warm shadow |
| Accent | Bordeaux (#722F37) — highlights only |
| Text | Dark brown (#2c1810) |
| Secondary text | Warm gray (#8a7568) |

---

## Component Patterns

### Card Style
- **Border radius:** 14-20px (large, soft)
- **Background:** `#FFFFFF`
- **Border:** none (shadow defines edges)
- **Shadow:** `0 2px 8px rgba(44, 24, 16, 0.06)` — soft warm shadow
- **Selected border:** `2px solid #722F37` with `background: rgba(114, 47, 55, 0.05)`
- **Padding:** 12-24px

### Button Style
- **Primary (Bordeaux):**
  - Background: `linear-gradient(135deg, #722F37, #944654)`
  - Border radius: 16px
  - Padding: 16px 32px
  - Shadow: `0 4px 12px rgba(114, 47, 55, 0.5)`
  - Pressed state: `scale(0.98)`
- **Secondary (Translucent):**
  - Background: `rgba(255, 255, 255, 0.08)`
  - Border: 1px `rgba(255, 255, 255, 0.2)`
  - Border radius: 12px
  - Hover: increase background to `0.12`

### Typography
- **Display (Titles):** 28px, weight 800, white
- **Subtitle:** 14px, weight 500, `rgba(255,255,255,0.5)`
- **Body:** 15px, weight 500, white
- **Caption:** 13px, weight 400, `rgba(255,255,255,0.3)`

### Progress Bar
- **Track:** `rgba(255, 255, 255, 0.1)`, height 4px, rounded
- **Fill:** Bordeaux gradient, rounded
- **Animation:** Smooth spring transition (200ms)

---

## Screen Specifications

### 1. Onboarding Screen 1: Color Preference

**File:** `sommelier-onboarding-01-color.png` / `onboarding-1-color_preference.png`

**Layout:**
- Progress bar (top, 1/8 complete)
- Skip button (top right, "Skip" text in white 0.5 alpha)
- Card number (top left, "1/8" in small text)
- Title: "What's calling you?" (28px, bold, white)
- Subtitle: "Pick the color that speaks to your heart" (14px, white 0.5)
- Three emoji options in a horizontal row:
  - 🍷 Red
  - 🥂 White & sparkling
  - 🌹 Rosé
- Continue button (bottom, full width, Bordeaux gradient)

**Interactions:**
- **Tap emoji card** → Select (card scales to 1.05x, emoji scales to 1.2x, bordeaux glow appears)
- **Continue button** → Advance to card 2 (disabled if no selection)
- **Skip** → Advance to card 2 (mark as skipped)

**Data:**
- **API endpoint:** `GET /api/profile/onboarding` returns schema
- **Field:** `color_preference` (string: "red" | "white" | "rose")
- **Stored in:** Onboarding state → submitted on card 8

**Design notes:**
- Emoji cards are 100x100px, rounded 20px, background `rgba(255,255,255,0.05)`
- Selected state adds 2px bordeaux border and shadow glow
- Continue button is sticky at bottom with 16px margin

---

### 2. Onboarding Screen 2: Adventure Level

**File:** `sommelier-onboarding-02-adventure.png` / `onboarding-2-adventure_level.png`

**Layout:**
- Progress bar (2/8 complete)
- Title: "How adventurous?"
- Subtitle: "Should I play it safe or push your palate?"
- Slider with 3 stops:
  - 🛡️ Play it safe (left)
  - 🧭 Some adventure (center)
  - 🚀 Full explorer (right)
- Each stop has emoji + label
- Active stop highlighted with bordeaux glow
- Continue button (bottom)

**Interactions:**
- **Drag slider** → Snap to nearest stop (haptic feedback)
- **Tap stop** → Jump to that position
- **Continue** → Advance to card 3

**Data:**
- **Field:** `adventure_level` (number: 1 | 2 | 3)

**Design notes:**
- Slider track is 4px tall, rounded, `rgba(255,255,255,0.1)`
- Filled portion is bordeaux gradient
- Thumb is 32px circle, white with bordeaux shadow
- Emoji labels are 40px above slider

---

### 3. Onboarding Screen 3: Region Picks

**File:** `sommelier-onboarding-03-regions.png` / `onboarding-3-region_picks.png`

**Layout:**
- Progress bar (3/8 complete)
- Title: "Where should we explore?"
- Subtitle: "Pick up to 3 regions you'd like to discover"
- Grid of region chips (3 columns):
  - 🇫🇷 Bordeaux
  - 🇫🇷 Burgundy
  - 🇮🇹 Italy
  - 🇪🇸 Spain
  - 🇩🇪 Germany
  - 🇺🇸 California
  - 🇦🇺 Australia
  - 🇨🇱 Chile
  - 🇦🇷 Argentina
  - 🌍 All over the map
- Continue button (bottom)

**Interactions:**
- **Tap chip** → Toggle selection (max 3)
- **Tap when 3 selected** → Shake animation + toast "Max 3 regions"
- **Continue** → Advance to card 4

**Data:**
- **Field:** `region_picks` (array of strings, max 3)

**Design notes:**
- Chips are 100px wide, 48px tall, rounded 12px
- Unselected: `rgba(255,255,255,0.05)` background
- Selected: bordeaux gradient background, white text
- Grid has 12px gap between chips

---

### 4. Onboarding Screen 4: Favorite Grapes

**File:** `mockup-grapes-onboarding.png` / `onboarding-4-favorite_grapes.png`

**Layout:**
- Progress bar (4/8 complete)
- Title: "Your go-to grapes?"
- Subtitle: "Pick the varieties you always come back to"
- Grid of grape chips (2 columns):
  - 🍇 Cabernet Sauvignon
  - 🍇 Merlot
  - 🍇 Pinot Noir
  - 🍷 Syrah / Shiraz
  - 🍇 Chardonnay
  - 🥂 Sauvignon Blanc
  - 🍇 Riesling
  - 🌿 Chenin Blanc
  - *(and more...)*
- Continue button (bottom)

**Interactions:**
- **Tap chip** → Toggle selection (no max limit)
- **Continue** → Advance to card 5

**Data:**
- **Field:** `favorite_grapes` (array of strings)

**Design notes:**
- Same chip style as regions
- Scrollable grid if content exceeds screen
- Selected chips show checkmark icon

---

### 5. Onboarding Screen 5: Dislikes

**File:** `mockup-dislikes-redesign.png` / `onboarding-5-dislikes.png`

**Layout:**
- Progress bar (5/8 complete)
- Title: "What kills the vibe?"
- Subtitle: "Anything you'd rather avoid?"
- Grid of dislike chips:
  - 🌳 Too oaky
  - 🍬 Too sweet
  - 🔥 Too hot (high alcohol)
  - 🍋 Too acidic
  - 🧱 Too tannic
  - 💸 Too pricey
  - *(and more...)*
- Continue button (bottom)

**Interactions:**
- **Tap chip** → Toggle selection
- **Skip** → Skip to card 6 (this is optional)

**Data:**
- **Field:** `dislikes` (array of strings)

**Design notes:**
- Similar grid to grapes/regions
- Uses warning/negative emoji for each option

---

### 6. Onboarding Screen 6: Budget

**File:** `mockup-budget.png` / `onboarding-6-budget.png`

**Layout:**
- Progress bar (6/8 complete)
- Title: "What's the sweet spot?"
- Subtitle: "Your typical bottle budget"
- Three price range options (vertical stack):
  - 💰 Under $20
  - 💰💰 $20–$50
  - 💰💰💰 $50+
- Continue button (bottom)

**Interactions:**
- **Tap option** → Select (radio button behavior)
- **Continue** → Advance to card 7

**Data:**
- **Field:** `budget` (string: "under_20" | "20_50" | "50_plus")

**Design notes:**
- Each option is a large card (full width minus margins)
- Selected card has bordeaux gradient background
- Unselected cards are translucent white

---

### 7. Onboarding Screen 7: Frequency

**File:** `mockup-frequency.png` / `onboarding-7-frequency.png`

**Layout:**
- Progress bar (7/8 complete)
- Title: "How often do you open a bottle?"
- Subtitle: "Helps me pace recommendations"
- Three frequency options:
  - 🍷 Once in a while
  - 🍷🍷 A few times a week
  - 🍷🍷🍷 Daily ritual
- Continue button (bottom)

**Interactions:**
- **Tap option** → Select
- **Continue** → Advance to card 8

**Data:**
- **Field:** `frequency` (string: "once_while" | "few_week" | "daily")

---

### 8. Onboarding Screen 8: Goals

**File:** `sommelier-onboarding-08-goals.png` / `onboarding-8-goals.png`

**Layout:**
- Progress bar (8/8 complete)
- Title: "What brings you here?"
- Subtitle: "Tell me what you're hoping to explore"
- Large textarea input (multiline, 5 rows)
- Placeholder: "I want to learn more about natural wines..."
- Continue button (bottom, now says "Let's Begin")

**Interactions:**
- **Type in textarea** → Enable continue button
- **Continue** → Submit onboarding data to API, navigate to chat screen

**Data:**
- **Field:** `goals` (string, free text)
- **API call:** `POST /api/profile/onboarding` with full onboarding object

**Design notes:**
- Textarea has translucent background, white text, 16px padding
- Continue button says "Let's Begin" instead of "Continue"
- This is the final card before entering main sommelier experience

---

### 9. Chat Interface (Welcome State)

**File:** `mockup-sommelier-welcome.png`

**Layout:**
- Warm cream gradient background
- Centered content:
  - Large sommelier avatar (🍷, 80px)
  - Name: "Vin" (24px, bold, white)
  - Tagline: "Your wine companion" (14px, white 0.5)
  - Welcome message card:
    - "Hey there! I'm Vin, your personal sommelier..."
    - Soft glow around card
- Quick action chips:
  - "What pairs with salmon?"
  - "Suggest a red under $30"
  - "Tell me about Bordeaux"
- Input bar at bottom:
  - Textarea input (translucent background)
  - New conversation button (+)
  - Send button (Bordeaux gradient, disabled until text entered)

**Interactions:**
- **Tap quick action chip** → Auto-fill input, send message
- **Type in input** → Enable send button
- **Tap send** → Post message, show typing indicator, append response

**Data:**
- **API:** `POST /api/chat/sommelier` with `{ message: string }`
- **Response:** `{ message: string, suggestions: WineSuggestion[], conversationId: string }`

**Design notes:**
- This is the first screen after onboarding
- Quick actions are contextual suggestions to get users started
- Input bar is sticky at bottom with blur background

---

### 10. Chat Interface (Active Conversation)

**File:** `sommelier-chat.png` / `mockup-chat-interface.png`

**Layout:**
- Header:
  - Back button (left)
  - Sommelier avatar + "Vin" (center)
  - Menu button (⋯, right)
- Message list (scrollable):
  - User messages (right-aligned, bordeaux gradient bubble)
  - Sommelier messages (left-aligned, light warm bubble with avatar)
  - Wine suggestion cards (embedded in sommelier messages)
- Input bar (bottom):
  - Textarea
  - New conversation button (+)
  - Send button

**Interactions:**
- **Scroll up** → Load more messages (if conversation is long)
- **Tap wine suggestion card** → Navigate to wine detail screen
- **Tap new conversation (+)** → Clear chat, start fresh
- **Tap menu (⋯)** → Show options (view profile, conversation history)

**Data:**
- **Load conversation:** `GET /api/chat/:conversationId`
- **Send message:** `POST /api/chat/sommelier` with `{ message, conversationId }`

**Design notes:**
- Messages fade in from bottom with spring animation
- Wine suggestion cards have white background with soft shadow
- Typing indicator (three dots) appears while waiting for response

---

### 11. Wine Suggestion Card (Embedded)

**File:** `mockup-wine-dna.png` (shows example wine card)

**Layout (within chat message):**
- White card with rounded corners (16px)
- Wine color dot (left, 12px circle)
- Wine name (bold, 16px)
- Producer + vintage (14px, gray)
- Pairing note (italic, 13px, lighter gray)
- "Open from cellar" button (Bordeaux, small)

**Interactions:**
- **Tap card** → Navigate to `WineDetailScreen` with `wineId`
- **Tap "Open from cellar"** → Same as tap card

**Data:**
- **Wine data from API response:**
  ```json
  {
    "wineId": "uuid",
    "name": "Château Margaux",
    "producer": "Château Margaux",
    "vintage": 2015,
    "color": "red",
    "pairingNote": "Perfect with your ribeye steak"
  }
  ```

**Design notes:**
- This component is rendered inside sommelier message bubbles
- Multiple wine cards can appear in one message
- If wine is not in cellar, show "Add to wishlist" instead

---

### 12. Conversation List

**File:** `sommelier-conversation-list.png` / `mockup-conversation-list.png`

**Layout:**
- Header:
  - Title: "Conversations" (24px, bold, white)
  - Subtitle: "Chat history with Vin" (14px, white 0.5)
  - New conversation button (+ icon, top right)
- ScrollView of conversation cards:
  - Avatar (🍷, 48px)
  - Title (auto-generated or "New conversation")
  - Last message preview (truncated, white 0.5)
  - Timestamp (relative, e.g., "2h ago")
  - Message count badge (small bordeaux circle)

**Interactions:**
- **Tap conversation** → Navigate to chat with `conversationId`
- **Swipe left** → Show delete/archive action
- **Tap new conversation (+)** → Navigate to fresh chat

**Data:**
- **API:** `GET /api/chat/conversations`
- **Response:** Array of `{ id, title?, lastMessage, timestamp, messageCount }`

**Design notes:**
- Conversations are sorted by most recent first
- Empty state shows "No conversations yet" with prompt to start one
- Each card has translucent background

---

### 13. Taste Profile Dashboard

**File:** `sommelier-taste-profile.png`

**Layout:**
- Header:
  - Title: "Your Wine DNA" (24px, bold, white)
  - Subtitle: "Based on 42 bottles and 8 conversations" (14px, white 0.5)
  - Edit button (top right)
- Scrollable sections:
  1. **Color Preference:**
     - Horizontal bar chart (red 60%, white 30%, rosé 10%)
     - Each segment colored (red, white, pink)
  2. **Adventure Level:**
     - Slider visualization (emoji + label at current position)
  3. **Top Regions:**
     - List with flag emoji, name, bottle count, percentage bar
     - Example: 🇫🇷 Bordeaux — 12 bottles (29%)
  4. **Favorite Grapes:**
     - Grid of chips (same style as onboarding)
  5. **What You Avoid:**
     - Grid of chips (dislikes)
  6. **Journey Stats:**
     - 2x2 grid of stat cards:
       - Bottles in cellar
       - Unique wines
       - Producers discovered
       - Bottles consumed
  7. **Style Tags:**
     - Chips with AI-generated style descriptors
     - Examples: "Red-dominant", "Open to adventure", "Bordeaux lover"

**Interactions:**
- **Tap Edit** → Navigate to onboarding flow (pre-filled with current data)
- **Scroll** → View all sections

**Data:**
- **API:** `GET /api/profile/taste`
- **Response:** Full `TasteProfile` object with analytics

**Design notes:**
- This is a read-only dashboard (edit navigates to onboarding)
- Stats are dynamically calculated based on cellar + conversation history
- Uses same card style as rest of sommelier experience

---

### 14. Sommelier Identity Screen

**File:** `sommelier-identity.png`

**Layout:**
- Full-screen warm gradient
- Large sommelier avatar (center, 120px)
- Name: "Vin" (32px, bold, white)
- Tagline: "Your personal sommelier" (16px, white 0.5)
- Bio card:
  - "I'm here to help you discover wines you'll love..."
  - Scrollable text
- Quick stats:
  - Conversations: 23
  - Recommendations: 145
  - Wines suggested: 89
- Back button (top left)

**Interactions:**
- **Tap back** → Return to chat or profile

**Data:**
- **Static content** (sommelier persona)
- **Stats from API:** `GET /api/chat/stats`

**Design notes:**
- This is a profile/about screen for the sommelier itself
- Accessible from chat menu (⋯)
- Reinforces personality and builds trust

---

## File Organization

All approved mockups are located at:  
`/home/robin/.openclaw/workspace-johnny/`

### Main App Structure
- `home-with-analytics-widget.png` — Home screen with analytics widget integrated (Option A)
- `bottom-bar-final-layout.png` — Bottom navigation bar final layout

### Onboarding Flow
- `sommelier-onboarding-01-color.png` (also: `onboarding-1-color_preference.png`)
- `sommelier-onboarding-02-adventure.png` (also: `onboarding-2-adventure_level.png`)
- `sommelier-onboarding-03-regions.png` (also: `onboarding-3-region_picks.png`)
- `onboarding-4-favorite_grapes.png` (also: `mockup-grapes-onboarding.png`)
- `onboarding-5-dislikes.png` (also: `mockup-dislikes-redesign.png`)
- `onboarding-6-budget.png` (also: `mockup-budget.png`)
- `onboarding-7-frequency.png` (also: `mockup-frequency.png`)
- `sommelier-onboarding-08-goals.png` (also: `onboarding-8-goals.png`)

### Chat Experience
- `mockup-sommelier-welcome.png` — Welcome state
- `sommelier-chat.png` — Active conversation
- `mockup-chat-interface.png` — Alternative chat layout
- `mockup-wine-dna.png` — Wine suggestion card example

### History & Profile
- `sommelier-conversation-list.png` — Conversation history
- `mockup-conversation-list.png` — Alternative history layout
- `sommelier-taste-profile.png` — Taste profile dashboard
- `sommelier-identity.png` — Sommelier about screen

### Supplementary Mockups
- `mockup-onboarding-1.png` through `mockup-onboarding-8.png` — Earlier iterations
- `mockup-regions.png` — Region selection standalone
- `mockup-grapes.png` / `mockup-grapes-v2.png` / `mockup-grapes-full.png` — Grape selection iterations
- `mockup-wine-type.png` — Wine type selector

---

## API Integration Points

### Onboarding
- **GET /api/profile/onboarding**
  - Returns question schema (questions, options, validations)
- **POST /api/profile/onboarding**
  - Body: `OnboardingAnswers` object
  - Creates/updates user taste profile

### Taste Profile
- **GET /api/profile/taste**
  - Returns current `TasteProfile` with analytics

### Chat
- **POST /api/chat/sommelier**
  - Body: `{ message: string, conversationId?: string }`
  - Response: `{ message: string, suggestions: WineSuggestion[], conversationId: string }`
- **GET /api/chat/conversations**
  - Returns list of conversations
- **GET /api/chat/:conversationId**
  - Returns full conversation history

### Stats
- **GET /api/chat/stats**
  - Returns conversation/recommendation counts for sommelier identity screen

---

## Design Tokens Summary

```typescript
export const SommelierDesignTokens = {
  // Spacing
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Border radius
  borderRadius: {
    sm: 12,
    md: 16,
    lg: 20,
    full: 999,
  },
  
  // Shadows
  shadows: {
    card: '0 4px 20px rgba(114, 47, 55, 0.3)',
    button: '0 4px 12px rgba(114, 47, 55, 0.5)',
    glow: '0 0 24px rgba(114, 47, 55, 0.4)',
  },
  
  // Typography
  typography: {
    display: { size: 28, weight: 800 },
    title: { size: 24, weight: 700 },
    subtitle: { size: 14, weight: 500 },
    body: { size: 15, weight: 500 },
    caption: { size: 13, weight: 400 },
  },
  
  // Colors (see Color Palette section above)
}
```

---

## Animation Specifications

### Onboarding Card Transitions
- **Type:** Horizontal swipe
- **Duration:** 300ms
- **Easing:** Spring (damping 0.8, stiffness 100)

### Message Bubble Entrance
- **Type:** Fade + slide from bottom
- **Duration:** 200ms
- **Easing:** Ease-out
- **Delay:** Stagger by 50ms for multiple messages

### Emoji Selection
- **Type:** Scale + glow
- **Duration:** 150ms
- **Scale:** 1.0 → 1.1
- **Shadow:** Add bordeaux glow on select

### Button Press
- **Type:** Scale
- **Duration:** 100ms
- **Scale:** 1.0 → 0.98
- **Easing:** Ease-in-out

### Typing Indicator
- **Type:** Pulsing dots (3 dots)
- **Duration:** 1200ms loop
- **Pattern:** Stagger each dot by 200ms

---

## Implementation Notes

### React Native Components
- **Onboarding:** Use `react-native-swiper` or `react-native-pager-view`
- **Chat:** Use `FlatList` with `inverted` prop
- **Input:** Use `TextInput` with `multiline` and dynamic height
- **Animations:** Use `react-native-reanimated` for smooth 60fps

### Gradient Implementation
```javascript
import LinearGradient from 'react-native-linear-gradient';

<LinearGradient
  colors={['#fef9f5', '#f8f0e8']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.background}
/>
```

### Accessibility
- All interactive elements: min 44x44 tap target
- VoiceOver labels on all icons
- Color contrast meets WCAG AA (dark text on light background)
- Keyboard types: `default` for text, `multiline` for textarea

---

## Edge Cases & Error States

1. **Network Failure:**
   - Show toast error message
   - Preserve user input (don't lose typed message)
   - Retry button on conversation list

2. **Empty States:**
   - No conversations: "Start your first conversation with Vin"
   - No cellar wines: Sommelier still chats, but suggests wines to add

3. **Long Messages:**
   - Textarea expands to max 100px, then scrolls internally
   - Sommelier responses truncate at 300 words (with "..." and expand button)

4. **Onboarding Skip:**
   - Users can skip optional questions (cards 5, 8)
   - Profile built from available data only

5. **Stale Taste Profile:**
   - Refresh on demand (pull-to-refresh on profile screen)
   - Auto-update after adding 5+ new wines

---

## Testing Scenarios

- [ ] Complete full onboarding flow (8 cards)
- [ ] Send chat message and receive response
- [ ] Tap wine suggestion → navigate to detail screen
- [ ] Create new conversation, switch between conversations
- [ ] Edit taste profile (navigate to onboarding with pre-filled values)
- [ ] Test all empty states (no conversations, no cellar)
- [ ] Test network errors (retry, preserve input)
- [ ] Test onboarding skip logic
- [ ] Verify animations (60fps on device)
- [ ] Test VoiceOver (iOS) and TalkBack (Android)

---

## Handoff to Dev (Gilfoyle)

When approved, send to Bibo Dev via:
```
sessions_send(
  sessionKey: "agent:gilfoye:main",
  message: "Robin approved sommelier designs. See full spec at: /home/robin/.openclaw/workspace-johnny/sommelier-design-spec.md. All mockups in same directory. Ready for implementation."
)
```

Include:
- This design spec document path
- Mockup file paths
- API endpoint references (see above)
- Component structure recommendations

---

---

## Main App Navigation Structure

### Bottom Navigation Bar (Final)

**Decision Date:** 2026-03-08  
**Selected Option:** A — Sommelier replaces Analytics in bottom bar

**Tab Layout (Left to Right):**

1. **🏠 Home**
   - Dashboard view
   - Quick actions (Add Bottle, Browse)
   - Analytics insights widget (embedded)
   - Recently added bottles

2. **📦 Inventory**
   - Full bottle list
   - Filtering and sorting
   - Batch operations

3. **📷 Scan (Center Elevated)**
   - Camera/barcode scanner
   - Quick bottle add
   - Visual prominence (elevated 30px above bar)
   - Bordeaux gradient circle (56px diameter)
   - White border (4px)
   - Shadow: `0 8px 24px rgba(114, 47, 55, 0.3)`

4. **🍷 Sommelier**
   - AI wine assistant chat
   - Conversational recommendations
   - Taste profile access
   - Replaces Analytics tab (analytics moved to Home)

5. **🏛️ Cellars**
   - Storage location management
   - Physical organization
   - Capacity tracking

**Design Rationale:**
- Scan button elevated for primary action emphasis
- Sommelier gets dedicated tab for personalized experience
- Analytics embedded in Home as insights widget (more discoverable)

---

### Home Screen Analytics Widget

**Integration:** Inline insights card on Home screen  
**Position:** Below quick actions, above recent bottles  
**Tap Action:** Opens full analytics page

**Widget Layout:**
```
┌─────────────────────────────────────┐
│ 📊 Cellar Insights  View Full Analytics → │
│                                         │
│  ┌──────┐  ┌──────┐                    │
│  │  42  │  │$1,840│                    │
│  │Bottles│  │Value │                    │
│  └──────┘  └──────┘                    │
│  ┌──────┐  ┌──────┐                    │
│  │  12  │  │  6   │                    │
│  │Ready │  │Regions│                   │
│  └──────┘  └──────┘                    │
│                                         │
│  [Mini Bar Chart Preview]              │
└─────────────────────────────────────┘
```

**Metrics Displayed (2x2 Grid):**
- Total Bottles (count)
- Collection Value (currency)
- Ready to Drink (count)
- Regions (count)

**Chart Preview:**
- Compact bar chart (80px height)
- 5 bars showing distribution (e.g., by region, color, or time)
- Gradient: `rgba(114, 47, 55, 0.05)` → `rgba(114, 47, 55, 0.1)`
- Bar color: Bordeaux gradient

**Card Style:**
- Background: white
- Border radius: 20px
- Padding: 24px
- Shadow: `0 4px 20px rgba(114, 47, 55, 0.08)`

**Interactions:**
- Tap "View Full Analytics" link → Navigate to full analytics page
- Tap widget card → Same action as link
- No inline interactions (filtering, date ranges) — keeps widget simple

**Data Source:**
- **API:** `GET /api/analytics/summary`
- **Response:**
  ```json
  {
    "totalBottles": 42,
    "collectionValue": 1840,
    "readyToDrink": 12,
    "regions": 6,
    "chartData": [
      { "label": "Bordeaux", "value": 30 },
      { "label": "Burgundy", "value": 65 },
      { "label": "Italy", "value": 45 },
      { "label": "Spain", "value": 80 },
      { "label": "Other", "value": 55 }
    ]
  }
  ```

**Full Analytics Page:**
- Accessible via widget tap-through or direct navigation
- Comprehensive charts (color distribution, region breakdown, value over time)
- Date range filters
- Export options
- Detailed insights (most valuable bottle, fastest drinking, etc.)

---

**Design Status:** ✅ Approved  
**Next Step:** Hand off to Gilfoyle for implementation
