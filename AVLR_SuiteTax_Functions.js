
/**
 *@NApiVersion 2.x
 *@NModuleScope Public
 */

define([
	'N/search', 
	'N/https', 
	'N/record', 
	'N/error', 
	'N/format', 
	'N/runtime', 
	'N/file', 
	'N/ui/message', 
	'N/ui/serverWidget',
	'./AVLR_FromTo.js',
	'./AVLR_UtilV3.js'
],

function(search, https, record, error, format, runtime, file, message, serverWidget, fromTo, avlrUtil) 
{	
	function getJsonRequest(input, subsidiaryLoad, transactionLoad) 
    {
		var scriptObj = runtime.getCurrentScript();
		
		var dbstrantype = input.getAdditionalFieldValue('type', transactionLoad);
		// log.debug('beforeLoad dbstrantype', dbstrantype);
		var customTypeId = input.getAdditionalFieldValue('ntype', transactionLoad);
		// log.debug('beforeLoad customTypeId', customTypeId);


		var operationTypeId = input.getAdditionalFieldValue('custbody_enl_operationtypeid', transactionLoad);
		if(!operationTypeId && runtime.executionContext == "TAXCALCULATION")
			throw new Error("Tipo de Operação não definido.")

		var operationTypeLoad = record.load({type: 'customrecord_enl_operationtype', id: operationTypeId});
		
		var documentTypeId = input.getAdditionalFieldValue('custbody_enl_order_documenttype', transactionLoad);
		if(!documentTypeId && runtime.executionContext == "TAXCALCULATION")
			throw new Error("Tipo de Documento Fiscal não definido.")

		var documentTypeLoad = record.load({type: 'customrecord_enl_fiscaldocumenttype', id: documentTypeId})
    		
    	var locationId = input.location;
		if(!locationId && runtime.executionContext == "TAXCALCULATION")
			throw new Error("Localidade não definido.")

		var locationLoad = record.load({type: record.Type.LOCATION, id: locationId, isDynamic: true});	
		
		if(runtime.executionContext == "TAXCALCULATION")
			var transType = input.recordType;
		else
			var transType = transactionLoad.type;
		
//    	log.debug('getJsonRequest', 'begin');
    	var transactionObj = {header: {}, lines: []}
    	
    	// header --------------------------------------------------------------------------------
    	
    	// locations -----------------------------------------------------------------------------
    	transactionObj.header.locations = {};
    		
	    	var entityType = input.entityType; 
			var entityID = input.entity;
		
    		var entityLoad = record.load({type: entityType, id: entityID});
    		
    		// entity --------------------------------------------------------------------------------
    		transactionObj.header.locations.entity = {};
    			
    			if(transType != "transferorder")
				{
    				transactionObj.header.locations.entity.name = entityLoad.getValue('entityid').substring(0, 60);
    				//transactionObj.header.locations.entity.businessName = '';
    				
    				
    				transactionObj.header.locations.entity.cityTaxId = avlrUtil.removeCharacters(entityLoad.getValue('custentity_enl_ccmnum')); // INSCRIÇÃO MUNICIPAL
    				transactionObj.header.locations.entity.stateTaxId = avlrUtil.removeCharacters(entityLoad.getValue('custentity_enl_ienum')); // INSCRIÇÃO ESTADUAL
    				
    				
    				var suframaId = entityLoad.getValue('custentity_enl_suframaid');
    				if(suframaId)
    					transactionObj.header.locations.entity.suframa = suframaId; // SUFRAMA
    				
    				
    				var federalTaxationRegime = entityLoad.getValue('custentity_avlr_federaltaxationregime');
    				transactionObj.header.locations.entity.taxRegime = fromTo.getFederalTaxationRegime(federalTaxationRegime)
    				
    				
    				// taxesSettings
    				transactionObj.header.locations.entity.taxesSettings = {}
    				
    				transactionObj.header.locations.entity.taxesSettings.icmsTaxPayer = entityLoad.getValue('custentity_enl_statetaxpayer');
    				transactionObj.header.locations.entity.taxesSettings.subjectToPayrollTaxRelief = entityLoad.getValue('custentity_avlr_subjectpayrolltaxrelief');
    				transactionObj.header.locations.entity.taxesSettings.pisFopag = entityLoad.getValue('custentity_avlr_pisfopag');
    				transactionObj.header.locations.entity.taxesSettings.pisCofinsReliefZF = entityLoad.getValue('custentity_avlr_piscofinsrelizefzf');
    				
					var _piscofinsreliefzflikeud = entityLoad.getValue('custentity_avlr_piscofinsreliefzflikeud');
					if(_piscofinsreliefzflikeud)
						transactionObj.header.locations.entity.taxesSettings.pisCofinsReliefZFLikeUDisc = _piscofinsreliefzflikeud;

    				if(['purchaseorder', 'vendorbill', 'creditmemo', 'returnauthorization'].indexOf(transType) > -1)
    				{
    					var issRate = input.getAdditionalFieldValue('custbody_enl_customissrate', transactionLoad);
    					if(issRate)
    						transactionObj.header.locations.entity.taxesSettings.issRfRateForSimplesTaxRegime = issRate;
    					
    					var icmsRate = input.getAdditionalFieldValue('custbody_enl_customicmsrate', transactionLoad);
    					if(icmsRate)
    						transactionObj.header.locations.entity.taxesSettings.pCredSN = icmsRate;
    					
    				}
    				
    				// end taxesSettings
    				
    				// address
    				
    				if(runtime.executionContext == "TAXCALCULATION")
    				{
    					var billFromAddress = input.billFromAddress;
    					var shipFromAddress = input.shipFromAddress;

    					var billToAddress = entityType == 'vendor' ? billFromAddress : input.billToAddress;
    					var shipToAddress = input.shipToAddress;
    				}
    				else
    				{
    					var billToAddress = input.billToAddress(transactionLoad);
    				}
    					
    				//log.debug('billFromAddress', JSON.stringify(billFromAddress))
    				//log.debug('billToAddress', JSON.stringify(billToAddress))
    				//log.debug('shipFromAddress', JSON.stringify(shipFromAddress))
    				//log.debug('shipToAddress', JSON.stringify(shipToAddress))
    				
    				
    				//log.debug('isEmptyObj(billToAddress)', isEmptyObj(billToAddress))
    				if(billToAddress && !avlrUtil.isEmptyObj(billToAddress))
    				{
    					if(runtime.executionContext == "TAXCALCULATION")
    						var entityAddressObj = getAddress(null, billToAddress);
    					else
    						var entityAddressObj = getAddress(billToAddress);
    				}
    				else
					{
    					var addressId = entityLoad.findSublistLineWithValue({sublistId: 'addressbook',	fieldId: 'defaultbilling', value: 'T'});
    					if(addressId < 0)
    						throw error.create({name: 'ERROR AvaTAxBR', message: 'Endereço "'+ entityType +'" não definido.', notifyOff: false});
    					
    					var entityAddressSubrecord = entityLoad.getSublistSubrecord({sublistId: 'addressbook',	fieldId: 'addressbookaddress', line: addressId});
    					var entityAddressObj = getAddress(entityAddressSubrecord);
					}

    				if(billToAddress && !avlrUtil.isEmptyObj(entityAddressObj))
    					transactionObj.header.locations.entity.address = entityAddressObj;
    				// end address
    				
    				if(entityAddressObj.countryCode && entityAddressObj.countryCode != '1058') //[ business, individual, federalGovernment, stateGovernment, cityGovernment, foreign, mixedCapital ]
    				{
    					transactionObj.header.locations.entity.federalTaxId = pad(entityLoad.getValue('entity'), 20); // not use more this: '99999999999999';
    					transactionObj.header.locations.entity.type = 'foreign';
    				}
    				else
    				{
    					transactionObj.header.locations.entity.federalTaxId = avlrUtil.removeCharacters(entityLoad.getValue('custentity_enl_cnpjcpf')); // CNPJ/CPF
    					
    					var isIndividual = entityLoad.getValue('isperson') == "T";
    					if(isIndividual)
    						transactionObj.header.locations.entity.type = 'individual';
    					else
    						var entityType = entityLoad.getValue('custentity_enl_entitytype'); // ENTITY TYPE
							
    					transactionObj.header.locations.entity.type = fromTo.getEntityType(entityType);
    				}
    				
    				
    				// activitySector
    				transactionObj.header.locations.entity.activitySector = {}; // SETOR DE ATIVIDADE
    				
    				transactionObj.header.locations.entity.activitySector.type = 'activityLine';
    				var actSector = entityLoad.getValue({fieldId: 'custentity_enl_ent_activitysector'});
    				//log.debug('actSector - entity : ', actSector);
    				transactionObj.header.locations.entity.activitySector.code = fromTo.getActivitySector(actSector);
    				// end activitySector
				}
    			else // transType == "transferorder"
				{
    				if(runtime.executionContext != "TAXCALCULATION")
					{
    					transactionObj.header.locations.entity.name = entityLoad.getValue('name');
    					transactionObj.header.locations.entity.type = "business";
    					transactionObj.header.locations.entity.federalTaxId = avlrUtil.removeCharacters(entityLoad.getValue('custrecord_enl_locationcnpj')); // CNPJ/CPF
    					transactionObj.header.locations.entity.cityTaxId = avlrUtil.removeCharacters(entityLoad.getValue('custrecord_enl_locationccmnum')); // INSCRIÇÃO MUNICIPAL
        				transactionObj.header.locations.entity.stateTaxId = avlrUtil.removeCharacters(entityLoad.getValue('custrecord_enl_locationienum')); // INSCRIÇÃO ESTADUAL
        				
        				// activitySector
        				transactionObj.header.locations.entity.activitySector = {}; // SETOR DE ATIVIDADE
        				
        				transactionObj.header.locations.entity.activitySector.type = 'activityLine';
        				var actSector = entityLoad.getValue({fieldId: 'custrecord_avlr_activitysector'});
        				//log.debug('actSector - entity : ', actSector);
        				transactionObj.header.locations.entity.activitySector.code = fromTo.getActivitySector(actSector);
        				// end activitySector
        				
    					// taxesSettings
        				transactionObj.header.locations.entity.taxesSettings = {}
        				transactionObj.header.locations.entity.taxesSettings.icmsTaxPayer = true;
        				// end taxesSettings
        				
        				// address
    					var entityAddressSubrecord = entityLoad.getSubrecord({fieldId: 'mainaddress'});
    					
    					var entityAddressObj = getAddress(entityAddressSubrecord);
    					if(!avlrUtil.isEmptyObj(entityAddressObj))
    						transactionObj.header.locations.entity.address = entityAddressObj;
    					// end address
					}
				}
	    			
    		// end entity ----------------------------------------------------------------------------
	    			
			// establishment -------------------------------------------------------------------------
    		transactionObj.header.locations.establishment = {};
	    		
    		transactionObj.header.locations.establishment.federalTaxId = locationLoad.getValue({fieldId: 'custrecord_enl_fiscalestablishmentid'});

			transactionObj.header.locations.establishment.taxesSettings = {};
			
			var _pisCofinsReliefzfLikeuDLocation = locationLoad.getValue('custrecord_avlr_piscofinsreliefzflikeud');
			if(_pisCofinsReliefzfLikeuDLocation)
				transactionObj.header.locations.establishment.taxesSettings.pisCofinsReliefZFLikeUDisc = _pisCofinsReliefzfLikeuDLocation;

			var _subjectToPayrollTaxRelief = locationLoad.getValue('custrecord_avlr_subjecttopayrolltaxrelie');
			if(_subjectToPayrollTaxRelief)
				transactionObj.header.locations.establishment.taxesSettings.subjectToPayrollTaxRelief = _subjectToPayrollTaxRelief;

	    		// address
	    		transactionObj.header.locations.establishment.address = {};
	    			
					var locationAddressSubrecord = locationLoad.getSubrecord({fieldId: 'mainaddress'});
					var locationAddressObj = getAddress(locationAddressSubrecord);
					if(!avlrUtil.isEmptyObj(locationAddressObj))
						transactionObj.header.locations.establishment.address = locationAddressObj;
					
	    		// end address
		    		
    			// activitySector
	    		transactionObj.header.locations.establishment.activitySector = {};
		    		transactionObj.header.locations.establishment.activitySector.type = 'activityLine';
		    		
		    		actSector = locationLoad.getValue({fieldId: 'custrecord_avlr_activitysector'});
//	    			log.debug('locations - actSector : ', actSector);
		    		transactionObj.header.locations.establishment.activitySector.code = fromTo.getActivitySector(actSector);
	    		// end activitySector
    		// end establishment ---------------------------------------------------------------------
	    		
    		if(!input.lines.length)
    			throw error.create({name: 'ERROR AvaTAxBR', message: '"Item" não definido.', notifyOff: false});
    			
    		var typeText = input.lines[0].getAdditionalFieldValue('itemtype', transactionLoad, 0);
//    		log.debug('typeText : ', typeText);
	    	
			var deliveryLocationId = input.getAdditionalFieldValue('custbody_enl_deliverylocation', transactionLoad);
			var deliveryLocationObj = {};

			if(deliveryLocationId)
				deliveryLocationObj = getEntityInfAndAddress(deliveryLocationId);

    		if (typeText == "Service")
			{
    			// rendered ---------------------------------------------------------------------------
    			var benefitsAbroad = false;
    			
				if(!avlrUtil.isEmptyObj(deliveryLocationObj))
				{
					transactionObj.header.locations.rendered = deliveryLocationObj;

					if(deliveryLocationObj.country != 'BRA')
						benefitsAbroad = true;
				}
    			else
				{
    				if(['purchaseorder', 'vendorbill', 'creditmemo', 'returnauthorization'].indexOf(transType) > -1)
					{
    					transactionObj.header.locations.rendered = {};

    					if(!avlrUtil.isEmptyObj(locationAddressObj))        				
    						transactionObj.header.locations.rendered.address = locationAddressObj;	
					}
    				else
					{
    					transactionObj.header.locations.rendered = {};
    					
    					if(!avlrUtil.isEmptyObj(entityAddressObj))
    						transactionObj.header.locations.rendered.address = entityAddressObj;	

					}
				}
    			// rendered ---------------------------------------------------------------------------
			
			}// end typeText == "Service"
    		
    		// transporter -------------------------------------------------------------------------------
    		//transactionObj.header.locations.transporter = {};
    		//transactionObj.header.locations.transporter.address = {};
    		
    		// transporter -------------------------------------------------------------------------------
    		if(['purchaseorder', 'vendorbill', 'creditmemo', 'returnauthorization'].indexOf(transType) > -1)
			{
    			if (typeText != "Service")
				{
    				// delivery ----------------------------------------------------------------------------------
    				if(!avlrUtil.isEmptyObj(deliveryLocationObj))
    					transactionObj.header.locations.delivery = deliveryLocationObj;
    				
    				// delivery ----------------------------------------------------------------------------------
    				
    				// pickup ------------------------------------------------------------------------------------
    				var pickupLocationId = input.getAdditionalFieldValue('custbody_enl_pickuplocation', transactionLoad);
    				if(pickupLocationId)
    				{
    					var pickupLocationObj = getEntityInfAndAddress(pickupLocationId);
						if(!avlrUtil.isEmptyObj(pickupLocationObj))
    						transactionObj.header.locations.pickup = pickupLocationObj;
    				}
    				// pickup ------------------------------------------------------------------------------------
				}
    			
			}// end if(transType == 'vendorbill' || transType == 'purchaseorder')
    		
    		
		// end locations ---------------------------------------------------------------------------------
		
		var usetypeText = '';
		var altNameOperationType = operationTypeLoad.getValue('custrecord_enl_ot_altname');
		
		if(transType != "transferorder")
			transactionObj.header.eDocCreatorPerspective = altNameOperationType != 'standardPurchaseReturnShippingOutbound';
		else
			transactionObj.header.eDocCreatorPerspective = true;

		
		// Caso informado na linha, o sistema ignorará a informação do header.
		transactionObj.header.operationType = altNameOperationType; // ?
		
		var finalprice = operationTypeLoad.getValue('custrecord_enl_ot_finalprice');
		if(finalprice)
			transactionObj.header.amountCalcType = 'final';
		
		var usetype = operationTypeLoad.getValue('custrecord_enl_ot_usetype');
		usetypeText = fromTo.getUseType(usetype);
		
    	transactionObj.header.companyLocation = locationLoad.getValue({fieldId: 'custrecord_enl_fiscalestablishmentid'});
    	
    	var tranDate = input.getAdditionalFieldValue('trandate',transactionLoad);
    	var newDate = format.parse({value: tranDate, type: format.Type.DATE})
		transactionObj.header.transactionDate = newDate;
    	
		
		if (typeText == "Service")
			transactionObj.header.messageType = 'services';
		else
			transactionObj.header.messageType = 'goods';
		
		
		if (typeText == "Service" && (transType == 'invoice' || transType == 'salesorder'))
		{
			var constrution = input.getAdditionalFieldValue('custbody_alvr_constrution_site',transactionLoad);
			if(constrution)
			{
				transactionObj.header.services = {};
				transactionObj.header.services.build = {};
				
				var constructionLookUp = search.lookupFields({
						type: 'customrecord_alvr_constrution_site',
						id: constrution,
						columns: ['custrecord_avlr_codigo_obra', 'custrecord_avlr_codigo_art']
					});
				
				transactionObj.header.services.build.code = constructionLookUp.custrecord_avlr_codigo_obra;
				transactionObj.header.services.build.art = constructionLookUp.custrecord_avlr_codigo_art;
			}
		}
    	
		transactionObj.header.eDocCreatorType = 'self';
    	
    	if (typeText != "Service")
		{
			// invoicesRefs ------------------------------------------------------------------------------
			transactionObj.header.invoicesRefs = []; // maxItems: 500
			var inputLinesRef = input.lines;
			for (var int3 = 0; int3 < inputLinesRef.length; int3++) 
			{
					
				var _refChaveAcesso = inputLinesRef[int3].getAdditionalFieldValue('custcol_enl_ref_chaveacesso', transactionLoad, int3);
				if(!_refChaveAcesso)
					continue;
					
				var _index = transactionObj.header.invoicesRefs.map(function(e) {return e.refNFe == _refChaveAcesso}).indexOf(true);
				if(_index == -1)
				{
					var nRefObj = {};
					nRefObj.type = 'refNFe'; // String
					nRefObj.refNFe = _refChaveAcesso; // String maxLength: 44	pattern: [0-9]{44}
						
					transactionObj.header.invoicesRefs.push(nRefObj)
				}
					
			}
			
			// end invoicesRefs --------------------------------------------------------------------------

    		transactionObj.header.goods = {};
    		
    		var model = documentTypeLoad.getValue('custrecord_enl_fdt_model');
    		transactionObj.header.goods.model = model;
    		
    		if(model == 65)
    			transactionObj.header.goods.idDest = 1;
		}
	    		
		// end header --------------------------------------------------------------------------------
		
		// lines -------------------------------------------------------------------------------------
    	var hasCpom = input.getAdditionalFieldValue('custbody_enl_hascpom', transactionLoad);
   		//log.debug('hasCpom : ', hasCpom);
    	
		var _batchNumberDetail = scriptObj.getParameter({name: 'custscript_avlr_batchnumdetail'});
		var inssDeduction = 0;
		var inputLines = input.lines;
		
		for (var int = 0; int < inputLines.length; int++) 
		{
			var itemObj = {}
			
				itemObj.lineCode = int+1; // integer
				
				var itemId = inputLines[int].itemId;
				var itemRecordType = inputLines[int].itemRecordType;
				
				var lookUpItem = search.lookupFields({
					type: itemRecordType,
					id: itemId,
					columns: [
					          "itemid",
					          'displayname',
//					          'unitstype',
					          'assetaccount',
							  'incomeaccount',
							  'expenseaccount',
					          'custitem_enl_cest', 
					          'custitem_avlr_ean',
					          'custitem_avlr_ncmex',
					          'custitem_enl_it_taxgroup',
					          'custitem_enl_ncmitem',
					          'custitem_enl_producttype',
					          'custitem_enl_taxorigin',
					          'custitem_avlr_subjecttoirrfauto',
					          'custitem_avlr_piscofinsrevenuetype',
					          'custitem_avlr_withlaborassignment',
					          'custitem_avlr_isicmsstsubstitute',
					          'custitem_avlr_appipicreditwheningoing',
					          'custitem_avlr_appicmscreditwheningoing',
					          'custitem_avlr_usuapprpiscofinscred',
					          'custitem_avlr_ispiscofinsestimatedcred',
					          'custitem_avlr_iiextaxcode',
					          'custitem_avlr_nfci',
					          'custitem_avlr_manufacturerequivalent',
					          'custitem_avlr_comextaxunitfactor',
					          'custitem_avlr_uniticmsstfactor',
					          'custitem_avlr_ignoreothcostimpipibase',
					          'custitem_enl_codigodeservico',
					          'custitem_avlr_piscofinscreditnotallowed',
					          'custitem_avlr_notsubjecttoinsswhenperson',
					          'custitem_avlr_unittaxable',
					          'custitem_avlr_cbar'
					          ]
				});
//				log.debug('lookUpItem', lookUpItem);
				
				itemObj.itemCode = lookUpItem.itemid.split(":").slice(-1).toString().trim();
				
				itemObj.itemDescriptor = {};
					
				itemObj.itemDescriptor.description = lookUpItem.displayname;
				
				if(lookUpItem.custitem_enl_it_taxgroup.length) // GRUPO DE TRIBUTAÇÃO (AGAST)
					itemObj.itemDescriptor.taxCode = lookUpItem.custitem_enl_it_taxgroup[0].text;
				
				if(lookUpItem.custitem_avlr_ispiscofinsestimatedcred) // CRÉDITO DE PIS E COFINS POR ESTIMATIVA
					itemObj.itemDescriptor.isPisCofinsEstimatedCredit = true;
				
				if(lookUpItem.custitem_avlr_piscofinsrevenuetype.length) // TIPO DE RECEITA (PIS/COFINS)
					itemObj.itemDescriptor.piscofinsRevenueType = lookUpItem.custitem_avlr_piscofinsrevenuetype[0].text.substr(0,2);
					
				
				// Service
				// if (typeText == "Service")
				// {
					if(benefitsAbroad)
						itemObj.benefitsAbroad = true;
					
					// [ normal, forcedWithholding, forcedNoWithholding, exempt ]
					var issBehavior = entityLoad.getValue('custentity_avlr_issbehavior'); // CONFIGURAÇÃO DE RETENÇÃO ISS
					itemObj.itemDescriptor.issBehavior = fromTo.getIssBehavior(issBehavior);
						
					if(lookUpItem.custitem_avlr_subjecttoirrfauto) //  IRRF AUTO RETIDO
						itemObj.itemDescriptor.subjectToIRRFAuto = true;
						
					if(lookUpItem.custitem_enl_codigodeservico.length) // CÓDIGO DE SERVIÇO (LC116)
						itemObj.itemDescriptor.hsCode = lookUpItem.custitem_enl_codigodeservico[0].text;
					
					if(lookUpItem.custitem_avlr_withlaborassignment) // CESSÃO DE MÃO-DE-OBRA
						itemObj.itemDescriptor.withLaborAssignment = true
					
					if(lookUpItem.custitem_avlr_notsubjecttoinsswhenperson) // INSS RF/AR SEM PERMISSÃO DE CÁLCULO QDO PF
						itemObj.itemDescriptor.notSubjectToInssWhenPerson = true;
					
					if(lookUpItem.custitem_avlr_piscofinscreditnotallowed) // PERMITE APROPRIAR CRÉDITO DE PIS/COFINS
						itemObj.itemDescriptor.appropriatePISCOFINScredit = true
						
					
					// Conf. de Código de Serviço ao Item
					var itemLoad = record.load({type: itemRecordType, id: itemId, isDanamic: true});
					
					if(['purchaseorder', 'vendorbill', 'creditmemo', 'returnauthorization'].indexOf(transType) > -1)
					{
						if(deliveryLocationId && deliveryLocationObj.address.city)
							itemObj.itemDescriptor.serviceCode = getServiceCode(deliveryLocationObj.address.city, itemLoad);
						else if(locationAddressObj.city)
							itemObj.itemDescriptor.serviceCode = getServiceCode(locationAddressObj.city, itemLoad);
						
						if(entityAddressObj.city)
							itemObj.itemDescriptor.serviceCodeOrigin = getServiceCode(entityAddressObj.city, itemLoad);
					}
					else // transacType == 'salesorder', 'invoice'
					{
						if(locationAddressObj.city)
							itemObj.itemDescriptor.serviceCodeOrigin = getServiceCode(locationAddressObj.city, itemLoad) 
						
						if(deliveryLocationId && deliveryLocationObj.address.city)
							itemObj.itemDescriptor.serviceCode = getServiceCode(deliveryLocationObj.address.city, itemLoad);
						else if(entityAddressObj.city)
							itemObj.itemDescriptor.serviceCode = getServiceCode(entityAddressObj.city, itemLoad);
					}
					
					itemObj.services = {};
					
					if(runtime.executionContext == "TAXCALCULATION")
					{
						if(hasCpom == 'T')
							itemObj.services.hasCpom = true;
					}
					else
					{
						if(hasCpom)
							itemObj.services.hasCpom = true;
					}
					
					
					// taxDeductions - service
					var inssDeductionLine = parseFloat(inputLines[int].getAdditionalFieldValue('custcol_enl_line_inssdeduction', transactionLoad, int)) || 0;
					inssDeduction = inssDeduction + inssDeductionLine;
					var irdeductionLine	= parseFloat(inputLines[int].getAdditionalFieldValue('custcol_enl_line_irdeduction', transactionLoad, int)) || 0;
					var publicyAgencyDeductionLine = parseFloat(inputLines[int].getAdditionalFieldValue('custcol_avlr_publicyagency_deduction', transactionLoad, int)) || 0;
					var issdeductionLine = parseFloat(inputLines[int].getAdditionalFieldValue('custcol_enl_line_issdeduction', transactionLoad, int)) || 0;
					
				
					itemObj.taxDeductions = {};
						
					if(issdeductionLine)
						itemObj.taxDeductions.iss = issdeductionLine; // number($double)
					
					if(irdeductionLine)
						itemObj.taxDeductions.irrfAuto = irdeductionLine; // number($double)
					
					if(publicyAgencyDeductionLine)
						itemObj.taxDeductions.transferAmount = publicyAgencyDeductionLine; // number($double)
					
					if(inssDeductionLine)
						itemObj.taxDeductions.inssBasisDiscount = inssDeductionLine; // number($double)
					
					// end taxDeductions
				// }
				// else // Goods
				// {
					if(lookUpItem.custitem_enl_ncmitem.length && itemRecordType)
						itemObj.itemDescriptor.hsCode = lookUpItem.custitem_enl_ncmitem[0].text; // NCM
					
					if(lookUpItem.custitem_avlr_nfci) // NÚMERO CONTROLE FCI
						itemObj.itemDescriptor.nFCI = lookUpItem.custitem_avlr_nfci;
					
					if(lookUpItem.custitem_avlr_ncmex) // CONNECT-45067
						itemObj.itemDescriptor.ex = lookUpItem.custitem_avlr_ncmex.toString().length < 2 ? pad(lookUpItem.custitem_avlr_ncmex.toString(),2) : lookUpItem.custitem_avlr_ncmex; // EX

					if(lookUpItem.custitem_avlr_ean)
						itemObj.itemDescriptor.cean = lookUpItem.custitem_avlr_ean; // EAN

					if(lookUpItem.custitem_enl_cest)
						itemObj.itemDescriptor.cest = lookUpItem.custitem_enl_cest; // CEST

					if(lookUpItem.custitem_avlr_isicmsstsubstitute) // ASSUME PAPEL DE SUBSTITUTO DO ICMS
						itemObj.itemDescriptor.isIcmsStSubstitute = true;

					if(lookUpItem.custitem_avlr_unittaxable) // Unidade de medida tributável
						itemObj.itemDescriptor.unitTaxable = lookUpItem.custitem_avlr_unittaxable;
					
					if(lookUpItem.custitem_enl_taxorigin.length) // ORIGEM DA MERCADORIA
					{
						var sourceItem = lookUpItem.custitem_enl_taxorigin[0].value; 
						//log.debug('sourceItem', sourceItem)
						itemObj.itemDescriptor.source = fromTo.getSourceItem(sourceItem);
					}
					
					if(lookUpItem.custitem_enl_producttype.length) // TIPO DE PRODUTO
					{
						var productType = lookUpItem.custitem_enl_producttype[0].value
						itemObj.itemDescriptor.productType = fromTo.getProductType(productType);
					}
					
					if(lookUpItem.custitem_avlr_iiextaxcode) // II EX
						itemObj.itemDescriptor.iiExTaxCode = parseInt(lookUpItem.custitem_avlr_iiextaxcode).toFixed(2);
					
					if(lookUpItem.custitem_avlr_manufacturerequivalent) // EQUIVALENTE A INDÚSTRIA
						itemObj.itemDescriptor.manufacturerEquivalent = true;
					
					if(lookUpItem.custitem_avlr_appipicreditwheningoing) // PERMITE APROPRIAR CRÉDITO DE IPI
						itemObj.itemDescriptor.appropriateIPIcreditWhenInGoing = true;
					
					if(lookUpItem.custitem_avlr_appicmscreditwheningoing) // PERMITE APROPRIAR CRÉDITO DE ICMS
						itemObj.itemDescriptor.appropriateICMScreditWhenInGoing =  true;
					
					if(lookUpItem.custitem_avlr_usuapprpiscofinscred) // PERMITE APROPRIAR CRÉDITO DE PIS E COFINS
						itemObj.itemDescriptor.usuallyAppropriatePISCOFINSCredit = true;
					
					if(lookUpItem.custitem_avlr_comextaxunitfactor) // COMEX FATOR DE CONVERSÃO
						itemObj.itemDescriptor.comexTaxUnitFactor = lookUpItem.custitem_avlr_comextaxunitfactor;
					
					if(lookUpItem.custitem_avlr_uniticmsstfactor) // ICMS-ST-PAUTA FATOR DE CONVERSÃO
						itemObj.itemDescriptor.unitIcmsStfactor = lookUpItem.custitem_avlr_uniticmsstfactor;
					
					if(lookUpItem.custitem_avlr_cbar) // CÓDIGO DE BARRAS
						itemObj.itemDescriptor.cBar = lookUpItem.custitem_avlr_cbar;
					
					if(lookUpItem.custitem_avlr_ignoreothcostimpipibase) // IGNORAR OUTROS VALORES NA BASE DO IPI
						itemObj.ignoreOtherCostOnImportationIpiBase = true;
					
					itemObj.goods = {};
					var _partnerStSubstitute = inputLines[int].getAdditionalFieldValue('custcol_avlr_partnerstsubstitute', transactionLoad, int);
					itemObj.goods.entityIcmsStSubstitute = fromTo.getEntityIcmsStSubstitute(_partnerStSubstitute);
					
					var supplierSituation = inputLines[int].getAdditionalFieldValue('custcol_avlr_supplier_situation', transactionLoad, int);
					if(supplierSituation)
					{
						switch (supplierSituation) 
						{
							case '1': // Calcular IPI e ICMS-ST
								itemObj.goods.subjectToIPIonInbound = true;
								// lineObj.isEntityIcmsStSubstituteOnInbound = true;
								break;
							case '2': // Equiparado Industria IPI
								itemObj.goods.subjectToIPIonInbound = true;
								// lineObj.isEntityIcmsStSubstituteOnInbound = false;
								break;
							case '3': // Substituto ICMS
								itemObj.goods.subjectToIPIonInbound = false;
								// lineObj.isEntityIcmsStSubstituteOnInbound = true;
								break;
							default:
								itemObj.goods.subjectToIPIonInbound = false;
								// lineObj.isEntityIcmsStSubstituteOnInbound = false;
							break;
						}
					}
					
					
					if((['salesorder', 'invoice', 'creditmemo', 'returnauthorization', 'transferorder'].indexOf(transType) > -1) || 
							(["cutrsale"+customTypeId].indexOf(dbstrantype) > -1))
					{
						var _itemPurchaseCost = inputLines[int].getAdditionalFieldValue('custcol_avlr_itempurchasecost', transactionLoad, int);
						if(_itemPurchaseCost)
						{
							itemObj.taxDeductions = {};
							itemObj.taxDeductions.itemPurchaseCost = parseFloat(_itemPurchaseCost);

							itemObj.itemDescriptor.notSubjectToIcmsSt = true;
						}
					}

					if(runtime.executionContext != "TAXCALCULATION")
					{
						var _isNumbered = transactionLoad.getSublistValue({sublistId: 'item', fieldId: 'isnumbered', line: int}) == "T";
						
						if(_isNumbered && _batchNumberDetail) 
						{
							var inventoryDetail = transactionLoad.getSublistSubrecord({sublistId: 'item', fieldId: 'inventorydetail', line:int});
							if (inventoryDetail) 
							{
								itemObj.goods.trace = [];
								
								for (var det = 0; det < inventoryDetail.getLineCount({sublistId: 'inventoryassignment'}); det++) 
								{
									var inventDetail = {};
										var _expirationDate = inventoryDetail.getSublistValue({
												sublistId:'inventoryassignment', 
												fieldId: 'expirationdate', 
												line: det
											});
										
										if(_expirationDate)
											inventDetail.expirationDate = _expirationDate.toISOString().substr(0,10)
										
										inventDetail.manufactureDate = new Date().toISOString().substr(0,10)
										
										inventDetail.lotAmount = parseFloat(inventoryDetail.getSublistValue({
												sublistId:'inventoryassignment', 
												fieldId: 'quantity', 
												line: det
											})).toFixed(3);
										
										if(['purchaseorder', 'vendorbill', 'creditmemo', 'returnauthorization'].indexOf(transType) > -1)
											var _fieldid = 'receiptinventorynumber'
										else
											var _fieldid = 'issueinventorynumber'
											
										inventDetail.lotNumber = inventoryDetail.getSublistValue({
												sublistId:'inventoryassignment', 
												fieldId: _fieldid, 
												line: det
											});
									
									itemObj.goods.trace.push(inventDetail);
								}
							}
						}
					} // != "TAXCALCULATION"
					
				// }// end Goods
				
				itemObj.useType = usetypeText; // Enum: [ use or consumption, resale, agricultural production, production, fixed assets, notApplicable ]
				
				var usagePurpose = inputLines[int].getAdditionalFieldValue('custcol_avlr_purposeofuse', transactionLoad, int);
				if(usagePurpose)
				itemObj.usagePurpose = usagePurpose;
				
				itemObj.operationType = altNameOperationType; // 'standardPurchaseReturnShippingOutbound';
				
				itemObj.numberOfItems = Number(inputLines[int].getAdditionalFieldValue('quantity', transactionLoad, int));
				itemObj.lineUnitPrice = Number(inputLines[int].getAdditionalFieldValue('rate', transactionLoad, int));
				itemObj.lineAmount = avlrUtil.roundRfb(itemObj.lineUnitPrice * itemObj.numberOfItems);
				
				itemObj.lineTaxedDiscount = inputLines[int].getAdditionalFieldValue('custcol_enl_discamount', transactionLoad, int) || 0;
				
				itemObj.freightAmount = inputLines[int].getAdditionalFieldValue('custcol_enl_line_freightamount', transactionLoad, int) || 0;

				itemObj.insuranceAmount = inputLines[int].getAdditionalFieldValue('custcol_enl_line_insuranceamount', transactionLoad, int) 
						* input.getAdditionalFieldValue('exchangerate', transactionLoad) || 0;
		
				itemObj.otherCostAmount = inputLines[int].getAdditionalFieldValue('custcol_enl_line_othersamount', transactionLoad, int)	
						* input.getAdditionalFieldValue('exchangerate', transactionLoad) || 0;
				
				
				itemObj.overwrite = 'no';
				
				var orderNumber = inputLines[int].getAdditionalFieldValue('custcol_enl_externalorder', transactionLoad, int);
				if(orderNumber)
					itemObj.orderNumber = orderNumber;
				
				var orderItemNumber = inputLines[int].getAdditionalFieldValue('custcol_eur_externallinenum', transactionLoad, int);
				if(orderItemNumber)
					itemObj.orderItemNumber = orderItemNumber;
				
				var _unTaxedOtherCostAmount = inputLines[int].getAdditionalFieldValue('custcol_avlr_untaxedothercostamount', transactionLoad, int);
				if(_unTaxedOtherCostAmount)
					itemObj.unTaxedOtherCostAmount = _unTaxedOtherCostAmount;
					
				
				if(lookUpItem.assetaccount.length)
					itemObj.assetaccount = lookUpItem.assetaccount[0].value;

				if(lookUpItem.expenseaccount.length)
					itemObj.expenseaccount = lookUpItem.expenseaccount[0].value;
				
				if(lookUpItem.incomeaccount.length)
					itemObj.incomeaccount = lookUpItem.incomeaccount[0].value;
					


			transactionObj.lines.push(itemObj);
		}
		
//		log.debug('getJsonRequest', 'end');
		return transactionObj;
	}
	
	function getAddress(subrecord, billToAddress) 
	{
		if(!subrecord)
		{
			var subrecord = billToAddress;
			subrecord.getValue = function(fieldid){
				return billToAddress.getFieldValue(fieldid);}
		}
		
		var address = {}
		
			address.street = subrecord.getValue('addr1');
			
			var country = subrecord.getValue('country');
			//log.debug('getAddress', 'country : ' + country);
			if(country && country != 'BR')
			{
				address.neighborhood = 'Exterior';
				address.number = '0';
				address.cityName = "Exterior";
				address.cityCode = "9999999";
				address.state = "EX";
				address.zipcode = "0000000";
			}
			else
			{
				address.neighborhood = subrecord.getValue('addr3');
				address.number = subrecord.getValue('custrecord_enl_numero');
				
				address.city = subrecord.getValue('custrecord_enl_city');
				if(address.city)
				{
					var fieldLookUpCity = search.lookupFields({
							type: 'customrecord_enl_cities',
							id: address.city, 
							columns: ['name','custrecord_enl_ibgecode','custrecord_enl_citystate']
						});
					
					address.cityCode = fieldLookUpCity.custrecord_enl_ibgecode;
					address.cityName = fieldLookUpCity.name;
					
					if(fieldLookUpCity.custrecord_enl_citystate.length)
						address.state = fieldLookUpCity.custrecord_enl_citystate[0].text;
				}
				
				address.zipcode = subrecord.getValue('zip');
				address.complement = subrecord.getValue('addr2');
			}
			
			if(country)
			{
				var countryObj = getCountryCode(country);
				if(countryObj && !avlrUtil.isEmptyObj(countryObj)) 
				{
					address.countryCode = countryObj.name;
					address.country = countryObj.isoCode;
					
				}
			}
		
		//log.debug('getAddress', 'address : ' + JSON.stringify(address));
		return address;
	}
	
	function getServiceCode(city, itemLoad) 
	{
		var lineNumber = itemLoad.findSublistLineWithValue({
								sublistId: 'recmachcustrecord_avlr_item_ccsi',
								fieldId: 'custrecord_avlr_city_ccsi',
								value: city
							});

		return itemLoad.getSublistValue({
								sublistId: 'recmachcustrecord_avlr_item_ccsi',
								fieldId: 'custrecord_avlr_municipalservicecode',
								line: lineNumber
							});
	}
	
	function getEntityInfAndAddress(entityId) 
	{
		var obj = {};
			obj.address = {};
			
		search.create({
			type: "entity",
			filters: [["internalid", "anyof", entityId],"AND", ["isdefaultshipping", "is", "T"]],
			columns:
				[
				 	"custentity_enl_legalname",
				 	"custentity_enl_cnpjcpf",
				 	"custentity_enl_ienum",
				 	"custentity_enl_ccmnum",
				 	"custentity_enl_entitytype",
		 			search.createColumn({name: "custrecord_enl_uf", join: "shippingAddress"}),
				    search.createColumn({name: "address1", join: "shippingAddress"}),
				    search.createColumn({name: "address2", join: "shippingAddress"}),
				    search.createColumn({name: "address3", join: "shippingAddress"}),
				    search.createColumn({name: "zipcode", join: "shippingAddress"}),
				    search.createColumn({name: "custrecord_enl_city", join: "shippingAddress"}),
				    search.createColumn({name: "country", join: "shippingAddress"}),
				    search.createColumn({name: "custrecord_enl_numero", join: "shippingAddress"}),
				    search.createColumn({name: "custrecord_enl_complementnumbe", join: "shippingAddress"}),
				    search.createColumn({name: "addressphone", join: "shippingAddress"})
				 ]
		}).run().each(function(result){
			
			var countryid = result.getValue({name: 'country', join: 'shippingAddress'});
			var countryObj = getCountryCode(countryid);

			var fieldLookUpEntity = search.lookupFields({type: result.recordType, id: result.id, columns: ['isperson','firstName','lastName',]});
			//obj.type = fieldLookUpEntity.isperson ? "individual" : "business";
			
			var _entitytype = result.getValue({name: "custentity_enl_entitytype"});
			obj.type = (countryid != 'BR') ? 'foreign' : fieldLookUpEntity.isperson ? 'individual' : fromTo.getEntityType(_entitytype); 

			if(countryObj && !avlrUtil.isEmptyObj(countryObj))
			{
				obj.address.country = countryObj.isoCode;
				obj.address.countryCode = countryObj.name;
			}
    		
			obj.name = fieldLookUpEntity.isperson ? 
				(fieldLookUpEntity.firstName + " " + fieldLookUpEntity.lastName) :
				result.getValue({name: 'custentity_enl_legalname'});
				
			obj.stateTaxId = avlrUtil.removeCharacters(result.getValue({name: 'custentity_enl_ienum'}));
			obj.cityTaxId = avlrUtil.removeCharacters(result.getValue({name: 'custentity_enl_ccmnum'}));
			
			obj.address.street = result.getValue({name: 'address1', join: 'shippingAddress'});
			obj.address.complement = result.getValue({name: 'address2', join: 'shippingAddress'});
			
			//log.debug('getEntityInfAndAddress', 'country : ' + countryid);
			if(countryid == 'BR')
			{
				obj.federalTaxId = avlrUtil.removeCharacters(result.getValue({name: 'custentity_enl_cnpjcpf'}));

				obj.address.number = result.getValue({name: 'custrecord_enl_numero', join: 'shippingAddress'});
				obj.address.cityName = result.getText({name: 'custrecord_enl_city', join: 'shippingAddress'});
				obj.address.neighborhood = result.getValue({name: 'address3', join: 'shippingAddress'});

				obj.address.city = result.getValue({name: 'custrecord_enl_city', join: 'shippingAddress'});
				if(obj.address.city)
				{
					var fieldLookUpCity = search.lookupFields({type: 'customrecord_enl_cities',id: obj.address.city, columns: ['custrecord_enl_ibgecode']});
					obj.address.cityCode = fieldLookUpCity.custrecord_enl_ibgecode;
				}

				obj.address.state = result.getText({name: 'custrecord_enl_uf', join: 'shippingAddress'});
				obj.address.zipcode = result.getValue({name: 'zipcode', join: 'shippingAddress'});
			}
			else
			{
				obj.federalTaxId = pad(result.id, 20); // not use more this: '99999999999999';
				
				obj.address.neighborhood = 'Exterior'				
				obj.address.cityName = "Exterior";
				obj.address.cityCode = "9999999";
				obj.address.state = "EX";
				obj.address.zipcode = "0000000";
			}
		});
		
		//log.debug('getEntityInfAndAddress', 'obj : ' + JSON.stringify(obj));
		return obj;
	}
	
	function getCountryCode(country)
	{
		var tempObj = {};
		search.create({
			type: "customrecord_enl_countrycode",
			filters: [["custrecord_enl_shortcode", "is", country]],
			columns:
				[
				 	search.createColumn({name: "custrecord_enl_iso3361", label: "ISO 3361"}),
				 	search.createColumn({name: "internalid", label: "Internal ID"}),
				 	search.createColumn({
				 		name: "name",
				 		sort: search.Sort.ASC,
				 		label: "Name"
				 	}),
				 	search.createColumn({name: "custrecord_enl_countrycode", label: "País"}),
				 	search.createColumn({name: "custrecord_enl_shortcode", label: "Sigla"})
			 	]
		}).run().each(function(result){
			
			tempObj = {
				id: result.id,
                name: result.getValue("name"),
                countryShortCode: result.getValue('custrecord_enl_shortcode'),
                countryCode: result.getValue('custrecord_enl_countrycode'),
                isoCode: result.getValue('custrecord_enl_iso3361')
            };
    		//return true;
		});
		
		if(!tempObj || avlrUtil.isEmptyObj(tempObj)) 
			log.debug('WARNING', 'Código de País não definido');
			
			
		return 	tempObj;
	}
	
	function messageError(scriptContext, e) 
	{
		var lang = runtime.getCurrentUser().getPreference ({name: 'LANGUAGE'});
		//log.debug('LANGUAGE', lang);
		var sessionObj = runtime.getCurrentSession(); //sessionObj is a runtime.Session object
		var _transactionLoad = scriptContext.newRecord;
		var _type = scriptContext.type;
		var _form = scriptContext.form;
		
		var _randomString = _transactionLoad.getValue({fieldId: 'custbody_avlr_randomstring'});
		var _sucessponse = sessionObj.get({name: 'sucessponse'+_randomString});
		_sucessponse = _sucessponse ? _sucessponse : "";
		
		var _errorresponse = sessionObj.get({name: 'errorresponse'+_randomString});
		_errorresponse = _errorresponse ? _errorresponse : "";
		
		var _warningresponse = sessionObj.get({name: 'warningresponse'+_randomString});
		_warningresponse = _warningresponse ? _warningresponse : "";
		
		var _errorglimpact = sessionObj.get({name: 'errorglimpact'+_randomString});
		_errorglimpact = _errorglimpact ? _errorglimpact : "";
		//log.debug('_errorglimpact', _errorglimpact);
		
		var _warningglimpact = sessionObj.get({name: 'warningglimpact'+_randomString});
		_warningglimpact = _warningglimpact ? _warningglimpact : "";
		//log.debug('_warningglimpact', _warningglimpact);
		
		if(lang == 'pt_BR')
		{
			var _title = 'Mensagens de aviso de Cálculo de Imposto Avatax-BR';
			var _titleGlImpact = 'Mensagens de aviso de Impacto no Razão Avatax-BR'
		}
		else
		{
			var _title = 'Notice messages from Tax Calculation Avatax-BR';
			var _titleGlImpact = 'Notice messages from GL Impact Avatax-BR'
		}
		
		if((_errorresponse || e) && _randomString)
		{
			_form.addPageInitMessage({
				type: message.Type.ERROR,
				title: _title,
				message: ((_errorresponse || e) + _warningresponse)
			});

			sessionObj.set({name: 'errorresponse'+_randomString, value: ''});
		}
		else if(_type == 'view')
		{
			if(_errorglimpact && _randomString)
			{
				_form.addPageInitMessage({
					type: message.Type.ERROR,
					title: _titleGlImpact,
					message: _errorglimpact + (_sucessponse + '</br></br><h2>'+_title+'</h2>'+_sucessponse + _warningresponse)
				});

				sessionObj.set({name: 'errorglimpact'+_randomString, value: ''});
				sessionObj.set({name: 'sucessponse'+_randomString, value: ''});
				sessionObj.set({name: 'warningresponse'+_randomString, value: ''});
			}
			
			else if((_warningresponse || _warningglimpact) && _randomString)
			{
				_form.addPageInitMessage({
					type: message.Type.WARNING,
					title: _title,
					message: (_sucessponse + _warningresponse + (_warningglimpact ? '</br></br><h2>'+_titleGlImpact+'</h2>'+_warningglimpact : ""))
				});
				
				sessionObj.set({name: 'sucessponse'+_randomString, value: ''});
				sessionObj.set({name: 'warningglimpact'+_randomString, value: ''});
				sessionObj.set({name: 'warningresponse'+_randomString, value: ''});
			}
			else if(_sucessponse && _randomString)
			{
				_form.addPageInitMessage({
					type: message.Type.CONFIRMATION,
					title: _title,
					message: _sucessponse
				});
				
				sessionObj.set({name: 'sucessponse'+_randomString, value: ''});
			}
		}
	}
	
	function setControlString(scriptContext) 
	{
		var _newRecord = scriptContext.newRecord;
		
		var _randomString = avlrUtil.randomString(32, '#aA');
		//log.debug('setControlString', _randomString);
		
		_newRecord.setValue({fieldId: 'custbody_avlr_randomstring', value: _randomString});
	}
    
	function setResponseInformation(jsonResponse, transactionLoad, subsidiary) 
	{
		if(transactionLoad.isDynamic)
			log.debug('Context', 'SuiteTax V3');
		else
			log.debug('Context', 'Legacy V3');
		
		var sessionObj = runtime.getCurrentSession(); //sessionObj is a runtime.Session object
		var scriptObj = runtime.getCurrentScript();
		var lang = runtime.getCurrentUser().getPreference({name: 'LANGUAGE'});
		
		//var isAvatax = subsidiary.getValue({fieldId: 'custrecord_enl_softwarefiscal'}) == 3;
		
		var response = JSON.parse(jsonResponse);
    	//log.debug('response', jsonResponse);
		var _legacyPlugn = subsidiary.getValue({fieldId: 'custrecord_avlr_legacyplugin'});
		var _randomString = transactionLoad.getValue({fieldId: 'custbody_avlr_randomstring'});
		var messageTax = [];
		var messageGenericParameter = [];
		var totalAmountBilled = 0;
    	var taxAmount = 0;
    	var hasIcmsST = false;
    	var taxSituation = "";
    	var costAmount = 0;
    	var addFreight = true;
	    var addInsurance = true;
	    var addOthers = true;
	    var _listGenericParameterId = [];
	    var _listGenericParameter = [];
	    var _messageWarningItem = "";
	    var _messageCfop = "";
		var _warningsMessage = "";
	    var _isRetained = false;
	    
		if(!transactionLoad.isDynamic) // Legacy V3
    	{
			if(['purchaseorder', 'vendorbill','creditmemo','returnauthorization'].indexOf(transactionLoad.type) > -1)
				transactionLoad.setValue({fieldId: "custbody_avlr_calculated", value: true})

			var _numLineItem = transactionLoad.getLineCount({sublistId: 'item'});
			for (var int = 0; int < _numLineItem; int++) 
			{
				var freightamount = transactionLoad.getSublistValue({sublistId: 'item', fieldId: 'custcol_enl_line_freightamount', line: int});
				var insuranceamount = transactionLoad.getSublistValue({sublistId: 'item', fieldId: 'custcol_enl_line_insuranceamount', line: int});
				var othersamount = transactionLoad.getSublistValue({sublistId: 'item', fieldId: 'custcol_enl_line_othersamount', line: int});
	
				if(freightamount) // Parâmetro de Contabilização Genérico
				{
					if(_listGenericParameterId.indexOf("3") == -1) // Conta de Frete
						_listGenericParameterId.push("3")
				}
				if(insuranceamount)
				{
					if(_listGenericParameterId.indexOf("5") == -1) // Conta de Seguro
						_listGenericParameterId.push("5")
				}
				if(othersamount)
				{
					if(_listGenericParameterId.indexOf("6") == -1) // Conta de Outras Despesas
						_listGenericParameterId.push("6")
				}
			}
		}
		
	    
	    var _searchRecors = searchRecors();
		// log.debug('_searchRecors', _searchRecors);
		
	    if(['purchaseorder', 'vendorbill', 'creditmemo', 'returnauthorization'].indexOf(transactionLoad.type) > -1)
		{
			if(_searchRecors.incoTermList && _searchRecors.incoTermList.length)
	    	{
				// log.debug('incoTermList', _searchRecors.incoTermList[0]);
				addFreight = _searchRecors.incoTermList[0]['custrecord_enl_ies_addfreight'];
	    		addInsurance = _searchRecors.incoTermList[0]['custrecord_enl_ies_addinsurance'];
	    		addOthers = _searchRecors.incoTermList[0]['custrecord_enl_ies_addotherexpenses'];
	    	}
		}
    	
	    var _cfopList = _searchRecors.cfopList;
	    
	    if(!transactionLoad.isDynamic) // Legacy V3
    	{
			//log.debug('listGenericParameter', _searchRecors.listGenericParameter);
			if(_searchRecors.listGenericParameter)
				_listGenericParameter = _searchRecors.listGenericParameter;

			// Parâmetro de Contabilização de Impostos
	    	if(_searchRecors.taxAccountingList)
	    		var taxAccountingList = _searchRecors.taxAccountingList;
	    	//log.debug('taxAccountingList', taxAccountingList);	
    	}
	    
	    removeTaxTransactions(transactionLoad);
	    removeWarnings(transactionLoad);
	    removeAccounting(transactionLoad)
	    
	    switch(transactionLoad.type)
		{
			case 'estimate':
			case 'salesorder':
			case 'invoice':
				var msg = 'vendas';
				var msgSource = 'sales';
				break;
				
			case 'returnauthorization':
			case 'creditmemo':
				var msg = 'vendas';
				var msgSource = 'salesreturn';
				break;
				
			case 'purchaseorder':
			case 'vendorbill':
				var msg = 'compras';
				var msgSource = 'purch';
				break;
		
			case 'vendorreturnauthorization':
			case 'vendorcredit':
				var msg = 'compras';
				var msgSource = 'purchreturn';
				break;
		}
	    
    	for (var int = 0; int < response.lines.length; int++) 
    	{
			taxAmount = 0;
    		var line = response.lines[int];
    		var itemId = transactionLoad.getSublistValue({sublistId: 'item', fieldId: 'item', line: int});
    		//var lineuniquekey = transactionLoad.getSublistValue({sublistId: 'item', fieldId: 'lineuniquekey', line: int});
    		
    		
    		// line.taxDetails ----------------------------------------------------------------
    		for(var i1 = 0; i1 < line.taxDetails.length; i1++)
    		{
    			var detail = line.taxDetails[i1];
    			
    			var taxTransactionObj = {};
    			
    			taxTransactionObj.cst = detail.cst || detail.cstB;
				taxTransactionObj.subtotalTaxable = detail.subtotalTaxable;
				taxTransactionObj.rate = detail.rate;
				taxTransactionObj.tax = detail.tax;
				taxTransactionObj.lineCode = line.lineCode;
				taxTransactionObj.itemId = itemId;
				taxTransactionObj.collectionCode = detail.collectionCode;
				taxTransactionObj.legalTaxClass = detail.legalTaxClass;
				taxTransactionObj.pMVA = detail.pMVA;
				
				
    			switch (detail.taxImpact.impactOnFinalPrice)
    			{
	    			case 'Add':
	    				taxTransactionObj.operation =  "+";
	    				break;
	    			case 'Subtracted':
	    				taxTransactionObj.operation =  "-";
	    				break;
	    			default:
	    				taxTransactionObj.operation =  "=";
	    			break;
    			}
    			
    			
    			var _accounting = detail.taxImpact.accounting; // escrituração, Bookkeeping
    			taxTransactionObj.isCredit = _accounting == "asset";
    			
    			var _accountingId = fromTo.getAccounting(_accounting);
    			taxTransactionObj.accountingId = _accountingId;
    			
    			var _taxType = detail.taxType;
				
				if((transactionLoad.isDynamic || _legacyPlugn) && _accountingId == 3) // SUITETAX && "none"
				{
					var _taxSubType = fromTo.getTaxSubType(_taxType, detail.taxImpact.impactOnNetAmount); // from to
					if(_taxSubType)
					{
						//_jsonRespose.lines[int2].taxDetails[int1].taxSubType = _taxSubType
						_taxType = _taxSubType;
					}
				}
				
				taxTransactionObj.taxType = _taxType;
				
				var ImpactOn = true;
				
				//var _entityType = response.header.locations.entity.type;
				//_entityType == "federalGovernment"
				
				if(response.header.messageType == "goods")
				{
					taxTransactionObj.isRetained = detail.taxImpact.impactOnFinalPrice == "Subtracted";
					
					if(!transactionLoad.isDynamic) // Legacy V3
    				{
						if(_accounting == "none" && 
								(detail.taxImpact.impactOnFinalPrice == "Informative" || 
								detail.taxImpact.impactOnFinalPrice == "Included" ||
								_taxType == "ipi")) // CONNECT-42199
							ImpactOn = false;
					}	
				}
        		else // Service
        		{
					taxTransactionObj.isRetained = detail.taxImpact.impactOnNetAmount == 'Subtracted';
        			
					if(!transactionLoad.isDynamic) // Legacy V3
    				{
						if(_accounting == "none" && 
								(detail.taxImpact.impactOnNetAmount == "Informative" || 
								detail.taxImpact.impactOnNetAmount == "Included"))
							ImpactOn = false;
						
					}
        		}
				
				if(taxTransactionObj.isRetained && !_isRetained)
					_isRetained = true;
				
				setTaxTransactionValues(transactionLoad, taxTransactionObj);
        		
        			
        		if(!transactionLoad.isDynamic) // Legacy V3
    			{
        			if(_taxType.toLowerCase() != "cofinsrf" && _taxType.toLowerCase() != "csllrf" && _taxType.toLowerCase() != "pisrf")
        			{
        				if(detail.rate && ImpactOn) // _taxSubType
        				{
    						var _index = taxAccountingList.map(function(e) {
			        						return e["custrecord_enl_ta_taxtype"].toLowerCase() == _taxType.toLowerCase();
			        					}).indexOf(true);
					
	    					if(_index != -1)
	    					{
	    						//log.debug('taxAccountingList', taxAccountingList[_index]);	
	    						//log.debug('impactOnNetAmount', detail.taxImpact.impactOnNetAmount);

	    						var _operationTypeId = transactionLoad.getValue({fieldId: 'custbody_enl_operationtypeid'});
	    						
	    						var _indexException = taxAccountingList[_index].exception.map(function(e) {
	    									if(e["custrecord_avlr_operationtype_eci"])
	    										var isOperationType = e["custrecord_avlr_operationtype_eci"] == _operationTypeId;
	    									
	    									if(e["custrecord_avlr_bookkeeping_eci"])
	    										var isBookkeeping = e["custrecord_avlr_bookkeeping_eci"] == _accountingId; // escrituração, Bookkeeping
	    									
	    									if(e["custrecord_avlr_totalimpactnfe_eci"])
	    										var isImpactOnNetAmount = e["custrecord_avlr_totalimpactnfe_eci"] == detail.taxImpact.impactOnNetAmount;
	    										
	    									//log.debug('exception.map', 'isOperationType:' + isOperationType + ', isBookkeeping:' + isBookkeeping + ', isImpactOnNetAmount:' + isImpactOnNetAmount);	
	    									return ((isOperationType == undefined || isOperationType) && 
	    											(isBookkeeping == undefined || isBookkeeping) && 
	    											(isImpactOnNetAmount == undefined || isImpactOnNetAmount) &&
	    											(e["custrecord_avlr_debtaccount_eci"] != "") &&
	    											e["custrecord_avlr_creditaccount_eci"] != "")
			        					}).indexOf(true);
	    						
										
								var _accountDebt = null;
								var _accountCredit = null;

								var _accountType = taxAccountingList[_index]["custrecord_avlr_acctypeitem_pci"];
								if(_accountType)
								{
									if((['estimate','salesorder','invoice','vendorreturnauthorization','vendorcredit'].indexOf(transactionLoad.type) > -1) || 
											(["cutrsale"+customTypeId].indexOf(dbstrantype) > -1))									
										_accountCredit = line[fromTo.fromToAcountTypeItem(_accountType)];					
									else	//	'purchaseorder', 'vendorbill', 'returnauthorization', 'creditmemo'
										_accountDebt = line[fromTo.fromToAcountTypeItem(_accountType)];
								}


	    						if(_indexException != -1)
	    						{
	    							//log.debug('taxAccountingList['+_index+'].exception', taxAccountingList[_index].exception[_indexException]);
	    							if(!_accountDebt)
	    								_accountDebt = taxAccountingList[_index].exception[_indexException]["custrecord_avlr_debtaccount_eci"];

									if(!_accountCredit)
										_accountCredit = taxAccountingList[_index].exception[_indexException]["custrecord_avlr_creditaccount_eci"];
	    						}
	    						else
								{
									if(!_accountDebt) // CONTA DE DÉBITO
	    								_accountDebt = taxAccountingList[_index]["custrecord_enl_ta_taxpayable"];

									if(!_accountCredit)	// CONTA DE CRÉDITO
	    								_accountCredit = taxAccountingList[_index]["custrecord_enl_ta_taxexpense"];
								}
	    						

	    						// (transactionLoad, linenum, acc, debitamount, creditamount, messsage, source, impostoretido, itemId)
	    						createAccounting(
	    								transactionLoad, 
	    								line.lineCode, 
	    								_accountCredit, 
	    								null, 
	    								detail.tax, 
	    								("Contabilização de impostos: " + _taxType), 
	    								msgSource,
	    								taxTransactionObj.isRetained,
	    								itemId
	    							);
	    						
	    						createAccounting(
	    								transactionLoad, 
	    								line.lineCode, 
	    								_accountDebt, 
	    								detail.tax, 
	    								null, 
	    								("Contabilização de impostos: " + _taxType), 
	    								msgSource,
	    								taxTransactionObj.isRetained,
	    								itemId
	    							);
	    					}
	    					else
	    					{
	    						//log.debug('ERROR-Calculations', _taxType +' não definido.');
	    						if(messageTax.indexOf(_taxType) == -1)
	    							messageTax.push(_taxType);
	    					}
	    					
						} // (_taxSubType || _accounting != "none") && detail.rate && !noImpactOn
	        				
        			}// taxType != "cofinsrf"  "csllrf"  "pisrf"


        			if(response.header.messageType == "goods")
        			{
        				if (detail.rate && (detail.cst || detail.cstB))
        				{
        					if(['estimate','salesorder','invoice','vendorreturnauthorization','vendorcredit'].indexOf(transactionLoad.type) > -1)
        					{
        						// [ Add, Included, Subtracted, Informative ]
        						if ((detail.taxImpact.impactOnFinalPrice == "Add" && 
        								response.header.amountCalcType != 'final') || (detail.taxType == "icmsSt" || detail.taxType == "icmsStFCP"))
        							taxAmount += detail.tax;
        						
        						if (detail.taxImpact.impactOnFinalPrice == "Subtracted")
        							taxAmount -= detail.tax;
        						
        						taxSituation = detail.cst ||  detail.cstB;
        						
        						if (detail.TaxType == "icmsSt" && taxSituation == "60")
        							hasIcmsST = true;
        					}
        					else // 'purchaseorder', 'vendorbill', 'creditmemo', 'returnauthorization'
        					{
        						if (detail.taxType == "icmsDeson") 
        						{
        							if (detail.taxImpact.impactOnFinalPrice == "Subtracted")
        								taxAmount -= detail.tax;
        							
        							if (detail.taxImpact.impactOnFinalPrice == "Add")
        								taxAmount += detail.tax;
        						}
        						
        						if(detail.taxImpact.accounting == 'asset') // IsCredit
        							costAmount -= detail.tax;
        						
        						if (detail.taxImpact.impactOnFinalPrice == "Add" && response.header.amountCalcType != 'final')
        						{
        							costAmount += detail.tax;
        							taxAmount += detail.tax;
        						}
        						
        						if (detail.taxType == "icmsSt")
        							hasIcmsST = true;
        					}
        				}
        			}
        			else // response.header.messageType == Services
        			{
        				if (detail.rate)
        				{
        					if (detail.taxImpact.impactOnNetAmount == "Add")
        						taxAmount += detail.tax;
        					
        					if(detail.taxImpact.impactOnNetAmount == "Subtracted")
        						taxAmount -= detail.tax;
        				}
        			}
    				
    			} // end !transactionLoad.isDynamic // Legacy V3
    	
    		} // end line.taxDetails ----------------------------------------------------------
    		
    		if(line.cfop) // ------------------------------------------------------------------
			{	
				if(line.cfop.toString().indexOf('.') == -1)
					line.cfop = line.cfop.toString().substr(0,1) +'.'+ line.cfop.toString().substr(1,4);

				//log.debug('cfop', line.cfop);
				
				var _index = _cfopList.map(function(e) {return e.name == line.cfop;}).indexOf(true);
				
				if(_index != -1)
				{
					if(!transactionLoad.isDynamic) // Legacy V3
					{
						transactionLoad.setSublistValue({
								sublistId: 'item',	
								fieldId: 'custcol_enl_cfopitem', 
								value: _cfopList[_index].internalid,
								line: int
							});
					}
					else
					{
						transactionLoad.selectLine({sublistId: 'item', line: int});
						
						transactionLoad.setCurrentSublistValue({
								sublistId: 'item',	
								fieldId: 'custcol_enl_cfopitem', 
								value: _cfopList[_index].internalid
							});
						
						transactionLoad.commitLine({sublistId: 'item'});
					}
				}
				else
				{
					if(lang == 'pt_BR')
						_messageCfop += 'Cfop "'+line.cfop+'" não encontrado no item "' + line.itemCode + '", linha "' + line.lineCode +'"</br>';
					else
						_messageCfop += 'Cfop "'+line.cfop+'" not found in item "' + line.itemCode + '", line "' + line.lineCode +'"</br>';
					
					//log.debug('WARNING', _messageCfop);
				}
			
			} // end cfop ---------------------------------------------------------------------
    		
    		
    		if(!transactionLoad.isDynamic) // Legacy V3
			{
    			var taxRateAmount = taxAmount / line.numberOfItems;
    			var unitCostAmount = costAmount / line.numberOfItems;
    			
				if(transactionLoad.type != "transferorder")
				{
					// transactionLoad.setSublistValue({ // VAT por Unidade
					// 	sublistId: 'item', 
					// 	fieldId: 'custcol_enl_unitcost', 
					// 	value: unitCostAmount,
					// 	line: int
					// });
					
					// transactionLoad.setSublistValue({ // VAT por Unidade
					// 	sublistId: 'item', 
					// 	fieldId: 'custcol_enl_taxamtperunit', 
					// 	value: taxRateAmount,
					// 	line: int
					// });
					
					transactionLoad.setSublistValue({ // TAX AMT
						sublistId: 'item', 
						fieldId: 'tax1amt', 
						value: taxAmount,
						line: int
					});
					log.debug('line ' + line.lineCode, 'taxAmount : ' + taxAmount);
					
					// transactionLoad.setSublistValue({
					// 	sublistId: 'item', 
					// 	fieldId: 'custcol_ava_icmsst', 
					// 	value: hasIcmsST,
					// 	line: int
					// });
				}
    			
    			
    			var quantity = transactionLoad.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: int});
    			var rate = transactionLoad.getSublistValue({sublistId: 'item', fieldId: 'rate', line: int});
    			var amount = quantity * rate;
			} // !transactionLoad.isDynamic // Legacy V3
    		else 
			{
				transactionLoad.selectLine({ sublistId: "item", line: int });
				var quantity = transactionLoad.getCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity' });
				var rate = transactionLoad.getCurrentSublistValue({ sublistId: 'item', fieldId: 'rate' });
				var amount = quantity * rate;
				transactionLoad.commitLine({ sublistId: "item" });
			}	// SuiteTax

			log.debug('line ' + line.lineCode, 'amount = quantity * rate : ' + amount);
			
    		var freightamount = transactionLoad.getSublistValue({sublistId: 'item', fieldId: 'custcol_enl_line_freightamount', line: int});
    		var insuranceamount = transactionLoad.getSublistValue({sublistId: 'item', fieldId: 'custcol_enl_line_insuranceamount', line: int});
    		var othersamount = transactionLoad.getSublistValue({sublistId: 'item', fieldId: 'custcol_enl_line_othersamount', line: int});
    		var discamount = transactionLoad.getSublistValue({sublistId: 'item', fieldId: 'custcol_enl_discamount', line: int});
			var unTaxedOtherCostAmount = transactionLoad.getSublistValue({ sublistId: 'item', fieldId: 'custcol_avlr_untaxedothercostamount', line: int });
			
			if(freightamount && addFreight)
				amount += freightamount;
			
			if(insuranceamount && addInsurance)
				amount += insuranceamount;
			
			if(othersamount && addOthers)
				amount += othersamount;
			
			if(discamount)
				amount -= discamount
			
			if(unTaxedOtherCostAmount)
				amount += unTaxedOtherCostAmount;
			
			
    		if(!transactionLoad.isDynamic) // Legacy V3
			{
				transactionLoad.setSublistValue({
					sublistId: 'item', 
					fieldId: 'amount', 
					value: avlrUtil.roundRfb(amount),
					line: int
				});
			} // end !transactionLoad.isDynamic // Legacy V3
    		else
			{
				transactionLoad.selectLine({ sublistId: "item", line: int });

				transactionLoad.setCurrentSublistValue({
					sublistId: 'item', 
					fieldId: 'amount', 
					value: avlrUtil.roundRfb(amount)
				});

				transactionLoad.commitLine({ sublistId: "item" });
			}	// SuiteTax
    		
    		if(freightamount || insuranceamount || othersamount)
			{
				var itemAcc = transactionLoad.getSublistValue({sublistId: 'item', fieldId: 'account', line: int});
    			if(!itemAcc)
    			{
    				itemAcc = line.assetaccount || line.expenseaccount;
   	    			// log.debug('itemAcc', itemAcc);
    				if(!itemAcc)
					{
    					if(lang == 'pt_BR')
    						_messageWarningItem += 'A "Conta de Ativos" do item ' + line.itemCode + ' na linha '+ line.lineCode +' não está definido</br>';
    					else
    						_messageWarningItem += 'The "Asset Account" of the item ' + line.itemCode + ' in line '+ line.lineCode +' is not defined</br>';
					}
    			}
    			
    			
    			if(itemAcc && freightamount)
    			{
    				log.debug('line ' + line.lineCode, 'freightamount : ' + freightamount);
					var freightAcc;
					if(!transactionLoad.isDynamic) // Legacy V3
    				{
						var _index = _listGenericParameter.map(function(e) {
										return e["custrecord_avlr_parameter_pcg"] == "3";// Conta de Frete
									}).indexOf(true);

									
						freightAcc = scriptObj.getParameter({name: 'custscript_avlr_freightitem_v3'});

						if(!freightAcc && _index > -1)
							freightAcc = _listGenericParameter[_index]["custrecord_avlr_account_pcg"];
					}
					else
					{
						freightAcc = scriptObj.getParameter({name: 'custscript_avlr_freightitem_v3'});
					}
			
    				if(freightAcc)
					{
    					// (transactionLoad, linenum, acc, debitamount, creditamount, messsage, source, impostoretido, itemId)
    					createAccounting(
	    							transactionLoad, 
	    							line.lineCode, 
	    							itemAcc, 
	    							freightamount, 
	    							null, 
	    							("Frete sobre " + msg), 
	    							msgSource, 
	    							null, 
	    							itemId
    							);
    					
    					//log.debug('freightAcc', freightAcc);
    					createAccounting(
    								transactionLoad, 
    								line.lineCode, 
    								freightAcc, 
    								null, 
    								freightamount, 
    								("Frete sobre " + msg), 
    								msgSource, 
    								null,
    								itemId
								);
					}
    				else
    				{
    					log.debug('line ' + line.lineCode, '"Conta de frete" não definida.');
    					
    					if(lang == 'pt_BR')
    					{
    						if(messageGenericParameter.indexOf('Conta de Frete') == -1)
    							messageGenericParameter.push('Conta de Frete');
    					}
    					else
						{
    						if(messageGenericParameter.indexOf('Freight Account') == -1)
    							messageGenericParameter.push('Freight Account');
						}
    				}
    			}
    			
    			if(itemAcc && insuranceamount)
    			{
    				log.debug('line ' + line.lineCode, 'insuranceamount : ' + insuranceamount);
					var InsuranceAcc;
					if(!transactionLoad.isDynamic) // Legacy V3
    				{
						var _index = _listGenericParameter.map(function(e) {
										return e["custrecord_avlr_parameter_pcg"] == "5";// Conta de Seguro
									}).indexOf(true);
						
						InsuranceAcc = scriptObj.getParameter({name: 'custscript_avlr_insuranceacct_v3'});
						
						if(!InsuranceAcc && _index > -1)
							InsuranceAcc = _listGenericParameter[_index]["custrecord_avlr_account_pcg"];
					}
					else
					{
						InsuranceAcc = scriptObj.getParameter({name: 'custscript_avlr_insuranceacct_v3'});
					}
    				
    				if(InsuranceAcc)
    				{
    					// (transactionLoad, linenum, acc, debitamount, creditamount, messsage, source, impostoretido, itemId)
    					createAccounting(transactionLoad, 
    								line.lineCode, 
    								itemAcc, 
    								insuranceamount, 
    								null, 
    								("Seguro sobre " + msg), 
    								msgSource,
    								null,
    								itemId
								);
    					
						//log.debug('InsuranceAcc', InsuranceAcc);
    					createAccounting(
    								transactionLoad, 
    								line.lineCode, 
    								InsuranceAcc, 
    								null, 
    								insuranceamount, 
    								("Seguro sobre " + msg), 
    								msgSource, 
    								null,
    								itemId
								);
    				}
    				else
    				{
    					log.debug('line ' + line.lineCode, '"Conta de seguro" não definida.');
    					
    					if(lang == 'pt_BR')
						{
    						if(messageGenericParameter.indexOf('Conta de Seguro') == -1)
    							messageGenericParameter.push('Conta de Seguro');
						}
    					else
						{
    						if(messageGenericParameter.indexOf('Insurance Account') == -1)
    							messageGenericParameter.push('Insurance Account');
						}
    				}
    			}
    			
    			if(itemAcc && othersamount)
    			{
    				log.debug('line ' + line.lineCode, 'othersamount : ' + othersamount);
					var otherchargesAcc;
					if(!transactionLoad.isDynamic) // Legacy V3
    				{
						var _index = _listGenericParameter.map(function(e) {
										return e["custrecord_avlr_parameter_pcg"] == "6";// Conta de Outras Despesas
									}).indexOf(true);
						
						otherchargesAcc = scriptObj.getParameter({name: 'custscript_avlr_otherchargeacc_v3'});

						if(!otherchargesAcc && _index > -1)
							otherchargesAcc = _listGenericParameter[_index]["custrecord_avlr_account_pcg"];
					}
					else
					{
						otherchargesAcc = scriptObj.getParameter({name: 'custscript_avlr_otherchargeacc_v3'});
					}
    				
    				if(otherchargesAcc)
					{
    					// (transactionLoad, linenum, acc, debitamount, creditamount, messsage, source, impostoretido, itemId)
    					createAccounting(
    								transactionLoad, 
    								line.lineCode, 
    								itemAcc, 
    								othersamount, 
    								null, 
    								("Outras Despesas sobre " + msg), 
    								msgSource, 
    								null,
    								itemId
								);
    					
						//log.debug('otherchargesAcc', otherchargesAcc);
    					createAccounting(
    								transactionLoad, 
    								line.lineCode, 
    								otherchargesAcc, 
    								null, 
    								othersamount, 
    								("Outras Despesas sobre " + msg), 
    								msgSource, 
    								null,
    								itemId
								); 
					}
    				else
    				{
    					log.debug('line ' + line.lineCode, '"Conta de Outras Despesas" não definida.');
    					
    					if(lang == 'pt_BR')
						{
    						if(messageGenericParameter.indexOf('Conta de Outras Despesas') == -1)
    							messageGenericParameter.push('Conta de Outras Despesas');
						}
    					else
						{
    						if(messageGenericParameter.indexOf('Other Expense Account') == -1)
    							messageGenericParameter.push('Other Expense Account');
						}
    				}
    			}
			}// end freightamount || insuranceamount || othersamount --------------------------
    		
    		
    		
    		if(!transactionLoad.isDynamic) // Legacy V3
    		{
    			log.debug('line ' + line.lineCode, 'amount final : ' + (avlrUtil.roundRfb(amount) + taxAmount));

    			totalAmountBilled += avlrUtil.roundRfb(amount) + taxAmount;
    		}
    		
    		// warnings -----------------------------------------------------------------------
        	var _warnings = line.warnings;
        	if(_warnings)
        	{
        		for (var int3 = 0; int3 < _warnings.length; int3++) 
        		{
        			var warnigObj = {};
        			
						var _msg = "Citation : "+_warnings[int3].citation+ "\n\nDescription : "+_warnings[int3].description;

	        			warnigObj.lineCode = line.lineCode;
	        			warnigObj.hsCode = line.itemDescriptor.hsCode;
	        			warnigObj.code = _warnings[int3].code;
	        			warnigObj.description = _msg
        			
						_warningsMessage += "</br>Line "+line.lineCode+" Citation : "+_warnings[int3].citation+ "</br>Description : "+_warnings[int3].description;

        			setWarningsValues(transactionLoad, warnigObj);
        		}
        		
        	} // end _line.warnings -----------------------------------------------------------
    		
    	} // end for lines --------------------------------------------------------------------
    	
	    
	    if(_isRetained)
    		transactionLoad.setValue({fieldId: 'custbody_enl_taxwithheld', value: true});
	    
	    
	    if(messageTax.length || messageGenericParameter.length || _messageWarningItem || _messageCfop || _warningsMessage)
    	{
    		var _sendMessage = '';
    		if(lang == 'pt_BR')
    		{
    			if(messageTax.length)	// Remessa Bonificação
    				_sendMessage += 'Conta Contábil não cadastrada para o(s) imposto(s) "'+messageTax.toString()+'" e transação "'+(transactionLoad.type == "customsale_remessa_bon" ? "Remessa Bonificação" : fromTo.fromToTransactionType(transactionLoad.type))+'", na estrutura de "Parâmetro de Contabilização de Impostos" do Bundle Avalara</br>';
    			
				if(messageGenericParameter.length) 
					_sendMessage += 'Conta não cadastrada para o(s) tipos(s) "'+messageGenericParameter.toString()+'", na estrutura de "Parâmetro de Contabilização Genérico" do Bundle Avalara</br>';
    		}
    		else
    		{
    			if(messageTax.length)	// Remessa Bonificação
    				_sendMessage += 'Unregistered GL Account for tax(s) "'+messageTax.toString()+'" and transaction "'+(transactionLoad.type == "customsale_remessa_bon" ? "Remessa Bonificação" : fromTo.fromToTransactionType(transactionLoad.type))+'", in the structure of "Tax Accounting Parameter" of the Avalara Bundle</br>';
    			
    			if(messageGenericParameter.length)
					_sendMessage += 'Unregistered Account for type(s) "'+messageGenericParameter.toString()+'", in the structure of "Generic Accounting Parameter" of the Avalara Bundle</br>';
    		}

			if(_messageWarningItem)
				_sendMessage += _messageWarningItem;
			
			if(_messageCfop)
				_sendMessage += _messageCfop;

			if(_sendMessage)
			{
				log.debug('WARNING-Calculations', _sendMessage);
				sessionObj.set({name: 'warningresponse'+_randomString ,value: "MENSAGEM NETSUITE : "+_sendMessage
			});
			}
    	}
	    
	    
	    if(!transactionLoad.isDynamic) // Legacy V3
    	{
	    	log.debug('Total Amount Billed', totalAmountBilled);
	    	
	    	var installmentCount = transactionLoad.getLineCount({sublistId: 'installment'});
	    	var overrideinstallments = transactionLoad.getValue('overrideinstallments');
	    	
	    	if(installmentCount != -1 && overrideinstallments)
	    	{
	    		var installmentAmount = parseFloat((totalAmountBilled / installmentCount).toFixed(2));
	    		//log.debug('installmentAmount', installmentAmount);
	    		
	    		var summation = 0;
	    		
	    		for (var int2 = 0; int2 < installmentCount; int2++) 
	    		{
	    			transactionLoad.setSublistValue({
	    				sublistId: 'installment', 
	    				fieldId: 'amount', 
	    				value: installmentAmount,
	    				line: int2
	    			});
	    			
	    			summation += installmentAmount;
	    		}
	    		
	    		//log.debug('summation', summation);
	    		
	    		var dif = parseFloat((totalAmountBilled - summation).toFixed(2));
	    		//log.debug('dif', dif);
	    		
	    		var amount = transactionLoad.getSublistValue({
	    			sublistId: 'installment', 
	    			fieldId: 'amount', 
	    			line: int2-1
	    		});
	    		
	    		transactionLoad.setSublistValue({
	    			sublistId: 'installment', 
	    			fieldId: 'amount', 
	    			value: amount + dif,
	    			line: int2-1
	    		});
	    		
	    	} // end installmentCount
	    	
    	} // end !transactionLoad.isDynamic // Legacy V3
	    
	    function searchRecors() 
	    {
	    	var body = {}
	    	
	    	if(transactionLoad.getValue({fieldId: 'incoterm'}))
	    		body.incotermId = transactionLoad.getValue({fieldId: 'incoterm'});
	    		
	    	if(_listGenericParameterId.length)
	    		body.listGenericParameterId = _listGenericParameterId;
	    	
	    	if(!transactionLoad.isDynamic) // Legacy V3
    		{
				// Remessa Bonificação
	    		body.transactionId = transactionLoad.getValue({fieldId: 'ntype'}); 	//fromTo.fromToTransactionId(transactionLoad.type);
	    		//log.debug('executionContext', runtime.executionContext);
	    		body.subsidiaryId = subsidiary.id;
    		}
			
			var headerObj = {};
				headerObj['Content-Type'] = 'application/json';
			
			var response = https.requestRestlet({// AVLR_RetrieveFunctions_RL.js
					headers: headerObj,
					scriptId: 'customscript_avlr_retrievefunctions_rl',
					deploymentId: 'customdeploy_avlr_retrievefunctions_rl',
					method: 'POST',
					body: JSON.stringify(body)
				});
			
			//log.debug('searchRecors', response.code);
			if(response.code != 200)
				throw response.body;
			else
				return JSON.parse(response.body);
		}
	    
	} // end function setResponseInformation
	
	
   	function removeTaxTransactions(transactionLoad) 
    {
    	var _numLines = transactionLoad.getLineCount({sublistId: 'recmachcustrecord_enl_tt_orderid'});
    	for (var int = 0; int < _numLines; int++) 
    	{
    		transactionLoad.removeLine({sublistId: 'recmachcustrecord_enl_tt_orderid',	line: 0});
		}
	}
    
    function removeAccounting(transactionLoad) 
    {
    	var _numLines = transactionLoad.getLineCount({sublistId: 'recmachcustrecord_enl_orderid'});
    	for (var int = 0; int < _numLines; int++) 
    	{
    		transactionLoad.removeLine({sublistId: 'recmachcustrecord_enl_orderid',	line: 0});
		}
	}
    
    function removeWarnings(transactionLoad) 
    {
    	var _numLines = transactionLoad.getLineCount({sublistId: 'recmachcustrecord_avlr_taxmsg_trx'});
    	for (var int = 0; int < _numLines; int++) 
    	{
    		transactionLoad.removeLine({sublistId: 'recmachcustrecord_avlr_taxmsg_trx',	line: 0});
		}
	}
    
    function createAccounting(transactionLoad, lineCode, acc, debitamount, creditamount, messsage, source, impostoretido, itemId) 
    {
    	if(!transactionLoad.isDynamic) // Legacy V3
    	{
    		var linenum = transactionLoad.getLineCount({sublistId: 'recmachcustrecord_enl_orderid'}); // Contabilizações
    		//log.debug('num Lines Accounting', linenum);
    		
    		transactionLoad.setSublistValue({
    			sublistId: 'recmachcustrecord_enl_orderid', 
    			fieldId: 'custrecord_avlr_item_acc', 
    			value: itemId,
    			line: linenum
    		});
    		
    		transactionLoad.setSublistValue({
    			sublistId: 'recmachcustrecord_enl_orderid', 
    			fieldId: 'custrecord_enl_linenum', 
    			value: lineCode,
    			line: linenum
    		});
    		
    		transactionLoad.setSublistValue({
    			sublistId: 'recmachcustrecord_enl_orderid', 
    			fieldId: 'custrecord_enl_accountnum', 
    			value: acc,
    			line: linenum
    		});
    		
    		if(debitamount)
    			transactionLoad.setSublistValue({
    				sublistId: 'recmachcustrecord_enl_orderid', 
    				fieldId: 'custrecord_enl_debitamount', 
    				value: debitamount,
    				line: linenum
    			});
    		
    		if(creditamount)
    			transactionLoad.setSublistValue({
    				sublistId: 'recmachcustrecord_enl_orderid', 
    				fieldId: 'custrecord_enl_creditamount', 
    				value: creditamount,
    				line: linenum
    			});
    		
    		//log.debug('map - accounting messsage', messsage);
    		transactionLoad.setSublistValue({
    			sublistId: 'recmachcustrecord_enl_orderid', 
    			fieldId: 'custrecord_enl_transtxt', 
    			value: messsage,
    			line: linenum
    		});
    		
    		transactionLoad.setSublistValue({
    			sublistId: 'recmachcustrecord_enl_orderid', 
    			fieldId: 'custrecord_enl_sourcemodule', 
    			value: source,
    			line: linenum
    		});
    		
    		if(impostoretido)
    			transactionLoad.setSublistValue({
    				sublistId: 'recmachcustrecord_enl_orderid', 
    				fieldId: 'custrecord_enl_impostoretido', 
    				value: true,
    				line: linenum
    			});
    	}
    	else
		{
    		transactionLoad.selectNewLine({sublistId: 'recmachcustrecord_enl_orderid'});
        	
    		transactionLoad.setCurrentSublistValue({
				sublistId: 'recmachcustrecord_enl_orderid', 
				fieldId: 'custrecord_avlr_item_acc', 
				value: itemId
			});
    		
    		if(lineCode)
    			transactionLoad.setCurrentSublistValue({
    					sublistId: 'recmachcustrecord_enl_orderid', 
    					fieldId: 'custrecord_enl_linenum', 
    					value: lineCode
    				});
    		
    		transactionLoad.setCurrentSublistValue({
    				sublistId: 'recmachcustrecord_enl_orderid', 
    				fieldId: 'custrecord_enl_accountnum', 
    				value: acc
    			});
    		
    		if(debitamount)
    			transactionLoad.setCurrentSublistValue({
    					sublistId: 'recmachcustrecord_enl_orderid', 
    					fieldId: 'custrecord_enl_debitamount', 
    					value: debitamount
    				});
    		
    		if(creditamount)
    			transactionLoad.setCurrentSublistValue({
    					sublistId: 'recmachcustrecord_enl_orderid', 
    					fieldId: 'custrecord_enl_creditamount', 
    					value: creditamount
    				});
    		
    		//log.debug('map - accounting messsage', messsage);
    		transactionLoad.setCurrentSublistValue({
    				sublistId: 'recmachcustrecord_enl_orderid', 
    				fieldId: 'custrecord_enl_transtxt', 
    				value: messsage
    			});
    		
    		transactionLoad.setCurrentSublistValue({
    				sublistId: 'recmachcustrecord_enl_orderid', 
    				fieldId: 'custrecord_enl_sourcemodule', 
    				value: source
    			});
    		
    		if(impostoretido)
    			transactionLoad.setCurrentSublistValue({
    					sublistId: 'recmachcustrecord_enl_orderid', 
    					fieldId: 'custrecord_enl_impostoretido', 
    					value: true
    				});
    			
    		transactionLoad.commitLine({sublistId: 'recmachcustrecord_enl_orderid'});
		}
	}
    
    function setTaxTransactionValues(transactionLoad, taxTransactionObj) 
    {
    	if(!transactionLoad.isDynamic) // Legacy V3
    	{
    		var linenum = transactionLoad.getLineCount({sublistId: 'recmachcustrecord_enl_tt_orderid'});
    		
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_enl_tt_orderid', 
				fieldId: 'custrecord_enl_taxsituation', 
				value: taxTransactionObj.cst,
				line: linenum
			});
			
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_enl_tt_orderid', 
				fieldId: 'custrecord_enl_tt_operation', 
				value: taxTransactionObj.operation,
				line: linenum
			});
			
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_enl_tt_orderid', 
				fieldId: 'custrecord_enl_tt_iscredit', 
				value: taxTransactionObj.isCredit,
				line: linenum
			});
			
			if(taxTransactionObj.accountingId)
				transactionLoad.setSublistValue({
					sublistId: 'recmachcustrecord_enl_tt_orderid', 
					fieldId: 'custrecord_avlr_taxaccounting', 
					value: taxTransactionObj.accountingId,
					line: linenum
				});
			
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_enl_tt_orderid', 
				fieldId: 'custrecord_enl_taxcode', 
				value: taxTransactionObj.taxType,
				line: linenum
			});
			
			try 
			{
				transactionLoad.setSublistText({
					sublistId: 'recmachcustrecord_enl_tt_orderid', 
					fieldId: 'custrecord_enl_tt_taxtype', 
					text: taxTransactionObj.taxType,
					line: linenum
				});
			} 
			catch (e) 
			{
				setMessageWarning();
			}
			
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_enl_tt_orderid', 
				fieldId: 'custrecord_enl_taxbaseamount', 
				value: taxTransactionObj.subtotalTaxable,
				line: linenum
			});
			
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_enl_tt_orderid', 
				fieldId: 'custrecord_enl_taxrate', 
				value: taxTransactionObj.rate,
				line: linenum
			});
			
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_enl_tt_orderid', 
				fieldId: 'custrecord_enl_taxamount', 
				value: taxTransactionObj.tax,
				line: linenum
			});
			
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_enl_tt_orderid', 
				fieldId: 'custrecord_enl_taxtransline', 
				value: taxTransactionObj.lineCode,
				line: linenum
			});
			
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_enl_tt_orderid', 
				fieldId: 'custrecord_enl_tt_isretained', 
				value: taxTransactionObj.isRetained,
				line: linenum
			});
			
			
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_enl_tt_orderid', 
				fieldId: 'custrecord_enl_tt_item', 
				value: taxTransactionObj.itemId,
				line: linenum
			});
			
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_enl_tt_orderid', 
				fieldId: 'custrecord_enl_collectioncode', 
				value: taxTransactionObj.collectionCode,
				line: linenum
			});
			
			if(taxTransactionObj.legalTaxClass)
				transactionLoad.setSublistValue({
					sublistId: 'recmachcustrecord_enl_tt_orderid', 
					fieldId: 'custrecord_avlr_tt_cenq', 
					value: taxTransactionObj.legalTaxClass,
					line: linenum
				});
			
			if(taxTransactionObj.pMVA )
				transactionLoad.setSublistValue({
					sublistId: 'recmachcustrecord_enl_tt_orderid', 
					fieldId: '	custrecord_avlr_tt_mva', 
					value: taxTransactionObj.pMVA,
					line: linenum
				});
			
    	}
		else
		{
			transactionLoad.selectNewLine({sublistId: 'recmachcustrecord_enl_tt_orderid'});
			
			transactionLoad.setCurrentSublistValue({
    			sublistId: 'recmachcustrecord_enl_tt_orderid', 
    			fieldId: 'custrecord_enl_taxsituation', 
    			value: taxTransactionObj.cst
			});
			
			transactionLoad.setCurrentSublistValue({
    			sublistId: 'recmachcustrecord_enl_tt_orderid', 
    			fieldId: 'custrecord_enl_tt_operation', 
    			value: taxTransactionObj.operation
			});
			
			transactionLoad.setCurrentSublistValue({
    			sublistId: 'recmachcustrecord_enl_tt_orderid', 
    			fieldId: 'custrecord_enl_tt_iscredit', 
    			value: taxTransactionObj.isCredit
			});
			
			if(taxTransactionObj.accountingId)
				transactionLoad.setCurrentSublistValue({
	    			sublistId: 'recmachcustrecord_enl_tt_orderid', 
	    			fieldId: 'custrecord_avlr_taxaccounting', 
	    			value: taxTransactionObj.accountingId
				});
			
			transactionLoad.setCurrentSublistValue({
    			sublistId: 'recmachcustrecord_enl_tt_orderid', 
    			fieldId: 'custrecord_enl_taxcode', 
    			value: taxTransactionObj.taxType
			});
			
			try 
			{
				transactionLoad.setCurrentSublistText({
					sublistId: 'recmachcustrecord_enl_tt_orderid', 
					fieldId: 'custrecord_enl_tt_taxtype', 
					text: taxTransactionObj.taxType
				});

				//setMessageWarning();// para teste
			} 
			catch (e) 
			{
				setMessageWarning();
			}
			
			transactionLoad.setCurrentSublistValue({
    			sublistId: 'recmachcustrecord_enl_tt_orderid', 
    			fieldId: 'custrecord_enl_taxbaseamount', 
    			value: taxTransactionObj.subtotalTaxable
			});
		
    		transactionLoad.setCurrentSublistValue({
        			sublistId: 'recmachcustrecord_enl_tt_orderid', 
        			fieldId: 'custrecord_enl_taxrate', 
        			value: taxTransactionObj.rate
    			});
    		
    		transactionLoad.setCurrentSublistValue({
        			sublistId: 'recmachcustrecord_enl_tt_orderid', 
        			fieldId: 'custrecord_enl_taxamount', 
        			value: taxTransactionObj.tax
    			});
    		
    		transactionLoad.setCurrentSublistValue({
        			sublistId: 'recmachcustrecord_enl_tt_orderid', 
        			fieldId: 'custrecord_enl_taxtransline', 
        			value: taxTransactionObj.lineCode
    			});
		
    		// transactionLoad.setCurrentSublistValue({
    		// 	sublistId: 'recmachcustrecord_enl_tt_orderid', 
    		// 	fieldId: 'custrecord_avlr_tt_lineuniquekey', 
    		// 	value: taxTransactionObj.lineuniquekey
			// });
    		
    		transactionLoad.setCurrentSublistValue({
    			sublistId: 'recmachcustrecord_enl_tt_orderid', 
    			fieldId: 'custrecord_enl_tt_isretained', 
    			value: taxTransactionObj.isRetained
			});
		
    		transactionLoad.setCurrentSublistValue({
        			sublistId: 'recmachcustrecord_enl_tt_orderid', 
        			fieldId: 'custrecord_enl_tt_item', 
        			value: taxTransactionObj.itemId
    			});
    		
    		transactionLoad.setCurrentSublistValue({
        			sublistId: 'recmachcustrecord_enl_tt_orderid', 
        			fieldId: 'custrecord_enl_collectioncode', 
        			value: taxTransactionObj.collectionCode
    			});
    		
    		if(taxTransactionObj.legalTaxClass)
    			transactionLoad.setCurrentSublistValue({
        				sublistId: 'recmachcustrecord_enl_tt_orderid', 
        				fieldId: 'custrecord_avlr_tt_cenq', 
        				value: taxTransactionObj.legalTaxClass
    				});
    		
    		if(taxTransactionObj.pMVA )
    			transactionLoad.setCurrentSublistValue({
        				sublistId: 'recmachcustrecord_enl_tt_orderid', 
        				fieldId: '	custrecord_avlr_tt_mva', 
        				value: taxTransactionObj.pMVA
    				});

    		transactionLoad.commitLine({sublistId: 'recmachcustrecord_enl_tt_orderid'});
		}
    	
    	function setMessageWarning() 
    	{
    		var _randomString = transactionLoad.getValue({fieldId: 'custbody_avlr_randomstring'});
        	var sessionObj = runtime.getCurrentSession(); //sessionObj is a runtime.Session object
        	
        	log.debug('WARNING', 'Tax Type "' +  taxTransactionObj.taxType + '" não definido na lista "Tipo de Imposto"');
			
			var _warningResponseMsg = sessionObj.get({name: 'warningresponse'+_randomString});
			if(!_warningResponseMsg)
				_warningResponseMsg = '';

			_warningResponseMsg = _warningResponseMsg + 'Tax Type "' +  taxTransactionObj.taxType + '" não definido na lista "Tipo de Imposto"</br>';

			sessionObj.set({name: 'warningresponse'+_randomString ,value: "MENSAGEM NETSUITE : "+_warningResponseMsg});
		}
	}
    
    function setWarningsValues(transactionLoad, warnigObj) 
    {
    	if(!transactionLoad.isDynamic) // Legacy V3
		{
    		var linenum = transactionLoad.getLineCount({sublistId: 'recmachcustrecord_avlr_taxmsg_trx'});
    		
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_avlr_taxmsg_trx', 
				fieldId: 'custrecord_avlr_taxmsg_tranline', 
				value: warnigObj.lineCode,
				line: linenum
			});
			
			if(!warnigObj.type)
				warnigObj.type = 1 // Warning
				
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_avlr_taxmsg_trx', 
				fieldId: 'custrecord_avlr_taxmsg_type', 
				value: warnigObj.type,
				line: linenum
			});
			
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_avlr_taxmsg_trx', 
				fieldId: 'custrecord_avlr_taxmsg_ncm', 
				value: warnigObj.hsCode,
				line: linenum
			});
			
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_avlr_taxmsg_trx', 
				fieldId: 'custrecord_avlr_taxmsg_code', 
				value: warnigObj.code,
				line: linenum
			});
			
			transactionLoad.setSublistValue({
				sublistId: 'recmachcustrecord_avlr_taxmsg_trx', 
				fieldId: 'custrecord_avlr_taxmsg_desc', 
				value: warnigObj.description,
				line: linenum
			});
		}
		else
		{
			transactionLoad.selectNewLine({sublistId: 'recmachcustrecord_avlr_taxmsg_trx'});
			
			transactionLoad.setCurrentSublistValue({
    				sublistId: 'recmachcustrecord_avlr_taxmsg_trx', 
    				fieldId: 'custrecord_avlr_taxmsg_tranline', 
    				value: warnigObj.lineCode
				});
			
			transactionLoad.setCurrentSublistValue({
    				sublistId: 'recmachcustrecord_avlr_taxmsg_trx', 
    				fieldId: 'custrecord_avlr_taxmsg_type', 
    				value: 1 // Warning
				});
			
			transactionLoad.setCurrentSublistValue({
    				sublistId: 'recmachcustrecord_avlr_taxmsg_trx', 
    				fieldId: 'custrecord_avlr_taxmsg_ncm', 
    				value: warnigObj.hsCode
				});
			
			transactionLoad.setCurrentSublistValue({
    				sublistId: 'recmachcustrecord_avlr_taxmsg_trx', 
    				fieldId: 'custrecord_avlr_taxmsg_code', 
    				value: warnigObj.code
				});
			
			transactionLoad.setCurrentSublistValue({
    				sublistId: 'recmachcustrecord_avlr_taxmsg_trx', 
    				fieldId: 'custrecord_avlr_taxmsg_desc', 
    				value: warnigObj.description
				});
			
			transactionLoad.commitLine({sublistId: 'recmachcustrecord_avlr_taxmsg_trx'});
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
	function saveJsonInFile(scriptContext) 
	{
		var sessionObj = runtime.getCurrentSession(); //sessionObj is a runtime.Session object
		var scriptObj = runtime.getCurrentScript();
		
		var _newRecord = scriptContext.newRecord;
		var _randomString = _newRecord.getValue({fieldId: 'custbody_avlr_randomstring'});
		
		var jsonCalcRequest = sessionObj.get({name: 'calcrequest'+_randomString});
		var jsonCalcResponse = sessionObj.get({name: 'calcresponse'+_randomString});   		
		
		var _folderId = scriptObj.getParameter({name: 'custscript_avlr_payloadfolder'});
//    		log.debug('Id Folder : ', _folderId);

		if(_folderId)
		{
			if(jsonCalcRequest)
			{
				//log.debug('calcrequest', jsonCalcRequest);
				//----------------------------------------------------------
				var payLoadRequestFileObj = file.create({
					name: 'calcRequest'+_newRecord.id+'.json',
					fileType: file.Type.JSON,
					contents: jsonCalcRequest,
					encoding: file.Encoding.WINDOWS_1252,
					folder: _folderId,
					isOnline: true
				})
				var payLoadRequestSave = payLoadRequestFileObj.save();
				//log.debug('fileObj', payLoadRequestSave);
				
				var id = record.attach({
					record: {
						type: 'file',
						id: payLoadRequestSave
					},
					to: {
						type: _newRecord.type,
						id: _newRecord.id
					}
				});
				//----------------------------------------------------------
				sessionObj.set({name: 'calcrequest'+_randomString, value: ''});
			}
			else
			{
				log.debug('jsonCalcRequest', 'null');
			}	
			
			if(jsonCalcResponse)
			{
				//log.debug('afterSubmit - calcresponse', jsonCalcResponse);
				//----------------------------------------------------------
				var payLoadResponseFileObj = file.create({
					name: 'calcResponse'+_newRecord.id+'.json',
					fileType: file.Type.JSON,
					contents: jsonCalcResponse,
					encoding: file.Encoding.WINDOWS_1252,
					folder: _folderId,
					isOnline: true
				})
				var payLoadResponseSave = payLoadResponseFileObj.save();
				//log.debug('fileObj', payLoadResponseSave);
				
				var id = record.attach({
					record: {
						type: 'file',
						id: payLoadResponseSave
					},
					to: {
						type: _newRecord.type,
						id: _newRecord.id
					}
				});
				//----------------------------------------------------------
			}
			else
			{
				log.debug('jsonCalcResponse', 'null');
			}
		}
		else
		{
			log.debug('WARNING', '"PayLoad Folder Id" não definido em "Preferencias Gerais" da Compania');
			
			sessionObj.set({name: 'warningresponse'+_randomString ,value: '</br>MENSAGEM NETSUITE : "PayLoad Folder Id" não definido em "Preferencias Gerais" da Compania'});
		}
	}
   
	function getMessageError(response, inputLineIndex, transactionLoad) 
	{
		if(runtime.executionContext != 'TAXCALCULATION')
			removeWarnings(transactionLoad);
		
		var _message = '';
		if(response.error)
		{
			if(response.error.innerError)
			{
				for (var int3 = 0; int3 < response.error.innerError.length; int3++) 
				{
					
					if(runtime.executionContext == 'TAXCALCULATION' && (inputLineIndex+1) == response.error.innerError[int3].lineCode)
					{
						_message = getMsgInnerError(response.error.innerError[int3]);
					}
					else if(runtime.executionContext != 'TAXCALCULATION')
					{
						var warnigObj = {}
						
							warnigObj.lineCode = response.error.innerError[int3].lineCode
							warnigObj.type = 2 // Error
							
							var whereObj = response.error.innerError[int3].where
							if(!avlrUtil.isEmptyObj(whereObj))
								warnigObj.hsCode = whereObj['hsCodes.code']
								
							warnigObj.code = response.error.innerError[int3].code
						
							var description = getMsgInnerError(response.error.innerError[int3]);
							_message += description;
						
							warnigObj.description = description;
						
						setWarningsValues(transactionLoad, warnigObj) 
					}
				}
			}
			else
				_message = response.error;
		}
		
		return _message;
	}
	
	function getMsgInnerError(innerError) 
	{
		var _message = '';
		var _message = innerError.message +'\r\n';
		
		if(innerError.list)
		{
			var arrList = innerError.list;
			for (var int4 = 0; int4 < arrList.length; int4++) 
			{
				_message += ' citation (' + (int4+1) + '): ' + arrList[int4].citation;
				_message += ', rate : ' + arrList[int4].rate;
				
				if(int4 < (arrList.length-1))
					_message += '\r\n'
			}
		}
		return _message
	}
	
    function getTaxCodes() 
	{
    	var arrTaxCodes = [];
		search.create({
			type: "customrecord_avlr_taxmapping",
			columns:
			[
			 	"custrecord_taxavtaxbr",
				"custrecord_taxtype",
				"custrecord_taxcode"
			]
		}).run().each(function(result){
			
			var taxCodeObj = {}
			
				taxCodeObj.taxAvataxBr = result.getText('custrecord_taxavtaxbr');
				taxCodeObj.taxType = result.getValue('custrecord_taxtype');
				taxCodeObj.taxcode = result.getValue('custrecord_taxcode');
				taxCodeObj.name = result.getText('custrecord_taxavtaxbr');

			arrTaxCodes.push(taxCodeObj);
			
			return true;
		});
		return arrTaxCodes;
	}
    
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function controlIntermediaryTransaction(scriptContext, fieldsSubsidiary) 
    {
    	var _type = scriptContext.type;
		var _form = scriptContext.form
		var _newRecord = scriptContext.newRecord;
		var _request = scriptContext.request;
		var enableNt2020006 = null
		
		if(fieldsSubsidiary)
		{
			enableNt2020006 = fieldsSubsidiary.custrecord_avlr_enalblent2020006;
			//log.debug('enableNt2020006', enableNt2020006);
		}
		
		var _marketplaceIndicatorField = _form.getField('custbody_avlr_marketplace_indicator');
		var _intermediaryTransactionField = _form.getField('custbody_avlr_intermediary_transaction');
		var _identifRegistIntermedField = _form.getField('custbody_avlr_identifregistintermed');
		var _cardCnpjField = _form.getField('custbody_avlr_cardcnpj');

		if(!enableNt2020006 && _type != 'copy' && _type != 'create')
		{
			if(_newRecord.getValue('custbody_avlr_marketplace_indicator'))
			{
				if(_marketplaceIndicatorField)
					_marketplaceIndicatorField.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});
			}
			else
			{
				if(_marketplaceIndicatorField)
					_marketplaceIndicatorField.updateDisplayType({displayType : serverWidget.FieldDisplayType.NODISPLAY});
			}
	 		
			if(_newRecord.getValue('custbody_avlr_intermediary_transaction'))
			{
				if(_intermediaryTransactionField)
					_intermediaryTransactionField.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});
			}
			else
			{
				if(_intermediaryTransactionField)
					_intermediaryTransactionField.updateDisplayType({displayType : serverWidget.FieldDisplayType.NODISPLAY});
			}
			
			if(_newRecord.getValue('custbody_avlr_identifregistintermed'))
			{
				if(_identifRegistIntermedField)
					_identifRegistIntermedField.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});
			}
			else
			{
				if(_identifRegistIntermedField)
					_identifRegistIntermedField.updateDisplayType({displayType : serverWidget.FieldDisplayType.NODISPLAY});
			}
			
			if(_newRecord.getValue('custbody_avlr_cardcnpj'))
			{
				if(_cardCnpjField)
					_cardCnpjField.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});
			}
			else
			{
				if(_cardCnpjField)
					_cardCnpjField.updateDisplayType({displayType : serverWidget.FieldDisplayType.NODISPLAY});
			}
			
		}
		else if((_newRecord.type != 'salesorder' && _newRecord.type != 'invoice')) // || fieldsFiscDocType.custrecord_enl_fdt_model == 1
		{
			//log.debug('_type', _type);
			if (_type == 'copy' || _type == 'create')
	        {
				var orderId = _request.parameters.id;
				var recordType = null;
				search.create({
					type: "transaction",
					filters: [["internalid", "anyof", orderId], "AND", ["mainline","is", "T"]],
					columns: ["type"]
				}).run().each(function(result){
					recordType = result.recordType;
					log.debug("Origin Transaction", "ID: " + orderId + ", Type: " + recordType);
					return false;
				});
				var orderRec = null;
				var itemLineCount = _newRecord.getLineCount({ sublistId: "item" });		
				for (var i = 0; i < itemLineCount; i++) {
				
					var unTaxedOtherCostAmount = _newRecord.getSublistValue({ sublistId: "item", fieldId: "custcol_avlr_untaxedothercostamount", line: i });
					if (unTaxedOtherCostAmount) {

						if(orderId && orderRec == null)
							orderRec = recordType ? record.load({ type: recordType, id: orderId }) : null;

						if (orderRec != null) {
							var rateOrder = orderRec.getSublistValue({ sublistId: "item", fieldId: "rate", line: i });
							var rate = _newRecord.getSublistValue({ sublistId: "item", fieldId: "rate", line: i });							
							if (rate != rateOrder) {
								_newRecord.setSublistValue({ sublistId: "item", fieldId: "rate", line: i, value: rateOrder });
							}
						}
					}
				}

				var _identifRegistIntermedValue = _newRecord.getValue('custbody_avlr_identifregistintermed'); 
				if(_identifRegistIntermedValue)
					_newRecord.setValue({fieldId: 'custbody_avlr_identifregistintermed', value: ''});
				
				var _intermediaryTransactionValue = _newRecord.getValue('custbody_avlr_intermediary_transaction');
				if(_intermediaryTransactionValue)
					_newRecord.setValue({fieldId: 'custbody_avlr_intermediary_transaction', value: ''});
				
				var _marketplaceIndicatorValue = _newRecord.getValue('custbody_avlr_marketplace_indicator');
				if(_marketplaceIndicatorValue)
					_newRecord.setValue({fieldId: 'custbody_avlr_marketplace_indicator', value: ''});
				
				var _cardCnpj = _newRecord.getValue('custbody_avlr_cardcnpj');
				if(_cardCnpj)
					_newRecord.setValue({fieldId: 'custbody_avlr_cardcnpj', value: 'F'});
	        }
			
			// Identificador cadastrado no intermediador
			if(_identifRegistIntermedField)
				_identifRegistIntermedField.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
			
			// Intermediador da Transação
			if(_intermediaryTransactionField)
				_intermediaryTransactionField.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
			
			// Indicador de intermediador/marketplace
			if(_marketplaceIndicatorField)
				_marketplaceIndicatorField.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
			
			if(_cardCnpjField)
				_cardCnpjField.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
			
		}
		else
		{
			//log.debug('hideFields', '');
			if (_type == 'copy' || _type == 'create')
	        {
				hideFields();
	        }
			else
			{
				var _marketplaceIndicator = _newRecord.getValue('custbody_avlr_marketplace_indicator');
				if(_marketplaceIndicator != 2)
				{
					hideFields();
				}
			}
		}
		
		function hideFields() 
		{
			if(_intermediaryTransactionField)
     			_intermediaryTransactionField.updateDisplayType({displayType : serverWidget.FieldDisplayType.NODISPLAY});
     		
     		if(_identifRegistIntermedField)
     			_identifRegistIntermedField.updateDisplayType({displayType : serverWidget.FieldDisplayType.NODISPLAY});
     		
     		if(_cardCnpjField)
     			_cardCnpjField.updateDisplayType({displayType : serverWidget.FieldDisplayType.NODISPLAY});
		}
	}

	function naSoftwareFiscal(subsidiary, transactionLoad) 
	{
		var _softwareFiscalNA = subsidiary.getValue({fieldId: 'custrecord_enl_softwarefiscal'}) == 1; // 'Software Fiscal N/A.'
		if(_softwareFiscalNA)
		{
			log.debug('TAX DETAILS OVERRIDE', 'Software Fiscal N/A.');

			if(transactionLoad.isDynamic)
				transactionLoad.setValue({fieldId: "taxdetailsoverride", value: true});
				
			return true;
		}
		else
			return false;
	}

	function closedPostingperiod(transactionLoad, lockCalc) 
	{
		if(transactionLoad.type != 'salesorder')
		{
			var _postingPeriodId = transactionLoad.getValue({fieldId: 'postingperiod'});
			if(_postingPeriodId)
			{
				var _accountingperiod = search.lookupFields({type: 'accountingperiod', id: _postingPeriodId, columns: ['closed']});
				
				if(_accountingperiod.closed &&  lockCalc)
				{
					log.debug('TAX DETAILS OVERRIDE', 'Period Closed And lockCalc');

					if(transactionLoad.isDynamic)
						transactionLoad.setValue({fieldId: "taxdetailsoverride", value: true});

					return true;
				}
				else
					return false;
			}
		}
	}

	function sendToFiscal(transactionLoad, sendToFiscal) 
	{
		if(!sendToFiscal)
		{
			log.debug('TAX DETAILS OVERRIDE', 'Do not send to avatax' );

			if(transactionLoad.isDynamic)
				transactionLoad.setValue({fieldId: "taxdetailsoverride", value: true});

			return false;
		}
		else
			return true;
	}

	function doCalculate(transactionLoad, lockCalc, issueNote) 
	{
		var _fiscalDocStatus = transactionLoad.getValue({fieldId: 'custbody_enl_fiscaldocstatus'});
		// 3-Autorizada, 5-Cancelada pelo Sefaz, 6-Inutilizada pelo Sefaz
		if ((((_fiscalDocStatus == 3) || (_fiscalDocStatus == 5) || (_fiscalDocStatus == 6)) && lockCalc) && issueNote)
		{
			log.debug('TAX DETAILS OVERRIDE', 'Invoice : ' + transactionLoad.getText({fieldId: 'custbody_enl_fiscaldocstatus'}));

			if(transactionLoad.isDynamic)
				transactionLoad.setValue({fieldId: "taxdetailsoverride", value: true});

			return false;
		}	
		else
			return true;
	}

	function setApprovalstatus(transactionLoad) 
	{
		var _operationTypeid = transactionLoad.getValue('custbody_enl_operationtypeid'); 
		var _operationType = search.lookupFields({
				type: 'customrecord_enl_operationtype', 
				id: _operationTypeid, 
				columns: ['custrecord_enl_financialtran']
			});

		var _operationFinancialTran = _operationType.custrecord_enl_financialtran;
		//log.debug('_operationFinancialTran', _operationFinancialTran);

		if(!_operationFinancialTran)
			transactionLoad.setValue({fieldId: 'approvalstatus', value: 3}); // Rejected
		// else
		// 	log.debug('Approval Status', 'Status da nota : '+ transactionLoad.getText('approvalstatus'));
		
	}

	function pad(n, width, z) 
	{
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}

	return {
    	getJsonRequest: getJsonRequest,
    	setControlString: setControlString,
    	messageError: messageError,
    	saveJsonInFile: saveJsonInFile,
    	getTaxCodes: getTaxCodes,
    	setResponseInformation: setResponseInformation,
    	getMessageError: getMessageError,
    	controlIntermediaryTransaction: controlIntermediaryTransaction,
		naSoftwareFiscal: naSoftwareFiscal,
		closedPostingperiod: closedPostingperiod,
		sendToFiscal: sendToFiscal,
		doCalculate: doCalculate,
		setApprovalstatus: setApprovalstatus
    };
    
});
