// Copies the client contract from a backend checkout into src/shared.
// The backend repo is the source of truth; run this after pulling backend changes:
//   BACKEND_DIR=../backend node scripts/sync-shared.mjs
// The server refuses clients whose PROTOCOL_VERSION doesn't match its own.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FILES = ['protocol.ts', 'design.ts', 'copy.ts'];
const from = join(resolve(process.env.BACKEND_DIR ?? '../backend'), 'src', 'shared');
const to = resolve('src', 'shared');

if (!existsSync(join(from, 'protocol.ts'))) {
  console.error(`No backend contract at ${from}. Set BACKEND_DIR to your backend checkout.`);
  process.exit(1);
}

for (const file of FILES) {
  const body = readFileSync(join(from, file), 'utf8');
  writeFileSync(join(to, file), `// Copied from backend/src/shared/${file} by scripts/sync-shared.mjs. Don't edit here.\n\n${body}`);
  console.log(`synced ${file}`);
}
