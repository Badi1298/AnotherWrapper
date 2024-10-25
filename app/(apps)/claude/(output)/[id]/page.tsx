import DisplayOutput from "@/components/output/DisplayOutput";
import { toolConfig } from "../../toolConfig";
import { Metadata } from "next";
import { createClient } from "@/lib/utils/supabase/server";

type Props = {
  params: { id: string; appName: string };
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

export const dynamic = "force-dynamic";

export default async function Page({ params }: Props) {
  const generationData = await getGenerationData(params.id);

  return (
    <DisplayOutput
      params={params}
      toolConfig={toolConfig}
      generationData={generationData}
    />
  );
}
