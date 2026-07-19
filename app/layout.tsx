import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/newsreader/wght.css";
import "@fontsource-variable/newsreader/wght-italic.css";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/800.css";
import "@fontsource/be-vietnam-pro/900.css";
import "@/app/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", metadataBase).toString();

  return {
    metadataBase,
    title: {
      default: "Supplement Atlas",
      template: "%s · Supplement Atlas",
    },
    description:
      "Bản đồ hơn 100.000 hồ sơ thực phẩm bổ sung từ Open Food Facts, Open Prices và NIH DSLD.",
    applicationName: "Supplement Atlas",
    referrer: "origin-when-cross-origin",
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: "Supplement Atlas",
      title: "Supplement Atlas — Tìm đúng nhóm bổ sung",
      description:
        "Ba nguồn dữ liệu, ảnh thật, taxonomy đa lớp và giá quan sát có kiểm chứng.",
      images: [
        {
          url: socialImage,
          width: 1733,
          height: 909,
          alt: "Supplement Atlas — Tìm đúng nhóm bổ sung.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Supplement Atlas — Tìm đúng nhóm bổ sung",
      description:
        "Ba nguồn dữ liệu, ảnh thật, taxonomy đa lớp và giá quan sát có kiểm chứng.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
