/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/record', 'N/url', 'N/ui/serverWidget', 'N/format', 'N/runtime', 'N/search', './AVLR_DashBoard_Lib'],
/**
 * @param {record} record
 * @param {serverWidget} serverWidget
 */
function(record, url, ui, format, runtime, search, eInvoiceLib) 
{
	const RESULTS_NOTE = '<html><br><b><i> No results returned for the search criteria. </b></br></html>';
    function onRequest(context) 
    {
        if (context.request.method === 'GET') 
        {
			var userObj = runtime.getCurrentUser();
        	var lang = runtime.getCurrentUser().getPreference ({name: 'LANGUAGE'});;
			//log.debug('LANGUAGE', lang);
        	
        	var form = ui.createForm({title: 'eInvoicing DashBoard Requests'});
        	form.clientScriptModulePath = './AVA_eInvoicing_CLI.js';
        	
        	if(lang == 'pt_BR')
    		{
        		var labelStatusInvoice = 'Nota Fiscal Status';
        		
        		var statusSelectOption1 = 'Criado';
        		var statusSelectOption2 = 'Pendente';
        		var statusSelectOption3 = 'Autorizada';
        		var statusSelectOption4 = 'Erro';
        		
        		var labelDateRequested = 'Data de envio do pedido';
        		var labelRequestedBy = 'Enviado por';
        		var labelBtnReset = 'Redefinir';
        		var labelStatusScript = 'Verificar status do Script';
        		var labelHome = 'Inicio';
        		var labelRefresh = 'Buscar Registros';
        		var labelRequestDetails = 'Detalhes do envio';
        		var labelInternalId = 'Id Interno';
        		var labelRequestedDate = 'Data de envio';
        		var labelRequestStatus = 'Status de envio';
    		}
        	else
    		{
        		var labelStatusInvoice = 'Status Invoice';
        		
        		var statusSelectOption1 = 'Created';
        		var statusSelectOption2 = 'Pending';
        		var statusSelectOption3 = 'Authorized';
        		var statusSelectOption4 = 'Error';
        		
        		var labelDateRequested = 'Request Submitted Date';
        		var labelRequestedBy = 'Requested By';
        		var labelBtnReset = 'Reset';
        		var labelStatusScript = 'Check Status Script';
        		var labelHome = 'Home';
        		var labelRefresh = 'Fetch Records';
        		var labelRequestDetails = 'Request Details';
        		var labelInternalId = 'Internal Id';
        		var labelRequestedDate = 'Requested Date';
        		var labelRequestStatus = 'Request Status';
    		}
        	
            var ava_Status = form.addField({
                id: 'ava_status',
                type: ui.FieldType.SELECT,
                label: labelStatusInvoice,
            });

            ava_Status.addSelectOption({value: 0, text: ''});
            ava_Status.addSelectOption({value: 1, text: statusSelectOption1});
            ava_Status.addSelectOption({value: 2, text: statusSelectOption2});
            ava_Status.addSelectOption({value: 3, text: statusSelectOption3});
            ava_Status.addSelectOption({value: 7, text: statusSelectOption4});

            var requestDate = form.addField({
                id: 'daterequested',
                type: ui.FieldType.DATE,
                label: labelDateRequested
            });
            
            var requestedBy = form.addField({
            	id: 'requestedby',
            	type: ui.FieldType.SELECT,
            	label: labelRequestedBy,
            	source: 'employee'
            });
            var paramreqby = context.request.parameters.reqby;
			if(!isNullOrEmpty(paramreqby)) 
				requestedBy.defaultValue = paramreqby;
			else
				requestedBy.defaultValue = userObj.id;

			var deploymentIdField = form.addField({
				id: 'deploymentid',
				type: ui.FieldType.TEXT,
				label: 'Deployment Id'
			});
			deploymentIdField.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED });//*
			var _deploymentid = context.request.parameters.deploymentid;
			if(_deploymentid)
				deploymentIdField.defaultValue = _deploymentid;

			var randomStringField = form.addField({
				id: 'randomstring',
				type: ui.FieldType.TEXT,
				label: 'Control String'
			});
			randomStringField.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED });//*
			var _paramRandomString = context.request.parameters.randomstring;
			if(_paramRandomString)
				randomStringField.defaultValue = _paramRandomString;
			

            // form.addButton({
            // 	id: 'ava_reset',
            // 	label: labelBtnReset,
            // 	functionName: 'formReset1' });

            form.addButton({
            	id: 'ava_refresh',
            	label: labelRefresh,
            	functionName: 'formRefresh' });
            
			form.addButton({
				id: 'ava_home',
				label: labelHome,
				functionName: 'backToDash' });
					
			form.addButton({
				id: 'ava_ckeckstatusscript',
				label: labelStatusScript,
				functionName: 'ckeckStatusScript' });
						
			var output = url.resolveScript({
					scriptId: 'customscript_ava_einvoice_dashboard', 
					deploymentId: (_deploymentid ? _deploymentid : 'customdeploy_ava_einvoice_dashboard')
				});

			if(_paramRandomString)
				output += '&randomstring=' + _paramRandomString;

			if(_deploymentid)
				output += '&deploymentid=' + _deploymentid;

            form.addPageLink({
				 title : 'eInvoicing DashBoard',
				 type : ui.FormPageLinkType.CROSSLINK,
				 url : output
			 });

            var labelStatusScript = form.addField({id: 'labelstatusscript', type: ui.FieldType.INLINEHTML, label: 'Note - '}); 
			 labelStatusScript.defaultValue = 	'</br><b><div id="message"></div></b></br>'+
				 								'<b><div id="scriptdeployment"></div></b></br>'+
				 								//'<b><div id="statusscript"></div></b></br>'+
				 								'<b><div id="mapreducestatus"></div></b></br>'+
				 								'<b><div id="percentcomplete"></div></b></br>';
			 
			var paramstatus = context.request.parameters.status;
            //var paramreqby = context.request.parameters.reqby;
            var paramdatereq = context.request.parameters.datereq;

			var paramFlag = false;
			if(!isNullOrEmpty(paramstatus) || !isNullOrEmpty(paramreqby) || !isNullOrEmpty(paramdatereq)) 
				paramFlag = true;

			if(paramFlag == true)
			{
				if(!isNullOrEmpty(paramstatus)) ava_Status.defaultValue =  paramstatus;
				//if(!isNullOrEmpty(paramreqby)) requestedBy.defaultValue = paramreqby;
				if(!isNullOrEmpty(paramdatereq)) requestDate.defaultValue = paramdatereq;
			}
				
			//Perform search based off the criteria and display results
			var eDashBoardResults = fetchRequestDetails(context);
			if(eDashBoardResults != null && eDashBoardResults.length > 0)
			{
                var subList = form.addSublist({
                    id : 'requestlist',
                    type : ui.SublistType.LIST,
                    label : labelRequestDetails
                });

                var requestId = subList.addField({
                	id:	'intid',
                	type: ui.FieldType.TEXT,
                	label: labelInternalId
                });

                var notaStatus = subList.addField({
                	id:	'notastatus',
                	type: ui.FieldType.TEXT,
                	label: labelStatusInvoice
                });
                
                var requestDate = subList.addField({
                	id:	'requestdate',
                	type: ui.FieldType.TEXT,
                	label: labelRequestedDate
                });

                var requestBy = subList.addField({
                	id:	'requestby',
                	type: ui.FieldType.TEXT,
                	label: labelRequestedBy
                });

                var requestStatus = subList.addField({
                	id:	'requeststatus',
                	type: ui.FieldType.TEXT,
                	label: labelRequestStatus
                });

                for(var i=0; i < eDashBoardResults.length; i++)
                {
                	var recDetails = eDashBoardResults[i];
                	
                	var linkUrl = url.resolveRecord({
            		    recordType:  eDashBoardResults[i].recordType,
            		    recordId: eDashBoardResults[i].id,
            		    isEditMode: false
            		});
            	
                	var finalVal = '<a href="' + linkUrl + '">' + recDetails.id + '</a>';
            	
                	subList.setSublistValue({
            	        id : 'intid',
            	        line : i, 
            	        value : finalVal });

                	if(!isNullOrEmpty(recDetails.getValue('custrecord_ava_notafiscal_status')))
                	{
                		subList.setSublistValue({
                		id : 'notastatus',
            	        line : i, 
            	        value : recDetails.getText('custrecord_ava_notafiscal_status') });
                	}

            		var createdDate = recDetails.getValue('created');
                	subList.setSublistValue({
            	        id : 'requestdate',
            	        line : i, 
            	        value : recDetails.getValue('created') });

                	if(recDetails.getText('custrecord_ava_user'))
	                	subList.setSublistValue({
	            	        id : 'requestby',
	            	        line : i, 
	            	        value : recDetails.getText('custrecord_ava_user') });

                	subList.setSublistValue({
            	        id : 'requeststatus',
            	        line : i, 
            	        value : recDetails.getText('custrecord_record_status') });
				}
			}
			else
			{
				var resultsLabel = form.addField({
	                id: 'resultslabel',
	                type: ui.FieldType.INLINEHTML,
	                label: 'Note - '
	            }); 
				resultsLabel.defaultValue= RESULTS_NOTE; 
				resultsLabel.updateLayoutType({layoutType: ui.FieldLayoutType.OUTSIDEBELOW});
				resultsLabel.updateBreakType({breakType : ui.FieldBreakType.STARTROW });
			}
			
			
