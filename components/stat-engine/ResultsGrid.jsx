"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

function formatValue(value, digits = 2) {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return String(value);
    }

    return value.toFixed(digits);
  }

  return value;
}

function formatBestBowling(record) {
  if (!record.bestBowlingWickets && !record.bestBowlingRuns) {
    return "--";
  }

  return `${record.bestBowlingWickets ?? 0}/${record.bestBowlingRuns ?? 0}`;
}

function getRecordKey(record, context) {
  if (context === "battingInnings" || context === "bowlingInnings") {
    return `${record.playerId}:${record.matchId}:${record.inningsKey || record.inningsNumber}`;
  }

  if (context === "matchup") {
    return `${record.batterId}:${record.bowlerId}`;
  }

  return `${record.playerId}:${record.season || "career"}:${record.teamCode || "all"}`;
}

function getMetaLabel(record) {
  const parts = [record.role || "record"];

  if (record.season) {
    parts.push(String(record.season));
  }

  if (record.teamCode) {
    parts.push(record.teamCode);
  }

  return parts.join(" • ");
}

function buildSummary(record, context) {
  if (context === "battingInnings") {
    return {
      eyebrow: "Best batting innings",
      hero: { label: "Runs", value: formatValue(record.runs, 0) },
      support: [
        { label: "Balls", value: formatValue(record.ballsFaced, 0) },
        { label: "Strike Rate", value: formatValue(record.strikeRate) }
      ]
    };
  }

  if (context === "bowlingInnings") {
    return {
      eyebrow: "Best bowling innings",
      hero: { label: "Figure", value: `${formatValue(record.wickets, 0)}/${formatValue(record.runsConceded, 0)}` },
      support: [
        { label: "Overs", value: formatValue(record.oversBowled) },
        { label: "Economy", value: formatValue(record.economy) }
      ]
    };
  }

  if (record.role === "bowler") {
    return {
      eyebrow: "Bowling profile",
      hero: { label: "Wickets", value: formatValue(record.wickets, 0) },
      support: [
        { label: "Economy", value: formatValue(record.economy) },
        { label: "Bowling Avg", value: formatValue(record.bowlingAverage) }
      ]
    };
  }

  if (record.role === "all_rounder") {
    return {
      eyebrow: "All-round profile",
      hero: { label: "Runs", value: formatValue(record.runs, 0) },
      support: [
        { label: "Wickets", value: formatValue(record.wickets, 0) },
        { label: "Strike Rate", value: formatValue(record.strikeRate) }
      ]
    };
  }

  return {
    eyebrow: "Batting profile",
    hero: { label: "Runs", value: formatValue(record.runs, 0) },
    support: [
      { label: "Strike Rate", value: formatValue(record.strikeRate) },
      { label: "Bat Avg", value: formatValue(record.battingAverage) }
    ]
  };
}

function buildSections(record, context) {
  if (context === "battingInnings") {
    return [
      {
        title: "Innings Detail",
        rows: [
          { label: "Runs", value: formatValue(record.runs, 0) },
          { label: "Balls Faced", value: formatValue(record.ballsFaced, 0) },
          { label: "Strike Rate", value: formatValue(record.strikeRate) },
          { label: "4s / 6s", value: `${formatValue(record.fours, 0)} / ${formatValue(record.sixes, 0)}` },
          { label: "Boundary %", value: `${formatValue(record.boundaryPercentage)}%` }
        ]
      }
    ];
  }

  if (context === "bowlingInnings") {
    return [
      {
        title: "Innings Detail",
        rows: [
          { label: "Figure", value: `${formatValue(record.wickets, 0)}/${formatValue(record.runsConceded, 0)}` },
          { label: "Overs", value: formatValue(record.oversBowled) },
          { label: "Economy", value: formatValue(record.economy) },
          { label: "Dot Balls", value: formatValue(record.dotBalls, 0) },
          { label: "Opponent", value: record.opponentTeamCode || "--" }
        ]
      }
    ];
  }

  if (record.role === "bowler") {
    return [
      {
        title: "Bowling",
        rows: [
          { label: "Wickets", value: formatValue(record.wickets, 0) },
          { label: "Economy", value: formatValue(record.economy) },
          { label: "Bowling Avg", value: formatValue(record.bowlingAverage) },
          { label: "Bowling SR", value: formatValue(record.strikeRateBowling) },
          { label: "Dot Balls", value: formatValue(record.dotBalls, 0) },
          { label: "Best Bowling", value: formatBestBowling(record) }
        ]
      },
      {
        title: "Usage",
        rows: [
          { label: "Matches", value: formatValue(record.matches, 0) },
          { label: "Overs", value: formatValue(record.oversBowled) },
          { label: "Innings Bowled", value: formatValue(record.inningsBowled, 0) },
          { label: "4W / 5W", value: `${formatValue(record.fourWicketHauls, 0)} / ${formatValue(record.fiveWicketHauls, 0)}` }
        ]
      }
    ];
  }

  if (record.role === "all_rounder") {
    return [
      {
        title: "Batting",
        rows: [
          { label: "Runs", value: formatValue(record.runs, 0) },
          { label: "Strike Rate", value: formatValue(record.strikeRate) },
          { label: "Bat Avg", value: formatValue(record.battingAverage) },
          { label: "Highest Score", value: formatValue(record.highestScore, 0) },
          { label: "50s / 100s", value: `${formatValue(record.fifties, 0)} / ${formatValue(record.hundreds, 0)}` }
        ]
      },
      {
        title: "Bowling",
        rows: [
          { label: "Wickets", value: formatValue(record.wickets, 0) },
          { label: "Economy", value: formatValue(record.economy) },
          { label: "Bowling Avg", value: formatValue(record.bowlingAverage) },
          { label: "Bowling SR", value: formatValue(record.strikeRateBowling) },
          { label: "Best Bowling", value: formatBestBowling(record) }
        ]
      }
    ];
  }

  return [
    {
      title: "Batting",
      rows: [
        { label: "Runs", value: formatValue(record.runs, 0) },
        { label: "Strike Rate", value: formatValue(record.strikeRate) },
        { label: "Bat Avg", value: formatValue(record.battingAverage) },
        { label: "Highest Score", value: formatValue(record.highestScore, 0) },
        { label: "50s / 100s", value: `${formatValue(record.fifties, 0)} / ${formatValue(record.hundreds, 0)}` }
      ]
    },
    {
      title: "Volume",
      rows: [
        { label: "Matches", value: formatValue(record.matches, 0) },
        { label: "Innings", value: formatValue(record.innings, 0) },
        { label: "Balls Faced", value: formatValue(record.ballsFaced, 0) },
        { label: "Not Outs", value: formatValue(record.notOuts, 0) },
        { label: "Ducks", value: formatValue(record.ducks, 0) }
      ]
    }
  ];
}

