# Meridian Banking — Bilson Sim

- Deployed: [Deploy URL will be added upon deployment]
- Run locally: `npm install && npm run dev`

---

## Project structure

The application follows a clean feature-based micro-frontend architecture adapted from enterprise patterns, ensuring strict separation of concerns, isolation between features, and maintainability:

```
src/
├── api/                          # Typed API layer (provided client + TanStack Query hooks)
│   ├── client.ts                 # Typed apiFetch helper (starter)
│   ├── types.ts                  # Domain & API contract types (starter)
│   ├── queries.ts                # Data fetching hooks (useCustomer, useAccounts, etc.)
│   ├── mutations.ts              # Mutation hooks (useCreateTransfer with query invalidation)
│   └── index.ts                  # Barrel export
│
├── types/                        # Local application UI types
│   └── index.ts                  # Theme, Segment, TransferStep, form types
│
├── context/                      # React Context for client-only UI state
│   ├── theme-context.tsx         # ThemeProvider (light/dark + retail/premium state)
│   └── index.ts                  # Barrel export
│
├── hooks/                        # Custom application logic hooks
│   ├── useTransactionSearch.ts   # Client-side transaction search & filter logic
│   └── index.ts                  # Barrel export
│
├── common/                       # Reusable design system primitives (no business logic)
│   ├── button/                   # Accessible button component with variants & sizes
│   ├── skeleton/                 # Layout-preserving shimmer skeleton loader
│   ├── inline-error/             # Accessible field-level error connected via aria-describedby
│   ├── empty-state/              # Accessible zero-data state with action trigger
│   └── index.ts                  # Barrel export
│
├── components/                   # Domain features (loosely coupled micro-modules)
│   ├── header/                   # App header, segment switcher, theme toggle, avatar
│   ├── dashboard/                # Balance hero, account cards, transaction list, daily limit rail
│   ├── transfer/                 # Stepper, 3-step wizard (Recipient, Amount, Review), success panel
│   └── index.ts                  # Barrel export
│
├── schemas/                      # Single source of truth for validation schemas
│   ├── transfer-schema.ts        # Zod schemas (recipient, amount limits, note)
│   ├── transfer-schema.test.ts   # Unit tests for validation schemas
│   └── index.ts                  # Barrel export
│
├── lib/                          # Formatting utilities
│   ├── format.ts                 # formatMoney (en-SG) and formatShortDate (Asia/Singapore)
│   └── format.test.ts            # Unit tests for formatters
│
├── mocks/                        # MSW browser handlers & mock database
├── test/                         # Test setup (MSW server & automated DOM cleanup)
├── App.tsx                       # Root application shell orchestration
├── App.test.tsx                  # Behavioural integration test suite (E4.1, E4.2, E4.3, etc.)
├── main.tsx                      # Bootstrap entry point & QueryClient initialization
└── index.css                     # Global reset, focus rings, reduced motion, tabular-nums
```

---

## Decisions and trade-offs

### 1. Server state vs. UI state
- **Server state (TanStack Query):** All data from the mock API (`customer`, `accounts`, `transactions`, `payees`) is managed strictly through TanStack Query (`useQuery` and `useMutation`). No API responses are copied into local `useState` or global stores, eliminating synchronization bugs and cache drift.
- **Client UI state (Context + Local state):** UI state that lives purely in the browser—such as theme mode (`light`/`dark`), segment tier (`retail`/`premium`), and dialog visibility/active step—is managed using React Context and localized component state.
- **Derived data computed inline:** The dashboard's `Total available` is derived directly during render by summing deposit accounts (`type !== 'credit'`). It is never stored in separate state.

### 2. Forms and validation
- **Zod as single source of truth:** All validation rules (new recipient constraints, 8-digit account number regex, min/max amount, decimal precision, note length, and dynamic balance/limit checks) are defined once in `schemas/transfer-schema.ts`.
- **Dynamic limit validation with React Hook Form:** Rather than hardcoding static balances, a dynamic resolver is configured for `StepAmount` that inspects the currently selected from-account and enforces real-time balance checks (`Amount can't be more than your available balance (SGD X,XXX.XX)`) and daily limit constraints (`This transfer exceeds your remaining daily limit (SGD X,XXX.XX)`).
- **Graceful API error propagation:** If server-side validation rejects a submission, the error is displayed in a prominent `role="alert"` banner while preserving user input so they can rectify and retry without losing their entered data.

### 3. Theming & anti-flash design
- **No-flash theme initialization:** An inline, zero-dependency `<script>` is placed in `index.html` head to inspect `localStorage` and `prefers-color-scheme` before the first paint, applying `data-theme` and `data-segment` attributes to `<html>` synchronously.
- **Strict design tokens:** All styling strictly references the CSS custom properties defined in `brief/design-tokens.css` (e.g., `var(--brand)`, `var(--surface)`, `var(--text)`, `var(--positive)`, `var(--negative)`). No hardcoded color values are used in components.

