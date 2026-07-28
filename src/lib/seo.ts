import { offices, primaryOffice, site } from "./site";

/**
 * Canonical origin. Vercel injects VERCEL_PROJECT_PRODUCTION_URL on deploys, so
 * preview builds get a working absolute URL without hardcoding the domain.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

function postalAddressLd(office: (typeof offices)[number]) {
  return {
    "@type": "PostalAddress",
    streetAddress: office.address.street,
    addressLocality: office.address.locality,
    ...(office.address.region ? { addressRegion: office.address.region } : {}),
    ...(office.address.postalCode
      ? { postalCode: office.address.postalCode }
      : {}),
    addressCountry: office.countryCode,
  };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: SITE_URL,
    slogan: site.tagline,
    description: site.description,
    logo: absoluteUrl("/logo.png"),
    email: site.email.general,
    telephone: primaryOffice.phone.href,
    address: postalAddressLd(primaryOffice),
    // All three offices, so search engines can associate the business with
    // each location rather than just the registered one.
    location: offices.map((office) => ({
      "@type": "Place",
      name: `${site.name} — ${office.label}`,
      telephone: office.phone.href,
      address: postalAddressLd(office),
    })),
    contactPoint: offices.map((office) => ({
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: office.phone.href,
      areaServed: office.countryCode,
      availableLanguage: "en",
    })),
    sameAs: Object.values(site.socials).map((s) => s.url),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: SITE_URL,
    description: site.description,
  };
}

export function serviceLd(input: {
  name: string;
  description: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: absoluteUrl(`/services/${input.slug}`),
    provider: {
      "@type": "Organization",
      name: site.name,
      url: SITE_URL,
    },
    areaServed: primaryOffice.address.country,
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  };
}
