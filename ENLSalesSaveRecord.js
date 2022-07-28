function salesSaveRecord(type)
{
	try 
	{
		
		var context = nlapiGetContext().getExecutionContext();
	  
		if(type == 'delete' || type == 'xedit') //Added type 'xedit' for eInvoicing 
			return;
		
		var salesOrder = nlapiGetNewRecord();
	
	//	nlapiLogExecution('DEBUG', 'Void', salesOrder.getFieldValue('void'));
		var _memo = salesOrder.getFieldValue('memo');
	//	nlapiLogExecution('DEBUG', 'memo', _memo);
		
		if ( (salesOrder.getFieldValue('void') == 'VoidVoid') || 
					(salesOrder.getFieldValue('void') == 'Void') || (_memo == 'void') ||
						(salesOrder.getFieldValue('void') == 'VoidAnular') ) 
		{
			nlapiLogExecution('DEBUG', 'void', salesOrder.getFieldValue('void'));
			return ;
		}
	
		var companyPreferences = nlapiLoadConfiguration('companypreferences');
		var showDisplyName = companyPreferences.getFieldValue('ITEMNUMBERING');
		//nlapiLogExecution('DEBUG', 'showDisplyName', showDisplyName)
		
		var nsSalesOrder = {};
		var _notNseMiddle = false; //salesOrder.getFieldValue('custbody_avlr_not_use_middle')
	//	if(!_notNseMiddle)
	//		_notNseMiddle = true;
	//	else
	//		_notNseMiddle = salesOrder.getFieldValue('custbody_avlr_not_use_middle') == 'F';
		
		//nlapiLogExecution('DEBUG', '_notNseMiddle', _notNseMiddle);
		
		if(_notNseMiddle)
		{
//			nsSalesOrder.type = 'salesorder';
//		  
//		  	nsSalesOrder.suframaId = "";
//		  
//		  	var customerAddress;
//		
//		  	var entity;
//		
//		    var locationCity;
//		
//		    var entityCity;
//		
//		
//			if (nlapiGetRecordType() == 'vendorreturnauthorization' || nlapiGetRecordType() == 'vendorcredit')
//		    {
//		        entity = nlapiLoadRecord('vendor', salesOrder.getFieldValue('entity'));
//		        var entitynumber = entity.getFieldValue('entitynumber') ? entity.getFieldValue('entitynumber') : entity.id
//		        nsSalesOrder.custId = 'F' + entitynumber;
//		    }
//		    else
//		    {
//		
//				if(isNullOrEmpty(salesOrder.getFieldValue('entity')))
//					return;
//		
//				entity = nlapiLoadRecord('customer', salesOrder.getFieldValue('entity'));
//		
//				if(entity.getFieldValue('baserecordtype') == 'prospect'){
//					var entitynumber = entity.getFieldValue('entitynumber') ? entity.getFieldValue('entitynumber') : entity.id
//		            nsSalesOrder.custId = 'P' + entitynumber;
//		            }
//		        else {
//		        	var entitynumber = entity.getFieldValue('entitynumber') ? entity.getFieldValue('entitynumber') : entity.id
//		            nsSalesOrder.custId = 'C' + entitynumber;
//		        }
//		    }
//		
//			nsSalesOrder.companyName = entity.getFieldValue('entityid');
//		    nsSalesOrder.custTaxPayer = entity.getFieldValue('custentity_enl_statetaxpayer') == "T";
//		    nsSalesOrder.isSimpleTaxPayer = entity.getFieldValue('custentity_enl_simplesnacional') == "T";
//		    nsSalesOrder.isIndividual = entity.getFieldValue('isperson') == "T";
//		    customerAddress = entity.viewLineItemSubrecord('addressbook', 'addressbookaddress',1);
//		    nsSalesOrder.entityType = entity.getFieldValue('custentity_enl_entitytype');
//		    nsSalesOrder.activitySector = entity.getFieldValue('custentity_enl_ent_activitysector');
//		    nsSalesOrder.locationcpfCnpjNum = entity.getFieldValue('custentity_enl_cnpjcpf');
//		    nsSalesOrder.locationieNum= entity.getFieldValue('custentity_enl_ienum');
//		    nsSalesOrder.locationccmNum= entity.getFieldValue('custentity_enl_ccmnum');
//		    nsSalesOrder.suframaId = entity.getFieldValue('custentity_enl_suframaid');
//			nsSalesOrder.issWithhold = salesOrder.getFieldValue('custbody_enl_forceisswithhold') == "T" ? true : false;
//			nsSalesOrder.pisCofinsReliefZF = entity.getFieldValue('custentity_avlr_piscofinsrelizefzf') == "T";
//			
//			var constrution = salesOrder.getFieldValue('custbody_alvr_constrution_site')
//			if (constrution) {
//				var constructionSite = nlapiLoadRecord('customrecord_alvr_constrution_site', constrution);
//				nsSalesOrder.buildCode = constructionSite.getFieldValue('custrecord_avlr_codigo_obra');
//				nsSalesOrder.buildARTCode = constructionSite.getFieldValue('custrecord_avlr_codigo_art');
//			}
//		
//			var subsidiary = null;
//			var subsidiaryId = null;
//		
//		  	if(nlapiGetContext().getFeature('subsidiaries') == false)
//		    {
//				nlapiLogExecution('DEBUG', 'No-OW account',nlapiGetContext().getFeature('subsidiaries') );
//		
//				subsidiary = nlapiLoadConfiguration('companyinformation');
//		    }
//			else
//		    {
//				subsidiaryId = salesOrder.getFieldValue('subsidiary');
//		
//				nlapiLogExecution('DEBUG', 'OW account', subsidiaryId );
//		
//		        if(!isNullOrEmpty(subsidiaryId))
//		        {
//		            var subsidiary = nlapiLoadRecord('subsidiary', subsidiaryId);
//		            nsSalesOrder.companyid = subsidiary.getFieldValue('custrecord_enl_companyid');
//		            //nsSalesOrder.companyName = subsidiary.getFieldValue('name');
//					//nsSalesOrder.avataxbr = subsidiary.getFieldValue('custrecord_avlr_sub_avatax_version');
//					nsSalesOrder.avataxbr = 1;
//				}
//		        else 
//		        {
//		            return;
//		        }
//		    }
//		
//		  	if(softwareFiscalNA(subsidiary))
//		  		return;
//		
//			if(periodClosedAndlockCalc(salesOrder, subsidiary))
//				return;
//		
//			var documentTypeId = salesOrder.getFieldValue('custbody_enl_order_documenttype');
//			var issueInvoice = null;
//		
//			if (!isNullOrEmpty(documentTypeId))
//			{
//				var documentType = nlapiLoadRecord('customrecord_enl_fiscaldocumenttype', documentTypeId);
//				nsSalesOrder.documenttype = documentType.getFieldValue('custrecord_enl_fdt_shortname');
//				nsSalesOrder.documentmodel = documentType.getFieldValue('custrecord_enl_fdt_model');
//				issueInvoice = documentType.getFieldValue('custrecord_enl_issuereceiptdocument') ;
//		
//					if (documentType.getFieldValue('custrecord_enl_sendtofiscal') == "F")
//					return true;
//			}
//			else
//			{
//				return;
//			}
//		
//		
//			//Return if LockCalc is enable and Invoice is Issued
//			//nlapiLogExecution('DEBUG', 'NFStatus', salesOrder.getFieldValue('custbody_enl_fiscaldocstatus') );
//		
//			if (returnIssued(salesOrder, subsidiary, issueInvoice) )
//				return;
//		
//			var locationId = salesOrder.getFieldValue('location');
//			
//			if (!isNullOrEmpty(locationId)) 
//			{
//				var location = nlapiLoadRecord('location', locationId);
//				nsSalesOrder.establishment = location.getFieldValue('custrecord_enl_fiscalestablishmentid');
//				
//				var locationAddress = location.viewSubrecord('mainaddress');
//				
//				if(locationAddress != null)
//				{
//					nsSalesOrder.locationAddress = buildAddress(locationAddress);
//					locationCity = getCity(locationAddress);
//				}
//				
//			} 
//			else 
//			{
//				nsSalesOrder.establishment = '';
//			}
//		
//			var operationTypeId = salesOrder.getFieldValue('custbody_enl_operationtypeid');
//		
//			if (!isNullOrEmpty(operationTypeId)) 
//			{
//				var operationType = nlapiLoadRecord('customrecord_enl_operationtype', operationTypeId);
//				nsSalesOrder.operationtypeid = operationType.getFieldValue('custrecord_enl_ot_altname');
//		      	nsSalesOrder.usetype = operationType.getFieldValue('custrecord_enl_ot_usetype');
//		      	nsSalesOrder.finalprice = operationType.getFieldValue('custrecord_enl_ot_finalprice') == "T";
//			} 
//			else 
//			{
//				nlapiLogExecution('DEBUG', '#1', 'SAINDO')
//				return;
//			}
//		
//			nsSalesOrder.terms = '';
//			nsSalesOrder.ordertype = 'Saida';
//			nsSalesOrder.salesid = salesOrder.getFieldValue('tranid');
//			nsSalesOrder.salesdate = salesOrder.getFieldValue('trandate');
//			nsSalesOrder.currency = salesOrder.getFieldValue('currencyname');
//			
//			var shipaddress = null
//			if (nlapiGetRecordType() == 'vendorreturnauthorization' || nlapiGetRecordType() == 'vendorcredit')
//		      	shipaddress = salesOrder.viewSubrecord('billingaddress');
//		    else
//				shipaddress = salesOrder.viewSubrecord('shippingaddress');
//		  
//			if(shipaddress != null)
//				nsSalesOrder.shipAddress = buildAddress(shipaddress);
//		  	else
//				nsSalesOrder.shipAddress = buildAddress(customerAddress);
//		
//			var billaddress = salesOrder.viewSubrecord('billingaddress');
//			
//			if(billaddress != null)
//			{
//				nsSalesOrder.billAddress = buildAddress(billaddress);
//				entityCity = getCity(billaddress);
//			}
//			else
//		    {
//		      	nsSalesOrder.billAddress = buildAddress(customerAddress);
//				entityCity = getCity(customerAddress);
//		
//			}
//		
//			nsSalesOrder.deliveryLocation = createLocationEntity(salesOrder.getFieldValue('custbody_enl_deliverylocation'));
//		  
//			var nsSalesLine = [];
//		
//			var salesLineCount = salesOrder.getLineItemCount('item');
//			
//			var freightamount = 0;
//			var discamount = 0;
//		
//			for (var i = 1; i <= salesLineCount; i++) 
//			{
//		
//				if (salesOrder.getLineItemValue('item', 'itemtype', i) != "OthCharge" &&
//					salesOrder.getLineItemValue('item', 'itemtype', i) != "TaxItem" &&
//					salesOrder.getLineItemValue('item', 'itemtype', i) != "TaxGroup") 
//				{
//					var salesLine = {};
//		
//					salesLine.line = i;
//					
//					salesLine.item = newGetItemId(salesOrder, i, showDisplyName)
//	//				salesLine.item = getItemId(salesOrder.getLineItemValue('item', 'item', i), salesOrder.getLineItemValue('item', 'itemtype', i));
//					
//					salesLine.quantity = salesOrder.getLineItemValue('item', 'quantity', i);
//					salesLine.rate = salesOrder.getLineItemValue('item', 'rate', i) ;
//		
//					salesLine.netrate = salesOrder.getLineItemValue('item', 'rate', i);
//		
//					salesLine.freightamount	= salesOrder.getLineItemValue('item', 'custcol_enl_line_freightamount', i) || 0;
//		
//					salesLine.insuranceamount = salesOrder.getLineItemValue('item', 'custcol_enl_line_insuranceamount', i) * salesOrder.getFieldValue('exchangerate')|| 0;
//					salesLine.chargesamount   = salesOrder.getLineItemValue('item', 'custcol_enl_line_othersamount', i)   * salesOrder.getFieldValue('exchangerate') || 0;
//		
//					salesLine.discountitem	= salesOrder.getLineItemValue('item', 'custcol_enl_discamount', i) || 0;
//					salesLine.publicyAgencyDeduction = salesOrder.getLineItemValue('item', 'custcol_avlr_publicyagency_deduction', i) || 0;
//					salesLine.amount = salesLine.rate * salesLine.quantity;////salesOrder.getLineItemValue('item', 'amount', i);
//		
//		            salesLine.inssdeduction	= salesOrder.getLineItemValue('item', 'custcol_enl_line_inssdeduction', i)|| 0;
//		            salesLine.issdeduction = salesOrder.getLineItemValue('item', 'custcol_enl_line_issdeduction', i) || 0;
//		            salesLine.irdeduction	= salesOrder.getLineItemValue('item', 'custcol_enl_line_irdeduction', i)|| 0;
//		            salesLine.taxableoncustsite	= salesOrder.getLineItemValue('item', 'custcol_enl_line_taxableoncustsite', i) == "T";
//		
//					salesLine.externalOrderNum = salesOrder.getLineItemValue('item', 'custcol_enl_externalorder', i) || "";
//					salesLine.externalOrderLine = salesOrder.getLineItemValue('item', 'custcol_eur_externallinenum', i) || "";
//					
//					salesLine.refAccessKey = salesOrder.getLineItemValue('item', 'custcol_enl_ref_chaveacesso', i);
//		
//					//nlapiLogExecution('DEBUG', 'nsSalesOrder.avataxbr',nsSalesOrder.avataxbr)
//		
//		
//					var itemtype = salesOrder.getLineItemValue('item', 'itemtype', i);
//		
//					//nlapiLogExecution('DEBUG', 'itemtype',salesLine.item)
//		
//					if(!isNullOrEmpty(entitynumber)) {
//		
//						//nlapiLogExecution('DEBUG', 'custentity_avlr_issbehavior',parseInt(entity.getFieldValue('custentity_avlr_issbehavior')));
//		
//						var issbehavior = parseInt(entity.getFieldValue('custentity_avlr_issbehavior'));
//		
//						switch(issbehavior) {
//							case 1:
//								salesLine.issbehavior = 'normal';
//								break;
//							case 2:
//								salesLine.issbehavior = 'forcedWithholding';
//		
//								break;
//							case 3:
//								salesLine.issbehavior = 'forcedNoWithholding';
//								break;
//							case 4:
//								salesLine.issbehavior = 'exempt';
//								break;
//							default:
//								salesLine.issbehavior = 'normal';
//						};
//		
//						//nlapiLogExecution('DEBUG', 'issbehavior',salesLine.issbehavior);
//		
//					}
//		
//					if (itemtype === 'Service')
//					{
//						var svcItem = nlapiLoadRecord('serviceitem', salesOrder.getLineItemValue('item', 'item', i));
//						
//						salesLine.subjecttoirrfauto = svcItem.getFieldValue('custitem_avlr_subjecttoirrfauto') == "T" ? true : false;
//					}
//					
//					var _unTaxedOtherCostAmount = salesOrder.getLineItemValue('item', 'custcol_avlr_untaxedothercostamount', i)
//					if(_unTaxedOtherCostAmount)
//						salesLine.unTaxedOtherCostAmount = _unTaxedOtherCostAmount;
//		
//					nsSalesLine.push(salesLine);
//				}
//				else
//				{
//					if (salesOrder.getLineItemValue('item', 'itemtype', i) != "OthCharge")
//					{
//						salesOrder.removeLineItem('item', i, false);
//					}
//				}
//			}
//			nlapiLogExecution('DEBUG', '#4')
//			// Add the Referen Invoice for Calculation
//			nsSalesOrder.hasCPOM 		   = salesOrder.getFieldValue('custbody_enl_hascpom') == "T";
//			nsSalesOrder.refInvoiceId     = salesOrder.getFieldValue('custbody_enl_ref_numeronota');
//			nsSalesOrder.refAccessKey     = salesOrder.getFieldValue('custbody_enl_ref_chaveacesso');
//			nsSalesOrder.refInvoiceSerie  = salesOrder.getFieldValue('custbody_enl_ref_serie');
//			nsSalesOrder.refInvoiceDate   = salesOrder.getFieldValue('custbody_enl_ref_datadoc');
//		
//		
//			// Add the Referen Invoice for Calculation
//		
//			nsSalesOrder.refInvoiceId     = salesOrder.getFieldValue('custbody_enl_ref_numeronota');
//			nsSalesOrder.refAccessKey     = salesOrder.getFieldValue('custbody_enl_ref_chaveacesso');
//			nsSalesOrder.refInvoiceSerie  = salesOrder.getFieldValue('custbody_enl_ref_serie');
//			nsSalesOrder.refInvoiceDate   = salesOrder.getFieldValue('custbody_enl_ref_datadoc');
//		
//			nsSalesOrder.nsSalesLine = nsSalesLine;
		}
		else	// use middle
		{
			//nlapiLogExecution('DEBUG', 'NOT USE MIDDLE', salesOrder.getFieldValue('custbody_avlr_not_use_middle'))
			
			nsSalesOrder.header = {};
			var customerAddress;
			
			var operationTypeId = salesOrder.getFieldValue('custbody_enl_operationtypeid');
			if (operationTypeId) 
			{
				var operationType = nlapiLoadRecord('customrecord_enl_operationtype', operationTypeId);
				
				var useTpe = getUseType(operationType.getFieldValue('custrecord_enl_ot_usetype'));
				var shortName = operationType.getFieldValue('custrecord_enl_ot_altname');
				
				var operationFinancialTran = operationType.getFieldValue('custrecord_enl_financialtran') == "F";
				//nlapiLogExecution('DEBUG', 'operationFinancialTran', operationFinancialTran);
				
				var _approvalStatus = salesOrder.getFieldValue('approvalstatus'); 
				//nlapiLogExecution('DEBUG', '_approvalStatus', _approvalStatus);
				
			}
			else 
			{
				nlapiLogExecution('ERROR', 'Operation Type', 'Campo "Tipo de Operação" não definido');
				return;
			}
			
			
			var documentTypeId = salesOrder.getFieldValue('custbody_enl_order_documenttype');
			if (documentTypeId)
			{
				var documentType = nlapiLoadRecord('customrecord_enl_fiscaldocumenttype', documentTypeId);
				
				if (documentType.getFieldValue('custrecord_enl_sendtofiscal') == "F")
				{
					nlapiLogExecution('DEBUG', 'sendtofiscal', salesOrder.getFieldValue('custrecord_enl_sendtofiscal'))
					return;
				}
	
				var docTypeObj = {};
					docTypeObj.shortname = documentType.getFieldValue('custrecord_enl_fdt_shortname');
				
					docTypeObj.model = documentType.getFieldValue('custrecord_enl_fdt_model');
					
				var issueInvoice = documentType.getFieldValue('custrecord_enl_issuereceiptdocument') ;
		
			}
			else
			{
				nlapiLogExecution('ERROR', 'Document Type', 'Campo "Tipo de Documento" não definido');
				return;
			}
			
			
			if(['invoice','vendorcredit'].indexOf(nlapiGetRecordType()) > -1 &&  issueInvoice == 'F')
			{
				try 
				{
					if(operationFinancialTran && _approvalStatus != 2)
						salesOrder.setFieldValue('approvalstatus', 3); // Rejected
					else
						nlapiLogExecution('DEBUG', 'Approval Status', 'Status da nota : '+ salesOrder.getFieldText('approvalstatus'));
				} 
				catch (e) 
				{
					nlapiLogExecution('ERROR', 'Approval Status', e);
				}
			}
			
			
			if(nlapiGetContext().getFeature('subsidiaries') == false)
		    {
				nlapiLogExecution('DEBUG', 'No-OW account',nlapiGetContext().getFeature('subsidiaries') );
	
				var subsidiaryLoad = nlapiLoadConfiguration('companyinformation');
		    }
			else
			{
				var subsidiaryId = salesOrder.getFieldValue('subsidiary');
				if(subsidiaryId)
					var subsidiaryLoad = nlapiLoadRecord('subsidiary', subsidiaryId);
				else 
				{
					nlapiLogExecution('ERROR', 'Subsidiary', 'Campo "Subsidiaria" não definido');
					throw 'Campo "Subsidiaria" não definido';
				}
			}
	
			if(softwareFiscalNA(subsidiaryLoad))
				return;
			
			if(periodClosedAndlockCalc(salesOrder, subsidiaryLoad))
				return;
			
			if (returnIssued(salesOrder, subsidiaryLoad, issueInvoice) )
				return;
			
			var locationId = salesOrder.getFieldValue('location');
	    	if (locationId)
	    		var locationLoad = nlapiLoadRecord('location', locationId);
	    	else 
	    	{
	    		nlapiLogExecution('ERROR', 'Location', 'Campo "Location" não definido');
	    		throw 'Campo "Location" não definido';
	    	}
		    	
	    		nsSalesOrder.header.companyLocation = locationLoad.getFieldValue('custrecord_enl_fiscalestablishmentid');
			
	    		nsSalesOrder.header.transactionDate = nlapiStringToDate(salesOrder.getFieldValue('trandate'));
				//nlapiLogExecution('DEBUG', 'transactionDate', JSON.stringify(nsSalesOrder.header.transactionDate));
			
			
				nsSalesOrder.header.transactionType = "Sale";
				nsSalesOrder.header.currency = "BRL";
			
			if(!salesOrder.getFieldValue('entity'))
		    {
		      	nlapiLogExecution('ERROR', 'Entity', 'Campo "Entity" não definido');
		       	throw 'Campo "Entity" não definido';
		    }
	
		    if (nlapiGetRecordType() == 'vendorreturnauthorization' || nlapiGetRecordType() == 'vendorcredit')
		    	var entityLoad = nlapiLoadRecord('vendor', salesOrder.getFieldValue('entity'));
		    else
				var entityLoad = nlapiLoadRecord('customer', salesOrder.getFieldValue('entity'));
				
			if(useTpe == "service")
			{
				nsSalesOrder.header.discriminationIn = "Calc";
				
				nsSalesOrder.header.entity = {};
				nsSalesOrder.header.entity.name = entityLoad.getFieldValue('entityid').substring(0, 60);
				
				if(entityLoad.getFieldValue('custentity_enl_cnpjcpf'))
					nsSalesOrder.header.entity.cnpjcpf = removeSpecialCharacter(entityLoad.getFieldValue('custentity_enl_cnpjcpf'));
				
				if(entityLoad.getFieldValue('custentity_enl_ccmnum'))
					nsSalesOrder.header.entity.cityTaxId = removeSpecialCharacter(entityLoad.getFieldValue('custentity_enl_ccmnum'));
				
				if(entityLoad.getFieldValue('custentity_enl_ienum'))
					nsSalesOrder.header.entity.stateTaxId = removeSpecialCharacter(entityLoad.getFieldValue('custentity_enl_ienum'));
				
				var taxregime_ = entityLoad.getFieldValue('custentity_avlr_federaltaxationregime')

				if (isNullOrEmpty(taxregime_)) {

		        	if (isSimpleTaxPayer(entityLoad))
		        		nsSalesOrder.header.entity.taxRegime = "simplified";
		        	else if(isMei(entityLoad))
						nsSalesOrder.header.entity.taxRegime = "simplifiedEntrepreneur";
		        	else
		        		nsSalesOrder.header.entity.taxRegime = "estimatedProfit";
				}
				else {
					nsSalesOrder.header.entity.taxRegime = getTaxRegime(taxregime_);
				}
				nlapiLogExecution('DEBUG', 'TaxRegime Service', nsSalesOrder.header.entity.taxRegime);

				var constrution = salesOrder.getFieldValue('custbody_alvr_constrution_site') // Cadastro de Obra (Construção Civil)
		    	if (constrution) 
		    	{
		    		var constructionSite = nlapiLoadRecord('customrecord_alvr_constrution_site', constrution);
		    		var buildCode = constructionSite.getFieldValue('custrecord_avlr_codigo_obra');
		    		var buildARTCode = constructionSite.getFieldValue('custrecord_avlr_codigo_art');
	
		    		nsSalesOrder.header.entity.build = {};
	
		    		if (buildCode)
		    			nsSalesOrder.header.entity.build.code = buildCode;
	
		    		if (buildARTCode)
		    			nsSalesOrder.header.entity.build.art = buildARTCode;
		    	}
		        
				var billAddressId = salesOrder.viewSubrecord('billingaddress');
		        if(billAddressId)
		        {
		        	var billAddress = buildAddress(billAddressId);
		        }
		        else
	        	{
		        	var lineDefaultBilling = entityLoad.findLineItemValue('addressbook', 'defaultbilling', 'T');
		        	if(lineDefaultBilling < 0)
		        	{
		        		nlapiLogExecution('ERROR', 'buildAddress', '"Bill Address" não definido');
		        		throw 'buildAddress "Bill Address" não definido';
	        		}
		        	
		        	customerAddress = entityLoad.viewLineItemSubrecord('addressbook', 'addressbookaddress', lineDefaultBilling);
		        	if(customerAddress)
		        		var billAddress = buildAddress(customerAddress);
	        	}
					
		        nsSalesOrder.header.defaultLocations = {};
		        nsSalesOrder.header.defaultLocations.serviceTaker = {};
		        nsSalesOrder.header.defaultLocations.serviceTaker.address = {};
		        nsSalesOrder.header.defaultLocations.serviceTaker.address.city = billAddress.CityName;
		        nsSalesOrder.header.defaultLocations.serviceTaker.address.line3 = billAddress.Neighborhood;
		        nsSalesOrder.header.defaultLocations.serviceTaker.address.line2 = billAddress.Number;
		        nsSalesOrder.header.defaultLocations.serviceTaker.address.state = billAddress.State;
		        nsSalesOrder.header.defaultLocations.serviceTaker.address.zipcode = billAddress.Zipcode;
		        nsSalesOrder.header.defaultLocations.serviceTaker.address.line1 = billAddress.Street;
		        nsSalesOrder.header.defaultLocations.serviceTaker.address.country = billAddress.Country;
		        nsSalesOrder.header.defaultLocations.serviceTaker.address.countryCode = billAddress.CountryCode;
		        
		        
				if (billAddress.state == "EX")
		        {
		        	nsSalesOrder.header.entity.type = "foreign";
		        }
		        else
		        {
		        	var isIndividual = entityLoad.getFieldValue('isperson') == "T";
		            if(isIndividual)
		            	nsSalesOrder.header.entity.type = "individual";
		            else
		        	{
		            	var entityType = entityLoad.getFieldValue('custentity_enl_entitytype');
		            	nsSalesOrder.header.entity.type = getEntityType(entityType);
		        	}
		        }
				
				var deliveryLocationId = salesOrder.getFieldValue('custbody_enl_deliverylocation');
				//nlapiLogExecution('DEBUG', 'transporterId', deliveryLocationId);
				if(deliveryLocationId)
				{
					var billAddress = createLocationEntity(deliveryLocationId);
					if(!billAddress)
					{
						nlapiLogExecution('ERROR', 'buildAddress', '"Bill Address in Delivery Location" não definido');
						throw 'buildAddress "Bill Address in Delivery Location" não definido';
					}
					//nlapiLogExecution('DEBUG', 'delivery location', JSON.stringify(billAddress));
					
					nsSalesOrder.header.defaultLocations.serviceRendered = {};
					nsSalesOrder.header.defaultLocations.serviceRendered.address = {};
					nsSalesOrder.header.defaultLocations.serviceRendered.address.city = billAddress.addressCity;
					nsSalesOrder.header.defaultLocations.serviceRendered.address.line3 = billAddress.addressNeighborhood;
					nsSalesOrder.header.defaultLocations.serviceRendered.address.line2 = billAddress.addressNumber;
					nsSalesOrder.header.defaultLocations.serviceRendered.address.state = billAddress.addressState;
					nsSalesOrder.header.defaultLocations.serviceRendered.address.zipcode = billAddress.addressZipcode;
					nsSalesOrder.header.defaultLocations.serviceRendered.address.line1 = billAddress.addressStreet;
					nsSalesOrder.header.defaultLocations.serviceRendered.address.country = billAddress.addressCountry;
					nsSalesOrder.header.defaultLocations.serviceRendered.address.countryCode = billAddress.addressCountryCode;
				}
				else
				{
					nsSalesOrder.header.defaultLocations = {};
					nsSalesOrder.header.defaultLocations.serviceRendered = {};
					nsSalesOrder.header.defaultLocations.serviceRendered.address = {};
					nsSalesOrder.header.defaultLocations.serviceRendered.address.city = billAddress.CityName;
					nsSalesOrder.header.defaultLocations.serviceRendered.address.line3 = billAddress.Neighborhood;
					nsSalesOrder.header.defaultLocations.serviceRendered.address.line2 = billAddress.Number;
					nsSalesOrder.header.defaultLocations.serviceRendered.address.state = billAddress.State;
					nsSalesOrder.header.defaultLocations.serviceRendered.address.zipcode = billAddress.Zipcode;
					nsSalesOrder.header.defaultLocations.serviceRendered.address.line1 = billAddress.Street;
					nsSalesOrder.header.defaultLocations.serviceRendered.address.country = billAddress.Country;
					nsSalesOrder.header.defaultLocations.serviceRendered.address.countryCode = billAddress.CountryCode;
				}
		        
		        var hasCPOM = salesOrder.getFieldValue('custbody_enl_hascpom') == "T";
		        
		        var inssDeduction = 0;
		        
		        var issbehavior = parseInt(entityLoad.getFieldValue('custentity_avlr_issbehavior'));
			}
			else // goods
			{
				if (docTypeObj.model)
					nsSalesOrder.header.transactionModel = docTypeObj.model;
				
				//nsSalesOrder.header.usetype = useTpe;
				
				var finalprice = operationType.getFieldValue('custrecord_enl_ot_finalprice') == "T";
				if (finalprice)
					nsSalesOrder.header.amountCalcType = "final";
	
				nsSalesOrder.header.eDocCreatorPerspective = shortName != "standardPurchaseReturnShippingOutbound";
				nsSalesOrder.header.eDocCreatorType = "self";
				
				if(docTypeObj.model == 65)
		        	nsSalesOrder.header.idDest = 1;
				
				nsSalesOrder.header.messageType = "goods";
				
				nsSalesOrder.header.participants = {};
		        nsSalesOrder.header.participants.entity = {};
		        nsSalesOrder.header.participants.entity.name = entityLoad.getFieldValue('entityid').substring(0, 60);
		        nsSalesOrder.header.participants.entity.icmsTaxPayer = entityLoad.getFieldValue('custentity_enl_statetaxpayer') == "T";
		        
		        if(entityLoad.getFieldValue('custentity_enl_cnpjcpf'))
		        	nsSalesOrder.header.participants.entity.federalTaxId = removeSpecialCharacter(entityLoad.getFieldValue('custentity_enl_cnpjcpf'));
	
		        if(entityLoad.getFieldValue('custentity_enl_ccmnum'))
		        	nsSalesOrder.header.participants.entity.cityTaxId = removeSpecialCharacter(entityLoad.getFieldValue('custentity_enl_ccmnum'));
	
		        if(entityLoad.getFieldValue('custentity_enl_ienum'))
		        	nsSalesOrder.header.participants.entity.stateTaxId = removeSpecialCharacter(entityLoad.getFieldValue('custentity_enl_ienum'));
	
		        nsSalesOrder.header.participants.entity.suframa = entityLoad.getFieldValue('custentity_enl_suframaid');
	
		        var activitySector = entityLoad.getFieldValue('custentity_enl_ent_activitysector');
		        if (activitySector)
		        {
		        	nsSalesOrder.header.participants.entity.activitySector = {};
		        	nsSalesOrder.header.participants.entity.activitySector.type = "activityLine";
		        	nsSalesOrder.header.participants.entity.activitySector.code = getActivitySector(activitySector);
		        }
	
		        var taxregime_ = entityLoad.getFieldValue('custentity_avlr_federaltaxationregime')

				if (isNullOrEmpty(taxregime_)) {

					if (isSimpleTaxPayer(entityLoad))
						nsSalesOrder.header.participants.entity.taxRegime = "simplified";
					else if(isMei(entityLoad))
						nsSalesOrder.header.participants.entity.taxRegime = "simplifiedEntrepreneur";
					else
					{
						var _locationCnpj = locationLoad.getFieldValue('custrecord_enl_fiscalestablishmentid');
						if(_locationCnpj.indexOf("13589504") == 0) // start with
							nsSalesOrder.header.participants.entity.taxRegime = "realProfit";
						else
							nsSalesOrder.header.participants.entity.taxRegime = "estimatedProfit";
					}

				}
				else {
					nsSalesOrder.header.participants.entity.taxRegime = getTaxRegime(taxregime_);
				}
				nlapiLogExecution('DEBUG', 'TaxRegimeGoods', nsSalesOrder.header.participants.entity.taxRegime);












				var pisCofinsReliefZF = entityLoad.getFieldValue('custentity_avlr_piscofinsrelizefzf') == "T";
				if(pisCofinsReliefZF)
					nsSalesOrder.header.participants.entity.pisCofinsReliefZF = true;
				 
		        nsSalesOrder.header.defaultLocations = {}
			        
		        var billAddressId = salesOrder.viewSubrecord('billingaddress');
		        if(billAddressId)
		        {
		        	var billAddress = buildAddress(billAddressId);
		        }
		        else
	        	{
		        	var lineDefaultBilling = entityLoad.findLineItemValue('addressbook', 'defaultbilling', 'T');
		        	if(lineDefaultBilling < 0)
		        	{
		        		nlapiLogExecution('ERROR', 'buildAddress', '"Bill Address" não definido');
		        		throw 'buildAddress "Bill Address" não definido';
	        		}
		        	
		        	customerAddress = entityLoad.viewLineItemSubrecord('addressbook', 'addressbookaddress', lineDefaultBilling);
		        	if(customerAddress)
		        		var billAddress = buildAddress(customerAddress);
	        	}
						
		        nsSalesOrder.header.defaultLocations.entity = {};
		        nsSalesOrder.header.defaultLocations.entity.cityName = billAddress.CityName;
		        nsSalesOrder.header.defaultLocations.entity.neighborhood = billAddress.Neighborhood;
		        nsSalesOrder.header.defaultLocations.entity.number = billAddress.Number;
		        nsSalesOrder.header.defaultLocations.entity.state = billAddress.State;
		        nsSalesOrder.header.defaultLocations.entity.zipcode = billAddress.Zipcode;
		        nsSalesOrder.header.defaultLocations.entity.country = billAddress.Country;
		        nsSalesOrder.header.defaultLocations.entity.countryCode = billAddress.CountryCode;
			        
		        if (billAddress.state == "EX")
		        {
		        	nsSalesOrder.header.participants.entity.type = "foreign";
		        }
		        else
		        {
		        	var isIndividual = entityLoad.getFieldValue('isperson') == "T";
		            if(isIndividual)
		            	nsSalesOrder.header.participants.entity.type = "individual";
		            else
		        	{
		            	var entityType = entityLoad.getFieldValue('custentity_enl_entitytype');
		            	nsSalesOrder.header.participants.entity.type = getEntityType(entityType);
		        	}
		        }
	
		        var locationAddress = locationLoad.viewSubrecord('mainaddress');
		        if(locationAddress)
		        {
		        	var locationAddress = buildAddress(locationAddress);
		        	if (!isEmptyObj(locationAddress))
		        	{
		        		nsSalesOrder.header.defaultLocations.company = {};
		        		nsSalesOrder.header.defaultLocations.company.cityName = locationAddress.CityName;
		        		nsSalesOrder.header.defaultLocations.company.complement = "0";
		        		nsSalesOrder.header.defaultLocations.company.neighborhood = locationAddress.Neighborhood;
		        		nsSalesOrder.header.defaultLocations.company.number = locationAddress.Number;
		        		nsSalesOrder.header.defaultLocations.company.state = locationAddress.State;
		        		nsSalesOrder.header.defaultLocations.company.zipcode = locationAddress.Zipcode;
		        		nsSalesOrder.header.defaultLocations.company.country = locationAddress.Country;
		        		nsSalesOrder.header.defaultLocations.company.countryCode = locationAddress.CountryCode;
		        	}
			        	
	//	        	locationCity = getCity(locationAddress);
		        }
		        else
	        	{
		        	nlapiLogExecution('ERROR', 'locationAddress', '"Address" não definido');
		        	throw 'locationAddress "Address" não definido';
	        	}
			        
		        nsSalesOrder.header.nfRef = [];
			        
		        var refAccessKey = salesOrder.getFieldValue('custbody_enl_ref_chaveacesso');
		        if (refAccessKey)
		        {
		            var nRefObj = {}
			            nRefObj.type = "refNFe";
			            nRefObj.refNFe = refAccessKey;
				            
		            nsSalesOrder.header.nfRef.push(nRefObj);
		        }
		        
			} // end goods
			
	
			nsSalesOrder.lines = [];
			
	        var salesLineCount = salesOrder.getLineItemCount('item');
	        
	        for (var i = 1; i <= salesLineCount; i++)
	        {
	        	var itemtype = salesOrder.getLineItemValue('item', 'itemtype', i);
	        	
	        	if(itemtype != "OthCharge" && itemtype != "TaxItem" && itemtype != "TaxGroup")
	        	{
	        		var salesLine = {};
	        			salesLine.lineCode = i;
	        			var itemObj = newGetItemId(salesOrder, i, showDisplyName);
	            		salesLine.itemCode = itemObj.itemId;
	            		salesLine.itemDescription = itemObj.itemId;
	            		
	            		if(shortName == "amountComplementary")
	            			salesLine.numberOfItems = 0.0;
						else
							salesLine.numberOfItems = Number(salesOrder.getLineItemValue('item', 'quantity', i));
	        		
	        		var rate = parseFloat(salesOrder.getLineItemValue('item', 'rate', i));
	            	
	            		salesLine.lineAmount = rate * salesLine.numberOfItems;
	            	
	            	var discamount = salesOrder.getLineItemValue('item', 'custcol_enl_discamount', i);
	            	if(discamount)
	            		salesLine.lineTaxedDiscount = parseFloat(discamount);
	            	
	            	//line.LineUntaxedDiscount = 0;
	        		
	        		if(useTpe == "service")
	        		{
	        			var svcItem = nlapiLoadRecord('serviceitem', salesOrder.getLineItemValue('item', 'item', i));
	        			
	        			salesLine.hasCpom = hasCPOM;
	        			
	        			if(salesOrder.getLineItemValue('item', 'custcol_enl_line_inssdeduction', i))
	        				inssDeduction += parseFloat(salesOrder.getLineItemValue('item', 'custcol_enl_line_inssdeduction', i));
	        			
	        			var subjectToIRRFAuto = svcItem.getFieldValue('custitem_avlr_subjecttoirrfauto') == "T";
	
	    				
	        			if (subjectToIRRFAuto || issbehavior)
	                    {
	                        salesLine.taxForItem = {};
	
	                        if (subjectToIRRFAuto)
	                            salesLine.taxForItem.subjectToIRRFAuto = subjectToIRRFAuto;
	
	                        if(issbehavior)
	                        	switch(issbehavior) 
	            				{
	            					case 1:
	            						salesLine.taxForItem.issBehavior = 'normal';
	            						break;
	            					case 2:
	            						salesLine.taxForItem.issBehavior = 'forcedWithholding';
	
	            						break;
	            					case 3:
	            						salesLine.taxForItem.issBehavior = 'forcedNoWithholding';
	            						break;
	            					case 4:
	            						salesLine.taxForItem.issBehavior = 'exempt';
	            						break;
	            					default:
	            						salesLine.taxForItem.issBehavior = 'normal';
	            				};
	                    }
	        			
	        			var irdeduction	= parseFloat(salesOrder.getLineItemValue('item', 'custcol_enl_line_irdeduction', i));
	        			var publicyAgencyDeduction = parseFloat(salesOrder.getLineItemValue('item', 'custcol_avlr_publicyagency_deduction', i));
	        			var issdeduction = parseFloat(salesOrder.getLineItemValue('item', 'custcol_enl_line_issdeduction', i));
	        			
	        			if (irdeduction || publicyAgencyDeduction || issdeduction)
	                    {
	                        salesLine.taxDeductions = {};
	
	                        if (irdeduction)
	                            salesLine.taxDeductions.irrfAuto = irdeduction;
	
	                        if (publicyAgencyDeduction)
	                            salesLine.taxDeductions.transferAmount = publicyAgencyDeduction;
	
	                        if (issdeduction)
	                            salesLine.taxDeductions.iss = issdeduction;
	                    }
	        			
	        		}
	        		else // goods
	    			{
	        			salesLine.lineUnitPrice = rate;
	        			
	        			salesLine.useType = useTpe;
	                	
	                	var freightamount = salesOrder.getLineItemValue('item', 'custcol_enl_line_freightamount', i)
	                	if(freightamount)
	                		salesLine.freightAmount = parseFloat(freightamount);
	        
	                	var insuranceAmount = salesOrder.getLineItemValue('item', 'custcol_enl_line_insuranceamount', i);
	                	var exchangerate = salesOrder.getFieldValue('exchangerate')
	                	if(insuranceAmount && exchangerate)
	                		salesLine.insuranceAmount = parseFloat(insuranceAmount) * parseFloat(exchangerate);
	                	
	                	var chargesAmount = salesOrder.getLineItemValue('item', 'custcol_enl_line_othersamount', i)
	                	if(chargesAmount && exchangerate)
	                		salesLine.otherCostAmount = parseFloat(chargesAmount) * parseFloat(exchangerate);
	                	
	                	salesLine.entityIsIcmsSubstitute = false;
	                	salesLine.overwrite = "no";
	                	salesLine.hasStockImpact = true;
	                	salesLine.hasFinantialImpact = true;
	                	salesLine.processScenario = shortName;
	                	
	                	var externalOrder = salesOrder.getLineItemValue('item', 'custcol_enl_externalorder', i)
	                	if(externalOrder)
	                		salesLine.orderNumber = externalOrder;
	                	
	                	var externalOrderLine = salesOrder.getLineItemValue('item', 'custcol_eur_externallinenum', i)
	                	if(externalOrderLine)
	                		salesLine.orderItemNumber = externalOrderLine
	                		
	            		var _unTaxedOtherCostAmount = salesOrder.getLineItemValue('item', 'custcol_avlr_untaxedothercostamount', i)
	        			if(_unTaxedOtherCostAmount)
	        				salesLine.unTaxedOtherCostAmount = parseFloat(_unTaxedOtherCostAmount);
	                	
	        			var refAccessKeyLine = salesOrder.getLineItemValue('item', 'custcol_enl_ref_chaveacesso', i);
	        			if (refAccessKeyLine)
	        			{
	        				var _index =  nsSalesOrder.header.nfRef.map(function(e) {
	        					return e.refNFe == refAccessKeyLine;
	        				}).indexOf(true);
	        				
	        				if(_index == -1)
	        				{
	        					var nRefObj = {}
	        					nRefObj.type = "refNFe";
	        					nRefObj.refNFe = refAccessKeyLine;
	        					
	        					nsSalesOrder.header.nfRef.push(nRefObj);
	        				}
	        			}
	        			
	        			nlapiLogExecution('DEBUG', 'itemObj.cbar', itemObj.cbar)
	        			if(itemObj.cbar)
						{
							if(!salesLine.itemDescriptor)
								salesLine.itemDescriptor = {};
							
							salesLine.itemDescriptor.code = itemObj.itemId;
							salesLine.itemDescriptor.cBar = itemObj.cbar;
						}
	        			
	    			}// end goods
	    
	            	nsSalesOrder.lines.push(salesLine);
	        	}
	        	else
	    		{
	    			if (salesOrder.getLineItemValue('item', 'itemtype', i) != "OthCharge")
	    			{
	    				salesOrder.removeLineItem('item', i, false);
	    			}
	    		}
	        	
	        }// end for
	        
	        if(inssDeduction && useTpe == "service")
	        {
	        	nsSalesOrder.header.entity.inssBasisDiscount =  inssDeduction;
	        }
	        
		}

	
		nlapiLogExecution('DEBUG', 'Request from Fiscal', JSON.stringify(nsSalesOrder))
		
		if(_notNseMiddle)
			var response = sendToFiscal(subsidiary, nsSalesOrder);
		else
		{
			var response = sendToDetermination(subsidiaryLoad, locationLoad, nsSalesOrder, operationType, useTpe, salesOrder, type) 
		}
		
		
		if(response)
		{
			if(_notNseMiddle)
				nlapiLogExecution('DEBUG', 'Response from Middle', response.getBody());
			else
				nlapiLogExecution('DEBUG', 'Response from Middle', JSON.stringify(response));

			if(_notNseMiddle)
				var nsResponse = JSON.parse(response.getBody());
			else
				var nsResponse = response;
				
			if (nsResponse.Status == false) 
			{
				//throw nlapiCreateError('Calculo Ordem de Venda', nsResponse.Message, true);
				
				salesOrder.setFieldValue('custbody_enl_messagespl', nsResponse.Message);
				salesOrder.setFieldValue('custbody_enl_fiscaldocstatus', 7); // Erro
			}

			if (nsResponse.ObjectReturn != null) 
			{
				setLineField(salesOrder, nsResponse.ObjectReturn);
				processCalcOrderV2(salesOrder, nsResponse.ObjectReturn);
				//nlapiSetFieldValue('')
			}
		}
	} 
	catch (e) 
	{
		nlapiLogExecution('ERROR', 'Remaining governance units', nlapiGetContext().getRemainingUsage());
		
		nlapiLogExecution('DEBUG', 'ERRO - Calculo Ordem de Venda', e);
		//nlapiLogExecution('DEBUG', 'ERRO - Calculo Ordem de Venda', JSON.stringify(e));
		//throw nlapiCreateError('Calculo Ordem de Venda', JSON.stringify(e), true);
		
		salesOrder.setFieldValue('custbody_enl_messagespl', e);
		salesOrder.setFieldValue('custbody_enl_fiscaldocstatus', 7); // Erro
	}

	nlapiLogExecution('DEBUG', 'Remaining governance units', nlapiGetContext().getRemainingUsage());
	
}

