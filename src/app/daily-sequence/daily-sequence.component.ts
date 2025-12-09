import { AfterViewInit, Component, computed, ElementRef, inject, signal, viewChild, HostListener, input, effect } from '@angular/core';
import { WordService } from '../services/word.service';
import { StorageService } from '../services/storage.service';
import { StreakService } from '../services/streak.service';
import { Attempt } from '../models/attempt';
import { ClavierVirtuelComponent } from '../clavier-virtuel/clavier-virtuel.component';
import { FormsModule } from '@angular/forms';
import { WordGameComponent } from "../word-game/word-game.component";
import { WordOfDay } from '../models/word';

@Component({
  selector: 'app-daily-sequence',
  templateUrl: './daily-sequence.component.html',
  styleUrl: './daily-sequence.component.scss',
  imports: [FormsModule, WordGameComponent],
})
export class DailySequenceComponent  {

  protected readonly ws = inject(WordService)

listDailySequence = input.required<WordOfDay[]>();

currentWord = computed<WordOfDay>(()=>{
  return this.listDailySequence()[this.ws.countSequenceSolvedToday()];
})

}
