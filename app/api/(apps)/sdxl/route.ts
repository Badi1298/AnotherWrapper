import { replicate } from "@/lib/replicate";
import { uploadToSupabase } from "@/lib/hooks/uploadToSupabase";
import { NextResponse, NextRequest } from "next/server";
import { reduceUserCredits } from "@/lib/hooks/reduceUserCredits";
import { companyConfig } from "@/config";

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const toolPath = decodeURIComponent(requestBody.toolPath);

    // Dynamically import the toolConfig, prompt and functionCall based on the tool name
    const { toolConfig } = await import(`@/app/${toolPath}/toolConfig`);

    const prompt = requestBody.prompt;
    const negativePrompt = requestBody.negativePrompt;

    // Generate response from Replicate
    const responseData = await replicate.run(toolConfig.aiModel, {
      input: {
        width: 768,
        height: 768,
        prompt: prompt,
        refine: "expert_ensemble_refiner",
        scheduler: "K_EULER",
        lora_scale: 0.6,
        num_outputs: 1,
        guidance_scale: 7.5,
        apply_watermark: false,
        high_noise_frac: 0.8,
        negative_prompt: negativePrompt,
        prompt_strength: 0.8,
        num_inference_steps: 25,
      },
    });

    // Get the image URL from the Replicate response
    const imageUrl = responseData;

    // Prepare the data for upload
    const uploadData = {
      imageUrl,
      uploadPath: toolConfig.upload.path,
    };

    // Get the base URL
    const apiUrl = `${companyConfig.company.homeUrl}/api/upload/image`;

    // Upload the image to Cloudflare
    const uploadResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(uploadData),
    });

    const uploadResult = await uploadResponse.json();

    // Extract the URL from the upload result
    const uploadedImageUrl = uploadResult.url;

    // Alternatively, if you dont want to upload image to Cloudflare, you can directly use the image URL from Replicate response and delete the above code

    const supabaseResponse = await uploadToSupabase(
      requestBody,
      uploadedImageUrl,
      toolConfig.toolPath,
      toolConfig.aiModel
    );

    // If paywall is enabled, reduce user credits after successful generation
    if (toolConfig.paywall === true) {
      await reduceUserCredits(requestBody.email, toolConfig.credits);
    }

    // Return the ID of the stored data, so the client can redirect to the result page
    return new NextResponse(
      JSON.stringify({
        id: supabaseResponse[0].id,
      }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(
        JSON.stringify({ status: "Error", message: error.message }),
        { status: 500 }
      );
    } else {
      console.error(error);
      return new NextResponse(
        JSON.stringify({
          status: "Error",
          message: "An unknown error occurred",
        }),
        { status: 500 }
      );
    }
  }
}
