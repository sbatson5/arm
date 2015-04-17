//Our user data class
var UserData = (function(){
  var constructor = function(){
    this.defaults = {
      "mortgageAmount" : 200000,
      "intRate" : 4
    };
    this.data = _.clone(this.defaults);
  };
//set data
  constructor.prototype = {
    set: function(key, value) {
      this.data[key] = this.isNumeric(value) ? value : this.defaults[key];
    },
    get: function(key) {
      return this.data[key];
    },
    //is this a number?
    isNumeric: function(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    },
  }
  return constructor;
})();

var MortgageCalc = (function() {
  var constructor = function(lineChart, userData) {
    this.lineChart = lineChart;
    this.userData = userData;
  };

  constructor.prototype = {
    generateLineChart: function(data, options){
      this.lineChart = new Chart(this.lineChart).Line(data, options);
    },
    updateUserData: function(userData){
      this.userData = userData;
    },

    defineLineChart: function(){
      var options = {
          //Boolean - Whether to fill the dataset with a colour
          datasetFill : true,
          animationSteps: 1
      };
      var data = {
        labels:[],
        datasets: [
          {
            label: "Conservative",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: []
          },
          {
            label: "Standard",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: []
          },
          {
            label: "Aggressive",
            fillColor: "rgba(175,235,139,0.2)",
            strokeColor: "rgba(175,235,139,1)",
            pointColor: "rgba(175,235,139,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(175,235,139,1)",
            data: []
          }
        ]
      }
      
      this.generateLineChart(data, options);

      var self = this;
      //for each item in our Line Chart Data, update our line chart object
      _.each(this.getLineChartData(), function(row){
        self.lineChart.addData([row.conservativePayment, row.standardPayment, row.aggressivePayment], row.year);
      });
    },
    getLineChartData: function(){
      var lineChartData = [];
      var mortgage = this.userData.get("mortgageAmount");
      var intRateMonthly = parseFloat(this.userData.get("intRate"))/100/12;
      var intRateCap = (parseFloat(this.userData.get("intRate")) + 5)/100/12;
      var intRateFloor = (parseFloat(this.userData.get("intRate")) - 2)/100/12;
      var conservativeRate = this.userData.get("intRate")/100/12;
      var standardRate = this.userData.get("intRate")/100/12;
      var aggressiveRate = this.userData.get("intRate")/100/12;

      for(i = 0; i < 30; i++) {
        if(i == 5) {
          //we generate 3 different interest rates to show conservative vs. standard vs. aggressive
          conservativeRate = this.getEstimate(intRateMonthly, intRateFloor, intRateCap, 0.93, 1.07);
          standardRate = this.getEstimate(intRateMonthly, intRateFloor, intRateCap, 0.97, 1.11);
          aggressiveRate = this.getEstimate(intRateMonthly, intRateFloor, intRateCap, 0.98, 1.13);
        } else if (i > 5) {
          conservativeRate = this.getEstimate(conservativeRate, intRateFloor, intRateCap, 0.93, 1.05);
          standardRate = this.getEstimate(standardRate, intRateFloor, intRateCap, 0.95, 1.08);
          aggressiveRate = this.getEstimate(aggressiveRate, intRateFloor, intRateCap, 0.98, 1.1);
        }
        var conservPow = Math.pow((1 + conservativeRate), 360);
        var standPow = Math.pow((1 + standardRate), 360);
        var aggressPow = Math.pow((1 + aggressiveRate), 360);
        var conservativePayment = (this.userData.get("mortgageAmount") * (conservativeRate * conservPow)) / (conservPow - 1);
        var standardPayment = (this.userData.get("mortgageAmount") * (standardRate * standPow)) / (standPow - 1);
        var aggressivePayment = (this.userData.get("mortgageAmount") * (aggressiveRate * aggressPow)) / (aggressPow - 1);

        
        lineChartData.push({
          conservativePayment : Math.floor(conservativePayment),
          standardPayment : Math.floor(standardPayment),
          aggressivePayment : Math.floor(aggressivePayment),
          year : "Year "+ (i + 1)
        });
        
      } //end for
      return lineChartData;
    },
    updateLineChart: function(){
      this.lineChart.options.animationSteps = 30;
      row = this.getLineChartData();
      for(i=0; i < row.length; i++){
        this.lineChart.datasets[0].points[i].value = row[i].conservativePayment;
        this.lineChart.datasets[1].points[i].value = row[i].standardPayment;
        this.lineChart.datasets[2].points[i].value = row[i].aggressivePayment;
        this.lineChart.update();
      }
    },
    getEstimate: function(intRate, floor, ceiling, min, max){
      intRate *= _.random(min, max);
      if(intRate > ceiling) {
        intRate = ceiling;
      } else if(intRate < floor) {
        intRate = floor;
      }
      return intRate;
    }
  }
  return constructor;
})();

//our initialization
//set some default values and match those values to our user data
function initialize(userData, mc) {
  mc.defineLineChart();
}

//set our values to string and add commas and a dollar sign
function moneyFormat(s) {
  s = String(Math.floor(s));
  //reset to 0 if the number is negative
  if(s.indexOf("-") == 0) {
    s = "$0";    
  }
  else {
    for (var i = s.length - 3; i > 0; i -= 3) {
      s = s.slice(0, i) + ',' + s.slice(i);      
    }
    s = "$" + s;
  }
return s;
}

function resetFormValues(userData) {
  var alertText = false;
  if(!userData.isNumeric(document.armCalc.intRate.value)) {
    document.armCalc.intRate.value = 4;
    alertText = true; 
  }
  if(!userData.isNumeric(document.armCalc.mortgageAmount.value)){
    document.armCalc.mortgageAmount.value = 200000; 
    alertText = true;    
  }
  //add the alert text to the bottom of our form
  if(alertText) {
    $('#alertText').removeClass('hidden');
  }
  else {
    $('#alertText').addClass('hidden');
  }
}

//once our page is loaded
$(document).ready(function() {
  //our user's data
  var userData = new UserData();
  //instantiate our mortgage calculator
  var mc = new MortgageCalc(
    $("#lineChart").get(0).getContext("2d"),
    userData
  );
  initialize(userData, mc);

  $(":input").blur(function(){
    //only update our chart if there is actually a change
    if($('#points').val() != userData.get("mortgageAmount") || $('#intRate').val() != userData.get("intRate"))
    {
      userData.set("mortgageAmount", $('#points').val());
      userData.set("intRate", $('#intRate').val());
      mc.updateUserData(userData);
      mc.updateLineChart();
      mc.getLineChartData();
      resetFormValues(userData);
    } 
  });
});


/* TODO

A 5/1 ARM has fixed rate for 5 years and will then adjust every 1 years
5/2/5 cap structure will see an adjustment of at most 5% for the first year, 2% each year and a lifetime cap of no more than 5%

*/



