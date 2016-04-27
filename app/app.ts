import {Component} from 'angular2/core';
import {CfsService} from "./cfs.service";


@Component({
    selector: 'my-app',
    templateUrl: 'app/app.html',
    styleUrls: ['app/app.css'],
    providers: [CfsService]
})
export class App {
  amount: number = 2500000;
  years: number = 30;
  percentage: number = 3.5;
  payment: number = 2000;

  constructor(private cfsService: CfsService){
    console.log(cfsService.calcCfsLoan());
  }

}
