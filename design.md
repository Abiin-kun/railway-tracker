# Railway Tracker - UI/UX Design System

## 1. Design Philosophy

### Core Principles
- **Clarity First**: Railway data is complex. Every pixel must serve a purpose. Avoid decorative elements that don't aid comprehension.
- **Speed & Efficiency**: Commuters need information instantly. Prioritize scanability over aesthetics.
- **Trust Through Transparency**: Show confidence intervals, data sources, and prediction accuracy. Users need to trust the information.
- **Accessibility by Default**: Railway apps are used by diverse demographics including elderly users and those with limited digital literacy.
- **Offline Resilience**: Design for degraded states. Users in tunnels or rural areas must still access cached schedules.

---

## 2. Visual Design System

### 2.1 Color Palette

#### Primary Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#0f172a` (Slate 900) | Primary text, headers, navigation |
| `--primary-foreground` | `#f8fafc` (Slate 50) | Text on primary backgrounds |
| `--secondary` | `#f1f5f9` (Slate 100) | Secondary backgrounds, cards |
| `--secondary-foreground` | `#0f172a` (Slate 900) | Text on secondary backgrounds |

#### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--success` | `#16a34a` (Green 600) | On-time trains, confirmed bookings |
| `--warning` | `#f59e0b` (Amber 500) | Minor delays (5-15 min), waitlist |
| `--danger` | `#dc2626` (Red 600) | Cancelled trains, severe delays (>30 min) |
| `--info` | `#0284c7` (Sky 600) | Platform changes, informational alerts |
| `--live` | `#22c55e` (Green 500) | Live tracking indicator (pulsing) |

#### Railway-Specific Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--train-running` | `#22c55e` | Train is on time |
| `--train-delayed` | `#f59e0b` | Train delayed < 15 min |
| `--train-cancelled` | `#dc2626` | Train cancelled |
| `--train-diverted` | `#a855f7` (Purple 500) | Train diverted to different route |
| `--platform` | `#3b82f6` (Blue 500) | Platform numbers |

### 2.2 Typography

#### Font Stack
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-display: 'Inter', sans-serif;
```

#### Type Scale
| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--text-xs` | 0.75rem | 1rem | Timestamps, metadata |
| `--text-sm` | 0.875rem | 1.25rem | Secondary text, labels |
| `--text-base` | 1rem | 1.5rem | Body text, descriptions |
| `--text-lg` | 1.125rem | 1.75rem | Card titles |
| `--text-xl` | 1.25rem | 1.75rem | Section headers |
| `--text-2xl` | 1.5rem | 2rem | Page titles |
| `--text-3xl` | 1.875rem | 2.25rem | Hero text, dashboard stats |

#### Font Weights
- **Regular (400)**: Body text, descriptions
- **Medium (500)**: Labels, secondary headers
- **Semibold (600)**: Card titles, important UI elements
- **Bold (700)**: Primary headers, train numbers, prices

