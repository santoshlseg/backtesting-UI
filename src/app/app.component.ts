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
loading: boolean = false;
title = 'backtestingUI';
Users: any = sampleData;            // Read from Jason file 
perf :any =performanceData;
price :any =priceData;

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

fromDate : any;
toDate : any;
startDate1 : any;
endDate1 : any;
json_Data : any = [];
json_Data1 : any = [];
userSelectedDateRange :any = [];
data : any = [];

start_Date :any = '2022-10-01';          // Initialized to Dummy values
end_Date : any = '2022-10-30';
series_Data : any = [
  {
    symbol: 'GOOGL.O',
    type: 'line',
    //data : this.display_Data
    //data : this.generateChart('2022-10-01', '2022-10-30')
    data : this.generateChart(this.start_Date, this.end_Date)
  },
  {
    symbol: 'AMZN.OQ',
    type: 'line',
    //data : this.generateChart('2022-10-01', '2022-10-30')
    data: this.generateChart(this.start_Date, this.end_Date)
  },
  {
    symbol: 'WALMART.OQ',
    type: 'line',
    //data : this.generateChart('2022-10-01', '2022-10-30')
    data: this.generateChart(this.start_Date, this.end_Date)
  },
  {
    symbol: 'DISNEY.OQ',
    type: 'line',
    //data : this.generateChart('2022-10-01', '2022-10-30')
    data: this.generateChart(this.start_Date, this.end_Date)
  }
];

constructor(){}
  
