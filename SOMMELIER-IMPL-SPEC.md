# Sommelier Feature — Complete Implementation Spec

## 🎯 Overview
This is the heart of Bibo: an AI sommelier that helps users discover wines through conversational chat. The feature includes onboarding, chat interface, conversation history, and taste profile views.

---

## 🎨 Design System

### Core Constants
- **Wine-red accent:** `#722F37`
- **Viewport:** 390×844px (iPhone 13/14/15)
- **Background gradient:** `linear-gradient(135deg, #fef9f5 0%, #f8f4f0 100%)`
- **Card style:** white background, `border-radius: 16-20px`, `box-shadow: 0 4px 20px rgba(114, 47, 55, 0.08)`
- **Typography:** `-apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif`

### Custom SVG Icons

#### Purple-Red Grape (for red wines)
```svg
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="24" r="6" fill="#722F37" opacity="0.9"/>
  <circle cx="14" cy="18" r="5" fill="#8B3A47" opacity="0.85"/>
  <circle cx="26" cy="18" r="5" fill="#8B3A47" opacity="0.85"/>
  <circle cx="20" cy="12" r="4.5" fill="#9A4755" opacity="0.8"/>
  <circle cx="14" cy="24" r="5.5" fill="#6B2833" opacity="0.9"/>
  <circle cx="26" cy="24" r="5.5" fill="#6B2833" opacity="0.9"/>
  <path d="M20 6 Q18 2, 15 4 T20 12" stroke="#5A7A4D" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="17" cy="7" rx="2" ry="3" fill="#6FA856" opacity="0.7"/>
</svg>
```

#### Green-White Grape (for white wines)
```svg
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="24" r="6" fill="#D4E6B5" opacity="0.9"/>
  <circle cx="14" cy="18" r="5" fill="#C8DFA8" opacity="0.85"/>
  <circle cx="26" cy="18" r="5" fill="#C8DFA8" opacity="0.85"/>
  <circle cx="20" cy="12" r="4.5" fill="#BDD79B" opacity="0.8"/>
  <circle cx="14" cy="24" r="5.5" fill="#E2F0CB" opacity="0.9"/>
  <circle cx="26" cy="24" r="5.5" fill="#E2F0CB" opacity="0.9"/>
  <path d="M20 6 Q18 2, 15 4 T20 12" stroke="#5A7A4D" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="17" cy="7" rx="2" ry="3" fill="#6FA856" opacity="0.7"/>
</svg>
```

---

## 📱 Navigation Changes

### New Bottom Tab Bar (5 tabs)
**Order:** Home → Inventory → 📷 Scan → Sommelier → Cellars

```jsx
// TabNavigator.jsx update
const tabs = [
  { name: 'Home', icon: 'home', component: HomeScreen },
  { name: 'Inventory', icon: 'wine-bottle', component: InventoryScreen },
  { 
    name: 'Scan', 
    icon: 'camera',
    component: ScanScreen,
    style: 'center' // Larger, elevated center button
  },
  { name: 'Sommelier', icon: 'message-circle', component: SommelierStack },
  { name: 'Cellars', icon: 'archive', component: CellarsScreen },
];

// Center button styling:
// - 56×56px button (vs 40×40 for others)
// - Raised 8px above tab bar
// - Wine-red background (#722F37)
// - White icon
// - box-shadow: 0 4px 16px rgba(114, 47, 55, 0.3)
```

### New Navigator: SommelierStack
```jsx
// SommelierStack.jsx (new file)
const SommelierStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SommelierOnboarding" component={SommelierOnboardingScreen} />
    <Stack.Screen name="ConversationList" component={ConversationListScreen} />
    <Stack.Screen name="Chat" component={SommelierChatScreen} />
    <Stack.Screen name="TasteProfile" component={TasteProfileScreen} />
  </Stack.Navigator>
);
```

---

## 🖼️ Screen Specifications

### 1. Home Screen (Updated)

**Changes:**
- Add Analytics Widget inline (above "Quick Actions" section)

**Analytics Widget:**
- **Location:** Between hero card and "Quick Actions"
- **Dimensions:** Full-width card, 120px height
- **Background:** White card with standard shadow
- **Layout:**
  ```
  [Icon] Collection Value        [ChevronRight]
         $X,XXX
  [Icon] Total Bottles: XX
  [Icon] Regions: XX
  ```
