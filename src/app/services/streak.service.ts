import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';


@Injectable()
export class StreakService {
private data = { currentStreak:0, bestStreak:0, lastSuccessDate: null } as any;
constructor(private storage: StorageService){
const loaded = this.storage.loadStreak();
if (loaded) this.data = loaded;
}


getStreak(){ return this.data; }


updateStreak(success: boolean, dateStr: string){
if (!success) return this.storage.saveStreak(this.data);


// si succès le même jour déjà enregistré => rien
if (this.data.lastSuccessDate === dateStr) return this.storage.saveStreak(this.data);


const last = this.data.lastSuccessDate ? new Date(this.data.lastSuccessDate) : null;
const today = new Date(dateStr);


if (last){
const diff = Math.floor((Date.UTC(today.getFullYear(),today.getMonth(),today.getDate()) -
Date.UTC(last.getFullYear(), last.getMonth(), last.getDate())) / (1000*60*60*24));
if (diff === 1) { this.data.currentStreak += 1; }
else if (diff > 1) { this.data.currentStreak = 1; }
else { /* same day handled */ }
} else { this.data.currentStreak = 1; }


if (this.data.currentStreak > this.data.bestStreak) this.data.bestStreak = this.data.currentStreak;
this.data.lastSuccessDate = dateStr;
this.storage.saveStreak(this.data);
}
}
