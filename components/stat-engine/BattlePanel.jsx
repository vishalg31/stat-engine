"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import PillTabs from "./PillTabs";

const battleModes = [
  { key: "batterVsBowler", label: "Matchup" },
  { key: "batterVsBatter", label: "Batter vs Batter" },
  { key: "bowlerVsBowler", label: "Bowler vs Bowler" },
  { key: "yearVsYear", label: "Year vs Year" }
];

function BattleSelect({ label, value, options, onChange }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(20,28,28,0.96),rgba(10,14,14,0.98))] px-4 text-sm text-white outline-none transition duration-200 focus:border-emerald-300 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function scoreSearchOption(query, optionLabel) {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedLabel = optionLabel.toLowerCase();

  if (!normalizedQuery) {
    return 0;
  }

  if (normalizedLabel === normalizedQuery) {
    return 100;
  }

  if (normalizedLabel.startsWith(normalizedQuery)) {
    return 80;
  }

  if (normalizedLabel.includes(normalizedQuery)) {
    return 60;
  }

  const queryParts = normalizedQuery.split(/\s+/).filter(Boolean);
  const matchedParts = queryParts.filter((part) => normalizedLabel.includes(part)).length;

  if (matchedParts > 0) {
    return 40 + matchedParts;
  }

  return -1;
}

function SearchableBattleSelect({ label, value, options, onChange, placeholder }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || null,
    [options, value]
  );

  const suggestions = useMemo(() => {
    if (!query.trim()) {
      return options.slice(0, 5);
    }

    return options
      .map((option) => ({
        ...option,
        score: scoreSearchOption(query, option.label)
      }))
      .filter((option) => option.score >= 0)
      .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label))
      .slice(0, 5);
  }, [options, query]);

  useEffect(() => {
    setQuery(selectedOption?.label || "");
  }, [selectedOption]);

  function handleChange(nextQuery) {
    setQuery(nextQuery);
    setIsOpen(true);

    const exactMatch = options.find((option) => option.label.toLowerCase() === nextQuery.toLowerCase());
    if (exactMatch) {
      onChange(exactMatch.value);
    }
  }

  function handleSelect(option) {
    setQuery(option.label);
    setIsOpen(false);
    onChange(option.value);
  }

  return (
    <div className="grid gap-2">
      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
        <input
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 120);
          }}
          placeholder={placeholder}
          className="h-12 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(20,28,28,0.96),rgba(10,14,14,0.98))] px-4 text-sm text-white outline-none transition duration-200 focus:border-emerald-300 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
        />
      </label>

      {isOpen && suggestions.length > 0 ? (
        <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,22,22,0.98),rgba(8,12,12,0.98))] shadow-[0_18px_34px_rgba(2,6,23,0.24)]">
          {suggestions.map((option) => (
            <button
              key={option.value}
              type="button"
              onMouseDown={() => handleSelect(option)}
              className="flex w-full items-center justify-between border-b border-white/6 px-4 py-3 text-left transition duration-200 last:border-b-0 hover:bg-white/[0.05]"
            >
              <span className="text-sm font-semibold text-white">{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MatchupPresetRail({ presets, onApply }) {
  if (!presets?.length) {
    return null;
  }

  return (
    <div className="grid gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Famous Matchups</p>
        <p className="mt-1 text-sm text-slate-300">Jump straight into iconic batter-vs-bowler rivalries.</p>
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {presets.map((preset) => (
          <motion.button
            key={preset.id}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => onApply(preset)}
            className="relative w-[220px] shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,26,26,0.98),rgba(10,14,14,0.98))] p-4 text-left shadow-[0_16px_32px_rgba(2,6,23,0.24)] transition duration-200 hover:-translate-y-0.5"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" />
            <p className="text-sm font-black text-white">{preset.label}</p>
            <p className="mt-2 text-sm leading-5 text-slate-300">{preset.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ComparisonRow({ row }) {
  const leftClass =
    row.winner === "left"
      ? "text-emerald-200"
      : row.winner === "right"
        ? "text-slate-500"
        : "text-slate-100";
  const rightClass =
    row.winner === "right"
      ? "text-amber-200"
      : row.winner === "left"
        ? "text-slate-500"
        : "text-slate-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="grid grid-cols-[minmax(0,1fr)_76px_minmax(0,1fr)] items-center gap-2 rounded-[18px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,20,20,0.98),rgba(9,13,13,0.98))] px-2 py-3 shadow-[0_12px_22px_rgba(2,6,23,0.16)] sm:grid-cols-[minmax(0,1fr)_108px_minmax(0,1fr)] sm:px-3"
    >
      <div className={`min-w-0 rounded-[14px] border border-emerald-400/14 bg-emerald-500/8 px-2 py-3 text-center text-sm font-black transition sm:px-3 sm:text-base ${leftClass}`}>
        {row.leftDisplayValue}
      </div>
      <div className="px-2 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-300 sm:text-[10px] sm:tracking-[0.22em]">
          {row.label}
        </p>
      </div>
      <div className={`min-w-0 rounded-[14px] border border-amber-400/14 bg-amber-500/8 px-2 py-3 text-center text-sm font-black transition sm:px-3 sm:text-base ${rightClass}`}>
        {row.rightDisplayValue}
      </div>
    </motion.div>
  );
}

function MatchupStatRow({ row }) {
  const value = row.leftDisplayValue !== "--" ? row.leftDisplayValue : row.rightDisplayValue;
  const valueClass =
    row.winnerSide === "left"
      ? "text-emerald-200"
      : row.winnerSide === "right"
        ? "text-amber-200"
        : "text-white";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      whileTap={{ scale: 0.98 }}
      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-[18px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,20,20,0.98),rgba(9,13,13,0.98))] px-4 py-3 shadow-[0_12px_22px_rgba(2,6,23,0.16)] md:mx-auto md:max-w-[560px] md:grid-cols-[minmax(0,1fr)_112px]"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300 md:text-xs">{row.label}</p>
      <p className={`text-right text-lg font-black tracking-tight sm:text-xl ${valueClass}`}>{value}</p>
    </motion.div>
  );
}

function MatchupCard({ title, tone }) {
  const toneStyles =
    tone === "emerald"
      ? {
          shell:
            "border-emerald-400/18 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_32%),linear-gradient(180deg,rgba(16,24,22,0.98),rgba(10,15,15,0.98))]",
          accent: "from-emerald-400/70 to-emerald-200/10",
          glow: "shadow-[0_24px_50px_rgba(16,185,129,0.12)]"
        }
      : {
          shell:
            "border-amber-400/18 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.24),transparent_32%),linear-gradient(180deg,rgba(19,18,14,0.98),rgba(13,12,10,0.98))]",
          accent: "from-amber-400/70 to-amber-200/10",
          glow: "shadow-[0_24px_50px_rgba(245,158,11,0.12)]"
        };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.24 }}
      className={`relative overflow-hidden rounded-[30px] border p-5 ${toneStyles.shell} ${toneStyles.glow}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${toneStyles.accent}`} />
      <div className="flex min-h-[108px] min-w-0 items-center justify-center text-center sm:min-h-[124px]">
        <p className="break-words text-lg font-black uppercase leading-tight text-white sm:text-2xl">
          {title || "Select option"}
        </p>
      </div>
    </motion.div>
  );
}

