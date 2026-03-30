export const STAT_TEMPLATES = [
  {
    id: "explosive-batters",
    label: "Explosive Batters",
    description: "High-volume batters scoring quickly.",
    context: "career",
    conditions: [
      { field: "runs", operator: "gte", value: 3000 },
      { field: "strikeRate", operator: "gte", value: 140 }
    ]
  },
  {
    id: "consistent-batters",
    label: "Consistent Batters",
    description: "Reliable run scorers with strong averages.",
    context: "career",
    conditions: [
      { field: "runs", operator: "gte", value: 2500 },
      { field: "battingAverage", operator: "gte", value: 35 }
    ]
  },
  {
    id: "wicket-machines",
    label: "Wicket Machines",
    description: "Strike bowlers with big wicket tallies.",
    context: "career",
    conditions: [
      { field: "wickets", operator: "gte", value: 100 },
      { field: "economy", operator: "lte", value: 8.2 }
    ]
  },
  {
    id: "elite-seasons",
    label: "Elite Seasons",
    description: "Single-season batting surges.",
    context: "season",
    conditions: [
      { field: "runs", operator: "gte", value: 500 },
      { field: "strikeRate", operator: "gte", value: 145 }
    ]
  },
  {
    id: "team-impact",
    label: "Team Season Stars",
    description: "Strong team-specific campaigns.",
    context: "teamSeason",
    conditions: [
      { field: "runs", operator: "gte", value: 400 },
      { field: "teamCode", operator: "in", value: ["CSK", "MI", "RCB"] }
    ]
  }
];
