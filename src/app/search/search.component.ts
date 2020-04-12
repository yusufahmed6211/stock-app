import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';

import { AlphaVantageService } from '../shared/services/alpha-vantage.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  searchForm: FormGroup;
  searchInput = '';
  loading = false;
  data;
  constructor(private alphaVantageSvc: AlphaVantageService) {

  }

  ngOnInit(): void {
    this.searchForm = new FormGroup({
      input: new FormControl('')
    });
  }

  onChangeSearchInput(e) {
    this.loading = true;
    this.searchInput = e.currentTarget.value;
    this.alphaVantageSvc
      .getInstruments(this.searchInput)
      .pipe(
        map(res => {
          this.data = res;
          this.loading = false;
        }))
      .subscribe();
  }
}
