// Ses backend'i soyutlaması. İki uygulama var:
// - backend.native.ts: react-native-track-player (kilit ekranı kontrolleri,
//   background audio) — EAS dev build gerektirir; Expo Go'da expo-audio'ya düşer.
// - backend.ts (web/jest): expo-audio — önizleme ve test için yeterli.

export type PlaybackStatus = {
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  didJustFinish: boolean;
};

export type TrackMeta = {
  id: string;
  title: string;
  artist: string; // uygulama adı — kilit ekranında görünür
  /** Kilit ekranı kapak görseli (Metro require numarası); yoksa atlanır. */
  artwork?: number;
};

export interface AudioBackend {
  /** asset: Metro require() numarası (audioAssets haritasından) */
  load(asset: number, meta: TrackMeta, startAtSec: number): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seekTo(sec: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getStatus(): Promise<PlaybackStatus>;
  unload(): Promise<void>;
}
