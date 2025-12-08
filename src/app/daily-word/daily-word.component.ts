import { Component, HostListener, inject, signal } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { StreakService } from '../services/streak.service';
import { WordService } from '../services/word.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-daily-word',
  imports: [FormsModule],
  templateUrl: './daily-word.component.html',
  styleUrl: './daily-word.component.scss',
})
export class DailyWordComponent {
  guess = '';
  attempts: any[] = [];
  maxGuesses = 6;

  protected readonly ws = inject(WordService);
  private readonly storage = inject(StorageService);
  private readonly ss = inject(StreakService);

  ngOnInit() {
    this.ws.wordOfDaySignal();
    const allAttempts = this.storage.loadAttempts();
    this.attempts = allAttempts[this.ws.wordOfDaySignal()!.date] || [];
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key.toUpperCase();

    // Suppression
    if (key === 'BACKSPACE') {
      this.guess = this.guess.slice(0, -1);
      return;
    }

    // Ignorer si mot complet
    if (this.guess.length >= this.ws.wordOfDaySignal()!.word.length) return;

    // Autoriser uniquement les lettres A-Z
    if (/^[A-Z]$/.test(key)) {
      this.guess += key;
    }
  }

  submit() {
    if (!this.guess || this.attempts.length >= this.maxGuesses) return;
    const { feedback, correct } = this.ws.checkGuess(
      this.guess,
      this.ws.wordOfDaySignal()!.word
    );
    const attempt = {
      date: this.ws.wordOfDaySignal()!.date,
      guess: this.guess.toUpperCase(),
      result: correct ? 'correct' : 'incorrect',
      feedback,
    };
    this.attempts.push(attempt);

    // sauvegarde globale
    const allAttempts = this.storage.loadAttempts();
    allAttempts[this.ws.wordOfDaySignal()!.date] = this.attempts;
    this.storage.saveAttempts(allAttempts);

    if (correct) {
      this.ss.updateStreak(true, this.ws.wordOfDaySignal()!.date);
    }
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
    return this.attempts[this.attempts.length - 1].result === 'correct';
  }
}
