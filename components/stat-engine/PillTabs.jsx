"use client";

import { useId } from "react";
import { motion } from "framer-motion";

export default function PillTabs({ items, activeKey, onChange, className = "", itemClassName = "" }) {
  const instanceId = useId();

  return (
    <div
      className={`no-scrollbar inline-flex max-w-full gap-2 overflow-x-auto rounded-[22px] border border-white/8 bg-white/[0.03] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const isDisabled = Boolean(item.disabled);
        const activeHighlightClass =
          item.activeHighlightClass ||
          "border border-emerald-300/18 bg-[linear-gradient(180deg,rgba(22,163,74,0.28),rgba(14,116,59,0.24))] shadow-[0_10px_24px_rgba(16,185,129,0.16)]";

        return (
          <div key={item.key} className="relative shrink-0">
            <button
              type="button"
              onClick={() => (isDisabled ? item.onDisabledInteract?.() : onChange(item.key))}
              onMouseEnter={() => {
                if (isDisabled) {
                  item.onDisabledInteract?.();
                }
              }}
              title={isDisabled ? item.disabledMessage || "Coming Soon!" : undefined}
              className={`relative flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 ${itemClassName} ${
                isDisabled
                  ? "cursor-not-allowed text-slate-500"
                  : isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isActive && !isDisabled ? (
                <motion.span
                  layoutId={`${instanceId}-pill-tab-highlight`}
                  className={`absolute inset-0 rounded-2xl ${activeHighlightClass}`}
                  transition={{ type: "spring", stiffness: 340, damping: 28 }}
                />
              ) : null}
              <span className="relative z-10 whitespace-nowrap">{item.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
