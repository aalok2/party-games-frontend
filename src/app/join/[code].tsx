// Invite links (partygames://join/ABCDE) land here and go straight to the room.
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function JoinLink() {
  const { code } = useLocalSearchParams<{ code: string }>();
  return <Redirect href={`/room/${String(code ?? '').toUpperCase()}`} />;
}
