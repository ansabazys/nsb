import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NSB — Life Operating System",
  description: "Personal Life Operating System Foundation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
