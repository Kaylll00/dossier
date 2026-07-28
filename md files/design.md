# The Impossible Room — Design System & UI Reference

This document captures the implemented visual language and interaction patterns for **The Impossible Room** prototype. Use it as the source of truth when expanding the viewer, builder, or future room-management flows.

---

## 1. Product Feel

**The Impossible Room** is an intimate, surreal personal archive rather than a conventional dashboard or gallery.

- **Mood:** dreamlike, quiet, tactile, editorial, slightly uncanny.
- **Visual balance:** dark immersive spaces for the room experience; precise and restrained controls for creation.
- **Design principle:** personal images can be imperfect, mismatched, or oddly scaled. The interface should make that inconsistency feel intentional rather than messy.
- **Avoid:** generic SaaS cards, heavy gradients, excessive glass effects, bright saturated color, or decoration that competes with a room’s objects and stories.

---

## 2. Color System

### Core tokens

| Token | Value | Purpose |
|---|---:|---|
| `--ink` | `#0e0d16` | Primary background; near-black violet ink |
| `--ink-soft` | `#17151f` | Elevated surfaces: modals, drawers, builder panels |
| `--cream` | `#f3ede3` | Primary foreground and text |
| `--amber` | `#d9a35b` | Primary accent: CTAs, active selections, focus, navigation |
| `--rose` | `#c98a86` | Secondary accent: quotations and destructive actions |

### Hierarchy and transparency

The interface relies on cream with opacity for hierarchy rather than introducing more colors.

| Use | Treatment |
|---|---|
| Primary text | `#f3ede3` |
| Supporting text | `#f3ede3` at 60–80% opacity |
| Metadata / helper text | `#f3ede3` at 35–50% opacity |
| Disabled / subtle markers | `#f3ede3` at 25% opacity |
| Standard divider | `white/10` |
| Stronger interactive border | `white/15` to `white/25` |
| Active border or ring | Amber at 35–60% opacity, or solid `#d9a35b` |

### Background presets

Each room owns its own background. The builder offers five current presets:

| Preset | Character | CSS treatment |
|---|---|---|
| **Dusk** | Violet-black interior | Purple radial gradient into deep ink |
| **Ember** | Warm, low-lit room | Brown/orange radial gradient into black |
| **Tide** | Quiet blue night | Teal radial gradient into near-black blue |
| **Fog** | Soft diffuse room | Layered cream and rose radial haze over ink |
| **Meadow** | Dim organic interior | Muted green radial glow over dark green-black |

Room backgrounds are intentionally subdued so personal objects remain the focal point.

---

## 3. Typography

### Font pairing

| Role | Font | Usage |
|---|---|---|
| Display / emotional voice | **Fraunces** | Room names, hero headlines, object titles, poems |
| Utility / interface voice | **Inter** | Buttons, forms, navigation, labels, metadata, body copy |

### Type hierarchy

| Element | Font and size | Notes |
|---|---|---|
| Landing hero | Fraunces, `text-5xl` → `sm:text-7xl`, light | The strongest emotional statement on the landing page |
| Page / section heading | Fraunces, `text-2xl`, light | E.g. “Your rooms” |
| Viewer active object | Fraunces, `text-4xl`, light | Sits at lower left of the immersive stage |
| Detail drawer title | Fraunces, `text-3xl`, light | Object name in revealed story panel |
| Room name in viewer header | Fraunces, `text-lg`, light | Restrained, secondary to the scene |
| UI body | Inter, `text-sm` / `text-[15px]` | Comfortable editorial body text |
| Micro-labels | Inter, `text-[11px]`, uppercase, letter spacing | Use 0.15–0.30em tracking for labels and section metadata |
| Poems | Fraunces, italic | Preserve explicit line breaks |

### Typography rules

- Use Fraunces only for content that benefits from emotion, memory, or atmosphere.
- Use Inter for controls and scanning-heavy UI.
- Keep display text light-weight; the dark palette supplies contrast.
- Micro-labels use uppercase and wide tracking to create quiet structure without adding visual noise.

