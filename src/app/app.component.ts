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

fromDate : any;
toDate : any;
json_Data : any = [];
display_Data :any = [];
data : any = [];

constructor(){}
  
ngOnInit(): void {  
    this.uploadJsonDatatoArray();
    this.renderResultGrid("Hello");            
  this.initializeDemo();
  }                    // end of ngOnInit   


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
    //console.log("submit button has been clicked");
    
    // 1) validate the date
    var isProperDates :boolean = this.validateDate(this.fromDate,this.toDate);
    //console.log("Proper Dates =" +isProperDates);
    
    // 2)call the validatedate and retrive the date range 
    if(isProperDates==true){
      this.calculateDateRangeForGraph(this.fromDate,this.toDate);
    }

    // 3)Graph generation will take place here

    

  }

  initializeLayoutEvent(): void {
    const layout = document.getElementById('layout') as any;
    const toggleBtn = document.getElementById('toggleBtn') as any;
    toggleBtn.addEventListener('click', function() {
      layout.collapsed = !layout.collapsed;
      toggleBtn.setAttribute('icon', layout.collapsed ? 'leftpanel-closed' : 'leftpanel-open');
    });
  }

onSelect(){
    var n : any =document.getElementById("selectN") as any;
    //console.log(n.value);

    for(var i=0;i< n.value ;i++) {
      //console.log(this.getTime(i));
      //console.log(this.getValue(i));
      this.display_Data.push({ time: this.getTime(i),value : this.getValue(i)});
    }
      setTimeout(()=> this.displayMultipleChart(),1000);
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
      console.log("startDate date > end Date");
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
    console.log("Inside calculateDateRangeForGraph");
    //console.log(fromDate);
    //console.log(toDate);
    console.log(this.json_Data.length);

    for(var i=0;i< this.json_Data.length ;i++){
      var temp : any = this.json_Data[i].time;

      if(temp >= fromDate && temp <= toDate){
        console.log("temp date="+temp);
        //console.log("fromDate ="+fromDate);
        //console.log("toDate="+ toDate);
        this.display_Data.push(temp);
      }
      console.log("Display data length= " + this.display_Data.length);
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
      { title: 'Frequency', field: fields[2] },
      { title: 'Cumulative Return', field: fields[2] },
      { title: 'CAGR', field: fields[2] },
      { title: 'Annualized Volatility', field: fields[2] },
      { title: 'Information Ratio', field: fields[2] },
      { title: 't-stat', field: fields[2] },
      { title: 'Skewness', field: fields[2] },
      { title: 'Kurtosis', field: fields[2] },
      { title: 'Hit Ratio', field: fields[2] },
      { title: 'Maximum Drawdown', field: fields[2] },

    ],
    dataModel: { 
    fields: fields,
    data: [
      [1, 'Singapore', 5.50],
      [2, 'HongKong', 7.00],
      [3, 'Venice', 25.00],
      [4, 'Sri Lanka', 20.00],
      [5, 'Malaysia', 5.75]
    ]
  }
};
  }

     
displayMultipleChart(): void {
    const multiplechart = document.getElementById("multiple") as any;
    multiplechart.config = {
      options: {
        priceScale: {
          mode: 2
        }
      },  
      series: [
        {
          symbol: 'GOOGL.O',
          type: 'line',
          data : this.display_Data
        },
        {
          symbol: 'AMZN.OQ',
          type: 'line',
          data : this.display_Data
        },
        {
          symbol: 'WALMART.OQ',
          type: 'line',
          data : this.display_Data
        }
      ]
    }
  }

}


