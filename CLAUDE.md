# TNW Leads Map

## Overview
Geospatial visualization tool for TNW Energy's sales team. Displays unassigned leads (red circles) and active clients (blue stars) on a Google Map, sourced from Airtable. Password-protected. Deployed on Vercel.

## Tech Stack
- **Vanilla HTML/CSS/JS** — frontend in `index.html`
- **Vercel Serverless Functions** — API proxy layer (`/api/`) keeps secrets server-side
- **Google Maps API** — map rendering, geocoding addresses to coordinates
- **Airtable API** — data source for leads and clients
- **Vercel** — hosting + serverless, auto-deploys from GitHub `main` branch

## Project Structure
```
TNW-Leads-Map/
├── index.html           — full SPA (HTML + CSS + JS)
├── api/
│   ├── config.js        — serves Google Maps key + table IDs from env vars
│   ├── leads.js         — proxies Airtable fetch for unassigned leads
│   └── clients.js       — proxies Airtable fetch for all clients
└── CLAUDE.md
```

## Vercel Environment Variables
These must be set in the Vercel dashboard:
- `AIRTABLE_API_KEY` — Airtable personal access token
- `AIRTABLE_BASE_ID` — Airtable base ID (e.g. `appXXXXXXXX`)
- `LEADS_TABLE_ID` — Airtable leads table ID (e.g. `tblXXXXXXXX`)
- `CLIENTS_TABLE_ID` — Airtable clients table ID (e.g. `tblXXXXXXXX`)
- `GOOGLE_MAPS_API_KEY` — Google Maps JavaScript API key

## Authentication
Client-side password gate: `@TNWENERGY2025`. Uses `sessionStorage` so it persists per browser tab session. Not a security boundary for the API — the serverless functions are publicly accessible.

## Application Flow
```
Page Load → Login Screen → [password correct] → unlockApp() → init()
  init():
    1. fetch('/api/config') → loads CONFIG from env vars
    2. loadGoogleMaps() → injects Maps script
    3. initMap() → creates map (centered Leeds, UK)
    4. plotAll() → fetches data via /api/leads + /api/clients → geocode → plot
    5. startAutoRefresh() → re-runs plotAll() every 5 minutes
```

## API Routes
| Route | Method | Description |
|---|---|---|
| `/api/config` | GET | Returns base ID, table IDs, Google Maps key |
| `/api/leads` | GET | Returns unassigned leads (filtered: `{client}=BLANK()`) |
| `/api/clients` | GET | Returns all clients (client-side filters "fulfilled"/"upsell"/"marketing") |

## Airtable Data Structure

**Leads Table:**
- `company`/`Company` — lead name
- `location` — address for geocoding
- `SDR Name`/`Rep Name` — sales rep
- `email`, `phone`, `status`
- `photos` — attachment field
- `Energy consumption information` — text
- `client` — link to client (blank = unassigned)

**Clients Table:**
- `Client Name` — used for legend categories
- `location`/`Location`/`address`/`Address`/`Client Address` — geocoding target
- `client type` — filter field (excludes: "fulfilled", "upsell", "marketing")
- `email`, `phone`, `status`, `photos`, `notes`
- `Energy consumption information`, `info`/`Info`

## Key Functions (index.html)
| Function | Purpose |
|---|---|
| `attemptLogin()` / `unlockApp()` | Password gate + session persistence |
| `loadGoogleMaps()` | Dynamic script injection of Maps API |
| `initMap()` | Creates map centered on Leeds, UK (53.8008, -1.5491) |
| `geocodeAddress(address)` | Address → coordinates, with cache |
| `fetchUnassignedLeads()` | Calls `/api/leads` |
| `fetchClients()` | Calls `/api/clients`, filters client types client-side |
| `plotAll()` | Main orchestrator: fetch → geocode → plot → legend |
| `toggleType(type)` / `toggleAll(show)` | Legend filter controls |
| `updateLegend(unassignedCount, clientCounts)` | Renders legend HTML |
| `startAutoRefresh()` | 5-minute polling interval |

## Global State
- `CONFIG` — loaded from `/api/config` at init
- `map` — Google Maps instance
- `markers[]` — all placed markers
- `geocodeCache{}` — address → lat/lng cache
- `clientColors{}` — client name → color mapping
- `visibilityState{}` — which categories are shown/hidden
- `preserveViewport` — flag after first user interaction

## UI Components
- **Login Screen** (`#login-screen`) — password gate, purple gradient background
- **Header** (`#controls`) — title, lead/client counts, status text, refresh button
- **Map** (`#map`) — full-screen Google Map
- **Legend** (`#legend`) — floating panel with toggleable categories, Show/Hide All buttons
- **Info Windows** — click markers for company details, photos, contact info, Airtable link

## Deployment
- **Hosting:** Vercel
- **Repo:** `https://github.com/danjb03/TNW-Leads-Map.git`
- **Branch:** `main`
- **Build:** No build command — Vercel serves `index.html` as static + `/api/` as serverless functions

## Known Limitations
1. **Sequential geocoding** — slow with many records; could batch or parallelize
2. **Field name variations** — code checks multiple field name casings (fragile)
3. **No rate limit handling** — Airtable/Google APIs could throttle without graceful fallback
4. **Client-side password only** — not a true auth boundary; API routes are open
5. **All markers in memory** — no virtualization for large datasets

## Color Scheme
- Primary gradient: `#667eea` → `#764ba2` (purple header/login)
- Unassigned leads: red (`#ff0000`)
- Active clients: bright blue (`#00BFFF`)
