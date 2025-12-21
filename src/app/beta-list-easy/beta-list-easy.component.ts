import { Component, computed, inject } from '@angular/core';
import { WordGameComponent } from "../word-game/word-game.component";
import { WordOfDay } from '../models/word';
import { WordService } from '../services/word.service';

@Component({
  selector: 'app-beta-list-easy',
  imports: [WordGameComponent],
  templateUrl: './beta-list-easy.component.html',
  styleUrl: './beta-list-easy.component.scss'
})
export class BetaListEasyComponent {

  private readonly wordService = inject(WordService);

    wordToFind = computed<WordOfDay | null>(() => {
    return this.wordService.getBetaWordOfDay();
  });

  constructor() {
    this.wordService.loadBetaDictionary();
  }

}
