"""
Wave 2a: GLM-4.6 generates content for all 15 Bee Archetypes.

Runs 3 concurrent requests to http://localhost:8081 (llama-server hosting
GLM-4.6 UD-Q4_K_XL). Each archetype produces a strict-JSON block with
oneLiner, contribution, shadow, balance, aiPairing.

Output: writes /tmp/bee-archetype-content.json
Also writes: ~/Developer/bee-archetypes/src/data/archetype-content.ts
"""
import concurrent.futures as cf
import json
import re
import sys
import time
from pathlib import Path
from urllib import request as urlreq
from urllib.error import URLError

ARCHETYPES = [
    # System · Sun (Direction & Strategy)
    ("queen",       "Queen",       "Sun",   "Direction & Strategy",
     "The judgment carrier. Holds direction and trade-offs when everyone else is holding tasks.",
     "Queen"),
    ("forager",     "Forager",     "Sun",   "Direction & Strategy",
     "The market-signal sensor. Reads external terrain, brings back opportunity.",
     "Queen"),
    ("alchemist",   "Alchemist",   "Sun",   "Direction & Strategy",
     "The narrative synthesizer. Turns data and signal into a story people can act on.",
     "Queen"),

    # System · Comb (Execution & Structure)
    ("builder",     "Builder",     "Comb",  "Execution & Structure",
     "The systems-maker. Turns chaos into repeatable structure other people can inhabit.",
     "Catalyst"),
    ("catalyst",    "Catalyst",    "Comb",  "Execution & Structure",
     "The cadence keeper. Runs the rituals and dependencies that make collective work compound.",
     "Catalyst"),
    ("archivist",   "Archivist",   "Comb",  "Execution & Structure",
     "The institutional-memory steward. Ensures what was learned stays learned.",
     "Catalyst"),

    # System · Brood (People & Development)
    ("nurse",       "Nurse",       "Brood", "People & Development",
     "The one-on-one capability builder. Grows individuals without extracting them.",
     "Catalyst"),
    ("waggle",      "Waggle",      "Brood", "People & Development",
     "The connective tissue. Translates between roles, functions, and altitudes.",
     "Catalyst"),
    ("regulator",   "Regulator",   "Brood", "People & Development",
     "The trust-and-boundaries keeper. Holds psychological safety without softening the truth.",
     "Catalyst"),

    # System · Guard (Risk & Protection)
    ("hygienist",   "Hygienist",   "Guard", "Risk & Protection",
     "The debt-drift detector. Sees quality erosion before it becomes crisis.",
     "Hygienist"),
    ("guardian",    "Guardian",    "Guard", "Risk & Protection",
     "The compliance and ethics anchor. Holds the line on responsible AI and human dignity.",
     "Hygienist"),
    ("sentinel",    "Sentinel",    "Guard", "Risk & Protection",
     "The continuity and security keeper. Plans for what breaks so the org survives it.",
     "Hygienist"),

    # System · Swarm (Growth & Expansion)
    ("pollinator",  "Pollinator",  "Swarm", "Growth & Expansion",
     "The partnership and warmth carrier. Grows the ecosystem through trust.",
     "Queen"),
    ("swarm-leader","Swarm Leader","Swarm", "Growth & Expansion",
     "The M&A and mass-mobilization operator. Moves people through change at scale.",
     "Catalyst"),
    ("scout",       "Scout",       "Swarm", "Growth & Expansion",
     "The experimenter and discovery lead. Learns fastest, ships smallest, tells the truth about it.",
     "Queen"),
]

SYSTEM_MAP = {
    "Sun":   "Direction & Strategy",
    "Comb":  "Execution & Structure",
    "Brood": "People & Development",
    "Guard": "Risk & Protection",
    "Swarm": "Growth & Expansion",
}

COUNTERPART_MAP = {
    "Queen":     ("Strategy Synthesis Agent",
                  "distills scattered signal into decision-grade briefs, so the leader spends "
                  "their attention on the trade-offs only they can make"),
    "Catalyst":  ("Cadence & Dependency Agent",
                  "runs the calendar of commitments and dependencies, surfaces the blockers "
                  "before they cost a week, and turns rituals into engineered outcomes"),
    "Hygienist": ("Debt Detection Agent",
                  "watches for the drift patterns — quality, process, technical, cultural — "
                  "that only compound in the dark, and names them while they are still cheap"),
}

VOICE_BRIEF = """You are a senior brand copywriter for Hive Enterprises, working in the Bee Archetypes voice.

VOICE RULES — obey strictly:
- Sentences earn their place. No filler, no hedging, no consultant-speak.
- Executive and human. Precise. Occasionally quietly reverent about work, never mystical.
- No em dashes. No "the real story is". No "not X, but Y" constructions. No "in a world where".
- Prefer concrete over aspirational. Show the shape of the archetype, not adjectives about it.
- Reference the person by role, not name. "The Queen sees…" not "As a Queen, you see…"
- Prefer active voice, present tense.
- No exclamation marks. No emoji. No em dashes (use commas or periods).
"""

