import assert from "node:assert/strict";
import test from "node:test";
import {
  CATEGORIES,
  classifyProduct,
  normalizeText,
  resolveCategoryFromQuery,
  SECTION_META,
} from "../lib/taxonomy.ts";

test("taxonomy has four sections and 45 unique categories", () => {
  assert.equal(Object.keys(SECTION_META).length, 4);
  assert.equal(CATEGORIES.length, 45);
  assert.equal(new Set(CATEGORIES.map((item) => item.id)).size, 45);
  assert.ok(CATEGORIES.every((item) => item.queries.length > 0));
});

test("Vietnamese aliases resolve without accents", () => {
  assert.equal(normalizeText("Khoáng chất"), "khoang chat");
  assert.equal(resolveCategoryFromQuery("khoang chat")?.id, "minerals");
  assert.equal(
    resolveCategoryFromQuery("thực phẩm chức năng")?.id,
    "other-specialty",
  );
});

test("classifier prioritizes exact taxonomy tags", () => {
  const result = classifyProduct("Triple Omega-3", [
    "en:dietary-supplements",
    "en:fish-oils",
  ]);
  assert.equal(result.primaryCategoryId, "essential-fatty-acids");
  assert.equal(result.confidence, 0.95);
});

test("selected category remains explicit in API results", () => {
  const result = classifyProduct(
    "Creatine Monohydrate",
    ["en:bodybuilding-supplements"],
    "creatine",
  );
  assert.equal(result.primaryCategoryId, "creatine");
  assert.equal(result.confidence, 1);
});
