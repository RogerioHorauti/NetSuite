/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */

define([],

function() {
   
    return function (amount, decimalPlates) {
        if (!amount)
            return 0;
            
        if (decimalPlates < 0 || decimalPlates == undefined || decimalPlates == null)
            decimalPlates = 2;

        var amountRounded = Number(Math.round(amount+'e'+decimalPlates)+'e-'+decimalPlates)

        return amountRounded;
	}
    
});
