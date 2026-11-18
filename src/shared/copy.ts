// Copied from backend/src/shared/copy.ts by scripts/sync-shared.mjs. Don't edit here.

// What the narrator says for feed events, so every client words them the same way.

import type { FeedEvent } from './protocol';

const announce: Record<string, (player: string, value: string) => string> = {
  quiet_night: () => 'Nobody died last night.',
  no_majority: () => 'No majority. Nobody is out.',
  guess_right: (p, v) => `${p} guessed it: “${v}”. Round stolen.`,
  guess_wrong: (p, v) => `${p} guessed “${v}”. Wrong.`,
  word_was: (_p, v) => `The word was “${v}”.`,
  answer_was: (_p, v) => `The answer: ${v}.`,
};

/** One line describing a feed event, or null for events a client shows its own way. */
export function describeEvent(e: FeedEvent, nameOf: (id: string) => string): string | null {
  switch (e.kind) {
    case 'round':
      return `Round ${e.round}`;
    case 'eliminated':
      return e.role ? `${nameOf(e.player)} is out. They were ${e.role.name}.` : `${nameOf(e.player)} is out.`;
    case 'announce':
      return announce[e.key]?.(e.player ? nameOf(e.player) : '', e.value ?? '') ?? null;
    case 'text':
      return `${nameOf(e.player)}: ${e.text}`;
    case 'reveal':
      return `${nameOf(e.player)} is ${e.what === 'team' ? 'on the ' : ''}${e.label}${e.what === 'team' ? ' side' : ''}.`;
    case 'votes':
      if (e.of === 'option') return e.top ? `Most said “${e.top}”.` : 'Split down the middle.';
      return e.top ? `The vote landed on ${nameOf(e.top)}.` : 'The vote was split.';
    case 'score':
      return `${e.players.map(nameOf).join(', ')} +${e.points}`;
    case 'role_revealed':
      return `${nameOf(e.player)} was ${e.role.name}.`;
  }
}