function buildPrimaryStats(record, context) {
  if (context === "battingInnings") {
    return [
      { label: "Runs", value: formatValue(record.runs, 0) },
      { label: "Balls", value: formatValue(record.ballsFaced, 0) },
      { label: "SR", value: formatValue(record.strikeRate) },
      { label: "4s/6s", value: `${formatValue(record.fours, 0)}/${formatValue(record.sixes, 0)}` }
    ];
  }

  if (context === "bowlingInnings") {
    return [
      { label: "Figure", value: `${formatValue(record.wickets, 0)}/${formatValue(record.runsConceded, 0)}` },
      { label: "Overs", value: formatValue(record.oversBowled) },
      { label: "Econ", value: formatValue(record.economy) },
      { label: "Dots", value: formatValue(record.dotBalls, 0) }
    ];
  }

  if (record.role === "bowler") {
    return [
      { label: "Wkts", value: formatValue(record.wickets, 0) },
      { label: "Econ", value: formatValue(record.economy) },
      { label: "Bowl SR", value: formatValue(record.strikeRateBowling) },
      { label: "Dot %", value: `${formatValue(getDotPercentage(record))}%` }
    ];
  }

  if (record.role === "all_rounder") {
    return [
      { label: "Runs", value: formatValue(record.runs, 0) },
      { label: "Wkts", value: formatValue(record.wickets, 0) },
      { label: "SR", value: formatValue(record.strikeRate) },
      { label: "Econ", value: formatValue(record.economy) }
    ];
  }

  return [
    { label: "Runs", value: formatValue(record.runs, 0) },
    { label: "Avg", value: formatValue(record.battingAverage) },
    { label: "SR", value: formatValue(record.strikeRate) },
    { label: "4s/6s", value: `${formatValue(record.fours, 0)}/${formatValue(record.sixes, 0)}` }
  ];
}

function getMetricCardItem(record, metricKey) {
  if (!metricKey) {
    return null;
  }

  const metricItems = {
    runs: { label: "Runs", value: formatValue(record.runs, 0) },
    wickets: { label: "Wkts", value: formatValue(record.wickets, 0) },
    strikeRate: { label: "SR", value: formatValue(record.strikeRate) },
    battingAverage: { label: "Avg", value: formatValue(record.battingAverage) },
    bowlingAverage: { label: "Bowl Avg", value: formatValue(record.bowlingAverage) },
    strikeRateBowling: { label: "Bowl SR", value: formatValue(record.strikeRateBowling) },
    economy: { label: "Econ", value: formatValue(record.economy) },
    highestScore: { label: "HS", value: formatValue(record.highestScore, 0) },
    fours: { label: "4s", value: formatValue(record.fours, 0) },
    sixes: { label: "6s", value: formatValue(record.sixes, 0) },
    notOuts: { label: "NO", value: formatValue(record.notOuts, 0) },
    fifties: { label: "50s", value: formatValue(record.fifties, 0) },
    hundreds: { label: "100s", value: formatValue(record.hundreds, 0) },
    dotBalls: { label: "Dots", value: formatValue(record.dotBalls, 0) },
    ballsFaced: { label: "Balls", value: formatValue(record.ballsFaced, 0) },
    oversBowled: { label: "Overs", value: formatValue(record.oversBowled) },
    fourWicketHauls: { label: "4W", value: formatValue(record.fourWicketHauls, 0) },
    fiveWicketHauls: { label: "5W", value: formatValue(record.fiveWicketHauls, 0) }
  };

  if (metricKey === "boundaryPercentage") {
    return { label: "Bdy %", value: `${formatValue(getBoundaryPercentage(record))}%` };
  }

  if (metricKey === "dotPercentage") {
    return { label: "Dot %", value: `${formatValue(getDotPercentage(record))}%` };
  }

  if (metricKey === "foursSixes") {
    return { label: "4s/6s", value: `${formatValue(record.fours, 0)}/${formatValue(record.sixes, 0)}` };
  }

  if (metricKey === "fiftiesHundreds") {
    return { label: "50s/100s", value: `${formatValue(record.fifties, 0)}/${formatValue(record.hundreds, 0)}` };
  }

  if (metricKey === "bowlingFigure") {
    return { label: "Figure", value: `${formatValue(record.wickets, 0)}/${formatValue(record.runsConceded, 0)}` };
  }

  return metricItems[metricKey] || null;
}

function injectMetricItem(items, metricItem) {
  if (!metricItem || metricItem.value === "--") {
    return items;
  }

  return [metricItem, ...items.filter((item) => item.label !== metricItem.label)];
}

function buildSecondaryStats(record, context) {
  if (context === "battingInnings") {
    return [
      { label: "Boundary %", value: `${formatValue(record.boundaryPercentage)}%` },
      { label: "Season", value: formatValue(record.season, 0) },
      { label: "Team", value: record.teamCode || "--" }
    ];
  }

  if (context === "bowlingInnings") {
    return [
      { label: "Season", value: formatValue(record.season, 0) },
      { label: "Team", value: record.teamCode || "--" },
      { label: "Opponent", value: record.opponentTeamCode || "--" }
    ];
  }

  if (record.role === "bowler") {
    return [
      { label: "Matches", value: formatValue(record.matches, 0) },
      { label: "Bowl Avg", value: formatValue(record.bowlingAverage) },
      { label: "Best", value: formatBestBowling(record) }
    ];
  }

  if (record.role === "all_rounder") {
    return [
      { label: "Matches", value: formatValue(record.matches, 0) },
      { label: "Highest", value: formatValue(record.highestScore, 0) },
      { label: "50s/100s", value: `${formatValue(record.fifties, 0)}/${formatValue(record.hundreds, 0)}` }
    ];
  }

  return [
    { label: "Matches", value: formatValue(record.matches, 0) },
    { label: "Highest", value: formatValue(record.highestScore, 0) },
    { label: "Boundary %", value: `${formatValue(getBoundaryPercentage(record))}%` }
  ];
}

