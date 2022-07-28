var grnvAcct = 0;
var vatAcct = 0;

function getItemId(internalId, itemtype)
{
	var columnname = nlapiGetContext().getSetting('SCRIPT','custscript_enl_itemidfield');;

	var filter = [];
	filter.push(new nlobjSearchFilter('internalid', null, 'anyof', internalId));

	var columns = [];
	columns.push(new nlobjSearchColumn(columnname));

	var search = nlapiSearchRecord('item', null, filter, columns);

	if(search != null)
	{
		var item = nlapiLoadRecord(search[0].getRecordType(), search[0].getId());
		return formatItemCode(item);
		//return search[0].getValue(columnname);
	}
	else
		throw nlapiCreateError('Item', 'Item ' + internalId + ' nao foi encontrado');

}

function newGetItemId(recordLoad, i, showDisplyName)
{
	var itemObj = {};
	var columnname = nlapiGetContext().getSetting('SCRIPT','custscript_enl_itemidfield');
//	if((!columnname || columnname == 'itemid') && showDisplyName == 'F')
//	{
//		return recordLoad.getLineItemText('item', 'item', i);
//	}
//	else
//	{
		var _itemId = recordLoad.getLineItemValue('item', 'item', i);
		var _itemtype = recordLoad.getLineItemValue('item', 'itemtype', i);

		var item = nlapiLoadRecord(getItemType(_itemtype), _itemId);
		
		itemObj.itemId = formatItemCode(item);
		itemObj.cbar = item.getFieldValue('custitem_avlr_cbar');
		
		return itemObj;
//	}
}

function newGetPurchItemId(recordLoad, i, grnvAcct)
{
	var columnname = nlapiGetContext().getSetting('SCRIPT','custscript_enl_itemidfield');
	if(columnname)
	{
		var _itemId = recordLoad.getLineItemValue('item', 'item', i);
		var _itemtype = recordLoad.getLineItemValue('item', 'itemtype', i);

		var item = nlapiLoadRecord(getItemType(_itemtype), _itemId);
		var expenseaccount = item.getFieldValue('expenseaccount');
		var assetaccount = item.getFieldValue('assetaccount');

		var _obj = {};

		if(assetaccount)
			_obj.inventoryAccount = grnvAcct;
		else if(expenseaccount)
			_obj.inventoryAccount = expenseaccount;
		else
			_obj.inventoryAccount = 0

		_obj.itemCode = formatItemCode(item);
		_obj.cbar = item.getFieldValue('custitem_avlr_cbar');
		
		return _obj;
	}
}

function formatItemCode(itemRecord){
	var columnname = nlapiGetContext().getSetting('SCRIPT','custscript_enl_itemidfield');
	return itemRecord.getFieldValue(columnname).split(":").slice(-1).toString().trim();
}

function getItemType(itemType)
{

	if (itemType == 'InvtPart')
		itemType = 'inventoryitem';
	else if (itemType == 'OthCharge')
		itemType = 'otherchargeitem';
	else if (itemType == 'Service')
		itemType = 'serviceitem';
	else if (itemType == 'NonInvtPart')
		itemType = 'noninventoryitem';
	else if (itemType == 'Assembly')
		itemType = 'assemblyitem';
	else if (itemType == 'Description')
		itemType = 'descriptionitem';
	else if (itemType == 'Discount')
		itemType = 'discountitem';
	else if (itemType == 'GiftCert')
		itemType = 'giftcertificateitem';
	else if (itemType == 'Group')
		itemType = 'itemgroup';
	else if (itemType == 'Kit')
		itemType = 'kititem';
	else if (itemType == 'Markup')
		itemType = 'markupitem';
	else if (itemType == 'Payment')
		itemType = 'paymentitem';
	else if (itemType == 'Subtotal')
		itemType = 'subtotalitem';


	return itemType;

}

function convertStrToNum(value)
{
	if(value != null)
	{
		return value.replace(/[^0-9\.]+/g,"");
	}
	else
	{
		return 0;
	}
}

function processCalcOrder(orderId, response)
{
	var calcOrder = response;
	var accounts = new Array();
	var lineCount = calcOrder.CalcOrderLines.length;

	for(var i = 0;i<lineCount;i++)
	{
		var calcOrderLine = calcOrder.CalcOrderLines[i];

		var taxLineCount = calcOrderLine.Taxes.length;

		for(var y=0;y<taxLineCount;y++)
		{
			var taxLine = calcOrderLine.Taxes[y];

			var taxTrans = nlapiCreateRecord('customrecord_enl_taxtrans');
			taxTrans.setFieldValue('custrecord_enl_taxcode', taxLine.TaxCode);
			taxTrans.setFieldValue('custrecord_enl_taxbaseamount', taxLine.TaxBaseAmount);
			taxTrans.setFieldValue('custrecord_enl_taxrate', taxLine.TaxValue);
			taxTrans.setFieldValue('custrecord_enl_taxamount', taxLine.TaxAmount);
			taxTrans.setFieldValue('custrecord_enl_taxsituation', taxLine.TaxSituation);
			taxTrans.setFieldValue('custrecord_enl_tt_orderid', orderId);
			taxTrans.setFieldValue('custrecord_enl_tt_operation', taxLine.Operation);
			taxTrans.setFieldValue('custrecord_enl_taxtransline', calcOrderLine.LineNum);
			nlapiSubmitRecord(taxTrans , true, false);

		}
	}
	for(var i = 0;i<lineCount;i++)
	{
		var calcOrderLine = calcOrder.CalcOrderLines[i];

		var ledgerLineCount = calcOrderLine.Ledger.length;



		for(var y=0;y<ledgerLineCount ;y++)
		{
			var ledgerLine = calcOrderLine.Ledger[y];

			if(accounts[ledgerLine.AccountNumber] == null){

				var f = new nlobjSearchFilter('number', null, 'is', ledgerLine.AccountNumber);
				var filter = new Array();
				filter.push(f);
				var res = nlapiSearchRecord('account', null, filter);

				if(res == null)
				{
					nlapiCreateError(500, "Conta contabil nao encontrada", true)
					continue;
				}
				else
				{
					var rec = res[0];
					accId = rec.getId();
					accounts[ledgerLine.AccountNumber] = accId;
				}
			}
			else{
				accId = accounts[ledgerLine.AccountNumber];
			}
			var ledgerTrans = nlapiCreateRecord('customrecord_enl_ledgertemptrans');
			ledgerTrans.setFieldValue('custrecord_enl_accountnum', accId);
			ledgerTrans.setFieldValue('custrecord_enl_orderid', orderId);

			if(ledgerLine.IsDebit)
			{
				ledgerTrans.setFieldValue('custrecord_enl_debitamount', ledgerLine.Amount);
			}
			else
			{
				ledgerTrans.setFieldValue('custrecord_enl_creditamount', ledgerLine.Amount);
			}
			ledgerTrans.setFieldValue('custrecord_enl_transtxt', ledgerLine.Description);
			ledgerTrans.setFieldValue('custrecord_enl_impostoretido', ledgerLine.IsRetained ? "T" : "F");
			ledgerTrans.setFieldValue('custrecord_enl_linenum', calcOrderLine.LineNum);

			nlapiSubmitRecord(ledgerTrans , true, false);

		}
	}
	nlapiLogExecution('DEBUG', 'Uso', nlapiGetContext().getRemainingUsage());
}

function processCalcOrderV2(order, response)
{
	var calcOrder = response;
	//nlapiLogExecution('DEBUG', 'Functions: calcOrder', JSON.stringify(calcOrder))
	var accounts = new Array();
	var lineCount = calcOrder.CalcOrderLines.length;
	nlapiLogExecution('DEBUG', 'CalcOrderLines : lineCount', lineCount)
	var taxCount = order.getLineItemCount('recmachcustrecord_enl_tt_orderid');
	//nlapiLogExecution('DEBUG', 'Functions: taxCount', taxCount)
	if (taxCount > 0) {
		for (var tax = 1; tax <= taxCount; tax++) {
			order.removeLineItem('recmachcustrecord_enl_tt_orderid', 1, true);
		}
	}

	// Changed for No-OW Netsuite Account
//	var subsidiary = nlapiLoadRecord('subsidiary', order.getFieldValue('subsidiary'));

	var subsidiary = null;

	if(nlapiGetContext().getFeature('subsidiaries') == false)
	{
		subsidiary = nlapiLoadConfiguration('companyinformation');
	}
	else {
		subsidiary = nlapiLoadRecord('subsidiary', order.getFieldValue('subsidiary'));
	}

	var itemCount = order.getLineItemCount('item');

	if (itemCount <= 50) {
		nlapiLogExecution('DEBUG', 'Functions: Limpando', 'recmachcustrecord_enl_tt_orderid')
		var accountingLineCount = order.getLineItemCount('recmachcustrecord_enl_orderid');
		if (accountingLineCount > 0) {
			for (var acct = 1; acct <= accountingLineCount; acct++) {
				order.removeLineItem('recmachcustrecord_enl_orderid', 1, true);
			}
		}
	}

	for(var i = 0;i<lineCount;i++)
	{
		var calcOrderLine = calcOrder.CalcOrderLines[i];
		var taxLineCount = calcOrderLine.Taxes.length;
		for(var y = 0; y < taxLineCount; y++)
		{
			var taxLine = calcOrderLine.Taxes[y];

			//		nlapiLogExecution('DEBUG', 'taxLine.TaxCode', taxLine.TaxCode);
			//		nlapiLogExecution('DEBUG', 'taxLine.TaxValue', taxLine.TaxValue);

			order.selectNewLineItem('recmachcustrecord_enl_tt_orderid');
			order.setCurrentLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', taxLine.TaxCode);
			order.setCurrentLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxbaseamount', taxLine.TaxBaseAmount);
			order.setCurrentLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxrate', parseFloat(taxLine.TaxValue));
			order.setCurrentLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', parseFloat(taxLine.TaxAmount));
			order.setCurrentLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxsituation', taxLine.TaxSituation);
			order.setCurrentLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_tt_operation', taxLine.Operation);
			order.setCurrentLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', calcOrderLine.LineNum);
			order.setCurrentLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_tt_taxtype', getTaxType(taxLine.TaxCode));
			order.setCurrentLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_tt_iscredit', taxLine.IsCredit == true ? "T" : "F");
			order.setCurrentLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_tt_isretained', taxLine.IsRetained  ? "T" : "F");
			order.setCurrentLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_tt_item', order.getLineItemValue('item', 'item', calcOrderLine.LineNum));
			order.setCurrentLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_collectioncode', taxLine.CollectionCode);

			var log1 = order.getCurrentLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxrate');

			//		nlapiLogExecution('DEBUG', '\t\t\torder.setCurrentLineItemValue(\'recmachcustrecord_enl_tt_orderid\',\'custrecord_enl_taxrate\', parseFloat(taxLine.TaxValue));\n', log1);
//			nlapiLogExecution('DEBUG', "accounting", parseInt(taxLine.Accounting));

			if ( parseInt(taxLine.Accounting)+1 > 0)
			{
				order.setCurrentLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_avlr_taxaccounting', parseInt(taxLine.Accounting) + 1);
			}
			order.commitLineItem('recmachcustrecord_enl_tt_orderid');

		}

		var freightAcc = nlapiGetContext().getSetting('SCRIPT', 'custscript_enl_freightitem');
		var freightAmount = parseFloat(order.getLineItemValue('item', 'custcol_enl_line_freightamount', calcOrderLine.LineNum));
		var InsuranceAmount = parseFloat(order.getLineItemValue('item', 'custcol_enl_line_insuranceamount', calcOrderLine.LineNum));
		var otherchargesAmount = parseFloat(order.getLineItemValue('item', 'custcol_enl_line_othersamount', calcOrderLine.LineNum));

		// NBC-805
		var itemAcc = order.getLineItemValue('item', 'account', calcOrderLine.LineNum);

		//nlapiLogExecution('DEBUG', "itemAcc", itemAcc);

		if (isNullOrEmpty(itemAcc) && ( (freightAmount > 0) || InsuranceAmount > 0 || otherchargesAmount > 0  ) ) {
			itemAcc = getItemsAccountPOv2(order,order.getLineItemValue('item', 'item', calcOrderLine.LineNum));
		}


		switch(order.getRecordType())
		{
			case 'vendorreturnauthorization':
			case 'salesorder':
			case 'invoice':
				var msg = 'vendas'
				break;

			case 'vendorcredit':
				var msg = 'devolução'
				break;
			case 'purchaseorder':
			case 'vendorbill':
				var msg = 'compras'
				break;
		}

		if(freightAmount > 0 && !isNullOrEmpty(freightAcc))
		{
			order.selectNewLineItem('recmachcustrecord_enl_orderid');
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  calcOrderLine.LineNum);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  itemAcc);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', freightAmount);

			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtx',  "Frete sobre " + msg);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'sales');
			order.commitLineItem('recmachcustrecord_enl_orderid');

			order.selectNewLineItem('recmachcustrecord_enl_orderid');
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  calcOrderLine.LineNum);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  parseInt(freightAcc));
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', freightAmount);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Frete sobre " + msg);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'sales');
			order.commitLineItem('recmachcustrecord_enl_orderid');
		}

