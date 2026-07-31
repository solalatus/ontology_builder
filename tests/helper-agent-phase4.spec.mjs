import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";

// Helper Agent — Phase 4: baked-in knowledge (AGENT_KNOWLEDGE) + the
// INTERVIEW PROCESS system-prompt section. buildAgentSystemPrompt() has no
// dependency on being connected (it only reads the static AGENT_KNOWLEDGE
// constant and the live `lang` value), so these tests call it directly via
// window.__kg.agent.buildSystemPrompt() rather than mocking a full chat
// round-trip — much cheaper, and this is exactly what every real request
// sends as its first message.

async function systemPrompt(page) {
  return page.evaluate(() => window.__kg.agent.buildSystemPrompt());
}

test("the baked-in knowledge includes the full howto guide", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /How to Describe a Domain for an AI Agent/);
    assert.match(prompt, /recognize, connect, compare, decide, or change/);
    // The howto's own complete compact example, verbatim -- proves the
    // whole document is embedded, not a truncated summary of it.
    assert.match(prompt, /canApproveInvoice:\s*\n\s*conditions:/);
  });
});

test("the baked-in knowledge includes the reference Python TXT loader, matching the shipped tool", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /def load_edge_list\(path\):/);
    // The BOM fix (this session's own retrospective-audit fix) must be
    // reflected here too, not a stale pre-fix copy of the loader.
    assert.match(prompt, /encoding="utf-8-sig"/);
  });
});

test("the baked-in knowledge includes a condensed, operational excerpt of the paper — not the full paper", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /Minimal Typed Semantic Representation/);
    assert.match(prompt, /Level 0 — relation backbone/);
    assert.match(prompt, /Level 3 — optional extensions/);
    // Proof this is a condensation, not the full paper: none of the
    // formal apparatus (proofs, benchmark numbers, citations) leaked in.
    assert.doesNotMatch(prompt, /Proposition \d/);
    assert.doesNotMatch(prompt, /WebQSP|ComplexWebQuestions/);
    // Paper's own numbered citation markers, e.g. "[12]" -- excludes code-style
    // array indexing like the loader's own `sys.argv[0]`, which is never
    // preceded by a word character the way a citation bracket is.
    assert.doesNotMatch(prompt, /(?<!\w)\[\d+\]/);
  });
});

test("the system prompt includes the INTERVIEW PROCESS section with all 10 phases (0 through 9)", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /INTERVIEW PROCESS/);
    assert.match(prompt, /0\. Orientation: call get_graph_state first/);
    assert.match(prompt, /1\. Real questions and actions/);
    assert.match(prompt, /9\. Validation pass/);
    assert.match(prompt, /Competency check/);
    assert.match(prompt, /Final checklist/);
  });
});

// A real confirmatory eval run's own LLM review found the interviewer
// declaring the interview complete (turn 45's final validation pass) while
// its own final checklist was, on inspection, wrong -- it reported every
// class as having relationships when at least one didn't, from memory
// rather than from an actual check. Requiring get_graph_state here (the
// same tool already used for Phase 3's own coverage check) and forbidding
// "note the gap and move on anyway" closes that gap directly, and is also
// the main lever for a longer, more thorough session generally: nothing
// caps turns/wallclock in practice (the eval never gets close), the
// interviewer's own willingness to call itself done early is the real
// constraint.
test("the system prompt's final checklist requires a get_graph_state check, not memory, and forbids reporting completion over an unresolved gap", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /call get_graph_state and confirm directly from that\s*result, not from memory, that every class has at least one\s*relationship recorded/);
    assert.match(prompt, /go back and close it before continuing\s*—\s*don't just note the gap and report the interview complete anyway/);
  });
});

