# Marketing ICC

Lenovo Marketing ICC prototype — Dashboard, Registration, and Seating — built
with Vite, React, TypeScript, and the **cake&** design system.

## Start

You need [Node.js](https://nodejs.org/) (LTS).

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

| Route | Page |
| --- | --- |
| `/` | Dashboard — gauges, allocation, registrations list |
| `/registration` | Registration tracker — filter, sort, group, saved views |
| `/seating` | Seating maps — section/suite fill, guest & suite popups |

```bash
npm run build    # typecheck + production bundle
npm run preview  # serve the build locally
```

## What’s in the app

- **Shell** — Tech World nav, routes for Dashboard / Registration / Seating
- **Shared chips** — `PersonChip`, `LocationChip`, `CompanyChip`, `SpeakerChip`
  used across tables and popups
- **Guest info modal** — opens from person chips on all three pages
- **Suite popup** — room config + scrollable seating list (Seating page)
- **Mock data** — `server/dashboardData.ts`, `registrationData.ts`, `seatingData.ts`
  (Dashboard also exposes `/api/dashboard` in the Vite dev server)

UI is built with cake& (`@cake-admin/cakeand`). Agent rules live in
[AGENTS.md](AGENTS.md); generated component docs are in `context/`.

## Updating cake&

```bash
npm run cake:update
```

Pins the newest cake& release URL. See `scripts/update-cake.mjs` for why the
dependency is a versioned tarball rather than a floating “latest” URL.

Current kit:
[v4.2.4](https://github.com/cake-admin/cakev2/releases#release-v4.2.4).

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Everything unstyled, every token an empty string | cake& CSS didn’t load — keep `@cake-admin/cakeand/cakeand.css` at the top of `src/main.tsx`. |
| Your CSS can’t override cake& | Import order — app stylesheets must come *after* the cake& import. |
| Components render unstyled | Two copies of `styled-components` — keep `resolve.dedupe` in `vite.config.ts`. |
| Flash of the wrong theme | `data-theme` in `index.html` must match `mode` on `CakeProvider` in `src/App.tsx`. |
| `npm error EINTEGRITY` | Stale lockfile vs tarball — delete `package-lock.json` and run `npm run cake:update`. |
| npm fails oddly on Windows | An `&` in the folder path breaks npm shims — rename the folder. |

Use **npm**. pnpm and yarn are not tested with this kit.

## Design system docs

Live Storybook: <https://cake.lenovo.com/storybook/>
