# Party Games — mobile app

Expo (React Native) app for iOS and Android. Talks to the backend repo over Socket.IO.

## Run

```bash
pnpm install
cp .env.example .env          # set EXPO_PUBLIC_BACKEND_URL
pnpm start                    # then press i (iOS) or a (Android), or scan with Expo Go
```

On a real phone, `localhost` is the phone itself: point `EXPO_PUBLIC_BACKEND_URL` at your
computer's LAN address (`http://192.168.x.x:4000`) or the deployed backend.

## Shared contract

`src/shared/` (protocol types, design tokens, narrator copy) is copied from the backend repo,
which owns it. After pulling backend changes:

```bash
BACKEND_DIR=../backend pnpm sync-shared
```

The server refuses clients whose `PROTOCOL_VERSION` differs from its own, and the app tells
the player to update.

## Layout

- `src/app/` — routes: home, `room/[code]` (lobby + game), `join/[code]` (invite deep link)
- `src/components/game/` — role card (hold to reveal), prompts, feed, results
- `src/components/lobby/` — room code, players, game picker, house rules
- `src/components/ui/` — buttons, inputs, toasts, timer bar; all motion lives in `src/theme/motion.ts`
- `src/store/room.ts` — socket state and actions; rejoins your seat after a dropped connection

## Checks

```bash
pnpm typecheck && pnpm lint
```
## Frontend 
`
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
cd ~/party-games-app/frontend
npx expo run:android`