function SummaryRail({ summary, badge, badgeSubline = null }) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-emerald-300/12 bg-[linear-gradient(135deg,rgba(19,43,38,0.92),rgba(10,19,18,0.98))] px-3 py-4 shadow-[0_18px_36px_rgba(2,6,23,0.26)] sm:p-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/30 to-transparent" />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/70">{summary.eyebrow}</p>
          <div className="mt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{summary.hero.label}</p>
            <p className="mt-0.5 text-[1.7rem] font-black tracking-tight text-white sm:mt-1 sm:text-3xl">{summary.hero.value}</p>
          </div>
        </div>
        <div className="shrink-0 rounded-[18px] border border-amber-300/16 bg-amber-300/10 px-2.5 py-1.5 text-center text-[11px] font-semibold text-amber-100 sm:px-3 sm:text-xs">
          <p>{badge}</p>
          {badgeSubline ? <p className="mt-0.5 text-[11px] font-black uppercase tracking-[0.14em] text-amber-100">{badgeSubline}</p> : null}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {summary.support.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/6 bg-white/[0.04] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:px-3 sm:py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
            <p className="mt-0.5 text-sm font-bold text-white sm:mt-1 sm:text-base">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatSection({ section }) {
  return (
    <section className="rounded-[22px] border border-white/8 bg-white/[0.03] px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-4">
      <div className="border-b border-white/8 pb-2.5 sm:pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{section.title}</p>
      </div>

      <div className="mt-1.5 divide-y divide-white/6 sm:mt-2">
        {section.rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5 sm:gap-4 sm:py-3">
            <p className="text-sm font-medium text-slate-300">{row.label}</p>
            <p className="text-right text-sm font-bold text-white">{row.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResultCard({ record, context, preferredMetricKey = null, cardIndex = null }) {
  const summary = buildSummary(record, context);
  const sections = buildSections(record, context);
  const metricItem = getMetricCardItem(record, preferredMetricKey);
  const enhancedSummary = metricItem
    ? {
        ...summary,
        hero: metricItem,
        support: injectMetricItem(summary.support, metricItem).slice(0, summary.support.length)
      }
    : summary;
  const badge =
    context === "battingInnings" || context === "bowlingInnings"
      ? `${record.season} • ${record.teamCode}`
      : `${formatValue(record.matches, 0)} matches`;
  const badgeSubline = cardIndex !== null ? `#${cardIndex + 1}` : null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="mx-auto w-full overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,18,18,0.98),rgba(6,11,11,0.98))] px-3 py-4 shadow-[0_24px_48px_rgba(2,6,23,0.34)] sm:p-4"
    >
      <div className="mb-3 sm:mb-4">
        <p className="text-lg font-black tracking-tight text-white">{record.displayName}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{getMetaLabel(record)}</p>
      </div>

      <div className="grid gap-4">
        <SummaryRail summary={enhancedSummary} badge={badge} badgeSubline={badgeSubline} />
        {sections.map((section) => (
          <StatSection key={section.title} section={section} />
        ))}
      </div>
    </motion.article>
  );
}

function CompactStat({ item }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
      <p className="mt-1 text-base font-black text-white">{item.value}</p>
    </div>
  );
}

function CompactResultCard({ record, context, cardIndex, totalCards, preferredMetricKey = null }) {
  const [showDetails, setShowDetails] = useState(false);
  const primaryStats = injectMetricItem(
    buildPrimaryStats(record, context),
    getMetricCardItem(record, preferredMetricKey)
  ).slice(0, 4);
  const secondaryStats = buildSecondaryStats(record, context).slice(0, 3);
  const badge =
    context === "battingInnings" || context === "bowlingInnings"
      ? `${record.season} • ${record.teamCode}`
      : `${formatValue(record.matches, 0)} matches`;
  const rankLabel = `#${cardIndex + 1}`;

  useEffect(() => {
    setShowDetails(false);
  }, [record]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={`flex w-full max-w-[300px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,18,18,0.98),rgba(6,11,11,0.98))] shadow-[0_20px_36px_rgba(2,6,23,0.3)] ${
        showDetails ? "h-auto min-h-[68vh]" : "h-[68vh] max-h-[560px]"
      }`}
    >
      <div className="relative overflow-hidden border-b border-white/8 px-3 py-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/30 to-transparent" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/70">
              {context === "battingInnings" || context === "bowlingInnings" ? "Innings Card" : "Player Card"}
            </p>
            <h3 className="mt-1.5 break-words text-lg font-black leading-tight text-white">{record.displayName}</h3>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{getMetaLabel(record)}</p>
          </div>
          <div className="shrink-0 rounded-[18px] border border-amber-300/16 bg-amber-300/10 px-2 py-1.5 text-center text-[10px] font-semibold text-amber-100">
            <p>{badge}</p>
            <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100">{rankLabel}</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 py-3">
        <div className={`flex min-h-0 flex-1 flex-col gap-2.5 ${showDetails ? "" : "overflow-hidden"}`}>
          <div className="grid grid-cols-1 gap-2">
            {primaryStats.map((item) => (
              <CompactStat key={item.label} item={item} />
            ))}
          </div>

          <motion.div
            initial={false}
            animate={{
              height: showDetails ? "auto" : 0,
              opacity: showDetails ? 1 : 0
            }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="min-h-0 overflow-hidden"
          >
            <div className={`grid grid-cols-1 gap-2 rounded-[20px] border border-white/8 bg-white/[0.03] p-2.5 ${showDetails ? "" : "max-h-[22vh] overflow-y-auto overscroll-contain"}`}>
              {secondaryStats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.04] px-2 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-sm font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid shrink-0 gap-3">
          <div className="px-1 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Card {cardIndex + 1} / {totalCards}
          </div>
          <button
            type="button"
            onClick={() => setShowDetails((current) => !current)}
            className="h-10 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-100 transition duration-200 hover:border-emerald-300/30 hover:text-white active:scale-[0.98]"
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function getRoleProfile(records, override = null) {
  if (override) {
    return override;
  }

  if (!records.length) {
    return "mixed";
  }

  const roles = new Set(records.map((record) => record.role).filter(Boolean));

  if (roles.size === 1) {
    return Array.from(roles)[0];
  }

  return "mixed";
}

function getTableColumns(context, roleProfile = "mixed", preferredSortKey = null) {
  const nameOnlyBase = [
    { key: "displayName", label: "Player", mobileLabel: "Player", align: "left", sticky: true }
  ];
  const base = [
    ...nameOnlyBase,
    { key: "role", label: "Role", mobileLabel: "Role", align: "left" }
  ];
  const isMilestoneView = preferredSortKey === "fifties" || preferredSortKey === "hundreds";
  const isHighScoreView = preferredSortKey === "highestScore";
  const batterTailColumns = isMilestoneView
    ? [{ key: "fiftiesHundreds", label: "50s/100s", mobileLabel: "50/100" }]
    : [
        { key: "fiftiesHundreds", label: "50s/100s", mobileLabel: "50/100" },
        { key: "foursSixes", label: "4s/6s", mobileLabel: "4/6" },
        { key: "boundaryPercentage", label: "Boundary %", mobileLabel: "Bnd%" }
      ];

  if (context === "season") {
    if (roleProfile === "batter") {
      return [
        ...nameOnlyBase,
        { key: "season", label: "Season", mobileLabel: "Yr" },
        { key: "matches", label: "Matches", mobileLabel: "Mat" },
        { key: "runs", label: "Runs", mobileLabel: "Runs" },
        ...(isHighScoreView ? [{ key: "highestScore", label: "HS", mobileLabel: "HS" }] : []),
        { key: "strikeRate", label: "SR", mobileLabel: "SR" },
        ...batterTailColumns
      ];
    }

    if (roleProfile === "bowler") {
      return [
        ...nameOnlyBase,
        { key: "season", label: "Season", mobileLabel: "Yr" },
        { key: "matches", label: "Matches", mobileLabel: "Mat" },
        { key: "wickets", label: "Wkts", mobileLabel: "Wkts" },
        { key: "economy", label: "Econ", mobileLabel: "Econ" },
        { key: "strikeRateBowling", label: "Bowl SR", mobileLabel: "BSR" },
        { key: "dotBalls", label: "Dots", mobileLabel: "Dots" }
      ];
    }

    return [
      ...base,
      { key: "season", label: "Season" },
      { key: "matches", label: "Matches" },
      { key: "runs", label: "Runs" },
      { key: "strikeRate", label: "SR" },
      { key: "wickets", label: "Wkts" },
      { key: "economy", label: "Econ" }
    ];
  }

  if (context === "teamSeason") {
    if (roleProfile === "batter") {
      return [
        ...nameOnlyBase,
        { key: "teamCode", label: "Team", mobileLabel: "Tm", align: "left" },
        { key: "season", label: "Season", mobileLabel: "Yr" },
        { key: "matches", label: "Matches", mobileLabel: "Mat" },
        { key: "runs", label: "Runs", mobileLabel: "Runs" },
        ...(isHighScoreView ? [{ key: "highestScore", label: "HS", mobileLabel: "HS" }] : []),
        { key: "strikeRate", label: "SR", mobileLabel: "SR" },
        ...batterTailColumns
      ];
    }

    if (roleProfile === "bowler") {
      return [
        ...nameOnlyBase,
        { key: "teamCode", label: "Team", mobileLabel: "Tm", align: "left" },
        { key: "season", label: "Season", mobileLabel: "Yr" },
        { key: "matches", label: "Matches", mobileLabel: "Mat" },
        { key: "wickets", label: "Wkts", mobileLabel: "Wkts" },
        { key: "economy", label: "Econ", mobileLabel: "Econ" },
        { key: "strikeRateBowling", label: "Bowl SR", mobileLabel: "BSR" },
        { key: "dotPercentage", label: "Dot %", mobileLabel: "Dot%" }
      ];
    }

    return [
      ...base,
      { key: "teamCode", label: "Team", align: "left" },
      { key: "season", label: "Season" },
      { key: "matches", label: "Matches" },
      { key: "runs", label: "Runs" },
      { key: "strikeRate", label: "SR" },
      { key: "wickets", label: "Wkts" },
      { key: "economy", label: "Econ" }
    ];
  }

  if (context === "team") {
    if (roleProfile === "batter") {
      return [
        ...nameOnlyBase,
        { key: "teamCode", label: "Team", mobileLabel: "Tm", align: "left" },
        { key: "matches", label: "Matches", mobileLabel: "Mat" },
        { key: "runs", label: "Runs", mobileLabel: "Runs" },
        ...(isHighScoreView ? [{ key: "highestScore", label: "HS", mobileLabel: "HS" }] : []),
        { key: "strikeRate", label: "SR", mobileLabel: "SR" },
        ...batterTailColumns
      ];
    }

    if (roleProfile === "bowler") {
      return [
        ...nameOnlyBase,
        { key: "teamCode", label: "Team", mobileLabel: "Tm", align: "left" },
        { key: "matches", label: "Matches", mobileLabel: "Mat" },
        { key: "wickets", label: "Wkts", mobileLabel: "Wkts" },
        { key: "economy", label: "Econ", mobileLabel: "Econ" },
        { key: "strikeRateBowling", label: "Bowl SR", mobileLabel: "BSR" },
        { key: "dotPercentage", label: "Dot %", mobileLabel: "Dot%" }
      ];
    }

    return [
      ...base,
      { key: "teamCode", label: "Team", mobileLabel: "Tm", align: "left" },
      { key: "matches", label: "Matches", mobileLabel: "Mat" },
      { key: "runs", label: "Runs", mobileLabel: "Runs" },
      { key: "strikeRate", label: "SR", mobileLabel: "SR" },
      { key: "wickets", label: "Wkts", mobileLabel: "Wkts" },
      { key: "economy", label: "Econ", mobileLabel: "Econ" }
    ];
  }

  if (context === "battingInnings") {
    return [
      { key: "displayName", label: "Player", align: "left", sticky: true },
      { key: "season", label: "Season", mobileLabel: "Yr" },
      { key: "teamCode", label: "Team", mobileLabel: "Tm", align: "left" },
      { key: "runs", label: "Runs", mobileLabel: "Runs" },
      { key: "ballsFaced", label: "Balls", mobileLabel: "Balls" },
      { key: "strikeRate", label: "SR", mobileLabel: "SR" },
      { key: "foursSixes", label: "4s/6s", mobileLabel: "4/6" },
      { key: "boundaryPercentage", label: "Boundary %", mobileLabel: "Bnd%" }
    ];
  }

  if (context === "bowlingInnings") {
    return [
      { key: "displayName", label: "Player", align: "left", sticky: true },
      { key: "season", label: "Season", mobileLabel: "Yr" },
      { key: "teamCode", label: "Team", mobileLabel: "Tm", align: "left" },
      { key: "bowlingFigure", label: "Figure", mobileLabel: "Fig" },
      { key: "oversBowled", label: "Overs", mobileLabel: "Ov" },
      { key: "economy", label: "Econ", mobileLabel: "Econ" },
      { key: "dotBalls", label: "Dots", mobileLabel: "Dots" }
    ];
  }

  if ((context === "career" || context === "season" || context === "teamSeason" || context === "team") && roleProfile === "bowler") {
    return [
      ...nameOnlyBase,
      { key: "matches", label: "Matches", mobileLabel: "Mat" },
      { key: "wickets", label: "Wkts", mobileLabel: "Wkts" },
      { key: "economy", label: "Econ", mobileLabel: "Econ" },
      { key: "bowlingAverage", label: "Bowl Avg", mobileLabel: "Avg" },
      { key: "strikeRateBowling", label: "Bowl SR", mobileLabel: "BSR" },
      { key: "dotPercentage", label: "Dot %", mobileLabel: "Dot%" }
    ];
  }

  if ((context === "career" || context === "season" || context === "teamSeason" || context === "team") && roleProfile === "batter") {
    return [
      ...nameOnlyBase,
      { key: "matches", label: "Matches", mobileLabel: "Mat" },
      { key: "runs", label: "Runs", mobileLabel: "Runs" },
      { key: "battingAverage", label: "Avg", mobileLabel: "Avg" },
      ...(isHighScoreView ? [{ key: "highestScore", label: "HS", mobileLabel: "HS" }] : []),
      { key: "strikeRate", label: "SR", mobileLabel: "SR" },
      ...batterTailColumns
    ];
  }

  return [
    ...base,
    { key: "matches", label: "Matches" },
    { key: "runs", label: "Runs" },
    { key: "battingAverage", label: "Avg" },
    { key: "strikeRate", label: "SR" },
    { key: "wickets", label: "Wkts" },
    { key: "economy", label: "Econ" }
  ];
}

function getDefaultSortConfig(context, roleProfile = "mixed", preferredSort = null) {
  if (preferredSort?.key) {
    return {
      key: preferredSort.key,
      direction: preferredSort.direction || "desc"
    };
  }

  if (context === "battingInnings") {
    return { key: "runs", direction: "desc" };
  }

  if (context === "bowlingInnings") {
    return { key: "wickets", direction: "desc" };
  }

  if (roleProfile === "bowler") {
    return { key: "wickets", direction: "desc" };
  }

  if (context === "season" || context === "teamSeason" || context === "team") {
    return { key: "runs", direction: "desc" };
  }

  return { key: "runs", direction: "desc" };
}

function getSortOptions(context, roleProfile = "mixed") {
  if (context === "battingInnings") {
    return [
      { key: "runs", label: "Runs", direction: "desc" },
      { key: "strikeRate", label: "SR", direction: "desc" },
      { key: "boundaryPercentage", label: "Bdy %", direction: "desc" },
      { key: "ballsFaced", label: "Balls Faced", direction: "desc" }
    ];
  }

  if (context === "bowlingInnings") {
    return [
      { key: "wickets", label: "Wickets", direction: "desc" },
      { key: "economy", label: "Econ", direction: "asc" },
      { key: "dotBalls", label: "Dots", direction: "desc" },
      { key: "oversBowled", label: "Overs", direction: "desc" }
    ];
  }

  if (roleProfile === "bowler") {
    return [
      { key: "wickets", label: "Wickets", direction: "desc" },
      { key: "economy", label: "Econ", direction: "asc" },
      { key: "strikeRateBowling", label: "Bowl SR", direction: "asc" },
      { key: "dotPercentage", label: "Dot %", direction: "desc" }
    ];
  }

  if (roleProfile === "batter") {
    return [
      { key: "runs", label: "Runs", direction: "desc" },
      { key: "strikeRate", label: "SR", direction: "desc" },
      { key: "battingAverage", label: "Avg", direction: "desc" },
      { key: "boundaryPercentage", label: "Bdy %", direction: "desc" }
    ];
  }

  return [
    { key: "runs", label: "Runs", direction: "desc" },
    { key: "wickets", label: "Wickets", direction: "desc" },
    { key: "strikeRate", label: "SR", direction: "desc" },
    { key: "economy", label: "Econ", direction: "asc" }
  ];
}

function getMetricColumn(metricKey) {
  const metricColumns = {
    runs: { key: "runs", label: "Runs", mobileLabel: "Runs" },
    wickets: { key: "wickets", label: "Wkts", mobileLabel: "Wkts" },
    strikeRate: { key: "strikeRate", label: "SR", mobileLabel: "SR" },
    battingAverage: { key: "battingAverage", label: "Avg", mobileLabel: "Avg" },
    bowlingAverage: { key: "bowlingAverage", label: "Bowl Avg", mobileLabel: "Avg" },
    strikeRateBowling: { key: "strikeRateBowling", label: "Bowl SR", mobileLabel: "BSR" },
    economy: { key: "economy", label: "Econ", mobileLabel: "Econ" },
    highestScore: { key: "highestScore", label: "HS", mobileLabel: "HS" },
    fours: { key: "fours", label: "4s", mobileLabel: "4s" },
    sixes: { key: "sixes", label: "6s", mobileLabel: "6s" },
    notOuts: { key: "notOuts", label: "NO", mobileLabel: "NO" },
    fifties: { key: "fifties", label: "50s", mobileLabel: "50s" },
    hundreds: { key: "hundreds", label: "100s", mobileLabel: "100s" },
    dotBalls: { key: "dotBalls", label: "Dots", mobileLabel: "Dots" },
    fourWicketHauls: { key: "fourWicketHauls", label: "4W", mobileLabel: "4W" },
    fiveWicketHauls: { key: "fiveWicketHauls", label: "5W", mobileLabel: "5W" },
    ballsFaced: { key: "ballsFaced", label: "Balls", mobileLabel: "Balls" },
    oversBowled: { key: "oversBowled", label: "Overs", mobileLabel: "Ov" },
    boundaryPercentage: { key: "boundaryPercentage", label: "Bdy %", mobileLabel: "Bnd%" },
    dotPercentage: { key: "dotPercentage", label: "Dot %", mobileLabel: "Dot%" },
    foursSixes: { key: "foursSixes", label: "4s/6s", mobileLabel: "4/6" },
    fiftiesHundreds: { key: "fiftiesHundreds", label: "50s/100s", mobileLabel: "50/100" },
    bowlingFigure: { key: "bowlingFigure", label: "Figure", mobileLabel: "Fig" }
  };

  return metricColumns[metricKey] || null;
}

function injectMetricColumn(columns, preferredSortKey) {
  const metricColumn = getMetricColumn(preferredSortKey);

  if (!metricColumn || columns.some((column) => column.key === metricColumn.key)) {
    return columns;
  }

  const insertIndex = columns.findIndex((column) => column.key !== "displayName" && column.key !== "role");
  if (insertIndex === -1) {
    return [...columns, metricColumn];
  }

  return [...columns.slice(0, insertIndex), metricColumn, ...columns.slice(insertIndex)];
}

function ensureSortOption(sortOptions, sortConfig) {
  if (!sortConfig?.key) {
    return sortOptions;
  }

  const exists = sortOptions.some((option) => option.key === sortConfig.key);
  if (exists) {
    return sortOptions;
  }

  const fallbackLabels = {
    highestScore: "HS",
    battingAverage: "Avg",
    strikeRateBowling: "BSR",
    boundaryPercentage: "Bdy %",
    dotPercentage: "Dot %",
    fours: "4s",
    sixes: "6s",
    fifties: "50s",
    hundreds: "100s",
    notOuts: "NO",
    fourWicketHauls: "4W",
    fiveWicketHauls: "5W",
    dotBalls: "Dots",
    ballsFaced: "Balls",
    oversBowled: "Overs",
    runsConceded: "Runs Con",
    innings: "Inns",
    matches: "Mat",
    wickets: "Wkts",
    economy: "Econ",
    strikeRate: "SR",
    runs: "Runs"
  };

  return [
    {
      key: sortConfig.key,
      label: fallbackLabels[sortConfig.key] || sortConfig.key,
      direction: sortConfig.direction || "desc"
    },
    ...sortOptions
  ];
}

function getSortableValue(record, key) {
  if (key === "boundaryPercentage") {
    return getBoundaryPercentage(record) ?? Number.NEGATIVE_INFINITY;
  }

  if (key === "dotPercentage") {
    return getDotPercentage(record) ?? Number.NEGATIVE_INFINITY;
  }

  const value = record[key];

  if (value === null || value === undefined || value === "") {
    return key === "displayName" || key === "role" || key === "teamCode" ? "" : Number.NEGATIVE_INFINITY;
  }

  return value;
}

function sortRecords(records, context, sortKey, sortDirection) {
  const next = [...records];

  next.sort((left, right) => {
    if (sortKey === "wickets" && context === "bowlingInnings") {
      const wicketGap = (right.wickets || 0) - (left.wickets || 0);
      if (wicketGap !== 0) {
        return wicketGap;
      }

      const leftRuns = left.runsConceded ?? Number.POSITIVE_INFINITY;
      const rightRuns = right.runsConceded ?? Number.POSITIVE_INFINITY;
      if (leftRuns !== rightRuns) {
        return leftRuns - rightRuns;
      }
    }

    const leftValue = getSortableValue(left, sortKey);
    const rightValue = getSortableValue(right, sortKey);

    if (typeof leftValue === "string" || typeof rightValue === "string") {
      const result = String(leftValue).localeCompare(String(rightValue));
      return sortDirection === "asc" ? result : -result;
    }

    const result = leftValue === rightValue ? 0 : leftValue > rightValue ? 1 : -1;
    return sortDirection === "asc" ? result : -result;
  });

  return next;
}

function renderCell(record, column) {
  const value = record[column.key];

  if (column.key === "foursSixes") {
    return `${formatValue(record.fours, 0)}/${formatValue(record.sixes, 0)}`;
  }

  if (column.key === "fiftiesHundreds") {
    return `${formatValue(record.fifties, 0)}/${formatValue(record.hundreds, 0)}`;
  }

  if (column.key === "boundaryPercentage") {
    return `${formatValue(getBoundaryPercentage(record))}%`;
  }

  if (column.key === "dotPercentage") {
    return `${formatValue(getDotPercentage(record))}%`;
  }

  if (column.key === "displayName" || column.key === "role" || column.key === "teamCode") {
    return value || "--";
  }

  return formatValue(value);
}

function getBoundaryPercentage(record) {
  if (!record) {
    return null;
  }

  if (record.boundaryPercentage !== null && record.boundaryPercentage !== undefined) {
    return record.boundaryPercentage;
  }

  if (!record.runs) {
    return null;
  }

  return ((record.fours || 0) * 4 + (record.sixes || 0) * 6) * 100 / record.runs;
}

function getDotPercentage(record) {
  if (!record || !record.ballsBowled) {
    return null;
  }

  return ((record.dotBalls || 0) * 100) / record.ballsBowled;
}

function ResultTable({ context, records, preferredSort, roleProfileOverride }) {
  const PAGE_SIZE = 15;
  const roleProfile = useMemo(() => getRoleProfile(records, roleProfileOverride), [records, roleProfileOverride]);
  const columns = useMemo(
    () => injectMetricColumn(getTableColumns(context, roleProfile, preferredSort?.key || null), preferredSort?.key || null),
    [context, preferredSort?.key, roleProfile]
  );
  const defaultSort = useMemo(
    () => getDefaultSortConfig(context, roleProfile, preferredSort),
    [context, preferredSort, roleProfile]
  );
  const [sortKey, setSortKey] = useState(defaultSort.key);
  const [sortDirection, setSortDirection] = useState(defaultSort.direction);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSortKey(defaultSort.key);
    setSortDirection(defaultSort.direction);
  }, [defaultSort]);

  const sortedRecords = useMemo(() => {
    return sortRecords(records, context, sortKey, sortDirection);
  }, [records, sortDirection, sortKey]);
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / PAGE_SIZE));
  const pagedRecords = useMemo(
    () => sortedRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, sortedRecords]
  );

  useEffect(() => {
    setPage(1);
  }, [context, records, roleProfile, sortDirection, sortKey]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function handleSort(nextKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === "displayName" || nextKey === "role" || nextKey === "teamCode" ? "asc" : "desc");
  }

  const stickyHeaderClass =
    roleProfile === "batter"
      ? "bg-[linear-gradient(180deg,rgba(11,28,24,0.98),rgba(8,20,18,0.98))] shadow-[3px_0_8px_rgba(16,185,129,0.12)] sm:shadow-[6px_0_14px_rgba(16,185,129,0.16)]"
      : roleProfile === "bowler"
        ? "bg-[linear-gradient(180deg,rgba(28,23,12,0.98),rgba(20,16,8,0.98))] shadow-[3px_0_8px_rgba(245,158,11,0.12)] sm:shadow-[6px_0_14px_rgba(245,158,11,0.16)]"
        : "bg-[#0c1515] shadow-[3px_0_8px_rgba(2,6,23,0.12)] sm:shadow-[6px_0_14px_rgba(2,6,23,0.16)]";

  const stickyCellClass =
    roleProfile === "batter"
      ? "bg-[linear-gradient(180deg,rgba(8,19,17,0.98),rgba(6,14,13,0.98))] shadow-[3px_0_8px_rgba(16,185,129,0.1)] sm:shadow-[6px_0_14px_rgba(16,185,129,0.14)]"
      : roleProfile === "bowler"
        ? "bg-[linear-gradient(180deg,rgba(20,16,10,0.98),rgba(14,11,7,0.98))] shadow-[3px_0_8px_rgba(245,158,11,0.1)] sm:shadow-[6px_0_14px_rgba(245,158,11,0.14)]"
        : "bg-[#091111] shadow-[3px_0_8px_rgba(2,6,23,0.1)] sm:shadow-[6px_0_14px_rgba(2,6,23,0.14)]";

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,18,18,0.98),rgba(6,11,11,0.98))] shadow-[0_24px_48px_rgba(2,6,23,0.28)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${column.align === "left" ? "text-left" : "text-center"} ${
                    column.sticky ? `sticky left-0 z-20 ${stickyHeaderClass}` : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    className={`w-full px-1.5 py-2 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400 sm:px-4 sm:py-3 sm:text-[11px] sm:tracking-[0.2em] ${
                      column.align === "left" ? "text-left" : "text-center"
                    }`}
                  >
                    <span>
                      {column.label} {sortKey === column.key ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRecords.map((record) => (
              <tr
                key={getRecordKey(record, context)}
                className="border-b border-white/6 last:border-b-0"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-1.5 py-2 text-[11px] sm:px-4 sm:py-3 sm:text-sm ${
                      column.align === "left" ? "text-left text-slate-200" : "text-center text-white"
                    } ${column.sticky ? `sticky left-0 z-10 ${stickyCellClass}` : ""}`}
                  >
                    {renderCell(record, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-white/8 px-3 py-3 text-xs text-slate-400 sm:px-4">
        <span>
          Page {page} / {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="h-9 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-slate-200 transition duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:border-emerald-300/30 hover:text-white active:scale-[0.98]"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="h-9 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-slate-200 transition duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:border-emerald-300/30 hover:text-white active:scale-[0.98]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultsCarousel({ context, records, preferredMetricKey = null }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dragX = useMotionValue(0);
  const rotate = useTransform(dragX, [-140, 0, 140], [-7, 0, 7]);
  const scale = useTransform(dragX, [-140, 0, 140], [0.985, 1, 0.985]);

  useEffect(() => {
    setActiveIndex(0);
  }, [context, records]);

  function goToIndex(nextIndex) {
    const boundedIndex = Math.max(0, Math.min(records.length - 1, nextIndex));
    setActiveIndex(boundedIndex);
  }

  function handleDragEnd(_, info) {
    const swipePower = Math.abs(info.offset.x) * Math.abs(info.velocity.x);

    if (info.offset.x <= -70 || (info.velocity.x < -500 && swipePower > 12000)) {
      goToIndex(activeIndex + 1);
      dragX.set(0);
      return;
    }

    if (info.offset.x >= 70 || (info.velocity.x > 500 && swipePower > 12000)) {
      goToIndex(activeIndex - 1);
      dragX.set(0);
      return;
    }

    dragX.set(0);
  }

  const activeRecord = records[activeIndex];
  const visibleDots = records.length <= 12
    ? records.map((record, index) => ({ record, index }))
    : [
        { record: records[0], index: 0 },
        ...records
          .map((record, index) => ({ record, index }))
          .filter(({ index }) => Math.abs(index - activeIndex) <= 1 && index > 0 && index < records.length - 1),
        { record: records[records.length - 1], index: records.length - 1 }
      ].filter((item, itemIndex, array) => array.findIndex((entry) => entry.index === item.index) === itemIndex);

  return (
    <div className="grid w-full gap-4 overflow-x-hidden px-0 sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Card {activeIndex + 1} / {records.length}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToIndex(0)}
            disabled={activeIndex === 0}
            className="h-10 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:border-emerald-300/30 hover:text-white active:scale-[0.98]"
          >
            First
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,13,0.98),rgba(5,9,9,0.98))] py-3 sm:py-4 shadow-[0_24px_48px_rgba(2,6,23,0.26)]">
        <div className="mx-auto flex w-full items-center sm:max-w-[min(100%,960px)] sm:gap-3">
          <div className="shrink-0 sm:pl-0">
            <button
              type="button"
              onClick={() => goToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#091111]/85 text-xs font-black text-white backdrop-blur transition duration-200 disabled:cursor-not-allowed disabled:opacity-35 hover:border-emerald-300/40 hover:text-emerald-100 active:scale-[0.96] sm:h-10 sm:w-10 sm:text-base"
              aria-label="Previous card"
            >
              &lt;
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <motion.div
              key={getRecordKey(activeRecord, context)}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.22}
              dragMomentum={true}
              style={{ x: dragX, rotate, scale }}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, x: 32, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -32, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="w-full cursor-grab active:cursor-grabbing"
            >
              <div className="sm:hidden">
                <CompactResultCard
                  record={activeRecord}
                  context={context}
                  cardIndex={activeIndex}
                  totalCards={records.length}
                  preferredMetricKey={preferredMetricKey}
                />
              </div>
              <div className="hidden w-full min-w-0 sm:block">
                <div className="mx-auto w-full max-w-[860px]">
                  <ResultCard record={activeRecord} context={context} preferredMetricKey={preferredMetricKey} cardIndex={activeIndex} />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="shrink-0 pr-2 sm:pr-0">
            <button
              type="button"
              onClick={() => goToIndex(activeIndex + 1)}
              disabled={activeIndex === records.length - 1}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#091111]/85 text-xs font-black text-white backdrop-blur transition duration-200 disabled:cursor-not-allowed disabled:opacity-35 hover:border-amber-300/40 hover:text-amber-100 active:scale-[0.96] sm:h-10 sm:w-10 sm:text-base"
              aria-label="Next card"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {visibleDots.map(({ record, index }) => (
          <button
            key={`${getRecordKey(record, context)}-dot`}
            type="button"
            onClick={() => goToIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-200 ${
              index === activeIndex ? "w-8 bg-emerald-300" : "w-2.5 bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ResultsGrid({ context, records, preferredSort = null, roleProfileOverride = null }) {
  const CARD_BATCH_SIZE = 24;
  const [viewMode, setViewMode] = useState("table");
  const roleProfile = useMemo(() => getRoleProfile(records, roleProfileOverride), [records, roleProfileOverride]);
  const defaultSort = useMemo(
    () => getDefaultSortConfig(context, roleProfile, preferredSort),
    [context, preferredSort, roleProfile]
  );
  const sortOptions = useMemo(
    () => ensureSortOption(getSortOptions(context, roleProfile), defaultSort),
    [context, defaultSort, roleProfile]
  );
  const [selectedSortKey, setSelectedSortKey] = useState(defaultSort.key);

  useEffect(() => {
    setSelectedSortKey(defaultSort.key);
  }, [defaultSort]);

  const selectedSortOption = useMemo(
    () => sortOptions.find((option) => option.key === selectedSortKey) || sortOptions[0] || defaultSort,
    [defaultSort, selectedSortKey, sortOptions]
  );
  const dropdownPreferredSort = selectedSortOption
    ? { key: selectedSortOption.key, direction: selectedSortOption.direction || "desc" }
    : defaultSort;
  const carouselRecords = useMemo(
    () => sortRecords(records, context, dropdownPreferredSort.key, dropdownPreferredSort.direction),
    [context, dropdownPreferredSort.direction, dropdownPreferredSort.key, records]
  );
  const [cardBatch, setCardBatch] = useState(0);

  useEffect(() => {
    setCardBatch(0);
  }, [context, dropdownPreferredSort.direction, dropdownPreferredSort.key, records]);

  const totalCardBatches = Math.max(1, Math.ceil(carouselRecords.length / CARD_BATCH_SIZE));
  const limitedCarouselRecords = useMemo(
    () => carouselRecords.slice(cardBatch * CARD_BATCH_SIZE, (cardBatch + 1) * CARD_BATCH_SIZE),
    [cardBatch, carouselRecords]
  );

  if (records.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] px-5 py-8 text-center text-sm text-slate-400">
        No players match this filter
      </div>
    );
  }

  return (
    <div className="grid gap-4 overflow-x-hidden">
      <div className="flex items-center justify-end gap-2 overflow-x-auto pb-4 sm:pb-0">
        <div className="relative shrink-0">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-slate-200 sm:hidden">
              Sort
            </span>
          <select
            value={selectedSortKey}
            onChange={(event) => setSelectedSortKey(event.target.value)}
            className="h-9 w-[72px] rounded-full border border-white/10 bg-white/[0.03] px-2 pr-6 text-xs font-semibold text-transparent outline-none transition duration-200 focus:border-emerald-300 sm:h-10 sm:w-auto sm:min-w-[132px] sm:px-3 sm:pr-8 sm:text-sm sm:text-slate-200"
            aria-label="Sort results"
          >
            {sortOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          </div>
          <p className="absolute -bottom-4 left-2 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:hidden">
            {selectedSortOption?.label || "Runs"}
          </p>
        </div>
        <div className="inline-flex shrink-0 rounded-full border border-white/10 bg-white/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ${viewMode === "cards" ? "bg-emerald-100 text-emerald-950 shadow" : "text-slate-300 hover:text-white"}`}
          >
            🎴 Explore
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ${viewMode === "table" ? "bg-emerald-100 text-emerald-950 shadow" : "text-slate-300 hover:text-white"}`}
          >
            📊 Compare
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <ResultTable
          context={context}
          records={records}
          preferredSort={dropdownPreferredSort}
          roleProfileOverride={roleProfileOverride}
        />
      ) : (
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              Cards {cardBatch * CARD_BATCH_SIZE + 1}
              {" - "}
              {Math.min((cardBatch + 1) * CARD_BATCH_SIZE, carouselRecords.length)} of {carouselRecords.length}
            </span>
            {totalCardBatches > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCardBatch((current) => Math.max(0, current - 1))}
                  disabled={cardBatch === 0}
                  className="h-9 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-slate-200 transition duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:border-emerald-300/30 hover:text-white active:scale-[0.98]"
                >
                  Prev 24
                </button>
                <button
                  type="button"
                  onClick={() => setCardBatch((current) => Math.min(totalCardBatches - 1, current + 1))}
                  disabled={cardBatch === totalCardBatches - 1}
                  className="h-9 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-slate-200 transition duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:border-emerald-300/30 hover:text-white active:scale-[0.98]"
                >
                  Next 24
                </button>
              </div>
            ) : null}
          </div>
          <ResultsCarousel
            context={context}
            records={limitedCarouselRecords}
            preferredMetricKey={dropdownPreferredSort.key}
          />
        </div>
      )}
    </div>
  );
}
