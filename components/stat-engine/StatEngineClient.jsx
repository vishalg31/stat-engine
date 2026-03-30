"use client";

import { useEffect, useMemo, useState } from "react";
import { buildBattle } from "@/lib/stat-engine/battleEngine";
import { filterDataset } from "@/lib/stat-engine/filterEngine";
import { getFieldsForContext } from "@/lib/stat-engine/fieldRegistry";
import BattlePanel from "./BattlePanel";
import ConditionRow from "./ConditionRow";
import PillTabs from "./PillTabs";
import ResultsGrid from "./ResultsGrid";
import SectionCard from "./SectionCard";

const sectionTabs = [
  {
    key: "ask",
    label: "Ask Stats",
    activeHighlightClass:
      "border border-emerald-300/18 bg-[linear-gradient(180deg,rgba(22,163,74,0.28),rgba(14,116,59,0.24))] shadow-[0_10px_24px_rgba(16,185,129,0.16)]"
  },
  {
    key: "battle",
    label: "Battle Mode",
    activeHighlightClass:
      "border border-amber-300/24 bg-[linear-gradient(180deg,rgba(245,158,11,0.3),rgba(180,83,9,0.24))] shadow-[0_10px_24px_rgba(245,158,11,0.18)]"
  }
];

const QUICK_QUERY_PRESETS = [
  {
    id: "top-runs-2025",
    label: "Top Runs 2025",
    query: { entity: "batters", ranking: "most", metric: "runs", scope: "season", season: "2025", teamCode: "CSK", thresholdValue: "" }
  },
  {
    id: "all-time-wickets",
    label: "All-Time Wkts",
    query: { entity: "bowlers", ranking: "most", metric: "wickets", scope: "career", season: "2025", teamCode: "CSK", thresholdValue: "" }
  },
  {
    id: "best-sr-500",
    label: "Best SR 500+",
    query: { entity: "batters", ranking: "best", metric: "strikeRate", scope: "career", season: "2025", teamCode: "CSK", thresholdValue: "500" }
  },
  {
    id: "best-bowling-figures",
    label: "Best Bowling Fig",
    query: { entity: "bowlers", ranking: "best", metric: "bestBowlingFigure", scope: "career", season: "2025", teamCode: "CSK", thresholdValue: "" }
  }
];

const yearCompareTabs = [
  { key: "singlePlayer", label: "One Player" },
  { key: "twoPlayers", label: "Two Players" }
];

const contextTabs = [
  { key: "career", label: "All Time" },
  { key: "season", label: "By Season" },
  { key: "teamSeason", label: "By Team + Season" }
];

const guidedScopeOptions = [
  { value: "career", label: "All Time" },
  { value: "season", label: "Season" },
  { value: "team", label: "By Team" },
  { value: "teamSeason", label: "Team + Season" }
];

const guidedEntityOptions = [
  { value: "batters", label: "Batters" },
  { value: "bowlers", label: "Bowlers" },
  { value: "players", label: "Players" }
];

const DEFAULT_GUIDED_QUERY = {
  entity: "batters",
  ranking: "most",
  metric: "runs",
  scope: "career",
  season: "2025",
  teamCode: "CSK",
  thresholdValue: ""
};

function getBoundaryPercentage(record) {
  if (!record?.runs) {
    return null;
  }

  return ((((record.fours || 0) * 4) + ((record.sixes || 0) * 6)) * 100) / record.runs;
}

function getDotPercentage(record) {
  if (!record?.ballsBowled) {
    return null;
  }

  return ((record.dotBalls || 0) * 100) / record.ballsBowled;
}