---

## 4. Surface, Shape & Spacing

### Surfaces

- **Base canvas:** `#0e0d16` or a room-selected background.
- **Elevated canvas:** `#17151f`, usually with `white/10` border.
- **Transient surfaces:** dark translucent ink plus backdrop blur.
- **Builder inputs:** subtle `white/[0.03]` fill with `white/10` border.

### Shape language

| Element | Radius |
|---|---|
| Primary, secondary, and room navigation buttons | `rounded-full` |
| Room cards, builder canvas, modals | `rounded-2xl` |
| Inputs, segmented control options, compact action buttons | `rounded-lg` or `rounded-xl` |
| Step indicator dots | Fully rounded |

### Spacing rhythm

- **Tight:** `gap-2` for icon + label pairs and compact controls.
- **Default:** `gap-3` for navigation and adjacent actions.
- **Section:** `gap-5` / `gap-6` for grouped panels.
- **Page shell:** `px-6`, scaling up to `sm:px-10` in immersive viewer headers.
- **Landing content:** generous vertical space (`py-20`, `sm:py-28`) to make the entry experience feel considered.

---

## 5. Button System

All buttons use a clear interaction response: soft surface tint, brighter border, or text contrast. Static containers do **not** gain hover styling.

### Primary CTA

**Use for:** creating a room, saving a room, proceeding to a decisive next action.

- Background: `#d9a35b`
- Text: `#0e0d16`
- Shape: full pill
- Typical padding: `px-5` to `px-6`, `py-2.5` to `py-3`
- Type: Inter, `text-sm`, medium
- Hover: warmer amber `#e4b473`

Examples: **Create a room**, **Save room**, **Open builder**.

### Secondary / ghost button

**Use for:** previewing, entering a room, or any important but non-primary action.

- Background: transparent
- Border: `white/15`
- Text: cream at 80%
- Hover: `white/5` background fill
- Shape: full pill

Examples: **Enter The First Room**, **Preview**.

### Amber-outline button

**Use for:** creator tools available in immersive contexts.

- Background: transparent
- Border: amber at 30%
- Text: amber
- Hover: amber at 10% background fill

Example: **Edit room** in the viewer header.

### Add / create affordance

**Use for:** actions that add a new room or object.

- Border: dashed amber at 40%
- Text: amber
- Hover: amber at 10% background fill

Examples: **New room**, **Add object**.

### Destructive action

**Use for:** removing an object.

- Text: `#c98a86`
- Hover: rose at 10% background fill
- Do not give destructive actions the primary amber treatment.

Example: **Remove** in the object inspector.

### Icon-only controls

**Use for:** compact mobile-friendly actions or directional room navigation.

- Maintain a minimum comfortable tap area with `p-2` or larger.
- Always use an accessible `aria-label`.
- Pair with a text destination label when space permits; hide that label only at smaller breakpoints.

---

## 6. Routes & Screen Inventory

| Route | Screen | Primary purpose |
|---|---|---|
| `/` | Landing | Introduce the project, browse rooms, create a new room |
| `/room/:roomId` | Viewer | Explore objects and stories through snapped spatial navigation |
| `/builder/:roomId` | Builder | Place objects, edit stories, set depth, choose a background, and preview |

### Landing

**Purpose:** establish the atmosphere and provide an uncomplicated choice: enter an existing room or create one.

Key elements:
- Small amber eyebrow: “A room that keeps growing.”
- Editorial hero title and short explanatory copy.
- Primary **Create a room** button and secondary entry button.
- Responsive room-card gallery: one column on small screens, two columns from `sm`, three from `lg`.
- Room cards include a miniature scene preview, room name, object count, background preset, and separate **Enter** / **Edit** actions.
- New room card uses the dashed add treatment.
- Creation modal asks only for a room name, then moves directly into the builder.

### Viewer