//NBC 793
		var InsuranceAcc = nlapiGetContext().getSetting('SCRIPT', 'custscript_avlr_insuranceacct');

		if(InsuranceAmount > 0 && !isNullOrEmpty(InsuranceAcc))
		{
			order.selectNewLineItem('recmachcustrecord_enl_orderid');
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  calcOrderLine.LineNum);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  itemAcc);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', InsuranceAmount);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtx',  "Seguro sobre " + msg);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'sales');
			order.commitLineItem('recmachcustrecord_enl_orderid');

			order.selectNewLineItem('recmachcustrecord_enl_orderid');
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  calcOrderLine.LineNum);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  parseInt(InsuranceAcc));
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', InsuranceAmount);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Seguro sobre " + msg);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'sales');
			order.commitLineItem('recmachcustrecord_enl_orderid');
		}

		var otherchargesAcc = nlapiGetContext().getSetting('SCRIPT', 'custscript_avlr_otherchargeacct');

		if(otherchargesAmount > 0 && !isNullOrEmpty(otherchargesAcc))
		{
			order.selectNewLineItem('recmachcustrecord_enl_orderid');
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  calcOrderLine.LineNum);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  itemAcc);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', otherchargesAmount);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtx',  "Outras Despesas sobre " + msg);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'sales');
			order.commitLineItem('recmachcustrecord_enl_orderid');

			order.selectNewLineItem('recmachcustrecord_enl_orderid');
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  calcOrderLine.LineNum);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  parseInt(otherchargesAcc));
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', otherchargesAmount);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Outras Despesas sobre " + msg);
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'sales');
			order.commitLineItem('recmachcustrecord_enl_orderid');
		}
	}// end for

	if(subsidiary.getFieldValue('custrecord_enl_softwarefiscal') == 3)
	{
		buildTaxAccounting(order, calcOrder.CalcOrderLines);
	}
}

function sendToFiscal(subsidiary, object)
{
	//nlapiLogExecution('DEBUG', "Entrou SendToFiscal");

	if(subsidiary.getFieldValue('custrecord_enl_softwarefiscal') == 1)
		return null;

	var urlFiscal = subsidiary.getFieldValue('custrecord_enl_urlswfiscal');

	nlapiLogExecution('DEBUG', "SendToFiscal", urlFiscal);


	if(subsidiary.getFieldValue('custrecord_enl_softwarefiscal') != "1" && (urlFiscal == null || urlFiscal == ''))
		throw nlapiCreateError('Fiscal','Necessário preencher a URL do Software Fiscal em Configurações -> Empresa-> Subsidiaria');

	var counter = 1;
	var retry = true;

	do
	{
		try
		{
			var headers = new Array();
			headers['Content-Type'] = 'text/plain;charset=utf-8';
			headers['SOAPAction'] = "POST";
			headers['Url'] = urlFiscal;
			headers['FiscalService'] = subsidiary.getFieldValue('custrecord_enl_softwarefiscal');
			headers['AvataxUser'] = subsidiary.getFieldValue('custrecord_enl_avataxuser');
			headers['AvataxPwd'] = subsidiary.getFieldValue('custrecord_enl_pwdavatax');

			//	nlapiLogExecution('DEBUG', "passou Headers");

			if(subsidiary.getFieldValue('custrecord_enl_enviromenttype') == "2")
				//    var response = nlapiRequestURL("http://enlighteasytalk.azurewebsites.net/api", JSON.stringify(object), headers, null, "POST");
				var response = nlapiRequestURL("https://api-nseasytalk.avalarabrasil.com.br/api", JSON.stringify(object), headers, null, "POST");

			else if(subsidiary.getFieldValue('custrecord_enl_enviromenttype') == "3")
				var response = nlapiRequestURL("https://api-nseasytalk.qa.avalarabrasil.com.br/api", JSON.stringify(object), headers, null, "POST");
			else
				var response = nlapiRequestURL("http://easytalksandbox.azurewebsites.net/api", JSON.stringify(object), headers, null, "POST");

			nlapiLogExecution('DEBUG', "response", JSON.stringify(response));



			if(!isNullOrEmpty(response.getBody()))
			{
				var objectReturned = JSON.parse(response.getBody());
				nlapiLogExecution('DEBUG', "XML Request", objectReturned.RequestMessage);
				nlapiLogExecution('DEBUG', "XML Response", objectReturned.ResponseMessage);
			}

			retry = false;
		}
		catch(error)
		{
			counter++;

			if(error instanceof nlobjError)
			{
				if(error.getCode() != "SSS_CONNECTION_CLOSED")
					retry = false;
			}
			else{
				retry = false;
				nlapiLogExecution('DEBUG', 'Erro', error)
				throw nlapiCreateError('Fiscal','Erro ao conectar ao software fiscal.');
			}
		}

	}
	while (retry == true && counter < 6);

	return response;
}

function getCountryCode(country)
{
	var filter = [];
	filter.push(new nlobjSearchFilter('custrecord_enl_shortcode', null, 'is', country));

	var columns = [];
	columns.push(new nlobjSearchColumn('name'));

	var searchCountry = nlapiSearchRecord('customrecord_enl_countrycode', null, filter, columns);

	if(searchCountry != null)
		return searchCountry[0].getValue('name');
	else
		return '';

}

function getCountryISOCode(country)
{
	var filter = [];
	filter.push(new nlobjSearchFilter('custrecord_enl_shortcode', null, 'is', country));

	var columns = [];
	columns.push(new nlobjSearchColumn('custrecord_enl_iso3361'));

	var searchCountry = nlapiSearchRecord('customrecord_enl_countrycode', null, filter, columns);

	if(searchCountry != null)
		return searchCountry[0].getValue('custrecord_enl_iso3361');
	else
		return '';

}

function buildAddress(address)
{
	var nsAddress  = {};

	if(address != null)
	{
		if(getCountryCode(address.getFieldValue('country')) != 1058)
		{
			if(address.getFieldValue('addr1'))
				nsAddress.Street = address.getFieldValue('addr1').substr(0,60);

			nsAddress.Number = address.getFieldValue('addr2');
			nsAddress.Neighborhood = address.getFieldValue('addr3');
			nsAddress.CityName = "Exterior";
			nsAddress.CityCode = "9999999";
			nsAddress.State = "EX";
			nsAddress.Zipcode = "0000000";
			nsAddress.CountryCode = getCountryCode(address.getFieldValue('country'));
			nsAddress.Country = getCountryISOCode(address.getFieldValue('country'));

		}
		else
		{
			if(address.getFieldValue('addr1'))
				nsAddress.Street = address.getFieldValue('addr1').substr(0,60);

			nsAddress.Number = address.getFieldValue('custrecord_enl_numero');
			nsAddress.Neighborhood = address.getFieldValue('addr3');
			nsAddress.CityName = address.getFieldText('custrecord_enl_city');
			nsAddress.Complement = address.getFieldValue('addr2');

			if(!isNullOrEmpty(address.getFieldValue('custrecord_enl_city')))
			{
				var city = nlapiLoadRecord('customrecord_enl_cities', address.getFieldValue('custrecord_enl_city'));
				nsAddress.CityCode = city.getFieldValue('custrecord_enl_ibgecode');
			}

			nsAddress.State = address.getFieldText('custrecord_enl_uf');
			nsAddress.Zipcode = address.getFieldValue('zip');
			nsAddress.CountryCode = getCountryCode(address.getFieldValue('country'));
			nsAddress.Country = getCountryISOCode(address.getFieldValue('country'));
		}
	}

	return nsAddress;
}

function roundRfb(value) {

	var val = value;
	var total = Math.floor(value * 100) / 100;

	if (val != total) {

		var result = val - total;
		var num = 0.0055;
		var n = num.toFixed(4);

		if (result > 0.0050 && result < 0.0055) {

			return parseFloat(val.toFixed(2) - 0.01).toFixed(2);
		}

		else
			return val.toFixed(2);
	}
	return value;
}

function buildTaxAccounting(order, calcOrderLines)
{
	//nlapiLogExecution("DEBUG", "Functions: ORDER", JSON.stringify(order))

	var taxAccounts = [];
	var columns = [];
	var filter = [];

	if(nlapiGetContext().getFeature('subsidiaries')) {
		filter.push(new nlobjSearchFilter('custrecord_enl_ta_subsidiary', null, 'anyof', order.getFieldValue('subsidiary')));
	}
	columns.push(new nlobjSearchColumn('custrecord_enl_ta_taxtype'));
	columns.push(new nlobjSearchColumn('custrecord_enl_ta_taxpayable'));
	columns.push(new nlobjSearchColumn('custrecord_enl_ta_taxexpense'));
	columns.push(new nlobjSearchColumn('custrecord_enl_ta_taxreceivable'));
	columns.push(new nlobjSearchColumn('custrecord_enl_ta_taxtransitory'))

	var search = nlapiSearchRecord('customrecord_enl_taxaccounting', null, filter, columns);

	for(var i = 0; search != null && i < search.length; i++) {
		taxAccounts[search[i].getValue('custrecord_enl_ta_taxtype')] = search[i];
	}

	if(order.getRecordType() == 'transferorder') {
		var fromLocationType = getLocationType(order.getFieldValue('location'));
		var toLocationType = getLocationType(order.getFieldValue('transferlocation'));
	}

	var retainedAmount = 0;
	order.setFieldValue('custbody_enl_taxwithheld', "F");

	for(var taxline = 1; taxline <= order.getLineItemCount('recmachcustrecord_enl_tt_orderid'); taxline++)
	{
		var taxaccount = taxAccounts[order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', taxline)];
		var isRetained = order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_isretained', taxline) == "T";
		var operation = order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_operation', taxline) != '=';


		if(isRetained && operation)
		{
			if(parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', taxline)) != 12 &&
				parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', taxline)) != 13 &&
				parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', taxline)) != 14) {
				retainedAmount += parseFloat(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_taxamount', taxline));
			}
			else {
				order.setFieldValue('custbody_enl_taxwithheld', "T");
			}
		}

		if(taxaccount != null)
		{
			switch(order.getRecordType())
			{
				case 'vendorreturnauthorization':
				case 'salesorder':
				case 'invoice':
					createSalesAccounting(order, taxline, taxaccount);
					break;

				case 'vendorcredit':
					createVendorCreditAccounting(order, taxline, taxaccount);
					break;
				case 'purchaseorder':
				case 'vendorbill':
					createPurchAccounting(order, taxline, taxaccount, calcOrderLines);
					break;

				case 'returnauthorization':
				case 'creditmemo':
					createSalesReturnAccounting(order, taxline, taxaccount);
					break;

				case 'transferorder':
					if(fromLocationType == 1)
					{
						createSalesAccounting(order, taxline, taxaccount);
					}

					if(fromLocationType == 2 && toLocationType == 1)
					{
						createTransReturnAccounting(order, taxline, taxaccount);
					}
					else if(toLocationType == 1 && fromLocationType == 1)
					{
						createReceiptTransferAccounting(order, taxline, taxaccount);
					}
					break;
			}
		}
	}

	if(retainedAmount > 0)
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  0);

		//Simple useless object
		var acc = {}
		//Taking subsidiary
		//If Transitory account is setted, take from CustomRecordType

		if(nlapiGetContext().getFeature('subsidiaries') == false) {

			//acc = getVATTaxAccount(order.getRecordType(), order.getLineItemValue('item', 'taxcode', 1))
			//order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', acc);

		} else
		{

			if ( isTransitoryAccount(order.getFieldValue('subsidiary'))) {
				//Take from custrecordType with SUBSIDIARYID and TAXCODEID
				//	acc = getTransitoryAccountByTaxAndSubsidiary(order.getFieldValue('subsidiary'), order.getLineItemValue('item', 'taxcode', 1))
				acc = getTransitoryAccountByTaxAndSubsidiary(order.getFieldValue('subsidiary'), 28); // get account for PCC - transitory


				//Of corse.. may we don't define this account, so, we need other way to work
				if (!acc)
					acc = getVATTaxAccount(order.getRecordType(), order.getLineItemValue('item', 'taxcode', 1));
				order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', acc);
			} else {
				//Flow the simples flux
				acc = getVATTaxAccount(order.getRecordType(), order.getLineItemValue('item', 'taxcode', 1))
				order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', acc);
			}
		}

		if(order.getRecordType() == "salesorder" || order.getRecordType() == "invoice")
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', retainedAmount.toFixed(2));
		else
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', retainedAmount.toFixed(2));

		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: standard");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "T");
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}
}

