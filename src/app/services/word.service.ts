import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WordService {
  private epoch = new Date('2024-01-01T00:00:00Z');
  words = signal<string[]>([]);

  public wordOfDaySignal = computed(() => {
    if (this.words().length === 0) return null;
    const idx = this.getIndexFromDate(new Date(), this.words().length);
    return {
      date: this.yyyyMmDd(new Date()),
      word: this.words()[idx].toUpperCase(),
    };
  });

  constructor(private http: HttpClient) {
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
    const seed = (days * 9301 + 49297) % 233280; // constants arbitraires

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
}
