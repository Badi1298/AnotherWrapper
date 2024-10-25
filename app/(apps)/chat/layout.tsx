import { FC, ReactNode } from "react";
import { toolConfig } from "./toolConfig";
import { createClient } from "@/lib/utils/supabase/server";
import PaymentModal from "@/components/paywall/Payment";
import SidebarWrapper from "@/components/chat/ChatSideBar";

export const metadata = {
  title: toolConfig.metadata.title,
  description: toolConfig.metadata.description,
  openGraph: {
    images: [toolConfig.metadata.og_image],
  },
  alternates: {
    canonical: toolConfig.metadata.canonical,
  },
};

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = async ({ children }) => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let credits;

  if (user && toolConfig.paywall) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    credits = profile.credits;

    if (credits < toolConfig.credits) {
      return <PaymentModal />;
    }
  }

  return (
    <div
      className="flex bg-white min-h-screen h-screen"
      data-theme={toolConfig.company.theme}
    >
      <SidebarWrapper user={user} />
      <main className="mt-10 flex-1 flex flex-col p-2 md:p-8 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;
