import { Component, HostListener, input, model, output } from "@angular/core";
import { Defaults } from "../../defaults/defaults";
import { Keyboard } from "../../enums/keyboard.enum";

@Component({
  selector: "app-keyboard",
  imports: [],
  templateUrl: "./keyboard.html",
  styleUrl: "./keyboard.scss",
})
export class KeyboardComponent {
  public gameOver = input.required<boolean>();
  public currentGuess = model.required<string>();
  public codeLength = input.required<number>();

  public keys = Defaults.KeyboardKeys;

  public submitGuessChange = output<void>();

  @HostListener("window:keydown", ["$event"])
  public handleKeyDown(event: KeyboardEvent): void {
    if (this.gameOver()) return;

    if (event.key === "Enter") {
      this.handleInput(Keyboard.Enter);
    } else if (event.key === "Backspace") {
      this.handleInput(Keyboard.Delete);
    } else if (/^\d$/.test(event.key)) {
      this.handleInput(event.key);
    }
  }

  public handleInput(key: string): void {
    if (this.gameOver()) return;

    if (key === Keyboard.Enter) {
      this.submitGuessChange.emit();
    } else if (key === Keyboard.Delete) {
      this.currentGuess.update((prev) => prev.slice(0, -1));
    } else if (this.currentGuess().length < this.codeLength()) {
      this.currentGuess.update((prev) => prev + key);
    }
  }
}
