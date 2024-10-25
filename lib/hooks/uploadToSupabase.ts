import { createClient } from "@/lib/utils/supabase/server";

export async function uploadToSupabase(
  input: any,
  output: any,
  toolPath: any,
  model: any
) {
  const supabase = createClient();

  const insertData: any = {
    email: input.email,
    input_data: input,
    output_data: output,
    type: toolPath,
    model: model,
  };

  // Function to get SEO metadata from output or output.parameters
  const getSeoMetadata = () => {
    if (output.seoMetadata) {
      return output.seoMetadata;
    } else if (output.parameters && output.parameters.seoMetadata) {
      return output.parameters.seoMetadata;
    }
    return null;
  };

  const seoMetadata = getSeoMetadata();

  // Only add SEO fields if they exist in the output
  if (seoMetadata) {
    if (seoMetadata.title) {
      insertData.title = seoMetadata.title;
    }
    if (seoMetadata.subtitle) {
      insertData.subtitle = seoMetadata.subtitle;
    }
    if (seoMetadata.description) {
      insertData.description = seoMetadata.description;
    }
  }

  const { data, error } = await supabase
    .from("generations")
    .insert([insertData])
    .select();

  if (data) console.log("Success");

  if (error) throw new Error(error.message);
  return data;
}
