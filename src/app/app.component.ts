import { Component } from '@angular/core';
import { AchievementsComponent } from "./achievements/achievements.component";
import { SequenceComponent } from "./sequence/sequence.component";
import { DailyWordComponent } from "./daily-word/daily-word.component";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-root',
  imports: [AchievementsComponent, SequenceComponent, DailyWordComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DinoWordle';
}
