export type CategorySection =
  | "foundation"
  | "body-goal"
  | "life-stage"
  | "sport";

export interface CategoryDefinition {
  id: string;
  section: CategorySection;
  label: string;
  description: string;
  queries: string[];
  tagHints: string[];
  aliases: string[];
}

export type CatalogMode = "all" | "priced";

export type CatalogProviderId =
  | "open-prices"
  | "open-food-facts"
  | "nih-dsld";

export type PriceKind = "observed" | "unavailable";

export interface CatalogProduct {
  code: string;
  identifierLabel: string;
  name: string;
  brand: string;
  imageUrl: string;
  quantity: string;
  categoryIds: string[];
  primaryCategoryId: string;
  classificationConfidence: number;
  labels: string[];
  categories: string[];
  ingredients: string[];
  price: number | null;
  currency: string | null;
  priceKind: PriceKind;
  priceDate: string | null;
  store: string | null;
  city: string | null;
  country: string | null;
  isDiscounted: boolean;
  dataDate: string | null;
  sourceId: CatalogProviderId;
  sourceLabel: string;
  productUrl: string;
  priceSourceUrl: string | null;
}

export interface CatalogSourceStat {
  id: CatalogProviderId;
  label: string;
  role: string;
  recordCount: number;
  status: "ready" | "unavailable";
  priced: boolean;
}

export interface CatalogProviderResult {
  items: CatalogProduct[];
  recordCount: number;
  hasMore: boolean;
  source: CatalogSourceStat;
}

export interface CatalogResponse {
  items: CatalogProduct[];
  page: number;
  hasMore: boolean;
  recordCount: number;
  mode: CatalogMode;
  query: string;
  resolvedCategoryId: string | null;
  fetchedAt: string;
  source: {
    providers: CatalogSourceStat[];
    live: true;
    note: string;
  };
}
