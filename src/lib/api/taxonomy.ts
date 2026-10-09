import { apiRequest } from "./client";
import type { TaxonomyCategory } from "./types";

export async function getTaxonomy() {
  const result = await apiRequest<{ items?: TaxonomyCategory[]; categories?: TaxonomyCategory[] }>("/taxonomy");
  return { data: { categories: result.data.categories ?? result.data.items ?? [] }, warnings: result.warnings };
}
