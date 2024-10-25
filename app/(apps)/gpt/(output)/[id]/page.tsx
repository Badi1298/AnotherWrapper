import { toolConfig } from "../../toolConfig";
import ResponseLayout from "./response";
import { createClient } from "@/lib/utils/supabase/server";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
};

async function getGenerationData(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching generation data:", error);
    return null;
  }

  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const generationData = await getGenerationData(params.id);

  return {
    title: generationData?.title || toolConfig.metadata.title,
    description: generationData?.description || toolConfig.metadata.description,
    openGraph: {
      images: [toolConfig.metadata.og_image || ""],
    },
  };
}

export default async function Page({ params }: Props) {
  const generationData = await getGenerationData(params.id);

  return (
    <>
      <ResponseLayout
        params={params}
        generationData={generationData}
        toolConfig={toolConfig}
      />
    </>
  );
}
