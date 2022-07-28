function beforeLoad(type, form) 
{
	try 
	{
		runHideFields(type, form);
	} 
	catch (e) 
	{
		nlapiLogExecution('DEBUG', 'beforeLoad', e);
	}
}

function purchSaveRecord(type)
{
	if(type == 'delete' || type == 'xedit') //Added for eInvoicing
		return;

	try
	{
		var purchOrder = nlapiGetNewRecord();//nlapiLoadRecord(nlapiGetRecordType(),purchOrderId, null);
		var _notNseMiddle = false; //purchOrder.getFieldValue('custbody_avlr_not_use_middle') == 'F';

		var response;
		var nsResponse = { };
		nsResponse.Status = false;
		//nlapiLogExecution('DEBUG', '_notNseMiddle', _notNseMiddle);
		var vendorType = vendorType = (purchOrder.getRecordType() == 'purchaseorder' || purchOrder.getRecordType() == 'vendorbill' ? 'vendor' : 'customer');
		var vendorPrefix = (purchOrder.getRecordType() == 'purchaseorder' || purchOrder.getRecordType() == 'vendorbill' ? 'F' : 'C');

		//nlapiLogExecution('DEBUG', 'Void', purchOrder.getFieldValue('void'));
		var _memo = purchOrder.getFieldValue('memo');
		//nlapiLogExecution('DEBUG', 'memo', _memo);

		if ( (purchOrder.getFieldValue('void') == 'VoidVoid') ||
			(purchOrder.getFieldValue('void') == 'Void') || (_memo == 'void') ||
			(purchOrder.getFieldValue('void') == 'VoidAnular') )
		{
			nlapiLogExecution('DEBUG', 'void', purchOrder.getFieldValue('void'));
			return ;
		}

		if (_notNseMiddle) {
			//#region Use Middleware to send to Avatax
			// var vendorPredix = 'F'
			// var purchOrder = nlapiGetNewRecord();//nlapiLoadRecord(nlapiGetRecordType(),purchOrderId, null);

//
//			var nsPurchOrder = new Object();
//
//			nsPurchOrder.type = 'purchorder';
//			nsPurchOrder.suframaId = "";
//
//			var vendorAddress;
//			// vendorType = (purchOrder.getRecordType() == 'purchaseorder' || purchOrder.getRecordType() == 'vendorbill' ? vendorType : 'customer')
//			// vendorPrefix = (purchOrder.getRecordType() == 'purchaseorder' || purchOrder.getRecordType() == 'vendorbill' ? vendorPredix : 'C')
//
//			var vendor = nlapiLoadRecord(vendorType, purchOrder.getFieldValue('entity'));
//
//			var entitynumber = vendor.getFieldValue('entitynumber') ? vendor.getFieldValue('entitynumber') : vendor.id;
//			nsPurchOrder.vendorId = ''.concat(vendorPrefix, entitynumber);
//
//			nsPurchOrder.activitySector = vendor.getFieldValue('custentity_enl_ent_activitysector');
//			nsPurchOrder.isSimpleTaxPayer = vendor.getFieldValue('custentity_enl_simplesnacional') == "T";
//			nsPurchOrder.vendTaxPayer = vendor.getFieldValue('custentity_enl_statetaxpayer') == "T" ? true : false;
//			nsPurchOrder.mei = vendor.getFieldValue('custentity_enl_mei') == "T" ? true : false;
//			nsPurchOrder.entityType = vendor.getFieldValue('custentity_enl_entitytype');
//			nsPurchOrder.partnerFederalTaxId = vendor.getFieldValue('custentity_enl_cnpjcpf');
//			nsPurchOrder.isIndividual = vendor.getFieldValue('isperson') == "T";
//			vendorAddress = vendor.viewLineItemSubrecord('addressbook', 'addressbookaddress',1);
//			nsPurchOrder.suframaId = vendor.getFieldValue('custentity_enl_suframaid');
//			nsPurchOrder.subjectToPayrollTaxRelief = vendor.getFieldValue('custentity_avlr_subjectpayrolltaxrelief') == "T"
//			nsPurchOrder.pisCofinsReliefZF = vendor.getFieldValue('custentity_avlr_piscofinsrelizefzf') == "T";
//
//			if(vendorType === 'vendor'){
//				nsPurchOrder.pisfopag = vendor.getFieldValue('custentity_avlr_pisfopag') === 'T' ? true : false
//			}
//
//			nlapiLogExecution('DEBUG', 'nsPurchOrder-01', JSON.stringify(nsPurchOrder))
//			if(nlapiGetContext().getFeature('subsidiaries') == false)
//			{
//				var subsidiary = nlapiLoadConfiguration('companyinformation');
//			}
//			else
//			{
//				var subsidiaryId = purchOrder.getFieldValue('subsidiary');
//
//				if (!isNullOrEmpty(subsidiaryId))
//				{
//					var subsidiary = nlapiLoadRecord('subsidiary', subsidiaryId);
//					nsPurchOrder.companyid = subsidiary.getFieldValue('custrecord_enl_companyid');
//					nsPurchOrder.companyName = subsidiary.getFieldValue('name');
//
//					if(subsidiary.getFieldValue('custrecord_enl_softwarefiscal') == 1)
//						return;
//				}
//				else
//				{
//					return;
//				}
//			}
//		// change for lockcalc
//
//			var postingPeriod = purchOrder.getFieldValue('postingperiod');
//			var periodClosed = null ;
//
//			if(!isNullOrEmpty(postingPeriod)) {
//				periodClosed = nlapiLookupField('accountingperiod', postingPeriod, 'closed')
//			}
//
//			var lockCalc = subsidiary.getFieldValue('custrecord_avlr_lock_calc');
//			var calculated = purchOrder.getFieldValue('custbody_avlr_calculated');
//
//			nlapiLogExecution('DEBUG', 'periodClosed', periodClosed );
//			nlapiLogExecution('DEBUG', 'lockCalc', lockCalc );
//			nlapiLogExecution('DEBUG', 'calculated', calculated );
//
//
//
//			// Return if LockCalc is enable and AcctPeriod closed
//
//			if( periodClosed == 'T' &&  lockCalc == 'T'){
//				nlapiLogExecution('DEBUG', 'returnperiodClosed' );
//				return;
//			}
//
//			//Return if LockCalc is enable and Invoice is Calculated
//
//			if ( calculated == 'T' &&  lockCalc == 'T'){
//				nlapiLogExecution('DEBUG', 'returnCalc' );
//				return ;
//
//			}
//
//			var documentTypeId = purchOrder.getFieldValue('custbody_enl_order_documenttype');
//			var issueInvoice = null;
//
//			if(!isNullOrEmpty(documentTypeId))
//			{
//				var documentType = nlapiLoadRecord('customrecord_enl_fiscaldocumenttype', documentTypeId);
//				nsPurchOrder.documenttype = documentType.getFieldValue('custrecord_enl_fdt_shortname');
//				nsPurchOrder.issueinvoice = documentType.getFieldValue('custrecord_enl_issuereceiptdocument') == "T";
//				issueInvoice = documentType.getFieldValue('custrecord_enl_issuereceiptdocument') ;
//
//				if (documentType.getFieldValue('custrecord_enl_sendtofiscal') == "F")
//					return true;
//			}
//			else
//				return true;
//
//	//Return if LockCalc is enable and Invoice is Issued
//
//			nlapiLogExecution('DEBUG', 'NFStatus', purchOrder.getFieldValue('custbody_enl_fiscaldocstatus') );
//
//
//			if ( (((purchOrder.getFieldValue('custbody_enl_fiscaldocstatus') == 3)  ||  (purchOrder.getFieldValue('custbody_enl_fiscaldocstatus') == 5 )  )
//				&&  lockCalc == 'T' ) && issueInvoice == 'T' )
//			{
//				nlapiLogExecution('DEBUG', 'returnIssued' );
//				return ;
//			}
//
//			var locationId = purchOrder.getFieldValue('location');
//
//
//			if(!isNullOrEmpty(locationId))
//			{
//				var location = nlapiLoadRecord('location', locationId);
//				nsPurchOrder.establishment = location.getFieldValue('custrecord_enl_fiscalestablishmentid');
//				nsPurchOrder.locationcpfCnpjNum = location.getFieldValue('custrecord_enl_locationcnpj');
//				nsPurchOrder.locationieNum = location.getFieldValue('custrecord_enl_locationienum');
//				nsPurchOrder.locationccmNum = location.getFieldValue('custrecord_enl_locationccmnum');
//
//				var locationaddress = location.viewSubrecord('mainaddress');
//
//				if(locationaddress != null)
//				{
//					nsPurchOrder.locationAddress = buildAddress(locationaddress);
//					nsPurchOrder.shipAddress = buildAddress(locationaddress);
//
//					if(!isNullOrEmpty(purchOrder.getFieldValue('custbody_enl_transportdestination')) && !isNullOrEmpty(purchOrder.getFieldValue('custbody_enl_transportdestinationzip')))
//					{
//						var city = nlapiLoadRecord('customrecord_enl_cities', purchOrder.getFieldValue('custbody_enl_transportdestination'));
//
//						nsPurchOrder.locationAddress.CityName = purchOrder.getFieldText('custbody_enl_transportdestination')
//						nsPurchOrder.locationAddress.CityCode = city.getFieldValue('custrecord_enl_ibgecode');
//						nsPurchOrder.locationAddress.State = city.getFieldText('custrecord_enl_citystate');
//						nsPurchOrder.locationAddress.Zipcode = purchOrder.getFieldValue('custbody_enl_transportdestinationzip');
//
//						nsPurchOrder.shipAddress.CityName = purchOrder.getFieldText('custbody_enl_transportdestination')
//						nsPurchOrder.shipAddress.CityCode = city.getFieldValue('custrecord_enl_ibgecode');
//						nsPurchOrder.shipAddress.State = city.getFieldText('custrecord_enl_citystate');
//						nsPurchOrder.shipAddress.Zipcode = purchOrder.getFieldValue('custbody_enl_transportdestinationzip');
//					}
//				}
//			}
//			else
//			{
//				return;
//			}
//
//			var operationTypeId = purchOrder.getFieldValue('custbody_enl_operationtypeid');
//
//			if(!isNullOrEmpty(operationTypeId))
//			{
//				var operationType = nlapiLoadRecord('customrecord_enl_operationtype', operationTypeId);
//				nsPurchOrder.operationtypeid = operationType.getFieldValue('custrecord_enl_ot_altname');
//				nsPurchOrder.usetype = operationType.getFieldValue('custrecord_enl_ot_usetype');
//				nsPurchOrder.finalprice = operationType.getFieldValue('custrecord_enl_ot_finalprice') == "T";
//			}
//			else
//			{
//				return;
//			}
//
//
//			nsPurchOrder.ordertype = 'Entrada';
//
//			if(type != 'create')
//			{
//				if(purchOrder.getRecordType() == "purchaseorder")
//					nsPurchOrder.purchid = purchOrder.getFieldValue('tranid');
//				else
//					nsPurchOrder.purchid = purchOrder.getFieldValue('transactionnumber');
//			}
//			nsPurchOrder.accesskey = purchOrder.getFieldValue('custbody_enl_ref_chaveacesso');
//			nsPurchOrder.purchdate = purchOrder.getFieldValue('trandate');
//			nsPurchOrder.currency = purchOrder.getFieldValue('currencyname');
//			nsPurchOrder.landingstate = purchOrder.getFieldText('custbody_enl_trans_landingstate');
//			nsPurchOrder.landingport = purchOrder.getFieldValue('custbody_enl_trans_landingport');
//
//			var bill_address = purchOrder.viewSubrecord('billingaddress');
//
//			if(bill_address != null)
//			{
//				nsPurchOrder.billAddress = buildAddress(bill_address);
//
//				if(!isNullOrEmpty(purchOrder.getFieldValue('custbody_enl_transportorigin')) && !isNullOrEmpty(purchOrder.getFieldValue('custbody_enl_transportoriginzip')))
//				{
//					var city = nlapiLoadRecord('customrecord_enl_cities', purchOrder.getFieldValue('custbody_enl_transportorigin'));
//
//					nsPurchOrder.billAddress.CityName = purchOrder.getFieldText('custbody_enl_transportorigin')
//					nsPurchOrder.billAddress.CityCode = city.getFieldValue('custrecord_enl_ibgecode');
//					nsPurchOrder.billAddress.State = city.getFieldText('custrecord_enl_citystate');
//					nsPurchOrder.billAddress.Zipcode = purchOrder.getFieldValue('custbody_enl_transportoriginzip');
//
//				}
//			}
//			else
//			{
//				nsPurchOrder.billAddress = buildAddress(vendorAddress);
//			}
//
//			nsPurchOrder.issRate = purchOrder.getFieldValue('custbody_enl_customissrate');
//			nsPurchOrder.icmsRate = purchOrder.getFieldValue('custbody_enl_customicmsrate');
//			nsPurchOrder.hasCPOM = purchOrder.getFieldValue('custbody_enl_hascpom') == "T";
//			nsPurchOrder.issWithhold = purchOrder.getFieldValue('custbody_enl_forceisswithhold') == "T" ? true : false;
//
//			nsPurchOrder.deliveryLocation = createLocationEntity(purchOrder.getFieldValue('custbody_enl_deliverylocation'));
//
//			var nsPurchLine = new Array();
//			var itemAccounts = null;
//
//			if(nlapiGetContext().getFeature('subsidiaries') == true)
//			{
//				//itemAccounts = getItemsAccount(purchOrder);
//				// comment as only used fot taxcloud. We will user in a near future for TD integration. marcel 25-08-2020
//				itemAccounts = [];
//			}
//			else
//			{
//				itemAccounts = [];
//			}
//
//			for(var i = 1; i <= purchOrder.getLineItemCount('item'); i++)
//			{
//				if(purchOrder.getLineItemValue('item', 'type', i) != "OthCharge"
//				&& purchOrder.getLineItemValue('item', 'type', i) != "TaxItem"
//				&& purchOrder.getLineItemValue('item', 'type', i) != "TaxGroup")
//				{
//					var purchLine = new Object();
//
//					purchLine.linenum = i;
//					purchLine.itemId = getItemId(purchOrder.getLineItemValue('item', 'item', i),purchOrder.getLineItemValue('item', 'itemtype', i));
//					purchLine.qty = purchOrder.getLineItemValue('item', 'quantity', i);
//					purchLine.unitprice = parseFloat(purchOrder.getLineItemValue('item', 'rate', i)).toFixed(5);
//					purchLine.discount	= parseFloat(purchOrder.getLineItemValue('item', 'custcol_enl_discamount', i)) || 0;
//					purchLine.amount = parseFloat(purchLine.qty * purchLine.unitprice);//purchOrder.getLineItemValue('item', 'amount', i);
//					purchLine.freightamount	= purchOrder.getLineItemValue('item', 'custcol_enl_line_freightamount', i) || 0;
//					purchLine.insuranceamount	= purchOrder.getLineItemValue('item', 'custcol_enl_line_insuranceamount', i)|| 0;
//					purchLine.othersamount	= purchOrder.getLineItemValue('item', 'custcol_enl_line_othersamount', i)|| 0;
//					purchLine.assetaccount	= itemAccounts[purchOrder.getLineItemValue('item', 'item', i)];
//					purchLine.publicyAgencyDeduction = purchOrder.getLineItemValue('item', 'custcol_avlr_publicyagency_deduction', i) || 0
//					purchLine.inssdeduction	= purchOrder.getLineItemValue('item', 'custcol_enl_line_inssdeduction', i)|| 0;
//					purchLine.irdeduction	= purchOrder.getLineItemValue('item', 'custcol_enl_line_irdeduction', i)|| 0;
//					purchLine.taxableoncustsite	= purchOrder.getLineItemValue('item', 'custcol_enl_line_taxableoncustsite', i) == "T";
//					purchLine.externalOrderNum = purchOrder.getLineItemValue('item', 'custcol_enl_externalorder', i) || "";
//					purchLine.externalOrderLine = purchOrder.getLineItemValue('item', 'custcol_eur_externallinenum', i) || "";
//					purchLine.refAccessKey = purchOrder.getLineItemValue('item', 'custcol_enl_ref_chaveacesso', i);
//					purchLine.issdeduction = purchOrder.getLineItemValue('item', 'custcol_enl_line_issdeduction', i) || 0;
//
//					var supplierSituation = purchOrder.getLineItemValue('item', 'custcol_avlr_supplier_situation', i);
//					switch (supplierSituation)
//					{
//						case '1': // Calcular IPI e ICMS-ST
//								purchLine.subjectToIPIonInbound = true;
//								purchLine.isEntityIcmsStSubstituteOnInbound = true;
//							break;
//						case '2': // Equiparado Industria IPI
//								purchLine.subjectToIPIonInbound = true;
//								purchLine.isEntityIcmsStSubstituteOnInbound = false;
//							break;
//						case '3': // Substituto ICMS
//								purchLine.subjectToIPIonInbound = false;
//								purchLine.isEntityIcmsStSubstituteOnInbound = true;
//							break;
//						default:
//								purchLine.subjectToIPIonInbound = false;
//								purchLine.isEntityIcmsStSubstituteOnInbound = false;
//							break;
//					}
//
//					if(purchOrder.getLineItemValue('item', 'isnumbered', i) == "T" && nlapiGetContext().getSetting('SCRIPT', 'custscript_enl_batchnumdetail') == 'T') {
//						var inventoryDetail = purchOrder.viewLineItemSubrecord('item', 'inventorydetail', i);
//
//						if (inventoryDetail != null) {
//							purchLine.inventDetails = [];
//
//							for (var det = 1; det <= inventoryDetail.getLineItemCount('inventoryassignment'); det++) {
//								var inventDetail = {};
//								inventDetail.expirationDate = inventoryDetail.getLineItemValue('inventoryassignment', 'expirationdate', det);
//								inventDetail.quantity = inventoryDetail.getLineItemValue('inventoryassignment', 'quantity', det);
//								inventDetail.batchNumber = inventoryDetail.getLineItemValue('inventoryassignment', 'receiptinventorynumber', det);
//
//								purchLine.inventDetails.push(inventDetail);
//
//							}
//						}
//					}
//
//					purchLine.infAdProd = purchOrder.getLineItemValue('item', 'custcol_avlr_info_adic_nfe', i);
//					purchLine.issbehavior = 'normal';
//
//					if(!isNullOrEmpty(entitynumber)) {
//
//
//						var issbehavior = parseInt(vendor.getFieldValue('custentity_avlr_issbehavior'));
//
//						switch(issbehavior) {
//							case 1:
//								purchLine.issbehavior = 'normal';
//								break;
//							case 2:
//								purchLine.issbehavior = 'forcedWithholding';
//								break;
//							case 3:
//								purchLine.issbehavior = 'forcedNoWithholding';
//								break;
//							case 4:
//								purchLine.issbehavior = 'exempt';
//								break;
//							default:
//								purchLine.issbehavior = 'normal';
//								break;
//						};
//
//		//				nlapiLogExecution('DEBUG', 'issbehavior',purchLine.issbehavior);
//
//					}
//
//					var itemtype = purchOrder.getLineItemValue('item', 'itemtype', i);
//					if (itemtype === 'Service')
//					{
//						var svcItem = nlapiLoadRecord('serviceitem', purchOrder.getLineItemValue('item', 'item', i));
//
//						purchLine.subjecttoirrfauto = svcItem.getFieldValue('custitem_avlr_subjecttoirrfauto') == "T" ? true : false;
//					}
//
//					var _unTaxedOtherCostAmount = purchOrder.getLineItemValue('item', 'custcol_avlr_untaxedothercostamount', i);
//					if(_unTaxedOtherCostAmount)
//						purchLine.unTaxedOtherCostAmount = _unTaxedOtherCostAmount;
//
//					nsPurchLine.push(purchLine);
//				}
//			}
//
//			nsPurchOrder.nsPurchLine = nsPurchLine;
//			nlapiLogExecution('DEBUG', 'nsPurchOrder-02', JSON.stringify(nsPurchOrder))
//			response = sendToFiscal(subsidiary, nsPurchOrder);
//			if (response != null)
//			{
//				nsResponse = JSON.parse(response.getBody());
//
//				nlapiLogExecution('DEBUG', 'Response OC', JSON.stringify(nsResponse));
//			}
			//#endregion
		}
		else //#region Send to Avatax directly
		{

			response = { };
			response.CalcOrderLines = [ ];

			var companyPreferences = nlapiLoadConfiguration('companypreferences');
			var showDisplyName = companyPreferences.getFieldValue('ITEMNUMBERING');

			var subsidiary;
			if (nlapiGetContext().getFeature('subsidiaries') == false) {
				nlapiLogExecution('DEBUG', 'No-OW account',nlapiGetContext().getFeature('subsidiaries') );
				subsidiary = nlapiLoadConfiguration('companyinformation');
			} else {
				var subsidiaryId = purchOrder.getFieldValue('subsidiary');
				if (subsidiaryId)
					subsidiary = nlapiLoadRecord('subsidiary', subsidiaryId);
				else {
					nlapiLogExecution('ERROR', 'Operation Type', 'Campo "Subsidiaria" não definido');
					return;
				}
				var companyid = subsidiary.getFieldValue('custrecord_enl_companyid');
				var companyName = subsidiary.getFieldValue('name');

				if(subsidiary.getFieldValue('custrecord_enl_softwarefiscal') == 1)
					return;
			}
			var user = subsidiary.getFieldValue('custrecord_enl_avataxuser');
			var pwd = subsidiary.getFieldValue('custrecord_enl_pwdavatax');
			var companyCode = subsidiary.getFieldValue('custrecord_enl_companyid');
			var baseURL = subsidiary.getFieldValue('custrecord_enl_urlswfiscal');

			// change for lockcalc

			var postingPeriod = purchOrder.getFieldValue('postingperiod');
			var periodClosed = null ;

			if(!isNullOrEmpty(postingPeriod)) {
				periodClosed = nlapiLookupField('accountingperiod', postingPeriod, 'closed')
			}

			var lockCalc = subsidiary.getFieldValue('custrecord_avlr_lock_calc');
			var calculated = purchOrder.getFieldValue('custbody_avlr_calculated');

//			nlapiLogExecution('DEBUG', 'periodClosed', periodClosed );
//			nlapiLogExecution('DEBUG', 'lockCalc', lockCalc );
//			nlapiLogExecution('DEBUG', 'calculated', calculated );

			// Return if LockCalc is enable and AcctPeriod closed

			if( periodClosed == 'T' &&  lockCalc == 'T'){
				nlapiLogExecution('DEBUG', 'returnperiodClosed' );
				return;
			}

			//Return if LockCalc is enable and Invoice is Calculated

			if ( calculated == 'T' &&  lockCalc == 'T'){
				nlapiLogExecution('DEBUG', 'returnCalc' );
				return ;

			}

			var documentTypeId = purchOrder.getFieldValue('custbody_enl_order_documenttype');
			var issueInvoice = null;

			if(!isNullOrEmpty(documentTypeId))
			{
				var documentType = nlapiLoadRecord('customrecord_enl_fiscaldocumenttype', documentTypeId);
				//nsPurchOrder.documenttype = documentType.getFieldValue('custrecord_enl_fdt_shortname');
				//nsPurchOrder.issueinvoice = documentType.getFieldValue('custrecord_enl_issuereceiptdocument') == "T";
				issueInvoice = documentType.getFieldValue('custrecord_enl_issuereceiptdocument') ;

				if (documentType.getFieldValue('custrecord_enl_sendtofiscal') == "F")
					return true;
			}
			else
				return true;

			//Return if LockCalc is enable and Invoice is Issued

			//nlapiLogExecution('DEBUG', 'NFStatus', purchOrder.getFieldValue('custbody_enl_fiscaldocstatus') );


			if ( (((purchOrder.getFieldValue('custbody_enl_fiscaldocstatus') == 3)  ||  (purchOrder.getFieldValue('custbody_enl_fiscaldocstatus') == 5 )  )
				&&  lockCalc == 'T' ) && issueInvoice == 'T' )
			{
				nlapiLogExecution('DEBUG', 'returnIssued' );
				return ;
			}






			var locationId = purchOrder.getFieldValue('location');
			if (!isNullOrEmpty(locationId)) {
				var location = nlapiLoadRecord('location', locationId);
				var locationCode = location.getFieldValue('custrecord_enl_fiscalestablishmentid');
				var establishment = location.getFieldValue('custrecord_enl_fiscalestablishmentid');
				var locationcpfCnpjNum = location.getFieldValue('custrecord_enl_locationcnpj');
				var locationieNum = location.getFieldValue('custrecord_enl_locationienum');
				var locationccmNum = location.getFieldValue('custrecord_enl_locationccmnum');
				var locationaddress = location.viewSubrecord('mainaddress');
				if (locationaddress != null) {
					var locationAddress = buildAddress(locationaddress);
					var shipAddress = buildAddress(locationaddress);
					if (!isNullOrEmpty(purchOrder.getFieldValue('custbody_enl_transportdestination')) && !isNullOrEmpty(purchOrder.getFieldValue('custbody_enl_transportdestinationzip'))) {
						var city = nlapiLoadRecord('customrecord_enl_cities', purchOrder.getFieldValue('custbody_enl_transportdestination'));
						locationAddress.CityName = purchOrder.getFieldText('custbody_enl_transportdestination')
						locationAddress.CityCode = city.getFieldValue('custrecord_enl_ibgecode');
						locationAddress.State = city.getFieldText('custrecord_enl_citystate');
						locationAddress.Zipcode = purchOrder.getFieldValue('custbody_enl_transportdestinationzip');
						shipAddress.CityName = purchOrder.getFieldText('custbody_enl_transportdestination')
						shipAddress.CityCode = city.getFieldValue('custrecord_enl_ibgecode');
						shipAddress.State = city.getFieldText('custrecord_enl_citystate');
						shipAddress.Zipcode = purchOrder.getFieldValue('custbody_enl_transportdestinationzip');
					}
				}
			} else {
				nlapiLogExecution('ERROR', 'Location', 'Campo "Location" não definido');
				return;
			}

			var operationTypeId = purchOrder.getFieldValue('custbody_enl_operationtypeid');
			if (!isNullOrEmpty(operationTypeId)) 
			{
				var operationType = nlapiLoadRecord('customrecord_enl_operationtype', operationTypeId);
				var operationtypeid = operationType.getFieldValue('custrecord_enl_ot_altname');
				var usetype = operationType.getFieldValue('custrecord_enl_ot_usetype').toLowerCase();
				var finalprice = operationType.getFieldValue('custrecord_enl_ot_finalprice') == "T";
				
				var operationFinancialTran = operationType.getFieldValue('custrecord_enl_financialtran') == "F";
				//nlapiLogExecution('DEBUG', 'operationFinancialTran', operationFinancialTran);
				
				var _approvalStatus = purchOrder.getFieldValue('approvalstatus'); 
				//nlapiLogExecution('DEBUG', '_approvalStatus', _approvalStatus);
				
				if(['vendorbill','creditmemo'].indexOf(nlapiGetRecordType()) > -1 &&  issueInvoice == 'F')
				{
					try 
					{
						if(operationFinancialTran && _approvalStatus != 2)
							purchOrder.setFieldValue('approvalstatus', 3); // Rejected
						else
							nlapiLogExecution('DEBUG', 'Approval Status', 'Status da nota : '+ purchOrder.getFieldText('approvalstatus'));
					} 
					catch (e) 
					{
						nlapiLogExecution('ERROR', 'Approval Status', e);
					}
				}
			} 
			else 
			{
				return;
			}

			var vendor = nlapiLoadRecord(vendorType, purchOrder.getFieldValue('entity'));
			var bill_address = purchOrder.viewSubrecord('billingaddress');
			var billAddress;
			if (bill_address)
			{
				billAddress = buildAddress(bill_address);
				//nlapiLogExecution('DEBUG', 'billAddress', JSON.stringify(billAddress));
				if (!isNullOrEmpty(purchOrder.getFieldValue('custbody_enl_transportorigin')) && !isNullOrEmpty(purchOrder.getFieldValue('custbody_enl_transportoriginzip')))
				{
					var city = nlapiLoadRecord('customrecord_enl_cities', purchOrder.getFieldValue('custbody_enl_transportorigin'));
					billAddress.CityName = purchOrder.getFieldText('custbody_enl_transportorigin')
					billAddress.CityCode = city.getFieldValue('custrecord_enl_ibgecode');
					billAddress.State = city.getFieldText('custrecord_enl_citystate');
					billAddress.Zipcode = purchOrder.getFieldValue('custbody_enl_transportoriginzip');
				}
				else if (billAddress.CityName == "") 
				{
					throw new Error("Cálculo de impostos não efetuado. O nome da cidade deve ser informado. Verifique, no modo de edição da transação, o campo VENDOR SELECT, na aba BILLING, edite-o para o preenchimento do formulário de endereço. Após a correção, caso tenha realizada a Integração de Documento Fiscal, então deverá ser reprocessada.");
				}
			}
			else
			{
				var lineDefaultBilling = vendor.findLineItemValue('addressbook', 'defaultbilling', 'T');
				if(lineDefaultBilling < 0)
				{
					nlapiLogExecution('ERROR', 'buildAddress', '"Bill Address" não definido');
					return;
				}

				vendorAddress = vendor.viewLineItemSubrecord('addressbook', 'addressbookaddress', lineDefaultBilling);
				if(vendorAddress)
					billAddress = buildAddress(vendorAddress);
			}

			//nlapiLogExecution('DEBUG', 'billAddress', JSON.stringify(billAddress));
			var deliveryLocation = createLocationEntity(purchOrder.getFieldValue('custbody_enl_deliverylocation'));

			var entity = { };
			entity.type = "business"; //TODO: verificar se é apenas para Produtos
			entity.name = vendor.getFieldValue('entityid').substring(0, 60);
			entity.cityTaxId = isNullOrEmpty(locationccmNum) ? undefined : locationccmNum;
			entity.stateTaxId = locationieNum;
			var issRfRate = purchOrder.getFieldValue('custbody_enl_customissrate');
			if (!isNullOrEmpty(issRfRate))
				entity.issRfRate = issRfRate;
			var hasCPOM = purchOrder.getFieldValue('custbody_enl_hascpom') == "T";
			entity.subjectToPayrollTaxRelief = vendor.getFieldValue('custentity_avlr_subjectpayrolltaxrelief') == "T";
			entity.icmsTaxPayer = vendor.getFieldValue('custentity_enl_statetaxpayer') == "T" ? true : false;
			entity.pisCofinsRelizeZF = false;
			entity.subjectToSRF1234 = false;
			entity.pisCofinsReliefZF =  vendor.getFieldValue('custentity_avlr_piscofinsrelizefzf') == "T";
			
			
			var taxregime_ = vendor.getFieldValue('custentity_avlr_federaltaxationregime')

			if (isNullOrEmpty(taxregime_)) 
			{
				if (isSimpleTaxPayer(vendor)) 
				{
					entity.taxRegime = "simplified";
				}
				else if (isMei(vendor)) 
				{
					entity.taxRegime = "simplifiedEntrepreneur";
				}
				else 
				{
					var _locationCnpj = location.getFieldValue('custrecord_enl_fiscalestablishmentid');
					if(_locationCnpj && _locationCnpj.indexOf("13589504") == 0) // start with
						entity.taxRegime	= "realProfit";
					else
						entity.taxRegime = "estimatedProfit";
					
				}
			}
			else 
			{
				entity.taxRegime = getTaxRegime(taxregime_);
			}
			nlapiLogExecution('DEBUG', 'TaxRegimeGoods', entity.taxRegime);
			
			
			
			

			var purchid;
			if (type != 'create')
			{
				if (purchOrder.getRecordType() == "purchaseorder")
					purchid = purchOrder.getFieldValue('tranid');
				else
					purchid = purchOrder.getFieldValue('transactionnumber');
			}

			var grnvAcct = getRecNotBillAcct();

			if (usetype == 1 || usetype == 19) //#region Cálculo de serviço
			{
				var services = { };
				services.header = { };
				entity.cnpjcpf = locationcpfCnpjNum;
				services.header.entity = entity;


				if (billAddress.State == "EX") {
					services.header.entity.type = "foreign";
				} else {
					if (vendor.getFieldValue('isperson') == "T") {
						services.header.entity.type = "individual";
					} else {
						services.header.entity.type = "business";
					}
				}

				if (purchOrder.getFieldValue('custbody_enl_forceisswithhold') == "T") {
					services.header.establishment = { };
					services.header.establishment.issWithholdSubjectTo = true;
					services.header.establishment.code = establishment;
				}

				services.header.currency = "BRL";
				services.header.documentCode = "Temp";
				services.header.taxCalculationDate = purchOrder.getFieldValue('trandate');
				services.header.transactionDate = nlapiStringToDate(services.header.taxCalculationDate);
				services.header.purchaseOrderNumber = "Temp";
				services.header.companyLocation = establishment;
				services.header.transactionType = "Purchase";

				var defaultLocation = { };
				defaultLocation.PointOfOrderOrigin = { };
				defaultLocation.PointOfOrderOrigin.address = { };
				defaultLocation.PointOfOrderOrigin.address.cityName = billAddress.CityName;
				defaultLocation.PointOfOrderOrigin.address.line3 = billAddress.Neighborhood;
				defaultLocation.PointOfOrderOrigin.address.line2 = billAddress.Number;
				defaultLocation.PointOfOrderOrigin.address.state = billAddress.State;
				defaultLocation.PointOfOrderOrigin.address.zipcode = billAddress.Zipcode;
				defaultLocation.PointOfOrderOrigin.address.line1 = billAddress.Street;
				defaultLocation.PointOfOrderOrigin.address.cityCode = parseInt(billAddress.CityCode);
				defaultLocation.PointOfOrderOrigin.address.country = billAddress.Country;

				defaultLocation.serviceRendered = { };
				defaultLocation.serviceRendered.address = { };
				if (deliveryLocation != null) {
					defaultLocation.serviceRendered.address.cityName = deliveryLocation.addressCity;
					defaultLocation.serviceRendered.address.line3 = deliveryLocation.addressNeighborhood;
					defaultLocation.serviceRendered.address.line2 = deliveryLocation.addressNumber;
					defaultLocation.serviceRendered.address.state = deliveryLocation.addressState;
					defaultLocation.serviceRendered.address.zipcode = deliveryLocation.addressZipcode;
					defaultLocation.serviceRendered.address.line1 = deliveryLocation.addressStreet;
					defaultLocation.serviceRendered.address.country = deliveryLocation.addressCountry;
				} else {
					defaultLocation.serviceRendered.address.cityName = locationAddress.CityName;
					defaultLocation.serviceRendered.address.line3 = locationAddress.Neighborhood;
					defaultLocation.serviceRendered.address.line2 = locationAddress.Number;
					defaultLocation.serviceRendered.address.state = locationAddress.State;
					defaultLocation.serviceRendered.address.zipcode = locationAddress.Zipcode;
					defaultLocation.serviceRendered.address.line1 = locationAddress.Street;
					defaultLocation.serviceRendered.address.CityCode = parseInt(locationAddress.CityCode);
					defaultLocation.serviceRendered.address.country = locationAddress.Country;
				}

				services.header.defaultLocations = defaultLocation;
				services.lines = [];

				var inssDeduction = 0.0;
				for(var i = 1; i <= purchOrder.getLineItemCount('item'); i++)
				{
					nlapiLogExecution('DEBUG', 'type', purchOrder.getLineItemValue('item', 'type', i));
					if (purchOrder.getLineItemValue('item', 'type', i) != "OthCharge"
						&& purchOrder.getLineItemValue('item', 'type', i) != "TaxItem"
						&& purchOrder.getLineItemValue('item', 'type', i) != "TaxGroup") {

						var purchLine = {};
						purchLine.lineCode = i;
						var _objItem = newGetPurchItemId(purchOrder, i, grnvAcct);
						purchLine.inventoryAccount = _objItem.inventoryAccount;
						purchLine.itemCode = _objItem.itemCode; // getItemId(purchOrder.getLineItemValue('item', 'item', i), purchOrder.getLineItemValue('item', 'itemtype', i));
						purchLine.numberOfItems = parseFloat(purchOrder.getLineItemValue('item', 'quantity', i));
						purchLine.lineAmount = parseFloat((purchLine.numberOfItems * parseFloat(purchOrder.getLineItemValue('item', 'rate', i))).toFixed(5));
						purchLine.lineTaxedDiscount	= parseFloat(purchOrder.getLineItemValue('item', 'custcol_enl_discamount', i)) || 0;
						purchLine.lineUntaxedDiscount = 0;
						purchLine.transferAmount = 0;
						purchLine.withLaborAssignment = false;
						purchLine.hasCpom = hasCPOM;
						purchLine.useType = (getUseType(usetype) == "serviceProduction") ? "production" : "use or consumption";

						var svcItem = nlapiLoadRecord('serviceitem', purchOrder.getLineItemValue('item', 'item', i));
						if (svcItem.getFieldValue('custitem_avlr_subjecttoirrfauto') == "T") {
							purchLine.taxForItem = { };
							purchLine.taxForItem.subjectToIRRFAuto = true;
						}

						var irdeduction = purchOrder.getLineItemValue('item', 'custcol_enl_line_irdeduction', i) || 0;
						var publicyAgencyDeduction = purchOrder.getLineItemValue('item', 'custcol_avlr_publicyagency_deduction', i) || 0;
						var issdeduction = purchOrder.getLineItemValue('item', 'custcol_enl_line_issdeduction', i) || 0;
						if (irdeduction > 0 || publicyAgencyDeduction > 0 || issdeduction > 0) {
							purchLine.taxDeductions = { };
							if (irdeduction > 0) {
								purchLine.taxDeductions.irrfAuto = irdeduction;
							}
							if (publicyAgencyDeduction > 0) {
								purchLine.taxDeductions.transferAmount = publicyAgencyDeduction;
							}
							if (issdeduction > 0) {
								purchLine.taxDeductions.iss = issdeduction;
							}
						}

						if(purchOrder.getLineItemValue('item', 'custcol_enl_line_inssdeduction', i))
							inssDeduction += parseFloat(purchOrder.getLineItemValue('item', 'custcol_enl_line_inssdeduction', i));
						
						if (!purchLine.taxForItem)
							purchLine.taxForItem = { };

						switch (parseInt(vendor.getFieldValue('custentity_avlr_issbehavior'))) {
							case 1:
								purchLine.taxForItem.issBehavior = 'normal';
								break;
							case 2:
								purchLine.taxForItem.issBehavior = 'forcedWithholding';
								break;
							case 3:
								purchLine.taxForItem.issBehavior = 'forcedNoWithholding';
								break;
							case 4:
								purchLine.taxForItem.issBehavior = 'exempt';
								break;
							default:
								purchLine.taxForItem.issBehavior = 'normal';
								break;
						};

						services.lines.push(purchLine);
					}
				}

				if (inssDeduction > 0) {
					services.header.entity.inssBasisDiscount = inssDeduction;
				}

				var url;
				url = baseURL.concat('/v2/calculations/store?service-purchase');
				url = url.substr(0, 9).concat(url.substr(9).replace('//', '/'));

				nlapiLogExecution('DEBUG', 'url', url);
				nlapiLogExecution('DEBUG', 'request', JSON.stringify(services));
				//	var responseServices = sendToAvatax(url, user, pwd, companyCode, locationCode, services);
				var responseServices = sendToAvataxWithFile(url, user, pwd, companyCode, locationCode, services,purchOrder);

				if (!responseServices)
					return; //throw new Error('Erro ao calcular impostos.');

				response.Legaltext = null;
				response.OrderId = null;
				for (var i = 0; i < responseServices.lines.length; i++)
				{
					var line = responseServices.lines[i];
					var orderLine = { };
					orderLine.Cfop = null;
					orderLine.LineNum = line.lineCode;
					orderLine.Taxes = [ ];
					orderLine.Amount = 0;
					orderLine.TaxAmount = 0;
					orderLine.UnitCost = 0;
					orderLine.HasIcmsST = false;
					orderLine.Ledger = null;
					orderLine.PartCode = null;
					orderLine.inventoryAccount = services.lines[i].inventoryAccount;

					for (var j = 0; j < line.calculatedTax.details.length; j++)
					{
						var detail = line.calculatedTax.details[j];
						//nlapiLogExecution('DEBUG', 'detail : '+j, detail);
						
						if (detail.rate > 0) {
							var taxDetail = { };

							switch (detail.taxImpact.impactOnNetAmount) {
								case 'Add':
									taxDetail.Operation = "+";
									break;
								case 'Subtracted':
									taxDetail.Operation = "-";
									break;
								default:
									taxDetail.Operation = "=";
									break;
							}

							taxDetail.Accounting = 0;
							taxDetail.TaxAmount = parseFloat(detail.tax);
							taxDetail.TaxBaseAmount = parseFloat(detail.subtotalTaxable);
							taxDetail.TaxCode = detail.taxType;
							taxDetail.TaxValue = parseFloat(detail.rate);
							taxDetail.IsRetained = detail.taxImpact.impactOnNetAmount == 'Subtracted' ? true : false;
							taxDetail.IsCredit = detail.taxImpact.accounting == "asset";

							if(detail.cst)
								taxDetail.TaxSituation = detail.cst;
							else
								taxDetail.TaxSituation = '';

							if(detail.collectionCode)
								taxDetail.CollectionCode = detail.collectionCode;
							else
								taxDetail.CollectionCode = '';

							if (taxDetail.Operation == "+")
								orderLine.TaxAmount += taxDetail.TaxAmount;

							if (detail.taxType == "irrf" && detail.cst == "02")
								taxDetail.TaxCode = "irrfAuto";

							if (taxDetail.IsRetained) 
							{
								orderLine.TaxAmount -= taxDetail.TaxAmount;
								orderLine.Taxes.push(taxDetail);
								
								if (detail.taxType == "icmsDeson")
									taxDetail.IsRetained = false;
							} 
							else 
							{
								orderLine.Taxes.push(taxDetail);
							}

						}
					}

					orderLine.TaxRateAmount = orderLine.TaxAmount / parseFloat(line.numberOfItems);
					response.CalcOrderLines.push(orderLine);
				}
				//#endregion
			}
			else //#region Cálculo de mercadoria
			{

				if(!isNullOrEmpty(vendor.getFieldValue('custentity_enl_ent_activitysector')))
				{
					entity.activitySector = { };
					entity.activitySector.type = "activityLine";
					entity.activitySector.code = getActivitySector(vendor.getFieldValue('custentity_enl_ent_activitysector'));
				}

				var goods = { };
				goods.header = { };
				goods.header.participants =  {};
				goods.header.participants.entity = entity;

				goods.header.eDocCreatorType = "self";
				goods.header.eDocCreatorPerspective = true;
				goods.header.companyLocation = establishment;
				goods.header.defaultLocations = { };

				//nlapiLogExecution('DEBUG', 'billAddress', JSON.stringify(billAddress));
				if (billAddress != null) {
					var entitylocation = { };
					entitylocation.cityName = billAddress.CityName;
					entitylocation.street = billAddress.Street;
					entitylocation.neighborhood = billAddress.Neighborhood;
					entitylocation.number = billAddress.Number;
					entitylocation.state = billAddress.State;
					entitylocation.zipcode = billAddress.Zipcode;
					entitylocation.country = billAddress.Country;
					entitylocation.countryCode = new Number(billAddress.CountryCode);
					goods.header.defaultLocations.entity = entitylocation;
				}

				if (locationAddress != null) {
					var companylocation = { };
					companylocation.street = locationAddress.Street;
					companylocation.cityName = locationAddress.CityName;
					companylocation.complement = "0";
					companylocation.neighborhood = locationAddress.Neighborhood;
					companylocation.number = locationAddress.Number;
					companylocation.state = locationAddress.State;
					companylocation.zipcode = locationAddress.Zipcode;
					companylocation.country = locationAddress.Country;
					companylocation.countryCode = parseInt(locationAddress.CountryCode);
					goods.header.defaultLocations.company = companylocation;
					goods.header.defaultLocations.establishment = companylocation;
				}

				goods.header.transactionDate = nlapiStringToDate(purchOrder.getFieldValue('trandate'));
				goods.header.messageType = "goods";
				goods.header.transactionType = "Purchase";
				goods.header.currency = "BRL";
				goods.header.documentCode = purchid;

				if (finalprice)
					goods.header.amountCalcType = "final";

				goods.header.nfRef = [];
				var accessKey = purchOrder.getFieldValue('custbody_enl_ref_chaveacesso');
				if (!isNullOrEmpty(accessKey)) {
					var nref = { };
					nref.type = "refNFe";
					nref.refNFe = accessKey;
					goods.header.nfRef.push(nref);
				}

				goods.lines = [];
				for(var i = 1; i <= purchOrder.getLineItemCount('item'); i++)
				{
					if (purchOrder.getLineItemValue('item', 'type', i) != "OthCharge"
						&& purchOrder.getLineItemValue('item', 'type', i) != "TaxItem"
						&& purchOrder.getLineItemValue('item', 'type', i) != "TaxGroup") {

						var refAccessKey = purchOrder.getLineItemValue('item', 'custcol_enl_ref_chaveacesso', i);
						if (refAccessKey) {
							
							var _index =  goods.header.nfRef.map(function(e) {
								return e.refNFe == refAccessKey;
							}).indexOf(true);

							if(_index == -1)
							{
								var nref = { };
								nref.type = "refNFe";
								nref.refNFe = refAccessKey;
								goods.header.nfRef.push(nref);
							}
						}

						var line = { };
						line.lineCode = i;
						var _objItem = newGetPurchItemId(purchOrder, i, grnvAcct);
						line.itemCode =  _objItem.itemCode; //getItemId(purchOrder.getLineItemValue('item', 'item', i), purchOrder.getLineItemValue('item', 'itemtype', i));
						line.itemDescription = _objItem.itemCode; //getItemId(purchOrder.getLineItemValue('item', 'item', i), purchOrder.getLineItemValue('item', 'itemtype', i));
						line.inventoryAccount = _objItem.inventoryAccount;

						if (operationtypeid == "amountComplementary")
							line.numberOfItems = 0.0;
						else
							line.numberOfItems = parseFloat(purchOrder.getLineItemValue('item', 'quantity', i));

						line.lineUnitPrice = parseFloat(parseFloat(purchOrder.getLineItemValue('item', 'rate', i)).toFixed(5));
						line.lineAmount = line.lineUnitPrice * line.numberOfItems;
						line.lineTaxedDiscount = parseFloat(purchOrder.getLineItemValue('item', 'custcol_enl_discamount', i)) || 0; //TODO: verificar o campo do desconto - Convert.ToDecimal(purchItem.Discamount);
						line.lineUntaxedDiscount = 0;
						line.useType = getUseType(usetype);
						line.freightAmount = parseFloat(purchOrder.getLineItemValue('item', 'custcol_enl_line_freightamount', i)) || 0;
						line.insuranceAmount = parseFloat(purchOrder.getLineItemValue('item', 'custcol_enl_line_insuranceamount', i)) || 0;
						line.otherCostAmount = parseFloat(purchOrder.getLineItemValue('item', 'custcol_enl_line_othersamount', i)) || 0;
						line.entityIsIcmsSubstitute = false;
						line.overwrite = "no";
						line.hasStockImpact = true;
						line.hasFinantialImpact = true;
						line.processScenario = operationtypeid;

						var icmsrate_v = purchOrder.getFieldValue('custbody_enl_customicmsrate');


						if (icmsrate_v > 0) {
							line.itemDescriptor = { };
							line.itemDescriptor.pCredSN = purchOrder.getFieldValue('custbody_enl_customicmsrate');
							line.itemDescriptor.code = line.itemCode;
						}

						var infAdProd = purchOrder.getLineItemValue('item', 'custcol_avlr_info_adic_nfe', i);
						if (!isNullOrEmpty(infAdProd))
							line.infAdProd = infAdProd;

						var externalOrderLine = purchOrder.getLineItemValue('item', 'custcol_eur_externallinenum', i) || "";
						var externalOrderNum = purchOrder.getLineItemValue('item', 'custcol_enl_externalorder', i) || "";
						if (!isNullOrEmpty(externalOrderLine))
							line.orderItemNumber =  externalOrderLine;
						if (!isNullOrEmpty(externalOrderNum))
							line.orderNumber = externalOrderNum;
						var unTaxedOtherCostAmount = purchOrder.getLineItemValue('item', 'custcol_avlr_untaxedothercostamount', i);
						if (!isNullOrEmpty(unTaxedOtherCostAmount))
							line.unTaxedOtherCostAmount = unTaxedOtherCostAmount;

						switch (purchOrder.getLineItemValue('item', 'custcol_avlr_supplier_situation', i))
						{
							case '1': // Calcular IPI e ICMS-ST
								line.subjectToIPIonInbound = true;
								line.isEntityIcmsStSubstituteOnInbound = true;
								break;
							case '2': // Equiparado Industria IPI
								line.subjectToIPIonInbound = true;
								line.isEntityIcmsStSubstituteOnInbound = false;
								break;
							case '3': // Substituto ICMS
								line.subjectToIPIonInbound = false;
								line.isEntityIcmsStSubstituteOnInbound = true;
								break;
							default:
								line.subjectToIPIonInbound = false;
								line.isEntityIcmsStSubstituteOnInbound = false;
								break;
						}
						
		    			// nlapiLogExecution('DEBUG', 'itemObj.cbar', _objItem.cbar)
						if(_objItem.cbar)
						{
							if(!line.itemDescriptor)
								line.itemDescriptor = {};
							
							if(!line.itemDescriptor.code)
								line.itemDescriptor.code = line.itemCode;
							
							line.itemDescriptor.cBar = _objItem.cbar;
						}
						
						goods.lines.push(line);
					}
				}

				nlapiLogExecution('DEBUG', 'request', JSON.stringify(goods));
				var url;
				if (isNullOrEmpty(goods.header.documentCode))
					url = baseURL.concat('/v2/calculations?goods');
				else
					url = baseURL.concat('/v2/calculations/store?goods');
				url = url.substr(0, 9).concat(url.substr(9).replace('//', '/'));
				var responseAvatax = sendToAvataxWithFile(url, user, pwd, companyCode, locationCode, goods,purchOrder);
				if (!responseAvatax)
					return; //throw new Error('Erro ao calcular impostos.');

				response.Legaltext = null;
				response.OrderId = null;
				for (var i = 0; i < responseAvatax.lines.length; i++)
				{
					var line = responseAvatax.lines[i];
					var orderLine = { };
					orderLine.Amount = 0.0;
					orderLine.HasIcmsST = false;
					orderLine.Ledger = null;
					orderLine.PartCode = null;
					orderLine.Cfop = null;
					orderLine.LineNum = line.lineCode;
					orderLine.inventoryAccount = goods.lines[i].inventoryAccount;

					if (line.cfop != null) {
						var cfop = line.cfop.toString().replace(".", "");
						cfop = cfop.substr(0, 1).concat('.',cfop.substr(1, 3));
						orderLine.Cfop = cfop;
					}

					orderLine.Taxes = [ ];
					var tax_Amount = new Number(0.0);
					var costAmount = parseFloat(line.lineAmount + line.freightAmount + line.insuranceAmount + line.otherCostAmount);

					for (var j = 0; j < line.calculatedTax.details.length; j++)
					{
						var detail = line.calculatedTax.details[j];
						if (detail.rate > 0 || detail.cst != null || detail.cstB != null) {
							var taxDetail = { };
							taxDetail.CollectionCode = '';

							switch (detail.taxImpact.impactOnFinalPrice) {
								case 'Add':
									taxDetail.Operation = "+";
									break;
								case 'Subtracted':
									taxDetail.Operation = "-";
									break;
								default:
									taxDetail.Operation = "=";
									break;
							}

							taxDetail.IsRetained = detail.taxImpact.impactOnNetAmount == 'Subtracted';
							taxDetail.IsCredit = detail.taxImpact.accounting == 'asset';

							if(detail.taxImpact.impactOnFinalPrice == "Included" && taxDetail.IsRetained)
								taxDetail.Operation = "-";
							
							taxDetail.Accounting = getTaxAccounting(detail.taxImpact.accounting);
							taxDetail.TaxAmount = parseFloat(detail.tax);
							taxDetail.TaxBaseAmount = parseFloat(detail.subtotalTaxable);
							taxDetail.TaxCode = detail.taxType;
							taxDetail.TaxValue = parseFloat(detail.rate);
							
							if (detail.cst)
								taxDetail.TaxSituation = detail.cst;
							else if (detail.cstB)
								taxDetail.TaxSituation = detail.cstB;
							else
								taxDetail.TaxSituation = '';

							if (detail.taxType == "icmsDeson") {
								taxDetail.IsRetained = false;
								if (taxDetail.Operation == "+")
									tax_Amount += taxDetail.TaxAmount;
							}
														
							orderLine.Taxes.push(taxDetail);

							if (taxDetail.IsCredit)
								costAmount -= taxDetail.TaxAmount;

							if (detail.taxImpact.impactOnNetAmount == 'Add' && !finalprice) {
								costAmount += taxDetail.TaxAmount;
								tax_Amount += taxDetail.TaxAmount;
							}

							if (taxDetail.Operation == "-")
								tax_Amount -= taxDetail.TaxAmount;

							if (detail.taxType == "icmsSt")
								orderLine.HasIcmsST = true;
						}
					}

					orderLine.UnitCost = costAmount / parseFloat(line.numberOfItems);
					orderLine.TaxAmount = tax_Amount;
					orderLine.TaxRateAmount = tax_Amount / parseFloat(line.numberOfItems);

					response.CalcOrderLines.push(orderLine);
				}

			}// #endregion #region Cálculo de mercadoria

			nsResponse.Status = true;
			nsResponse.Message = "Calculo efetuado com sucesso";
			nsResponse.AccessKey = null;
			nsResponse.RequestMessage = null;
			nsResponse.ResponseMessage = null;
			nsResponse.RequestTime = 0;
			nsResponse.ObjectReturn = response;
			//#endregion
		}

		nlapiLogExecution('DEBUG', 'nsResponse', JSON.stringify(nsResponse));
		//nlapiLogExecution('DEBUG', 'Remaining governance units', nlapiGetContext().getRemainingUsage());

		if (nsResponse != null) {
			if (nsResponse.Status == false) {
				//throw nlapiCreateError('Calculo Ordem de Compra', JSON.stringify(nsResponse), true);

				purchOrder.setFieldValue('custbody_enl_messagespl', nsResponse);
				purchOrder.setFieldValue('custbody_enl_fiscaldocstatus', 7); // Erro

			} else if (nsResponse.ObjectReturn != null) {
				calcPurchUnitCost(purchOrder, nsResponse.ObjectReturn);
				processCalcOrderV2(purchOrder, nsResponse.ObjectReturn);

				if (issueInvoice == 'F' && lockCalc == 'T') {
					nlapiLogExecution('DEBUG', 'custbody_avlr_calculated', 'T');
					purchOrder.setFieldValue('custbody_avlr_calculated', 'T');
				}

			} else {
				//throw nlapiCreateError('Calculo Ordem de Compra', nsResponse.Message, true);

				purchOrder.setFieldValue('custbody_enl_messagespl', nsResponse.Message);
				purchOrder.setFieldValue('custbody_enl_fiscaldocstatus', 7); // Erro
			}
		}

		nlapiLogExecution('DEBUG', 'Remaining governance units - End', nlapiGetContext().getRemainingUsage());
	}
	catch(e)
	{
		nlapiLogExecution('DEBUG', 'Integracao OC', e);
		//nlapiLogExecution('DEBUG', 'Integracao OC', JSON.stringify(e));
		//throw nlapiCreateError('Calculo Ordem de Compra', e, true); 
		
		purchOrder.setFieldValue('custbody_enl_messagespl', e);
		purchOrder.setFieldValue('custbody_enl_fiscaldocstatus', 7); // Erro
	}

	return true;
}

