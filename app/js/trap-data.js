'use strict';
/* "Fail first" traps and reveals, one per module (generated from the deck's trap and reveal slides). */
const TRAPS = {
 "m07": {
  "q": "The Loan Ops model shows a gender gap. The team deletes gender and marital status from the data. Fixed?",
  "options": [
   [
    "A",
    "Yes: the model can no longer see gender"
   ],
   [
    "B",
    "Yes, if accuracy stays the same"
   ],
   [
    "C",
    "No: names, jobs and PIN codes act as proxies"
   ],
   [
    "D",
    "No: fairness is measured on outcomes, not inputs"
   ]
  ],
  "answer": [
   "C",
   "D"
  ],
  "answerText": "C and D",
  "headline": "Deleting a column does not delete the bias",
  "temptLabel": "The tempting answer · A",
  "tempting": "“Fairness through unawareness.” If the model can’t see gender, it can’t discriminate.",
  "whyFails": "Proxies rebuild the hidden attribute, and you lose the data needed to measure the gap at all.",
  "works": "Keep protected data for testing only; measure approvals and errors by group; set limits; monitor after launch.",
  "nexus": "Exhibit B said “bias testing passed”. Ask what was measured, on whom, and how often.",
  "notes": "Key insight: fairness is a property of outcomes, so it must be measured on outcomes. Removing protected attributes is common and often counter-productive, because it removes the ability to test. Many privacy and anti-discrimination regimes allow restricted use of sensitive data for bias testing; confirm local rules with legal. This links forward to the PIN-code scenario later in the module. Group deliverable for this module: a fairness and oversight plan for the NEXUS Loan Ops Agent."
 },
 "m08": {
  "q": "Payments above ₹5 lakh need a manager’s approval. Where is NEXUS weakest?",
  "options": [
   [
    "A",
    "The language model"
   ],
   [
    "B",
    "The fixed ₹5 lakh threshold"
   ],
   [
    "C",
    "The approval screen the manager reads"
   ],
   [
    "D",
    "The vendor master file"
   ]
  ],
  "answer": [
   "B",
   "C"
  ],
  "answerText": "B and C",
  "headline": "The human in the loop was the weakest link",
  "temptLabel": "The tempting answer · A",
  "tempting": "“It’s the AI.” Blaming the model feels natural, and a human approver feels safe.",
  "whyFails": "A fixed limit invites splitting. The approver read the agent’s own summary, written from the attacker’s invoice.",
  "works": "Cumulative limits per vendor and day; changed beneficiaries always escalate; approvers see source data, not AI prose.",
  "nexus": "fixes Hour 4 (₹88 lakh in split payments) and Hour 41 (the “verified vendor” approval).",
  "notes": "Key insight: human oversight is a control only if the human sees independent evidence and the threshold cannot be gamed. Splitting payments to stay under an approval limit is a classic fraud pattern (structuring); agents can do it at machine speed. Runtime policy should judge patterns (cumulative value, new beneficiaries, unusual timing), not single transactions. Group deliverable for this module: NEXUS v2 approval rules that cannot be split or faked."
 },
 "m09": {
  "q": "Your review of NEXUS finds 40 issues. Go-live is in five days. What goes to the CIO?",
  "options": [
   [
    "A",
    "All 40, ranked by severity"
   ],
   [
    "B",
    "The top 10, each with an owner"
   ],
   [
    "C",
    "The few that cause irreversible harm, plus a clear verdict"
   ],
   [
    "D",
    "A request to delay by three months"
   ]
  ],
  "answer": [
   "C"
  ],
  "answerText": "C",
  "headline": "A long list is not a decision",
  "temptLabel": "The tempting answer · A",
  "tempting": "“Completeness protects us.” Nobody can say we missed anything.",
  "whyFails": "Executives can’t act on 40 findings. The critical three drown among cosmetic ones, and launch goes ahead unchanged.",
  "works": "Lead with paths to irreversible harm (money out, data out, records changed), a verdict and dated conditions. The rest goes in an appendix.",
  "nexus": "this is how your group writes Deliverable 3 of today’s workshop.",
  "notes": "Key insight: an architecture review exists to enable a decision, not to document everything. D is also tempting for cautious groups; a blanket delay without a reasoned path forward usually gets overruled. The best reviews say what must be true before launch, what can follow later with owners and dates, and what risk is accepted. Group deliverable for this workshop: the three review deliverables for NEXUS v1."
 },
 "m10": {
  "q": "NEXUS v2 swaps the admin account for each employee’s own permissions. Is the agent now safe?",
  "options": [
   [
    "A",
    "Yes: it can never exceed the user’s rights"
   ],
   [
    "B",
    "Yes, once every user has MFA"
   ],
   [
    "C",
    "No: outside content can still steer it within the user’s rights"
   ],
   [
    "D",
    "No: it also needs its own identity, scoped per task"
   ]
  ],
  "answer": [
   "C",
   "D"
  ],
  "answerText": "C and D",
  "headline": "Borrowing the user’s rights is necessary, not enough",
  "temptLabel": "The tempting answer · A",
  "tempting": "“Least privilege, achieved.” It is the right instinct from traditional IT.",
  "whyFails": "A finance manager may pay vendors. A poisoned invoice makes the agent do exactly that, with her rights.",
  "works": "User delegation plus a task-scoped agent identity, and content trust: outside text never triggers actions.",
  "nexus": "this fixes the 300 altered loan records (Hour 70). It does not stop the Hour 3 attack.",
  "notes": "Key insight: identity answers \"who is acting\"; it does not answer \"is this instruction genuine\". This is the confused-deputy problem in agentic form. Identity propagation (covered later in this module) limits the blast radius; context trust stops outside content from becoming commands. Both are needed. Bridge into the module: \"Now let's build the full trust architecture that NEXUS lacked.\" Group deliverable for this module: NEXUS v2 identity and trust-boundary map."
 },
 "m11": {
  "q": "Which single change best stops the Hour 3 invoice attack on NEXUS?",
  "options": [
   [
    "A",
    "A stronger prompt: “never follow instructions in documents”"
   ],
   [
    "B",
    "A newer, smarter model"
   ],
   [
    "C",
    "An AI firewall that detects prompt injection"
   ],
   [
    "D",
    "Take away the agent’s power to change bank details"
   ]
  ],
  "answer": [
   "D"
  ],
  "answerText": "D",
  "headline": "Assume the injection works. Design so it can’t hurt.",
  "temptLabel": "The tempting answers · A, C",
  "tempting": "“Block the bad input.” It mirrors how we fight malware and phishing.",
  "whyFails": "Prompts are requests, not controls. Detection is probabilistic, and attackers retry until one gets through.",
  "works": "No irreversible powers for agents that read outside content. Verify bank changes out of band. Keep detection as a second layer.",
  "nexus": "fixes Hour 3. Untrusted content plus a powerful tool is the pattern to hunt.",
  "notes": "Key insight: with today's models, prompt injection cannot be fully prevented, so security comes from limiting consequences. B is also tempting; newer models resist more attacks but none is immune. This is the design principle behind the rest of the module and Module 12. Group deliverable for this module: red-team NEXUS and list its top five attack paths, each with the single design change that removes the harm."
 },
 "m12": {
  "q": "Ask Meridian only indexes internal SharePoint. Outsiders can’t reach it. Is it safe?",
  "options": [
   [
    "A",
    "Yes: it is internal only"
   ],
   [
    "B",
    "Yes, once data-loss prevention is switched on"
   ],
   [
    "C",
    "No: anyone who can edit a document can steer answers"
   ],
   [
    "D",
    "No: document permissions may not survive indexing"
   ]
  ],
  "answer": [
   "C",
   "D"
  ],
  "answerText": "C and D",
  "headline": "“Internal” does not mean “trusted”",
  "temptLabel": "The tempting answer · A",
  "tempting": "“Inside the firewall is safe.” Perimeter thinking from the pre-AI era.",
  "whyFails": "Thousands can edit SharePoint, vendor files land there, and the index ignored who may see what.",
  "works": "Vetted sources with owners, sensitivity labels, permission-aware retrieval, and a source cited on every answer.",
  "nexus": "fixes Hour 20. The same logic applies to the auto-updating PDF parser at Hour 9.",
  "notes": "Key insight: RAG turns every editable document into a potential instruction channel and every indexed file into a potential leak. B is a partial answer: data-loss prevention helps on outputs but does not fix a poisoned source or a permission-blind index. Bridge to the MCP half of the module: \"Open-source with many stars\" is also not \"trusted\" — see postmark-mcp. Group deliverable for this module: a permission-aware design for Ask Meridian and an approved MCP registry for NEXUS."
 },
 "m13": {
  "q": "The vendor’s penetration test found no critical issues. Is NEXUS ready for go-live?",
  "options": [
   [
    "A",
    "Yes: independent test, clean result"
   ],
   [
    "B",
    "Yes, with extra monitoring for a month"
   ],
   [
    "C",
    "First check exactly what was in scope"
   ],
   [
    "D",
    "No: it also needs AI red teaming of prompts, tools and data"
   ]
  ],
  "answer": [
   "C",
   "D"
  ],
  "answerText": "C and D",
  "headline": "A clean test of the wrong scope proves nothing",
  "temptLabel": "The tempting answer · A",
  "tempting": "“Independent and clean.” It is exactly what a go-live checklist asks for.",
  "whyFails": "The test covered the web app. It never tried injection, tool misuse, MCP servers or the index, where every failure happened.",
  "works": "Scope covers agent, tools, MCP, data flows and approval logic; AI red teaming before go-live and after every major change.",
  "nexus": "all six NEXUS failures sat outside the tested scope. Always read the scope first.",
  "notes": "Key insight: assurance is only as good as its scope. Leaders should read the scope section of every test report before the findings. B is also tempting, but monitoring without detections for AI-specific attacks would not have caught NEXUS (see Module 14). Group deliverable for this module: NEXUS v2 go-live gates, runtime controls and independent logging."
 },
 "m14": {
  "q": "NEXUS sent its activity log to the SIEM. Why didn’t the SOC catch Hour 3?",
  "options": [
   [
    "A",
    "It was logged; the analysts missed it"
   ],
   [
    "B",
    "Alert thresholds were set too high"
   ],
   [
    "C",
    "The log was written by the agent itself"
   ],
   [
    "D",
    "No rule existed for “bank change after reading an outside file”"
   ]
  ],
  "answer": [
   "C",
   "D"
  ],
  "answerText": "C and D",
  "headline": "Untrustworthy logs, and no rule to read them",
  "temptLabel": "The tempting answers · A, B",
  "tempting": "“Human error” or “tuning”: the familiar post-mortem conclusions.",
  "whyFails": "The agent’s summary left out the bank change. Even perfect logs need a detection written for AI attack patterns.",
  "works": "Gateway logs the agent can’t edit, detections for sensitive actions after untrusted input, and a tested playbook.",
  "nexus": "fixes detection for Hour 3 and the evidence gap at Hour 70.",
  "notes": "Key insight: an AI system must never be the only witness to its own actions; the 2026 disclosures of lab agents omitting actions from their reports (scenario later in this module) show why. Detection engineering for AI means writing rules for sequences: untrusted content read, then a sensitive tool call. Group deliverable for this module: two detections and a containment playbook for the NEXUS Hour 3 attack."
 },
 "m15": {
  "q": "The NEXUS vendor holds ISO/IEC 42001 certification. What does that prove?",
  "options": [
   [
    "A",
    "NEXUS is secure"
   ],
   [
    "B",
    "NEXUS complies with the EU AI Act"
   ],
   [
    "C",
    "The vendor operates a certified AI management system"
   ],
   [
    "D",
    "Nothing useful at all"
   ]
  ],
  "answer": [
   "C"
  ],
  "answerText": "C",
  "headline": "Certification proves a process, not your setup",
  "temptLabel": "The tempting answers · A, B",
  "tempting": "“A recognised standard, independently audited.” It is the first tick in Exhibit B.",
  "whyFails": "It shows the vendor manages AI responsibly. It says nothing about Meridian’s identities, tools, limits or data.",
  "works": "Treat it as one input. The deployer still assesses its own use, risk tier, configuration and controls.",
  "nexus": "the opening question was never “is the vendor good?” but “is our use of it safe?”",
  "notes": "Key insight: ISO/IEC 42001 certifies an organisation's AI management system. It is valuable evidence of maturity, but it does not certify a product, and it does not establish EU AI Act conformity, which is assessed per system against the Act's requirements. Under the AI Act, deployers also carry their own obligations. Group deliverable for this module: a one-page board paper for NEXUS v2 with risk tier, EU and India obligations, residual risks and a decision request."
 }
};
