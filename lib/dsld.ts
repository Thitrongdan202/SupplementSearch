import { CATEGORY_BY_ID, classifyProduct } from "@/lib/taxonomy";
import { fetchProviderJson } from "@/lib/provider-cache";
import type {
  CatalogProduct,
  CatalogProviderResult,
} from "@/lib/types";

const API_URL = "https://api.ods.od.nih.gov/dsld/v9/search-filter";
const LABEL_BASE = "https://dsld.od.nih.gov/label";
const THUMBNAIL_BASE =
  "https://api.ods.od.nih.gov/dsld/s3/pdf/thumbnails";

interface DsldIngredient {
  name?: string | null;
  ingredientGroup?: string | null;
  category?: string | null;
}

interface DsldClaim {
  langualCodeDescription?: string | null;
}

interface DsldNetContent {
  display?: string | null;
}

interface DsldSearchSource {
  fullName?: string | null;
  brandName?: string | null;
  entryDate?: string | null;
  allIngredients?: DsldIngredient[] | null;
  claims?: DsldClaim[] | null;
  netContents?: DsldNetContent[] | null;
  productType?: {
    langualCodeDescription?: string | null;
  } | null;
  physicalState?: {
    langualCodeDescription?: string | null;
  } | null;
}

interface DsldHit {
  _id?: string;
  _source?: DsldSearchSource;
}

interface DsldSearchResponse {
  hits?: DsldHit[];
  stats?: {
    count?: number;
  };
}

function categorySearchTerm(categoryId: string | null) {
  const category = categoryId ? CATEGORY_BY_ID.get(categoryId) : null;
  if (!category) return null;
  const generic =
    /\b(?:supplement|support|health|nutrition|management|formula)\b/i;
  return (
    category.queries.find((query) => !generic.test(query)) ??
    category.queries[0]
  );
}

function mapHit(
  hit: DsldHit,
  requestedCategoryId: string | null,
): CatalogProduct | null {
  const id = hit._id?.trim();
  const source = hit._source;
  const name = source?.fullName?.trim();
  if (!id || !source || !name) return null;

  const ingredients = (source.allIngredients ?? [])
    .map((item) => item.name?.trim())
    .filter((item): item is string => Boolean(item))
    .filter((item, index, values) => values.indexOf(item) === index)
    .slice(0, 12);
  const categoryLabels = [
    source.productType?.langualCodeDescription,
    source.physicalState?.langualCodeDescription,
    ...(source.allIngredients ?? []).map((item) => item.ingredientGroup),
  ]
    .filter((item): item is string => Boolean(item?.trim()))
    .filter((item, index, values) => values.indexOf(item) === index)
    .slice(0, 8);
  const classification = classifyProduct(
    `${name} ${ingredients.join(" ")}`,
    [],
    requestedCategoryId,
  );

  return {
    code: `dsld-${id}`,
    identifierLabel: "DSLD ID",
    name,
    brand: source.brandName?.trim() || "Chưa ghi thương hiệu",
    imageUrl: `${THUMBNAIL_BASE}/${encodeURIComponent(id)}.jpg`,
    quantity:
      source.netContents?.find((item) => item.display?.trim())?.display?.trim() ||
      source.physicalState?.langualCodeDescription?.trim() ||
      "Chưa ghi quy cách",
    categoryIds: classification.categoryIds,
    primaryCategoryId: classification.primaryCategoryId,
    classificationConfidence: classification.confidence,
    labels: (source.claims ?? [])
      .map((claim) => claim.langualCodeDescription?.trim())
      .filter((item): item is string => Boolean(item))
      .slice(0, 5),
    categories: categoryLabels,
    ingredients,
    price: null,
    currency: null,
    priceKind: "unavailable",
    priceDate: null,
    store: null,
    city: null,
    country: "United States",
    isDiscounted: false,
    dataDate: source.entryDate ?? null,
    sourceId: "nih-dsld",
    sourceLabel: "NIH ODS · DSLD",
    productUrl: `${LABEL_BASE}/${encodeURIComponent(id)}`,
    priceSourceUrl: null,
  };
}

export async function getDsldCatalog({
  query,
  categoryId,
  page,
  limit,
}: {
  query: string;
  categoryId: string | null;
  page: number;
  limit: number;
}): Promise<CatalogProviderResult> {
  const searchTerm =
    query.trim() || categorySearchTerm(categoryId) || "*";
  const pageSize = Math.min(30, Math.max(18, limit));
  const url = new URL(API_URL);
  url.searchParams.set("q", searchTerm);
  url.searchParams.set("status", "1");
  url.searchParams.set("from", String((page - 1) * pageSize));
  url.searchParams.set("size", String(pageSize));
  url.searchParams.set(
    "sort_by",
    searchTerm === "*" ? "entryDate" : "_score",
  );
  url.searchParams.set("sort_order", "desc");

  const data = await fetchProviderJson<DsldSearchResponse>(
    url,
    "NIH DSLD",
    60 * 60 * 1000,
  );
  const items = (data.hits ?? [])
    .map((hit) => mapHit(hit, categoryId))
    .filter((product): product is CatalogProduct => Boolean(product))
    .slice(0, limit);
  const recordCount = data.stats?.count ?? items.length;

  return {
    items,
    recordCount,
    hasMore: page * pageSize < recordCount,
    source: {
      id: "nih-dsld",
      label: "NIH ODS · DSLD",
      role: "Nhãn, thành phần và sản phẩm chuyên supplement",
      recordCount,
      status: "ready",
      priced: false,
    },
  };
}
