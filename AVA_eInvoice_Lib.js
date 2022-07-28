/*******************************************************************
 *
 * Name: AVA_eInvoice_Lib.js
 * Script Type: Custom module which has defined functions 
 *
 * Author: Rogerio Horauti
 * Purpose: eInvoice process
 * Script: The script record id ''
 * Deploy: The script deployment record id ''
 * Created On:
 * Deployed On:
 *
 * Change log :    Date				By											Remarks
 *
 *
 *
 *
 * ******************************************************************* */

/**
 * @NApiVersion 2.x
 * @NModuleScope public
 */

/**
 * @param search
 * @param record
 * @param runtime
 * @returns
 */
define(["N/search", "N/record", "N/file", "N/runtime", "N/https", "N/format", "./AVLR_UtilV3.js"], 

function (search, record, file, runtime, https, format, avlrUtil) 
{
	/**
	 * [This function is used to get the overall results exists in netsuite]
	 * @param  {[Object]} searchObj [NetSuite search object as variable with required parameters]
	 * @return {[Array]}           [Search results as array of arrays]
	 */
	
	{
		// Globals
		// var begin = new Date().getTime();
		
		// const TOBEPROCESSED = 1, PENDING = 2, PROCESSED = 3, ERROR = 4, REPROCESS = 5, NOTREQUIRED = 6;
		// const RETRIES = 2, TIMEOUT = 6000;
		
		// var sessionObj = runtime.getCurrentSession(); //sessionObj is a runtime.Session object

		// var sessionCountryList = sessionObj.get({name: 'countryList'});
		// var sessionCityList = sessionObj.get({name: 'cityList'});
		// var sessionLocationList = sessionObj.get({name: 'locationList'});
		//var sessionFiscalDocumentTypeList = sessionObj.get({name: 'fiscalDocumentTypeList'});
		// var sessionCarrierList = sessionObj.get({name: 'carrierList'});
		// var sessionAccountList = sessionObj.get({name: 'accountList'});
		//var sessionSubsidiaryList = sessionObj.get({name: 'subsidiaryList'});
		
		
		// var countryList = sessionCountryList ? JSON.parse(sessionCountryList) : getCountryList();
//	    log.debug('countryList', JSON.stringify(countryList));
		// var cityList = sessionCityList ? JSON.parse(sessionCityList) : getCityList();
	    //var subsidiaryList = sessionSubsidiaryList ? JSON.parse(sessionSubsidiaryList) : getSubsidiaries();
	    var locationList; //= sessionLocationList ? JSON.parse(sessionLocationList) : getLocations();
//	    log.debug('locationList', JSON.stringify(locationList));
	    // var fiscalDocumentTypeList = sessionFiscalDocumentTypeList ? JSON.parse(sessionFiscalDocumentTypeList) : getfiscalDocumentTypes();
	    var installmentEnabled //= runtime.isFeatureInEffect({feature: 'INSTALLMENTS'});
	    var installmentList = [];
	    var inventoryDetailsList = [];
	    var carrierList; //= sessionCarrierList ? JSON.parse(sessionCarrierList) : getCarrierList();
		var headerSearchResults = [];
	    var lineSearchResults = [];
	    // var runtimeObj = runtime.getCurrentScript();
	    var batchNumDetail //= runtimeObj.getParameter({name: 'custscript_avlr_batchnumdetail'});
	    var accountList; //= sessionAccountList ? JSON.parse(sessionAccountList) : fetchAccount();
	    //var listFiscalDocumentNumberByLocation = getFiscalDocumentNumberByLocation();
	    var discAmount = 0.0;
		var tranObjId = null;

	    // log.audit('Duration', 'fetch : ' + millisToMinutesAndSeconds(new Date().getTime() - begin));
	}
	
	function millisToMinutesAndSeconds(millis) 
	{
		var minutes = Math.floor(millis / 60000);
		var seconds = ((millis % 60000) / 1000).toFixed(0);
		return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
	}
	
	function getTransactions(internalId) 
	{
		try
		{
			//log.debug('getTransactions', 'Inside library-getTransactions()');
		
			var filters = [];
			filters.push(["mainline", "is", "T"]);
			filters.push('AND');
			
			if(internalId)
			{
				filters.push(["internalid","anyof",internalId]);
				//filters.push('AND');
			}
			else
			{
				filters.push(["type", "anyof", "VendBill", "VendCred", "CustInvc", "CustCred"]);
				filters.push('AND');
				filters.push(["custbody_enl_order_documenttype.custrecord_enl_issuereceiptdocument","is","T"]);
				filters.push('AND');
				filters.push(["status","noneof","CustCred:V","CustInvc:V","CustInvc:E","TrnfrOrd:H","TrnfrOrd:A","TrnfrOrd:B","TrnfrOrd:C","VendBill:C","VendBill:E"]);
				filters.push('AND');
				filters.push(["subsidiary.custrecord_enl_urlswfiscal","isnotempty",""]);
				filters.push('AND');
				filters.push(["custbody_enl_fiscaldocstatus", "anyof",  "1","@NONE@"]);
			}


			var transactionSearchObj = search.create({
				type: "transaction",
				filters: filters,
				title: 'getTransactions',
				columns: [
					search.createColumn({name: "custbody_enl_order_documenttype"}),
					search.createColumn({name: "custbody_enl_fiscaldocnumber"}),
				],
			});
				
			return transactionSearchObj;
		}
		catch(getTransactionsErr)
		{
	        throw getTransactionsErr; 
		}
	}

	function calcAccessKey(calcAccessKeyObj)
	{
		try
		{
			var accessKey = '';
			accessKey += calcAccessKeyObj.state; //2
			accessKey += calcAccessKeyObj.invoiceDate;  //4
			accessKey += calcAccessKeyObj.cnpj; //14
			accessKey += calcAccessKeyObj.mod; //2
			accessKey += calcAccessKeyObj.serie; //3
			accessKey += calcAccessKeyObj.nNF; //9
			accessKey += calcAccessKeyObj.tpEmis; //1
			accessKey += calcAccessKeyObj.cnf; //8
			
//			log.debug('accessKey', accessKey);
//			log.debug('length-accessKey', accessKey.length);
			
			if(accessKey.length != 43)
				throw "Erro ao calcular chave de acesso.";
				
            var factor = [ 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 ];

            var sumNumber = 0;

            for(var i = 0; i < accessKey.Length; i++)
            {
            	sumNumber += parseInt(accessKey.substring(i, 1)) * factor[i];
            }

            var mod = (sumNumber % 11);

			var ac_key = calculaDigitoMod11(accessKey,1,9,true);

			//log.debug("After  DIG ac_key", ac_key);

			return ac_key;
            
		}
		catch(calcAccessKeyErr)
		{
	        throw calcAccessKeyErr;
		}
	}

	function calculaDigitoMod11(dado, numDig, limMult, x10)
	{
		var mult, soma, i, n, dig;
		if(!x10) numDig = 1;
		for(n=1; n<=numDig; n++){
			soma = 0;
			mult = 2;
			for(i=dado.length-1; i>=0; i--){
				soma += (mult * parseInt(dado.charAt(i)));
				if(++mult > limMult) mult = 2;
			}
			if(x10){
				dig = ((soma * 10) % 11) % 10;
			} else {
				dig = soma % 11;
				if(dig == 10) dig = "X";
			}
			dado += (dig);
		}
		return dado;
	}


	function fetchStateCode(state)
    {
        switch(state)
        {
            case "RO":
                return 11;

            case "AC":
                return 12;

            case "AM":
                return 13;

            case "RR":
                return 14;

            case "PA":
                return 15;

            case "AP":
                return 16;

            case "TO":
                return 17;

            case "MA":
                return 21;

            case "PI":
                return 22;

            case "CE":
                return 23;

            case "RN":
                return 24;

            case "PB":
                return 25;

            case "PE":
                return 26;

            case "AL":
                return 27;

            case "SE":
                return 28;

            case "BA":
                return 29;

            case "MG":
                return 31;

            case "ES":
                return 32;

            case "RJ":
                return 33;

            case "SP":
                return 35;

            case "PR":
                return 41;

            case "SC":
                return 42;

            case "RS":
                return 43;

            case "MS":
                return 50;

            case "MT":
                return 51;

            case "GO":
                return 52;

            case "DF":
                return 53;

            default:
                return 0;

        }
    }

	function getActivitySector(activityId)
	{
		switch (activityId)
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
       
	
	function getEntityObj(recDetails, useType, state)
	{
		try
		{
			if(recDetails.recordType == 'invoice' || recDetails.recordType == 'creditmemo' || recDetails.recordType == 'customsale_remessa_bon')
	        	var _entityJoin = 'customer';
	        else // vedorbill || vendorcredit
	        	var _entityJoin = 'vendor';
			  
//			log.debug('_entityJoin', _entityJoin);
			
			var entityObj = {};
			var isPerson = recDetails.getValue({name: 'isPerson', join: _entityJoin});
			// log.debug('isPerson', isPerson);
			//var state = recDetails.getText({name: 'custrecord_enl_uf', join: 'billingAddress'});
//			log.debug('state', state);
			
			if(state != "EX")
			{
				if(recDetails.getValue({name: "custentity_enl_cnpjcpf", join: _entityJoin}))
					entityObj.federalTaxId = removeSpecialCharacter(recDetails.getValue({name: "custentity_enl_cnpjcpf", join: _entityJoin}));
			}
			else
				entityObj.federalTaxId = pad(recDetails.getValue({ name: "entity" }), 20); // not use more this: '99999999999999';

			if(recDetails.getValue({name: "custentity_enl_ccmnum", join: _entityJoin}))
				entityObj.cityTaxId = removeSpecialCharacter(recDetails.getValue({name: "custentity_enl_ccmnum", join: _entityJoin})); 
			
			if(recDetails.getValue({name: "custentity_enl_ienum", join: _entityJoin}))
				entityObj.stateTaxId = removeSpecialCharacter(recDetails.getValue({name: "custentity_enl_ienum", join: _entityJoin}));
			
			if(recDetails.getValue({name: "custentity_enl_suframaid", join: _entityJoin}))
				entityObj.suframa = recDetails.getValue({name: "custentity_enl_suframaid", join: _entityJoin});
			
			if(recDetails.getValue({name: "phone", join: _entityJoin}))
				entityObj.phone = removeSpecialCharacter(recDetails.getValue({name: "phone", join: _entityJoin}));
			
			if(recDetails.getValue({ name: "email", join: _entityJoin }))
				entityObj.email = recDetails.getValue({ name: "email", join: _entityJoin });
			
			var actSector = recDetails.getValue({name: "custentity_enl_ent_activitysector", join: _entityJoin});
			if(actSector)
				entityObj.activitySector = {
					type: "activityLine",
					code: getActivitySector(actSector)
				};
			
				
			var _entitytype = recDetails.getValue({ name: "custentity_enl_entitytype", join: _entityJoin });
			entityObj.type = (state == "EX") ? 'foreign' : (isPerson == true) ? 'individual' : getEntityType(_entitytype); 
			
			if(recDetails.getValue({ name: "custentity_avlr_federaltaxationregime", join: _entityJoin }))
				entityObj.taxRegime = getFederalTaxationRegime(recDetails.getValue({ name: "custentity_avlr_federaltaxationregime", join: _entityJoin }));
			
			// log.debug('legal name', recDetails.getValue({name: "custentity_enl_legalname", join: _entityJoin}));
			entityObj.name = !isPerson ? recDetails.getValue({name: "custentity_enl_legalname", join: _entityJoin}) : 
				(recDetails.getValue({name: "firstName", join: _entityJoin}) + " " + recDetails.getValue({name: "lastName", join: _entityJoin})); 
				
			if(recDetails.getValue({name: "companyName", join: _entityJoin})) 
				entityObj.businessname = recDetails.getValue({name: "companyName", join: _entityJoin}); 
				
			entityObj.taxesSettings = {}
			
			var _statetaxpayer = recDetails.getValue({name: "custentity_enl_statetaxpayer", join: _entityJoin});
			if(_statetaxpayer)
				entityObj.taxesSettings.icmsTaxPayer = true;
			else
				entityObj.taxesSettings.icmsTaxPayer = false;
			
			var _subjectpayrolltaxrelief = recDetails.getValue({name: "custentity_avlr_subjectpayrolltaxrelief", join: _entityJoin});
			if(_subjectpayrolltaxrelief)
				entityObj.taxesSettings.subjectToPayrollTaxRelief = true; 
			
			var _pisfopag = recDetails.getValue({name: "custentity_avlr_pisfopag", join: _entityJoin});
			if(_pisfopag)
				entityObj.taxesSettings.pisFopag = true; 
			
			var _pisCofinsReliefZF = recDetails.getValue({name: "custentity_avlr_piscofinsrelizefzf", join: _entityJoin});
			if(_pisCofinsReliefZF)
				entityObj.taxesSettings.pisCofinsReliefZF = true; 

			var _piscofinsreliefzflikeud = recDetails.getValue({name: "custentity_avlr_piscofinsreliefzflikeud", join: _entityJoin});
			if(_piscofinsreliefzflikeud)
				entityObj.taxesSettings.pisCofinsReliefZFLikeUDisc = _piscofinsreliefzflikeud;
			
			if(recDetails.recordType == 'vendorbill'  || recDetails.recordType == "vendorcredit")
			{
				var _customissrate = recDetails.getValue({name: "custbody_enl_customissrate"});
				if(_customissrate)
					entityObj.taxesSettings.issRfRateForSimplesTaxRegime = _customissrate; 
				
				var _customicmsrate = recDetails.getValue({name: "custbody_enl_customicmsrate"});
				if(_customicmsrate)
					entityObj.taxesSettings.pCredSN = _customicmsrate; 
				
			}
			
			return entityObj;
		}
		catch(getEntityObjErr)
		{
	        throw getEntityObjErr;
		}
	}
	
	function getTransferLocationObj(recDetails) 
	{
		var entityObj = {};
		
		entityObj.icmsTaxPayer = true;
		entityObj.name = recDetails.getValue({name: "custrecord_enl_legalname", join: "toLocation"}); 
		entityObj.type = getEntityType(); 

		if(recDetails.getValue({name: "custrecord_enl_locationcnpj", join: "toLocation"}))
			entityObj.federalTaxId = removeSpecialCharacter(recDetails.getValue({name: "custrecord_enl_locationcnpj", join: "toLocation"}));
		
		if(recDetails.getValue({name: "custrecord_enl_locationccmnum", join: "toLocation"}))
			entityObj.cityTaxId = removeSpecialCharacter(recDetails.getValue({name: "custrecord_enl_locationccmnum", join: "toLocation"})); 
		
		if(recDetails.getValue({name: "custrecord_enl_locationienum", join: "toLocation"}))
			entityObj.stateTaxId = removeSpecialCharacter(recDetails.getValue({name: "custrecord_enl_locationienum", join: "toLocation"}));
		
		var activitysector = recDetails.getValue({name: "custrecord_avlr_activitysector", join: "location"})
		if(activitysector)
		{
			entityObj.activitySector = {};
			entityObj.activitySector.type = "activityLine",
			entityObj.activitySector.code = getActivitySector(activitysector)
		}
		
		return entityObj;
	}
	
	function getEntityType(entitytype)
    {
        switch (entitytype)
        {
            case "1":
                return "business";
            case "2":
                return "federalGovernment";
            case "3":
                return "stateGovernment";
            case "4":
                return "cityGovernment";
			case "5":
                return "individual";
			case "6":
                return "foreign";
			case "7":
                return "mixedCapital";
			case "8":
                return "coops";
            default:
                return "business";
        }
    }
	
	function getFederalTaxationRegime(federalTaxationRegime) 
	{
		 switch(federalTaxationRegime) 
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
	
	function createHeaderRequest(recDetails, transactionLoad)
	{
		try
		{
//			log.debug('1', 'inside createHeaderRequest');
			var invoiceId, entityObj;
			var header = {};
			var operationTypeId, operationAltName, operationFinalPrice, operationFinancialTran;
			
			operationTypeId = recDetails.getValue({name: 'custbody_enl_operationtypeid'});
			if(!operationTypeId)
				throw "Campo Tipo de Operação é obrigatório.";
			
			var _locationId = recDetails.getValue({name: 'location'});
			if(!_locationId)
				throw "Campo Location não definido.";
			
			var companyName = recDetails.getValue({name: 'namenohierarchy', join: 'subsidiary'});
			var operationUseType = recDetails.getValue({name: 'custrecord_enl_ot_usetype', join: 'CUSTBODY_ENL_OPERATIONTYPEID'});
//			var operationUseTypeText = recDetails.getText({name: 'custrecord_enl_ot_usetype', join: 'CUSTBODY_ENL_OPERATIONTYPEID'});

			var recType = recDetails.recordType;
			var _model = recDetails.getValue({name: "custrecord_enl_fdt_model", join: "CUSTBODY_ENL_ORDER_DOCUMENTTYPE"});
			
			// transactionDate
			if(_model != 65)
			{
				if(recDetails.getValue({name: 'custbody_enl_fiscaldocdate'}))
				{
					var xmlDate = format.parse({value: recDetails.getValue({name: 'custbody_enl_fiscaldocdate'}), type: format.Type.DATE});
					header.transactionDate = xmlDate.toISOString();
				}	
				else
				{
					var subsidiaryLoad = record.load({type: 'subsidiary', id: recDetails.getValue({name: 'subsidiary'}), isDynamic: true});
					var xmlDate = format.parse({value: recDetails.getValue({name: 'datecreated'}), type: format.Type.DATETIME}).toUTCString();
					var timezone = subsidiaryLoad.getText({fieldId: 'TIMEZONE'}).substr(5,5);
					var operator = subsidiaryLoad.getText({fieldId: 'TIMEZONE'}).substr(4,1);
					
					var operatorFinal = (operator == '-') ? '+' : '-';
					
					header.transactionDate = new Date(xmlDate + operatorFinal + timezone).toISOString().substr(0,19) + operator + timezone;
				}	
			}
			else
			{
				var xmlDate = new Date().toUTCString()
			}

			//log.debug('transactionDate '+timezone, header.transactionDate);
			// end transactionDate
			
			var fiscalDocNo = recDetails.getValue({name: 'custbody_enl_fiscaldocnumber'});
//			log.debug('VAR fiscalDocNo', fiscalDocNo);

			if(fiscalDocNo)
				invoiceId = fiscalDocNo;
//		

			header.fiscalDocumentNumber = fiscalDocNo;
//			log.debug('VAR fiscalDocNo || invoiceId', fiscalDocNo);
			
			var _series = recDetails.getValue({name: "custrecord_enl_fdt_serie", join: "CUSTBODY_ENL_ORDER_DOCUMENTTYPE"});

			header.documentCode = "N_"+ runtime.accountId +"_"+ recType +"_"+ _locationId +"_"+ _model +"_"+ _series +"_"+ recDetails.id;
//			header.documentCode = "I_" + accountId + "_" + recType + "_" + recDetails.id;
			
			operationAltName = recDetails.getValue({name: 'custrecord_enl_ot_altname', join: 'CUSTBODY_ENL_OPERATIONTYPEID'});
			operationFinancialTran = recDetails.getValue({name: 'custrecord_enl_financialtran', join: 'CUSTBODY_ENL_OPERATIONTYPEID'});
			
			header.eDocCreatorPerspective = (operationAltName != 'standardPurchaseReturnShippingOutbound'); 
			header.operationType = operationAltName; 
			
			header.locations = {};
			header.locations.entity = {}
			
			if(recDetails.recordType != "transferorder")
			{
				var addressObj = fetchEntityAddress(recDetails);
				header.locations.entity = getEntityObj(recDetails, operationUseType, addressObj.state);;
				header.locations.entity.address = addressObj;
			}
			else
			{
				header.locations.entity = getTransferLocationObj(recDetails);
				header.locations.entity.address = fetchLocationAddress(recDetails.getValue({name: 'transferlocation'}));
			}
			
			header.locations.establishment = {};
			header.locations.establishment.businessName = recDetails.getValue({name: 'name', join: 'location'}); 
			header.locations.establishment.type = "business";
			
			var _locationcnpj = recDetails.getValue({name: 'custrecord_enl_locationcnpj', join: 'location'})
			if(_locationcnpj)
				header.locations.establishment.federalTaxId = removeSpecialCharacter(_locationcnpj); 
			
			header.locations.establishment.cityTaxId = recDetails.getValue({name: 'custrecord_enl_locationccmnum', join: 'location'}); 
			header.locations.establishment.stateTaxId = recDetails.getValue({name: 'custrecord_enl_locationienum', join: 'location'}); 
			header.locations.establishment.activitySector = {}
			var actSector = recDetails.getValue({name: 'custrecord_avlr_activitysector', join: 'location'}); 
			if(actSector)
			{
				header.locations.establishment.activitySector.type = 'activityLine';
				header.locations.establishment.activitySector.code = getActivitySector(actSector);
			}
			//Build defaultLocations Object
			var addressLocationObj = fetchLocationAddress(recDetails.getValue({name: 'location'})); // Location details
			header.locations.establishment.address = addressLocationObj;
			
			header.locations.establishment.taxesSettings = {};
			var _pisCofinsReliefzfLikeuDLocation = recDetails.getValue({name: 'custrecord_avlr_piscofinsreliefzflikeud', join: 'location'}); 
			if(_pisCofinsReliefzfLikeuDLocation)
				header.locations.establishment.taxesSettings.pisCofinsReliefZFLikeUDisc = _pisCofinsReliefzfLikeuDLocation;

			var _subjectToPayrollTaxRelief = recDetails.getValue({name: 'custrecord_avlr_subjecttopayrolltaxrelie', join: 'location'});
			if(_subjectToPayrollTaxRelief)
				header.locations.establishment.taxesSettings.subjectToPayrollTaxRelief = _subjectToPayrollTaxRelief;

			header.currency = 'BRL';
			
			if(recType == 'invoice' || recType == 'creditmemo' || recType == 'customsale_remessa_bon')
				header.transactionType = 'Sale';
			else
				header.transactionType = 'Purchase';
			
			//  operações com Modelo 65
			operationFinalPrice = recDetails.getValue({name: 'custrecord_enl_ot_finalprice', join: 'CUSTBODY_ENL_OPERATIONTYPEID'});
			if(operationFinalPrice) 
				header.amountCalcType = 'gross'; 
			
			header.companyLocation = recDetails.getValue({name: 'custrecord_enl_fiscalestablishmentid', join: 'location'}); 
			
			header.payment = fetchPaymentDetails(recDetails, invoiceId, addressLocationObj, transactionLoad); 
			
			var stdLegalText = recDetails.getValue({name: 'custbody_enl_stdlegaltxt'});
			var legalText = recDetails.getValue({name: 'custbody_enl_legaltext'});
			var addInf = stdLegalText + legalText;
			var complementaryInfo = recDetails.getValue({name: 'custbody_enl_complementaryinfo'});
			
			
			if(addInf || complementaryInfo)
			{
				var additionalInfo = {};
				
				if(_model != '01')
				{
					if(addInf)
						additionalInfo.fiscalInfo = addInf;
					
					if(complementaryInfo)
						additionalInfo.complementaryInfo = complementaryInfo;
				}
				else
				{
					if(complementaryInfo || addInf)
						additionalInfo.complementaryInfo = complementaryInfo +"  "+ addInf;
				}
				
				header.additionalInfo = additionalInfo;
			}
			
			if(_model == '01')
			{
				//For Service Invoice(s)
				header.messageType = 'services'; 
				header.companyLocation = recDetails.getValue({name: 'custrecord_enl_fiscalestablishmentid', join: 'location'});
				header.rpsNumber = invoiceId;
				
				header.locations.rendered = {};

				var deliveryLocation = recDetails.getValue({name: 'custbody_enl_deliverylocation'});
				if(deliveryLocation)
				{
					var deliveryLocationObj = fetchEntityObj(deliveryLocation, true).details;
					header.locations.rendered.address = deliveryLocationObj;
					
					if(deliveryLocationObj.country != 'BRA')
						header.isBenefitsAbroad = true;
				}
				else
				{
					// if(['purchaseorder', 'vendorbill', 'creditmemo', 'returnauthorization'].indexOf(recType) > -1)
					// 	header.locations.rendered.address = header.locations.establishment.address;
					// else
						header.locations.rendered.address = header.locations.entity.address;
				}
				
				if(addressLocationObj && addressLocationObj.state && addressLocationObj.state == "DF")
					header.rpsSerie = _series
				else
					header.rpsSerie = _series ? pad(_series, 3) : pad(1, 3);
				
			}
			else
			{
				// For Product Invoice(s) & Others
				
				if(recType == 'vendorbill' || recType == 'creditmemo')
				{
					var _issueInvoice = recDetails.getValue({name: "custrecord_enl_issuereceiptdocument", join: "CUSTBODY_ENL_ORDER_DOCUMENTTYPE"});
					if(_issueInvoice)
						header.eDocCreatorType = 'self';
					else
						header.eDocCreatorType = 'other';
				}
				else
				{
					header.eDocCreatorType = 'self';
				}
				
				// locations ------------------------------------------------------------------------------------
				if(recDetails.recordType != "transferorder")
				{
					var deliveryObj = recDetails.getValue({name: 'custbody_enl_deliverylocation'});
					if(deliveryObj)
					{
						deliveryObj = fetchEntityObj(deliveryObj, true);
						header.locations.delivery = deliveryObj.main;
						header.locations.delivery.address = deliveryObj.details;
					}
					
					var pickupObj = recDetails.getValue({name: 'custbody_enl_pickuplocation'});
//					log.debug('pickupObj', JSON.stringify(pickupObj));
					if(pickupObj)
					{
						pickupObj = fetchEntityObj(pickupObj, true);
						header.locations.pickup = pickupObj.main;
						header.locations.pickup.address = pickupObj.details;
					}
				}

				var transporterObj = recDetails.getValue({name : 'custbody_enl_carrierid'});
				if(transporterObj)
				{
					transporterObj = fetchCarrierList(transporterObj);
					header.locations.transporter = transporterObj.main;
					header.locations.transporter.address = transporterObj.details;
				}
				
				// locations ------------------------------------------------------------------------------------

				var calcKey = {};
				
					calcKey.state = fetchStateCode(header.locations.establishment.address.state)// location state code .. also known as UF Code .. 2 characters

					if(recDetails.getValue({name: 'custbody_enl_fiscaldocdate'}))
						var invoiceDate = format.parse({value: recDetails.getValue({name: 'custbody_enl_fiscaldocdate'}), type: format.Type.DATE});
					else
						var invoiceDate = format.parse({value: recDetails.getValue({name: 'trandate'}), type: format.Type.DATE});

					calcKey.invoiceDate =  pad(invoiceDate.getFullYear().toString().substring(2) + pad(invoiceDate.getMonth() + 1, 2), 4); // year and month of issue .. 4 characters

					var _cnpj = removeSpecialCharacter(pad(recDetails.getValue({name: "custrecord_enl_fiscalestablishmentid", join: "location"}), 14));
					calcKey.cnpj = _cnpj;// cnpj of the issuer .. 14 characters
					
					if(_model)
						calcKey.mod = pad(_model, 2);// tax document template .. 2 characters
					
					calcKey.serie = _series ? pad(_series, 3) : pad(1, 3);// tax document series .. 3 characters
					calcKey.nNF = pad(invoiceId, 9);// tax document number .. 9 characters
					calcKey.tpEmis = 1;// form of issuing the NF-e .. 2 characters
					//calcKey.cnf = pad(Number(invoiceId) + 100, 8).substr(0,8);// numeric code that makes up the access key .. 8 characters
					calcKey.cnf = randomString(8, "#");// numeric code that makes up the access key .. 8 characters
					//log.debug('calcAccessKeyObj', JSON.stringify(calcKey));

				header.invoiceAccessKey = calcAccessKey(calcKey); // Check with Marcel on the final value generated.. 
//				log.debug('calcAccessKeyObj_calc', JSON.stringify(header.invoiceAccessKey));

				header.messageType = 'goods'; 
				
//				log.debug('BEFORE invoiceNumber header.invoiceNumber', header.invoiceNumber);
//				log.debug('BEFORE invoiceNumber fiscalDocNo', fiscalDocNo);

				var invoiceNumber = parseInt(fiscalDocNo.toString(),10);
				header.invoiceNumber = invoiceNumber; 

//				log.debug('AFTER invoiceNumber header.invoiceNumber', header.invoiceNumber);


				header.invoiceSerial = _series ? parseInt(_series) : 1; 

				header.goods = {};
				header.goods.model = _model; 
				header.goods.tpImp = '1'; // # without DANFE;
				
				if(_model != '65') 
					header.goods.indPres = getPresenceIndicator(recDetails.getValue({name : 'custbody_avlr_presenceindicator'}));
				else
					header.goods.indPres =  '1';
					
				header.goods.transport = {};
				
				var freightType = recDetails.getValue({name :'custbody_enl_freighttype'});
				header.goods.transport.modFreight = fetchFreightType(freightType);
				
				
				//transport.withholdICMSTransport = false; 

				var vehiclePlate = recDetails.getValue({name: 'custbody_enl_plate'});
				var ufplate = recDetails.getValue({name: 'custbody_enl_ufplate'});
				if(ufplate && vehiclePlate)
	            {
					header.goods.transport.vehicle = {};
					header.goods.transport.vehicle.type = "automobile";
	                
					header.goods.transport.vehicle.automobile = {};
					header.goods.transport.vehicle.automobile.licensePlate = vehiclePlate;
					header.goods.transport.vehicle.automobile.stateCode = ufplate;
	            }			
				
				if(recType == 'invoice')
				{
					var _shippingstate = recDetails.getValue('custbody_avlr_shippingstate');
					var _portoembarque = recDetails.getValue('custbody_enl_portoembarque');
					var _placedescription = recDetails.getValue('custbody_avlr_placedescription');
					
					if(_shippingstate || _portoembarque || _placedescription)
					{
						header.goods.exportInfo = {};
						//header.goods.exportInfo.description
						
						if(_shippingstate)
							header.goods.exportInfo.shippingState = _shippingstate;
						
						if(_portoembarque)
							header.goods.exportInfo.place = _portoembarque;
						
						if(_placedescription)
							header.goods.exportInfo.placeDescription = _placedescription;
					}
				}
				
				
				var _marketplaceIndicator = recDetails.getValue('custbody_avlr_marketplace_indicator');
				if(_marketplaceIndicator)
					header.goods.indIntermed = getMarketplaceIndicator(_marketplaceIndicator);
					
				if(_marketplaceIndicator == "2")
				{
					header.goods.infIntermed = {};
					var _intermediaryTransaction = recDetails.getValue('custbody_avlr_intermediary_transaction');
					if(_intermediaryTransaction)
					{
						var _cnpjcpf = recDetails.getValue({name: 'custentity_enl_cnpjcpf', join: 'CUSTBODY_AVLR_INTERMEDIARY_TRANSACTION'})
						if(_cnpjcpf)
							header.goods.infIntermed.federalTaxId = removeSpecialCharacter(_cnpjcpf);
					}
					header.goods.infIntermed.idCadIntTran = recDetails.getValue('custbody_avlr_identifregistintermed');
				}

				
				if(_model == '65') // # Nota Fiscal Eletrônica ao-Consumidor Final (NFC-e)
				{
                    header.goods.idDest = '1'; // # (en) Same State. / (pt) Interna.
                    header.goods.tpImp = '4'; // # # DANFe NFC-e;
                    header.goods.transport.modFreight = "FreeShipping";
				}
				
				if(recDetails.getValue({name: "custbody_enl_volumetype"}))
	    		{
					header.goods.transport.volumes = [];
					
	    			var volumeObj = {};
		    			volumeObj.qVol = recDetails.getValue({name: "custbody_enl_volumesqty"});
		    			volumeObj.specie = recDetails.getValue({name: "custbody_enl_volumetype"}); // VolumeType
		    			
		    			if(recDetails.getValue({name: "custbody_enl_brand"}))
		    				volumeObj.brand = recDetails.getValue({name: "custbody_enl_brand"}); // marca
		    			
		    			if(recDetails.getValue({name: "custbody_enl_netweight"}))
		    				volumeObj.netWeight = parseFloat(recDetails.getValue({name: "custbody_enl_netweight"}));
		    			
		    			if(recDetails.getValue({name: "custbody_enl_grossweight"}))
		    				volumeObj.grossWeight = parseFloat(recDetails.getValue({name: "custbody_enl_grossweight"}));
	    			
	    			header.goods.transport.volumes.push(volumeObj);

	    		}
				
				// header.goods.technicalManager = {}
				// header.goods.technicalManager.federalTaxId = "24918171000162";
				// header.goods.technicalManager.contactName = "MARCEL";
				// header.goods.technicalManager.email = "marcel.tardelli@avalara.com";
				// header.goods.technicalManager.phone = "11998001703";
				
			}// End - For Product Invoice(s) & Others

			return header;
		}
		catch(createHeaderRequestErr)
		{
			throw createHeaderRequestErr;
		}
	}

	function fetchPaymentDetails(recDetails, invoiceId, addressLocationObj, transactionLoad)
	{
		try
		{
			var _model = recDetails.getValue({name: "custrecord_enl_fdt_model", join: "CUSTBODY_ENL_ORDER_DOCUMENTTYPE"});
			var payment = {};
			var paymentInfo = {};
			//var paymentMode = [];
			var paymentModeArr = []
			var paymentModeObj = {};

			var installmentArr = [];
			var installmentAmounts = 0.0;
			
			if(recDetails.getValue('createdFrom') && recDetails.recordType == 'invoice')
			{
//				var subTotal = recDetails.getValue('total');
//				if(!subTotal)
//					subTotal = recDetails.getValue('netamountnotax');
				
				var paymentModeArr = fetchPaymentInfo(recDetails);
			}

			installmentEnabled = runtime.isFeatureInEffect({feature: 'INSTALLMENTS'});
			// log.debug("installmentEnabled", installmentEnabled);
			if (installmentEnabled && recDetails.recordType == 'invoice')
			{
				// log.debug("addressLocationObj", addressLocationObj);
				if(addressLocationObj && addressLocationObj.state && addressLocationObj.state == "DF")
				{
					var installmentsCount = transactionLoad.getLineCount({sublistId: 'recmachcustrecord_avlr_installments_tr'});
					// log.debug("installmentsCount", installmentsCount);
					if(installmentsCount && installmentsCount > -1)
					{
						var _netAmountNoTax = 0;
						for (var int5 = 0; int5 < installmentsCount; int5++) 
						{
							var installmentObj = {};
								installmentObj.documentNumber = pad(transactionLoad.getSublistValue({
																	sublistId: 'recmachcustrecord_avlr_installments_tr',
																	fieldId: 'custrecord_avlr_installments_number',
																	line: int5
																}), 3);

								installmentObj.date = transactionLoad.getSublistValue({
																	sublistId: 'recmachcustrecord_avlr_installments_tr',
																	fieldId: 'custrecord_avlr_installments_duedate',
																	line: int5
																});

								installmentObj.grossValue = transactionLoad.getSublistValue({
																	sublistId: 'recmachcustrecord_avlr_installments_tr',
																	fieldId: 'custrecord_avlr_installments_value',
																	line: int5
																})
								
								// log.debug("installmentObj", installmentObj);
								_netAmountNoTax += parseFloat(installmentObj.grossValue);
								installmentArr.push(installmentObj);
						}

						// log.debug("_netAmountNoTax", _netAmountNoTax);
						installmentAmounts = _netAmountNoTax;
					}
					else
					{
						var installmentObj = {};
							installmentObj.documentNumber = "001";
							installmentObj.date = format.parse({value: recDetails.getValue('trandate'), type: format.Type.DATE});
							installmentObj.grossValue = recDetails.getValue('netamountnotax');
	
						installmentArr.push(installmentObj);
						installmentAmounts = recDetails.getValue('netamountnotax');
					}
				}
				else
				{
					for(var i=0; installmentList != null && i < installmentList.length; i++)
					{
						var recId = recDetails.id;
						if(installmentList[i].getValue({name: 'internalid', join: 'transaction'}) == recId)
						{
							//var dueDate = new Date(installmentList[i].getValue({name: 'duedate'}));//'2020-06-19';
							var installmentObj = {};
							
								installmentObj.documentNumber = pad(installmentList[i].getValue({name: 'installmentnumber'}),3);
								
								var dueDate = format.parse({value: installmentList[i].getValue({name: 'duedate'}), type: format.Type.DATE});
								installmentObj.date = dueDate.getFullYear() + '-' + pad(parseInt(dueDate.getMonth() + 1), 2) + '-' + pad(dueDate.getDate(), 2);
								
								var installmentAmt = installmentList[i].getValue({name: 'amount'});
								installmentObj.grossValue = parseFloat(installmentAmt);
							
							installmentArr.push(installmentObj);

							installmentAmounts += parseFloat(installmentAmt);
						}
					}
				}
			}
			
			if(installmentAmounts)
			{
				payment.bill = {};
				
				payment.bill.nFat = invoiceId;
				payment.bill.vNet = installmentAmounts;
			
				
				if(_model == "01")
				{
					payment.installmentTerms = 0;

					if(addressLocationObj && addressLocationObj.state && addressLocationObj.state == "DF")
					{
						payment.bill.vOrig = installmentAmounts + Number(discAmount);
						payment.bill.vDiscount = Number(discAmount);

						if(paymentModeArr && paymentModeArr.length)
						{
							payment.paymentInfo = {};	
							payment.paymentInfo.paymentMode = paymentModeArr;
						}

						payment.installment = installmentArr;
					}
				}
				else if(recDetails.getValue({name: 'custrecord_enl_ot_altname', join: 'CUSTBODY_ENL_OPERATIONTYPEID'}) != "standardPurchaseReturnShippingOutbound")
				{	
					payment.installment = installmentArr;
					payment.installmentTerms = 1; // 1 # (en) On terms. / (pt) Parcelado.

					payment.bill.vOrig = installmentAmounts + Number(discAmount);
					payment.bill.vDiscount = Number(discAmount);
													
					payment.paymentInfo = {};								
				
					if(paymentModeArr && paymentModeArr.length)
	                {
						payment.paymentInfo.paymentMode = paymentModeArr;
	                }
					else
					{
						payment.paymentInfo.paymentMode = [];

						var paymentModeObj = {};
							paymentModeObj.mode = '15'; // '15' # Boleto Bancario	
							paymentModeObj.value = installmentAmounts;
							paymentModeObj.cardTpIntegration = '2'; // '2' # Payment not integrated with system
						
						payment.paymentInfo.paymentMode.push(paymentModeObj);
					}
				}
			} 
			else // if(!installmentAmounts)
			{
				if(paymentModeArr && paymentModeArr.length)
					payment.installmentTerms = 2; // 2 # (en) Other / (pt) Outros.
				else
					payment.installmentTerms = 0; // 0 # (en) Cash. / (pt) À vista.
			}
				
			if(_model == 65)
			{
                if(paymentModeArr && paymentModeArr.length)
                {
                	payment.installmentsTerms = 0;

					//paymentMode.push(paymentModeObj);
					paymentInfo.paymentMode = paymentModeArr;
					payment.paymentInfo = paymentInfo;
                }
                else
                {
                	payment.paymentInfo = {}
                	payment.paymentInfo.paymentMode = [];
                	
                	var paymentModeObj = {};
	                	paymentModeObj.mode = '90'; // // '90' # Sem Pagamento
	                	paymentModeObj.value = 0;
	                	paymentModeObj.cardTpIntegration = '2';
					
                	payment.paymentInfo.paymentMode.push(paymentModeObj);
                }
			}
				
			// log.debug("payment", payment);
			return payment;
		}
		catch(fetchPaymentDetailsErr)
		{
	        throw fetchPaymentDetailsErr; 
		}
	}
	
	function fetchInventoryDetails(arrayOfIds)
	{
//		log.debug('Inside fetchInventoryDetails', arrayOfIds);
		
		try
		{		
			var inventoryDetailSearchObj = search.load({id: 'customsearch_avlr_inventorydetail'});		
		}
		catch(fetchInventoryDetailsErr)
		{
			var inventoryDetailSearchObj = search.create({
				type: "inventorydetail",
				title: 'AVLR eInvoice - Inventory Detail',
				id: 'customsearch_avlr_inventorydetail',
				isPublic: true,
				columns:
				[
					search.createColumn({
							name: "internalid",
							join: "transaction",
							label: "Internal ID",
							sort: search.Sort.ASC,
						}),
					search.createColumn({
						name: "inventorynumber",
						label: " Number"
					}),
					search.createColumn({name: "quantity", label: "Quantity"}),
					search.createColumn({name: "expirationdate", label: "Expiration Date"}),
					search.createColumn({
						name: "item",
						join: "inventoryNumber",
						label: "Item"
					}),
					search.createColumn({
						name: "custitemnumber_enl_productiondate",
						join: "inventoryNumber",
						label: "Data de Fabricação"
					})
				]
			});

			log.debug('AVLR eInvoice - Inventory Detail', inventoryDetailSearchObj.save());
		}

		var _arr = [];
		inventoryDetailSearchObj.filters.push(search.createFilter({name: "internalid", join: 'transaction', operator: 'anyof', values: arrayOfIds}));
		inventoryDetailSearchObj.run().each(function(result){
			_arr.push(result);
			return true;
		});

		return _arr;
	}
	
	function createLineRequest(recDetails, headerDetails, transactionLoad)
	{
		try
		{
//			log.debug('inside linesearchResults', 'inside linesearchResults');

			var lines = [];
			var inssDeduction = 0;
			var arrRefAccessKey = [];
			var _model = recDetails.getValue({name: "custrecord_enl_fdt_model", join: "CUSTBODY_ENL_ORDER_DOCUMENTTYPE"});
			var addressLocationObj = headerDetails.locations.establishment.address;

			// if(recDetails.recordType == "transferorder")
			// 	var _unitsTypeArr = getUnitsType();


			var lineNumber = 0;
			
			for(var i=0; i < lineSearchResults.length; i++)
			{
				var lineObj = {};
				var lineRec = lineSearchResults[i];
				var lineRecId = lineRec.id;
				var lineRecType = lineRec.recordType;

				// if(lineRecId == recDetails.id && lineRecType == recDetails.recordType)
				// {
					var itemtype = lineRec.getValue({name: 'itemtype'});
					if(["OthCharge","TaxItem","TaxGroup","GiftCert","Discount"].indexOf(itemtype) > -1)
						continue;

					lineNumber++;
					lineObj.lineCode = lineNumber;
					//lineObj.item = lineRec.getText({sublistId: 'item', fieldId: 'item', line: i+1});
					lineObj.itemCode = lineRec.getValue({name: "itemid", join: 'item'}).split(":").slice(-1).toString().trim();
					
					lineObj.itemDescriptor = {};
					
					if(addressLocationObj && addressLocationObj.state && addressLocationObj.state == "DF" && _model == "01")
					{
						lineObj.itemDescriptor.description = transactionLoad.getSublistValue({sublistId: "item", fieldId: "description", line: i})
					}
					else
					{
						if(lineRec.getValue({name: 'displayname', join: 'item'}))
							lineObj.itemDescriptor.description = removeSpecialCharacter(lineRec.getValue({name: 'displayname', join: 'item'}), ' ');
					}
					
					if(lineRec.getText({name: 'custitem_enl_it_taxgroup', join: 'item'})) 
						lineObj.itemDescriptor.taxCode = lineRec.getText({name: 'custitem_enl_it_taxgroup', join: 'item'}); // GRUPO DE TRIBUTAÇÃO (AGAST)
					
					if(lineRec.getValue({name: 'custitem_avlr_ispiscofinsestimatedcred', join: 'item'})) // CRÉDITO DE PIS E COFINS POR ESTIMATIVA
						lineObj.itemDescriptor.isPisCofinsEstimatedCredit = true;
					
					if(lineRec.getValue({name: 'custitem_avlr_piscofinsrevenuetype', join: 'item'})) // TIPO DE RECEITA (PIS/COFINS)
						lineObj.itemDescriptor.piscofinsRevenueType = lineRec.getText({name: 'custitem_avlr_piscofinsrevenuetype', join: 'item'}).substr(0,2);
					
					lineObj.itemDescriptor.glAccountCode = getGLAccountFromItem(lineRec);
					
					
					if(_model == "01")					
					{
						//For Service Invoice(s)
						lineObj.itemDescriptor.issBehavior = getIssBehavior(recDetails.getValue({name: 'custentity_avlr_issbehavior', join: 'customer'})); // CONFIGURAÇÃO DE RETENÇÃO ISS
						
						if(lineRec.getValue({name: 'custitem_avlr_subjecttoirrfauto', join: 'item'})) //  IRRF AUTO RETIDO
							lineObj.itemDescriptor.subjectToIRRFAuto = true;
						
						if(lineRec.getValue({name: 'custitem_enl_codigodeservico', join: 'item'})) // CÓDIGO DE SERVIÇO (LC116)
							lineObj.itemDescriptor.hsCode = lineRec.getText({name: 'custitem_enl_codigodeservico', join: 'item'});
						
						if(lineRec.getValue({name: 'custitem_avlr_withlaborassignment', join: 'item'})) // CESSÃO DE MÃO-DE-OBRA
							lineObj.itemDescriptor.withLaborAssignment = true;
						
						if(lineRec.getValue({name: 'custitem_avlr_notsubjecttoinsswhenperson', join: 'item'})) // INSS RF/AR SEM PERMISSÃO DE CÁLCULO QDO PF
							lineObj.itemDescriptor.notSubjectToInssWhenPerson = true;
						
						if(lineRec.getValue({name: 'custitem_avlr_piscofinscreditnotallowed', join: 'item'})) // PERMITE APROPRIAR CRÉDITO DE PIS/COFINS
							lineObj.itemDescriptor.appropriatePISCOFINScredit = true;
						
						if(headerDetails.isBenefitsAbroad)
							lineObj.benefitsAbroad = true;
						
						// Conf. de Código de Serviço ao Item
						var itemRecordType = getItemType(lineRec.getValue({name: 'itemtype'}))
						var itemLoad = record.load({type: itemRecordType, id: lineRec.getValue({name: 'item'}), isDanamic: true});
						
						
						if(headerDetails.locations.establishment.address.cityId)
						{
							var serviceCodeOrigin = getServiceCode(headerDetails.locations.establishment.address.cityId, itemLoad);
							lineObj.itemDescriptor.serviceCodeOrigin = serviceCodeOrigin
						}
							
						if(headerDetails.locations.rendered.address.cityId)
						{
							var serviceCode = getServiceCode(headerDetails.locations.rendered.address.cityId, itemLoad)
							lineObj.itemDescriptor.serviceCode = serviceCode;
						}
						// End Conf. de Código de Serviço ao Item
						
						if(recDetails.getValue({name: 'custbody_enl_hascpom'}))
						{
							lineObj.services = {};
							lineObj.services.hasCpom = true;
						}
						
						var inssDeductionLine = lineRec.getValue({name: 'custcol_enl_line_inssdeduction'});
						inssDeduction = inssDeduction + inssDeductionLine;
						
						var irdeductionLine = lineRec.getValue({name: 'custcol_enl_line_irdeduction'});
						var publicyAgencyDeduction = lineRec.getValue({name: 'custcol_avlr_publicyagency_deduction'});
						var issdeductionLine = lineRec.getValue({name: 'custcol_enl_line_issdeduction'});
						
						
						lineObj.taxDeductions = {};
						
						if(issdeductionLine)
							lineObj.taxDeductions.iss = parseFloat(issdeductionLine); // number($double)
						
						if(irdeductionLine)
							lineObj.taxDeductions.irrfAuto = parseFloat(irdeductionLine); // number($double)
						
						if(publicyAgencyDeduction)
							lineObj.taxDeductions.transferAmount = parseFloat(publicyAgencyDeduction); // number($double)
						
						if(inssDeductionLine)
							lineObj.taxDeductions.inssBasisDiscount = parseFloat(inssDeductionLine); // number($double)	

						if(addressLocationObj && addressLocationObj.state && addressLocationObj.state == "DF" && _model == "01")
						{
							if(lineRec.getValue({name: 'custcol_avlr_info_adic_nfe'}))
								lineObj.lineAdditionalInfo = lineRec.getValue({name: 'custcol_avlr_info_adic_nfe'});
						}
					}
					else
					{
						//For Product Invoice(s)
						
						if(lineRec.getValue({name: 'unitstype', join: 'item'}))
							lineObj.itemDescriptor.unit = lineRec.getText({name: 'unitstype', join: 'item'}).substr(0,6);
						
						if(lineRec.getText({name: 'custitem_enl_ncmitem', join: 'item'}))
							lineObj.itemDescriptor.hsCode = lineRec.getText({name: 'custitem_enl_ncmitem', join: 'item'}); // NCM
						
						if(lineRec.getValue({name: 'custitem_avlr_nfci', join: 'item'})) // NÚMERO CONTROLE FCI
							lineObj.itemDescriptor.nFCI = lineRec.getValue({name: 'custitem_avlr_nfci', join: 'item'});
						
						var _ncmex = lineRec.getValue({name: 'custitem_avlr_ncmex', join: 'item'})
						// log.debug("_ncmex",_ncmex)
						// log.debug("isString",util.isString(_ncmex))
						if(_ncmex)
							lineObj.itemDescriptor.ex = _ncmex.toString().length < 2 ? pad(_ncmex.toString(),2) : _ncmex; // EX
						
						if(lineRec.getValue({name: 'custitem_avlr_ean', join: 'item'}))
							lineObj.itemDescriptor.cean = lineRec.getValue({name: 'custitem_avlr_ean', join: 'item'}); // EAN
						
						if(lineRec.getValue({name: 'custitem_enl_cest', join: 'item'}))
							lineObj.itemDescriptor.cest = lineRec.getValue({name: 'custitem_enl_cest', join: 'item'}); // CEST
						
						//log.debug('lineRecType', lineRecType);
						if(lineRec.getValue({name: 'custitem_avlr_isicmsstsubstitute', join: 'item'})) // ASSUME PAPEL DE SUBSTITUTO DO ICMS
							lineObj.itemDescriptor.isIcmsStSubstitute = true;
						
						if(lineRec.getValue({name: 'custitem_avlr_unittaxable', join: 'item'})) // Unidade de medida tributável
							lineObj.itemDescriptor.unitTaxable = lineRec.getValue({name: 'custitem_avlr_unittaxable', join: 'item'});
						
						if(lineRec.getValue({name: 'custitem_enl_taxorigin', join: 'item'})) // ORIGEM DA MERCADORIA
						{
							var sourceItem = parseInt(lineRec.getValue({name: 'custitem_enl_taxorigin', join: 'item'})); 
							lineObj.itemDescriptor.source = getSourceItem(sourceItem);
						}
						
						if(lineRec.getValue({name: 'custitem_enl_producttype', join: 'item'})) // TIPO DE PRODUTO
						{
							var productType = lineRec.getValue({name: 'custitem_enl_producttype', join: 'item'}); 
							lineObj.itemDescriptor.productType = getProductType(productType);
						}
						
						if(lineRec.getValue({name: 'custitem_avlr_iiextaxcode', join: 'item'})) // II EX
							lineObj.itemDescriptor.iiExTaxCode = parseInt(lineRec.getValue({name: 'custitem_avlr_iiextaxcode', join: 'item'})).toFixed(2);
						
						if(lineRec.getValue({name: 'custitem_avlr_manufacturerequivalent', join: 'item'})) // EQUIVALENTE A INDÚSTRIA
							lineObj.itemDescriptor.manufacturerEquivalent = true;
						
						if(lineRec.getValue({name: 'custitem_avlr_appipicreditwheningoing', join: 'item'})) // PERMITE APROPRIAR CRÉDITO DE IPI
							lineObj.itemDescriptor.appropriateIPIcreditWhenInGoing = true;
						
						if(lineRec.getValue({name: 'custitem_avlr_appicmscreditwheningoing', join: 'item'})) // PERMITE APROPRIAR CRÉDITO DE ICMS
							lineObj.itemDescriptor.appropriateICMScreditWhenInGoing = true;
						
						if(lineRec.getValue({name: 'custitem_avlr_usuapprpiscofinscred', join: 'item'})) // ?? PERMITE APROPRIAR CRÉDITO DE PIS E COFINS
							lineObj.itemDescriptor.usuallyAppropriatePISCOFINSCredit = true;
						
						if(lineRec.getValue({name: 'custitem_avlr_comextaxunitfactor', join: 'item'})) // COMEX FATOR DE CONVERSÃO
							lineObj.itemDescriptor.comexTaxUnitFactor = lineRec.getValue({name: 'custitem_avlr_comextaxunitfactor', join: 'item'});
						
						if(lineRec.getValue({name: 'custitem_avlr_uniticmsstfactor', join: 'item'})) // ICMS-ST-PAUTA FATOR DE CONVERSÃO
							lineObj.itemDescriptor.unitIcmsStfactor = lineRec.getValue({name: 'custitem_avlr_uniticmsstfactor', join: 'item'});
						
						if(lineRec.getValue({name: 'custitem_avlr_ignoreothcostimpipibase', join: 'item'})) // CRÉDITO DE PIS E COFINS POR ESTIMATIVA
							lineObj.itemDescriptor.ignoreOtherCostOnImportationIpiBase = true;
						
						// NT2020.005
						var _cbar = lineRec.getValue({name: 'custitem_avlr_cbar', join: 'item'});
						if(_cbar)
							lineObj.itemDescriptor.cBar = _cbar;
						
						lineObj.goods = {};

						// to be computed for vendorbill
//						if(refAccessKey)
//							lineObj.goods.returnedPercentageAmount = parsefloat(recDetails.getValue(returnPct));
						
						//lineObj.compInfo = lineRec.getValue({name: 'item',}); //field missing in account & .net Code
						if(recDetails.recordType == "vendorbill" || recDetails.recordType == "vendorcredit")
						{
							if(lineRec.getValue({name: "custcol_enl_line_idnumber"}))
							{
								lineObj.goods.importDetails = []
								lineObj.goods.importDetails.push(getImportDeclarations(lineRec, recDetails)); 
							}
						}

						// Em casos de devoluções, informar a percentagem do item devolvido.
//						var origQty = lineRec.getValue({name: 'custcol_enl_originalqty'});
//						origQty = (origQty > 0) ? origQty : 0;
//						
//						var returnPct;
//				      	if(origQty > 0) 
//						{
//				      		returnPct = lineRec.getValue({name: 'quantity'});
//				      		returnPct = (returnPct / origQty).toFixed(2);
//			          		lineObj.returnPct = returnPct;
//			    		}
						
						if (parseFloat(lineRec.getValue({name: 'custcol_enl_qtrib'})) > 0)
							lineObj.taxableQtUnit = parseFloat(lineRec.getValue({name: 'custcol_enl_qtrib'})); 


						var lineInvtDetailRecId = lineRec.getValue({name: "internalid", join: "inventoryDetail"});
						var isLotNumbered = lineRec.getValue({name: 'islotitem', join: 'item'});
//						log.debug('islotitem', isLotNumbered);
//						log.debug('batchNumDetail', batchNumDetail);

						if(batchNumDetail && lineInvtDetailRecId && isLotNumbered)
	        			{
	    	  				//lineObj.trace = [];
	    	  				var tempArr = [];
	    	  				for(var j=0; j < inventoryDetailsList.length; j++)
	    	  				{
	    	  					var inventoryDetailsRec = inventoryDetailsList[j];
	    	  					var inventoryDetailsId = inventoryDetailsRec.getValue({name: "internalid"});

	    	  					if(lineInvtDetailRecId == inventoryDetailsId)
	    	  					{
	    	  						var inventDetails = {};
	    	  						inventDetails.internalId = inventoryDetailsId;
	    	  						var expiryDateStr = inventoryDetailsRec.getValue({name: "expirationdate"}); 
									  //log.debug('expiryDateStr', util.isDate(expiryDateStr))
									if(expiryDateStr)
									{
										var expiryDate = format.parse({value: expiryDateStr, type: format.Type.DATE})
										//log.debug('expiryDate', util.isDate(expiryDate))
										
										var expiryDateFmt = expiryDate.getFullYear() + '-' + pad(parseInt(expiryDate.getMonth() + 1), 2) + '-' + pad(expiryDate.getDate(), 2);
										inventDetails.expirationDate = expiryDateFmt; 
									}
	    	  						
	    	  						var productionDateStr = inventoryDetailsRec.getValue({name: "custitemnumber_enl_productiondate", join: "inventoryNumber"});
	    	  						if(productionDateStr)
    	  							{
	    	  							var productionDate = format.parse({value: productionDateStr, type: format.Type.DATE})
	    	  							var productionDateFmt = productionDate.getFullYear() + '-' + pad(parseInt(productionDate.getMonth() + 1), 2) + '-' + pad(productionDate.getDate(), 2);
	    	  							
	    	  							inventDetails.manufactureDate = productionDateFmt;
    	  							}
	    	  						
	    	  						inventDetails.lotAmount = parseInt(inventoryDetailsRec.getValue({name: "quantity"}));
	    	  						inventDetails.lotNumber = inventoryDetailsRec.getText({name: "inventorynumber"});
	    	  						
	    	  						// NT2020.005
	    							var _aggregationCode = lineRec.getValue({name: 'custitem_avlr_aggregationcode', join: 'item'});
	    							if(_aggregationCode)
	    								inventDetails.aggregationCode = _aggregationCode;
	    							
	    	  						tempArr.push(inventDetails);
	    	  					}
	    	  				}
//	    	  				log.debug('temparr(length) - ' + tempArr.length, JSON.stringify(tempArr));
//	    	  				log.debug('temparr', JSON.stringify(tempArr));
	    	  				
	    	  				if(tempArr.length > 0) 
	    	  					lineObj.goods.trace = tempArr;
	        			}
						
						var _partnerStSubstitute = lineRec.getValue({name: 'custcol_avlr_partnerstsubstitute'});
						lineObj.goods.entityIcmsStSubstitute = getEntityIcmsStSubstitute(_partnerStSubstitute);
						
						var supplierSituation = lineRec.getValue({name: 'custcol_avlr_supplier_situation'});
						if(supplierSituation)
						{
							switch (supplierSituation) 
							{
								case '1': // Calcular IPI e ICMS-ST
									lineObj.goods.subjectToIPIonInbound = true;
									//lineObj.isEntityIcmsStSubstituteOnInbound = true;
									break;
								case '2': // Equiparado Industria IPI
									lineObj.goods.subjectToIPIonInbound = true;
									//lineObj.isEntityIcmsStSubstituteOnInbound = false;
									break;
								case '3': // Substituto ICMS
									lineObj.goods.subjectToIPIonInbound = false;
									// lineObj.isEntityIcmsStSubstituteOnInbound = true;
									break;
								default:
									lineObj.goods.subjectToIPIonInbound = false;
									// lineObj.isEntityIcmsStSubstituteOnInbound = false;
								break;
							}
						}

						var refAccessKey = lineRec.getValue({name: "custcol_enl_ref_chaveacesso"});
				    	if(refAccessKey)
				    	{
				    		var _index = arrRefAccessKey.map(function(e) {
									return e.refNFe == refAccessKey
								}).indexOf(true);
				    		
				    		if(_index == -1)
							{
				    			var _obj = {};
				    			_obj.type = 'refNFe';
				    			_obj.refNFe = refAccessKey
				    			arrRefAccessKey.push(_obj)
							}
				    	}
						
				    	var _unTaxedOtherCostAmount = lineRec.getValue({name: 'custcol_avlr_untaxedothercostamount'});
						if(_unTaxedOtherCostAmount)
							lineObj.unTaxedOtherCostAmount = _unTaxedOtherCostAmount;
						
						if(lineRec.getValue({name: 'custcol_avlr_info_adic_nfe'}))
							lineObj.lineAdditionalInfo = lineRec.getValue({name: 'custcol_avlr_info_adic_nfe'});

						if(['salesorder', 'invoice', 'creditmemo', 'returnauthorization', 'transferorder'].indexOf(recDetails.recordType) > -1)
						{
							var _itemPurchaseCost = lineRec.getValue({name: 'custcol_avlr_itempurchasecost'});
							if(_itemPurchaseCost)
							{
								lineObj.taxDeductions = {};
								lineObj.taxDeductions.itemPurchaseCost = parseFloat(_itemPurchaseCost);

								lineObj.itemDescriptor.notSubjectToIcmsSt = true;
							}
						}
						
						
					} // end goods
					
					lineObj.useType = getUseType(recDetails.getValue({name: 'custrecord_enl_ot_usetype', join: 'CUSTBODY_ENL_OPERATIONTYPEID'})); 
					
					if(lineRec.getValue({name: 'custcol_avlr_purposeofuse'}))
						lineObj.usagePurpose = lineRec.getValue({name: 'custcol_avlr_purposeofuse'});
					
					lineObj.operationType = recDetails.getValue({name: 'custrecord_enl_ot_altname', join: 'CUSTBODY_ENL_OPERATIONTYPEID'});
					
					if(lineObj.operationType == "amountComplementary")
					{
						lineObj.numberOfItems = 0;
						lineObj.lineAmount = parseFloat(Math.abs(lineRec.getValue({name: 'amount'})));
					}
					else
					{
						var _quantity = parseFloat(Math.abs(lineRec.getValue({name: 'quantity'})));
						// log.debug("_quantity", _quantity);
						var _rate = parseFloat(Math.abs(lineRec.getValue({name: 'rate'})))
						// log.debug("_rate", _rate);
						var _amount = parseFloat(Math.abs(lineRec.getValue({name: 'amount'})))
						// log.debug("_amount", _amount);
						var _taxamount = parseFloat(Math.abs(lineRec.getValue({name: 'taxamount'})))
						
						var _unit = lineRec.getValue({name: 'unit'});
						// log.debug("_unit", _unit);
						var _quantityuom = parseFloat(Math.abs(lineRec.getValue({name: 'quantityuom'})));
						// log.debug("_quantityuom", _quantityuom);


						if(lineRecType == "transferorder" && _unit && _quantityuom && (_quantity != _quantityuom))
						{
							lineObj.lineAmount = _amount;
							lineObj.lineUnitPrice = _amount / _quantityuom;
							lineObj.numberOfItems = _quantityuom
							
							if(headerDetails.enableUnitsOfMeasure)
								lineObj.itemDescriptor.unit = _unit.substr(0,6);	
						}
						else
						{
							lineObj.lineAmount = _rate * _quantity;
							lineObj.lineUnitPrice = _rate;	
							lineObj.numberOfItems = _quantity
						}
					}

					var lineDiscount = lineRec.getValue({name: 'custcol_enl_discamount'}); 
					//if(lineDiscount)
						lineObj.lineTaxedDiscount = lineDiscount ? parseFloat(lineDiscount) : 0;
					
					if(lineRec.getValue({name: 'custcol_enl_line_freightamount'}))
						lineObj.freightAmount = parseFloat(lineRec.getValue({name: 'custcol_enl_line_freightamount'}));
						
					if(lineRec.getValue({name: 'custcol_enl_line_insuranceamount'}))
						lineObj.insuranceAmount = parseFloat(lineRec.getValue({name: 'custcol_enl_line_insuranceamount'}));
							
					if(lineRec.getValue({name: 'custcol_enl_line_othersamount'}))
						lineObj.otherCostAmount = parseFloat(lineRec.getValue({name: 'custcol_enl_line_othersamount'}));
							
					lineObj.overwrite = "no"; 
					
					var orderNumber = lineRec.getValue({name: 'custcol_enl_externalorder'});
					if(orderNumber)
						lineObj.orderNumber = orderNumber;
					
					var orderItemNumber = lineRec.getValue({name: 'custcol_eur_externallinenum'});
					if(orderItemNumber)
						lineObj.orderItemNumber = orderItemNumber;
					
				
					
					lines.push(lineObj);
					
				// }// if(lineRecId == recId && lineRecType == recType)
				
			}// end for

			if(arrRefAccessKey.length)
				headerDetails.invoicesRefs = arrRefAccessKey;
			
//			log.debug('lines', JSON.stringify(lines));
			return lines;
		}
		catch(createLineRequestErr)
		{
	        throw createLineRequestErr; 
		}
	}
	
	function roundRfb(value) 
	{
		var val = value;
		var total = Math.floor(value * 100) / 100;

		if (val != total) 
		{
			var result = val - total;
			var num = 0.0055;
			var n = num.toFixed(4);

			if (result > 0.0050 && result < 0.0055) 
				return parseFloat(val.toFixed(2) - 0.01).toFixed(2);
			else
				return val.toFixed(2);
		}
		else
			return value;
	}

	function getImportDeclarations(lineRec, recDetails)
	{
		try
		{
			var importId = lineRec.getValue({name: "custcol_enl_line_idnumber"});
			var impRec = record.load({type: 'customrecord_enl_importdeclaration',id: importId, isDynamic: true})
			
			var retVal = {}; 
			retVal.diNumber = impRec.getValue({fieldId: 'name'});
			
			var registerDateDIStr = impRec.getValue({fieldId: 'custrecord_enl_id_date'});
			if(registerDateDIStr)
				retVal.registerDateDI = registerDateDIStr.toISOString();
			
			retVal.clearanceSite = impRec.getValue({fieldId: 'custrecord_enl_id_landingport'});
			retVal.clearanceState = impRec.getText({fieldId: 'custrecord_enl_id_landingstate'}); 
			retVal.intermediateType = impRec.getValue({fieldId: 'custrecord_enl_id_tradetype'});
			retVal.transportDIType = impRec.getValue({fieldId: 'custrecord_enl_id_freightway'});

			if(recDetails.recordType == 'vendorbill' || recDetails.recordType == 'vendorcredit')
				retVal.exporterCode = 'F' + (recDetails.getValue({name: 'entityNumber', join: 'vendor'}) || recDetails.getValue({name: 'entity'}));
			else
				retVal.exporterCode = 'C' + (recDetails.getValue({name: 'entityNumber', join: 'customer'}) || recDetails.getValue({name: 'entity'}));
			
			
			var clearanceDateStr = impRec.getValue({fieldId: 'custrecord_enl_id_landingdate'});
			if(clearanceDateStr)
				retVal.clearanceDate = clearanceDateStr.toISOString();
			
			var buyerFederalTaxID = impRec.getValue({fieldId: 'custrecord_enl_id_thirdpartytaxid'});
			if(buyerFederalTaxID)
				retVal.buyerFederalTaxID = removeSpecialCharacter(buyerFederalTaxID)
			
			var buyerState = impRec.getText({fieldId: 'custrecord_enl_thidpartystate'});
			if(buyerState)
				retVal.buyerState = buyerState
				
			var afrmmValue = impRec.getText({fieldId: 'custrecord_avlr_id_afrmmvalue'});
			if(afrmmValue)
				retVal.afrmmValue = format.parse({value: afrmmValue, type: format.Type.FLOAT});
				
			var customsValue = impRec.getText({fieldId: 'custrecord_avlr_id_customsvalue'});
			if(customsValue)
				retVal.customsValue = parseFloat(customsValue);
				
			var adicaoNumber = lineRec.getValue({name: 'custcol_enl_adicaonumber'});
			var adicaoLine = lineRec.getValue({name: 'custcol_enl_adicaoline'});
			
			if(adicaoNumber || adicaoLine)
			{
				retVal.adi = [];
				
				var adiObj = {};
					adiObj.addNumber = adicaoNumber;
					adiObj.sequentialNumber = adicaoLine;
					adiObj.manufacturerCode = retVal.exporterCode;
				retVal.adi.push(adiObj);
			}
			else
			{
				var count = impRec.getLineCount({sublistId: 'recmachcustrecord_avlr_adi_relation_addition'})
				if(count)
				{
					retVal.adi = [];
					for (var int = 0; int < count; int++) 
					{
						
						var adiObj = {};
						adiObj.addNumber = impRec.getSublistValue({
												sublistId: 'recmachcustrecord_avlr_adi_relation_addition',
												fieldId: 'custrecord_avlr_adi_addnumber',
												line: int
											});
						
						adiObj.sequentialNumber = impRec.getSublistValue({
												sublistId: 'recmachcustrecord_avlr_adi_relation_addition',
												fieldId: 'custrecord_avlr_adi_sequentialnumber',
												line: int
											});
						
						adiObj.manufacturerCode = impRec.getSublistValue({
												sublistId: 'recmachcustrecord_avlr_adi_relation_addition',
												fieldId: 'custrecord_avlr_adi_manufacturercode',
												line: int
											});
						
						adiObj.adiDiscount = (impRec.getSublistValue({
												sublistId: 'recmachcustrecord_avlr_adi_relation_addition',
												fieldId: 'custrecord_avlr_adi_adidiscount',
												line: int
											}) || 0);
						
						adiObj.drawbackNumber = impRec.getSublistValue({
												sublistId: 'recmachcustrecord_avlr_adi_relation_addition',
												fieldId: 'custrecord_avlr_adi_drawbacknumber',
												line: int
											});
						
						retVal.adi.push(adiObj);
					}
				}
			}// end else
			
			return retVal;
		}
		catch(getImportDeclarationsErr)
		{
	        throw getImportDeclarationsErr; 
		}
	}
	
	
	function fetchEntityAddress(recDetails)
	{
		try
		{
			var addressObj = {};
			
			var recordType = recDetails.recordType;
			//todo check with marcel . why vendorreturnauthorization is used ? // need to add to MR script to fetch these document types
			
			var recType = 0;
			var joinType = (recType == 0) ? 'billingaddress' : 'shippingaddress';
			
//			log.debug('joinType', joinType);
//	    	log.debug('country', recDetails.getValue({name: 'countrycode', join: joinType}));
	    	
	    	var countryDetails = getCountryList(recDetails.getValue({name: 'countrycode', join: joinType}));
//	    	log.debug('countryDetails', JSON.stringify(countryDetails));
	    	//countryDetails.country = countryDetails.countryISOCode;
	    	
	    	if(countryDetails.name != 1058) // BR
	    	{
				addressObj.neighborhood = 'Exterior';
				addressObj.zipcode = '00000000';
				addressObj.cityCode = '9999999';
				addressObj.cityName = 'Exterior';
				addressObj.FederalTaxId = '99999999999999';
				addressObj.number = '0';
				addressObj.state = 'EX';
	    	}
	    	else
	    	{
				addressObj.neighborhood = recDetails.getValue({name: 'address3', join: joinType});
				addressObj.zipcode = recDetails.getValue({name: 'zip', join: joinType});
				addressObj.cityCode = fetchCityCode(recDetails.getValue({name: 'custrecord_enl_city', join: joinType}));
				addressObj.cityId = recDetails.getValue({name: 'custrecord_enl_city', join: joinType})
				addressObj.cityName = recDetails.getText({name: 'custrecord_enl_city', join: joinType});
		    	var complement = recDetails.getValue({name: 'address2', join: joinType});
		    	addressObj.complement = (complement != null && complement.length > 0) ? complement : '0';
		    	addressObj.number = recDetails.getValue({name: 'custrecord_enl_numero', join: joinType}) || '0';

		    	if(recDetails.getText({name: 'custrecord_enl_uf', join: joinType}))
		    		addressObj.state = recDetails.getText({name: 'custrecord_enl_uf', join: joinType});
	    	}

			addressObj.street = recDetails.getValue({name: 'address1', join: joinType});
	    	addressObj.countryCode = countryDetails.name; 
	    	addressObj.country = countryDetails.countryISOCode;
	    	
//	    	log.debug('addressObj', JSON.stringify(addressObj));

	    	return addressObj;

		}
		catch(fetchEntityAddressErr)
		{
	        throw fetchEntityAddressErr; 
		}
	}
	
	function fetchFreightType(freightType)
	{
		switch (freightType)
        {
            case "1":
            	return "CIF";
            case "2":
            	return "FOB";
            case "3":
            	return "Thirdparty";
            case "4":
            	return "SenderVehicle";
            case "5":
            	return "ReceiverVehicle";
            case "10":
            	return "FreeShipping";
            default:
            	return "CIF";
        }
	}
	
	function fetchPaymentInfo(recDetails)
	{
		try
		{
			var paymentTransactionSearch = search.load({id: 'customsearch_avlr_paymenttransaction'});	
		}
		catch(fetchPaymentInfoErr)
		{
			var paymentTransactionSearch = search.create({
				type: "customrecord_enl_paytransaction",
				title: 'AVLR eInvoice - Payment Transaction',
				id: 'customsearch_avlr_paymenttransaction',
				isPublic: true,
				columns:
				[
					search.createColumn({name: "custrecord_enl_value", label: "Valor"}),
					search.createColumn({name: "custrecord_enl_mode", label: "Modo"}),
					search.createColumn({name: "custrecord_enl_tefintegration", label: "Integrado ao TEF"}),
					search.createColumn({name: "custrecord_enl_brand", label: "Bandeira"}),
					search.createColumn({name: "custrecord_enl_authcode", label: "Código de Autorização"}),
					search.createColumn({name: "custrecord_enl_opcnpj", label: "CNPJ da Operadora"}),
					search.createColumn({name: "custrecord_avlr_modedescription"})
				]
			})
			
			log.debug('AVLR eInvoice - Payment Transaction', paymentTransactionSearch.save());
		}

		var paymentsInfo = [];
		var paymentTransactionResults = []
		
		paymentTransactionSearch.filters.push(search.createFilter({name: "custrecord_enl_salesorder", operator: 'anyof', values: recDetails.getValue('createdFrom')}));
		paymentTransactionSearch.run().each(function(result){ 
			paymentTransactionResults.push(result)
			return true;
		});

	
		var totalinvoice = parseFloat(recDetails.getValue('amount'));
		//log.debug('totalinvoice',totalinvoice);

		try 
		{
			var SALES_ORDER = record.load({type: record.Type.SALES_ORDER, id: recDetails.getValue('createdFrom')})
			var _subtotal = SALES_ORDER.getValue('subtotal');
			if(!util.isNumber(_subtotal))
				_subtotal = parseFloat(_subtotal)

			//log.debug('SALES_ORDER _subtotal', _subtotal);

			var factor = totalinvoice / _subtotal;
		} 
		catch (e) 
		{
			var factor = totalinvoice / 1;
		}

		factor = factor ? factor : 1;
		
		if(isNaN(factor)) 
			factor = 1;
		
		// log.debug('factor',factor);

		var paymentTotal = 0;

		for(var i = 0; i < paymentTransactionResults.length; i++)
		{
			var paymentInfo = {};
			
			var _value = paymentTransactionResults[i].getValue('custrecord_enl_value');
			if(_value)
				paymentInfo.value = avlrUtil.doRound((parseFloat(_value) * factor), 2);
			
			paymentInfo.mode = getMode(paymentTransactionResults[i].getValue('custrecord_enl_mode'));
			
			if(paymentTransactionResults[i].getValue('custrecord_avlr_modedescription'))
				paymentInfo.modeDescription = paymentTransactionResults[i].getValue('custrecord_avlr_modedescription');
			
			var _cardCnpj = recDetails.getValue({name: 'custbody_avlr_cardcnpj'});
			//log.debug("_cardCnpj", _cardCnpj);
			
			if(paymentInfo.mode == '99' && _cardCnpj)
			{
				var _cnpjcpf = recDetails.getValue({name: 'custentity_enl_cnpjcpf', join: 'CUSTBODY_AVLR_INTERMEDIARY_TRANSACTION'});
				if(_cnpjcpf)
					paymentInfo.cardCNPJ = removeSpecialCharacter(_cnpjcpf);
			}
			
			paymentInfo.cardTpIntegration = paymentTransactionResults[i].getValue('custrecord_enl_tefintegration') ? '1' : '2';
			
			if(paymentTransactionResults[i].getValue('custrecord_enl_brand'))
				paymentInfo.cardBrand = getCardBrand(paymentTransactionResults[i].getValue('custrecord_enl_brand'));
			
			if(paymentTransactionResults[i].getValue('custrecord_enl_authcode'))
				paymentInfo.cardAuthorization = paymentTransactionResults[i].getValue('custrecord_enl_authcode');
			
			if(paymentTransactionResults[i].getValue('custrecord_enl_opcnpj'))
				paymentInfo.opcnpj = paymentTransactionResults[i].getValue('custrecord_enl_opcnpj');

			if(paymentInfo.mode == "3" && !paymentInfo.brand)
				throw "Campo Bandeira obrigatório para a Forma de Pagamento: Cartão de Crédito";

			paymentTotal += parseFloat(paymentInfo.value);

			if(parseInt(i+1) == paymentTransactionResults.length && paymentTotal != parseFloat(totalinvoice))
			{
				var diff = parseFloat(totalinvoice) - paymentTotal;
				paymentInfo.value = parseFloat(paymentInfo.value) + parseFloat(diff);
			}
			
			paymentsInfo.push(paymentInfo);
		}
			
		return paymentsInfo;
	}

	function getCardBrand(params) 
	{
		switch(params)
		{
			case '1':
				return '01'; //# Visa
			case '2':
				return '02'; //# Mastercard
			case '3':
				return '03'; //# American Express
			case '4':
				return '04'; //# Sorocred
			case '5':
				return '05'; //# Diners Club
			case '6':
				return '06'; //# Elo
			case '7':
				return '07'; //# Hipercard
			case '8':
				return '08'; //# Aura
			case '9':
				return '09'; //# Cabal
			case '10':
				return '99'; //# Other
		}
	}

	function createJSONFile(type, arrayOfIds)
	{
		try
		{
			var begin = new Date().getTime();
			
			log.debug(arrayOfIds, 'Inside createJSONFile');
			var scriptObj = runtime.getCurrentScript();
			var remainingUsage = 0;
//			log.debug('runtimescript', scriptObj);
//			log.debug('Deployment Id: ' + scriptObj.deploymentId);
//			log.debug('Execution Context', runtime.executionContext);
			
			locationList = getLocations();
			carrierList = getCarrierList();
			accountList = fetchAccount();

			discAmount = 0.0;
			installmentEnabled = runtime.isFeatureInEffect({feature: 'INSTALLMENTS'});
			// var runtimeObj = runtime.getCurrentScript();
	    	batchNumDetail = scriptObj.getParameter({name: 'custscript_avlr_batchnumdetail'});

		    headerSearchResults = getHeaderSearchObj(type, arrayOfIds);
		    lineSearchResults = getLineSearchObj(type, arrayOfIds);

		    
		    if(headerSearchResults.length && installmentEnabled)
		    {
		    	installmentList = fetchInstallments(arrayOfIds);
		    }
		    
		    log.audit(arrayOfIds + ' Duration', 'search : ' + millisToMinutesAndSeconds(new Date().getTime() - begin));
		    
		    var i=0
		    for(; i < headerSearchResults.length; i++)
		    {
		    	try
		    	{
		    		var begin = new Date().getTime();
			    	var recDetails = headerSearchResults[i];
			    	
			    	var _documentNumber = recDetails.getValue({name: 'custbody_enl_fiscaldocnumber'}); 
					if(!_documentNumber)
						throw new Error(arrayOfIds + ' "NÚMERO DA NOTA FISCAL" não definido.');
						
						
			        var recId = recDetails.id;
			        var recType = recDetails.recordType;
			        log.audit(arrayOfIds + ' Processing Record', 'Record Id - ' + recId + ', Record Type - ' + recType);
			        
			        //var operationFinancialTran = recDetails.getValue({name: 'custrecord_enl_financialtran', join: 'CUSTBODY_ENL_OPERATIONTYPEID'});


			        var _fiscaldocstatus = recDetails.getValue({name: 'custbody_enl_fiscaldocstatus'});
			        
			        // Criado, Pendente, Processada, Autorizada pelo Sefaz
			        if(['2','3','5','6','7'].indexOf(_fiscaldocstatus) > -1)
		        	{
			        	var text = '';
			        	switch (_fiscaldocstatus) 
			        	{
							case '2':
								text = 'Pendente'
								break;
							case '3':
								text = 'Autorizada'
								break;
							case '5':
								text = 'Cancelada pelo Sefaz'
								break;
							case '6':
								text = 'Inutilizada pelo Sefaz'
							case '7':
								text = 'Erro'
								break;
						}
			        	
			        	log.error(arrayOfIds + ' Status Nota Fiscal', text +' não será reprocessada.');
			        	continue;
		        	}
	    			
					var lotNumberedTrans = false;
					//log.debug('LotNumbered Item Check', 'Checking Lot Numbered Items on Transactions');
					for(var int=0; int < lineSearchResults.length; int++)
					{
						var lineRec = lineSearchResults[int];
						//var lineRecId = lineRec.id;
						
						var itemtype = lineRec.getValue({name: 'itemtype'});
						if(["OthCharge","TaxItem","TaxGroup","GiftCert","Discount"].indexOf(itemtype) > -1)
							continue;

						var lineIsLotNumbered = lineRec.getValue({name: "islotitem", join: "item"});
						//log.debug('lineIsLotNumbered', lineIsLotNumbered);
						
						var lineInvtDetailRecId = lineRec.getValue({name: "internalid", join: "inventoryDetail"});
						//log.debug('lineInvtDetailRecId', lineInvtDetailRecId);
						
						discAmount += Number(lineRec.getValue({name: "custcol_enl_discamount"}));
						
						if(lineIsLotNumbered && lineInvtDetailRecId && !lotNumberedTrans)
							lotNumberedTrans = true;
					}
    			    
					if(lotNumberedTrans)
						inventoryDetailsList = fetchInventoryDetails(recId);
	    			
	          		
					var docTypeId = recDetails.getValue({name: 'custbody_enl_order_documenttype'});
	          		if(!docTypeId)
	    			{
	    				//log.audit(arrayOfIds + ' Fiscal Document Type Obj', docTypeId);
	    				throw new Error(arrayOfIds + " TIPO DE DOCUMENTO FISCAL não encontrado ou inativo.");
	    			}
	    			
					var _tranLoad = record.load({type: recType,	id: recId});
	          		
			        var headerDetails = createHeaderRequest(recDetails, _tranLoad);
			        var lineDetails = createLineRequest(recDetails, headerDetails, _tranLoad);
			        
			        if(!lineDetails.length)
			        	throw new Error(arrayOfIds + ' createLineRequest - Linha não encontrada.');
			        
			        var finalObj = {}; //JSON.stringify(headerDetails) + JSON.stringify(lineDetails);
			        finalObj.header = headerDetails;
			        finalObj.lines = lineDetails;
			        
			        log.debug(arrayOfIds + ' PayLoad Request', JSON.stringify(finalObj));

                	

					var _fiscalDocDate = _tranLoad.getValue({fieldId: 'custbody_enl_fiscaldocdate'});
					if(!_fiscalDocDate)
						_tranLoad.setValue({fieldId: 'custbody_enl_fiscaldocdate', value: new Date()});
                	
                	_tranLoad.setValue({fieldId: 'custbody_enl_fiscaldocnumber', value: headerDetails.fiscalDocumentNumber});

                	if(headerDetails.invoiceSerial)
                		_tranLoad.setValue({fieldId: 'custbody_enl_fiscaldocumentserie', value: String(headerDetails.invoiceSerial)});
                	else
                		_tranLoad.setValue({fieldId: 'custbody_enl_fiscaldocumentserie', value: headerDetails.rpsSerie});
                	
        			_tranLoad.setValue({fieldId: 'custbody_avlr_document_code', value: headerDetails.documentCode});
    				_tranLoad.setValue({fieldId: 'custbody_enl_accesskey', value: headerDetails.invoiceAccessKey || headerDetails.fiscalDocumentNumber});

                	
                	log.audit(arrayOfIds + ' Duration', 'create JSON : ' + millisToMinutesAndSeconds(new Date().getTime() - begin));
                	
                	var begin = new Date().getTime();
                	//Make outbound calls and update customrecord with status
                	makeOutBoundCall(recDetails, finalObj, _tranLoad);

                	log.audit(arrayOfIds + ' Duration', 'makeOutBoundCall : ' + millisToMinutesAndSeconds(new Date().getTime() - begin));
                	
                	remainingUsage = scriptObj.getRemainingUsage();
                	log.audit(arrayOfIds + ' Remaining governance units: ', remainingUsage);
                	
		    	}
		    	catch(processErr)
		    	{
					// {"error" : {"code" : "ERROR AvaTAxBR", "message" : "{\"type\":\"error.SuiteScriptError\",\"name\":\"ERROR AvaTAxBR\",\"message\":\"SUBSIDIÁRIA - Campo \\"Client Id\\" não está definido.\",\"stack\":[\"createError(N/error)\",\"getToken(/SuiteBundles/Bundle 400257/Lib/AVLR_EasyTalk_RL.js:121)\",\"doPost(/SuiteBundles/Bundle 400257/Lib/AVLR_EasyTalk_RL.js:61)\",\"createError(N/error)\"],\"cause\":{\"name\":\"ERROR AvaTAxBR\",\"message\":\"SUBSIDIÁRIA - Campo \\"Client Id\\" não está definido.\",\"notifyOff\":false},\"id\":\"\",\"notifyOff\":false,\"userFacing\":true}"}}
					log.error(arrayOfIds + " Error in creating JSON request", JSON.stringify(processErr));
					log.error(arrayOfIds + " Error in creating JSON request", processErr);
		    		
					if(processErr.name && processErr.name != "RCRD_HAS_BEEN_CHANGED")
					{	
		    			try 
						{
		    				if(processErr.name != "SSS_USAGE_LIMIT_EXCEEDED")
		    					record.submitFields({
		    						type: recType,
		    						id: recId,
		    						values: {
		    							'custbody_enl_messagespl': JSON.stringify(processErr),
		    							'custbody_enl_fiscaldocstatus': 7 // Error
		    						}
		    					});
						}
		    			catch (e) 
						{
							// TODO: handle exception
						}
					}
		    	}
		    
		    }// end for
		

		}
		catch(createJSONFileErr)
		{
			 throw createJSONFileErr;
		}
	}
	
	function getUseType(useTypeId)
    {
        switch(useTypeId)
        {
            case "1":
                return "use or consumption";
            case "2":
                return "resale";
            case "3":
                return "agricultural production";
            case "4":
                return "production";
            case "5":
                return "fixed assets";
            case "6":
                return "notApplicable";
            default:
                return "";
        }
    }
	
	function makeOutBoundCall(recDetails, payLoad, transactionLoad)
	{
		try
		{
			const TOBEPROCESSED = 1, PENDING = 2, PROCESSED = 3, ERROR = 4, REPROCESS = 5, NOTREQUIRED = 6;
        	var responseFlag, responseBody, responseCode;
    		var regex = /\/\/$/g;
    		var subst = '';
    		var retryMessage = '';

			var companyId = recDetails.getValue({name: 'custrecord_enl_companyid', join: 'subsidiary'});
			var companyLocation = recDetails.getValue({name: 'custrecord_enl_fiscalestablishmentid', join: 'location'});
			var urlSwFiscal = recDetails.getValue({name: 'custrecord_enl_urlswfiscal', join: 'subsidiary'});
			
		
    		responseBody = null; responseCode = 0, retryMessage = '';
        		
    		var finalUrl = urlSwFiscal;
    		finalUrl = finalUrl.replace(regex, subst);
   		
    		finalUrl += '/v3/transactions';
    		finalUrl = finalUrl.substr(0, 8).concat(finalUrl.substr(8).replace('//', '/'));
    		
        	log.debug(recDetails.id + ' makeOutBoundCall - finalUrl', finalUrl);
        	
    		var getResult = getHeaderRequest(recDetails.getValue({name: 'subsidiary'}));
    		getResult.header['Avalara-Location-Code'] = companyLocation // custrecord_enl_fiscalestablishmentid
    		getResult.header['Avalara-Company-Id'] = companyId
    			
//        	log.debug('getResult', JSON.stringify(getResult));
    		
    		
    		//----------------------------------------------------------
			var scriptObj = runtime.getCurrentScript();
			var _folderId = scriptObj.getParameter({name: 'custscript_avlr_payloadfolder'});
					
			//log.debug('Script parameter : ', _folderId);
			
			var payLoadRequestFileObj = file.create({
				name: 'eInvoiceRequest'+recDetails.id+'.json',
				fileType: file.Type.JSON,
				contents: JSON.stringify(payLoad),
				encoding: file.Encoding.WINDOWS_1252,
				folder: _folderId,
				isOnline: true
			})
			var payLoadRequestSave = payLoadRequestFileObj.save();
//					log.debug('fileObj', payLoadRequestSave);
			
			var id = record.attach({
					record: {
						type: 'file',
						id: payLoadRequestSave
					},
					to: {
						type: recDetails.recordType,
						id: recDetails.id
					}
				});
			//----------------------------------------------------------
        	var requestObj = https.request({
        		method: https.Method.POST,
        		body: JSON.stringify(payLoad),
        	    url: finalUrl,
        	    headers: getResult.header
        	});
        	
        	responseCode = requestObj.code;
        	log.debug(recDetails.id + ' responseCode', responseCode);
        	responseBody = requestObj.body;
        	log.debug(recDetails.id + ' responseBody', responseBody);

        	if(responseCode == 200)
        	{
        		//----------------------------------------------------------
				var payLoadResponseFileObj = file.create({
					name: 'eInvoiceResponse'+recDetails.id+'.json',
					fileType: file.Type.JSON,
					contents: responseBody,
					encoding: file.Encoding.WINDOWS_1252,
					folder: _folderId,
					isOnline: true
				})
				var payLoadResponseSave = payLoadResponseFileObj.save();
				
				var id = record.attach({
					record: {
						type: 'file',
						id: payLoadResponseSave
					},
					to: {
						type: recDetails.recordType,
						id: recDetails.id
					}
				});
				//----------------------------------------------------------
        	}
            
            // Update custom record
        	var respCode = (responseCode == 200) ? PROCESSED : ERROR;
        	if(respCode == PROCESSED)
        		respBody = '';
        	else
        		var respBody = (responseBody != null) ? "MENSAGEM SW FISCAL : "+responseBody : (retryMessage != null && retryMessage.length > 0) ? retryMessage : '';


	        
	        var tranStatus = (respCode == ERROR) ? 7 : 2; // Error : Pendente
	      
			transactionLoad.setValue({fieldId: 'custbody_enl_fiscaldocstatus', value: tranStatus});
			transactionLoad.setValue({fieldId: 'custbody_enl_messagespl', value: respBody}); // Created

			tranObjId = transactionLoad.save({
					enableSourcing: true,
					ignoreMandatoryFields: true
				});
    				
			log.debug(recDetails.id + ' Update transaction information', tranObjId);     		
		}
		catch(makeOutBoundCallErr)
		{
			throw makeOutBoundCallErr; 
		}
	}
	
	function getHeaderRequest(subsidiaryId) 
	{
		var boby = {}
		boby.executionContext = runtime.executionContext;
		//log.debug('executionContext', runtime.executionContext);
		boby.subsidiaryId = subsidiaryId
		
		var headerObj = {};
			headerObj['Content-Type'] = 'application/json';
		
		var response = https.requestRestlet({
				headers: headerObj,
				scriptId: 'customscript_avlr_easytalk_rl',
				deploymentId: 'customdeploy_avlr_easytalk_rl',
				method: 'POST',
				body: JSON.stringify(boby)
			});
		
		//log.debug('Get Token', response);
		if(response.code != 200)
		{
			//log.debug(response.code, response.body);
			throw response.body;
		}
		else
		{
			response = JSON.parse(response.body);
			
			var _header = {};
			_header['Authorization'] = 'Bearer ' + response.token;
			_header['Content-Type'] = 'application/json';
			
			return {header: _header};
		}
	}
	
	function getCountryList(countryId)
	{
	    // var countryList = [];
		var tempObj;
	    try 
	    {
			var countryCodeSearch = search.load({id: 'customsearch_avlr_countrycode'});		
	    } 
	    catch (getCountryListErr) 
	    {
			var tempObj = null;
			var countryCodeSearch = search.create({
				type: "customrecord_enl_countrycode",
				title: 'AVLR eInvoice - Country Code',
				id: 'customsearch_avlr_countrycode',
				isPublic: true,
				filters: [["isinactive","is","F"]],
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
			})
			
			log.debug('getCountryList', countryCodeSearch.save());
		}
		
		//["custrecord_enl_shortcode", "is", country]
		countryCodeSearch.filters.push(search.createFilter({name: 'custrecord_enl_shortcode', operator: 'is', values: countryId}));
		countryCodeSearch.run().each(function(result){
			
			tempObj = {
					id: result.id,
					name: result.getValue("name"),
					countryShortCode: result.getValue('custrecord_enl_shortcode'),
					countryCode: result.getValue('custrecord_enl_countrycode'),
					isoCode: result.getValue('custrecord_enl_iso3361')
				};

			// countryList.push(tempObj);
			return true;
		});

		return tempObj;
	}
	
	function getCityList() 
	{
	    try 
	    {
			var citiesSearchObj = search.load({id: 'customsearch_avlr_cities'});	
		} 
	    catch (getCityListErr) 
	    {
			var citiesSearchObj = search.create({
				type: "customrecord_enl_cities",
				title: 'AVLR eInvoice - Cities',
				id: 'customsearch_avlr_cities',
				isPublic: true,
				filters: [["isinactive", "is", "F"]],
				columns: [
					search.createColumn({
						name: "name",
						sort: search.Sort.ASC,
						label: "Name",
					}),
					search.createColumn({
						name: "custrecord_enl_ibgecode",
						label: "Código IBGE",
					}),
					search.createColumn({
						name: "custrecord_enl_citystate",
						label: "Estado",
					}),
				],
			})
			
			log.debug('AVLR - Cities', citiesSearchObj.save());
	    }
		
		var cityList = [];
		var customrecord_enl_citiesSearchObj = citiesSearchObj.runPaged();
		customrecord_enl_citiesSearchObj.pageRanges.forEach(function(pageRange){
			
			var mayPage = customrecord_enl_citiesSearchObj.fetch({index: pageRange.index})
			
			mayPage.data.forEach(function(result){
				
				cityList.push(result)
			   
			});
		});
		
		return cityList;
	}
	
	function fetchLocationAddress(locationId)
	{
		var retObj = {};
	
		try
		{
			for(var i=0; locationList != null && i < locationList.length; i++)
			{
				var locationDetails = locationList[i];
				if(locationDetails.id == locationId)
				{
					retObj.street = locationDetails.getValue('address1');
					retObj.number = locationDetails.getValue({name: 'custrecord_enl_numero', join: 'address'});
					retObj.neighborhood = locationDetails.getValue('address3');
					retObj.cityName = locationDetails.getText({name: 'custrecord_enl_city', join: 'address'});
					var complement = locationDetails.getValue('address2');
					retObj.complement = (complement != null && complement.length > 0) ? complement : '0';
					retObj.cityCode = fetchCityCode(locationDetails.getValue({name: 'custrecord_enl_city', join: 'address'}));
					retObj.cityId = locationDetails.getValue({name: 'custrecord_enl_city', join: 'address'})
					retObj.state = locationDetails.getText({name: 'custrecord_enl_uf', join: 'address'});
					retObj.zipcode = locationDetails.getValue('zip');
		          	var countryDetails = getCountryList(locationDetails.getValue({name: 'country'}));
		          	retObj.countryCode = countryDetails.name; 
		          	retObj.country = countryDetails.countryISOCode;
		          	break;
				}
			}
			return retObj;
		}
		catch(fetchLocationAddressErr)
		{
	        throw fetchLocationAddressErr; 
		}
	}

	function getLocations()
	{
		try
		{
			var locationSearchObj = search.load({id: 'customsearch_avlr_location'});
		}
		catch(getLocationsErr)
		{
			var locationSearchObj = search.create({
				type: "location",
				title: 'AVLR eInvoice - Location',
				id: 'customsearch_avlr_location',
				isPublic: true,
				filters:
				[
					["isinactive","is","F"]
				],
				columns:
				[
					search.createColumn({name: "address1", label: "Address 1"}),
					search.createColumn({name: "address2", label: "Address 2"}),
					search.createColumn({name: "address3", label: "Address 3"}),
					search.createColumn({name: "country", label: "Country"}),
					search.createColumn({name: "name",sort: search.Sort.ASC,label: "Name"}),
					search.createColumn({name: "state", label: "State/Province"}),
					search.createColumn({name: "zip", label: "Zip"}),
					search.createColumn({name: "custrecord_enl_city", join: "address", label: "Cidade"}),
					search.createColumn({name: "custrecord_enl_numero", join: "address", label: "Número"}),
					search.createColumn({name: "custrecord_enl_uf", join: "address", label: "UF"}),
					search.createColumn({name: "custrecord_enl_fiscalestablishmentid", label: "Establishment Id"}),
					search.createColumn({name: "custrecord_enl_locationcnpj", label: "Location CNPJ"}),
					search.createColumn({name: "custrecord_enl_locationienum", label: "IE Num"}),
					search.createColumn({name: "custrecord_enl_locationccmnum", label: "CCMN Num"})
				]
			});
			
			log.debug('AVLR eInvoice - Location', locationSearchObj.save());
		}
		
		var _arr = []
		locationSearchObj.run().each(function(result){ 
			_arr.push(result)
			return true;
		});

		return _arr;
	}

	function fetchEntityObj(entityId, details)
	{
		try
		{
			var retObj = {};
			var _recordType = '';
			
			search.create({
				type: "entity",
				filters:
					[
						['internalid', 'anyof', entityId], "AND", 
						['isdefaultshipping', 'is', "T"]
					],
				columns: [search.createColumn({name: "internalid"})]
			}).run().each(function(result){	
				_recordType = result.recordType;
			});
			
			var entitySearchObj = record.load({type: _recordType, id: entityId, isDynamic: true});
			
			var mainObject = {};
				
				mainObject.name = entitySearchObj.getValue({fieldId: 'custentity_enl_legalname'});
				mainObject.businessName = entitySearchObj.getValue({fieldId: 'companyname'}) || entitySearchObj.getValue({fieldId: 'custentity_enl_legalname'});
				
				if(entitySearchObj.getValue({fieldId: 'custentity_enl_cnpjcpf'}))
					mainObject.federalTaxId = removeSpecialCharacter(entitySearchObj.getValue({fieldId: 'custentity_enl_cnpjcpf'}));
				
				if(entitySearchObj.getValue({fieldId: 'custentity_enl_ccmnum'}))
					mainObject.cityTaxId = removeSpecialCharacter(entitySearchObj.getValue({fieldId: 'custentity_enl_ccmnum'}));
				
				if(entitySearchObj.getValue({fieldId: 'custentity_enl_ienum'}))
					mainObject.stateTaxId = removeSpecialCharacter(entitySearchObj.getValue({fieldId: 'custentity_enl_ienum'}));
				
				if(entitySearchObj.getValue({fieldId: 'phone'}))
					mainObject.phone = removeSpecialCharacter(entitySearchObj.getValue({fieldId: 'phone'}));
				
				mainObject.email = entitySearchObj.getValue({fieldId: 'email'});
				var individual = entitySearchObj.getValue({fieldId: 'isperson'});
				mainObject.type = (individual == 'T') ? 'individual' : 'business';
			
				retObj.main = mainObject;
				if(details == true)
				{
					var lineNumber = entitySearchObj.findSublistLineWithValue({
						sublistId: 'addressbook',
						fieldId: 'defaultshipping',
						value: 'T'
					});
					
					if(lineNumber > -1)
					{
						entitySearchObj.selectLine({
								sublistId: 'addressbook',
								line: lineNumber
							});
						
						var carrierAddress = entitySearchObj.getCurrentSublistSubrecord({
								sublistId: 'addressbook',
								fieldId: 'addressbookaddress', 
							});
						
						if(carrierAddress != null)
							retObj.details = buildAddress(carrierAddress);
					}
				}
					
			return retObj;
		}
		catch(fetchEntityObjErr)
		{
	        throw  fetchEntityObjErr;
		}
	}
	
	function getCarrierList()
	{
	    try 
	    {
			var carrierSearchObj = search.load({id: 'customsearch_avlr_transportadoras'});	
		} 
	    catch (getCarrierListErr) 
	    {
			var carrierSearchObj = search.create({
				type: "customrecord_enl_transportadoras",
				title: 'AVLR eInvoice - Transportadoras',
				id: 'customsearch_avlr_transportadoras',
				isPublic: true,
				filters: [["isinactive","is","F"]],
				columns:
				[
					search.createColumn({name: "internalid", sort: search.Sort.ASC, label: "Internal Id"}),
					search.createColumn({name: "custrecord_enl_codigotransportadoras", label: "Código do Fornecedor"}),
					search.createColumn({name: "entitynumber",join: "custrecord_enl_codigotransportadoras"}),
					search.createColumn({name: "custentity_enl_legalname",join: "custrecord_enl_codigotransportadoras"}),
					search.createColumn({name: "custentity_enl_statetaxpayer",join: "custrecord_enl_codigotransportadoras"}),
					search.createColumn({name: "isperson",join: "custrecord_enl_codigotransportadoras"}),
					search.createColumn({name: "custentity_enl_cnpjcpf",join: "custrecord_enl_codigotransportadoras"}),
					search.createColumn({name: "custentity_enl_ccmnum",join: "custrecord_enl_codigotransportadoras"}),
					search.createColumn({name: "custentity_enl_ienum",join: "custrecord_enl_codigotransportadoras"}),
	
				]
			});
			
			log.debug('AVLR eInvoice - Transportadoras', carrierSearchObj.save());
		}
		
		var _arr = [];
		carrierSearchObj.run().each(function(result){ 
			_arr.push(result)
			return true;
		});

		return _arr;
	}

	function fetchCarrierList(carrierId)
	{
		try
		{
			var retObj = {};
			if(carrierList != null && carrierList.length > 0)
			{
				for(var i=0; i < carrierList.length; i++)
				{
					var carrierListRec = carrierList[i];
					if(carrierListRec.id == carrierId)
					{
						var transporterObj = {}; 
						transporterObj.businessName = carrierListRec.getValue({name: 'custentity_enl_legalname', join: 'custrecord_enl_codigotransportadoras'});
						transporterObj.type = "business";
						
						if(carrierListRec.getValue({name: 'custentity_enl_cnpjcpf', join: 'custrecord_enl_codigotransportadoras'}))
							transporterObj.federalTaxId = removeSpecialCharacter(carrierListRec.getValue({name: 'custentity_enl_cnpjcpf', join: 'custrecord_enl_codigotransportadoras'}));
						
						if(carrierListRec.getValue({name: 'custentity_enl_ccmnum', join: 'custrecord_enl_codigotransportadoras'}))
							transporterObj.cityTaxId = removeSpecialCharacter(carrierListRec.getValue({name: 'custentity_enl_ccmnum', join: 'custrecord_enl_codigotransportadoras'}));
						
						if(carrierListRec.getValue({name: 'custentity_enl_ienum', join: 'custrecord_enl_codigotransportadoras'}))
							transporterObj.stateTaxId = removeSpecialCharacter(carrierListRec.getValue({name: 'custentity_enl_ienum', join: 'custrecord_enl_codigotransportadoras'}));
						
						retObj.main = transporterObj;
						
						var vendorRec = record.load({
						    type: record.Type.VENDOR, 
						    id: carrierListRec.getValue({name: 'custrecord_enl_codigotransportadoras'}),
						    isDynamic: true,
						});
						
						var lineNumber = vendorRec.findSublistLineWithValue({
								sublistId: 'addressbook',
								fieldId: 'defaultbilling',
								value: 'T'
							});
						
						if(lineNumber > -1)
						{
							vendorRec.selectLine({
									sublistId: 'addressbook',
									line: lineNumber
								});
							
							var carrierAddress = vendorRec.getCurrentSublistSubrecord({
									sublistId: 'addressbook',
									fieldId: 'addressbookaddress', 
								});
							
							if(carrierAddress != null)
								retObj.details = buildAddress(carrierAddress);
						}
							
						break;
					}
				}
			}
			
			return retObj;
		}
		catch(fetchCarrierListErr)
		{
	        throw  fetchCarrierListErr;
		}
	}
	
	function buildAddress(address)
	{
//		log.debug('inside buildAddress', JSON.stringify(address));
		try
		{
			var addressObj  = {};
          	var countryDetails = getCountryList(address.getValue({fieldId: 'country'}));
//         	log.debug('countryDetails', JSON.stringify(countryDetails));
          	countryDetails.country = countryDetails.countryISOCode;

	      	if(countryDetails.name != 1058)
	        {
	          	addressObj.street = address.getValue({fieldId: 'addr1'});
	            addressObj.neighborhood = address.getValue({fieldId: 'addr3'});
	            addressObj.zipcode = "0000000";
	          	addressObj.cityCode = "9999999";
	            addressObj.cityName = "Exterior";
	            addressObj.state = "EX";
	          	addressObj.countryCode = countryDetails.name; 
	          	addressObj.country = countryDetails.countryISOCode;
	            addressObj.number = address.getValue({fieldId: 'addr2'});
	            addressObj.complement = '';
	            addressObj.phone = '';
	        }
	      	else
	        {
	            addressObj.street = address.getValue({fieldId: 'addr1'});
	            addressObj.neighborhood = address.getValue({fieldId: 'addr3'});
	            addressObj.zipcode = address.getValue({fieldId: 'zip'});
	            addressObj.cityCode = fetchCityCode(address.getValue({fieldId: 'custrecord_enl_city'}));
	            addressObj.cityId = address.getValue({fieldId: 'custrecord_enl_city'});
	            addressObj.cityName = address.getText({fieldId: 'custrecord_enl_city'});
	            addressObj.state = address.getText({fieldId: 'custrecord_enl_uf'});
	          	addressObj.countryCode = countryDetails.name; 
	          	addressObj.country = countryDetails.countryISOCode;
	            addressObj.number = address.getValue({fieldId: 'custrecord_enl_numero'});
	            var complement = address.getValue({fieldId: 'addr2'});
	          	addressObj.complement = (complement != null && complement.length > 0) ? complement : '0';
	        }

			return addressObj;
		}
		catch(buildAddressErr)
		{
	        throw buildAddressErr;
		}
	}
	
	function fetchCityCode(cityId)
	{
		try
		{
			var fieldLookUpCity = search.lookupFields({
				type: 'customrecord_enl_cities',
				id: cityId, 
				columns: ['name','custrecord_enl_ibgecode','custrecord_enl_citystate']
			});
		
			return fieldLookUpCity.custrecord_enl_ibgecode;
		}
		catch(fetchCityCodeErr)
		{
	        throw fetchCityCodeErr; 
		}
	}
	
	function fetchCountryDetails(countryId)
	{
		try
		{
			var retVal = {};
			for(var i=0; i < countryList.length; i++)
			{
				if(countryList[i].countryShortCode == countryId)
				{
					retVal.id = countryList[i].id;
					retVal.name = countryList[i].name;
					retVal.countryShortCode = countryList[i].countryShortCode;
					retVal.countryCode = countryList[i].countryCode;
					retVal.countryISOCode = countryList[i].isoCode;
					
					break;
				}
			}
			return retVal;
		}
		catch(fetchCountryDetailsErr)
		{
	        throw fetchCountryDetailsErr; 
		}
	}
	
	
	function getFiscalDocumentNumber(fiscalDocumentId, locationId)
	{
		try
		{
			var numberSequenceResults = search.load({id: 'customsearch_avlr_invoicenumberseq'});
		}
		catch(getFiscalDocumentNumberErr)
		{
			var filters = [
					 ["isinactive", "is", "F"], "AND",
					 ["custrecord_enl_seq_status", "noneof", 3]
				 ];
			
			
	//			log.debug('inside getFiscalDocumentNumber', 'getFiscalDocumentNumber');
			var numberSequenceResults = search.create({
				type: "customrecord_enl_invoicenumberseq",
				title: 'AVLR eInvoice - Invoice Number Sequence',
				id: 'customsearch_avlr_invoicenumberseq',
				isPublic: true,
				filters: filters,
				columns: [
					search.createColumn({
						name: "custrecord_enl_seq_num",
						sort: search.Sort.ASC,
						label: "Sequence Number",
					}),
					search.createColumn({
						name: "custrecord_enl_seq_status",
						label: "Sequence Status",
					}),
					search.createColumn({
						name: "name",
						label: "Name"
					}),
				],
			})
	        
			log.debug('AVLR eInvoice - Invoice Number Sequence', numberSequenceResults.save());

		}

		var numberSequenceResultsArr = [];
		numberSequenceResults.filters.push(search.createFilter({name: "custrecord_enl_seq_fiscaldocument", operator: 'anyof', values: fiscalDocumentId}));
		numberSequenceResults.run().each(function(result){ 
			numberSequenceResultsArr.push(result)
		});
			
//		log.debug('numberSequenceResults', numberSequenceResults);
			
		if(numberSequenceResultsArr && numberSequenceResultsArr.length)
		{
			var recId = record.submitFields({
				type: 'customrecord_enl_invoicenumberseq',
				id: numberSequenceResultsArr[0].id,
				values: {'custrecord_enl_seq_status': 3 }
			});
			log.debug('customrecord_enl_invoicenumberseq', numberSequenceResultsArr[0].getText('custrecord_enl_seq_status') +' to settled(resolvido) : ' + recId);

			return numberSequenceResultsArr[0].getValue('name');
		}
		else
		{
			try 
			{
				var numberSequenceResults = search.load({id: 'customsearch_avlr_invoicenumberseq3'});
			} 
			catch (error) 
			{
				var filters = [["custrecord_enl_seq_status", "anyof", 3]]
				
				
				var numberSequenceResults = search.create({
					type: "customrecord_enl_invoicenumberseq",
					title: 'AVLR eInvoice - Invoice Squence Number 3',
					id: 'customsearch_avlr_invoicenumberseq3',
					isPublic: true,
					filters: filters,
					columns: [
						search.createColumn({
							name: "custrecord_enl_seq_num",
							summary: "MAX"
						})
					],
				})
				
				log.debug('AVLR eInvoice - Invoice Squence Number 3', numberSequenceResults.save());
			}
			
			var newNumber;
			numberSequenceResults.filters.push(search.createFilter({name: "custrecord_enl_seq_fiscaldocument", operator: 'anyof', values: fiscalDocumentId}));
			numberSequenceResults.run().each(function(result){

				//log.debug('numberSequenceResults', numberSequenceResults);
				var _numberSequence = result.getValue({name: 'custrecord_enl_seq_num', summary: 'max'});
				if(_numberSequence)
					newNumber = parseInt(_numberSequence) + 1;
				else
					newNumber = 1;
				
				newName = ("00000000" + newNumber).slice(-9);
				
			});
			return newName;
		}
	}
	
	function fetchInstallments(arrayofIds)
	{
//	    log.debug("headerResults-count", installmentResults.length);
//	    log.debug("installmentResults", JSON.stringify(installmentResults));

		var searchResultSet = [];
					
		var installmentObj = {
			type: "installment",
			title: 'AVLR eInvoice - Fetch Installments',
			id: 'customsearch_avlr_fetchinstallments',
			isPublic: true,
			columns: [
				search.createColumn({
					name: "internalid",
					join: "transaction",
					label: "Transaction Id"
				}),
				search.createColumn({
					name: "installmentnumber",
					label: "Installment Number",
					sort: search.Sort.ASC
				}),
				search.createColumn({
					name: "amount",
					label: "Amount"
				}),
				search.createColumn({
					name: "duedate",
					label: "Due Date"
				}),
			],
		};

		var transactionSearchObj = search.create({
			type: installmentObj.type,
			title: installmentObj.title,
			id: installmentObj.id,
			isPublic: installmentObj.isPublic,
			filters: installmentObj.filters,
			columns: installmentObj.columns
		})

			 
		transactionSearchObj.filters.push(search.createFilter({name: 'internalid', join: 'transaction', operator: 'anyof', values: arrayofIds}));
		var searchData = transactionSearchObj.runPaged();
		searchData.pageRanges.forEach(function(pageRange){
			
			var mayPage = searchData.fetch({index: pageRange.index})
			
			mayPage.data.forEach(function(result){
				
				searchResultSet.push(result)
			
			});
		});
			
		return searchResultSet;
	}
	
	function getHeaderSearchObj(type, arrayOfIds)
	{
		try 
		{
			var transactionSearchObj = search.load({id: 'customsearch_avlr_getheader'});
		} 
		catch (error) 
		{
			var columns = [search.createColumn({name: "transactionnumber"}),
							search.createColumn({name: "tranid"}),
							search.createColumn({name: "amount" }),
							search.createColumn({name: "trandate"}),
							search.createColumn({name: "datecreated"}),
							search.createColumn({name: "type"}),
							search.createColumn({name: "entity"}),
							search.createColumn({name: 'subsidiary'}),
							search.createColumn({name: "custbody_enl_fiscaldocnumber"}),
							search.createColumn({name: "createdfrom"}),
							search.createColumn({name: "custbody_enl_carrierid"}),
							search.createColumn({name: "custbody_enl_freighttype"}),
							search.createColumn({name: "custbody_enl_stdlegaltxt"}),
							search.createColumn({name: "custbody_enl_legaltext"}),
							search.createColumn({name: "custbody_enl_complementaryinfo"}),
							search.createColumn({name: "custbody_enl_plate"}),
							search.createColumn({name: "custbody_enl_ufplate"}),
							search.createColumn({name: "custbody_enl_pickuplocation"}),
							search.createColumn({name: "custbody_enl_deliverylocation"}),
							search.createColumn({name: "custbody_enl_hascpom"}),
							search.createColumn({name: "custbody_enl_netweight"}),
							search.createColumn({name: "custbody_enl_grossweight"}),
							search.createColumn({name: "custbody_enl_volumesqty"}),
							search.createColumn({name: "custbody_enl_volumetype"}),
							search.createColumn({name: "custbody_enl_brand"}),
							search.createColumn({name: "custbody_ava_einvoice_ref"}),
							search.createColumn({name: "custbody_enl_fiscaldocstatus"}),
							search.createColumn({name: "custbody_avlr_presenceindicator"}),
							search.createColumn({name: "custbody_enl_portoembarque"}),
							search.createColumn({name: "custbody_avlr_placedescription"}),
							search.createColumn({name: "custbody_avlr_shippingstate"}),
							search.createColumn({name: "custbody_enl_fiscaldocdate"}),
							
							search.createColumn({name: "custbody_enl_order_documenttype"}),
							search.createColumn({name: "custrecord_enl_issuereceiptdocument", join: "CUSTBODY_ENL_ORDER_DOCUMENTTYPE"}),
							search.createColumn({name: "custrecord_enl_fdt_model",	join: "CUSTBODY_ENL_ORDER_DOCUMENTTYPE"}),
							search.createColumn({name: "custrecord_enl_fdt_shortname",	join: "CUSTBODY_ENL_ORDER_DOCUMENTTYPE"}),
							search.createColumn({name: "custrecord_enl_fdt_serie",	join: "CUSTBODY_ENL_ORDER_DOCUMENTTYPE"}),

							search.createColumn({name: 'subsidiary', label: 'Subsidiary'}),
							search.createColumn({name: "namenohierarchy", join: "subsidiary"}),
							search.createColumn({name: "custrecord_enl_companyid", join: "subsidiary" }),
							//search.createColumn({name: "custrecord_enl_avataxuser", join: "subsidiary"}),
							//search.createColumn({name: "custrecord_enl_pwdavatax", join: "subsidiary"}),
							search.createColumn({name: "custrecord_enl_urlswfiscal", join: "subsidiary"}),
						
							
							search.createColumn({ name: "entityid", join: 'customer' }),
							search.createColumn({ name: "entitynumber", join: 'customer'}),
							search.createColumn({ name: "isperson", join: 'customer' }),
							search.createColumn({ name: "companyname", join: 'customer' }),
							search.createColumn({ name: "firstname", join: 'customer' }),
							search.createColumn({ name: "middlename", join: 'customer' }),
							search.createColumn({ name: "lastname", join: 'customer' }),
							search.createColumn({ name: "phone", join: 'customer' }),
							search.createColumn({ name: "email", join: 'customer' }),
							search.createColumn({ name: "custentity_enl_suframaid", join: 'customer'}),
							search.createColumn({ name: "custentity_enl_cnpjcpf", join: 'customer' }),
							search.createColumn({ name: "custentity_enl_ccmnum", join: 'customer' }),
							search.createColumn({ name: "custentity_enl_ienum", join: 'customer' }),
							search.createColumn({ name: "custentity_enl_legalname", join: 'customer' }),
							search.createColumn({ name: "custentity_enl_statetaxpayer", join: 'customer' }),
							search.createColumn({ name: "custentity_enl_ent_activitysector", join: 'customer' }),
							search.createColumn({ name: "custentity_enl_entitytype", join: 'customer' }),
							search.createColumn({ name: "custentity_avlr_issbehavior", join: 'customer' }),
							search.createColumn({ name: "custentity_avlr_piscofinsrelizefzf", join: "vendor" }),
							
							search.createColumn({ name: "entityid", join: 'vendor' }),
							search.createColumn({ name: "entitynumber", join: 'vendor'}),
							search.createColumn({ name: "isperson", join: 'vendor' }),
							search.createColumn({ name: "companyname", join: 'vendor' }),
							search.createColumn({ name: "firstname", join: 'vendor' }),
							search.createColumn({ name: "middlename", join: 'vendor' }),
							search.createColumn({ name: "lastname", join: 'vendor' }),
							search.createColumn({ name: "phone", join: 'vendor' }),
							search.createColumn({ name: "email", join: 'vendor' }),
							search.createColumn({ name: "custentity_enl_suframaid", join: 'vendor'}),
							search.createColumn({ name: "custentity_enl_cnpjcpf", join: 'vendor' }),
							search.createColumn({ name: "custentity_enl_ccmnum", join: 'vendor' }),
							search.createColumn({ name: "custentity_enl_ienum", join: 'vendor' }),
							search.createColumn({ name: "custentity_enl_legalname", join: 'vendor' }),
							search.createColumn({ name: "custentity_enl_statetaxpayer", join: 'vendor' }),
							search.createColumn({ name: "custentity_enl_ent_activitysector", join: 'vendor' }),
							search.createColumn({ name: "custentity_enl_entitytype", join: 'vendor' }),
							search.createColumn({ name: "custentity_avlr_issbehavior", join: 'vendor' }),
							search.createColumn({ name: "custentity_avlr_pisfopag", join: "vendor" }),
							search.createColumn({ name: "custentity_avlr_subjectpayrolltaxrelief", join: "vendor" }),
							search.createColumn({ name: "custentity_avlr_piscofinsrelizefzf", join: "vendor" }),
							
							search.createColumn({name: "address", join: "billingAddress"}),
							search.createColumn({name: "address1", join: "billingAddress"}),
							search.createColumn({name: "address2", join: "billingAddress"}),
							search.createColumn({name: "address3", join: "billingAddress"}),
							search.createColumn({name: "addressee", join: "billingAddress"}),
							search.createColumn({name: "attention", join: "billingAddress"}),
							search.createColumn({name: "city", join: "billingAddress"}),
							search.createColumn({name: "phone", join: "billingAddress"}),
							search.createColumn({name: "state", join: "billingAddress"}),
							search.createColumn({name: "zip", join: "billingAddress"}),
							search.createColumn({name: "custrecord_enl_city", join: "billingAddress"}),
							search.createColumn({name: "custrecord_enl_complementnumbe", join: "billingAddress"}),
							search.createColumn({name: "country", join: "billingAddress"}),
							search.createColumn({name: "countrycode", join: "billingAddress"}),
							search.createColumn({name: "externalid", join: "billingAddress"}),
							search.createColumn({name: "internalid", join: "billingAddress"}),
							search.createColumn({name: "custrecord_enl_numero", join: "billingAddress"}),
							search.createColumn({name: "custrecord_enl_uf", join: "billingAddress"}),
							
							search.createColumn({name: "address", join: "shippingAddress"}),
							search.createColumn({name: "address1", join: "shippingAddress"}),
							search.createColumn({name: "address2", join: "shippingAddress"}),
							search.createColumn({name: "address3", join: "shippingAddress"}),
							search.createColumn({name: "addressee", join: "shippingAddress"}),
							search.createColumn({name: "attention", join: "shippingAddress"}),
							search.createColumn({name: "city", join: "shippingAddress"}),
							search.createColumn({name: "phone", join: "shippingAddress"}),
							search.createColumn({name: "state", join: "shippingAddress"}),
							search.createColumn({name: "zip", join: "shippingAddress"}),
							search.createColumn({name: "custrecord_enl_city", join: "shippingAddress"}),
							search.createColumn({name: "custrecord_enl_complementnumbe", join: "shippingAddress"}),
							search.createColumn({name: "country", join: "shippingAddress"}),
							search.createColumn({name: "countrycode", join: "shippingAddress"}),
							search.createColumn({name: "externalid", join: "shippingAddress"}),
							search.createColumn({name: "internalid", join: "shippingAddress"}),
							search.createColumn({name: "custrecord_enl_numero", join: "shippingAddress"}),
							search.createColumn({name: "custrecord_enl_uf", join: "shippingAddress"}),
							
							search.createColumn({name: "location", label: "Location" }),
							search.createColumn({name: "name", join: "location"}),
							search.createColumn({name: "custrecord_enl_locationcnpj", join: "location"}),
							search.createColumn({name: "custrecord_enl_fiscalestablishmentid", join: "location"}),
							search.createColumn({name: "custrecord_enl_locationccmnum", join: "location"}),
							search.createColumn({name: "custrecord_enl_locationienum", join: "location"}),
							search.createColumn({name: "custrecord_avlr_activitysector", join: "location"}),
							search.createColumn({name: "locationtype", join: "location"}),
							//search.createColumn({name: "timezone", join: "location"}),
							
							search.createColumn({name: "custbody_enl_operationtypeid"}),
							search.createColumn({name: "name", join: "CUSTBODY_ENL_OPERATIONTYPEID"}),
							search.createColumn({name: "custrecord_enl_postoninventory", join: "CUSTBODY_ENL_OPERATIONTYPEID"}),
							search.createColumn({name: "custrecord_enl_ot_accountnum", join: "CUSTBODY_ENL_OPERATIONTYPEID"}),
							search.createColumn({name: "custrecord_enl_financialtran", join: "CUSTBODY_ENL_OPERATIONTYPEID"}),
							search.createColumn({name: "internalid", join: "CUSTBODY_ENL_OPERATIONTYPEID"}),
							search.createColumn({name: "custrecord_enl_inventtrans", join: "CUSTBODY_ENL_OPERATIONTYPEID"}),
							search.createColumn({name: "custrecord_enl_ot_altname", join: "CUSTBODY_ENL_OPERATIONTYPEID"}),
							search.createColumn({name: "custrecord_enl_ot_finalprice", join: "CUSTBODY_ENL_OPERATIONTYPEID"}),
							search.createColumn({name: "custrecord_enl_ot_transactiontype", join: "CUSTBODY_ENL_OPERATIONTYPEID"}),
							search.createColumn({name: "custrecord_enl_ot_usetype", join: "CUSTBODY_ENL_OPERATIONTYPEID"}),
							
							"transferlocation",
							search.createColumn({name: "custrecord_enl_locationcnpj", join: "toLocation"}),
							search.createColumn({name: "custrecord_enl_locationienum", join: "toLocation"}),
							search.createColumn({name: "custrecord_enl_locationccmnum", join: "toLocation"}),
							search.createColumn({name: "custrecord_enl_legalname", join: "toLocation"}),
							
							search.createColumn({name: "custbody_avlr_marketplace_indicator"}),
							search.createColumn({name: "custbody_avlr_intermediary_transaction"}),
							search.createColumn({name: "custbody_avlr_identifregistintermed"}),
							search.createColumn({name: "custbody_avlr_cardcnpj"}),
							search.createColumn({name: "custentity_enl_cnpjcpf", join: "CUSTBODY_AVLR_INTERMEDIARY_TRANSACTION"})
							];
			
			// try 
			// {
			// 	search.create({
			// 		type: "transaction",
			// 		columns: ['approvalstatus'],
			// 	}).run().each(function(result){});
				
			// 	columns.push(search.createColumn({name: "approvalstatus"}));
			// } 
			// catch (e) 
			// {
			// 	//log.debug('getHeaderSearchObj', 'createColumn : approvalstatus campo não existe');
			// }
					
			var transactionSearchObj = search.create({
				type: "transaction",
				title: 'AVLR eInvoice - GetHeaderSearchObj',
				id: 'customsearch_avlr_getheader',
				isPublic: true,
				filters: [["mainline", "is", "T"]],
				columns: columns,
			});
			
			log.debug('getHeaderSearchObj', transactionSearchObj.save());
		}

		var searchResult = [];
	
		transactionSearchObj.filters.push(search.createFilter({name: 'internalid', operator: 'anyof', values: arrayOfIds}));
		transactionSearchObj.run().each(function(result){
			searchResult.push(result)
			return true;
		});
		
		return searchResult;
	}
	
	
	function pad(n, width, z) 
	{
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}
	
	function getLineSearchObj(type, arrayOfIds)
	{
		try 
		{
			var transactionSearchObj = search.load({id: 'customsearch_avlr_getline'});
		} 
		catch (error) 
		{
			var filter =  [
				["mainline","is","F"], 
				"AND", 
				["taxline","is","F"], 
				"AND", 
				["shipping","is","F"], 
				"AND", 
				["cogs","is","F"],
				"AND", 
				["item","noneof","@NONE@"], 
				"AND", 
				[
					[
						["type","anyof","VendBill"]],
						"AND",
						[["accounttype","anyof","Income","@NONE@"],
						"OR",
						["accounttype","anyof","OthCurrLiab","Expense"]
						,"OR",
						["accounttype","anyof","OthCurrAsset"]
						],
						"OR",
						[
						["type","anyof","CustInvc"],
						"AND",
						[
							["accounttype","anyof","Income","Expense"],
							"OR",
							["accounttype","anyof","OthCurrLiab"],
							"OR",
							["accounttype","anyof","DeferRevenue"],
							"OR", 
							["accounttype","anyof","OthIncome"],
							"OR",
							["accounttype","anyof","FixedAsset"],
							"OR",
							["accounttype","anyof","OthExpense"]
						]          
					],
					"OR",
					[
						["type","anyof","CustCred"],
						"AND",
						[
							["accounttype","anyof","Income","OthCurrLiab"],
							"OR",
							["accounttype","anyof","OthExpense"],
							"OR",
							["accounttype","anyof","Expense"]
						]
					],
					"OR",
					[
						["type","anyof","VendCred"],
						"AND",
						[	
							[
								["accounttype","anyof","OthCurrAsset"],
								"AND",
								["formulanumeric: ABS({amount}) - ABS({quantity})","greaterthan","0"]
							],
							"OR",
							[
								["accounttype","anyof","@NONE@"],
								"AND",
								["amount","greaterthan","0.00"]
							],
							"OR",
							["accounttype","anyof","COGS"]
						]
					],
					"OR",
					[
						["type","anyof","TrnfrOrd"],
						"AND",
						["formulatext: CASE WHEN {quantity} > 0 AND ({transactionlinetype} LIKE 'Item' OR {transactionlinetype} LIKE 'Receiving') THEN {transactionlinetype} ELSE NULL END", "isnotempty", ""]
					],
					"OR",
					[
						["formulatext: {type}","contains","Remessa Bonificação"] // Remessa Bonificação
					]
				]
			]
			
//	        log.debug('filter', filter);
			
			var columns = [
							search.createColumn({name: "item"}),
							search.createColumn({name: "itemid", label: "Item Id", join: 'item'}),
							search.createColumn({name: "itemtype", label: "itemType"}),
							search.createColumn({name: "quantity", label: "Quantity"}),
							search.createColumn({name: "rate", label: "Rate"}),
							search.createColumn({name: "amount", label: "Amount"}),
							search.createColumn({name: "memo", label: "Description"}),
							search.createColumn({name: "accounttype", label: "Account Type"}),
							
							search.createColumn({name: "custcol_enl_line_freightamount", label: "Frete"}),
							search.createColumn({name: "custcol_enl_line_insuranceamount", label: "Seguro"}),
							search.createColumn({name: "custcol_enl_line_othersamount", label: "Outras Despesas"}),
							search.createColumn({name: "custcol_enl_discamount", label: "Desconto"}),
							search.createColumn({name: "custcol_enl_externalorder", label: "N° Pedido Externo/NF.Ref "}),
							search.createColumn({name: "custcol_eur_externallinenum", label: "Linha Pedido Externo/Item NF Ref."}),
							search.createColumn({name: "custcol_avlr_publicyagency_deduction", label: "Deduction Agency"}),
							search.createColumn({name: "custcol_avlr_info_adic_nfe", label: "Adic NFE"}),
							search.createColumn({name: "custcol_enl_adicaonumber"}),
							search.createColumn({name: "custcol_enl_adicaoline"}),
							search.createColumn({name: "custcol_enl_line_idnumber"}),
							search.createColumn({name: "custcol_avlr_untaxedothercostamount"}), 
							search.createColumn({name: "custcol_enl_ref_chaveacesso"}),
							
							search.createColumn({name: "expenseaccount", join: "item"}),
							search.createColumn({name: "incomeaccount", join: "item"}),
							search.createColumn({name: "subtype", join: "item"}),
							search.createColumn({name: "displayname", join: "item"}),
							search.createColumn({name: "custitem_enl_cest", join: "item"}),
							search.createColumn({name: "custitem_avlr_ean", join: "item"}),
							search.createColumn({name: "custitem_avlr_ncmex", join: "item"}),
							search.createColumn({name: "custitem_enl_it_taxgroup", join: "item"}),
							search.createColumn({name: "custitem_enl_ncmitem", join: "item"}),
							search.createColumn({name: "custitem_enl_producttype", join: "item"}),
							search.createColumn({name: "custitem_enl_taxorigin", join: "item"}),
							search.createColumn({name: "custitem_avlr_subjecttoirrfauto", join: "item"}),
							search.createColumn({name: "custitem_avlr_piscofinsrevenuetype", join: "item"}),
							search.createColumn({name: "custitem_avlr_withlaborassignment", join: "item"}),
							search.createColumn({name: "custitem_avlr_isicmsstsubstitute", join: "item"}),
							search.createColumn({name: "custitem_avlr_appipicreditwheningoing", join: "item"}),
							search.createColumn({name: "custitem_avlr_appicmscreditwheningoing", join: "item"}),
							search.createColumn({name: "custitem_avlr_usuapprpiscofinscred", join: "item"}),
							search.createColumn({name: "custitem_avlr_ispiscofinsestimatedcred", join: "item"}),
							search.createColumn({name: "custitem_avlr_iiextaxcode", join: "item"}),
							search.createColumn({name: "custitem_avlr_nfci", join: "item"}),
							search.createColumn({name: "custitem_avlr_manufacturerequivalent", join: "item"}),
							search.createColumn({name: "custitem_avlr_comextaxunitfactor", join: "item"}),
							search.createColumn({name: "custitem_avlr_uniticmsstfactor", join: "item"}),
							search.createColumn({name: "custitem_avlr_ignoreothcostimpipibase", join: "item"}),
							search.createColumn({name: "custitem_enl_codigodeservico", join: "item"}),
							search.createColumn({name: "custitem_avlr_piscofinscreditnotallowed", join: "item"}),
							search.createColumn({name: "custitem_avlr_notsubjecttoinsswhenperson", join: "item"}),
							search.createColumn({name: "custitem_avlr_unittaxable", join: "item"}),
							search.createColumn({name: "custitem_avlr_aggregationcode", join: "item"}),
							search.createColumn({name: "custitem_avlr_cbar", join: "item"}),
						]
			
			var _unitsofmeasure = runtime.isFeatureInEffect({feature: 'UNITSOFMEASURE'});
			//log.debug('unitsofmeasure', _unitsofmeasure);
			if(_unitsofmeasure)
			{
				columns.push( search.createColumn({name: "unit"}));
				columns.push( search.createColumn({name: "unitstype", join: "item"}));
			}
			
			
			
			var _adBinNumeredInventoryManagement = runtime.isFeatureInEffect({feature: 'ADVBINSERIALLOTMGMT'});
			//log.debug('adBinNumeredInventoryManagement', _adBinNumeredInventoryManagement);
			if(_adBinNumeredInventoryManagement)
			{
				columns.push( search.createColumn({name: "islotitem", join: "item"}));
				columns.push(search.createColumn({name: "internalid", join: "inventoryDetail"}));
			}
			
			
			var _multicurrency = runtime.isFeatureInEffect({feature: 'multicurrency'});

			var _settings = [];
			if(_multicurrency)
				_settings = [search.createSetting({name: 'consolidationtype', value: 'NONE'})];

			var transactionSearchObj = search.create({
					type: "transaction",
					title: 'AVLR eInvoice - GetLineSearchObj',
					id: 'customsearch_avlr_getline',
					isPublic: true,
					filters: filter,
					columns: columns,
					settings: _settings
				}) //.runPaged();
				
			log.debug('getLineSearchObj', transactionSearchObj.save());
		}
		
		var lineResults = [];

		transactionSearchObj.filters.push(search.createFilter({name: 'internalid', operator: 'anyof', values: arrayOfIds}));
		
		transactionSearchObj.run().each(function(result){
			lineResults.push(result)
			return true;
			});

		return lineResults;
	}
	
	function getSourceItem(sourceItem)
    {
        switch (sourceItem)
        {
            case 1:
                return '0'; // 0 – Nacional, exceto as indicadas nos códigos 3 a 5
            case 2:
                return '1'; // 1 – Estrangeira – importação direta, exceto a indicada no código 6
            case 3:
                return '2'; // 2 – Estrangeira – adquirida no mercado interno, exceto a indicada no código 7
            case 4:
                return '3'; // 3 – Nacional, mercadoria ou bem com conteúdo de importação superior a 40%
            case 5:
                return '4'; // 4 – Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos
            case 6:
                return '5'; // 5 – Nacional, mercadoria ou bem com conteúdo de importação inferior ou igual a 40%
            case 7:
                return '6'; // 6 – Estrangeira – importação direta, sem similar nacional, constante em lista de resolução do Conselho de Ministros da CAMEX
            case 8:
                return '7'; // 7 – Estrangeira – adquirida no mercado interno, sem similar nacional, constante em lista de resolução do CAMEX
            case 9:
                return '8'; // 8 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70% (setenta por cento).
            default:
                return '0'; // 0 – Nacional, exceto as indicadas nos códigos 3 a 5
        }
    }
	
	function getProductType(productType)
    {
        switch (productType)
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
	
	function getIssBehavior(issBehavior) 
	{
		switch(issBehavior) 
		{
			case '1':
				return 'normal';
			case '2':
				return 'forcedWithholding';
			case '3':
				return 'forcedNoWithholding';
			case '4':
				return 'exempt';
			default:
				return 'normal';
		}
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
	
	
	function getMode(_mode)
    {
        switch(_mode)
        {
            case "1":
                return "01"; // Dinheiro
            case "2":
                return "02"; // Cheque
            case "3":
                return "03"; // Cartão de Crédito
            case "4":
                return "04"; // Cartão de Débito
            case "5":
                return "05"; // Cartão Loja
            case "6":
                return "10"; // Vale Alimentação
            case "7":
                return "11"; // Vale Refeição
            case "8":
                return "12"; // Vale Presente
            case "9":
                return "13"; // Vale Combustível
            case "10":
                return "14"; // Duplciata Mercaltil
            case "11":
                return "15"; // Boleto Bancário
            case "12":
                return "90"; // Sem Pagamento
            case "13":
                return "99"; // Outros
            case "14":
                return "16"; // Depósito Bancário
            case "15":
                return "17"; // Pagamento Instantâneo (PIX)
            case "16":
                return "18"; // Transferência bancária, Carteira Digital
            case "17":
                return "19"; //  Programa de fidelidade, Cashback, Crédito Virtual
            default:
                return "99";
        }
    }
	
	function removeSpecialCharacter(str, caracter) 
	{
		if(caracter)
			return str.replace(/\W/g, caracter);
		else
			return str.replace(/\W/g,"");
	}
	
	function getPresenceIndicator(key) 
	{
		switch (key) 
		{
			case "1":
				return "0"; // Not applicable
			case "2":
				return "1"; // Presential
			case "3":
				return "2"; //  Remote, internet
			case "4":
				return "3"; //  Remote, phone
			case "5":
				return "4"; // NFC-e home delivery
			case "6":
				return "5"; // In-person operation, for establishment (v3)
			case "7":
				return "9"; // Remote, others
			default:
				return "0"; // // Not applicable
		}
	}
	
	function getMarketplaceIndicator(key) 
	{
		switch (key) 
		{
			case "1": // Operação sem intermediador (em site ou plataforma própria)
				return "0";
			case "2": // Operação em site ou plataforma de terceiros (intermediadores/marketplace)
				return "1";
			default:
				return;
		}
	}
	
	function getEntityIcmsStSubstitute(key) 
	{
		switch (key) 
		{
			case "1":
				return "default"; // Normal
			case "2":
				return "yes"; //  Entity is ICMS ST Substitute
			case "3":
				return "no"; //  Entidade é substituto do ICMS ST
			default:
				return "default";
		}
	}
	
	function getGLAccountFromItem(lineRec)
	{
		var _itemtype = lineRec.getValue({name: 'itemtype'});
		var _subtype = lineRec.getValue({name: 'subtype', join: 'item'});
		var _accounttype = lineRec.getValue({name: 'accounttype'});
		var _expenseaccount = lineRec.getValue({name: 'expenseaccount', join: 'item'});
		var _incomeaccount = lineRec.getValue({name: 'incomeaccount', join: 'item'});
		
		var _arrSubTypeSale = ['Sale','For Sale','Resale','For Resale','Venda','Para venda','Revenda','Para revenda'];
		var _arrSubTypePurchase = ['Purchase','For Purchase','Compra','Para compra'];
		var accType = '';
		
		if(_itemtype == 'InvtPart' && !_subtype)
			var _accType = _incomeaccount;
		else if(_itemtype == 'Expense' && !_subtype)
		    var _accType = _expenseaccount;
		else if((_itemtype == 'Markup' || _itemtype == 'Payment') && !_subtype)
		    var _accType = _accounttype;
		else if((_itemtype == 'NonInvtPart' || _itemtype == 'Service' || _itemtype == 'OthCharge') && _arrSubTypeSale.indexOf(_subtype) > -1)
			var _accType = _incomeaccount;
		else if((_itemtype == 'NonInvtPart' || _itemtype == 'Purchase' || _itemtype == 'Service' || _itemtype == 'OthCharge') && _arrSubTypePurchase.indexOf(_subtype) > -1)
			var _accType = _expenseaccount;

		
		var _index = accountList.map(function(e) {
					return e.internalid == _accType;
				}).indexOf(true);
		
		if(_index != -1)
			return accountList[_index].number
		else		
			return '';
	}
	
	function fetchAccount()
	{
		var subsidiaries = [];
		var arr = []

		try 
		{
			var subsidiarySearchObj = search.load({id: 'customsearch_avlr_subsidiary'});
		} 
		catch (error) 
		{
			var subsidiarySearchObj = search.create({
				  	type: "subsidiary",
				   	title: 'AVLR eInvoice - Subsidiary',
					id: 'customsearch_avlr_subsidiary',
					isPublic: true,
				   	filters: [["custrecord_enl_urlswfiscal","isnotempty",""]],
				   	columns: ["internalid"]
				})

			log.debug('AVLR - Subsidiary', subsidiarySearchObj.save());
		}
		
		subsidiarySearchObj.run().each(function(result){
			subsidiaries.push(result.id)
			return true;
		});
		
		if(subsidiaries.length)
		{
			try 
			{
				var searchAccount = search.load({id: 'customsearch_avlr_account'});
				//var searchAccount = accountSearchObj.runPaged();
			} 
			catch (error) 
			{
				var searchAccount = search.create({
					type: "account",
					title: 'AVLR eInvoice - Account',
					id: 'customsearch_avlr_account',
					isPublic: true,
					columns:
					[
						search.createColumn({name: "internalid", sort: search.Sort.ASC}),
						search.createColumn({name: "number"}),
					]
				})
				
				log.debug('AVLR - Account', searchAccount.save());
			}
			
			searchAccount.filters.push(search.createFilter({name: 'subsidiary', operator: 'anyof', values: subsidiaries}));
			//filters:[["isinactive","is","F"], "AND", ["subsidiary","anyof",subsidiaries]],
			var searchAccount = searchAccount.runPaged();
			searchAccount.pageRanges.forEach(function(pageRange){
				
				var mayPage = searchAccount.fetch({index: pageRange.index})
				
				mayPage.data.forEach(function(result){
					
					var obj = {};
					obj.internalid = result.getValue('internalid');
					obj.number = result.getValue('number');
					
					arr.push(obj)
					
				});
			});
		}
		return arr;
	}
	
	
	function getStatusScript() 
	{
		try 
		{
			var searchScheduledScriptInstance = search.load({id: 'customsearch_avlr_scheduledscriptinstanc'});
		} 
		catch (error) 
		{	
			var filters = [
							[["script.scriptid","is","customscript_ava_einvoice_stage1_mr"], 
							"OR",
							["script.scriptid","is","customscript_ava_process_requests"]], 
							"AND",
							["status","anyof","PROCESSING","RESTART","RETRY"]
						];
			
			var searchScheduledScriptInstance = search.create({
				type: "scheduledscriptinstance",
				title: 'AVLR - Scheduled Script Instance',
				id: 'customsearch_avlr_scheduledscriptinstanc',
				isPublic: true,
				filters: filters,
				columns:
				[
					search.createColumn({
						name: "datecreated",
						summary: "MIN",
						sort: search.Sort.ASC
					}),
					search.createColumn({
						name: "scriptid",
						join: "scriptDeployment",
						summary: "GROUP"
					}),
					search.createColumn({
						name: "internalid",
						join: "scriptDeployment",
						summary: "GROUP"
						})
				]
			})

			log.debug('AVLR - Scheduled Script Instance', searchScheduledScriptInstance.save());
		}

		var resultSet = []				
		searchScheduledScriptInstance.run().each(function(result){	
			resultSet.push(result)
			return true;
		});
		
		return resultSet
	}

	function fetchAVAeInvoiceDashBoard(scriptDeploymentId) 
	{
		try 
		{
			var einvoiceDashboardSearchObj = search.load({id: 'customsearch_avlr_einvoicedashboard2'});
		} 
		catch (error) 
		{
			var _filters = [["custrecord_record_status","anyof","1"]]
			
			var einvoiceDashboardSearchObj = search.create({
				type: "customrecord_ava_einvoice_dashboard",
				title: 'AVLR - EInvoice Dashboard 2',
				id: 'customsearch_avlr_einvoicedashboard2',
				isPublic: true,
				filters: _filters,
				columns:
				[
					search.createColumn({
						name: "internalid",
						sort: search.Sort.ASC
					 }),
					"created",
					   "custrecord_ava_selected_records",
					   "custrecord_avlr_scriptdeployment"
				]
			})

			log.debug('AVLR - EInvoice Dashboard 2', einvoiceDashboardSearchObj.save());
		}


		if(scriptDeploymentId)
		{
			//einvoiceDashboardSearchObj.filters.push("AND");
			einvoiceDashboardSearchObj.filters.push(search.createFilter({name: 'custrecord_avlr_scriptdeployment', operator: 'contains', values: scriptDeploymentId}))
		} 
		
		var _arr = [];
		einvoiceDashboardSearchObj.run().each(function(result){
			_arr.push(result);
			return true;
		});

		return _arr;
	}
	
	// function getUnitsType() 
	// {
	// 	var _arr = [];
	// 	search.create({
	// 		type: "unitstype",
	// 		columns:
	// 		[
	// 			"internalid",
	// 			"name",
	// 		   	"unitname",
	// 		   	"conversionrate",
	// 		   	"baseunit"
	// 		]
	// 	}).run().each(function(result){
	// 		_arr.push(result);
	// 		return true;
	// 	});
	// 	return _arr;
	// }

	function sleep(milliseconds) 
	{
		var startDate = new Date();
		var currentDate = null;
		do 
		{
			currentDate = new Date();
		} while (currentDate - startDate < milliseconds);
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

    return {
        getTransactions: getTransactions,
        createJSONFile: createJSONFile,
        getCountryList: getCountryList,
		getCityList: getCityList,
		getLocations: getLocations,
		getCarrierList: getCarrierList,
		fetchAccount: fetchAccount,
		getStatusScript: getStatusScript,
		getFiscalDocumentNumber: getFiscalDocumentNumber,
		fetchAVAeInvoiceDashBoard: fetchAVAeInvoiceDashBoard,
		pad: pad,
		sleep: sleep,
		isEmptyObj: isEmptyObj,
		millisToMinutesAndSeconds: millisToMinutesAndSeconds
    };
});
