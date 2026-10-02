"use client";

import { useEffect, useState } from "react";

export function SiteLoader() {
  const [phase, setPhase] = useState<"running" | "leaving">("running");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leaveTimer = window.setTimeout(
      () => setPhase("leaving"),
      reduceMotion ? 320 : 1450,
    );
    return () => window.clearTimeout(leaveTimer);
  }, []);

  return (
    <div className={`site-loader site-loader-${phase}`} aria-label="Chargement de 4L CHAPEAU" role="status">
      <div className="loader-sun" aria-hidden="true" />
      <p className="loader-title">4L CHAPEAU</p>
      <div className="loader-road" aria-hidden="true">
        <span className="loader-road-line" />
        <span className="loader-dust loader-dust-one" />
        <span className="loader-dust loader-dust-two" />
        <img className="loader-car" src="/images/4l-loader-car.png" alt="" />
      </div>
      <p className="loader-copy">On démarre l’aventure</p>
    </div>
  );
}
