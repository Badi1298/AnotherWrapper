import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "@/lib/cloudflare";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: any) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const userId = formData.get("userId");
    const uploadPath = "speechtotext";

    console.log("File received:", file ? "Yes" : "No");
    console.log("User ID:", userId);

    if (!file) {
      throw new Error("No files uploaded.");
    }

    if (!userId) {
      throw new Error("User ID is required.");
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

    console.log("File path:", filePath);

    const putCommand = new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET,
      Key: filePath,
      Body: fileArrayBuffer,
      ContentType: "audio/mpeg",
    });

    await s3.send(putCommand);

    const publicUrl = `${process.env.STORAGE_PUBLIC_URL}/${filePath}`;

    console.log("Public URL:", publicUrl);

    return new NextResponse(
      JSON.stringify({
        url: publicUrl,
        path: filePath,
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
