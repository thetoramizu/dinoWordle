import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { StorageService } from '../services/storage.service';
import { StreakService } from '../services/streak.service';
import { WordService } from '../services/word.service';
import { FormsModule } from '@angular/forms';
import { Attempt } from '../models/attempt';
import { ClavierVirtuelComponent } from '../clavier-virtuel/clavier-virtuel.component';
import { WordOfDay } from '../models/word';

@Component({
  selector: 'app-word-game',
  imports: [FormsModule, ClavierVirtuelComponent],
  templateUrl: './word-game.component.html',
  styleUrl: './word-game.component.scss',
})
export class WordGameComponent implements AfterViewInit {
  wordToFind = input.required<WordOfDay>();
  type = input.required<string>();
  maxGuesses = 22;

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
  // allAttempts = signal<any>(this.storage.loadDailySequence());
  allAttemptsSequence = signal<any>(this.storage.loadDailySequence());

  dailyAttempts = computed(() => {
    if (this.type() === 'sequence') {
      return (
        this.allAttemptsSequence()[this.wordToFind()!.date]?.attempts[
          this.ws.countSequenceSolvedToday()
        ] || []
      );
    } else {
      return this.allAttempts()[this.wordToFind()!.date] || [];
    }
  });

  /**
   * Récupère les tentatives du jour.
   */
  // attempts = computed(() => {
  //   if (this.type() === 'sequence') {
  //     console.log(this.allAttemptsSequence());
  //     console.log(this.allAttemptsSequence()[this.wordToFind()!.date]?.attempts[this.ws.countSequenceSolvedToday()]);
  //     const allattempstforcurrentindex = this.allAttemptsSequence()[this.wordToFind()!.date]?.attempts[this.ws.countSequenceSolvedToday()]

  //     return allattempstforcurrentindex || [];
  //   } else {
  //     return this.allAttempts()[this.wordToFind()!.date] || [];
  //   }
  // });

  canAttempt = computed(
    () => this.dailyAttempts().length < this.maxGuesses && !this.isLastCorrect()
  );

  sequenceProgress = signal<{
    [date: string]: {
      solvedCount: number;
      attempts: Record<number, Attempt[]>;
    };
  }>({});

  get fullGuess() {
    return (this.firstLetter + this.typed).toUpperCase();
  }

  constructor() {
    effect(() => {
      this.allAttempts();
      this.allAttemptsSequence();
      console.log('all attempts : ', this.allAttempts());

      this.updateKeyboardStates();
    });
    effect(() => {
      const w = this.wordToFind();
      console.log('k:jsdghkduhsf', this.wordToFind());

      if (w) {
        this.firstLetter = w.word[0].toUpperCase();
      }
    });
  }

  // Gestion clavier physique
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key.toUpperCase();
    const wordLength = this.wordToFind()?.word.length || 0;
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
    this.updatingInput = true; // ⚡ on marque que c’est un update programmatique
    el.value = this.firstLetter + this.typed;
    this.updatingInput = false; // ⚡ fin de l’update
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
    const wordSignal = this.wordToFind();
    const date = wordSignal.date

    if (!wordSignal) return;

    const wordList = this.ws.words(); // liste de mots valides
    const wordLength = wordSignal.word.length;

    if (this.fullGuess.length !== wordLength) {
      this.errorMessage.set(`Le mot "${this.fullGuess}" n'existe pas.`);
      return;
    }

    if (
      !this.typed ||
      this.dailyAttempts().length >= this.maxGuesses ||
      !wordSignal
    )
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

    if (this.type() === 'sequence') {
      this.saveSequence();
    } else if (this.type() === 'daily') {
      this.saveDaily();
    }

    //  Mise à jour du streak si correct
    if (correct) {
      this.ss.updateStreak(true, date);
    }

    // Réinitialiser la saisie
    this.typed = '';
    this.errorMessage.set('');
    this.focusInput();
    console.log(this.isLastCorrect());

    if (this.type() === 'sequence' && this.isLastCorrect()) {
      const count = this.ws.countSequenceSolvedToday();
      if (count >= 3) {
        return;
      }
      this.ws.countSequenceSolvedToday.set(count + 1);
    }
  }

  saveDaily() {
    const word = this.wordToFind();

    const { feedback, correct } = this.ws.checkGuess(this.fullGuess, word.word);

    const attempt: Attempt = {
      date: word.date,
      guess: this.fullGuess.toUpperCase(),
      result: correct ? 'correct' : 'incorrect',
      feedback,
    };

    const date = word.date;

    //  Mettre à jour le signal allAttempts
    this.allAttempts.update((current) => {
      const clone = { ...current }; // clone de l'objet existant
      if (!clone[date]) clone[date] = []; // initialise le tableau si nécessaire
      clone[date] = [...clone[date], attempt]; // ajout immuable du nouvel attempt
      return clone;
    });

    //  Sauvegarde dans le localStorage
    this.storage.saveAttempts(this.allAttempts());
  }

  saveSequence() {
    const word = this.wordToFind();
    const loaded = this.allAttemptsSequence();

    const { feedback, correct } = this.ws.checkGuess(this.fullGuess, word.word);

    const attempt: Attempt = {
      date: word.date,
      guess: this.fullGuess.toUpperCase(),
      result: correct ? 'correct' : 'incorrect',
      feedback,
    };

    const date = word.date;
    this.sequenceProgress.set(loaded);
    if (!loaded[date]) {
      this.sequenceProgress.update((s) => ({
        ...s,
        [date]: { solvedCount: 0, attempts: { 0: [], 1: [], 2: [], 3: [] } },
      }));
    }

    const index = this.sequenceProgress()[date].solvedCount; // mot en cours: 0..3

    // Mise à jour immuable du signal
    this.sequenceProgress.update((current) => {
      const clone = structuredClone(current);
      clone[date].attempts[index].push(attempt);
      if (correct) {
        clone[date].solvedCount++;
      }
      return clone;
    });

    console.log('sdufh sduf u sgfsduyl ', this.sequenceProgress());

    // Sauvegarde dans localStorage
    this.storage.saveDailySequence(this.sequenceProgress());
    this.allAttemptsSequence.set(this.sequenceProgress());
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
    const attemptsToday = this.dailyAttempts();
    if (!attemptsToday.length) return false;
    return attemptsToday[attemptsToday.length - 1].result === 'correct';
  }

  // Calcul automatique des états des lettres à partir des essais
  updateKeyboardStates() {
    const states: Record<string, 'green' | 'yellow' | 'gray'> = {};
    for (const attempt of this.dailyAttempts()) {
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
    const wordSignal = this.wordToFind();
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
    const max = this.wordToFind()!.word.length - 1;
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

getMaskLetters(): string[] {
  const letters = this.wordToFind()?.word.split('') || [];
  const mask = Array(letters.length).fill('');

  for (const attempt of this.dailyAttempts()) {
    attempt.feedback.forEach((f: string, i: number) => {
      if (f === 'green') {
        mask[i] = attempt.guess[i].toUpperCase();
      }
    });
  }

  return mask;
}
}
