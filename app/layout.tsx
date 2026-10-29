import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#132b1e",
};

export const metadata: Metadata = {
  title: "PEJA Ventures NIG. — Excellence, in every detail.",
  description:
    "A diversified Nigerian conglomerate building cleaner spaces, stronger supply chains and everyday essentials. Explore PEJA Cleaning, Agriculture, Logistics and Clothing.",
  keywords: ["PEJA Ventures", "Nigeria", "cleaning", "agriculture", "logistics", "clothing", "Nigerian conglomerate"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PEJA Studio",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/logo/logo-mark.png",
  },
  openGraph: {
    title: "PEJA Ventures NIG.",
    description: "Excellence, in every detail. A diversified Nigerian group building cleaner spaces, stronger supply chains and everyday essentials.",
    type: "website",
    locale: "en_NG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG">
      <body>{children}</body>
    </html>
  );
}
