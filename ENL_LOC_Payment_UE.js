function beforeLoad()
{
	
}

function beforeSubmit(type)
{
	try 
	{
		if(type == "create" || type == 'edit')
		{
			var record = nlapiGetNewRecord();
			
			var _dontExecutePcc = record.getFieldValue('custbody_avlr_dontexecutepcc');
			if(_dontExecutePcc == 'T')
			{
				nlapiLogExecution('DEBUG', 'Dont Execute Pcc ', _dontExecutePcc);
				return;
			}	

			var _approvalstatus = record.getFieldValue('approvalstatus');
			if(_approvalstatus && _approvalstatus != 2) // Approved
			{
				nlapiLogExecution('DEBUG', '_approvalstatus : ' + record.getFieldText('approvalstatus'), !!(_approvalstatus && _approvalstatus != 2));
				return;
			}

			// nlapiLogExecution('DEBUG', 'Functions: Limpando', 'recmachcustrecord_enl_tt_orderid')
			var accountingLineCount = record.getLineItemCount('recmachcustrecord_enl_orderid');
			if (accountingLineCount > 0) {
				for (var acct = 1; acct <= accountingLineCount; acct++) {
					record.removeLineItem('recmachcustrecord_enl_orderid', 1, true);
				}
			}

			var taxAccounts = [];
			
			var filter = [];
			filter.push(['custrecord_enl_ta_subsidiary', 'anyof', record.getFieldValue('subsidiary')]);
			filter.push("AND")
			filter.push(["formulatext: {custrecord_avlr_transtype_pci}", "is", fromToTransactionType()])
			
			var columns = [];
			columns.push(new nlobjSearchColumn('custrecord_enl_ta_taxtype'));
			columns.push(new nlobjSearchColumn('custrecord_enl_ta_taxpayable'));
			columns.push(new nlobjSearchColumn('custrecord_enl_ta_taxexpense'));
			
			var search = nlapiSearchRecord('customrecord_enl_taxaccounting', null, filter, columns);
			
			for (var i = 0; search != null && i < search.length; i++) 
			{
				taxAccounts[search[i].getValue('custrecord_enl_ta_taxtype')] = search[i];
			}
			
			if(!taxAccounts.length)
			{
				nlapiLogExecution('DEBUG', "WARNING", '"Parâmetro de Contabilização de Impostos" não definido na estrutura de contabilização do Bundle Avalara');
				return;
			}
			else
				nlapiLogExecution('DEBUG', "Parâmetro de Contabilização de Impostos", JSON.stringify(taxAccounts));
			
			var trxCount = record.getLineItemCount('apply');
			for (var i = 1; i <= trxCount; i++) 
			{
				var tranID = record.getLineItemValue('apply', 'internalid', i);
				
				if (record.getLineItemValue('apply', 'apply', i) == 'F') continue
				
				//if (nlapiLookupField('transaction', tranID, 'custbody_enl_taxwithheld') === "F") continue
				
				if (record.getRecordType() == "vendorpayment") 
					var transaction = nlapiLoadRecord('vendorbill', tranID);
				if (record.getRecordType() == "customerpayment") 
					var transaction = nlapiLoadRecord('invoice', tranID);
				
				var taxwithheld = transaction.getFieldValue('custbody_enl_taxwithheld');
				nlapiLogExecution('DEBUG', "taxwithheld", taxwithheld);
				
				var pcc_issued = transaction.getFieldValue('custbody_avlr_pccissued');
				nlapiLogExecution('DEBUG', "pcc_issued", pcc_issued);

				if(taxwithheld == "F")
					break;
				
				// if(pcc_issued)
				// 	break;
				
				var amountTotal = parseFloat(transaction.getFieldValue('total') - transaction.getFieldValue('taxtotal'));
				var pisAmount = parseFloat(amountTotal * 0.0065).toFixed(2);
				var cofinsAmount = parseFloat(amountTotal * 0.03).toFixed(2);
				var csllAmount = parseFloat(amountTotal * 0.01).toFixed(2);
				
				var sumAmount = parseFloat(pisAmount) + parseFloat(cofinsAmount) + parseFloat(csllAmount);
				
				nlapiLogExecution('DEBUG', "Soma", sumAmount);
				
				if (sumAmount >= 10.0)
					setSublistValues();
				
				
			}// end for
		}// "create"
	} 
	catch (e) 
	{
		nlapiLogExecution('ERROR', "ERROR", JSON.stringify(e));
	}
	
	function setSublistValues() 
	{
		if(taxAccounts[14])
		{
			record.selectNewLineItem('recmachcustrecord_enl_orderid');
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum', '1');
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', taxAccounts[14].getValue('custrecord_enl_ta_taxexpense'));
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', pisAmount);
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt', "Contabilização de impostos: pisRf");
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido', "T");
			record.commitLineItem('recmachcustrecord_enl_orderid');
			
			record.selectNewLineItem('recmachcustrecord_enl_orderid');
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum', '1');
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', taxAccounts[14].getValue('custrecord_enl_ta_taxpayable'));
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', pisAmount);
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt', "Contabilização de impostos: pisRf");
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido', "T");
			record.commitLineItem('recmachcustrecord_enl_orderid');
		}
		else
			nlapiLogExecution('DEBUG', "WARNING", '</br>Conta Contábil não cadastrada para o imposto "pisRf" e transação "'+fromToTransactionType()+'", na estrutura de "Parâmetro de Contabilização de Impostos" do Bundle Avalara');
		
		if(taxAccounts[12])
		{
			record.selectNewLineItem('recmachcustrecord_enl_orderid');
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum', '1');
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', taxAccounts[12].getValue('custrecord_enl_ta_taxexpense'));
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', cofinsAmount);
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt', "Contabilização de impostos: cofinsRf");
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido', "T");
			record.commitLineItem('recmachcustrecord_enl_orderid');
			
			record.selectNewLineItem('recmachcustrecord_enl_orderid');
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum', '1');
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', taxAccounts[12].getValue('custrecord_enl_ta_taxpayable'));
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', cofinsAmount);
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt', "Contabilização de impostos: cofinsRf");
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido', "T");
			record.commitLineItem('recmachcustrecord_enl_orderid');
		}
		else
			nlapiLogExecution('DEBUG', "WARNING", '</br>Conta Contábil não cadastrada para o imposto "cofinsRf" e transação "'+fromToTransactionType()+'", na estrutura de "Parâmetro de Contabilização de Impostos" do Bundle Avalara');
		
		if(taxAccounts[13])
		{
			record.selectNewLineItem('recmachcustrecord_enl_orderid');
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum', '1');
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', taxAccounts[13].getValue('custrecord_enl_ta_taxexpense'));
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', csllAmount);
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt', "Contabilização de impostos: csllRf");
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido', "T");
			record.commitLineItem('recmachcustrecord_enl_orderid');
			
			record.selectNewLineItem('recmachcustrecord_enl_orderid');
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum', '1');
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', taxAccounts[13].getValue('custrecord_enl_ta_taxpayable'));
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', csllAmount);
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt', "Contabilização de impostos: csllRf");
			record.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido', "T");
			record.commitLineItem('recmachcustrecord_enl_orderid');
		}
		else
			nlapiLogExecution('DEBUG', "WARNING", '</br>Conta Contábil não cadastrada para o imposto "csllRf" e transação "'+fromToTransactionType()+'", na estrutura de "Parâmetro de Contabilização de Impostos" do Bundle Avalara');
	}
	
	function fromToTransactionType() 
    {
		var lang = nlapiGetContext().getPreference('LANGUAGE');
		nlapiLogExecution('DEBUG', "lang", lang);
		
		switch (record.getRecordType()) 
		{
			case 'customerpayment':
				return lang != 'pt_BR' ? 'Payment' : 'Pagamento'
				break;
			case 'vendorpayment':
				return lang != 'pt_BR' ? 'Bill Payment' : 'Pagamento de conta'
				break;
			default:
				return ''
				break;
		}
	}
}

function afterSubmit(type)
{

}