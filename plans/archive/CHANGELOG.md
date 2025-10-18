# Changelog - Rosario Cards App

## [Unreleased] - 2025-10-16

### Added
- **Stylish Catholic-Themed Scrollbar**
  - Custom golden gradient scrollbar matching app aesthetic
  - Interactive states (hover, active) with glowing effects
  - Specific styling for prayer text container (10px width)
  - Support for Webkit browsers (Chrome, Safari, Edge) and Firefox
  - Dark mode adjustments with media queries
  - 3D effect with inset shadows and golden halo glow

- **UI Element Toggles**
  - Added "Show/Hide UI" section in settings panel
  - Toggle for Help Button (❓) visibility
  - Toggle for Zoom Controls (🔍) visibility
  - State persistence in localStorage
  - Visual feedback with "Visible"/"Hidden" status

- **Timed Large Navigation Buttons**
  - Large arrow navigation buttons now hidden by default
  - Only appear for 5 seconds after help button is pressed
  - Auto-hide timer with proper cleanup
  - Custom event system (`showNavigationButtons`)

- **Stained Glass Transparency Toggle**
  - New button (🪟/🔍) in top-right corner to toggle stained glass overlay
  - Smooth transitions between transparent and normal states
  - Works in both normal and focus modes
  - State persists in localStorage

- **Full-Screen Rosary Movement**
  - Rosary can now be dragged throughout entire screen (not just bottom half)
  - Position saved to localStorage
  - "Reset Rosary Position" button in settings
  - Proper centering in full screen height

- **Compact Prayer Text Layout**
  - Prayer text now ends before footer begins (`maxHeight: calc(100vh - 120px)`)
  - Removed prayer title labels from below navigation buttons
  - Removed "Previous"/"Next" text labels
  - Removed "← Arrow Key"/"→ Arrow Key" hints
  - Cleaner, more minimalist interface

- **Enhanced Rosary Zoom Controls**
  - Added +/- buttons alongside zoom slider
  - Easier fine-tuned control (±10% increments)
  - Range: 50% to 150%
  - Visual feedback on button hover

### Fixed
- **Memory Leak in Image Rotation**
  - Removed `imageRotationTimer` from useEffect dependency array
  - Prevents infinite re-renders that caused system crashes
  
- **Missing State Variables**
  - Added `currentPrayerIndex` and `highlightedBead` useState declarations
  - Fixed "currentprayerindexisnotdefined" error
  
- **Rosary Re-rendering Issue**
  - Used refs to avoid dependency issues with `getRosarySequence` and `onBeadClick`
  - Prevents rosary from re-rendering on every prayer change

- **Cross Outline Rendering**
  - Completed outline now renders behind cross body (not on top)
  - Proper visual hierarchy for selected/completed states
  - Added outline rendering for cross composite body

- **Click-to-Scroll Navigation**
  - Changed navigation buttons from `pointerEvents: "none"` to `pointerEvents: "auto"`
  - Buttons now clickable and functional

### Changed
- **Prayer Text Positioning**
  - Moved to top of screen with compact layout
  - Only takes space needed, not full screen height
  - Better background image visibility

- **Progress Bar Integration**
  - Prayer titles now displayed in progress bar instead of below navigation
  - Added `getCurrentPrayerTitle()` function
  - Added `getPrayerById()` helper function

### Technical Improvements
- **State Management**
  - Added localStorage persistence for multiple new features
  - Proper event cleanup in useEffect hooks
  - Ref-based dependency management for performance

- **Component Communication**
  - Custom events: `showNavigationButtons`, `toggleHelpButton`, `resetRosaryPosition`, `beadDragPosition`, `rosaryZoomChange`
  - Event-driven architecture for loose coupling

- **Performance Optimizations**
  - Removed unnecessary re-renders in InteractiveRosary
  - Timer cleanup to prevent memory leaks
  - GPU-accelerated CSS transforms for smooth animations

### Developer Experience
- **Code Quality**
  - Fixed linting warnings and errors
  - Improved code organization and readability
  - Added comprehensive inline documentation
  - Proper cleanup in useEffect hooks

## Previous Releases

See git history for earlier changes.

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) principles.