### 2.3 Spacing System
Based on 4px grid:
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-12`: 48px
- `--space-16`: 64px

### 2.4 Border Radius
- `--radius-sm`: 4px (small elements)
- `--radius-md`: 8px (cards, buttons)
- `--radius-lg`: 12px (modals, major containers)
- `--radius-full`: 9999px (pills, avatars)

### 2.5 Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

## 3. Component Design Guidelines

### 3.1 Train Status Card
**Purpose**: Primary information unit showing train details and current status.

```
┌─────────────────────────────────────────┐
│ 🚂 12301 Rajdhani Express               │
│ Delhi → Mumbai                          │
│ ─────────────────────────────────────── │
│ Status: ● On Time                       │
│ Next Station: Kota Jn (5 min)          │
│ Platform: 4 | Coach Position: C3        │
│ ─────────────────────────────────────── │
│ Delay: 0 min | Speed: 110 km/h         │
│ Last Updated: 2 min ago                 │
└─────────────────────────────────────────┘
```

**States**:
- **Default**: White background, subtle shadow
- **Live Tracking**: Subtle green left border (4px), pulsing live indicator
- **Delayed**: Amber left border, warning icon
- **Cancelled**: Red left border, strikethrough train name

### 3.2 Map Component
**Purpose**: Visual train positioning on interactive map.

**Design Rules**:
- Train icon: Direction-aware arrow (rotates based on heading)
- Station markers: Circle with station code inside
- Route line: Dashed line connecting stations, colored by status (green=on-time, amber=delayed)
- Popup on click: Shows station name, scheduled/actual arrival, platform
- User location: Blue pulsing dot (if location permission granted)
- Offline indicator: Grayed out map with "Offline - Last known positions" banner

### 3.3 Prediction Badge
**Purpose**: Show delay prediction with confidence.

```
┌──────────────────┐
│ ⚠ Delay Likely   │
│ 12 min ± 3       │
│ Confidence: 87%  │
└──────────────────┘
```

**Visual Treatment**:
- Background: `--warning` at 10% opacity
- Border: `--warning` at 30% opacity
- Confidence bar: 87% filled with `--warning`

### 3.4 Booking Flow Cards
**Purpose**: Step-by-step booking process.

**Design Pattern**:
- Vertical stepper on left (desktop) / top (mobile)
- Active step: Primary color circle with white number
- Completed step: Green checkmark
- Future step: Gray circle
- Card content: Clean form with clear labels above inputs
- Price summary: Sticky bottom bar on mobile, right sidebar on desktop

### 3.5 Voice Command Interface
**Purpose**: Natural language booking input.

**Visual Design**:
- Prominent microphone button (FAB or header)
- When active: Ripple animation, waveform visualization
- Transcript display: Real-time text with interim results in gray
- Confirmation card: Parsed intent shown as editable fields
- Quick actions: "Book Delhi to Mumbai tomorrow" as suggestion chips

---

## 4. Layout Patterns

### 4.1 Dashboard Layout (Desktop)
```
┌──────────────────────────────────────────────────────┐
│ Header: Logo | Search Bar | Voice Cmd | Profile     │
├──────────┬───────────────────────────────────────────┤
│ Sidebar  │ Main Content Area                         │
│          │                                           │
│ - Trains │ ┌─────────────────────────────────────┐  │
│ - Routes │ │ Stats Row (4 cards)                  │  │
│ - Book   │ │ [On Time] [Delayed] [Cancelled] [My]│  │
│ - Reports│ └─────────────────────────────────────┘  │
│ - Settings│                                         │
│          │ ┌─────────────────────────────────────┐  │
│          │ │ Map / Tracking View                  │  │
│          │ │                                     │  │
│          │ │                                     │  │
│          │ └─────────────────────────────────────┘  │
│          │                                           │
│          │ ┌─────────────────────────────────────┐  │
│          │ │ Recent Trains / Predictions          │  │
│          │ └─────────────────────────────────────┘  │
└──────────┴───────────────────────────────────────────┘
```

### 4.2 Mobile Layout
- Bottom navigation: Trains, Search, Book, Profile
- Collapsible sections for train details
- Swipeable cards for recent searches
- Floating action button for voice command
- Pull-to-refresh for live data

### 4.3 Search Results Layout
```
┌─────────────────────────────────────┐
│ Search: Delhi → Mumbai | Tomorrow   │
├─────────────────────────────────────┤
│ Sort: [Fastest] [Cheapest] [Best]   │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 12301 Rajdhani                  │ │
│ │ 16:25 → 08:35 (+1)             │ │
│ │ 16h 10m | 3AC ₹1,950           │ │
│ │ Status: ● On Time               │ │
│ │ [Book] [Set Alert]              │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 12951 Mumbai Rajdhani           │ │
│ │ 17:00 → 09:05 (+1)             │ │
│ │ 16h 05m | 3AC ₹1,950           │ │
│ │ Status: ⚠ 12 min delay          │ │
│ │ [Book] [Set Alert]              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 5. Interaction Design

### 5.1 Micro-interactions
- **Train status change**: Smooth color transition on status badge (300ms)
- **Map train movement**: Smooth interpolation between GPS points (not jumpy)
- **Button feedback**: Scale down to 0.95 on press, subtle shadow change
- **Loading states**: Skeleton screens for cards, spinner for buttons
- **Success actions**: Green checkmark animation (confetti for booking confirmation)

