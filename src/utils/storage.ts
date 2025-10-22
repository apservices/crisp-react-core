import { supabase } from "@/integrations/supabase/client";

export async function getSignedUrl(bucket: string, path: string, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