// The final checklist's own bar needs to match the upgraded Phase 3/Phase 2
// bars above, not just the original "every class has >=1 relationship"
// check -- otherwise a session could pass its own final validation while
// still missing every jointly-named-pair relationship and every
// bucketed-away role class found in the real audit.
test("the system prompt's final checklist also covers jointly-named relationship pairs and distinctly-named roles, matching the upgraded Phase 2/3 bars", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /every pair of classes jointly\s*mentioned in a Phase 1 question or action has a direct relationship\s*between that specific pair/);
    assert.match(prompt, /distinctly-named actor or role from Phase 1 became its own class,\s*not folded into one generic bucket type/);
  });
});

// A live confirmatory eval run's real transcript (helper_agent_todo.md's
// dated addendum) found the actual root cause of several classes never
// getting recovered at all: the interviewer accepted the persona's first-
// pass Phase 1 answer at face value and moved straight to Phase 2 ("Good --
// I've captured these 20 real questions... Please proceed to the next
// phase!") without ever asking whether anything was missing. The persona's
// own free-form list had quietly dropped "on-call engineer" from the
// fixture's own "which resolver group and on-call engineer" question,
// keeping only "resolver group" -- an omission a deliberate one-more-check
// follow-up would have caught, since real domain experts reliably remember
// secondary roles/context only when asked directly, not on the first pass.
test("the system prompt requires one deliberate follow-up probe for omitted roles/context before leaving Phase 1, not accepting the expert's first list as complete", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /An expert's first-pass list, given freely,\s*reliably omits things they'd still confirm as real if asked directly/);
    assert.match(prompt, /especially a secondary role standing next to one already named/);
    assert.match(prompt, /ask ONE closed, narrow follow-up covering exactly these two\s*things/);
  });
});

// A first version of this probe asked an open "anything else?" and a live
// confirmatory run showed why that's the wrong shape: it visibly worked
// (recall genuinely improved -- class 67.9% vs the merged baseline's
// 60.7%, relationship 17.1% vs 12.5%), but precision collapsed (class
// 55.3% vs 75.0%, relationship 9.7% vs 18.8%) because the persona, invited
// to volunteer "anything else," generatively supplied whole extra
// organizational apparatus (ExecutiveSponsor, CrisisManagementTeam,
// MajorIncidentBridge...) well past the specific six-class gap the fix
// targeted -- composite fell further behind the merge gate, not closer.
// Narrowed to name the two specific categories closed-question style
// instead, with an explicit warning against the open-invitation shape.
test("the system prompt's Phase 1 probe is narrow and closed (two named categories), not an open invitation that risks inviting scope creep", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /is there a closely related role that\s*actually does the day-to-day work under it, and does any of this\s*depend on a specific operating context that changes how it's\s*handled/);
    assert.match(prompt, /do not invite open-ended extra scope \("is\s*there anything else at all\?" tends to produce elaboration well past\s*what's needed, more classes than the acceptance test calls for, not\s*fewer\)/);
    assert.match(prompt, /Add only what the expert ties to answering one of the already-/);
  });
});

// A live confirmatory eval run's real transcript (helper_agent_todo.md's
// dated addendum) audited every class-related tool call in a full 45-turn
// conversation and found exactly one: 29 classes added in a single batch
// at turn 4, never touched again. Of those 29, 12 had no counterpart in
// gold at all -- and the interviewer's own Phase 1 probe literally named
// "service desk" as an example, but the expert's answer substituted
// "Application Support Team"/"Infrastructure Support Team" instead, and
// the interviewer never checked back on the specific term it had asked
// about. This test pins the Phase 1 fix for that: don't silently accept a
// substituted term without checking whether it's the same thing or
// something genuinely different.
test("the system prompt requires checking back when the expert's Phase 1 probe answer substitutes different terms than the ones asked about, not silently accepting the substitution", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /If\s*the expert's answer uses different terms than the ones this question\s*itself named as examples, don't silently accept whichever wording came\s*back/);
    assert.match(prompt, /ask directly whether that's the same real-world thing under a\s*different name at their organization, or something genuinely\s*additional/);
  });
});

