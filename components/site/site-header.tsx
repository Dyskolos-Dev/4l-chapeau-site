"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DonationTrigger } from "@/components/site/donation-dialog";
import type { SiteSettings } from "@/lib/content";
import { cn } from "@/lib/utils";

type Props = {
  navigationLabels?: SiteSettings["navigation"];
  associationName?: string;
  brandMark?: string;
};

export function SiteHeader({
  navigationLabels,
  associationName = "4L CHAPEAU",
  brandMark = "4L",
}: Props) {
  const pathname = usePathname();
  const activePathname = pathname ?? "/";
  const [openMenuPath, setOpenMenuPath] = useState<string | null>(null);
  const isOpen = openMenuPath === activePathname;
  const navigation = [
    { href: "/", label: navigationLabels?.home ?? "Accueil" },
    { href: "/le-projet", label: navigationLabels?.association ?? "L’association" },
    { href: "/4l-trophy", label: navigationLabels?.trophy ?? "4L Trophy" },
    { href: "/evenements", label: navigationLabels?.events ?? "Événements" },
    { href: "/actualites", label: navigationLabels?.news ?? "Actualités" },
    { href: "/galerie", label: navigationLabels?.gallery ?? "Galerie" },
  ];

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenuPath(null);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === href : Boolean(pathname?.startsWith(href));

  const closeMenu = () => setOpenMenuPath(null);
  const toggleMenu = () => {
    setOpenMenuPath((openPath) => (openPath === activePathname ? null : activePathname));
  };

  return (
    <header className="nova-header">
      <a className="nova-skip-link" href="#main-content">
        Aller au contenu
      </a>
      <div className="nova-header-inner">
        <Link className="nova-brand" href="/" onClick={closeMenu}>
          <span className="nova-brand-mark">{brandMark || "4L"}</span>
          <span>{associationName}</span>
        </Link>

        <nav className="nova-nav" aria-label="Navigation principale">
          {navigation.map((item) => (
            <Link
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(isActive(item.href) && "is-active")}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nova-header-actions">
          <DonationTrigger className="nova-support-cta" fallbackHref="/soutenir" />
          <button
            className={cn("nova-menu-button", isOpen && "is-open")}
            type="button"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            onClick={toggleMenu}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {isOpen ? (
        <nav
          className="nova-mobile-menu is-open"
          id="mobile-navigation"
          aria-label="Navigation mobile"
        >
          {navigation.map((item) => (
            <Link
              aria-current={isActive(item.href) ? "page" : undefined}
              href={item.href}
              key={item.href}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
          <DonationTrigger
            className="nova-mobile-support"
            fallbackHref="/soutenir"
            onClick={closeMenu}
          />
        </nav>
      ) : null}
    </header>
  );
}
