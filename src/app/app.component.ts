import { Component } from '@angular/core';
//import sampleData from '../assets/data.json';
//import performanceData from '../assets/performance.json';
//import priceData from '../assets/prices.json';
//import bench from '../assets/santosh.json';


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
title = 'backtestingUI';

universe: Array<any> = [
  { label: 'Singapore', value: 'SG' },
  { label: 'China', value: 'CN' },
  { label: 'Britain', value: 'TH' , selected: true},
  { label: 'Canada', value: 'CA' },
  { label: 'India', value: 'IN' },
  { label: 'United States', value: 'US'}
];

signal: Array<any> = [
  { label: 'StarMine Price Momentum Short Term', value: 'PMST' },
  { label: 'StarMine Price Momentum Medium Term', value: 'PMMT' },
  { label: 'StarMine Price Momentum Long Term', value: 'PMLT' },
  { label: 'StarMine Analyst Revision Global', value: 'ARMG' }
];

stdBenchMark : Array<any> = [
  { label: 'None', value: 'null' },
  { label: 'EQWT', value: 'Equal Weight' },
  { label: 'Strait Times Index', value: '.STI' },
  { label: 'China Securities Index', value: '.CSI300' },
  { label: 'FTSE 100', value: '.FTSE' },
  { label: 'S&P 500', value: '.FTSE' },
  { label: 'Sensex', value: '.BSESN' , selected: true},
  { label: 'S&P/TSX', value: '.GSPTSE' }
];

performance : any;
dateFormat : any;
loading : boolean= true;
fromDate : any ; 
toDate : any;
startDate1 : any;
endDate1 : any;
json_Data : any = [];
json_Data1 : any = [];
data : any = [];
columnNames : Array<any> = [];
gridColumns : Array<any> = [];
rowArray : Array<any> = [];
rowArrayFlag : Array<any> = [];
rowArrayData : Array<any> = [];
start_Date :any = '2022-01-01';          
end_Date : any = '2022-12-31';
entries : any = [];
perfEntries : any =[];
gridPerfObject : any =[];
keys : any = [];
arr2 :any =[];
bmObject : any = [];
priceObject : any = [];
weiObject : any = [];
bmArray :any = [];
priceArray : any = [];

Q1 : any = [];
LS : any = [];

dateArr : any = [];
valArr : any = [];
dateArr1 : any = [];
valArr1 : any = [];
tt : any =[];
portfolio : any =[];
totalObservations : any = [];
validObservations : any = [];
cumulativeReturns : any = [];
CAGR : any = [];
AnnualizedVolatility : any = [];
InformationRatio : any = [];
tstat :any =[];
skewness : any =[];
kurtosis : any =[];
hitRatio : any =[];
maxDrawdown : any = [];



constructor(){}
  
ngOnInit(): void {  
    this.loading = false;
    this.retrieveBenchMarks();
    this.retrievePerformance();
    this.getBMData(this.entries);            // Loading data in Array 
    this.onSubmit();
    this.initializeUniverseComboBox();   
    this.initializeSignalComboBox();  
    this.initializeBenchMarkComboBox();   
    this.initializeLayoutEvent();
    this.onSelectSignal();
         //this.retrieveBenchMarks();
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
  }

  initializeSignalComboBox(): void {
    const comboBox = document.getElementById('selectSignal') as any;
    comboBox.data = this.signal;
    comboBox.addEventListener('value-changed', (event: any) => {
       this.signalComboBoxChanged(event);
     });
  }
  signalComboBoxChanged(event: any): void {
    this.signal = event.detail.value;
    //console.log("signal = " +this.signal);
  }

  initializeBenchMarkComboBox(): void {
    const comboBox = document.getElementById('selectBenchMark') as any;
    comboBox.data = this.stdBenchMark;
    comboBox.addEventListener('value-changed', (event: any) => {
       this.benchMarkComboBoxChanged(event);
     });
  }
  benchMarkComboBoxChanged(event: any): void {
    this.stdBenchMark = event.detail.value;
    //console.log("benchMark = " +this.stdBenchMark);
  }


  getBMData(entries: Object): void {
    this.weiObject = [];
    for (const [key, value] of Object.entries(entries)) {
     // console.log(`${key}  ${value}`);   
      if (typeof value=='string') {
         if(key=='benchmark'){
           this.bmObject = JSON.parse(value);          
         }
         if(key=='prices'){
          this.priceObject = JSON.parse(value);          
        }
      }
      // else {
      //   console.log("Non string Key here ");
      //   console.log("key="+ key, "\n value=" +JSON.stringify(value));
      // }
    } 

      // for (const [key, value] of Object.entries(this.priceObject)) {          
      //   console.log(`${key} \t   ${value}`);
      // }
      // console.log("Keys=" + Object.keys(this.priceObject));

    this.bmObject.forEach(item => {
      for (let key in item) {
        //console.log(`${key}: ${item[key]}`)
        this.bmArray.push(key,item[key]);       
      }
    })
    
    this.priceObject.forEach(item => {
      for (let key in item) {
        //console.log(`${key}: ${item[key]}`)
        this.priceArray.push(key,item[key]);        
      }
    })
  }
  
  onSubmit() : void {  
    this.loading = true;
    setTimeout(()=> this.loading=false,10000);
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
    this.renderPerformanceGrid(this.perfEntries);
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
  }

  onSelectSpread(){
  //    var text = document.getElementById('text');
  //    var toggle = document.getElementById('toggle');

  //    text.innerHTML = 'OFF';

  //    toggle.addEventListener('checked-changed', function (e) {
  //     text.innerHTML = e.target.checked ? 'ON' : 'OFF';
  // });
  }


