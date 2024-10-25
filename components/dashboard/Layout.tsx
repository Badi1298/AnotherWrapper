import { Suspense } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { twMerge } from "tailwind-merge";
import { ContentFooter } from "@/components/dashboard/Footer";
import Footer from "@/components/footers/Footer-1";
import { createClient } from "@/lib/utils/supabase/server";
import { Container } from "@/components/dashboard/Container";
import { Heading } from "@/components/dashboard/Heading";
import { Paragraph } from "@/components/dashboard/Paragraph";
import { Highlight } from "@/components/dashboard/Highlight";
import LoadingSpinner from "@/components/Loading";
import { ToolConfig } from "@/lib/types/toolconfig";

interface DashboardLayoutProps {
  children: React.ReactNode;
  toolConfig: ToolConfig;
  showGreeting?: boolean;
}

export async function DashboardLayout({
  children,
  toolConfig,
  showGreeting = true,
}: DashboardLayoutProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="flex overflow-hidden bg-gray-100">
        <Sidebar user={user} />
        <div className="lg:pl-2 lg:pt-2 bg-gray-100 flex-1 overflow-y-auto">
          <div className="flex-1 bg-white lg:rounded-tl-xl border border-transparent lg:border-neutral-200 overflow-y-auto">
            <Suspense fallback={<LoadingSpinner />}>
              <MainContent
                toolConfig={toolConfig}
                showGreeting={showGreeting}
                user={user}
              >
                {children}
              </MainContent>
            </Suspense>
            <ContentFooter />
          </div>
        </div>
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <Footer
          companyConfig={toolConfig.company!}
          footerConfig={toolConfig.footerApp!}
        />
      </Suspense>
    </>
  );
}

async function MainContent({
  children,
  toolConfig,
  showGreeting,
  user,
}: {
  children: React.ReactNode;
  toolConfig: ToolConfig;
  showGreeting: boolean;
  user: any;
}) {
  const supabase = createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  let credits;
  if (user && toolConfig.paywall) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    credits = profile.credits;
  }

  return (
    <Container>
      {showGreeting && (
        <>
          <span className="text-4xl">👋🏼</span>
          <Heading className="font-black">
            {user ? `Hi ${user.email}!` : "Hi there!"}
          </Heading>
          <Paragraph className="max-w-xl mt-4">
            Hope you're having a great day! You can try out the app below.
            {credits !== undefined && (
              <Highlight> You still have {credits} credits left.</Highlight>
            )}
          </Paragraph>
        </>
      )}
      {children}
    </Container>
  );
}
