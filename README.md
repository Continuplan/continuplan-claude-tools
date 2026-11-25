# Usage weather

Shows, in the status line under the prompt, how fast you are using your Claude plan allowance, as a weather forecast.

It reads the plan's own usage windows (the 5-hour window and the weekly window), takes the percentage used so far, and works out where you would end up at reset if you carried on at the same pace:

- ☀️ Sunny: on course to use under half
- ⛅ Fair: on course for 50–80%
- 🌧️ Rain: on course for 80–100%
- ⛈️ Storm: on course to run out before the reset
- 🔥 Heatwave: on course to run out well before the reset

Example: `⛅ Fair 5-hour: 40% used, resets in 2h  ·  ☀️ Sunny Weekly: 12% used, resets in 5d`

If no plan reading is available (not on a subscription, or before the first reply of a session), it shows the session's estimated cost instead.

## Install

In Claude Code, type:

```
/plugin install usage-weather --marketplace Continuplan/continuplan-claude-tools
```
