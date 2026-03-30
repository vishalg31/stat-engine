"use client";

import { useEffect, useState } from "react";

export default function HubHeader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let previousScrollY = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < previousScrollY;
      const nearTop = currentScrollY < 24;

      setIsVisible(nearTop || isScrollingUp);
      previousScrollY = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#081011]/88 backdrop-blur-md transition-transform duration-200 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm sm:px-6 lg:px-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 font-semibold text-slate-200 transition duration-200 hover:text-white"
          >
            <span className="text-amber-300">&larr;</span>
            <span>Back to Cricket Hub</span>
          </a>
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            IPL Stat Engine
          </span>
        </div>
      </header>
      <div className="h-[53px]" />
    </>
  );
}
