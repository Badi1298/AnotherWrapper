import { createClient } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation";
import RecordingLayout from "@/components/audio/RecordingLayout";
import Section from "@/components/Section";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth");
  }

  const { data: recording, error: recordingError } = await supabase
    .from("recordings")
    .select("*")
    .eq("id", params.id)
    .single();

  if (recordingError || !recording) {
    console.error("Error fetching recording:", recordingError);
    return <div>No data found</div>;
  }

  const { data: transcript, error: transcriptError } = await supabase
    .from("transcripts")
    .select("*")
    .eq("recording_id", params.id)
    .single();

  if (transcriptError || !transcript) {
    console.error("Error fetching transcript:", transcriptError);
    return <div>No data found</div>;
  }

  const { data: summary } = await supabase
    .from("summaries")
    .select("*")
    .eq("recording_id", params.id)
    .single();

  const data = { recording, transcript, summary };

  return (
    <Section>
      <RecordingLayout data={data} />
    </Section>
  );
}
