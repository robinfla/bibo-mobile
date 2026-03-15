# Bibo Design Tokens

**Version**: 1.0  
**Last Updated**: February 26, 2026  
**Platform**: iOS/Android Mobile (React Native)

---

## Colors

### Brand
```yaml
wine-red:        #722F37    # Primary brand color (buttons, active states, accents)
wine-red-dark:   #5A2429    # Hover/pressed states
wine-red-light:  #8B4049    # Gradient start, lighter variants
gold:            #D4A574    # Secondary accent (aging curves, highlights)
```

### Background
```yaml
background:      #f8f8f8    # Screen background
surface:         #ffffff    # Card/component background
surface-dark:    #f0f0f0    # Subtle background (input fields, badges)
border:          #e8e8e8    # Dividers, card borders
```

### Text
```yaml
text-primary:    #1a1a1a    # Headings, primary content
text-secondary:  #666666    # Subtext, metadata
text-tertiary:   #999999    # Placeholder, disabled text
text-inverse:    #ffffff    # Text on dark backgrounds
```

### Status Colors
```yaml
success:         #4A7C4E    # Peak wines, positive value changes
success-bg:      #E8F5E8    # Success badge background
warning:         #D4A574    # Approaching wines
warning-bg:      #FFF5E6    # Warning badge background
error:           #C44536    # Past prime, declining wines
error-bg:        #FFE8E5    # Error badge background
info:            #5B8DBE    # To age wines
info-bg:         #E5F1FA    # Info badge background
```

### Overlays
```yaml
overlay-dark:    rgba(0, 0, 0, 0.6)     # Vintage badges, modals
overlay-light:   rgba(255, 255, 255, 0.95)  # Buttons, tooltips
```

---

## Typography

### Font Family
```yaml
primary: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif
```

### Sizes & Weights

#### Headings
```yaml
h1:
  size: 28px
  weight: 700
  line-height: 1.2
  usage: Screen titles

h2:
  size: 24px
  weight: 700
  line-height: 1.2
  usage: Section headers, wine names (detail view)

h3:
  size: 18px
  weight: 600
  line-height: 1.3
  usage: Card titles, subsection headers

h4:
  size: 16px
  weight: 600
  line-height: 1.4
  usage: Labels, emphasized text
```

#### Body Text
```yaml
body-large:
  size: 16px
  weight: 400
  line-height: 1.5
  usage: Long-form content, descriptions

body:
  size: 15px
  weight: 400
  line-height: 1.5
  usage: Standard body text

body-small:
  size: 14px
  weight: 400
  line-height: 1.4
  usage: Metadata, secondary info

caption:
  size: 13px
  weight: 400
  line-height: 1.4
  usage: Captions, helper text

caption-small:
  size: 12px
  weight: 400
  line-height: 1.3
  usage: Tiny labels, timestamps
```

#### Special
```yaml
button:
  size: 16px
  weight: 600
  line-height: 1.2
  usage: Button labels

tab:
  size: 15px
  weight: 600
  line-height: 1.2
  usage: Tab labels

badge:
  size: 13-14px
  weight: 500-600
  line-height: 1.2
  usage: Status badges, pills
```

---

## Spacing

### Scale
```yaml
xs:    4px      # Tiny gaps between related items
sm:    8px      # Small gaps, icon-text spacing
md:    12px     # Default gap between components
lg:    16px     # Card padding, section spacing
xl:    20px     # Large section spacing
2xl:   24px     # Screen margins, major sections
3xl:   32px     # Hero sections, major dividers
```

### Component-Specific
```yaml
card-padding:        16px
card-gap:            12px
card-border-radius:  16px

button-padding-h:    16px
button-padding-v:    14px
button-border-radius: 12px

badge-padding-h:     12px
badge-padding-v:     6px
badge-border-radius: 12px

pill-padding-h:      20px
pill-padding-v:      12px
pill-border-radius:  24px

input-padding-h:     16px
input-padding-v:     12px
input-border-radius: 12px

screen-padding-h:    16px
screen-padding-v:    20px
```

---

## Shadows

```yaml
card:
  shadow-offset: { width: 0, height: 2 }
  shadow-opacity: 0.04
  shadow-radius: 8px
  shadow-color: #000000

card-pressed:
  shadow-offset: { width: 0, height: 4 }
  shadow-opacity: 0.08
  shadow-radius: 16px
  shadow-color: #000000

button:
  shadow-offset: { width: 0, height: 4 }
  shadow-opacity: 0.3
  shadow-radius: 12px
  shadow-color: #722F37

modal:
  shadow-offset: { width: 0, height: 8 }
  shadow-opacity: 0.15
  shadow-radius: 24px
  shadow-color: #000000
```

---

## Border

```yaml
width-thin:    1px
width-default: 1px
width-thick:   2px

color-default: #e8e8e8
color-focus:   #722F37
color-error:   #C44536
```

---

## Opacity

