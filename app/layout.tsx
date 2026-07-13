import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "革製品ケア記録",
  description: "革製品のケア履歴を記録し、次回メンテナンス時期を把握する。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "革ケア記録",
  },
};

export const viewport = {
  themeColor: "#5c4033",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
