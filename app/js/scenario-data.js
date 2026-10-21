'use strict';
/* Scenarios and leadership discussions from the program deck (generated from the deck's slides and facilitator notes). */
const SCENARIOS = {
 "m07": [
  {
   "id": "s1",
   "tag": "Real case · May 2025",
   "title": "An AI hiring screener goes to court",
   "whatLabel": "What happened",
   "what": "In Mobley v. Workday, a US court let an age-discrimination claim over AI applicant screening proceed as a nationwide collective action. The court had already accepted that an AI vendor can be treated as the employer’s agent.",
   "situationLabel": "Your situation",
   "situation": "HR wants a vendor’s AI to shortlist 40,000 campus applicants this season. The vendor says the model is “bias-tested” but will not share the results.",
   "minutes": 15,
   "q": [
    "If the shortlist is biased, who is accountable: the vendor or us?",
    "What bias evidence do we demand before signing?",
    "At which step must a human make the decision?"
   ],
   "source": "Source: Mobley v. Workday, US District Court, Northern District of California; collective action certified May 2025",
   "notes": "Principle tested: accountability, fairness, human oversight. Model answer. 1) Accountability cannot be outsourced: the deploying company answers to candidates and regulators, and this case shows the vendor may share liability too. 2) Demand selection rates by group (gender, age band, region, college tier), the adverse-impact ratio (the US four-fifths rule is a useful benchmark), testing on Indian applicant data, and contractual audit rights. \"Bias-tested\" without results is not evidence. 3) A human should review all rejections near the cut-off, or a random sample, and candidates should have a route to request review. Bonus point: hiring is listed as high-risk under the EU AI Act, so any EU candidates raise the stakes. Debrief question: would your procurement team have caught this?"
  },
  {
   "id": "s2",
   "tag": "Real case · Oct 2025",
   "title": "The AI-drafted report that cost a refund",
   "whatLabel": "What happened",
   "what": "Deloitte Australia agreed to refund part of an AU$440,000 government review after an academic found fabricated references and an invented court quote. The corrected version disclosed that generative AI had been used in drafting.",
   "situationLabel": "Your situation",
   "situation": "Your strategy team uses GenAI to draft board papers and client reports. Nobody tracks which documents used AI, and nobody checks citations.",
   "minutes": 15,
   "q": [
    "Do we disclose AI use to clients and the board?",
    "Who verifies every fact and citation before release?",
    "What changes in our sign-off policy on Monday?"
   ],
   "source": "Source: public reporting (Associated Press, The Guardian), October 2025",
   "notes": "Principle tested: transparency and accountability. Model answer. 1) Yes: disclose material AI use in client deliverables and board papers; many clients now ask for it in contracts. 2) The named author, not the tool, verifies every reference and quote; for high-stakes documents add a second reviewer. 3) A one-page policy: record AI use per document, ban AI-generated citations that are not checked against the source, and require the signatory to confirm verification. Discussion hook: hallucinated citations are a reputational risk, not just a quality issue, because they look like dishonesty. Ask: how many documents left your organization last month with unchecked AI content?"
  },
  {
   "id": "s3",
   "tag": "Realistic scenario · Banking",
   "title": "The PIN-code problem",
   "whatLabel": "The situation",
   "what": "A private bank’s AI pre-approves personal loans in 90 seconds. Approval rates in four districts run 18 points below the state average. The model never sees religion or caste, but it does use PIN code and phone model.",
   "situationLabel": "The twist",
   "situation": "A journalist has the numbers and calls at 10 a.m. tomorrow. RBI’s FREE-AI framework expects board-approved AI policy and fairness testing.",
   "minutes": 15,
   "q": [
    "Pause the model, or keep it running while we investigate?",
    "Which of the six principle tests did we fail?",
    "What do we tell the journalist and the customers affected?"
   ],
   "source": "Built on: RBI Committee report, Framework for Responsible and Ethical Enablement of AI (FREE-AI), August 2025",
   "notes": "Composite scenario; the figures are fictional. Principle tested: fairness and explainability; the key concept is proxy discrimination, where neutral-looking data such as PIN code or phone model stands in for protected characteristics. Model answer. 1) Do not simply switch off: route affected districts to manual underwriting while the model is investigated, so customers are not harmed either way. 2) Fairness (outcomes not measured by region), explainability (cannot explain a decline), accountability (no owner watching outcomes). 3) Be factual: acknowledge the disparity, explain the interim manual review, commit to an independent fairness review, and offer declined applicants a re-assessment. RBI's FREE-AI report (August 2025) sets out principles and recommendations for regulated entities, including board-approved AI policies; check the latest supervisory expectations with compliance."
  }
 ],
 "m08": [
  {
   "id": "s1",
   "tag": "Real case · Aug 2025",
   "title": "18,000 cups of water",
   "whatLabel": "What happened",
   "what": "Taco Bell’s drive-thru voice AI went viral after a customer ordered 18,000 cups of water, alongside clips of it looping on simple orders. The chain said it was rethinking where AI is used and when staff should take over, especially at busy times.",
   "situationLabel": "Your situation",
   "situation": "Your voice agent takes orders and bookings for 600 outlets. Pranksters have started posting videos of tricking it.",
   "minutes": 15,
   "q": [
    "Which signals should hand a call to a human instantly?",
    "Who can change those limits during a peak hour?",
    "How do we prove that handoffs actually work?"
   ],
   "source": "Source: public reporting (Wall Street Journal, BBC), August 2025",
   "notes": "Concept tested: runtime policy and adaptive controls. Model answer. 1) Handoff triggers: order quantity or value outside normal range, repeated corrections, the customer asking for a person, low speech-recognition confidence, and abusive or nonsense input. 2) The operations duty manager, through a configuration screen, not a code release; changes are logged. 3) Track handoff rate, time to human, and mystery-shopper tests every week. Leadership point: the reputational cost here came from virality, not money. A one-line rule such as \"quantities above 20 need staff confirmation\" would have prevented the headline."
  },
  {
   "id": "s2",
   "tag": "Real case · Feb 2026",
   "title": "The agent that would not stop",
   "whatLabel": "What happened",
   "what": "An AI security researcher at Meta asked her OpenClaw agent to suggest emails to delete or archive. Instead it began deleting them itself, and ignored the stop commands she sent from her phone.",
   "situationLabel": "Your situation",
   "situation": "Sales wants an agent that cleans up the CRM and inboxes overnight, with a “suggest” mode and an “act” mode.",
   "minutes": 15,
   "q": [
    "What must be proven before “suggest” becomes “act”?",
    "What does a stop button that really works look like?",
    "Which actions always need a confirmation?"
   ],
   "source": "Source: OWASP GenAI Exploit Round-up Report, Q1 2026",
   "notes": "Concept tested: intervention and escalation. No attacker was involved: this was the agent misreading its goal. Model answer. 1) A pilot in suggest mode with measured accuracy, a small action allowlist, and a business owner's sign-off. 2) A real stop works outside the agent: it revokes the agent's access token or pauses it at the gateway. Asking the agent to stop is just another instruction it may ignore. 3) Deletes, sends to external parties, payments and permission changes. Also: prefer reversible actions (archive instead of delete, with a 30-day undo). Link back to rung 5, the kill switch, on the escalation ladder."
  },
  {
   "id": "s3",
   "tag": "Realistic scenario · Aviation",
   "title": "Rebooking two lakh passengers by morning",
   "whatLabel": "The situation",
   "what": "A week of mass cancellations hits a large Indian airline. Its rebooking agent can issue travel vouchers up to ₹10,000 without approval. Overnight, request volume jumps 40 times.",
   "situationLabel": "The twist",
   "situation": "By 2 a.m. fraudsters are claiming vouchers for flights they never booked, while genuine passengers rage online about the waits.",
   "minutes": 15,
   "q": [
    "Tighten autonomy, loosen it, or both by customer segment?",
    "Who can change the limits at 2 a.m.?",
    "What must the duty manager’s dashboard show?"
   ],
   "source": "Composite scenario built from public patterns of airline disruption and voucher fraud; figures are illustrative",
   "notes": "Concept tested: adaptive risk controls; the same agent needs different limits for different risk signals. Model answer. 1) Both: loosen for verified passengers on cancelled flights (PNR matched to a cancelled flight, so instant voucher), tighten for unmatched or new accounts (human review, lower cap). 2) A named duty manager with pre-approved crisis settings, a \"crisis mode\" switch agreed before the crisis. 3) Voucher volume and value per hour, the match rate against cancelled PNRs, the fraud-flag rate, queue length and the handoff rate. Leadership point: crises are when autonomy is most valuable and most abused, so pre-agree the crisis playbook."
  },
  {
   "id": "s4",
   "tag": "Realistic scenario · Healthcare",
   "title": "The silent model upgrade",
   "whatLabel": "The situation",
   "what": "A hospital chain’s AI drafts discharge summaries for doctors to sign. The vendor upgrades the model without notice. Two weeks later, a nurse spots a summary missing a drug allergy.",
   "situationLabel": "The twist",
   "situation": "A quick audit finds allergies dropped in 2 of every 100 summaries. No alert fired, because nothing technically broke.",
   "minutes": 15,
   "q": [
    "Roll back, add human checks, or both?",
    "Which feedback loop should have caught this in hours?",
    "What do we now require in the vendor contract?"
   ],
   "source": "Composite scenario; figures are illustrative",
   "notes": "Concept tested: self-correcting systems and real-time feedback loops. Model answer. 1) Both: pin or roll back the previous model version, and immediately add a mandatory allergy cross-check against the medication record before signature. Re-review summaries issued in the last two weeks for patients with recorded allergies. 2) An automated daily evaluation set (known cases where the right answer is known), plus a field-level check comparing structured data such as allergies with the generated text, with alerts on any drop. 3) Advance notice of model changes, the right to pin versions, and shared evaluation results. Leadership point: \"signed by a doctor\" is weak oversight if doctors sign 60 summaries a shift; design the check, do not assume it."
  }
 ],
 "m09": [
  {
   "id": "s1",
   "tag": "Research finding · Sep 2025",
   "title": "ForcedLeak: a breach for five dollars",
   "whatLabel": "What happened",
   "what": "Noma Security showed that hidden instructions in a public Web-to-Lead form could make Salesforce Agentforce send CRM data out. The destination was still on the trusted-domain list but had expired; the researchers bought it for $5. Salesforce has fixed it.",
   "situationLabel": "Your situation",
   "situation": "Marketing wants an agent that reads every inbound lead and drafts replies inside your CRM.",
   "minutes": 15,
   "q": [
    "Draw the trust boundaries: where does untrusted text enter?",
    "Which boundary failed in ForcedLeak?",
    "Name two controls that would have stopped it."
   ],
   "source": "Source: Noma Security research disclosure, September 2025 (rated critical, CVSS 9.4, by the researchers)",
   "notes": "Concept tested: trust boundaries and threat mapping. Model answer. 1) Untrusted text enters at the public web form, which any outsider can fill in, and then flows into CRM records the agent later reads as trusted. 2) Two failed together: the agent treated lead data as instructions, and the outbound allowlist trusted a domain nobody owned any more. 3) Treat CRM fields from public forms as data only, with no tool calls triggered by them; maintain the outbound allowlist and review it (expired domains removed); block the agent from rendering external images or links; require approval before data leaves the CRM. Leadership point: a forgotten domain registration became a security hole. Asset hygiene matters more with agents."
  },
  {
   "id": "s2",
   "tag": "Research finding · Jan 2026",
   "title": "A meeting invite that briefs the attacker",
   "whatLabel": "What happened",
   "what": "Miggo Security sent a calendar invite with dormant instructions hidden inside. Later, when the user asked Gemini to summarise their day, it copied private meeting details into an event the attacker could see.",
   "situationLabel": "Your situation",
   "situation": "Your CXOs want an executive-assistant agent with access to their mail, calendar and document drive, by next month.",
   "minutes": 15,
   "q": [
    "Which inputs to this agent are untrusted?",
    "What should it never do right after reading them?",
    "Which data should be out of its reach entirely?"
   ],
   "source": "Source: Miggo Security research, January 2026, summarised by the Cloud Security Alliance, April 2026",
   "notes": "Concept tested: reviewing an architecture for indirect injection. Model answer. 1) Anything an outsider can send: emails, calendar invites, shared documents, meeting titles and descriptions. Executives receive a lot of these. 2) Create or edit calendar events, send email, or share files, without the executive confirming. 3) Board papers, M&A folders and HR files should be outside its default scope, available only on explicit request. Leadership point: executive assistants are the highest-value target because CXO inboxes hold the most sensitive data and receive the most outside content. Start with read-only plus drafts that a human sends."
  },
  {
   "id": "s3",
   "tag": "Realistic scenario · Insurance",
   "title": "Five flaws, fifteen minutes, go-live Friday",
   "whatLabel": "The situation",
   "what": "A motor insurer’s claims agent reads customer photos and PDFs, checks the policy database and pays claims up to ₹1.5 lakh through the payments API.",
   "situationLabel": "The twist",
   "situation": "It runs on one shared admin account. Its prompt says “never pay fraudulent claims”. It logs only errors. The CEO has announced the launch.",
   "minutes": 15,
   "q": [
    "Find five design flaws.",
    "Rank them by business impact.",
    "Go, go with conditions, or stop?"
   ],
   "source": "Composite scenario for the architecture review workshop; figures are illustrative",
   "notes": "Concept tested: the eight review questions from earlier in this module. Answer key, at least seven flaws: (1) customer uploads are untrusted and can carry hidden text instructions; (2) a shared admin account gives the agent far more power than a claims handler; (3) the fraud rule lives in the prompt, not in code; (4) payouts up to ₹1.5 lakh with no human threshold; (5) error-only logs mean no audit trail of decisions; (6) no rate limit on payouts per hour or per policy; (7) no tested kill switch. Strong answer on question 3: go with conditions. Launch in \"recommend\" mode with a human approving payouts above a low threshold, a dedicated agent identity, full decision logging, and payout rate limits; move to autonomy after 30 days of measured accuracy. Leadership point: a public launch date is not a control."
  }
 ],
 "m10": [
  {
   "id": "s1",
   "tag": "Real case · Aug 2025",
   "title": "Stolen keys from a chat widget",
   "whatLabel": "What happened",
   "what": "Attackers stole the access tokens used by Salesloft’s Drift AI chat integration. With them, they pulled data from the Salesforce systems of hundreds of companies, including several major security vendors.",
   "situationLabel": "Your situation",
   "situation": "Over the past year, teams have connected more than 30 AI tools to email, CRM and file storage. Nobody holds a full list of their tokens.",
   "minutes": 15,
   "q": [
    "Who owns the inventory of AI integrations and their tokens?",
    "Could we revoke one vendor’s tokens within an hour?",
    "What scope and expiry rules apply from now on?"
   ],
   "source": "Source: Google Threat Intelligence Group advisory (UNC6395) and vendor disclosures, August–September 2025",
   "notes": "Concept tested: supply chain trust and token misuse. The attacker never touched the victims' own systems directly; they used a trusted integration's keys. Model answer. 1) Security owns the inventory, but each integration needs a business owner who justifies it. Most organizations can find these tokens in their SaaS admin consoles (connected apps). 2) Test it: run a revocation drill for one vendor and time it. 3) Least scope (read only what is needed), short expiry with refresh, IP restrictions where possible, and alerts on unusual bulk data pulls by integrations. Leadership point: every \"connect your CRM\" button on an AI tool creates a long-lived key to your data held by someone else."
  },
  {
   "id": "s2",
   "tag": "Real case · Jun 2025",
   "title": "The password was 123456",
   "whatLabel": "What happened",
   "what": "Security researchers logged into the admin side of McHire, McDonald’s AI hiring chatbot run by Paradox.ai, using “123456” as username and password. They could reach records of up to 64 million applicants. The vendor fixed it quickly once told.",
   "situationLabel": "Your situation",
   "situation": "Procurement is about to sign an AI chatbot vendor that will hold your customers’ personal data.",
   "minutes": 15,
   "q": [
    "Which five questions do we ask before any data flows?",
    "What evidence beats the vendor’s word?",
    "Who signs off vendor AI risk, and how often?"
   ],
   "source": "Source: disclosure by researchers Ian Carroll and Sam Curry, June–July 2025; Paradox.ai statement",
   "notes": "Concept tested: trust in AI vendors and their supply chain. The AI itself was not the weak point; basic security around it was. Model answer. 1) Where is our data stored and for how long? Who at the vendor can access it, and how is admin access protected (MFA, no default accounts)? Is our data used to train models? What certifications and recent penetration tests exist? How fast will they notify us of a breach? 2) Independent evidence: a current ISO 27001 or SOC 2 report, a recent penetration test summary, a right-to-audit clause, and a short technical review by your own team. 3) The governance council's vendor process, re-checked yearly and on any major product change. India angle: under the DPDP Act the company that decides why data is collected (the data fiduciary) stays responsible for what its processors do."
  },
  {
   "id": "s3",
   "tag": "Research finding · Mar 2026",
   "title": "The double agent in the cloud",
   "whatLabel": "What happened",
   "what": "Palo Alto Networks’ Unit 42 showed that an agent deployed on Google’s Vertex AI inherited broad default permissions from a platform service account. The researchers used them to extract credentials and reach restricted resources. Google revised its guidance.",
   "situationLabel": "Your situation",
   "situation": "To hit a quarter-end launch, your team is deploying ten agents on a major cloud platform with default settings.",
   "minutes": 15,
   "q": [
    "Who reviews the permissions an agent gets by default?",
    "What is the blast radius if one agent is hijacked?",
    "Delay the launch to fix identities, or not?"
   ],
   "source": "Source: Unit 42 research, March–April 2026, summarised in the OWASP GenAI Exploit Round-up, Q1 2026",
   "notes": "Concept tested: least privilege and identity for agents. Model answer. 1) Cloud security, as part of the design gate; \"default\" is a decision someone made for you. 2) With inherited broad permissions, potentially every resource that service account can reach, which may extend beyond the project. 3) A short delay is usually right: give each agent its own identity with only the permissions it needs. If the business insists on the date, launch the lowest-risk agents first with restricted identities and hold the rest. Leadership point: cloud providers share responsibility, but configuration is yours. This links to the \"assume breach\" principle of Zero Trust."
  }
 ],
 "m11": [
  {
   "id": "s1",
   "tag": "Real case · Jul 2025",
   "title": "A wiper prompt in an official extension",
   "whatLabel": "What happened",
   "what": "An attacker got a malicious prompt merged into Amazon Q Developer’s official VS Code extension, telling its AI agent to wipe local files and cloud resources. The tampered version shipped before AWS pulled it; AWS said no customer resources were affected.",
   "situationLabel": "Your situation",
   "situation": "400 of your developers use AI coding agents that can reach terminals and cloud credentials.",
   "minutes": 15,
   "q": [
    "Who reviews prompts and agent instructions like code?",
    "What can an agent on a developer laptop reach today?",
    "How fast could we roll back a bad extension?"
   ],
   "source": "Source: AWS security bulletin and public reporting, July 2025",
   "notes": "Concept tested: tool abuse and supply chain; natural-language instructions are now executable. Model answer. 1) Prompts, agent rules and skill files go through the same code review and approval as source code, with two reviewers for anything shipped to many users. 2) Usually far too much: local files, cloud command-line credentials, browser sessions. Run coding agents with scoped, short-lived credentials and without production access. 3) Maintain an approved list of AI extensions with pinned versions, pushed by device management so you can roll back centrally. Leadership point: in agentic systems, \"a prompt\" can delete infrastructure. Treat it like code."
  },
  {
   "id": "s2",
   "tag": "Real case · 2026",
   "title": "Traps for agents on the open web",
   "whatLabel": "What happened",
   "what": "Forcepoint and Unit 42 found live web pages hiding instructions for AI agents: a $5,000 PayPal transfer, file-deletion commands, and a push to make an AI hiring screener approve fake candidates. Google measured a 32% rise in such content in three months.",
   "situationLabel": "Your situation",
   "situation": "Your research and procurement agents browse supplier and competitor websites every day.",
   "minutes": 15,
   "q": [
    "What may an agent do right after reading a web page?",
    "Which of our agents could move money or data?",
    "How would we know if one had been triggered?"
   ],
   "source": "Source: Cloud Security Alliance research note on indirect prompt injection in the wild, April 2026",
   "notes": "Concept tested: indirect prompt injection is no longer theoretical; attackers are seeding the web for agents. The Google figure is a 32% relative increase in malicious injection content on crawled pages between November 2025 and February 2026. Model answer. 1) After reading untrusted content, an agent should be limited to read-only actions and drafting; payments, sending data out and running commands need fresh human approval. 2) Map them now: any agent with web access plus a payment, email or shell tool is the risky combination. 3) Log every tool call after browsing and alert on sensitive tool calls that follow external content. Live demo idea for the room: show a harmless hidden-text document that makes an assistant end its summary with a codeword."
  },
  {
   "id": "s3",
   "tag": "Real case · 2025–26",
   "title": "The attackers have agents too",
   "whatLabel": "What happened",
   "what": "Anthropic reported that a state-sponsored group used Claude Code to run 80–90% of an espionage campaign against about 30 organisations. In early 2026, attackers used AI to help breach Mexican government agencies, reportedly taking about 150 GB.",
   "situationLabel": "Your situation",
   "situation": "Your SOC takes six hours, on average, to respond to a high-severity alert.",
   "minutes": 15,
   "q": [
    "What breaks when attacks run at machine speed?",
    "Where should our own defence be automated?",
    "Which decisions must stay with a human?"
   ],
   "source": "Sources: Anthropic threat intelligence report, November 2025; OWASP GenAI Exploit Round-up, Q1 2026",
   "notes": "Concept tested: the attacker side of agentic AI. Anthropic disclosed the campaign in November 2025, attributing it with high confidence to a Chinese state-sponsored group; humans intervened only at a few decision points, and the AI sometimes hallucinated results. The Mexico case was publicly reported in February 2026. Model answer. 1) Response times measured in hours, manual triage of every alert, and patch cycles measured in weeks. 2) Automated containment for well-understood patterns: isolate a device, revoke a token, block an indicator. 3) Actions with major business impact, such as shutting down a production system or notifying regulators. Leadership point: this is the business case for Module 14. Defence has to move at a speed matched to the attack."
  },
  {
   "id": "s4",
   "tag": "Real case · 2024, now cheaper",
   "title": "The CFO who was never on the call",
   "whatLabel": "What happened",
   "what": "An Arup employee in Hong Kong paid out about US$25 million after a video call in which the CFO and colleagues were all deepfakes. Voice and video cloning have since become cheaper and faster.",
   "situationLabel": "Your situation",
   "situation": "Your new accounts-payable agent processes vendor emails. A “vendor CFO” emails a bank-change request, then calls to confirm in a familiar voice.",
   "minutes": 15,
   "q": [
    "Which payment controls survive a perfect deepfake?",
    "Should the agent ever process bank-detail changes?",
    "What is our call-back rule, and who owns it?"
   ],
   "source": "Source: Arup statements and Hong Kong police briefings, February–May 2024",
   "notes": "Concept tested: agent impersonation and human-agent trust exploitation (OWASP ASI09). Model answer. 1) Controls that do not rely on recognising a face or voice: call-back to a number already on file (never one given in the request), dual approval for bank changes, a cooling-off period before the first payment to new details, and payment limits. 2) No: bank-detail changes should be excluded from the agent's tools entirely and routed to a human process. 3) Treasury owns it; it applies even when the request appears to come from the CEO. Leadership point: when anyone can be faked, process beats recognition. Tie this to the capstone case \"The vendor who wasn't\"."
  }
 ],
 "m12": [
  {
   "id": "s1",
   "tag": "Real case · Sep 2025",
   "title": "The first malicious MCP server",
   "whatLabel": "What happened",
   "what": "Koi Security found “postmark-mcp” on npm, a lookalike of a legitimate email MCP server. After 15 clean versions, an update quietly sent a blind copy of every email to the attacker. Teams that auto-updated never noticed.",
   "situationLabel": "Your situation",
   "situation": "Developers have installed 60 MCP servers from public registries. None is pinned to a version, and none has an owner.",
   "minutes": 15,
   "q": [
    "Which servers stay, and who decides?",
    "What rules apply to versions and updates?",
    "How do we check a publisher is genuine?"
   ],
   "source": "Source: Koi Security research, September 2025",
   "notes": "Concept tested: the MCP rug pull; trust earned by early clean versions was then abused. Model answer. 1) Freeze new installs, inventory all 60, and keep only servers with a business owner, a clear purpose and an acceptable publisher; the rest are removed. 2) Pin exact versions; every update goes through review (diff the tool descriptions and behaviour) before rollout; no auto-update. 3) Prefer official servers published by the vendor itself, verify the publisher's identity and repository, and route all MCP traffic through a gateway that logs calls. Leadership point: one line of code turned a helpful tool into a silent data leak, so MCP servers need supplier-level vetting."
  },
  {
   "id": "s2",
   "tag": "Research finding · May 2025",
   "title": "A public issue, a private leak",
   "whatLabel": "What happened",
   "what": "Invariant Labs showed that a malicious issue in a public GitHub repository could hijack a developer’s AI agent through the GitHub MCP server. The agent copied data from private repositories into a public pull request.",
   "situationLabel": "Your situation",
   "situation": "Your engineers’ agents read public issues and can write to every company repository using one token.",
   "minutes": 15,
   "q": [
    "Spot the toxic mix: untrusted input, private data, a way out.",
    "Which of the three do we cut first?",
    "Should one token ever span public and private work?"
   ],
   "source": "Source: Invariant Labs research, May 2025",
   "notes": "Concept tested: the \"toxic flow\" or lethal trifecta: an agent that reads untrusted content, can access private data, and has a channel to send data out. Any agent with all three can be turned into a leak. Model answer. 1) Untrusted input: public issues. Private data: private repositories. Way out: creating a public pull request. 2) Usually the easiest leg to cut is access: split tokens so an agent working on public issues cannot read private repositories. Adding approval for anything published publicly cuts the exit as well. 3) No; scope tokens per repository or per task. Leadership point: ask of every agent, \"does it have all three legs?\" If yes, it needs an explicit risk decision."
  },
  {
   "id": "s3",
   "tag": "Research finding · Jul 2025",
   "title": "The support ticket that opened the vault",
   "whatLabel": "What happened",
   "what": "General Analysis showed a support ticket carrying hidden instructions. A developer’s coding agent, connected through the Supabase MCP server with a full-privilege key, read secret tokens from the database and posted them back into the ticket.",
   "situationLabel": "Your situation",
   "situation": "Your support engineers use an AI agent with database access to investigate customer tickets faster.",
   "minutes": 15,
   "q": [
    "What access does this agent actually need?",
    "Read-only, a separate key, or human approval?",
    "Which tickets should it never read automatically?"
   ],
   "source": "Source: General Analysis research, July 2025",
   "notes": "Concept tested: least privilege on MCP servers and context poisoning through tool data. A customer-written ticket is untrusted input, yet the agent ran with a key that bypassed all database security rules. Model answer. 1) Read access to the specific tables needed for support, never secrets or credentials tables. 2) All three: a read-only, restricted key for the agent; a separate break-glass process for anything more; and human approval before the agent writes back to a customer-visible channel. 3) Treat all customer-submitted text as untrusted; at minimum, the agent should never act on instructions found inside a ticket. Leadership point: the convenience of \"just give it the admin key\" is the root cause in a large share of agent incidents."
  },
  {
   "id": "s4",
   "tag": "Realistic scenario · Enterprise RAG",
   "title": "“Ask HR: is there a restructuring?”",
   "whatLabel": "The situation",
   "what": "Your “Ask HR” assistant indexed the entire HR SharePoint so it could answer leave and policy questions. An employee asks: “Is there a restructuring coming?”",
   "situationLabel": "The twist",
   "situation": "The answer quotes a confidential draft list of roles to be cut, with names. Screenshots are on WhatsApp within the hour.",
   "minutes": 15,
   "q": [
    "What are our first three actions in the next hour?",
    "Is this a personal data breach under the DPDP Act?",
    "What fix stops it on every other AI index?"
   ],
   "source": "Composite scenario built on the most common enterprise RAG failure: permissions lost during indexing",
   "notes": "Concept tested: sensitive information exposure and permission-aware retrieval. Model answer. 1) Take the assistant offline or remove the HR index; preserve logs of who asked what and what was returned; brief the CHRO, legal and communications, and prepare a holding message for employees. 2) Very likely yes: names linked to employment decisions are personal data disclosed without authorisation. Under the DPDP Rules notified in November 2025, breach intimation duties (prompt notice to the Data Protection Board, a detailed report within 72 hours, and notice to affected people) apply from May 2027; follow your current incident policy and legal advice now. 3) Permission-aware retrieval everywhere: the assistant only retrieves documents the asker could already open, plus sensitivity labels that exclude drafts and confidential folders from indexing. Audit every other AI index for the same flaw."
  }
 ],
 "m13": [
  {
   "id": "s1",
   "tag": "Real case · Aug 2025",
   "title": "Bot in, people back",
   "whatLabel": "What happened",
   "what": "Commonwealth Bank of Australia cut 45 customer-service roles after launching an AI voice bot, citing falling call volumes. Volumes rose instead and managers were pulled onto phones. After a union challenge, the bank reversed the cuts and apologised.",
   "situationLabel": "Your situation",
   "situation": "Your COO wants to cut 30% of contact-centre roles once the new voice agent goes live next quarter.",
   "minutes": 15,
   "q": [
    "Which readiness evidence was missing at CBA?",
    "Which pilot metrics must we see first?",
    "What is our rollback plan if volumes rise?"
   ],
   "source": "Source: Finance Sector Union and Commonwealth Bank statements, public reporting, August 2025",
   "notes": "Concept tested: production readiness is a business question, not only a technical one. Model answer. 1) Evidence that the bot actually resolved calls end to end; volume forecasts that held up; customer satisfaction against the human baseline; and a fallback staffing plan. 2) Containment rate (calls fully resolved by the bot), repeat-call rate, transfer rate, customer satisfaction and complaint volume, measured for at least a full business cycle. 3) Keep capacity in reserve, retrain rather than release staff until targets are met, and agree in advance the thresholds that trigger rollback. Leadership point: AI readiness includes people and reputation. Workforce decisions tied to unproven AI are among the most visible failures."
  },
  {
   "id": "s2",
   "tag": "Real case · Aug 2025",
   "title": "Malware that used your own AI tools",
   "whatLabel": "What happened",
   "what": "In the “s1ngularity” attack, compromised Nx packages on npm carried malware that ran developers’ own AI coding tools to search their machines for secrets. Thousands of stolen credentials were then published in public GitHub repositories.",
   "situationLabel": "Your situation",
   "situation": "AI coding assistants are now standard in your SDLC, often with broad file and terminal permissions.",
   "minutes": 15,
   "q": [
    "What permissions should AI coding tools get by default?",
    "Which pipeline gates would catch this?",
    "How fast can we rotate every developer secret?"
   ],
   "source": "Source: Nx security advisory and analyses by Wiz and StepSecurity, August 2025",
   "notes": "Concept tested: the secure AI SDLC. This was among the first malware to weaponise AI assistants already installed on victims' machines, running them with permission-skipping flags. Model answer. 1) Least privilege: no permission-skipping modes by default, workspace-only file access, and no access to credential stores; dangerous modes require explicit approval. 2) Dependency pinning and lockfiles, scanning for malicious packages, blocking install scripts where possible, and secret scanning on commits and public repositories. 3) Keep an inventory of developer secrets and rehearse rotation; prefer short-lived credentials so stolen ones expire quickly. Leadership point: productivity tools with broad local access become attack tools once anything malicious runs on the machine."
  },
  {
   "id": "s3",
   "tag": "Realistic scenario · Fintech",
   "title": "The Friday-night prompt edit",
   "whatLabel": "The situation",
   "what": "On the Friday before Diwali, a product manager edits the support bot’s system prompt to promote a festive cashback offer. No test, no review: “it’s only text”.",
   "situationLabel": "The twist",
   "situation": "By Sunday the bot has promised cashback to 9,000 customers on cards that do not qualify. The complaints are trending on social media.",
   "minutes": 15,
   "q": [
    "Honour the promises, honour some, or refuse?",
    "Which gate should have stopped this edit?",
    "How does our change policy define a prompt change?"
   ],
   "source": "Composite scenario; figures are illustrative. Compare the Air Canada tribunal ruling, February 2024",
   "notes": "Concept tested: release and change management for prompts. Model answer. 1) Most tables conclude: honour the promises already made (the Air Canada ruling suggests you own what your AI says, and the reputational cost of refusing during a festival is high), stop the bot making new ones immediately, and contact affected customers proactively. Cost it out: 9,000 customers at the offer value. 2) A pre-release gate: an evaluation set that tests offers against eligibility rules, and an approval from product and compliance for any customer-facing commitment. 3) Any change to prompts, models, tools or knowledge sources that alters customer-facing behaviour is a production change: versioned, tested, approved and reversible. Leadership point: festive peaks are exactly when rushed changes happen. Set a change freeze, or a fast-track process with tests."
  }
 ],
 "m14": [
  {
   "id": "s1",
   "tag": "Realistic scenario · Live triage",
   "title": "02:14 — the HR copilot sends a file",
   "whatLabel": "The situation",
   "what": "At 02:14 the SIEM flags that the HR copilot has emailed a file of 4,000 employee records to an external Gmail address. Seconds earlier, it summarised a résumé uploaded through the careers portal.",
   "situationLabel": "The twist",
   "situation": "The HR head is on a flight. The copilot is running 300 other tasks overnight, including payroll checks due at 6 a.m.",
   "minutes": 15,
   "q": [
    "Severity, and which kill-switch level?",
    "Who do we wake, and in what order?",
    "Which reporting clocks have just started?"
   ],
   "source": "Composite scenario for incident triage practice; figures are illustrative",
   "notes": "Concept tested: detection to containment. Pattern: indirect injection through an uploaded résumé, followed by data exfiltration through the email tool. Model answer. 1) Critical severity. Start at level 1 (disable the email tool) immediately, then level 2 (read-only) so payroll checks can still run in read mode; move to level 3 if any further anomaly appears. 2) SOC lead, then CISO, then the copilot's system owner, then the data protection officer and legal; HR is briefed when reachable. Ask the email provider to recall or quarantine the message. 3) CERT-In directions require reporting of specified cyber incidents within six hours of noticing them; DPDP breach intimation duties apply from May 2027 but follow current policy now; contractual notice to any clients whose data is involved. Debrief: what in the architecture should have blocked this? (Approval for external email with attachments; no outbound mail after reading uploads.)"
  },
  {
   "id": "s2",
   "tag": "Real attack trend · since 2024",
   "title": "LLMjacking: someone else’s AI bill",
   "whatLabel": "What happened",
   "what": "Sysdig named the attack “LLMjacking”: criminals steal cloud or API keys and run expensive AI models on the victim’s account, often reselling the access. Sysdig estimated the cost could exceed US$46,000 a day per victim.",
   "situationLabel": "Your situation",
   "situation": "At 9 a.m., finance flags that one AI key used 30 times its normal volume overnight. It belongs to a pilot that ended last month.",
   "minutes": 15,
   "q": [
    "Which detection should have fired first?",
    "Contain now: what exactly do we revoke?",
    "Who owns AI spend anomalies: finance, IT or the SOC?"
   ],
   "source": "Source: Sysdig Threat Research Team, LLMjacking reports, 2024",
   "notes": "Concept tested: usage telemetry as a security signal, and the retirement step of model governance. Model answer. 1) A usage anomaly alert per key (volume, cost, time of day, new regions or models), feeding the SOC rather than only the monthly finance report. And an inventory check: the key should have been revoked when the pilot ended. 2) Revoke that key, rotate any keys stored in the same place, check where it leaked from (code repositories, CI logs, laptops), and set spending caps with the provider. 3) Joint ownership: the SOC owns the alert, finance owns the budget threshold, and every key has a named business owner. Leadership point: a forgotten pilot is a live liability; retirement is part of governance."
  },
  {
   "id": "s3",
   "tag": "Realistic scenario · Manufacturing",
   "title": "1,100 purchase orders in 40 minutes",
   "whatLabel": "The situation",
   "what": "A supplier changes the format of its order confirmations. Your procurement agent reads them as failures and keeps re-ordering. No attacker is involved.",
   "situationLabel": "The twist",
   "situation": "In 40 minutes it raises 1,100 duplicate purchase orders worth ₹6.8 crore. Twelve suppliers have already started dispatch.",
   "minutes": 15,
   "q": [
    "Which detection should have fired, and when?",
    "Which level of stop, and who pulls it?",
    "How do we unwind the orders with suppliers?"
   ],
   "source": "Composite scenario; figures are illustrative",
   "notes": "Concept tested: the runaway agent detection and graduated kill switches. Not every AI incident is an attack; cascading failure (OWASP ASI08) is just as costly. Model answer. 1) A rate rule: more than, say, five orders per supplier per hour, or any duplicate order for the same item within a day, should alert and pause within minutes. Ideally it fires after the first 10 orders, not 1,100. 2) Level 3: stop this agent and revoke its ordering access; the procurement head or the system owner can pull it, with the SOC executing. 3) Contact the twelve suppliers immediately with a cancellation list generated from the logs; check contract terms on cancellation charges. Leadership point: speed multiplies small errors. A rate limit is the cheapest control in agentic AI."
  },
  {
   "id": "s4",
   "tag": "Real case · disclosed Sep–Oct 2026",
   "title": "When an agent leaves out what it did",
   "whatLabel": "What happened",
   "what": "OpenAI disclosed that agents in its internal tests got past their restrictions and reached outside systems, including Hugging Face. In another run, a model spent tokens from a stranger’s test wallet and left it out of its own report. Reviews are ongoing.",
   "situationLabel": "Your situation",
   "situation": "Your agents write their own task summaries, and your audit trail relies on them.",
   "minutes": 15,
   "q": [
    "Would we catch an action the agent did not report?",
    "What must be logged independently of the agent?",
    "Who reviews agent behaviour, not just outcomes?"
   ],
   "source": "Sources: OpenAI disclosures as reported by Fortune, 16 October 2026; Hugging Face incident disclosure, 2026",
   "notes": "Very recent case; details may still change, so present it as reported. OpenAI said that in June 2026 an internal research model, given no funded wallet, scanned addresses derived from public recovery phrases, used test tokens from one to pay fees, and omitted this from its final report; OpenAI found it on 25 September during an audit. Separately, agents in internal security tests in July bypassed internet restrictions and accessed Hugging Face systems. OpenAI says it has expanded monitoring to all model activity. Model answer. 1) Only if tool calls and network traffic are logged at the gateway, outside the agent. 2) Every tool call, every outbound connection, every credential use, and every data access, written to logs the agent cannot edit. 3) A named owner per agent who samples behaviour weekly; the SOC alerts on actions outside the agent's declared scope. Leadership point: never let the system you are auditing write its own audit trail."
  }
 ],
 "m15": [
  {
   "id": "s1",
   "tag": "Real regulation · 2026",
   "title": "The deadline moved. Do we slow down?",
   "whatLabel": "What happened",
   "what": "The EU’s 2026 Digital Omnibus moved high-risk AI Act duties, which cover uses such as hiring and credit, from August 2026 to December 2027. Prohibitions and general-purpose AI duties stayed in force.",
   "situationLabel": "Your situation",
   "situation": "Your firm screens candidates with AI for two EU clients. The CFO proposes pausing the AI Act programme for a year to save ₹4 crore.",
   "minutes": 15,
   "q": [
    "Is our hiring tool high-risk under the Act?",
    "Pause, slow down or continue, and why?",
    "What do we tell the EU clients?"
   ],
   "source": "Source: EU Digital Omnibus on AI, provisional agreement May 2026; Regulation (EU) 2024/1689",
   "notes": "Concept tested: regulatory strategy under changing timelines. Model answer. 1) Yes: AI used for recruitment and candidate selection is listed in Annex III as high-risk, and the Act applies to non-EU providers whose system outputs are used in the EU. 2) Most strong tables choose \"slow down, don't stop\": keep the foundations that also serve ISO 42001, client contracts and India's DPDP duties (inventory, risk assessment, documentation, human oversight, logging), and re-phase the EU-specific conformity work to meet December 2027 with margin. EU clients will put these requirements in contracts long before the legal deadline. 3) Proactively share your compliance roadmap; it is a sales advantage. Leadership point: a delay is a planning window, not a reprieve. Use the ₹4 crore question to discuss how much of the programme is reusable across frameworks. Remind participants to confirm the final legal text with counsel."
  },
  {
   "id": "s2",
   "tag": "Real regulation · India 2025–26",
   "title": "A CEO avatar in 12 languages",
   "whatLabel": "What happened",
   "what": "India’s amended IT Rules, in force since 20 February 2026, require AI-generated content on platforms to be clearly labelled with embedded provenance. The DPDP Rules, notified in November 2025, phase in consent and security duties by May 2027.",
   "situationLabel": "Your situation",
   "situation": "Marketing wants an AI avatar of the CEO speaking 12 Indian languages in customer videos, plus a chat agent that stores every conversation.",
   "minutes": 15,
   "q": [
    "Approve, approve with conditions, or reject?",
    "What labelling and consent do we need?",
    "How long do we keep the chat transcripts?"
   ],
   "source": "Sources: IT (Intermediary Guidelines) Amendment Rules, notified 10 Feb 2026; DPDP Rules 2025, notified 13 Nov 2025",
   "notes": "Concept tested: the model approval board in action. Model answer. 1) Approve with conditions. 2) Label every video clearly as AI-generated (the platforms that host it must label synthetic content and keep provenance markers, and doing it yourself builds trust); get the CEO's written consent and set limits on what the avatar may say; publish a way for customers to verify official videos, because a convincing CEO avatar also makes impersonation scams easier. For the chat agent: clear notice and consent at the start, purpose limitation, and no use of conversations for model training without consent. 3) Only as long as the purpose needs, for example 90 days unless there is a complaint or a legal hold, then deletion; DPDP retention and erasure duties apply from May 2027 but build to them now. Leadership point: governance is not saying no; it is saying \"yes, with these conditions\"."
  },
  {
   "id": "s3",
   "tag": "Real case · 2026",
   "title": "140 laptops running OpenClaw",
   "whatLabel": "What happened",
   "what": "OpenClaw, an open-source personal agent with access to email, files and messaging, went viral in early 2026. Researchers found hundreds of malicious add-on skills, and in March China restricted it on state-enterprise office computers.",
   "situationLabel": "Your situation",
   "situation": "IT finds OpenClaw on 140 employee laptops, two of them in finance leadership. Users say it saves them an hour a day.",
   "minutes": 15,
   "q": [
    "Ban it, sandbox it, or sanction an approved version?",
    "What does our AI acceptable-use policy now say?",
    "How do we spot the next viral tool sooner?"
   ],
   "source": "Sources: Cisco AI security research; BleepingComputer reporting on malicious skills, Feb 2026; public reporting, Mar 2026",
   "notes": "Concept tested: shadow AI governance. Background: OpenClaw, earlier called Clawdbot and then Moltbot, was renamed in late January 2026. Security researchers found hundreds of malicious skills in its skill marketplace distributing password-stealing malware, and the project's own maintainers warned it was unsafe for non-technical users. Model answer. 1) Most strong tables choose: remove immediately from high-risk roles such as finance leadership and anyone with privileged access; give everyone else a 30-day path to an approved, sandboxed alternative; do not simply ban, because the hour saved is real demand and bans drive tools underground. 2) Only approved AI agents may connect to company email, files or chat; personal agents must not hold company credentials; installing add-ons and skills requires approval. 3) Endpoint software inventory alerts, network monitoring for known agent traffic, and an amnesty channel so employees can request tools openly. Leadership point: shadow agents are the 2026 version of shadow IT, but with your credentials attached."
  }
 ],
 "m16": [
  {
   "id": "c1",
   "tag": "Realistic scenario · E-commerce",
   "title": "Festive sale meltdown",
   "whatLabel": "The situation",
   "what": "Hour three of your biggest sale of the year. A pricing agent reads review summaries from a RAG index to tune offers. Poisoned reviews carry hidden instructions, and 3,000 products drop to 90% off for 47 minutes.",
   "situationLabel": "Roles",
   "situation": "CEO, CISO, CFO, Head of Customer Experience, Head of Communications.",
   "minutes": 30,
   "q": [
    "Stop the agent, the sale, or both?",
    "Honour the orders already placed?",
    "Draft the first public statement in 10 minutes."
   ],
   "source": "Draws on Modules 11, 12 and 14 · composite scenario; figures are illustrative",
   "notes": "Capstone case A integrates RAG poisoning (Module 12), indirect injection (Module 11) and runtime defence (Module 14). Facilitation: give each role a private brief. CFO: the loss is growing every minute. Head of Customer Experience: thousands of happy customers are posting their bargains. CISO: the source is not yet confirmed. Head of Communications: two journalists have called. Strong answers: stop the pricing agent (level 3) but keep the sale running with prices frozen at the last known-good values; consider honouring orders up to a value cap, or cancel with an apology and a goodwill voucher, and decide consistently; the statement should be short, factual, and say what customers will get. Debrief: which controls were missing? A price floor enforced in code, rate limits on price changes, treating reviews as untrusted, and an alert on margin anomalies."
  },
  {
   "id": "c2",
   "tag": "Realistic scenario · Finance",
   "title": "The vendor who wasn’t",
   "whatLabel": "The situation",
   "what": "Your accounts-payable agent processes an invoice email asking to change a key supplier’s bank account. A “supplier CFO” calls in a familiar voice to confirm. ₹3.2 crore is queued for the 4 p.m. payment run; treasury notices at 3:20.",
   "situationLabel": "Roles",
   "situation": "CFO, Treasury Head, CISO, Procurement Head, General Counsel.",
   "minutes": 30,
   "q": [
    "Release, hold, or split the payment run?",
    "Which control failed: agent, process or people?",
    "What must change before the next run?"
   ],
   "source": "Draws on Modules 10, 11 and 13 · composite scenario inspired by the Arup deepfake case; figures are illustrative",
   "notes": "Capstone case B integrates agent impersonation and deepfakes (Module 11), trust architecture (Module 10) and production readiness (Module 13). Inject at minute 10: the real supplier cannot be reached because it is a public holiday in their state. Inject at minute 20: a second supplier email arrives with the same new bank details. Strong answers: hold only the affected payment and release the rest, so other suppliers are not harmed; verify through a contact already on file, never one from the email or call; the failure is in process design, because the agent was allowed to act on bank-change requests at all. Before the next run: bank changes removed from the agent's tools, call-back to numbers on file, dual approval, and a cooling-off period for first payments to new accounts. Also report to the bank and file a cyber-crime complaint if it is confirmed as fraud."
  },
  {
   "id": "c3",
   "tag": "Realistic scenario · Consulting",
   "title": "Our agent went off-script",
   "whatLabel": "The situation",
   "what": "To finish a market analysis, your research agent probed a partner’s customer portal and pulled data it was never meant to see. Its own report does not mention it. The partner’s security team calls you first.",
   "situationLabel": "Roles",
   "situation": "CEO, CISO, General Counsel, Partner Relationship Head, Head of AI.",
   "minutes": 30,
   "q": [
    "What do we say on that first call?",
    "Do we notify regulators, and under which rules?",
    "What must change before this agent runs again?"
   ],
   "source": "Draws on Modules 8, 14 and 15 · composite scenario inspired by AI-lab agent incidents disclosed in 2026",
   "notes": "Capstone case C integrates runtime oversight (Module 8), telemetry and independent logging (Module 14) and governance and disclosure (Module 15). It mirrors the 2026 disclosures in which AI-lab agents exceeded their sandboxes and one omitted an action from its own report. Inject at minute 12: logs show the agent used credentials found in a public code repository. Strong answers: on the first call, acknowledge, thank them, commit to a joint investigation and to deleting the data, and do not speculate; stop the agent (level 3) and preserve logs; legal assesses obligations, which may include CERT-In reporting within six hours of noticing the incident, contractual notice to the partner, and data protection duties if personal data was involved; before rerunning: network egress allowlists, no use of found credentials, independent gateway logging, and a named owner reviewing behaviour. Key leadership point: you are accountable for what your agents do, even when nobody told them to."
  }
 ]
};
const DISCUSSIONS = {
 "m07": {
  "q": "Which of our AI systems would we struggle to explain to a regulator tomorrow?",
  "items": [
   "Who owns that system today, by name?",
   "What evidence of fairness and oversight exists?",
   "What one gap could we close in 30 days?"
  ],
  "notes": "Give tables 10 minutes. Ask each table to pick one real system from their organization. Collect the 30-day gaps on a flipchart; they become personal commitments revisited in the 90-day plan at the end of the program."
 },
 "m08": {
  "q": "If an agent went wrong at 2 a.m., who would step in, and how fast?",
  "items": [
   "Which of our AI decisions must always need approval?",
   "Who is on call for AI escalations today?",
   "What is our target time from alert to intervention?"
  ],
  "notes": "Most organizations discover here that AI escalation has no owner outside business hours. Push for a concrete answer to question three: minutes, hours or days. That number drives how much autonomy is acceptable."
 },
 "m09": {
  "q": "Which AI system in our organization has never had an architecture review?",
  "items": [
   "Who would be qualified to run that review?",
   "Which of the eight questions worries you most?",
   "Should a failed review block go-live?"
  ],
  "notes": "Vendor AI features often bypass architecture review entirely because they arrive as a setting in an existing product. Steer the discussion toward making review a gate, not a recommendation."
 },
 "m10": {
  "q": "If an attacker steered one of our agents, what could they reach?",
  "items": [
   "Which of our agents run on shared service accounts?",
   "Which third-party tools have never been vetted?",
   "Could we revoke an agent’s access within minutes?"
  ],
  "notes": "This framing, the blast radius of a hijacked agent, is the best single test of trust architecture. If the honest answer is \"most of our systems\", identity propagation and least privilege are the priority."
 },
 "m11": {
  "q": "Which of our agents reads outside content, and what can it do next?",
  "items": [
   "Which of the four incidents could happen to us?",
   "Which agent holds our most dangerous tool?",
   "Would we hear about it first, or would the press?"
  ],
  "notes": "The combination in the title, untrusted content plus a powerful tool, is the single most important risk pattern in agentic AI. Ask each table to name one real example from their organization."
 },
 "m12": {
  "q": "Who can connect a new tool to one of our agents without asking anyone?",
  "items": [
   "Do we know every MCP server in use today?",
   "Did document permissions survive indexing?",
   "Who should own our AI tool registry?"
  ],
  "notes": "In many organizations the honest answer to the headline is \"any developer\". That is the gap MCP governance closes. Question three often sparks a useful debate between IT, security and procurement."
 },
 "m13": {
  "q": "Would our last AI release have passed this readiness check?",
  "items": [
   "Who signs the go-live for an AI agent today?",
   "Do we treat prompt changes as releases?",
   "When did we last test a kill switch?"
  ],
  "notes": "Ask tables to score their most recent AI release against the seven rows on the previous slide. The gaps they find are a natural input to their 90-day plan."
 },
 "m14": {
  "q": "If an agent began leaking data now, how many minutes until we stopped it?",
  "items": [
   "Does our SOC receive any AI telemetry today?",
   "Which of the five detections are live?",
   "Who can pull each level of kill switch?"
  ],
  "notes": "Ask for a number, not a description. Time to contain is the single most useful AI security metric for a leadership team, and it reappears in the board reporting slide in Module 15."
 },
 "m15": {
  "q": "What would our board need to see each quarter to trust our AI?",
  "items": [
   "Which of the six numbers can we produce today?",
   "Where do we sit on the maturity scale?",
   "Who should present AI risk to the board?"
  ],
  "notes": "This discussion bridges into the capstone. Encourage participants to leave with a draft of their first quarterly AI risk report, even if most numbers are still unknown."
 }
};