**Purpose:** the visitor-facing, immersive memory experience.

Key elements:
- Full viewport stage with the room background, grain, vignette, and depth-layered objects.
- Minimal top header: Rooms link, current room name, Edit room link.
- Active object label and **Reveal its story** action at lower left.
- Vertical object step indicator at right.
- Previous / next room controls at lower right, with destination labels when space permits.
- A subtle animated scroll instruction at bottom centre.
- Right-side detail drawer for memory, poem, or fact content.

### Builder

**Purpose:** a focused editor without abandoning the project’s atmosphere.

Three-panel desktop layout:

| Region | Width / behavior | Contents |
|---|---|---|
| Object rail | `w-56`, fixed left | Object list, selected state, object count, Add object action |
| Canvas | Flexible centre | Background swatches, drag-and-drop scene, placement helper text |
| Inspector | `w-80`, fixed right | Image, label, content type, story copy, depth, scale, delete |

The builder header contains navigation back to rooms, an editable room name, **Preview**, and **Save room**.

---

## 7. Component Reference

### Floating object

Each personal object is rendered as a floating image rather than a hard-edged card.

- Position comes from percentage `x` / `y` coordinates.
- Size is calculated from a base `220px` multiplied by object scale.
- The image uses a soft radial mask so different asset backgrounds feel less rigid.
- A deep drop shadow and soft elliptical floor shadow make the object feel placed in the space.
- Depth affects opacity and blur:
  - **Background:** lightly blurred, 72% opacity.
  - **Mid-ground:** sharp, 92% opacity.
  - **Foreground:** sharp, full opacity.
- The active object scales to `1.06` and gains an amber ring.

### Step indicator

- Vertical list on the right of the viewer.
- Shows the current number as `01 / 05`.
- Active marker expands to an amber pill.
- Inactive markers are small cream dots.
- Object labels appear on hover; the current label stays visible.
- Dots are clickable, providing direct object access without removing the deliberate scroll flow.

### Detail panel

- Enters from the right using spring motion.
- Maximum width: `max-w-md`.
- Has a dark, 95% opaque elevated surface with `backdrop-blur-xl`.
- Includes a content-type badge, close control, image, object title, story body, and keyboard hint.
- The scrim uses a small backdrop blur and closes the panel when clicked.

### Builder canvas

- Room background appears behind the working scene.
- 10% grid at 8% opacity provides placement precision without becoming visual content.
- Selected objects get a solid amber ring and amber label chip.
- Objects are draggable; their stored percentage positions map directly to the viewer stage.

### Object inspector

Controls, in visual order:
1. Image upload / replacement
2. Object label
3. Content type: **Memory**, **Poem**, or **Fact**
4. Content editor
5. Depth layer: **Background**, **Mid-ground**, or **Foreground**
6. Scale slider
7. Remove action

Segmented controls are three equal options. The selected option receives amber text, border, and a low-opacity amber fill.

---

## 8. Interaction & Motion Rules

### Viewer navigation

- Normal page scrolling is locked inside the viewer.
- One wheel gesture, touch swipe, or arrow-key press advances exactly one object.
- A 1000ms cooldown prevents multiple unintended steps.
- Down / right advances; up / left returns.
- At the final object, one further forward gesture enters the next ordered room.
- At the first object, one further backward gesture returns to the final object of the previous room.
- Explicit previous / next room buttons provide the same movement for people who prefer direct controls.
- The current room’s final-object hint changes to **“Scroll to enter [room name]”** when a next room exists.

### Object movement

- The stage uses a 1-second eased camera transition: `ease: [0.4, 0, 0.2, 1]`.
- Parallax movement increases by depth layer, making foreground objects move more than background objects.
- Do not introduce rapid, bouncy animation to the scene; it should feel like the camera settling.

### Entrance and reveal motion

