# VerifAI Design Guidelines

## Design Approach
**Design System**: Material Design 3 with Linear-inspired refinements for a modern enterprise SaaS aesthetic. This provides robust patterns for data-dense interfaces while maintaining visual sophistication.

**Key Principles**: 
- Clarity and efficiency for compliance analysts
- Trust and professionalism for financial services context
- Information density without overwhelming users
- Scannable hierarchies for quick decision-making

## Typography

**Font Family**: 
- Primary: Inter (via Google Fonts) for UI elements, data, and body text
- Monospace: JetBrains Mono for ID numbers, MRZ codes, and technical data

**Scale**:
- Hero metrics (dashboard): text-5xl (48px), font-bold
- Page headers: text-3xl (30px), font-semibold
- Section headers: text-xl (20px), font-semibold
- Card titles: text-lg (18px), font-medium
- Body text: text-base (16px), font-normal
- Secondary/meta text: text-sm (14px), font-normal
- Captions/labels: text-xs (12px), font-medium

## Layout System

**Spacing Primitives**: Use Tailwind units of 1, 2, 4, 6, 8, 12, 16, 24 for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4 to gap-6
- Tight groupings: space-y-2 to space-y-4

**Grid System**:
- Dashboard metrics: 4-column grid (grid-cols-4) for KPIs
- Recent verifications: Single column list with dividers
- Verification detail: 2-column layout (8/4 split) - document viewer (col-span-8) + sidebar (col-span-4)
- Settings: Single column max-w-4xl centered

**Container Strategy**:
- Main content: max-w-7xl mx-auto with px-6 to px-8
- Forms and settings: max-w-3xl for optimal readability
- Full-width tables and lists

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed header with h-16, flex items-center justify-between
- Logo and platform name on left
- Primary navigation links (Dashboard, Integrations, Patterns, Settings) in center
- User profile avatar + notifications on right
- Subtle border-b for separation

### Dashboard Components

**Metric Cards**:
- Rounded-lg cards with p-6
- Icon or graphic in top-left (32px size)
- Large number display (text-4xl font-bold)
- Label below (text-sm text-muted)
- Optional percentage change indicator (text-xs with arrow icon)
- Arrange in 4-column grid with gap-6

**Chart Container**:
- Full-width card with p-6
- Header with title (text-xl font-semibold) and time range selector
- Chart area with h-80
- Use recharts library for line/area charts

**Recent Activity Feed**:
- List with divide-y dividers
- Each item: flex justify-between items-center with py-4 px-6
- Left: Document type icon + name + timestamp
- Right: Status badge (rounded-full px-3 py-1 text-xs font-medium)

### Upload Interface

**Drag & Drop Zone**:
- Large centered area with rounded-xl border-2 border-dashed
- Minimum h-64 with flex flex-col items-center justify-center
- Upload icon (64px) at top
- "Drag and drop your document" headline (text-xl font-semibold)
- Supported formats text (text-sm)
- "or browse files" button below

**Processing State**:
- Animated spinner with "Analyzing document..." text
- Progress indicator showing OCR stages

### Verification Detail Page

**Document Viewer**:
- Full-height image container with zoom controls
- SVG overlay for bounding boxes (stroke-width: 2, different colors per field type)
- Hover tooltips showing field name + confidence %

**Sidebar Panels**:
- Tabbed interface (OCR Extraction, Data Validation, Risk Analysis)
- Tab bar with border-b, active tab has border-b-2 accent
- Panel content with p-6, space-y-6

**Risk Score Card**:
- Prominent circular progress indicator (120px diameter)
- Score in center (text-4xl font-bold)
- Risk level text below (LOW/MEDIUM/HIGH)
- AI insights in expandable accordion below

**Field Display Grid**:
- 2-column grid for extracted fields
- Label (text-sm font-medium) above value (text-base)
- Confidence score badge next to each field
- Match/mismatch icons for validation tab

**Action Bar**:
- Fixed bottom bar with border-t
- Reject button (outlined, left) and Approve button (filled, right)
- Space-x-4 between buttons

### GenAI Assistant

**Chat Interface**:
- Fixed-height container (h-96) with overflow-y-auto
- Messages with alternating alignment (user: right, AI: left)
- Message bubbles: rounded-2xl px-4 py-3 max-w-md
- Avatar icons (32px) next to each message
- Input bar at bottom: flex items-center gap-2, rounded-full border
- Send button icon (24px) on right side of input

**Suggested Prompts**:
- Chips below input with rounded-full px-4 py-2 text-sm
- 3-4 prompts like "Explain risk score", "Check for fraud patterns"

### Forms & Settings

**Settings Groups**:
- Each group in card with p-6, space-y-6
- Group header with text-lg font-semibold mb-4
- Form fields with label (text-sm font-medium mb-2) and input
- Slider components for threshold values with numeric display
- Toggle switches for boolean settings

**Input Fields**:
- Full-width with h-10 to h-12, rounded-lg border
- Focus state with ring-2
- Helper text below (text-xs)

### Data Tables

**Integrations Table**:
- Full-width with rounded-lg overflow-hidden
- Header row with bg-muted, text-sm font-medium, py-3 px-6
- Data rows with py-4 px-6, border-b
- Status indicators: rounded-full w-2 h-2 inline-block (Connected/Disconnected)
- Action buttons (outlined, small) in last column

### Patterns Library

**Pattern Cards**:
- 3-column grid (grid-cols-3 gap-6)
- Each card: rounded-xl with p-6
- Before/after image comparison (aspect-video)
- Pattern name (text-lg font-semibold)
- Detection method description (text-sm)
- Confidence badge

## Animations

**Use Sparingly**:
- Page transitions: Simple fade-in (duration-200)
- Loading states: Spinner rotation only
- Hover states: Scale-105 on metric cards, brightness increase on buttons
- No scroll animations, parallax, or decorative motion

## Images

**Document Thumbnails**: 
- All uploaded documents shown as centered images with object-cover
- Verification detail page displays full document with aspect-auto

**Pattern Examples**:
- Before/after comparisons showing tampered vs. authentic documents
- Placeholder fraud detection visual examples

**No Hero Images**: This is a dashboard application - functionality takes precedence over marketing imagery

## Accessibility

- All interactive elements have focus-visible states with ring-2
- Color is never the only indicator (use icons + text)
- Form inputs have associated labels and aria-describedby for errors
- Minimum touch target size 44px for all buttons
- Skip navigation link for keyboard users