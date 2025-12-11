import { Component, computed, inject, OnInit } from '@angular/core';
import { StreakService } from '../services/streak.service';
import { DatePipe } from '@angular/common';
import { StorageService } from '../services/storage.service';
import { StreakDetail } from '../models/streak';

@Component({
  selector: 'app-achievements',
  imports: [DatePipe],
  templateUrl: './achievements.component.html',
  styleUrl: './achievements.component.scss',
})
export class AchievementsComponent implements OnInit {
  streak: any;
  private readonly ss = inject(StreakService);
  private readonly storage = inject(StorageService);

  dailyStreak = computed<StreakDetail | null> (()=>{
    const store = this.storage.streakInStorage();
    return store ? store.daily : null
  })

  sequenceStreak = computed (()=>{
    const store = this.storage.streakInStorage();
    return store ? store.sequence : null
  })

  ngOnInit() {
    this.streak = this.ss.getStreak();
  }
}