renderPerformanceGrid(perfEntries : Object): void {
  console.log("Inside renderPerformanceGrid");
  var fields = ['strCol1','strCol2','strCol3','strCol4', 'strCol5','strCol6','strCol7','strCol8',
                   'strCol9','strCol10', 'strCol11','strCol12','strCol13','strCol14','strCol15','strCol16',
                    'strCol17','strCol18','strCol19','strCol20'
                  ];
  var grid = document.getElementById('grid') as any;
  var temp_fromdate =document.getElementById("from-date") as any;
  this.fromDate=temp_fromdate.value;
  var temp_todate=document.getElementById("to-date") as any;
  this.toDate=temp_todate.value;
  var benchMark = document.getElementById('selectBenchMark') as any;
  var bMFlag : any = benchMark.value;
  var spread = document.getElementById('spread') as any;
  var spFlag : any = spread.value;
  var selectFractile : any = document.getElementById("selectFractile") as any;
  var fractileSelected : any = selectFractile.value;
  var userFractileSelected = parseInt(fractileSelected, 10);
  var userFractileSelected = userFractileSelected+2;

  for (const [key, value] of Object.entries(perfEntries)) {
      //console.log(`${key}  ${value}`); 
      if (typeof value=='string') {
      if(key=='performance'){
        this.gridPerfObject = JSON.parse(value);          
      }
    }
  }
  //console.log("Grid Keys=" + Object.keys(this.gridPerfObject));
  //console.log("Grid Keys2 = " + (JSON.stringify(this.gridPerfObject)));
  this.portfolio = [];
  this.totalObservations = [];
  this.validObservations = [];
  this.cumulativeReturns = [];
  this.CAGR = [];
  this.AnnualizedVolatility = [];
  this.InformationRatio = [];
  this.tstat = [];
  this.skewness = [];
  this.kurtosis = [];
  this.hitRatio = [];
  this.maxDrawdown = [];
  


  this.gridPerfObject.forEach(item => {
    for (let key in item) {
      //console.log(`${key} : ${item[key]}`)
      //this.gridColumns.push(key,item[key]);  
      
      if(key=='portfolio'){
        this.portfolio.push(item[key]);
      }
      if(key=='Total Number of Observations'){
        this.totalObservations.push(item[key]);
      }
      if(key=='Valid Observations'){
        this.validObservations.push(item[key]);
      }
      if(key=='Cumulative Return'){
        this.cumulativeReturns.push(item[key]);
      }
      if(key=='CAGR'){
        this.CAGR.push(item[key]);
      }
      if(key=='Annualized Volatility'){
        this.AnnualizedVolatility.push(item[key]);
      }
      if(key=='Information Ratio'){
        this.InformationRatio.push(item[key]);
      }
      if(key=='t-stat'){                                 
        this.tstat.push(item[key]);
      }
      if(key=='Skewness'){                                // 
        this.skewness.push(item[key]);
      }
      if(key=='Kurtosis'){                                // 
        this.kurtosis.push(item[key]);
      }
      if(key=='Hit Ratio'){                                // 
        this.hitRatio.push(item[key]);
      }
      if(key=='Maximum Drawdown'){                                // 
        this.maxDrawdown.push(item[key]);
      }


    }
  })

    console.log("portfolio = " + this.portfolio);
    console.log("total Observations = " + this.totalObservations);
    console.log("valid Observations = " + this.validObservations);
    console.log("valid cumulativ  = " + this.cumulativeReturns);
    console.log("valid cagr  = " + this.CAGR);
    console.log("valid vola = " + this.AnnualizedVolatility);
    console.log("information Ratio = " + this.InformationRatio);

  
  this.gridColumns=[];
  this.columnNames=[];
  this.columnNames.push({title:'Metric', field :fields[0] , width : 150})
  this.columnNames.push({title:'Portfolio', field :fields[1] })
  this.columnNames.push({title:'Total Observations',field :fields[2]})
  this.columnNames.push({title:'Valid Observations',field :fields[3]})
  this.columnNames.push({title:'Cumulative Returns',field :fields[4]})
  this.columnNames.push({title:'CAGR',field :fields[5]})
  this.columnNames.push({title:'Annualized Volatility',field :fields[6]})
  this.columnNames.push({title:'Information Ratio',field :fields[7]})
  this.columnNames.push({title:'t-stat',field :fields[8]})
  this.columnNames.push({title:'Skewness',field :fields[9]})
  this.columnNames.push({title:'Kurtosis',field :fields[10]})
  this.columnNames.push({title:'Hit Ratio',field :fields[11]})
  this.columnNames.push({title:'Maximum Drawdown',field :fields[12]})
  

  this.rowArray=[
    ["Start Date",this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate,this.fromDate],
    ["End Date",this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate,this.toDate],
    ["Q1",this.portfolio[0],this.totalObservations[0],this.validObservations[0],this.cumulativeReturns[0],this.CAGR[0],this.AnnualizedVolatility[0],this.InformationRatio[0],this.tstat[0],this.skewness[0],this.kurtosis[0],this.hitRatio[0],this.maxDrawdown[0],"234","234"],
    ["Q2",this.portfolio[1],this.totalObservations[1],this.validObservations[1],this.cumulativeReturns[1],this.CAGR[1],this.AnnualizedVolatility[1],this.InformationRatio[1],this.tstat[1],this.skewness[1],this.kurtosis[1],this.hitRatio[1],this.maxDrawdown[1],"007"],
    ["Q3",this.portfolio[2],this.totalObservations[2],this.validObservations[2],this.cumulativeReturns[2],this.CAGR[2],this.AnnualizedVolatility[2],this.InformationRatio[2],this.tstat[2],this.skewness[2],this.kurtosis[2],this.hitRatio[2],this.maxDrawdown[2],"9800","987"],
    ["Q4",this.portfolio[3],this.totalObservations[3],this.validObservations[3],this.cumulativeReturns[3],this.CAGR[3],this.AnnualizedVolatility[3],this.InformationRatio[3],this.tstat[3],this.skewness[3],this.kurtosis[3],this.hitRatio[3],this.maxDrawdown[3],"34","500"],
    ["Q5",this.portfolio[4],this.totalObservations[4],this.validObservations[4],this.cumulativeReturns[4],this.CAGR[4],this.AnnualizedVolatility[4],this.InformationRatio[4],this.tstat[4],this.skewness[4],this.kurtosis[4],this.hitRatio[4],this.maxDrawdown[4],"987","009"],
  ];

  this.rowArrayFlag=[
    ["Long/Short spread",spFlag,spFlag,spFlag,spFlag,spFlag,spFlag,spFlag,spFlag,spFlag,spFlag,spFlag,spFlag],
    ["BenchMark",bMFlag,bMFlag,bMFlag,bMFlag,bMFlag,bMFlag,bMFlag,bMFlag,bMFlag,bMFlag,bMFlag,bMFlag]
  ];

  this.rowArrayData=[];

  for(var i=0; i<userFractileSelected ;i++){
    this.rowArrayData.push(this.rowArray[i]);
  }
  if(spFlag=="True"){
    this.rowArrayData.push(this.rowArrayFlag[0]);
  }
  if(bMFlag!=='null' && bMFlag!==''){
    this.rowArrayData.push(this.rowArrayFlag[1]);
  }

grid.config = {
    sorting: {
        sortableColumns: true
    },
  columns: this.columnNames,
  dataModel: {
    fields: fields,
    data : this.rowArrayData
  }
};
}

