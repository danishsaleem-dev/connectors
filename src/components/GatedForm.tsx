"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { ButtonLink } from "@/components/ui";

/**
 * Wraps a public application form. Signed-out visitors see it blurred and
 * unreachable behind a lock overlay rather than able to fill it in and hit
 * a submission that (per recordEnquiry) just wouldn't be tied to an
 * account — the form only becomes usable once there's a session to attach
 * it to, so contact details reaching admin are always a real account's,
 * not whatever a visitor happened to type.
 *
 * Session state is fetched client-side from /api/session rather than read
 * server-side on the page — same reasoning as the header: a cookies() read
 * in a shared layout/page would force otherwise-static marketing pages into
 * dynamic rendering. Defaults to locked until the fetch resolves, so there's
 * no flash of an interactive form that isn't really submittable yet.
 */
export function GatedForm({ children }: { children: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => setSignedIn(!!data.signedIn))
      .catch(() => setSignedIn(false));
  }, []);

  const locked = signedIn !== true;

  return (
    <div className="relative">
      <div
        aria-hidden={locked}
        className={locked ? "pointer-events-none select-none blur-sm" : undefined}
      >
        {children}
      </div>

      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[var(--surface)]/80 p-8 text-center backdrop-blur-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white">
            <Lock size={20} />
          </span>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--foreground)]">
            Sign in to submit this application — it keeps your details
            attached to your account, so our team knows who they're talking to.
          </p>
          <ButtonLink href="?auth=login">Log in to continue</ButtonLink>
        </div>
      )}
    </div>
  );
}
