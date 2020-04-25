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
    return {
    	run: run
    };
    
});
