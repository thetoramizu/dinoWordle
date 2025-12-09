import { Component, inject } from '@angular/core';
import { AchievementsComponent } from './achievements/achievements.component';
import { SequenceComponent } from './sequence/sequence.component';
import { DailyWordComponent } from './daily-word/daily-word.component';
import { RouterOutlet } from '@angular/router';
import { WordService } from './services/word.service';
import { WordGameComponent } from './word-game/word-game.component';
import { DailySequenceComponent } from './daily-sequence/daily-sequence.component';

@Component({
  selector: 'app-root',
  imports: [
    AchievementsComponent,
    RouterOutlet,
    DailySequenceComponent,
    WordGameComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'DinoWordle';
  activeTab: 'daily' | 'sequence' = 'daily';

  protected readonly ws = inject(WordService);

  ngOnInit() {
    this.ws.loadDictionary();
  }
}
