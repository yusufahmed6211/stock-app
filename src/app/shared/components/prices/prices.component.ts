import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Highcharts from 'highcharts';
import * as _ from 'lodash';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { IntradayPrice } from '../../models/intraday-price';
import { StockPrice } from '../../models/stock-price';
import { AlphaVantageService } from '../../services/alpha-vantage.service';

@Component({
  selector: 'app-prices',
  templateUrl: './prices.component.html',
  styleUrls: ['./prices.component.scss']
})
export class PricesComponent implements OnInit {

  loading = true;
  symbol: string;
  stockPrices: StockPrice[];
  intradayStockPrices: IntradayPrice[];

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options;
  days = 30;

  constructor(private route: ActivatedRoute, private alphaVantageSvc: AlphaVantageService) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.symbol = params.get('symbol');
      this.getPrices(this.symbol);
    });

  }

  getPrices(symbol: string): void {
    this.stockPrices = null;
    this.intradayStockPrices = null;

    const getInstruments = this.alphaVantageSvc.getInstruments(symbol);
    const getIntradayPrices = this.alphaVantageSvc.getIntradayPrices(symbol);

    forkJoin([getInstruments, getIntradayPrices])
      .pipe(
        map(res => {
          this.stockPrices = _.orderBy(this.mapStockPrices(res[0]), 'date', 'desc');
          this.intradayStockPrices = this.mapIntradayPrices(res[1]);
          this.buildChart(this.days);
          this.loading = false;
        })
      )
      .subscribe(() => {
        this.loading = false;
      },
        error => {
        }
      );
  }

  onClickTimeframe(days: number) {
    this.days = days;
    this.buildChart(days);
  }

  buildChart(days: number): void {

    const latestStockPrices = _.orderBy(_.take(this.stockPrices, days), 'date', 'asc');

    const volume = latestStockPrices.map(s => s.volume);
    const dates = latestStockPrices.map(s => moment(s.date).format('DD-MMM-YYYY'));
    const prices = latestStockPrices.map(s => s.close);

    this.chartOptions = {
      chart: {
        zoomType: 'xy',
        backgroundColor: 'transparent'
      },
      title: {
        text: ''
      },
      xAxis: [{
        categories: dates,
        crosshair: true
      }],
      yAxis: [{
        labels: {
          format: '${value}'
        },
        title: {
          text: 'Price'
        }
      },
      {
        title: {
          text: 'Volume'
        },
        labels: {
          format: '{value}'
        },
        opposite: true
      }],
      tooltip: {
        shared: true
      },
      credits: {
        enabled: false
      },
      series: [{
        name: 'Volume',
        type: 'column',
        yAxis: 1,
        data: volume
      },
      {
        name: 'Price',
        type: 'spline',
        data: prices,
        tooltip: {
          valuePrefix: '$'
        }
      }]
    };
  }

  mapStockPrices(data: any): StockPrice[] {

    const res = new Array<StockPrice>();

    if (data) {
      const prices = data['Time Series (Daily)'];

      if (prices) {
        for (const [key, value] of Object.entries(prices)) {
          const date = key;
          const open = parseInt(value['1. open'], 10);
          const high = parseInt(value['2. high'], 10);
          const low = parseInt(value['3. low'], 10);
          const close = parseInt(value['4. close'], 10);
          const volume = parseInt(value['5. volume'], 10);

          res.push({
            date: new Date(date),
            open,
            high,
            low,
            close,
            volume
          } as StockPrice);
        }
      }
    }
    return res;
  }

  mapIntradayPrices(data: any): IntradayPrice[] {

    const res = new Array<IntradayPrice>();

    if (data) {
      const prices = data['Time Series (5min)'];

      if (prices) {

        for (const [key, value] of Object.entries(prices)) {

          const date = key;

          const open = parseInt(value['1. open'], 10);
          const high = parseInt(value['2. high'], 10);
          const low = parseInt(value['3. low'], 10);
          const close = parseInt(value['4. close'], 10);
          const volume = parseInt(value['5. volume'], 10);

          res.push({
            date: new Date(date),
            open,
            high,
            low,
            close,
            volume
          } as IntradayPrice);
        }
      }
      return res;
    }
  }

}
