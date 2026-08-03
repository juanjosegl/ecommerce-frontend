# AM Shop — E-Commerce Storefront & Admin Panel

A fully bilingual, light/dark-mode e-commerce frontend built with Next.js 16 and a Base UI–based design system, consuming a real NestJS backend (transactions, RBAC, caching, background jobs). Built as a portfolio piece to demonstrate production-level frontend architecture, not just static UI.

**Live site:** https://ecommerce-frontend-ivory-nu.vercel.app
**Backend repo:** [ecommerce-backend](https://github.com/juanjosegl/ecommerce-backend)
**Backend API docs:** https://am-shop-backend.onrender.com/api-docs

> ⚠️ The backend runs on Render's free tier and may take 30–50 seconds to respond on the first request after inactivity. If the catalog looks empty on first load, give it a moment and refresh.

### Demo accounts

```
Admin:     admin@ecommerce.com / CambiaEstaClave123!
Customer:  test@example.com / 123456
```

Or register a new account, or sign in with Google.

---

## What's implemented

**Storefront**
- Product catalog with category filtering, variant selection (size/color), and stock-aware quantity controls
- Cart with persisted state (`localStorage` via Zustand) and stock-capped quantities
- Checkout that creates a real transactional order against the backend
- Order history with status badges

**Auth**
- Email/password and Google OAuth, with automatic account linking on the backend
- Password recovery flow (request → emailed link → reset)
- Self-service profile editing

**Admin panel** (role-gated, separate layout with sidebar)
- Dashboard with live metrics (product/order/user counts, low-stock alerts, recent orders)
- Category management (hierarchical, with parent/child relationships)
- Product management: create/edit, dynamic variant fields, real image uploads to Cloudinary
- Inventory management: register stock movements (IN/OUT) with required reason, view movement history per variant
- Order management: change order status
- User management: create staff/admin accounts, change roles, deactivate users (with safeguards so an admin can't demote or deactivate themselves)

**Platform features**
- Full i18n (Spanish/English) via `next-intl`, including a locale-prefixed route structure (`/es/...`, `/en/...`)
- Light/dark theme via `next-themes`, with a custom emerald-based color system defined in Tailwind v4 `@theme` variables
- Fully responsive, mobile-first layouts across storefront and admin panel

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI components | [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com) primitives (Nova preset) |
| State | [Zustand](https://github.com/pmndrs/zustand) (auth + cart, persisted) |
| Forms | `react-hook-form` + `zod` validation |
| i18n | `next-intl` |
| Theming | `next-themes` |
| HTTP client | `axios` (with request/response interceptors for auth) |
| Fonts | Urbanist (headings) + Jost (body) |

---

## Architecture notes

### Route structure

```
src/app/[locale]/
├── (auth)/              route group — login, register, forgot/reset password
├── auth/callback/         Google OAuth redirect handler (kept OUTSIDE the (auth)
│                            group deliberately — it must resolve to the literal
│                            path /auth/callback to match the backend's redirect URL)
├── admin/                  role-gated layout with its own sidebar navigation
│   ├── products/[id]/         product edit page (variants + image manager)
│   └── ...
├── products/[id]/            public product detail page
├── cart/, checkout/, orders/, profile/
└── page.tsx                    storefront home (hero + catalog)
```

### State & data layer

- `src/lib/api/*` — one file per domain (`auth`, `products`, `orders`, etc.), each exporting typed functions that wrap `axios` calls. Components never call `axios` directly.
- `src/lib/api-client.ts` — a single Axios instance with an interceptor that injects the JWT from the Zustand auth store into every request, and another that clears the session on a `401`.
- `src/stores/auth-store.ts` / `cart-store.ts` — Zustand stores with `persist` middleware. Both guards (`AuthGuard`, `AdminGuard`) wait for a `hasHydrated` flag before making any redirect decision, to avoid a race condition where localStorage hasn't finished rehydrating yet on a hard refresh.

### Composition pattern with Base UI

This project uses shadcn's newer **Base UI**–backed components (not Radix). Base UI does not support the `asChild` prop pattern — composition is done via a `render` prop instead:

```tsx
// A button that opens a dropdown menu
<DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
  <Menu className="h-5 w-5" />
</DropdownMenuTrigger>

// A link that should LOOK like a button (never wrap a <Link> in <Button>)
<Link href="/cart" className={buttonVariants({ variant: "ghost" })}>
  ...
</Link>
```

---

## Getting started locally

### Prerequisites

- Node.js 20+, pnpm
- The [backend](https://github.com/juanjosegl/ecommerce-backend) running locally (or point `NEXT_PUBLIC_API_URL` at the deployed one)

### Setup

```bash
git clone https://github.com/juanjosegl/ecommerce-frontend.git
cd ecommerce-frontend
pnpm install

# Point the frontend at your backend
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

pnpm dev
```

Visit `http://localhost:3001/es` or `http://localhost:3001/en`.

---

## Deployment

Deployed on [Vercel](https://vercel.com) with a single environment variable (`NEXT_PUBLIC_API_URL` pointing at the Render-hosted backend). Vercel auto-detects the Next.js build and redeploys on every push to `main`.

---

## What I'd add with more time

- Product search (currently category filtering only)
- Pagination / infinite scroll on the catalog
- Optimistic UI on more mutations (already used for order status changes)
- E2E tests (Playwright) covering the checkout flow

---

## License

MIT — built as a portfolio project by [Juan Jose Gutierrez](https://github.com/juanjosegl).
