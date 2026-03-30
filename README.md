# IPL Stat Engine

A mobile-first IPL stats app built with Next.js, Tailwind CSS, and Framer Motion.

It combines two core experiences:

- `Ask Stats`: guided stat queries for batting, bowling, season, team, and all-time views
- `Battle Mode`: head-to-head comparisons including batter vs bowler, batter vs batter, bowler vs bowler, and year vs year

## Features

- Quick Query flow for common IPL stat questions
- Compare and Explore result views
- Matchup-focused battle mode
- Season, team, and all-time record exploration
- Batting-innings and bowling-innings record views
- Data pipeline built from raw IPL match JSON

## Tech Stack

- Next.js
- React
- Tailwind CSS
- Framer Motion

## App Structure

Main app files:

- `app/`
- `components/stat-engine/`
- `lib/stat-engine/`
- `data/`

Data pipeline:

- `scripts/stat-engine/buildStatEngineData.js`
- `scripts/stat-engine/validateStatEngineData.js`

## Local Development

From the workspace root:

```bash
npm run dev:stat-engine
```

The app runs at:

```text
/stat-engine
```

If you are running it locally with the current config, the default URL is typically:

```text
http://localhost:3000/stat-engine
```

## Data Commands

Build the stat datasets:

```bash
npm run build:data:stat-engine
```

Validate the generated datasets:

```bash
npm run validate:data:stat-engine
```

## Deployment

This app is intended to be deployed as its own Vercel project.

Recommended Vercel root directory:

```text
apps/stat-engine
```

The app uses:

```text
basePath: /stat-engine
```

So the deployed app should be served at:

```text
/stat-engine
```

## Cricket Hub Integration

The app can also be linked from a separate Cricket Hub project.

For that setup:

- add a hub card that links to `/stat-engine`
- rewrite `/stat-engine` to the deployed Stat Engine project
- set `STAT_ENGINE_URL` in the hub deployment environment

## Notes

- Quick Query is the primary user flow
- Advanced Filters are intentionally deferred for a later version
- The app is designed to work well on both mobile and desktop, with mobile-first layout decisions
