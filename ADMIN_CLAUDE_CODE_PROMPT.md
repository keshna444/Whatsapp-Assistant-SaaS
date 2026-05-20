# Claude Code Prompt — BookFlow Admin Dashboard

---

Paste everything below this line into Claude Code:

---

## Context

You are working on **BookFlow** — a WhatsApp AI booking automation SaaS for small businesses.

The app already has:
- A working frontend (React with Next.js or Vite + Tailwind CSS)
- A working backend (Node.js / Express or Next.js API routes)
- Auth system with JWT (users can sign up, log in, get a session)
- A `users` table/collection in the database with fields: name, email, password, businessName, plan, createdAt
- Existing routes: `/api/auth`, `/api/user`, `/api/whatsapp`
- An onboarding flow at `/onboarding`
- A user dashboard at `/dashboard`

## Your Task

Add a **fully protected Admin Dashboard** at `/admin`.

Work through the following steps **in order**. Do not skip any step. After each step, confirm it works before moving to the next.

---

## STEP 1 — Add `role` Field to Database

### If using Supabase (Postgres):
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
```

### If using MongoDB / Mongoose — update the User schema:
```js
role: {
  type: String,
  enum: ['user', 'admin'],
  default: 'user'
}
```

Do NOT create any UI for setting roles. Founders will set `role: "admin"` manually in the database.

Make sure the `role` field is included when the JWT token is generated on login, and when the `/api/auth/me` endpoint returns the current user.

---

## STEP 2 — Backend: Admin Middleware

Create `middleware/requireAdmin.js` (or `.ts`):

```js
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' })
  }
  next()
}
```

Apply `requireAuth` first, then `requireAdmin` on all admin routes:
```js
router.use('/api/admin', requireAuth, requireAdmin)
```

---

## STEP 3 — Backend: Admin API Routes

Create a new router file `routes/admin.js` with these endpoints:

### Users
- `GET /api/admin/users` — return all users, paginated (page + limit query params), sorted by createdAt DESC
  - Each user object must include: id, name, email, businessName, plan, role, whatsappConnected, createdAt, suspended
- `GET /api/admin/users/:id` — return full user detail
- `PATCH /api/admin/users/:id/suspend` — toggle `suspended: true/false` on the user
- `PATCH /api/admin/users/:id/plan` — update user's plan (body: `{ plan: "starter" | "growth" | "pro" }`)
- `DELETE /api/admin/users/:id` — delete user and all related data
- `POST /api/admin/users/:id/reset-password` — send a password reset email to the user

### WhatsApp
- `GET /api/admin/whatsapp` — return all WhatsApp connection records with: userId, userName, phoneNumber, metaStatus, webhookStatus, apiStatus

### Analytics
- `GET /api/admin/analytics` — return:
  ```json
  {
    "totalUsers": 0,
    "activeUsers": 0,
    "messagesProcessed": 0,
    "aiRepliesSent": 0,
    "newSignupsLast7Days": 0,
    "mrr": 0
  }
  ```
  Compute these from your database. If a field is not yet tracked, return 0 — do NOT fake data.

### Subscriptions
- `GET /api/admin/subscriptions` — return all users with plan info: userId, name, email, plan, stripeStatus, amount, nextBillingDate, stripeCustomerId

---

## STEP 4 — Frontend: Route Guard Component

Create `src/components/AdminRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth' // use your existing auth hook

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}
```

Add the route to your router:
```jsx
import { AdminRoute } from './components/AdminRoute'
import AdminDashboard from './pages/admin'

<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>
```

---

## STEP 5 — Frontend: Admin Dashboard Page

Create `src/pages/admin/index.jsx`.

### Layout requirements:
- Sidebar on the left with 4 navigation items: Users, WhatsApp, Analytics, Subscriptions
- Clicking each nav item shows that tab's content in the main area
- Show the BookFlow logo and an "Admin Panel" label at the top of the sidebar
- Show the logged-in admin's name at the bottom of the sidebar
- The page must be fully responsive

### Tab 1 — Users

Fetch from `GET /api/admin/users?page=1&limit=20`.

Render a table with these columns:
| Name | Email | Business | Plan | WhatsApp | Joined | Actions |

Actions per row (as a dropdown or inline buttons):
- **View** — open a slide-over panel with full user detail
- **Suspend / Unsuspend** — call `PATCH /api/admin/users/:id/suspend`, show toast on success
- **Upgrade Plan** — open a small modal with plan selector, call `PATCH /api/admin/users/:id/plan`
- **Reset Password** — call `POST /api/admin/users/:id/reset-password`, confirm with user first
- **Delete** — show a confirmation dialog before calling `DELETE /api/admin/users/:id`

Add pagination controls at the bottom.
Add a search input at the top that filters by name or email (client-side for now).

### Tab 2 — WhatsApp Connections

Fetch from `GET /api/admin/whatsapp`.

Render a table with columns:
| User | Phone Number | Meta Status | Webhook | API Status |

Meta Status badge colors:
- `approved` → green
- `pending` → yellow
- `rejected` → red

### Tab 3 — Analytics

Fetch from `GET /api/admin/analytics`.

Show 6 KPI cards in a 3-column grid:
1. Total Users
2. Active Users (30d)
3. MRR
4. Messages Processed
5. AI Replies Sent
6. New Signups (7d)

Each card: icon, label, large number. Use Tailwind for styling. Keep it clean.

Below the cards: a line chart showing new signups per day for the last 30 days. Use Recharts (`LineChart`) if available, otherwise skip the chart.

### Tab 4 — Subscriptions

Fetch from `GET /api/admin/subscriptions`.

Render a table with columns:
| User | Plan | Status | Amount | Next Billing | Stripe ID |

Status badge colors:
- `active` → green
- `trialing` → blue
- `past_due` → red
- `cancelled` → gray

---

## STEP 6 — Styling Rules

- Match the existing BookFlow design system (green primary color, clean whites, Tailwind CSS)
- Use the same font, border radius, and card style as the existing dashboard
- All tables must have hover states on rows
- Show empty states when there is no data (e.g. "No users yet")
- Show loading skeletons while data is fetching
- Show error messages if API calls fail

---

## STEP 7 — Final Checks

Before finishing, verify:
- [ ] Navigating to `/admin` as a non-admin user redirects to `/dashboard`
- [ ] All `/api/admin/*` routes return 403 if the user is not an admin
- [ ] All 4 tabs load data from the backend without errors
- [ ] Suspend, delete, upgrade plan, and reset password actions work end to end
- [ ] The page is responsive on mobile

---

## Important Notes

- Do NOT add any UI for creating admin users. Role assignment is done manually in the database.
- Do NOT use mock/hardcoded data anywhere. All data must come from the real database.
- If a backend field does not exist yet (e.g. messagesProcessed), return 0 from the API — do not fake it.
- Keep the admin route completely invisible to regular users — no links to `/admin` should appear in the user dashboard.
