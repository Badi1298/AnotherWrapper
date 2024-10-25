import { NextResponse } from "next/server";
import s3 from "@/lib/cloudflare";
import { createClient } from "@/lib/utils/supabase/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: any) {
  const { recordingId } = await request.json();
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({
      error: "You must be logged in to delete audio",
    });
  }

  const { data: recording, error } = await supabase
    .from("recordings")
    .select("file_url")
    .eq("id", recordingId)
    .single();

  if (error || !recording) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.STORAGE_BUCKET,
    Key: recording.file_url.split(`${process.env.STORAGE_PUBLIC_URL}/`)[1],
  });

  try {
    await s3.send(deleteCommand);
    await supabase.from("recordings").delete().eq("id", recordingId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting recording:", error);
    return NextResponse.json(
      { error: "Failed to delete recording" },
      { status: 500 }
    );
  }
}
