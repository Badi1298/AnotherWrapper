import { NextResponse, NextRequest } from "next/server";
import { toolConfig } from "@/app/(apps)/voice/toolConfig";
import { uploadToSupabase } from "@/lib/hooks/uploadToSupabase";
import { reduceUserCredits } from "@/lib/hooks/reduceUserCredits";
import { createClient } from "@/lib/utils/supabase/server";
import { companyConfig } from "@/config";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;
  const email = user?.email;

  if (!userId) {
    console.log("User not logged in");
    return NextResponse.json(
      {
        error: "You must be logged in to use text-to-speech",
      },
      { status: 401 }
    );
  }

  try {
    //1. Make request to ElevenLabs API to generate audio
    const { text, voice, settings } = await request.json();

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice}`;
    if (!voice) {
      throw new Error("Voice ID is required");
    }
    const headers = {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": process.env.ELEVENLABS_API_TOKEN!,
    };
    const data = {
      text,
      model_id: settings.model,
      voice_settings: {
        stability: settings.stability,
        similarity_boost: settings.similarity,
        style_exaggeration: settings.styleExaggeration,
        use_speaker_boost: settings.speakerBoost,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", errorText);
      throw new Error(
        `Failed to generate audio: ${response.status} ${response.statusText}`
      );
    }

    const audioBuffer = await response.arrayBuffer();

    // 2. Upload the audio file to Cloudflare R2 Storage
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([audioBuffer], { type: "audio/mpeg" }),
      "generated_audio.mp3"
    );
    formData.append("userId", userId);

    // Make sure to correctly define the company home URL, otherwise it won't find the upload route
    const uploadUrl = `${companyConfig.company.homeUrl}/api/voice/upload`;
    console.log("Upload URL:", uploadUrl);

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload audio file");
    }

    const uploadResult = await uploadResponse.json();
    const uploadedAudioUrl = uploadResult.url;
    console.log("Uploaded audio URL:", uploadedAudioUrl);

    //3. Store data in Supabase
    const supabaseResponse = await uploadToSupabase(
      { email, text, voice, settings },
      uploadedAudioUrl,
      toolConfig.toolPath,
      settings.model
    );

    //4. If paywall is enabled, reduce user credits
    if (toolConfig.paywall === true && email) {
      await reduceUserCredits(email, toolConfig.credits);
    }

    //5. Return the audio to the front-end
    return NextResponse.json(
      {
        url: uploadedAudioUrl,
        id: supabaseResponse[0].id,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in text-to-speech API route:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
