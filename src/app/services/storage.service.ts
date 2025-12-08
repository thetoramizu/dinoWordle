import { Injectable } from '@angular/core';


@Injectable()
export class StorageService {
private ATTEMPTS = 'tusmo_attempts_v1';
private STREAK = 'tusmo_streak_v1';


saveAttempts(data: any) { localStorage.setItem(this.ATTEMPTS, JSON.stringify(data)); }
loadAttempts() { const raw = localStorage.getItem(this.ATTEMPTS); return raw ? JSON.parse(raw) : {}; }


saveStreak(data: any) { localStorage.setItem(this.STREAK, JSON.stringify(data)); }
loadStreak() { const raw = localStorage.getItem(this.STREAK); return raw ? JSON.parse(raw) : null; }
}
