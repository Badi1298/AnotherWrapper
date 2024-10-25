import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import fetch from "node-fetch";
import s3 from "@/lib/cloudflare";

export async function POST(request: any) {
  try {
    const contentType = request.headers.get("content-type");

    let fileBuffer;
    let uploadPath;
    let fileName;
    let contentTypeHeader;

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get("image"); // Use "image" as the key for uploaded files
      uploadPath = formData.get("uploadPath") || "uploads";

      if (!file || typeof file.arrayBuffer !== "function") {
        throw new Error("No files uploaded.");
      }

      fileBuffer = await file.arrayBuffer();
      fileName = `optimized-${Date.now()}.jpeg`;

      // Optimize the image if it's an image file
      fileBuffer = await sharp(fileBuffer).jpeg({ quality: 80 }).toBuffer();
      contentTypeHeader = "image/jpeg";
    } else if (contentType?.includes("application/json")) {
      // Handle URL upload
      const requestBody = await request.json();
      const imageUrl = requestBody.imageUrl;
      uploadPath = requestBody.uploadPath || "uploads";

      if (!imageUrl) {
        throw new Error("No URL provided.");
      }

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch image from URL: ${response.statusText}`
        );
      }

      fileBuffer = await response.buffer();
      fileName = `from-url-${Date.now()}.jpeg`;
      contentTypeHeader = "image/jpeg";
    } else {
      throw new Error("Unsupported content type.");
    }

    const filePath = `${uploadPath}/${fileName}`;

    const putCommand = new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET,
      Key: filePath,
      Body: fileBuffer,
      ContentType: contentTypeHeader,
    });

    await s3.send(putCommand);

    const publicUrl = `${process.env.STORAGE_PUBLIC_URL}/${filePath}`;

    return new NextResponse(
      JSON.stringify({ url: publicUrl, path: filePath }),
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
