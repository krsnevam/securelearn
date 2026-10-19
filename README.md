# Agentic AI Labs

Hands-on labs for Modules 07–16 of the **Agentic AI Security & Governance** program. Participants open the app on their phones and work in tables of four or five, in role and against the clock. No technical background is needed.

Live app: https://claude.ai/artifact/2SNepAFvq2HNnVBXJ5NLfS

## The ten labs

| Module | Lab | What participants work with |
|---|---|---|
| 07 Responsible AI | Score one of your own AI systems | Six-principle scorecard, live radar, regulator challenges, 30-day gap |
| 08 Runtime | Sort fifteen agent actions by autonomy | Sort board, agent-loop diagram, risk map, policy generator checked against the sort |
| 09 Architecture | Review the HR Assistant design | Trust-zone diagram, 7 planted flaws among 14 parts, severity and fix per flag |
| 10 Trust | Map the blast radius of one hijacked agent | Radial permission map, live attack chains, blast-radius score, "job still works" check |
| 11 Attacks | Watch an injection, then defend against it | Hidden-text memo demo, context-window view, defence simulator, Gandalf log |
| 12 RAG & MCP | Run the AI tool approval board | Tool manifests, five-check review, risk meter, conditions, rug-pull update round |
| 13 Productization | Go / no-go for ClaimsBot | Readiness pack, private role briefs, conditions that close gates, risk grid, decision memo |
| 14 SOC | Find the attack, build the detection | Two-agent log console, timeline, filters, detection-rule workbench, kill-switch trade-off |
| 15 Governance | Classify eight use cases, brief the board | EU AI Act tiers, internal 4–12 score, portfolio heat map, drafted board report |
| 16 Capstone | Incident tabletop: the Aria leak | Five branching injects, crisis timeline, CERT-In clock, four-axis score, after-action report |

Every lab has a step-by-step clock, suggested answers that stay hidden until revealed, and facilitator notes.

## Running a session

1. Project the app on the main screen. Inside a lab, **Present** enlarges everything.
2. Each table sets its name on the home screen and works through the lab on a phone.
3. At the end, each table taps **Share with the room** and pastes its result code into the room chat.
4. On the projector, open the lab's **Room** tab and paste all the codes at once. The room view compares every table.
5. Reveal answers after the comparison.

Answers are saved in each phone's browser. Nothing is sent anywhere unless a table shares its code.

**Optional live room.** If every participant is signed in to the same claude.ai organization as the artifact's owner, the app can share results live instead of through codes. To turn this on, republish with the `db` capability. That limits access to the organization and disables public links. The code already handles both modes.

## Project layout

```
app/
  index.html          page shell (the artifact host adds the document skeleton)
  css/app.css         design tokens (light and dark) and all component styles
  js/core.js          DOM/SVG builders, state, controls, lab clock, result codes, live room
  js/schematics.js    SVG helpers: edges, radar charts, room-result renderers
  js/labs/m07–m16.js  one file per lab: data, render, answers, aggregation, summary
  js/main.js          home, lab view, tabs, presenter mode, room collector
scripts/
  check-syntax.mjs    syntax-checks every script the page loads
  smoke.mjs           renders every lab and tab in jsdom, clicks every control, checks result codes
```

There is no build step: the scripts are plain browser JavaScript, loaded in order.

## Testing

```
npm install
npm test
```

## Deploying

The app is published as a multi-file Claude artifact from the `app/` folder, with `index.html` as the page and the CSS and JS files alongside it. Republish to the same artifact URL to keep the link participants already have.
