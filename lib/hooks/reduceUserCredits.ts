import { supabase } from "@/lib/utils/supabase/service";

export async function reduceUserCredits(email: string, credits: number) {
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("credits")
    .eq("email", email)
    .single();

  if (userError) throw new Error(userError.message);
  if (!userData) throw new Error("User not found");

  const updatedCredits = userData.credits - credits;

  const { data, error } = await supabase
    .from("profiles")
    .update({ credits: updatedCredits })
    .eq("email", email);

  if (data) console.log("User credits deducted.");

  if (error) throw new Error(error.message);
  return data;
}
