import type { StateStorage } from 'zustand/middleware';

// Kalıcı depo: cihazda MMKV (senkron, hızlı). MMKV native modül ister;
// web önizlemesi ve jest'te bellek-içi yedeğe düşer (kalıcılık cihazda önemli).

function createMemoryStorage(): StateStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

function createStorage(): StateStorage {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
    const mmkv = createMMKV({ id: 'sakin' });
    return {
      getItem: (key) => mmkv.getString(key) ?? null,
      setItem: (key, value) => mmkv.set(key, value),
      removeItem: (key) => mmkv.remove(key),
    };
  } catch {
    return createMemoryStorage();
  }
}

export const appStorage: StateStorage = createStorage();