displayMultipleChart(fromDate1 : string, toDate1 : string): any {
  const startDate1 = new Date(fromDate1);
  const endDate1 = new Date(toDate1);
  var multiplechart : any = document.getElementById("multiple") as any;
     var selectFractile : any = document.getElementById("selectFractile") as any;
     var benchMark = document.getElementById('selectBenchMark') as any;
     var bMFlag : any = benchMark.value;
     var spread = document.getElementById('spread') as any;
     var spFlag : any = spread.value;
     var temp_series :any = [];
     this.start_Date = startDate1;
     this.end_Date = endDate1;
     for(var i= 0;i<selectFractile.value;i++){
       temp_series.push({symbol:'Q'+(i+1).toString(),type:'line',data:this.generateChart()});
     }
     if(spFlag=="True"){
     temp_series.push({symbol:'Long/Short Spread',type:'line',data:this.generateChart()});
     }
     if(bMFlag!=='null'){
     temp_series.push({symbol:'BenchMark',type:'line',data:this.generateBMChart()});
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
  //console.log("Inside generateChart");
    let initVal = 20;
     const startDate = new Date(this.start_Date);
     const endDate = new Date(this.end_Date);
     //console.log(startDate);
     //console.log(endDate);
    const ret = [];
    const total = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    //console.log("total="+total);
    for (let i = 0; i < total; i++) {
        const volatility = (Math.random() * (4.5) - 2) / 100; // random % volatility
        const date = new Date(startDate.setDate(startDate.getDate() + 1));
        const val = initVal + initVal * volatility;
        initVal = val;
        const point = {
            time: date.getTime() / 1000.0,
            value: parseFloat(val.toFixed(2))
        };
       // console.log("point=" +point.time);
       // console.log("value =" +point.value);
        ret.push(point);
    }
    return ret;
  }

  generateBMChart() { 
    //console.log("Inside generateBMChart");
    //console.log("Inside generateBMChart arrSize =" +this.bmArray.length);    
    const startDate = new Date(this.start_Date);      // user Input Date
    const endDate = new Date(this.end_Date);
    //console.log("generateBMChart start dt = " + startDate);
    //console.log("generateBMChart end dt= " + endDate);
   const ret = [];
   const total = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
   //console.log("total= "+ total);
   this.dateArr = [];
   for(var i=0;i< this.bmArray.length; i=i+2 ){         
    this.dateArr.push(this.bmArray[i]);
   }
   //console.log("dateArr="+this.dateArr.length);
  //  for(var k=0 ;k < this.dateArr.length; k++ ){          
  //   console.log("dateArr =" + this.dateArr[k]);
  //  }
  this.valArr = []; 
   for(var i=1;i< this.bmArray.length; i=i+2 ){            
    this.valArr.push(this.bmArray[i]);
   }
  //   for(var k=0 ;k < this.valArr.length; k++ ){           
  //   console.log("valArr =" + this.valArr[k]);
  //  }
   //console.log("valArray size ="+this.dateArr.length);
   for (let i = 0; i < 127 ; i++) {
       const point = {
            time : this.dateArr[i]/1000,                        // time=1333584000 ::
            value: this.valArr[i]                               // value = 27.71 :: 
       };
       ret.push(point);
   }
   return ret;
  }

  generatePriceChart() { 
    const startDate = new Date(this.start_Date);      
    const endDate = new Date(this.end_Date);
   const ret = [];
   const total = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
   this.dateArr1 = [];
   for(var i=0;i< this.priceArray.length; i=i+2 ){         
    this.dateArr1.push(this.priceArray[i]);
   }
  this.valArr1 = []; 
   for(var i=1;i< this.priceArray.length; i=i+2 ){            
    this.valArr1.push(this.priceArray[i]);
   }
   console.log("size of price array"+ this.priceArray.length);
   for (let i = 0; i < 127 ; i++) {
       const point = {
            time : this.dateArr1[i]/1000,                        // time=1333584000 ::
            value: this.valArr1[i]                               // value = 27.71 :: 
       };
       ret.push(point);
   }
   return ret;
  }

  retrieveBenchMarks() : any{
    return fetch(`assets/santosh.json`)
      .then((response) => response.json())
      .then((data) => {
        return this.getBMData(data);
    });
  } 

  retrievePerformance() : any{
    return fetch(`assets/santosh.json`)
      .then((response) => response.json())
      .then((data) => {
        return this.renderPerformanceGrid(data);
    });
  } 

}
