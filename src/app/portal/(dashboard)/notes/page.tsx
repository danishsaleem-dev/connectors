import type { Metadata } from "next";
import { requireParticipant } from "@/lib/auth/current-user";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { SavedNotes } from "@/components/portal/SavedNotes";

export const metadata: Metadata = {
  title: "Notes",
  robots: { index: false, follow: false },
};

export default async function NotesPage() {
  await requireParticipant();

  return (
    <div>
      <PortalHeader title="Notes" subtitle="A personal scratchpad — only you can see these." />
      <SavedNotes title="" className="" />
    </div>
  );
}
