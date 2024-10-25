"use client";

import { FC, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";
import EditChatDialog from "@/components/chat/EditChatModal";
import { Ellipsis } from "lucide-react";
import UserActions from "@/components/chat/ChatUserActions";
import Logo from "@/components/Logo";

interface ChatListProps {
  user: any;
}

const ChatList: FC<ChatListProps> = ({ user }) => {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchChats = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("conversations")
          .select("id, title, created_at")
          .eq("user_id", user.id)
          .eq("type", "chat")
          .order("created_at", { ascending: false });

        if (!error) setChats(data);
      }
      setLoading(false);
    };
    fetchChats();
  }, [supabase, user]);

  useEffect(() => {
    const chatId = pathname.split("/").pop();
    const activeChat = chats.find((chat) => chat.id === chatId);
    setSelectedChat(activeChat);
  }, [pathname, chats]);

  const handleChatClick = (id: string) => {
    router.push(`/chat/${id}`);
  };

  const handleEditClick = (chat: any) => {
    setSelectedChat(chat);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedChat(null);
  };

  const handleTitleUpdate = (updatedChat: any) => {
    setChats(
      chats.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat))
    );
  };

  const handleNewChat = (newChat: any) => {
    setChats([newChat, ...chats]);
  };

  return (
    <div className="w-64 text-base-content flex flex-col justify-between">
      <div>
        <div className="mt-6 md:mt-0 p-4">
          <Logo />
        </div>
        <div className="p-4">
          <UserActions user={user} onNewChat={handleNewChat} />
        </div>

        <div className="p-4 overflow-y-auto no-scrollbar h-[400px] md:h-[500px]">
          <h2 className="text-xs text-base-content/70 font-semibold mb-4">
            Chat history
          </h2>
          {loading ? (
            <div className="flex justify-center mx-auto items-center mb-2">
              <span className="loading loading-ring loading-lg"></span>
            </div>
          ) : user ? (
            chats.length > 0 ? (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex justify-between items-center mb-2 px-2 cursor-pointer rounded-md transition-all duration-300 ${
                    selectedChat?.id === chat.id
                      ? "bg-primary/10"
                      : "hover:bg-primary/10"
                  }`}
                  onClick={() => handleChatClick(chat.id)}
                >
                  <div className="text-xs capitalize text-base-content/80">
                    {chat.title || new Date(chat.created_at).toLocaleString()}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(chat);
                    }}
                    className="hover:bg-primary/20 p-1 rounded-xl text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Ellipsis size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-sm text-base-content/80">
                You don't have any chats. Click the button below to start!
              </div>
            )
          ) : (
            <div className="text-base-content/80">
              Please log in to see your chat history
            </div>
          )}
          {isModalOpen && (
            <EditChatDialog
              chat={selectedChat}
              onClose={handleModalClose}
              onUpdate={handleTitleUpdate}
              onDelete={(id: any) =>
                setChats(chats.filter((chat) => chat.id !== id))
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
