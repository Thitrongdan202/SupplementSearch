import type { Metadata } from "next";
import CatalogExperience from "@/app/components/CatalogExperience";

export const metadata: Metadata = {
  title: "Supplement Atlas — Bản đồ thực phẩm bổ sung",
  description:
    "Tra cứu hơn 100.000 hồ sơ thực phẩm bổ sung bằng ảnh thật, phân loại đa lớp, nhãn NIH và giá quan sát có nguồn.",
};

export default function Home() {
  return <CatalogExperience />;
}
