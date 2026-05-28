import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoImport AI Calculator",
  description: "Предварительный расчет стоимости импорта авто под ключ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
