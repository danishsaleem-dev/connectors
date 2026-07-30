import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { requireParticipant } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/client";
import { messages } from "@/lib/db/schema";
import { MessageThread } from "@/components/portal/MessageThread";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { Panel } from "@/components/portal/ui";
import { postMessage } from "@/lib/portal/actions";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export default async function ParticipantMessagesPage() {
  const { organization } = await requireParticipant();

  const orgMessages = await getDb()
    .select()
    .from(messages)
    .where(eq(messages.organizationId, organization.id))
    .orderBy(asc(messages.createdAt));

  return (
    <div>
      <PortalHeader
        title="Messages"
        subtitle="Your direct line to the Connectors team. Messages about a specific opportunity live on that opportunity's page."
      />
      <Panel>
        <MessageThread messages={orgMessages} action={postMessage} />
      </Panel>
    </div>
  );
}
