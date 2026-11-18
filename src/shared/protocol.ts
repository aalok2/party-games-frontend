// Copied from backend/src/shared/protocol.ts by scripts/sync-shared.mjs. Don't edit here.

// What travels over the socket between the server and the apps.
// The server is the only authority; each player receives a view with
// only what they're allowed to see.

// This file must stay self-contained (no imports): the mobile app keeps a copy of it.

export type SettingValue = number | boolean | string;

/** A house rule the host can change in the lobby. */
export interface GameSetting {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'choice';
  default: SettingValue;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { value: number | string; label: string }[];
  paid?: boolean;
}

export interface GameSummary {
  id: string;
  name: string;
  tagline: string;
  tier: 'free' | 'paid';
  players: { min: number; max: number };
  minutes: [number, number];
  settings: GameSetting[];
}

export interface RoomPlayer {
  id: string;
  name: string;
  connected: boolean;
  isHost: boolean;
  /** Stable index into the avatar palette. */
  tone: number;
}

export interface RoomView {
  code: string;
  me: string;
  hostId: string;
  players: RoomPlayer[];
  gameId: string;
  settings: Record<string, SettingValue>;
  status: 'lobby' | 'playing';
  match: MatchView | null;
}

export interface RoleCard {
  id: string;
  name: string;
  team: string;
  teamName: string;
  description: string;
}

export interface MatchView {
  gameId: string;
  round: number;
  totalRounds: number | null;
  /** Whether points decide a winner. Quick-vote games just end. */
  scored: boolean;
  /** The round's shared content, e.g. the prompt or question, in the order the game lists it. */
  content: { field: string; text: string }[] | null;
  phase: {
    id: string;
    title: string;
    ui: string | null;
    /** Epoch ms by the server's clock; null when the phase waits for players without a timer. */
    endsAt: number | null;
    /**
     * Time left when this view was sent. Use this (not endsAt) to draw timers:
     * device clocks are often minutes off.
     */
    msLeft: number | null;
    durationMs: number | null;
    turn: { playerId: string; index: number; total: number } | null;
  };
  me: {
    role: RoleCard | null;
    alive: boolean;
    /** Content shown on my card, e.g. { category: 'Food', word: 'Pav Bhaji' }. */
    info: Record<string, string>;
    /** Players whose role I can see (fellow Mafia). */
    allies: { playerId: string; roleId: string; roleName: string }[];
  };
  players: {
    id: string;
    alive: boolean;
    score: number;
    /** Whether they've acted in the current phase (never what they did). */
    acted: boolean;
    revealedRole: { id: string; name: string } | null;
  }[];
  prompt: Prompt | null;
  feed: FeedEvent[];
  result: MatchResult | null;
}

export interface Prompt {
  key: string;
  type: 'choose_player' | 'vote' | 'choose_option' | 'text' | 'ready';
  label: string;
  /** Player ids for choose_player and vote; strings for choose_option; answer tokens when `optionLabels` is set. */
  options: string[];
  /** Voting on anonymous answers: option token to the answer's text. */
  optionLabels: Record<string, string> | null;
  maxLength: number | null;
  submitted: string | null;
  /** In `agree` mode, what my teammates have picked so far. */
  teamPicks: { playerId: string; value: string }[];
}

export type FeedEvent = { id: number; round: number; phase: string } & (
  | { kind: 'round' }
  | { kind: 'eliminated'; player: string; role: { id: string; name: string } | null }
  | { kind: 'announce'; key: string; player: string | null; value: string | null }
  | { kind: 'text'; player: string; key: string; text: string }
  | { kind: 'reveal'; player: string; what: 'team' | 'role'; value: string; label: string }
  | {
      kind: 'votes';
      key: string;
      /** A player id, or the option text when `of` is "option". */
      top: string | null;
      of: 'player' | 'option';
      /** Most picked first. `voters` is empty when the host hides names; `count` is always right. */
      counts: { player: string; voters: string[]; count: number; label: string | null }[];
    }
  | { kind: 'score'; players: string[]; points: number }
  | { kind: 'role_revealed'; player: string; role: { id: string; name: string } }
);

export interface MatchResult {
  /** Player ids that won. */
  winners: string[];
  team: { id: string; name: string } | null;
  /** Final standings, best first. */
  standings: { player: string; score: number }[];
}

export type Ack<T = null> = { ok: true; data: T } | { ok: false; error: string };

export interface JoinResult {
  code: string;
  playerId: string;
  /** Keep this to rejoin the same seat after a dropped connection. */
  token: string;
}

export interface ClientToServer {
  'room:create': (p: { name: string; gameId?: string }, ack: (r: Ack<JoinResult>) => void) => void;
  'room:join': (p: { code: string; name: string; token?: string }, ack: (r: Ack<JoinResult>) => void) => void;
  'room:configure': (
    p: { gameId?: string; settings?: Record<string, SettingValue> },
    ack: (r: Ack) => void,
  ) => void;
  'room:start': (p: Record<string, never>, ack: (r: Ack) => void) => void;
  'room:kick': (p: { playerId: string }, ack: (r: Ack) => void) => void;
  'room:leave': (p: Record<string, never>, ack: (r: Ack) => void) => void;
  /** Host only: end the match (or leave the results) and go back to the lobby. */
  'room:lobby': (p: Record<string, never>, ack: (r: Ack) => void) => void;
  'game:act': (p: { key: string; value: string }, ack: (r: Ack) => void) => void;
}

export interface ServerToClient {
  'room:state': (room: RoomView) => void;
  'room:kicked': () => void;
}

/**
 * Bump when a change would break clients that still use the old shape.
 * Clients send it in the socket handshake (`auth: { protocol }`); the server refuses mismatches.
 */
export const PROTOCOL_VERSION = 1;

export const ROOM_CODE_LENGTH = 5;
export const NAME_MAX_LENGTH = 20;