//			var sublist = form.addSublist({
//				id : 'sublist',
//				type : ui.SublistType.LIST,
//				label : 'List Sublist'
//			});
//			sublist.addRefreshButton();
			
			
				
				
	        context.response.writePage(form);
        } 
    }
    
    function fetchRequestDetails(context)
	{
		try
		{
			var filters = [];
			if(context.request.parameters.status)
			{
				filters.push(['custrecord_ava_notafiscal_status', 'anyof', context.request.parameters.status]);
				filters.push('AND');
			}
				
			if(context.request.parameters.reqby)
			{
				filters.push(['custrecord_ava_user', 'anyof', context.request.parameters.reqby]);
				filters.push('AND');
			}
			else
			{
				var userObj = runtime.getCurrentUser();
				filters.push(['custrecord_ava_user', 'anyof', userObj.id]);
				filters.push('AND');
			}

			if(context.request.parameters.datereq)
			{
				filters.push(['created', 'on', context.request.parameters.datereq]);
				filters.push('AND');
			}
			filters.push(["isinactive","is","F"]);
			
			var dashBoardResults = [];
			var einvoiceDashboard = search.create({
				   type: "customrecord_ava_einvoice_dashboard",
				   filters: filters,
				   columns:
				   [
						search.createColumn({
							name: "internalid",
							sort: search.Sort.DESC,
							label: "Internal ID"
						}),
						search.createColumn({name: "custrecord_ava_user", label: "Submitted By"}),	
						search.createColumn({name: "custrecord_record_status", label: "Record Status"}),
						search.createColumn({name: "created", label: "Date Created"}),
						search.createColumn({name: "custrecord_ava_notafiscal_status", label: "Not Fiscal Status"})					
				   ]
			}).run().getRange({start: 0, end: 100 });

			for (var i = 0; i < einvoiceDashboard.length; i++) 
			{
				dashBoardResults.push(einvoiceDashboard[i])
			}
			
	        return dashBoardResults;

		}
		catch(fetchRequestDetailsErr)
		{
	        throw fetchRequestDetailsErr; 
		}
	}
	
	function isNullOrEmpty(value)
	{
	  	if(value == null || value == "")
	      	return true;

	  	return false;
	}

    
    return {
        onRequest: onRequest
    };
});
