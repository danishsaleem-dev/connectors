import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/portal/LoginForm";
import { PortalAuthLayout } from "@/components/portal/PortalAuthLayout";

export const metadata: Metadata = {
  title: "Partner Login",
  robots: { index: false, follow: false },
};

export default function PortalLoginPage() {
  return (
    <PortalAuthLayout
      eyebrow="Connectors Portal"
      title="Everything about your expansion, in one place."
      body="Locations, agreements, documents and your direct line to the Connectors team — for brands, franchisees and landlords we work with."
    >
      <h2 className="font-display text-2xl">Sign in</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        For brands, franchisees, landlords and the Connectors team.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        New here?{" "}
        <Link href="/portal/register" className="text-violet-600 underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </PortalAuthLayout>
  );
}
