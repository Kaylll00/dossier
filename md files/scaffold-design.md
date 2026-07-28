# Part 1 — Project Scaffold & Design Token System

**Goal:** stand up a real SvelteKit project and encode the Impossible Room design
system (colors, type, radii, grain, vignette) as reusable tokens/utilities —
before building any actual page. Every later part assumes this foundation exists.

**Reference:** `design.md` (Design System & UI Reference) — sections 2–4 and 10.

---

## 1. Scaffold the SvelteKit project

From the empty project folder:

```bash
npx sv create .
```

When prompted, choose:
- Template: **SvelteKit minimal**
- Type checking: **TypeScript**
- Add-ons: select **Tailwind CSS**, **ESLint**, **Prettier** (skip the rest for now)

Install dependencies:

```bash
npm install
```

Confirm it runs:

```bash
npm run dev
```

You should see the default SvelteKit welcome page at `http://localhost:5173`.

---

## 2. Fonts — Fraunces & Inter

Install via Fontsource so fonts are bundled (no external request, no FOUT flash):

```bash
npm install @fontsource-variable/fraunces @fontsource-variable/inter
```

In `src/routes/+layout.svelte`, import both at the top of the `<script>` block:

```svelte
<script lang="ts">
	import '@fontsource-variable/fraunces';
	import '@fontsource-variable/inter';
	import '../app.css';
</script>

<slot />
```

---

## 3. Tailwind config — design tokens

Open `tailwind.config.ts` (or `.js`) and extend the theme with the tokens from
`design.md` §2–4. Do not hardcode hex values elsewhere in the app after this —
everything should reference these.

```ts
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				ink: '#0e0d16',
				'ink-soft': '#17151f',
				cream: '#f3ede3',
				amber: {
					DEFAULT: '#d9a35b',
					hover: '#e4b473'
				},
				rose: '#c98a86'
			},
			fontFamily: {
				display: ['"Fraunces Variable"', 'serif'],
				sans: ['"Inter Variable"', 'sans-serif']
			},
			borderRadius: {
				'2xl': '1rem',
				xl: '0.75rem',
				lg: '0.5rem'
			}
		}
	},
	plugins: []
} satisfies Config;
```

Notes:
- Buttons use `rounded-full` (already default Tailwind, no token needed).
- Room cards / builder canvas / modals use `rounded-2xl`.
- Inputs and compact controls use `rounded-lg` / `rounded-xl`.

---

## 4. Global CSS — `src/app.css`

Add base layer rules plus the two reusable visual-effect utilities the design
doc calls out repeatedly: **grain** and **vignette**.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
	html,
	body {
		@apply bg-ink text-cream font-sans;
	}
}

@layer utilities {
	/* 6% opacity fractal-noise overlay — used on landing, viewer stage,
	   room preview cards, builder canvas. Never raise the opacity. */
	.grain {
		position: relative;
	}
	.grain::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0.06;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
	}

	/* Radial dark vignette for immersive surfaces. Two strengths per spec. */
	.vignette-viewer {
		position: relative;
	}
	.vignette-viewer::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			circle at center,
			transparent 40%,
			rgba(0, 0, 0, 0.55) 100%
		);
	}
	.vignette-landing {
		position: relative;
	}
	.vignette-landing::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			circle at center,
			transparent 40%,
			rgba(0, 0, 0, 0.5) 100%
		);
	}
}
```

---

## 5. Background presets (for later use in Builder)

Encode the five presets from `design.md` §2 now, as a plain TS module, so the
Builder (Part 5) and Viewer (Part 4) can both import the same source of truth.

`src/lib/theme/backgrounds.ts`:

```ts
export type BackgroundPreset = {
	id: string;
	label: string;
	css: string; // used as a background-image value
};

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
	{
		id: 'dusk',
		label: 'Dusk',
		css: 'radial-gradient(circle at 50% 30%, #3a2b52 0%, #0e0d16 70%)'
	},
	{
		id: 'ember',
		label: 'Ember',
		css: 'radial-gradient(circle at 50% 30%, #4a2d1a 0%, #0e0d16 70%)'
	},
	{
		id: 'tide',
		label: 'Tide',
		css: 'radial-gradient(circle at 50% 30%, #1a3a42 0%, #0a1620 70%)'
	},
	{
		id: 'fog',
		label: 'Fog',
		css: 'radial-gradient(circle at 50% 30%, #4a3a3a 0%, #17151f 70%)'
	},
	{
		id: 'meadow',
		label: 'Meadow',
		css: 'radial-gradient(circle at 50% 30%, #2a3a24 0%, #0e130e 70%)'
	}
];
```

(Exact stops are a starting point — nudge them visually once you can see a room
on screen. The point of this file is that Builder and Viewer never duplicate
this list.)

---

## 6. Folder structure

Set up the shape now so later parts drop straight in:

```
src/
  lib/
    theme/
      backgrounds.ts
    components/        (shared UI: Button.svelte, etc. — Part 3+)
    appwrite/           (Part 2)
    types.ts            (Part 2 — Room / Object types)
  routes/
    +layout.svelte
    +page.svelte        (Landing — Part 3)
    room/
      [roomId]/
        +page.svelte     (Viewer — Part 4)
    builder/
      [roomId]/
        +page.svelte     (Builder — Part 5)
```

Create the empty folders/files now (content comes in later parts):

```bash
mkdir -p src/lib/theme src/lib/components src/lib/appwrite
mkdir -p src/routes/room/\[roomId\] src/routes/builder/\[roomId\]
touch src/lib/types.ts
```

---

## 7. Sanity check page

Temporarily replace `src/routes/+page.svelte` with a token smoke test, just to
confirm fonts/colors/utilities are wired correctly:

```svelte
<div class="grain vignette-landing min-h-screen flex items-center justify-center">
	<div class="text-center">
		<h1 class="font-display text-5xl sm:text-7xl font-light text-cream">
			The Impossible Room
		</h1>
		<p class="font-sans text-sm text-cream/60 mt-4 tracking-[0.2em] uppercase">
			token check
		</p>
		<button
			type="button"
			class="mt-8 px-6 py-3 rounded-full bg-amber text-ink font-sans text-sm font-medium hover:bg-amber-hover transition-colors"
		>
			Create a room
		</button>
	</div>
</div>
```

Run `npm run dev` and confirm:
- Background is near-black ink, text is cream.
- Headline renders in Fraunces (serif, light weight), button label in Inter.
- Button is a full pill, amber, and warms slightly on hover.
- A faint grain texture and a soft dark vignette are visible (subtle — if it's
  obvious, the grain opacity is wrong).

Once this looks right, delete the smoke test — Part 3 replaces it with the
real landing page.

---

## Acceptance checklist

- [ ] `npm run dev` runs cleanly with no console errors
- [ ] Fraunces and Inter both load locally (check Network tab — no Google
      Fonts requests)
- [ ] `ink`, `ink-soft`, `cream`, `amber`, `amber-hover`, `rose` are usable as
      Tailwind classes (`bg-ink`, `text-cream`, `bg-amber`, etc.)
- [ ] `.grain` and `.vignette-viewer` / `.vignette-landing` utilities render
      correctly on a full-height section
- [ ] `src/lib/theme/backgrounds.ts` exists with all 5 presets
- [ ] Folder structure from §6 exists
- [ ] Smoke test page confirmed, then removed

---

## Next

**Part 2 — Data Model & Appwrite Setup**: Rooms/Objects collections, storage
bucket, typed client, and the `Room`/`RoomObject` TypeScript types that every
later part (Landing, Viewer, Builder) will import from `src/lib/types.ts`.