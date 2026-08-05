"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut, User, UserCircle } from "lucide-react";
import { logout } from "@/lib/auth/actions";
import { orgTypeMeta } from "@/lib/portal/domain";
import type { OrgType } from "@/lib/db/schema";

type Session = {
  signedIn: boolean;
  isAdmin: boolean;
  name: string | null;
  orgType: OrgType | null;
};

const INITIAL_SESSION: Session = { signedIn: false, isAdmin: false, name: null, orgType: null };

/**
 * Replaces the plain "sign in" icon-link with a hover dropdown once a
 * session exists — Dashboard (routed correctly for admin vs. participant),
 * My Profile for participants, Sign out. Session is fetched client-side
 * from /api/session; see that route for why it isn't read server-side.
 */
export function AccountMenu() {
  const [session, setSession] = useState<Session>(INITIAL_SESSION);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) =>
        setSession({
          signedIn: !!data.signedIn,
          isAdmin: !!data.isAdmin,
          name: data.name ?? null,
          orgType: data.orgType ?? null,
        }),
      )
      .catch(() => {});
  }, []);

  if (!session.signedIn) {
    return (
      <Link
        href="?auth=login"
        aria-label="Sign in"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white transition-colors hover:bg-violet-700"
      >
        <User size={17} />
      </Link>
    );
  }

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  const dashboardHref = session.isAdmin ? "/portal/admin" : "/portal";
  const dashboardLabel = session.isAdmin ? "Admin Dashboard" : "Dashboard";
  const roleLabel = session.isAdmin
    ? "Connectors Staff"
    : session.orgType
      ? orgTypeMeta(session.orgType).singular
      : null;

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white transition-colors hover:bg-violet-700"
      >
        <User size={17} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-1.5 shadow-[0_24px_48px_-24px_rgba(20,20,26,0.35)]"
        >
          {(session.name || roleLabel) && (
            <div className="border-b border-[var(--border)] px-4 py-3">
              {session.name && <p className="truncate text-sm font-medium">{session.name}</p>}
              {roleLabel && <p className="mt-0.5 text-xs text-[var(--muted)]">{roleLabel}</p>}
            </div>
          )}

          <Link
            href={dashboardHref}
            role="menuitem"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-violet-50 hover:text-violet-600"
          >
            <LayoutDashboard size={15} />
            {dashboardLabel}
          </Link>

          {!session.isAdmin && (
            <Link
              href="/portal/profile"
              role="menuitem"
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-violet-50 hover:text-violet-600"
            >
              <UserCircle size={15} />
              My Profile
            </Link>
          )}

          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
