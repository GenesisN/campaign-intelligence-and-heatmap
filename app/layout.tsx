import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";
import { AuthInitializer } from "@/components/auth/auth-initializer";

export const metadata: Metadata = {
  title: "Greenpeace Africa Intelligence",
  description: "Africa-first campaign monitoring dashboard for environmental developments and signal heatmapping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistMono.className} antialiased min-h-screen`}>
        <AuthInitializer>{children}</AuthInitializer>
      </body>
    </html>
  );
}
