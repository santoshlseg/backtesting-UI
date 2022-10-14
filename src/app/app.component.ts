import { Component } from '@angular/core';
import sampleData from '../assets/data.json';

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
Users: any = sampleData;

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
display_Data :any = [];
data : any = [];

constructor(){}
  
ngOnInit(): void {  
    this.uploadJsonDatatoArray();
     
    //this.generateTable();     
    this.initializeDemo();
    this.renderResultGrid("Hello");
  }                    

  uploadJsonDatatoArray(): void {
    for(var i=0;i< 6;i++) {
      //console.log(this.getTime(i));
      //console.log(this.getValue(i));
      this.json_Data.push({ time: this.getTime(i),value : this.getValue(i)});
      //console.log("count="+this.json_Data.length);
    }
  }

  initializeDemo(): void {
    this.initializeLayoutEvent();
  }


  onSubmit() : void {    
    console.log("submit button has been clicked");
    // 1)Validate the User Input Date 
    var isProperDates :boolean = this.validateDate(this.fromDate,this.toDate);
    //console.log("Proper Dates =" + this.fromDate);
    //console.log("Proper Dates =" + this.toDate);
    //console.log("Proper Dates =" +isProperDates);
    
    // 2)Retrive the date range 
    if(isProperDates==true){
      this.calculateDateRangeForGraph(this.fromDate,this.toDate);
    }

    // 3)Chart generation code
    var n : any = document.getElementById("selectN") as any;
    //console.log(n.value);
    for(var i=0;i< n.value ;i++) {
      //console.log(this.getTime(i));
      //console.log(this.getValue(i));
      this.display_Data.push({ time: this.getTime(i),value : this.getValue(i)});
    }
      setTimeout(()=> this.displayMultipleChart(this.fromDate,this.toDate),1000);
      this.readJsonFile();  
  }

  initializeLayoutEvent(): void {
    const layout = document.getElementById('layout') as any;
    const toggleBtn = document.getElementById('toggleBtn') as any;
    toggleBtn.addEventListener('click', function() {
      layout.collapsed = !layout.collapsed;
      toggleBtn.setAttribute('icon', layout.collapsed ? 'leftpanel-closed' : 'leftpanel-open');
    });
  }
    
  getTime( j: number): any {
    var time = (this.Users[j]["time"]);
    return time;
} 

  getValue( j: number): any {
    var phone = (this.Users[j]["phone"]);
    return phone;
} 

  onSelectFromDate(){
    var temp_fromdate =document.getElementById("from-date") as any;
    this.fromDate=temp_fromdate.value;
    //console.log("Date from UI =" +this.fromDate);
  }

  onSelectToDate(){
    var temp_todate=document.getElementById("to-date") as any;
    this.toDate=temp_todate.value;
    //console.log("Date from UI= "+this.toDate);
  }

  validateDate(fromDate : string, toDate : string) : boolean{
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    var flag : boolean = false;
    if(startDate > endDate){
      alert("startDate date > end Date");
    }
    else if(startDate < endDate){ 
      //console.log("startDate date < end Date");
      flag=true;
    }
    else{
      console.log("Both dates are same");
    }
    //console.log(flag);
    return flag;
  }


  calculateDateRangeForGraph(fromDate : string, toDate : string) : any{
    //console.log("Inside calculateDateRangeForGraph");
    //console.log("fromDate" +fromDate);
    //console.log("toDate" +toDate);
    //console.log(this.json_Data.length);

    for(var i=0;i< this.json_Data.length ;i++){
      var temp : any = this.json_Data[i].time;
      if(temp >= fromDate && temp <= toDate){
        //console.log("temp date="+temp);
        //console.log("fromDate ="+fromDate);
        //console.log("toDate="+ toDate);
        this.display_Data.push(temp);
      }
      //console.log("Display data length= " + this.display_Data.length);
    }
    return this.display_Data;
  }


  renderResultGrid(instrument : string) {
      //alert("renderResultGrid");
      
      var fields = ['intCol', 'strCol', 'floatCol'];
      var grid = document.getElementById('grid') as any;
      grid.config = {
      sorting: {
      sortableColumns: true
      },
      columns: [
      { title: 'portfolio', field: fields[0], width: 70 },
      { title: 'Total Number of Observations', field: fields[1], minWidth: 55 },
      { title: 'Valid Observations', field: fields[2] },
      { title: 'Start Date', field: fields[3] },
      { title: 'End Date', field: fields[4] },
      { title: 'Frequency', field: fields[5], width: 60, },
      { title: 'Cumulative Return', field: fields[6] },
      { title: 'CAGR', field: fields[7] },
      { title: 'Annualized Volatility', field: fields[8] },
      { title: 'Information Ratio', field: fields[9] },
      { title: 't-stat', field: fields[10] },
      { title: 'Skewness', field: fields[11] },
      { title: 'Kurtosis', field: fields[12] },
      { title: 'Hit Ratio', field: fields[13] },
      { title: 'Maximum Drawdown', field: fields[14] },

    ],
    dataModel: { 
    fields: fields,
    data: [
      [1, 'Singapore', 5.50, 111 ],
      [2, 'HongKong', 7.00, 10],
      [3, 'Venice', 25.00, 100],
      [4, 'Sri Lanka', 20.00, 222],
      [5, 'Malaysia', 5.75, 333]
    ]
     } };
}


generateChart(from: string, to: string) {            
  let initVal = 20;
  const startDate = new Date(from);
  const endDate = new Date(to);
  //console.log("startDate generateChart=="+ startDate);
  //console.log("endDate generateChart=="+ endDate);
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
     console.log("Multiple Chart value of selectN " + selectN.value);

    multiplechart.config = {
      options: {
        priceScale: {
          mode: 2
        },
      },  
      series: [
        {
          symbol: 'GOOGL.O',
          type: 'line',
          //data : this.display_Data
          //data : this.generateChart('2020-09-08', '2022-09-10')
          data : this.generateChart(startDt, endDt)
        },
        {
          symbol: 'AMZN.OQ',
          type: 'line',
          data: this.generateChart(startDt, endDt)
        },
        {
          symbol: 'WALMART.OQ',
          type: 'line',
          data: this.generateChart(startDt, endDt)
        },
        {
          symbol: 'DISNEY.OQ',
          type: 'line',
          data: this.generateChart(startDt, endDt)
        }
      ]
    }
  }

  // which takes n as input 

  sizeofLoop(sizeN : number ){
    // Data of series will come here and ietrate as per value of n 






  }




   readJsonFile() :  any{
    console.log("Inside readJson method :");
    this.loading = true;
    return fetch(`assets/performance.json`)
      .then((response) => response.json())
      .then((data) => {
        this.loading = false;
        console.log("Json data :"+ data.time);
        console.log("Json data :"+ data.phone);
        console.log("Json data :"+ data.size);
        return data;
      });
  }

}
