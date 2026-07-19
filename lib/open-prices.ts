import {
  CATEGORY_BY_ID,
  classifyProduct,
} from "@/lib/taxonomy";
import { fetchProviderJson } from "@/lib/provider-cache";
import type {
  CatalogProduct,
  CatalogProviderResult,
} from "@/lib/types";

const API_BASE = "https://prices.openfoodfacts.org/api/v1";
const DEFAULT_SCOPE_TAG = "en:dietary-supplements";

interface RawProduct {
  code?: string;
  product_name?: string | null;
  image_url?: string | null;
  brands?: string | null;
  quantity?: string | null;
  product_quantity?: number | null;
  product_quantity_unit?: string | null;
  categories_tags?: string[] | null;
  labels_tags?: string[] | null;
  price_count?: number;
}

interface RawLocation {
  osm_name?: string | null;
  osm_brand?: string | null;
  osm_address_city?: string | null;
  osm_address_country?: string | null;
}

interface RawPrice {
  product_code?: string | null;
  product?: RawProduct | null;
  location?: RawLocation | null;
  price?: number | string | null;
  currency?: string | null;
  date?: string | null;
  price_is_discounted?: boolean;
}

interface Paginated<T> {
  items?: T[];
  page?: number;
  pages?: number;
  size?: number;
  total?: number;
}

function secureImageUrl(value: string) {
  return value.replace(/^http:\/\//i, "https://");
}

function productQuantity(product: RawProduct) {
  if (product.quantity?.trim()) return product.quantity.trim();
  if (product.product_quantity && product.product_quantity_unit) {
    return `${product.product_quantity} ${product.product_quantity_unit}`;
  }
  return "Chưa ghi khối lượng";
}

function mapPrice(
  raw: RawPrice,
  requestedCategoryId?: string | null,
): CatalogProduct | null {
  const product = raw.product;
  const code = product?.code ?? raw.product_code;
  const name = product?.product_name?.trim();
  const imageUrl = product?.image_url?.trim();
  const price = Number(raw.price);
  const currency = raw.currency?.trim();

  if (
    !product ||
    !code ||
    !name ||
    !imageUrl ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !currency
  ) {
    return null;
  }

  const categories = product.categories_tags ?? [];
  const classification = classifyProduct(
    name,
    categories,
    requestedCategoryId,
  );
  const location = raw.location;

  return {
    code,
    identifierLabel: "GTIN",
    name,
    brand: product.brands?.trim() || "Chưa ghi thương hiệu",
    imageUrl: secureImageUrl(imageUrl),
    quantity: productQuantity(product),
    categoryIds: classification.categoryIds,
    primaryCategoryId: classification.primaryCategoryId,
    classificationConfidence: classification.confidence,
    labels: (product.labels_tags ?? []).slice(0, 5),
    categories: categories.slice(-6),
    ingredients: [],
    price,
    currency,
    priceKind: "observed",
    priceDate: raw.date ?? null,
    store: location?.osm_brand ?? location?.osm_name ?? null,
    city: location?.osm_address_city ?? null,
    country: location?.osm_address_country ?? null,
    isDiscounted: Boolean(raw.price_is_discounted),
    dataDate: raw.date ?? null,
    sourceId: "open-prices",
    sourceLabel: "Open Prices + Open Food Facts",
    productUrl: `https://world.openfoodfacts.org/product/${encodeURIComponent(code)}`,
    priceSourceUrl: `https://prices.openfoodfacts.org/api/v1/prices?product_code=${encodeURIComponent(code)}&order_by=-date`,
  };
}

function isNewer(candidate: RawPrice, current: RawPrice) {
  if (!candidate.date) return false;
  if (!current.date) return true;
  return candidate.date > current.date;
}

function uniqueProducts(
  items: RawPrice[],
  requestedCategoryId?: string | null,
) {
  const latestByCode = new Map<string, RawPrice>();

  for (const item of items) {
    const code = item.product?.code ?? item.product_code;
    if (!code) continue;
    const current = latestByCode.get(code);
    if (!current || isNewer(item, current)) {
      latestByCode.set(code, item);
    }
  }

  return [...latestByCode.values()]
    .map((item) => mapPrice(item, requestedCategoryId))
    .filter((item): item is CatalogProduct => Boolean(item));
}

async function productsByCategory(
  categoryId: string | null,
  page: number,
  limit: number,
) {
  const category = categoryId ? CATEGORY_BY_ID.get(categoryId) : null;
  if (category && !category.tagHints.length) {
    return productsByName(category.queries[0], categoryId, page, limit);
  }
  const tag = category?.tagHints[0] ?? DEFAULT_SCOPE_TAG;
  const url = new URL(`${API_BASE}/prices`);
  url.searchParams.set("product__categories_tags__contains", tag);
  url.searchParams.set("type", "PRODUCT");
  url.searchParams.set("duplicate_of__isnull", "true");
  url.searchParams.set("order_by", "-date");
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(Math.max(72, limit * 4)));

  const data = await fetchProviderJson<Paginated<RawPrice>>(
    url,
    "Open Prices",
    10 * 60 * 1000,
  );
  let items = uniqueProducts(data.items ?? [], categoryId).slice(0, limit);

  if (category && items.length < Math.min(4, limit)) {
    const fallback = await productsByName(
      category.queries[0],
      categoryId,
      page,
      limit,
    );
    items = fallback.items;
    return {
      ...fallback,
      recordCount: data.total ?? fallback.recordCount,
    };
  }

  return {
    items,
    recordCount: Math.max(data.total ?? 0, items.length),
    hasMore: (data.page ?? page) < (data.pages ?? page),
  };
}

