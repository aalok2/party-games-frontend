import AsyncStorage from '@react-native-async-storage/async-storage';

const NAME_KEY = 'player-name';
const tokenKey = (code: string) => `seat-token:${code}`;

// Storage failing should never block play, so every call swallows errors.
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export const storage = {
  getName: () => safe(() => AsyncStorage.getItem(NAME_KEY), null),
  setName: (name: string) => safe(() => AsyncStorage.setItem(NAME_KEY, name), undefined),
  /** The seat token for a room, so a dropped connection rejoins the same seat. */
  getToken: (code: string) => safe(() => AsyncStorage.getItem(tokenKey(code)), null),
  setToken: (code: string, token: string) => safe(() => AsyncStorage.setItem(tokenKey(code), token), undefined),
  clearToken: (code: string) => safe(() => AsyncStorage.removeItem(tokenKey(code)), undefined),
};
