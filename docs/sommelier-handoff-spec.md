# Sommelier AI — Implementation Spec

**Status:** Awaiting Robin's design approval  
**Designer:** Johnny  
**Developer:** Gilfoyle  
**Created:** 2026-03-08

---

## Overview

Complete redesign of the Sommelier experience in Bibo mobile app. Replaces the basic single-prompt input with:
1. **Onboarding flow** (8 swipeable cards)
2. **Chat interface** with conversation memory
3. **Conversation history**
4. **Taste profile dashboard**

**Design theme:** Dark, premium. Bordeaux accent (#722F37). Distinct from main app.

---

## Design Mockups

Located at `/home/robin/.openclaw/workspace-johnny/`:
- `sommelier-onboarding-01-color.png` — Card 1: Color preference
- `sommelier-onboarding-02-adventure.png` — Card 2: Adventure slider
- `sommelier-onboarding-03-regions.png` — Card 3: Region multi-select
- `sommelier-onboarding-08-goals.png` — Card 8: Goals free text
- `sommelier-chat.png` — Chat interface
- `sommelier-conversation-list.png` — Conversation history
- `sommelier-taste-profile.png` — Taste profile dashboard

HTML mockups at `/tmp/sommelier-*.html` (reference for exact styling).

---

## Components to Build

### 1. Onboarding Flow

**Component:** `SommelierOnboardingScreen.tsx`

**Structure:**
- Swipeable cards (use `react-native-swiper` or similar)
- 8 cards total (see schema at `/home/robin/projects/bibo/wine-cellar/server/utils/onboarding-schema.ts`)
- Progress bar at top
- Skip button (top right, for optional questions)
- Continue button (bottom, sticky)
- Background: `linear-gradient(135deg, #1a1414 0%, #2a1f1f 100%)`

**Card types:**
1. **Single select** (radio buttons with emojis) — cards 1, 6, 7
2. **Slider** (1-3 scale with emoji labels) — card 2
3. **Multi-select** (grid of chips, with max limit) — cards 3, 4, 5
4. **Free text** (textarea) — card 8

**Data flow:**
- Fetch schema: `GET /api/profile/onboarding`
- Submit answers: `POST /api/profile/onboarding` with body:
```json
{
  "color_preference": "red",
  "adventure_level": 2,
  "region_picks": ["bordeaux", "burgundy", "italy"],
  "favorite_grapes": ["cabernet_sauvignon", "pinot_noir"],
  "dislikes": ["too_oaky"],
  "budget": "20_50",
  "frequency": "few_week",
  "goals": "I want to learn more about natural wines..."
}
```

**Interactions:**
- Tap option → select (single) or toggle (multi)
- Drag slider → update adventure level
- Type in textarea → update goals
- Continue button → next card (or submit on card 8)
- Skip → skip optional question, go to next card
- Swipe left/right → navigate cards (alternative to Continue button)

**State management:**
- Store answers in component state
- On final submit, POST to backend, then navigate to chat

---

### 2. Chat Interface

**Component:** `SommelierChatScreen.tsx`

**Structure:**
- Header: sommelier avatar (🍷), name ("Vin"), tagline ("Your wine companion"), back button, menu (⋯)
- Message list (ScrollView, inverted for bottom-up scroll)
- Input bar (textarea, new conversation button, send button)
- Background: `linear-gradient(135deg, #1a1414 0%, #2a1f1f 100%)`

**Message types:**
- **User message:** Right-aligned, Bordeaux gradient bubble
- **Sommelier message:** Left-aligned, dark bubble with avatar
- **Wine suggestion card:** Embedded in sommelier message
  - Show wine name, producer, vintage, color dot
  - "Open from cellar" action → navigate to wine detail
- **Typing indicator:** Three animated dots

**Data flow:**
- Send message: `POST /api/chat/sommelier`
  - Body: `{ message: "What pairs with sushi?", conversationId?: "uuid" }`
  - Response: `{ message: "...", suggestions: [{ wineId, name, producer, vintage, color, pairingNote }], conversationId }`
- Load conversation: `GET /api/chat/:conversationId`
  - Returns full message history

**Interactions:**
- Type message → enable send button
- Tap send → POST message, show typing indicator, append response
- Tap wine card → navigate to `WineDetail` screen with `wineId`
- Tap new conversation (+) → reset conversation, clear messages
- Tap menu (⋯) → show options (view profile, new conversation, conversation history)

**State:**
- `messages: Message[]` — array of messages
- `inputText: string`
- `isLoading: boolean`
- `conversationId: string | null`

---

### 3. Conversation List

**Component:** `SommelierConversationsScreen.tsx`

**Structure:**
- Header: title ("Conversations"), subtitle ("Chat history with Vin"), new conversation button (+)
- ScrollView of conversation cards
- Each card: avatar, title (auto-generated or first user message), last message preview, timestamp, message count
- Empty state: "No conversations yet" with emoji

**Data flow:**
- Fetch: `GET /api/chat/conversations`
  - Returns: `[{ id, title?, lastMessage, timestamp, messageCount }]`

**Interactions:**
- Tap conversation → navigate to `SommelierChatScreen` with `conversationId`
- Swipe left → show delete/archive action
- Tap new conversation (+) → navigate to `SommelierChatScreen` without `conversationId`

---

### 4. Taste Profile Dashboard

**Component:** `TasteProfileScreen.tsx`

**Structure:**
- Header: title ("Your Wine DNA"), subtitle ("Based on X bottles and Y conversations"), Edit button
- Scrollable sections:
  1. **Color preference** — bar chart (red/white/sparkling percentages)
  2. **Adventure level** — slider visualization (1-3)
  3. **Top regions** — list with emoji, name, bottle count, percentage bar
  4. **Favorite grapes** — chips with emoji and name
  5. **What you avoid** — chips (dislikes)
  6. **Journey stats** — 2x2 grid (bottles, wines, producers, consumed)
  7. **Style tags** — chips (e.g., "red_dominant", "open_minded")

**Data flow:**
- Fetch: `GET /api/profile/taste`
  - Returns full `TasteProfile` object (see `/home/robin/projects/bibo/wine-cellar/server/utils/taste-profile.ts`)

**Interactions:**
- Tap Edit → navigate to `SommelierOnboardingScreen` (pre-fill with current answers)
- Tap back → return to sommelier tab

---

## Navigation Structure

Suggested tab structure (or modal flows):

1. **Sommelier Tab** (replace existing sommelier screen)
   - Default: `SommelierChatScreen` (if onboarding done) or `SommelierOnboardingScreen` (first time)
   - Menu options:
     - View taste profile → `TasteProfileScreen`
     - Conversation history → `SommelierConversationsScreen`
     - New conversation → reset `SommelierChatScreen`

2. **Or:** Modal flow
   - Onboarding → full-screen modal
   - Chat → main screen
   - Profile/history → accessible via header buttons

---

## Styling Constants

```typescript
export const SommelierTheme = {
  background: {
    gradient: ['#1a1414', '#2a1f1f'],
    angle: 135,
  },
  colors: {
    bordeaux: '#722F37',
    bordeauxLight: '#944654',
    white: '#FFFFFF',
    whiteAlpha05: 'rgba(255,255,255,0.05)',
    whiteAlpha08: 'rgba(255,255,255,0.08)',
    whiteAlpha10: 'rgba(255,255,255,0.1)',
    whiteAlpha30: 'rgba(255,255,255,0.3)',
    whiteAlpha50: 'rgba(255,255,255,0.5)',
  },
  borderRadius: {
    small: 12,
    medium: 16,
    large: 20,
    full: 999,
  },
  shadows: {
    card: {
      shadowColor: '#722F37',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  fonts: {
    title: { fontSize: 28, fontWeight: '800' },
    subtitle: { fontSize: 14, fontWeight: '500' },
    body: { fontSize: 15, fontWeight: '500' },
  },
}
```

---

## API Endpoints Reference

All endpoints are already implemented on the backend. See:
- `/home/robin/projects/bibo/wine-cellar/server/utils/onboarding-schema.ts`
- `/home/robin/projects/bibo/wine-cellar/server/utils/taste-profile.ts`

**Onboarding:**
- `GET /api/profile/onboarding` — returns question schema
- `POST /api/profile/onboarding` — submit answers (body: `OnboardingAnswers`)

**Taste Profile:**
- `GET /api/profile/taste` — returns current `TasteProfile`

**Chat:**
- `POST /api/chat/sommelier` — send message, get response + wine suggestions
  - Body: `{ message: string, conversationId?: string }`
  - Response: `{ message: string, suggestions: WineSuggestion[], conversationId: string }`
- `GET /api/chat/conversations` — list all conversations
- `GET /api/chat/:conversationId` — load conversation history

---

## Edge Cases & States

1. **First-time user:** Show onboarding flow, then navigate to chat
2. **Returning user:** Go straight to chat (or conversation list)
3. **No conversations yet:** Show empty state in conversation list
4. **No cellar wines:** Sommelier can still chat, but no wine suggestions (text-only responses)
5. **Network errors:** Show error toast, keep message in input (don't lose user's text)
6. **Long messages:** Textarea should expand (max 100px height, then scroll)
7. **Typing indicator:** Show when waiting for API response

---

## Animation & Polish

- **Onboarding card transitions:** Swipe with spring animation
- **Message bubbles:** Fade in from bottom
- **Wine suggestion cards:** Slide up when sommelier message includes them
- **Typing indicator:** Pulsing dots animation
- **Button states:** Pressed state with slight scale (0.98)
- **Emoji interactions:** Scale up slightly when selected (1.1x)

---

## Accessibility

- All interactive elements: minimum 44x44 tap target
- Text inputs: proper keyboard types (text, multiline)
- Color contrast: ensure white text on dark background meets WCAG AA
- VoiceOver labels: add accessibilityLabel to all icons and buttons

---

## Open Questions for Robin

1. **Sommelier name:** "Vin" is placeholder — confirm or suggest alternative
2. **Avatar:** Currently 🍷 emoji — want a custom graphic?
3. **Conversation auto-titles:** Should we auto-generate conversation titles from first message, or let user name them?
4. **Onboarding skip logic:** If user skips optional questions, do we prompt them later or leave blank?
5. **Taste profile refresh:** Should profile auto-update after adding wines, or only on manual refresh?

---

## Testing Checklist

- [ ] Onboarding flow completes and submits all 8 cards
- [ ] Chat sends messages and receives responses
- [ ] Wine suggestions tap → navigate to wine detail
- [ ] Conversation history loads and resumes correctly
- [ ] New conversation clears state properly
- [ ] Taste profile displays all sections correctly
- [ ] Edit button navigates to onboarding with pre-filled values
- [ ] Empty states render (no conversations, no cellar wines)
- [ ] Network error handling (show toast, preserve input)
- [ ] Dark theme consistent across all screens

---

**Ready for implementation once Robin approves design.**
