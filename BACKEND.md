# Connectors — System Overview

A plain-language reference for how the whole system fits together: the public
site, the portal, and the database underneath both. No code — just the shape
of it, module by module, with what's frontend and what's backend called out
for each. Written to stay current — update it when a module's shape changes,
not just when someone asks for a snapshot.

## The core idea

The portal is **flat and role-scoped**, not a matching engine. Each
participant type signs up, fills in a profile, and does a small, fixed set of
things relevant to their role. Nobody sees another participant's data end to
end, and nobody messages another participant directly — every conversation in
the system has a Connectors staff member on one side of it. Where two parties
need to be introduced (a franchisee to a brand, a vendor to a project), that
happens manually, by your team, using the details the portal surfaces to
them — never as an automated match.

Two systems that sit near each other but are **deliberately separate** and
should never be conflated in copy, nav, or code:

- **Consultants** — Connectors' own in-house consultancy service, sold to
  brands/franchisees/landlords. Admin-managed roster, no login for the
  consultants themselves. Fully public: a listing page, individual profile
  pages, real inquiries.
- **Partners Program (Vendors)** — external designers, architects, interior
  specialists, agencies, consultants (the discipline), and contractors who
  join Connectors' private bench. They *do* get portal logins, but their
  profiles are **never published anywhere public** — no directory, no
  browsable listing. Introductions happen only when your team makes them.

## The six participant types (+ Admin)

| Type | What they are | Their job in the portal |
|---|---|---|
| **Brand** | A business expanding into new space | Browse **Locations** (read-only + favorite + Enquire), see the franchise-listing story on the public site if they're franchising. |
| **Franchisee** | Someone looking to run a franchise | Submit a **request** describing what they want. |
| **Landlord** | Owns individual retail/commercial units | List **properties** (Locations) — the space brands then browse. |
| **Developer** | Runs a mall or larger scheme | Same as landlord — lists properties. |
| **Investor** | Has capital to deploy | Submit a **request** describing their mandate. |
| **Vendor** | External designer/architect/interior/agency/consultant/contractor | Keep a profile current for Connectors' internal bench. Never public. |
| **Admin** (Connectors staff) | Runs the whole thing | Sees everyone, everything, across every module below. No organization of their own. |

Every role also gets **Saved Notes** (see below) — the one feature that isn't
role-specific.

## Accounts & login

- **Self-registration** (`/portal/register`, and the same form embedded in
  the login/register modal reachable from anywhere on the marketing site via
  "Join"/"Partner login") is open to **all six** types now, including
  Investor and Vendor — that used to be admin-only for investors and
  locked-in-only for vendors; both are now on the general picker.
- **Vendor signup asks for discipline up front** (designer/architect/interior
  /agency/consultant/contractor) — it's the one field that makes a new
  partner placeable, so the roster is useful immediately rather than after a
  separate onboarding step.
- **The login/register experience is a modal, not a page.** `/portal/login`
  and `/portal/register` still exist as real routes (middleware redirects a
  logged-out visitor straight to `/portal/login` if they hit a protected
  route directly), but every in-context "sign in" link on the marketing site
  opens an overlay instead — driven by a `?auth=login` / `?auth=register`
  query param read client-side, so it works from any page without a
  navigation. The header also swaps a "Join" text button for a plain rounded
  profile icon that links straight to `/portal` (or `/portal/admin`) once
  signed in, instead of re-showing the login form to someone already
  authenticated.
- **Onboarding is a gate**: until an organization finishes its profile, it
  can't reach anything else in the portal.
- **Login** uses a signed, tamper-proof cookie — not a third-party auth
  service. Every request re-checks it, both at the routing level and again
  inside each Server Action, so a routing mistake alone can never grant
  access.
- Admin accounts have no organization attached — permission is a single "is
  this user staff" flag, checked everywhere that matters.
- **Session state on the public site is fetched client-side** (`/api/session`),
  never read server-side inside a shared layout — reading `cookies()` in the
  marketing layout would force every otherwise-static page (home, `/about`,
  every audience page) into dynamic, per-request rendering just to
  personalize one header icon. Any future "is this visitor signed in"
  feature on a public page should follow the same pattern.

## The data, in plain terms

