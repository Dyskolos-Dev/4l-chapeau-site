"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function SiteLoader({
  associationName = "4L CHAPEAU",
  message = "On prend la route",
}: {
  associationName?: string;
  message?: string;
}) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"running" | "leaving">("running");

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    const key = "4l-chapeau-loader-seen";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasSeenLoader = window.sessionStorage.getItem(key) === "1";
    if (!hasSeenLoader) window.sessionStorage.setItem(key, "1");

    const timer = window.setTimeout(
      () => setPhase("leaving"),
      hasSeenLoader || reducedMotion ? 80 : 1150,
    );
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className={`site-loader site-loader-${phase}`} aria-hidden="true">
      <p className="loader-title">{associationName}</p>
      <div className="loader-road">
        <span className="loader-road-line" />
        <img className="loader-car" src="/images/4l-loader-car.png" alt="" />
      </div>
      <p className="loader-copy">{message}</p>
    </div>
  );
}
