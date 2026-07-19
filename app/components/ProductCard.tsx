"use client";

import { CATEGORY_BY_ID, SECTION_META } from "@/lib/taxonomy";
import type { CatalogProduct } from "@/lib/types";

function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "VND" ? 0 : 2,
    }).format(price);
  } catch {
    return `${price.toLocaleString("vi-VN")} ${currency}`;
  }
}

function formatDate(value: string | null) {
  if (!value) return "Chưa ghi ngày";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function ProductCard({
  product,
  index,
  onOpen,
}: {
  product: CatalogProduct;
  index: number;
  onOpen: (product: CatalogProduct) => void;
}) {
  const category = CATEGORY_BY_ID.get(product.primaryCategoryId);
  const section = category?.section ?? "foundation";
  const specimenNumber = String(index + 1).padStart(2, "0");
  const hasPrice =
    product.priceKind === "observed" &&
    product.price !== null &&
    product.currency !== null;

  return (
    <article className="product-card" data-section={section}>
      <div className="card-index" aria-hidden="true">
        <span>{SECTION_META[section].eyebrow}</span>
        <strong>{specimenNumber}</strong>
      </div>

      <button
        className="product-image-button"
        type="button"
        onClick={() => onOpen(product)}
        aria-label={`Mở hồ sơ ${product.name}`}
      >
        <span className="image-stage">
          <img
            src={product.imageUrl}
            alt={`Bao bì ${product.name}`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </span>
      </button>

      <div className="card-copy">
        <p className="card-category">{category?.label ?? "Đang phân loại"}</p>
        <span className="source-badge" data-source={product.sourceId}>
          {product.sourceLabel}
        </span>
        <button
          className="card-title"
          type="button"
          onClick={() => onOpen(product)}
        >
          {product.name}
        </button>
        <p className="card-brand">{product.brand}</p>
        <div className="card-meta">
          <span>{product.quantity}</span>
          <span>
            {product.identifierLabel}{" "}
            {product.code.replace(/^dsld-/, "")}
          </span>
        </div>
      </div>

      <div className={`price-stamp${hasPrice ? "" : " is-unpriced"}`}>
        <span>{hasPrice ? "Giá quan sát" : "Trạng thái giá"}</span>
        <strong>
          {hasPrice
            ? formatPrice(product.price as number, product.currency as string)
            : "Chưa có giá mở"}
        </strong>
        <small>
          {hasPrice
            ? formatDate(product.priceDate)
            : "Không tự gán giá tham khảo"}
        </small>
      </div>

      <div className="card-source">
        <span>
          {hasPrice
            ? [product.store, product.city].filter(Boolean).join(" · ") ||
              "Địa điểm cộng đồng"
            : `Hồ sơ từ ${product.sourceLabel}`}
        </span>
        <a
          href={product.priceSourceUrl ?? product.productUrl}
          target="_blank"
          rel="noreferrer"
        >
          {hasPrice ? "Nguồn giá ↗" : "Nguồn hồ sơ ↗"}
        </a>
      </div>
    </article>
  );
}
