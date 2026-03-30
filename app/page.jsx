import fs from "fs";
import path from "path";
import StatEngineClient from "@/components/stat-engine/StatEngineClient";

function readDataset(filename) {
  const filePath = path.join(process.cwd(), "data", filename);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const contents = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(contents) ? contents : [];
  } catch {
    return [];
  }
}

export default function HomePage() {
  return (
    <StatEngineClient
      players={readDataset("players.json")}
      careerStats={readDataset("career_stats.json")}
      seasonStats={readDataset("season_stats.json")}
      teamSeasonStats={readDataset("team_season_stats.json")}
      matchupStats={readDataset("matchup_stats.json")}
      battingInningsStats={readDataset("batting_innings.json")}
      bowlingInningsStats={readDataset("bowling_innings.json")}
    />
  );
}
