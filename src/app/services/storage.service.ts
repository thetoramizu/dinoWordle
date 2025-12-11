import { Injectable, signal } from '@angular/core';
import { Attempt } from '../models/attempt';
import { StreakDetail, StreakInfo } from '../models/streak';

@Injectable()
export class StorageService {
  private readonly DAILY = 'daily_attempts';
  private readonly STREAK = 'tusmo_streak';
  private readonly SEQUENCE = 'daily_sequence';

  streakInStorage = signal<StreakInfo | null>(null);

  saveAttempts(data: Attempt) {
    localStorage.setItem(this.DAILY, JSON.stringify(data));
  }

  loadAttempts() {
    const raw = localStorage.getItem(this.DAILY);
    return raw ? JSON.parse(raw) : {};
  }

  saveStreak(data: StreakInfo | any) {
    localStorage.setItem(this.STREAK, JSON.stringify(data));
    this.streakInStorage.set(data);
  }

  loadStreak() {
    const raw = this.migrateIfNeeded(localStorage.getItem(this.STREAK));
    const value = raw ? JSON.parse(raw) : null;
    this.streakInStorage.set(value);
    return value;
  }

  saveDailySequence(data: {
    [date: string]: {
      solvedCount: number;
      attempts: Record<number, Attempt[]>;
    };
  }) {
    localStorage.setItem(this.SEQUENCE, JSON.stringify(data));
  }

  loadDailySequence() {
    const raw = localStorage.getItem(this.SEQUENCE);
    return raw ? JSON.parse(raw) : {};
  }

  private migrateIfNeeded(raw: any) {
  if (!raw) return null;

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return raw;
  }

  // 🔥 Détection du format ancien (flat)
  const isOldFormat =
    data.currentStreak !== undefined &&
    data.bestStreak !== undefined;

  if (isOldFormat) {
    console.log("Migration du streak localStorage → nouveau format");

    const migrated = {
      daily: {
        currentStreak: data.currentStreak,
        bestStreak: data.bestStreak,
        lastSuccessDate: data.lastSuccessDate || null
      },
      sequence: {
        currentStreak: 0,
        bestStreak: 0,
        lastSuccessDate: null
      }
    };

    localStorage.setItem('tusmo_streak', JSON.stringify(migrated));
    return JSON.stringify(migrated)
  }
  return raw
}
}
