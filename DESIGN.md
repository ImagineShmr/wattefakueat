# Design

## Theme

Dark. Physical scene: someone on their phone after a meal, in a restaurant or at home, ambient light varies from bright cafe to dim bedroom at night. Dark reduces visual noise for a quick 5-second interaction. The dark surface is a warm charcoal, not blue-black — feels like a dim room, not a monitor turned off.

## Color Strategy

Restrained. Tinted warm neutrals carry the surface. One accent (gold) at ≤10% of the UI.

### Palette

Surface: `oklch(10% 0.008 30)` — deep warm charcoal
Surface raised: `oklch(16% 0.012 30)` — card and sheet backgrounds
Surface glass: `oklch(25% 0.02 30 / 0.55)` — glass cards, bottom nav, overlays
Glass border: `oklch(70% 0.02 30 / 0.12)` — subtle glass edge

Accent: `oklch(68% 0.13 75)` — warm gold, used for active states, the orb glow, the FAB
Accent hover: `oklch(72% 0.15 75)`
Accent glow: `oklch(68% 0.13 75 / 0.25)` — orb and button glow shadows

Text primary: `oklch(92% 0.005 30)`
Text dim: `oklch(62% 0.01 30)`
Text softer: `oklch(45% 0.01 30)`

Success: `oklch(62% 0.1 150)` — muted herb green
Error: `oklch(55% 0.15 25)` — muted brick

Warmth halo: `oklch(18% 0.02 30)` — subtle warm overlay for glass surfaces to tint the blur

### Usage rules

- Gold accent only on interactive states (active nav, orb glow, FAB, confirm button). Not decorative.
- Glass surfaces get the warmth halo as their `background-color` behind `backdrop-filter: blur()` so the blur picks up a warm tint even over dark content.
- No blue anywhere. No cyan. No teal.
- Text never approaches white. Primary text is a warm off-white at 92% lightness.

## Typography

Family: `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`
Scale: 0.75 / 0.85 / 1 / 1.25 / 1.5 rem
Weights: 400 body, 500 headings, 600 labels

## Glass Components

### Glass Card
- bg: `oklch(25% 0.02 30 / 0.45)` with `backdrop-filter: blur(20px)`
- border: `oklch(70% 0.02 30 / 0.1)`
- border-radius: 14px
- padding: 14px 16px

### Glass Pill (Bottom Nav)
- bg: `oklch(25% 0.02 30 / 0.5)` with `backdrop-filter: blur(24px)`
- border: `oklch(70% 0.02 30 / 0.08)`
- border-radius: 999px
- padding: 6px
- shadow: `0 4px 32px oklch(0% 0 0 / 0.3)`

### Glass Modal (Voice Input)
- bg: `oklch(16% 0.012 30 / 0.8)` with `backdrop-filter: blur(32px)`
- Deep, immersive. Orb sits centered with captions below.

## Elevation

No box-shadows on cards. Glass effect already provides depth. Use shadows only for:
- Bottom nav pill (to lift it above content)
- FAB (to lift it above content)
- Modals

## Motion

- 200ms ease-out for all state transitions
- Orb: 1.5s pulse loop at idle, 0.8s when active
- Glass fade-in: 300ms ease-out
- No orchestrated sequences. No bounce.

## Empty States

When no entries exist: show a centered meal emoji with brief instructive text. No illustration. No card.
