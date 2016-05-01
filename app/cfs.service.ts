import {Injectable} from 'angular2/core';
import {Http, Response} from 'angular2/http';
import {Observable}     from 'rxjs/Observable';

@Injectable()
export class CfsService {
  private ciceroUrl = "https://cfs-ws-itera.cicero.no/cfp/6/ws/rest/calculator/calculateLoan";
  private serviceUrl = this.ciceroUrl;
  private mockUrl = "../calculateLoan.json";

  constructor(private http: Http){}

  useRealService( useReal:boolean ){
    if(useReal){
      this.serviceUrl = this.ciceroUrl;
    } else {
      this.serviceUrl = this.mockUrl;
    }
    console.log(this.serviceUrl);
  }

  calcCfsLoan(amount:number, years: number, rate:number): Observable<any> {
    var currentTime = new Date();
    var curMonth = currentTime.getMonth() + 1;
    var curYear = currentTime.getFullYear();
    var numberOfPayments = years*12;
    return this.http.get(this.serviceUrl+"?"+
                          "loanRaisingMonth="+ curMonth +
                          "&loanRaisingYear="+ curYear +
                          "&principalAmount="+ amount +
                          "&annualNominalInterestRate=" + rate +
                          "&totalNumberOfPayments=" + numberOfPayments
                        )
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  private extractData(res: Response) {
      if (res.status < 200 || res.status >= 300) {
        throw new Error('Bad response status: ' + res.status);
      }
      let body = res.json();
      return body || { };
  }

  private handleError (error: any) {
      // In a real world app, we might send the error to remote logging infrastructure
      let errMsg = error.message || 'Server error';
      console.error(errMsg); // log to console instead
      return Observable.throw(errMsg);
  }

}