function setLineField(salesOrder, objReturned) 
{
	var cfops = buildCFOPArray();

	if (objReturned.Legaltext != null && objReturned.Legaltext != "") 
	{
		salesOrder.setFieldValue('custbody_enl_stdlegaltxt', objReturned.Legaltext);
	}

	for (var i = 0; i < objReturned.CalcOrderLines.length; i++) 
    {
		if (objReturned.CalcOrderLines[i].Cfop != null) 
        {
			salesOrder.setLineItemValue('item', 'custcol_enl_cfopitem', objReturned.CalcOrderLines[i].LineNum, cfops[objReturned.CalcOrderLines[i].Cfop]);
		}

      	salesOrder.setLineItemValue('item', 'custcol_enl_taxamtperunit', objReturned.CalcOrderLines[i].LineNum, objReturned.CalcOrderLines[i].TaxRateAmount);
    	salesOrder.setLineItemValue('item', 'tax1amt', objReturned.CalcOrderLines[i].LineNum, objReturned.CalcOrderLines[i].TaxAmount);
      
      	var amount = parseFloat(salesOrder.getLineItemValue('item', 'quantity', objReturned.CalcOrderLines[i].LineNum) * salesOrder.getLineItemValue('item', 'rate', objReturned.CalcOrderLines[i].LineNum));
      
      	if(salesOrder.getLineItemValue('item', 'custcol_enl_line_freightamount', objReturned.CalcOrderLines[i].LineNum) != null)// && parseInt(salesOrder.getFieldValue('custbody_enl_freighttype')) == 2)
            amount += parseFloat(salesOrder.getLineItemValue('item', 'custcol_enl_line_freightamount', objReturned.CalcOrderLines[i].LineNum));
// changed nbc-793

		if(salesOrder.getLineItemValue('item', 'custcol_enl_line_insuranceamount', objReturned.CalcOrderLines[i].LineNum) != null)
			amount += parseFloat(salesOrder.getLineItemValue('item', 'custcol_enl_line_insuranceamount', objReturned.CalcOrderLines[i].LineNum));

		if(salesOrder.getLineItemValue('item', 'custcol_enl_line_othersamount', objReturned.CalcOrderLines[i].LineNum) != null)
			amount += parseFloat(salesOrder.getLineItemValue('item', 'custcol_enl_line_othersamount', objReturned.CalcOrderLines[i].LineNum));

      
      	if(salesOrder.getLineItemValue('item', 'custcol_enl_discamount', objReturned.CalcOrderLines[i].LineNum) != null)
            amount -= parseFloat(salesOrder.getLineItemValue('item', 'custcol_enl_discamount', objReturned.CalcOrderLines[i].LineNum));

		if(salesOrder.getLineItemValue('item', 'custcol_avlr_untaxedothercostamount', objReturned.CalcOrderLines[i].LineNum))
			amount += parseFloat(salesOrder.getLineItemValue('item', 'custcol_avlr_untaxedothercostamount', objReturned.CalcOrderLines[i].LineNum));

      
      	salesOrder.setLineItemValue('item', 'amount', objReturned.CalcOrderLines[i].LineNum, roundRfb(amount));

		salesOrder.setLineItemValue('item', 'custcol_ava_icmsst', objReturned.CalcOrderLines[i].LineNum, objReturned.CalcOrderLines[i].HasIcmsSt ? "T" : "F");

	}
}

