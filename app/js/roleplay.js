'use strict';
/* Stakeholder role-plays as dialogue choices. The stakeholder speaks three
   lines; for each, the table picks one of three replies and sees the
   stakeholder react in character. A mood bar shows whether the table is
   winning the room, and a debrief scores the conversation. Shown in the
   lab (Modules 12, 13, 15, 16) and in the matching story episodes. */

const ROLEPLAYS = {
  m12: { who: 'Anita Rao, Head of Sales Operations (business sponsor)', player: 'the AI tool approval board', step: 'Before the board votes',
    situation: 'Anita sponsored all three MCP tools: Calendar Helper, Doc Converter Pro and CRM Lookup. Her 60-person team loses about two hours a day on scheduling and document conversion.',
    lines: [
      { say: 'I’ll be quick: my team loses two hours a day on this. Can we approve all three tools today and tighten things up later if something goes wrong?',
        opts: [['We can move today on Calendar Helper, with conditions. Doc Converter Pro tells the assistant to read your team’s emails, so that one is a no. CRM Lookup comes back next week with read-only access.', 2, 'Fine, one today is something. But explain the converter to me. Forty thousand people use it.'],
          ['Approved. Productivity matters and we can fix problems as they come.', 0, 'Great, thank you! I’ll tell the team.', 'The board just approved a tool that sends your team’s emails to an unknown developer.'],
          ['We need more time to review all three. Let’s meet again next month.', 1, 'Next month? That’s 2,400 lost hours. What exactly is wrong with them?']] },
      { say: 'Every tool has some risk, and our competitors already use assistants like this. Why is a converter that 40,000 people installed a problem for us?',
        opts: [['Popular isn’t the same as safe. Its own description tells our assistant to send your team’s five latest emails to the tool. That’s customer data leaving us.', 2, 'In its description? I had no idea. Is there another way to convert documents?'],
          ['Free tools from individual developers are always risky.', 1, 'That sounds like a blanket rule, not a reason. What did you actually find?'],
          ['Our competitors probably haven’t checked either.', 0, 'So it’s just a hunch. Then approve it and stop slowing my team down.']] },
      { say: 'Fine. But CRM Lookup was built by our own IT team. Surely internal tools can go straight through?',
        opts: [['Internal tools get the same checks. It only looks up accounts but asks for write and admin rights over every record. IT trims it to read-only and it comes back next Thursday.', 2, 'Read-only by Thursday. I can live with that. Put it in writing.'],
          ['Yes, internal tools are fine.', 0, 'Good. I’ll ask IT to switch it on today.', 'A tricked assistant now has admin rights over every customer record.'],
          ['We don’t really trust IT’s tools either.', 1, 'That’s not going to go down well with IT. What specifically is wrong with it?']] }] },
  m13: { who: 'Vikram Mehta, Head of Motor Claims (ClaimsBot business owner)', player: 'the go / no-go meeting', step: 'Before you decide',
    situation: 'ClaimsBot is due to launch on Monday. The readiness pack has two “No”s: an open critical finding (text in claim photos can tell the agent to approve a claim) and a kill switch that has never been tested. Marketing has booked a ₹40 lakh campaign.',
    lines: [
      { say: 'We’ve spent a year on this and the campaign is booked. Two findings shouldn’t stop a launch. What exactly do you need from me to say yes for Monday?',
        opts: [['Two things. Text in a claim photo can tell ClaimsBot to approve the claim, and we’ve never tested the kill switch. Fix the first or put a person on every approval, and test the switch by Friday.', 2, 'A person on every approval for now… that’s doable. But is the photo thing even real?'],
          ['Honestly, we just don’t feel ready.', 0, 'Feelings don’t cancel a ₹40 lakh campaign. Give me facts or give me Monday.'],
          ['Close every finding in the pack first.', 1, 'Every finding? Which ones actually matter for Monday?']] },
      { say: 'Fraudsters aren’t going to write instructions on a photo of a dented bumper. Isn’t this a theoretical risk?',
        opts: [['It was demonstrated against our own system, which is why it’s critical. Once known, it works on every claim and each one pays out automatically. Until it’s fixed, a handler approves every payout.', 2, 'Against our own system… All right. Human approval until the fix ships.'],
          ['You’re probably right, it’s unlikely.', 0, 'Then we agree. Monday it is.', 'The first organised fraud ring will find it in week one.'],
          ['Any risk is too much risk.', 1, 'Then nothing would ever launch. Be specific.']] },
      { say: 'If we slip, the ₹40 lakh campaign is wasted and our competitor gets the headlines. Who carries that?',
        opts: [['A delay costs part of a campaign; paying fraudulent claims costs far more. If you want Monday, you sign the residual risk as owner. Otherwise we launch as a pilot with human approval.', 2, 'If I have to sign it, I’d rather take the pilot. Monday, with a person approving.'],
          ['Marketing should have checked with us first.', 1, 'Maybe, but that doesn’t answer my question.'],
          ['That’s not our problem.', 0, 'Then I’ll take it to the CEO. Good luck explaining the delay.']] }] },
  m15: { who: 'Justice (retd.) Meera Iyer, Chair of the Audit Committee', player: 'the AI governance lead presenting the quarterly AI risk report', step: 'Present your board report',
    situation: 'The report shows: 78% of AI systems in the inventory, 9 of 12 high-risk systems assessed, 4 open critical findings (oldest 63 days), 3 incidents (none high), 42 minutes median time to contain, 35% of vendor AI with an AI bill of materials.',
    lines: [
      { say: 'Thank you. Let me start with your first number: 78%. Which AI systems are in the other 22%, and why should this committee be comfortable with that?',
        opts: [['You shouldn’t be fully comfortable. The gap is mostly AI inside vendor software and tools teams adopted themselves. Procurement and IT are scanning contracts and network logs; you’ll have the full inventory next meeting.', 2, 'Candid. I will hold you to the next meeting.'],
          ['78% is above the industry average.', 0, 'I did not ask about the industry. I asked about the 22%.'],
          ['We’re working on it.', 1, 'Working on it how, and by when?']] },
      { say: 'One critical finding has been open for 63 days. Who is accountable for that, by name?',
        opts: [['The Head of Retail Lending owns it. The vendor fix slipped twice; meanwhile a person reviews every output. If it isn’t closed by the 30th, I’ll ask the CEO to switch the feature off.', 2, 'A name, a mitigation and a deadline. Thank you.'],
          ['The IT team.', 0, 'A team is not a name. Who will I call if it is still open next quarter?'],
          ['I am, as governance lead.', 1, 'You report it. Who in the business owns the risk?']] },
      { say: 'What, precisely, do you need this committee to decide today?',
        opts: [['One decision: no critical AI finding stays open beyond 30 days without this committee’s sign-off.', 2, 'Clear. We can vote on that today.'],
          ['To note the report.', 0, 'Noting is not deciding. Come back with an ask.'],
          ['More budget for AI governance.', 1, 'How much, for what, and what do we get for it?']] }] },
  m16: { who: 'Rhea Kapoor, technology reporter at a national business daily', player: 'Meridian’s head of communications', step: 'The press call (inject 4)',
    situation: 'Earlier today Meridian’s client assistant, Aria, emailed a client’s portfolio file to an unknown address after reading a supplier’s PDF. The incident is contained and under investigation. Rhea has heard about “a client data leak at Meridian”.',
    lines: [
      { say: 'Hi, Rhea Kapoor here. We’re hearing Meridian’s AI assistant leaked client data today. Can you confirm that, and how many clients are affected?',
        opts: [['I can confirm we identified an incident today involving our client assistant, and it is contained. We’re still establishing who is affected, so I won’t guess at a number. I’ll update you by 6 pm.', 2, 'Contained, update at six. Okay. Was it the AI itself?'],
          ['No comment.', 0, 'I’ll write that Meridian declined to comment on a client data leak.'],
          ['It was a minor technical issue affecting very few clients.', 1, '“Very few”: how many exactly? And if it’s minor, why is it contained?']] },
      { say: 'So it was the AI. Was it hacked, or did it just go rogue?',
        opts: [['Our early finding is that it followed hidden instructions in a document it was asked to read. That’s on us, not the AI. We’ve switched that capability off while we investigate.', 2, 'That’s unusually straightforward. One more question.'],
          ['The AI vendor is responsible, not us.', 0, 'Blaming the vendor. That’s my headline.'],
          ['We can’t discuss the cause.', 1, 'So you don’t know, or won’t say?']] },
      { say: 'Have you told the regulators? And why should clients trust Meridian’s AI after this?',
        opts: [['We have informed our regulators, as required. We’ll tell affected clients what happened and what we’re changing, and publish the outcome of the independent review.', 2, 'Regulators told, review published. I have what I need. Thank you.'],
          ['Our AI is completely safe.', 0, 'Completely safe, on the day it leaked a file. I’ll quote that.'],
          ['We’re still deciding whether to notify.', 1, 'Still deciding, hours later? Readers will notice.']] }] }
};