/**
 * Get Param account from subsidiary
 * @param {string} subsidiaryId: Subsidiary ID
 * @returns {boolean} If is TRUE or FALSE
 */
function isTransitoryAccount(subsidiaryId){
	return getSubsidiary(subsidiaryId).getFieldValue('custrecord_avlr_param_account') === 'T'
}
function isPCCTax(){

}

/**
 * Get subsidiary based at ID of CompanyInformation
 * @param {string} subsidiaryId: Subsidiary ID
 * @returns {object} The awesome subsidiary
 * @throws {object} empty object
 */
function getSubsidiary(subsidiaryId){
	try {
		if(nlapiGetContext().getFeature('subsidiaries') === false){
			return nlapiLoadConfiguration('companyinformation')
		}else {
			return nlapiLoadRecord('subsidiary', subsidiaryId)
		}
	} catch (error) {
		nlapiLogExecution('ERROR', 'Error on execution', error)
		return {}
	}
}

/**
 * Get transitory account with Subsidiary and TAX Code
 * with optional datas like:
 * @param {string} subsidiaryId: Subsidiary ID
 * @param {string} taxCode: TaxCode
 * @returns {string} Tranitory account for subsidiary
 * @throws {null} Return null if nothing is finded
 */
function getTransitoryAccountByTaxAndSubsidiary(subsidiaryId, taxCode) {

	const accRecord = nlapiSearchRecord('customrecord_enl_taxaccounting',
		null,
		[
			new nlobjSearchFilter('custrecord_enl_ta_taxtype', null, 'IS', taxCode),
			new nlobjSearchFilter('custrecord_enl_ta_subsidiary', null, 'IS', subsidiaryId)
		],
		[
			new nlobjSearchColumn('internalid'),
			new nlobjSearchColumn('custrecord_enl_ta_taxtransitory')
		]
	)
	if(accRecord) {
		return accRecord[0].getValue('custrecord_enl_ta_taxtransitory')

	}

	return null
}

function getTaxType(taxcode)
{
	switch(taxcode)
	{
		case 'icms':
			return 1;
		case 'icmsSt':
			return 2;
		case 'pis':
			return 3;
		case 'cofins':
			return 4;
		case 'irrf':
			return 5;
		case 'inss':
			return 6;
		case 'csll':
			return 7;
		case 'ipi':
			return 8;
		case 'ii':
			return 9;
		case 'iss':
			return 10;
		case 'inssRf':
			return 11;
		case 'cofinsRf':
			return 12;
		case 'csllRf':
			return 13;
		case 'pisRf':
			return 14;
		case 'issRf':
			return 15;
		case 'irrfAuto':
			return 16;
		case 'icmsDifaDest':
			return 17;
		case 'icmsDifaRemet':
			return 18;
		case 'icmsDifaFCP':
			return 19;
		case 'ipiReturned':
			return 20;
		case 'icmsEff':
			return 21;
		case 'icmsOwnPayer':
			return 22;
		case 'icmsStSd':
			return 23;
		case 'icmsFCP':
			return 24;
		case 'icmsDeson':
			return 25;
		case 'icmsStFCP':
			return 26;
		case 'icmsStSdFCP':
			return 27;
		case 'PCC - transitory':
			return 28;
	}

	return null;
}

function createSalesAccounting(order, line, taxaccount)
{
	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_isretained', line) == "F" &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 25 &&
		order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line) > 0)
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxexpense'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'sales');
		order.commitLineItem('recmachcustrecord_enl_orderid');

		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxpayable'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'sales');
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}


	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_avlr_taxaccounting', line) != 3 &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) == 25 &&
		order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line) > 0)
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxexpense'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'sales');
		order.commitLineItem('recmachcustrecord_enl_orderid');

		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxpayable'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'sales');
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}

	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_isretained', line) == "T" &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 12 &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 13 &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 14)
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxreceivable'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "T");
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}
}

function createSalesReturnAccounting(order, line, taxaccount)
{

//	nlapiLogExecution('DEBUG', 'taxaccount Receive', taxaccount.getValue('custrecord_enl_ta_taxreceivable'));
//	nlapiLogExecution('DEBUG', 'taxaccount Expense', taxaccount.getValue('custrecord_enl_ta_taxexpense'));
//	nlapiLogExecution('DEBUG', 'taxcode', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));



	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_isretained', line) == "F"  &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 25 &&
		order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line) > 0)
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxreceivable'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'salesreturn');
		order.commitLineItem('recmachcustrecord_enl_orderid');

		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxexpense'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'salesreturn');
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}

	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_avlr_taxaccounting', line) != 3 &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) == 25 &&
		order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line) > 0)
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxreceivable'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'salesreturn');
		order.commitLineItem('recmachcustrecord_enl_orderid');

		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxexpense'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'salesreturn');
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}
	var isRetained = order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_isretained', line) == "T";
	var operation = order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_operation', line) != '=';

	if(isRetained && operation)
	{
		if(parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 12 &&
			parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 13 &&
			parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 14)
		{
			order.selectNewLineItem('recmachcustrecord_enl_orderid');
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxreceivable'));
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "T");
			order.commitLineItem('recmachcustrecord_enl_orderid');
		}
	}
}

function createTransReturnAccounting(order, line, taxaccount)
{
	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_isretained', line) == "F"  &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 25 &&
		order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line) > 0)
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxreceivable'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: ");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');

		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxexpense'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: ");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}

	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_avlr_taxaccounting', line) != 3 &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) == 25 &&
		order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line) > 0)
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxreceivable'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: ");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');

		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxexpense'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: ");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}

}

function createPurchAccounting(order, line, taxaccount, calcOrderLines)
{
	//nlapiLogExecution('DEBUG', 'line', line);
	var _transLine = order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line);
	var _index = calcOrderLines.map(function(e) {return e.LineNum == _transLine;}).indexOf(true);


	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_isretained', line) == "F" &&
		order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_iscredit', line) == "T" &&
		order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_operation', line) == "=" &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 25 &&
		!isNullOrEmpty(taxaccount.getValue('custrecord_enl_ta_taxreceivable')))
	{

		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  _transLine);
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxreceivable'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');

		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  _transLine);
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', calcOrderLines[_index].inventoryAccount);
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}
	//NBC-981

	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_avlr_taxaccounting', line) != 3 &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) == 25 &&
		!isNullOrEmpty(taxaccount.getValue('custrecord_enl_ta_taxreceivable')))
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxreceivable'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');

		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', calcOrderLines[_index].inventoryAccount);
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}

	if( (order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_avlr_taxaccounting', line) != 3) &&

		( parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) == 17  ||
			parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) == 18 ||
			parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) == 19

		) &&
		!isNullOrEmpty(taxaccount.getValue('custrecord_enl_ta_taxpayable')))
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxpayable'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));

		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');

		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', calcOrderLines[_index].inventoryAccount);
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}

	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_isretained', line) == "F" &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 25 &&
		order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_operation', line) == "+")
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxreceivable'))
		//NBC-804
		//  order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  getVATTaxAccount(order.getRecordType(), order.getLineItemValue('item','taxcode',1)));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');

		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', calcOrderLines[_index].inventoryAccount);
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}

	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_isretained', line) == "T" &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 12 &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 13 &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 14 &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 25
	)
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxpayable'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "T");
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}
}

function createReceiptTransferAccounting(order, line, taxaccount)
{
	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_isretained', line) == "F" &&
		order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_iscredit', line) == "T")
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxreceivable'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: ");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');

		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', getRecNotBillAcct());
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: ");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}
}

function createVendorCreditAccounting(order, line, taxaccount)
{
	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_isretained', line) == "F" &&
		order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_iscredit', line) == "T" &&
		order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_operation', line) == "=" &&
		!isNullOrEmpty(taxaccount.getValue('custrecord_enl_ta_taxreceivable')))
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', getInventoryAccount(order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_tt_item', line)));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');

		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', taxaccount.getValue('custrecord_enl_ta_taxreceivable'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}

	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_isretained', line) == "F" &&
		order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_operation', line) == "+")
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', getInventoryAccount(order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_tt_item', line)));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');

		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', taxaccount.getValue('custrecord_enl_ta_taxreceivable'))
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}

	if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_isretained', line) == "T" &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 12 &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 13 &&
		parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', line)) != 14)
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxtransline', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  taxaccount.getValue('custrecord_enl_ta_taxpayable'));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxamount', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: " + order.getLineItemValue('recmachcustrecord_enl_tt_orderid','custrecord_enl_taxcode', line));
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "T");
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}
}

function isNullOrEmpty(value)
{
	if(value == null || value == "")
		return true;

	return false;
}

function buildCFOPArray()
{
	var cfops = [];

	var searchCfop = nlapiSearchRecord('customrecord_enl_cfop', null, null, new nlobjSearchColumn('name'));

	for(var i = 0; searchCfop != null && i < searchCfop.length; i++)
	{
		cfops[searchCfop[i].getValue('name')] = searchCfop[i].getId();
	}
	return cfops;
}

