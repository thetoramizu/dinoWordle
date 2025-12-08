import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { StorageService } from '../services/storage.service';
import { StreakService } from '../services/streak.service';
import { WordService } from '../services/word.service';
import { FormsModule } from '@angular/forms';
import { Attempt } from '../models/attempt';
import { ClavierVirtuelComponent } from '../clavier-virtuel/clavier-virtuel.component';

@Component({
  selector: 'app-daily-word',
  imports: [FormsModule, ClavierVirtuelComponent],
  templateUrl: './daily-word.component.html',
  styleUrl: './daily-word.component.scss',
})
export class DailyWordComponent {
  guess = '';
  maxGuesses = 5;

  protected errorMessage = signal<string>('');

  protected readonly ws = inject(WordService);
  private readonly storage = inject(StorageService);
  private readonly ss = inject(StreakService);

  keyboardStates = signal<Record<string, 'green' | 'yellow' | 'gray'>>({});

  allAttempts = signal<any>(this.storage.loadAttempts());
  attempts = computed(() => {
    return this.allAttempts()[this.ws.wordOfDaySignal()!.date] || [];
  });

  constructor() {
    const first = this.ws.wordOfDaySignal()?.word[0].toUpperCase() || 'S';
    this.guess = first;

    effect(() => {
      this.allAttempts();
      this.updateKeyboardStates();
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key.toUpperCase();
    const wordLength = this.ws.wordOfDaySignal()?.word.length || 0;

    // Touche Enter → submit si le mot est complet
    if (key === 'ENTER') {
      if (this.guess.length === wordLength) {
        this.submit();
      }
      event.preventDefault();
      return;
    }

    // Suppression
    if (key === 'BACKSPACE') {
      if (this.guess.length > 1) {
        this.guess = this.guess.slice(0, -1); // empêche de supprimer la première lettre
      }
      return;
    }

    // Ignorer si mot complet
    if (this.guess.length >= this.ws.wordOfDaySignal()!.word.length) return;

    // Autoriser uniquement les lettres A-Z
    if (/^[A-Z]$/.test(key)) {
      const maxLength = this.ws.wordOfDaySignal()!.word.length;
      if (this.guess.length < maxLength) {
        this.guess += key;
      }
    }
  }

  submit() {
    const wordSignal = this.ws.wordOfDaySignal();
    const wordList = this.ws.words(); // liste de mots valides

    if (!this.guess || this.attempts().length >= this.maxGuesses || !wordSignal)
      return;

    // Vérifier si le mot est dans la liste
    if (!wordList.includes(this.guess.toLowerCase())) {
      this.errorMessage.set(`Le mot "${this.guess}" n'existe pas.`);
      return;
    }

    const { feedback, correct } = this.ws.checkGuess(
      this.guess,
      wordSignal.word
    );

    const attempt: Attempt = {
      date: wordSignal.date,
      guess: this.guess.toUpperCase(),
      result: correct ? 'correct' : 'incorrect',
      feedback,
    };

    const date = wordSignal.date;

    // 1️⃣ Mettre à jour le signal allAttempts
    this.allAttempts.update((current) => {
      const clone = { ...current }; // clone de l'objet existant
      if (!clone[date]) clone[date] = []; // initialise le tableau si nécessaire
      clone[date] = [...clone[date], attempt]; // ajout immuable du nouvel attempt
      return clone;
    });

    // 2️⃣ Sauvegarde dans le localStorage
    this.storage.saveAttempts(this.allAttempts());

    // 3️⃣ Mise à jour du streak si correct
    if (correct) {
      this.ss.updateStreak(true, date);
    }

    // 4️⃣ Réinitialiser la saisie
    this.guess = '';
  }

  getLetters(attempt: any): string[] {
    return attempt.guess.split('');
  }

  getColor(attempt: any, index: number): string {
    const fb = attempt.feedback[index];
    if (fb === 'green') return 'green';
    if (fb === 'yellow') return 'yellow';
    return 'gray';
  }

  isLastCorrect(): boolean {
    if (!this.attempts.length) return false;
    return this.attempts()[this.attempts.length - 1].result === 'correct';
  }

  // Calcul automatique des états des lettres à partir des essais
  updateKeyboardStates() {
    const states: Record<string, 'green' | 'yellow' | 'gray'> = {};
    for (const attempt of this.attempts()) {
      attempt.feedback.forEach((f: any, i: any) => {
        const letter = attempt.guess[i];
        if (f === 'green') states[letter] = 'green';
        else if (f === 'yellow' && states[letter] !== 'green')
          states[letter] = 'yellow';
        else if (!states[letter]) states[letter] = 'gray';
      });
    }
    this.keyboardStates.set(states);
  }

  // Gestion des touches du clavier virtuel
  handleVirtualKey(key: string) {
    const wordSignal = this.ws.wordOfDaySignal();
    if (!wordSignal) return;
    const wordLength = wordSignal.word.length;

    if (key === 'Enter' && this.guess.length === wordLength) this.submit();
    else if (key === 'Backspace' && this.guess.length > 1)
      this.guess = this.guess.slice(0, -1);
    else if (/^[A-Z]$/.test(key)) {
      const maxLength = this.ws.wordOfDaySignal()!.word.length;
      if (this.guess.length < maxLength) this.guess += key;
    }
  }
}
