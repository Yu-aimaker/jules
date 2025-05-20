import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google"; // Import Noto Sans JP
import "./globals.css";

// Configure Noto Sans JP font
const notoSansJP = Noto_Sans_JP({
  weight: ["400", "700"], // Specify weights you need
  subsets: ["latin"], // 必要に応じて 'japanese' も追加検討
  display: "swap",
  variable: "--font-noto-sans-jp", // CSS変数として利用する場合
});

export const metadata: Metadata = {
  title: "Othello Game",
  description: "Play Othello online! Strategic board game for all ages.", // より詳細な説明
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} font-sans`}> {/* Apply font to html tag via variable and fallback */}
      <body>{children}</body>
    </html>
  );
}
