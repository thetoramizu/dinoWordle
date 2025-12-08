import { Component, input, model, output, signal } from '@angular/core';

@Component({
  selector: 'app-clavier-virtuel',
  imports: [],
  templateUrl: './clavier-virtuel.component.html',
  styleUrl: './clavier-virtuel.component.scss'
})
export class ClavierVirtuelComponent {

/** Signal contenant l'état des lettres : green, yellow, gray */
  letterStates = model<Record<string, 'green' | 'yellow' | 'gray'>>({});

  /** Signal pour activer/désactiver le clavier */
  disabled = input(false);

  /** Emission des touches pressées */
  keyPress = output<string>();

  /** Layout AZERTY */
  rows = [
    ['A','Z','E','R','T','Y','U','I','O','P'],
    ['Q','S','D','F','G','H','J','K','L','M'],
    ['⌫','W','X','C','V','B','N','⏎']
  ];

  /** Clique sur une touche */
  onKey(key: string) {
    if (this.disabled()) return;
    this.keyPress.emit(key);
  }

  /** Classe CSS pour chaque touche */
  getKeyColor(key: string) {
    return this.letterStates()[key] || '';
  }
}
