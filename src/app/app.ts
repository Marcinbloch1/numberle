import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { KeyboardComponent } from "./components/keyboard/keyboard";
import { ModalsService } from "./modals/modals.service";
import { Defaults } from "./defaults/defaults";

export type Status = "correct" | "present" | "absent" | "empty";

export interface RowStats {
  correctPos: number;
  wrongPos: number;
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, KeyboardComponent],
  providers: [ModalsService],
  templateUrl: "./app.html",
  styleUrls: ["./app.scss"],
})
export class App {
  public readonly CODE_LENGTH = 4;
  public readonly MAX_ATTEMPTS = 7;

  public readonly modalsService = inject(ModalsService);

  public targetCode = signal<string>("");
  public attempts = signal<string[]>([]);
  public currentGuess = signal<string>("");
  public gameOver = signal<boolean>(false);
  public message = signal<string>("Zgadnij 4 cyfry!");

  public constructor() {
    this.generateNewCode();
  }

  public openStatistics(): void {
    this.modalsService.openStatisticsModal();
  }

  public generateNewCode(): void {
    const uniqueDigits = new Set<string>();

    while (uniqueDigits.size < this.CODE_LENGTH) {
      const randomDigit = Math.floor(Math.random() * 10).toString();
      uniqueDigits.add(randomDigit);
    }

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
      this._updateGameStats(true);
    } else if (newAttempts.length >= this.MAX_ATTEMPTS) {
      this.gameOver.set(true);
      this.message.set(`Koniec gry! Kod to: ${this.targetCode()}`);
      this._updateGameStats(false);
    }
  }

  public getCellFinalStatus(attemptIdx: number, charIdx: number): string {
    if (!this.gameOver()) return "";

    const guess = this.attempts()[attemptIdx];
    if (!guess) return "";

    const target = this.targetCode();
    const char = guess[charIdx];

    if (char === target[charIdx]) return "correct";
    let targetOccurrences = 0;
    for (let i = 0; i < target.length; i++) {
      if (target[i] === char && guess[i] !== target[i]) {
        targetOccurrences++;
      }
    }

    let guessOccurrencesBefore = 0;
    for (let i = 0; i < charIdx; i++) {
      if (guess[i] === char && guess[i] !== target[i]) {
        guessOccurrencesBefore++;
      }
    }

    if (targetOccurrences > guessOccurrencesBefore) {
      return "present";
    }

    return "absent";
  }

  private _updateGameStats(isGameWon: boolean): void {
    if (isGameWon) {
      let gamesWon = Number(localStorage.getItem(Defaults.GameWonKey)) ?? 0;
      gamesWon++;
      localStorage.setItem(Defaults.GameWonKey, JSON.stringify(gamesWon));
    } else {
      let gamesLost = Number(localStorage.getItem(Defaults.GameLostKey)) ?? 0;
      gamesLost++;
      localStorage.setItem(Defaults.GameLostKey, JSON.stringify(gamesLost));
    }

    let gamesPlayed = Number(localStorage.getItem(Defaults.GamePlayedKey)) ?? 0;
    gamesPlayed++;
    localStorage.setItem(Defaults.GamePlayedKey, JSON.stringify(gamesPlayed));
  }
}
