"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Modal } from "@/components/Modal";
import { OrbitField } from "@/components/OrbitField";
import { LoginForm } from "@/components/portal/LoginForm";
import { RegisterForm } from "@/components/portal/RegisterForm";
import { site } from "@/lib/site";

const COPY = {
  login: {
    eyebrow: "Connectors Portal",
    title: "Everything about your expansion, in one place.",
    body: "Locations, agreements, documents and your direct line to the Connectors team — for brands, franchisees and landlords we work with.",
  },
  register: {
    eyebrow: "Connectors Portal",
    title: "Join the network.",
    body: "Brands, franchisees and landlords all start here. Fill in your profile, and our team will follow up directly.",
  },
} as const;

/**
 * Mounted once in the marketing layout. Reads `?auth=login` / `?auth=register`
 * from the URL rather than local component state, so any "Partner login"
 * link anywhere on the site — including plain server-rendered <Link>s — can
 * open it without prop-drilling an onClick handler through every page.
 * /portal/login and /portal/register still exist as real pages (middleware
 * redirects logged-out visitors there directly), this is just how the modal
 * is discovered while browsing.
 */
export function AuthModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("auth");

  if (view !== "login" && view !== "register") return null;

  function close() {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("auth");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const copy = COPY[view];

  return (
    <Modal onClose={close} className="max-w-3xl overflow-hidden lg:grid lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-white lg:flex">
        <OrbitField
          count={26}
          strokeWidth={0.25}
          className="animate-orbit pointer-events-none absolute -left-32 top-1/2 h-[30rem] w-[30rem] -translate-y-1/2 text-white/[0.06]"
        />
        <div className="relative z-10">
          <Logo size="sm" onDark />
        </div>
        <div className="relative z-10 max-w-xs">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-violet-200/70">
            {copy.eyebrow}
          </p>
          <h2 className="font-display display-md mt-4 text-balance">{copy.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60 text-pretty">{copy.body}</p>
        </div>
        <p className="relative z-10 text-xs text-white/35">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>

      <div className="flex flex-col justify-center p-8 sm:p-10">
        {view === "login" ? (
          <>
            <h2 className="font-display text-2xl">Sign in</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              For brands, franchisees, landlords and the Connectors team.
            </p>
            <div className="mt-8">
              <LoginForm />
            </div>
            <p className="mt-6 text-center text-sm text-[var(--muted)]">
              New here?{" "}
              <Link
                href="?auth=register"
                scroll={false}
                className="text-violet-600 underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl">Create an account</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Takes about a minute.</p>
            <div className="mt-8">
              <RegisterForm />
            </div>
            <p className="mt-6 text-center text-sm text-[var(--muted)]">
              Already have an account?{" "}
              <Link
                href="?auth=login"
                scroll={false}
                className="text-violet-600 underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
