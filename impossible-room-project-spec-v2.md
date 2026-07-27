# The Impossible Room — Project Spec (v2)

## Concept Overview

A **customizable, persistent 3D-ish scrollable room builder**. The visitor (or in this case, the owner/creator) can build their own room — adding labels, pictures, and background — through a dedicated "Create a Room" / canvas builder interface. The site is no longer a fixed, hardcoded scene; it's a growing, editable space that can expand over time as more objects, labels, and rooms are added.

The room is populated with the creator's own personal belongings and photos (e.g. cats), each placed by hand through the builder. Once placed, visitors navigate through the finished room via **snapped, step-based scroll navigation** — one scroll gesture moves one step forward or backward — with a 3D camera-like transition between each object. Clicking/tapping an active object reveals its associated memory, poem, or fact.

The name "Impossible Room" reflects its intentionally dreamlike, surreal quality — objects don't need consistent lighting, angles, or physical logic. Inconsistency is a feature, closer to MC Escher or "dreamcore" visual logic than a photorealistic room.

---

## New Feature: Room/Canvas Builder

This is the core addition in v2 — a dedicated creation mode, separate from the "viewer" experience.

### Builder capabilities
- A **"Create a Room" / "Add to Canvas"** entry point that opens an editable canvas.
- Ability to **upload pictures** (personal objects, cats, etc.) directly into the canvas.
- Ability to **add labels** to each object (short text tags, titles, or captions).
- Ability to **attach content** per object — memory, poem, or fact — same as the original concept, but now entered through a form/editor instead of hardcoded.
- Ability to **set/change the background** of a room (image, gradient, or texture).
- Ability to **position objects** within the 3D/spatial layout (drag-and-drop placement, with depth/layer control — which object is foreground vs. background).
- Designed to **scale over time**: the creator should be able to keep adding more objects, labels, and eventually more rooms, without needing code changes.
- Saved rooms/objects should **persist** between sessions (stored in a database, not just local browser state), so the builder is a real long-term tool rather than a one-time layout.
- Future-facing: the data structure should support **multiple rooms**, not just one, even though only one room may exist initially.

### Data model (conceptual)
- **Room**: id, name, background (image/gradient/texture reference), order/index, created date
- **Object**: id, room_id (belongs to a room), image reference, label, content type (memory/poem/fact), content text, position (x/y/z or transform values), depth/layer, order/index within the room
- This structure allows new rooms and objects to be added indefinitely from the builder UI, with the viewer experience simply reading from this data.

---

## Core Interaction Model (Viewer Experience): Snapped Step-Through Scrolling

Unchanged from the original concept — this remains the visitor-facing navigation behavior:

- Normal page scrolling is locked (scroll/wheel events intercepted).
- Each scroll gesture (wheel or touch swipe), regardless of size, is interpreted only as directional intent — one gesture = one step forward/backward, never skipping multiple objects.
- A cooldown window (roughly 800ms–1200ms) after each step prevents stacked/jumpy transitions.
- A `currentIndex` state tracks the active object; each object has its own preset "camera target" (position/rotation/depth values) that the scene eases toward.
- Transitions use eased animation (ease-in-out) over ~0.8–1.2s for a camera-settling feel.
- Optional step indicator (dots or counter) shows progress through the room.
- Touch swipe on mobile mirrors the same snapped-step behavior as desktop scroll.

---

## Visual & Spatial Structure

- A 3D "stage" using depth-based layering (background slowest, mid-ground moderate, foreground fastest) to sell the sense of moving through space.
- Room shell: floor + wall surfaces, either a builder-selected image, gradient, or texture.
- Each object/photo is rendered as its own transparent-background image, positioned using the coordinates/depth values set during the builder step.

---

## Content: Personal Objects & Cats

- Populated with the creator's own belongings and cat photos, now added via the builder rather than hardcoded.
- Number of objects/rooms is intentionally open-ended and expected to grow over time — this is the whole reason for the builder feature.
- Each object reveals a memory, poem, or fact when interacted with, entered through the builder's content field.
- Suggested emotional pacing (a guiding principle, not a fixed rule): livelier cat photos → lighter memories; resting cats → quieter/reflective content; neutral objects (plants, windows, chairs) → pacing/breathing room between emotionally heavier stops.

