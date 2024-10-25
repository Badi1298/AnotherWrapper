import { createClient } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation";
import Chat from "./chat";
import { toolConfig } from "../../toolConfig";
import PaymentModal from "@/components/paywall/Payment";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth");
  }

  // If user is logged in, we check if the tool is paywalled.
  // If it is, we check if the user has a valid purchase & enough credits for one generation
  if (toolConfig.paywall) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { credits } = profile;

    if (credits < toolConfig.credits) {
      return <PaymentModal />;
    }
  }

  const { data: currentDoc, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !currentDoc) {
    return <div>This document was not found</div>;
  }

  let initialMessages = [];
  if (currentDoc.conversation_id) {
    const { data, error } = await supabase
      .from("conversations")
      .select("conversation")
      .eq("id", currentDoc.conversation_id)
      .single();

    if (error) {
      console.error("Failed to fetch conversation:", error);
    } else {
      initialMessages = data.conversation;
    }
  }

  return (
    <div data-theme={toolConfig.company.theme}>
      <Chat currentDoc={currentDoc} initialMessages={initialMessages} />
    </div>
  );
}
