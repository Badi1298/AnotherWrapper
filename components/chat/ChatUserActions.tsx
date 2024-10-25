"use client";

import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import { createClient } from "@/lib/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toolConfig } from "@/app/(apps)/chat/toolConfig";

interface UserActionsProps {
  user: any;
  onNewChat: (chat: any) => void;
}

const UserActions: FC<UserActionsProps> = ({ user, onNewChat }) => {
  const [creatingChat, setCreatingChat] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleNewChat = async () => {
    if (!user) return;

    setCreatingChat(true);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert([
          { user_id: user.id, model_used: toolConfig.aiModel, type: "chat" },
        ])
        .select();

      if (error) throw error;

      if (data[0].id) {
        onNewChat(data[0]);
        router.push(`/chat/${data[0].id}`);
      }
    } catch (error) {
      console.error("Failed to create a new chat:", error);
    } finally {
      setCreatingChat(false);
    }
  };

  return (
    <div>
      {user ? (
        <>
          <p className="text-sm font-semibold tracking-tight mb-1">
            {user.email ? (
              <span>👋🏼 Hi {user.email}!</span>
            ) : (
              <span>👋🏼 Hi there!</span>
            )}
          </p>
          <Button
            className="mt-2 w-full text-primary-content mb-2"
            onClick={handleNewChat}
            disabled={creatingChat}
          >
            <PlusCircleIcon size={16} className="mr-2" />
            {creatingChat ? "Creating..." : "Start new chat"}
          </Button>
          <a href="/apps" className="text-primary-content">
            <Button className="w-full text-primary-content mb-2">
              Show other apps
            </Button>
          </a>
        </>
      ) : (
        <>
          <a href="/apps" className="text-primary-content">
            <Button className="w-full text-primary-content mb-2">
              Show other apps
            </Button>
          </a>
          <a href="/auth" className="text-primary-content">
            <Button className="w-full text-primary-content">Log in</Button>
          </a>
        </>
      )}
    </div>
  );
};

export default UserActions;
