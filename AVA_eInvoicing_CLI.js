/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/ui/message', 'N/currentRecord', 'N/url', 'N/format', 'N/search'],

function(runtime, message, currentRecord, url, format, search) 
{
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
	const duration = 6000;
	
    function pageInit(scriptContext) 
    {
    	if (window.onbeforeunload)
		{
			window.onbeforeunload=function() { null;};
		}
    }

    function saveRecord(scriptContext) 
    {
		var record = currentRecord.get();
		var fiscalDocStatus = record.getValue({fieldId: 'ava_status'});
		var subListCount = record.getLineCount({sublistId: 'recordslist' });
    	
		var checkedFlag = false;
		var selectedRecords = [];
		for(var i=0; i < subListCount; i++)
    	{
			var sublistRecId = record.getSublistValue({
			    sublistId: 'recordslist',
			    fieldId: 'tranid',
			    line: i
			});
			
			var sublistTranType = record.getSublistValue({
			    sublistId: 'recordslist',
			    fieldId: 'trantype1',
			    line: i
			});
			
			var sublistFieldValue = record.getSublistValue({
			    sublistId: 'recordslist',
			    fieldId: 'selectedtran',
			    line: i
			});

			var sublistCrRef = record.getSublistValue({
			    sublistId: 'recordslist',
			    fieldId: 'crref',
			    line: i
			});

			if(sublistFieldValue == true)
			{
				// var obj = {};
				// obj.recordType = sublistTranType;
				// obj.id = sublistRecId;
				// obj.crRef = (sublistCrRef != null && sublistCrRef != '') ? sublistCrRef : 0;
				selectedRecords.push(String(sublistRecId));
				checkedFlag = true;
			}
    	}
		
		if(checkedFlag == false)
		{
			var lang = runtime.getCurrentUser().getPreference ({name: 'LANGUAGE'});;
			log.debug('LANGUAGE', lang);
			
			if(lang == 'pt_BR')
    		{
				var title = 'AVISO'
				var msg = 'Nenhum registro foi selecionado para processar.';
    		}
			else
			{
				var msg = 'No records have been selected for processing.';
				var title = 'WARNING';
			}
			
			var myMsg = message.create({
					title: title,
					message: msg,
					type: message.Type.WARNING
				});
			
			myMsg.show({duration : duration});
			
			return false;
		}
		else
		{
			record.setValue({
    			fieldId: 'selectedrecords',
    			value: JSON.stringify(selectedRecords)
    			});
		}
		
		// var statusScript = getStatusScript();
		// if(statusScript.length)
		// {
		// 	if(lang == 'pt_BR')
		// 		var msgExecution = "Já existe um processo do eInvoice em execução.";
		// 	else
		// 		var msgExecution = "There is already an eInvoice process running.";
			
		// 	var myMsg = message.create({
		// 		title: title,
		// 		message: msgExecution,
		// 		type: message.Type.WARNING
		// 	});
		
		// 	myMsg.show({duration : duration});
			
		// 	return false;
		// }
		
		return true;
    }

    function fetchRecords(scriptContext)
    {
    	try
    	{
			//var scriptObj = runtime.getCurrentScript();
			var sessionObj = runtime.getCurrentSession(); //sessionObj is a runtime.Session object
        	var userObj = runtime.getCurrentUser();
    		var lang = runtime.getCurrentUser().getPreference ({name: 'LANGUAGE'});;
			console.log('LANGUAGE : ' + lang);
			
			//var deploymentId = sessionObj.get({name: 'eInvoicingDashBoard'+userObj.id});
			//console.log('deploymentId : ' + deploymentId);

    		var record = currentRecord.get();
    		var ava_subsidiary = record.getValue({fieldId: 'ava_subsidiary'});
    		var ava_location = record.getValue({fieldId: 'ava_location'});
    		var ava_trantype = record.getValue({fieldId: 'ava_trantype'});
			var ava_trantype = record.getValue({fieldId: 'ava_trantype'});
			var deploymentId = record.getValue({fieldId: 'deploymentid'});

    		var fromDate = record.getValue({fieldId: 'fromdate'});
    		if(!isNullOrEmpty(fromDate)) 
				fromDate = format.format({value: fromDate, type: format.Type.DATE});
    		
    		var toDate = record.getValue({fieldId: 'todate'});
    		if(!isNullOrEmpty(toDate)) 
				toDate = format.format({value: toDate, type: format.Type.DATE});
    		
    		
    		if(!isNullOrEmpty(fromDate) && !isNullOrEmpty(toDate))
    		{
        		if(toDate < fromDate)
        		{
        			//dialog.alert({'title': 'Error', 'message': 'Invalid Date range. To Date should be greater or equal to From Date'});
        			
        			if(lang == 'pt_BR')
            		{
        				var title = 'AVISO'
        				var msg = 'Intervalo de datas inválido. Fim da data deve ser maior ou igual a partir da data ';
            		}
        			else
        			{
        				var msg = 'Invalid Date range. To Date should be greater or equal to From Date.';
        				var title = 'WARNING';
        			}
        			
        			var myMsg = message.create({
        					title: title,
        					message: msg,
        					type: message.Type.WARNING
        				});
        			
        			myMsg.show({duration : duration});
        			
        			return false;
        		}
    		}

    		var ava_tranid = record.getValue({fieldId: 'ava_tranid'});
    		var ava_status = record.getValue({fieldId: 'ava_status'});
    		var ava_operationtype = record.getValue({fieldId: 'ava_operationtype'});
    		var ava_fiscaldocno = record.getValue({fieldId: 'ava_fiscaldocno'});
    		var ava_fiscaldoctype = record.getValue({fieldId: 'ava_fiscaldoctype'});
    		var ava_accesskey = record.getValue({fieldId: 'ava_accesskey'});
    		var randomstring = record.getValue({fieldId: 'randomstring'});
    		
    		if(deploymentId == 'customdeploy_ava_einvoice_dashboard' && isNullOrEmpty(ava_subsidiary))
    		{
    			//dialog.alert({'title': 'Error', 'message': 'Please select/enter mandatory field(s)'});
    			
    			if(lang == 'pt_BR')
        		{
    				var title = 'AVISO'
    				var msg = 'Por favor preencha os campos obrigatórios.';
        		}
    			else
    			{
    				var msg = 'Please select/enter mandatory field(s)';
    				var title = 'WARNING';
    			}
    			
    			var myMsg = message.create({title: title,message: msg,type: message.Type.WARNING});
					myMsg.show({duration : duration});
    			
    			return false;
    		}
    		
            var output = url.resolveScript({
					scriptId: 'customscript_ava_einvoice_dashboard', 
					deploymentId: deploymentId
            	});

				
            if(ava_subsidiary) 
				output += '&avasub=' + encodeURIComponent(ava_subsidiary);
            if(ava_location) 
				output += '&avalocation=' + encodeURIComponent(ava_location);
            if(ava_status) 
				output += '&status=' + ava_status;
            if(ava_trantype && ava_trantype != 0) 
				output += '&trantype=' + ava_trantype;
            if(fromDate) 
				output += '&fromdate=' + fromDate;
            if(toDate) 
				output += '&todate=' + toDate;
            if(ava_fiscaldocno) 
				output += '&notafiscalno=' + ava_fiscaldocno;
            if(record.getText({fieldId: 'ava_fiscaldoctype'})) 
				output += '&notadoctype=' + ava_fiscaldoctype;
            if(record.getText({fieldId: 'ava_operationtype'})) 
				output += '&optype=' + ava_operationtype;
            if(ava_accesskey) 
				output += '&accesskey=' + ava_accesskey;
            if(ava_tranid) 
				output += '&tranid=' + ava_tranid;
			if(randomstring) 
				output += '&randomstring=' + randomstring;

            window.location = output;
    	}
    	catch(errorMessage)
    	{
			log.debug('errorMessage', errorMessage.message);
			//dialog.alert({'title': 'Error', 'message': errorMessage.message});
			
			var myMsg = message.create({
				title: 'ERROR',
				message: errorMessage.message,
				type: message.Type.ERROR
			});
		
			myMsg.show({duration : duration});
    	}
    }
    
    function formReset(scriptContext)
    {
    	try
    	{
			var record = currentRecord.get();
			var deploymentId = record.getValue({fieldId: 'deploymentid'});

    		window.location = url.resolveScript({
					scriptId: 'customscript_ava_einvoice_dashboard', 
					deploymentId: deploymentId
            	});
	
    	}
    	catch(errorMessage)
    	{
    		log.debug('errorMessage', errorMessage.message);
			//dialog.alert({'title': 'Error', 'message': errorMessage.message});
			
			var myMsg = message.create({
				title: 'ERROR',
				message: errorMessage.message,
				type: message.Type.ERROR
			});
		
			myMsg.show({duration : duration});
    	}
    }
    	
	function isNullOrEmpty(value)
	{
	  	if(value == null || value == "")
	      	return true;

	  	return false;
	}

    function markAll(scriptContext)
    {
		var record = currentRecord.get();
		var fiscalStatus = record.getValue({fieldId: 'ava_status'});
		var subListCount = record.getLineCount({sublistId: 'recordslist' });

    	for(var i=0; i < subListCount; i++)
    	{
    		var record = record.selectLine({
    		    sublistId: 'recordslist',
    		    line: i
    		});
    		
    		record.setCurrentSublistValue({
    		    sublistId: 'recordslist',
    		    fieldId: 'selectedtran',
    		    value: true,
    		    ignoreFieldChange: true
    		});
    		
    		record.commitLine({
    		    sublistId: 'recordslist'
    		});
    	}
    }
    	
    function unMarkAll(scriptContext)
    {
		var record = currentRecord.get();
		var fiscalStatus = record.getValue({fieldId: 'ava_status'});
		var subListCount = record.getLineCount({sublistId: 'recordslist' });

    	for(var i=0; i < subListCount; i++)
    	{
    		var record = record.selectLine({
    		    sublistId: 'recordslist',
    		    line: i
    		});
    		
    		record.setCurrentSublistValue({
    		    sublistId: 'recordslist',
    		    fieldId: 'selectedtran',
    		    value: false,
    		    ignoreFieldChange: true
    		});
    		
    		record.commitLine({
    		    sublistId: 'recordslist'
    		});
    	}
    }
    
    function formReset1()
    {
    	try
    	{
    		window.location = url.resolveScript({
					scriptId: 'customscript_ava_dashboard_requests', 
					deploymentId: 'customdeploy_ava_dashboard_requests'
            	});
	
    	}
    	catch(errorMessage)
    	{
    		log.debug('errorMessage', errorMessage.message);
			//dialog.alert({'title': 'Error', 'message': errorMessage.message});
    		
    		var myMsg = message.create({
				title: 'ERROR',
				message: errorMessage.message,
				type: message.Type.ERROR
			});
		
			myMsg.show({duration : duration});
    	}
    }
    
    function formRefresh()
    {
    	try
    	{
    		var record = currentRecord.get();
    		var ava_status = record.getValue({fieldId: 'ava_status'});
    		var requestedBy = record.getValue({fieldId: 'requestedby'});

    		var daterequested = record.getValue({fieldId: 'daterequested'});
    		if(!isNullOrEmpty(daterequested)) daterequested = format.format({value: daterequested, type: format.Type.DATE});

			var randomstring = record.getValue({fieldId: 'randomstring'});
			var _deploymentid = record.getValue({fieldId: 'deploymentid'});

            var output = url.resolveScript({
					scriptId: 'customscript_ava_dashboard_requests', 
					deploymentId: 'customdeploy_ava_dashboard_requests'
            	});

            if(!isNullOrEmpty(ava_status) && ava_status != 0) output += '&status=' + ava_status;
            if(!isNullOrEmpty(requestedBy)) output += '&reqby=' + requestedBy;
            if(!isNullOrEmpty(daterequested)) output += '&datereq=' + daterequested;
			if(!isNullOrEmpty(randomstring)) output += '&randomstring=' + randomstring;
			if(!isNullOrEmpty(_deploymentid)) output += '&deploymentid=' + _deploymentid;

            window.location = output;
    	}
    	catch(errorMessage)
    	{
			log.debug('errorMessage', errorMessage.message);
			//dialog.alert({'title': 'Error', 'message': errorMessage.message});
			
			var myMsg = message.create({
				title: 'ERROR',
				message: errorMessage.message,
				type: message.Type.ERROR
			});
		
			myMsg.show({duration : duration});
    	}
    }
    
    function backToDash()
    {
    	try
    	{
			var record = currentRecord.get();
			var _deploymentid = record.getValue({fieldId: 'deploymentid'});
			var randomstring = record.getValue({fieldId: 'randomstring'});

            var output = url.resolveScript({
				 scriptId: 'customscript_ava_einvoice_dashboard', 
				 deploymentId: (_deploymentid ? _deploymentid : 'customdeploy_ava_einvoice_dashboard')
			 }) + '&randomstring=' + randomstring;

            window.location = output;
    		
    	}
    	catch(errorMessage)
    	{
			log.debug('errorMessage', errorMessage.message);
			//dialog.alert({'title': 'Error', 'message': errorMessage.message});
			
			var myMsg = message.create({
				title: 'ERROR',
				message: errorMessage.message,
				type: message.Type.ERROR
			});
		
			myMsg.show({duration : duration});
    	}
    }
    
    function getStatusScript() 
    {
		var record = currentRecord.get();
		var sessionObj = runtime.getCurrentSession();
		//var userObj = runtime.getCurrentUser();

		var randomstring = record.getValue({fieldId: 'randomstring'});
		var _scriptTaskId = sessionObj.get({name: randomstring});
		console.log('_scriptTaskId : ' + _scriptTaskId);
		var resultSet = []
    	
		if(_scriptTaskId)
		{
			var filters = [["taskid","contains",_scriptTaskId]];
			search.create({
				   type: "scheduledscriptinstance",
				   filters: filters,
				   columns:
				   [
					  search.createColumn({
						 name: "scriptid",
						 join: "scriptDeployment"
					  }),
					//   search.createColumn({
					// 	 name: "datecreated",
					// 	 sort: search.Sort.DESC
					//   }),
					//   "startdate",
					//   "enddate",
					//   "status",
					  "mapreducestage",
					  "percentcomplete"
				   ]
				}).run().each(function(result){
				   
					resultSet.push(result)
					
					return true;
				});
		}
    	
    	return resultSet
	}
    
    function ckeckStatusScript() 
    {
    	var lang = runtime.getCurrentUser().getPreference ({name: 'LANGUAGE'});;
		//log.debug('LANGUAGE', lang);
		
		if(lang == 'pt_BR')
			var msg = 'Nenhum processo em execução.';
		else
			var msg = 'No processes running.';
		
		
    	var statusScript = getStatusScript();
    	
    	if(!statusScript.length)
    	{
    		document.getElementById('message').innerHTML = msg;
			document.getElementById('scriptdeployment').innerHTML = '';
    		// document.getElementById('statusscript').innerHTML = '';
    		document.getElementById('percentcomplete').innerHTML = '';
    		document.getElementById('mapreducestatus').innerHTML = '';
    	}
    	
    	for (var int = 0; int < statusScript.length; int++) 
    	{
    		document.getElementById('scriptdeployment').innerHTML = statusScript[int].getValue({name: "scriptid", join: "scriptDeployment"});

    		// if(statusScript[int].getValue({name: "scriptid", join: "scriptDeployment"}) == 'CUSTOMDEPLOY_AVA_PROCESS_REQUESTS')
			// {
    		// 	document.getElementById('statusscript').innerHTML = statusScript[int].getValue({name: "status"});
    		// 	document.getElementById('percentcomplete').innerHTML = '';
        	// 	document.getElementById('mapreducestatus').innerHTML = '';
			// }
    		// else
			// {
    			document.getElementById('mapreducestatus').innerHTML = statusScript[int].getValue({name: "mapreducestage"});
    			document.getElementById('percentcomplete').innerHTML = statusScript[int].getValue({name: "percentcomplete"});
			// }
		}
    	
	}
    
    return {
        pageInit: pageInit,
        saveRecord: saveRecord,
        fetchRecords: fetchRecords,
        formReset: formReset,
        markAll: markAll,
        unMarkAll: unMarkAll,
        formReset1: formReset1,
        formRefresh: formRefresh,
        backToDash: backToDash,
        getStatusScript: getStatusScript,
        ckeckStatusScript: ckeckStatusScript
    };
    
});