// Same audit found the actual mechanism behind that 29-class, zero-pruning
// batch: the interviewer proposed all 29 at once and asked one single
// "which of these should stay" question over the whole list -- and the
// simulated persona's entire response was "All candidate classes should
// stay," including for three parallel role classes (Resolver Group /
// Application Support Team / Infrastructure Support Team) the interviewer
// had itself flagged as possibly the same thing. This test pins the Phase
// 2 fix: confirm classes in small justified batches with a stated
// per-item reason, and don't accept a bare "keep all"/"keep them
// separate" as resolving a self-flagged ambiguity without an operational
// reason attached.
test("the system prompt requires per-item justification for classes in small batches, not one omnibus \"which should stay\" question over a large proposed list", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /For each one, state the specific Phase 1 question or\s*action it's needed for/);
    assert.match(prompt, /Don't propose a\s*long list all at once and ask one single "which of these should stay"\s*question over the whole batch — that shape reliably gets a blanket\s*"keep all" back with no real scrutiny of any individual item/);
  });
});

test("the system prompt requires the interviewer to flag likely-overlapping class candidates itself and reject a bare \"keep all\" without an operational reason", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /several plausible-sounding\s*candidates that only differ by department or naming convention, not by\s*anything the agent actually needs to do differently with them/);
    assert.match(prompt, /a bare "keep them separate" or "keep all"\s*doesn't settle it without a specific operational reason attached/);
  });
});

// Regression coverage for a real interview-pacing inefficiency the
// ontology-recovery eval's own LLM review flagged twice in one run (turns
// 42-89 and 89+): GROUND RULES used to say "Ask ONE focused question at a
// time. Never send a multi-part questionnaire," with no carve-out, so the
// interviewer asked for one class meaning, one alias, or one allowed-value
// list per turn even once the exact same small question had already
// repeated many times. Fixed by allowing batching once a repeating pattern
// is established, while still requiring one-at-a-time for genuinely
// different-in-kind or answer-dependent questions.
test("the system prompt allows batching similar, low-ambiguity items instead of a strict one-question-at-a-time rule", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /batch 3-5 similar,\s*low-ambiguity\s*items/);
    assert.match(prompt, /Never batch items that\s*are different in kind/);
    // The two phases the eval's own real run singled out as the most
    // repetitive (language layer, constraints) call this out explicitly,
    // not just the general ground rule.
    assert.match(prompt, /repeating-pattern case GROUND RULES describes/);
    assert.match(prompt, /Batch the allowed-\s*value question across several properties/);
  });
});

test("the system prompt pushes Phase 3 (relationships) to systematically cover all confirmed classes, not just an opening batch", async () => {
  // A real eval run (helper_agent_todo.md's addendum) found relationship
  // recall far below even its own reachable ceiling once class/property
  // scope was accounted for -- the interviewer asked one backbone batch of
  // relationships, then moved on, leaving most plausible connections among
  // its own confirmed classes never asked about. This pins the fix: Phase 3
  // now explicitly says not to stop after the opening batch.
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /Don't stop after one opening batch/);
    assert.match(prompt, /systematically work through the plausible connections\s*among ALL of them/);
    assert.match(prompt, /left with no relationships to anything else is a sign you moved on\s*too early/);
  });
});

// Follow-up regression: even with the guidance above, a real confirmatory
// eval run still recovered relationships at a fraction of its own
// scoped-recall ceiling (see helper_agent_todo.md's dated addendum). Two
// further, more mechanical pushes: ground candidates directly in the
// Phase 1 material (many relationships are already implied by a real
// question/action, the same anchoring already used for properties), and
// require an actual get_graph_state check of each class's relationship
// count rather than trusting memory of what's already been asked.
test("the system prompt grounds relationship candidates in Phase 1 material and requires a get_graph_state coverage check before leaving Phase 3", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /Ground candidates in the\s*Phase 1 material itself/);
    assert.match(prompt, /Before leaving\s*this phase, call get_graph_state and check every class's relationship\s*count directly/);
  });
});

