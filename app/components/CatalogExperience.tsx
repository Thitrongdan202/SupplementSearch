"use client";

import dynamic from "next/dynamic";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import ProductCard from "@/app/components/ProductCard";
import ProductDialog from "@/app/components/ProductDialog";
import {
  CATEGORIES,
  CATEGORY_BY_ID,
  SECTION_META,
} from "@/lib/taxonomy";
import type {
  CatalogMode,
  CatalogProduct,
  CatalogResponse,
  CategorySection,
} from "@/lib/types";

const NutrientScene = dynamic(
  () => import("@/app/components/NutrientScene"),
  {
    ssr: false,
    loading: () => <div className="scene-placeholder" aria-hidden="true" />,
  },
);

const SECTION_ORDER: CategorySection[] = [
  "foundation",
  "body-goal",
  "life-stage",
  "sport",
];

type LoadState = "loading" | "ready" | "error";
type SortMode = "recent" | "price-asc" | "price-desc";

function compactNumber(value: number | undefined) {
  if (typeof value !== "number") return "Đang nối";
  return new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <div className="product-card skeleton-card" aria-hidden="true">
      <div className="card-index">
        <span>Đang lấy</span>
        <strong>{String(index + 1).padStart(2, "0")}</strong>
      </div>
      <div className="skeleton-image" />
      <div className="skeleton-copy">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default function CatalogExperience() {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [activeSection, setActiveSection] =
    useState<CategorySection>("foundation");
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [catalogMeta, setCatalogMeta] = useState<CatalogResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [catalogMode, setCatalogMode] = useState<CatalogMode>("all");
  const [selectedProduct, setSelectedProduct] =
    useState<CatalogProduct | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      limit: "24",
      mode: catalogMode,
    });
    if (submittedQuery) params.set("q", submittedQuery);
    if (selectedCategoryId) params.set("category", selectedCategoryId);

    fetch(`/api/catalog?${params}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const body = (await response.json()) as
          | CatalogResponse
          | { error?: string };
        if (!response.ok) {
          throw new Error(
            "error" in body && body.error
              ? body.error
              : "Không thể đọc nguồn dữ liệu.",
          );
        }
        return body as CatalogResponse;
      })
      .then((body) => {
        setCatalogMeta(body);
        setErrorMessage("");
        setProducts((current) => {
          const next = page === 1 ? body.items : [...current, ...body.items];
          return [...new Map(next.map((item) => [item.code, item])).values()];
        });
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadState("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nguồn dữ liệu cộng đồng đang bận.",
        );
      });

    return () => controller.abort();
  }, [
    page,
    retryKey,
    catalogMode,
    selectedCategoryId,
    submittedQuery,
  ]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = inputValue.trim();
    setLoadState("loading");
    setErrorMessage("");
    setPage(1);
    setSelectedCategoryId(null);
    setSubmittedQuery(nextQuery);
  };

  const chooseCategory = (categoryId: string | null) => {
    setLoadState("loading");
    setErrorMessage("");
    setPage(1);
    setSubmittedQuery("");
    setInputValue("");
    setSelectedCategoryId(categoryId);
  };

  const chooseSection = (section: CategorySection) => {
    setActiveSection(section);
    const currentCategory = selectedCategoryId
      ? CATEGORY_BY_ID.get(selectedCategoryId)
      : null;
    if (currentCategory && currentCategory.section !== section) {
      chooseCategory(null);
    }
  };

  const chooseCatalogMode = (mode: CatalogMode) => {
    if (mode === catalogMode) return;
    setLoadState("loading");
    setErrorMessage("");
    setProducts([]);
    setPage(1);
    setCatalogMode(mode);
  };

  const visibleCategories = useMemo(
    () => CATEGORIES.filter((category) => category.section === activeSection),
    [activeSection],
  );

  const sortedProducts = useMemo(() => {
    const next = [...products];
    if (sortMode === "price-asc") {
      return next.sort((a, b) => {
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return a.price - b.price;
      });
    }
    if (sortMode === "price-desc") {
      return next.sort((a, b) => {
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return b.price - a.price;
      });
    }
    return next;
  }, [products, sortMode]);

  const selectedCategory = selectedCategoryId
    ? CATEGORY_BY_ID.get(selectedCategoryId)
    : null;

  const closeDialog = useCallback(() => setSelectedProduct(null), []);

  const resultsTitle = submittedQuery
    ? `Kết quả cho “${submittedQuery}”`
    : selectedCategory?.label ?? "Dòng dữ liệu mới nhất";
  const providerStats = new Map(
    (catalogMeta?.source.providers ?? []).map((provider) => [
      provider.id,
      provider,
    ]),
  );

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Supplement Atlas - đầu trang">
          <span className="brand-mark" aria-hidden="true">
            SA
          </span>
          <span>
            <strong>Supplement Atlas</strong>
            <small>Bản đồ dữ liệu bổ sung</small>
          </span>
        </a>
        <nav aria-label="Điều hướng chính">
          <a href="#taxonomy">Phân loại</a>
          <a href="#catalog">Catalogue</a>
          <a href="#method">Nguồn & phương pháp</a>
        </nav>
        <span className="data-status">
          <i aria-hidden="true" />
          API công khai
        </span>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">3 nguồn dữ liệu · Có ảnh · Giá không bịa</p>
            <h1 id="hero-title">
              Tìm đúng nhóm bổ sung,
              <em> không lạc trong lời quảng cáo.</em>
            </h1>
            <p className="hero-lede">
              Khám phá hàng chục nghìn hồ sơ bằng thành phần và mục tiêu — ảnh
              bao bì thật, nhãn NIH chuyên sâu, giá có địa điểm và thời điểm ghi
              nhận khi nguồn mở cung cấp.
            </p>

            <form className="hero-search" onSubmit={handleSearch} role="search">
              <label htmlFor="catalog-search">Tìm sản phẩm hoặc hoạt chất</label>
              <div className="search-control">
                <input
                  id="catalog-search"
                  type="search"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Whey, vitamin D3, collagen, omega-3…"
                  autoComplete="off"
                  maxLength={80}
                />
                <button type="submit">
                  <span>Tìm trong Atlas</span>
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
              <p>
                Tìm khi nhấn nút để tôn trọng giới hạn của nguồn dữ liệu mở.
              </p>
            </form>

            <div className="quick-search" aria-label="Tìm nhanh">
              {["Creatine", "Omega 3", "Vitamin D3", "Protein bar"].map(
                (query) => (
                  <button
                    type="button"
                    key={query}
                    onClick={() => {
                      setLoadState("loading");
                      setErrorMessage("");
                      setInputValue(query);
                      setSubmittedQuery(query);
                      setSelectedCategoryId(null);
                      setPage(1);
                    }}
                  >
                    {query}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="hero-visual">
            <NutrientScene />
            <div className="orbit-label orbit-label-a">
              <span>01</span>
              Nền tảng
            </div>
            <div className="orbit-label orbit-label-b">
              <span>02</span>
              Mục tiêu
            </div>
            <div className="orbit-label orbit-label-c">
              <span>03</span>
              Giai đoạn sống
            </div>
            <div className="orbit-label orbit-label-d">
              <span>04</span>
              Thể thao
            </div>
            <div className="hero-visual-note">
              <strong>{CATEGORIES.length}</strong>
              <span>nhánh phân loại đang hoạt động</span>
            </div>
          </div>
        </section>

        <section className="source-strip" aria-label="Nguồn dữ liệu">
          <p>
            <strong>Open Food Facts</strong>
            {catalogMode === "priced"
              ? "Ẩn trong bộ lọc giá"
              : `${compactNumber(
                  providerStats.get("open-food-facts")?.recordCount,
                )} hồ sơ có ảnh`}
          </p>
          <p>
            <strong>NIH ODS · DSLD</strong>
            {catalogMode === "priced"
              ? "Ẩn trong bộ lọc giá"
              : `${compactNumber(
                  providerStats.get("nih-dsld")?.recordCount,
                )} nhãn chuyên supplement`}
          </p>
          <p>
            <strong>Open Prices</strong>
            {compactNumber(providerStats.get("open-prices")?.recordCount)} quan
            sát giá
          </p>
          <p>
            <strong>Chế độ hiện tại</strong>
            {catalogMode === "all" ? "Toàn bộ catalog" : "Chỉ sản phẩm có giá"}
          </p>
        </section>

        <section className="taxonomy-section" id="taxonomy">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Ống kính khám phá</p>
              <h2>Không chỉ có “vitamin” và “protein”.</h2>
            </div>
            <p>
              Một sản phẩm có thể thuộc nhiều nhánh. Atlas ưu tiên tag chuẩn,
              sau đó mới xét tên và hoạt chất — không suy diễn công dụng điều
              trị.
            </p>
          </div>

          <div className="section-tabs" role="tablist" aria-label="Hệ phân loại">
            {SECTION_ORDER.map((section) => (
              <button
                key={section}
                type="button"
                role="tab"
                aria-selected={activeSection === section}
                onClick={() => chooseSection(section)}
                data-section={section}
              >
                <span>{SECTION_META[section].eyebrow}</span>
                <strong>{SECTION_META[section].label}</strong>
              </button>
            ))}
          </div>

          <div className="taxonomy-panel" data-section={activeSection}>
            <div className="taxonomy-intro">
              <span>{SECTION_META[activeSection].eyebrow}</span>
              <h3>{SECTION_META[activeSection].label}</h3>
              <p>{SECTION_META[activeSection].description}</p>
              <button
                type="button"
                className={!selectedCategoryId ? "is-active" : ""}
                onClick={() => chooseCategory(null)}
              >
                Xem toàn bộ catalogue
              </button>
            </div>
            <div className="category-list">
              {visibleCategories.map((category, index) => (
                <button
                  key={category.id}
                  type="button"
                  className={
                    selectedCategoryId === category.id ? "is-active" : ""
                  }
                  onClick={() => chooseCategory(category.id)}
                  aria-pressed={selectedCategoryId === category.id}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{category.label}</strong>
                  <small>{category.description}</small>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="catalog-section" id="catalog">
          <div className="catalog-heading">
            <div>
              <p className="eyebrow">Kệ mẫu vật / Live feed</p>
              <h2>{resultsTitle}</h2>
              <p className="catalog-caption" aria-live="polite">
                {loadState === "loading" && page === 1
                  ? "Đang hợp nhất Open Food Facts, Open Prices và NIH DSLD…"
                  : `${products.length} sản phẩm đang hiển thị · ${(
                      catalogMeta?.recordCount ?? products.length
                    ).toLocaleString("vi-VN")} hồ sơ khớp từ các nguồn`}
              </p>
            </div>
            <div className="catalog-controls">
              <div className="mode-control" aria-label="Phạm vi dữ liệu">
                <span>Phạm vi dữ liệu</span>
                <div>
                  <button
                    type="button"
                    className={catalogMode === "all" ? "is-active" : ""}
                    onClick={() => chooseCatalogMode("all")}
                    aria-pressed={catalogMode === "all"}
                  >
                    Tất cả nguồn
                  </button>
                  <button
                    type="button"
                    className={catalogMode === "priced" ? "is-active" : ""}
                    onClick={() => chooseCatalogMode("priced")}
                    aria-pressed={catalogMode === "priced"}
                  >
                    Chỉ có giá
                  </button>
                </div>
              </div>
              <label className="sort-control">
                <span>Sắp xếp trên trang</span>
                <select
                  value={sortMode}
                  onChange={(event) =>
                    setSortMode(event.target.value as SortMode)
                  }
                >
                  <option value="recent">Nguồn ghi nhận mới</option>
                  <option value="price-asc">Giá thấp → cao</option>
                  <option value="price-desc">Giá cao → thấp</option>
                </select>
              </label>
            </div>
          </div>

          {loadState === "error" && products.length === 0 ? (
            <div className="catalog-error" role="alert">
              <span aria-hidden="true">!</span>
              <div>
                <h3>Chưa nối được nguồn dữ liệu</h3>
                <p>{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoadState("loading");
                    setErrorMessage("");
                    setRetryKey((value) => value + 1);
                  }}
                >
                  Thử kết nối lại
                </button>
              </div>
            </div>
          ) : null}

          {loadState === "loading" && page === 1 ? (
            <div className="product-grid" aria-label="Đang tải sản phẩm">
              {Array.from({ length: 8 }, (_, index) => (
                <SkeletonCard index={index} key={index} />
              ))}
            </div>
          ) : null}

          {loadState !== "loading" && products.length === 0 && !errorMessage ? (
            <div className="empty-state">
              <span aria-hidden="true">0</span>
              <h3>
                {catalogMode === "priced"
                  ? "Chưa thấy sản phẩm có giá quan sát"
                  : "Chưa thấy sản phẩm phù hợp"}
              </h3>
              <p>
                Thử tên hoạt chất ngắn hơn, chuyển sang tất cả nguồn hoặc quay
                lại toàn bộ catalogue.
              </p>
              <button type="button" onClick={() => chooseCategory(null)}>
                Mở dòng dữ liệu mới nhất
              </button>
            </div>
          ) : null}

          {products.length > 0 ? (
            <>
              <div className="product-grid">
                {sortedProducts.map((product, index) => (
                  <ProductCard
                    key={product.code}
                    product={product}
                    index={index}
                    onOpen={setSelectedProduct}
                  />
                ))}
              </div>
              <div className="catalog-footer">
                <p>
                  {catalogMeta?.source.note ??
                    "Giá là quan sát cộng đồng, không phải giá bán cố định."}
                </p>
                {catalogMeta?.hasMore ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLoadState("loading");
                      setErrorMessage("");
                      setPage((value) => value + 1);
                    }}
                    disabled={loadState === "loading"}
                  >
                    {loadState === "loading"
                      ? "Đang lấy thêm…"
                      : "Mở thêm một kệ"}
                  </button>
                ) : (
                  <span>Đã tới cuối lát cắt hiện tại</span>
                )}
              </div>
            </>
          ) : null}
        </section>

        <section className="method-section" id="method">
          <div className="method-number" aria-hidden="true">
            3×
          </div>
          <div>
            <p className="eyebrow">Minh bạch dữ liệu</p>
            <h2>Mỗi card là một phép nối, không phải một lời hứa.</h2>
          </div>
          <ol>
            <li>
              <span>01</span>
              Ảnh, tên, thương hiệu và taxonomy đến từ cộng đồng Open Food
              Facts.
            </li>
            <li>
              <span>02</span>
              Giá được nối bằng GTIN với Open Prices, giữ nguyên tiền tệ, ngày
              và địa điểm.
            </li>
            <li>
              <span>03</span>
              Nhãn, dạng dùng và thành phần chuyên supplement đến từ NIH ODS
              Dietary Supplement Label Database.
            </li>
            <li>
              <span>04</span>
              Sản phẩm thiếu giá vẫn được tra cứu nhưng luôn mang dấu “Chưa có
              giá mở”; Atlas không tự suy diễn hay quy đổi giá.
            </li>
          </ol>
        </section>
      </main>

      <footer className="site-footer">
        <div className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">
            SA
          </span>
          <span>
            <strong>Supplement Atlas</strong>
            <small>Open-data product explorer</small>
          </span>
        </div>
        <p>
          Thông tin nhằm mục đích tra cứu sản phẩm, không thay thế tư vấn từ
          chuyên gia y tế. Không tuyên bố bao phủ tuyệt đối mọi sản phẩm trên
          thị trường.
        </p>
        <div>
          <a
            href="https://world.openfoodfacts.org"
            target="_blank"
            rel="noreferrer"
          >
            Open Food Facts ↗
          </a>
          <a
            href="https://prices.openfoodfacts.org"
            target="_blank"
            rel="noreferrer"
          >
            Open Prices ↗
          </a>
          <a
            href="https://dsld.od.nih.gov"
            target="_blank"
            rel="noreferrer"
          >
            NIH DSLD ↗
          </a>
        </div>
      </footer>

      <ProductDialog product={selectedProduct} onClose={closeDialog} />
    </>
  );
}
