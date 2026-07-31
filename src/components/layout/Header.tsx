"use client";

import { clsx } from "clsx";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui";
import { divisions } from "@/lib/content/divisions";
import { audiences } from "@/lib/site";

const ease = [0.16, 1, 0.3, 1] as const;

type MenuKey = "services" | "audiences";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Bridges the gap between trigger and panel so the menu doesn't snap shut
  // when the cursor crosses the few pixels between them.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Any navigation closes everything.
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenMenu(null);
      setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--background)] transition-all duration-500",
        scrolled && "shadow-[0_1px_0_var(--border),0_8px_24px_-16px_rgba(20,20,26,0.16)]",
      )}
    >
      <div
        className={clsx(
          "shell flex items-center justify-between transition-all duration-500",
          scrolled ? "h-14" : "h-16 md:h-20",
        )}
      >
        <Logo size={scrolled ? "sm" : "md"} />

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          onMouseLeave={scheduleClose}
        >
          <NavLink href="/about" active={pathname === "/about"}>
            About
          </NavLink>

          <MenuTrigger
            label="Services"
            open={openMenu === "services"}
            onOpen={() => {
              cancelClose();
              setOpenMenu("services");
            }}
          />
          <MenuTrigger
            label="Who We Serve"
            open={openMenu === "audiences"}
            onOpen={() => {
              cancelClose();
              setOpenMenu("audiences");
            }}
          />

          <NavLink href="/consultants" active={pathname.startsWith("/consultants")}>
            Partners
          </NavLink>
          <NavLink href="/app" active={pathname === "/app"}>
            App
          </NavLink>
          <NavLink href="/contact" active={pathname === "/contact"}>
            Contact
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {/* Wrapper carries the responsive visibility instead of passing it
              as a className override to ButtonLink — both variants hardcode
              their own display utility (inline-flex), and Tailwind v4 orders
              same-property utilities by internal category rather than by
              source order, so `hidden` from a later-appended className
              doesn't reliably beat it. */}
          <div className="hidden items-center gap-2 md:flex">
            <ButtonLink href="/portal/login" variant="ghost" size="sm" showIcon={false}>
              Join
            </ButtonLink>
            <ButtonLink href="/for-brands" size="sm">
              Start a conversation
            </ButtonLink>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] lg:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Desktop mega-menus */}
      <AnimatePresence>
        {openMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="hidden border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl lg:block"
          >
            <div className="shell py-8">
              {openMenu === "services" ? <ServicesMenu /> : <AudiencesMenu />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-[var(--border)] bg-[var(--background)] lg:hidden"
          >
            <div className="shell space-y-8 py-8">
              <MobileGroup title="Company">
                <MobileLink href="/about">About</MobileLink>
                <MobileLink href="/app">The App</MobileLink>
                <MobileLink href="/contact">Contact</MobileLink>
              </MobileGroup>

              <MobileGroup title="Who we serve">
                {audiences.map((a) => (
                  <MobileLink key={a.slug} href={`/${a.slug}`}>
                    {a.nav}
                  </MobileLink>
                ))}
              </MobileGroup>

              <MobileGroup title="Partners Program">
                <MobileLink href="/consultants">Consultants directory</MobileLink>
                <MobileLink href="/partners">About the programme</MobileLink>
                <MobileLink href="/become-a-vendor">Become a vendor</MobileLink>
              </MobileGroup>

              <MobileGroup title="Services">
                <MobileLink href="/services">All services</MobileLink>
                {divisions.map((d) => (
                  <MobileLink key={d.slug} href={`/services/${d.slug}`}>
                    {d.navLabel}
                  </MobileLink>
                ))}
              </MobileGroup>

              <div className="flex flex-col gap-3">
                <ButtonLink href="/for-brands" className="w-full">
                  Start a conversation
                </ButtonLink>
                <ButtonLink
                  href="/portal/login"
                  variant="secondary"
                  showIcon={false}
                  className="w-full"
                >
                  Partner login
                </ButtonLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ------------------------------------------------------------------ */

function navItemStyles(active: boolean) {
  return clsx(
    "rounded-full px-4 py-2 text-sm transition-all",
    active ? "text-violet-600" : "text-[var(--foreground)]/80 hover:text-violet-600",
  );
}

function NavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link href={href} className={navItemStyles(active)}>
      {children}
    </Link>
  );
}

function MenuTrigger({
  label,
  open,
  onOpen,
}: {
  label: string;
  open: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onOpen}
      onFocus={onOpen}
      onClick={onOpen}
      aria-expanded={open}
      className={clsx("inline-flex items-center gap-1", navItemStyles(open))}
    >
      {label}
      <ChevronDown
        size={14}
        className={clsx("transition-transform duration-300", open && "rotate-180")}
      />
    </button>
  );
}

function ServicesMenu() {
  return (
    <div className="grid grid-cols-[1fr_2fr] gap-10">
      <div>
        <p className="eyebrow">Seven divisions</p>
        <p className="font-display display-md mt-3 max-w-xs">
          One ecosystem, end to end.
        </p>
        <Link
          href="/services"
          className="mt-5 inline-block text-sm text-violet-600 underline underline-offset-4"
        >
          View all services
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
        {divisions.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/services/${d.slug}`}
              className="group flex gap-4 rounded-2xl px-4 py-3 transition-colors hover:bg-violet-600/[0.05]"
            >
              <span className="font-display text-sm text-violet-400">{d.index}</span>
              <span>
                <span className="block text-sm font-medium group-hover:text-violet-600">
                  {d.navLabel}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  {d.short}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AudiencesMenu() {
  return (
    <ul className="grid grid-cols-4 gap-4">
      {audiences.map((a) => (
        <li key={a.slug}>
          <Link
            href={`/${a.slug}`}
            className="group block h-full rounded-2xl border border-[var(--border)] p-5 transition-all hover:border-violet-400 hover:bg-violet-600/[0.04]"
          >
            <span className="block font-display text-lg group-hover:text-violet-600">
              {a.title}
            </span>
            <span className="mt-2 block text-xs leading-relaxed text-[var(--muted)]">
              {a.lead}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MobileGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="eyebrow mb-3">{title}</p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function MobileLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="border-b border-[var(--border)] py-3 font-display text-xl"
    >
      {children}
    </Link>
  );
}
