# Connectors Portal — Backend Structure

A plain-language reference for how the backend/portal is built so far. No code, just the shape of it.

## The core idea

The portal is **flat and role-scoped**, not a matching engine. Each participant type signs up, fills in a profile, and does exactly one more thing relevant to their role. Nobody sees another participant's data, and nobody messages another participant directly — every conversation in the system has a Connectors staff member on one side of it. If two parties need to be introduced, that happens manually, outside the portal, by your team.

## The five participant types (+ Admin)

| Type | What they are | Their one job in the portal |
|---|---|---|
| **Brand** | A business expanding into new space | Browse the **Locations** list — every property landlords/developers have submitted. Read-only. |
| **Franchisee** | Someone looking to run a franchise | Submit a **request** describing what they want. Nothing else. |
| **Landlord** | Owns individual retail/commercial units | List **properties** — the space brands then browse. |
| **Developer** | Runs a mall or larger scheme | Same as landlord — lists properties. |
| **Investor** | Has capital to deploy | Submit a **request** describing their mandate. Nothing else. |
| **Admin** (Connectors staff) | Runs the whole thing | Sees everyone, everything. No organization of their own. |

Nobody browses, requests, or lists anything outside their one job above. That's deliberate — it's what keeps the system simple.

## Accounts & login

- **Self-registration** (`/portal/register`) is open to Brand, Franchisee, Landlord, and Developer. A visitor picks their type, and the system creates their organization and a blank profile together, signs them in immediately, and sends them to a short onboarding form.
- **Investors are added by Admin only** — capital relationships start with a conversation, not a signup form.
- **Onboarding is a gate**: until an organization finishes its profile, it can't reach anything else in the portal.
- **Login** (`/portal/login`) uses a signed, tamper-proof cookie — not a third-party auth service. Every request re-checks it, both at the routing level and again inside each action, so a routing mistake alone can never grant access.
- Admin accounts have no organization attached — permission comes from a simple "is this user staff" flag, checked everywhere that matters.

## The data, in plain terms

| What it holds | Notes |
|---|---|
| **Organizations** | One row per company/account — its name, type (from the table above), status, and whether onboarding is done. |
| **Users** | Logins. Each belongs to one organization (or is Admin staff, with none). |
| **Profiles** (one shape per type) | The qualifying details specific to that type — a brand's industry and franchise terms, a franchisee's budget and territory, a landlord's portfolio, an investor's ticket size, and so on. |
| **Properties** | Space listed by a landlord or developer — city, size, rent, photos, video, floor level, parking, etc. This is the one thing brands are shown. |
| **Requests** | What a franchisee or investor is looking for. Visible only to Admin — there's no browsing, no matching, just a queue your team works from. |
| **Documents** | Files or links shared between Connectors and one organization (agreements, onboarding packs, etc.). |
| **Messages** | A simple chat thread between Connectors and one organization. There is no thread between two organizations anywhere in the system. |
| **Enquiries** | Raw submissions from the four public forms on the marketing site (for-brands, for-franchise, for-landlords, for-investors) — see below. |

## How the public website feeds the portal

1. A visitor fills in one of the four public enquiry forms.
2. It's saved as an **enquiry** (and emailed to your team, if email is configured) — nothing else happens automatically.
3. Admin reviews it under **Enquiries** and either **Archives** it or **Converts** it.
4. Converting creates the real organization, its profile, and — depending on type — either a **request** (franchisee/investor/brand) or a **property listing** (landlord).

This is the only door from the public site into the portal's real data. A submission never becomes a live organization without a human deciding so.

## What Admin can do

- Manage every organization of every type: create, view, edit.
- Review, convert, or archive public enquiries.
- See **every** property listed, across all landlords and developers, in one place.
- See **every** request submitted, with a status they update manually (open / in review / matched / closed) purely for their own tracking.
- Create portal accounts for anyone, with a temporary password (emailed automatically if email sending is configured, otherwise shown once for you to pass on).
- Share documents and exchange messages with any organization.

## What's deliberately not there

- **No matching or deal pipeline.** Earlier in this project a full blind-matching system existed (admin-brokered introductions, staged deals, masked identities); it's been removed in favour of the simpler model above. Introductions now happen manually, off-platform.
- **No organization ever sees or messages another organization.** The only exception is brands browsing the property list, which is one-directional and has no reply/contact action attached.
- **No live map picker yet.** Property listings have plain city/country/address fields for now. The database already has latitude/longitude columns reserved, so adding a real Google Maps picker later needs no data migration — just an API key.
- **No direct photo/video upload yet.** Photos and video are pasted-in links (same pattern as Documents), not a drag-and-drop uploader. Real uploads would need file storage (Vercel Blob) wired in.

## Under the hood (for reference)

- **Next.js Server Actions** handle every write — no separate API layer.
- **Postgres via Drizzle ORM**, using a standard connection driver — works with Neon, Supabase, Railway, or any other Postgres host, not locked to one provider.
- **Auth is hand-rolled**: bcrypt for passwords, a signed HMAC cookie for sessions — no NextAuth or third-party auth dependency.