### 4. Client-side transaction search
- Filtered client-side across the 8 preloaded transactions. Since the dashboard displays recent transactions and the dataset is already present in client memory, filtering client-side avoids unnecessary network round-trips and provides instant, debounce-free feedback.

---

## Loading, empty and error states

1. **Dashboard Loading:**
   - **How it's handled:** `DashboardSkeleton` displays matching pulse skeletons for the balance hero, 3 account cards, transaction table rows, and daily limit card. This prevents layout jumps when data arrives.
   - **How to see it:** Refresh the page (responses take ~500ms by default), or add `?delay=2000` to the URL.

2. **Dashboard Error & Retry:**
   - **How it's handled:** If any query fails, `DashboardError` renders an alert screen with copy `"We couldn't load your dashboard."` and a `"Retry"` button that calls `refetch()` on all failed queries.
   - **How to see it:** Append `?scenario=error` to the request URL or simulate network disconnection.

3. **Transaction Search Empty State:**
   - **How it's handled:** If a search query yields no matches, `EmptyState` displays `"No transactions match your search."` along with a `"Clear search"` button.
   - **How to see it:** Type a non-existent merchant (e.g. `xyz`) into the `Search transactions` box on the dashboard.

4. **Transfer Submission & Failure Handling:**
   - **How it's handled:** During mutation flight, the submit button is disabled and displays `"Sending…"`, preventing duplicate submissions. On failure (e.g., `#fail` test hook), the user remains on the Review step with all input intact and sees a red `role="alert"` banner: `"Something went wrong. Your money hasn't left your account. Try again."`
   - **How to see it:** Enter `#fail` in the transfer note and confirm the transfer.

---

## Tests

The test suite in `src/App.test.tsx` and `src/schemas/transfer-schema.test.ts` covers real user behaviour rather than implementation details:

1. **E4.1 — Amount over balance prevention:**
   - Opens the transfer flow, selects a payee, navigates to the amount step, and inputs `4500.00` (exceeding Everyday Checking's SGD 4,280.55 balance).
   - Asserts that the exact error `Amount can't be more than your available balance (SGD 4,280.55).` is displayed.
   - Asserts that no `POST /api/transfers` network request is ever dispatched.

2. **E4.2 — End-to-end successful transfer:**
   - Walks through all three transfer steps (Recipient → Amount → Review) with valid data.
   - Asserts that confirmation displays the `"Transfer sent"` panel with reference code.
   - Asserts that returning to the dashboard shows the updated balance (`4,160.55`) and refreshed transactions.

3. **E4.3 — Dashboard request failure and retry:**
   - Intercepts `/api/accounts` with a 500 error using MSW.
   - Verifies `"We couldn't load your dashboard."` and the `"Retry"` button are displayed.
   - Restores the handler, clicks `"Retry"`, and verifies the dashboard loads successfully.

4. **Additional Coverage:**
   - "Send to someone new" disclosure flow and 8-digit account number validation.
   - Transaction search filtering and clearing.
   - Light/dark theme toggle and retail/premium segment switching.
   - Transfer failure with `#fail` maintaining review step data integrity.

---

## AI use

- **Which tools & what for:** Used AI for initial project scaffolding, formulating a phased implementation plan, and generating initial component skeletons.
- **Where human decisions overridden/fixed AI suggestions:**
  1. *React Hook Form Discrimination Unions:* An initial AI-generated schema used a discriminated union for the recipient step, which led to TypeScript type inference errors with React Hook Form's `FieldErrors`. Changed this to an optional sub-schema with a `.superRefine()` check so fields remain easily accessible and properly typed.
  2. *Dynamic Balance Resolver:* AI initially suggested a static schema instantiated once inside `useForm`. In a banking context where the user can toggle between checking and savings accounts within the same step, this would cause stale validation against the wrong account's balance. Overrode this with a memoized dynamic resolver that inspects `values.fromAccountId` on every validation run.
  3. *Testing Library JSDOM Cleanup:* Vitest default configuration in the starter did not register automatic React Testing Library cleanup hooks across test boundaries, causing double-rendered components in subsequent tests. Added explicit `cleanup()` in `afterEach` inside `src/test/setup.ts`.

---

## Not done / known issues

- **Multiple currency accounts:** The mock API and brief specify single-currency SGD accounts; multi-currency conversions or cross-border remittance were deliberately left out of scope per §2.
- **Deep link `#transfer`:** Can be added via URL hash listener (`window.location.hash === '#transfer'`) to directly open the modal on load.
- **Persistent segment on API:** The segment switch currently operates locally in `localStorage` per §3.4 without mutating customer profile on the backend.
