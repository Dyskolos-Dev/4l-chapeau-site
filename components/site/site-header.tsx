"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Accueil" },
  { href: "/le-projet", label: "L’association" },
  { href: "/4l-trophy", label: "4L Trophy" },
  { href: "/evenements", label: "Événements" },
  { href: "/actualites", label: "Actualités" },
  { href: "/galerie", label: "Galerie" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="nova-header">
      <div className="nova-header-inner">
        <Link className="nova-brand" href="/" onClick={() => setIsOpen(false)}>
          <span className="nova-brand-mark">4L</span>
          <span>CHAPEAU</span>
        </Link>

        <nav className="nova-nav" aria-label="Navigation principale">
          {navigation.map((item) => (
            <Link
              className={cn(pathname === item.href && "is-active")}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nova-header-actions">
          <Link className="nova-support-cta" href="/soutenir">
            Nous soutenir
          </Link>
          <button
            className={cn("nova-menu-button", isOpen && "is-open")}
            type="button"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav
        className={cn("nova-mobile-menu", isOpen && "is-open")}
        id="mobile-navigation"
        aria-label="Navigation mobile"
      >
        {navigation.map((item) => (
          <Link href={item.href} key={item.href} onClick={() => setIsOpen(false)}>
            {item.label}
          </Link>
        ))}
        <Link className="nova-mobile-support" href="/soutenir" onClick={() => setIsOpen(false)}>
          Soutenir l’aventure
        </Link>
      </nav>
    </header>
  );
}