```yaml
disabled:      0.4
overlay-dark:  0.6
overlay-light: 0.95
badge-overlay: 0.6
hover:         0.8
```

---

## Animation

### Duration
```yaml
instant:  100ms   # Micro-interactions, hover states
fast:     200ms   # Transitions, tab switches
normal:   300ms   # Standard animations, modals
slow:     500ms   # Page transitions, complex animations
```

### Easing
```yaml
ease-in:        cubic-bezier(0.4, 0, 1, 1)
ease-out:       cubic-bezier(0, 0, 0.2, 1)
ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1)
spring:         cubic-bezier(0.34, 1.56, 0.64, 1)  # Bouncy effect
```

### Common Animations
```yaml
fade-in:
  duration: 300ms
  easing: ease-out

slide-up:
  duration: 300ms
  easing: ease-out

scale-press:
  duration: 100ms
  easing: ease-in-out
  transform: scale(0.98)

tab-switch:
  duration: 200ms
  easing: ease-in-out
```

---

## Breakpoints (Future-proofing)

```yaml
mobile:     0-767px     # iPhone, Android phones
tablet:     768-1023px  # iPad, Android tablets
desktop:    1024px+     # Web version (future)
```

---

## Component Tokens

### WineCard
```yaml
height:              180px
image-height:        140px
image-background:    linear-gradient(135deg, #8B4049 0%, #722F37 100%)
padding:             16px
border-radius:       16px
border:              1px solid #e8e8e8
gap:                 12px
```

### StatusBadge
```yaml
padding-h:           12px
padding-v:           6px
border-radius:       12px
font-size:           13px
font-weight:         600
emoji-size:          16px

variants:
  approaching:
    background:      #FFF5E6
    text-color:      #D4A574
    
  peak:
    background:      #E8F5E8
    text-color:      #4A7C4E
    
  to-age:
    background:      #E5F1FA
    text-color:      #5B8DBE
    
  past-prime:
    background:      #FFE8E5
    text-color:      #C44536
```

### VintagePill
```yaml
padding-h:           20px
padding-v:           12px
border-radius:       24px
font-size:           15px
font-weight:         600
border-width:        2px

active:
  background:        #722F37
  text-color:        #ffffff
  border-color:      #722F37

inactive:
  background:        #ffffff
  text-color:        #666666
  border-color:      #e0e0e0
```

### Button
```yaml
padding-h:           16px
padding-v:           14px
border-radius:       12px
font-size:           16px
font-weight:         600
min-height:          48px

primary:
  background:        #722F37
  text-color:        #ffffff
  shadow:            button

secondary:
  background:        #f0f0f0
  text-color:        #666666
  shadow:            none

outline:
  background:        transparent
  text-color:        #722F37
  border:            2px solid #722F37
```

### SearchBar
```yaml
height:              48px
padding-h:           16px
border-radius:       12px
background:          #ffffff
border:              1px solid #e0e0e0
font-size:           15px
icon-size:           20px
icon-color:          #999999
```

### TabBar (Bottom Navigation)
```yaml
height:              80px
background:          #ffffff
border-top:          1px solid #e0e0e0
padding-bottom:      20px
icon-size:           28px
label-size:          10px

active:
  icon-color:        #722F37
  label-color:       #722F37

inactive:
  icon-color:        #999999
  label-color:       #999999
```

### ScanButton (FAB)
```yaml
size:                56px
border-radius:       50%
background:          #722F37
icon-color:          #ffffff
icon-size:           28px
shadow:              button
margin-top:          -12px
```

---

## Usage Examples

### React Native StyleSheet
```javascript
import { colors, spacing, typography } from './designTokens';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardBorderRadius,
    padding: spacing.cardPadding,
    gap: spacing.cardGap,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  
  wineName: {
    fontSize: typography.h3.size,
    fontWeight: typography.h3.weight,
    lineHeight: typography.h3.lineHeight,
    color: colors.textPrimary,
  },
  
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.badgeBorderRadius,
    backgroundColor: colors.warningBg,
  },
});
```

### CSS/Tailwind Config
```javascript
module.exports = {
  theme: {
    colors: {
      'wine-red': '#722F37',
      'wine-red-dark': '#5A2429',
      'wine-red-light': '#8B4049',
      'gold': '#D4A574',
      // ... etc
    },
    spacing: {
      'xs': '4px',
      'sm': '8px',
      'md': '12px',
      'lg': '16px',
      // ... etc
    },
    fontSize: {
      'h1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
      'h2': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
      // ... etc
    },
  },
};
```

---

## Changelog

### v1.0 (2026-02-26)
- Initial design tokens for Bibo mobile app
- Defined colors, typography, spacing, shadows, borders, animations
- Component-specific tokens for WineCard, StatusBadge, VintagePill, buttons, etc.

---

**Maintained by**: Bibo Designer (Johnny)  
**For questions**: Ask in #design-system channel or ping @designer