| Table | Holds | Notes |
|---|---|---|
| **Organizations** | One row per company/account | Name, type (one of the six above), status, onboarding-complete flag. |
| **Users** | Logins | Each belongs to one organization, or is Admin staff with none. |
| **Profiles** (one table per type) | The qualifying details specific to that type | Brand: industry, description, `isFranchising` flag + franchise terms (investment range, fee, royalty, outlet count) — this flag is what makes a brand eligible to appear on the public franchise-listing section. Franchisee: budget, territory. Landlord/Developer: portfolio. Investor: ticket size. Vendor: discipline, specialties, cities served, bio — **never exposed publicly, regardless of any "vetted" status**. |
| **Properties** | Space listed by a landlord/developer | City, country, area, size, dimensions, parking, photos/video, status. Rent-per-month, available-from, and floor-level fields still exist in the database (nothing was deleted) but are no longer shown on any add/edit form, by request — a save never overwrites them if a form doesn't submit them, so old data isn't silently wiped. |
| **Property Favorites** | A brand's starred locations | Org-scoped (not per-user) — anyone signed into that brand's account sees the same saved list. |
| **Requests** | What a franchisee or investor is looking for, or a brand's enquiry about a specific location | Visible only to Admin — a queue your team works from, not a browsing or matching system. |
| **Consultants** | Connectors' own in-house consultant roster | Name, photo, expertise tags, years of experience, bio, repeatable **Experience** and **Degrees/Certificates** entries (each with an optional supporting document upload), a public URL slug, and `isPublished` — the actual public/not-public gate for this module (unlike the same-named flag on vendors). |
| **Consultant Inquiries** | Messages sent from a consultant's public profile page | Its own table and its own admin queue — separate from the general Enquiries below, since these aren't tied to any org type and never "convert" into one. |
| **Documents** | Files or links shared between Connectors and one organization | Agreements, onboarding packs, etc. |
| **Messages** | A simple chat thread between Connectors and one organization | No thread between two organizations anywhere in the system. |
| **Notes** | A free-form scratchpad, one per portal account | Keyed on the **user**, not the organization — the one table owned by an individual login rather than an org, because Admin has no organization to key it on and gets this feature too. |
| **Enquiries** | Raw submissions from the four public audience forms (for-brands, for-franchise, for-landlords, for-investors) | See "Public forms → portal" below. Now carries an optional link back to the submitting account. |

## The public website (frontend)

| Route | What it is |
|---|---|
| `/` | Homepage — hero, division grid, industries, process, testimonials, FAQ. |
| `/about`, `/contact`, `/app` | Story, contact, mobile-app pitch. |
| `/solutions`, `/solutions/[slug]` | The seven service divisions. |
| `/for-brands`, `/for-franchise`, `/for-landlords`, `/for-investors` | The four audience pages, each ending in an application form. **Every form is now gated**: a signed-out visitor sees it blurred behind a lock icon and a "Log in to continue" button (the modal above); once signed in, the submission auto-links to their account so Admin sees a real, verified contact rather than free-typed details. `/for-franchise` additionally shows a live **"Actively franchising" brand listing** (every brand with `isFranchising` on and an active account), filterable by industry via pill chips — the one place the public site reads live brand data. |
| `/consultants`, `/consultants/[slug]` | The in-house consultants: a listing page (photo/name/expertise cards linking to a profile) and full profile pages (portrait hero, expertise, bio, an Experience timeline, Degrees/Certificates cards, an enquiry form). Gated by `isPublished` on the consultant record — same idea as vendors' flag, but this one really does mean "shown publicly." |
| `/partners`, `/become-a-vendor`, `/vendor-services` | The Partners Program pitch, the vendor signup (discipline captured up front), and a catalog of every discipline/service the program covers (design, build, plus operational services like accounts, audit, training, advertising). **None of these ever list or name an actual vendor** — there is no public directory and none is planned. |
| `/available-locations` | Public browsing of listed properties. Anyone can see basic info (image, city, country, area); the image is blurred and the card opens a "brands only" prompt for anyone who isn't signed in as a brand. A signed-in brand gets the full profile in a modal plus an Enquire button. |

## The portal (backend)

Everything under `/portal` is one route group, split by role inside a single
`Sidebar` component (`isAdmin` vs. an org-type-driven participant nav) rather
than two separate layouts.

**Every participant gets:** Dashboard, Profile, Documents, Messages, Saved
Notes — plus, depending on `orgTypeMeta` for their type: **My properties**
(landlord/developer), **Locations** (brand — browse + favorite + Enquire),
**My requests** (franchisee/investor).

**Admin's sidebar:** Overview, Enquiries, Brands, Franchisees, Landlords,
Malls & Developers, Investors, Vendors & Partners, Locations, Consultants,
Consultant Inquiries, Requests, Media, Accounts.

