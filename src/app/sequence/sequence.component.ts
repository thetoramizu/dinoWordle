import { Component, inject, OnInit } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { WordService } from '../services/word.service';

@Component({
  selector: 'app-sequence',
  imports: [],
  templateUrl: './sequence.component.html',
  styleUrl: './sequence.component.scss',
})
export class SequenceComponent implements OnInit {
  seq: Array<any> = [];
  attempts: any = {};

  private readonly ws = inject(WordService);
  private readonly storage = inject(StorageService);

  ngOnInit() {
    this.seq = this.ws.getSequence(14);
    this.attempts = this.storage.loadAttempts();
  }

  isFound(date: string): boolean {
    const list = this.attempts?.[date] ?? [];
    return list.some((a: any) => a.result === 'correct');
  }
}