function afterSubmit(type)
{
	try 
	{
		if(type == 'delete')
			return;

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
		
		var salesOrder = nlapiGetNewRecord();
		
		var _randomString = salesOrder.getFieldValue('custbody_avlr_randomstring');
		if(_randomString)
		{
			var requestObj = nlapiGetContext().getSessionObject('avlr_requestobj'+_randomString);
			//nlapiLogExecution('DEBUG', 'requestObj', requestObj);
			
			if(requestObj)
			{
				var fileName = "CalculoRequest"+salesOrder.getId()+".json";
				attachFile(fileName, requestObj, salesOrder);
				
				nlapiGetContext().setSessionObject('avlr_requestobj'+_randomString, '')
			}
			
			var responseObj = nlapiGetContext().getSessionObject('avlr_responseobj'+_randomString);
			//nlapiLogExecution('DEBUG', 'responseObj', responseObj);
			
			if(responseObj)
			{
				var fileName = "CalculoResponse"+salesOrder.getId()+".json";
				attachFile(fileName, responseObj, salesOrder);
				
				nlapiGetContext().setSessionObject('avlr_responseobj'+_randomString, '')
			}
		}
		else
		{
			nlapiLogExecution('ERROR', 'Random String', 'Null');
		}
	} 
	catch (e) 
	{
		nlapiLogExecution('DEBUG', 'afterSubmit', e);
		//throw nlapiCreateError('afterSubmit', JSON.stringify(e), true); 
	}
}

