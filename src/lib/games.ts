import type { GameSummary } from '@/shared';
import { BACKEND_URL } from './config';

export async function fetchGames(): Promise<GameSummary[]> {
  const res = await fetch(`${BACKEND_URL}/api/games`);
  if (!res.ok) throw new Error('Could not load games');
  return res.json();
}
