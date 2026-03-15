# Bibo Design System

> **Philosophy**: A warm, inviting wine companion — not a cold database. Think cozy wine bar, not Michelin restaurant.

---

## Brand Identity

### Core Theme: "Warm Sommelier"
- **Feel**: Personal, knowledgeable, approachable
- **Aesthetic**: Cream/warm whites, burgundy accents, soft shadows
- **Metaphor**: A friendly sommelier in your pocket, not a spreadsheet

### What We're NOT
- ❌ Cold/clinical (like CellarTracker)
- ❌ Overly social/noisy (like Vivino's feed)
- ❌ Dense/overwhelming (too much data at once)

### What We ARE
- ✅ Warm and inviting
- ✅ Personal and curated
- ✅ Helpful without being pushy
- ✅ Beautiful but functional

---

## Color Palette

### Primary (Warm Theme)
```
Background:       #FEF9F5  (warm off-white)
Surface:          #FFFFFF  (cards)
Surface-warm:     #FAF7F4  (alternate cards)
Border:           rgba(228, 213, 203, 0.15)
```

### Brand
```
Wine-red:         #722F37  (primary actions, buttons)
Wine-red-dark:    #5A2429  (pressed states)
Wine-red-light:   #944654  (gradients)
Gold:             #D4A574  (accents, highlights)
Cream:            #F5F0EB  (soft backgrounds)
```

### Sommelier Theme (for chat/AI features)
```
Sommelier-bg:     #FAF7F4  (warm cream)
Sommelier-accent: #D4A574  (gold touches)
Message-user:     #722F37  (wine-red)
Message-ai:       #FFFFFF  (clean white)
```

### Status
```
Peak/Ready:       #4A7C4E  (muted green)
To Age:           #5B8DBE  (soft blue)
Past Prime:       #C44536  (warning red)
Approaching:      #D4A574  (gold)
```

---

## Typography

### Fonts
- **Primary**: SF Pro Display / -apple-system
- **Headers**: Weight 700-800, tight letter-spacing (-0.02em)
- **Body**: Weight 400, normal spacing

### Scale
```
Hero:        32px / 700  (screen titles, big moments)
H1:          28px / 700  (section headers)
H2:          24px / 700  (wine names, card titles)
H3:          18px / 600  (subsections)
Body:        15px / 400  (default text)
Caption:     13px / 400  (metadata, hints)
Small:       12px / 400  (timestamps, badges)
```

---

## Components

### Cards
```
Border-radius:    16-24px
Padding:          16-20px
Shadow:           0 4px 16px rgba(114, 47, 55, 0.06)
Border:           1px solid rgba(228, 213, 203, 0.15)
Background:       #FFFFFF
```

### Buttons
```
Primary:
  Background:     #722F37
  Text:           #FFFFFF
  Radius:         12px
  Padding:        14px 24px
  Shadow:         0 4px 12px rgba(114, 47, 55, 0.3)

Secondary:
  Background:     #FAF7F4
  Text:           #722F37
  Border:         1px solid #E4D5CB

Ghost:
  Background:     transparent
  Text:           #722F37
```

### Tab Bar
```
Background:       #FFFFFF
Border-top:       1px solid #E8E8E8
Height:           80px (with safe area)
Active color:     #722F37
Inactive color:   #999999
```

### Sommelier Chat
```
Container-bg:     #FAF7F4 (warm cream)
User-bubble:      #722F37 with white text
AI-bubble:        #FFFFFF with dark text
Timestamp:        #999999, 12px
Input-bg:         #FFFFFF
Input-border:     1px solid #E4D5CB
```

---

## Spacing

### Scale
```
4px   (xs)   - tight gaps, icon margins
8px   (sm)   - inline spacing
12px  (md)   - component gaps
16px  (lg)   - card padding, sections
24px  (xl)   - screen margins
32px  (2xl)  - major sections
```

### Screen Layout
```
Horizontal padding:  16-20px
Section gap:         24px
Card gap:            12-16px
```

---

## Patterns & Guidelines

### Wine Cards
- 72×90px thumbnail (gradient fallback if no image)
- Color indicator: 20px circle, bottom-right of image
- Vintage as pill badge
- Maturity status as colored text badge

### Lists
- Clear visual hierarchy
- Touch targets minimum 44px
- Swipe actions for common tasks
- Pull-to-refresh where relevant

### Empty States
- Friendly illustration or icon
- Encouraging copy (not "No data")
- Clear CTA to fix the empty state

### Loading
- Skeleton screens over spinners
- Match the warm color palette
- Subtle pulse animation

### Modals & Sheets
- Bottom sheets for mobile actions
- Rounded corners (24px top)
- Overlay: rgba(0, 0, 0, 0.5)
- Swipe to dismiss

---

## Competitor Reference

See `/references/competitors/` for screenshots:
- `invintory-home.png` - Clean, modern, good card design
- `oeni-home.png` - Warm colors, friendly tone
- `vivino-home.png` - Social features, busy but comprehensive
- `delectable-home.png` - Minimalist, photography-focused
- `cellartracker-home.png` - Data-dense, functional

### What to Learn From Each

**InVintory** ✨
- Clean information hierarchy
- Good use of whitespace
- Modern card design
- Subtle animations

**Oeni** ✨
- Warm, inviting color palette
- Friendly illustrations
- Good onboarding flow
- Personal touch in copy

**Vivino** (selective)
- Comprehensive wine data
- Good search UX
- Avoid: social feed noise, rating-centric UI

**Delectable**
- Photography-forward
- Minimalist approach
- Avoid: too sparse for inventory management

---

## Dos and Don'ts

### DO
- ✅ Use warm backgrounds (#FEF9F5, #FAF7F4)
- ✅ Round corners generously (16-24px)
- ✅ Add subtle shadows for depth
- ✅ Use wine-red sparingly (accents, CTAs)
- ✅ Write friendly, helpful microcopy
- ✅ Include empty state illustrations
- ✅ Make touch targets 44px minimum

### DON'T
- ❌ Use pure white backgrounds (#FFFFFF for cards only)
- ❌ Overload screens with data
- ❌ Use harsh borders (prefer shadows)
- ❌ Make everything clickable wine-red
- ❌ Write cold, technical copy
- ❌ Leave empty states blank

---

## Mobile-First Viewport

```
iPhone 14/15:     390 × 844px
Safe area top:    47px
Safe area bottom: 34px
Tab bar height:   80px (including safe area)
```

---

## Animation Guidelines

```
Duration:
  Instant:      100ms  (hover, press)
  Fast:         200ms  (tab switch, toggle)
  Normal:       300ms  (modal, slide)
  Slow:         500ms  (page transition)

Easing:
  Default:      ease-out
  Spring:       cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Micro-Interactions
```
Button press:     scale(0.97) over 100ms
Card press:       scale(0.98) + shadow reduce
Success:          checkmark scale-in with spring easing
Tab switch:       200ms crossfade
Pull-to-refresh:  spring physics on release
Skeleton pulse:   1.5s infinite, opacity 0.6 → 1.0
```

**Performance rule**: Only animate `transform` and `opacity` (GPU-accelerated).

---

## Accessibility (WCAG 2.2 AA)

### Contrast Requirements
| Element | Minimum Ratio |
|---------|---------------|
| Body text (15px) | 4.5:1 |
| Large text (≥24px or 19px bold) | 3:1 |
| UI components (buttons, inputs) | 3:1 |
| Focus indicators | 3:1 vs unfocused |

### Bibo Color Contrast Check
```
✅ #722F37 on #FFFFFF = 7.8:1 (passes)
✅ #722F37 on #FEF9F5 = 7.2:1 (passes)
✅ #1a1a1a on #FEF9F5 = 15.8:1 (passes)
✅ #666666 on #FFFFFF = 5.7:1 (passes)
⚠️ #999999 on #FFFFFF = 2.9:1 (FAILS - use for decorative only)
```

### Touch Targets
```
Minimum size:     44 × 44px (Apple HIG)
Recommended:      48 × 48px
Spacing between:  8px minimum
```

### Keyboard Navigation (for web/future)
- Tab/Shift+Tab: Navigate elements
- Enter/Space: Activate buttons
- Escape: Close modals
- Arrow keys: Navigate within menus

### Focus States
Every interactive element needs a visible focus ring:
```
focus:outline:      2px solid #722F37
focus:outline-offset: 2px
```

### Screen Reader Support
- All images need `alt` text (or `aria-hidden` if decorative)
- Buttons need clear labels (avoid icon-only without aria-label)
- Form inputs need associated labels
- Status changes need `aria-live` announcements

---

## Responsive Breakpoints

```
Phone:            320-389px   (small phones)
Phone (default):  390-767px   (iPhone 14/15 - design target)
Tablet:           768-1023px  (iPad, future)
Desktop:          1024px+     (web version, future)
```

### Mobile-First Rules
1. Design for 390px width first
2. Single column by default
3. Stack horizontal elements vertically
4. Increase touch targets on mobile
5. Hide secondary info behind expand/collapse

---

## Form Patterns

### Input Fields
```
Height:           48px minimum
Padding:          12px 16px
Border:           1px solid #E4D5CB
Border (focus):   2px solid #722F37
Border (error):   2px solid #C44536
Background:       #FFFFFF
Placeholder:      #999999 (use sparingly)
```

### Validation
- Show errors inline below fields
- Use red (#C44536) for error states
- Show success checkmarks for valid fields
- Don't rely on color alone (add icons/text)

### Labels
- Always visible (not just placeholder)
- Above the input field
- Required fields: add asterisk or "(required)"

---

## Loading States

### Skeleton Screens (preferred)
```
Background:       #F0EDED
Animation:        pulse 1.5s ease-in-out infinite
Shapes:           Match actual content layout
```

### When to Use What
| Scenario | Pattern |
|----------|---------|
| Initial page load | Skeleton screen |
| Button action | Inline spinner + disabled state |
| Background refresh | Subtle progress bar |
| Pull-to-refresh | Native spinner |
| Long operation | Progress indicator + cancel option |

---

## Error States

### Empty States
- Friendly illustration (not sad/broken imagery)
- Encouraging headline ("No wines yet")
- Helpful subtext ("Scan your first bottle to get started")
- Single clear CTA button

### Error Messages
- Clear, human language (not error codes)
- Explain what went wrong
- Suggest how to fix it
- Don't blame the user

**Examples:**
```
❌ "Error 500: Internal Server Error"
✅ "Something went wrong. Please try again."

❌ "Invalid input"
✅ "Please enter a valid vintage year (1900-2025)"
```

---

## Resources

- **Design Tokens**: See `DESIGN_TOKENS.md` for exact values
- **Approved Designs**: See `DESIGNS.md` for screen-by-screen specs
- **Competitor Screenshots**: `/references/competitors/`
- **Current App Screenshots**: `/references/current-app/` (from Robin)

---

*Last updated: March 2026*
*Maintained by: Johnny (Designer Agent)*
