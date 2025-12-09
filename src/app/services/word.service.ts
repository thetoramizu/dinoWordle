import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WordOfDay } from '../models/word';
import { StorageService } from './storage.service';

@Injectable()
export class WordService {
  private readonly storageService = inject(StorageService)
  private epoch = new Date('2024-01-01T00:00:00Z');
  words = signal<string[]>([]);
  countSequenceSolvedToday = signal(0)

  dailySequence = computed<WordOfDay[]>(() => {
    const words = this.words(); // ✅ lecture du signal
    if (words.length === 0) return [];
    return this.words() ? this.getDailyWordSequence() : [];
  });

  public wordOfDaySignal = computed(() => {
    if (this.words().length === 0) return null;
    const idx = this.getIndexFromDate(new Date(), this.words().length);

    return {
      date: this.yyyyMmDd(new Date()),
      word: this.words()[idx].toUpperCase(),
    };
  });

  constructor(private http: HttpClient) {
    this.loadDailySequenceProgression()
    // this.loadDictionary();
  }

  // retourne la date au format YYYY-MM-DD
  private yyyyMmDd(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  private daysSinceEpoch(date = new Date()) {
    const diff = Math.floor(
      (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
        Date.UTC(
          this.epoch.getFullYear(),
          this.epoch.getMonth(),
          this.epoch.getDate()
        )) /
        (1000 * 60 * 60 * 24)
    );
    return diff;
  }

  /** Charge le dictionnaire depuis assets/dictionnaire.json */
  loadDictionary(): Promise<void> {
    // firstValueFrom remplace toPromise()
    return firstValueFrom(
      this.http.get<string[]>('assets/dictionnaire.json')
    ).then((data) => {
      this.words.set(data);
    });
  }

  // getWordOfDay(date = new Date()){
  // const idx = this.daysSinceEpoch(date) % words.length;
  // return { date: this.yyyyMmDd(date), word: words[idx].toUpperCase() };
  // }

  getWordOfDay(date = new Date()) {
    const idx = this.getIndexFromDate(date, this.words().length);

    return { date: this.yyyyMmDd(date), word: this.words()[idx].toUpperCase() };
  }

  // Génère un index pseudo-aléatoire déterministe à partir de la date
  private getIndexFromDate(date: Date, max: number) {
    // 1. Calcul du nombre de jours depuis l'epoch
    const days = this.daysSinceEpoch(date);

    // 2. Transformation simple pour “mélanger” un peu
    const seed = (days * 9302 + 49297) % 233280; // constants arbitraires

    // 3. Index final dans le dictionnaire
    return seed % max;
  }

  checkGuess(guess: string, solution: string) {
    guess = guess.toUpperCase();
    solution = solution.toUpperCase();
    const feedback: Array<'green' | 'yellow' | 'gray'> = new Array(
      guess.length
    ).fill('gray');
    const solArr = solution.split('');

    // première passe : greens
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === solArr[i]) {
        feedback[i] = 'green';
        solArr[i] = null as any;
      }
    }
    // deuxième passe : yellows
    for (let i = 0; i < guess.length; i++) {
      if (feedback[i] === 'gray') {
        const pos = solArr.indexOf(guess[i]);
        if (pos !== -1) {
          feedback[i] = 'yellow';
          solArr[pos] = null as any;
        }
      }
    }
    const correct = guess === solution;
    return { feedback, correct };
  }

  // fournit une séquence de mots sur N jours (dernier N jours incluant aujourd'hui)
  getSequence(days = 14, endDate = new Date()) {
    const out = [] as Array<{ date: string; word: string }>;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - i);
      out.push(this.getWordOfDay(d));
    }
    return out;
  }

  wordsOfLength(length: number): string[] {
    return this.words()
      .filter((word) => word.length === length)
      .map((w) => w.toUpperCase());
  }

  private getIndexForLength(date: Date, length: number, max: number) {
    const days = this.daysSinceEpoch(date);
    // Mélange léger en fonction du nombre de jours ET de la longueur du mot
    const seed = (days * (9300 + length) + 49297) % 233280;
    return seed % max;
  }

  /**
   * Récupère les 4 mots de la série du jour.
   * @param date
   * @returns
   */
  getDailyWordSequence(date = new Date()) {
    const lengths = [5, 6, 7, 8]; // les longueurs souhaitées
    const sequence: WordOfDay[] = [];

    for (const len of lengths) {
      const list = this.wordsOfLength(len);
      if (list.length === 0) continue;

      const idx = this.getIndexForLength(date, len, list.length);
      sequence.push({ date: this.yyyyMmDd(date), word: list[idx] });
    }

    return sequence;
  }

  loadDailySequenceProgression() {
    const date = new Date()
    const currentState = this.storageService.loadDailySequence()
    console.log( currentState[ this.yyyyMmDd(date)]);
    const number = currentState[ this.yyyyMmDd(date)] ? currentState[ this.yyyyMmDd(date)].solvedCount : 0
    console.log(number);
    this.countSequenceSolvedToday.set(number)
  }
}