function getFiscalDocumentNumber(fiscalDocumentId)
{
	var filter = [];
	filter.push(new nlobjSearchFilter('custrecord_enl_seq_fiscaldocument', null, 'anyof', fiscalDocumentId));
	filter.push(new nlobjSearchFilter('custrecord_enl_seq_status', null, 'noneof', 3));

	var columns = [];
	columns.push(new nlobjSearchColumn('custrecord_enl_seq_num').setSort());
	columns.push(new nlobjSearchColumn('custrecord_enl_seq_status'));
	columns.push(new nlobjSearchColumn('name'));

	var searchSeq = nlapiSearchRecord('customrecord_enl_invoicenumberseq', null, filter, columns);

	if(searchSeq != null)
	{
		nlapiSubmitField('customrecord_enl_invoicenumberseq', searchSeq[0].getId(), 'custrecord_enl_seq_status', 3);
		return searchSeq[0].getValue('name');
	}
	else
	{
		var filter = [];
		filter.push(new nlobjSearchFilter('custrecord_enl_seq_fiscaldocument', null, 'anyof', fiscalDocumentId));
		filter.push(new nlobjSearchFilter('custrecord_enl_seq_status', null, 'anyof', 3));

		var columns = [];
		columns.push(new nlobjSearchColumn('custrecord_enl_seq_num', null, 'max'));

		var searchSeq = nlapiSearchRecord('customrecord_enl_invoicenumberseq', null, filter, columns);

		if(searchSeq != null)
		{
			var newNumber = parseInt(searchSeq[0].getValue('custrecord_enl_seq_num', null, 'max'))+1;
			var newName = ("00000000"+newNumber).slice(-9);
			var numberSeq = nlapiCreateRecord('customrecord_enl_invoicenumberseq');
			numberSeq.setFieldValue('custrecord_enl_seq_num', newNumber);
			numberSeq.setFieldValue('custrecord_enl_seq_fiscaldocument', fiscalDocumentId);
			numberSeq.setFieldValue('name', newName);
			numberSeq.setFieldValue('custrecord_enl_seq_status', 3);
			nlapiSubmitRecord(numberSeq);

			return newName;
		}
		else
		{
			throw nlapiCreateError("Sequencia Numerica", "Erro ao atribuir sequencia numerica de Nota Fiscal");
		}
	}
}

function settleFiscalDocumentNumber(fiscalDocumentId, number)
{
	var filter = [];
	filter.push(new nlobjSearchFilter('custrecord_enl_seq_fiscaldocument', null, 'anyof', fiscalDocumentId));
	filter.push(new nlobjSearchFilter('name', null, 'is', number));

	var searchSeq = nlapiSearchRecord('customrecord_enl_invoicenumberseq', null, filter, null);

	if(searchSeq != null)
	{
		nlapiSubmitField('customrecord_enl_invoicenumberseq', searchSeq[0].getId(), 'custrecord_enl_seq_status', 3);
	}
	else
	{
		throw nlapiCreateError("Sequencia Numerica", "Nota Fiscal emitida, revise a sequencia numerica do Tipo de Documento");
	}
}

function revertFiscalDocumentNumber(fiscalDocumentId, number)
{
	var filter = [];
	filter.push(new nlobjSearchFilter('custrecord_enl_seq_fiscaldocument', null, 'anyof', fiscalDocumentId));
	filter.push(new nlobjSearchFilter('name', null, 'is', number));

	var searchSeq = nlapiSearchRecord('customrecord_enl_invoicenumberseq', null, filter, null);

	if(searchSeq != null)
	{
		nlapiSubmitField('customrecord_enl_invoicenumberseq', searchSeq[0].getId(), 'custrecord_enl_seq_status', 2);
	}
	else
	{
		throw nlapiCreateError("Sequencia Numerica", "Revise a sequencia numerica do Tipo de Documento");
	}
}

function getInventoryAccount(itemid)
{
	var cols = [];
	cols.push(new nlobjSearchColumn('assetaccount'));
	cols.push(new nlobjSearchColumn('expenseaccount'));

	var itemSearch = nlapiSearchRecord('item', null, new nlobjSearchFilter('internalid', null, 'anyof', itemid), cols);
	//nlapiLogExecution('DEBUG', 'getInventoryAccount',  (itemSearch ? JSON.stringify(itemSearch) : ''))

	if(itemSearch != null)
	{
		if(!isNullOrEmpty(itemSearch[0].getValue('assetaccount')))
		{
			if(grnvAcct == 0)
				grnvAcct = getRecNotBillAcct();

			return grnvAcct;//getRecNotBillAcct();//itemSearch[0].getValue('assetaccount');
		}

		if(!isNullOrEmpty(itemSearch[0].getValue('expenseaccount')))
		{
			return itemSearch[0].getValue('expenseaccount');
		}
	}

	return 0;
}

function getLocationType(locationId)
{
	var location = nlapiLoadRecord('location', locationId);

	return location.getFieldValue('custrecord_enl_loc_locationtype');
}

function getVATTaxAccount(type, taxcode)
{
	switch(type)
	{
		case 'salesorder':
		case 'invoice':
		case 'vendorreturnauthorization':
		case 'vendorcredit':
			if(vatAcct == 0)
			{
				var taxItem = nlapiLoadRecord('salestaxitem', taxcode);

				vatAcct = taxItem.getFieldValue('saleaccount');
			}
			return vatAcct;

		case 'purchaseorder':
		case 'vendorbill':		
		case 'returnauthorization':	
		case 'creditmemo':
			if(vatAcct == 0)
			{
				var taxItem = nlapiLoadRecord('salestaxitem', taxcode);

				vatAcct = taxItem.getFieldValue('purchaseaccount');
			}
			return vatAcct;
	}
}
function getRecNotBillAcct()
{
	var filters = [];
	filters.push(new nlobjSearchFilter('specialaccounttype', null, 'is', 'RecvNotBill'));

	var search = nlapiSearchRecord('account', null, filters, null);

	if(search != null)
	{
		return search[0].getId();
	}
	else
	{
		return null;
	}
}

function postImportExpenses(order, account, amount, offsetAccount)
{
	order.selectNewLineItem('recmachcustrecord_enl_orderid');
	order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  1);
	order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  offsetAccount);
	order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', parseFloat(amount * order.getFieldValue('exchangerate')));
	order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de despesas acessorias");
	order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
	order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
	order.commitLineItem('recmachcustrecord_enl_orderid');

	order.selectNewLineItem('recmachcustrecord_enl_orderid');
	order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  1);
	order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum',  account);
	order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', parseFloat(amount * order.getFieldValue('exchangerate')));
	order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de despesas acessorias");
	order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "F");
	order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_sourcemodule', 'purch');
	order.commitLineItem('recmachcustrecord_enl_orderid');
}

function accountingExpenses(order)
{
	if(order.getFieldValue('billcountry') != "BR")
	{
		var freightAmount = 0;
		var othersAmount = 0;
		var insuranceAmount = 0;

		var freightAcc = nlapiGetContext().getSetting('SCRIPT','custscript_enl_freightexpacct');
		var insuranceAcc = nlapiGetContext().getSetting('SCRIPT','custscript_enl_insuranceexpacct');
		var othersAcc = nlapiGetContext().getSetting('SCRIPT','custscript_enl_othersexpacct');
		var recNotBillAcc = getRecNotBillAcct();

		for(var item = 1; item <= order.getLineItemCount('item'); item++)
		{
			freightAmount += parseFloat(order.getLineItemValue('item', 'custcol_enl_line_freightamount', item));
			othersAmount += parseFloat(order.getLineItemValue('item', 'custcol_enl_line_othersamount', item));
			insuranceAmount += parseFloat(order.getLineItemValue('item', 'custcol_enl_line_insuranceamount', item));
		}

		if(freightAmount > 0 && freightAcc != null && recNotBillAcc != null)
		{
			postImportExpenses(order, freightAcc, freightAmount, recNotBillAcc);
		}

		if(insuranceAmount > 0 && insuranceAcc != null && recNotBillAcc != null)
		{
			postImportExpenses(order, insuranceAcc, insuranceAmount, recNotBillAcc);
		}

		if(othersAmount > 0 && othersAcc != null && recNotBillAcc != null)
		{
			postImportExpenses(order, othersAcc, othersAmount, recNotBillAcc);
		}
	}
}

function processInvoice(recType, recId)
{
	var invoice = nlapiLoadRecord(recType, recId);

	var nsInvoiceStatus = new Object();
	nsInvoiceStatus.type = 'invoicestatus';

	//var subsidiary = nlapiLoadRecord('subsidiary', invoice.getFieldValue('subsidiary'));
	// changed for No-OW NetSuite Account

	var subsidiary = null;


	if(nlapiGetContext().getFeature('subsidiaries') == false)
	{
		subsidiary = nlapiLoadConfiguration('companyinformation');
	}
	else {
		subsidiary = nlapiLoadRecord('subsidiary', invoice.getFieldValue('subsidiary'));
	}

	nsInvoiceStatus.company = subsidiary.getFieldValue('custrecord_enl_companyid');

	var location = nlapiLoadRecord('location', invoice.getFieldValue('location'));
	nsInvoiceStatus.establishment = location.getFieldValue('custrecord_enl_fiscalestablishmentid');

	var operationTypeId = invoice.getFieldValue('custbody_enl_operationtypeid');

	var operationType = nlapiLoadRecord('customrecord_enl_operationtype', operationTypeId);

	if(operationType.getFieldValue('custrecord_enl_ot_usetype') == 1)
		nsInvoiceStatus.documenttype = "NFS";
	else
		nsInvoiceStatus.documenttype = "NFE";

	if(invoice.getRecordType() == 'invoice')
		nsInvoiceStatus.orderid = invoice.getFieldValue('tranid');
	else
		nsInvoiceStatus.orderid = internalid;

	nsInvoiceStatus.accessKey = invoice.getFieldValue('custbody_enl_accesskey');
	nsInvoiceStatus.series = invoice.getFieldValue('custbody_enl_fiscaldocumentserie');

	try
	{
		//var urlFiscal = subsidiary.getFieldValue('custrecord_enl_urlswfiscal');
		var response = sendToFiscal(subsidiary, nsInvoiceStatus);

		var nsResponse = JSON.parse(response.getBody());

		if(nsResponse.Status == true)
		{
			if(nsResponse.ObjectReturn != null)
			{
				processFiscalDocument(invoice, nsResponse.ObjectReturn);
			}
			else
				throw nlapiCreateError('500', nsResponse.Message, true);
		}
		else
		{
			throw nlapiCreateError('500', nsResponse.Message, true);
		}
	}
	catch(e)
	{
		throw nlapiCreateError('Ordem de Venda',e.message, true);
	}
}

function processFiscalDocument(invoice, fiscalDocument) {

	var internalid = '';

	invoice.setFieldValue('custbody_enl_accesskey',fiscalDocument.Accesskey);
	invoice.setFieldValue('custbody_enl_fiscaldocnumber',fiscalDocument.Number);
	//invoice.setFieldValue('custbody_enl_fiscaldocdate',fiscalDocument.Date);
	invoice.setFieldValue('custbody_enl_protololnfe',fiscalDocument.Protocol);
	invoice.setFieldValue('custbody_enl_fiscaldocstatus',parseInt(fiscalDocument.Status));
	invoice.setFieldValue('custbodyxml',fiscalDocument.Xml);
	invoice.setFieldValue('custbody_enl_messagespl',fiscalDocument.Message);
	invoice.setFieldValue('custbody_enl_linknotafiscal',fiscalDocument.Urldanfe);

	var files = [];

	if(fiscalDocument.Xml != null)
	{
		var fileName = "XML_NFe"+fiscalDocument.Accesskey+".xml";

		var file = nlapiCreateFile(fileName, 'XMLDOC', fiscalDocument.Xml);
		var fileFolder = nlapiGetContext().getSetting('SCRIPT', 'custscript_enl_xmlfolder');

		if(!isNullOrEmpty(fileFolder))
		{
			file.setFolder(fileFolder);
			var submitId = nlapiSubmitFile(file);

			nlapiAttachRecord('file', submitId, invoice.getRecordType(), invoice.getId());
		}

		files.push(file);
	}
	nlapiSubmitRecord(invoice);
	if(!isNullOrEmpty(invoice.getFieldValue('custbody_enl_formadepagamento_cobranca')))
	{
		var paymentWay = nlapiLoadRecord('customrecord_enl_payment', invoice.getFieldValue('custbody_enl_formadepagamento_cobranca'));

		if(paymentWay.getFieldValue('custrecord_enl_pw_paymenttype') == "1")
		{
			var url = nlapiResolveURL('SUITELET', 'customscript_enl_loc_boleto_generator_sl', 'customdeploy_enl_loc_boleto_generator_sl', true) + '&internalid=' + invoice.getId() + '&recordtype=invoice';

			var response = nlapiRequestURL(url, null, null, "GET");

			if(response.getCode() == "200")
			{
				var billFile = nlapiCreateFile("Boleto_NF_" + fiscalDocument.Number + ".html", "HTMLDOC", response.getBody());

				files.push(billFile);
			}
		}
	}


	if(invoice.getRecordType() == 'invoice' && fiscalDocument.Status == 3)
	{
		invoice.setFieldValue('approvalstatus',2);
		sendEmail(invoice, files, internalid );
	}


}


