"use client";

import { motion } from "framer-motion";

export default function TemplateCarousel({ templates, activeTemplateId, onApply }) {
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
      {templates.map((template) => {
        const isActive = template.id === activeTemplateId;

        return (
          <motion.button
            key={template.id}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onApply(template)}
            className={`relative w-[240px] shrink-0 overflow-hidden rounded-[24px] border p-4 text-left shadow-[0_18px_32px_rgba(2,6,23,0.24)] transition duration-200 ${
              isActive
                ? "border-emerald-300/22 bg-[linear-gradient(180deg,rgba(18,52,42,0.96),rgba(10,18,18,0.98))] text-white"
                : "border-white/10 bg-[linear-gradient(180deg,rgba(20,28,28,0.96),rgba(10,14,14,0.98))] text-white"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-sm font-black uppercase tracking-[0.04em] text-white">{template.label}</p>
            <p className="mt-2 text-sm leading-5 text-slate-300">{template.description}</p>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
              {template.context}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
