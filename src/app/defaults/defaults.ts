import { Keyboard } from "../enums/keyboard.enum";

export namespace Defaults {
  export const KeyboardKeys: Keyboard[] = [
    Keyboard.One,
    Keyboard.Two,
    Keyboard.Three,
    Keyboard.Four,
    Keyboard.Five,
    Keyboard.Six,
    Keyboard.Seven,
    Keyboard.Eight,
    Keyboard.Nine,
    Keyboard.Zero,
    Keyboard.Enter,
    Keyboard.Delete,
  ];

  export const GamePlayedKey: string = "game-played";
  export const GameWonKey: string = "game-win";
  export const GameLostKey: string = "game-lost";
}
