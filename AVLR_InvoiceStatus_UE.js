/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/runtime'],

function(search, runtime) {
   
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
    		var _newRecord = scriptContext.newRecord
    		var _form = scriptContext.form;
    		var _type = scriptContext.type
    		
    		var _documentTypeId = _newRecord.getValue({fieldId: 'custbody_enl_order_documenttype'});
			if(!_documentTypeId)
				return;
			
			var lookUpFiscDocType = search.lookupFields({
						type: 'customrecord_enl_fiscaldocumenttype',
						id: _documentTypeId,
						columns: ['custrecord_enl_fdt_model','custrecord_enl_issuereceiptdocument']
					});
			
			var _subsidiaryId = _newRecord.getValue('subsidiary');
    		if(!_subsidiaryId)
    			return;
    		log.debug('_subsidiaryId', _subsidiaryId);
    		
    		var _fieldsSubsidiary = search.lookupFields({
	    			type: 'subsidiary',
	    			id: _subsidiaryId,
	    			columns: ['custrecord_avlr_enablent2021001']
    			});
				
    		var lang = runtime.getCurrentUser().getPreference ({name: 'LANGUAGE'});
    		if(lang == 'pt_BR')
    		{
    			if(lookUpFiscDocType.custrecord_enl_fdt_model != 1)
    			{
    				var consultStatusLabel = 'Consultar Status NF-e';
    				var cancelLabel = 'Cancelar NF-e';
    			}
				else
				{
					var consultStatusLabel = 'Consultar Status NFS-e';
					var cancelLabel = 'Cancelar NFS-e';
				}
    			
    			var deliveryReceiptLabel = 'Comprovante de Entrega';
    			var fixLetterLabel = 'Carta de Correção';
    			var issueNoteLabel = 'Emitir Nota';
    		}
    		else
			{
    			if(lookUpFiscDocType.custrecord_enl_fdt_model != 1)
    			{
    				var consultStatusLabel = 'Consult Status NF-e';
    				var cancelLabel = 'Cancel NF-e';
    			}
				else
				{
					var consultStatusLabel = 'Consult Status NFS-e'
					var cancelLabel = 'Cancel NFS-e';
				}
    			
				var deliveryReceiptLabel = 'Delivery Receipt';
    			var fixLetterLabel = 'Fix Letter';
    			var issueNoteLabel = 'Issue Note';
			}
    		
    		
    		var _fiscalDocStatus = _newRecord.getValue('custbody_enl_fiscaldocstatus')
    		var _status = _newRecord.getValue('statusRef');
			log.debug("Status", _status)

    		if(_type == 'view' && lookUpFiscDocType.custrecord_enl_issuereceiptdocument)
    		{
    			_form.clientScriptModulePath = './AVLR_InvoiceStatus_BS.js'
	    				
    			if(_fiscalDocStatus == "2")// 	Pendente
    			{
    				_form.addButton({id: 'custpage_btn_invoicestatus', label: consultStatusLabel, functionName: 'processInvoiceStatus'});
    			}
    			
    			if(['1', '01', '55', '65'].indexOf(lookUpFiscDocType.custrecord_enl_fdt_model) > -1 
						&& (_fiscalDocStatus == "7" || !_fiscalDocStatus))// 	Erro || Empty
    			{
					if(!(_newRecord.type == 'transferorder' && ["pendingApproval", "pendingFulfillment"].indexOf(_status) > -1))
					{
						_form.addButton({id: 'custpage_issuenote', label: issueNoteLabel, functionName: 'issueNote'});
						_form.addButton({id: 'custpage_buttonstatus', label: 'Status Execução', functionName: 'executionStatus'});  
					}
    			}
    			
    			if(_fiscalDocStatus == "3")// 	Autorizada
    			{
    				// HABILITAR NT 2021.001 - EVENTO COMPROVANTE DE ENTREGA DA NF-E
    				var enableNt2021001 = _fieldsSubsidiary.custrecord_avlr_enablent2021001
    				
    				if (['55'].indexOf(lookUpFiscDocType.custrecord_enl_fdt_model) > -1 && enableNt2021001) 
					{
    					_form.addButton({id: 'custpage_delivery_receipt', label: deliveryReceiptLabel, functionName: 'deliveryReceipt'});
					}
						
					log.debug('Model', lookUpFiscDocType.custrecord_enl_fdt_model)
					log.debug('Contens 01 55 65', ['1', '01', '55', '65'].indexOf(lookUpFiscDocType.custrecord_enl_fdt_model) > -1)
					
					if (['55', '65'].indexOf(lookUpFiscDocType.custrecord_enl_fdt_model) > -1) 
					{
						_form.addButton({
							id: 'custpage_button_correction',
							label: fixLetterLabel,
							functionName: 'correctionLetter("'+ lookUpFiscDocType.custrecord_enl_fdt_model +'")'
						})
					}
					
					if (['1', '01', '55', '65'].indexOf(lookUpFiscDocType.custrecord_enl_fdt_model) > -1) 
					{
						_form.addButton({
							id: 'custpage_button_cancel_transaction',
							label: cancelLabel,
							functionName: 'cancelTransaction("'+ lookUpFiscDocType.custrecord_enl_fdt_model +'")'
						})
					}
						
				}// end else if(_fiscalDocStatus != "3")// 	Autorizada
				
    		}// end if(_type == 'view')
			
		} 
    	catch (e) 
    	{
    		log.debug('beforeLoad', JSON.stringify(e));
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
    function beforeSubmit(scriptContext) {

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

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