function calcPurchUnitCost(purchOrder, objReturned) {

	var addFreight = true;
	var addInsurance = true;
	var addOthers = true;

	if(!isNullOrEmpty(purchOrder.getFieldValue('incoterm')))
	{
		var columns = [];
		columns.push(new nlobjSearchColumn('custrecord_enl_ies_addfreight'));
		columns.push(new nlobjSearchColumn('custrecord_enl_ies_addinsurance'));
		columns.push(new nlobjSearchColumn('custrecord_enl_ies_addotherexpenses'));

		var searchIncoterm = nlapiSearchRecord('customrecord_enl_incotermexpensesetup', null, new nlobjSearchFilter('custrecord_enl_ies_incoterm', null, 'anyof', purchOrder.getFieldValue('incoterm')), columns);
		if(searchIncoterm != null)
		{
			addFreight = searchIncoterm[0].getValue('custrecord_enl_ies_addfreight') == "T" ? true : false;
			addInsurance = searchIncoterm[0].getValue('custrecord_enl_ies_addinsurance') == "T" ? true : false;
			addOthers = searchIncoterm[0].getValue('custrecord_enl_ies_addotherexpenses') == "T" ? true : false;
		}
	}

	var purchLineCount = purchOrder.getLineItemCount('item');
	var cfops = buildCFOPArray();

	for(var i =1; i<=purchLineCount; i++)
	{
		if(objReturned.CalcOrderLines[i-1].Cfop != null)
		{
			purchOrder.setLineItemValue('item', 'custcol_enl_cfopitem', i , cfops[objReturned.CalcOrderLines[i-1].Cfop]);
		}
		purchOrder.setLineItemValue('item', 'custcol_enl_unitcost', i, objReturned.CalcOrderLines[i-1].UnitCost);
		purchOrder.setLineItemValue('item', 'custcol_enl_taxamtperunit', i, objReturned.CalcOrderLines[i-1].TaxRateAmount);
		purchOrder.setLineItemValue('item', 'tax1amt', i, objReturned.CalcOrderLines[i-1].TaxAmount);
		purchOrder.setLineItemValue('item', 'custcol_ava_icmsst', i, objReturned.CalcOrderLines[i-1].HasIcmsSt ? "T" : "F");

		var amount = parseFloat(purchOrder.getLineItemValue('item', 'quantity', objReturned.CalcOrderLines[i-1].LineNum) * purchOrder.getLineItemValue('item', 'rate', objReturned.CalcOrderLines[i-1].LineNum));

		if(purchOrder.getLineItemValue('item', 'custcol_enl_line_othersamount', objReturned.CalcOrderLines[i-1].LineNum) != null && addOthers)
			amount += parseFloat(purchOrder.getLineItemValue('item', 'custcol_enl_line_othersamount', objReturned.CalcOrderLines[i-1].LineNum));

		if(purchOrder.getLineItemValue('item', 'custcol_enl_line_insuranceamount', objReturned.CalcOrderLines[i-1].LineNum) != null && addInsurance)
			amount += parseFloat(purchOrder.getLineItemValue('item', 'custcol_enl_line_insuranceamount', objReturned.CalcOrderLines[i-1].LineNum));
		if(purchOrder.getLineItemValue('item', 'custcol_enl_line_freightamount', objReturned.CalcOrderLines[i-1].LineNum) != null && addFreight)
			amount += parseFloat(purchOrder.getLineItemValue('item', 'custcol_enl_line_freightamount', objReturned.CalcOrderLines[i-1].LineNum));
		if(purchOrder.getLineItemValue('item', 'custcol_enl_discamount', objReturned.CalcOrderLines[i-1].LineNum) != null && parseFloat(purchOrder.getLineItemValue('item', 'custcol_enl_discamount', objReturned.CalcOrderLines[i-1].LineNum)) > 0)
			amount -= parseFloat(purchOrder.getLineItemValue('item', 'custcol_enl_discamount', objReturned.CalcOrderLines[i-1].LineNum));
		if(purchOrder.getLineItemValue('item', 'custcol_avlr_untaxedothercostamount', objReturned.CalcOrderLines[i-1].LineNum) != null && addOthers)
			amount += parseFloat(purchOrder.getLineItemValue('item', 'custcol_avlr_untaxedothercostamount', objReturned.CalcOrderLines[i-1].LineNum));

		purchOrder.setLineItemValue('item', 'amount', objReturned.CalcOrderLines[i-1].LineNum, roundRfb(amount));


	}
}