Admin can, across every module: create/view/edit every organization of every
type; review, convert, or archive public enquiries; see every property and
every request in one place with a status they update manually for their own
tracking; manage the consultant roster including publishing profiles;
review consultant inquiries; create portal accounts for anyone with a
temporary password.

### Locations / Properties — who does what

- **Landlord/Developer** (`/portal/properties`): add and manage their own
  listings.
- **Admin** (`/portal/admin/locations`, `/new`, `/[id]`): full CRUD on any
  listing, including a **Landlord/Agent owner picker** — an "agent" in this
  system is just a landlord-type account, not a separate entity.
- **Brand** (`/portal/locations`): browse everything, star a favorite, hit
  Enquire (which files a request the same way any other portal enquiry
  does — no separate "introduction" mechanism).
- **Public** (`/available-locations`): the gated teaser described above.

### Consultants — who does what

- **Admin** (`/portal/admin/consultants`, `/new`, `/[id]`,
  `/consultants/inquiries`): add/edit consultants including their Experience
  and Degree/Certificate entries and optional supporting documents; publish
  or unpublish a profile; review and triage inquiries submitted from the
  public profile pages.
- **Public**: browse and read only — no login involved on the visitor side
  at all, just the `isPublished` gate deciding what's visible.

### Partners Program / Vendors — who does what

- **Vendor** (self-service, via `/become-a-vendor` or the general signup):
  create an account, pick a discipline, build out a profile (specialties,
  cities served, bio) after onboarding.
- **Admin** (`/portal/admin/vendors`): review and mark a vendor "vetted" —
  this is the same `isPublished` field name as consultants but a completely
  different meaning here: it never makes anything public. It only means the
  vendor is ready to be introduced on a real project.
- **Public**: the pitch pages only (`/partners`, `/become-a-vendor`,
  `/vendor-services`). No listing, no names, no directory — by explicit
  decision, not a gap waiting to be filled in.

## How the public website feeds the portal

1. A visitor fills in one of the four audience forms (or a consultant's
   inquiry form, which is separate — see below).
2. If they're signed in, the submission is automatically linked to their
   organization; if not, the form is locked behind the overlay described
   above, so every submission that does go through has real, verified
   contact details attached to an account.
3. It's saved as an **enquiry** (and emailed to your team, if email is
   configured).
4. Admin reviews it under **Enquiries**, sees the linked account if there is
   one, and either **Archives** it or **Converts** it into a new
   organization + profile if it wasn't already tied to an account.

**Consultant inquiries** are a separate, simpler path: submitted from a
consultant's public profile page, they land directly in their own admin
queue (`/portal/admin/consultants/inquiries`) with no conversion step, since
there's no organization for them to become.

## What's deliberately not there

- **No matching or deal pipeline.** Introductions between parties (a
  franchisee and a brand, a vendor and a project) happen manually, off the
  strength of what your team sees in the portal — never automated.
- **No organization ever sees or messages another organization.** The only
  read-only exceptions are brands browsing properties and anyone browsing
  the public consultants directory — both one-directional, with an Enquire/
  inquiry action that goes to Connectors, not to the other party directly.
- **No public vendor directory**, and none planned — see "Partners Program"
  above. If this ever changes, it's a real product decision, not a default
  to fall back into.
- **No live Google Maps picker yet** for property addresses. Plain
  city/country/address fields for now; latitude/longitude columns already
  exist reserved, so adding a real picker later needs no data migration —
  just an API key.

## Under the hood (for reference)

- **Next.js Server Actions** handle every write — no separate API layer.
- **Postgres via Drizzle ORM**, hosted on **Supabase**. Connect through the
  **session pooler** (port 5432 on the pooler hostname) specifically — the
  direct connection is IPv6-only (unreachable from Vercel), and the
  transaction pooler (6543) has been observed sharing backend connections
  between clients mid-session, surfacing as bogus statement-timeout errors.
- **File storage is Supabase Storage** — a private bucket with no public
  read policy; anywhere a photo, logo, or document is displayed, it's
  resolved to a short-lived signed URL at render time, never a public URL.
  Both a direct-upload path (property photos, documents) and a small
  WordPress-style media-library picker (brand logos, consultant photos)
  exist, depending on whether the upload needs to happen before or after
  the owning record is saved.
- **Auth is hand-rolled**: bcrypt for passwords, a signed cookie for
  sessions — no NextAuth or third-party auth dependency.
