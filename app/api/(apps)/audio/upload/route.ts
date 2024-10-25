import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "@/lib/cloudflare";
import { createClient } from "@/lib/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";
import { reduceUserCredits } from "@/lib/hooks/reduceUserCredits";
import { toolConfig } from "@/app/(apps)/audio/toolConfig";

export async function POST(request: any) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;
  const userEmail = user?.email;

  if (!userId) {
    return NextResponse.json({
      error: "You must be logged in to upload audio",
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const uploadPath = formData.get("uploadPath") || "audio";

    if (!file) {
      throw new Error("No files uploaded.");
    }

    const fileArrayBuffer = await file.arrayBuffer();
    const originalFileName = file.name;
    const fileExtension = originalFileName.split(".").pop();
    const uuid = uuidv4();
    const fileName = `${originalFileName.replace(
      `.${fileExtension}`,
      ""
    )}-${uuid}.${fileExtension}`;
    const filePath = `${uploadPath}/${userId}/${fileName}`;

    const putCommand = new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET,
      Key: filePath,
      Body: fileArrayBuffer,
      ContentType: "audio/wav",
    });

    await s3.send(putCommand);

    const publicUrl = `${process.env.STORAGE_PUBLIC_URL}/${filePath}`;

    const { data, error: insertError } = await supabase
      .from("recordings")
      .insert([
        {
          file_url: publicUrl,
          user_id: userId,
        },
      ])
      .select();

    if (insertError) {
      console.error("Error inserting audio metadata:", insertError);
      return new NextResponse(
        JSON.stringify({
          error: "An error occurred while saving audio metadata.",
        }),
        { status: 500 }
      );
    }

    // If paywall is enabled, reduce user credits after successful generation
    if (toolConfig.paywall === true && userEmail) {
      await reduceUserCredits(userEmail, toolConfig.credits);
    }

    const recordingId = data[0].id;

    return new NextResponse(
      JSON.stringify({
        url: publicUrl,
        path: filePath,
        recordingId: recordingId,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in audio upload:", error);
    return new NextResponse(
      JSON.stringify({
        error:
          (error as Error).message ||
          "An error occurred during the audio upload process.",
      }),
      { status: 500 }
    );
  }
}
