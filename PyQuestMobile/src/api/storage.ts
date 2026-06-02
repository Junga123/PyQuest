// Тонкая обёртка над AsyncStorage с версионированным ключом.
// При изменении схемы данных бампаем STORAGE_VERSION (v1 -> v2 -> ...),
// чтобы старые несовместимые записи не ломали приложение.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { reviveTimestamps } from './FakeTimestamp';

export const STORAGE_VERSION = 'v3';
const PREFIX = `pyquest_${STORAGE_VERSION}_`;

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return reviveTimestamps(parsed) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // молча игнорируем сбои записи — приложение остаётся рабочим
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch {
    /* noop */
  }
}

// Полная очистка только наших ключей (для кнопки «Сбросить прогресс»).
export async function clearAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k.startsWith(PREFIX));
    if (ours.length) await AsyncStorage.multiRemove(ours);
  } catch {
    /* noop */
  }
}