function aggregateTeamTotals(teamSeasonStats) {
  const grouped = new Map();

  for (const record of teamSeasonStats) {
    const key = `${record.playerId}:${record.teamCode}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        ...record,
        season: undefined
      });
      continue;
    }

    existing.matches = (existing.matches || 0) + (record.matches || 0);
    existing.innings = (existing.innings || 0) + (record.innings || 0);
    existing.notOuts = (existing.notOuts || 0) + (record.notOuts || 0);
    existing.runs = (existing.runs || 0) + (record.runs || 0);
    existing.ballsFaced = (existing.ballsFaced || 0) + (record.ballsFaced || 0);
    existing.fours = (existing.fours || 0) + (record.fours || 0);
    existing.sixes = (existing.sixes || 0) + (record.sixes || 0);
    existing.fifties = (existing.fifties || 0) + (record.fifties || 0);
    existing.hundreds = (existing.hundreds || 0) + (record.hundreds || 0);
    existing.highestScore = Math.max(existing.highestScore || 0, record.highestScore || 0);
    existing.ducks = (existing.ducks || 0) + (record.ducks || 0);

    existing.inningsBowled = (existing.inningsBowled || 0) + (record.inningsBowled || 0);
    existing.oversBowled = (existing.oversBowled || 0) + (record.oversBowled || 0);
    existing.ballsBowled = (existing.ballsBowled || 0) + (record.ballsBowled || 0);
    existing.runsConceded = (existing.runsConceded || 0) + (record.runsConceded || 0);
    existing.wickets = (existing.wickets || 0) + (record.wickets || 0);
    existing.dotBalls = (existing.dotBalls || 0) + (record.dotBalls || 0);
    existing.fourWicketHauls = (existing.fourWicketHauls || 0) + (record.fourWicketHauls || 0);
    existing.fiveWicketHauls = (existing.fiveWicketHauls || 0) + (record.fiveWicketHauls || 0);
    existing.bestBowlingWickets = Math.max(existing.bestBowlingWickets || 0, record.bestBowlingWickets || 0);

    const existingBestRuns = existing.bestBowlingRuns ?? Number.POSITIVE_INFINITY;
    const nextBestRuns = record.bestBowlingRuns ?? Number.POSITIVE_INFINITY;
    if ((record.bestBowlingWickets || 0) > (existing.bestBowlingWickets || 0)) {
      existing.bestBowlingRuns = record.bestBowlingRuns;
    } else if ((record.bestBowlingWickets || 0) === (existing.bestBowlingWickets || 0) && nextBestRuns < existingBestRuns) {
      existing.bestBowlingRuns = record.bestBowlingRuns;
    }
  }

  return Array.from(grouped.values()).map((record) => {
    const dismissals = Math.max((record.innings || 0) - (record.notOuts || 0), 0);
    const strikeRate = record.ballsFaced ? (record.runs * 100) / record.ballsFaced : null;
    const battingAverage = dismissals > 0 ? record.runs / dismissals : null;
    const economy = record.oversBowled ? record.runsConceded / record.oversBowled : null;
    const bowlingAverage = record.wickets ? record.runsConceded / record.wickets : null;
    const strikeRateBowling = record.wickets ? record.ballsBowled / record.wickets : null;

    return {
      ...record,
      strikeRate,
      battingAverage,
      economy,
      bowlingAverage,
      strikeRateBowling
    };
  });
}

const GUIDED_METRICS = {
  batters: [
    {
      key: "runs",
      label: "Runs",
      rankingOptions: [{ value: "most", label: "Most" }],
      sortType: "number",
      sortField: "runs",
      sortDirection: "desc"
    },
    {
      key: "strikeRate",
      label: "Strike Rate",
      rankingOptions: [{ value: "best", label: "Best" }],
      sortType: "number",
      sortField: "strikeRate",
      sortDirection: "desc",
      threshold: { field: "runs", label: "Minimum Runs", defaultValue: 300 }
    },
    {
      key: "battingAverage",
      label: "Batting Average",
      rankingOptions: [{ value: "best", label: "Best" }],
      sortType: "number",
      sortField: "battingAverage",
      sortDirection: "desc",
      threshold: { field: "runs", label: "Minimum Runs", defaultValue: 300 }
    },
    {
      key: "highestScore",
      label: "Highest Score",
      rankingOptions: [{ value: "best", label: "Best" }],
      sortType: "number",
      sortField: "highestScore",
      sortDirection: "desc"
    },
    {
      key: "fours",
      label: "Fours",
      rankingOptions: [{ value: "most", label: "Most" }],
      sortType: "number",
      sortField: "fours",
      sortDirection: "desc"
    },
    {
      key: "sixes",
      label: "Sixes",
      rankingOptions: [{ value: "most", label: "Most" }],
      sortType: "number",
      sortField: "sixes",
      sortDirection: "desc"
    },
    {
      key: "boundaryPercentage",
      label: "Boundary %",
      rankingOptions: [{ value: "best", label: "Best" }],
      sortType: "number",
      sortDirection: "desc",
      getValue: getBoundaryPercentage,
      threshold: { field: "runs", label: "Minimum Runs", defaultValue: 300 }
    },
    {
      key: "notOuts",
      label: "Not Outs",
      rankingOptions: [{ value: "most", label: "Most" }],
      sortType: "number",
      sortField: "notOuts",
      sortDirection: "desc"
    },
    {
      key: "fifties",
      label: "Fifties",
      rankingOptions: [{ value: "most", label: "Most" }],
      sortType: "number",
      sortField: "fifties",
      sortDirection: "desc"
    },
    {
      key: "hundreds",
      label: "Hundreds",
      rankingOptions: [{ value: "most", label: "Most" }],
      sortType: "number",
      sortField: "hundreds",
      sortDirection: "desc"
    },
    {
      key: "bestBattingFigure",
      label: "Batting Figure",
      rankingOptions: [{ value: "best", label: "Best" }],
      dataset: "battingInnings",
      sortType: "number",
      sortField: "runs",
      sortDirection: "desc"
    }
  ],
  bowlers: [
    {
      key: "wickets",
      label: "Wickets",
      rankingOptions: [{ value: "most", label: "Most" }],
      sortType: "number",
      sortField: "wickets",
      sortDirection: "desc"
    },
    {
      key: "economy",
      label: "Economy",
      rankingOptions: [{ value: "best", label: "Best" }],
      sortType: "number",
      sortField: "economy",
      sortDirection: "asc",
      threshold: { field: "oversBowled", label: "Minimum Overs", defaultValue: 20 }
    },
    {
      key: "bowlingAverage",
      label: "Bowling Average",
      rankingOptions: [{ value: "best", label: "Best" }],
      sortType: "number",
      sortField: "bowlingAverage",
      sortDirection: "asc",
      threshold: { field: "wickets", label: "Minimum Wickets", defaultValue: 25 }
    },
    {
      key: "strikeRateBowling",
      label: "Bowling Strike Rate",
      rankingOptions: [{ value: "best", label: "Best" }],
      sortType: "number",
      sortField: "strikeRateBowling",
      sortDirection: "asc",
      threshold: { field: "wickets", label: "Minimum Wickets", defaultValue: 25 }
    },
    {
      key: "dotBalls",
      label: "Dot Balls",
      rankingOptions: [{ value: "most", label: "Most" }],
      sortType: "number",
      sortField: "dotBalls",
      sortDirection: "desc"
    },
    {
      key: "dotPercentage",
      label: "Dot %",
      rankingOptions: [{ value: "best", label: "Best" }],
      sortType: "number",
      sortDirection: "desc",
      getValue: getDotPercentage,
      threshold: { field: "oversBowled", label: "Minimum Overs", defaultValue: 20 }
    },
    {
      key: "fourWicketHauls",
      label: "4-Wicket Hauls",
      rankingOptions: [{ value: "most", label: "Most" }],
      sortType: "number",
      sortField: "fourWicketHauls",
      sortDirection: "desc"
    },
    {
      key: "fiveWicketHauls",
      label: "5-Wicket Hauls",
      rankingOptions: [{ value: "most", label: "Most" }],
      sortType: "number",
      sortField: "fiveWicketHauls",
      sortDirection: "desc"
    },
    {
      key: "bestBowlingFigure",
      label: "Bowling Figure",
      rankingOptions: [{ value: "best", label: "Best" }],
      dataset: "bowlingInnings",
      sortType: "bestBowlingFigure",
      sortDirection: "desc"
    }
  ],
  players: [
    {
      key: "runs",
      label: "Runs",
      rankingOptions: [{ value: "most", label: "Most" }],
      sortType: "number",
      sortField: "runs",
      sortDirection: "desc"
    },
    {
      key: "wickets",
      label: "Wickets",
      rankingOptions: [{ value: "most", label: "Most" }],
      sortType: "number",
      sortField: "wickets",
      sortDirection: "desc"
    },
    {
      key: "strikeRate",
      label: "Strike Rate",
      rankingOptions: [{ value: "best", label: "Best" }],
      sortType: "number",
      sortField: "strikeRate",
      sortDirection: "desc",
      threshold: { field: "runs", label: "Minimum Runs", defaultValue: 300 }
    },
    {
      key: "economy",
      label: "Economy",
      rankingOptions: [{ value: "best", label: "Best" }],
      sortType: "number",
      sortField: "economy",
      sortDirection: "asc",
      threshold: { field: "oversBowled", label: "Minimum Overs", defaultValue: 20 }
    },
    {
      key: "bestBattingFigure",
      label: "Batting Figure",
      rankingOptions: [{ value: "best", label: "Best" }],
      dataset: "battingInnings",
      sortType: "number",
      sortField: "runs",
      sortDirection: "desc"
    },
    {
      key: "bestBowlingFigure",
      label: "Bowling Figure",
      rankingOptions: [{ value: "best", label: "Best" }],
      dataset: "bowlingInnings",
      sortType: "bestBowlingFigure",
      sortDirection: "desc"
    }
  ]
};

const FAMOUS_MATCHUP_PAIRS = [
  { id: "kohli-bumrah", batterName: "Virat Kohli", bowlerName: "Jasprit Bumrah", label: "Kohli vs Bumrah" },
  { id: "rohit-narine", batterName: "Rohit Sharma", bowlerName: "Sunil Narine", label: "Rohit vs Narine" },
  { id: "dhoni-bhuvneshwar", batterName: "MS Dhoni", bowlerName: "Bhuvneshwar Kumar", label: "Dhoni vs Bhuvneshwar" },
  { id: "warner-bumrah", batterName: "David Warner", bowlerName: "Jasprit Bumrah", label: "Warner vs Bumrah" }
];

function getDefaultCondition(context) {
  const firstField = getFieldsForContext(context)[0];
  return {
    field: firstField.key,
    operator: firstField.operators[0],
    value: firstField.type === "enum" ? firstField.options?.[0] || "" : ""
  };
}

function toSelectOptions(records) {
  return records.map((record) => ({
    value: record.playerId,
    label: record.displayName
  }));
}

function getMetricOptions(entity) {
  return GUIDED_METRICS[entity] || [];
}

function renderPreviewText(preview) {
  const segments = preview.split(/(\b(?:all time|\d{4}|minimum\s+\d+|\d+)\b|most|best|highest|lowest|runs|wickets|strike rate|batting average|bowling average|economy|bowling strike rate|dot %|dot balls|boundary %|fours|sixes|not outs|fifties|hundreds|highest score|batting figure|bowling figure)/gi);

  return segments
    .filter(Boolean)
    .map((segment, index) => {
      const normalized = segment.trim().toLowerCase();
      const isHighlight =
        [
          "most",
          "best",
          "highest",
          "lowest",
          "runs",
          "wickets",
          "strike rate",
          "batting average",
          "bowling average",
          "economy",
          "bowling strike rate",
          "dot %",
          "dot balls",
          "boundary %",
          "fours",
          "sixes",
          "not outs",
          "fifties",
          "hundreds",
          "highest score",
          "batting figure",
          "bowling figure"
        ].includes(normalized) ||
        normalized === "all time" ||
        /^\d{4}$/.test(normalized) ||
        /^minimum\s+\d+$/.test(normalized) ||
        /^\d+$/.test(normalized);

      if (!isHighlight) {
        return <span key={`${segment}-${index}`}>{segment}</span>;
      }

      return (
        <span
          key={`${segment}-${index}`}
          className="rounded-full bg-emerald-400/10 px-1.5 py-0.5 font-semibold text-emerald-100 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.14)]"
        >
          {segment}
        </span>
      );
    });
}

function getMetricConfig(entity, metricKey) {
  return getMetricOptions(entity).find((metric) => metric.key === metricKey) || getMetricOptions(entity)[0];
}

function sortGuidedResults(records, metricConfig) {
  const nextRecords = [...records];

  if (!metricConfig) {
    return nextRecords;
  }

  nextRecords.sort((left, right) => {
    if (metricConfig.sortType === "bestBowlingFigure") {
      const rightWickets = right.wickets || right.bestBowlingWickets || 0;
      const leftWickets = left.wickets || left.bestBowlingWickets || 0;
      const wicketGap = rightWickets - leftWickets;
      if (wicketGap !== 0) {
        return wicketGap;
      }

      const leftRuns = left.runsConceded ?? left.bestBowlingRuns ?? Number.POSITIVE_INFINITY;
      const rightRuns = right.runsConceded ?? right.bestBowlingRuns ?? Number.POSITIVE_INFINITY;
      return leftRuns - rightRuns;
    }

    const leftValue = metricConfig.getValue ? metricConfig.getValue(left) : left[metricConfig.sortField];
    const rightValue = metricConfig.getValue ? metricConfig.getValue(right) : right[metricConfig.sortField];
    const safeLeftValue = leftValue ?? Number.NEGATIVE_INFINITY;
    const safeRightValue = rightValue ?? Number.NEGATIVE_INFINITY;

    if (safeLeftValue === safeRightValue) {
      return String(left.displayName || "").localeCompare(String(right.displayName || ""));
    }

    return metricConfig.sortDirection === "asc" ? safeLeftValue - safeRightValue : safeRightValue - safeLeftValue;
  });

  return nextRecords;
}

function filterGuidedParticipation(records, query, contextKey) {
  if (query.entity === "batters") {
    return records.filter((record) => {
      const hasFacedBall = contextKey === "matchup" ? (record.balls || 0) > 0 : (record.ballsFaced || 0) > 0;

      if (!hasFacedBall) {
        return false;
      }

      if (query.metric === "fifties") {
        return (record.fifties || 0) > 0;
      }

      if (query.metric === "hundreds") {
        return (record.hundreds || 0) > 0;
      }

      return true;
    });
  }

  if (query.entity === "bowlers") {
    return records.filter((record) =>
      contextKey === "matchup" ? true : ((record.ballsBowled || 0) > 0 || (record.oversBowled || 0) > 0)
    );
  }

  return records;
}

function buildGuidedPreview(query, metricConfig) {
  const entityLabel = guidedEntityOptions.find((option) => option.value === query.entity)?.label || "Players";
  const rankingLabel = metricConfig?.rankingOptions.find((option) => option.value === query.ranking)?.label || "Best";
  const metricLabel = metricConfig?.label || "Stats";
  const scopeLabel = guidedScopeOptions.find((option) => option.value === query.scope)?.label || "All Time";
  const isAllTimeQuery =
    query.scope === "career" ||
    (query.scope === "team" && query.season === "all") ||
    (query.scope === "teamSeason" && query.season === "all");

  let sentence = `${entityLabel} with ${rankingLabel.toLowerCase()} ${metricLabel.toLowerCase()}`;

  if (isAllTimeQuery) {
    sentence += " all time";
  } else {
    sentence += ` in ${query.season}`;
  }

  if ((query.scope === "teamSeason" || query.scope === "team") && query.teamCode) {
    sentence += ` for ${query.teamCode}`;
  }

  if (metricConfig?.threshold && query.thresholdValue) {
    sentence += ` with minimum ${query.thresholdValue} ${metricConfig.threshold.label.toLowerCase().replace("minimum ", "")}`;
  }

  return {
    sentence,
    scopeLabel
  };
}

function getGuidedPreferredSort(metricConfig) {
  if (!metricConfig) {
    return null;
  }

  if (metricConfig.sortType === "bestBowlingFigure") {
    return { key: "wickets", direction: "desc" };
  }

  if (metricConfig.dataset === "battingInnings") {
    return { key: "runs", direction: "desc" };
  }

  if (metricConfig.getValue) {
    return {
      key: metricConfig.key,
      direction: metricConfig.sortDirection || "desc"
    };
  }

  if (metricConfig.sortField) {
    return {
      key: metricConfig.sortField,
      direction: metricConfig.sortDirection || "desc"
    };
  }

  return null;
}

function GuidedQueryBuilder({
  query,
  onChange,
  onReset,
  metricConfig,
  yearOptions,
  teamOptions
}) {
  const metricOptions = getMetricOptions(query.entity);
  const rankingOptions = metricConfig?.rankingOptions || [];

  return (
    <div className="grid gap-4">
      <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,30,29,0.98),rgba(10,16,16,0.98))] p-4 shadow-[0_20px_38px_rgba(2,6,23,0.24)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/80">Quick Query</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm leading-7 text-slate-200">
          <span className="text-slate-400">Show</span>
          <select
            value={query.entity}
            onChange={(event) => onChange("entity", event.target.value)}
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.05] px-3 text-sm font-semibold text-white outline-none transition duration-200 focus:border-emerald-300"
          >
            {guidedEntityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <span className="text-slate-400">with</span>
          <select
            value={query.ranking}
            onChange={(event) => onChange("ranking", event.target.value)}
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.05] px-3 text-sm font-semibold text-white outline-none transition duration-200 focus:border-emerald-300"
          >
            {rankingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={query.metric}
            onChange={(event) => onChange("metric", event.target.value)}
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.05] px-3 text-sm font-semibold text-white outline-none transition duration-200 focus:border-emerald-300"
          >
            {metricOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>

          <span className="text-slate-400">in</span>
          <select
            value={query.scope}
            onChange={(event) => onChange("scope", event.target.value)}
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.05] px-3 text-sm font-semibold text-white outline-none transition duration-200 focus:border-emerald-300"
          >
            {guidedScopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {query.scope === "season" || query.scope === "teamSeason" || query.scope === "team" ? (
            <select
              value={String(query.season)}
              onChange={(event) => onChange("season", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.05] px-3 text-sm font-semibold text-white outline-none transition duration-200 focus:border-emerald-300"
            >
              {(query.scope === "teamSeason" || query.scope === "team"
                ? [{ value: "all", label: "All Time" }, ...yearOptions]
                : yearOptions).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : null}

          {query.scope === "teamSeason" || query.scope === "team" ? (
            <>
              <span className="text-slate-400">for</span>
              <select
                value={query.teamCode}
                onChange={(event) => onChange("teamCode", event.target.value)}
                className="h-11 rounded-2xl border border-white/10 bg-white/[0.05] px-3 text-sm font-semibold text-white outline-none transition duration-200 focus:border-emerald-300"
              >
                {teamOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          ) : null}
        </div>
      </div>

      {metricConfig?.threshold ? (
        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Qualifier</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-200">
            <span className="text-slate-400">Only show entries with minimum</span>
            <input
              value={query.thresholdValue}
              onChange={(event) => onChange("thresholdValue", event.target.value)}
              inputMode="numeric"
              className="h-11 w-28 rounded-2xl border border-white/10 bg-white/[0.05] px-3 text-sm font-semibold text-white outline-none transition duration-200 focus:border-emerald-300"
            />
            <span className="text-slate-400">{metricConfig.threshold.label.toLowerCase().replace("minimum ", "")}</span>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition duration-200 hover:border-emerald-300/30 hover:text-white active:scale-[0.98]"
        >
          Reset Query
        </button>
      </div>
    </div>
  );
}

export default function StatEngineClient({
  players = [],
  careerStats = [],
  seasonStats = [],
  teamSeasonStats = [],
  matchupStats = [],
  battingInningsStats = [],
  bowlingInningsStats = []
}) {
  const [loadedDatasets, setLoadedDatasets] = useState(null);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(players.length === 0);
  const [dataLoadError, setDataLoadError] = useState("");
  const [activeSection, setActiveSection] = useState("ask");
  const [askMode, setAskMode] = useState("guided");
  const [context, setContext] = useState("career");
  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const [conditions, setConditions] = useState([getDefaultCondition("career")]);
  const [advancedSoonNotice, setAdvancedSoonNotice] = useState(false);
  const [activeQuickPresetId, setActiveQuickPresetId] = useState(null);
  const [guidedQuery, setGuidedQuery] = useState({
    ...DEFAULT_GUIDED_QUERY
  });
  const [battleMode, setBattleMode] = useState("batterVsBowler");
  const [yearCompareMode, setYearCompareMode] = useState("singlePlayer");

  useEffect(() => {
    if (players.length > 0) {
      return undefined;
    }

    let isMounted = true;

    async function loadDatasets() {
      try {
        setIsLoadingDatasets(true);
        setDataLoadError("");

        const datasetKeys = ["players", "career", "season", "teamSeason", "matchup", "battingInnings", "bowlingInnings"];
        const responses = await Promise.all(
          datasetKeys.map((key) => fetch(`/stat-engine/api/stat-engine-data/${key}`).then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to load ${key}`);
            }

            return response.json();
          }))
        );

        if (!isMounted) {
          return;
        }

        setLoadedDatasets({
          players: responses[0],
          careerStats: responses[1],
          seasonStats: responses[2],
          teamSeasonStats: responses[3],
          matchupStats: responses[4],
          battingInningsStats: responses[5],
          bowlingInningsStats: responses[6]
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setDataLoadError("Could not load the IPL datasets. Refresh and try again.");
      } finally {
        if (isMounted) {
          setIsLoadingDatasets(false);
        }
      }
    }

    loadDatasets();

    return () => {
      isMounted = false;
    };
  }, [players.length]);

  const resolvedPlayers = loadedDatasets?.players || players;
  const resolvedCareerStats = loadedDatasets?.careerStats || careerStats;
  const resolvedSeasonStats = loadedDatasets?.seasonStats || seasonStats;
  const resolvedTeamSeasonStats = loadedDatasets?.teamSeasonStats || teamSeasonStats;
  const resolvedMatchupStats = loadedDatasets?.matchupStats || matchupStats;
  const resolvedBattingInningsStats = loadedDatasets?.battingInningsStats || battingInningsStats;
  const resolvedBowlingInningsStats = loadedDatasets?.bowlingInningsStats || bowlingInningsStats;

  const batters = resolvedPlayers.filter((player) => player.primaryRole !== "bowler");
  const bowlers = resolvedPlayers.filter((player) => player.primaryRole !== "batter");
  const viratKohliId = resolvedPlayers.find((player) => player.displayName === "Virat Kohli")?.playerId || batters[0]?.playerId || "";
  const rohitSharmaId =
    resolvedPlayers.find((player) => player.displayName === "Rohit Sharma")?.playerId ||
    batters.find((player) => player.playerId !== viratKohliId)?.playerId ||
    batters[0]?.playerId ||
    "";
  const jaspritBumrahId = resolvedPlayers.find((player) => player.displayName === "Jasprit Bumrah")?.playerId || bowlers[0]?.playerId || "";
  const lasithMalingaId =
    resolvedPlayers.find((player) => player.displayName === "SL Malinga")?.playerId ||
    resolvedPlayers.find((player) => player.displayName === "Lasith Malinga")?.playerId ||
    bowlers.find((player) => player.playerId !== jaspritBumrahId)?.playerId ||
    bowlers[0]?.playerId ||
    "";
  const [battleState, setBattleState] = useState({
    leftId: viratKohliId,
    rightId: rohitSharmaId,
    batterId: viratKohliId,
    bowlerId: jaspritBumrahId,
    seasonA: 2016,
    seasonB: 2025
  });

  useEffect(() => {
    if (!resolvedPlayers.length) {
      return;
    }

    setBattleState((currentState) => ({
      ...currentState,
      leftId: currentState.leftId || viratKohliId,
      rightId: currentState.rightId || rohitSharmaId,
      batterId: currentState.batterId || viratKohliId,
      bowlerId: currentState.bowlerId || jaspritBumrahId
    }));
  }, [resolvedPlayers.length, viratKohliId, rohitSharmaId, jaspritBumrahId]);

  const datasetMap = {
    career: resolvedCareerStats,
    season: resolvedSeasonStats,
    teamSeason: resolvedTeamSeasonStats,
    battingInnings: resolvedBattingInningsStats,
    bowlingInnings: resolvedBowlingInningsStats
  };
  const teamStats = useMemo(() => aggregateTeamTotals(resolvedTeamSeasonStats), [resolvedTeamSeasonStats]);

  const yearOptions = Array.from(new Set(resolvedSeasonStats.map((record) => record.season)))
    .sort((left, right) => right - left)
    .map((season) => ({ value: String(season), label: String(season) }));

  const teamOptions = Array.from(new Set(resolvedTeamSeasonStats.map((record) => record.teamCode)))
    .sort()
    .map((teamCode) => ({ value: teamCode, label: teamCode }));

  const guidedMetricConfig = getMetricConfig(guidedQuery.entity, guidedQuery.metric);

  const guidedResult = useMemo(() => {
    const isTeamSeasonShortcut =
      guidedQuery.scope === "team" &&
      guidedQuery.season !== "all" &&
      !guidedMetricConfig?.dataset;
    const contextKey = guidedMetricConfig?.dataset || (isTeamSeasonShortcut ? "teamSeason" : guidedQuery.scope);
    const conditionsForQuery = [];
    const shouldFilterSeason =
      guidedQuery.scope === "season" ||
      ((guidedQuery.scope === "teamSeason" || guidedQuery.scope === "team") && guidedQuery.season !== "all");

    if (shouldFilterSeason) {
      conditionsForQuery.push({ field: "season", operator: "eq", value: Number(guidedQuery.season) });
    }

    if ((guidedQuery.scope === "teamSeason" || guidedQuery.scope === "team") && guidedQuery.teamCode) {
      conditionsForQuery.push({ field: "teamCode", operator: "is", value: guidedQuery.teamCode });
    }

    if (guidedMetricConfig?.threshold && guidedQuery.thresholdValue !== "") {
      conditionsForQuery.push({
        field: guidedMetricConfig.threshold.field,
        operator: "gte",
        value: Number(guidedQuery.thresholdValue)
      });
    }

    const filtered = filterDataset({
      context: contextKey,
      dataset: contextKey === "team" ? teamStats : datasetMap[contextKey],
      conditions: conditionsForQuery
    });
    const cleanedResults = filterGuidedParticipation(filtered.results, guidedQuery, contextKey);
    const sortedResults = sortGuidedResults(cleanedResults, guidedMetricConfig);
    const previewMeta = buildGuidedPreview(guidedQuery, guidedMetricConfig);

    return {
      context: contextKey,
      total: sortedResults.length,
      results: sortedResults,
      preview: `Showing ${previewMeta.sentence}`,
      scopeLabel: previewMeta.scopeLabel
    };
  }, [datasetMap, guidedMetricConfig, guidedQuery, teamStats]);

  const filteredResult = filterDataset({
    context,
    dataset: datasetMap[context],
    conditions
  });

  function handleContextChange(nextContext) {
    setContext(nextContext);
    setConditions([getDefaultCondition(nextContext)]);
    setActiveTemplateId(null);
  }

  function handleGuidedChange(key, value) {
    setActiveQuickPresetId(null);
    setGuidedQuery((currentQuery) => {
      const nextQuery = {
        ...currentQuery,
        [key]: value
      };

      if (key === "entity") {
        const nextMetric = getMetricOptions(value)[0];
        nextQuery.metric = nextMetric.key;
        nextQuery.ranking = nextMetric.rankingOptions[0].value;
        nextQuery.thresholdValue = String(nextMetric.threshold?.defaultValue || "");
      }

      if (key === "metric") {
        const nextMetric = getMetricConfig(currentQuery.entity, value);
        nextQuery.ranking = nextMetric.rankingOptions[0].value;
        nextQuery.thresholdValue = String(nextMetric.threshold?.defaultValue || "");
      }

      if (key === "scope" && value === "career") {
        nextQuery.teamCode = currentQuery.teamCode || teamOptions[0]?.value || "";
      }

      if (key === "scope" && value !== "teamSeason") {
        nextQuery.teamCode = currentQuery.teamCode || teamOptions[0]?.value || "";
      }

      return nextQuery;
    });
  }

  function resetGuidedQuery() {
    setActiveQuickPresetId(null);
    setGuidedQuery({ ...DEFAULT_GUIDED_QUERY });
  }

  function updateCondition(index, nextCondition) {
    setConditions((currentConditions) =>
      currentConditions.map((condition, conditionIndex) => (conditionIndex === index ? nextCondition : condition))
    );
  }

  function removeCondition(index) {
    setConditions((currentConditions) => currentConditions.filter((_, conditionIndex) => conditionIndex !== index));
  }

  function addCondition() {
    setConditions((currentConditions) => [...currentConditions, getDefaultCondition(context)]);
  }

  function applyTemplate(template) {
    setAskMode("advanced");
    setContext(template.context);
    setConditions(template.conditions);
    setActiveTemplateId(template.id);
    setActiveSection("ask");
  }

  const askModeTabs = [
    { key: "guided", label: "Quick Query" },
    {
      key: "advanced",
      label: "Advanced Filters",
      disabled: true,
      disabledMessage: "Coming Soon!",
      onDisabledInteract: () => setAdvancedSoonNotice(true)
    }
  ];

  useEffect(() => {
    if (!advancedSoonNotice) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setAdvancedSoonNotice(false);
    }, 1800);

    return () => clearTimeout(timeoutId);
  }, [advancedSoonNotice]);

  function applyQuickPreset(preset) {
    setAskMode("guided");
    setAdvancedSoonNotice(false);
    setActiveQuickPresetId(preset.id);
    setGuidedQuery({
      ...DEFAULT_GUIDED_QUERY,
      ...preset.query
    });
  }

  function handleAskModeChange(nextMode) {
    setAskMode(nextMode);
    setAdvancedSoonNotice(false);
  }

  function updateBattleState(key, value) {
    setBattleState((currentState) => ({
      ...currentState,
      [key]: value
    }));
  }

  function handleBattleModeChange(nextMode) {
    setBattleMode(nextMode);
    if (nextMode === "batterVsBowler") {
      setBattleState((currentState) => ({
        ...currentState,
        batterId: viratKohliId,
        bowlerId: jaspritBumrahId
      }));
      setYearCompareMode("singlePlayer");
      return;
    }

    if (nextMode === "batterVsBatter") {
      setBattleState((currentState) => ({
        ...currentState,
        leftId: viratKohliId,
        rightId: rohitSharmaId
      }));
      setYearCompareMode("singlePlayer");
      return;
    }

    if (nextMode === "bowlerVsBowler") {
      setBattleState((currentState) => ({
        ...currentState,
        leftId: jaspritBumrahId,
        rightId: lasithMalingaId
      }));
      setYearCompareMode("singlePlayer");
      return;
    }

    if (nextMode === "yearVsYear") {
      setYearCompareMode("singlePlayer");
      setBattleState((currentState) => ({
        ...currentState,
        leftId: viratKohliId,
        rightId: viratKohliId,
        seasonA: 2016,
        seasonB: 2025
      }));
      return;
    }
  }

  const battlePresets = FAMOUS_MATCHUP_PAIRS.map((pair) => {
    const batter = resolvedPlayers.find((player) => player.displayName === pair.batterName) || null;
    const bowler = resolvedPlayers.find((player) => player.displayName === pair.bowlerName) || null;

    if (!batter || !bowler) {
      return null;
    }

    return {
      id: pair.id,
      label: pair.label,
      description: `${pair.batterName} vs ${pair.bowlerName}`,
      batterId: batter.playerId,
      bowlerId: bowler.playerId
    };
  }).filter(Boolean);

  function applyBattlePreset(preset) {
    setBattleMode("batterVsBowler");
    setBattleState((currentState) => ({
      ...currentState,
      batterId: preset.batterId,
      bowlerId: preset.bowlerId
    }));
  }

  const battle = buildBattle({
    mode: battleMode,
    players: resolvedPlayers,
    careerStats: resolvedCareerStats,
    seasonStats: resolvedSeasonStats,
    matchupStats: resolvedMatchupStats,
    params: {
      ...battleState,
      yearCompareMode
    }
  });

  const selectorConfig =
    battleMode === "batterVsBatter"
      ? [
          { id: "leftId", label: "Player A", value: battleState.leftId, options: toSelectOptions(batters), onChange: (value) => updateBattleState("leftId", value), searchable: true, placeholder: "Search batter" },
          { id: "rightId", label: "Player B", value: battleState.rightId, options: toSelectOptions(batters), onChange: (value) => updateBattleState("rightId", value), searchable: true, placeholder: "Search batter" }
        ]
      : battleMode === "bowlerVsBowler"
        ? [
            { id: "leftId", label: "Bowler A", value: battleState.leftId, options: toSelectOptions(bowlers), onChange: (value) => updateBattleState("leftId", value), searchable: true, placeholder: "Search bowler" },
            { id: "rightId", label: "Bowler B", value: battleState.rightId, options: toSelectOptions(bowlers), onChange: (value) => updateBattleState("rightId", value), searchable: true, placeholder: "Search bowler" }
          ]
        : battleMode === "batterVsBowler"
          ? [
              { id: "batterId", label: "Batter", value: battleState.batterId, options: toSelectOptions(batters), onChange: (value) => updateBattleState("batterId", value), searchable: true, placeholder: "Search batter" },
              { id: "bowlerId", label: "Bowler", value: battleState.bowlerId, options: toSelectOptions(bowlers), onChange: (value) => updateBattleState("bowlerId", value), searchable: true, placeholder: "Search bowler" }
            ]
          : yearCompareMode === "twoPlayers"
            ? [
                { id: "leftId", label: "Player A", value: battleState.leftId, options: toSelectOptions(resolvedPlayers), onChange: (value) => updateBattleState("leftId", value), searchable: true, placeholder: "Search player A" },
                { id: "seasonA", label: "Season A", value: String(battleState.seasonA), options: yearOptions, onChange: (value) => updateBattleState("seasonA", Number(value)) },
                { id: "rightId", label: "Player B", value: battleState.rightId, options: toSelectOptions(resolvedPlayers), onChange: (value) => updateBattleState("rightId", value), searchable: true, placeholder: "Search player B" },
                { id: "seasonB", label: "Season B", value: String(battleState.seasonB), options: yearOptions, onChange: (value) => updateBattleState("seasonB", Number(value)) }
              ]
            : [
                { id: "leftId", label: "Player", value: battleState.leftId, options: toSelectOptions(resolvedPlayers), onChange: (value) => { updateBattleState("leftId", value); updateBattleState("rightId", value); }, searchable: true, placeholder: "Search player" },
                { id: "seasonA", label: "Season A", value: String(battleState.seasonA), options: yearOptions, onChange: (value) => updateBattleState("seasonA", Number(value)) },
                { id: "seasonB", label: "Season B", value: String(battleState.seasonB), options: yearOptions, onChange: (value) => updateBattleState("seasonB", Number(value)) }
              ];

  const askPreview = askMode === "guided" ? guidedResult.preview : filteredResult.preview;
  const askResults = askMode === "guided" ? guidedResult.results : filteredResult.results;
  const askTotal = askMode === "guided" ? guidedResult.total : filteredResult.total;
  const askContext = askMode === "guided" ? guidedResult.context : context;
  const askPreferredSort = askMode === "guided" ? getGuidedPreferredSort(guidedMetricConfig) : null;
  const askRoleProfileOverride =
    askMode === "guided" && guidedQuery.entity !== "players" && askContext !== "battingInnings" && askContext !== "bowlingInnings"
      ? guidedQuery.entity === "batters"
        ? "batter"
        : "bowler"
      : null;

  if (isLoadingDatasets && !resolvedPlayers.length) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_22%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_20%),linear-gradient(180deg,#0b1112_0%,#081011_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <SectionCard eyebrow="IPL Stat Engine" title="Loading the full IPL data engine">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-6 text-sm text-slate-300">
              Pulling in IPL 2008-2025 datasets for Ask Stats and Battle Mode.
            </div>
          </SectionCard>
        </div>
      </main>
    );
  }

  if (dataLoadError && !resolvedPlayers.length) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_22%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_20%),linear-gradient(180deg,#0b1112_0%,#081011_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <SectionCard eyebrow="IPL Stat Engine" title="Could not load the datasets">
            <div className="rounded-[24px] border border-amber-300/15 bg-amber-300/10 px-4 py-6 text-sm text-amber-100">
              {dataLoadError}
            </div>
          </SectionCard>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_22%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_20%),linear-gradient(180deg,#0b1112_0%,#081011_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <SectionCard
          eyebrow="IPL Stat Engine"
          title="Explore IPL stat stories with a premium match-day feel"
        >
          <div className="space-y-3">
            <PillTabs
              items={sectionTabs}
              activeKey={activeSection}
              onChange={setActiveSection}
              className="flex w-full justify-between overflow-hidden sm:flex sm:w-full sm:justify-center sm:overflow-visible"
              itemClassName="min-w-[132px] sm:min-w-[172px]"
            />
            <p className="text-center text-xs font-medium text-slate-400 sm:text-sm">
              Built from IPL 2008-2025 ball-by-ball match data.
            </p>
          </div>
        </SectionCard>

        {activeSection === "ask" ? (
          <>
            <SectionCard
              eyebrow="Ask IPL Stats"
              title=""
              description=""
            >
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-300">
                    Choose how you want to explore the stats.
                  </p>
                </div>
                <div>
                  <PillTabs items={askModeTabs} activeKey={askMode} onChange={handleAskModeChange} />
                  {advancedSoonNotice ? (
                    <p className="mt-2 text-xs font-semibold text-amber-200">Coming Soon!</p>
                  ) : null}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Quick Query"
              title="Build a natural stat question"
              description="Examples: batters with most runs in 2025, bowlers with most wickets all time, best strike rate at 500 runs."
            >
              <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1">
                {QUICK_QUERY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyQuickPreset(preset)}
                    className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition duration-200 active:scale-[0.98] ${
                      activeQuickPresetId === preset.id
                        ? "border-amber-300/30 bg-[linear-gradient(135deg,rgba(16,185,129,0.22),rgba(245,158,11,0.18))] text-white shadow-[0_12px_24px_rgba(16,185,129,0.14)]"
                        : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-emerald-300/30 hover:bg-[linear-gradient(135deg,rgba(16,185,129,0.1),rgba(245,158,11,0.08))] hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <GuidedQueryBuilder
                query={guidedQuery}
                onChange={handleGuidedChange}
                onReset={resetGuidedQuery}
                metricConfig={guidedMetricConfig}
                yearOptions={yearOptions}
                teamOptions={teamOptions}
              />
              <div className="mt-4 rounded-[24px] border border-emerald-300/10 bg-[linear-gradient(135deg,rgba(14,40,34,0.96),rgba(13,18,18,0.98))] px-4 py-5 text-base leading-7 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
                  {renderPreviewText(askPreview)}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Results"
              title={`Matching records: ${askTotal.toLocaleString("en-IN")}`}
              description=""
            >
              <ResultsGrid
                context={askContext}
                records={askResults}
                preferredSort={askPreferredSort}
                roleProfileOverride={askRoleProfileOverride}
              />
            </SectionCard>
          </>
        ) : (
          <SectionCard
            eyebrow="Player Battle"
            title="Step into the battle zone"
            description="Matchup leads the experience, with quick switching into symmetric battles and year-based comparisons."
          >
            <BattlePanel
              mode={battleMode}
              onModeChange={handleBattleModeChange}
              yearCompareMode={yearCompareMode}
              yearCompareTabs={yearCompareTabs}
              onYearCompareModeChange={setYearCompareMode}
              selectorConfig={selectorConfig}
              battle={battle}
              battlePresets={battlePresets}
              onApplyBattlePreset={applyBattlePreset}
            />
          </SectionCard>
        )}

        <footer className="flex flex-col items-center justify-center gap-2 rounded-[24px] border border-white/6 bg-white/[0.03] px-4 py-4 text-center text-xs text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:flex-row sm:flex-wrap sm:gap-3">
          <span>Built from IPL 2008-2025 data.</span>
          <span className="hidden text-slate-600 sm:inline">•</span>
          <span>Made by Vishal.</span>
          <a
            href="https://vishalbuilds.com"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-slate-300 transition hover:text-white"
          >
            Website
          </a>
          <a
            href="mailto:vgvishal31@gmail.com"
            className="font-semibold text-slate-300 transition hover:text-white"
          >
            Email
          </a>
        </footer>
      </div>
    </main>
  );
}
