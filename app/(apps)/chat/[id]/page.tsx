import { ChatWindow } from "@/components/chat/ChatWindow";
import { createClient } from "@/lib/utils/supabase/server";
import ChatWelcome from "@/components/chat/ChatWelcome";

type MessageRole =
  | "function"
  | "data"
  | "system"
  | "user"
  | "assistant"
  | "tool";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
}

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("conversation")
    .eq("id", params.id)
    .single();

  if (error) {
    console.error("Failed to fetch conversation:", error);
    return <div>Failed to load conversation.</div>;
  }

  // Ensure each message has an `id` and correct role type
  const initialMessages: Message[] = data.conversation.map(
    (message: any, index: number) => ({
      id: index.toString(), // or generate a unique id for each message
      role: message.role as MessageRole,
      content: message.content,
    })
  );

  return (
    <ChatWindow
      endpoint="/api/chat"
      placeholder="I'm a confused Indie Hacker. I can help you. But I'm not sure what I'm doing!"
      chatId={params.id}
      initialMessages={initialMessages}
      emptyStateComponent={
        initialMessages.length === 0 ? (
          <ChatWelcome />
        ) : (
          <div>Start your conversation...</div>
        )
      }
    />
  );
}
