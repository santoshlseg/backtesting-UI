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
columnArray : Array<any> = [];
observationArray : any =[];
validObservations : any =[];
cumulativeReturns : any = [];
CAGR : any = [];

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
    console.log("signal =" +signal.value);
  }

  renderPerformanceGrid() {
    this.loading = true;
    var fields = ['strCol1','strCol2','strCol3','strCol4', 'strCol5','strCol6','strCol7','strCol8',
                  'strCol9','strCol10', 'strCol11','strCol12','strCol13','strCol14','strCol15','strCol16',
                  'strCol17','strCol18','strCol19','strCol20'];
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
    var userFractileSelected = userFractileSelected+3;
    //console.log("userFractileSelected="+ userFractileSelected);

     this.observationArray=[];
     this.validObservations=[];
     this.cumulativeReturns=[];
     this.CAGR = [];

     for(var i=0;i<= userFractileSelected ;i++){
      if(i==0){
      this.observationArray.push("Total Observations");
      this.validObservations.push("Valid Observations");
      this.cumulativeReturns.push("Cumulative Returns");
      this.CAGR.push("C A G R");
      }
      else if(i==userFractileSelected-2){               
        this.observationArray.push(spread.value);
        this.validObservations.push(spread.value)
        this.cumulativeReturns.push(spread.value);
        this.CAGR.push(spread.value);
      }
      else if(i==userFractileSelected-1){               
        this.observationArray.push(benchMark.value);
        this.validObservations.push(benchMark.value);
        this.cumulativeReturns.push(benchMark.value);
        this.CAGR.push(benchMark.value);
      }
      else{
        this.observationArray.push("148"); 
        this.validObservations.push("111");
        this.cumulativeReturns.push("605");
        this.CAGR.push("128");
      }
    }
     
    
    const performanceGrid = [
      ["Start Date",this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,
                    this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate],
      ["End Date",this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,
                  this.toDate,this.toDate,this.toDate,this.toDate,this.toDate],

      this.observationArray,     
      this.validObservations,  
      this.cumulativeReturns,
      this.CAGR,
      // ["Annualized Volatility","0.013","0.015","0.012","0.013","0.015","0.524",spread.value,benchMark.value],
      // ["Information Ratio","0.118","0.204","0.553","0.118","0.204","0.524",spread.value,benchMark.value],
      // ["t-stat","0.118","0.204","0.553","0.118","0.204","0.524",spread.value,benchMark.value],
      // ["Skewness","0.118","0.204","0.553","0.225","0.204","0.524",spread.value,benchMark.value],
      // ["Kurtosis","0.555","0.286","-0.047","1.556","0.411","0.524",spread.value,benchMark.value],
      // ["Hit Ratio","0.517","0.469","0.551","0.524","0.49","0.524",spread.value,benchMark.value],
      // ["Maximum Drawdown", "-0.032","-0.037","-0.038","-0.03","-0.029","0.524",spread.value,benchMark.value],
      // ["Value-at-Risk"," 95%","-0.01","-0.012","-0.01","-0.014","0.524",spread.value,benchMark.value],
      // ["Expected Shortfall", "95","-0.01","-0.012","-0.01","-0.014","-0.015",spread.value,benchMark.value],
      // ["Turnover","1.6","1.3","1.6","1.6","1.7","1.8",spread.value,benchMark.value]
      ] as any;


     if(spreadFlag =="True" && benchMarkFlag!=='null'){
      this.columnArray=[];
      for(var i=1;i<=userFractileSelected;i++){
        if(i==1){
          this.columnArray.push({title:'Metric',field :'strCol'+i.toString() })
        }
        else if(i==userFractileSelected){
          this.columnArray.push({title: 'BenchMark' ,field :'strCol'+i.toString()})
        } 
        else if(i==userFractileSelected-1){
          this.columnArray.push({title: 'Long/Short Spread' ,field :'strCol'+i.toString()})
        } 
        else{
          this.columnArray.push({title:'Q'+(i-1).toString(),field :'strCol'+i.toString()})
        }
      }
      grid.config = {
        rowHeight: 40,
      sorting: {
      sortableColumns: true
      },
      columns:this.columnArray,
    dataModel: { 
    fields: fields,
    data : performanceGrid
    }}; 
   }

   else if(spreadFlag=="True" && benchMarkFlag==='null'){
        this.columnArray=[];
      for(var i=1;i<=userFractileSelected-1;i++ ){
        if(i==1){
          this.columnArray.push({title:'Metric',field :'strCol'+i.toString()})
        }
        else if(i==userFractileSelected-1){
          this.columnArray.push({title: 'Long/Short Spread' ,field :'strCol'+i.toString()})
        } 
        else{
          this.columnArray.push({title:'Q'+(i-1).toString(),field :'strCol'+i.toString()})
        }
      }
    grid.config = {
      rowHeight: 40,
    sorting: {
    sortableColumns: true
    },
    columns: this.columnArray,
  dataModel: { 
  fields: fields,
  data : performanceGrid
  }}; 
  }

  else if (spreadFlag=="False" && benchMarkFlag!=='null'){
    this.columnArray=[];
      for(var i=1;i<=userFractileSelected-1;i++ ){
        if(i==1){
          this.columnArray.push({title:'Metric',field :'strCol'+i.toString()})
        }
        else if(i==userFractileSelected-1){
          this.columnArray.push({title: 'BenchMark' ,field :'strCol'+i.toString()})
        } 
        else{
          this.columnArray.push({title:'Q'+(i-1).toString(),field :'strCol'+i.toString()})
        }
      }

    grid.config = {
      rowHeight: 40,
    sorting: {
    sortableColumns: true
    },
    columns: this.columnArray,
  dataModel: { 
  fields: fields,
  data : performanceGrid
  }}; 
  }

  else if (spreadFlag=="False" && benchMarkFlag==='null'){
    this.columnArray=[];
      for(var i=1;i<=userFractileSelected-2;i++ ){
        if(i==1){
          this.columnArray.push({title:'Metric',field :'strCol'+i.toString()})
        }
        else{
          this.columnArray.push({title:'Q'+(i-1).toString(),field :'strCol'+i.toString()})
        }
      }
    grid.config = {
      rowHeight: 40,
    sorting: {
    sortableColumns: true
    },
    columns: this.columnArray,
  dataModel: { 
  fields: fields,
  data : performanceGrid
  }}; 
  }
}
  


displayMultipleChart(fromDate1 : string, toDate1 : string): any {
     const startDate1 = new Date(fromDate1);
     const endDate1 = new Date(toDate1);
     var multiplechart : any = document.getElementById("multiple") as any;
     var selectFractile : any = document.getElementById("selectFractile") as any;
     var temp_series :any = [];
    this.start_Date = startDate1;
    this.end_Date = endDate1;
    for(var i= 0;i< selectFractile.value ;i++){
       temp_series.push({symbol :'Q'+(i-1).toString(),type: 'line',data: this.generateChart()});
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
