import { ChatGroq } from "@langchain/groq";
import { createClient } from "@/lib/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import { toolConfig } from "@/app/(apps)/audio/toolConfig";
import { z } from "zod";

const SummarizeSchema = z.object({
  title: z
    .string()
    .min(5)
    .describe(
      "A short descriptive title summarizing the main topic of the voice message"
    ),
  summary: z
    .string()
    .describe(
      "A summary from a third-party perspective describing what is discussed in the voice message."
    ),
  actionItems: z
    .array(z.string())
    .nonempty()
    .describe(
      "A clear and concise list of action items derived from the voice note. Ensure all action items are explicitly stated and resolved if nested"
    ),
});

const chat = new ChatGroq({
  model: toolConfig.aiModel,
});

const chatWithStructuredOutput = chat.withStructuredOutput(SummarizeSchema);

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({
      error: "You must be logged in to ingest data",
    });
  }

  try {
    // Read the body once
    const requestBody = await request.json();
    const { transcript, recordingId } = requestBody;

    if (!recordingId) {
      return NextResponse.json({
        error: "Document ID is required",
      });
    }

    // Generate response from Groq
    const responseData = await chatWithStructuredOutput.invoke([
      ["system", toolConfig.systemMessage!],
      ["human", transcript],
    ]);

    console.log("Response from Groq:", responseData);

    const { title, summary, actionItems } = responseData;

    // Insert summary into the summaries table
    const { data: summaryData, error: summaryError } = await supabase
      .from("summaries")
      .insert({
        recording_id: recordingId,
        summary: summary,
        action_items: actionItems,
        title: title,
        model: toolConfig.aiModel,
      })
      .select();

    if (summaryError) {
      throw new Error(summaryError.message);
    }

    console.log("Summary inserted successfully:", summaryData);

    // Update the title in the recordings table
    const { data: recordingData, error: recordingError } = await supabase
      .from("recordings")
      .update({ title: title })
      .eq("id", recordingId)
      .select();

    if (recordingError) {
      throw new Error(recordingError.message);
    }

    console.log("Recording updated successfully:", recordingData);

    // Return the ID of the stored summary
    return new NextResponse(
      JSON.stringify({
        id: summaryData[0].id,
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
