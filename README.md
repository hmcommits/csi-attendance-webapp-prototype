# Attendance Webapp — CSI Attendance Prototype

A frontend-only prototype of the CSI Attendance Management System: student event
registration, QR-based check-in, volunteer identity verification, points, and
admin reporting. Built as a lightweight design/UX prototype — **there is no
backend**. All data is generated on load and persisted to `localStorage` in
the browser, so it survives refreshes but resets if you clear site data.

Visual language follows the Attendance Webapp UI/UX design system (Inter, Deep Indigo
`#191265`, 8–16px radii, restrained shadows).

## Stack

React 19 + Vite, React Router, Tailwind CSS v4, Lucide icons, `qrcode.react`.
No state management library — a single `AppContext` holds the mock database
and exposes the actions (login, register, create event, scan, confirm, etc).

## Run it

```bash
npm install
npm run dev
```

## Demo accounts

The login screen has one-click "Quick demo access" buttons for each role, or
sign in manually with:

| Role | GR Number | Password |
| --- | --- | --- |
| Super Admin | `ADMIN001` | `admin123` |
| Event Coordinator | `COORD001` | `coord123` |
| Volunteer | `VOL001` | `vol123` |
| Student | `22CO045` | `student123` |

## What's included

- **Student** — browse/register for events, event-specific QR pass, points
  history, participation timeline.
- **Volunteer** — assigned events, a scanning flow that simulates the
  anti-proxy check (scan → compare identity against a "physical ID" →
  confirm), online/offline mode with a local sync queue.
- **Admin (Coordinator / Super Admin)** — live dashboard, full event CRUD
  with sessions and volunteer assignment, student approvals, staff
  management, CSV exports, and a points leaderboard.

## Notes on the prototype

- QR tokens are base64-encoded JSON, not signed JWTs — there's no server to
  verify a signature against.
- "Excel"/"PDF" exports in the Reports page fall back to CSV — this is a
  frontend-only prototype with no report-generation service.
- Camera scanning is simulated (pick the next registrant, or search by name)
  rather than using a live camera feed, since there are no real physical QR
  codes to scan against in a demo environment.
