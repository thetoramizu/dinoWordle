import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { StreakDetail, StreakInfo } from '../models/streak';

@Injectable()
export class StreakService {
  private data: StreakInfo = {
    daily: { currentStreak: 0, bestStreak: 0, lastSuccessDate: null },
    sequence: { currentStreak: 0, bestStreak: 0, lastSuccessDate: null },
  };
  constructor(private storage: StorageService) {
    const loaded = this.storage.loadStreak();
    if (loaded) this.data = loaded;
  }

  getStreak() {
    return this.data;
  }



  get sequenceStreak(): StreakDetail {
    return this.data.sequence;
  }

  updateSequenceStreak(success: boolean, dateStr: string) {
     if (!success) return this.storage.saveStreak(this.data);

    // si succès le même jour déjà enregistré => rien
    if (this.sequenceStreak.lastSuccessDate === dateStr)
      return this.storage.saveStreak(this.data);

    const last = this.sequenceStreak.lastSuccessDate
      ? new Date(this.sequenceStreak.lastSuccessDate)
      : null;
    const today = new Date(dateStr);

    if (last) {
      const diff = Math.floor(
        (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
          Date.UTC(last.getFullYear(), last.getMonth(), last.getDate())) /
          (1000 * 60 * 60 * 24)
      );
      if (diff === 1) {
        this.sequenceStreak.currentStreak += 1;
      } else if (diff > 1) {
        this.sequenceStreak.currentStreak = 1;
      } else {
        /* same day handled */
      }
    } else {
      this.sequenceStreak.currentStreak = 1;
    }

    if (this.sequenceStreak.currentStreak > this.sequenceStreak.bestStreak)
      this.sequenceStreak.bestStreak = this.sequenceStreak.currentStreak;
    this.sequenceStreak.lastSuccessDate = dateStr;

    const newStreak: StreakInfo = {
      daily: this.dailyStreak,
      sequence: this.sequenceStreak
    }

    this.storage.saveStreak(newStreak);
  }


  get dailyStreak(): StreakDetail {
    return this.data.daily;
  }
  updateDailyStreak(success: boolean, dateStr: string) {
  if (!success) return this.storage.saveStreak(this.data);

    // si succès le même jour déjà enregistré => rien
    if (this.dailyStreak.lastSuccessDate === dateStr)
      return this.storage.saveStreak(this.data);

    const last = this.dailyStreak.lastSuccessDate
      ? new Date(this.dailyStreak.lastSuccessDate)
      : null;
    const today = new Date(dateStr);

    if (last) {
      const diff = Math.floor(
        (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
          Date.UTC(last.getFullYear(), last.getMonth(), last.getDate())) /
          (1000 * 60 * 60 * 24)
      );
      if (diff === 1) {
        this.dailyStreak.currentStreak += 1;
      } else if (diff > 1) {
        this.dailyStreak.currentStreak = 1;
      } else {
        /* same day handled */
      }
    } else {
      this.dailyStreak.currentStreak = 1;
    }

    if (this.dailyStreak.currentStreak > this.dailyStreak.bestStreak)
      this.dailyStreak.bestStreak = this.dailyStreak.currentStreak;
    this.dailyStreak.lastSuccessDate = dateStr;

       const newStreak: StreakInfo = {
      daily: this.dailyStreak,
      sequence: this.sequenceStreak
    }

    this.storage.saveStreak(newStreak);

  }
}
