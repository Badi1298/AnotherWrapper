import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "@/lib/cloudflare";
import { createClient } from "@/lib/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";
import { reduceUserCredits } from "@/lib/hooks/reduceUserCredits";
import { toolConfig } from "@/app/(apps)/pdf/toolConfig";

export async function POST(request: any) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;
  const userEmail = user?.email;

  if (!userId) {
    return NextResponse.json({
      error: "You must be logged in to ingest data",
    });
  }

  // Check if user has reached the maximum number of documents
  // You can remove this check if you don't want to limit the number of documents per user
  const { data: docCount, error: countError } = await supabase
    .from("documents")
    .select("id", { count: "exact" })
    .eq("user_id", userId);

  // if (countError || (docCount && docCount.length > 20)) {
  //   return NextResponse.json({
  //     error: "You have reached the maximum (10) number of documents.",
  //   });
  // }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const uploadPath = formData.get("uploadPath") || "documents";

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
    const filePath = `${uploadPath}/${userId}/${fileName}`; // Use the dynamic upload path
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2); // Convert size to MB

    console.log(`File Size: ${fileSizeMB} MB`);
    console.log("Inserting document metadata...");

    const putCommand = new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET,
      Key: filePath,
      Body: fileArrayBuffer,
      ContentType: "application/pdf",
    });

    await s3.send(putCommand);

    const publicUrl = `${process.env.STORAGE_PUBLIC_URL}/${filePath}`;

    // Insert document metadata into Supabase
    const { data, error: insertError } = await supabase
      .from("documents")
      .insert([
        {
          file_url: publicUrl,
          file_name: originalFileName,
          user_id: userId,
          size: parseFloat(fileSizeMB),
        },
      ])
      .select();

    if (insertError) {
      console.error("Error inserting document metadata:", insertError);
      return new NextResponse(
        JSON.stringify({
          error: "An error occurred while saving document metadata.",
        }),
        { status: 500 }
      );
    }

    // If paywall is enabled, reduce user credits after successful generation
    if (toolConfig.paywall === true && userEmail) {
      await reduceUserCredits(userEmail, toolConfig.credits);
    }

    return new NextResponse(
      JSON.stringify({
        url: publicUrl,
        path: filePath,
        documentId: data[0].id,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in file upload:", error);
    return new NextResponse(
      JSON.stringify({
        error:
          (error as Error).message ||
          "An error occurred during the file upload process.",
      }),
      { status: 500 }
    );
  }
}
