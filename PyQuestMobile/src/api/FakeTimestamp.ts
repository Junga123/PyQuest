// FakeTimestamp эмулирует серверный timestamp так, чтобы код, ожидающий
// объект с .toDate() (и переживающий JSON round-trip через AsyncStorage),
// продолжал работать без изменений. После JSON.stringify сохраняется как
// { __fts__: <ms> }, а revive() восстанавливает экземпляр обратно.

export class FakeTimestamp {
  readonly ms: number;

  constructor(ms?: number) {
    this.ms = typeof ms === 'number' ? ms : Date.now();
  }

  static now(): FakeTimestamp {
    return new FakeTimestamp(Date.now());
  }

  static fromDate(d: Date): FakeTimestamp {
    return new FakeTimestamp(d.getTime());
  }

  toDate(): Date {
    return new Date(this.ms);
  }

  toMillis(): number {
    return this.ms;
  }

  // Кастомная сериализация — переживает JSON.stringify в AsyncStorage.
  toJSON(): { __fts__: number } {
    return { __fts__: this.ms };
  }

  // Человекочитаемая дата (ru)
  format(): string {
    const d = this.toDate();
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}

// Восстанавливает FakeTimestamp из распарсенного JSON (рекурсивно по объекту).
export function reviveTimestamps<T>(value: T): T {
  if (value == null || typeof value !== 'object') return value;
  const anyVal = value as any;
  if (typeof anyVal.__fts__ === 'number') {
    return new FakeTimestamp(anyVal.__fts__) as unknown as T;
  }
  if (Array.isArray(anyVal)) {
    return anyVal.map((v) => reviveTimestamps(v)) as unknown as T;
  }
  for (const key of Object.keys(anyVal)) {
    anyVal[key] = reviveTimestamps(anyVal[key]);
  }
  return value;
}
