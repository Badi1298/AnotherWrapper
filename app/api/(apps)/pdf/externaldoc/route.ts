import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { url, fileName } = await request.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({
      error: "You must be logged in to ingest data",
    });
  }

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
    const { data, error: insertError } = await supabase
      .from("documents")
      .insert([
        {
          file_url: url,
          file_name: fileName,
          user_id: userId,
          size: null,
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

    return new NextResponse(JSON.stringify({ documentId: data[0].id, url }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in URL document addition:", error);
    return new NextResponse(
      JSON.stringify({
        error:
          (error as Error).message ||
          "An error occurred during the URL document addition process.",
      }),
      { status: 500 }
    );
  }
}
