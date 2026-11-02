import { create } from 'zustand';
import type { GameSummary, RoomView, SettingValue } from '@/shared';
import { fetchGames } from '@/lib/games';
import { request, socket } from '@/lib/socket';
import { storage } from '@/lib/storage';

type Connection = 'idle' | 'connecting' | 'online' | 'offline' | 'outdated';

interface RoomState {
  room: RoomView | null;
  games: GameSummary[];
  connection: Connection;
  kicked: boolean;
  loadGames(): Promise<void>;
  create(name: string, gameId?: string): Promise<string>;
  join(code: string, name: string): Promise<void>;
  /** Rejoin a room we have a seat token for; false if we don't. */
  resume(code: string): Promise<boolean>;
  leave(): Promise<void>;
  configure(patch: { gameId?: string; settings?: Record<string, SettingValue> }): Promise<void>;
  start(): Promise<void>;
  kick(playerId: string): Promise<void>;
  backToLobby(): Promise<void>;
  act(key: string, value: string): Promise<void>;
}

export const useRoom = create<RoomState>((set, get) => ({
  room: null,
  games: [],
  connection: 'idle',
  kicked: false,

  async loadGames() {
    if (get().games.length) return;
    set({ games: await fetchGames() });
  },

  async create(name, gameId) {
    set({ connection: 'connecting', kicked: false });
    const r = await request('room:create', { name, gameId });
    await storage.setToken(r.code, r.token);
    await storage.setName(name);
    return r.code;
  },

  async join(code, name) {
    set({ connection: 'connecting', kicked: false });
    const token = (await storage.getToken(code)) ?? undefined;
    const r = await request('room:join', { code, name, token });
    await storage.setToken(r.code, r.token);
    await storage.setName(name);
  },

  async resume(code) {
    const token = await storage.getToken(code);
    if (!token) return false;
    try {
      await request('room:join', { code, name: '', token });
      return true;
    } catch {
      await storage.clearToken(code);
      return false;
    }
  },

  async leave() {
    const code = get().room?.code;
    set({ room: null });
    if (code) await storage.clearToken(code);
    await request('room:leave', {}).catch(() => {});
  },

  async configure(patch) {
    await request('room:configure', patch);
  },
  async start() {
    await request('room:start', {});
  },
  async kick(playerId) {
    await request('room:kick', { playerId });
  },
  async backToLobby() {
    await request('room:lobby', {});
  },
  async act(key, value) {
    await request('game:act', { key, value });
  },
}));

socket.on('room:state', (room) => useRoom.setState({ room, connection: 'online' }));
socket.on('room:kicked', () => {
  const code = useRoom.getState().room?.code;
  if (code) void storage.clearToken(code);
  useRoom.setState({ room: null, kicked: true });
});
socket.on('connect', () => {
  // After a dropped connection, take our seat back.
  const code = useRoom.getState().room?.code;
  if (code) void useRoom.getState().resume(code);
});
socket.on('disconnect', () => useRoom.setState({ connection: 'offline' }));
socket.on('connect_error', (err) =>
  useRoom.setState({ connection: err.message === 'outdated_client' ? 'outdated' : 'offline' }),
);
