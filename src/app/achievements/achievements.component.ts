import { Component, inject, OnInit } from '@angular/core';
import { StreakService } from '../services/streak.service';

@Component({
  selector: 'app-achievements',
  imports: [],
  templateUrl: './achievements.component.html',
  styleUrl: './achievements.component.scss',
})
export class AchievementsComponent implements OnInit {
  streak: any;
  private readonly ss = inject(StreakService);
  ngOnInit() {
    this.streak = this.ss.getStreak();
  }
}
