@AGENTS.md

## Navigating this repo cheaply

- Start from `graphify-out/GRAPH_REPORT.md` (communities, god nodes) or run
  `graphify query "<question>"` before opening files. Rebuild after big changes
  with `/graphify . --update`.
- Skip `src/components/ui/*` (generated shadcn/Base UI kit) and `src/messages/*.json`
  unless the task is about them; grep for the key instead of reading the file.
- Backend lives in `../ecommerce-backend` (NestJS + Prisma). API contracts used here
  are typed in `src/lib/api/*.ts`.

## Map

- `src/app/[locale]/` pages: `page.tsx` (catalog), `products/[id]`, `cart`, `checkout`,
  `orders`, `profile`, `(auth)/*`, `admin/*` (role-gated by `components/admin-guard.tsx`).
- `src/stores/` Zustand (persisted to localStorage): auth + cart. Anything rendered from
  them must wait for `useHydrated()` (`src/hooks/use-hydrated.ts`).
- `src/lib/validations/` zod schemas; messages are i18n keys under `validation.*`,
  rendered by `components/form-field.tsx`.
- `src/lib/product.ts` variant/price/stock helpers (test: `pnpm test`).
- `src/lib/order-status.ts` mirrors the backend status transitions.

## Conventions

- Every user-facing string goes in both `src/messages/es.json` and `en.json`.
- Headings use `font-heading` (Young Serif, single weight): never add `font-bold` to it.
- Colors come from tokens in `src/app/globals.css` (`primary`, `muted`, `success`,
  `warning`, `destructive`); no raw hex in components.
- No emojis in UI copy.
