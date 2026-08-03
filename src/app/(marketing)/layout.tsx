import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { AuthModal } from "@/components/portal/AuthModal";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-violet-600 focus:px-5 focus:py-3 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      {/* Marketing only — the portal has a support route and shouldn't carry a
          visitor-facing help widget over its own UI. */}
      <ChatWidget />
      {/* useSearchParams needs a Suspense boundary to avoid de-opting the
          whole layout to client-only rendering. */}
      <Suspense fallback={null}>
        <AuthModal />
      </Suspense>
    </SmoothScroll>
  );
}