export default function BattlePanel({
  mode,
  onModeChange,
  yearCompareMode,
  yearCompareTabs,
  onYearCompareModeChange,
  selectorConfig,
  battle,
  battlePresets,
  onApplyBattlePreset
}) {
  const isMatchupMode = mode === "batterVsBowler";

  return (
    <div className="grid gap-5">
      <PillTabs items={battleModes} activeKey={mode} onChange={onModeChange} />

      {mode === "yearVsYear" ? (
        <PillTabs items={yearCompareTabs} activeKey={yearCompareMode} onChange={onYearCompareModeChange} />
      ) : null}

      {isMatchupMode ? <MatchupPresetRail presets={battlePresets} onApply={onApplyBattlePreset} /> : null}

      <div className="grid gap-3">
        {selectorConfig.map((selector) => (
          selector.searchable ? (
            <SearchableBattleSelect
              key={selector.id}
              label={selector.label}
              value={selector.value}
              options={selector.options}
              onChange={selector.onChange}
              placeholder={selector.placeholder || "Search player"}
            />
          ) : (
            <BattleSelect
              key={selector.id}
              label={selector.label}
              value={selector.value}
              options={selector.options}
              onChange={selector.onChange}
            />
          )
        ))}
      </div>

      <div className="grid gap-4">
        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,19,20,0.98),rgba(7,10,11,0.98))] shadow-[0_28px_56px_rgba(2,6,23,0.34)]">
          <div className="border-b border-white/6 bg-[radial-gradient(circle_at_left,rgba(16,185,129,0.2),transparent_28%),radial-gradient(circle_at_right,rgba(245,158,11,0.18),transparent_28%),linear-gradient(90deg,rgba(16,185,129,0.18),rgba(255,255,255,0.03),rgba(245,158,11,0.18))] px-5 py-4">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-300">
              {isMatchupMode ? "Head to Head Matchup" : "Battle Breakdown"}
            </p>
            <p className="mt-2 text-lg font-black text-white [text-shadow:0_10px_24px_rgba(2,6,23,0.28)]">{battle.headline}</p>
          </div>

          <div className="grid gap-4 p-4 md:p-5">
            <div className="grid grid-cols-2 gap-3">
              <MatchupCard
                title={battle.leftEntity?.displayName || battle.leftEntity?.label}
                tone="emerald"
              />
              <MatchupCard
                title={battle.rightEntity?.displayName || battle.rightEntity?.label}
                tone="amber"
              />
            </div>

            {isMatchupMode ? (
              <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,18,0.98),rgba(7,11,11,0.98))]">
                <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center border-b border-white/8 px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300 md:mx-auto md:max-w-[560px] md:grid-cols-[minmax(0,1fr)_112px] md:px-0 md:text-xs">
                  <div>Matchup Stat</div>
                  <div className="text-right">Value</div>
                </div>
                <div className="grid gap-2 p-2">
                {battle.rows.map((row) => (
                  <MatchupStatRow key={row.key} row={row} />
                ))}
              </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,18,0.98),rgba(7,11,11,0.98))]">
                <div className="grid grid-cols-[minmax(0,1fr)_76px_minmax(0,1fr)] items-center border-b border-white/8 px-2 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-300 sm:grid-cols-[minmax(0,1fr)_108px_minmax(0,1fr)] sm:px-3 sm:text-[10px] sm:tracking-[0.22em]">
                  <div className="text-center text-emerald-200">Challenger</div>
                  <div className="text-center">Stat</div>
                  <div className="text-center text-amber-200">Opponent</div>
                </div>
                <div className="grid gap-2 p-2">
                  {battle.rows.map((row) => (
                    <ComparisonRow key={row.key} row={row} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
