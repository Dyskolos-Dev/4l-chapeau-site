import type { Metadata } from "next";
import { SiteLoader } from "@/components/site/site-loader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "4L CHAPEAU · Roadbook ouvert",
    template: "%s · 4L CHAPEAU",
  },
  description:
    "Le roadbook de 4L CHAPEAU : préparation de la 4L, 4L Trophy, événements sportifs et vie d’équipage.",
  themeColor: "#0c0d14",
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
