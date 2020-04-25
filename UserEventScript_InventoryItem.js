/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['./Script_Module'],

function(module) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	module.run(scriptContext);
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
    	
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

    	var _record = scriptContext.newRecord;
    	log.debug({title: 'beforeSubmit - newRecord', details: _record});
    	
    	var _oldRecord = scriptContext.oldRecord;
    	log.debug({title: 'beforeSubmit - oldRecord', details: _oldRecord});
    	
    	
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
    	
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
    	
    	var _record = scriptContext.newRecord;
    	log.debug({title: 'afterSubmit - newRecord', details: _record});
    	
    	var _oldRecord = scriptContext.oldRecord;
    	log.debug({title: 'afterSubmit - oldRecord', details: _oldRecord});
    	
    	
    	
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
