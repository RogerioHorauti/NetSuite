/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([
	'./AVLR_SuiteTax_Functions.js', 
	'N/record', 
	'N/runtime', 
	'N/https', 
	'N/search', 
	'./AVLR_CopyTransaction_CM.js',
	'./AVLR_UtilV3.js',
	'./AVLR_FromTo.js',
	'N/url'
],
/**
 * @param {runtime} runtime
 * @param {task} task
 */
function(AVLRFunctions, record, runtime, https, search, _copyTransaction, avlrUtil, fromTo, url) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) 
    {
    	try 
    	{
			var _newRecord = scriptContext.newRecord;
		
    		_copyTransaction.clearIntegrationStatus(scriptContext);
    		_copyTransaction.clearFiscalDocument(scriptContext);
    		
			// Remessa Bonificação
			//log.debug("record.type", _newRecord.type);

			if(_newRecord.type == "customsale_remessa_bon")
			{
				search.create({
					type: 'customrecord_enl_operationtype',
					filters: [["formulatext: {custrecord_enl_ot_transactiontype}","contains","Remessa Bonificação"]]    						
				}).run().each(function(result){
					
					//log.debug('mySalesOrderSearch', JSON.stringify(result));
					_newRecord.setValue({fieldId: 'custbody_enl_operationtypeid', value: result.id});
				});
			}
			else
			{
				// var _fiscalDocTypeId = _newRecord.getValue('custbody_enl_order_documenttype');
				// if(!_fiscalDocTypeId)
				// 	return;
				// //log.debug('fiscalDocType', _fiscalDocTypeId);
				
				// var _fieldsFiscDocType = search.lookupFields({
				// 			type: 'customrecord_enl_fiscaldocumenttype',
				// 			id: _fiscalDocTypeId,
				// 			columns: ['custrecord_enl_fdt_model']
				// 	});
							
				var _subsidiaryId = _newRecord.getValue('subsidiary');
				if(_subsidiaryId)
				{
					var _fieldsSubsidiary = search.lookupFields({
						type: 'subsidiary',
						id: _subsidiaryId,
						columns: ['custrecord_avlr_enalblent2020006']
					});
				}
				
				if(_newRecord.type == "invoice")
					AVLRFunctions.controlIntermediaryTransaction(scriptContext, _fieldsSubsidiary)
			}

    		
			AVLRFunctions.messageError(scriptContext);
			
		} 
    	catch (e) 
    	{
    		log.error('beforeLoad', JSON.stringify(e));
    		AVLRFunctions.messageError(scriptContext, JSON.stringify(e));
		}
    	
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
    function beforeSubmit(scriptContext) 
    {
    	try 
    	{
    		var begin = new Date().getTime();
    		var _newRecord = scriptContext.newRecord;
    		var scriptObj = runtime.getCurrentScript();
    		
			AVLRFunctions.setControlString(scriptContext);
    		var _randomString = _newRecord.getValue({fieldId: 'custbody_avlr_randomstring'});

    		log.debug('scriptContext.type', scriptContext.type);
    		if(scriptContext.type == 'approve' || scriptContext.type == 'delete')
    			return;
    			
    		var _void = _newRecord.getValue({fieldId: 'void'});
    		//log.debug('_void', _void);
    		
    		if(['Void', 'VoidVoid', 'VoidAnular'].indexOf(_void) > -1)
    		{
    			log.debug('Validate', _newRecord.type + ' Void');
    			return;
    		}
    		
			var operationTypeId = _newRecord.getValue('custbody_enl_operationtypeid');
    		if(!operationTypeId)
				return;

			var _documentTypeId = _newRecord.getValue({fieldId: 'custbody_enl_order_documenttype'});
			if(!_documentTypeId)
				return;
    		
			var _subsidiaryId = _newRecord.getValue({fieldId: 'subsidiary'});
    		if(!_subsidiaryId)
    			return;

			var _locationId = _newRecord.getValue({fieldId: 'location'});
    		if(!_locationId)
    			return;

    		var subsidiary = record.load({type: record.Type.SUBSIDIARY,	id: _subsidiaryId, isDynamic: true});
    		var _lockCalc = subsidiary.getValue({fieldId: 'custrecord_avlr_lock_calc'});
    		
			if(AVLRFunctions.naSoftwareFiscal(subsidiary, _newRecord))
				return
    			
    		if(AVLRFunctions.closedPostingperiod(_newRecord, _lockCalc))
				return
    		
    		var _documentType = search.lookupFields({
	    			type: 'customrecord_enl_fiscaldocumenttype', 
	    			id: _documentTypeId, 
	    			columns: ['custrecord_enl_issuereceiptdocument', 'custrecord_enl_sendtofiscal']
	    		});
    		
			var _sendToFiscal = _documentType.custrecord_enl_sendtofiscal;
			// log.debug('_sendToFiscal', _sendToFiscal);
			if(!AVLRFunctions.sendToFiscal(_newRecord, _sendToFiscal))
				return;
				
			var _issueNote = _documentType.custrecord_enl_issuereceiptdocument;
			if(!AVLRFunctions.doCalculate(_newRecord, _lockCalc, _issueNote))
				return;
			
			AVLRFunctions.setApprovalstatus(_newRecord);
    		
    		
    		
    		var lang = runtime.getCurrentUser().getPreference ({name: 'LANGUAGE'});
			//log.debug('LANGUAGE', lang);
    		
    		var sessionObj = runtime.getCurrentSession(); //sessionObj is a runtime.Session object

//    		log.debug('beforeSubmit - executionContext', runtime.executionContext);
//    		if(runtime.executionContext == "SUITELET")
//    			return;
    			
    		
			var getResult = avlrUtil.getHeaderRequest(subsidiary);
			//log.debug('getResult', JSON.stringify(getResult));
			
			var baseURL = avlrUtil.getBaseURL(subsidiary);
			var url = baseURL + '/v3/calculations';
			url = url.substr(0, 8).concat(url.substr(8).replace('//', '/'));
			log.debug('url', url);
			
			// Object input -----------------------------------------------------------------------------------------------------------------------------------------
			var input = {};
			
			// Remessa Bonificação
			if(['invoice','salesorder','estimate', 'returnauthorization','creditmemo','customsale_remessa_bon'].indexOf(_newRecord.type) > -1)
			{
				input.entity = _newRecord.getValue('entity');
				if(!input.entity)
					return;
				
				input.entityType = 'customer';
			}
			else if(['transferorder'].indexOf(_newRecord.type) > -1)
			{
				input.entity = _newRecord.getValue('transferlocation');
				if(!input.entity)
					return;
				
				input.entityType = 'location';
			}
			else		
			{
				input.entity = _newRecord.getValue('entity');
				if(!input.entity)
					return;
				
				input.entityType = 'vendor';
			}
			
			input.location = _newRecord.getValue('location');
			if(!input.location)
				return;

			input.getAdditionalFieldValue = function(fieldid, transactionLoad){
					return transactionLoad.getValue(fieldid);}
			
			input.billToAddress = function(transactionLoad){
				return transactionLoad.getSubrecord('billingaddress');}
			
			input.lines = [];
			var numlinesItenm = _newRecord.getLineCount({sublistId: 'item'});
			for (var int = 0; int < numlinesItenm; int++) 
			{
				var _objItem = {};
				
				_objItem.itemId = _newRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: int});
				_objItem.itemRecordType = fromTo.getItemType(_newRecord.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: int}));
				
				_objItem.getAdditionalFieldValue = function(fieldid, transactionLoad, int){
						return transactionLoad.getSublistValue({sublistId: 'item', fieldId: fieldid, line: int});}
				
				input.lines.push(_objItem);
			}
			// Object input -----------------------------------------------------------------------------------------------------------------------------------------
			
			var request = AVLRFunctions.getJsonRequest(input, subsidiary, _newRecord);
			log.debug('beforeSubmit - request', request);
			
			sessionObj.set({name: 'calcrequest'+_randomString, value: JSON.stringify(request)});
			
			var response = https.post({ url: url, headers: getResult.header, body: JSON.stringify(request) });
			log.debug('beforeSubmit - response.code', response.code);
			
			log.debug('beforeSubmit - response', response.body);
			var codeResponse = response.code;
			
			if(codeResponse != 200)
			{
				response = JSON.parse(response.body);
				
				var _message = AVLRFunctions.getMessageError(response, null, _newRecord) ;
				sessionObj.set({name: 'errorresponse'+_randomString ,value: "MENSAGEM SW FISCAL : "+JSON.stringify(_message)});
			}
			else
			{
				AVLRFunctions.setResponseInformation(response.body, _newRecord, subsidiary);

				if(lang == 'pt_BR')
					var _message = 'Impostos calculados com sucesso</br>'
				else
					var _message = 'Taxes calculated successfully</br>'
					
				sessionObj.set({name: 'sucessponse'+_randomString ,value: _message});
				sessionObj.set({name: 'calcresponse'+_randomString ,value: response.body});
			}
			
			log.audit('Duration in minuts', avlrUtil.millisToMinutesAndSeconds(new Date().getTime() - begin));
			log.debug('beforeSubmit', 'Remaining governance units : ' + scriptObj.getRemainingUsage());
			
		} 
    	catch (e) 
    	{
    		if(!sessionObj)
    			var sessionObj = runtime.getCurrentSession(); //sessionObj is a runtime.Session object
    		
    		sessionObj.set({name: 'calcresponse'+_randomString ,value: ''});
    		sessionObj.set({name: 'sucessponse'+_randomString ,value: ''});
    		sessionObj.set({name: 'errorresponse'+_randomString ,value: "MENSAGEM NETSUITE : "+JSON.stringify(e)});
    		
    		log.error('beforeSubmit', JSON.stringify(e));
		}
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
    function afterSubmit(scriptContext) 
    {
    	try 
    	{
    		if(scriptContext.type == 'approve')
    			return;
    		
    		var sessionObj = runtime.getCurrentSession(); //sessionObj is a runtime.Session object
    		var _randomString = scriptContext.newRecord.getValue({fieldId: 'custbody_avlr_randomstring'});
    		
//    		log.debug('afterSubmit - executionContext', runtime.executionContext);
//    		if(runtime.executionContext == "SUITELET")
//    			return;
    		
    		AVLRFunctions.saveJsonInFile(scriptContext);
    		sessionObj.set({name: 'calcresponse'+_randomString, value: ''});
		} 
    	catch (e) 
    	{
    		sessionObj.set({name: 'calcrequest'+_randomString ,value: ''});
    		sessionObj.set({name: 'calcresponse'+_randomString ,value: ''});
    		sessionObj.set({name: 'errorresponse'+_randomString ,value: "MENSAGEM NETSUITE : "+JSON.stringify(e)});
    		
    		log.error('afterSubmit', JSON.stringify(e));
		}
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
