import { Component, HostListener, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { KeyboardComponent } from "./components/keyboard/keyboard";

export type Status = "correct" | "present" | "absent" | "empty";

export interface RowStats {
  correctPos: number;
  wrongPos: number;
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, KeyboardComponent],
  templateUrl: "./app.html",
  styleUrls: ["./app.scss"],
})
export class App {
  public readonly CODE_LENGTH = 4;
  public readonly MAX_ATTEMPTS = 7;

  public targetCode = signal<string>("");
  public attempts = signal<string[]>([]);
  public currentGuess = signal<string>("");
  public gameOver = signal<boolean>(false);
  public message = signal<string>("Zgadnij 4 cyfry!");

  public constructor() {
    this.generateNewCode();
  }

  public generateNewCode(): void {
    const uniqueDigits = new Set<string>();

    // Losuj, dopóki Set nie będzie miał 4 unikalnych elementów
    while (uniqueDigits.size < this.CODE_LENGTH) {
      const randomDigit = Math.floor(Math.random() * 10).toString();
      uniqueDigits.add(randomDigit);
    }

    // Zamień Set na stringa (np. "1234")
    const code = Array.from(uniqueDigits).join("");

    this.targetCode.set(code);
    this.attempts.set([]);
    this.currentGuess.set("");
    this.gameOver.set(false);
    this.message.set("Zgadnij 4 unikalne cyfry!");
  }

  public getStats(guess: string): RowStats {
    const target = this.targetCode();
    let correctPos = 0;
    let wrongPos = 0;

    const targetArr = target.split("");
    const guessArr = guess.split("");

    for (let i = 0; i < this.CODE_LENGTH; i++) {
      if (guessArr[i] === targetArr[i]) {
        correctPos++;
        targetArr[i] = "T_USED"; // Oznaczamy jako zużyte
        guessArr[i] = "G_USED";
      }
    }

    for (let i = 0; i < this.CODE_LENGTH; i++) {
      if (guessArr[i] !== "G_USED") {
        const foundIndex = targetArr.indexOf(guessArr[i]);
        if (foundIndex !== -1) {
          wrongPos++;
          targetArr[foundIndex] = "T_USED";
        }
      }
    }

    return { correctPos, wrongPos };
  }

  public submitGuess(): void {
    const guess = this.currentGuess();
    if (guess.length !== this.CODE_LENGTH) return;

    const newAttempts = [...this.attempts(), guess];
    this.attempts.set(newAttempts);
    this.currentGuess.set("");

    if (guess === this.targetCode()) {
      this.gameOver.set(true);
      this.message.set("Gratulacje! Wygrałeś! 🎉");
    } else if (newAttempts.length >= this.MAX_ATTEMPTS) {
      this.gameOver.set(true);
      this.message.set(`Koniec gry! Kod to: ${this.targetCode()}`);
    }
  }

  private _getCellStatus(attemptIndex: number, charIndex: number): Status {
    const guess = this.attempts()[attemptIndex];
    if (!guess) return "empty";
    const char = guess[charIndex];
    const target = this.targetCode();

    if (char === target[charIndex]) return "correct";

    const targetChars = target.split("");
    const guessChars = guess.split("");
    for (let i = 0; i < targetChars.length; i++) {
      if (guessChars[i] === targetChars[i]) {
        targetChars[i] = "_";
        guessChars[i] = "*";
      }
    }
    return targetChars.includes(char) ? "present" : "absent";
  }
}
