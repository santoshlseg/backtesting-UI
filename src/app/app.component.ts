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


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
loading: boolean = false;
title = 'backtestingUI';

universe: Array<any> = [
  { label: 'Singapore', value: 'SG' },
  { label: 'China', value: 'CN' },
  { label: 'Britain', value: 'TH' , selected: true},
  { label: 'Canada', value: 'CA' },
  { label: 'India', value: 'IN' },
  { label: 'United States', value: 'US' }
];

performance : any;
dateFormat : any;

fromDate : any ; 
toDate : any;
startDate1 : any;
endDate1 : any;
json_Data : any = [];
json_Data1 : any = [];
data : any = [];
columnNames : Array<any> = [];
rowArray : Array<any> = [];
rowArray1 : Array<any> = [];
rowArray2 : Array<any> = [];
observationArray : any =[];
validObservations : any =[];
cumulativeReturns : any = [];
CAGR : any = [];
annualizedVolatility : any =[];

start_Date :any = '2022-01-01';          
end_Date : any = '2022-12-31';


constructor(){}
  
ngOnInit(): void {  
    this.loading = true;
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
    //console.log("signal =" +signal.value);
  }

  // renderPerformanceGrid() {
  //   this.loading = true;
  //   var fields = ['strCol1','strCol2','strCol3','strCol4', 'strCol5','strCol6','strCol7','strCol8',
  //                 'strCol9','strCol10', 'strCol11','strCol12','strCol13','strCol14','strCol15','strCol16',
  //                 'strCol17','strCol18','strCol19','strCol20'];
  //   var grid = document.getElementById('grid1') as any;
  //   var temp_fromdate =document.getElementById("from-date") as any;
  //   this.fromDate=temp_fromdate.value;
  //   var temp_todate=document.getElementById("to-date") as any;
  //   this.toDate=temp_todate.value;
  //   //var signal = document.getElementById('selectSignal') as any;
  //   var benchMark = document.getElementById('selectBenchMark') as any;
  //   var benchMarkFlag : any = benchMark.value;
  //   var spread = document.getElementById('spread') as any;
  //   var spreadFlag : any = spread.value;

  //   var selectFractile : any = document.getElementById("selectFractile") as any;
  //   var fractileSelected : any = selectFractile.value;
  //   var userFractileSelected = parseInt(fractileSelected, 10);
  //   var userFractileSelected = userFractileSelected+3;
  //   //console.log("userFractileSelected="+ userFractileSelected);

  //    this.observationArray=[];
  //    this.validObservations=[];
  //    this.cumulativeReturns=[];
  //    this.CAGR = [];
  //    this.annualizedVolatility = [];

  //    for(var i=0;i<=userFractileSelected;i++){
  //     if(i==0){
  //     this.observationArray.push("Total Observations");
  //     this.validObservations.push("Valid Observations");
  //     this.cumulativeReturns.push("Cumulative Returns");
  //     this.CAGR.push("C A G R");
  //     this.annualizedVolatility.push("Annualized Volatility");
  //     }
  //     else if(i==userFractileSelected-2){               
  //       this.observationArray.push(spread.value);
  //       this.validObservations.push(spread.value)
  //       this.cumulativeReturns.push(spread.value);
  //       this.CAGR.push(spread.value);
  //       this.annualizedVolatility.push(spread.value);
  //     }
  //     else if(i==userFractileSelected-1){               
  //       this.observationArray.push(benchMark.value);
  //       this.validObservations.push(benchMark.value);
  //       this.cumulativeReturns.push(benchMark.value);
  //       this.CAGR.push(benchMark.value);
  //       this.annualizedVolatility.push(benchMark.value);
  //     }
  //     else{
  //       this.observationArray.push("148"); 
  //       this.validObservations.push("111");
  //       this.cumulativeReturns.push("605");
  //       this.CAGR.push("128");
  //       this.annualizedVolatility.push("0.012");
  //     }
  //   }
     
    
//     const performanceGrid = [
//       ["Start Date",this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,
//                     this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate],
//       ["End Date",this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,
//                   this.toDate,this.toDate,this.toDate,this.toDate,this.toDate],
//       this.observationArray,  
//       this.validObservations,  
//       this.cumulativeReturns,
//       this.CAGR,
//       this.annualizedVolatility,
//       this.rowArray
//       ] as any;

