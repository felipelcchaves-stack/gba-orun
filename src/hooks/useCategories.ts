import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  key: string;
  label: string;
  description: string;
  icon_name: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

// Fallback images from assets (used when DB image_url is null)
import eboCategory from "@/assets/ebo-category.jpg";
import iboriCategory from "@/assets/ibori-category.jpg";
import orikiCategory from "@/assets/oriki-category.jpg";
import egbeOrunCategory from "@/assets/egbe-orun-category.jpg";
import iyamiCategory from "@/assets/iyami-category.jpg";
import dailyRoutine from "@/assets/daily-routine.jpg";
import ritualPlaceholder1 from "@/assets/ritual-placeholder-1.jpg";

const FALLBACK_IMAGES: Record<string, string> = {
  oriki: orikiCategory,
  ibori: iboriCategory,
  ebo: eboCategory,
  oracao_manha: dailyRoutine,
  oracao_noite: ritualPlaceholder1,
  oracao_ori: iboriCategory,
  oracao_iyami: iyamiCategory,
  cantiga: egbeOrunCategory,
  egbe_orun: egbeOrunCategory,
  iyami: iyamiCategory,
  geral: dailyRoutine,
};

export const useCategories = (onlyActive = true) => {
  return useQuery({
    queryKey: ["categories", onlyActive],
    queryFn: async () => {
      let q = supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (onlyActive) q = q.eq("is_active", true);

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as Category[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const getCategoryLabelFromList = (categories: Category[] | undefined, key: string): string => {
  if (!categories) return key;
  return categories.find(c => c.key === key)?.label || key;
};

export const getCategoryImageFromList = (categories: Category[] | undefined, key: string): string => {
  if (categories) {
    const cat = categories.find(c => c.key === key);
    if (cat?.image_url) return cat.image_url;
  }
  return FALLBACK_IMAGES[key] || dailyRoutine;
};

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: Omit<Category, "id" | "created_at">) => {
      const { data, error } = await supabase.from("categories").insert(cat).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase.from("categories").update(rest).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
};
