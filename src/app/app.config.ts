import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { WordService } from './services/word.service';
import { StorageService } from './services/storage.service';
import { StreakService } from './services/streak.service';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), WordService, StorageService, StreakService]
};