### 5.2 Gestures (Mobile)
- **Swipe left on train card**: Quick actions (Book, Alert, Share)
- **Pull down on map**: Refresh train positions
- **Long press on station**: View all trains for that station
- **Pinch on map**: Zoom (standard map behavior)

### 5.3 Transitions
- **Page transitions**: Fade + slight slide (200ms)
- **Modal open**: Scale from 0.95 to 1 + fade (200ms)
- **Tab switches**: Crossfade (150ms)
- **List reordering**: FLIP animation for train cards

---

## 6. Accessibility Guidelines

### 6.1 WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators**: 2px solid ring with 2px offset, high contrast
- **Touch Targets**: Minimum 44x44px for interactive elements
- **Text Resize**: Support up to 200% zoom without horizontal scroll

### 6.2 Screen Reader Support
- **Live Regions**: ARIA live regions for train status updates
- **Map Alternatives**: Text-based list view toggle for visually impaired users
- **Voice Commands**: Full keyboard navigation support
- **Error Messages**: Linked to input fields with `aria-describedby`

### 6.3 Cognitive Accessibility
- **Plain Language**: Avoid jargon. "Platform 4" not "PF 4"
- **Consistent Navigation**: Same sidebar order across all pages
- **Error Prevention**: Confirmation dialogs for cancellations
- **Progress Indicators**: Clear step indicators for multi-step processes

---

## 7. Dark Mode

### Color Adaptations
| Light Mode | Dark Mode | Usage |
|------------|-----------|-------|
| `#ffffff` | `#0f172a` | Background |
| `#f8fafc` | `#1e293b` | Card backgrounds |
| `#0f172a` | `#f1f5f9` | Primary text |
| `#64748b` | `#94a3b8` | Secondary text |
| `#f1f5f9` | `#334155` | Borders |

**Dark Mode Toggle**: System preference by default, manual override in settings.

---

## 8. Data Visualization Guidelines

### 8.1 Delay Charts
- **Type**: Horizontal bar chart
- **Colors**: Green (< 5 min), Amber (5-15 min), Red (> 15 min)
- **Labels**: Show exact delay minutes, not just color
- **Baseline**: Dashed line at 0 (on-time)

### 8.2 Occupancy Heatmap
- **Type**: Grid of coach positions
- **Colors**: Green (available), Amber (medium), Red (full)
- **Legend**: Clear color coding with percentages
- **Interaction**: Hover to see exact seat count

### 8.3 Route Timeline
- **Type**: Vertical timeline for journey
- **Nodes**: Station markers with scheduled/actual times
- **Lines**: Colored by delay status
- **Current position**: Animated marker with "You are here" label

---

## 9. Animation Principles

### 9.1 Duration
- **Fast**: 100ms (hover states, small UI changes)
- **Normal**: 200ms (page transitions, modal open/close)
- **Slow**: 300ms (map movements, complex state changes)

### 9.2 Easing
- **Standard**: `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard)
- **Deceleration**: `cubic-bezier(0, 0, 0.2, 1)` (elements entering)
- **Acceleration**: `cubic-bezier(0.4, 0, 1, 1)` (elements leaving)

### 9.3 Reduced Motion
Respect `prefers-reduced-motion` media query:
- Disable non-essential animations
- Keep functional animations (status changes, loading indicators)
- Instant transitions instead of animated ones

---

## 10. Design Tokens (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f172a',
          foreground: '#f8fafc',
        },
        secondary: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#dc2626',
        info: '#0284c7',
        live: '#22c55e',
        train: {
          running: '#22c55e',
          delayed: '#f59e0b',
          cancelled: '#dc2626',
          diverted: '#a855f7',
        },
        platform: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
}
```

---

## 11. Component Library (shadcn/ui Customizations)

### 11.1 Custom Components to Build
1. **TrainCard**: Specialized card for train information
2. **LiveIndicator**: Pulsing dot with "LIVE" text
3. **PredictionBadge**: Shows delay prediction with confidence
4. **StationTimeline**: Vertical timeline for route display
5. **CoachOccupancy**: Grid showing seat availability
6. **VoiceCommandButton**: Microphone button with waveform
7. **BookingStepper**: Multi-step booking progress
8. **DelayChart**: Simple bar chart for delay visualization
9. **PlatformBadge**: Colored badge for platform numbers
10. **OfflineBanner**: Alert banner for offline mode

