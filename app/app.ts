import {Component, OnInit} from 'angular2/core';
import { HTTP_PROVIDERS }    from 'angular2/http';
import {CfsService} from "./cfs.service";


@Component({
    selector: 'my-app',
    templateUrl: 'app/app.html',
    styleUrls: ['app/app.css'],
    providers: [
      HTTP_PROVIDERS,
      CfsService
    ]
})
export class App implements OnInit{
  amount: number = 2500000;
  years: number = 30;
  percentage: number = 3.5;
  payment: number = 2000;
  loanData: any;
  errorMessage: string;

  constructor(private cfsService: CfsService){
  }

  ngOnInit(){
    this.cfsService.calcCfsLoan().subscribe(
      data => {
        console.log('data', data);
        this.loanData = data;
        this.payment = this.loanData.amortizationSchedule[0].payment;
      },
      error => this.errorMessage
    );
  }

}
