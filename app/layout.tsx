import type { Metadata } from "next";
import { DonationDialogProvider } from "@/components/site/donation-dialog";
import { SiteLoader } from "@/components/site/site-loader";
import { getSiteSettings } from "@/lib/content-repository";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const { associationName, city, team, targetEvent, targetYear } = settings.identity;
  const teamNames = team.map((member) => member.name).join(" & ");
  const fallbackTitle = `${associationName} · ${targetEvent} ${targetYear}`;
  const fallbackDescription = `${associationName} : ${teamNames} préparent ${targetEvent} ${targetYear} depuis ${city} et cherchent leur future Renault 4L.`;

  return {
    title: {
      default: settings.seo.title || fallbackTitle,
      template: `%s · ${associationName}`,
    },
    description: settings.seo.description || fallbackDescription,
    themeColor: "#183b67",
    other: {
      "codex-preview": "development",
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="fr">
      <body className="antialiased">
        <SiteLoader
          associationName={settings.identity.associationName}
          message={settings.branding.loaderMessage}
        />
        <DonationDialogProvider donation={settings.support.donation}>
          {children}
        </DonationDialogProvider>
      </body>
    </html>
  );
}
