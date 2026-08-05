"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Briefcase,
  Building,
  Building2,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Handshake,
  Heart,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  StickyNote,
  Store,
  TrendingUp,
  UserCircle,
  UserPlus,
  Users,
} from "lucide-react";
import { logout } from "@/lib/auth/actions";
import { orgTypeMeta } from "@/lib/portal/domain";
import type { OrgType } from "@/lib/db/schema";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const ADMIN_NAV: NavItem[] = [
  { href: "/portal/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/portal/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/portal/admin/brands", label: "Brands", icon: Store },
  { href: "/portal/admin/franchisees", label: "Franchisees", icon: Users },
  { href: "/portal/admin/landlords", label: "Landlords", icon: Building2 },
  { href: "/portal/admin/developers", label: "Malls & Developers", icon: Building },
  { href: "/portal/admin/investors", label: "Investors", icon: TrendingUp },
  { href: "/portal/admin/vendors", label: "Vendors & Partners", icon: Handshake },
  { href: "/portal/admin/locations", label: "Locations", icon: MapPin },
  { href: "/portal/admin/consultants", label: "Consultants", icon: Briefcase },
  { href: "/portal/admin/consultants/inquiries", label: "Consultant Inquiries", icon: Mail },
  { href: "/portal/admin/requests", label: "Requests", icon: ClipboardList },
  { href: "/portal/admin/media", label: "Media", icon: ImageIcon },
  { href: "/portal/admin/accounts", label: "Accounts", icon: UserPlus },
];

/**
 * Participant nav is assembled from the org's type — nothing here links one
 * module to another. A brand only ever gets a read-only "Locations" list; a
 * landlord/developer only ever gets its own listings; a franchisee/investor
 * only ever gets its own submitted requests. Nobody sees anybody else's.
 */
function participantNav(type: OrgType): NavItem[] {
  const meta = orgTypeMeta(type);
  const nav: NavItem[] = [
    { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal/profile", label: "Profile", icon: UserCircle },
    { href: "/portal/notes", label: "Notes", icon: StickyNote },
  ];

  if (meta.listsProperties) {
    nav.push({ href: "/portal/properties", label: "My properties", icon: MapPin });
  }
  if (meta.browsesProperties) {
    nav.push(
      { href: "/portal/locations", label: "Locations", icon: Store },
      { href: "/portal/saved-locations", label: "Saved Locations", icon: Heart },
    );
  }
  if (meta.requestTypes.length > 0) {
    nav.push({ href: "/portal/requests", label: "My requests", icon: ClipboardList });
  }

  nav.push(
    { href: "/portal/documents", label: "Documents", icon: ClipboardList },
    { href: "/portal/messages", label: "Messages", icon: MessageSquare },
  );

  return nav;
}

const STORAGE_KEY = "connectors_portal_sidebar_collapsed";

export function Sidebar({
  isAdmin,
  orgType,
  name,
  orgName,
}: {
  isAdmin: boolean;
  orgType?: OrgType;
  name: string;
  orgName?: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      localStorage.setItem(STORAGE_KEY, prev ? "0" : "1");
      return !prev;
    });
  }

  const nav = isAdmin ? ADMIN_NAV : participantNav(orgType ?? "brand");
  // Only the two dashboard roots need exact matching; everything else should
  // stay highlighted on its own detail pages.
  const roots = ["/portal", "/portal/admin"];

  return (
    <aside
      className={clsx(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-white/10 bg-ink text-white transition-[width] duration-300",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <Handshake size={20} className="shrink-0 text-violet-300" />
        {!collapsed && (
          <span className="font-display truncate text-sm uppercase tracking-[0.16em]">
            Connectors
          </span>
        )}
      </div>

      <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const active = roots.includes(item.href)
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-violet-600 text-white"
                  : "text-white/65 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <div className="mb-2 px-2">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-white/45">{orgName ?? "Administrator"}</p>
          </div>
        )}
        <form action={logout}>
          <button
            type="submit"
            title={collapsed ? "Log out" : undefined}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && "Log out"}
          </button>
        </form>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/45 transition-colors hover:bg-white/5 hover:text-white"
        >
          {collapsed ? (
            <ChevronsRight size={17} className="shrink-0" />
          ) : (
            <ChevronsLeft size={17} className="shrink-0" />
          )}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
