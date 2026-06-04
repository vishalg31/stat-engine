import fs from "fs";
import path from "path";

const DATASET_FILES = {
  players: "players.json",
  career: "career_stats.json",
  season: "season_stats.json",
  teamSeason: "team_season_stats.json",
  phase: "phase_stats.json",
  matchup: "matchup_stats.json",
  battingInnings: "batting_innings.json",
  bowlingInnings: "bowling_innings.json"
};

// In-memory cache: survives across requests on a warm serverless instance,
// eliminating redundant disk reads and JSON.parse calls.
const datasetCache = new Map();

function readDataset(filename) {
  if (datasetCache.has(filename)) {
    return datasetCache.get(filename);
  }

  const filePath = path.join(process.cwd(), "data", filename);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const contents = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const data = Array.isArray(contents) ? contents : [];
    datasetCache.set(filename, data);
    return data;
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
      // s-maxage=300: CDN serves cached for 5 min.
      // stale-while-revalidate=3600: after 5 min, CDN serves stale instantly
      // and revalidates in the background — no cold wait for the user.
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600"
    }
  });
}
