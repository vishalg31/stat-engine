export const BATTLE_STAT_CONFIG = {
  batterVsBatter: [
    { key: "matches", label: "Matches", better: "higher", formatter: "number" },
    { key: "runs", label: "Runs", better: "higher", formatter: "number" },
    { key: "battingAverage", label: "Average", better: "higher", formatter: "decimal" },
    { key: "strikeRate", label: "Strike Rate", better: "higher", formatter: "decimal" },
    { key: "fifties", label: "50s", better: "higher", formatter: "number" },
    { key: "hundreds", label: "100s", better: "higher", formatter: "number" },
    { key: "highestScore", label: "Highest Score", better: "higher", formatter: "number" }
  ],
  bowlerVsBowler: [
    { key: "matches", label: "Matches", better: "higher", formatter: "number" },
    { key: "wickets", label: "Wickets", better: "higher", formatter: "number" },
    { key: "economy", label: "Economy", better: "lower", formatter: "decimal" },
    { key: "bowlingAverage", label: "Bowling Avg", better: "lower", formatter: "decimal" },
    { key: "strikeRateBowling", label: "Bowling SR", better: "lower", formatter: "decimal" },
    { key: "dotBalls", label: "Dot Balls", better: "higher", formatter: "number" },
    { key: "fourWicketHauls", label: "4W", better: "higher", formatter: "number" },
    { key: "fiveWicketHauls", label: "5W", better: "higher", formatter: "number" }
  ],
  batterVsBowler: [
    { key: "runsScored", label: "Runs Scored", winnerSide: "left", formatter: "number" },
    { key: "ballsFaced", label: "Balls Faced", winnerSide: "none", formatter: "number" },
    { key: "wickets", label: "Wickets", winnerSide: "right", formatter: "number" },
    { key: "battingStrikeRate", label: "Batting Strike Rate", winnerSide: "left", formatter: "decimal" },
    { key: "average", label: "Average", winnerSide: "left", formatter: "decimal" },
    { key: "boundariesPerBall", label: "Boundaries per Ball", winnerSide: "left", formatter: "percent" },
    { key: "foursSixes", label: "4s / 6s", winnerSide: "left", formatter: "text" }
  ],
  yearVsYear: [
    { key: "matches", label: "Matches", better: "higher", formatter: "number" },
    { key: "runs", label: "Runs", better: "higher", formatter: "number" },
    { key: "battingAverage", label: "Average", better: "higher", formatter: "decimal" },
    { key: "strikeRate", label: "Strike Rate", better: "higher", formatter: "decimal" },
    { key: "wickets", label: "Wickets", better: "higher", formatter: "number" },
    { key: "economy", label: "Economy", better: "lower", formatter: "decimal" },
    { key: "dotBalls", label: "Dot Balls", better: "higher", formatter: "number" }
  ]
};

export function getBattleStatConfig(mode) {
  return BATTLE_STAT_CONFIG[mode] || [];
}