// Auditing a real confirmatory run's actual final graph state against gold
// directly (not just its metrics) found the "every class has >=1
// relationship" bar above was necessary but not sufficient: 23 of 29
// scoped relationships whose *both* endpoint classes were actually
// recovered were still missing -- the class itself had a relationship to
// *something*, just not to the specific other class a Phase 1 item jointly
// named. Pins the upgraded bar: co-occurrence in the same original
// question/action is a strong signal two classes need a direct
// relationship between that exact pair, not just each side connected
// elsewhere.
test("the system prompt requires checking that classes jointly named in the same Phase 1 item have a direct relationship between them, not just individually connected", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /two classes that\s*appear together in the same original Phase 1 question or action almost\s*always need a direct relationship between them specifically/);
    assert.match(prompt, /confirm every pair of classes it\s*jointly mentions has an explicit relationship between that exact pair/);
  });
});

// Same audit found 11 of 28 scoped gold classes never recovered at all,
// and 5 of those specifically because five separately-named roles (on-call
// engineer, incident commander, service owner, technical owner, service
// desk) all collapsed into one generic "OperationalRole" class -- the
// single biggest lever found, since a missing class cascades into every
// relationship/property that would have connected to it (19 of 48 scoped
// relationships were unreachable for exactly this reason in that run).
test("the system prompt warns against collapsing several distinctly-named roles into one generic bucket class", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /Watch\s*for several distinctly-named actors or roles collapsing into one\s*generic bucket class/);
    assert.match(prompt, /each one that matters earns its own class, not a shared\s*generic type/);
  });
});

test("the system prompt tells the interviewer actions take exactly one input class and how to handle a real action that needs more", async () => {
  // A real eval run's LLM review flagged several actions as having
  // "incomplete inputs" (e.g. assignResolverGroup only takes Incident, not
  // also ResolverGroup) -- but index.html's own action schema
  // (state.actions[].inputClassId) is a single scalar, not a list, so this
  // isn't a modeling mistake the interviewer can fix; it's this tool's own
  // deliberate scope. Pins that the interviewer is told so explicitly,
  // mirroring how the no-subclassing limitation is already documented for
  // it elsewhere in this same prompt.
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /exactly ONE input class in this tool\s*—\s*not a list/);
    assert.match(prompt, /represent the other\s*participant through a relationship, a property, or a precondition/);
    assert.match(prompt, /deliberate limit of this tool, not something to work around or\s*apologize for/);
  });
});

test("the system prompt never reveals the underlying model name or API mechanics that aren't part of the knowledge itself", async () => {
  // Not a security boundary (see SCOPE's own comment on this), just a
  // sanity check that nothing accidentally leaked in from the surrounding
  // JS (e.g. the literal OpenAI endpoint URL, or the agent's own API key).
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.doesNotMatch(prompt, /api\.openai\.com/);
    assert.doesNotMatch(prompt, /sk-/);
  });
});

test("the system prompt is stable across repeated calls (proves nothing dynamic leaked into the static knowledge block)", async () => {
  await withPage(async (page) => {
    const first = await systemPrompt(page);
    const second = await systemPrompt(page);
    assert.equal(first, second);
    assert.ok(first.length > 5000, "the real knowledge content should make this a substantial prompt, not a near-empty placeholder");
  });
});

test("toggling the UI language still only changes the OUTPUT LANGUAGE directive, not the knowledge content", async () => {
  await withPage(async (page) => {
    const promptEn = await systemPrompt(page);
    await page.evaluate(() => window.__kg.lang.toggle());
    const promptHu = await systemPrompt(page);

    assert.notEqual(promptEn, promptHu, "the language directive itself must differ");
    // Strip each prompt's own language-directive block and confirm the rest is identical.
    const stripDirective = (s) => s.replace(/---\nOUTPUT LANGUAGE:[\s\S]*?\n---/, "");
    assert.equal(stripDirective(promptEn), stripDirective(promptHu), "the knowledge/instructions content must not depend on the UI language");
  }, { lang: "en" });
});

