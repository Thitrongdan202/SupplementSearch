import { getDsldCatalog } from "@/lib/dsld";
import { getOpenFoodFactsCatalog } from "@/lib/open-food-facts";
import { getOpenPricesCatalog } from "@/lib/open-prices";
import {
  CATEGORY_BY_ID,
  normalizeText,
  resolveCategoryFromQuery,
} from "@/lib/taxonomy";
import type {
  CatalogMode,
  CatalogProduct,
  CatalogProviderId,
  CatalogProviderResult,
  CatalogResponse,
  CatalogSourceStat,
} from "@/lib/types";

const SOURCE_DEFAULTS: Record<
  CatalogProviderId,
  Omit<CatalogSourceStat, "recordCount" | "status">
> = {
  "open-prices": {
    id: "open-prices",
    label: "Open Prices",
    role: "Giá quan sát có ngày và địa điểm",
    priced: true,
  },
  "open-food-facts": {
    id: "open-food-facts",
    label: "Open Food Facts",
    role: "Catalog quốc tế và ảnh bao bì",
    priced: false,
  },
  "nih-dsld": {
    id: "nih-dsld",
    label: "NIH ODS · DSLD",
    role: "Nhãn, thành phần và sản phẩm chuyên supplement",
    priced: false,
  },
};

function unavailableSource(id: CatalogProviderId): CatalogSourceStat {
  return {
    ...SOURCE_DEFAULTS[id],
    recordCount: 0,
    status: "unavailable",
  };
}

function productKeys(product: CatalogProduct) {
  const keys = [
    `name:${normalizeText(`${product.brand} ${product.name}`)}`,
  ];
  if (product.identifierLabel === "GTIN") {
    keys.unshift(`gtin:${product.code.replace(/^0+/, "")}`);
  }
  return keys;
}

function interleaveProducts(
  results: Map<CatalogProviderId, CatalogProviderResult>,
  limit: number,
) {
  const pools: Record<CatalogProviderId, CatalogProduct[]> = {
    "open-prices": results.get("open-prices")?.items ?? [],
    "open-food-facts": results.get("open-food-facts")?.items ?? [],
    "nih-dsld": results.get("nih-dsld")?.items ?? [],
  };
  const cursors: Record<CatalogProviderId, number> = {
    "open-prices": 0,
    "open-food-facts": 0,
    "nih-dsld": 0,
  };
  const cadence: CatalogProviderId[] = [
    "open-prices",
    "open-prices",
    "open-food-facts",
    "nih-dsld",
  ];
  const seen = new Set<string>();
  const items: CatalogProduct[] = [];

  const addNext = (providerId: CatalogProviderId) => {
    while (cursors[providerId] < pools[providerId].length) {
      const product = pools[providerId][cursors[providerId]++];
      const keys = productKeys(product);
      if (keys.some((key) => seen.has(key))) continue;
      keys.forEach((key) => seen.add(key));
      items.push(product);
      return true;
    }
    return false;
  };

  while (items.length < limit) {
    let addedThisRound = false;
    for (const providerId of cadence) {
      if (items.length >= limit) break;
      addedThisRound = addNext(providerId) || addedThisRound;
    }
    if (!addedThisRound) break;
  }

  return items;
}

export async function getCatalog({
  query,
  categoryId,
  page,
  limit,
  mode,
}: {
  query: string;
  categoryId: string | null;
  page: number;
  limit: number;
  mode: CatalogMode;
}): Promise<CatalogResponse> {
  const normalizedQuery = query.trim().slice(0, 80);
  const queryCategory = normalizedQuery
    ? resolveCategoryFromQuery(normalizedQuery)
    : null;
  const resolvedCategoryId =
    categoryId && CATEGORY_BY_ID.has(categoryId)
      ? categoryId
      : queryCategory?.id ?? null;
  const providerArgs = {
    query: queryCategory ? "" : normalizedQuery,
    categoryId: resolvedCategoryId,
    page,
    limit,
  };

  if (mode === "priced") {
    const result = await getOpenPricesCatalog(providerArgs);
    return {
      items: result.items,
      page,
      hasMore: result.hasMore,
      recordCount: result.recordCount,
      mode,
      query: normalizedQuery,
      resolvedCategoryId,
      fetchedAt: new Date().toISOString(),
      source: {
        providers: [result.source],
        live: true,
        note:
          "Chế độ chỉ có giá: mỗi mức giá là một quan sát cộng đồng có ngày, tiền tệ và địa điểm; không phải báo giá bán tại Việt Nam.",
      },
    };
  }

  const providerIds: CatalogProviderId[] = [
    "open-prices",
    "open-food-facts",
    "nih-dsld",
  ];
  const settled = await Promise.allSettled([
    getOpenPricesCatalog(providerArgs),
    getOpenFoodFactsCatalog(providerArgs),
    getDsldCatalog(providerArgs),
  ]);
  const results = new Map<CatalogProviderId, CatalogProviderResult>();
  const providers = settled.map((result, index) => {
    const id = providerIds[index];
    if (result.status === "fulfilled") {
      results.set(id, result.value);
      return result.value.source;
    }
    console.error(`${SOURCE_DEFAULTS[id].label} provider error`, result.reason);
    return unavailableSource(id);
  });

  if (!results.size) {
    throw new Error("All catalog providers are unavailable");
  }

  return {
    items: interleaveProducts(results, limit),
    page,
    hasMore: [...results.values()].some((result) => result.hasMore),
    recordCount: [...results.values()].reduce(
      (total, result) => total + result.recordCount,
      0,
    ),
    mode,
    query: normalizedQuery,
    resolvedCategoryId,
    fetchedAt: new Date().toISOString(),
    source: {
      providers,
      live: true,
      note:
        "Catalog mở rộng gồm sản phẩm có ảnh từ Open Food Facts và nhãn NIH DSLD. Chỉ card mang dấu “Giá quan sát” mới có giá Open Prices; card còn lại không được tự gán giá.",
    },
  };
}
