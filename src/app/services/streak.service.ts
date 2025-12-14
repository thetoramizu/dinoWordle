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
    console.log('update sequence, ', this.sequenceStreak);

    if (!success) {
      this.sequenceStreak.currentStreak = 0;
      const newStreak: StreakInfo = {
        daily: this.dailyStreak,
        sequence: this.sequenceStreak,
      };

      return this.storage.saveStreak(newStreak);
    }

    // si succès le même jour déjà enregistré => rien
    if (this.sequenceStreak.lastSuccessDate === dateStr) {
      return this.storage.saveStreak(this.data);
    }

    // On ne vérifie plus les jours consécutifs

    this.sequenceStreak.currentStreak += 1;

    if (this.sequenceStreak.currentStreak > this.sequenceStreak.bestStreak)
      this.sequenceStreak.bestStreak = this.sequenceStreak.currentStreak;
    this.sequenceStreak.lastSuccessDate = dateStr;

    const newStreak: StreakInfo = {
      daily: this.dailyStreak,
      sequence: this.sequenceStreak,
    };

    console.log('newstreak : ', newStreak);

    this.storage.saveStreak(newStreak);
  }

  get dailyStreak(): StreakDetail {
    return this.data.daily;
  }

  updateDailyStreak(success: boolean, dateStr: string) {
    if (!success) {
      this.dailyStreak.currentStreak = 0;
      const newStreak: StreakInfo = {
        daily: this.dailyStreak,
        sequence: this.sequenceStreak,
      };

      return this.storage.saveStreak(newStreak);
    }

    // si succès le même jour déjà enregistré => rien
    if (this.dailyStreak.lastSuccessDate === dateStr) {
      return this.storage.saveStreak(this.data);
    }

    // On ne vérifie plus les jours consécutifs
    this.dailyStreak.currentStreak += 1;

    if (this.dailyStreak.currentStreak > this.dailyStreak.bestStreak)
      this.dailyStreak.bestStreak = this.dailyStreak.currentStreak;
    this.dailyStreak.lastSuccessDate = dateStr;

    const newStreak: StreakInfo = {
      daily: this.dailyStreak,
      sequence: this.sequenceStreak,
    };

    this.storage.saveStreak(newStreak);
  }
}
