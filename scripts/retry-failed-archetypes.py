#!/usr/bin/env python3
"""
retry-failed-archetypes.py — reads /tmp/bee-archetype-content.json and
re-runs GLM-4.6 for any archetypes with missing/empty content.

Used to recover from partial-JSON failures (e.g. Waggle got cut mid-string
because max_tokens ran out). Uses max_tokens=4000 (was 3000).
"""

import json
import os
import re
import sys
import time
from pathlib import Path

# Reuse the generator's imports by executing it into a namespace.
from importlib.machinery import SourceFileLoader

REPO = Path(__file__).resolve().parent.parent
GEN_PATH = REPO / 'scripts' / 'generate-archetype-content.py'
CONTENT_JSON = Path('/tmp/bee-archetype-content-keyed.json')

gen = SourceFileLoader('gen', str(GEN_PATH)).load_module()


def is_incomplete(fields) -> bool:
    if not isinstance(fields, dict):
        return True
    required = ['oneLiner', 'contribution', 'shadow', 'balance', 'aiPairing']
    for key in required:
        val = fields.get(key)
        if not isinstance(val, str) or len(val) < 20:
            return True
    return False


def main() -> int:
    if not CONTENT_JSON.exists():
        print(f'{CONTENT_JSON} does not exist.', file=sys.stderr)
        return 1

    payload = json.loads(CONTENT_JSON.read_text() or '{}')
    all_archetypes = [row[0] for row in gen.ARCHETYPES]  # tuple: (id, name, ...)
    missing_or_incomplete = [
        aid for aid in all_archetypes if is_incomplete(payload.get(aid, {}))
    ]

    if not missing_or_incomplete:
        print('All 15 archetypes are complete. Nothing to retry.')
        return 0

    print(f'Retrying {len(missing_or_incomplete)} archetypes: {", ".join(missing_or_incomplete)}')
    updates = 0
    for aid in missing_or_incomplete:
        arch = next(row for row in gen.ARCHETYPES if row[0] == aid)
        prompt = gen.build_prompt(*arch)
        t0 = time.time()
        try:
            fields = gen.call_glm(prompt, max_tokens=4000, temperature=0.6)
        except Exception as e:
            print(f'  [FAILED] {aid}: {type(e).__name__}: {e}')
            continue
        dt = time.time() - t0
        if is_incomplete(fields):
            print(f'  [{dt:5.1f}s] {aid}: still incomplete, skipping')
            continue
        payload[aid] = fields
        # Preserve archetype ID ordering when writing (dict-keyed)
        ordered = {row[0]: payload[row[0]] for row in gen.ARCHETYPES if row[0] in payload}
        CONTENT_JSON.write_text(json.dumps(ordered, indent=2))
        print(f'  [{dt:5.1f}s] {aid.capitalize():15} | {fields["oneLiner"][:60]}')
        updates += 1

    print(f'\nRetries complete: {updates}/{len(missing_or_incomplete)} recovered.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
