import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { WordService } from './services/word.service';
import { StorageService } from './services/storage.service';
import { StreakService } from './services/streak.service';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }, provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient(), WordService, StorageService, StreakService]
};
