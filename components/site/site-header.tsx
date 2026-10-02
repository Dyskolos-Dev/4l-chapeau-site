"use client";

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
        <a className="nova-brand" href="/" onClick={() => setIsOpen(false)}>
          <span className="nova-brand-mark">4L</span>
          <span>CHAPEAU</span>
        </a>

        <nav className="nova-nav" aria-label="Navigation principale">
          {navigation.map((item) => (
            <a
              className={cn(pathname === item.href && "is-active")}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nova-header-actions">
          <a className="nova-support-cta" href="/soutenir">
            Nous soutenir
          </a>
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
          <a href={item.href} key={item.href} onClick={() => setIsOpen(false)}>
            {item.label}
          </a>
        ))}
        <a className="nova-mobile-support" href="/soutenir" onClick={() => setIsOpen(false)}>
          Soutenir l’aventure
        </a>
      </nav>
    </header>
  );
}