| Element | Motion |
|---|---|
| Landing hero / room cards | Fade upward from 20px, with restrained stagger for cards |
| Detail panel | Spring slide from the right |
| Active object title | Fade upward when the object changes |
| Scroll hint | Gentle 6px vertical loop |
| Hoverable active object | Small scale increase only when interactive |

### Feedback states

- **Selected:** amber ring, amber border, or amber-tinted surface.
- **Focus:** amber at 60% border opacity on inputs.
- **Save:** button label changes from “Save room” to “Saved” with a check icon for a short confirmation period.
- **Empty builder room:** a muted canvas message explains that an object must be added to begin.
- **Missing story content:** detail drawer says “No content added yet.”

---

## 9. Responsive Rules

- Mobile is not a reduced-quality version; it prioritizes direct touch targets and removes only nonessential text labels.
- Landing room grid: one column by default, two columns at `sm`, three at `lg`.
- Viewer header: **Edit room** text hides on smaller screens but the icon remains.
- Room navigation controls retain directional icons on mobile; destination names appear at `sm` and above.
- Viewer supports touch swipes as the mobile equivalent of wheel navigation.
- Sidebars in the builder are designed for desktop-width workspaces. A production mobile builder should move these regions into collapsible sheets rather than compressing all three panels at once.

---

## 10. Texture, Depth & Visual Effects

### Grain

A 6% opacity fractal-noise SVG overlay is available with the `.grain` utility.

Use it on:
- Landing background
- Viewer stage
- Room preview cards
- Builder canvas

Do not raise the grain opacity; it should be felt, not obviously seen.

### Vignette

Every immersive room has a radial dark vignette. It keeps the centre readable and gives the stage an enclosed, cinematic feel.

- Viewer vignette: stronger at the edges (`rgba(0,0,0,0.55)`).
- Landing vignette: slightly softer (`rgba(0,0,0,0.5)`).

### Depth treatment

The illusion of spatial depth is created with CSS rather than a literal 3D environment in this prototype:

- background / mid-ground / foreground layers;
- distinct parallax values per layer;
- blur and opacity reduction for distant layers;
- object masking, drop shadows, and floor shadows;
- an eased camera pan toward the active object.

---

## 11. Accessibility Requirements

- Use semantic landmarks: `header`, `main`, `nav`, `aside`, and sections where appropriate.
- Buttons must use `<button type="button">`; navigation uses `<Link>` for routes.
- Every icon-only action must have an `aria-label`.
- Step indicator buttons communicate the current object using `aria-current`.
- The detail drawer uses `role="dialog"` and a meaningful label.
- Images use their object label as alt text; purely decorative preview images use empty alt text.
- Keyboard support in the viewer:
  - **Arrow Down / Right:** next object or room.
  - **Arrow Up / Left:** previous object or room.
  - **Enter:** reveal the current object’s story.
  - **Escape:** close the story panel.
- Inputs have visible amber focus borders.

---

## 12. Current Prototype Boundaries

This is an interactive React prototype of the planned production experience.

- Room and object data currently persists only while the session is open.
- Uploaded images use local browser object URLs.
- Production should save rooms, objects, room order, and uploaded assets through Appwrite.
- The production spatial rendering can replace the CSS depth treatment with Three.js / Threlte while preserving this interaction model and visual language.
- The current second room, **The Night Shelf**, exists to demonstrate the room-to-room scroll and directional controls.

---

## 13. Implementation Checklist for New UI

Before adding a new screen or feature, confirm:

- [ ] It uses ink / cream / amber hierarchy rather than introducing arbitrary new colors.
- [ ] Fraunces is reserved for atmosphere, titles, and poetic content; Inter handles UI.
- [ ] Interactive elements have a clear hover, focus, and selected state.
- [ ] The interface maintains the quiet, editorial tone rather than becoming dashboard-like.
- [ ] Any object placement or depth change remains legible in the viewer.
- [ ] Motion guides attention and is never decorative noise.
- [ ] Mobile retains touch access and clear labels where they are needed.
- [ ] New room navigation respects order and preserves snapped object-by-object movement.
