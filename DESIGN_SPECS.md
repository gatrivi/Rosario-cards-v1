# Design Specifications - Digital Rosary App

## Core Design Philosophy

### Mobile-First Development

This is a **mobile-first application**. All features, interactions, and UI elements are designed and optimized for touch devices first, with desktop support as a secondary consideration.

#### Development Context
- Currently developed and tested in browser environment
- No mobile emulator setup yet - testing happens on actual devices
- All features must work perfectly on touch devices before considering desktop optimization

### Design Priorities

1. **Touch-First Interactions**
   - All controls must be easily tappable (minimum 44x44px touch targets)
   - Gestures take precedence over mouse interactions
   - Swipe navigation is primary, button navigation is secondary

2. **Visual Clarity**
   - High contrast for outdoor/bright light usage
   - Adjustable opacity for all major UI elements
   - Clear visual feedback for all interactions

3. **Spiritual Focus**
   - Minimal distractions
   - Easy to enter focus/meditation mode
   - Respectful, reverent design aesthetic

## Key Features

### Opacity Controls
Users can adjust opacity for:
- Prayer text (10% - 100%)
- Interactive rosary (10% - 100%)
- Automatic transparency when dragging beads (~25%)

### Analog Controller
- Drag any rosary bead downward to expand prayer text dynamically
- Bead at 50% screen height = Text at 50% screen height
- Bead at 75% screen height = Text at 75% screen height
- Bead at 100% screen height = Text at 90% screen height
- Navigation buttons fade out proportionally as text expands

### Rosary Zoom
- Adjustable from 50% to 150%
- Affects all rosary beads and chains
- Persisted in localStorage

### Interactive Elements
- Tap rosary to hide navigation buttons
- Tap bottom screen edge to show navigation
- Swipe left/right to navigate prayers
- Drag corner fade controls to view background images

### Progress Tracking
- Visual progress bar showing rosary completion
- Daily devotion tracking
- Multiple spiritual tiers based on completion

## UI Layout

### Mobile Layout
```
┌─────────────────────┐
│   Settings  Help    │ ← Top corners
│                     │
│   Prayer Text       │ ← Dynamic height (50-90vh)
│   (Expandable)      │
│                     │
│   Interactive       │
│   Rosary            │
│   (Full screen)     │
│                     │
│ 👁️             👁️   │ ← Corner fade controls
│  Nav Buttons        │ ← Bottom (hideable)
└─────────────────────┘
```

### Z-Index Hierarchy
- Modals/Help: 2000
- Settings: 20
- Corner fade zones: 15
- Navigation buttons: 1000
- Interactive rosary: 10
- Prayer text: 2
- Background: 0

## Interaction Patterns

### Navigation
1. **Primary**: Swipe left (next) / right (previous)
2. **Secondary**: Arrow keys / Space bar
3. **Tertiary**: Navigation buttons (bottom bar)

### Mode Switching
- **Focus Mode**: Hide text, show only rosary + counter
- **Clean Mode**: Hide all UI elements
- **Developer Mode**: Show bead numbers and debug info

### Gestures
- Single tap on rosary: Hide navigation
- Double tap on prayer text: Toggle focus mode
- Tap bottom edge: Show navigation
- Drag bead down: Expand text (analog controller)
- Hold corner zones: Fade UI to view background

## Accessibility

### Visual
- High contrast stained glass theme
- Adjustable font sizes (S, M, L, XL)
- Dark/light theme support
- Opacity controls for all elements

### Interaction
- Keyboard shortcuts for all major functions
- Touch targets meet minimum 44px requirement
- Visual feedback for all interactions
- Sound effects (optional, can be disabled)

### Screen Readers
- Proper ARIA labels on interactive elements
- Semantic HTML structure
- Alt text for images

## Performance Considerations

### Mobile Optimizations
- CSS animations over JavaScript when possible
- Throttled scroll/drag events
- Efficient Matter.js physics updates
- LocalStorage for persistence (minimal writes)

### Asset Loading
- Lazy loading for mystery images
- Theme-appropriate image selection
- Fallback images for missing assets

## Future Enhancements

### Planned Features
- Offline PWA support
- Audio prayers
- Multiple language support
- Custom prayer sequences
- Social sharing of progress

### Mobile Emulator Setup
- Priority: Set up Android/iOS emulators for testing
- Test on multiple screen sizes
- Verify touch interactions on various devices

## Technical Stack

### Core Technologies
- React (functional components, hooks)
- Matter.js (physics engine for rosary)
- CSS custom properties for theming
- LocalStorage for state persistence

### Browser Targets
- Modern mobile browsers (iOS Safari, Chrome, Firefox)
- Progressive enhancement for desktop browsers
- Touch event support required

## Version History

### v0.1 (Current)
- Initial mobile-first implementation
- Opacity controls
- Analog controller feature
- Tap-to-hide navigation
- Dynamic text expansion
- Corner fade controls

---

*Last Updated: October 16, 2025*
*Development Status: Active - Mobile-First Phase*


