import { OrbitField } from "@/components/OrbitField";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";

export function PortalAuthLayout({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <OrbitField
          count={28}
          strokeWidth={0.25}
          className="animate-orbit pointer-events-none absolute -left-40 top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 text-white/[0.06]"
        />
        <div className="relative z-10">
          <Logo size="sm" onDark />
        </div>
        <div className="relative z-10 max-w-md">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-violet-200/70">
            {eyebrow}
          </p>
          <h1 className="font-display display-md mt-4 text-balance">{title}</h1>
          <p className="mt-5 leading-relaxed text-white/60 text-pretty">{body}</p>
        </div>
        <p className="relative z-10 text-xs text-white/35">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