function getItemsAccount(purchOrder)
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
	var itemAccounts_ = [];
	var accounts = [];

	for(var i = 0; searchAcc != null && i < searchAcc.length; i++)
	{
		if(!isNullOrEmpty(searchAcc[i].getValue('assetaccount')))
		{
			accounts.push(searchAcc[i].getValue('assetaccount'));
			//	nlapiLogExecution('DEBUG', 'Account', searchAcc[i].getValue('assetaccount'));
			var itemAccount = {};
			itemAccount.itemid = searchAcc[i].getId();
			itemAccount.account = searchAcc[i].getValue('assetaccount');
			itemAccounts_.push(itemAccount);
		}
	}

	if(accounts.length > 0)
	{
		var accNumbers = [];
		//	nlapiLogExecution('DEBUG', 'accounts', accounts);
		var searchNumber = nlapiSearchRecord('account', null, new nlobjSearchFilter('internalid', null, 'anyof', accounts), new nlobjSearchColumn('number'));
		for(var i = 0; searchNumber != null && i < searchNumber.length; i++)
		{
			accNumbers[searchNumber[i].getId()] = searchNumber[i].getValue('number');
			//nlapiLogExecution('DEBUG', 'accounts_number', accNumbers[searchNumber[i].getId()]);

		}

		for(var i = 0; i < itemAccounts_.length; i++)
		{
			itemAccNumber[itemAccounts_[i].itemid] = accNumbers[itemAccounts_[i].account];
		}
	}
	return itemAccNumber;
}
function afterSubmit(type)
{
	nlapiLogExecution('DEBUG', 'afterSubmit', type);
	nlapiLogExecution('DEBUG', 'context', nlapiGetContext().getExecutionContext());
	var salesOrder = nlapiGetNewRecord();


	if(type == "create")
	{
		if(nlapiGetContext().getExecutionContext() == "csvimport")
		{
			var request = arguments[2];

			var url = nlapiResolveURL('SUITELET', 'customscript_ava_recalsales_sl', 'customdeploy_ava_recalsales_sl', true)
				+ "&internalid=" + nlapiGetRecordId()
				+ "&recordtype=" + nlapiGetRecordType();

			var response = nlapiRequestURL(url,null,null);

			nlapiLogExecution('DEBUG', 'afterResponse', response);
		}
	}

	var _randomString = salesOrder.getFieldValue('custbody_avlr_randomstring');
	if(_randomString)
	{
		var requestObj = nlapiGetContext().getSessionObject('avlr_requestobj_p'+_randomString);
		//nlapiLogExecution('DEBUG', 'requestObj', requestObj);

		if(requestObj)
		{
			var fileName = "CalculoRequest"+salesOrder.getId()+".json";
			attachFile(fileName, requestObj, salesOrder);

			nlapiGetContext().setSessionObject('avlr_requestobj_p'+_randomString, '')
		}

		var responseObj = nlapiGetContext().getSessionObject('avlr_responseobj_p'+_randomString);
		var requestObj = nlapiGetContext().getSessionObject('avlr_requestobj_p'+_randomString);

		//nlapiLogExecution('DEBUG', 'responseObj', responseObj);

		if(responseObj)
		{
			var fileName = "CalculoResponse"+salesOrder.getId()+".json";
			attachFile(fileName, responseObj, salesOrder);
			nlapiGetContext().setSessionObject('avlr_responseobj_p'+_randomString, '')
		}
		if(requestObj)
		{
			var fileName = "CalculoRequest"+salesOrder.getId()+".json";
			attachFile(fileName, request, salesOrder);
			nlapiGetContext().setSessionObject('avlr_requestobj_p'+_randomString, '')
		}
	}
	else
	{
		nlapiLogExecution('ERROR', 'Random String', 'Null');
	}

}

function getUseType(_useTypeId) {
	switch(_useTypeId) {
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

function getTaxRegime(taxregime)
{
	switch(taxregime)
	{
		case '1':
			return 'realProfit';
			break;
		case '2':
			return 'estimatedProfit';
			break;
		case '3':
			return 'simplified';
			break;
		case '4':
			return 'simplifiedOverGrossthreshold';
			break;
		case '5':
			return 'simplifiedEntrepreneur';
			break;
		case '6':
			return 'notApplicable';
			break;
		case '7':
			return 'individual';
			break;
	};
}