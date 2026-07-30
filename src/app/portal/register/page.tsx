import type { Metadata } from "next";
import Link from "next/link";
import { PortalAuthLayout } from "@/components/portal/PortalAuthLayout";
import { RegisterForm } from "@/components/portal/RegisterForm";

export const metadata: Metadata = {
  title: "Create an Account",
  robots: { index: false, follow: false },
};

export default function PortalRegisterPage() {
  return (
    <PortalAuthLayout
      eyebrow="Connectors Portal"
      title="Join the network."
      body="Brands, franchisees and landlords all start here. Fill in your profile, and our team will follow up directly."
    >
      <h2 className="font-display text-2xl">Create an account</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">Takes about a minute.</p>
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/portal/login" className="text-violet-600 underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </PortalAuthLayout>
  );
}