// Round 2 of live-confirmed prompt fixes, this time built from a detailed
// read-through of the eval-most-experimented-llm-judge merged baseline's
// own 62-turn transcript, cross-checked against the fixture's real gold
// classes -- not a hypothesis, four specific, quoted failure modes that
// transcript actually exhibited.

test("Phase 2 treats a role surfaced only by the Phase 1 probe as a candidate, not a pre-approved inclusion", async () => {
  // The merged baseline's own transcript created Compliance Officer and
  // Business Line -- neither exists anywhere in the gold fixture -- purely
  // because the interviewer's own proposal text asserted "needed because
  // Compliance Officer reviews reporting-relevant incidents" without ever
  // testing that claim against a real, still-open Phase 1 question/action.
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /A role that only surfaced from the Phase 1 follow-up probe/);
    assert.match(prompt, /is a candidate, not a\s*pre-approved inclusion/);
    assert.match(prompt, /without tying\s*it to a specific still-open question or action stays out/);
  });
});

test("Phase 3 bans disguised subclassing wording (\"is type of\", \"is a kind of\") and requires a real operational connector instead", async () => {
  // The merged baseline's transcript recorded "Cybersecurity Incident --is
  // type of--> Incident" -- this tool has no subclassing, and the eval's
  // own scoring (groundTruthModel.mjs) explicitly excludes is-a predicates
  // from both gold and recovered, so this relationship could never earn
  // credit under any circumstances: a full round-trip spent on something
  // structurally unscoreable, not a wording near-miss.
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /Never phrase a relationship as disguised subclassing/);
    assert.match(prompt, /"is type of," "is a kind of," "is a," "classified as,"/);
    assert.match(prompt, /find the real operational connector instead/);
  });
});

test("Phase 3 asks for a routing/derivation relationship, not just a recording relationship, for \"who should be assigned\"-style questions", async () => {
  // The merged baseline never built any relationship that could let the
  // agent recommend a resolver group (only Resolver Group staffed by
  // On-call Engineer, and an assignment rule whose only condition is
  // "resolver group is identified") -- so "Who should be assigned to
  // resolve this incident?", a real Phase 1 question, was structurally
  // unanswerable, not just imperfectly worded.
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /that implies two\s*different relationships, not one/);
    assert.match(prompt, /derive or recommend/);
    assert.match(prompt, /cannot actually answer a "should be"\s*question/);
  });
});

// Round 3: a review of the round-2 fixes themselves found the fixes had
// quietly baked IT-ops vocabulary into the prompt's own text at three
// severity tiers -- worst, a literal question sent verbatim to every user
// regardless of domain ("on-call/staffing", "environment or deployment
// context"); reasoning-guidance examples all drawn from the same one
// domain (Resolver Group, Compliance Officer); and one instance of a
// hardcoded quote from a specific eval transcript ("what incidents have
// been logged for the same issue previously"). This tool is general-
// purpose for any domain, not an IT-ops tool -- every round of fixes
// after this one is required to translate its illustrative wording to an
// abstract placeholder or the live conversation's own content, never copy
// a transcript's domain nouns in verbatim (see helper_agent_plan.md §0).
test("the system prompt's GROUND RULES/INTERVIEW PROCESS section never carries IT-ops (or any other single domain's) vocabulary, only abstract placeholders", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    const start = prompt.indexOf("GROUND RULES");
    const end = prompt.indexOf("SCOPE (this agent");
    assert.ok(start >= 0 && end > start, "expected to find both section boundaries");
    const section = prompt.slice(start, end);
    const forbiddenDomainTerms = [
      /resolver group/i, /on-call/i, /service desk/i, /compliance officer/i,
      /incident commander/i, /major incident/i, /\bincident\b/i, /\bregulator/i,
      /cybersecurity/i, /materiality/i, /emergency change/i,
      /deployment context/i, /configuration item/i,
    ];
    for (const re of forbiddenDomainTerms) {
      assert.doesNotMatch(section, re, `found IT-ops-specific vocabulary (${re}) in the general-purpose interview guidance`);
    }
    // The rule itself must be stated, not just incidentally true this run.
    assert.match(prompt, /general-purpose ontology-building tool for ANY domain/);
    assert.match(prompt, /use an abstract placeholder \(Class A,\s*Role X, Team 1\)/);
  });
});

