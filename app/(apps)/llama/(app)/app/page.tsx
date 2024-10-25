import InputCapture from "@/components/input/Input";
import PaymentModal from "@/components/paywall/Payment";
import { createClient } from "@/lib/utils/supabase/server";
import { toolConfig } from "../../toolConfig";
import { redirect } from "next/navigation";
import AppInfo from "@/components/input/AppInfo";
import { AnimatedBeamOpenAI } from "@/components/magicui/animated-beam-bi-directional";
import { IconOpenAI } from "@/components/icons";
import { GearIcon, Link1Icon, PaddingIcon } from "@radix-ui/react-icons";
import { Database } from "lucide-react";
import Info from "@/components/alerts/Info";
import { UserGenerations } from "@/components/dashboard/UserTextGenerations";

export default async function Page() {
  // Verify that user is logged in
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if (!user) {
  //   return redirect("/auth");
  // }

  // If user is logged in, we check if the tool is paywalled.
  // If it is, we check if the user has a valid purchase & enough credits for one generation
  let credits;
  let generations = [];

  if (user) {
    if (toolConfig.paywall) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      credits = profile.credits;

      console.table(profile);

      if (credits < toolConfig.credits) {
        return <PaymentModal />;
      }
    }

    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .eq("email", user.email)
      .ilike("type", "%llama%")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching generations:", error);
    } else {
      generations = data;
    }
  }

  const InfoCard = (
    <AppInfo
      title="Return structured output using LLaMA"
      background="bg-accent/10"
    >
      <div className="py-8 flex justify-center">
        <AnimatedBeamOpenAI />
      </div>
      <Info>
        Have a look{" "}
        <a
          href="https://docs.anotherwrapper.com/ai/llama"
          target="_blank"
          className="font-semibold underline"
        >
          at the documentation
        </a>{" "}
        for more information on setting up the app.
      </Info>
      <ul className="mt-4 ml-4 text-sm space-y-2 flex flex-col mb-4 relative xs:leading-7">
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <IconOpenAI className="w-4 h-4" />
          </span>
          <span className="ml-2">
            This demo application uses Groq & LLaMA 3 to return structured JSON
            output.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <Database className="w-4 h-4" />
          </span>
          <span className="ml-2">
            Response is stored in the <code>generations</code> table in Supabase
            and linked to the user for easy access.
          </span>
        </li>

        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <PaddingIcon className="w-4 h-4" />
          </span>

          <span className="ml-2">
            The main frontend logic is found in the{" "}
            <code>app/(apps)/llama</code> folder. You'll find the prompts,
            configuration file and the JSON schema here.
          </span>
        </li>
        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <GearIcon className="w-4 h-4" />
          </span>

          <span className="ml-2">
            The main configuration file can be found in{" "}
            <code>app/(apps)/llama/toolConfig.ts</code> file.
          </span>
        </li>

        <li className="text-l flex">
          <span className="w-4 h-4 mt-1">
            <Link1Icon className="w-4 h-4" />
          </span>

          <span className="ml-2">
            The API endpoint and logic can be found in{" "}
            <code>app/api/(apps)/llama/route.ts</code>.
          </span>
        </li>
      </ul>
    </AppInfo>
  );

  // If the tool is not paywalled or the user has a valid purchase, render the page
  return (
    <div data-theme={toolConfig.company.theme} className="bg-white">
      <InputCapture
        toolConfig={toolConfig}
        userEmail={user ? user.email : undefined}
        credits={toolConfig.paywall ? credits : undefined}
        emptyStateComponent={InfoCard}
      />
      <UserGenerations generations={generations} generationType="llama" />
    </div>
  );
}
