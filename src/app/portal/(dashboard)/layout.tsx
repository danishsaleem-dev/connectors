import { redirect } from "next/navigation";
import { getCurrentContext } from "@/lib/auth/current-user";
import { Sidebar } from "@/components/portal/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getCurrentContext();
  if (!context) redirect("/?auth=login");

  const { user, organization } = context;

  return (
    <div className="flex min-h-screen bg-[var(--surface-sunken)]">
      <Sidebar
        isAdmin={user.isAdmin}
        orgType={organization?.type}
        name={user.name}
        orgName={organization?.name}
      />
      <main className="min-w-0 flex-1 px-6 py-10 md:px-10 md:py-12">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
