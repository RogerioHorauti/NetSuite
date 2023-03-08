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
	
	function evenRoundAvatax(num, decimalPlaces) {
	    var d = decimalPlaces || 0;
	    var m = Math.pow(10, d);
	    var n = +(d ? num * m : num).toFixed(8); // Avoid rounding errors
	    var i = Math.floor(n), f = n - i;
	    var e = 1e-8; // Allow for rounding errors in f
	    var r = (f > 0.5 - e && f < 0.5 + e) ?
			((i % 2 == 0) ? i : i + 1) : Math.round(n);
	    return d ? r / m : r;
	}
	
    return {
    	run: run
    };
    
});
