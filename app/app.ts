import {Component, OnInit, Directive, ElementRef, Input, Renderer} from 'angular2/core';
import {FormBuilder, ControlGroup, Validators, Control} from 'angular2/common';
import { HTTP_PROVIDERS }    from 'angular2/http';
import { CHART_DIRECTIVES } from 'angular2-highcharts';
import {CfsService} from "./cfs.service";

@Directive({
  selector: 'input,select',
  host: {'(blur)': 'onBlur($event)'}
})
class BlurForwarder {
  constructor(private elRef:ElementRef, private renderer:Renderer) {}

  onBlur($event) {
    this.renderer.invokeElementMethod(this.elRef.nativeElement,
        'dispatchEvent',
        [new CustomEvent('input-blur', { bubbles: true })]);
    // or just
    // el.dispatchEvent(new CustomEvent('input-blur', { bubbles: true }));
    // if you don't care about webworker compatibility
  }
}

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.html',
    styleUrls: ['app/app.css'],
    directives: [BlurForwarder, CHART_DIRECTIVES],
    host: {'(input-blur)':'onBlur($event)'},
    providers: [
      HTTP_PROVIDERS,
      CfsService
    ]
})
export class App implements OnInit{
  form: ControlGroup;
  chartOptions: any;

  useRealService: boolean = false;

  amount: number = 2500000;
  years: number = 30;
  rate: number = 3.5;
  payment: number = 2000;

  loanData: any;
  errorMessage: string;
  timeout: any;

  constructor(private cfsService: CfsService, private fb: FormBuilder){
  }

  changeService(event:any){
    this.useRealService=event.target.checked;
    this.calcLoan();
  }

  static validateAmount(c: Control) {
    let numValue = parseInt(c.value);
    return ( numValue>=10000 && numValue<=100000000) ? null : {
      validateAmount: {
        valid: false
      }
    }
  }

  static validateYears(c: Control){
    let numValue = parseInt(c.value);
    return ( numValue >=1 && numValue<=40 ) ? null : {
      validateYears: {
        valid: false
      }
    }
  }

  static validateRate(c: Control){
    let rateValue = parseFloat(c.value);
    return ( rateValue>=0 && rateValue<=20 ) ? null : {
      validateRate: {
        valid: false
      }
    }
  }

  ngOnInit(){
    this.form = this.fb.group({
      'amount':['', Validators.compose([Validators.required, App.validateAmount]) ],
      'years':['', Validators.compose([Validators.required, App.validateYears]) ],
      'rate':['', Validators.compose([Validators.required, App.validateRate]) ]
    });

    this.calcLoan();
    this.formatViewValues();
  }

  onKey(event:any){
    clearTimeout(this.timeout);
    console.log(event);
    this.timeout = setTimeout(() => {
      if( this.form.valid ){
        this.parseValues();
        this.calcLoan();
      }
    }, 500);
  }

  onFocusAmount(event:any){
    (<Control>this.form.controls['amount']).updateValue( this.amount );
  }

  onFocusYears(event:any){
    (<Control>this.form.controls['years']).updateValue( this.years );
  }

  onFocusRate(event:any){
    (<Control>this.form.controls['rate']).updateValue( this.rate );
  }

  onBlur(event:any){
    this.parseValues();
    this.formatViewValues();
  }

  calcLoan(){
    this.cfsService.useRealService(this.useRealService);
    this.errorMessage = undefined;
    this.cfsService.calcCfsLoan(this.amount, this.years, this.rate).subscribe(
      data => {
        this.loanData = data;
        this.payment = this.loanData.amortizationSchedule[0].payment;
        this.buildChart(this.loanData.sumInterest, this.loanData.sumTaxDeductions, this.loanData.sumPayments, this.loanData.sumFees);
      },
      error => {
        this.errorMessage = error;
        console.log('error', error);
      }
    );
  }

  buildChart(interestPayment:number, taxDeduction: number, payment:number, fees:number){
    this.chartOptions = {
      title: { text: "" },
      chart: {
        type: 'pie',
        backgroundColor:'transparent',
        style: {
           color: "white",
           textShadow: false
        }
      },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
          pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                  enabled: true,
                  format: '<b>{point.name}</b>: {point.y:,.0f} ({point.percentage:.1f} %)',
                  style: {
                      color: '(Highcharts.theme && Highcharts.theme.contrastTextColor)' || 'white',
                      textShadow: false
                  }
              }
          }
      },
      credits: {
          enabled: false
      },
      series: [{
        name: 'Payment',
        data: [
          {name: "interest", y:interestPayment},
          {name: "tax deduction", y:taxDeduction},
          {name: "payments", y:payment,  sliced: true, selected: true},
          {name: "fees", y:fees}
        ]
      }]
    };
  }

  formatViewValues(){
    (<Control>this.form.controls['amount']).updateValue(this.amount + " kr");
    (<Control>this.form.controls['years']).updateValue(this.years + " kr");
    (<Control>this.form.controls['rate']).updateValue(this.rate + " %");
  }

  parseValues(){
    this.amount = parseInt(this.form.controls['amount'].value);
    this.years = parseInt(this.form.controls['years'].value);
    this.rate = parseFloat(this.form.controls['rate'].value);
  }

}
