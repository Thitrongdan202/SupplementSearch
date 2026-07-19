"use client";

import { useEffect, useRef } from "react";
import { CATEGORY_BY_ID, SECTION_META } from "@/lib/taxonomy";
import type { CatalogProduct } from "@/lib/types";

function cleanTag(tag: string) {
  return tag.replace(/^[a-z]{2}:/, "").replaceAll("-", " ");
}

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

export default function ProductDialog({
  product,
  onClose,
}: {
  product: CatalogProduct | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!product) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, product]);

  if (!product) return null;

  const primaryCategory = CATEGORY_BY_ID.get(product.primaryCategoryId);
  const section = primaryCategory?.section ?? "foundation";
  const hasPrice =
    product.priceKind === "observed" &&
    product.price !== null &&
    product.currency !== null;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="product-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-dialog-title"
        data-section={section}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="dialog-close"
          type="button"
          onClick={onClose}
          ref={closeRef}
          aria-label="Đóng hồ sơ sản phẩm"
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="dialog-visual">
          <span className="specimen-index" aria-hidden="true">
            {SECTION_META[section].eyebrow}
          </span>
          <img
            src={product.imageUrl}
            alt={`Ảnh mặt trước của ${product.name}`}
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="dialog-content">
          <p className="eyebrow">{primaryCategory?.label ?? "Đang phân loại"}</p>
          <h2 id="product-dialog-title">{product.name}</h2>
          <p className="dialog-brand">
            {product.brand} <span aria-hidden="true">·</span> {product.quantity}
          </p>

          <div className={`dialog-price${hasPrice ? "" : " is-unpriced"}`}>
            <span>{hasPrice ? "Giá ghi nhận gần nhất" : "Trạng thái giá"}</span>
            <strong>
              {hasPrice
                ? formatPrice(
                    product.price as number,
                    product.currency as string,
                  )
                : "Chưa có giá công khai"}
            </strong>
            <small>
              {hasPrice
                ? [product.store, product.city, product.priceDate]
                    .filter(Boolean)
                    .join(" · ") || "Chưa đủ địa điểm/ngày ghi nhận"
                : `${product.sourceLabel} cung cấp hồ sơ và ảnh; không cung cấp giá bán.`}
            </small>
          </div>

          <dl className="spec-list">
            <div>
              <dt>{product.identifierLabel}</dt>
              <dd>{product.code.replace(/^dsld-/, "")}</dd>
            </div>
            <div>
              <dt>Độ tin cậy phân loại</dt>
              <dd>{Math.round(product.classificationConfidence * 100)}%</dd>
            </div>
            <div>
              <dt>Nguồn dữ liệu</dt>
              <dd>
                {hasPrice && product.country
                  ? `${product.sourceLabel} · ${product.country}`
                  : product.sourceLabel}
              </dd>
            </div>
          </dl>

          <div className="dialog-tags" aria-label="Nhãn phân loại">
            {product.categories.slice(0, 5).map((tag) => (
              <span key={tag}>{cleanTag(tag)}</span>
            ))}
            {product.ingredients.slice(0, 5).map((ingredient) => (
              <span key={`ingredient-${ingredient}`}>{cleanTag(ingredient)}</span>
            ))}
          </div>

          <p className="dialog-note">
            {hasPrice
              ? "Giá là quan sát cộng đồng tại một nơi và thời điểm cụ thể, không phải báo giá bán tại Việt Nam. "
              : "Nguồn mở chưa có giá đáng tin cậy cho sản phẩm này nên Atlas chủ động để trống. "}
            Phân loại dùng cho tra cứu, không phải tuyên bố điều trị.
          </p>

          <div className="dialog-actions">
            <a href={product.productUrl} target="_blank" rel="noreferrer">
              Hồ sơ sản phẩm
            </a>
            {product.priceSourceUrl ? (
              <a
                href={product.priceSourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Kiểm tra nguồn giá
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
