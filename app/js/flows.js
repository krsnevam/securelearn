'use strict';
/* The guided flow of each lab's work task: the numbered steps, what to do,
   and what kind of action each step is. The kinds tell participants what a
   click means:
     decide   – your table's call; nothing is graded until "Check my work"
     simulate – change something and watch the consequences; never graded
     quiz     – pick an answer and see straight away if it is right, and why
     write    – discuss, then type your table's answer
     read     – take in the material; no clicks needed */

const KINDS = {
  decide: { label: 'Decide', hint: 'Your table’s call. Nothing is graded until you tap Check my work.' },
  simulate: { label: 'Simulate', hint: 'Change it and watch what happens. Nothing is graded.' },
  quiz: { label: 'Quiz', hint: 'Pick an answer. You see straight away whether it is right, and why.' },
  write: { label: 'Write', hint: 'Discuss as a table, then type your answer.' },
  read: { label: 'Read', hint: 'Take in the material. No clicks needed.' }
};

const FLOWS = {
  m07: { produce: 'A smaller blast radius, with every attack chain broken and the agent still able to do its job.', steps: [
    ['simulate', 'Choose how the agent signs in', 'Pick an identity model. The scoreboard above and the map change instantly.'],
    ['decide', 'Mark what the attacker can reach', 'Tap each system on the map that a hijacked agent could reach.'],
    ['decide', 'Keep, reduce or cut each permission', 'Break every red attack chain while “Job still works” stays at Yes. Watch the blast radius fall.'],
    ['write', 'Name the worst chain', 'In one line, the attack your table worries about most.']] },
  m08: { produce: 'A scorecard for one of your own AI systems, and one gap you will close in 30 days.', steps: [
    ['write', 'Describe the system you will score', 'Name it (anonymise if needed), its owner and who it affects.'],
    ['decide', 'Score each principle 0, 1 or 2', 'For each test pick a score and write the evidence. The radar draws your shape. The regulator may challenge any score.'],
    ['write', 'Commit to one 30-day gap', 'Your weakest principle is shown. Write what you will fix, who and by when.']] },
  m09: { produce: 'A sort of fifteen agent actions, and a written policy that reproduces it.', steps: [
    ['decide', 'Sort every card into a pile', 'On each card tap In the loop, On the loop or Autonomous. The diagram counts update as you go.'],
    ['simulate', 'Check your sort on the risk map', 'See where your piles land. The consistency check flags risky or over-controlled choices.'],
    ['simulate', 'Turn your instinct into a policy', 'Pick rules. Rows highlighted in the table are where your written policy and your sort disagree: debate those.']] },
  m10: { produce: 'A threat register, a verdict and three deliverables for each platform.', steps: [
    ['decide', 'Warm-up: find the seven planted flaws', 'Tap any box or flow you think is a flaw, then rate it and choose a fix below.'],
    ['read', 'Pick an exercise and read the architecture', 'Choose one of the three platforms. Its parts and boundaries are listed.'],
    ['decide', 'Build the threat register', 'Mark each threat that applies, choose a control, name an owner and rate the residual risk.'],
    ['write', 'Answer the leader’s eight questions', 'One line each, for the platform you picked.'],
    ['decide', 'Give your verdict', 'Yes, with conditions or no, on each of the five criteria.'],
    ['read', 'Hand over the deliverables', 'Drafted automatically from your answers. Copy them into your report.']] },
  m11: { produce: 'An understanding of how indirect injection works and which defences stop which attacks.', steps: [
    ['simulate', 'Watch the hidden-text demo', 'Tap Summarise, then reveal the hidden text to see why the assistant said BANANA.'],
    ['simulate', 'Look inside the context window', 'Pick an attack variant and see exactly what the model receives.'],
    ['simulate', 'Stop all four attacks', 'Switch defences on and off. Try to make every row in the table say “Stopped”.'],
    ['decide', 'Play Gandalf and log your result', 'Open the game on a phone, then record the level you reached and the tricks that worked.']] },
  m12: { produce: 'A covered RAG pipeline and board decisions on three MCP tools.', steps: [
    ['simulate', 'Cover the RAG pipeline', 'Switch controls on. Each stage turns green when a control covers it.'],
    ['simulate', 'Try the data-leakage demo', 'Change who asks and how retrieval works. Watch whether the salary file leaks.'],
    ['decide', 'Review the three MCP tools', 'For each tool run the five checks (Pass or Fail), then approve, add conditions or reject.'],
    ['decide', 'A month later: the update', 'Unlocks once all three tools are decided. Decide what to do with the update.']] },
  m13: { produce: 'A go / no-go decision that follows the readiness rule, and a decision memo.', steps: [
    ['read', 'Read the readiness pack', 'Five areas are ready; two are not. Read what each “No” means.'],
    ['read', 'Read your private brief', 'Each person picks their role on their own phone and reads it privately.'],
    ['simulate', 'Hold the meeting: add conditions', 'Each condition you tap closes a gap or moves a risk on the grid.'],
    ['decide', 'Make the decision', 'Go, go with conditions or no-go, and who signs the residual risk.'],
    ['read', 'Copy the decision memo', 'Drafted from your choices.']] },
  m14: { produce: 'The attack found, detection rules chosen, a kill-switch level pulled and an incident ticket.', steps: [
    ['decide', 'Find the attack in the log', 'Tap every suspicious line. Use the filters to focus on one agent or action.'],
    ['decide', 'Mark where it started', 'Pick the line where the attack entered.'],
    ['simulate', 'Build the detection rules', 'Switch rules on. Lines a rule would alert on get an amber edge.'],
    ['decide', 'Pull a kill-switch level', 'Choose a level and see the trade-off between containment and disruption.'],
    ['read', 'File the incident ticket', 'Drafted from your choices.']] },
  m15: { produce: 'Eight use cases classified, decisions made, board thresholds set and a board report.', steps: [
    ['decide', 'Classify each use case', 'Pick the EU AI Act tier, then open “Score it” and rate the four factors.'],
    ['simulate', 'Read the portfolio', 'The heat map and counts update from your classification.'],
    ['decide', 'Decide, and set board thresholds', 'Approve, add conditions, defer or reject each use case; then set thresholds for the six board numbers.'],
    ['write', 'Finish the board report', 'The first lines are drafted for you. Add risks, decisions and your ask.']] },
  m16: { produce: 'Three capstone deliverables, a crisis score and an after-action report.', steps: [
    ['read', 'See the three capstone exercises', 'Exercises 1 and 2 use the Module 12 and Module 10 labs. Tick deliverables as you finish them.'],
    ['decide', 'Run the incident tabletop', 'Reveal one inject at a time. Choose a response (it cannot be undone) and see what happens next.']] }
};