async function productsByName(
  query: string,
  requestedCategoryId: string | null,
  page: number,
  limit: number,
) {
  const productUrl = new URL(`${API_BASE}/products`);
  productUrl.searchParams.set("product_name__like", query);
  productUrl.searchParams.set("price_count__gte", "1");
  productUrl.searchParams.set("order_by", "-price_count");
  productUrl.searchParams.set("page", String(page));
  productUrl.searchParams.set("size", String(Math.max(36, limit * 3)));

  const productsPage =
    await fetchProviderJson<Paginated<RawProduct>>(
      productUrl,
      "Open Prices",
      10 * 60 * 1000,
    );
  const products = (productsPage.items ?? []).filter(
    (product) => product.code && product.image_url,
  );
  const codes = products
    .map((product) => product.code)
    .filter((code): code is string => Boolean(code))
    .slice(0, 45);

  if (!codes.length) {
    return {
      items: [] as CatalogProduct[],
      recordCount: productsPage.total ?? 0,
      hasMore: (productsPage.page ?? page) < (productsPage.pages ?? page),
    };
  }

  const priceUrl = new URL(`${API_BASE}/prices`);
  priceUrl.searchParams.set("product_code__in", codes.join(","));
  priceUrl.searchParams.set("type", "PRODUCT");
  priceUrl.searchParams.set("duplicate_of__isnull", "true");
  priceUrl.searchParams.set("order_by", "-date");
  priceUrl.searchParams.set("size", "100");

  const pricesPage = await fetchProviderJson<Paginated<RawPrice>>(
    priceUrl,
    "Open Prices",
    10 * 60 * 1000,
  );
  const mapped = uniqueProducts(
    pricesPage.items ?? [],
    requestedCategoryId,
  );
  const byCode = new Map(mapped.map((product) => [product.code, product]));
  const ordered = codes
    .map((code) => byCode.get(code))
    .filter((product): product is CatalogProduct => Boolean(product))
    .slice(0, limit);

  return {
    items: ordered,
    recordCount: Math.max(productsPage.total ?? 0, ordered.length),
    hasMore: (productsPage.page ?? page) < (productsPage.pages ?? page),
  };
}

export async function getOpenPricesCatalog({
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
  const normalizedQuery = query.trim().slice(0, 80);

  const result =
    normalizedQuery && !categoryId
      ? await productsByName(normalizedQuery, null, page, limit)
      : await productsByCategory(categoryId, page, limit);

  return {
    ...result,
    source: {
      id: "open-prices",
      label: "Open Prices",
      role: "Giá quan sát có ngày và địa điểm",
      recordCount: result.recordCount,
      status: "ready",
      priced: true,
    },
  };
}
