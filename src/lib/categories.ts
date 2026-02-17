import {
  Sparkles, Heart, Shield, Sunrise, Moon, Music, Users, AlertTriangle, BookOpen, Sun
} from "lucide-react";

import eboCategory from "@/assets/ebo-category.jpg";
import iboriCategory from "@/assets/ibori-category.jpg";
import orikiCategory from "@/assets/oriki-category.jpg";
import egbeOrunCategory from "@/assets/egbe-orun-category.jpg";
import iyamiCategory from "@/assets/iyami-category.jpg";
import dailyRoutine from "@/assets/daily-routine.jpg";
import ritualPlaceholder1 from "@/assets/ritual-placeholder-1.jpg";

export type CategoryKey =
  | "oriki" | "ibori" | "ebo"
  | "oracao_manha" | "oracao_noite" | "oracao_ori" | "oracao_iyami"
  | "cantiga" | "egbe_orun" | "iyami" | "geral";

export interface CategoryInfo {
  label: string;
  icon: typeof Sparkles;
  image: string;
  description: string;
}

export const CATEGORIES_MAP: Record<CategoryKey, CategoryInfo> = {
  oriki:        { label: "Orikis",            icon: Sparkles,      image: orikiCategory,    description: "Louvações aos Orixás" },
  ibori:        { label: "Ibori",             icon: Heart,         image: iboriCategory,    description: "Cuidados com o Ori" },
  ebo:          { label: "Ebó",               icon: Shield,        image: eboCategory,      description: "Oferendas e limpezas" },
  oracao_manha: { label: "Orações da Manhã",  icon: Sunrise,       image: dailyRoutine,     description: "Orações para iniciar o dia" },
  oracao_noite: { label: "Orações da Noite",  icon: Moon,          image: ritualPlaceholder1, description: "Orações antes de dormir" },
  oracao_ori:   { label: "Orações de Ori",    icon: Sun,           image: iboriCategory,    description: "Orações específicas para o Ori" },
  oracao_iyami: { label: "Orações de Iyami",  icon: AlertTriangle, image: iyamiCategory,    description: "Orações para apaziguar Iyami" },
  cantiga:      { label: "Cantigas",          icon: Music,         image: egbeOrunCategory, description: "Cantigas sagradas" },
  egbe_orun:    { label: "Egbe Orun",         icon: Users,         image: egbeOrunCategory, description: "Ancestralidade e comunidade" },
  iyami:        { label: "Iyami",             icon: AlertTriangle, image: iyamiCategory,    description: "Rituais de Iyami Osoronga" },
  geral:        { label: "Fundamentos",       icon: BookOpen,      image: dailyRoutine,     description: "Conteúdo geral" },
};

export const ALL_CATEGORY_KEYS = Object.keys(CATEGORIES_MAP) as CategoryKey[];

export const getCategoryLabel = (key: string): string => {
  return (CATEGORIES_MAP as any)[key]?.label || key;
};

export const getCategoryImage = (key: string): string => {
  return (CATEGORIES_MAP as any)[key]?.image || dailyRoutine;
};

// Filter chips for pages (with "Todos" option)
export const FILTER_CATEGORIES = [
  { key: "", label: "Todos" },
  ...ALL_CATEGORY_KEYS.map(k => ({ key: k, label: CATEGORIES_MAP[k].label })),
];

// Category banners for Rituals page
export const CATEGORY_BANNERS = ALL_CATEGORY_KEYS.map(k => ({
  key: k,
  label: CATEGORIES_MAP[k].label,
  desc: CATEGORIES_MAP[k].description,
  image: CATEGORIES_MAP[k].image,
}));
