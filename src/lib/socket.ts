import { io, type Socket } from 'socket.io-client';
import { PROTOCOL_VERSION, type Ack, type ClientToServer, type ServerToClient } from '@/shared';
import { BACKEND_URL } from './config';

export type GameSocket = Socket<ServerToClient, ClientToServer>;

export const socket: GameSocket = io(BACKEND_URL, {
  transports: ['websocket'],
  auth: { protocol: PROTOCOL_VERSION },
  autoConnect: false,
});

type Event = keyof ClientToServer;
type Payload<E extends Event> = Parameters<ClientToServer[E]>[0];
type Result<E extends Event> = Parameters<ClientToServer[E]>[1] extends (r: Ack<infer T>) => void ? T : never;

/** Emit and wait for the server's answer; rejects with the server's message. */
export function request<E extends Event>(event: E, payload: Payload<E>): Promise<Result<E>> {
  return new Promise((resolve, reject) => {
    if (!socket.connected) socket.connect();
    const emit = socket.timeout(8000).emit as unknown as (
      e: E,
      p: Payload<E>,
      cb: (err: Error | null, r: Ack<Result<E>>) => void,
    ) => void;
    emit.call(socket, event, payload, (err, r) => {
      if (err) return reject(new Error("Can't reach the game server. Check your connection."));
      if (r.ok) resolve(r.data);
      else reject(new Error(r.error));
    });
  });
}
