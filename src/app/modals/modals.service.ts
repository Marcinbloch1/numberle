import { inject, Injectable } from "@angular/core";
import { Dialog } from "@angular/cdk/dialog";
import { Statistics } from "../components/statistics/statistics";

@Injectable()
export class ModalsService {
  public dialog = inject(Dialog);

  public openStatisticsModal(): void {
    this.dialog.open(Statistics, {
      minWidth: "300px",
    });
  }
}