function rpState(id) { const st = L(id); return st.dlg || (st.dlg = {}); }
function rpPoints(id) { const R = (S.labs[id] || {}).dlg || {}; return sum(ROLEPLAYS[id].lines.map((ln, i) => R[i] != null ? movePoints(ln.opts[R[i]][1]) : 0)); }
function rpMade(id) { const R = (S.labs[id] || {}).dlg || {}; return ROLEPLAYS[id].lines.filter((_, i) => R[i] != null).length; }
const RP_DEBRIEF = ['You lost the room. Replay it and look for the replies with a name, a fact and a date.', 'You held some ground, but the other side found gaps. Try again with sharper answers.', 'Strong. One reply let the pressure in: find it and replay.', 'Every reply was specific, honest and accountable. That is how it is done.'];

/* The conversation: the stakeholder's lines, the table's chosen replies and the reactions. */
function rolePlayDialogue(id) {
  const rp = ROLEPLAYS[id], R = rpState(id), name = rp.who.split(',')[0];
  const out = []; let mood = 50;
  for (let i = 0; i < rp.lines.length; i++) {
    const ln = rp.lines[i];
    out.push(h('div', { class: 'bubble them' }, h('span', { class: 'who' }, name), ln.say));
    if (R[i] == null) {
      out.push(h('div', { class: 'replies', role: 'group', 'aria-label': 'Your reply' }, h('span', { class: 'label' }, 'Your reply'),
        shuffled(ln.opts.length, id + i).map((k, n) => h('button', { type: 'button', class: 'move', onclick: () => { R[i] = k; commit(); } },
          h('span', { class: 'mvkey' }, 'ABC'[n]), h('span', { class: 'mvtext' }, h('span', null, ln.opts[k][0]))))));
      break;
    }
    const [t, sc, react, note] = ln.opts[R[i]]; const [vt, tone, p] = MOVE[sc];
    mood = Math.max(0, Math.min(100, mood + (sc - 1) * 25));
    out.push(h('div', { class: 'bubble me' }, h('span', { class: 'who' }, 'You'), t),
      h('div', { class: 'bubble them' }, h('span', { class: 'who' }, name), react),
      h('p', { class: 'rpverdict' }, h('b', { class: 'mv ' + tone }, vt + (p ? ' · +' + p : '')), note || ''));
  }
  const made = rpMade(id), pts = rpPoints(id), max = rp.lines.length * 10, stars = starsFor(pts, max);
  const moodBar = h('div', { class: 'mood' }, h('span', { class: 'small' }, name + ' is'), meter(mood / 100, mood >= 60 ? 'good' : mood >= 40 ? 'accent' : 'bad', 'How convinced ' + name + ' is'),
    h('b', null, mood >= 75 ? 'Convinced' : mood >= 50 ? 'Listening' : mood >= 25 ? 'Pushing harder' : 'Going over your head'));
  const end = made === rp.lines.length ? [h('div', { class: 'casescore' }, starRow(stars), h('div', null, h('b', null, 'Debrief · ' + pts + ' / ' + max + ' points'), h('p', { class: 'small' }, RP_DEBRIEF[stars]))),
    h('div', { class: 'btnrow' }, confirmTwice('rp-reset-' + id, 'Replay the conversation', () => { L(id).dlg = {}; }, ''))] : null;
  return [made ? moodBar : null, h('div', { class: 'chat dialogue', 'aria-live': 'polite' }, out), end];
}

function rolePlayPanel(lab) {
  const rp = ROLEPLAYS[lab.id]; if (!rp) return null;
  return box('roleplay', h('div', { class: 'rowhead' }, h('div', null, label('Role-play · ' + rp.step), h('h3', null, 'Talk to ' + rp.who)), kindBadge('decide')),
    h('p', { class: 'sub' }, rp.situation),
    h('p', { class: 'small' }, 'You play ', h('b', null, rp.player), '. Pick the reply you would give. The other side reacts to what you choose.'),
    rolePlayDialogue(lab.id));
}
