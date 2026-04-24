import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

export type Status = 'correct' | 'present' | 'absent' | 'empty';

export interface RowStats {
  correctPos: number; // "Byki" - właściwa cyfra na właściwym miejscu
  wrongPos: number;   // "Krowy" - właściwa cyfra, ale w złym miejscu
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  readonly CODE_LENGTH = 4;
  readonly MAX_ATTEMPTS = 7;

  // Układ: 1-5 (rząd 1), 6-0 (rząd 2), ENTER i ⌫ (rząd 3)
  readonly KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ENTER', '⌫'];

  targetCode = signal<string>('');
  attempts = signal<string[]>([]);
  currentGuess = signal<string>('');
  gameOver = signal<boolean>(false);
  message = signal<string>('Zgadnij 4 cyfry!');

  constructor() {
    this.generateNewCode();
  }

  generateNewCode() {
    const uniqueDigits = new Set<string>();

    // Losuj, dopóki Set nie będzie miał 4 unikalnych elementów
    while (uniqueDigits.size < this.CODE_LENGTH) {
      const randomDigit = Math.floor(Math.random() * 10).toString();
      uniqueDigits.add(randomDigit);
    }

    // Zamień Set na stringa (np. "1234")
    const code = Array.from(uniqueDigits).join('');

    this.targetCode.set(code);
    this.attempts.set([]);
    this.currentGuess.set('');
    this.gameOver.set(false);
    this.message.set('Zgadnij 4 unikalne cyfry!');
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.gameOver()) return;

    if (event.key === 'Enter') {
      this.handleInput('ENTER');
    } else if (event.key === 'Backspace') {
      this.handleInput('⌫');
    } else if (/^\d$/.test(event.key)) {
      this.handleInput(event.key);
    }
  }

  handleInput(key: string) {
    if (this.gameOver()) return;

    if (key === 'ENTER') {
      this.submitGuess();
    } else if (key === '⌫') {
      this.currentGuess.update((prev) => prev.slice(0, -1));
    } else if (this.currentGuess().length < this.CODE_LENGTH) {
      this.currentGuess.update((prev) => prev + key);
    }
  }

  submitGuess() {
    const guess = this.currentGuess();
    if (guess.length !== this.CODE_LENGTH) return;

    const newAttempts = [...this.attempts(), guess];
    this.attempts.set(newAttempts);
    this.currentGuess.set('');

    if (guess === this.targetCode()) {
      this.gameOver.set(true);
      this.message.set('Gratulacje! Wygrałeś! 🎉');
    } else if (newAttempts.length >= this.MAX_ATTEMPTS) {
      this.gameOver.set(true);
      this.message.set(`Koniec gry! Kod to: ${this.targetCode()}`);
    }
  }

  getCellStatus(attemptIndex: number, charIndex: number): Status {
    const guess = this.attempts()[attemptIndex];
    if (!guess) return 'empty';
    const char = guess[charIndex];
    const target = this.targetCode();

    if (char === target[charIndex]) return 'correct';

    const targetChars = target.split('');
    const guessChars = guess.split('');
    for (let i = 0; i < targetChars.length; i++) {
      if (guessChars[i] === targetChars[i]) {
        targetChars[i] = '_';
        guessChars[i] = '*';
      }
    }
    return targetChars.includes(char) ? 'present' : 'absent';
  }

  getStats(guess: string): RowStats {
    const target = this.targetCode();
    let correctPos = 0;
    let wrongPos = 0;

    const targetArr = target.split('');
    const guessArr = guess.split('');

    // 1. Liczymy trafienia na pozycjach (Bulls)
    for (let i = 0; i < this.CODE_LENGTH; i++) {
      if (guessArr[i] === targetArr[i]) {
        correctPos++;
        targetArr[i] = 'T_USED'; // Oznaczamy jako zużyte
        guessArr[i] = 'G_USED';
      }
    }

    // 2. Liczymy trafienia cyfr w złych miejscach (Cows)
    for (let i = 0; i < this.CODE_LENGTH; i++) {
      if (guessArr[i] !== 'G_USED') {
        const foundIndex = targetArr.indexOf(guessArr[i]);
        if (foundIndex !== -1) {
          wrongPos++;
          targetArr[foundIndex] = 'T_USED';
        }
      }
    }

    return { correctPos, wrongPos };
  }
}
