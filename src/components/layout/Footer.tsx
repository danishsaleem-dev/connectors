import Link from "next/link";
import { Logo } from "@/components/Logo";
import { OrbitField } from "@/components/OrbitField";
import { divisions } from "@/lib/content/divisions";
import { audiences, offices, site } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      {/* The mark, oversized and very faint — a watermark, not a wash. */}
      <OrbitField
        count={30}
        strokeWidth={0.25}
        className="animate-orbit pointer-events-none absolute -right-48 -bottom-64 h-[40rem] w-[40rem] text-white/[0.07]"
      />

      <div className="shell relative py-20">
        <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr]">
          <div>
            <Logo onDark size="lg" />
            <p className="mt-8 max-w-sm font-display text-2xl leading-snug text-balance">
              {site.promise}
            </p>
            <p className="mt-5 text-sm leading-relaxed text-white/45">
              Brands. Investors. Franchisees. Locations. Opportunities.
              <br />
              All connected.
            </p>
          </div>

          <FooterColumn title="Solutions">
            <FooterLink href="/solutions">All solutions</FooterLink>
            {divisions.map((d) => (
              <FooterLink key={d.slug} href={`/solutions/${d.slug}`}>
                {d.navLabel}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Who we serve">
            {audiences.map((a) => (
              <FooterLink key={a.slug} href={`/${a.slug}`}>
                {a.nav}
              </FooterLink>
            ))}
            <FooterLink href="/consultants">Consultants</FooterLink>
            <FooterLink href="/partners">Partners Program</FooterLink>
            <FooterLink href="/become-a-vendor">Become a Vendor</FooterLink>
            <FooterLink href="/app">The App</FooterLink>
            <FooterLink href="/about">About</FooterLink>
          </FooterColumn>

          <FooterColumn title="Get in touch">
            <a
              href={`mailto:${site.email.general}`}
              className="block py-1.5 text-sm text-white/60 transition-colors hover:text-white"
            >
              {site.email.general}
            </a>
            <div className="mt-3 flex gap-4">
              {Object.entries(site.socials).map(([key, social]) => (
                <a
                  key={key}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 transition-colors hover:text-violet-200"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </FooterColumn>
        </div>

        {/* Three offices, given equal weight — the international footprint is
            part of the pitch, so it gets its own band rather than a footnote. */}
        <div className="mt-16 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
          {offices.map((office) => (
            <div key={office.id}>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-violet-200/70">
                {office.label}
              </p>
              <address className="mt-3 text-sm not-italic leading-relaxed text-white/60">
                {office.address.street}
                <br />
                {office.address.locality}
                {office.address.region ? ` ${office.address.region}` : ""}
                {office.address.postalCode ? ` ${office.address.postalCode}` : ""}
                <br />
                {office.address.country}
              </address>
              <a
                href={`tel:${office.phone.href}`}
                className="mt-2 inline-block text-sm text-white/85 transition-colors hover:text-white"
              >
                {office.phone.display}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <p>{site.tagline}</p>
            <Link href="?auth=login" scroll={false} className="transition-colors hover:text-white/70">
              Partner login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/35">
        {title}
      </p>
      <div className="mt-4 flex flex-col">{children}</div>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="py-1.5 text-sm text-white/60 transition-colors hover:text-white"
    >
      {children}
    </Link>
  );
}
