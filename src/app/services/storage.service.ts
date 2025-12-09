import { Injectable } from '@angular/core';
import { Attempt } from '../models/attempt';

@Injectable()
export class StorageService {
  private readonly DAILY = 'daily_attempts';
  private readonly STREAK = 'tusmo_streak';
  private readonly SEQUENCE = 'daily_sequence';

  saveAttempts(data: Attempt) {
    localStorage.setItem(this.DAILY, JSON.stringify(data));
  }
  loadAttempts() {
    const raw = localStorage.getItem(this.DAILY);
    return raw ? JSON.parse(raw) : {};
  }

  saveStreak(data: any) {
    localStorage.setItem(this.STREAK, JSON.stringify(data));
  }
  loadStreak() {
    const raw = localStorage.getItem(this.STREAK);
    return raw ? JSON.parse(raw) : null;
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
}