ngOnInit(): void {  
    this.uploadJsonDatatoArray();
    this.onSelectFromDate(); 
    this.onSelectToDate(); 
    this.onSubmit();
    this.initializeUniverseComboBox();           
    this.initializeLayoutEvent();
    this.readJsonDatatoArray();
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

  uploadJsonDatatoArray(): void {
    for(var i=0;i<6;i++) {
      //console.log(this.getTime(i));
      //console.log(this.getValue(i));
      this.json_Data.push({ time: this.Users[i]["time"],value : this.Users[i]["phone"]});
      //console.log("count="+this.json_Data.length);
    }
  }

  readJsonDatatoArray(): void {
    for(var i=0;i<6;i++) {
      this.json_Data1.push({ time: this.Users[i]["time"], 
      name : this.Users[i]["name"],
      phone : this.Users[i]["phone"], 
      country: this.Users[i]["country"],
      frequency : this.Users[i]["frequency"],
      return : this.Users[i]["return"],
      cagr : this.Users[i]["cagr"],
      volatility : this.Users[i]["volatility"],
      ratio : this.Users[i]["ratio"]
    });
    }
  }

  onSubmit() : void {    
    var isProperDates :boolean = this.validateDate(this.fromDate,this.toDate);
    if(isProperDates==true){
      this.calculateDateRangeForGraph(this.fromDate,this.toDate);
    }
    else{
      alert("Provide proper data range");
    }
    var n : any = document.getElementById("selectN") as any;
    for(var i=0;i< n.value ;i++) {
      //console.log(this.getTime(i));
      //console.log(this.getValue(i));
      this.userSelectedDateRange.push({ time: this.Users[i]["time"],value : this.Users[i]["phone"]});
    }
      setTimeout(()=> this.displayMultipleChart(this.fromDate,this.toDate),1000);
      this.readJsonFile();  
      this.renderPerformanceGrid();
      this.renderResultGrid();
  }

  initializeLayoutEvent(): void {
    const layout = document.getElementById('layout') as any;
    const toggleBtn = document.getElementById('toggleBtn') as any;
    toggleBtn.addEventListener('click', function() {
      layout.collapsed = !layout.collapsed;
      toggleBtn.setAttribute('icon', layout.collapsed ? 'leftpanel-closed' : 'leftpanel-open');
    });
  }
    
//   getTime( j: number): any {
//     var time = (this.Users[j]["time"]);
//     return time;
// } 
//   getValue( j: number): any {
//     var phone = (this.Users[j]["phone"]);
//     return phone;
// } 

  onSelectFromDate(){
    var temp_fromdate =document.getElementById("from-date") as any;
    this.fromDate=temp_fromdate.value;
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

  calculateDateRangeForGraph(fromDate : string, toDate : string) : any{
    for(var i=0;i< this.json_Data.length ;i++){
      var temp : any = this.json_Data[i].time;
      if(temp >= fromDate && temp <= toDate){
        this.userSelectedDateRange.push(temp);
      }
    }
    return this.userSelectedDateRange;
  }

  onSelectSignal(){
    var signal=document.getElementById("selectSignal") as any;
    console.log("signal =" +signal.value);
  }


  renderPerformanceGrid() {
    this.loading = true;
    var fields = ['strCol1','strCol2','strCol3','strCol4', 'strCol5','strCol6','floatCol'];
    var grid = document.getElementById('grid1') as any;
    var temp_fromdate =document.getElementById("from-date") as any;
    this.fromDate=temp_fromdate.value;
    var temp_todate=document.getElementById("to-date") as any;
    this.toDate=temp_todate.value;
    var signal = document.getElementById('selectSignal') as any;
    var benchMark = document.getElementById('benchMark') as any;
    var spread = document.getElementById('spread') as any;

    const gridData2 = [
      ["Start Date",this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate
      ,this.fromDate],
      ["End Date",this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate],
      ["Signal",signal.value,signal.value,signal.value,signal.value,signal.value,spread.value,benchMark.value]
      ] as any;

    grid.config = {
      rowHeight: 40,
    sorting: {
    sortableColumns: true
    },
    columns: [
    { title: 'Metric', field: fields[0] },
    { title: 'Q1', field: fields[1] },
    { title: 'Q2', field: fields[2] },
    { title: 'Q3', field: fields[3] },
    { title: 'Q4', field: fields[4] },
    { title: 'Q5', field: fields[5] },
    { title: 'Long/Short Spread', field: fields[6]},
    { title: 'BenchMark', field: fields[7] },
  ],
  dataModel: { 
  fields: fields,
  data : gridData2
   } };
}



  renderResultGrid() {
      //console.log("renderResultGrid");
      this.loading = true;
      var fields = ['strCol1','strCol2','strCol3','strCol4','strCol5','strCol6','strCol7', 'strCol8','strCol9' ];
      var grid = document.getElementById('grid') as any;

      const gridData = [] as any;

      for(var i=0;i<this.json_Data1.length;i++){
        console.log("value of i" +i);
        gridData.push([this.json_Data1[i].time,
          this.json_Data1[i].name, 
          this.json_Data1[i].phone,
          this.json_Data1[i].country,
          this.json_Data1[i].frequency,
          this.json_Data1[i].return,
          this.json_Data1[i].cagr,
          this.json_Data1[i].volatility,
          this.json_Data1[i].ratio
          
        ]);
        //console.log(this.json_Data1[i].frequency);
      }  
      
      grid.config = {
        rowHeight: 40,
      sorting: {
      sortableColumns: true
      },

      columns: [
      { title: 'Start Date', field: fields[0] },
      { title: 'Name of Observation', field: fields[1] },
      { title: 'Valid Observations', field: fields[2] },
      { title: 'Country', field: fields[3] , visible :true },
      { title: 'Frequency', field: fields[4] , visible :true },
       { title: 'Cummulative Return', field: fields[5] , visible :true },
       { title: 'CAGR', field: fields[6] , visible :true },
       { title: 'Annualized Volatility', field: fields[7] , visible :true },
       { title: 'Information Ratio', field: fields[8] , visible :true },
    ],
    dataModel: { 
    fields: fields,
    data : gridData
     } };
}


generateChart(from: string, to: string) {            
  let initVal = 20;
  const startDate = new Date(from);
  const endDate = new Date(to);
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

displayMultipleChart(fromDate1 : string, toDate1 : string): any {
     const startDate1 = new Date(fromDate1);
     const endDate1 = new Date(toDate1);
     //console.log("const startDate"+ startDate1);
     //console.log("endDate"+ endDate1);
     var startDt :string = startDate1.toString();
     var endDt :string = endDate1.toString();
     var multiplechart : any = document.getElementById("multiple") as any;
     var selectN : any = document.getElementById("selectN") as any;

     var temp_series :any = [];
    //  this.start_Date = startDt;
    //  this.end_Date = endDt;
    this.start_Date = startDate1;
    this.end_Date = endDate1;
    //  console.log("startDt="+startDt);
    //  console.log("endDt="+ endDt);
    //  console.log("startDate="+this.start_Date);
    //  console.log("endDate="+this.end_Date);

     for(var i= 0;i< selectN.value;i++){
       temp_series.push(this.series_Data[i]);
     }
    multiplechart.config = {
      options: {
        priceScale: {
          mode: 2
        },
      },  
      series: temp_series
    }
  }

  
   retrieveData() : any {
     this.loading = true;
     console.log("Loading data");
     return fetch(`assets/data.json`)
       .then((response) => response.json())
       .then((data) => {
         this.loading = false;
         console.log("data ="+ data);
         return data;
      });
   }


   readJsonFile() :  any {
    //console.log("Inside readJson method :");
    this.loading = true;
    return fetch(`assets/performance.json`)
      .then((response) => response.json())
      .then((data) => {
        this.loading = false;
        //console.log("Json data :"+ data.time);
        //console.log("Json data :"+ data.phone);
        //console.log("Json data :"+ data.size);
        return data;
      });
  }

}
