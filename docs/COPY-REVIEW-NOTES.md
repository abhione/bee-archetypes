# Copy Review Notes — Wave: Archetype Content Pass

Full editorial pass on all 15 archetype content blocks in `src/data/archetypes.ts`. Original copy was GLM-4.6-drafted (Wave 2a); this pass rewrites `oneLiner`, `contribution`, `shadow`, and `aiPairing` for every archetype to be distinctive, embodied, and voice-compliant. `balance` sentences were reviewed but left untouched — they were already clean and their archetype-name references are load-bearing for the scoring engine.

General changes applied across all 15:
- Replaced generic third-person description ("The X does Y") with concrete, scene-based behavior ("A Queen sees the whole board before...").
- Removed all em dashes (one was present, in Waggle) and corporate-poison words (`at scale`, `align`, etc. — some were in the originals).
- Sharpened each `shadow` into a specific, distinct failure mode rather than a generic "works too hard under pressure" template — several archetypes in the same system had near-identical shadows in the original draft.
- Rewrote every `aiPairing` around a concrete Tuesday-morning division of labor, and corrected two mismatches between the copy's described agent and the archetype's actual `agenticCounterpart` field (see Archivist and Nurse below — both were pointing at the wrong agent conceptually even though the field itself was correct).

---

## System · Sun

