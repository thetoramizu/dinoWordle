import { Component, computed, inject } from '@angular/core';
import { WordService } from '../services/word.service';
import { WordOfDay } from '../models/word';
import { WordGameComponent } from "../word-game/word-game.component";

@Component({
  selector: 'app-infinite-mode',
  imports: [WordGameComponent],
  templateUrl: './infinite-mode.component.html',
  styleUrl: './infinite-mode.component.scss',
})
export class InfiniteModeComponent {
  private readonly wordService = inject(WordService);

  wordToFind = computed<WordOfDay | null>(() => {
    return this.wordService.infiniteModeWord();
  });

  refresh() {
    this.wordService.getRandomWord();
  }
}
