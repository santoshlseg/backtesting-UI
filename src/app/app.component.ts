import { Component } from '@angular/core';
import sampleData from '../assets/data.json';
import performanceData from '../assets/performance.json';
import priceData from '../assets/prices.json';


import '@elf/amber-loader';
import '@elf/carbon-sidebar-layout';
import '@elf/coral-button';
import '@elf/coral-collapse';
import '@elf/coral-combo-box';
import '@elf/coral-number-field';
import '@elf/coral-radio-button';
import '@elf/coral-select';
import '@elf/coral-slider';
import '@elf/coral-tab';
import '@elf/coral-tab-bar';
import '@elf/emerald-datetime-picker';
import '@elf/emerald-grid';
import '@elf/emerald-multi-select';
import '@elf/quartz-layout';
import '@elf/sapphire-bar';
import '@elf/sapphire-interactive-chart';
import '@elf/coral-search-field';
import '@elf/coral-toggle';

import '@elf/elf-theme-halo/light/imports/native-elements';
import '@elf/amber-loader/themes/halo/light';
import '@elf/carbon-sidebar-layout/themes/halo/light';
import '@elf/coral-button/themes/halo/light';
import '@elf/coral-collapse/themes/halo/light';
import '@elf/coral-number-field/themes/halo/light';
import '@elf/coral-combo-box/themes/halo/light';
import '@elf/coral-radio-button/themes/halo/light';
import '@elf/coral-select/themes/halo/light';
import '@elf/coral-slider/themes/halo/light';
import '@elf/coral-tab/themes/halo/light';
import '@elf/coral-tab-bar/themes/halo/light';
import '@elf/emerald-datetime-picker/themes/halo/light';
import '@elf/emerald-grid/themes/halo/light';
import '@elf/emerald-multi-select/themes/halo/light';
import '@elf/quartz-layout/themes/halo/light';
import '@elf/sapphire-bar/themes/halo/light';
import '@elf/sapphire-interactive-chart/themes/halo/light';
import { formatDate, Time } from '@angular/common';
import { ParseFlags } from '@angular/compiler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
//loading: boolean = false;
title = 'backtestingUI';

universe: Array<any> = [
  { label: 'Singapore', value: 'SG' },
  { label: 'China', value: 'CN' },
  { label: 'Hong Kong', value: 'HK' },
  { label: 'Taiwan', value: 'TW' },
  { label: 'Thailand', value: 'TH' , selected: true},
  { label: 'Canada', value: 'CA' },
  { label: 'India', value: 'IN' },
  { label: 'United States', value: 'US' }
];

gridData1: Array<any> = [];

portfolios : any;
performance : any;
dateFormat : any;
decimalPlace :any;
metrics:any;

fromDate : any ; 
toDate : any;
startDate1 : any;
endDate1 : any;
json_Data : any = [];
json_Data1 : any = [];
data : any = [];

start_Date :any = '2022-01-01';          
end_Date : any = '2022-12-31';

series_Data : any = [
  {
    symbol: 'Q1',
    type: 'line',
    data : this.generateChart()
  },
  {
    symbol: 'Q2',
    type: 'line',
    data: this.generateChart()
  },
  {
    symbol: 'Q3',
    type: 'line',
    data: this.generateChart()
  },
  {
    symbol: 'Q4',
    type: 'line',
    data: this.generateChart()
  }
];

constructor(){}
  
