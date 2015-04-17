describe("UserData", function() {
  var data;
  var mortgageCalc;

  beforeEach(function() { 
    data = new UserData();
    mortgageCalc = new MortgageCalc(
      $("#lineChart").get(0).getContext("2d"),
      data
    );
    mortgagePlaceHolder = (function(){
      function updatePieChart(){return;}
      function definePieChart(){return;}
      return {
        updatePieChart: updatePieChart,
        definePieChart: definePieChart
      }
    })();
  }); 

  describe("#get", function(){
    it("should return the default value if no number is provided", function(){
      data.set("intRate", "test");
      expect(data.get("intRate")).toEqual(4);
    });
  });

  describe("#isNumeric", function(){
    describe("when the value is not a number", function(){
      it("should return false", function(){
        expect(data.isNumeric("test")).not.toBe(true);
      });
    });
    describe("when the value is a number", function(){
      it("should return true", function(){
        expect(data.isNumeric(4)).toBe(true);
      });
    })
  });
});


//MortgageCalc class
describe("MortgageCalc", function() {
  var data;
  var mortgageCalc;

  beforeEach(function() { 
    data = new UserData();
    mortgageCalc = new MortgageCalc(
      $("#lineChart").get(0).getContext("2d"),
      data
    );
  }); 

  describe("#defineLineChart", function(){
    it("should call generateLineChart", function(){
      spyOn(mortgageCalc, "generateLineChart");
      spyOn(_, "each").and.callFake(function(){
        return;
      });
      mortgageCalc.defineLineChart();
      expect(mortgageCalc.generateLineChart).toHaveBeenCalled();
    });
  });

  describe("#getLineChartData", function(){
    beforeEach(function(){
      data.set("mortgageAmount", 200000);
      data.set("intRate", 4);
      spyOn(data, "getPrincipalInterest").and.returnValue(1295);
    });

    // it("should validate with preset data sets", function(){
    //   var dataTest = [
    //     {}
    //   ];
    //   expect(mortgageCalc.getLineChartData()).toEqual(dataTest);
    // });
  });
}); 

describe("Form Methods", function() {
  var data;
  var mortgageCalc;

  beforeEach(function() { 
    data = new UserData();
    mortgageCalc = new MortgageCalc(
      $("#lineChart").get(0).getContext("2d"),
      data
    );
  });


  describe("#fillValues", function(){
    var userData;
    var defaults;
    beforeEach(function() {
      userData = new UserData();
      spyOn(userData, 'set');
      defaults = {
        "interest" : '4',
        "annualIncome" : '50000',
        "monthlyPayment" : '1500',
        "downPayment" : '10000',
        "propertyTaxes" : '1.2',
        "homeInsurance" : '800',
        "hoaFees" : '0',
        "monthlyDebt" : '0',
        "loanTerm" : '360'
      };
    });
  });

  // describe("#resetFormValues", function(){
  //   beforeEach(function(){
  //     document.debtcalc.interest.value = "test";
  //   });
  //   it("should reset the value of interest to be the default", function(){
  //     resetFormValues(data);
  //     expect(document.debtcalc.interest.value).toEqual('4');
  //   });
  //   it("should show the alert text", function(){
  //     expect($('#alertText').hasClass('hidden')).toBe(false);
  //   });
  // });

  describe("#moneyFormat", function(){
    describe("when we have a full number", function(){
      it("should return a formatted string", function(){
        var testValue = 1234567;
        expect(moneyFormat(testValue)).toEqual("$1,234,567");
      });
    });
    describe("when we have a negative number", function(){
      it("should return 0", function(){
        var testValue = -123;
        expect(moneyFormat(testValue)).toEqual("$0");
      });
    });
  });
});

