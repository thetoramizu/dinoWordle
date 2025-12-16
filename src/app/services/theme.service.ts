import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  isDarkMode = signal<boolean>(true);

  constructor() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme === 'dark') {
      this.isDarkMode.set(true);
    }
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode.update(current => !current);
    this.saveTheme();
    this.applyTheme();
  }

  private saveTheme(): void {
    localStorage.setItem(this.THEME_KEY, this.isDarkMode() ? 'dark' : 'light');
  }

  private applyTheme(): void {
    const body = document.body;
    if (this.isDarkMode()) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }
}