//      if(spreadFlag =="True" && benchMarkFlag!=='null'){
//       this.columnArray=[];
//       for(var i=1;i<=userFractileSelected;i++){
//         if(i==1){
//           this.columnArray.push({title:'Metric',field :'strCol'+i.toString()})
//         }
//         else if(i==userFractileSelected){
//           this.columnArray.push({title: 'BenchMark' ,field :'strCol'+i.toString()})
//         } 
//         else if(i==userFractileSelected-1){
//           this.columnArray.push({title: 'Long/Short Spread' ,field :'strCol'+i.toString()})
//         } 
//         else{
//           this.columnArray.push({title:'Q'+(i-1).toString(),field :'strCol'+i.toString()})
//         }
//       }
//       grid.config = {
//         rowHeight: 40,
//       sorting: {
//       sortableColumns: true
//       },
//       columns:this.columnArray,
//     dataModel: { 
//     fields: fields,
//     data : performanceGrid
//     }}; 
//    }

//    else if(spreadFlag=="True" && benchMarkFlag==='null'){
//         this.columnArray=[];
//       for(var i=1;i<=userFractileSelected-1;i++ ){
//         if(i==1){
//           this.columnArray.push({title:'Metric',field :'strCol'+i.toString()})
//         }
//         else if(i==userFractileSelected-1){
//           this.columnArray.push({title: 'Long/Short Spread' ,field :'strCol'+i.toString()})
//         } 
//         else{
//           this.columnArray.push({title:'Q'+(i-1).toString(),field :'strCol'+i.toString()})
//         }
//       }
//     grid.config = {
//       rowHeight: 40,
//     sorting: {
//     sortableColumns: true
//     },
//     columns: this.columnArray,
//   dataModel: { 
//   fields: fields,
//   data : performanceGrid
//   }}; 
//   }

//   else if (spreadFlag=="False" && benchMarkFlag!=='null'){
//     this.columnArray=[];
//       for(var i=1;i<=userFractileSelected-1;i++ ){
//         if(i==1){
//           this.columnArray.push({title:'Metric',field :'strCol'+i.toString()})
//         }
//         else if(i==userFractileSelected-1){
//           this.columnArray.push({title: 'BenchMark' ,field :'strCol'+i.toString()})
//         } 
//         else{
//           this.columnArray.push({title:'Q'+(i-1).toString(),field :'strCol'+i.toString()})
//         }
//       }

//     grid.config = {
//       rowHeight: 40,
//     sorting: {
//     sortableColumns: true
//     },
//     columns: this.columnArray,
//   dataModel: { 
//   fields: fields,
//   data : performanceGrid
//   }}; 
//   }

//   else if (spreadFlag=="False" && benchMarkFlag==='null'){
//     this.columnArray=[];
//       for(var i=1;i<=userFractileSelected-2;i++){
//         if(i==1){
//           this.columnArray.push({title:'Metric',field :'strCol'+i.toString()})
//         }
//         else{
//           this.columnArray.push({title:'Q'+(i-1).toString(),field :'strCol'+i.toString()})
//         }
//       }
//     grid.config = {
//       rowHeight: 40,
//     sorting: {
//     sortableColumns: true
//     },
//     columns: this.columnArray,
//   dataModel: { 
//   fields: fields,
//   data : performanceGrid
//   }}; 
//   }
// }
  

