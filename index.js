import 'expo-router/entry';

import './src/i18n';
import { registerPlaybackServiceIfAvailable } from './src/features/player/service';

// RNTP playback servisi uygulama bileşenlerinden önce kaydedilmelidir.
registerPlaybackServiceIfAvailable();