### 11.2 shadcn/ui Components to Use
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Button` (with variants: default, destructive, outline, ghost, link)
- `Badge` (for status indicators)
- `Input`, `Label`, `Select`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`
- `Sheet` (mobile drawer for filters)
- `Skeleton` (loading states)
- `Toast`, `Toaster` (notifications)
- `Tooltip` (for map markers)

---

## 12. Responsive Breakpoints

```css
/* Mobile-first approach */
--breakpoint-sm: 640px;   /* Large phones */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

### Layout Adaptations
- **Mobile (< 768px)**: Single column, bottom nav, full-width cards
- **Tablet (768px - 1024px)**: Collapsible sidebar, 2-column grid for cards
- **Desktop (> 1024px)**: Fixed sidebar, 3-4 column grid, persistent map

---

## 13. Iconography

### Icon Set: Lucide React
- **Train**: `Train` icon for train entries
- **Map Pin**: `MapPin` for stations
- **Clock**: `Clock` for schedules
- **Alert Triangle**: `AlertTriangle` for delays
- **Check Circle**: `CheckCircle` for confirmed
- **X Circle**: `XCircle` for cancelled
- **Mic**: `Mic` for voice commands
- **Navigation**: `Navigation` for directions
- **Calendar**: `Calendar` for dates
- **Users**: `Users` for group bookings

### Icon Sizes
- **Small**: 16px (inline text, badges)
- **Medium**: 20px (buttons, cards)
- **Large**: 24px (headers, empty states)

---

## 14. Empty States

### No Trains Found
```
┌─────────────────────────────────────┐
│                                      │
│           🚂                         │
│                                      │
│    No trains found for this route    │
│                                      │
│    Try adjusting your search or      │
│    check the date                    │
│                                      │
│    [Browse Popular Routes]           │
│                                      │
└─────────────────────────────────────┘
```

### Offline Mode
```
┌─────────────────────────────────────┐
│                                      │
│        📡 Offline Mode               │
│                                      │
│    You're currently offline.         │
│    Showing last cached data.         │
│                                      │
│    Last synced: 5 min ago            │
│                                      │
│    [Retry]                           │
│                                      │
└─────────────────────────────────────┘
```

---

## 15. Onboarding & Empty States

### First-Time User
1. **Welcome Screen**: Brief value proposition + "Get Started"
2. **Permission Request**: Location access explanation (for tracking)
3. **Quick Setup**: Home station selection + notification preferences
4. **Feature Tour**: 3-slide carousel highlighting key features

### Returning User (No Data)
- "Search for your first train to get started"
- Recent searches (if any) shown as suggestion chips
- Popular routes: Delhi-Mumbai, Chennai-Bangalore, etc.

---

## 16. Design Checklist (Per Feature)

Before shipping any feature:
- [ ] Works in light and dark mode
- [ ] Accessible via keyboard (Tab navigation)
- [ ] Screen reader tested (VoiceOver/NVDA)
- [ ] Mobile responsive (375px - 1440px)
- [ ] Loading states designed
- [ ] Error states designed
- [ ] Empty states designed
- [ ] Offline state handled
- [ ] Performance: < 100ms interaction response
- [ ] Animations respect `prefers-reduced-motion`

---

## 17. Inspiration & References

- **Google Maps**: Clean map interface, real-time updates
- **IRCTC**: Familiar railway UX patterns for Indian users
- **Starlink App**: Live tracking visualization
- **Uber**: Real-time ETA and status updates
- **Duolingo**: Gamification elements for engagement

---

## 18. Design System Maintenance

### Versioning
- Semantic versioning for design tokens
- Breaking changes require migration guide
- Changelog in `design.md` updates

### Contribution
- Design proposals via GitHub Issues
- Component specs in Figma (link to be added)
- Code reviews check for design system compliance

---

*Last Updated: Sprint Day 1*
*Maintained by: Error 404*