def build_prompt(a_id, name, system, system_label, seed, counterpart_key):
    counterpart_name, counterpart_desc = COUNTERPART_MAP[counterpart_key]
    other_archetype_names = [row[1] for row in ARCHETYPES if row[0] != a_id]
    other_names_str = ", ".join(other_archetype_names)

    return f"""{VOICE_BRIEF}

Write the full profile for the {name} archetype.

- System: {system} — {system_label}
- Seed (working definition, tighten this): {seed}
- Their Agentic Counterpart: the {counterpart_name}, which {counterpart_desc}.
- The other archetypes they might complement: {other_names_str}

Output ONLY a JSON object with exactly these five fields. No commentary, no code fences, no headers.

{{
  "oneLiner": "6-10 words. What this archetype IS in one line. Present tense. No filler.",
  "contribution": "2 sentences. How the {name} contributes to how work actually flows through an organization. Concrete, show the pattern of their attention. Not aspirational.",
  "shadow": "2 sentences. The failure mode this archetype falls into under stress. Compassionate — a load-bearing pattern that breaks under load, not a character flaw.",
  "balance": "1 sentence naming exactly 2 or 3 archetypes whose contribution complements a {name}. Choose from: {other_names_str}. Format: 'Balanced by the [Name] and the [Name].'",
  "aiPairing": "3 sentences. What the {counterpart_name} does for the {name}, what the {name} still decides, why the pairing amplifies rather than replaces. Frame the AI as an instrument the {name} wields."
}}"""


def call_glm(prompt, max_tokens=3000, temperature=0.7):
    """Call the GLM-4.6 llama-server at :8081."""
    body = json.dumps({
        "model": "glm-4.6",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "top_p": 0.95,
        "max_tokens": max_tokens,
        "stream": False,
    }).encode("utf-8")

    req = urlreq.Request(
        "http://127.0.0.1:8081/v1/chat/completions",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlreq.urlopen(req, timeout=360) as resp:
        result = json.loads(resp.read().decode("utf-8"))
    return result["choices"][0]["message"]["content"]


def extract_json(text):
    """Pull the first {...} JSON object from a response."""
    # Strip code fences if any
    text = re.sub(r"^```(?:json)?", "", text.strip(), flags=re.MULTILINE)
    text = re.sub(r"```$", "", text.strip(), flags=re.MULTILINE)
    # Find outermost braces
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if not m:
        raise ValueError(f"no JSON object in response: {text[:200]}")
    return json.loads(m.group(0))


def gen_one(row):
    a_id, name, system, system_label, seed, counterpart_key = row
    t0 = time.time()
    prompt = build_prompt(a_id, name, system, system_label, seed, counterpart_key)
    raw = call_glm(prompt)
    parsed = extract_json(raw)
    elapsed = time.time() - t0
    # Validate all 5 fields present
    for k in ("oneLiner", "contribution", "shadow", "balance", "aiPairing"):
        if k not in parsed or not parsed[k].strip():
            raise ValueError(f"{a_id}: missing/empty field {k}")
    parsed["id"] = a_id
    parsed["name"] = name
    parsed["system"] = system
    parsed["systemLabel"] = system_label
    parsed["agenticCounterpart"] = counterpart_key
    return a_id, parsed, elapsed


def main():
    print(f"Generating content for {len(ARCHETYPES)} archetypes via GLM-4.6...")
    print(f"Sequential (server is --parallel 1). Expected: ~30s/archetype = ~7.5 min total.")
    print()

    results = {}
    failed = []
    total_start = time.time()

    with cf.ThreadPoolExecutor(max_workers=1) as executor:
        futures = {executor.submit(gen_one, row): row[0] for row in ARCHETYPES}
        for future in cf.as_completed(futures):
            a_id = futures[future]
            try:
                aid_returned, parsed, elapsed = future.result()
                results[aid_returned] = parsed
                print(f"  [{elapsed:5.1f}s] {parsed['name']:14s} | primary bee: \"{parsed['oneLiner']}\"")
            except Exception as e:
                failed.append((a_id, str(e)))
                print(f"  [FAILED] {a_id}: {e}", file=sys.stderr)

    total_elapsed = time.time() - total_start
    print()
    print(f"Total wall: {total_elapsed:.1f}s | success: {len(results)}/{len(ARCHETYPES)} | failed: {len(failed)}")

    if failed:
        print(f"\nFailures:")
        for a_id, err in failed:
            print(f"  - {a_id}: {err}")

    # Preserve order per ARCHETYPES definition (not race order)
    ordered = [results[row[0]] for row in ARCHETYPES if row[0] in results]

    # Write raw JSON snapshot
    Path("/tmp/bee-archetype-content.json").write_text(json.dumps(ordered, indent=2))
    print(f"\nWrote /tmp/bee-archetype-content.json ({len(ordered)} archetypes)")

    return ordered

if __name__ == "__main__":
    main()