ngOnInit(): void {  
  //this.loading = false;
    this.onSubmit();
    this.initializeUniverseComboBox();           
    this.initializeLayoutEvent();
    this.onSelectSignal();
  }                    

  initializeUniverseComboBox(): void {
    const comboBox = document.getElementById('selectUniverseComboBox') as any;
    comboBox.data = this.universe;
    comboBox.addEventListener('value-changed', (event: any) => {
       this.universeComboBoxChanged(event);
     });
  }

  universeComboBoxChanged(event: any): void {
    this.universe = event.detail.value;
    console.log("univserse" +this.universe);
  }

  onSubmit() : void {  
    this.onSelectFromDate(); 
    this.onSelectToDate();   
    var isProperDates :boolean = this.validateDate(this.fromDate,this.toDate);
    if(isProperDates==false){
      alert("Provide proper data range");
    }
    var temp_fromdate =document.getElementById("from-date") as any;
    this.fromDate=temp_fromdate.value;
    var temp_todate=document.getElementById("to-date") as any;
    this.toDate=temp_todate.value;
    this.displayMultipleChart(this.fromDate,this.toDate);
    this.renderPerformanceGrid();
    //this.generateChart();
  }

  initializeLayoutEvent(): void {
    const layout = document.getElementById('layout') as any;
    const toggleBtn = document.getElementById('toggleBtn') as any;
    toggleBtn.addEventListener('click', function() {
      layout.collapsed = !layout.collapsed;
      toggleBtn.setAttribute('icon', layout.collapsed ? 'leftpanel-closed' : 'leftpanel-open');
    });
  }
    
  onSelectFromDate(){
    var temp_fromdate =document.getElementById("from-date") as any;
    this.fromDate = temp_fromdate.value;
  }
  onSelectToDate(){
    var temp_todate=document.getElementById("to-date") as any;
    this.toDate=temp_todate.value;
  }
  validateDate(fromDate : string, toDate : string) : boolean{
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    var flag : boolean = false;
    if(startDate > endDate){
      alert("startDate date > end Date");
    }
    else if(startDate < endDate){ 
      flag=true;
    }
    else{
      console.log("Both dates are same");
    }
    return flag;
  }

  onSelectSignal(){
    var signal=document.getElementById("selectSignal") as any;
    console.log("signal =" +signal.value);
  }

  renderPerformanceGrid() {
    var fields = ['strCol1','strCol2','strCol3','strCol4', 'strCol5','strCol6','floatCol',
    'strCol7','strCol8'];
    var grid = document.getElementById('grid1') as any;
    var temp_fromdate =document.getElementById("from-date") as any;
    this.fromDate=temp_fromdate.value;
    var temp_todate=document.getElementById("to-date") as any;
    this.toDate=temp_todate.value;
    var signal = document.getElementById('selectSignal') as any;
    //var benchMark = document.getElementById('benchMark') as any;
    var spread = document.getElementById('spread') as any;

    const performanceGrid = [
      ["Start Date",this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate
      ,this.fromDate],
      ["End Date",this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate],
      ["Signal",signal.value,signal.value,signal.value,signal.value,signal.value,spread.value,999],
      ["Total Number of Observations","148","148","148","148","148","148","148"],
      ["Valid Observations","147","147","147","147","147","147","147"],
      ["Cumulative Returns", "0.019","0.037","0.084","0.028","0.035","0.012","0.021"],
      ["CAGR","0.002","0.003","0.007","0.002","0.003","0.001","0.009"],
      ["Annualized Volatility","0.013","0.015","0.012","0.013","0.015","0.012","0.013"],
      ["Information Ratio","0.118","0.204","0.553","0.118","0.204","0.553","0.118"],
      ["t-stat","0.118","0.204","0.553","0.118","0.204","0.553","0.118"],
      ["Skewness","0.118","0.204","0.553","0.225","0.204","0.553","0.118"],
      ["Kurtosis","0.555","0.286","-0.047","1.556","0.411","0.437","-0.148"],
      ["Hit Ratio","0.517","0.469","0.551","0.524","0.49","0.524","0.51"],
      // [Maximum Drawdown],
      // [Value-at-Risk 95%],
      // [Expected Shortfall 95],
      // [Turnover]
      ] as any;

    grid.config = {
      rowHeight: 40,
    sorting: {
    sortableColumns: true
    },
    columns: [
    { title: 'Metric', field: fields[0] , width: 300},
    { title: 'Q1', field: fields[1] },
    { title: 'Q2', field: fields[2] },
    { title: 'Q3', field: fields[3] },
    { title: 'Q4', field: fields[4] },
    { title: 'Q5', field: fields[5] },
    { title: 'Long/Short Spread', field: fields[6]},
    { title: 'CSI300', field: fields[7] },
  ],
  dataModel: { 
  fields: fields,
  data : performanceGrid
   } };
}


displayMultipleChart(fromDate1 : string, toDate1 : string): any {
     const startDate1 = new Date(fromDate1);
     const endDate1 = new Date(toDate1);
     var multiplechart : any = document.getElementById("multiple") as any;
     var selectFractile : any = document.getElementById("selectFractile") as any;
    var temp_series :any = [];
    var fractile_data : any =[
      {
        symbol: 'Q1',
        type: 'line',
        data : this.generateChart()
      },
      {
        symbol: 'Q2',
        type: 'line',
        data: this.generateChart()
      },
      {
        symbol: 'Q3',
        type: 'line',
        data: this.generateChart()
      },
      {
        symbol: 'Q4',
        type: 'line',
        data: this.generateChart()
      }
    ];
    this.start_Date = startDate1;
    this.end_Date = endDate1;
     for(var i= 0;i< selectFractile.value;i++){
       temp_series.push(fractile_data[i]);
     }
    multiplechart.config = {
      options: {
        priceScale: {
          mode: 2
        },
      },  
      series:temp_series
    }
  }
   
  generateChart() {            
    let initVal = 20;
     const startDate = new Date(this.start_Date);
     const endDate = new Date(this.end_Date);
    const ret = [];
    const total = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    for (let i = 0; i < total; i++) {
        const volatility = (Math.random() * (4.5) - 2) / 100; // random % volatility
        const date = new Date(startDate.setDate(startDate.getDate() + 1));
        const val = initVal + initVal * volatility;
        initVal = val;
        const point = {
            time: date.getTime() / 1000.0,
            value: parseFloat(val.toFixed(2))
        };
        ret.push(point);
    }
    return ret;
  }

}
