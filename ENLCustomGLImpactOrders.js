/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Jul 2021     Rogerio Horauti
 *
 */
function customizeGlImpact(transactionRecord, standardLines, customLines, book) 
{
	try 
	{
		var transType = transactionRecord.getRecordType();
		var transId = transactionRecord.getFieldValue('id');
		var transactionLoad;
		nlapiLogExecution('DEBUG', transType+' : '+transId, 'GLImpactOrders LOG----------------------------------')

		var _randomString = transactionRecord.getFieldValue('custbody_avlr_randomstring')
		//nlapiLogExecution('DEBUG', 'Random String', _randomString)
		
		//nlapiLogExecution('DEBUG', 'standardLines.getCount()', standardLines.getCount())
		if(standardLines.getCount() < 2)
			return;
		
		var lang = nlapiGetContext().getPreference('LANGUAGE');
		//nlapiLogExecution('DEBUG', "lang", lang);
		
		var invoiceCount = transactionRecord.getLineItemCount('recmachcustrecord_enl_orderid');
		nlapiLogExecution('DEBUG', 'invoiceCount 1', invoiceCount)
		if(invoiceCount < 0) 
		{
			if (transId) 
			{
				return;
			}
			else 
			{
				transactionRecord = nlapiLoadRecord(transType, transId);
				invoiceCount = transactionRecord.getLineItemCount('recmachcustrecord_enl_orderid');
				// nlapiLogExecution('DEBUG', 'invoiceCount 2', invoiceCount)
			}
		}

	
		if(transType ==  'itemfulfillment' || transType ==  'itemreceipt') 
		{
			if(invoiceCount <= 0)
			  return;
		}
		
		var filter = [];
		var salesReturnAcc = null;
		var purchaseReturnAcc = null;
		var operationTypeAccount = null;
		var ordertype = transactionRecord.getFieldValue('ordertype');
		var orderid = transactionRecord.getFieldValue('orderid');
		var messageSession = '';
		
		setAccounting();
		
		if(ordertype == 'TrnfrOrd') 
		{
			transactionLoad = nlapiLoadRecord('transferorder', orderid);
			
			setAccounting();
		}
    	else if(transType == 'creditmemo' || transType == 'returnauthorization' || transType == 'vendorreturnauthorization')
    	{
    		filter.push(["custrecord_avlr_parameter_pcg","anyof","2"]);// Conta de reversão de venda
    		
    		salesReturnAcc = getAccountInGenericParameter();
    		if(salesReturnAcc)
    			addCustomLines();
    		else
    		{
    			if(messageSession)
    				messageSession += '</br>';

    			if(lang != 'pt_BR')
    				messageSession += 'Unregistered Account for type(s) "Sales return account", in the structure of "Generic Accounting Parameter" of the Avalara Bundle';
    			else
    				messageSession += 'Conta não cadastrada para o(s) tipos(s) "Conta de retorno de venda", na estrutura de "Parâmetro de Contabilização Genérico" do Bundle Avalara';
    				
    			nlapiGetContext().setSessionObject('warningglimpact'+_randomString, "MENSAGEM NETSUITE : "+messageSession);
    		}
    	}
    	else if(transType == 'vendorcredit')
    	{
    		filter.push(["custrecord_avlr_parameter_pcg","anyof","1"]);// Conta de reversão de compra
    		
    		purchaseReturnAcc = getAccountInGenericParameter();
    		if(purchaseReturnAcc)
    			addCustomLines();
    		else
    		{
    			if(messageSession)
    				messageSession += '</br>';
    			
    			if(lang != 'pt_BR')
    				messageSession += 'Unregistered Account for type(s) "Purchase return account", in the structure of "Generic Accounting Parameter" of the Avalara Bundle';
				else
					messageSession += 'Conta não cadastrada para o(s) tipos(s) "Conta de retorno de compra", na estrutura de "Parâmetro de Contabilização Genérico" do Bundle Avalara';
    				
    			nlapiGetContext().setSessionObject('warningglimpact'+_randomString, "MENSAGEM NETSUITE : "+messageSession);
    		}
    	}
		nlapiLogExecution('DEBUG', 'End', '--------------------------------------------------------')
	} 
	catch (e) 
	{
		nlapiLogExecution('ERROR', 'customizeGlImpact', e);
		//nlapiLogExecution('ERROR', 'customizeGlImpact', JSON.stringify(e));
		
		nlapiGetContext().setSessionObject('errorglimpact'+_randomString, "MENSAGEM NETSUITE : "+e);
		//nlapiGetContext().setSessionObject('errorresponse'+_randomString, JSON.stringify(e));
	}
	
	function setAccounting() 
	{
		if(transactionLoad)
			var accountingLineCount = transactionLoad.getLineItemCount('recmachcustrecord_enl_orderid') // Contabilizações
		else
			var accountingLineCount = transactionRecord.getLineItemCount('recmachcustrecord_enl_orderid') // Contabilizações

		for(var i = 1; i <= accountingLineCount; i++) 
		{
			if(transactionLoad)
			{
				var creditAmount = transactionLoad.getLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', i)
				var debitAmount = transactionLoad.getLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', i)
				var accNum = transactionLoad.getLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', i)
				var description = transactionLoad.getLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt', i)
			}
			else
			{
				var creditAmount = transactionRecord.getLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', i)
				var debitAmount = transactionRecord.getLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', i)
				var accNum = transactionRecord.getLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', i)
				var description = transactionRecord.getLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt', i)
			}
			
			creditAmount = creditAmount ? parseFloat(creditAmount) : 0;
			debitAmount = debitAmount ? parseFloat(debitAmount) : 0;
			accNum = accNum ? parseInt(accNum) : 0;
			
		    if((creditAmount || debitAmount) && accNum) 
		    {
		    	nlapiLogExecution('DEBUG', description, 'account : ' + accNum + ', creditAmount : ' + creditAmount + ', debitAmount : ' + debitAmount)
		    	
		    	var newCustomTrans = customLines.addNewLine()
	
				if(creditAmount)
				  newCustomTrans.setCreditAmount(creditAmount)
	
				if(debitAmount)
				  newCustomTrans.setDebitAmount(debitAmount)
	
				newCustomTrans.setAccountId(accNum)
		        newCustomTrans.setMemo(description)
		        newCustomTrans.setLocationId(standardLines.getLine(1).getLocationId())
		        newCustomTrans.setEntityId(standardLines.getLine(0).getEntityId())
		        newCustomTrans.setClassId(standardLines.getLine(1).getClassId())
		        newCustomTrans.setDepartmentId(standardLines.getLine(1).getDepartmentId())
		    }
		    else if(!accNum && (creditAmount || debitAmount))
	    	{
				nlapiLogExecution('ERROR', 'customizeGlImpact', description + ', account is not defined');
				
				if(messageSession)
					messageSession += '</br>';
				
				if(lang != 'pt_BR')
					messageSession += description + ', account is not defined in "Accounting"';
				else
					messageSession += description + ', conta não definida em "Contabilizações"';
				
				nlapiGetContext().setSessionObject('warningglimpact'+_randomString, "MENSAGEM NETSUITE : "+messageSession);
	    	}
		}
	}
	
	function getAccountInGenericParameter() 
	{
		
		var account = null;
		filter.push("AND");
		filter.push(["custrecord_avlr_subsidiary_pcg","anyof",transactionRecord.getFieldValue('subsidiary')]);
		filter.push("AND");
		filter.push(["isinactive","is","F"]);
		
		var taxAccountingGenericSearch = nlapiSearchRecord("customrecord_avlr_taxaccountinggeneric",null,filter, 
					[new nlobjSearchColumn("custrecord_avlr_account_pcg")]);
		
		if(taxAccountingGenericSearch && taxAccountingGenericSearch.length)
			account = taxAccountingGenericSearch[taxAccountingGenericSearch.length-1].getValue('custrecord_avlr_account_pcg');
			
		nlapiLogExecution('DEBUG', 'Tax Account Generic', account)
		return account;
	}
	
	function addCustomLines() 
	{
        var linecount = standardLines.getCount();

        for (var i=0; i<linecount; i++)
        {
            var line =  standardLines.getLine(i);
            
            nlapiLogExecution('DEBUG', 'addCustomLines - !line.isPosting()', 'continue : ' + !line.isPosting())
            if ( !line.isPosting() ) continue;
            nlapiLogExecution('DEBUG', 'addCustomLines - line.getId()', 'continue : ' + line.getId())
            if ( line.getId() == 0 ) continue;
            
        	if(transType == 'itemfulfillment' && ordertype == "SalesOrd" && operationTypeAccount)
    		{
        		nlapiLogExecution('DEBUG', 'addCustomLines - Debit Amount', line.getDebitAmount())
        		if(line.getDebitAmount() != 0)
                {
            		var newCustomTrans = customLines.addNewLine();
	 	                newCustomTrans.setDebitAmount(parseFloat(line.getDebitAmount()));
	 	                newCustomTrans.setAccountId(parseInt(operationTypeAccount));
	 	                newCustomTrans.setLocationId(line.getLocationId());
	 	              	newCustomTrans.setDepartmentId(line.getDepartmentId());
	 	              	newCustomTrans.setEntityId(line.getEntityId());
	 			        newCustomTrans.setClassId(line.getClassId());

 			        var newCustomTrans = customLines.addNewLine();
	 	                newCustomTrans.setCreditAmount(parseFloat(line.getDebitAmount()));
	 	                newCustomTrans.setAccountId(parseInt(line.getAccountId()));
	 	                newCustomTrans.setLocationId(line.getLocationId());
	 	              	newCustomTrans.setDepartmentId(line.getDepartmentId());
	 	              	newCustomTrans.setEntityId(line.getEntityId());
	 	 				newCustomTrans.setClassId(line.getClassId());
                }
    		}
        	else if(transType == 'itemreceipt' && operationTypeAccount)
    		{
        		nlapiLogExecution('DEBUG', 'addCustomLines - Credit Amount', line.getCreditAmount())
        		if(line.getCreditAmount() != 0)
                {
	        		 var newCustomTrans = customLines.addNewLine();
	                     newCustomTrans.setDebitAmount(parseFloat(line.getCreditAmount()));
	                     newCustomTrans.setAccountId(parseInt(line.getAccountId()));
	                     newCustomTrans.setLocationId(line.getLocationId());
	                     newCustomTrans.setDepartmentId(line.getDepartmentId());
	                     newCustomTrans.setEntityId(line.getEntityId());
	                     newCustomTrans.setClassId(line.getClassId());
	
	                 var newCustomTrans = customLines.addNewLine();
	                     newCustomTrans.setCreditAmount(parseFloat(line.getCreditAmount()));
	                     newCustomTrans.setAccountId(parseInt(operationTypeAccount));
	                     newCustomTrans.setLocationId(line.getLocationId());
	                     newCustomTrans.setDepartmentId(line.getDepartmentId());
	                     newCustomTrans.setEntityId(line.getEntityId());
	                     newCustomTrans.setClassId(line.getClassId());
                }
    		}
        	else if((transType == 'creditmemo' || transType == 'returnauthorization' || transType == 'vendorreturnauthorization') && salesReturnAcc)
    		{
        		nlapiLogExecution('DEBUG', 'addCustomLines - Debit Amount', line.getDebitAmount())
        		if(line.getDebitAmount() != 0)
                {
	        		var newCustomTrans = customLines.addNewLine();
	                    newCustomTrans.setDebitAmount(parseFloat(line.getDebitAmount()));
	                    newCustomTrans.setAccountId(parseInt(salesReturnAcc));
	                    newCustomTrans.setLocationId(line.getLocationId());
	                    newCustomTrans.setDepartmentId(line.getDepartmentId());
	                    newCustomTrans.setEntityId(line.getEntityId());
	                    newCustomTrans.setClassId(line.getClassId());
	
	                var newCustomTrans = customLines.addNewLine();
	                    newCustomTrans.setCreditAmount(parseFloat(line.getDebitAmount()));
	                    newCustomTrans.setAccountId(parseInt(line.getAccountId()));
	                    newCustomTrans.setLocationId(line.getLocationId());
	                    newCustomTrans.setDepartmentId(line.getDepartmentId());
	                    newCustomTrans.setEntityId(line.getEntityId());
	                    newCustomTrans.setClassId(line.getClassId());
                }
    		}
        	else if(transType == 'vendorcredit' && purchaseReturnAcc)
    		{
        		if(line.getCreditAmount() != 0)
                {
	        		var newCustomTrans = customLines.addNewLine();
	                    newCustomTrans.setCreditAmount(parseFloat(line.getCreditAmount()));
	                    newCustomTrans.setAccountId(parseInt(line.getAccountId()));
	                    newCustomTrans.setLocationId(line.getLocationId());
	                    newCustomTrans.setDepartmentId(line.getDepartmentId());
	                    newCustomTrans.setEntityId(line.getEntityId());
	                    newCustomTrans.setClassId(line.getClassId());
	            
	                var newCustomTrans = customLines.addNewLine();
	                    newCustomTrans.setDebitAmount(parseFloat(line.getCreditAmount()));
	                    newCustomTrans.setAccountId(parseInt(purchaseReturnAcc));
	                    newCustomTrans.setLocationId(line.getLocationId());
	                    newCustomTrans.setDepartmentId(line.getDepartmentId());
	                    newCustomTrans.setEntityId(line.getEntityId());
	                    newCustomTrans.setClassId(line.getClassId());
                }
        		else
    			{
        			nlapiLogExecution('DEBUG', 'Credit Amount', line.getCreditAmount())
    			}
    		}
          	
       	}// end for
	}
}