function beforeLoad(type, form){
	
	runHideFields(type, form);
	
	/*Get all new items tax */
//	const vendorCredit = nlapiGetNewRecord()
//	const vendCredItemCount = vendorCredit.getLineItemCount('item')
//
//	/*Get all matrix item tax*/
//	const createdFromId = vendorCredit.getFieldValue('createdfrom')
//	const checkExist = nlapiLookupField('vendorreturnauthorization', createdFromId, 'internalid')
//
//	//If super Register does not exist, stop all script
//	if(!checkExist)
//		return
//
//	const vendAuth = nlapiLoadRecord('vendorreturnauthorization', createdFromId)
//	const vendAuthItemCount = vendAuth.getLineItemCount('item')
//	const itemCreatedFrom = []
//
//	/*Fulfill item ARRAY from matrix record */
//	for (var i = 1; i <= vendAuthItemCount; i++) {
//		var item = {
//			lineuniquekey: vendAuth.getLineItemValue('item', 'lineuniquekey', i),
//			taxAmount: vendAuth.getLineItemValue('item', 'tax1amt', i),
//			amount: vendAuth.getLineItemValue('item', 'amount', i),
//			taxCode: vendAuth.getLineItemValue('item', 'taxcode', i),
//			itemDisplay: vendAuth.getLineItemValue('item', 'item_display', i),
//			line: i
//		}
//		itemCreatedFrom.push(item)
//	}
//
//	/*Fulfill item LIST from new items record */
//	for (var i = 1; i <= vendCredItemCount; i++) {
//		var lineuniquekey = vendorCredit.getLineItemValue('item', 'lineuniquekey', i)
//		var itemDisplay = vendorCredit.getLineItemValue('item', 'item_display', i)
//		var amount = vendorCredit.getLineItemValue('item', 'amount', i)
//		
//		var selectedLine = itemCreatedFrom.filter(function(x) { return x.lineuniquekey === lineuniquekey 
//																	&& x.itemDisplay === itemDisplay
//																	&& x.amount === amount })
//
//		if(selectedLine || selectedLine.length === 0){
//			vendorCredit.setLineItemValue('item', 'tax1amt', i, selectedLine[0].taxAmount)
//			vendorCredit.setLineItemValue('item', 'amount', i, selectedLine[0].amount)
//			vendorCredit.setLineItemValue('item', 'taxcode', i, selectedLine[0].taxCode)
//		}
//	}
}
function getCity(address)
{
	var cityCode = null;

	if(address != null)
	{
		//nlapiLogExecution('DEBUG', 'address',address);
		//nlapiLogExecution('DEBUG', 'cityname',address.getFieldText('custrecord_enl_city'));
		
		if(!isNullOrEmpty(address.getFieldValue('custrecord_enl_city')))
		{
			var city = nlapiLoadRecord('customrecord_enl_cities', address.getFieldValue('custrecord_enl_city'));

			//nlapiLogExecution('DEBUG', 'city',city);

			cityCode = city.getFieldValue('id');

			//nlapiLogExecution('DEBUG', 'cityCode',cityCode);

		}
	}

	return cityCode;
}

function getServiceCode(itemId, cityId) {

	var filter = [];
	filter.push(new nlobjSearchFilter('custrecord_avlr_city_servicecode_item', null, 'anyof', itemId));
	filter.push(new nlobjSearchFilter('custrecord_avlr_city_servicecode', null, 'anyof', cityId));

	var columns = [];
	columns.push(new nlobjSearchColumn('internalid'));
	columns.push(new nlobjSearchColumn('custrecord_avlr_city_servicecode_scode'));

	var serviceCode = nlapiSearchRecord('customrecord_avlr_city_servicecode', null, filter, columns);

	if(serviceCode != null)
		return serviceCode[0].getValue('custrecord_avlr_city_servicecode_scode')

	return null
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
