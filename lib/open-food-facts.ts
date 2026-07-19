import { CATEGORY_BY_ID, classifyProduct } from "@/lib/taxonomy";
import { fetchProviderJson } from "@/lib/provider-cache";
import type {
  CatalogProduct,
  CatalogProviderResult,
} from "@/lib/types";

const SEARCH_URL = "https://world.openfoodfacts.org/api/v2/search";
const DEFAULT_SCOPE_TAG = "en:dietary-supplements";
const FIELDS = [
  "code",
  "product_name",
  "product_name_en",
  "brands",
  "quantity",
  "categories_tags",
  "labels_tags",
  "ingredients_tags",
  "image_front_url",
  "image_url",
  "last_modified_datetime",
].join(",");

interface RawOpenFoodFactsProduct {
  code?: string;
  product_name?: string | null;
  product_name_en?: string | null;
  brands?: string | null;
  quantity?: string | null;
  categories_tags?: string[] | null;
  labels_tags?: string[] | null;
  ingredients_tags?: string[] | null;
  image_front_url?: string | null;
  image_url?: string | null;
  last_modified_datetime?: string | null;
}

interface OpenFoodFactsSearch {
  count?: number;
  page?: number;
  page_count?: number;
  page_size?: number;
  products?: RawOpenFoodFactsProduct[];
}

interface OpenPricesProductMirror {
  items?: RawOpenFoodFactsProduct[];
  page?: number;
  pages?: number;
  size?: number;
  total?: number;
}

function cleanTag(tag: string) {
  return tag.replace(/^[a-z]{2}:/, "").replaceAll("-", " ");
}

function mapProduct(
  product: RawOpenFoodFactsProduct,
  requestedCategoryId: string | null,
): CatalogProduct | null {
  const code = product.code?.trim();
  const name =
    product.product_name?.trim() || product.product_name_en?.trim();
  const imageUrl =
    product.image_front_url?.trim() || product.image_url?.trim();

  if (!code || !name || !imageUrl) return null;

  const categories = product.categories_tags ?? [];
  const classification = classifyProduct(
    name,
    categories,
    requestedCategoryId,
  );

  return {
    code,
    identifierLabel: "GTIN",
    name,
    brand: product.brands?.trim() || "Chưa ghi thương hiệu",
    imageUrl: imageUrl.replace(/^http:\/\//i, "https://"),
    quantity: product.quantity?.trim() || "Chưa ghi khối lượng",
    categoryIds: classification.categoryIds,
    primaryCategoryId: classification.primaryCategoryId,
    classificationConfidence: classification.confidence,
    labels: (product.labels_tags ?? []).slice(0, 5),
    categories: categories.slice(-6),
    ingredients: (product.ingredients_tags ?? [])
      .slice(0, 8)
      .map(cleanTag),
    price: null,
    currency: null,
    priceKind: "unavailable",
    priceDate: null,
    store: null,
    city: null,
    country: null,
    isDiscounted: false,
    dataDate: product.last_modified_datetime ?? null,
    sourceId: "open-food-facts",
    sourceLabel: "Open Food Facts",
    productUrl: `https://world.openfoodfacts.org/product/${encodeURIComponent(code)}`,
    priceSourceUrl: null,
  };
}

export async function getOpenFoodFactsCatalog({
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
  const category = categoryId ? CATEGORY_BY_ID.get(categoryId) : null;

  // Structured OFF search does not provide reliable full-text matching.
  // Free-text queries are covered by DSLD and Open Prices instead.
  if (query && !category) {
    return {
      items: [],
      recordCount: 0,
      hasMore: false,
      source: {
        id: "open-food-facts",
        label: "Open Food Facts",
        role: "Catalog quốc tế và ảnh bao bì",
        recordCount: 0,
        status: "ready",
        priced: false,
      },
    };
  }

  const tag = category?.tagHints[0] ?? DEFAULT_SCOPE_TAG;
  if (category && !category.tagHints.length) {
    return {
      items: [],
      recordCount: 0,
      hasMore: false,
      source: {
        id: "open-food-facts",
        label: "Open Food Facts",
        role: "Catalog quốc tế và ảnh bao bì",
        recordCount: 0,
        status: "ready",
        priced: false,
      },
    };
  }

  const url = new URL(SEARCH_URL);
  url.searchParams.set("categories_tags", tag);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(Math.min(50, Math.max(24, limit * 2))));

  let data: OpenFoodFactsSearch;
  try {
    data = await fetchProviderJson<OpenFoodFactsSearch>(
      url,
      "Open Food Facts",
    );
  } catch {
    const regionalFallback = new URL(url);
    regionalFallback.hostname = "us.openfoodfacts.org";
    try {
      data = await fetchProviderJson<OpenFoodFactsSearch>(
        regionalFallback,
        "Open Food Facts",
      );
    } catch {
      const mirrorUrl = new URL(
        "https://prices.openfoodfacts.org/api/v1/products",
      );
      mirrorUrl.searchParams.set("categories_tags__contains", tag);
      mirrorUrl.searchParams.set("order_by", "-price_count");
      mirrorUrl.searchParams.set("page", String(page));
      mirrorUrl.searchParams.set(
        "size",
        String(Math.min(100, Math.max(24, limit * 2))),
      );
      const mirror = await fetchProviderJson<OpenPricesProductMirror>(
        mirrorUrl,
        "Open Prices product mirror",
      );
      data = {
        count: mirror.total,
        page: mirror.page,
        page_count: mirror.pages,
        page_size: mirror.size,
        products: mirror.items,
      };
    }
  }
  const items = (data.products ?? [])
    .map((product) => mapProduct(product, categoryId))
    .filter((product): product is CatalogProduct => Boolean(product))
    .slice(0, limit);
  const recordCount = data.count ?? items.length;
  const responsePage = data.page ?? page;
  const pageSize = data.page_size ?? Math.max(24, limit * 2);

  return {
    items,
    recordCount,
    hasMore:
      typeof data.page_count === "number"
        ? responsePage < data.page_count
        : responsePage * pageSize < recordCount,
    source: {
      id: "open-food-facts",
      label: "Open Food Facts",
      role: "Catalog quốc tế và ảnh bao bì",
      recordCount,
      status: "ready",
      priced: false,
    },
  };
}