function sendEmail (invoice, file, internalid){

	var cliente = invoice.getFieldValue('entity');    // valor id Cliente
	var transportadora = invoice.getFieldValue('custbody_enl_carrierid');  // pega id da transportadora



	if(transportadora != null){
		var carregaTransportadora = nlapiLoadRecord('customrecord_enl_transportadoras',transportadora);// carrega registro de transportadora
		if(carregaTransportadora != null || carregaTransportadora != ""){
			var fornecedor = carregaTransportadora.getFieldValue('custrecord_enl_codigotransportadoras');    // valor id Fornecedor
		}
	}

	var resultados = [cliente, fornecedor];     // resultados dos id's dos clientes / fornecedores

	var template = nlapiGetContext().getSetting('SCRIPT', 'custscript_enl_envioemail');
	var emaildecopia = nlapiGetContext().getSetting('SCRIPT', 'custscript_enl_emailcopianfe');

	if(!isNullOrEmpty(template))
	{
		var emailMerger = nlapiCreateEmailMerger(template);

		emailMerger.setEntity('customer', invoice.getFieldValue('entity'));
		emailMerger.setTransaction(invoice.getId());

		var mergeResult = emailMerger.merge();
		var emailSubject = mergeResult.getSubject();
		var emailBody = mergeResult.getBody();
		var emails = new Array();


		var filtro = [];
		filtro.push(new nlobjSearchFilter('company', null, 'anyof', resultados) );
		var busca = nlapiSearchRecord(null, 'customsearch_enl_invoiceemailcontact', filtro, null);

		if(busca != null )
		{
			for(var i = 1 ; i <=busca.length; i++)
			{
				var retornoEmail = busca[i-1].getValue('email');
				emails.push( retornoEmail );
			}
		}

		var records = new Array();
		records['transaction'] = invoice.getId();

		if(emaildecopia != null || emaildecopia != "")
		{
			emails.push(emaildecopia);
		}

		if(emails.length > 0)
		{
			nlapiSendEmail( nlapiGetContext().getUser() , emails, emailSubject , emailBody , null, null,records, file);
		}
	}
}

function createLocationEntity(internalid)
{
	if(!isNullOrEmpty(internalid))
	{
		var filter = [];
		filter.push(new nlobjSearchFilter('internalid', null, 'anyof', internalid));
		filter.push(new nlobjSearchFilter('isdefaultshipping', null, 'IS', "T"));

		var columns = [];
		columns.push(new nlobjSearchColumn('custentity_enl_legalname'));
		columns.push(new nlobjSearchColumn('custentity_enl_cnpjcpf'));
		columns.push(new nlobjSearchColumn('custentity_enl_ienum'));
		columns.push(new nlobjSearchColumn('custentity_enl_ccmnum'));
		columns.push(new nlobjSearchColumn('phone'));
		columns.push(new nlobjSearchColumn('email'));
		columns.push(new nlobjSearchColumn('zipcode','shippingAddress'));
		columns.push(new nlobjSearchColumn('custrecord_enl_city','shippingAddress'));
		columns.push(new nlobjSearchColumn('address1','shippingAddress')); //Endereco
		columns.push(new nlobjSearchColumn('address2','shippingAddress')); //Complemento
		columns.push(new nlobjSearchColumn('address3','shippingAddress')); // Bairro
		columns.push(new nlobjSearchColumn('custrecord_enl_numero','shippingAddress'));
		columns.push(new nlobjSearchColumn('custrecord_enl_uf','shippingAddress'));
		columns.push(new nlobjSearchColumn('country','shippingAddress'));

		var search = nlapiSearchRecord('entity', null, filter, columns);

		if(search != null)
		{
			var entity = {};

			if(search[0].getRecordType() == "customer" || search[0].getRecordType() == "vendor")
			{
				columns.push(new nlobjSearchColumn('isperson'));
				columns.push(new nlobjSearchColumn('companyname'));

				var search = nlapiSearchRecord(search[0].getRecordType(), null, filter, columns);
			}

			entity.legalname = search[0].getValue('custentity_enl_legalname');
			entity.cpfcnpj = search[0].getValue('custentity_enl_cnpjcpf');
			entity.ienum = search[0].getValue('custentity_enl_ienum');
			entity.ccmnum = search[0].getValue('custentity_enl_ccmnum');
			entity.individual = search[0].getValue('isperson') ==  "T";
			entity.phone = search[0].getValue('phone');
			entity.email = search[0].getValue('email');
			entity.addressZipcode = search[0].getValue('zipcode', 'shippingAddress');
			entity.addressCity = search[0].getText('custrecord_enl_city', 'shippingAddress');
			entity.addressStreet = search[0].getValue('address1', 'shippingAddress');
			entity.addressComplement = search[0].getValue('address2', 'shippingAddress');
			entity.addressNeighborhood = search[0].getValue('address3', 'shippingAddress');
			entity.addressCounty = search[0].getValue('address3', 'shippingAddress');
			entity.addressNumber = search[0].getValue('custrecord_enl_numero', 'shippingAddress');
			entity.addressState = search[0].getText('custrecord_enl_uf', 'shippingAddress');

			if(!isNullOrEmpty(search[0].getValue('custrecord_enl_city', 'shippingAddress')))
			{
				var city = nlapiLoadRecord('customrecord_enl_cities', search[0].getValue('custrecord_enl_city', 'shippingAddress'));
				entity.addressCityCode = city.getFieldValue('custrecord_enl_ibgecode');
			}

			entity.addressCountryCode = getCountryCode(search[0].getValue('country', 'shippingAddress'));
			entity.addressCountry = getCountryISOCode(search[0].getValue('country', 'shippingAddress'));

			return entity;
		}

	}

	return null;
}

/**
 * Create a FILE LOG to hugh payload or several string length
 * Ref: https://netsuite.custhelp.com/app/answers/detail/a_id/10255/kw/nlapiCreateFile#bridgehead_N3067099
 * @param {string} name Name to file: Use extension
 * @param {string} contents Contents to file, used to create files
 * @param {string} type Type supported by netsuite: https://netsuite.custhelp.com/app/answers/detail/a_id/10496
 */
function logInText(name, contents, type) {
	name = name ? name : 'BASIC_LOG.txt'
	contenst = name ? name : 'Nothing inserted'
	type = type ? type : 'PLAINTEXT'

	try {
		const file = nlapiCreateFile(name, type, contents)
		nlapiSubmitField(file)
	}
	catch(err) {
		const txtContent = ''.concat('-> Name: ', name, ' -> Content:', contents, ' -> Type: ', type)
		nlapiLogExecution('DEBUG', 'Erro ao gravar arquivo', txtContent)
	}
}

//NBC-805
function getItemsAccountPO(purchOrder)
{
	var itemAccNumber = [];

	var filter = [];

	for(var i = 1; i <= purchOrder.getLineItemCount('item'); i++)
	{
		if(purchOrder.getLineItemValue('item', 'type', i) != "OthCharge"
			&& purchOrder.getLineItemValue('item', 'type', i) != "TaxItem"
			&& purchOrder.getLineItemValue('item', 'type', i) != "TaxGroup")
		{
			filter.push(purchOrder.getLineItemValue('item', 'item', i));
		}
	}

	var searchAcc = nlapiSearchRecord('item', null, new nlobjSearchFilter('internalid', null, 'anyof', filter), new nlobjSearchColumn('assetaccount'));

	var itemAccounts = [];

	var accounts = [];

	for(var i = 0; searchAcc != null && i < searchAcc.length; i++)
	{
		if(!isNullOrEmpty(searchAcc[i].getValue('assetaccount')))
		{
			accounts.push(searchAcc[i].getValue('assetaccount'));

			//		nlapiLogExecution('DEBUG', 'Account', searchAcc[i].getValue('assetaccount'));

			var itemAccount = {};
			itemAccount.itemid = searchAcc[i].getId();
			itemAccount.account = searchAcc[i].getValue('assetaccount');
			itemAccounts.push(itemAccount);
		}
	}

	if(accounts.length > 0)
	{
		var accNumbers = [];

		//	nlapiLogExecution('DEBUG', 'accounts', accounts);

		var searchNumber = nlapiSearchRecord('account', null, new nlobjSearchFilter('internalid', null, 'anyof', accounts), new nlobjSearchColumn('internalid'));


		for(var i = 0; searchNumber != null && i < searchNumber.length; i++)
		{
			accNumbers[searchNumber[i].getId()] = searchNumber[i].getValue('internalid');
		}

		for(var i = 0; i < itemAccounts.length; i++)
		{
			itemAccNumber[itemAccounts[i].itemid] = accNumbers[itemAccounts[i].account];
		}
	}

	return itemAccNumber;
}

function getReferencedDocuments(line, invoice, i)
{
	line.refAccessKey = invoice.getLineItemValue('item', 'custcol_enl_ref_chaveacesso', i);
}


function getItemsAccountPOv2(purchOrder,item)
{
	var itemAccNumber = [];

	var filter = [];

	filter.push(item);

//	var searchAcc = nlapiSearchRecord('item', null, new nlobjSearchFilter('internalid', null, 'anyof', filter), [new nlobjSearchColumn('assetaccount'),new nlobjSearchColumn('expenseaccount')]);
	var searchAcc = nlapiSearchRecord('item', null, new nlobjSearchFilter('internalid', null, 'anyof', filter), [new nlobjSearchColumn('assetaccount')]);


	var itemAccounts = [];

	var accounts = [];

	for(var i = 0; searchAcc != null && i < searchAcc.length; i++)
	{
		if(!isNullOrEmpty(searchAcc[i].getValue('assetaccount')))
		{
			accounts.push(searchAcc[i].getValue('assetaccount'));
			//nlapiLogExecution('DEBUG', 'Account', searchAcc[i].getValue('assetaccount'));

			var itemAccount = {};
			itemAccount.itemid = searchAcc[i].getId();
			itemAccount.account = searchAcc[i].getValue('assetaccount');
			itemAccounts.push(itemAccount);
		}
		/*		else if(!isNullOrEmpty(searchAcc[i].getValue('expenseaccount')))
                {
                  accounts.push(searchAcc[i].getValue('expenseaccount'));
                  nlapiLogExecution('DEBUG', 'Account', searchAcc[i].getValue('expenseaccount'));

                  var itemAccount = {};
                  itemAccount.itemid = searchAcc[i].getId();
                  itemAccount.account = searchAcc[i].getValue('expenseaccount');
                  itemAccounts.push(itemAccount);
                }*/

	}

	if(accounts.length > 0)
	{
		var accNumbers = [];

		//nlapiLogExecution('DEBUG', 'accounts', accounts);
		var searchNumber = nlapiSearchRecord('account', null, new nlobjSearchFilter('internalid', null, 'anyof', accounts), new nlobjSearchColumn('internalid'));
		for(var i = 0; searchNumber != null && i < searchNumber.length; i++)
		{
			accNumbers[searchNumber[i].getId()] = searchNumber[i].getValue('internalid');
		}

		for(var i = 0; i < itemAccounts.length; i++)
		{
			itemAccNumber[itemAccounts[i].itemid] = accNumbers[itemAccounts[i].account];
		}
	}

	return itemAccNumber;
}

