const numericOperators = ["gt", "gte", "lt", "lte", "eq", "between"];
const textOperators = ["is", "isNot", "contains"];
const enumOperators = ["is", "isNot", "in"];
const yearOperators = ["eq", "gte", "lte", "between"];

function field(config) {
  return config;
}

export const FIELD_REGISTRY = {
  career: [
    field({ key: "displayName", label: "Player", type: "text", operators: textOperators, category: "identity" }),
    field({
      key: "role",
      label: "Role",
      type: "enum",
      operators: enumOperators,
      options: ["batter", "bowler", "all_rounder"],
      category: "identity"
    }),
    field({ key: "matches", label: "Matches", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "innings", label: "Innings", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "runs", label: "Runs", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "ballsFaced", label: "Balls Faced", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "strikeRate", label: "Strike Rate", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "battingAverage", label: "Batting Average", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "fours", label: "Fours", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "sixes", label: "Sixes", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "fifties", label: "50s", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "hundreds", label: "100s", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "highestScore", label: "Highest Score", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "notOuts", label: "Not Outs", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "ducks", label: "Ducks", type: "number", operators: numericOperators, category: "batting" }),
    field({
      key: "inningsBowled",
      label: "Bowling Innings",
      type: "number",
      operators: numericOperators,
      category: "bowling"
    }),
    field({ key: "oversBowled", label: "Overs Bowled", type: "number", operators: numericOperators, category: "bowling" }),
    field({ key: "runsConceded", label: "Runs Conceded", type: "number", operators: numericOperators, category: "bowling" }),
    field({ key: "wickets", label: "Wickets", type: "number", operators: numericOperators, category: "bowling" }),
    field({ key: "economy", label: "Economy", type: "number", operators: numericOperators, category: "bowling" }),
    field({
      key: "bowlingAverage",
      label: "Bowling Average",
      type: "number",
      operators: numericOperators,
      category: "bowling"
    }),
    field({
      key: "strikeRateBowling",
      label: "Bowling Strike Rate",
      type: "number",
      operators: numericOperators,
      category: "bowling"
    }),
    field({ key: "dotBalls", label: "Dot Balls", type: "number", operators: numericOperators, category: "bowling" }),
    field({ key: "fourWicketHauls", label: "4W Hauls", type: "number", operators: numericOperators, category: "bowling" }),
    field({ key: "fiveWicketHauls", label: "5W Hauls", type: "number", operators: numericOperators, category: "bowling" })
  ],
  season: [
    field({ key: "displayName", label: "Player", type: "text", operators: textOperators, category: "identity" }),
    field({ key: "season", label: "Season", type: "year", operators: yearOperators, category: "identity" }),
    field({
      key: "role",
      label: "Role",
      type: "enum",
      operators: enumOperators,
      options: ["batter", "bowler", "all_rounder"],
      category: "identity"
    }),
    field({ key: "matches", label: "Matches", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "runs", label: "Runs", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "strikeRate", label: "Strike Rate", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "battingAverage", label: "Batting Average", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "highestScore", label: "Highest Score", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "fifties", label: "50s", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "hundreds", label: "100s", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "wickets", label: "Wickets", type: "number", operators: numericOperators, category: "bowling" }),
    field({ key: "oversBowled", label: "Overs Bowled", type: "number", operators: numericOperators, category: "bowling" }),
    field({ key: "economy", label: "Economy", type: "number", operators: numericOperators, category: "bowling" }),
    field({
      key: "strikeRateBowling",
      label: "Bowling Strike Rate",
      type: "number",
      operators: numericOperators,
      category: "bowling"
    }),
    field({ key: "dotBalls", label: "Dot Balls", type: "number", operators: numericOperators, category: "bowling" })
  ],
  teamSeason: [
    field({ key: "displayName", label: "Player", type: "text", operators: textOperators, category: "identity" }),
    field({ key: "season", label: "Season", type: "year", operators: yearOperators, category: "identity" }),
    field({
      key: "teamCode",
      label: "Team",
      type: "enum",
      operators: enumOperators,
      options: ["CSK", "DC", "DEC", "GL", "GT", "KKR", "KTK", "LSG", "MI", "PBKS", "PWI", "RCB", "RPS", "RR", "SRH"],
      category: "identity"
    }),
    field({
      key: "role",
      label: "Role",
      type: "enum",
      operators: enumOperators,
      options: ["batter", "bowler", "all_rounder"],
      category: "identity"
    }),
    field({ key: "matches", label: "Matches", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "runs", label: "Runs", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "strikeRate", label: "Strike Rate", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "battingAverage", label: "Batting Average", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "wickets", label: "Wickets", type: "number", operators: numericOperators, category: "bowling" }),
    field({ key: "oversBowled", label: "Overs Bowled", type: "number", operators: numericOperators, category: "bowling" }),
    field({ key: "economy", label: "Economy", type: "number", operators: numericOperators, category: "bowling" }),
    field({ key: "dotBalls", label: "Dot Balls", type: "number", operators: numericOperators, category: "bowling" })
  ],
  team: [
    field({ key: "displayName", label: "Player", type: "text", operators: textOperators, category: "identity" }),
    field({
      key: "teamCode",
      label: "Team",
      type: "enum",
      operators: enumOperators,
      options: ["CSK", "DC", "DEC", "GL", "GT", "KKR", "KTK", "LSG", "MI", "PBKS", "PWI", "RCB", "RPS", "RR", "SRH"],
      category: "identity"
    }),
    field({
      key: "role",
      label: "Role",
      type: "enum",
      operators: enumOperators,
      options: ["batter", "bowler", "all_rounder"],
      category: "identity"
    }),
    field({ key: "matches", label: "Matches", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "runs", label: "Runs", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "strikeRate", label: "Strike Rate", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "battingAverage", label: "Batting Average", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "wickets", label: "Wickets", type: "number", operators: numericOperators, category: "bowling" }),
    field({ key: "oversBowled", label: "Overs Bowled", type: "number", operators: numericOperators, category: "bowling" }),
    field({ key: "economy", label: "Economy", type: "number", operators: numericOperators, category: "bowling" }),
    field({
      key: "strikeRateBowling",
      label: "Bowling Strike Rate",
      type: "number",
      operators: numericOperators,
      category: "bowling"
    }),
    field({ key: "dotBalls", label: "Dot Balls", type: "number", operators: numericOperators, category: "bowling" })
  ],
  battingInnings: [
    field({ key: "displayName", label: "Player", type: "text", operators: textOperators, category: "identity" }),
    field({ key: "season", label: "Season", type: "year", operators: yearOperators, category: "identity" }),
    field({
      key: "teamCode",
      label: "Team",
      type: "enum",
      operators: enumOperators,
      options: ["CSK", "DC", "DEC", "GL", "GT", "KKR", "KTK", "LSG", "MI", "PBKS", "PWI", "RCB", "RPS", "RR", "SRH"],
      category: "identity"
    }),
    field({ key: "runs", label: "Runs", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "ballsFaced", label: "Balls Faced", type: "number", operators: numericOperators, category: "batting" }),
    field({ key: "strikeRate", label: "Strike Rate", type: "number", operators: numericOperators, category: "batting" })
  ],
  bowlingInnings: [
    field({ key: "displayName", label: "Player", type: "text", operators: textOperators, category: "identity" }),
    field({ key: "season", label: "Season", type: "year", operators: yearOperators, category: "identity" }),
    field({
      key: "teamCode",
      label: "Team",
      type: "enum",
      operators: enumOperators,
      options: ["CSK", "DC", "DEC", "GL", "GT", "KKR", "KTK", "LSG", "MI", "PBKS", "PWI", "RCB", "RPS", "RR", "SRH"],
      category: "identity"
    }),
    field({ key: "wickets", label: "Wickets", type: "number", operators: numericOperators, category: "bowling" }),
    field({ key: "runsConceded", label: "Runs Conceded", type: "number", operators: numericOperators, category: "bowling" }),
    field({ key: "economy", label: "Economy", type: "number", operators: numericOperators, category: "bowling" })
  ],
  matchup: [
    field({ key: "batterName", label: "Batter", type: "text", operators: textOperators, category: "identity" }),
    field({ key: "bowlerName", label: "Bowler", type: "text", operators: textOperators, category: "identity" }),
    field({ key: "matches", label: "Matches", type: "number", operators: numericOperators, category: "matchup" }),
    field({ key: "innings", label: "Innings", type: "number", operators: numericOperators, category: "matchup" }),
    field({ key: "runs", label: "Runs", type: "number", operators: numericOperators, category: "matchup" }),
    field({ key: "balls", label: "Balls", type: "number", operators: numericOperators, category: "matchup" }),
    field({ key: "dismissals", label: "Dismissals", type: "number", operators: numericOperators, category: "matchup" }),
    field({ key: "strikeRate", label: "Strike Rate", type: "number", operators: numericOperators, category: "matchup" }),
    field({ key: "fours", label: "Fours", type: "number", operators: numericOperators, category: "matchup" }),
    field({ key: "sixes", label: "Sixes", type: "number", operators: numericOperators, category: "matchup" }),
    field({ key: "dotBalls", label: "Dot Balls", type: "number", operators: numericOperators, category: "matchup" })
  ]
};

export function getFieldsForContext(context) {
  return FIELD_REGISTRY[context] || [];
}

export function getFieldConfig(context, fieldKey) {
  return getFieldsForContext(context).find((fieldConfig) => fieldConfig.key === fieldKey) || null;
}
