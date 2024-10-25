import Layout from "@/components/voice/Layout";
import PaymentModal from "@/components/paywall/Payment";
import { createClient } from "@/lib/utils/supabase/server";
import { toolConfig } from "./toolConfig";

export default async function Page() {
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
    <>
      <Layout userEmail={user ? user.email : undefined} />
    </>
  );
}
