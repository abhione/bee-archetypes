#!/usr/bin/env python3
"""
merge-generated-content.py — take the GLM-produced /tmp/bee-archetype-content.json
and inject it into src/data/archetypes.ts by rewriting the `content: { ... }` block
for each archetype.

Idempotent. Preserves manual edits OUTSIDE the content blocks.
Copy-edit gate: writes each replacement to a diff file for Abhi's review.
"""

import json
import re
import sys
from pathlib import Path
from datetime import datetime

REPO = Path(__file__).resolve().parent.parent
ARCHETYPES_TS = REPO / 'src' / 'data' / 'archetypes.ts'
CONTENT_JSON = Path('/tmp/bee-archetype-content.json')
DIFF_LOG = REPO / 'docs' / 'content-import-diff.md'


def indent_multiline(s: str, level: int = 6) -> str:
    """Format a string as a TS string literal, safely escaping backticks."""
    escaped = s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    return '`' + escaped + '`'


def build_content_block(fields: dict) -> str:
    lines = ['    content: {']
    for key in ['oneLiner', 'contribution', 'shadow', 'balance', 'aiPairing']:
        val = fields.get(key, '')
        if not val:
            print(f'  [warn] missing field {key}', file=sys.stderr)
            val = f'[TODO: draft {key}]'
        lines.append(f'      {key}: {indent_multiline(val)},')
    lines.append('    },')
    return '\n'.join(lines)


def main() -> int:
    if not CONTENT_JSON.exists():
        print(f'ERROR: {CONTENT_JSON} not found; run generator first', file=sys.stderr)
        return 1

    payload = json.loads(CONTENT_JSON.read_text())
    if not payload:
        print(f'ERROR: {CONTENT_JSON} is empty', file=sys.stderr)
        return 1

    src = ARCHETYPES_TS.read_text()
    original_src = src
    changes = []

    for archetype_id, fields in payload.items():
        # Match the entry: { id: 'queen', ... content: { ... }, ... }
        # We only replace the content: { ... } block for this archetype.
        # Strategy: find the archetype's block start (`id: '<archetype_id>'`),
        # then within its span find the `content: { ... }` block and replace it.
        pattern = re.compile(
            r"(id:\s*'" + re.escape(archetype_id) + r"'.*?)"  # up to id
            r"(\s*content:\s*\{[^}]*\},)",  # matches content: { ... }, (assumes no nested braces)
            re.DOTALL,
        )
        m = pattern.search(src)
        if not m:
            print(f'  [skip] {archetype_id}: no content: {{...}} block found', file=sys.stderr)
            continue

        new_content_block = '\n' + build_content_block(fields)
        replacement = m.group(1) + new_content_block

        # Log the change
        old_block = m.group(2).strip()
        new_block = new_content_block.strip()
        changes.append((archetype_id, old_block, new_block))

        src = src[:m.start()] + replacement + src[m.end():]

    if not changes:
        print('No archetype blocks matched. Aborting write.', file=sys.stderr)
        return 1

    ARCHETYPES_TS.write_text(src)

    DIFF_LOG.parent.mkdir(parents=True, exist_ok=True)
    with DIFF_LOG.open('w') as f:
        f.write(f'# Content Import Diff — {datetime.now().isoformat()}\n\n')
        f.write(f'{len(changes)} archetypes updated.\n\n')
        for aid, old, new in changes:
            f.write(f'## {aid}\n\n')
            f.write('### OLD\n\n')
            f.write('```typescript\n' + old + '\n```\n\n')
            f.write('### NEW (GLM-4.6 drafted, needs Abhi copy-edit)\n\n')
            f.write('```typescript\n' + new + '\n```\n\n')
            f.write('---\n\n')

    print(f'Updated {len(changes)} archetypes in {ARCHETYPES_TS}')
    print(f'Diff log written to {DIFF_LOG}')
    if len(changes) < 15:
        print(f'WARNING: only {len(changes)}/15 archetypes updated. Missing archetypes still hold placeholder content.')
    print(f'Bytes changed: {len(src) - len(original_src):+d}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