---

## Asset Requirements

### Photography guidelines
- Shoot personal objects and cats with natural light against a plain background for easier cutout work.
- Photos don't need to be professional — clean edges matter more than polish.

### Background removal
- Clean-edged objects (mugs, books, plants): remove.bg or Photoshop subject-select.
- Cats (fur edges): remove.bg handles fur reasonably well; Photopea (free, browser-based) for manual cleanup.

### Upload/export specs
- Transparent PNGs (or SVG where feasible).
- Recommended size: ~800–1200px on the longest edge to keep load times fast, especially since images will now be uploaded/stored remotely rather than bundled as static files.
- Uploaded images should be stored in cloud storage (see tech stack) rather than the codebase, since the builder is meant to keep growing.

### Consistency note
- Mismatched lighting, angles, or scale between photos is acceptable and desirable — it reinforces the surreal, dreamlike quality.

---

## Tech Stack (Revised)

The original plain HTML/CSS/JS approach is being replaced, since the builder + persistence + growing content requirements need real state management, a database, and file storage. Since React, Next.js, Supabase, and Firebase are already familiar tools for the creator, this spec intentionally uses a **different stack** to try something new:

### Frontend framework: **SvelteKit**
- A different reactive framework from React/Next.js, with built-in state management (Svelte stores) so no extra state library is needed.
- Compiles to lean, fast vanilla JS output — well suited to an animation/interaction-heavy site like this.
- Supports both the builder interface and the viewer/scroll experience within one app.

### 3D/Spatial rendering: **Three.js**, via **Threlte** (a Svelte + Three.js integration)
- Handles the 3D perspective/depth layering, camera transitions between steps, and object positioning more robustly than plain CSS transforms — especially important now that positions are dynamic (set by a builder) rather than hand-coded.
- Threlte lets Three.js scenes be built declaratively inside Svelte components, keeping the codebase consistent.

### Builder/canvas editing: **Fabric.js** (or **Konva.js**)
- Used specifically within the "Create a Room" builder view for drag-and-drop object placement, resizing, and layering before the positions are saved and handed off to the Three.js/Threlte scene for the final experience.

### Backend, database & auth: **Appwrite**
- An open-source backend-as-a-service (self-hostable or cloud), functioning as a genuinely different alternative to Supabase/Firebase.
- Provides the database for storing Rooms and Objects (per the data model above), authentication (if the builder should be private/owner-only), and file storage for uploaded images in one platform.

### Deployment: **Vercel** or **Netlify**
- SvelteKit deploys cleanly to either; choice depends on preference, both support the adapter SvelteKit needs.

### Stack summary
| Layer | Choice |
|---|---|
| Frontend framework | SvelteKit |
| 3D/spatial rendering | Three.js + Threlte |
| Canvas/builder editing | Fabric.js (or Konva.js) |
| Backend/DB/Auth/Storage | Appwrite |
| Deployment | Vercel or Netlify |

---

## Technical Responsibilities Summary

- **SvelteKit** handles routing (e.g. `/` for the viewer, `/builder` for the creation tool), reactive state, and overall app structure.
- **Fabric.js/Konva.js** powers the builder's drag-and-drop canvas, where labels, images, and background are added and positioned.
- **Appwrite** persists Rooms and Objects, stores uploaded images, and (optionally) gates the builder behind authentication so only the owner can add/edit content.
- **Three.js/Threlte** renders the final viewer experience — reading Room/Object data from Appwrite and animating the snapped step-through scroll navigation with proper depth and camera transitions.

---

## Open Decisions (Not Yet Finalized)

- Exact number of objects/rooms — expected to keep growing via the builder
- Final content (specific memories/poems/facts) per object
- Whether cats and objects share one continuous room or are grouped into loosely distinct "zones"
- Exact visual treatment of walls/floor (solid gradient vs. textured vs. photographic), selectable per room in the builder
- Whether a step indicator/counter UI is included in the final viewer
- Whether the builder is private (auth-gated, owner-only) or publicly editable
- Whether Fabric.js or Konva.js is the better fit for the builder canvas (both are viable; final choice can be made during implementation)