- **Tap action:** Navigate to full Analytics screen (existing)
- **Styling:**
  - Icons: 24×24px, wine-red (#722F37)
  - Title text: 14px, gray (#666)
  - Value text: 24px, bold, dark (#1a1a1a)
  - Stats text: 14px, medium, gray (#666)

**Mockup reference:** `/tmp/mockup-home-analytics.png`

---

### 2. Sommelier Onboarding Screen

**File:** `screens/SommelierOnboardingScreen.jsx`

**Purpose:** First-time setup to understand user preferences

**Layout:** 8 horizontally swipeable cards (full-screen)

#### Card 1: Welcome
```
[Grape icon cluster]
"Meet Your Sommelier"
"I'll help you discover wines you'll love"
[Continue button]
```

#### Cards 2-7: Preference Questions
Grid-style selection with custom grape icons

**Example structure (Card 2: Wine Type):**
```
"What's calling you?" (24px, bold)

[Grid: 2 columns × 2 rows]
┌─────────────┬─────────────┐
│ [RedGrape]  │ [WhiteGrape]│
│  Red Wine   │ White Wine  │
│   🍷        │    🥂       │
└─────────────┴─────────────┘
┌─────────────┬─────────────┐
│ [Grapes]    │ [Sparkles]  │
│  Rosé       │ Sparkling   │
│   🌸        │    ✨       │
└─────────────┴─────────────┘

[Skip • Continue]
```

**Questions:**
1. Welcome (intro)
2. Wine type preference (red/white/rosé/sparkling)
3. Flavor profile (fruity/earthy/bold/delicate)
4. Sweetness (dry/off-dry/sweet)
5. Price range (<$20/$20-50/$50-100/$100+)
6. Discovery style (adventurous/classic)
7. Food pairing interests (cheese/meat/seafood/vegetarian)
8. Complete ("You're all set!")

**Grid Cell Styling:**
- Size: 160×140px per cell
- Background: white
- Border: 2px solid transparent
- Selected: border-color #722F37, scale(1.05)
- Padding: 20px
- Border-radius: 16px
- Shadow: 0 2px 12px rgba(114, 47, 55, 0.06)

**Animations:**
- Icon scales from 0.9 to 1.1 on tap
- Background color fades to rgba(114, 47, 55, 0.05) when selected
- Smooth spring transition between cards (swipe or tap Continue)

**Progress Indicator:**
- Dots at bottom: 8 dots, current filled wine-red, others gray outline
- Position: 24px from bottom

**API Endpoint:**
```
POST /api/sommelier/onboarding
Body: {
  wineTypes: string[],
  flavorProfile: string[],
  sweetness: string,
  priceRange: string,
  discoveryStyle: string,
  foodPairings: string[]
}
Response: { userId, preferences, tasteProfileId }
```

**Mockup reference:** `/tmp/mockup-sommelier-onboarding.png`

---

### 3. Conversation List Screen

**File:** `screens/ConversationListScreen.jsx`

**Header:**
- Title: "Sommelier" (28px, bold)
- Right button: "New Chat" (wine-red)

**List Item:**
```
┌────────────────────────────────┐
│ "Wines for pasta night"        │ ← Title (16px, bold)
│ Yesterday, 3:42 PM              │ ← Date (14px, gray)
└────────────────────────────────┘
```

**Styling:**
- White background cards
- 16px border-radius
- 12px vertical padding, 16px horizontal
- 8px gap between items
- Tap: navigate to Chat screen with conversationId

**Empty State:**
```
[Grape cluster illustration]
"Start your first conversation"
"Ask me anything about wine"
[New Chat button]
```

**API Endpoint:**
```
GET /api/sommelier/conversations
Response: {
  conversations: [
    { id, title, lastMessageAt }
  ]
}
```

**Data Flow:**
- On mount: fetch conversations
- Pull to refresh: re-fetch
- New chat button: navigate to Chat screen (no conversationId = new)

**Mockup reference:** `/tmp/mockup-conversation-list.png`

---

### 4. Sommelier Chat Screen

**File:** `screens/SommelierChatScreen.jsx`

**Header:**
- Back button (left)
- Title: "Sommelier" (center, 17px)
- Taste Profile button (right, user avatar icon)

**Message Bubbles:**

**User message:**
- Background: white
- Text: #1a1a1a, 16px
- Align: right
- Border-radius: 20px 20px 4px 20px
- Max-width: 70%
- Padding: 12px 16px
- Shadow: 0 2px 8px rgba(0,0,0,0.04)

**AI message:**
- Background: linear-gradient(135deg, #fef5f0 0%, #fff0e8 100%)
- Text: #1a1a1a, 16px
- Align: left
- Border-radius: 20px 20px 20px 4px
- Max-width: 80%
- Padding: 12px 16px
- Shadow: 0 2px 8px rgba(114, 47, 55, 0.06)

**Wine Card (inline in AI messages):**
```
┌─────────────────────────────┐
│ [Image]  Château Something  │
│          Bordeaux 2019      │
│          $45 • 92pts        │
│          [View Details →]   │
└─────────────────────────────┘
```
- Width: 280px
- Height: 100px
- Background: white
- Border-radius: 12px
- Padding: 12px
- Tap: navigate to wine detail screen
- Image: 60×80px, rounded 8px

**Typing Indicator:**
```
[●●●] (animated pulse)
Background: gradient bubble
```

**Input Area:**
- Fixed at bottom
- Background: white with top border (1px, rgba(0,0,0,0.08))
- Padding: 12px 16px
- Text input: rounded 24px, background #f5f5f5
- Send button: wine-red circle, 36×36px, white arrow icon

**API Endpoints:**

```
POST /api/sommelier/chat
Body: {
  conversationId?: string, // omit for new conversation
  message: string
}
Response: {
  conversationId: string,
  reply: string,
  wines?: Array<{ id, name, region, vintage, price, rating, imageUrl }>
}
```

```
GET /api/sommelier/chat/:conversationId/messages
Response: {
  messages: [
    { id, role: 'user' | 'assistant', content, timestamp, wines? }
  ]
}
```

**Data Flow:**
1. On mount: if conversationId, fetch message history
2. User types → tap send → POST to /chat
3. Show typing indicator
4. Stream or receive reply → append to chat
5. If wines included → render inline wine cards
6. Auto-scroll to bottom on new message

**Mockup reference:** `/tmp/mockup-sommelier-chat.png`

---

### 5. Taste Profile Screen

**File:** `screens/TasteProfileScreen.jsx`

**Header:**
- Back button
- Title: "Your Wine DNA"
- Edit button (pencil icon, top-right)

**Layout:**

**Top Section: Flavor Wheel**
```
     [Circular chart]
    Fruity  ────●
    Earthy  ──●
    Bold    ────────●
    Delicate ──●
```
- SVG-based radar chart
- 6 axes: fruity, earthy, bold, delicate, sweet, tannic
- Filled area: rgba(114, 47, 55, 0.2)
- Line: #722F37, 2px
- Points: wine-red circles, 8px

**Preferences Section:**
```
Favorite Types
🍷 Red (85%) | 🥂 White (60%) | 🌸 Rosé (40%)

Price Range
Most comfortable: $20–50

Discovery Style
🎲 Adventurous Explorer
```

**Recommendations Section:**
```
"Based on your taste..."
[Wine card] [Wine card] [Wine card]
(Horizontal scroll)
```

**Edit Mode:**
- Tap Edit → each section becomes editable
- Sliders for flavor axes
- Toggles for wine types
- Dropdown for price range
- Buttons for discovery style

**API Endpoints:**

```
GET /api/sommelier/taste-profile
Response: {
  flavorProfile: { fruity, earthy, bold, delicate, sweet, tannic },
  wineTypes: { red, white, rose, sparkling },
  priceRange: { min, max, preferred },
  discoveryStyle: string,
  recommendations: [{ id, name, region, vintage, imageUrl, matchScore }]
}
```

```
PATCH /api/sommelier/taste-profile
Body: { flavorProfile?, wineTypes?, priceRange?, discoveryStyle? }
Response: { updated: true }
```

**Data Flow:**
1. On mount: fetch taste profile
2. Render chart and preferences
3. Tap Edit → enable editing
4. Tap Save → PATCH updates → re-fetch → exit edit mode

**Mockup reference:** `/tmp/mockup-taste-profile.png`

---

## 📦 Component Hierarchy

```
SommelierStack/
├── SommelierOnboardingScreen
│   ├── OnboardingCard (×8)
│   │   ├── GrapeIcon (custom SVG)
│   │   ├── SelectionGrid
│   │   └── ProgressDots
│   └── ContinueButton
├── ConversationListScreen
│   ├── ConversationListItem
│   └── EmptyState
├── SommelierChatScreen
│   ├── MessageBubble
│   │   ├── UserMessage
│   │   ├── AIMessage
│   │   └── WineCard (inline)
│   ├── TypingIndicator
│   └── ChatInput
└── TasteProfileScreen
    ├── FlavorWheel (SVG radar chart)
    ├── PreferenceSection
    ├── RecommendationCarousel
    └── EditButton
```

**Shared Components (create in `components/sommelier/`):**
- `GrapeIcon.jsx` (renders SVG, accepts type prop)
- `WineCard.jsx` (reusable wine display)
- `MessageBubble.jsx` (chat message wrapper)
- `FlavorWheel.jsx` (SVG radar chart)

---

## 🎬 Interaction Details

### Animations

**Onboarding Cards:**
- Swipe transition: spring animation (tension: 120, friction: 18)
- Icon selection: scale(1.05) + color change (200ms ease-out)
- Card entry: fade-in + slide-up (300ms)

**Chat:**
- Message send: slide-up from input area (250ms ease-out)
- Typing indicator: pulse animation (1.2s infinite)
- Wine card tap: scale(0.98) on press, scale(1) on release

**Taste Profile:**
- Flavor wheel: animate draw on mount (500ms)
- Edit mode: sections expand with slide animation (300ms)
- Save: success checkmark animation (600ms)

### Transitions

**Navigation:**
- Onboarding → Conversation List: fade transition (400ms)
- List → Chat: slide from right (300ms, iOS default)
- Chat → Taste Profile: modal slide from bottom (350ms)

**State Changes:**
- Selected preference: immediate highlight + scale
- API loading: skeleton loader (not spinner)
- Error: shake animation (400ms) + red border

---

## 🔄 Data Flow Summary

### Onboarding Flow
1. User opens Sommelier tab → check if onboarded
2. If not onboarded → show OnboardingScreen
3. User completes → POST /onboarding → save preferences
4. Navigate to ConversationListScreen

### Chat Flow
1. User taps "New Chat" or conversation item
2. Load ChatScreen (fetch history if conversationId exists)
3. User sends message → POST /chat
4. Receive reply (with optional wines) → render
5. Tap wine card → navigate to WineDetailScreen (existing)

### Taste Profile Flow
1. User taps profile icon in chat header
2. Fetch GET /taste-profile → render
3. Tap Edit → enable editing
4. User adjusts → tap Save → PATCH /taste-profile
5. Re-fetch → update UI → exit edit mode

---

## 🗂️ File Structure

```
mobile/
├── src/
│   ├── navigation/
│   │   ├── TabNavigator.jsx (update bottom bar)
│   │   └── SommelierStack.jsx (NEW)
│   ├── screens/
│   │   ├── HomeScreen.jsx (add analytics widget)
│   │   ├── sommelier/
│   │   │   ├── SommelierOnboardingScreen.jsx (NEW)
│   │   │   ├── ConversationListScreen.jsx (NEW)
│   │   │   ├── SommelierChatScreen.jsx (NEW)
│   │   │   └── TasteProfileScreen.jsx (NEW)
│   ├── components/
│   │   ├── sommelier/
│   │   │   ├── GrapeIcon.jsx (NEW)
│   │   │   ├── WineCard.jsx (NEW)
│   │   │   ├── MessageBubble.jsx (NEW)
│   │   │   ├── FlavorWheel.jsx (NEW)
│   │   │   ├── OnboardingCard.jsx (NEW)
│   │   │   └── TypingIndicator.jsx (NEW)
│   ├── api/
│   │   └── sommelier.js (NEW - API client functions)
│   └── assets/
│       └── icons/
│           ├── grape-red.svg (NEW)
│           └── grape-white.svg (NEW)
```

---

## 🌐 Backend API Requirements

**Base URL:** `/api/sommelier`

### Endpoints to implement:

1. **POST /onboarding**
   - Save user preferences
   - Generate initial taste profile
   - Return userId + tasteProfileId

2. **GET /conversations**
   - List user's chat history
   - Return array of { id, title, lastMessageAt }

3. **GET /chat/:conversationId/messages**
   - Fetch message history for conversation
   - Return messages with role, content, timestamp, optional wines

4. **POST /chat**
   - Accept user message + optional conversationId
   - Process with AI (GPT-4 or Claude)
   - Return reply + optional wine recommendations
   - If new conversation, generate conversationId + title

5. **GET /taste-profile**
   - Fetch user's flavor profile and preferences
   - Include wine type preferences, price range, discovery style
   - Return recommended wines based on profile

6. **PATCH /taste-profile**
   - Update user preferences
   - Re-calculate recommendations
   - Return success confirmation

---

## 📸 Mockup References

All approved mockups are located at:

1. `/tmp/mockup-home-analytics.png` - Home screen with analytics widget
2. `/tmp/mockup-sommelier-onboarding.png` - Onboarding flow (8 cards)
3. `/tmp/mockup-conversation-list.png` - Conversation list view
4. `/tmp/mockup-sommelier-chat.png` - Chat interface with wine cards
5. `/tmp/mockup-taste-profile.png` - Taste profile / Wine DNA screen

---

## ✅ Implementation Checklist

### Phase 1: Navigation & Structure
- [ ] Update TabNavigator with 5 tabs (Sommelier replaces Analytics)
- [ ] Create SommelierStack navigator
- [ ] Add analytics widget to HomeScreen
- [ ] Create placeholder screens for all 4 sommelier screens

### Phase 2: Onboarding
- [ ] Build OnboardingCard component with grid layout
- [ ] Create GrapeIcon component with SVG rendering
- [ ] Implement swipe navigation between cards
- [ ] Add selection animations (scale, color change)
- [ ] Connect POST /onboarding API
- [ ] Save user preferences locally

### Phase 3: Conversation List
- [ ] Build ConversationListScreen with list rendering
- [ ] Create ConversationListItem component
- [ ] Implement empty state
- [ ] Connect GET /conversations API
- [ ] Add pull-to-refresh
- [ ] Handle navigation to chat screen

### Phase 4: Chat Interface
- [ ] Build SommelierChatScreen layout
- [ ] Create MessageBubble component (user + AI variants)
- [ ] Build WineCard inline component
- [ ] Add TypingIndicator animation
- [ ] Implement ChatInput with send button
- [ ] Connect POST /chat and GET /messages APIs
- [ ] Add auto-scroll on new messages
- [ ] Handle wine card tap → navigate to detail

### Phase 5: Taste Profile
- [ ] Build TasteProfileScreen layout
- [ ] Create FlavorWheel SVG radar chart component
- [ ] Build preference display sections
- [ ] Implement edit mode with sliders/toggles
- [ ] Connect GET and PATCH /taste-profile APIs
- [ ] Add save animation
- [ ] Implement recommendation carousel

### Phase 6: Polish
- [ ] Add all animations (see Interaction Details)
- [ ] Test navigation flow end-to-end
- [ ] Ensure consistent spacing/styling with design system
- [ ] Add error handling and loading states
- [ ] Test on iOS and Android
- [ ] Verify accessibility (voiceover, font scaling)

---

## 🚨 Critical Notes

1. **No budget info in Taste Profile** - Price range is about comfort, not tracking spend
2. **Analytics moved to Home** - It's a widget now, not a full tab
3. **Sommelier is the new main feature** - Takes prime position in bottom bar
4. **Custom grape icons** - Must use the SVG code provided, not emoji or standard icons
5. **Warm theme throughout** - All cards/backgrounds use warm gradient, never stark white
6. **Grid style for onboarding** - 2×2 grid per card, not vertical list
7. **Minimal conversation list** - Title + date only, no preview text or avatars

---

## 🎯 Success Criteria

- [ ] User can complete onboarding in under 2 minutes
- [ ] Chat feels responsive (typing indicator, smooth scrolling)
- [ ] Wine cards are tappable and navigate correctly
- [ ] Taste profile visualizes user preferences clearly
- [ ] All animations are smooth (60fps)
- [ ] Feature works offline (cached conversations, graceful API errors)

---

**Ready to implement. This is the heart of Bibo. Make it shine. 🍷**
