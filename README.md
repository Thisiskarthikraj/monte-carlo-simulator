# Monte Carlo Simulator

A browser-based **question-driven** Monte Carlo tool. Ask a practical planning question (“How many should I prepare tomorrow?”), provide historical data, and get a simple answer—plus optional statistical depth when you want it.

Everything runs **locally in your browser**. Your data is not sent to any server.

## Why this exists

Single-point forecasts (like a plain average) hide uncertainty. Monte Carlo simulation repeats random sampling many times to show a **range of plausible outcomes**. This app wraps that idea in everyday language: expected demand, planning levels, and “prepare for about X”—not “tomorrow will exactly be X.”

## Quick start

```bash
npm install
npm run dev
```

Open the URL from the terminal (usually `http://localhost:5173`).

```bash
npm test      # unit tests
npm run build # production build
```

## How to use it

1. **Ask a question** — e.g. “How many lunches should I prepare tomorrow?” or “How many cars can I expect at 10 AM?”
2. **Add historical data** — simple numbers or time-aware rows / CSV.
3. **Choose planning confidence** (default 90%) — higher means planning for busier scenarios (higher percentiles).
4. Click **Analyze & simulate**.
5. Read the **Result** card (expected value and planning suggestion).
6. Optionally expand **Simulation details** for distributions, percentiles, histogram, CDF, and probability queries.

### Example questions (any domain)

- Canteen: “How many lunches should I prepare tomorrow?”
- Car wash: “How many cars can I expect at 10 AM?”
- Restaurant: “How many customers should I expect Friday at 6 PM?”

The product stays **generic**—you name the variable (Cars, Lunches, Orders, etc.).

## Data formats

### Simple mode

Comma- or line-separated values:

```text
10, 11, 15, 10, 20
```

Best when you do not have dates/times. Time-specific questions require time-aware data.

### Time-aware mode

Table or CSV with columns:

```text
date,time,value
2026-09-01,10:00,5
2026-09-01,11:00,7
```

- **Date:** `YYYY-MM-DD`
- **Time:** `10:00`, `10 AM`, etc.
- **Granularity:** hourly, 30-minute, or 15-minute slots

For questions like “between 10 AM and 12 PM,” the engine uses **daily totals** over that window from your history.

## Question interpretation (local, no LLM)

The app parses common English patterns for:

- **Target** (“how many cars…”, “how much demand…”)
- **Day** (Monday, Friday, tomorrow, today)
- **Time** (at 10 AM, between 5 PM and 7 PM, “evening”)
- **Ambiguity** — e.g. “tomorrow” without a time asks whether you mean the full day or a specific time

An optional LLM layer can be added later; parsing is rule-based today.

## Planning confidence

Default **90%** means: “Prepare for roughly the 90th percentile of simulated outcomes.”

Available levels: 50%, 75%, 80%, 90%, 95%, 99%.

This is a **planning heuristic**, not a guarantee. Copy in the app states that clearly.

## Supported distributions (simulation details)

| Model | Use |
|--------|-----|
| Empirical / Historical | Randomly resample your selected observations (default) |
| Normal | Mean & std dev (defaults from data) |
| Uniform | Min & max |
| Triangular | Min, mode, max |

Simulations default to **100,000** runs (presets up to 1,000,000; hard cap 2,000,000). Work runs in a **Web Worker** to keep the UI responsive.

## Architecture

```text
UI (Vue)
  → questionParser / queryResolver
  → dataSelector (historical rows)
  → monteCarlo + distributions (Web Worker)
  → statistics
  → resultEngine (plain-language answer)
  → charts (details)
```

## Limitations

- Natural-language parsing is heuristic; unusual phrasing may need clearer questions or manual variable names.
- Small samples produce unstable estimates—the app warns when few rows match.
- Day-of-week filters fall back to all data when no matching rows exist (with an explicit message).
- `Math.random()` is fine for exploration, not for cryptographic or regulatory use.
- No backend, accounts, or persistence—refresh clears in-memory state unless you re-enter data.

## Default demo

On load:

- Question: “How many observations might I see in the next period?”
- Data: `10, 11, 15, 10, 20`
- Variable: Observations

Run **Analyze & simulate** to see expected value, median, and a 90% planning suggestion driven by the simulation—not hard-coded text.
