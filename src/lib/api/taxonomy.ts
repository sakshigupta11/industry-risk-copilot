import { apiRequest } from "./client";
import type { TaxonomyCategory } from "./types";

export async function getTaxonomy() { return apiRequest<{ categories: TaxonomyCategory[] }>("/taxonomy"); }
