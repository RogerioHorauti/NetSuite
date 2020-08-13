define([],

function() {
	function run(scriptContext) {
		
		var _type = scriptContext.type;

    	switch (_type) {
			case 'create':
				log.debug({title: 'afterSubmit - type', details: 'Create'});
				break;
				
			case 'edit':
				log.debug({title: 'afterSubmit - type', details: 'Edit'});
				break;
				
			case 'view':
				log.debug({title: 'afterSubmit - type', details: 'View'});
				break;
			
			case 'delete':
				log.debug({title: 'afterSubmit - type', details: 'Delete'});
				break;
	
			default:
				break;
		}
    	
    	var _form = scriptContext.form;
    	log.debug({title: 'beforeLoad - Form', details: _form});
    	
    	
    	_form.clientScriptModulePath = './ClientScript_InventoryItem.js';
    	
    	var _record = scriptContext.newRecord;
    	log.debug({title: 'beforeLoad - newRecord', details: _record});

    	_form.addButton({
    		id: 'custpage_test',
    		label: 'Test',
    		functionName: 'test("'+_record.id+'")'
    	});

    	log.debug({title: 'beforeLoad - Date()', details: new Date()});
    	
	}
	
	 function acceptPaymentForInvoice(invoiceRec, acceptPaymentInfoObj){

		var acceptPaymentType = '';
		switch(invoiceRec.type){
		    case 'vendorbill':
			acceptPaymentType = 'vendorpayment';
			break;
		    case 'invoice':
			acceptPaymentType = 'customerpayment';
			break;
		}

		var accptPayment = record.transform({
			fromType: invoiceRec.type, //record.Type.INVOICE,
			fromId: invoiceRec.id,
			toType: acceptPaymentType, //record.Type.CUSTOMER_PAYMENT,
			isDynamic: true
		});

		if (acceptPaymentInfoObj.balAccount){
		    accptPayment.setValue({
			fieldId: 'account',
			value: acceptPaymentInfoObj.balAccount    // conta do banco
		    });
		}

		accptPayment.setValue({
			fieldId: 'payment',
			value: acceptPaymentInfoObj.paymentAmount
        	});

        	accptPayment.setValue({
			fieldId: 'trandate',
			value: format.parse({value: acceptPaymentInfoObj.date, type: format.Type.DATE})
		});

		var foundLine = false;
		var lineCount = accptPayment.getLineCount('apply');
		for (var j = 0; j < lineCount && !foundLine; j++) {
			accptPayment.selectLine({
				sublistId: 'apply',
				line: j
			});

			var isApply = accptPayment.getCurrentSublistValue({
				sublistId: 'apply',
				fieldId: 'apply',
			});

			if (isApply == true) {
				accptPayment.setCurrentSublistValue({
					sublistId: 'apply',
					fieldId: 'amount',
					value: acceptPaymentInfoObj.paymentAmount
				});

				foundLine = true;
			}
		}

		var accptPaymentId = accptPayment.save();

		return accptPaymentId;
    	}
	
    return {
    	run: run
    };
    
});
