import type { Metadata } from "next";
import { SiteLoader } from "@/components/site/site-loader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "4L CHAPEAU · Association sportive & solidaire",
    template: "%s · 4L CHAPEAU",
  },
  description:
    "4L CHAPEAU fait rouler une Renault 4L entre préparation, 4L Trophy, événements sportifs et projets solidaires.",
  themeColor: "#183b67",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <SiteLoader />
        {children}
      </body>
    </html>
  );
}
