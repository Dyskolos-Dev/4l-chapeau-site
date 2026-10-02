"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/le-projet", label: "Le projet", index: "01" },
  { href: "/carnet", label: "Carnet", index: "02" },
  { href: "/galerie", label: "Galerie", index: "03" },
  { href: "/soutenir", label: "Soutenir", index: "04" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="route-header">
      <div className="route-header-inner">
        <Link className="route-brand" href="/" onClick={() => setIsOpen(false)}>
          <span className="route-brand-code">4L</span>
          <span>
            <b>CHAPEAU</b>
            <small>Association route & entraide</small>
          </span>
        </Link>

        <nav className="route-nav" aria-label="Navigation principale">
          {navigation.map((item) => (
            <Link
              className={cn(pathname === item.href && "is-active")}
              href={item.href}
              key={item.href}
            >
              <i>{item.index}</i>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="route-header-actions">
          <Link className="route-header-support" href="/soutenir">
            Nous soutenir
          </Link>
          <button
            className={cn("route-menu-button", isOpen && "is-open")}
            type="button"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={cn("route-mobile-nav", isOpen && "is-open")}>
        <p>Choisir une étape</p>
        {navigation.map((item) => (
          <Link href={item.href} key={item.href} onClick={() => setIsOpen(false)}>
            <span>{item.index}</span>
            {item.label}
          </Link>
        ))}
        <Link className="mobile-home" href="/" onClick={() => setIsOpen(false)}>
          Retour au départ <span>↗</span>
        </Link>
      </div>
    </header>
  );
}