### Queen
- Original oneLiner was passive ("carries... trade-offs"); new version is a quotable, verb-forward line about ending debate.
- Contribution now shows a specific behavior (spending others' input into one decision) instead of restating the title ("makes the singular choice").
- Shadow sharpened from generic "judgment stalls" to a specific social consequence: the org routes around her instead of bringing her hard calls. That's the real cost of being the final word.
- aiPairing tightened the division of labor: agent compresses noise into a brief, Queen supplies values/precedent/risk tolerance the agent structurally cannot.

### Forager
- oneLiner made active and named the actual behavior (leaving to test), not the vague "scouts external terrain."
- Contribution replaced abstract "maps the competitive landscape" with three concrete forager behaviors: price testing, watching a competitor launch, sitting in on a customer call.
- Shadow distinguished from Alchemist's shadow (narrative overload) by keeping it strictly about chasing every signal and losing pattern discipline — a data problem, not a story problem.

### Alchemist
- This was the "lean into what makes it distinct" archetype per the brief. Original content overlapped heavily with Forager (both about "signal"). New copy narrows Alchemist specifically to pattern-recognition across disconnected sources, not signal collection.
- Removed the "not X, but Y" adjacent phrasing in the original ("not a dashboard... becomes noise instead of signal") and replaced with a single concrete image: the sentence that makes a room say "that's what's been happening."
- Shadow now distinct from Queen's paralysis and Forager's chasing: this is narrative sprawl, too many connections trusted equally, none committed to.

---

## System · Comb

### Builder
- Original shadow ("over-engineer solutions") was vague. New version gives the concrete failure: a two-person team with a five-step approval chain, process that now protects itself instead of the work.
- aiPairing reframed from "provides the blueprint" (passive, vague) to a specific before/after: interviewing everyone by hand vs. starting from a dependency map.

### Catalyst
- Distinguished from Builder explicitly: Builder makes structure, Catalyst keeps the live rhythm running. Original copy blurred this ("establishes the rhythms... interlocking commitments" reads almost identically to Builder's "clear processes... reliable frameworks").
- Shadow sharpened to a specific, memorable image: ritual without function, "the rhythm keeps beating after the music has stopped."

---

## System · Brood / Guard (see note on system-grouping below)

### Archivist
- **aiPairing correction:** the original copy referenced the Cadence & Dependency Agent correctly by name but described debt-detection-flavored behavior ("automates the capture of commitments"). Rewrote to match the archetype's actual function (institutional memory, not workflow tracking) while keeping the correct `agenticCounterpart: 'Catalyst'` field.
- Shadow now distinct from Hygienist's drift-detection shadow: this is memory bloat and inaccessibility, not quality erosion.

### Nurse
- Original contribution and shadow were generic enough to apply to almost any coaching role. New copy grounds it in one-on-one specifics: reading what's stuck past the status update, absorbing a team's anxieties into over-managing individuals.
- Shadow now clearly distinct from Regulator's shadow (both are "boundary" archetypes but Nurse's failure is enmeshment with an individual; Regulator's is rigid enforcement across the group).

### Waggle
- This was the hand-written entry and already close to the target voice, but contained the one em dash in the file. Removed it and tightened the "person nobody notices" image into a cleaner three-clause sentence.
- Kept the core insight (translator at the seam between functions) since it was already the strongest, most distinct draft in the set.

### Regulator
- Original oneLiner was passive voice ("maintains trust by enforcing"). Rewrote active: "say the hard thing early, before it becomes a grudge."
- Sharpened distinction from Guardian (which is about system/deployment safety) by keeping Regulator strictly interpersonal: feedback protocols, conflict, trust between people, not risk to a system.

---

## System · Guard

### Hygienist
- Original shadow and Guardian's shadow were nearly interchangeable ("perceives every minor imperfection as a critical threat" vs. "bottleneck for all progress"). New Hygienist shadow is specifically about alarm fatigue and signal drowning in noise; Guardian's is specifically about risk-averse bottlenecking. Different mechanisms, both plausible, no longer overlapping.
- Removed "at scale" from aiPairing per the corporate-poison list.

### Guardian
- oneLiner rewritten to lead with the sharpest possible framing of the role: "who gets hurt," not the vaguer original "protects the integrity of the work and the worker."
- Contribution now names concrete stakeholders (a customer's data, an employee's workload) instead of abstract "principles of safety and fairness."

### Sentinel
- Original content ("plans for failures," "excessive control mechanisms") was the most generic of the three Guard archetypes and read almost like risk-management boilerplate. New copy grounds it in specific disaster scenarios (a vendor disappearing, a lead engineer quitting) and a specific failure mode: safeguards for scenarios that will never happen, until the org can't respond to an ordinary one.
- Closing line ("draws the line between prepared and paranoid") gives Sentinel a distinct, ownable tension the other two Guard archetypes don't have.

---

## System · Swarm

### Pollinator
- oneLiner made concrete and personal ("knows which two people in the building should meet") instead of the more abstract "carries trust between teams."
- Distinguished explicitly from Waggle: Waggle translates within a defined workflow handoff; Pollinator makes opportunistic, unassigned connections across teams that have no formal reason to talk.

### Swarm Leader
- Original contribution was abstract ("designs the architecture for large-scale transitions"). New version grounds it in a concrete number (three hundred people) and a concrete failure avoided (a quarter lost to confusion, three hundred rumors instead of one story).
- Shadow now specific to fragmentation under pressure, distinct from Sentinel's over-control and Guardian's bottlenecking.

### Scout
- Original shadow conflated two different failure modes (reckless shipping and harsh feedback) somewhat loosely. Tightened the causal link: speed produces noisy tests, and the same bluntness that serves the role under normal conditions curdles into verdicts instead of data points under pressure.
- aiPairing kept the strongest original idea (parallel experiments, pattern-spotting across tests) but tightened the prose and cut the closing corporate phrase ("keeping the human judgment at the core of the process").

---

## Note on system grouping

The mission brief's canonical system table places Archivist under Brood and Regulator under Guard. The current `archetypes.ts` data has `systemId: 'comb'` for Archivist and `systemId: 'brood'` for Regulator (visible in the file's section comments and each archetype's `system`/`systemId` fields). Per the instructions, only the five content fields were in scope for this pass — `system`, `systemId`, and `agenticCounterpart` were left untouched. Copy was written to fit each archetype's actual behavior rather than forcing it into either grouping's theme, but this data/framework mismatch is worth a decision from Abhi and Miranda before the next content or scoring-engine pass.

Also worth flagging: the mission brief's descriptive text about which archetypes pair with the Cadence & Dependency Agent vs. Debt Detection Agent doesn't match the actual `agenticCounterpart` field values in the code (e.g. brief text implies Guardian/Pollinator pair with Catalyst and Archivist/Nurse/Scout pair with Hygienist; the code has the opposite for all five). Per the explicit instruction to keep existing field assignments, all `aiPairing` copy was written to match the actual field in the file, not the brief's illustrative list.
