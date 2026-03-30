import { getBattleStatConfig } from "./battleStatConfig";
import { formatValue } from "./formatters";

function decideWinner(leftValue, rightValue, better) {
  if (leftValue === null || leftValue === undefined || rightValue === null || rightValue === undefined) {
    return "none";
  }

  if (leftValue === rightValue) {
    return "none";
  }

  if (better === "lower") {
    return leftValue < rightValue ? "left" : "right";
  }

  return leftValue > rightValue ? "left" : "right";
}

function buildSymmetricRows(mode, leftRecord, rightRecord) {
  return getBattleStatConfig(mode).map((statConfig) => {
    const leftValue = leftRecord?.[statConfig.key] ?? null;
    const rightValue = rightRecord?.[statConfig.key] ?? null;
    return {
      key: statConfig.key,
      label: statConfig.label,
      formatter: statConfig.formatter,
      leftValue,
      rightValue,
      leftDisplayValue: formatValue(leftValue, statConfig.formatter),
      rightDisplayValue: formatValue(rightValue, statConfig.formatter),
      winner: decideWinner(leftValue, rightValue, statConfig.better)
    };
  });
}

function buildMatchupRows(matchupRecord) {
  const derivedMatchup = matchupRecord
    ? {
        runsScored: matchupRecord.runs,
        ballsFaced: matchupRecord.balls,
        wickets: matchupRecord.dismissals,
        battingStrikeRate: matchupRecord.strikeRate,
        average: matchupRecord.dismissals > 0 ? matchupRecord.runs / matchupRecord.dismissals : null,
        boundariesPerBall:
          matchupRecord.balls > 0 ? ((matchupRecord.fours + matchupRecord.sixes) / matchupRecord.balls) * 100 : null,
        foursSixes: `${matchupRecord.fours}/${matchupRecord.sixes}`
      }
    : null;

  return getBattleStatConfig("batterVsBowler").map((statConfig) => {
    const value = derivedMatchup?.[statConfig.key] ?? null;
    const leftValue = statConfig.winnerSide === "right" ? null : value;
    const rightValue = statConfig.winnerSide === "left" ? null : value;

    return {
      key: statConfig.key,
      label: statConfig.label,
      formatter: statConfig.formatter,
      value,
      leftValue,
      rightValue,
      leftDisplayValue: leftValue === null ? "--" : formatValue(leftValue, statConfig.formatter),
      rightDisplayValue: rightValue === null ? "--" : formatValue(rightValue, statConfig.formatter),
      winner:
        statConfig.winnerSide === "left"
          ? "left"
          : statConfig.winnerSide === "right"
            ? "right"
            : "none"
    };
  });
}

export function buildBattle({ mode, careerStats = [], seasonStats = [], matchupStats = [], players = [], params }) {
  if (mode === "batterVsBatter" || mode === "bowlerVsBowler") {
    const leftRecord = careerStats.find((record) => record.playerId === params.leftId) || null;
    const rightRecord = careerStats.find((record) => record.playerId === params.rightId) || null;

    return {
      mode,
      headline: leftRecord && rightRecord ? `${leftRecord.displayName} vs ${rightRecord.displayName}` : "Player Battle",
      leftEntity: leftRecord,
      rightEntity: rightRecord,
      rows: buildSymmetricRows(mode, leftRecord, rightRecord)
    };
  }

  if (mode === "yearVsYear") {
    const compareMode = params.yearCompareMode || "singlePlayer";
    const leftPlayerId = params.leftId;
    const rightPlayerId = compareMode === "twoPlayers" ? params.rightId : params.leftId;
    const leftRecord =
      seasonStats.find((record) => record.playerId === leftPlayerId && record.season === params.seasonA) || null;
    const rightRecord =
      seasonStats.find((record) => record.playerId === rightPlayerId && record.season === params.seasonB) || null;
    const leftPlayer = players.find((record) => record.playerId === leftPlayerId) || null;
    const rightPlayer = players.find((record) => record.playerId === rightPlayerId) || null;

    const headline =
      compareMode === "twoPlayers"
        ? leftPlayer && rightPlayer
          ? `${leftPlayer.displayName} ${params.seasonA} vs ${rightPlayer.displayName} ${params.seasonB}`
          : "Year Battle"
        : leftPlayer
          ? `${leftPlayer.displayName}: ${params.seasonA} vs ${params.seasonB}`
          : "Year Battle";

    return {
      mode,
      headline,
      leftEntity: leftRecord
        ? {
            ...leftRecord,
            label:
              compareMode === "twoPlayers"
                ? `${leftPlayer?.displayName || "Player A"} • ${params.seasonA}`
                : `${params.seasonA}`
          }
        : null,
      rightEntity: rightRecord
        ? {
            ...rightRecord,
            label:
              compareMode === "twoPlayers"
                ? `${rightPlayer?.displayName || "Player B"} • ${params.seasonB}`
                : `${params.seasonB}`
          }
        : null,
      rows: buildSymmetricRows(mode, leftRecord, rightRecord)
    };
  }

  if (mode === "batterVsBowler") {
    const matchupRecord =
      matchupStats.find(
        (record) => record.batterId === params.batterId && record.bowlerId === params.bowlerId
      ) || null;
    const batter = players.find((record) => record.playerId === params.batterId) || null;
    const bowler = players.find((record) => record.playerId === params.bowlerId) || null;

    return {
      mode,
      headline:
        batter && bowler ? `${batter.displayName} vs ${bowler.displayName}` : "Batter vs Bowler",
      leftEntity: batter,
      rightEntity: bowler,
      rows: buildMatchupRows(matchupRecord)
    };
  }

  return {
    mode,
    headline: "Player Battle",
    leftEntity: null,
    rightEntity: null,
    rows: []
  };
}
