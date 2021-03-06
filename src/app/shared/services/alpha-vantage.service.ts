import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlphaVantageService {
  [x: string]: any;

  constructor(private http: HttpClient) { }

  rootUrl = 'https://www.alphavantage.co/query';

  getInstruments(symbol: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.rootUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${environment.alphaVantageApiKey}`);
  }

  getCompanies(companyName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.rootUrl}?function=SYMBOL_SEARCH&keywords=${companyName}&apikey=${environment.alphaVantageApiKey}`);
  }

  getIntradayPrices(symbol: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.rootUrl}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${environment.alphaVantageApiKey}`);
  }
}
