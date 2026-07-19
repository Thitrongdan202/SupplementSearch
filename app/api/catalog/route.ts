import { NextRequest, NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";
import type { CatalogMode } from "@/lib/types";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const categoryId = request.nextUrl.searchParams.get("category");
  const page = Math.max(
    1,
    Math.min(50, Number(request.nextUrl.searchParams.get("page")) || 1),
  );
  const limit = Math.max(
    6,
    Math.min(36, Number(request.nextUrl.searchParams.get("limit")) || 24),
  );
  const requestedMode = request.nextUrl.searchParams.get("mode");
  const mode: CatalogMode =
    requestedMode === "priced" ? "priced" : "all";

  try {
    const catalog = await getCatalog({
      query,
      categoryId,
      page,
      limit,
      mode,
    });

    return NextResponse.json(catalog, {
      headers: {
        "Cache-Control":
          "public, max-age=120, s-maxage=600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Catalog provider error", error);
    return NextResponse.json(
      {
        error: "Các nguồn dữ liệu đang bận. Vui lòng thử lại sau ít phút.",
      },
      { status: 503 },
    );
  }
}
