import { Component, inject } from "@angular/core";
import { Defaults } from "../../defaults/defaults";
import { DialogRef } from "@angular/cdk/dialog";

@Component({
  selector: "app-statistics",
  imports: [],
  templateUrl: "./statistics.html",
  styleUrl: "./statistics.scss",
})
export class Statistics {
  public dialogRef = inject<DialogRef<void>>(DialogRef);

  public gameWon: string | null | number = 0;
  public gameLost: string | null | number = 0;
  public gamePlayed: string | null | number = 0;

  public constructor() {
    this.gamePlayed = localStorage.getItem(Defaults.GamePlayedKey) ?? 0;
    this.gameWon = localStorage.getItem(Defaults.GameWonKey) ?? 0;
    this.gameLost = localStorage.getItem(Defaults.GameLostKey) ?? 0;
  }

  public close(): void {
    this.dialogRef.close();
  }
}