function buildTaxAccountingST(request)
{
	var sorder = request.getParameter('sorder');
	var rtype  = request.getParameter('rtype');
	var tstart  = request.getParameter('start');
	var tend    = request.getParameter('end');



	nlapiLogExecution('DEBUG', 'sorder',  sorder);
	nlapiLogExecution('DEBUG', 'rtype',  rtype);

	var order = nlapiLoadRecord(rtype, sorder);

	var accountingLineCount = order.getLineItemCount('recmachcustrecord_enl_orderid');
	if(accountingLineCount > 0) {
		for (var acct = 1; acct <= accountingLineCount; acct++) {
			order.removeLineItem('recmachcustrecord_enl_orderid', 1, true);
		}
	}

	//nlapiLogExecution("DEBUG", "Functions: ORDER", JSON.stringify(order))

	var taxAccounts = [];
	var columns = [];
	var filter = [];

	if(nlapiGetContext().getFeature('subsidiaries')) {
		filter.push(new nlobjSearchFilter('custrecord_enl_ta_subsidiary', null, 'anyof', order.getFieldValue('subsidiary')));
	}
	columns.push(new nlobjSearchColumn('custrecord_enl_ta_taxtype'));
	columns.push(new nlobjSearchColumn('custrecord_enl_ta_taxpayable'));
	columns.push(new nlobjSearchColumn('custrecord_enl_ta_taxexpense'));
	columns.push(new nlobjSearchColumn('custrecord_enl_ta_taxreceivable'));
	columns.push(new nlobjSearchColumn('custrecord_enl_ta_taxtransitory'))

	var search = nlapiSearchRecord('customrecord_enl_taxaccounting', null, filter, columns);

	for(var i = 0; search != null && i < search.length; i++) {
		taxAccounts[search[i].getValue('custrecord_enl_ta_taxtype')] = search[i];
	}

	if(order.getRecordType() == 'transferorder') {
		var fromLocationType = getLocationType(order.getFieldValue('location'));
		var toLocationType = getLocationType(order.getFieldValue('transferlocation'));
	}

	var retainedAmount = 0;
	order.setFieldValue('custbody_enl_taxwithheld', "F");


	nlapiLogExecution('DEBUG', 'tottax',  order.getLineItemCount('recmachcustrecord_enl_tt_orderid'));
	var taxstart = 0;
	var taxend   = 0;

	if (parseInt(tstart) > 0){
		taxstart = tstart;
	} else {
		taxstart = 1;
	}
	if (parseInt(tend) > 0){
		taxend = tend;
	} else {
		taxend = order.getLineItemCount('recmachcustrecord_enl_tt_orderid');
	}

	for(var taxline = taxstart; taxline <= taxend; taxline++)
	{
		var taxaccount = taxAccounts[order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', taxline)];


		if(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_isretained', taxline) == "T")
		{
			if(parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', taxline)) != 12 &&
				parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', taxline)) != 13 &&
				parseInt(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_tt_taxtype', taxline)) != 14) {
				retainedAmount += parseFloat(order.getLineItemValue('recmachcustrecord_enl_tt_orderid', 'custrecord_enl_taxamount', taxline));
			}
			else {
				order.setFieldValue('custbody_enl_taxwithheld', "T");
			}
		}

		if(taxaccount != null)
		{
			switch(order.getRecordType())
			{
				case 'vendorreturnauthorization':
				case 'salesorder':
				case 'invoice':
					createSalesAccounting(order, taxline, taxaccount);
					break;

				case 'vendorcredit':
					createVendorCreditAccounting(order, taxline, taxaccount);
					break;
				case 'purchaseorder':
				case 'vendorbill':
					createPurchAccounting(order, taxline, taxaccount);
					break;

				case 'returnauthorization':
				case 'creditmemo':
					createSalesReturnAccounting(order, taxline, taxaccount);
					break;

				case 'transferorder':
					if(fromLocationType == 1)
					{
						createSalesAccounting(order, taxline, taxaccount);
					}

					if(fromLocationType == 2 && toLocationType == 1)
					{
						createTransReturnAccounting(order, taxline, taxaccount);
					}
					else if(toLocationType == 1 && fromLocationType == 1)
					{
						createReceiptTransferAccounting(order, taxline, taxaccount);
					}
					break;
			}
		}
	}

	if(retainedAmount > 0)
	{
		order.selectNewLineItem('recmachcustrecord_enl_orderid');
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_linenum',  0);

		//Simple useless object
		var acc = {}
		//Taking subsidiary
		//If Transitory account is setted, take from CustomRecordType

		if(nlapiGetContext().getFeature('subsidiaries') == false) {

			//acc = getVATTaxAccount(order.getRecordType(), order.getLineItemValue('item', 'taxcode', 1))
			//order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', acc);

		} else
		{

			if ( isTransitoryAccount(order.getFieldValue('subsidiary'))) {
				//Take from custrecordType with SUBSIDIARYID and TAXCODEID
				//	acc = getTransitoryAccountByTaxAndSubsidiary(order.getFieldValue('subsidiary'), order.getLineItemValue('item', 'taxcode', 1))
				acc = getTransitoryAccountByTaxAndSubsidiary(order.getFieldValue('subsidiary'), 28); // get account for PCC - transitory

				//Of corse.. may we don't define this account, so, we need other way to work
				if (!acc)
					acc = getVATTaxAccount(order.getRecordType(), order.getLineItemValue('item', 'taxcode', 1));
				order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', acc);
			} else {
				//Flow the simples flux
				acc = getVATTaxAccount(order.getRecordType(), order.getLineItemValue('item', 'taxcode', 1))
				order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_accountnum', acc);
			}
		}

		if(order.getRecordType() == "salesorder" || order.getRecordType() == "invoice")
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_creditamount', retainedAmount.toFixed(2));
		else
			order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_debitamount', retainedAmount.toFixed(2));

		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_transtxt',  "Contabilização de impostos: standardST");
		order.setCurrentLineItemValue('recmachcustrecord_enl_orderid', 'custrecord_enl_impostoretido',  "T");
		order.commitLineItem('recmachcustrecord_enl_orderid');
	}

	var accountingLineCount = order.getLineItemCount('recmachcustrecord_enl_orderid');
	nlapiLogExecution("DEBUG", "accountingLineCountFinal", accountingLineCount);

	var tid = nlapiSubmitRecord(order);

	nlapiLogExecution('DEBUG', 'tid',  tid);

}

function isEmptyObj(obj)
{
	for ( var prop in obj)
	{
		if(obj.hasOwnProperty(prop))
			return false
	}
	return true
}

function getEntityType(entityType)
{
	switch (entityType)
	{
		case "1":
			return "business";

		case "2":
			return "federalGovernment";

		case "3":
			return "stateGovernment";

		case "4":
			return "cityGovernment";

		default:
			return "business";
	}
}

function getUseType(_useTypeId)
{
	switch(_useTypeId)
	{
		case "1":
			return "service";

		case "2":
			return "use or consumption";

		case "3":
			return "resale";

		case "4":
			return "agricultural production";

		case "5":
			return "production";

		case "6":
			return "use or consumption on business establishment";

		case "7":
			return "use or consumption on transporter service establishment";

		case "8":
			return "use or consumption on communication service establishment";

		case "9":
			return "use or consumption on demand by contract";

		case "10":
			return "use or consumption on energy supplier establishment";

		case "11":
			return "use or consumption of fuel transaction type exportation";

		case "12":
			return "use or consumption on services subject to iss";

		case "13":
			return "use or consumption on services subject to icms";

		case "14":
			return "fixed assets";

		case "15":
			return "resale export";

		case "16":
			return "resale icms exempt";

		case "17":
			return "resale buyer under the same icmsSt tax rule";

		case "18":
			return "transport of goods that don't need invoice (nf)";

		case "19":
			return "serviceProduction";

		default:
			return "";
	}
}

function sendToAvatax (url, user, pwd, companyCode, locationCode, object)  {

	const auth = nlapiEncrypt(user + ':' + pwd, 'base64');

	var header = {
		'Authorization': 'Basic ' + auth,
		'Content-Type': 'application/json'
	}
	if (locationCode)
		header['Avalara-Location-Code'] = locationCode
	if (companyCode)
		header['Avalara-Company-Code'] = companyCode

	var response = nlapiRequestURL(url, JSON.stringify(object), header, "POST");
	nlapiLogExecution('DEBUG', 'response', JSON.stringify(response));

	if (response.code == 200)
		return JSON.parse(response.getBody());
	else
		throw response.getBody();
}

function sendToAvataxWithFile (url, user, pwd, companyCode, locationCode, object,transaction)  {

	const auth = nlapiEncrypt(user + ':' + pwd, 'base64');

	var header = {
		'Authorization': 'Basic ' + auth,
		'Content-Type': 'application/json'
	}
	if (locationCode)
		header['Avalara-Location-Code'] = locationCode
	if (companyCode)
		header['Avalara-Company-Code'] = companyCode

	var response = nlapiRequestURL(url, JSON.stringify(object), header, "POST");
	nlapiLogExecution('DEBUG', 'response', JSON.stringify(response));

	var _randomString = randomString(32, '#aA');
	transaction.setFieldValue('custbody_avlr_randomstring', _randomString);

	if (response.code == 200)
	{
		try {
			nlapiGetContext().setSessionObject('avlr_responseobj_p' + _randomString, response.getBody());
			nlapiGetContext().setSessionObject('avlr_requestobj_p' + _randomString, JSON.stringify(object));
		} catch(ee) {
			nlapiLogExecution('ERROR', 'response', JSON.stringify(response));
		}
		return JSON.parse(response.getBody());
	}
	else
		throw response.getBody();
}

function sendToDetermination(subsidiary, locationLoad, nsSalesOrder, operationType, useTpe, salesOrder, type)
{
	try
	{
		var baseURL = subsidiary.getFieldValue('custrecord_enl_urlswfiscal');
		if (!baseURL)
		{
			nlapiLogExecution('ERROR', 'sendToDetermination', 'Campo "FISCAL SW URL" não definido');
			return;
		}

		if(useTpe == "service")
			var _url = baseURL + "/v2/calculations?service-sales"
		else
			var _url = baseURL + "/v2/calculations?goods";

		_url = _url.substr(0, 8).concat(_url.substr(8).replace('//', '/'));
		nlapiLogExecution('DEBUG', "sendToDetermination", _url);

		var user = subsidiary.getFieldValue('custrecord_enl_avataxuser');
		var pwd = subsidiary.getFieldValue('custrecord_enl_pwdavatax');
		var companyCode = subsidiary.getFieldValue('custrecord_enl_companyid');
		var locationCode = locationLoad.getFieldValue('custrecord_enl_fiscalestablishmentid');

		const auth = nlapiEncrypt(user + ':' + pwd, 'base64');

		var header = {
			'Authorization': 'Basic ' + auth,
			'Content-Type': 'application/json'
		}

		if (locationCode)
			header['Avalara-Location-Code'] = nsSalesOrder.header.companyLocation


		if (companyCode)
			header['Avalara-Company-Code'] = companyCode

//	    nlapiLogExecution('DEBUG', 'header', JSON.stringify(header));

		var _randomString = randomString(32, '#aA');
		salesOrder.setFieldValue('custbody_avlr_randomstring', _randomString);

		nlapiGetContext().setSessionObject('avlr_requestobj'+_randomString, JSON.stringify(nsSalesOrder))


		var response = nlapiRequestURL(_url, JSON.stringify(nsSalesOrder), header, "POST");

		nlapiLogExecution('DEBUG', 'IsSuccessStatusCode', JSON.stringify(response));

		if(response.code == 200)
		{
			nlapiLogExecution('DEBUG', 'response', response.getBody());

			nlapiGetContext().setSessionObject('avlr_responseobj'+_randomString, response.getBody())


			response = JSON.parse(response.getBody());

			var avataxCalcOrder = {};
			avataxCalcOrder.CalcOrderLines = [];

			for(var i=0; i < response.lines.length; i++)
			{
				var line = response.lines[i];

				var orderLine = {};
				orderLine.Cfop = null;
				orderLine.LineNum = line.lineCode;

				if(useTpe != "service") // Goods
				{
					if (line.cfop != null)
					{
						var cfop = line.cfop.toString();
						cfop = cfop.substr(0, 1) +"."+ cfop.substr(1, 3);
						orderLine.Cfop = cfop;
					}
				}

				orderLine.Taxes = [];
				orderLine.TaxAmount = 0;
				orderLine.HasIcmsST = false;

				if(salesOrder.getRecordType() == 'transferorder')
				{
					var costAmount = 0;

					if(line.lineAmount)
						costAmount += line.lineAmount;

					if(line.freightAmount)
						costAmount += line.freightAmount;

					if(line.otherCostAmount)
						costAmount += line.otherCostAmount;
				}

				for(var i1 = 0; i1 < line.calculatedTax.details.length; i1++)
				{
					var detail = line.calculatedTax.details[i1];

					if(salesOrder.getRecordType() == 'transferorder')
					{
						if (detail.rate > 0 || detail.cst || detail.cstB)
						{
							var taxDetail = {};

							taxDetail.TaxAmount = detail.tax;
							taxDetail.TaxBaseAmount = detail.subtotalTaxable;
							taxDetail.TaxCode = detail.taxType;
							taxDetail.TaxValue = detail.rate;
							taxDetail.CollectionCode = "";
							//taxDetail.TaxSituation =  detail.TaxType == "icms" ? detail.cstB : detail.cst;

							if (detail.cst)
								taxDetail.TaxSituation = detail.cst;
							else if(detail.cstB)
								taxDetail.TaxSituation = detail.cstB;
							else
								taxDetail.TaxSituation = '';

							taxDetail.Accounting = 0; //getTaxAccounting(detail.taxImpact.accounting)


							if(detail.taxType == "icms")
								taxDetail.IsCredit = true;

							if (taxDetail.IsCredit)
								costAmount -= taxDetail.TaxAmount;

							switch (detail.taxImpact.impactOnFinalPrice)
							{
								case "Add":
									taxDetail.Operation = "+";
									costAmount += taxDetail.TaxAmount;
									break;

								case "Subtracted":
									taxDetail.Operation = "-";
									costAmount -= taxDetail.TaxAmount;
									break;

								default:
									taxDetail.Operation = "=";
									break;
							}

							orderLine.Taxes.push(taxDetail);

						}
					}
					else if(useTpe != "service") // Goods
					{
						if (detail.rate > 0 || detail.cst || detail.cstB)
						{
							var taxDetail = {};

							switch (detail.taxImpact.impactOnFinalPrice)
							{
								case "Add":
									taxDetail.Operation = "+";
									break;

								case "Subtracted":
									taxDetail.Operation = "-";
									break;

								default:
									taxDetail.Operation = "=";
									break;
							}
							
							if(detail.taxImpact.impactOnFinalPrice == "Included" && detail.taxImpact.impactOnNetAmount == "Subtracted")
							{
								taxDetail.IsRetained = true;
								taxDetail.Operation = "-";
							}
							

							taxDetail.TaxAmount = detail.tax;
							taxDetail.TaxBaseAmount = detail.subtotalTaxable;
							taxDetail.TaxCode = detail.taxType;
							taxDetail.TaxValue = detail.rate;

							if(detail.collectionCode)
								taxDetail.CollectionCode = detail.collectionCode;
							else
								taxDetail.CollectionCode = "";

							taxDetail.Accounting = getTaxAccounting(detail.taxImpact.accounting)

							if (detail.cst)
								taxDetail.TaxSituation = detail.cst;
							else if(detail.cstB)
								taxDetail.TaxSituation = detail.cstB;
							else
								taxDetail.TaxSituation = '';
							
							var finalprice = operationType.getFieldValue('custrecord_enl_ot_finalprice') == "T";

							if (taxDetail.Operation == "+" && (!finalprice || detail.taxType == "icmsSt" || detail.taxType == "icmsStFCP"))
								orderLine.TaxAmount += taxDetail.TaxAmount;

							if (taxDetail.Operation == "-")
								orderLine.TaxAmount -= taxDetail.TaxAmount;

							if (detail.TaxType == "icmsSt" && taxDetail.TaxSituation == "60")
								orderLine.HasIcmsST = true;


							orderLine.Taxes.push(taxDetail);

						}
					}
					else // Service
					{
						if (detail.rate > 0)
						{
							var taxDetail = {};

							switch (detail.taxImpact.impactOnNetAmount)
							{
								case "Add":
									taxDetail.Operation = "+";
									break;

								case "Subtracted":
									taxDetail.Operation = "-";
									break;

								default:
									taxDetail.Operation = "=";
									break;
							}

							taxDetail.TaxAmount = detail.tax;
							taxDetail.TaxBaseAmount = detail.subtotalTaxable;
							taxDetail.TaxCode = detail.taxType;
							taxDetail.TaxValue = detail.rate;

							if(detail.collectionCode)
								taxDetail.CollectionCode = detail.collectionCode;
							else
								taxDetail.CollectionCode = "";

							taxDetail.Accounting = 0;//getTaxAccounting(detail.taxImpact.accounting)

							if(detail.cst)
								taxDetail.TaxSituation = detail.cst;
							else
								taxDetail.TaxSituation = "";

							taxDetail.IsRetained = detail.taxImpact.impactOnNetAmount == "Subtracted" ? true : false;
							taxDetail.IsCredit = false;

							if (taxDetail.Operation == "+")
								orderLine.TaxAmount += taxDetail.TaxAmount;

							if (detail.taxType == "irrf" && detail.cst == "02")
								taxDetail.TaxCode = "irrfAuto";

							if (taxDetail.IsRetained)
							{
								orderLine.TaxAmount -= taxDetail.TaxAmount;
								orderLine.Taxes.push(taxDetail);
							}
							else
								orderLine.Taxes.push(taxDetail);

						}

					}// end Service

				} // end for calculatedTax.details

				if(salesOrder.getRecordType() == 'transferorder')
				{
					orderLine.UnitCost = costAmount / line.numberOfItems;
					orderLine.TaxRateAmount = 0;
				}
				else
					orderLine.TaxRateAmount = orderLine.TaxAmount / line.numberOfItems;

				avataxCalcOrder.CalcOrderLines.push(orderLine);
			}

			var nsResponse = {};
			nsResponse.Status = true;
			nsResponse.Message = "Calculo efetuado com sucesso";
			nsResponse.ObjectReturn = avataxCalcOrder;
		}
		else
		{
			var nsResponse = {};
			nsResponse.Status = false;
			nsResponse.Message = response.getBody();
			nsResponse.ObjectReturn = null;
		}

		return nsResponse;
	}
	catch (e)
	{
		var nsResponse = {};
		nsResponse.Status = false;
		nsResponse.Message = JSON.stringify(e);
		nsResponse.ObjectReturn = null;

		return nsResponse;
	}
}

function getTaxAccounting(accounting)
{
	switch (accounting)
	{
		case "liability":
			return 0;
			break;
		case " credit":
			return 1;
			break;
		case "none":
			return 2;
			break;
		case "asset":
			return 3;
			break;
		default:
			return "";
			break;
	}
}

function attachFile(fileName, contentFile, _recordLoad)
{
	var file = nlapiCreateFile(fileName, 'JSON', contentFile);
	var fileFolder = nlapiGetContext().getSetting('SCRIPT', 'custscript_enl_xmlfolder');

	if(fileFolder)
	{
		file.setFolder(fileFolder);
		var submitId = nlapiSubmitFile(file);

		nlapiLogExecution('DEBUG', 'attachFile', _recordLoad.getRecordType() + ' : ' + _recordLoad.getId());
		nlapiAttachRecord('file', submitId, _recordLoad.getRecordType(), _recordLoad.getId());
	}
	else
	{
		nlapiLogExecution('ERROR', 'attachFile', 'Pasta não configurada.');
	}
}

function softwareFiscalNA(subsidiary)
{
	var softwareFiscalNA = subsidiary.getFieldValue('custrecord_enl_softwarefiscal') == 1;
	if(softwareFiscalNA)
		nlapiLogExecution('ERROR', 'softwareFiscalNA', 'Software Fiscal N/A.');

	return softwareFiscalNA
}

function periodClosedAndlockCalc(salesOrder, subsidiary)
{
	var postingPeriod = null;
	var periodClosed = null;

	if (nlapiGetRecordType() != 'salesorder')
	{
		postingPeriod = salesOrder.getFieldValue('postingperiod');
		if(postingPeriod)
			periodClosed = nlapiLookupField('accountingperiod', postingPeriod, 'closed');
	}


	var lockCalc = subsidiary.getFieldValue('custrecord_avlr_lock_calc');
	// var calculated = salesOrder.getFieldValue('custbody_avlr_calculated');

//	nlapiLogExecution('DEBUG', 'periodClosed', periodClosed );
//	nlapiLogExecution('DEBUG', 'lockCalc', lockCalc );


	// Return if LockCalc is enable and AcctPeriod closed

	if( periodClosed == 'T' &&  lockCalc == 'T')
	{
		nlapiLogExecution('DEBUG', 'periodClosedAndlockCalc', 'Period Closed And lockCalc' );
		return true;
	}
	else
		return false

	/* calculated field just use to vendorbill not issued by us.

     //Return if LockCalc is enable and Invoice is Calculated

     if ( calculated == 'T' &&  lockCalc == 'T'){
         nlapiLogExecution('DEBUG', 'returnCalc' );
         return ;

     }
     */
}

function returnIssued(salesOrder, subsidiary, issueInvoice)
{
	var lockCalc = subsidiary.getFieldValue('custrecord_avlr_lock_calc');
	var fiscalDocStatus = salesOrder.getFieldValue('custbody_enl_fiscaldocstatus');

	if ((((fiscalDocStatus == 3) || (fiscalDocStatus == 5)) && lockCalc == 'T') && issueInvoice == 'T' )
	{
		nlapiLogExecution('DEBUG', 'returnIssued', 'Return Issued' ); // devolução emitida
		return true;
	}
	else
	{
		//nlapiLogExecution('DEBUG', 'returnIssued', 'Return not Issued' ); // devolução não emitida
		return false;
	}
}

function removeSpecialCharacter(str)
{
	return str.replace(/\W/g,"");
}

function sendToDeterminationCompanyItem(nsProduct, subsidiary, product)
{
	try
	{
		var baseURL = subsidiary.getFieldValue('custrecord_enl_urlswfiscal');
		if (!baseURL)
		{
			nlapiLogExecution('ERROR', 'sendToDetermination', 'Campo "FISCAL SW URL" não esta definido.');
			return;
		}

		var header = {};

		//nlapiLogExecution('DEBUG', "encodeURI", encodeURIComponent(nsProduct.code));

		var _itemtype = product.getFieldValue('itemtype');
		if(_itemtype == "Service")
		{
			header["Avalara-Product-Type"] = "service";

			var _url = baseURL + "/v2/companies/items/" + encodeURIComponent(nsProduct.code) + "?service";
		}
		else
		{
			header["Avalara-Product-Type"] = "goods";

			var _url = baseURL + "/v2/companies/items/" + encodeURIComponent(nsProduct.code) + "?goods";
		}

		_url = _url.substr(0, 8).concat(_url.substr(8).replace('//', '/'));
		nlapiLogExecution('DEBUG', "sendToDetermination", _url);

		var user = subsidiary.getFieldValue('custrecord_enl_avataxuser');
		var pwd = subsidiary.getFieldValue('custrecord_enl_pwdavatax');
		var companyCode = subsidiary.getFieldValue('custrecord_enl_companyid');

		const auth = nlapiEncrypt(user + ':' + pwd, 'base64');

		header["Authorization"] = "Basic " + auth;
		header["Content-Type"] = "application/json";


		if (companyCode)
			header["Avalara-Company-Code"] = companyCode


		var response = nlapiRequestURL(_url, null, header, "GET");
		if(response.code == 200)
		{
			nlapiLogExecution('DEBUG', "response GET", response.getBody());

			var response = nlapiRequestURL(_url, JSON.stringify(nsProduct), header, "PUT");
			if(response.code == 204)
				nlapiLogExecution('DEBUG', "response PUT", "Success " + response.code);
			else
				nlapiLogExecution('ERROR', "response PUT", JSON.stringify(response));
		}
		else
		{
			nlapiLogExecution('ERROR', "response GET", + response.code + " : " + response.getBody());

			if(_itemtype == "Service")
			{
				var _url = baseURL + "/v2/companies/items?service"

				if(!nsProduct.agast)
					nsProduct.agast = "BRLC"
			}
			else
			{
				var _url = baseURL + "/v2/companies/items?goods"

				if(!nsProduct.agast)
					nsProduct.agast = "BRNCM";
			}

			_url = _url.substr(0, 8).concat(_url.substr(8).replace('//', '/'));
			nlapiLogExecution('DEBUG', "sendToDetermination", _url);

			var response = nlapiRequestURL(_url, JSON.stringify(nsProduct), header, "POST");
			if(response.code == 201)
			{
				nlapiLogExecution('DEBUG', "response POST", "Success " + response.code + " : " + response.getBody());
			}
			else
			{
				nlapiLogExecution('ERROR', "response POST", JSON.stringify(response));

			}
		}

		return response;

	}
	catch (e)
	{
		throw e;
	}
}

function getSourceItem(source)
{
	switch (source)
	{
		case "1": // Comprado
			return "0";
		case "2": // Importado
			return "1";
		case "3": // Importado Mercado Interno
			return "2";
		case "4": // Nacional - Importação superior 40% e Inferior a 70%
			return "3";
		case "5": // Nacional - Produzido conforme decreto
			return "4";
		case "6": // Nacional - Importação inferior 40%
			return "5";
		case "7": // Importado direto Camex
			return "6";
		case "8": // Importado Mercado Interno Camex
			return "7";
		case "9": // Nacional - mercadoria ou bem com conteúdo superior a 70%
			return "8";
		default:
			return "0";
	}
}

function getProductType(_productTypeId)
{
	switch (_productTypeId)
	{
		case "1":
			return "FOR PRODUCT";

		case "2":
			return "FOR MERCHANDISE";

		case "3":
			return "NO RESTRICTION";

		case "4":
			return "SERVICE";

		case "5":
			return "FEEDSTOCK";

		case "6":
			return "FIXED ASSETS";

		case "7":
			return "PACKAGING";

		case "8":
			return "PRODUCT IN PROCESS";

		case "9":
			return "SUBPRODUCT";

		case "10":
			return "INTERMEDIATE PRODUCT";

		case "11":
			return "MATERIAL FOR USAGE AND CONSUMPTION";

		case "12":
			return "OTHER INPUTS";

		default:
			return "FOR MERCHANDISE";
	}
}

function sendToDeterminationProcessStatus(nsInvoiceStatusObj, subsidiary, invoice)
{
	try
	{
		var baseURL = subsidiary.getFieldValue('custrecord_enl_urlswfiscal');
		if (!baseURL)
		{
			nlapiLogExecution('ERROR', 'sendToDetermination', 'Campo "FISCAL SW URL" não esta definido.');
			return;
		}


		if(nsInvoiceStatusObj.documenttype == "NFS") //Service Invoice
		{
			if(nsInvoiceStatusObj.series)
				baseURL += '/v2/invoices/service/' + nsInvoiceStatusObj.series + '/' + nsInvoiceStatusObj.accessKey;
			else
				baseURL += '/v2/invoices/service/1/' + nsInvoiceStatusObj.accessKey;
		}
		else
			baseURL += '/v2/invoices/sefaz/' + nsInvoiceStatusObj.accessKey;

		baseURL = baseURL.substr(0, 8).concat(baseURL.substr(8).replace('//', '/'));
		nlapiLogExecution('DEBUG', "sendToDeterminationProcessStatus", baseURL);

		var user = subsidiary.getFieldValue('custrecord_enl_avataxuser');
		var pwd = subsidiary.getFieldValue('custrecord_enl_pwdavatax');

		const auth = nlapiEncrypt(user + ':' + pwd, 'base64');

		var header = {};
		header["Authorization"] = "Basic " + auth;
		header["Content-Type"] = "application/json";

		if (nsInvoiceStatusObj.company)
			header["Avalara-Company-Code"] = nsInvoiceStatusObj.company;

		if (nsInvoiceStatusObj.establishment)
			header['Avalara-Location-Code'] = nsInvoiceStatusObj.establishment

		var nsResponseObj = nlapiRequestURL(baseURL, null, header, "GET");
		// var nsResponseObj = {"code":400,"body":"{\"error\":{\"code\":\"000\",\"message\":\"No document found.\"}}","error":null,"objectType":"nlobjServerResponse","contentType":"application/json; charset=utf-8","displayValue":"code=400","allHeaders":["Access-Control-Allow-Origin","content-length","Content-Security-Policy","Content-Type","Cross-Origin-Embedder-Policy","Cross-Origin-Opener-Policy","Cross-Origin-Resource-Policy","Date","Expect-CT","Origin-Agent-Cluster","Referrer-Policy","Strict-Transport-Security","Via","X-Content-Type-Options","X-DNS-Prefetch-Control","X-Download-Options","X-Frame-Options","X-Permitted-Cross-Domain-Policies","X-XSS-Protection"]}

		nlapiLogExecution('DEBUG', "response", JSON.stringify(nsResponseObj));

		var response = JSON.parse(nsResponseObj.body);

		var nsReponse = {};
		nsReponse.ObjectReturn = {};

		if(nsResponseObj.code == 200)
		{
			setNsResponseObjSuccess();
		}
		else
		{
			nlapiLogExecution('ERROR', "response.code " + nsResponseObj.code, nsResponseObj.body);

			if(response.error.message && response.error.message.indexOf('No document found.') > -1 && nsInvoiceStatusObj.documenttype != "NFS")
			{
				baseURL = subsidiary.getFieldValue('custrecord_enl_urlswfiscal');

				var invoiceNumber = nsInvoiceStatusObj.accessKey.substr(25,9);
				var invoiceModel = nsInvoiceStatusObj.accessKey.substr(20,2);

				baseURL += '/v2/invoices/sefaz/' + nsInvoiceStatusObj.series + '/' + invoiceNumber + '/' + invoiceNumber + '/' + invoiceModel;

				baseURL = baseURL.substr(0, 8).concat(baseURL.substr(8).replace('//', '/'));
				nlapiLogExecution('DEBUG', "No document found.", baseURL);

				nsResponseObj = nlapiRequestURL(baseURL, null, header, "GET");

				nlapiLogExecution('DEBUG', "responseCode", nsResponseObj.code);
				nlapiLogExecution('DEBUG', "responseBody", nsResponseObj.body);

				if(nsResponseObj.code == 200)
				{
					response = JSON.parse(nsResponseObj.body)[0];

					if(response.status.accessKey) 
					{
						nlapiLogExecution('DEBUG', "Update AccessKey",  response.status.accessKey);
						invoice.setFieldValue('custbody_enl_accesskey', response.status.accessKey);
					}	
					

					setNsResponseObjSuccess();
				}
				else
				{
					response = JSON.parse(nsResponseObj.body);
					setNsResponseObjError()
				}
			}
			else
			{
				setNsResponseObjError();
			}
		}

		// nlapiLogExecution('ERROR', "nsReponse", JSON.stringify(nsReponse));

		return nsReponse;
	}
	catch (e)
	{
		var nsReponse = {};
		nsReponse.ObjectReturn = {};
		nsReponse.Status = true;

		if(nsInvoiceStatusObj.documenttype == "NFS")
			nsReponse.ObjectReturn.Accesskey = nsInvoiceStatusObj.accessKey;
		else
			nsReponse.ObjectReturn.Accesskey = nsInvoiceStatusObj.accessKey.substr(25,9);

		nsReponse.ObjectReturn.Status = 7;
		nsReponse.ObjectReturn.Message = JSON.stringify(e);

		return nsReponse;
	}

	function setNsResponseObjSuccess()
	{
		nsReponse.Status = true;

		var nfeXML = nlapiDecrypt(response.xml.base64, 'base64');

		nsReponse.ObjectReturn.Xml = nfeXML;

		if(response.pdf.cityLink)
			nsReponse.ObjectReturn.Urldanfe = response.pdf.cityLink;
		else
			nsReponse.ObjectReturn.Urldanfe = response.pdf.link;


		nsReponse.ObjectReturn.Status = response.status.code == '100' ? 3 : 2;

		if(nsInvoiceStatusObj.documenttype == "NFS")
			nsReponse.ObjectReturn.Accesskey = response.status.accessKey; 
		else
			nsReponse.ObjectReturn.Accesskey = nsInvoiceStatusObj.accessKey;

		nsReponse.ObjectReturn.Message = response.status.desc;
		nsReponse.ObjectReturn.Protocol = response.status.protocol ? response.status.protocol : '';

		if(nsInvoiceStatusObj.documenttype == "NFS")
			nsReponse.ObjectReturn.Number = response.status.nfseNumber;
		else
			nsReponse.ObjectReturn.Number = nsInvoiceStatusObj.accessKey.substr(25,9);
	}

	function setNsResponseObjError()
	{
		nsReponse.Status = true;

		if(nsInvoiceStatusObj.documenttype == "NFS")
			nsReponse.ObjectReturn.Accesskey = nsInvoiceStatusObj.accessKey;
		else
			nsReponse.ObjectReturn.Accesskey = nsInvoiceStatusObj.accessKey.substr(25,9);

		nsReponse.ObjectReturn.Status = 7;
		nsReponse.ObjectReturn.Message = response.error.message;
	}
}

function getActivitySector(_activityId)
{
	switch (_activityId)
	{
		case "1":
			return "wholesale";

		case "2":
			return "retail";

		case "3":
			return "industry";

		case "4":
			return "finalConsumer";

		case "5":
			return "service";

		case "6":
			return "ruralProducer";

		case "7":
			return "publicAgency";

		default:
			return "";

	}
}

function randomString(length, chars)
{
	var mask = '';
	if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
	if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	if (chars.indexOf('#') > -1) mask += '0123456789';
	if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
	var result = '';
	for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
	return result;
}

function isSimpleTaxPayer(vendorOrCustomer) {
	var taxRegime = vendorOrCustomer.getFieldValue('custentity_avlr_federaltaxationregime');
	nlapiLogExecution('DEBUG', "taxRegime", taxRegime);
	if (taxRegime) {
		return taxRegime == "3" || taxRegime == "4" ? true : false;
	} else {
		return vendorOrCustomer.getFieldValue('custentity_enl_simplesnacional') == "T" ? true : false;
	}
}

function isMei(vendorOrCustomer) {
	var taxRegime = vendorOrCustomer.getFieldValue('custentity_avlr_federaltaxationregime');
	nlapiLogExecution('DEBUG', "taxRegime", taxRegime);
	if (taxRegime)
		return taxRegime == "5" ? true : false;
	else
		return vendorOrCustomer.getFieldValue('custentity_enl_mei') == "T" ? true : false;
}