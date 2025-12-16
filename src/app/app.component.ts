import { Component, ElementRef, inject, viewChild, signal, AfterViewInit } from '@angular/core';
import { AchievementsComponent } from './achievements/achievements.component';
import { RouterOutlet } from '@angular/router';
import { WordService } from './services/word.service';
import { WordGameComponent } from './word-game/word-game.component';
import { DailySequenceComponent } from './daily-sequence/daily-sequence.component';
import { InfiniteModeComponent } from './infinite-mode/infinite-mode.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    AchievementsComponent,
    RouterOutlet,
    DailySequenceComponent,
    WordGameComponent,
    InfiniteModeComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  title = 'Sumot';
  activeTab: 'daily' | 'sequence' | 'infinite' = 'daily';
  tabs = [
    { key: 'daily', label: 'Daily' },
    { key: 'sequence', label: 'Suite' },
    { key: 'infinite', label: 'Infini' },
  ];

  protected readonly ws = inject(WordService);
  protected readonly themeService = inject(ThemeService);
  tabsContainer = viewChild<ElementRef<HTMLElement>>('tabsContainer');

  underlineLeft = signal(0);
  underlineWidth = signal(0);

  ngOnInit() {
    this.ws.loadDictionary();
  }

  ngAfterViewInit() {
    // Initialiser la position de l'underline après que la vue soit prête
    setTimeout(() => this.updateUnderline(), 0);
  }

  activateTab(tabKey: any) {
    this.activeTab = tabKey;
    this.updateUnderline();
    this.ws.infiniteModeWord() ? '': this.ws.getRandomWord()
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  updateUnderline() {
    if (!this.tabsContainer) return;

    const index = this.tabs.findIndex((t) => t.key === this.activeTab);
    if (index === -1) return;

    const buttons =
      this.tabsContainer()?.nativeElement.querySelectorAll('.tab-btn');
    if (!buttons || buttons.length === 0) return;

    const el = buttons[index] as HTMLElement;

    this.underlineLeft.set(el.offsetLeft);
    this.underlineWidth.set(el.offsetWidth);
  }
}