// Findings 2 and 3 from a detailed read-through of two round-2 confirmatory
// transcripts, cross-checked against the fixture's real gold relationships
// and properties -- written domain-neutrally from the start, per the rule
// above.
test("Phase 3 asks whether an actor reached only through a group/parent-record chain also needs a direct relationship", async () => {
  // A round-2 transcript built Incident->ResolverGroup->OnCallEngineer as a
  // two-hop chain but never a direct Incident->OnCallEngineer edge -- gold
  // scores "resolves" (Group->Incident) and "is handled by" (Incident->
  // individual) as two separate facts, and the existing "jointly mentioned
  // pair" check can't catch this because the persona never phrases the
  // specific individual and Incident together in one sentence (only the
  // individual and their group).
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /when an actor is only reached through a chain/);
    assert.match(prompt, /don't assume the chain substitutes for a\s*direct relationship/);
    assert.match(prompt, /the\s*"jointly mentioned pair" check below won't catch this case/);
    assert.match(prompt, /every actor reached only through a group or\s*parent-record chain also has a direct relationship/);
  });
});

test("Phase 4 asks whether a class tracked over time needs its own current-state property, not just identity/ownership fields", async () => {
  // Across both round-2 transcripts, the IT-Service-equivalent reference
  // class reliably got identity/ownership properties but never a live
  // status/health field, even though the transactional classes (Incident,
  // Alert, Change) reliably got one without having to be asked -- a
  // property-recall gap gold explicitly scores, not an eval artifact.
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /when a class is something the agent monitors, tracks, or\s*reports on over time/);
    assert.match(prompt, /ask\s*explicitly whether it needs its own current-state or status property/);
    assert.match(prompt, /every class the agent tracks over time \(not just looks up\) has\s*its own current-state property/);
  });
});

test("Phase 4 checks an excluded property against the still-open Phase 1 list before accepting the exclusion", async () => {
  // The merged baseline's transcript proposed Incident.issueKey, the
  // expert called it optional, and the interviewer accepted the exclusion
  // -- only for the Phase 9 validation pass to discover Phase 1's own
  // question ("what incidents have been logged for the same issue
  // previously?") was unanswerable without it, and have to backtrack.
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /Before accepting the\s*expert calling a property "optional"/);
    assert.match(prompt, /don't accept the exclusion at\s*face value/);
    assert.match(prompt, /A property genuinely unneeded by anything on the list\s*stays excluded as normal/);
  });
});

test("the connected panel's static note reflects that tool-calling has shipped, not stale pre-Phase-3 copy", async () => {
  // Phase 3 shipped apply_ontology_yaml; this note used to say the agent
  // "can only talk for now" and that editing "arrives in a later phase" --
  // stale copy left over from Phase 2 that a Phase 4/5 polish pass must catch.
  await withPage(async (page) => {
    const noteEn = await page.locator("#agent-no-tools-note").textContent();
    assert.doesNotMatch(noteEn, /can only talk for now/);
    assert.doesNotMatch(noteEn, /arrives in a later phase/);
    assert.match(noteEn, /apply changes/);

    await page.evaluate(() => window.__kg.lang.toggle());
    const noteHu = await page.locator("#agent-no-tools-note").textContent();
    assert.doesNotMatch(noteHu, /egyelőre csak beszélget/);
    assert.match(noteHu, /alkalmazhat/);
  }, { lang: "en" });
});
