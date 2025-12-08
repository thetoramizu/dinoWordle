import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
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
export class DailyWordComponent implements AfterViewInit {
  // guess = '';
  maxGuesses = 5;

  firstLetter = '';
  typed = '';

  hiddenInput = viewChild<ElementRef<HTMLInputElement>>('hiddenInput');

  protected errorMessage = signal<string>('');

  protected readonly ws = inject(WordService);
  private readonly storage = inject(StorageService);
  private readonly ss = inject(StreakService);

  keyboardStates = signal<Record<string, 'green' | 'yellow' | 'gray'>>({});

  private updatingInput = false;


  allAttempts = signal<any>(this.storage.loadAttempts());
  attempts = computed(() => {
    return this.allAttempts()[this.ws.wordOfDaySignal()!.date] || [];
  });

  get fullGuess() {
    return (this.firstLetter + this.typed).toUpperCase();
  }

  constructor() {
    const w = this.ws.wordOfDaySignal();
    if (w) {
      this.firstLetter = w.word[0].toUpperCase();
    }
    effect(() => {
      this.allAttempts();
      this.updateKeyboardStates();
    });
    effect(() => {
      const w = this.ws.wordOfDaySignal();
      if (w) {
        this.firstLetter = w.word[0].toUpperCase();
      }
    });
  }

// Gestion clavier physique
@HostListener('window:keydown', ['$event'])
handleKeyboardEvent(event: KeyboardEvent) {
  const key = event.key.toUpperCase();
  const wordLength = this.ws.wordOfDaySignal()?.word.length || 0;
  const maxTyped = wordLength - 1;

  if (key === 'ENTER') {
    if (this.fullGuess.length === wordLength) this.submit();
    event.preventDefault();
    return;
  }

  if (key === 'BACKSPACE') {
    if (this.typed.length > 0) {
      this.typed = this.typed.slice(0, -1);
      this.syncHiddenInput();
    }
    event.preventDefault();
    return;
  }

  if (/^[A-Z]$/.test(key)) {
    if (this.typed.length < maxTyped) {
      this.typed += key;
      this.syncHiddenInput();
    }
  }
}

private syncHiddenInput() {
  const el = this.hiddenInput()?.nativeElement;
  if (!el) return;
  this.updatingInput = true;       // ⚡ on marque que c’est un update programmatique
  el.value = this.firstLetter + this.typed;
  this.updatingInput = false;      // ⚡ fin de l’update
}

  ngAfterViewInit() {
    this.focusInput();
  }

  focusInput() {
    setTimeout(() => {
      const nativeElemnt = this.hiddenInput()?.nativeElement;
      if (nativeElemnt) {
        nativeElemnt.value = this.firstLetter;
        nativeElemnt.focus();
      }
    });
  }

  submit() {
    const wordSignal = this.ws.wordOfDaySignal();

    if (!wordSignal) return;

    const wordList = this.ws.words(); // liste de mots valides
    const wordLength = wordSignal.word.length;

    if (this.fullGuess.length !== wordLength) {
      this.errorMessage.set(`Le mot "${this.fullGuess}" n'existe pas.`);
      return;
    }

    if (!this.typed || this.attempts().length >= this.maxGuesses || !wordSignal)
      return;

    // Vérifier si le mot est dans la liste
    if (!wordList.includes(this.fullGuess.toLowerCase())) {
      this.errorMessage.set(`Le mot "${this.fullGuess}" n'existe pas.`);
      return;
    }

    const { feedback, correct } = this.ws.checkGuess(
      this.fullGuess,
      wordSignal.word
    );

    const attempt: Attempt = {
      date: wordSignal.date,
      guess: this.fullGuess.toUpperCase(),
      result: correct ? 'correct' : 'incorrect',
      feedback,
    };

    const date = wordSignal.date;

    //  Mettre à jour le signal allAttempts
    this.allAttempts.update((current) => {
      const clone = { ...current }; // clone de l'objet existant
      if (!clone[date]) clone[date] = []; // initialise le tableau si nécessaire
      clone[date] = [...clone[date], attempt]; // ajout immuable du nouvel attempt
      return clone;
    });

    //  Sauvegarde dans le localStorage
    this.storage.saveAttempts(this.allAttempts());

    //  Mise à jour du streak si correct
    if (correct) {
      this.ss.updateStreak(true, date);
    }

    // Réinitialiser la saisie
    this.typed = '';
    this.errorMessage.set('');
    this.focusInput();
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

handleVirtualKey(key: string) {
  const wordSignal = this.ws.wordOfDaySignal();
  if (!wordSignal) return;
  const maxTyped = wordSignal.word.length - 1;

  if (key === 'Enter') {
    if (this.fullGuess.length === wordSignal.word.length) this.submit();
  } else if (key === 'Backspace') {
    if (this.typed.length > 0) this.typed = this.typed.slice(0, -1);
  } else if (/^[A-Z]$/.test(key)) {
    if (this.typed.length < maxTyped) {
      this.typed += key;
    }
  }

  // Mise à jour du hiddenInput pour rester cohérent
  this.syncHiddenInput();
}

onHiddenInput(event: Event) {
  if (this.updatingInput) return; // ⚡ ignore les changements programmatiques

  const el = event.target as HTMLInputElement;
  const raw = el.value.toUpperCase().replace(/[^A-Z]/g, '');
  const withoutFirst = raw.startsWith(this.firstLetter) ? raw.slice(1) : raw;
  const max = this.ws.wordOfDaySignal()!.word.length - 1;
  this.typed = withoutFirst.slice(0, max);

  this.syncHiddenInput();
}

  onBlurHiddenInput() {
    // On reprend le focus immédiatement
    this.focusHiddenInput();
  }

  focusHiddenInput() {
    setTimeout(() => this.hiddenInput()?.nativeElement.focus(), 10);
  }
}
