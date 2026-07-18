import 'expo-router/entry';

import { registerPlaybackServiceIfAvailable } from './src/features/player/service';

// RNTP playback servisi uygulama bileşenlerinden önce kaydedilmelidir.
registerPlaybackServiceIfAvailable();
