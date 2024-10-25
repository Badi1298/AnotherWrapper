import { createClient } from "@/lib/utils/supabase/server";
import RecordVoicePage from "@/components/audio/RecordAudio";
import PaymentModal from "@/components/paywall/Payment";
import { toolConfig } from "../../toolConfig";
import { redirect } from "next/navigation";
import AudioInfo from "@/components/audio/AudioInfo";
import YourFiles from "@/components/audio/YourFiles";
import Login from "@/components/input/login";

export default async function Page() {
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
  let recordings;

  if (user) {
    if (toolConfig.paywall) {
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

    // Fetch recordings for the user
    const { data: userRecordings, error: recordingsError } = await supabase
      .from("recordings")
      .select("*")
      .eq("user_id", user.id);

    if (recordingsError) {
      console.error("Error fetching recordings:", recordingsError);
      return <div>Error fetching recordings</div>;
    }

    recordings = userRecordings;
  }

  // If the tool is not paywalled or the user has a valid purchase, render the page
  return (
    <>
      <div className="w-full flex flex-col md:flex-row items-center">
        {user ? (
          <>
            <div className="w-full md:w-1/2">
              <RecordVoicePage user={user} />
              {recordings && recordings.length > 0 && (
                <div className="mt-8">
                  <YourFiles recordings={recordings} />
                </div>
              )}
            </div>{" "}
          </>
        ) : (
          <div className="p-6 w-full md:w-1/2">
            <Login />
          </div>
        )}

        <div className="w-full md:w-1/2">
          <AudioInfo />
        </div>
      </div>
    </>
  );
}