renderPerformanceGrid() {
  console.log("Inside renderPerformanceGrid");
  var fields = ['strCol1','strCol2','strCol3','strCol4', 'strCol5','strCol6','strCol7','strCol8'
                  // 'strCol9','strCol10', 'strCol11','strCol12','strCol13','strCol14','strCol15','strCol16',
                  //  'strCol17','strCol18','strCol19','strCol20'
                  ];
  var grid = document.getElementById('grid1') as any;
  var temp_fromdate =document.getElementById("from-date") as any;
    this.fromDate=temp_fromdate.value;
    var temp_todate=document.getElementById("to-date") as any;
    this.toDate=temp_todate.value;
    //var signal = document.getElementById('selectSignal') as any;
    var benchMark = document.getElementById('selectBenchMark') as any;
    var benchMarkFlag : any = benchMark.value;
    var spread = document.getElementById('spread') as any;
    var spreadFlag : any = spread.value;

    var selectFractile : any = document.getElementById("selectFractile") as any;
    var fractileSelected : any = selectFractile.value;
    var userFractileSelected = parseInt(fractileSelected, 10);
    console.log("userFractileSelected="+ userFractileSelected);
    var userFractileSelected = userFractileSelected+3;
    console.log("userFractileSelected2= "+ userFractileSelected);

     this.observationArray=["44","55","66","77","88","99"];
     this.validObservations=[];
     this.cumulativeReturns=[];
     this.CAGR = [];
     this.annualizedVolatility = [];

  this.columnNames=[];

  this.columnNames.push({title:'Metric', field :fields[0]})
  this.columnNames.push({title:'Total Observations',field :fields[1]})
  this.columnNames.push({title:'Valid Observations',field :fields[2]})
  this.columnNames.push({title:'Cumulative Returns',field :fields[3]})
  this.columnNames.push({title:'CAGR',field :fields[4]})
  this.columnNames.push({title:'Annualized Volatility',field :fields[5]})
  this.columnNames.push({title:'Information Ratio',field :fields[6]})
  this.columnNames.push({title:'t-stat',field :fields[7]})
  this.columnNames.push({title:'Skewness',field :fields[8]})
  this.columnNames.push({title:'Kurtosis',field :fields[9]})
  this.columnNames.push({title:'Hit Ratio',field :fields[10]})
  this.columnNames.push({title:'Maximum Drawdown',field :fields[11]})
//this.columnNames.push({title:'Value-at-Risk 95%',field :fields[12]})
 // this.columnNames.push({title:'Expected Shortfall 95',field :fields[13]})
 // this.columnNames.push({title:'  Turnover',field :fields[14]})


  this.rowArray=[];
  this.rowArray1=[];
  this.rowArray2=[];

  
  console.log("Array contents =" + this.observationArray[0]);
  for(var i=1;i< userFractileSelected;i++){
    console.log("Inside For Loop ");
  
  this.rowArray.push("Q1",this.observationArray[i],"34","000","98722","67822","987","56","65","098","45")
  this.rowArray1.push("Q2","10332","1222","3422","9800","987","67822","45","678","678","009","007")
  this.rowArray2.push("Q3","132","1222","3422","9800","987","67822","54","678")
}




  const performanceGrid = [
    ["Start Date",this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,
                     this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate],
    ["End Date",this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,
                   this.toDate,this.toDate,this.toDate,this.toDate,this.toDate],
    this.rowArray,
    this.rowArray1, 
    this.rowArray2
  ] as any;

grid.config = {
    sorting: {
        sortableColumns: true
    },
  columns: this.columnNames,
  dataModel: {
    fields: fields,
    data : performanceGrid
  }
};
}

displayMultipleChart(fromDate1 : string, toDate1 : string): any {
  const startDate1 = new Date(fromDate1);
  const endDate1 = new Date(toDate1);
  var multiplechart : any = document.getElementById("multiple") as any;
     var selectFractile : any = document.getElementById("selectFractile") as any;
     var benchMark = document.getElementById('selectBenchMark') as any;
     var benchMarkFlag : any = benchMark.value;
     var spread = document.getElementById('spread') as any;
     var spreadFlag : any = spread.value;

     var temp_series :any = [];
     this.start_Date = startDate1;
     this.end_Date = endDate1;
     for(var i= 0;i<selectFractile.value;i++){
       temp_series.push({symbol:'Q'+(i+1).toString(),type:'line',data:this.generateChart()});
     }
     if(spreadFlag=="True"){
     temp_series.push({symbol:'Long/Short Spread',type:'line',data:this.generateChart()});
     }
     if(benchMarkFlag!=='null'){
     temp_series.push({symbol:'BenchMark',type:'line',data:this.generateChart()});
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
    this.loading = true;        
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
