import fs from "fs";
import path from "path";

const DATASET_FILES = {
  players: "players.json",
  career: "career_stats.json",
  season: "season_stats.json",
  teamSeason: "team_season_stats.json",
  matchup: "matchup_stats.json",
  battingInnings: "batting_innings.json",
  bowlingInnings: "bowling_innings.json"
};

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

export async function GET(_, { params }) {
  // Await the params object as suggested by the Next.js error message
  const resolvedParams = await params;
  const filename = DATASET_FILES[resolvedParams.dataset];

  if (!filename) {
    return Response.json({ error: "Dataset not found" }, { status: 404 });
  }

  return Response.json(readDataset(filename), {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300"
    }
  });
}