function kindBadge(kind) { return h('span', { class: 'kind kind-' + kind }, KINDS[kind].label); }

/* A numbered step header inside a lab's work task. */
function stepHead(labId, i) {
  const f = FLOWS[labId]; if (!f || !f.steps[i]) return null;
  const [kind, title, how] = f.steps[i];
  return h('div', { class: 'stephead', id: 'step-' + labId + '-' + i },
    h('div', { class: 'stepnum' }, String(i + 1)),
    h('div', { class: 'stepbody' },
      h('div', { class: 'steprow' }, h('span', { class: 'small' }, 'Step ' + (i + 1) + ' of ' + f.steps.length), kindBadge(kind)),
      h('h3', null, title), h('p', null, how), h('p', { class: 'small' }, KINDS[kind].hint)));
}

/* The mission card at the top of a lab's work task. */
function missionCard(lab) {
  const f = FLOWS[lab.id]; if (!f) return null;
  return h('div', { class: 'mission' },
    h('div', { class: 'missionhead' }, label('Your mission'), h('p', { class: 'missionlead' }, 'You will produce: ' + f.produce)),
    h('ol', { class: 'missionsteps' }, f.steps.map(([kind, title], i) => h('li', null,
      h('a', { href: '#' + lab.id, onclick: e => { e.preventDefault(); const el = document.getElementById('step-' + lab.id + '-' + i); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, title), ' ', kindBadge(kind)))),
    h('p', { class: 'small' }, 'When your table is done, tap ', h('b', null, 'Check my work'), ' at the bottom. It scores your choices and opens the expert answers. Then try the Quick quiz and the Case studies tabs.'));
}
