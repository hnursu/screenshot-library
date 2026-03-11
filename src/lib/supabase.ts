import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AssetSet = {
  id: string;
  created_at: string;
  app_name: string;
  name_en: string;
  subtitle: string;
  icon_url: string;
  store_url: string;
  asset_type: string[];
  platform: string;
  region: string;
  category: string;
  tags: string[];
  images: string[];
};
