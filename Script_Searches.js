/**
 * Module Description
 * 
 * Version    Date            Author             Remarks
 * 1.00       01.10.2018     rogerio.horauti    Created Script
 * 1.01       15.10.2018	 sonia.liborio		Create Functions 
 */

define(['N/log', 'N/search', 'N/record'],

function(log, search, record) {
	
	function getXXXX(lvfilters) {
		var objAux = {};
		var objList = [];
		
		var _XXXX = search.create({
		   type: "XXXX",
		   filters: lvfilters,
		   columns:
		   [
			   "internalid",
			   "name"
		   ]
		});
	
		var resultCount = _XXXX.runPaged().count;
		if (resultCount) {
			_XXXX.run().each(function(result){
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.name = result.getValue({name: 'name'});				
				
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}

	function getXXXXByRecLoad(lvId) {
		var XXXXRecLoad = getRecordLoad('record_id', lvId);
		if (XXXXRecLoad) {
			return {
				recordObj:XXXXRecLoad,//Usado para acessar as propriedades do modulo record
				id: XXXXRecLoad.id,
				name: XXXXRecLoad.getValue({fieldId: 'name'}),
			}						
		}else{
			return;
		}	
	}

	function getRecordLoad(lvRecordType, lvId)
	{
		var lvRecordLoad;
		if(!lvId)
			return '';
		try {
			lvRecordLoad = record.load({
				type: lvRecordType,
				id: lvId
			});			
		} catch (e) {
			log.debug({
				title : 'Searches - getRecordLoad',
				details : e
			});
		}

		return lvRecordLoad;
	}
	
	function getEletrItemInvoiceSetup() {
		var _result = {};
		var customrecord_mts_eleiteminvsetupSearchObj = search.create({
			   type: "customrecord_mts_eleiteminvsetup",
			   filters:
			   [
			   ],
			   columns:
			   [
			      search.createColumn({
					 name: "internalid",
			         sort: search.Sort.ASC
			      }),
			   ]
			});
		
		var searchResultCount = customrecord_mts_eleiteminvsetupSearchObj.runPaged().count;
		_result.length = searchResultCount;
		
		customrecord_mts_eleiteminvsetupSearchObj.run().each(function(result){
			_result.id = result.getValue({ name: 'internalid' });
			
			var lvElectrInvSetupRecLoad = getRecordLoad('customrecord_mts_eleiteminvsetup', _result.id);
			_result.recordObj =lvElectrInvSetupRecLoad,
			_result.nfeblockout = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_nfeblocko_eleiteminvsetup' });
			_result.controlledgen = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_contgener_eleiteminvsetup' });
			_result.ctrlpost = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_ctrlpost_eleiteminvsetup' });
			_result.environment = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_typeenv_eleiteminvsetup' });
			_result.environmentid = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_envid_eleiteminvsetup' });
			_result.environmentIdText = lvElectrInvSetupRecLoad.getText({fieldId: 'custrecord_mts_envid_eleiteminvsetup' });
			_result.invoicingway = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_invway_eleiteminvsetup' });
			_result.invoicingwayText = lvElectrInvSetupRecLoad.getText({fieldId: 'custrecord_mts_invway_eleiteminvsetup' });
			_result.activenfe = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_activenfe_eleiteminvsetup' });
			_result.activenfetext = lvElectrInvSetupRecLoad.getText({fieldId: 'custrecord_mts_activenfe_eleiteminvsetup' });
			_result.notmandatorydatetime = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_notmandat_eleiteminvsetup' });
			_result.exitentrdatetimemanual = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_exitentra_eleiteminvsetup' });
			_result.nfesendpathcode = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_nfesendpa_eleiteminvsetup' });
			_result.addtagroot = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_addtagroo_eleiteminvsetup' });
			_result.invprocessversion = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_invproces_eleiteminvsetup' }); 
			_result.crtcode = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_crtcode_eleiteminvsetup' });
			_result.crtcodetext = lvElectrInvSetupRecLoad.getText({fieldId: 'custrecord_mts_crtcode_eleiteminvsetup' });
			_result.eletronicInvoiceProcess = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_eleinvpro_eleiteminvsetup' });
			_result.layoutVersion = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_layoutver_eleiteminvsetup' });
			_result.layoutVersionevent = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_eventlayo_eleiteminvsetup' });
			_result.dateTimeContingency = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_dttmcont_eleiteminvsetup' });
			_result.justificationContingency = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_justcont_eleiteminvsetup' });
			_result.danfeprintinglayout = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_danfeprin_eleiteminvsetup' });
			_result.keepNFeKeyToSameInv = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_keepnfkey_eleiteminvsetup' });
			_result.keyNos = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_keynos_eleiteminvsetup' });
			_result.grossNetWeightHdr =lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_grossnetw_eleiteminvsetup' });
			_result.versionAppEvent =lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_versiepec_eleiteminvsetup' });
			_result.compAuthSendNFe =lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_compauth_eleiteminvsetup' });
			_result.nameXMLKeyAccess =lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_namxmlkey_eleiteminvsetup' });
			_result.nameXMLInvoiceNo =lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_namxmlinv_eleiteminvsetup' });
			_result.nameXMLRangeSelectStart =lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_xmlransta_eleiteminvsetup' });
			_result.nameXMLRangeSelectEnd =lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_xmlranend_eleiteminvsetup' });
			_result.nameInTheEndXMLSend =lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_endxmlsen_eleiteminvsetup' });
			_result.complNameXMLEPEC = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_namxmlepe_eleiteminvsetup' });
			_result.notGenerateTagM = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_notgentag_eleiteminvsetup' });
			_result.cancEventNo = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_canceleve_eleiteminvsetup' });
			_result.layoutVersEventCanc = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_layvereve_eleiteminvsetup' });
			_result.cancellingJustification = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_calceljus_eleiteminvsetup' });
			_result.enableEventCanc = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_enableeve_eleiteminvsetup' });
			_result.complNameXmlCancFile = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_xmlcancfi_eleiteminvsetup' });
			_result.sendFilePath = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_sendflpath_eletrsetp' });
			_result.idSendFilePath = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_idfdsendflpath_eletrsetp' });
			_result.retFilePath = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_retflpath_eletrsetp' });
			_result.idRetFilePath = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_idfdretflpath_eletrsetp' });
			_result.noShowExposeTaxes = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_noshowexp_eleiteminvsetup' });
			_result.exposeTaxes = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_exposetax_eleiteminvsetup' });
			_result.exposeTaxesText = lvElectrInvSetupRecLoad.getText({fieldId: 'custrecord_mts_exposetax_eleiteminvsetup' });
			_result.printCustOrderInDANFE = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_printcuor_eleiteminvsetup' });
			_result.notGenerateTagK = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_nottagk_eleiteminvsetup' });
			_result.notGenerateTagI80 = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_notagi80_eleiteminvsetup' });
			_result.includeLotItemDescription = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_inclotite_eleiteminvsetup' });
			_result.includeLotAdditionalText = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_inclotadd_eleiteminvsetup' });
			_result.printSalesOrderInDANFE = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_printsaor_eleiteminvsetup' });
			_result.urlConnHom = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_urlnfeconnhom_eletrsetp' });
			_result.urlConnPro = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_urlnfeconnpro_eletrsetp' });
			_result.numTriesRetSefaz = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_nooftries_eleiteminvsetup' });
			_result.timeTriesRetSefaz = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_timetries_eleiteminvsetup' });
			_result.numberCce = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_numbercce_eleiteminvsetup' });
			_result.typeEnvCce = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_typeevent_eleiteminvsetup' });
			_result.layVersCce = lvElectrInvSetupRecLoad.getValue({fieldId: 'custrecord_mts_layoutcce_eleiteminvsetup' });
			
			// Labels   
			_result.invprocessversionLabel = lvElectrInvSetupRecLoad.getField({fieldId: 'custrecord_mts_invproces_eleiteminvsetup'}).label
			_result.keyNosLabel = lvElectrInvSetupRecLoad.getField({fieldId: 'custrecord_mts_keynos_eleiteminvsetup' }).label;
			_result.crtcodeLabel = lvElectrInvSetupRecLoad.getField({fieldId: 'custrecord_mts_crtcode_eleiteminvsetup' }).label;
		});
		return _result;
	}// end function eletrItemInvoiceSetup()

	function getSetupLocBRMotus() {
		var setupLocBRMotusObj = {};
		var searchSetupLocBRMotus = search.create({
			   type: "customrecord_mts_setuplocbr",
			   filters: [],
			   columns:
			   [
			      search.createColumn({
					 name: "internalid",
			         sort: search.Sort.ASC
			      }),
			   ]
			});
		
		searchSetupLocBRMotus.run().each(function(result){
			setupLocBRMotusObj.id = result.getValue({ name: 'internalid' });
			
			var setupLocBRMotusRecLoad = getRecordLoad('customrecord_mts_setuplocbr', setupLocBRMotusObj.id);
			setupLocBRMotusObj.recordObj - setupLocBRMotusRecLoad;
			setupLocBRMotusObj.isSefazXML = setupLocBRMotusRecLoad.getValue({fieldId: 'custrecord_mts_nfesefazxml_setuplocbr'});
			setupLocBRMotusObj.nfeImportType = setupLocBRMotusRecLoad.getValue({fieldId: 'custrecord_mts_nfeimporttype_setuplocbr'});
			setupLocBRMotusObj.nfeImportTypeText = setupLocBRMotusRecLoad.getText({fieldId: 'custrecord_mts_nfeimporttype_setuplocbr'});
			setupLocBRMotusObj.isNFeTXT = setupLocBRMotusRecLoad.getValue({fieldId: 'custrecord_mts_nfetxt_setuplocbr'});
		});
		
		return setupLocBRMotusObj;
	}
	
	function getItem(lvFilters) {
		var _result={length: 0};
    	var itemSearchObj = search.create({
    		type: "item",
			filters: lvFilters,
		    columns:
		    	[
		    	 	"internalid",
		    	 	"custitem_mts_state",
		    	 	"custitem_mts_city",
					"custitem_mts_producttype",
					"custitem_mts_ibptcode",
					"custitem_mts_irrfretgroupcode",
					"custitem_mts_pisretgroupcode",
					"custitem_mts_cofinsretgroupcod",
					"custitem_mts_cslretgroup",
					"subsidiary"
	    	 	]
		});
    	
		searchResultCount = itemSearchObj.runPaged().count;
		log.debug("itemSearchObj result count",searchResultCount);
		if (searchResultCount) {
			itemSearchObj.run().each(function(result){
				// .run().each has a limit of 4,000 results
				_result.internalid = result.getValue({name: 'internalid'});
				_result.state = result.getValue({name: 'custitem_mts_state'});
				_result.city = result.getValue({name: 'custitem_mts_city'});
				_result.productType = result.getValue({name: 'custitem_mts_producttype'});
				_result.ibptcode = result.getValue({name: "custitem_mts_ibptcode"});
				_result.ibptcodeText = result.getText({name: "custitem_mts_ibptcode"});
				_result.irrfRet = result.getValue({name:"custitem_mts_irrfretgroupcode"});
				_result.irrfRetText = result.getText({name:"custitem_mts_irrfretgroupcode"});
				_result.pisRet = result.getValue({name:"custitem_mts_pisretgroupcode"});
				_result.pisRetText = result.getText({name:"custitem_mts_pisretgroupcode"});
				_result.cofinsRet = result.getValue({name:"custitem_mts_cofinsretgroupcod"});
				_result.cofinsRetText = result.getText({name:"custitem_mts_cofinsretgroupcod"});
				_result.cslRet = result.getValue({name:"custitem_mts_cslretgroup"});
				_result.cslRetText = result.getText({name:"custitem_mts_cslretgroup"});
				_result.subsidiary = result.getValue({name: 'subsidiary'});
				_result.subsidiaryText = result.getText({name: 'subsidiary'});
			});			
		} 
		return _result;
	}// end function searchItem(state, city)
	
	function getEletrItemInvProcess(lvfilters) {
		var _result={length: 0};
		var customrecord_mts_eletiteminvprocSearchObj = search.create({
			   type: "customrecord_mts_eletiteminvproc",
			   filters:lvfilters,
			   columns:
			   [
		    	  "internalid",
			      "custrecord_mts_trans_eletiteminvproc",
			      "custrecord_mts_keyacess_eletiteminvproc",
			      "custrecord_mts_branch_eletiteminvproc",
			      "custrecord_mts_invno_eletiteminvproc",
			      
			      search.createColumn({
			         name: "custrecord_mts_state_nfetage",
			         join: "CUSTRECORD_MTS_ELETRONICINVNO_NFETAGE"
			      }),
			      search.createColumn({
			         name: "custrecord_mts_city_nfetage",
			         join: "CUSTRECORD_MTS_ELETRONICINVNO_NFETAGE"
			      }),
			   ]
			});
			var searchResultCount = customrecord_mts_eletiteminvprocSearchObj.runPaged().count;
			_result.length = searchResultCount;
			log.debug("customrecord_mts_eletiteminvprocSearchObj result count",searchResultCount);
			if (searchResultCount) {
				customrecord_mts_eletiteminvprocSearchObj.run().each(function(result){
					
					_result.internalid = result.getValue({name: 'internalid'});
					_result.keyaccess = result.getValue({name: 'custrecord_mts_keyacess_eletiteminvproc'});
					_result.invoiceNo = result.getValue({name: 'custrecord_mts_invno_eletiteminvproc'});
					_result.branchcode = result.getValue({name: 'custrecord_mts_branch_eletiteminvproc'});
					
					_result.state = result.getValue({name: 'custrecord_mts_state_nfetage'
						, join: 'CUSTRECORD_MTS_ELETRONICINVNO_NFETAGE'});
					_result.city = result.getValue({name: 'custrecord_mts_city_nfetage'
						, join: "CUSTRECORD_MTS_ELETRONICINVNO_NFETAGE"});
					//return true;
					
				});
			} 
			return _result;
			
	}// end function searchEletrItemInvProcess(chavecte)
	
	function getVendor(cnpj) {
	
		var _result={length: 0};
		var vendorSearchObj = search.create({
		   type: "vendor",
		   filters:
		   [
		      ["custentity_mts_cnpjcpf","is",cnpj]
		   ],
		   columns:
		   [
		      search.createColumn({
		         name: "internalid",
		         sort: search.Sort.ASC
		      }),
		      search.createColumn({name: "custentity_mts_cnpjcpf", label: "C.N.P.J./C.P.F."}),
		      search.createColumn({name: "custentity_mts_paytermscode", label: "Payment Terms Code Loc."}),
		      search.createColumn({name: "custentity_mts_taxareacode", label: "Tax Area Code"}),
		   ]
		});// end search.create
		var searchResultCount = vendorSearchObj.runPaged().count;
		_result.length = searchResultCount;
		log.debug("vendorSearchObj result count",searchResultCount);
		if (searchResultCount) {
			vendorSearchObj.run().each(function(result){
				
				_result.internalid =  result.getValue({name: 'internalid'});
				_result.cnpj = result.getValue({name: 'custentity_mts_cnpjcpf'});
				_result.paytermscode = result.getValue({name: 'custentity_mts_paytermscode'});
				_result.taxareacode = result.getValue({name: 'custentity_mts_taxareacode'});				
				//return true;
				
			});			
		} // end if (searchResultCount)
		return _result;
		
	}// end function loadVendor(cnpj)

	function getBrSetup() {
		var _result = {length: 0};
		var customrecord_mts_brsetupSearchObj = search.create({
		   type: "customrecord_mts_brsetup",
		   columns:
		   [
		      "internalid",
			  "isinactive",
			  "custrecord_mts_mandatoryitemtax_brsetup",
		      "custrecord_mts_fiscaldoctype_brsetup",
		      "custrecord_mts_indicatornature_brsetup",
		      "custrecord_mts_foldername_brsetup",
		      "custrecord_mts_folderid_brsetup",
		      "custrecord_mts_rpsnos_brsetup",//RPS Nos
		      "custrecord_mts_nferoleid_brsetup",
		      "custrecord_mts_danfeportrait_brsetup",
		      "custrecord_mts_danfelandscape_brsetup",
			  "custrecord_mts_processcce_brsetup",
			  "custrecord_mts_isssettlement_brsetup",
			  "custrecord_mts_validatewebservic_brsetup",
			  "custrecord_mts_irrfacumulatedoc_brsetup",
		      search.createColumn({
		          name: "name",
		          join: "CUSTRECORD_MTS_RPSNOS_BRSETUP"
		       }),
		      search.createColumn({
		          name: "custrecord_mts_startingno_noseriesloc",
		          join: "CUSTRECORD_MTS_RPSNOS_BRSETUP"
		       }),
		       search.createColumn({
		          name: "custrecord_mts_lastnoused_noseriesloc",
		          join: "CUSTRECORD_MTS_RPSNOS_BRSETUP"
		       }),
		       search.createColumn({
		          name: "custrecord_mts_increment_noseriesloc",
		          join: "CUSTRECORD_MTS_RPSNOS_BRSETUP"
		       }),
		       search.createColumn({
		          name: "custrecord_mts_lastdateused_noseriesloc",
		          join: "CUSTRECORD_MTS_RPSNOS_BRSETUP"
			   }),
			   'custrecord_mts_mandatoryopertype_brsetup'
		  
		   ]
		});
		var searchResultCount = customrecord_mts_brsetupSearchObj.runPaged().count;
		_result.length = searchResultCount;
		if (searchResultCount) {
			customrecord_mts_brsetupSearchObj.run().each(function(result){
				
				_result.internalid = result.getValue({name: 'internalid'});
				_result.isinactive = result.getValue({name: 'isinactive'});
				_result.fiscaldoctype_value = result.getValue({name: 'custrecord_mts_fiscaldoctype_brsetup'});//value
				_result.fiscaldoctype_text = result.getText({name: 'custrecord_mts_fiscaldoctype_brsetup'});//text
				_result.mandatoryItemTax = result.getValue({name:'custrecord_mts_mandatoryitemtax_brsetup'});
				_result.indicatornature_value = result.getValue({name: 'custrecord_mts_indicatornature_brsetup'});//value
				_result.indicatornature_text = result.getText({name: 'custrecord_mts_indicatornature_brsetup'});//text
				_result.irrfaccumulatedocumentsperday = result.getValue({name: 'custrecord_mts_irrfacumulatedoc_brsetup'});//
				_result.foldername = result.getValue({name: 'custrecord_mts_foldername_brsetup'});
				_result.folderid = result.getValue({name: 'custrecord_mts_folderid_brsetup'});
				_result.rpsnos = result.getValue({name: 'custrecord_mts_rpsnos_brsetup'});//RPS Nos
				_result.rpsnostext = result.getText({name: 'custrecord_mts_rpsnos_brsetup'});//RPS Nos
				_result.nferoleid = result.getValue({name: 'custrecord_mts_nferoleid_brsetup'});
				_result.name = result.getValue({name: 'name', join: 'CUSTRECORD_MTS_RPSNOS_BRSETUP'});
				_result.startingno = result.getValue({name: 'custrecord_mts_startingno_noseriesloc', join: 'CUSTRECORD_MTS_RPSNOS_BRSETUP'});
				_result.lastnoused = result.getValue({name: 'custrecord_mts_lastnoused_noseriesloc', join: 'CUSTRECORD_MTS_RPSNOS_BRSETUP'});
				_result.increment = result.getValue({name: 'custrecord_mts_increment_noseriesloc', join: 'CUSTRECORD_MTS_RPSNOS_BRSETUP'});
				_result.lastdateused = result.getValue({name: 'custrecord_mts_lastdateused_noseriesloc', join: 'CUSTRECORD_MTS_RPSNOS_BRSETUP'});
				_result.layoutDanfePortrait = result.getValue({name: 'custrecord_mts_danfeportrait_brsetup'});
				_result.layoutDanfeLandscape = result.getValue({name: 'custrecord_mts_danfelandscape_brsetup'});
				_result.layoutProcessCCe = result.getValue({name: 'custrecord_mts_processcce_brsetup'});
				_result.layoutIssSettlement = result.getValue({name: 'custrecord_mts_isssettlement_brsetup'});
				_result.mandatoryOperationSetup = result.getValue({name:'custrecord_mts_mandatoryopertype_brsetup'});
				_result.additionalTextDifICMS = result.getValue({name: 'custrecord_mts_additionaltextdif_brsetup'});
				_result.validatewebservic = result.getValue({name: 'custrecord_mts_validatewebservic_brsetup'});
			});
		}
		return _result;
	}//end brsetup()

	
	function getBRCompanyInformation() {
		var _result={};
		var customrecord_mts_brcompSearchObj = search.create({
			   type: "customrecord_mts_brcomp",
			   filters:
			   [
			   ],
			   columns:
			   [
			      "custrecord_mts_subsidiary_brcomp",
			      "custrecord_mts_brazilianfunct_brcomp",
			      "custrecord_mts_fantasyname_brcomp",
			      "custrecord_mts_ie_brcomp",
			      "custrecord_mts_cnpj_brcomp",
			      "custrecord_mts_ccm_brcomp",
			      "custrecord_mts_optionassignment_brcomp",
			      "custrecord_mts_addressforefiles_brcomp",
			      "custrecord_mts_rpsnos_brcomp",
			      "custrecord_mts_fantasyname_brcomp"
			   ]
			});
			var searchResultCount = customrecord_mts_brcompSearchObj.runPaged().count;
			_result.length = searchResultCount;
			log.debug("customrecord_mts_brcompSearchObj result count",searchResultCount);
			customrecord_mts_brcompSearchObj.run().each(function(result){
			   
				 _result.subsidiary = result.getValue({name: "custrecord_mts_subsidiary_brcomp"});
				 _result.brazilianfunct = result.getValue({name: "custrecord_mts_brazilianfunct_brcomp"});
				 _result.fantasyname = result.getValue({name: "custrecord_mts_fantasyname_brcomp"});
				 _result.ie = result.getValue({name: "custrecord_mts_ie_brcomp"});
				 _result.cnpj = result.getValue({name: "custrecord_mts_cnpj_brcomp"});
				 _result.ccm = result.getValue({name: "custrecord_mts_ccm_brcomp"});
				 _result.optionassignment = result.getValue({name: "custrecord_mts_optionassignment_brcomp"});
				 _result.addressforefiles = result.getValue({name: "custrecord_mts_addressforefiles_brcomp"});
				 _result.rpsnoss = result.getValue({name: "custrecord_mts_rpsnos_brcomp"});
				 _result.fantasyname = result.getValue({name: "custrecord_mts_fantasyname_brcomp"});
			   //return true;
			});
			return _result;
	}// end function BRCompanyInformation()
	
	function getServiceCode(lvfilters){
		var _result = {};
		var _array = new Array();
		var SearchServiceCode = search.create({
			type: 'customrecord_mts_servicecode',//Service Code
			filters:lvfilters,
			columns:[
			          {name: 'name'},//Name
			          {name: 'custrecord_mts_description_servicecode'},//Description
			          {name: 'custrecord_mts_accountno_servicecode'},//Account No.
			          {name: 'custrecord_mts_taxgroupcode_servicecode'},//Tax Group Code
			          {name: 'custrecord_mts_irrfretgroup_servicecode'},//IRRF Ret. Group Code
			          {name: 'custrecord_mts_servicecode_servicecode'},//Service Code
			          {name: 'custrecord_mts_pisretgroup_servicecode'},//Pis Ret. Group Code
			          {name: 'custrecord_mts_cofinsretgrou_servicecode'},//Cofins Ret. Group Code
			          {name: 'custrecord_mts_cslretgroup__servicecode'},//CSL Ret. Group Code
			          {name: 'custrecord_mts_federalservic_servicecode'},//Federal Service Code
			          {name: 'custrecord_mts_description2_servicecode'},//Description 2
			          {name: 'custrecord_mts_inssretgroup_servicecode'},//INSS Ret. Group Code
			          {name: 'custrecord_mts_city_servicecode'},//City
			          {name: 'custrecord_mts_state_servicecode'},//State
			          {name: 'custrecord_mts_cte_servicecode'},//Cte
			          {name: 'custrecord_mts_servicecubite_servicecode'},//Service Code SubItem
			          {name: 'custrecord_mts_cityhalltaxed_servicecode'},//City Hall Taxed Out
			          {name: 'custrecord_mts_ceiinss_servicecode'},//Cei INSS
			          {name: 'custrecord_mts_workregistration_service'},//Work Registration
			          {name: 'custrecord_mts_ibgecitycode_servicecode'},//IBGE City Code
			          {name: 'custrecord_mts_lstcode_servicecode'},//LST Code
			          {name: 'custrecord_mts_genprodpostin_servicecode'},//Gen. Prod. Posting Group
			          {name: 'custrecord_mts_codebasecalc_servicecode'},//Code Base Calculation (Credit)
			          {name: 'custrecord_mts_economicactiv_servicecode'},//Economic Activity Code
			          {name: 'custrecord_mts_resourceno_servicecode'},//Resource No
			          {name: 'custrecord_mts_ibptcodes_servicecode'},//IBPT Codes
			          {name: 'custrecord_mts_serviceexecut_servicecode'},//Service executed Abroad
			          
			        ]
		});
		
		var resultlength = SearchServiceCode.runPaged().count;
		
		if (resultlength){
			SearchServiceCode.run().each(function (servicecode){
				_result = {};
				_result.numberlines = resultlength;
		    	_result.name = servicecode.getValue({name: 'name'});
		    	_result.description = servicecode.getValue({name: 'custrecord_mts_description_servicecode'});
		    	_result.accountno = servicecode.getValue({name: 'custrecord_mts_accountno_servicecode'});
		    	_result.taxgroupcode = servicecode.getValue({name: 'custrecord_mts_taxgroupcode_servicecode'});
		    	_result.irrfretgroupcode = servicecode.getValue({name: 'custrecord_mts_irrfretgroup_servicecode'});
		    	_result.servicecode = servicecode.getValue({name: 'custrecord_mts_servicecode_servicecode'});
		    	_result.pisretgroup = servicecode.getValue({name: 'custrecord_mts_pisretgroup_servicecode'});
		    	_result.cofinsretgroup = servicecode.getValue({name: 'custrecord_mts_cofinsretgrou_servicecode'});
		    	_result.cslretgroup = servicecode.getValue({name: 'custrecord_mts_cslretgroup__servicecode'});
		    	_result.federalservicecode = servicecode.getValue({name: 'custrecord_mts_federalservic_servicecode'});
		    	_result.description2 = servicecode.getValue({name: 'custrecord_mts_description2_servicecode'});
		    	_result.inssretgroup = servicecode.getValue({name: 'custrecord_mts_inssretgroup_servicecode'});
		    	_result.city = servicecode.getValue({name: 'custrecord_mts_city_servicecode'});
		    	_result.state = servicecode.getValue({name: 'custrecord_mts_state_servicecode'});
		    	_result.cte = servicecode.getValue({name: 'custrecord_mts_cte_servicecode'});
		    	_result.servicecodesubitem = servicecode.getValue({name: 'custrecord_mts_servicecubite_servicecode'});
		    	_result.cityhalltaxedout = servicecode.getValue({name: 'custrecord_mts_cityhalltaxed_servicecode'});
		    	_result.ceiinss = servicecode.getValue({name: 'custrecord_mts_ceiinss_servicecode'});
		    	_result.workregistration = servicecode.getValue({name: 'custrecord_mts_workregistration_service'});
		    	_result.ibgecitycode = servicecode.getValue({name: 'custrecord_mts_ibgecitycode_servicecode'});
		    	_result.lstcode = servicecode.getValue({name: 'custrecord_mts_lstcode_servicecode'});
		    	_result.genprodpostinggroup = servicecode.getValue({name: 'custrecord_mts_genprodpostin_servicecode'});
		    	_result.codebasecalculation = servicecode.getValue({name: 'custrecord_mts_codebasecalc_servicecode'});
		    	_result.economicactivitycode = servicecode.getValue({name: 'custrecord_mts_economicactiv_servicecode'});
		    	_result.resourceno = servicecode.getValue({name: 'custrecord_mts_resourceno_servicecode'});
		    	_result.ibptcodes = servicecode.getValue({name: 'custrecord_mts_ibptcodes_servicecode'});
		    	_result.serviceexecutedabroad = servicecode.getValue({name: 'custrecord_mts_serviceexecut_servicecode'});
		    	_array.push(_result);
		    	return true;
		    });
		}else{
			_array.push(_result);
		}
		return _array;
	}

	function getServiceCodeByRecLoad(lvId) {
		var serviceCodeRecLoad = getRecordLoad('customrecord_mts_servicecode', lvId);
		if (serviceCodeRecLoad) {
			return {
				recordObj:serviceCodeRecLoad,
				id: serviceCodeRecLoad.id,
				name: serviceCodeRecLoad.getValue({fieldId: 'name'}),
				description: serviceCodeRecLoad.getValue({fieldId: 'custrecord_mts_description_servicecode'}),
				ibptCode: serviceCodeRecLoad.getText({fieldId: 'custrecord_mts_ibptcodes_servicecode'}),
				serviceCode: serviceCodeRecLoad.getValue({fieldId: 'custrecord_mts_servicecode_servicecode'}),
			}						
		}else{
			return;
		}	
	}
	
	function getBranchInformation(lvfilters) {
		var objAux = {};
		var objList = [];
		var _branchinfo = search.create({
		   type: "customrecord_mts_branchinfo",
		   filters: lvfilters,
		   columns:
		   [
		      "name",
		      "internalid",
		      "custrecord_mts_subsidiary_branchinfo",
		      "custrecord_mts_rpsnos_branchinfo",
		      "custrecord_mts_environmentid_branchinfo",
		      "custrecord_mts_invoicingway_branchinfo",
		      "custrecord_mts_cnpj_branchinfo",
		      "custrecord_mts_ie_branchinfo",
		      "custrecord_mts_cnaes_branchinfo",
		      "custrecord_mts_territorycode_branchinfo",
		      "custrecord_mts_sendflpath_branchinfo",
		      "custrecord_mts_idfdsendflpath_brcinfo",
		      "custrecord_mts_retflpath_branchinfo",
		      "custrecord_mts_idfdretflpath_brcinfo",
		      "custrecord_mts_ccm_branchinfo",
		      "custrecord_mts_number_cce_branchinfo"
		   ]
		});
	
		var resultCount = _branchinfo.runPaged().count;
		if (resultCount) {
			_branchinfo.run().each(function(result){
				objAux = {};
				objAux.name = result.getValue({name: 'name'});
				objAux.internalid = result.getValue({name: 'internalid'});
				objAux.rpsno = result.getValue({name: 'custrecord_mts_rpsnos_branchinfo'});
				objAux.rpsnotext = result.getText({name: 'custrecord_mts_rpsnos_branchinfo'});
				objAux.subsidiary = result.getText({name: 'custrecord_mts_subsidiary_branchinfo'});
				objAux.environmentid = result.getValue({name: 'custrecord_mts_environmentid_branchinfo'});
				objAux.invoicingway = result.getValue({name: 'custrecord_mts_invoicingway_branchinfo'});
				objAux.cnpj = result.getValue({name: 'custrecord_mts_cnpj_branchinfo'});
				objAux.ie = result.getValue({name: 'custrecord_mts_ie_branchinfo'});
				objAux.cnaes = result.getValue({name: 'custrecord_mts_cnaes_branchinfo'});
				objAux.territoryCode = result.getText({name: 'custrecord_mts_territorycode_branchinfo'});
				objAux.terrCodeValue = result.getValue({name: 'custrecord_mts_territorycode_branchinfo'});
				objAux.sendFilePath = result.getValue({name: 'custrecord_mts_sendflpath_branchinfo'});
				objAux.idFdSendFilePath = result.getValue({name: 'custrecord_mts_idfdsendflpath_brcinfo'});
				objAux.retFilePath = result.getValue({name: 'custrecord_mts_retflpath_branchinfo'});
				objAux.idFdRetFilePath = result.getValue({name: 'custrecord_mts_idfdretflpath_brcinfo'});
				objAux.ccm = result.getValue({name: 'custrecord_mts_ccm_branchinfo'});
				objAux.numberCce = result.getValue({name: 'custrecord_mts_number_cce_branchinfo'});
				
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}

	function getBranchInformationByRecLoad(lvId) {
		// using record.load
		var BranchInfoRecLoad = getRecordLoad('customrecord_mts_branchinfo', lvId);
		if (BranchInfoRecLoad) {
			return {
				recordObj:BranchInfoRecLoad,
				id: BranchInfoRecLoad.id,
				name: BranchInfoRecLoad.getValue({fieldId: 'name'}),
				companyName: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_name_branch_branchinfo'}),
				fantasyName: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_fantasyname_branchinfo'}),
				rpsnos: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_rpsnos_branchinfo'}),
				rpsnostext: BranchInfoRecLoad.getText({fieldId: 'custrecord_mts_rpsnos_branchinfo'}),
				subsidiaryid: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_subsidiary_branchinfo'}),
				subsidiaryname: BranchInfoRecLoad.getText({fieldId: 'custrecord_mts_subsidiary_branchinfo'}),
				environmentid: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_environmentid_branchinfo'}),
				invoicingway: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_invoicingway_branchinfo'}),
				invoicingwayText: BranchInfoRecLoad.getText({fieldId: 'custrecord_mts_invoicingway_branchinfo'}),
				cnpj: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_cnpj_branchinfo'}).replace(/\.|\/|-/g, ''),
				ie: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_ie_branchinfo'}).replace(/\.|\/|-/g, ''),
				cnaes: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_cnaes_branchinfo'}),
				ccm: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_ccm_branchinfo'}).replace(/\.|\/|-/g, ''),
				danfeprintinglayout: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_danfeprintlayo_branchinfo'}),
				dateTimeContingency: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_datetimecont_branchinfo'}),
				justificationContingency: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_justificationc_branchinfo'}),
				rpsVersion: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_rpsversion_branchinfo'}),
				keyNos: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_keynos_branchinfo'}),
				phoneNo: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_phoneno_branchinfo'}).replace(/\.|\/|-/g, ''),
				territoryCode: BranchInfoRecLoad.getValue({fieldId: 'custrecord_mts_territorycode_branchinfo'}),
				// Labels 
				cnaesLabel: BranchInfoRecLoad.getField({fieldId: 'custrecord_mts_cnaes_branchinfo'}).label,
				danfeprintinglayoutLabel: BranchInfoRecLoad.getField({fieldId: 'custrecord_mts_danfeprintlayo_branchinfo'}).label,
				invoicingwayLabel: BranchInfoRecLoad.getField({fieldId: 'custrecord_mts_invoicingway_branchinfo'}).label
			}						
		}else{
			return;
		}	
	}
	
	function getCalendarHoliday(lvfilters){
		var objAux = {};
		var objList = [];

		var _calendarholidaysearch = search.create({
		   type: "customrecord_mts_calendarholiday",//Calendar Holiday
		   filters: lvfilters,
		   columns:
		   [
		      "custrecord_mts_branch_calendarholiday",
		      "custrecord_mts_date_calendarholiday",
		      "custrecord_mts_descripti_calendarholiday",
		   ]
		});

		var resultCount = _calendarholidaysearch.runPaged().count;
		if (resultCount) {
			_calendarholidaysearch.run().each(function(result){
				objAux.branchcode = result.getValue({name: 'custrecord_mts_branch_calendarholiday'});
				objAux.internalid = result.id;
				objAux.date = result.getValue({name: 'custrecord_mts_date_calendarholiday'});
				objAux.description = result.getText({name: 'custrecord_mts_descripti_calendarholiday'});
				
				objList.push(objAux);
				return true;
			});			
		}

		return objList;
    }
    
    function getPaymentMethod(lvfilters) {//Payment Method Loc. ->Payment Method(STD)
		var objAux = {};
		var objList = [];

    	var customrecord_mts_paymethodSearchObj = search.create({
    		   type: "customrecord_mts_paymethod",
    		   filters: lvfilters,
    		   columns:
    		   [
    		      "internalid",
				  "custrecord_mts_paymetstandard_paymethod",
				  "custrecord_mts_payment_paymethod",
				  "custrecord_mts_titletype_paymethod",
				  "custrecord_mts_ebillingcode_paymethod",
				  "custrecord_mts_paydettype_paymethod",
				  "custrecord_mts_credittittletyp_paymethod",
				  "custrecord_mts_paytypenfe_paymethod",
				  "custrecord_mts_fielddescriptions",
				  "custrecord_mts_fieldbalaccounttype",
				  "custrecord_mts_fieldbalaccountno",
				  "custrecord_mts_fielddirectdebit",
				  "custrecord_mts_fielddirectdebittermscode",
				  "custrecord_mts_pmtexport_payment",
				  "custrecord_mts_bankdata_payment"
    		   ]
		});
			
		var resultCount = customrecord_mts_paymethodSearchObj.runPaged().count;
		if (resultCount) {
			customrecord_mts_paymethodSearchObj.run().each(function(result){
				objAux = {};
				objAux.internalid = result.getValue({name: 'internalid'});
				objAux.paymetStandard = result.getValue({name: 'custrecord_mts_paymetstandard_paymethod'});
				objAux.paymetStandardText = result.getText({name: 'custrecord_mts_paymetstandard_paymethod'});
				objAux.payment = result.getValue({name: "custrecord_mts_payment_paymethod"});
				objAux.titleType = result.getValue({name: "custrecord_mts_titletype_paymethod"});
				objAux.ebillingcode = result.getValue({name: "custrecord_mts_ebillingcode_paymethod"});
				objAux.paymentDetailType = result.getValue({name: "custrecord_mts_paydettype_paymethod"});
				objAux.paymentDetailTypeText = result.getText({name: "custrecord_mts_paydettype_paymethod"});
				objAux.creditTitleType = result.getValue({name: "custrecord_mts_credittittletyp_paymethod"});
				objAux.creditTitleTypeText = result.getText({name: "custrecord_mts_credittittletyp_paymethod"});
				objAux.paymentTypeNfe = result.getValue({name: "custrecord_mts_paytypenfe_paymethod"});
				objAux.paymentTypeNfeText = result.getText({name: "custrecord_mts_paytypenfe_paymethod"});
				objAux.description = result.getValue({name: "custrecord_mts_fielddescriptions"});
				objAux.balAccountType = result.getValue({name: "custrecord_mts_fieldbalaccounttype"});
				objAux.balAccountTypeText = result.getText({name: "custrecord_mts_fieldbalaccounttype"});
				objAux.balAccountNo = result.getValue({name: "custrecord_mts_fieldbalaccountno"});
				objAux.directDebit = result.getValue({name: "custrecord_mts_fielddirectdebit"});
				objAux.directDebitPmtTermsCode = result.getValue({name: "custrecord_mts_fielddirectdebittermscode"});
				objAux.directDebitPmtTermsCodeText = result.getText({name: "custrecord_mts_fielddirectdebittermscode"});
				objAux.pmtExportLineDefinition = result.getValue({name:"custrecord_mts_pmtexport_payment"});
				objAux.bankDataConversionPmtType = result.getValue({name:"custrecord_mts_bankdata_payment"});
				objAux.bankDataConversionPmtTypeText = result.getText({name:"custrecord_mts_bankdata_payment"});
				objList.push(objAux);
				return true;
			});
		}

		return objList;
	}

	function getPaymentMethodByRecLoad(lvId) {
		var paymentMethodRecLoad = getRecordLoad('customrecord_mts_paymethod', lvId);
		if (paymentMethodRecLoad) {
			return {
				recordObj:paymentMethodRecLoad,
				id: paymentMethodRecLoad.id,
				name: paymentMethodRecLoad.getValue({fieldId: 'name'}),
				paymentTypeNFe: paymentMethodRecLoad.getValue({fieldId: 'custrecord_mts_paytypenfe_paymethod'}),
				paymentTypeNFeText: paymentMethodRecLoad.getText({fieldId: 'custrecord_mts_paytypenfe_paymethod'}),
				payment : paymentMethodRecLoad.getValue({fieldId: "custrecord_mts_payment_paymethod"}),
				titleType : paymentMethodRecLoad.getValue({fieldId: "custrecord_mts_titletype_paymethod"}),
				ebillingcode : paymentMethodRecLoad.getValue({fieldId: "custrecord_mts_ebillingcode_paymethod"}),
				paymentDetailType : paymentMethodRecLoad.getValue({fieldId: "custrecord_mts_paydettype_paymethod"}),
				paymentDetailTypeText : paymentMethodRecLoad.getText({fieldId: "custrecord_mts_paydettype_paymethod"}),
				creditTitleType : paymentMethodRecLoad.getValue({fieldId: "custrecord_mts_credittittletyp_paymethod"}),
				creditTitleTypeText : paymentMethodRecLoad.getText({fieldId: "custrecord_mts_credittittletyp_paymethod"}),
				description : paymentMethodRecLoad.getValue({fieldId: "custrecord_mts_fielddescriptions"}),
				balAccountType : paymentMethodRecLoad.getValue({fieldId: "custrecord_mts_fieldbalaccounttype"}),
				balAccountTypeText : paymentMethodRecLoad.getText({fieldId: "custrecord_mts_fieldbalaccounttype"}),
				balAccountNo : paymentMethodRecLoad.getValue({fieldId: "custrecord_mts_fieldbalaccountno"}),
				directDebit : paymentMethodRecLoad.getValue({fieldId: "custrecord_mts_fielddirectdebit"}),
				directDebitPmtTermsCode : paymentMethodRecLoad.getValue({fieldId: "custrecord_mts_fielddirectdebittermscode"}),
				directDebitPmtTermsCodeText : paymentMethodRecLoad.getText({fieldId: "custrecord_mts_fielddirectdebittermscode"}),
				pmtExportLineDefinition : paymentMethodRecLoad.getValue({fieldId:"custrecord_mts_pmtexport_payment"}),
				bankDataConversionPmtType : paymentMethodRecLoad.getValue({fieldId:"custrecord_mts_bankdata_payment"}),
				bankDataConversionPmtTypeText : paymentMethodRecLoad.getText({fieldId:"custrecord_mts_bankdata_payment"}),
				
				//Labels
				nameLabel: paymentMethodRecLoad.getField({fieldId: 'name'}).label,
				paymentTypeNFeLabel: paymentMethodRecLoad.getField({fieldId: 'custrecord_mts_paytypenfe_paymethod'}).label,
				paymentLabel : paymentMethodRecLoad.getField({fieldId: "custrecord_mts_payment_paymethod"}).label,
				titleTypeLabel : paymentMethodRecLoad.getField({fieldId: "custrecord_mts_titletype_paymethod"}).label,
				ebillingcodeLabel : paymentMethodRecLoad.getField({fieldId: "custrecord_mts_ebillingcode_paymethod"}).label,
				paymentDetailTypeLabel : paymentMethodRecLoad.getField({fieldId: "custrecord_mts_paydettype_paymethod"}).label,
				creditTitleTypeLabel : paymentMethodRecLoad.getField({fieldId: "custrecord_mts_credittittletyp_paymethod"}).label,
				descriptionLabel : paymentMethodRecLoad.getField({fieldId: "custrecord_mts_fielddescriptions"}).label,
				balAccountTypeLabel : paymentMethodRecLoad.getField({fieldId: "custrecord_mts_fieldbalaccounttype"}).label,
				balAccountNoLabel : paymentMethodRecLoad.getField({fieldId: "custrecord_mts_fieldbalaccountno"}).label,
				directDebitLabel : paymentMethodRecLoad.getField({fieldId: "custrecord_mts_fielddirectdebit"}).label,
				directDebitPmtTermsCodeLabel : paymentMethodRecLoad.getField({fieldId: "custrecord_mts_fielddirectdebittermscode"}).label,
				pmtExportLineDefinitionLabel : paymentMethodRecLoad.getField({fieldId:"custrecord_mts_pmtexport_payment"}).label,
				bankDataConversionPmtTypeLabel : paymentMethodRecLoad.getField({fieldId:"custrecord_mts_bankdata_payment"}).label
			}						
		}else{
			return;
		}	
	}

	function getPaymentTermByRecLoad(lvId) {
		var paymentTermAux = {};

		var paymentTermRecLoad = getRecordLoad('customrecord_mts_paymentterms', lvId);
		if (paymentTermRecLoad) {
			paymentTermAux.recordObj = paymentTermRecLoad;
			paymentTermAux.id = paymentTermRecLoad.id;
			paymentTermAux.name = paymentTermRecLoad.getValue({fieldId: 'name'});
			paymentTermAux.numberOfDueDate = paymentTermRecLoad.getValue({fieldId: 'custrecord_mts_numberofdue_paymentterms'});
			paymentTermAux.specificDueDateCode = paymentTermRecLoad.getValue({fieldId: 'custrecord_mts_specificdued_paymentterms'});
			paymentTermAux.partialPayments = [];

			// read Partial Payments
			numLinesPartialPay = paymentTermRecLoad.getLineCount({sublistId: 'recmachcustrecord_mts_paytermscode_partpay'});
			if (numLinesPartialPay) {
				for (var count = 0; count < numLinesPartialPay; count++) {
					partialPaytsAux = {};
					partialPaytsAux.id = paymentTermRecLoad.getSublistValue({
						sublistId: 'recmachcustrecord_mts_paytermscode_partpay',
						fieldId: 'id',
						line: count
					});
					partialPaytsAux.duePeriodCalc = paymentTermRecLoad.getSublistValue({
						sublistId: 'recmachcustrecord_mts_paytermscode_partpay',
						fieldId: 'custrecord_mts_dueperiodcalc_partpay',
						line: count
					});
					partialPaytsAux.percOfTheTotal = paymentTermRecLoad.getSublistValue({
						sublistId: 'recmachcustrecord_mts_paytermscode_partpay',
						fieldId: 'custrecord_mts_percentofthetotal_partpay',
						line: count
					});
					paymentTermAux.partialPayments.push(partialPaytsAux);
				}
			}
			
			return paymentTermAux;
			//}						
		}else{
			return paymentTermAux;
		}	
	}

	function getFiscalDocumentType(lvFilters) {
		var objAux = {};
		var objList = [];

		var customrecord_mts_FiscalDocTypeSearchObj = search.create({
			type: "customrecord_mts_fiscaldoctype",
			filters: lvFilters,
			columns:
			[
			   "internalid",
			   "name",
			   "custrecord_mts_description_fiscaldoctype",
			   "custrecord_mts_nfeshelf_fiscaldoctype",
			   "custrecord_mts_cityhallinv_fiscaldoctype",
			   "custrecord_mts_especie_fiscaldoctype",
			   "custrecord_mts_elecfilecod_fiscaldoctype",
			   "custrecord_mts_postnoserie_fiscaldoctype",
			   "custrecord_mts_estimibpt_fiscaldoctype",
			   "custrecord_mts_printserie_fiscaldoctype"
			]
	 });
	 
	 var resultCount = customrecord_mts_FiscalDocTypeSearchObj.runPaged().count;
	 if (resultCount) {
		 customrecord_mts_FiscalDocTypeSearchObj.run().each(function(result){
				objAux = {};
				objAux.Id = result.getValue({name: 'internalid'});
				objAux.Name = result.getValue({name: 'name'});
				objAux.Description = result.getValue({name: 'custrecord_mts_description_fiscaldoctype'});
				objAux.NFeShelt = result.getValue({name: 'custrecord_mts_nfeshelf_fiscaldoctype'})
				objAux.CityHallInvoice = result.getValue({name: 'custrecord_mts_cityhallinv_fiscaldoctype'});
				objAux.CityHallInvoiceText = result.getText({name: 'custrecord_mts_cityhallinv_fiscaldoctype'});
				objAux.EstimateIBPT = result.getValue({name: 'custrecord_mts_estimibpt_fiscaldoctype'});
				objAux.Species = result.getValue({name: 'custrecord_mts_especie_fiscaldoctype'});
				objAux.ElectronicFileCode = result.getValue({name: 'custrecord_mts_elecfilecod_fiscaldoctype'});
				objAux.PostingNoSeries = result.getValue({name: 'custrecord_mts_postnoserie_fiscaldoctype'});
				objAux.printSerie = result.getValue({name: 'custrecord_mts_printserie_fiscaldoctype'});
				objList.push(objAux);
				return true;
			});
		}
    	
    	return objList;
	}

	function getFiscalDocumentTypeByRecLoad(lvId){
		// using record.load
		var FiscalDocTypeRecLoad = getRecordLoad('customrecord_mts_fiscaldoctype', lvId);
		if (FiscalDocTypeRecLoad) {
			return {
				recordObj:FiscalDocTypeRecLoad,
				id: FiscalDocTypeRecLoad.id,
				name: FiscalDocTypeRecLoad.getValue({fieldId: 'name'}),// name
				description: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_description_fiscaldoctype'}),
				nfeShelt: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_nfeshelf_fiscaldoctype'}),
				cityHallInvoice: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_cityhallinv_fiscaldoctype'}),
				cityHallInvoiceText: FiscalDocTypeRecLoad.getText({fieldId: 'custrecord_mts_cityhallinv_fiscaldoctype'}),
				species: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_especie_fiscaldoctype'}),
				electronicFileCode: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_elecfilecod_fiscaldoctype'}),
				estimateIBPT : FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_estimibpt_fiscaldoctype'}),
				efdBlocks: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_efdblocks_fiscaldoctype'}),
				postingNoSeries: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_postnoserie_fiscaldoctype'}),
				nfsFiscalNature: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_nfsfiscal_fiscaldoctype'}),
				notSubject: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_notsubject_fiscaldoctype'}),
				printSerie: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_printserie_fiscaldoctype'}),
				printSubSerie: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_printsubser_fiscaldoctype'}),
				nftsDocumentType: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_nftsdoctype_fiscaldoctype'}),
				branchCode: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_branch_fiscaldoctype'}),
				branchCodeText: FiscalDocTypeRecLoad.getText({fieldId: 'custrecord_mts_branch_fiscaldoctype'}),
			    validated: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_validated_fiscaldoctype'}),
			    validatedCityIbgeCodeD100: FiscalDocTypeRecLoad.getValue({fieldId: 'custrecord_mts_validibjed1_fiscaldoctype'}),
			    //Labels
				nameLabel: FiscalDocTypeRecLoad.getField({fieldId: 'name'}),// name
				descriptionLabel: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_description_fiscaldoctype'}),
				nfeSheltLabel: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_nfeshelf_fiscaldoctype'}),
				cityHallInvoiceLabel: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_cityhallinv_fiscaldoctype'}),
				speciesLabel: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_especie_fiscaldoctype'}),
				electronicFileCodeLabel: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_elecfilecod_fiscaldoctype'}),
				estimateIBPTLabel : FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_estimibpt_fiscaldoctype'}),
				efdBlocksLabel: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_efdblocks_fiscaldoctype'}),
				postingNoSeriesLabel: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_postnoserie_fiscaldoctype'}),
				nfsFiscalNatureLabel: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_nfsfiscal_fiscaldoctype'}),
				notSubjectLabel: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_notsubject_fiscaldoctype'}),
				printSerieLabel: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_printserie_fiscaldoctype'}),
				printSubSerieLabel: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_printsubser_fiscaldoctype'}),
				nftsDocumentTypeLabel: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_nftsdoctype_fiscaldoctype'}),
				branchCodeLabel: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_branch_fiscaldoctype'}),
			    validatedLabel: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_validated_fiscaldoctype'}),
			    validatedCityIbgeCodeD100Label: FiscalDocTypeRecLoad.getField({fieldId: 'custrecord_mts_validibjed1_fiscaldoctype'})
			}						
		}else{
			return;
		}	
	}

	function getSubsidiary(lvFilters){
		var objAux = {};
		var objList = [];

    	var subsidiarySearch = search.create({
    		   type: "subsidiary",
    		   filters: lvFilters,
    		   columns:
    		   [
				   "internalid",
				   "name",
				   "parent",
				   "legalname",
				   "custrecord_mts_branch_information",
				   search.createColumn({
					   name: "country",
					   join: "address"
					}),
				   search.createColumn({
					   name: "state",
					   join: "address"
				    }),
			       search.createColumn({
					   name: "city",
					   join: "address"
					}),
				   search.createColumn({
					   name: "zip",
					   join: "address"
				   }),
				   search.createColumn({
					   name: "custrecord_mtsdistrict",
					   join: "address"
				   }),
				   search.createColumn({
					   name: "address1",
					   join: "address"
				   }),
				   search.createColumn({
					  name: "custrecord_mts_number",
					  join: "address"
				   }),
				   search.createColumn({
					   name: "custrecord_mts_dimobcitycode_address",
					   join: "address"
				   }),
				   search.createColumn({
					   name: "custrecord_mts_ibgecitycode",
					   join: "address"
				   }),
				   search.createColumn({
					name: "custrecord_mts_complement",
					join: "address"
				}),
    		   ]
    	});
    	
		var resultCount = subsidiarySearch.runPaged().count;
		if (resultCount) {
			subsidiarySearch.run().each(function(result){
				objAux = {};
				objAux.Id = result.getValue({name: 'internalid'});
				objAux.Name = result.getValue({name: 'name'});
				objAux.SubsidiaryOf = result.getValue({name: 'parent'});
				objAux.LegalName = result.getValue({name: 'legalname'});
				objAux.Country = result.getValue({name: 'country', join: 'address'});
				objAux.State = result.getValue({name: 'state', join: 'address'});
				objAux.City = result.getValue({name: 'city', join: 'address'});
				objAux.Zip = result.getValue({name: 'zip', join: 'address'});
				objAux.District = result.getValue({name: 'custrecord_mtsdistrict', join: 'address'});
				objAux.Address = result.getValue({name: 'address1', join: 'address'});
				objAux.Complement = result.getValue({name: 'custrecord_mts_complement', join: 'address'});
				objAux.Number = result.getValue({name: 'custrecord_mts_number', join: 'address'});
				objAux.DIMOBCode = result.getValue({name: 'custrecord_mts_dimobcitycode_address', join: 'address'});
				objAux.IBGECode = result.getValue({name: 'custrecord_mts_ibgecitycode', join: 'address'});
				
				var BranchInfoId = result.getValue('custrecord_mts_branch_information');
				if (BranchInfoId)
					objAux.BranchInformation = getBranchInformationByRecLoad(BranchInfoId);
				
				objList.push(objAux);
				return true;
			});
		}
    	
    	return objList;
	}

	function getSubsidiaryByRecLoad(lvId){
		// using record.load
		var subsidiaryRecLoad = getRecordLoad('subsidiary', lvId);
		if (subsidiaryRecLoad) {
			var subsObj = {
				recordObj:subsObj,
				id: subsidiaryRecLoad.id,
				name: subsidiaryRecLoad.getValue({fieldId: 'name'}),
				subsidiaryOf: subsidiaryRecLoad.getValue({fieldId: 'parent'}),
				legalName: subsidiaryRecLoad.getValue({fieldId: 'legalname'}),
				branchInformation: subsidiaryRecLoad.getValue({fieldId:'custrecord_mts_branch_information'}) ? getBranchInformationByRecLoad(subsidiaryRecLoad.getValue({fieldId:'custrecord_mts_branch_information'})) : null
			}
			var mainAddressRec = subsidiaryRecLoad.getSubrecord({fieldId:'mainaddress'});
			subsObj.country = mainAddressRec.getValue({fieldId: 'country'});
			subsObj.countryText = mainAddressRec.getText({fieldId: 'country'});
			subsObj.state = mainAddressRec.getValue({fieldId: 'state'});
			subsObj.city = mainAddressRec.getValue({fieldId: 'city'});
			subsObj.zipCode = mainAddressRec.getValue({fieldId: 'zip',}).replace(/-/g, '');
			subsObj.district = mainAddressRec.getValue({fieldId: 'custrecord_mtsdistrict'});
			subsObj.address = mainAddressRec.getValue({fieldId: 'addr1'});
			subsObj.complemet = mainAddressRec.getValue({fieldId: 'custrecord_mts_complement'});
			subsObj.number = mainAddressRec.getValue({fieldId: 'custrecord_mts_number'});
			subsObj.dimobCode = mainAddressRec.getValue({fieldId: 'custrecord_mts_dimobcitycode_address'});
			subsObj.ibgeCityCode = mainAddressRec.getValue({fieldId: 'custrecord_mts_ibgecitycode'});
			
			// get territory informations
			var territoryList = getTerritories(['name', 'is', subsObj.state]);
			subsObj.ibgeTerritoryCode = territoryList.length ? territoryList[0].ibgeCode : '';

			// get country informations
			var countryList = getCountries(['name', 'is', subsObj.country]);
			subsObj.countryDescription = countryList.length ? countryList[0].description : '';
			subsObj.countryBacenCode = countryList.length ? countryList[0].bacenCode : '';

			return subsObj;
		}else{
			return;
		}	
	}

	function getTerritories(lvfilters) {
		var objAux = {};
		var objList = [];
		
		var territoriesSearch = search.create({
		   type: "customrecord_mts_territories",
		   filters: lvfilters,
		   columns:
		   [
			   "internalid",  
			   "name",
			   "custrecord_mts_ibgecode_territories"
		   ]
		});
	
		if (territoriesSearch.runPaged().count) {
			territoriesSearch.run().each(function(result){
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.name = result.getValue({name: 'name'});
				objAux.ibgeCode = result.getValue({name: 'custrecord_mts_ibgecode_territories'});
				
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}

	function getCountries(lvfilters) {
		var objAux = {};
		var objList = [];
		
		var countriesSearch = search.create({
		   type: "customrecord_mts_countries",
		   filters: lvfilters,
		   columns:
		   [
			   "internalid",  
			   "name",
			   "custrecord_mts_description_countries",
			   "custrecord_mts_bacencountry_countries"
		   ]
		});
	
		if (countriesSearch.runPaged().count) {
			countriesSearch.run().each(function(result){
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.name = result.getValue({name: 'name'});
				objAux.description = result.getValue({name: 'custrecord_mts_description_countries'});
				objAux.bacenCode = result.getValue({name: 'custrecord_mts_bacencountry_countries'});
				
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}

	function getIESTCodes(lvfilters) {
		var objAux = {};
		var objList = [];
		
		var ieSTCodesSearch = search.create({
		   type: "customrecord_mts_iestcode",
		   filters: lvfilters,
		   columns:
		   [
			   "internalid",
			   "name",
			   "custrecord_mts_iest_iestcode"
		   ]
		});
	
		var resultCount = ieSTCodesSearch.runPaged().count;
		if (resultCount) {
			ieSTCodesSearch.run().each(function(result){
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.name = result.getValue({name: 'name'});
				objAux.ieST = result.getValue({name: 'custrecord_mts_iest_iestcode'});
				
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}
	
	function getOperationType(lvFilters){
		// using search
		var objAux = {};
		var objList = [];
		
		var _operationSetup = search.create({
		   type: "customrecord_mts_opsetup",
		   filters: lvfilters,
		   columns:
		   [
		      "name",
		      "internalid",
		      "custrecord_mts_description_opsetup",
		      "custrecord_mts_item_entry_opsetup",
		      "custrecord_mts_gl_entry_opsetup",
		      "custrecord_mts_post_tax_opsetup",
		      "custrecord_mts_cust_vend_entry_opsetup",
		      "custrecord_mts_gen_bus_posting_opsetup",
		      "custrecord_mts_gen_prod_posting_opsetup",
		      "custrecord_mts_custpostinggroup_opsetup",
		      "custrecord_mts_vendpostinggroup_opsetup",
		      "custrecord_mts_location_control_opsetup",
		      "custrecord_mts_location_destinat_opsetup",
		      "custrecord_mts_tax_groups_opsetup",
		      "custrecord_mts_tax_area_code_opsetup",
		      "custrecord_mts_comp_invoice_type_opsetup",
		      "custrecord_mts_free_of_charge_opsetup",
		      "custrecord_mts_activecompensat_opsetup",
		      "custrecord_mts_passive_compensat_opsetup",
		      "custrecord_mts_transficmsamount_opsetup",
		      "custrecord_mts_cost_price_opsetup",
		      "custrecord_mts_validated_opsetup",
		      "custrecord_mts_error_message_opsetup"
		   ]
		});
	
		var resultCount = _operationSetup.runPaged().count;
		if (resultCount) {
			_operationSetup.run().each(function(result){
				objAux = {};
				objAux.name = result.getValue({name: 'name'});
				objAux.internalid = result.getValue({name: 'internalid'});
				objAux.description = result.getValue({name:"custrecord_mts_description_opsetup"});
				objAux.itementry = result.getValue({name:"custrecord_mts_item_entry_opsetup"});
				objAux.glentry = result.getValue({name:"custrecord_mts_gl_entry_opsetup"});
				objAux.posttax = result.getValue({name:"custrecord_mts_post_tax_opsetup"});
				objAux.customervendorentry = result.getValue({name:"custrecord_mts_cust_vend_entry_opsetup"});
				objAux.genbuspostinggroup = result.getValue({name:"custrecord_mts_gen_bus_posting_opsetup"});
				objAux.genbuspostinggroupText = result.getText({name:"custrecord_mts_gen_bus_posting_opsetup"});
				objAux.genprodpostinggroup = result.getValue({name:"custrecord_mts_gen_prod_posting_opsetup"});
				objAux.genprodpostinggroupText = result.getText({name:"custrecord_mts_gen_prod_posting_opsetup"});
				objAux.customerpostinggroup = result.getValue({name:"custrecord_mts_custpostinggroup_opsetup"});
				objAux.customerpostinggroupText = result.getText({name:"custrecord_mts_custpostinggroup_opsetup"});
				objAux.vendorpostinggroup = result.getValue({name:"custrecord_mts_vendpostinggroup_opsetup"});
				objAux.vendorpostinggroupText = result.getText({name:"custrecord_mts_vendpostinggroup_opsetup"});
				objAux.locationcontrol = result.getValue({name:"custrecord_mts_location_control_opsetup"});
				objAux.locationdestination = result.getValue({name:"custrecord_mts_location_destinat_opsetup"});
				objAux.locationdestinationText = result.getText({name:"custrecord_mts_location_destinat_opsetup"});
				objAux.taxgroup = result.getValue({name:"custrecord_mts_tax_groups_opsetup"});
				objAux.taxgroupText = result.getText({name:"custrecord_mts_tax_groups_opsetup"});
				objAux.taxareacode = result.getValue({name:"custrecord_mts_tax_area_code_opsetup"});
				objAux.taxareacodeText = result.getText({name:"custrecord_mts_tax_area_code_opsetup"});
				objAux.compinvoicetype = result.getValue({name:"custrecord_mts_comp_invoice_type_opsetup"});
				objAux.compinvoicetypeText = result.getText({name:"custrecord_mts_comp_invoice_type_opsetup"});
				objAux.freeofcharge = result.getValue({name:"custrecord_mts_free_of_charge_opsetup"});
				objAux.activecompensat = result.getValue({name:"custrecord_mts_activecompensat_opsetup"});
				objAux.activecompensatText = result.getText({name:"custrecord_mts_activecompensat_opsetup"});
				objAux.passivecompensat = result.getValue({name:"custrecord_mts_passive_compensat_opsetup"});
				objAux.passivecompensatText = result.getText({name:"custrecord_mts_passive_compensat_opsetup"});
				objAux.transficmsamount = result.getValue({name:"custrecord_mts_transficmsamount_opsetup"});
				objAux.costprice = result.getValue({name:"custrecord_mts_cost_price_opsetup"});
				objAux.validated = result.getValue({name:"custrecord_mts_validated_opsetup"});
				objAux.errormessage = result.getValue({name:"custrecord_mts_error_message_opsetup"});
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}
	
	function getOperationTypeByRecLoad(lvId){
		// using record.load
		var OperTypeRecLoad = getRecordLoad('customrecord_mts_opsetup', lvId);
		if (OperTypeRecLoad) {
			return {
				recordObj: OperTypeRecLoad,
				id: OperTypeRecLoad.id,
				name: OperTypeRecLoad.getValue({fieldId: 'name'}),// name
				description: OperTypeRecLoad.getValue({fieldId:"custrecord_mts_description_opsetup"}),
				itemEntry: OperTypeRecLoad.getValue({fieldId:"custrecord_mts_item_entry_opsetup"}),
				glEntry: OperTypeRecLoad.getValue({fieldId:"custrecord_mts_gl_entry_opsetup"}),
				postTax: OperTypeRecLoad.getValue({fieldId:"custrecord_mts_post_tax_opsetup"}),
				customerVendorEntry: OperTypeRecLoad.getValue({fieldId:"custrecord_mts_cust_vend_entry_opsetup"}),
				genProdPostingGroupText : OperTypeRecLoad.getText({fieldId:"custrecord_mts_gen_prod_posting_opsetup"}),
				customerPostingGroup : OperTypeRecLoad.getValue({fieldId:"custrecord_mts_custpostinggroup_opsetup"}),
				customerPostingGroupText : OperTypeRecLoad.getText({fieldId:"custrecord_mts_custpostinggroup_opsetup"}),
				vendorPostingGroup : OperTypeRecLoad.getValue({fieldId:"custrecord_mts_vendpostinggroup_opsetup"}),
				vendorPostingGroupText : OperTypeRecLoad.getText({fieldId:"custrecord_mts_vendpostinggroup_opsetup"}),
				locationControl : OperTypeRecLoad.getValue({fieldId:"custrecord_mts_location_control_opsetup"}),
				locationDestination : OperTypeRecLoad.getValue({fieldId:"custrecord_mts_location_destinat_opsetup"}),
				locationDestinationText : OperTypeRecLoad.getText({fieldId:"custrecord_mts_location_destinat_opsetup"}),
				taxGroup : OperTypeRecLoad.getValue({fieldId:"custrecord_mts_tax_groups_opsetup"}),
				taxGroupText : OperTypeRecLoad.getText({fieldId:"custrecord_mts_tax_groups_opsetup"}),
				taxAreaCode : OperTypeRecLoad.getValue({fieldId:"custrecord_mts_tax_area_code_opsetup"}),
				taxAreaCodeText : OperTypeRecLoad.getText({fieldId:"custrecord_mts_tax_area_code_opsetup"}),
				compInvoiceType : OperTypeRecLoad.getValue({fieldId:"custrecord_mts_comp_invoice_type_opsetup"}),
				compInvoiceTypeText : OperTypeRecLoad.getText({fieldId:"custrecord_mts_comp_invoice_type_opsetup"}),
				freeOfCharge : OperTypeRecLoad.getValue({fieldId:"custrecord_mts_free_of_charge_opsetup"}),
				activeCompensat : OperTypeRecLoad.getValue({fieldId:"custrecord_mts_activecompensat_opsetup"}),
				activeCompensatText : OperTypeRecLoad.getText({fieldId:"custrecord_mts_activecompensat_opsetup"}),
				passiveCompensat : OperTypeRecLoad.getValue({fieldId:"custrecord_mts_passive_compensat_opsetup"}),
				passiveCompensatText : OperTypeRecLoad.getText({fieldId:"custrecord_mts_passive_compensat_opsetup"}),
				tranfICMSAmount : OperTypeRecLoad.getValue({fieldId:"custrecord_mts_transficmsamount_opsetup"}),
				costPrice : OperTypeRecLoad.getValue({fieldId:"custrecord_mts_cost_price_opsetup"}),
				validated : OperTypeRecLoad.getValue({fieldId:"custrecord_mts_validated_opsetup"}),
			    errorMessage : OperTypeRecLoad.getValue({fieldId:"custrecord_mts_error_message_opsetup"}),
			    //Label
				nameLabel: OperTypeRecLoad.getField({fieldId: 'name'}).label,// name
				descriptionLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_description_opsetup"}).label,
				itemEntryLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_item_entry_opsetup"}).label,
				glEntryLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_gl_entry_opsetup"}).label,
				postTaxLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_post_tax_opsetup"}).label,
				customerVendorEntryLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_cust_vend_entry_opsetup"}).label,
				customerPostingGroupLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_custpostinggroup_opsetup"}).label,
				vendorPostingGroupLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_vendpostinggroup_opsetup"}).label,
				locationControlLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_location_control_opsetup"}).label,
				locationDestinationLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_location_destinat_opsetup"}).label,
				taxGroupLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_tax_groups_opsetup"}).label,
				compInvoiceTypeLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_comp_invoice_type_opsetup"}).label,
				freeOfChargeLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_free_of_charge_opsetup"}).label,
				activeCompensatLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_activecompensat_opsetup"}).label,
				passiveCompensatLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_passive_compensat_opsetup"}).label,
				transfIcmsAmountLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_transficmsamount_opsetup"}).label,
				costPriceLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_cost_price_opsetup"}).label,
				validatedLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_validated_opsetup"}).label,
			    errorMessageLabel: OperTypeRecLoad.getField({fieldId:"custrecord_mts_error_message_opsetup"}).label
			}						
		}else{
			return;
		}	
	}
	
	

	function getNoSerieByRecLoad(lvId) {
		var noSerieRecLoad = getRecordLoad('customrecord_mts_noseriesloc', lvId);
		if (noSerieRecLoad) {
			return {
				recordObj:noSerieRecLoad,
				id: noSerieRecLoad.id,
				name: noSerieRecLoad.getValue({fieldId: 'name'}),
				prefix: noSerieRecLoad.getValue({fieldId: 'custrecord_mts_prefix_noseriesloc'}),
				minDigs: noSerieRecLoad.getValue({fieldId: 'custrecord_mts_mindigits_noseriesloc'}),
				prefixLabel: noSerieRecLoad.getField({fieldId: 'custrecord_mts_prefix_noseriesloc'}).label,
				minDigsLabel: noSerieRecLoad.getValue({fieldId: 'custrecord_mts_mindigits_noseriesloc'}).label
			}						
		}else{
			return;
		}	
	}
	
	function getGenerateNFeXML(EletrItemInvProcess) {
		
		//debugger;
		var Obj = {
				Id: EletrItemInvProcess.id,
				InvoiceNo: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_invno_eletiteminvproc' }),
				DocumentDate: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_docdate_eletiteminvproc' }),
				CustomerName: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_customern_eletiteminvproc' }),
				EnvironmentID: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_envirid_eletiteminvproc' }),
				InvoicingWay: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_invway_eletiteminvproc' }),
				InvoicingReason: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_invreason_eletiteminvproc' }),
				SeriesNo: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_serieno_eletiteminvproc' }),
				KeyAccess: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_keyacess_eletiteminvproc' }),
				NoKeySeries: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_nokeyseri_eletiteminvproc' }),
				NFeKeyAccess: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_nfekeyace_eletiteminvproc' }),
				Protocol: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_protocol_eletiteminvproc' }),
				VendorName: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_vendname_eletiteminvproc' }),
				ReturnStatus: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_returnsta_eletiteminvproc' }),
				ReturnCode: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_retcode_eletiteminvproc' }),
				EletronicInvoiceType: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_eleinvtyp_eletiteminvproc' }),
				Series: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_series_eletiteminvproc' }),
				StatusDescription: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_statusdes_eletiteminvproc' }),
				BranchCode: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_branch_eletiteminvproc' }),
				ContingencyNFeKeyAccess: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_contnfeke_eletiteminvproc' }),
				ProcessCanceled: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_processca_eletiteminvproc' }),
				InvoiceNoText: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_invnodig_eletiteminvproc' }),
				DocumentType: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_doctype_eletiteminvproc' }),
				SourceType: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_sourcetyp_eletiteminvproc' }),
				PostingDate: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_postdate_eletiteminvproc' }),
				FiscalDocumentType: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_fiscaldoc_eletiteminvproc' }),
				TerritoryCode: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_territory_eletiteminvproc' }),
				ExitEntranceDate: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_exitdate_eletiteminvproc' }),
				NFeTime: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_nfetime_eletiteminvproc' }),
				ControlledGeneration: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_contgener_eletiteminvproc' }),
				NFeSent: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_nfesent_eletiteminvproc' }),
				NFSVerificatCode: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_nfsvercod_eletiteminvproc' }),
				RPSSequence: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_rpssequen_eletiteminvproc' }),
				RPSDate: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_rpsdate_eletiteminvproc' }),
				RPSOperationDescription: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_rpsopdesc_eletiteminvproc' }),
				RPSSimpleOptingNational: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_rpssimple_eletiteminvproc' }),
				RPSIncentivadorCultural: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_rpsinccul_eletiteminvproc' }),
				RPSReturnCode: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_rpsretcod_eletiteminvproc' }),
				CityCodeSIAFI: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_citycodes_eletiteminvproc' }),
				NFseCancel: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_nfsecance_eletiteminvproc' }),
				DateTimeCancellation: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_datetimec_eletiteminvproc' }),
				CancelConfirmation: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_cancelcon_eletiteminvproc' }),
				XMLDanfeSent: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_xmldanfes_eletiteminvproc' }),
				DateTimeAuthorization: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_datetimea_eletiteminvproc' }),
				EInvoiceDateRPS: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_einvdater_eletiteminvproc' }),
				CustomerNo: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_custno_eletiteminvproc' }),
				NFsFiscalNature: EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_nfsfiscal_eletiteminvproc' }),
	//				ProrrogationEvent: getProrrogationEvent(EletrItemInvProcess),
					TagBIdent: getTagBIdent(EletrItemInvProcess),
					TagCIssuer: getTagCIssuer(EletrItemInvProcess),
	//				TagDFiscoIssuer: getTagDFiscoIssuer(),
					TagEAddressee: getTagEAddressee(EletrItemInvProcess),
					TagFBoarding: getTagFBoarding(EletrItemInvProcess),
					TagGShip: getTagGShip(EletrItemInvProcess),
					TagGA: getTagGA(EletrItemInvProcess),
					TagIItens: getTagIItens(EletrItemInvProcess),
	//				TagUISSQN: getTagUISSQN(EletrItemInvProcess),
					TagWTotals: getTagWTotals(EletrItemInvProcess),
					TagXDeliveryInformation: getTagXDeliveryInformation(EletrItemInvProcess),
					TagYReceivableInformation: getTagYReceivableInformation(EletrItemInvProcess.id),
					TagYAPaymentInformation: getTagYAPaymentInformation(EletrItemInvProcess),
					TagZAditionalInformation: getTagZAditionalInformation(EletrItemInvProcess.id),
					TagZAExternalInformation: getTagZAExternalInformation(EletrItemInvProcess),
					TagZBPurchaseInformation: getTagZBPurchaseInformation(EletrItemInvProcess),
	//				ProcessCCe: getProcessCCe(EletrItemInvProcess),
					ProcessEPEC: getProcessEPEC(EletrItemInvProcess),
					Entity: getEntity(EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_custno_eletiteminvproc' }), 
							EletrItemInvProcess.getValue({ fieldId: 'custrecord_mts_sourcetyp_eletiteminvproc' })),
		}
		return Obj;
	}
	
	function getProrrogationEvent(EletrItemInvProcess) {
		var ProrrogationEvent = getRecordLoad('customrecord_mts_prorrogevent', lvId);
		var Obj = {
			recordObj: ProrrogationEvent,
			Id: ProrrogationEvent.id,
		};
		return Obj;
	}
	
	function getTagBIdent(EletrItemInvProcess) {
		var objAux = {};
		var _numLines = EletrItemInvProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb'});
		if(!_numLines)
			return objAux;
			
		objAux.id = EletrItemInvProcess.getSublistValue({// InternalId.
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'id',
		});
		objAux.invProcVersion = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_invprocver_nfetagb',
		});
		objAux.eletronicInvoiceNo = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_eletronicinvno_nfetagb',
		});
		objAux.issuingState = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_issuingstate_nfetagb'
		});
		objAux.accessKeyCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_acckeycode_nfetagb'
		});
		objAux.operationDescription = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_operdesc_nfetagb'
		});
		objAux.paymentIndicator = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_paymentind_nfetagb'
		});
		objAux.fiscalDocModelCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_fiscdocmodel_nfetagb'
		});
		objAux.fiscalDocSeries = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_fiscaldocseries_nfetagb'
		});
		objAux.fiscalDocumentNumber = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_fiscaldocnumber_nfetagb'
		});
		objAux.fiscalDocIssuingDate31 = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_fiscaldocissdate3_nfetagb'
		});
		objAux.idDestOperation = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_idofthedestofthe_nfetagb'
		});
		objAux.ibgeCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_ibge_nfetagb'
		});
		objAux.danfePrintingLayout = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_danfeprintlay_nfetagb'
		});
		objAux.invoicingWay = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_invway_nfetagb'
		});
		objAux.accessKeyVerificationCharac = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_acesskeyver_nfetagb'
		});
		objAux.environmentID = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_environmentid_nfetagb'
		});
		objAux.invoicingReason = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_invreason_nfetagb'
		});
		objAux.endUser = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_enduser_nfetagb'
		});
		objAux.presenceIndicatorBuyer = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_presentindbuyer_nfetagb'
		});
		objAux.eletrInvoiceAccessKey = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_eletinvacckey_nfetagb'
		});
		objAux.justificationContingency = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_justcont_nfetagb'
		});
		objAux.dateTimeContingency = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_datetimecont_nfetagb'
		});
		objAux.fiscDocType = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_fiscdoctype_nfetagb'
		});
		objAux.invProc = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
			line: 0,
			fieldId: 'custrecord_mts_invproc_nfetagb'
		});
		
		return objAux;
	}
	
	function getTagCIssuer(EletrItemInvProcess) {
		var objAux={};
		var _numLines = EletrItemInvProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc'});
		if(!_numLines)
			return objAux;
		
		objAux.id = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'id',
			line: 0,
		});
		objAux.eletronicInvoiceNo = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_eleinvno_nfetagc',
			line: 0,
		});
		objAux.issuingFederalTaxNumber = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_issfedtax_nfetagc',
			line: 0,
		});
		objAux.companyName = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_companyname_nfetagc',
			line: 0,
		});
		objAux.searchName = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_searchname_nfetagc',
			line: 0,
		});
		objAux.crtCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_crtcode_nfetagc',
			line: 0,
		});
		objAux.address = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_address_nfetagc',
			line: 0,
		});
		objAux.number = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_number_nfetagc',
			line: 0,
		});
		objAux.complement = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_complement_nfetagc',
			line: 0,
		});
		objAux.district = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_district_nfetagc',
			line: 0,
		});
		objAux.cityCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_citycode_nfetagc',
			line: 0,
		});
		objAux.state = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_state_nfetagc',
			line: 0,
		});
		objAux.countryCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_countrycode_nfetagc',
			line: 0,
		});
		objAux.country = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_country_nfetagc',
			line: 0,
		});
		objAux.phone = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_phone_nfetagc',
			line: 0,
		});
		objAux.taxSubstitutionStateReg = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_taxsubstatreg_nfetagc',
			line: 0,
		});
		objAux.cityRegistration = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_cityreg_nfetagc',
			line: 0,
		});
		objAux.cnae = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_cnae_nfetagc',
			line: 0,
		});
		objAux.crtCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_crtcode_nfetagc',
			line: 0,
		});
		objAux.city = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_city_nfetagc',
			line: 0,
		});
		objAux.zipCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_zipcode_nfetagc',
			line: 0,
		});
		objAux.stateRegistration = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
			fieldId: 'custrecord_mts_statereg_nfetagc',
			line: 0,
		});
		
		return objAux;
	}
	
	function getTagDFiscoIssuer(EletrItemInvProcess) {
		var objAux = {};
		return objAux;
	}
	
	function getTagEAddressee(EletrItemInvProcess) {
		var objAux = {};
		var _numLines = EletrItemInvProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage'});
		if(!_numLines)
			return objAux;
		
		objAux.id = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'id'
		});
		objAux.eletrItemInvNo = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_eletronicinvno_nfetage'
		});
		objAux.addrIssFedTaxNo = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_addissfextaxno_nfetage'
		});
		objAux.addrSendTaxReg = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_addsendtaxreg_nfetage'
		});
		objAux.companyName = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_companyname_nfetage'
		});
		objAux.address = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_address_nfetage'
		});
		objAux.number = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_number_nfetage'
		});
		objAux.complement = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_complement_nfetage'
		});
		objAux.district = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_district_nfetage'
		});
		objAux.city = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_city_nfetage'
		});
		objAux.cityCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_citycode_nfetage'
		});
		objAux.state = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_state_nfetage'
		});
		objAux.zipCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_zipcode_nfetage'
		});
		objAux.countryCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_countrycode_nfetage'
		});
		objAux.country = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_country_nfetage'
		});
		objAux.phone = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_phone_nfetage'
		});
		objAux.cityReg = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_cityreg_nfetage'
		});
		objAux.suframaReg = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_suframareg_nfetage'
		});
		objAux.email = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_email_nfetage'
		});
		objAux.yourReference = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_yourreference_nfetage'
				});
		objAux.numOfPassLegalDoc = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_numofpasslegaldoc_nfetage'
		});
		objAux.ie = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
			line: 0,
			fieldId: 'custrecord_mts_ie_nfetage'
		});
		
		return objAux;
	}
	
	function getTagFBoarding(EletrItemInvProcess) {
		var objAux = {};
		var _numLines = EletrItemInvProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eleinvno_nfetagf'});
		if(!_numLines)
			return objAux;
		
		objAux.id = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagf',
			line: 0,
			fieldId: 'id'
		});
		objAux.eletrItemInvNo = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagf',
			line: 0,
			fieldId: 'custrecord_mts_eleinvno_nfetagf'
		});
		objAux.federalTaxNumber = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagf',
			line: 0,
			fieldId: 'custrecord_mts_federaltaxnumber_nfetagf'
		});
		objAux.address = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagf',
			line: 0,
			fieldId: 'custrecord_mts_address_nfetagf'
		});
		objAux.number = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagf',
			line: 0,
			fieldId: 'custrecord_mts_number_nfetagf'
		});
		objAux.complement = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagf',
			line: 0,
			fieldId: 'custrecord_mts_complement_nfetagf'
		});
		objAux.district = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagf',
			line: 0,
			fieldId: 'custrecord_mts_district_nfetagf'
		});
		objAux.cityCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagf',
			line: 0,
			fieldId: 'custrecord_mts_citycode_nfetagf'
		});
		objAux.cityName = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagf',
			line: 0,
			fieldId: 'custrecord_mts_cityname_nfetagf'
		});
		objAux.state = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagf',
			line: 0,
			fieldId: 'custrecord_mts_state_nfetagf'
		});
		
		return objAux;
	}
	
	function getTagGShip(EletrItemInvProcess) {
		var objAux = {};
		var _numLines = EletrItemInvProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_nfetagg'});
		if(!_numLines)
			return objAux;
		
		objAux.id = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagg',
			line: 0,
			fieldId: 'id'
		});
		objAux.eletrItemInvNo = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagg',
			line: 0,
			fieldId: 'custrecord_mts_eletinvno_nfetagg'
		});
		objAux.federalTaxNumber = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagg',
			line: 0,
			fieldId: 'custrecord_mts_federaltaxnumber_nfetagg'
		});
		objAux.address = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagg',
			line: 0,
			fieldId: 'custrecord_mts_address_nfetagg'
		});
		objAux.number = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagg',
			line: 0,
			fieldId: 'custrecord_mts_number_nfetagg'
		});
		objAux.complement = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagg',
			line: 0,
			fieldId: 'custrecord_mts_complement_nfetagg'
		});
		objAux.district = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagg',
			line: 0,
			fieldId: 'custrecord_mts_district_nfetagg'
		});
		objAux.cityCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagg',
			line: 0,
			fieldId: 'custrecord_mts_citycode_nfetagg'
		});
		objAux.city = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagg',
			line: 0,
			fieldId: 'custrecord_mts_city_nfetagg'
		});
		objAux.state = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagg',
			line: 0,
			fieldId: 'custrecord_mts_state_nfetagg'
		});
		objAux.postCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagg',
			line: 0,
			fieldId: 'custrecord_mts_postcode_nfetagg'
		});
		
		return objAux;
	}
	
	function getTagGA(EletrItemInvProcess) {
		var objAux = {};
		var _numLines = EletrItemInvProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagga'});
		if(!_numLines)
			return objAux;
	
		objAux.id = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagga',
			line: 0,
			fieldId: 'id'
		});
		objAux.eletrItemInvProcNo = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagga',
			line: 0,
			fieldId: 'custrecord_mts_eletronicinvno_nfetagga'
		});
		objAux.lineNo = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagga',
			line: 0,
			fieldId: 'custrecord_mts_lineno_nfetagga'
		});
		objAux.byFromVendorNo = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagga',
			line: 0,
			fieldId: 'custrecord_mts_buyfromvendorno_nfetagga'
		});
		objAux.cnpjCpf = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagga',
			line: 0,
			fieldId: 'custrecord_mts_cnpjcpf_nfetagga'
		});
		objAux.name = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagga',
			line: 0,
			fieldId: 'custrecord_mts_name_nfetagga'
		});
		objAux.category = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagga',
			line: 0,
			fieldId: 'custrecord_mts_category_nfetagga'
		});
		return objAux;
	}
	
	function getTagIItens(EletrItemInvProcess) {
		var objAux = {};
		var objList = [];
		var _numLines = EletrItemInvProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_nfetagi'});
		if(!_numLines)
			return objList;
		
		for (var int = 0; int < _numLines; int++) {
			objAux = {};
			var _id = EletrItemInvProcess.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletinvno_nfetagi',
				line: int,
				fieldId: 'id'
			});
			
			var tagIItens = getRecordLoad('customrecord_mts_nfetagi', _id );
		
			objAux.recordObj = tagIItens;
			objAux.id = _id;
			objAux.eletrItemInvProcNo = tagIItens.getValue({fieldId: 'custrecord_mts_eletinvno_nfetagi'});
			objAux.lineNo = tagIItens.getValue({fieldId: 'custrecord_mts_lineno_nfetagi'});
			objAux.operatDescription = tagIItens.getValue({fieldId: 'custrecord_mts_operatdescription_nfetagi'});
			objAux.cstCode = tagIItens.getValue({fieldId: '	custrecord_mts_cstcode_nfetagi'});
			objAux.servProdCode = tagIItens.getValue({fieldId: 'custrecord_mts_servprodcode_nfetagi'});
			objAux.gtinEan = tagIItens.getValue({fieldId: 'custrecord_mts_gtineanbarcode_nfetagi'});
			objAux.description = tagIItens.getValue({fieldId: 'custrecord_mts_description_nfetagi'});
			objAux.ncmCode = tagIItens.getValue({fieldId: 'custrecord_mts_ncmcode_nfetagi'});
			objAux.exTipi = tagIItens.getValue({fieldId: 'custrecord_mts_extipi_nfetagi'});
			objAux.productServiceGen = tagIItens.getValue({fieldId: 'custrecord_mts_prodservgenre_nfetagi'});
			objAux.cfop = tagIItens.getValue({fieldId: 'custrecord_mts_cfop_nfetagi'});
			objAux.unitCode = tagIItens.getValue({fieldId: 'custrecord_mts_unitcode_nfetagi'});
			objAux.quantity = tagIItens.getValue({fieldId: 'custrecord_mts_quantity_nfetagi'});
			objAux.unitValue = tagIItens.getValue({fieldId: 'custrecord_mts_unitvalue_nfetagi'});
			objAux.grossAmount = tagIItens.getValue({fieldId: 'custrecord_mts_grossamount_nfetagi'});
			objAux.taxableUnit = tagIItens.getValue({fieldId: 'custrecord_mts_taxableunit_nfetagi'});
			objAux.taxableQuantity = tagIItens.getValue({fieldId: 'custrecord_mts_taxablequant_nfetagi'});
			objAux.taxUnitValue = tagIItens.getValue({fieldId: 'custrecord_mts_taxunitvalue_nfetagi'});
			objAux.transTotalAmount = tagIItens.getValue({fieldId: 'custrecord_mts_transtotamount_nfetagi'});
			objAux.insuranceTotalAmount = tagIItens.getValue({fieldId: 'custrecord_mts_insurancetotalamo_nfetagi'});
			objAux.discountTotalAmount = tagIItens.getValue({fieldId: 'custrecord_mts_discountotal_nfetagi'});
			objAux.diNo = tagIItens.getValue({fieldId: 'custrecord_mts_dino_nfetagi'});
			objAux.diRegistrationDate = tagIItens.getValue({fieldId: 'custrecord_mts_diregdate_nfetagi'});
			objAux.localCustomsClearance = tagIItens.getValue({fieldId: 'custrecord_mts_localcustclear_nfetagi'});
			objAux.customClearanceState = tagIItens.getValue({fieldId: 'custrecord_mts_custclearstate_nfetagi'});
			objAux.relevantScaleIndicator = tagIItens.getValue({fieldId: 'custrecord_mts_relevantscaleind_nfetagi'});
			objAux.manufacturerCNPJ = tagIItens.getValue({fieldId: 'custrecord_mts_manufacturecnpj_nfetagi'});
			objAux.fiscalBenefitCode = tagIItens.getValue({fieldId: 'custrecord_mts_fiscalbenefit_nfetagi'});
			objAux.othersAmount = tagIItens.getValue({fieldId: 'custrecord_mts_othersamount_nfetagi'});
			objAux.composedItemValue = tagIItens.getValue({fieldId: 'custrecord_mts_compitemvalue_nfetagi'});
			objAux.customClearanceDate = tagIItens.getValue({fieldId: 'custrecord_mts_custcleardate_nfetagi'});
			objAux.internationalShipping = tagIItens.getValue({fieldId: 'custrecord_mts_internatshipping_nfetagi'});
			objAux.afrmmAmount = tagIItens.getValue({fieldId: 'custrecord_mts_afrmmamount_nfetagi'});
			objAux.formOfImport = tagIItens.getValue({fieldId: 'custrecord_mts_formofimport_nfetagi'});
			objAux.cnpjBuyerOrderer = tagIItens.getValue({fieldId: 'custrecord_mts_cnpjbuyerorder_nfetagi'});
			objAux.ufBuyerOrderer = tagIItens.getValue({fieldId: 'custrecord_mts_ufbuyerorderer_nfetagi'});
			objAux.exporterCode = tagIItens.getValue({fieldId: 'custrecord_mts_exportercode_nfetagi'});
			objAux.additionNo = tagIItens.getValue({fieldId: 'custrecord_mts_additiono_nfetagi'});
			objAux.additionItemSequencialNo = tagIItens.getValue({fieldId: 'custrecord_mts_additionitemseque_nfetagi'});
			objAux.foreignManufacturerCode = tagIItens.getValue({fieldId: 'custrecord_mts_foreignmanufactur_nfetagi'});
			objAux.diItemDiscountAmount = tagIItens.getValue({fieldId: 'custrecord_mts_diitemdiscamt_nfetagi'});
			objAux.noDrawback = tagIItens.getValue({fieldId: 'custrecord_mts_nodrawback_nfetagi'});
			objAux.purchOrderNo = tagIItens.getValue({fieldId: 'custrecord_mts_purchoderno_nfetagi'});
			objAux.purchaseItemOrderNumber = tagIItens.getValue({fieldId: 'custrecord_mts_purchitemorderno_nfetagi'});
			
			objAux.tagINVE = getTagINVE(tagIItens);
			objAux.tagI80ItemTracking = getTagI80ItemTracking(tagIItens);
			objAux.tagKMedicationRawMaterials = getTagKMedicationRawMaterials(tagIItens);
			objAux.tagNICMS = getTagNICMS(tagIItens);
			objAux.tagOIPI = getTagOIPI(tagIItens);
			objAux.tagPII = getTagPII(tagIItens);
			objAux.tagQPIS = getTagQPIS(tagIItens);
			objAux.tagSCofins = getTagSCofins(tagIItens);
			objAux.tagUISSQN = getTagUISSQN(tagIItens);
			objAux.tagVAdditionalInformation = getTagVAdditionalInformation(tagIItens);
			
			objList.push(objAux);
			
		}// end for
		return objList;
	}
	
	function getTagINVE(tagIItens) {
		var objAux = {};
		var objList = [];
	
		var _numLines = tagIItens.getLineCount({sublistId: 'recmachcustrecord_mts_nfetagi_nfetaginve'});
		if(!_numLines)
			return objList;
		
		for (var int = 0; int < _numLines; int++) {
			
			objAux = {};
			objAux.id = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetaginve',
				line: int,
				fieldId: 'id'
			});
			objAux.description = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetaginve',
				line: int,
				fieldId: 'custrecord_mts_description_nfetaginve'
			});
			objAux.attributeAndCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetaginve',
				line: int,
				fieldId: 'custrecord_mts_attributeandco_nfetaginve'
			});
			
			objList.push(objAux);
		}// end for
	
		return objList;
	}
	
	function getTagVAdditionalInformation(tagIItens) {
		var objAux = {};
		var _numLines = tagIItens.getLineCount({sublistId: 'recmachcustrecord_mts_nfetagi_nfetagv'});
		if(!_numLines)
			return objAux;
		
		objAux.id = tagIItens.getSublistValue({
			sublistId: 'recmachcustrecord_mts_nfetagi_nfetagv',
			line: 0,
			fieldId: 'id'
		});
		objAux.productAdditionalInformation = tagIItens.getSublistValue({
			sublistId: 'recmachcustrecord_mts_nfetagi_nfetagv',
			line: 0,
			fieldId: 'custrecord_mts_prodaddinfo_nfetagv'
		});
		objAux.productAdditionalInform2 = tagIItens.getSublistValue({
			sublistId: 'recmachcustrecord_mts_nfetagi_nfetagv',
			line: 0,
			fieldId: 'custrecord_mts_prodaddinfo2_nfetagv'
		});
		return objAux;
	}
	
	function getTagKMedicationRawMaterials(tagIItens) {
		var objAux = {};
		var objList = [];
		
		var _numLines = tagIItens.getLineCount({sublistId: 'recmachcustrecord_mts_nfetagi_nfetagk'});
		if(!_numLines)
			return objList;
		
		for (var int = 0; int < _numLines; int++) {
			
			objAux = {};
			objAux.id = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagk',
				line: int,
				fieldId: 'id'
			});
			objAux.serviceProductCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagk',
				line: int,
				fieldId: 'custrecord_mts_servprodcode_nfetagk'
			});
			objAux.lotNoManufacturer = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagk',
				line: int,
				fieldId: 'custrecord_mts_lotnomanufacture_nfetagk'
			});
			objAux.lotManufactureDate = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagk',
				line: int,
				fieldId: 'custrecord_mts_lotmanufacturedat_nfetagk'
			});
			objAux.lotExpirationDate = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagk',
				line: int,
				fieldId: 'custrecord_mts_lotexpdate_nfetagk'
			});
			objAux.lotQty = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagk',
				line: int,
				fieldId: 'custrecord_mts_lotqty_nfetagk'
			});
			objAux.endUserPrice = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagk',
				line: int,
				fieldId: 'custrecord_mts_enduserprice_nfetagk'
			});
			objAux.anvisaCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagk',
				line: int,
				fieldId: 'custrecord_mts_anvisacode_nfetagk'
			});
			
			objList.push(objAux);
		}// end for
		
		return objList;
	}
	
	function getTagI80ItemTracking(tagIItens) {
		var objAux = {};
		var objList = [];
		
		var _numLines = tagIItens.getLineCount({sublistId: 'recmachcustrecord_mts_tagiitens_nfetagi80'});
		if(!_numLines)
			return objList;
		
		for (var int = 0; int < _numLines; int++) {
			
			objAux = {};
			objAux.id = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_tagiitens_nfetagi80',
				line: int,
				fieldId: 'id'
			});
			objAux.tagIItens = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_tagiitens_nfetagi80',
				line: int,
				fieldId: 'custrecord_mts_tagiitens_nfetagi80'
			});
			objAux.serviceProductCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_tagiitens_nfetagi80',
				line: int,
				fieldId: 'custrecord_mts_servprodcode_nfetagi80'
			});
			objAux.lotNoManufacturer = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_tagiitens_nfetagi80',
				line: int,
				fieldId: 'custrecord_mts_lotnomanuf_nfetagi80'
			});
			objAux.lotManufactureDate = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_tagiitens_nfetagi80',
				line: int,
				fieldId: 'custrecord_mts_lotmanufdate_nfetagi80'
			});
			objAux.lotExpirationDate = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_tagiitens_nfetagi80',
				line: int,
				fieldId: 'custrecord_mts_lotexpirtdate_nfetagi80'
			});
			objAux.lotQty = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_tagiitens_nfetagi80',
				line: int,
				fieldId: 'custrecord_mts_lotqty_nfetagi80'
			});
			objAux.aggregationCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_tagiitens_nfetagi80',
				line: int,
				fieldId: 'custrecord_mts_aggregationcode_nfetagi80'
			});
			objList.push(objAux);
		}// end for
		
		return objList;
	}
	
	function getTagNICMS(tagIItens) {
		var objAux = {};
		var _numLines = tagIItens.getLineCount({sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn'});
		if(!_numLines)
			return objAux;
			
			objAux = {};
			objAux.id = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'id'
			});
			objAux.productServiceCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_prodservcode_nfetagn'
			});
			objAux.cstCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_cstcode_nfetagn'
			});
			objAux.goodsSource = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_goodssource_nfetagn'
			});
			objAux.icmsTaxation = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_icmstaxation_nfetagn'
			});
			objAux.icmsTaxation = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_icmstaxation_nfetagn'
			});
			objAux.icmsBcMode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_icmsbcmode_nfetagn'
			});
			objAux.icmsCalculationBasis = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_icmscalcbasis_nfetagn'
			});
			objAux.icmsPercent = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_percenticms_nfetagn'
			});
			objAux.icmsAmount = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_icmsamount_nfetagn'
			});
			objAux.icmsStBcMode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_icmsstbcmode_nfetagn'
			});
			objAux.aggregationMargin = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_percentaggmagin_nfetagn'
			});
			objAux.icmsStBcReduction = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_icmsstbcred_nfetagn'
			});
			objAux.stBasis = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_stbasis_nfetagn'
			});
			objAux.stPercent = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_percentst_nfetagn'
			});
			objAux.bcReduction = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_bcreduction_nfetagn'
			});
			objAux.ICMSBCMode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_icmsbcmode_nfetagn'
			});
			objAux.reasonforExemptionICMSText = tagIItens.getSublistText({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_reasonforexemptio_nfetagn'
			});
			objAux.valueOfTheExemptionOfICMS = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_valueoftheexempti_nfetagn'
			});
			objAux.deferedICMSValue = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_deferedicmsvalue_nfetagn'
			});
			objAux.icmsOperationValue = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_icmsoperation_nfetagn'
			});
			objAux.deferedICMS = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_deferedicms_nfetagn'
			});
			objAux.baseDifIcmsAddressee = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_basedificmsaddres_nfetagn'
			});
			objAux.internalICMS = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_internalicms_nfetagn'
			});
			objAux.shareICMS = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_percentsharedicms_nfetagn'
			});
			objAux.icmsShipperShare = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_icmsshippershare_nfetagn'
			});
			objAux.icmsAddresseeShare = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_icmsaddresse_nfetagn'
			});
			objAux.icmsFcpAddressee = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_icmsfcpaddressee_nfetagn'
			});
			objAux.amountIcmsFcpAddressee = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_amticmsfcpaddress_nfetagn'
			});
			objAux.baseFCP = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_basefcp_nfetagn'
			});
			objAux.stFCP = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_percentstfcp_nfetagn'
			});
			objAux.IcmsFcpST = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_icmsfcpst_nfetagn'
			});
			objAux.amountIcmsFcpST = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_amticmsfcpst_nfetagn'
			});
			objAux.baseFcpST = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_basefcpst_nfetagn'
			});
			objAux.icmsFcpStRET = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_icmsfcpstret_nfetagn'
			});
			objAux.amountIcmsFcpStRET = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_amticmsfcpstret_nfetagn'
			});
			objAux.baseFcpStRET = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_basefcpstret_nfetagn'
			});
			objAux.icmsFCP = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_percenticmsfcp_nfetagn'
			});
			objAux.amountIcmsFCP = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_amounticmsfcp_nfetagn'
			});
			objAux.baseFcpAddressee = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagn',
				line: 0,
				fieldId: 'custrecord_mts_basefcpaddess_nfetagn'
			});
		return objAux;
	}
	
	function getTagOIPI(tagIItens) {
		var objAux = {};
		var objList = [];
		var _numLines = tagIItens.getLineCount({sublistId: 'recmachcustrecord_mts_nfetagi_nfetago'});
		if(!_numLines)
			return objList;
		
		for (var int = 0; int < _numLines; int++) {
			objAux = {};
			objAux.id = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetago',
				line: int,
				fieldId: 'id'
			});
			objAux.productServiceCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetago',
				line: int,
				fieldId: 'custrecord_mts_prodservcode_nfetago'
			});
			objAux.drinkBeverageClassif = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetago',
				line: int,
				fieldId: 'custrecord_mts_drinkbeverange_nfetago'
			});
			objAux.drinkBeverageClassif = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetago',
				line: int,
				fieldId: 'custrecord_mts_drinkbeverange_nfetago'
			});
			objAux.goodsManufacturerTaxNumber = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetago',
				line: int,
				fieldId: 'custrecord_mts_goodsmanutax_nfetago'
			});
			objAux.ipiControlCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetago',
				line: int,
				fieldId: 'custrecord_mts_ipicontrolcode_nfetago'
			});
			objAux.controlCodeQuantity = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetago',
				line: int,
				fieldId: 'custrecord_mts_controlcodequant_nfetago'
			});
			objAux.ipiLegalClassificationCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetago',
				line: int,
				fieldId: 'custrecord_mts_ipilegalclasscode_nfetago'
			});
			objAux.ipiCstCodeText = tagIItens.getSublistText({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetago',
				line: int,
				fieldId: 'custrecord_mts_ipicstcode_nfetago'
			});
			objAux.ipiCalculationBasis = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetago',
				line: int,
				fieldId: 'custrecord_mts_ipicalcbasis_nfetago'
			});
			objAux.unitTotalQuantity = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetago',
				line: int,
				fieldId: 'custrecord_mts_unittotquantity_nfetago'
			});
			objAux.taxableUnitAmount = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetago',
				line: int,
				fieldId: 'custrecord_mts_taxunitamt_nfetago'
			});
			objAux.ipiPercent = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetago',
				line: int,
				fieldId: 'custrecord_mts_ipipercent_nfetago'
			});
			objAux.ipiAmount = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetago',
				line: int,
				fieldId: 'custrecord_mts_ipiamount_nfetago'
			});
			objList.push(objAux);
		}
		return objList;
	}
	
	function getTagPII(tagIItens) {
		var objAux = {};
		var objList = [];
		var _numLines = tagIItens.getLineCount({sublistId: 'recmachcustrecord_mts_eletroninvno_nfetagp'});
		if(!_numLines)
			return objList;
		
		for (var int = 0; int < _numLines; int++) {
			objAux = {};
			objAux.id = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletroninvno_nfetagp',
				line: int,
				fieldId: 'id'
			});
			objAux.productServiceCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletroninvno_nfetagp',
				line: int,
				fieldId: 'custrecord_mts_prodservcode_nfetagp'
			});
			objAux.calculationBasis = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletroninvno_nfetagp',
				line: int,
				fieldId: 'custrecord_mts_calcbasis_nfetagp'
			});
			objAux.customsExpensesAmount = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletroninvno_nfetagp',
				line: int,
				fieldId: 'custrecord_mts_custexpamt_nfetagp'
			});
			objAux.importTaxesAmount = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletroninvno_nfetagp',
				line: int,
				fieldId: 'custrecord_mts_importtaxamt_nfetagp'
			});
			objAux.iofAmount = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletroninvno_nfetagp',
				line: int,
				fieldId: 'custrecord_mts_iofamount_nfetagp'
			});
			objList.push(objAux);
		}// end for
		return objList;
	}
	
	function getTagQPIS(tagIItens) {
		var objAux = {};
		var objList = [];
		var _numLines = tagIItens.getLineCount({sublistId: 'recmachcustrecord_mts_nfetagi_nfetagq'});
		if(!_numLines)
			return objList;
		
		for (var int = 0; int < _numLines; int++) {
			objAux = {};
			objAux.id = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagq',
				line: int,
				fieldId: 'id'
			});
			objAux.productServiceCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagq',
				line: int,
				fieldId: 'custrecord_mts_prodservcode_nfetagq'
			});
			objAux.cstCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagq',
				line: int,
				fieldId: 'custrecord_mts_cstcode_nfetagq'
			});
			objAux.cstCodeText = tagIItens.getSublistText({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagq',
				line: int,
				fieldId: 'custrecord_mts_cstcode_nfetagq'
			});
			objAux.calculationBasis = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagq',
				line: int,
				fieldId: 'custrecord_mts_calcbasis_nfetagq'
			});
			objAux.pisPercent = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagq',
				line: int,
				fieldId: 'custrecord_mts_percentpis_nfetagq'
			});
			objAux.pisAmount = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagq',
				line: int,
				fieldId: 'custrecord_mts_pisamount_nfetagq'
			});
			objAux.soldQuantity = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagq',
				line: int,
				fieldId: 'custrecord_mts_soldquantity_nfetagq'
			});
			objAux.pisBracket = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetagq',
				line: int,
				fieldId: 'custrecord_mts_pisbracket_nfetagq'
			});
			objList.push(objAux);
		}
		return objList;
	}
	
	function getTagSCofins(tagIItens) {
		var objAux = {};
		var objList = [];
		var _numLines = tagIItens.getLineCount({sublistId: 'recmachcustrecord_mts_nfetagi_nfetags'});
		if(!_numLines)
			return objList;
		
		for (var int = 0; int < _numLines; int++) {
			objAux = {};
			objAux.id = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetags',
				line: int,
				fieldId: 'id'
			});
			objAux.productServiceCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetags',
				line: int,
				fieldId: 'custrecord_mts_prodservcode_nfetags'
			});
			objAux.cstCode = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetags',
				line: int,
				fieldId: 'custrecord_mts_cstcode_nfetags'
			});
			objAux.cstCodeText = tagIItens.getSublistText({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetags',
				line: int,
				fieldId: 'custrecord_mts_cstcode_nfetags'
			});
			objAux.calculationBasis = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetags',
				line: int,
				fieldId: 'custrecord_mts_calcbasis_nfetags'
			});
			objAux.cofinsPercent = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetags',
				line: int,
				fieldId: 'custrecord_mts_percentcofins_nfetags'
			});
			objAux.cofinsAmount = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetags',
				line: int,
				fieldId: 'custrecord_mts_cofinsamount_nfetags'
			});
			objAux.soldQuantity = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetags',
				line: int,
				fieldId: 'custrecord_mts_soldquantity_nfetags'
			});
			objAux.pisBracket = tagIItens.getSublistValue({
				sublistId: 'recmachcustrecord_mts_nfetagi_nfetags',
				line: int,
				fieldId: 'custrecord_mts_pisbracket_nfetags'
			});
			objList.push(objAux);	
		}
		return objList;
	}
	
	function getTagUISSQN(tagIItens) {
		var objAux = {};
		var _numLines = tagIItens.getLineCount({sublistId: 'recmachcustrecord_mts_nfetagi_nfetagu'});
		if(!_numLines)
			return objAux;
			
		objAux.id = tagIItens.getSublistValue({
			sublistId: 'recmachcustrecord_mts_nfetagi_nfetagu',
			line: 0,
			fieldId: 'id'
		});
		objAux.productServiceCode = tagIItens.getSublistValue({
			sublistId: 'recmachcustrecord_mts_nfetagi_nfetagu',
			line: 0,
			fieldId: 'custrecord_mts_prodservcode_nfetagu'
		});
		objAux.calculationBasis = tagIItens.getSublistValue({
			sublistId: 'recmachcustrecord_mts_nfetagi_nfetagu',
			line: 0,
			fieldId: 'custrecord_mts_calcbasis_nfetagu'
		});
		objAux.issqn = tagIItens.getSublistValue({
			sublistId: 'recmachcustrecord_mts_nfetagi_nfetagu',
			line: 0,
			fieldId: 'custrecord_mts_percentissqn_nfetagu'
		});
		objAux.issqnAmount = tagIItens.getSublistValue({
			sublistId: 'recmachcustrecord_mts_nfetagi_nfetagu',
			line: 0,
			fieldId: 'custrecord_mts_issqnamount_nfetagu'
		});
		objAux.sourceCityCode = tagIItens.getSublistValue({
			sublistId: 'recmachcustrecord_mts_nfetagi_nfetagu',
			line: 0,
			fieldId: 'custrecord_mts_sourcecitycode_nfetagu'
		});
		objAux.serviceCode = tagIItens.getSublistValue({
			sublistId: 'recmachcustrecord_mts_nfetagi_nfetagu',
			line: 0,
			fieldId: 'custrecord_mts_itemno_nfetagu'
		});
		objAux.serviceCodeText = tagIItens.getSublistText({
			sublistId: 'recmachcustrecord_mts_nfetagi_nfetagu',
			line: 0,
			fieldId: 'custrecord_mts_itemno_nfetagu'
		});
		objAux.issqnCstCode = tagIItens.getSublistValue({
			sublistId: 'recmachcustrecord_mts_nfetagi_nfetagu',
			line: 0,
			fieldId: 'custrecord_mts_issqncstcode_nfetagu'
		});
		objAux.listServiceCode = tagIItens.getSublistValue({
			sublistId: 'recmachcustrecord_mts_nfetagi_nfetagu',
			line: 0,
			fieldId: 'custrecord_mts_listservcode_nfetagu'
		});
		return objAux;
	}
	
	function getTagWTotals(EletrItemInvProcess) {
		var objAux = {};
		var _numLines = EletrItemInvProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw'});
		if(!_numLines)
			return objAux;
			
		objAux.id = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'id'
		});
		objAux.icmsCalculationBasis = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_icmscalcbasis_nfetagw'
		});
		objAux.icmsTotalAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_icmstotalamout_nfetagw'
		});
		objAux.icmsStCalculationBasis = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_icmsstcalcbasis_nfetagw'
		});
		objAux.icmsStTotalAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_icmssttotalamount_nfetagw'
		});
		objAux.productServiceTotalAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_prodservtotamt_nfetagw'
		});
		objAux.transportationTotalAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_transptotamount_nfetagw'
		});
		objAux.insuranceTotalAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_insurtotalamount_nfetagw'
		});
		objAux.discountTotalAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_discountotamount_nfetagw'
		});
		objAux.totalAmountII = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_totalamountii_nfetagw'
		});
		objAux.ipiTotalAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_ipitotalamount_nfetagw'
		});
		objAux.pisAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_pisamount_nfetagw'
		});
		objAux.cofinsAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_cofinsamount_nfetagw'
		});
		objAux.otherExpenses = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_otherexpenses_nfetagw'
		});
		objAux.eletrInvTotalAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_eletinvtotamount_nfetagw'
		});
		objAux.servTotAmountWithoutICMS = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_servtotamtwithoui_nfetagw'
		});
		objAux.issCalculationBasis = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_isscalcbasis_nfetagw'
		});
		objAux.issTotalAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_isstotamt_nfetagw'
		});
		objAux.servicesPisAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_servpisamt_nfetagw'
		});
		objAux.servicesCofinsAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_servcofinsamount_nfetagw'
		});
		objAux.pisWithholdAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_piswithholdamt_nfetagw'
		});
		objAux.cofinsWithholdAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_cofinswithholdamt_nfetagw'
		});
		objAux.csllWithholdAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_csllwithholdamt_nfetagw'
		});
		objAux.irrfCalculationBasis = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_irrfcalcbasis_nfetagw'
		});
		objAux.irrfWithholdAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_irrfwithholdamt_nfetagw'
		});
		objAux.welfareWithholdCalcBasis = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_welfacewithhcalc_nfetagw'
		});
		objAux.welfareWithholdAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_welfarewithholamt_nfetagw'
		});
		objAux.taxesTotalPrice = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_taxestotalprice_nfetagw'
		});
		objAux.totalValueOfTheExemptionOfICMS = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_totvalueoftheexem_nfetagw'
		});
		objAux.totalIcmsShipperShare = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_toticmsshipper_nfetagw'
		});
		objAux.totalIcmsAddresseeShare = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_toticmsaddshare_nfetagw'
		});
		objAux.totalAmountIcmsFcp = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_totalamounticmsfc_nfetagw'
		});
		objAux.amountFCP = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_amountfcp_nfetagw'
		});
		objAux.amountFcpSt = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_amountfcpst_nfetagw'
		});
		objAux.amountFcpStRet = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_amountfcpstret_nfetagw'
		});
		objAux.ipiTotalAmountReturn = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
			line: 0,
			fieldId: 'custrecord_mts_ipitotamtret_nfetagw'
		});
		return objAux;
	}
	
	function getTagXDeliveryInformation(EletrItemInvProcess) {
		var objAux = {};
		var _numLines = EletrItemInvProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx'});
		if(!_numLines)
			return objAux;
			
		objAux.id = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'id'
		});
		objAux.transportationMode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_transpmode_nfetagx'
		});
		objAux.federalTaxNumber = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_federaltaxnumber_nfetagx'
		});
		objAux.taxpayerRegistrationNumber = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_taxpayernumber_nfetagx'
		});
		objAux.companyName = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_companyname_nfetagx'
		});
		objAux.stateRegistry = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_stateregistry_nfetagx'
		});
		objAux.address = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_address_nfetagx'
		});
		objAux.city = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_city_nfetagx'
		});
		objAux.state = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_state_nfetagx'
		});
		objAux.serviceAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_serviceamount_nfetagx'
		});
		objAux.icmsWithholdCalcBasis = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_icmswithholdcalc_nfetagx'
		});
		objAux.withholdPercent = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_percentwithhold_nfetagx'
		});
		objAux.icmsWithholdAmount = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_icmswithholdamt_nfetagx'
		});
		objAux.cfop = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_cfop_nfetagx'
		});
		objAux.sourceCityCode = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_sourcecitycode_nfetagx'
		});
		objAux.vehicleId = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_vehicleid_nfetagx'
		});
		objAux.vehicleIdState = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_vehicleidstate_nfetagx'
		});
		objAux.anttVehicle = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_anttvehicle_nfetagx'
		});
		objAux.truckId = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_truckid_nfetagx'
		});
		objAux.truckState = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_truckstate_nfetagx'
		});
		objAux.anttTruck = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_antttruck_nfetagx'
		});
		objAux.piecesQuntity = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_piecesquantity_nfetagx'
		});
		objAux.piecesType = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_piecestype_nfetagx'
		});
		objAux.piecesBrand = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_piecesbrand_nfetagx'
		});
		objAux.piecesNumbers = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_piecesnumber_nfetagx'
		});
		objAux.netWeight = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_netweight_nfetagx'
		});
		objAux.grossWeight = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_grossweight_nfetagx'
		});
		objAux.lockNumbers = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_locknumbers_nfetagx'
		});
		objAux.wagon = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_wagon_nfetagx'
		});
		objAux.ferry = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
			line: 0,
			fieldId: 'custrecord_mts_wagon_nfetagx'
		});
		return objAux;
	}
	
	function getTagYReceivableInformation(EletrItemInvProcessId) {
		var objAux = {};
		var objList = [];
		var customrecord_mts_nfetagySearchObj = search.create({
			   type: "customrecord_mts_nfetagy",
			   filters: [["custrecord_mts_eletronicinvoicen_nfetagy","anyof",EletrItemInvProcessId]],
			   columns:
			   [
			      search.createColumn({
			         name: "internalid",
			         sort: search.Sort.ASC
			      }),
			      "custrecord_mts_invoicenumber_nfetagy",
			      "custrecord_mts_invoriginalamt_nfetagy",
			      "custrecord_mts_discountamount_nfetagy",
			      "custrecord_mts_invoicenetamount_nfetagy",
			      "custrecord_mts_duplicatenumber_nfetagy",
			      "custrecord_mts_duedate_nfetagy",
			      "custrecord_mts_duplicateamount_nfetagy",
			      "custrecord_mts_quotanumber_nfetagy"
			   ]
			});
			var searchResultCount = customrecord_mts_nfetagySearchObj.runPaged().count;
			if(!searchResultCount)
				return objList;
			customrecord_mts_nfetagySearchObj.run().each(function(result){
				// .run().each has a limit of 4,000 results
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.invoiceNumber = result.getValue({name: 'custrecord_mts_invoicenumber_nfetagy'});
				objAux.invoiceOriginalAmount = result.getValue({name: 'custrecord_mts_invoriginalamt_nfetagy'});
				objAux.discountAmount = result.getValue({name: 'custrecord_mts_discountamount_nfetagy'});
				objAux.invoiceNetAmount = result.getValue({name: 'custrecord_mts_invoicenetamount_nfetagy'});
				objAux.duplicateNumber = result.getValue({name: 'custrecord_mts_duplicatenumber_nfetagy'});
				objAux.dueDate = result.getValue({name: 'custrecord_mts_duedate_nfetagy'});
				objAux.duplicateAmount = result.getValue({name: 'custrecord_mts_duplicateamount_nfetagy'});
				objAux.quotaNumber = result.getValue({name: 'custrecord_mts_quotanumber_nfetagy'});
				objList.push(objAux);
				return true;
			});
		return objList;
	}
	
	function getTagYAPaymentInformation(EletrItemInvProcess) {
		var objAux = {};
		var objList = [];
		var _numLines = EletrItemInvProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagya'});
		if(!_numLines)
			return objList;
		
		for (var int = 0; int < _numLines; int++) {
			objAux = {};
			objAux.id = EletrItemInvProcess.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagya',
				line: int,
				fieldId: 'id'
			});
			objAux.name = EletrItemInvProcess.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagya',
				line: int,
				fieldId: 'name'
			});
			objAux.paymentMethod = EletrItemInvProcess.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagya',
				line: int,
				fieldId: 'custrecord_mts_paymentmethod_nfetagya'
			});
			objAux.paymentMethoName = EletrItemInvProcess.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagya',
				line: int,
				fieldId: 'custrecord_mts_paymentmethoname_nfetagya'
			});
			objAux.paymentAmount = EletrItemInvProcess.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagya',
				line: int,
				fieldId: 'custrecord_mts_paymentamount_nfetagya'
			});
			objAux.accreditingCnpj = EletrItemInvProcess.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagya',
				line: int,
				fieldId: 'custrecord_mts_accredcnpj_nfetagya'
			});
			objAux.brandOfCompanyCard = EletrItemInvProcess.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagya',
				line: int,
				fieldId: 'custrecord_mts_brandofcompcard_nfetagya'
			});
			objAux.authorizationNo = EletrItemInvProcess.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagya',
				line: int,
				fieldId: 'custrecord_mts_authorizationno_nfetagya'
			});
			objAux.accreditingCode = EletrItemInvProcess.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagya',
				line: int,
				fieldId: 'custrecord_mts_accreditingcode_nfetagya'
			});
			objAux.integratedTEF = EletrItemInvProcess.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagya',
				line: int,
				fieldId: 'custrecord_mts_integratedtef_nfetagya'
			});
			objAux.changeLine = EletrItemInvProcess.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagya',
				line: int,
				fieldId: 'custrecord_mts_changeline_nfetagya'
			});
			objAux.paymentIndicator = EletrItemInvProcess.getSublistValue({
				sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagya',
				line: int,
				fieldId: 'custrecord_mts_paymentind_nfetagya'
			});
			objList.push(objAux);
		}
		return objList;
	}
	
	function getTagZAditionalInformation(EletrItemInvProcessId){
		var objAux = {};
		var objList = [];
		var customrecord_mts_nfetagzSearchObj = search.create({
			   type: "customrecord_mts_nfetagz",
			   filters: [["custrecord_mts_eletinvno_nfetagz","anyof",EletrItemInvProcessId]],
			   columns:
			   [
			      search.createColumn({
			         name: "internalid",
			         sort: search.Sort.ASC
			      }),
			      "custrecord_mts_fiscaladdinfo_nfetagz",
			      "custrecord_mts_contributtoraddin_nfetagz",
			      "custrecord_mts_contaddinfo_nfetagz",
			      "custrecord_mts_fieldid_nfetagz",
			      "custrecord_mts_contribfield_nfetagz",
			      "custrecord_mts_fiscaldepfield_nfetagz",
			      "custrecord_mts_procsourceind_nfetagz",
			      "custrecord_mts_itemno_nfetagz",
			      "custrecord_mts_printoneletronici_nfetagz",
			      "custrecord_mts_infotype_nfetagz"
			   ]
			});
			var searchResultCount = customrecord_mts_nfetagzSearchObj.runPaged().count;
			if(!searchResultCount)
				return objList;
			customrecord_mts_nfetagzSearchObj.run().each(function(result){
				// .run().each has a limit of 4,000 results
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.fiscalAdditionalInformation = result.getValue({name: 'custrecord_mts_fiscaladdinfo_nfetagz'});
				objAux.contributorAdditionalInform = result.getValue({name: 'custrecord_mts_contributtoraddin_nfetagz'});
				objAux.contributorAdditionalInf2 = result.getValue({name: 'custrecord_mts_contaddinfo_nfetagz'});
				objAux.fieldID = result.getValue({name: 'custrecord_mts_contaddinfo_nfetagz'});
				objAux.contributorField = result.getValue({name: 'custrecord_mts_contribfield_nfetagz'});
				objAux.fiscalDepartmentField = result.getValue({name: 'custrecord_mts_fiscaldepfield_nfetagz'});
				objAux.processSourceIndicator = result.getValue({name: 'custrecord_mts_procsourceind_nfetagz'});
				objAux.itemNo = result.getValue({name: 'custrecord_mts_itemno_nfetagz'});
				objAux.printEletronicInvoice = result.getValue({name: 'custrecord_mts_printoneletronici_nfetagz'});
				objAux.informationType = result.getValue({name: 'custrecord_mts_infotype_nfetagz'});
				objAux.informationTypeText = result.getText({name: 'custrecord_mts_infotype_nfetagz'});
				objList.push(objAux);
				return true;
			});
		return objList;
	}
	
	function getTagZAExternalInformation(EletrItemInvProcess) {
		var objAux = {};
		var _numLines = EletrItemInvProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagza'});
		if(!_numLines)
			return objAux;
		
		objAux.id = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagza',
			line: 0,
			fieldId: 'id'
		});
		objAux.productShipmentState = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagza',
			line: 0,
			fieldId: 'custrecord_mts_prodshipstate_nfetagza'
		});
		objAux.shipmentPlace = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagza',
			line: 0,
			fieldId: 'custrecord_mts_shipplace_nfetagza'
		});
		return objAux;
	}
	
	function getTagZBPurchaseInformation(EletrItemInvProcess) {
		var objAux = {};
		var _numLines = EletrItemInvProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagzb'});
		if(!_numLines)
			return objAux;
		
		objAux.id = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagzb',
			line: 0,
			fieldId: 'id'
		});
		objAux.invoice = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagzb',
			line: 0,
			fieldId: 'custrecord_mts_invoice_nfetagzb'
		});
		objAux.order = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagzb',
			line: 0,
			fieldId: 'custrecord_mts_order_nfetagzb'
		});
		objAux.contract = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagzb',
			line: 0,
			fieldId: 'custrecord_mts_contract_nfetagzb'
		});
		return objAux;
	}
	
	function getProcessCCe(EletrItemInvProcess) {
		var objAux = {};
		return objAux;
	}
	
	function getProcessEPEC(EletrItemInvProcess) {
		var objAux={};
		var _numLines = EletrItemInvProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_processepec'});
		if(!_numLines)
			return objAux;
		
		objAux.eletronicInvoiceNo = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_processepec',
			line: 0,
			fieldId: 'custrecord_mts_eletinvno_processepec'
		});
		objAux.dateContigency = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_processepec',
			line: 0,
			fieldId: 'custrecord_mts_datecontigenc_processepec'
		});
		objAux.timeContigency = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_processepec',
			line: 0,
			fieldId: 'custrecord_mts_timecontigenc_processepec'
		});
		objAux.dateTimeContingency = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_processepec',
			line: 0,
			fieldId: 'custrecord_mts_datetimecont_processepec'
		});
		objAux.lotId = EletrItemInvProcess.getSublistValue({
			sublistId: 'recmachcustrecord_mts_eletinvno_processepec',
			line: 0,
			fieldId: 'custrecord_mts_lotid_processepec'
		});
		
		return objAux;
	}
	
	function getProcessEPECSearch(lvfilters){
		var objAux = {};
		var customrecord_mts_processepecSearchObj = search.create({
			   type: "customrecord_mts_processepec",
			   filters: lvfilters, //[["custrecord_mts_eletinvno_processepec","anyof","73"]]
			   columns:
			   [
			      search.createColumn({
			         name: "name",
			         sort: search.Sort.ASC
			      }),
			      "custrecord_mts_eletinvno_processepec",
			      "custrecord_mts_sequence_processepec",
			      "custrecord_mts_protocol_processepec",
			      "custrecord_mts_statusdescrip_processepec",
			      "custrecord_mts_lotid_processepec",
			      "custrecord_mts_nfekeyacess_processepec",
			      "custrecord_mts_cnpj_processepec",
			      "custrecord_mts_returncode_processepec",
			      "custrecord_mts_datetimecont_processepec",
			      "custrecord_mts_id_processepec",
			      "custrecord_mts_returndate_processepec",
			      "custrecord_mts_codeorgan_processepec",
			      "custrecord_mts_pendacckey_processepec",
			      "custrecord_mts_contjust_processepec",
			      "custrecord_mts_datecontigenc_processepec",
			      "custrecord_mts_timecontigenc_processepec"
			   ]
			});
			var searchResultCount = customrecord_mts_processepecSearchObj.runPaged().count;
			if(searchResultCount){
				customrecord_mts_processepecSearchObj.run().each(function(result){
					objAux.name = result.getValue({name: 'name'});
					objAux.sequence = result.getValue({name: 'custrecord_mts_sequence_processepec'});
					objAux.protocol = result.getValue({name: 'custrecord_mts_protocol_processepec'});
					objAux.statusDescription = result.getValue({name: 'custrecord_mts_statusdescrip_processepec'});
					objAux.lotId = result.getValue({name: 'custrecord_mts_lotid_processepec'});
					objAux.nfeKeyAccess = result.getValue({name: 'custrecord_mts_nfekeyacess_processepec'});
					objAux.cnpj = result.getValue({name: 'custrecord_mts_cnpj_processepec'});
					objAux.returnCode = result.getValue({name: 'custrecord_mts_returncode_processepec'});
					objAux.dateTimeContingency = result.getValue({name: 'custrecord_mts_datetimecont_processepec'});
					objAux.idEPEC = result.getValue({name: 'custrecord_mts_id_processepec'});
					objAux.returnDate = result.getValue({name: 'custrecord_mts_returndate_processepec'});
					objAux.codeOrgan = result.getValue({name: 'custrecord_mts_codeorgan_processepec'});
					objAux.pendingAccessKey = result.getValue({name: 'custrecord_mts_pendacckey_processepec'});
					objAux.contingencyJustification = result.getValue({name: 'custrecord_mts_contjust_processepec'});
					objAux.dateContigency = result.getValue({name: 'custrecord_mts_datecontigenc_processepec'});
					objAux.timeContigency = result.getValue({name: 'custrecord_mts_timecontigenc_processepec'});
				});
			}
			return objAux;
	}
	
	function getFolder(lvfilters){
		var obj = {};
		var list = [];
		var folderSearchObj = search.create({
			   type: "folder",
			   filters: lvfilters, // [["name","is","xml"]],			   
			   columns:
			   [
			      "internalid",
			      search.createColumn({
			         name: "name",
			         sort: search.Sort.ASC
			      }),
			      "parent"
			   ]
			});
			var searchResultCount = folderSearchObj.runPaged().count;
			if(searchResultCount){
				folderSearchObj.run().each(function(result){
					// .run().each has a limit of 4,000 results
					obj = {};
					obj.internalid = result.getValue({name: 'internalid'});
					obj.name = result.getValue({name: 'name'});
					obj.parent = result.getValue({name: 'parent'});
					obj.parentText = result.getText({name: 'parent'});
					list.push(obj);
					return true;
				});
			}
		return list;
	}
	
	function getSpecialCharacter(lvfilters) {
		var objAux = {};
		var objList = [];
		var customrecord_mts_speccharacSearchObj = search.create({
			   type: "customrecord_mts_speccharac",
			   filters: lvfilters,//  [["custrecord_mts_characfrom_speccharac","contains","�"]]
			   columns:
			   [
			      "internalid",
			      search.createColumn({
			         name: "custrecord_mts_characfrom_speccharac",
			         sort: search.Sort.ASC
			      }),
			      "custrecord_mts_characto_speccharac"
			   ]
			});
			var searchResultCount = customrecord_mts_speccharacSearchObj.runPaged().count;
			if(!searchResultCount)
				return objList;
			customrecord_mts_speccharacSearchObj.run().each(function(result){
				// .run().each has a limit of 4,000 results
				objAux = {};
				objAux.internalid = result.getValue({name: 'internalid'});
				objAux.characfrom = result.getValue({name: 'custrecord_mts_characfrom_speccharac'});
				objAux.characto = result.getValue({name: 'custrecord_mts_characto_speccharac'});
				
				objList.push(objAux);
				return true;
			});
		return objList;
	}
	
	function getLookupField(recordtype,recordid,lvcolumns){
		var fieldLookUp = search.lookupFields({
		    type:recordtype,
		    id: recordid,
		    columns: lvcolumns
		});
		return fieldLookUp;
	}

	function getCustomerEntity(lvId){
		var custEntityObj = getEntity(lvId, 2);

		// set customer informations


		return custEntityObj;
	}

	function getVendorEntity(lvId){
		var vendEntityObj = getEntity(lvId, 1);
		
		// set vendor informations


		return vendEntityObj;
	}

	function getEntity(lvId, sourcetype) {
		var EntityRecLoad;
		if(sourcetype == 1)// Purchase
			EntityRecLoad = getRecordLoad('vendor', lvId);
		if(sourcetype == 2)// Sale
			EntityRecLoad = getRecordLoad('customer', lvId);

		if (EntityRecLoad) {
			var entityObj = {};
			entityObj.recordObj = EntityRecLoad;
			entityObj.id = EntityRecLoad.id;
			entityObj.name = EntityRecLoad.getText({fieldId: 'entityid'});
			entityObj.paymentMethodCode = EntityRecLoad.getValue({fieldId: 'custentity_mts_paymentmethodcode'});
			entityObj.paymentMethodCodeText = EntityRecLoad.getText({fieldId: 'custentity_mts_paymentmethodcode'});
			entityObj.companyName = EntityRecLoad.getValue({fieldId: 'companyname'});
			entityObj.categoryValue = EntityRecLoad.getValue({fieldId: 'custentity_mts_categoryloc'});
			entityObj.categoryText = EntityRecLoad.getText({fieldId: 'custentity_mts_categoryloc'});
			entityObj.phone = EntityRecLoad.getValue({fieldId: 'phone'}).replace(/\.|\/|-/g, '');
			entityObj.noPassportDocument = EntityRecLoad.getValue({fieldId: 'custentity_mts_noofpasslegal'});
			entityObj.indicatorIEAddresee = EntityRecLoad.getValue({fieldId: 'custentity_mts_indicatorie'});
			entityObj.indicatorIEAddreseeText = EntityRecLoad.getValue({fieldId: 'custentity_mts_indicatorie'});
			entityObj.cnpjCpf = EntityRecLoad.getValue({fieldId: 'custentity_mts_cnpjcpf'}).replace(/\.|\/|-/g, '');
			entityObj.ie = EntityRecLoad.getValue({fieldId: 'custentity_mts_ie'}).replace(/\.|\/|-/g, '');
			entityObj.suframaCode = EntityRecLoad.getValue({fieldId: 'custentity_mts_suframacode'});
			entityObj.email = EntityRecLoad.getValue({fieldId: 'email'});
			entityObj.nfeEmail = EntityRecLoad.getValue({fieldId: 'custentity_mts_emailnfe'});
			//Fields Only Vendor
			if(sourcetype == 1){// Purchase
				entityObj.vendorTax = EntityRecLoad.getValue({fieldId: 'custentity_mts_vendortax'});		
				entityObj.tareCode = EntityRecLoad.getValue({fieldId: 'custentity_mts_tarecode'});		
				entityObj.tareCodeText = EntityRecLoad.getText({fieldId: 'custentity_mts_tarecode'});		
				entityObj.companyType = EntityRecLoad.getValue({fieldId: 'custentity_mts_companytype'});		
				entityObj.companyTypeText = EntityRecLoad.getText({fieldId: 'custentity_mts_companytype'});		
				entityObj.nftsTaxationRegime = EntityRecLoad.getValue({fieldId: 'custentity_mts_nftstaxationregime'});		
				entityObj.nftsTaxationRegimeText = EntityRecLoad.getText({fieldId: 'custentity_mts_nftstaxationregime'});		
				entityObj.noGenerateDES = EntityRecLoad.getValue({fieldId: 'custentity_mts_nogeneratedes'});		
				entityObj.vendorPostingGroup = EntityRecLoad.getValue({fieldId: 'custentity_mts_vendpostgroup'});		
				entityObj.vendorPostingGroupText = EntityRecLoad.getText({fieldId: 'custentity_mts_vendpostgroup'});		
				entityObj.defaultBankAccount = EntityRecLoad.getValue({fieldId: 'custentity_mts_defaultbankaccount'});		
				entityObj.defaultBankAccountText = EntityRecLoad.getText({fieldId: 'custentity_mts_defaultbankaccount'});		
				entityObj.nameOnCheck = EntityRecLoad.getValue({fieldId: 'custentity_mts_nameoncheque'});		
				entityObj.isCustoms = EntityRecLoad.getValue({fieldId: 'custentity_mts_iscustoms'});		
				entityObj.requestClearanceCode = EntityRecLoad.getValue({fieldId: 'custentity_mts_reqclearancecode'});		

			}
			//Labels
			entityObj.indicatorIEAddreseeLabel = EntityRecLoad.getField({fieldId: 'custentity_mts_indicatorie'}).label;
			entityObj.paymentMethodCodeLabel = EntityRecLoad.getField({fieldId: 'custentity_mts_paymentmethodcode'});
			//Fields Only Vendor
			if(sourcetype == 1){// Purchase
				entityObj.vendorTax = EntityRecLoad.getField({fieldId: 'custentity_mts_vendortax'}).label;		
				entityObj.tareCode = EntityRecLoad.getField({fieldId: 'custentity_mts_tarecode'}).label;		
				entityObj.companyType = EntityRecLoad.getField({fieldId: 'custentity_mts_companytype'}).label;		
				entityObj.nftsTaxationRegime = EntityRecLoad.getField({fieldId: 'custentity_mts_nftstaxationregime'}).label;		
				entityObj.noGenerateDES = EntityRecLoad.getField({fieldId: 'custentity_mts_nogeneratedes'}).label;		
				entityObj.vendorPostingGroup = EntityRecLoad.getField({fieldId: 'custentity_mts_vendpostgroup'}).label;		
				entityObj.defaultBankAccount = EntityRecLoad.getField({fieldId: 'custentity_mts_defaultbankaccount'}).label;		
				entityObj.nameOnCheck = EntityRecLoad.getField({fieldId: 'custentity_mts_nameoncheque'}).label;		
				entityObj.isCustoms = EntityRecLoad.getField({fieldId: 'custentity_mts_iscustoms'}).label;		
				entityObj.requestClearanceCode = EntityRecLoad.getField({fieldId: 'custentity_mts_reqclearancecode'}).label;		

			}
			
			// Entity Address
			entityObj.hasBillingAddress = false;
			
			var sublistAddrId = EntityRecLoad.findSublistLineWithValue({
				sublistId: 'addressbook',
				fieldId: 'defaultbilling',
				value: 'T'
			});
			
			if(sublistAddrId >= 0){

				var entityaddress = EntityRecLoad.getSublistSubrecord({
					sublistId: 'addressbook',
					fieldId: 'addressbookaddress',
					line: sublistAddrId
				});

				if (entityaddress) {
					entityObj.hasBillingAddress = true;
					entityObj.country= entityaddress.getValue({fieldId: 'country'});
					entityObj.countryText = entityaddress.getText({fieldId: 'country'});
					entityObj.state= entityaddress.getValue({fieldId:'state'});
					entityObj.city= entityaddress.getValue({fieldId:'city'});
					entityObj.zipCode= entityaddress.getValue({fieldId:'zip'}).replace(/-/g, '');
					entityObj.district= entityaddress.getValue({fieldId:'custrecord_mtsdistrict'});
					entityObj.address= entityaddress.getValue({fieldId:'addr1'});
					entityObj.number= entityaddress.getValue({fieldId:'custrecord_mts_number'});
					entityObj.dimobCode= entityaddress.getValue({fieldId:'custrecord_mts_dimobcitycode_address'});
					entityObj.ibgecityCode= entityaddress.getValue({fieldId:'custrecord_mts_ibgecitycode'});
					entityObj.complement = entityaddress.getValue({fieldId:'custrecord_mts_complement'});
					// Labels
					entityObj.districtLabel = entityaddress.getField({fieldId:'custrecord_mtsdistrict'}).label;
					entityObj.numberLabel = entityaddress.getField({fieldId:'custrecord_mts_number'}).label;
	
					// get country informations
					var countryList = getCountries(['name', 'is', entityObj.country]);
					entityObj.countryDescription = countryList.length ? countryList[0].description : '';
					entityObj.countryBacenCode = countryList.length ? countryList[0].bacenCode : '';
				}

			}

			// AuthorizesXMLs
			entityObj.authorizeXMLs = [];
			var numAuthorizeXMLs = EntityRecLoad.getLineCount({ sublistId: 'recmachcustrecord_mts_entityid_authdownloadxml' });
			if (numAuthorizeXMLs){
				for(var count = 0;count < numAuthorizeXMLs;count++){
					entityObj.authorizeXMLs.push({
						lineNo: count+1,
						id: lvTransacRecLoad.getSublistValue({
							sublistId: 'recmachcustrecord_mts_entityid_authdownloadxml',
							fieldId: 'id',
							line: count
						}),
						cnpjCpf: lvTransacRecLoad.getSublistValue({
							sublistId: 'recmachcustrecord_mts_entityid_authdownloadxml',
							fieldId: 'custrecord_mts_cnpjcpf_authdownloadxml',
							line: count
						}).replace(/\.|\/|-/g, ''),
						name: lvTransacRecLoad.getSublistValue({
							sublistId: 'recmachcustrecord_mts_entityid_authdownloadxml',
							fieldId: 'custrecord_mts_descripti_authdownloadxml',
							line: count
						}),
						no: lvTransacRecLoad.getSublistValue({
							sublistId: 'recmachcustrecord_mts_entityid_authdownloadxml',
							fieldId: 'custrecord_mts_no_authdownloadxml',
							line: count
						}),
						isPerson: lvTransacRecLoad.getSublistValue({
							sublistId: 'recmachcustrecord_mts_entityid_authdownloadxml',
							fieldId: 'custrecord_mts_isperson_authdownloadxml',
							line: count
						}),
						category: lvTransacRecLoad.getSublistValue({
							sublistId: 'recmachcustrecord_mts_entityid_authdownloadxml',
							fieldId: 'custrecord_mts_category_authdownloadxml',
							line: count
						}),
						
					});
				}
			}
			
			return entityObj;

		}else{
			return;
		}	
	}

	function getShippingAgent(lvId){
		var shippingAgentRecLoad = getRecordLoad('vendor', lvId);

		var shippingAgent = {
			recordObj:shippingAgentRecLoad,
			id: shippingAgentRecLoad.getValue({fieldId: 'id'}),
			name: shippingAgentRecLoad.getValue({fieldId: 'entityid'}),
			cnpjCpf: shippingAgentRecLoad.getText({fieldId: 'custentity_mts_cnpjcpf'}).replace(/\.|\/|-/g, ''),
			ie: shippingAgentRecLoad.getText({fieldId: 'custentity_mts_ie'}).replace(/\.|\/|-/g, ''),
			tareCode: shippingAgentRecLoad.getValue({fieldId: 'custentity_mts_tarecode'}),
			category: shippingAgentRecLoad.getValue({fieldId: 'custentity_mts_categoryloc'}),
			categoryText: shippingAgentRecLoad.getText({fieldId: 'custentity_mts_categoryloc'})
		};

		// Entity Address
		var sublistAddrId = shippingAgentRecLoad.findSublistLineWithValue({
			sublistId: 'addressbook',
			fieldId: 'defaultbilling',
			value: 'T'
		});
		var entityaddress = shippingAgentRecLoad.getSublistSubrecord({
			sublistId: 'addressbook',
			fieldId: 'addressbookaddress',
			line: sublistAddrId
		});
		if (entityaddress) {
			shippingAgent.country= entityaddress.getValue({fieldId: 'country'});
			shippingAgent.countryText = entityaddress.getText({fieldId: 'country'});
			shippingAgent.state= entityaddress.getValue({fieldId:'state'});
			shippingAgent.city= entityaddress.getValue({fieldId:'city'});
			shippingAgent.zipCode= entityaddress.getValue({fieldId:'zip'}).replace(/-/g, '');
			shippingAgent.district= entityaddress.getValue({fieldId:'custrecord_mtsdistrict'});
			shippingAgent.address= entityaddress.getValue({fieldId:'addr1'});
			shippingAgent.number= entityaddress.getValue({fieldId:'custrecord_mts_number'});
			shippingAgent.dimobCode= entityaddress.getValue({fieldId:'custrecord_mts_dimobcitycode_address'});
			shippingAgent.ibgecityCode= entityaddress.getValue({fieldId:'custrecord_mts_ibgecitycode'});
			shippingAgent.complement = entityaddress.getValue({fieldId:'custrecord_mts_complement'});
		}

		return shippingAgent;
	}

	function getSearchTagB(lvfilters) {
		var objAux = {};
		var tagb = search.create({
			   type: "customrecord_mts_nfetagb",
			   filters: lvfilters,//  [["custrecord_mts_eletronicinvno_nfetagb","anyof","1"]]
			   columns:
			   [
			      "internalid",
			   ]
			});
			var searchResultCount = tagb.runPaged().count;
			if(!searchResultCount)
				return objAux;
			tagb.run().each(function(result){
				// .run().each has a limit of 4,000 results
				objAux.internalid = result.getValue({name: 'internalid'});
	
				return true;
			});
		return objAux;
	}
	
	//Filtra na Detail Tariff Number NCM
	function getDetailTariffNumberNCM(lvfilters) {
		var objAux = {};
		var objList = [];
		
		var _DetailTariffNumberNCM = search.create({
		   type: "customrecord_mts_detailncm",
		   filters: lvfilters,
		   columns:
		   [
		      //"name",
			  "internalid",
			  "custrecord_mts_tariffnumber_detailncm",
		      "custrecord_mts_taxidentificat_detailncm",
		      "custrecord_mts_startdate_detailncm",
		      "custrecord_mts_enddate_detailncm",
		      "custrecord_mts_taxpercent_detailncm",
		      "custrecord_mts_taxbasetype_detailncm",
		      "custrecord_mts_csttaxout_detailncm",
		      "custrecord_mts_csttaxinput_detailncm",
		      "custrecord_mts_economicactivit_detailncm",
		      "custrecord_mts_economicactivde_detailncm",
		      "custrecord_mts_processorconcac_detailncm",
		      "custrecord_mts_indprocessorco_detailncm",
		      "custrecord_mts_classifipicode_detailncm"
		   ]
		});
	
		var resultCount = _DetailTariffNumberNCM.runPaged().count;
		if (resultCount) {
			_DetailTariffNumberNCM.run().each(function(result){
				objAux = {};
				//objAux.name = result.getValue({name: 'name'});
				objAux.tariffnumber = result.getValue({name: 'custrecord_mts_tariffnumber_detailncm'});
				objAux.internalid = result.getValue({name: 'internalid'});
				objAux.taxidentification = result.getValue({name: "custrecord_mts_taxidentificat_detailncm"});
				objAux.taxidentificationText = result.getText({name: "custrecord_mts_taxidentificat_detailncm"});
				objAux.startdate = result.getValue({name: "custrecord_mts_startdate_detailncm"});
				objAux.enddate = result.getValue({name: "custrecord_mts_enddate_detailncm"});
				objAux.taxpercent = result.getValue({name: "custrecord_mts_taxpercent_detailncm"});
				if (objAux.taxpercent)
					if (objAux.taxpercent.indexOf('%')!=-1)
						objAux.taxpercent = objAux.taxpercent.replace('%', '');
				objAux.taxpercent = parseFloat(objAux.taxpercent);
				objAux.taxbasetype = result.getValue({name: "custrecord_mts_taxbasetype_detailncm"});
				objAux.taxbasetypeText = result.getText({name: "custrecord_mts_taxbasetype_detailncm"});
				objAux.csttaxoutput = result.getValue({name: "custrecord_mts_csttaxout_detailncm"});
				objAux.csttaxoutputText = result.getText({name: "custrecord_mts_csttaxout_detailncm"});
				objAux.csttaxinput = result.getValue({name: "custrecord_mts_csttaxinput_detailncm"});
				objAux.csttaxinputText = result.getText({name: "custrecord_mts_csttaxinput_detailncm"});
				objAux.economicactivitycode = result.getValue({name: "custrecord_mts_economicactivit_detailncm"});
				objAux.economicactivitycodeText = result.getText({name: "custrecord_mts_economicactivit_detailncm"});
				objAux.economicactivitydescription = result.getValue({name: "custrecord_mts_economicactivde_detailncm"});
				objAux.processorconcessory = result.getValue({name: "custrecord_mts_processorconcac_detailncm"});
				objAux.indprocessorconcessory = result.getValue({name: "custrecord_mts_indprocessorco_detailncm"});
				objAux.indprocessorconcessoryText = result.getText({name: "custrecord_mts_indprocessorco_detailncm"});
				objAux.classificationipi = result.getValue({name: "custrecord_mts_classifipicode_detailncm"});
				objAux.classificationipiText = result.getText({name: "custrecord_mts_classifipicode_detailncm"});
				objList.push(objAux);
				return true;
			});			
		}
		return objList;
	}
	
	function getReturnCode(lvfilters) {
		var objAux = {};
		var customrecord_mts_returncodeSearchObj = search.create({
			   type: "customrecord_mts_returncode",
			   filters: lvfilters, //[["name","is","100"]]
			   columns:
			   [
			      "internalid",
			      search.createColumn({
			         name: "name",
			         sort: search.Sort.ASC
			      }),
			      "custrecord_mts_type_returncode",
			      "custrecord_mts_description_returncode",
			      "custrecord_mts_bookobservati_returncode",
			      "custrecord_mts_negativereturn_returncode",
			      "custrecord_mts_unlinknfeproc_returncode"
			   ]
			});
			var searchResultCount = customrecord_mts_returncodeSearchObj.runPaged().count;
			if (searchResultCount) {
				customrecord_mts_returncodeSearchObj.run().each(function(result){
					// .run().each has a limit of 4,000 results
					objAux = {};
					objAux.internalid = result.getValue({name: 'internalid'});
					objAux.name = result.getValue({name: 'name'});
					objAux.type = result.getValue({name: 'custrecord_mts_type_returncode'});
					objAux.typeText = result.getText({name: 'custrecord_mts_type_returncode'});
					objAux.description = result.getValue({name: 'custrecord_mts_description_returncode'});
					objAux.negativeReturn = result.getValue({name: 'custrecord_mts_negativereturn_returncode'});
					objAux.unlinkNFeProcess = result.getValue({name: 'custrecord_mts_unlinknfeproc_returncode'});
					//return true;
				});
			}
		return objAux;
	}
	
	function getEletrInvReturn(lvFilters) {
		var objAux = {};
		var customrecord_mts_eletinvretSearchObj = search.create({
			   type: "customrecord_mts_eletinvret",
			   filters: lvFilters,// [["custrecord_mts_eletinvprocess_eletinvret","anyof","73"]]
			   columns:
			   [
			      search.createColumn({
			         name: "name",
			         sort: search.Sort.ASC
			      }),
			      "internalid",
			      "custrecord_mts_eletinvprocess_eletinvret",
			      "custrecord_mts_nfekeyacess_eletinvret",
			      "custrecord_mts_protocol_eletinvret",
			      "custrecord_mts_returnstatus_eletinvret",
			      "custrecord_mts_returncode_eletinvret",
			      "custrecord_mts_eletivntype_eletinvret",
			      "custrecord_mts_invoiceno_eletinvret",
			      "custrecord_mts_returndate_eletinvret"
			   ]
			});
			var searchResultCount = customrecord_mts_eletinvretSearchObj.runPaged().count;
			if(searchResultCount){
				customrecord_mts_eletinvretSearchObj.run().each(function(result){
					// .run().each has a limit of 4,000 results
					objAux = {};
					objAux.internalId = result.getValue({name: 'internalid'});
					//return true;
				});
			}
			return objAux;
	}

	function getSpecificDueDates(lvfilters) {
		var objAux = {};
		var objList = [];
		
		var specificDueDateSearch = search.create({
		   type: "customrecord_mts_specduedate",
		   filters: lvfilters,
		   columns:
		   [
			   "internalid",
			   "custrecord_mts_code_specduedate",
			   "custrecord_mts_fixeddate_specduedate",
			   "custrecord_mts_weekdate_specduedate",
		   ]
		});
	
		var resultCount = specificDueDateSearch.runPaged().count;
		if (resultCount) {
			specificDueDateSearch.run().each(function(result){
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.code = result.getValue({name: 'custrecord_mts_code_specduedate'});
				objAux.fixedDate = result.getValue({name: 'custrecord_mts_fixeddate_specduedate'});
				objAux.weekDate = result.getValue({name: 'custrecord_mts_weekdate_specduedate'});
				objAux.weekDateText = result.getText({name: 'custrecord_mts_weekdate_specduedate'});

				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}
	
	function getPaymentDetailOrder(lvfilters) {
		var objAux = {};
		var objList = [];
		
		var PaymentDetailOrderSearch = search.create({
		   type: "customrecord_mts_paydtlod",
		   filters: lvfilters,
		   columns:
		   [
			   "internalid",
			   "custrecord_mts_installmentno_paydtlod",
			   "custrecord_mts_amount_paydtlod",
			   "custrecord_mts_duedate_paydtlod"
		   ]
		});
	
		var resultCount = PaymentDetailOrderSearch.runPaged().count;
		if (resultCount) {
			PaymentDetailOrderSearch.run().each(function(result){
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.intallmentNo = result.getValue({name: 'custrecord_mts_installmentno_paydtlod'});
				objAux.amount = result.getValue({name: 'custrecord_mts_amount_paydtlod'});
				objAux.dueDate = result.getValue({name: 'custrecord_mts_duedate_paydtlod'});
				
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}
     
	function generalLedgerSetupByRecLoad(){//General Ledger Setup
		var _result = {};
		var customrecord_mts_genledgersetupSearchObj = search.create({
			   type: "customrecord_mts_genledgersetup",
			   filters:
			   [
			   ],
			   columns:
			   [
			      search.createColumn({
			         name: "internalid",
			         sort: search.Sort.ASC
			      }),
			   ]
			});
		
		var searchResultCount = customrecord_mts_genledgersetupSearchObj.runPaged().count;
		_result.length = searchResultCount;
		
		customrecord_mts_genledgersetupSearchObj.run().each(function(result){
			_result.id = result.getValue({name:'internalid'});
			
			var lvgeneralLedgerSetupByRecLoadRecLoad = getRecordLoad('customrecord_mts_genledgersetup', _result.id);
			_result.recordObj=lvgeneralLedgerSetupByRecLoadRecLoad;
			_result.allowpostingfrom = lvgeneralLedgerSetupByRecLoadRecLoad.getValue({fieldId: 'custrecord_mts_allowfrom_genledgersetup' });
			_result.allowpostingto = lvgeneralLedgerSetupByRecLoadRecLoad.getValue({fieldId: 'custrecord_mts_allowto_genledgersetup' });
			_result.regimetime = lvgeneralLedgerSetupByRecLoadRecLoad.getValue({fieldId: 'custrecord_mts_regtime_genledgersetup' });
			_result.markcrmemoascorrection = lvgeneralLedgerSetupByRecLoadRecLoad.getValue({fieldId: 'custrecord_mts_markcrmemo_genledgersetup' });
			_result.lcycode = lvgeneralLedgerSetupByRecLoadRecLoad.getValue({fieldId: 'custrecord_mts_lcycode_genledgsetup' });
			_result.amountroundingprecision = lvgeneralLedgerSetupByRecLoadRecLoad.getValue({fieldId: 'custrecord_mts_amount_genledgersetup' });
			_result.amountroundingprecision = _result.amountroundingprecision ?_result.amountroundingprecision :2;
			// Labels
			_result.allowpostingfromLabel = lvgeneralLedgerSetupByRecLoadRecLoad.getField({fieldId: 'custrecord_mts_allowfrom_genledgersetup' }).label;
			_result.allowpostingtoLabel = lvgeneralLedgerSetupByRecLoadRecLoad.getField({fieldId: 'custrecord_mts_allowto_genledgersetup' }).label;
			_result.regimetimeLabel = lvgeneralLedgerSetupByRecLoadRecLoad.getField({fieldId: 'custrecord_mts_regtime_genledgersetup' }).label;
			_result.markcrmemoascorrectionLabel = lvgeneralLedgerSetupByRecLoadRecLoad.getField({fieldId: 'custrecord_mts_markcrmemo_genledgersetup' }).label;
			_result.amountroundingprecisionLabel = lvgeneralLedgerSetupByRecLoadRecLoad.getField({fieldId: 'custrecord_mts_amount_genledgersetup' }).label;
			_result.lcycodeLabel = lvgeneralLedgerSetupByRecLoadRecLoad.getValue({fieldId: 'custrecord_mts_lcycode_genledgsetup' }).label;
			
		});
		return _result;
	}
	
	function getIBPTCode(lvfilters) {
		var objAux = {};
		var objList = [];
		
		var _ObjIBPTCode = search.create({
		   type: "customrecord_mts_ibpt",
		   filters: lvfilters,
		   columns:
		   [
			search.createColumn({
				name: "name",
				sort: search.Sort.ASC
			 }),
			 "custrecord_mts_ex_ibpt",
			 "custrecord_mts_type_ibpt",
			 "custrecord_mts_tax_cargo_nat_ibpt",
			 "custrecord_mts_tax_cargo_state_ibpt",
			 "custrecord_mts_tax_cargo_municipal_ibpt",
			 "custrecord_mts_startingdateofterm_ibpt",
			 "custrecord_mts_ending_date_of_term_ibpt",
			 "custrecord_mts_key_ibpt",
			 "custrecord_mts_fonte_ibpt",
			 "custrecord_mts_territory_code_ibpt",
			 "custrecord_mts_ncm_nbs_code_ibpt",
			 "custrecord_mts_version_ibpt",
			 "custrecord_mts_taxcargoimported_ibpt",
			 "internalid"
		   ]
		});
	
		var resultCount = _ObjIBPTCode.runPaged().count;
		if (resultCount) {
			_ObjIBPTCode.run().each(function(result){
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.name = result.getValue({name: 'name'});		
				objAux.ex = result.getValue({name:"custrecord_mts_ex_ibpt"});
				objAux.type = result.getValue({name:"custrecord_mts_type_ibpt"});
				objAux.typeText = result.getText({name:"custrecord_mts_type_ibpt"});
				objAux.taxcargonational = result.getValue({name:"custrecord_mts_tax_cargo_nat_ibpt"});
				objAux.taxcargostate = result.getValue({name:"custrecord_mts_tax_cargo_state_ibpt"});
				objAux.taxcargomunicipal = result.getValue({name:"custrecord_mts_tax_cargo_municipal_ibpt"});
				objAux.startingdateofterm = result.getValue({name: "custrecord_mts_startingdateofterm_ibpt"});
				objAux.endingdateofterm = result.getValue({name: "custrecord_mts_ending_date_of_term_ibpt"});
				objAux.key = result.getValue({name: "custrecord_mts_key_ibpt"});
				objAux.font = result.getValue({name:"custrecord_mts_fonte_ibpt"});
				objAux.territory = result.getValue({name:"custrecord_mts_territory_code_ibpt"});
				objAux.territoryText = result.getText({name:"custrecord_mts_territory_code_ibpt"});
				objAux.ncmnbscode = result.getValue({name: "custrecord_mts_ncm_nbs_code_ibpt"});
				objAux.ncmnbscodeText = result.getText({name: "custrecord_mts_ncm_nbs_code_ibpt"});
				objAux.version = result.getValue({name:"custrecord_mts_version_ibpt"});
				objAux.taxcargoimported = result.getValue({name: "custrecord_mts_taxcargoimported_ibpt"});
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}
	
	function eInvoiceCancellation(lvfilters) {
		var objList = [];
		var objAux = {};
		var mySearch = search.create({
			type : "customrecord_mts_einvcancel",
			filters : lvfilters,
			columns : [ 
			            "internalid", 		
			            "custrecord_mts_code_einvcancel",
			            "custrecord_mts_invoiceno_einvcancel",
			            "custrecord_mts_chnfe_einvcancel",
			            "custrecord_mts_xjust_einvcancel",
			            "custrecord_mts_enviromid_einvcancel",
			            "custrecord_mts_noseries_einvcancel",
			            "custrecord_mts_branchcode_einvcancel",
			            "custrecord_mts_cancelevent_einvcancel"
		            ]
		});

		var resultCount = mySearch.runPaged().count;
		if (resultCount) {
			mySearch.run().each(function(result) {
				objAux = {};
				objAux.id = result.getValue({name : 'internalid'});
				objAux.code = result.getValue({name : 'custrecord_mts_code_einvcancel'});
				objAux.invoiceNo = result.getValue({name : 'custrecord_mts_invoiceno_einvcancel'});
				objAux.chNfe = result.getValue({name : 'custrecord_mts_chnfe_einvcancel'});
				objAux.xJust = result.getValue({name : 'custrecord_mts_xjust_einvcancel'});
				objAux.environmentId = result.getValue({name : 'custrecord_mts_enviromid_einvcancel'});
				objAux.noSeries = result.getValue({name : 'custrecord_mts_noseries_einvcancel'});
				objAux.branchCode = result.getValue({name : 'custrecord_mts_branchcode_einvcancel'});
				objAux.cancelEventNo = result.getValue({name : 'custrecord_mts_cancelevent_einvcancel'});
				objList.push(objAux);
				return true;
			});
		}
		return objList;
	}

	function getUnitOfMeasureLoc(lvfilters) {
		var objAux = {};
		var objList = [];
		
		var unitOfMeasureLocSearch = search.create({
		   type: "customrecord_mts_uomloc",
		   filters: lvfilters,
		   columns:
		   [
			   "internalid",
			   "custrecord_mts_code_uomloc",
			   "custrecord_mts_efilescode_uomloc",
			   "custrecord_mts_fcicode_uomloc"
		   ]
		});
	
		var resultCount = unitOfMeasureLocSearch.runPaged().count;
		if (resultCount) {
			unitOfMeasureLocSearch.run().each(function(result){
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.code = result.getValue({name: 'custrecord_mts_code_uomloc'});
				objAux.efilesCode = result.getValue({name: 'custrecord_mts_efilescode_uomloc'});
				objAux.fciCode = result.getValue({name: 'custrecord_mts_fcicode_uomloc'});
				
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}
	
	function getUnitOfMeasureLocByRecLoad(lvId) {
		var UnitOfMeasureLocRecLoad = getRecordLoad('customrecord_mts_uomloc', lvId);
		if (UnitOfMeasureLocRecLoad) {
			return {
				recordObj:UnitOfMeasureLocRecLoad,
				id: UnitOfMeasureLocRecLoad.id,
				code: UnitOfMeasureLocRecLoad.getValue({fieldId: 'custrecord_mts_code_uomloc'}),
				efilesCode: UnitOfMeasureLocRecLoad.getValue({fieldId: 'custrecord_mts_efilescode_uomloc'}),
				fciCode: UnitOfMeasureLocRecLoad.getValue({fieldId: 'custrecord_mts_fcicode_uomloc'}),
			}						
		}else{
			return;
		}	
	}

	function getTariffNumberByRecLoad(lvId) {
		var tariffNumberRecLoad = getRecordLoad('customrecord_mts_tariffnumber', lvId);
		if (tariffNumberRecLoad) {
			return {
				recordObj:tariffNumberRecLoad,
				id: tariffNumberRecLoad.id,
				code: tariffNumberRecLoad.getValue({fieldId: 'name'}).replace(/\.|\/|-/g, ''),
				gender: tariffNumberRecLoad.getValue({fieldId: 'custrecord_mts_gender_tariffnumber'}),
				cestCode: tariffNumberRecLoad.getValue({fieldId: 'custrecord_mts_cest_tariffnumber'}),
				taxableUnitOfMeasure: tariffNumberRecLoad.getValue({fieldId: 'custrecord_mts_taxunitmeas_tariffnumber'})
			}						
		}else{
			return;
		}	
	}

	function getINSSWithheld(lvfilters) {
		var objAux = {};
		var objList = [];
		
		var _INSSWithheld = search.create({
		   type: "customrecord_mts_isswiththird",
		   filters: lvfilters,
		   columns:
		   [
			"internalid",
			"custrecord_mts_vendorno_isswiththird",
			"custrecord_mts_refermonth_isswiththird",
			"custrecord_mts_referstartd_isswiththird",
			"custrecord_mts_baseamount_isswiththird",
			"custrecord_mts_withtaxamoun_isswiththird"
		   ]
		});
	
		var resultCount = _INSSWithheld.runPaged().count;
		if (resultCount) {
			_INSSWithheld.run().each(function(result){
				objAux = {};				
				objAux.internalid = result.getValue({name:"internalid"});
				objAux.insswithheldbythirdvendor = result.getValue({name:"custrecord_mts_vendorno_isswiththird"});
				objAux.insswithheldbythirdvendorText = result.getText({name:"custrecord_mts_vendorno_isswiththird"});
				objAux.referencemonth = result.getValue({name:"custrecord_mts_refermonth_isswiththird"});
				objAux.referencestartingdate = result.getValue({name:"custrecord_mts_referstartd_isswiththird"});
				objAux.baseamount = result.getValue({name:"custrecord_mts_baseamount_isswiththird"});
				objAux.withheldtaxamount = result.getValue({name:"custrecord_mts_withtaxamoun_isswiththird"});
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}

	function getINSSWithheldSum(lvfilters, columnsum) {
		var objSum = 0;
		var _INSSWithheld = search.create({
		   type: "customrecord_mts_isswiththird",
		   filters: lvfilters,
		   columns:[{
					name:columnsum,
					summary: "SUM"
				}]
		});
	
		var resultCount = _INSSWithheld.runPaged().count;
		if (resultCount) {
			_INSSWithheld.run().each(function(result){
				objSum = result.getValue({
					name:columnsum,
					summary: "SUM"
				});
				return true;
			});			
		}
		return objSum;
	}
	
	function getCustomerItems(lvfilters) {
		var objAux = {};
		var objList = [];
		
		var custItemSearch = search.create({
		   type: "customrecord_mts_customitem",
		   filters: lvfilters,
		   columns:
		   [
			   "internalid",
			   "custrecord_mts_itemno_customitem",
			   "custrecord_mts_customerno_customitem",
			   "custrecord_mts_customeritemno_customitem"
		   ]
		});
	
		var resultCount = custItemSearch.runPaged().count;
		if (resultCount) {
			custItemSearch.run().each(function(result){
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.itemNo = result.getValue({name: 'custrecord_mts_itemno_customitem'});
				objAux.customerNo = result.getValue({name: 'custrecord_mts_customerno_customitem'});
				objAux.customerItemNo = result.getValue({name: 'custrecord_mts_customeritemno_customitem'});
				
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}
	
	function getProcessingMessages(lvfilters) {
		
		var objList = [];
		var objAux = {};
		var mySearch = search.create({
			type: "customrecord_mts_procmess",
			filters: lvfilters,
			columns:
				[
				 "internalid", 
				 "custrecord_mts_eletrproc_procmess",
				 "custrecord_mts_code_procmess",
				 "custrecord_mts_desc_procmess"
				 ]
		});
		
		var resultCount = mySearch.runPaged().count;
		if (resultCount) {
			mySearch.run().each(function(result){
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.eletrProc = result.getValue({name: 'custrecord_mts_eletrproc_procmess'});
				objAux.eletrProc = result.getValue({name: 'custrecord_mts_code_procmess'});
				objAux.eletrProc = result.getValue({name: 'custrecord_mts_desc_procmess'});
				objList.push(objAux);
				return true;
			});			
		}
		return objList;
	}
	
	function getGenJournalLine(lvfilters) {
		var objList = [];
		var objAux = {};
		var mySearch = search.create({
			type: "customrecord_mts_genjrnline",
			filters: lvfilters,
			columns:
				[
				 "internalid", 
				 "custrecord_mts_recordtype_genjrnline",
				 "custrecord_mts_jrntempname_genjrnline",
				 "custrecord_mts_jrnbatchname_genjrnline",
				 "custrecord_mts_lineno_genjrnline",
				 "custrecord_mts_postingdate_genjrnline",
				 "custrecord_mts_documenttype_genjrnline",
				 "custrecord_mts_documentno_genjrnline",
				 "custrecord_mts_externaldocno_genjrnline",
				 "custrecord_mts_accounttype_genjrnline",
				 "custrecord_mts_accountno_genjrnline",
				 "custrecord_mts_recipientbank_genjrnline",
				 "custrecord_mts_messagetorecip_genjrnline",
				 "custrecord_mts_description_genjrnline",
				 "custrecord_mts_subsidiary_genjrnline",
				 "custrecord_mts_branch_genjrnline",
				 "custrecord_mts_currencycode_genjrnline",
				 "custrecord_mts_postinggrooup_genjrnline",
				 "custrecord_mts_genpostintype_genjrnline",
				 "custrecord_mts_paymentmethod_genjrnline",
				 "custrecord_mts_paymentreferen_genjrnline",
				 "custrecord_mts_creditorno_genjrnline",
				 "custrecord_mts_duedate_genjrnline",
				 "custrecord_mts_amount_genjrnline",
				 "custrecord_mts_debitamount_genjrnline",
				 "custrecord_mts_creditamount_genjrnline",
				 "custrecord_mts_balacctype_genjrnline",
				 "custrecord_mts_ballaccno_genjrnline",
				 "custrecord_mts_isapplied_genjrnline",
				 "custrecord_mts_appliestodocty_genjrnline",
				 "custrecord_mts_appliestodocno_genjrnline",
				 "custrecord_mts_appdocduedate_genjrnline",
				 "custrecord_mts_bankpaytype_genjrnline",
				 "custrecord_mts_exportedtopay_genjrnline",
				 "custrecord_mts_totalexportamt_genjrnline",
				 "custrecord_mts_haspayexport_genjrnline",
				 "custrecord_mts_brprepayment_genjrnline",
				 "custrecord_mts_documentdate_genjrnline",
				 "custrecord_mts_genbuspg_genjrnline",
				 "custrecord_mts_genprodpg_genjrnline",
				 "custrecord_mts_vatbus_genjrnline",
				 "custrecord_mts_vatprodpg_genjrnline",
				 "custrecord_mts_incdocentryno_genjrnline",
				 "custrecord_mts_vatamount_genjrnline",
				 "custrecord_mts_vatdifference_genjrnline",
				 "custrecord_mts_balvatamount_genjrnline",
				 "custrecord_mts_balvatdiff_genjrnline",
				 "custrecord_mts_balgenposttype_genjrnline",
				 "custrecord_mts_balgenbuspg_genjrnline",
				 "custrecord_mts_balgenprodpg_genjrnline",
				 "custrecord_mts_balvatprodpg_genjrnline",
				 "custrecord_mts_appliestoexdoc_genjrnline",
				 "custrecord_mts_checkprinted_genjrnline",
				 "custrecord_mts_reasoncode_genjrnline",
				 "custrecord_mts_comment_genjrnline",
				 "custrecord_mts_calcwithheldta_genjrnline",
				 "custrecord_mts_salespurch_genjrnline",
				 "custrecord_mts_campaing_genjrnline",
				 "custrecord_mts_transactionid_genjrnline",
				 "custrecord_mts_summarizedbyv_genjrnline",
				 "custrecord_mts_recipientbank_genjrnline",
				 "custrecord_mts_summarypay_genjrnline",
				 "custrecord_mts_retgroupcode_genjrnline",
				 "custrecord_mts_entity_genjrnline"
				 ]
		});
		
		var resultCount = mySearch.runPaged().count;
		if (resultCount) {
			mySearch.run().each(function(result){
				objAux = {};
				objAux.id = result.id;
				objAux.recordType = result.getValue({name: 'custrecord_mts_recordtype_genjrnline'});
				objAux.journalTemplateName = result.getValue({name: "custrecord_mts_jrntempname_genjrnline"});
				objAux.journalBatchName = result.getValue({name: "custrecord_mts_jrnbatchname_genjrnline"});
				objAux.lineNo = result.getValue({name: "custrecord_mts_lineno_genjrnline"});
				objAux.documentDate = result.getValue({name: "custrecord_mts_documentdate_genjrnline"});
				objAux.postingDate = result.getValue({name: "custrecord_mts_postingdate_genjrnline"});
				objAux.transaction = result.getValue({name: "custrecord_mts_transactionid_genjrnline"});
				objAux.transactionText = result.getText({name: "custrecord_mts_transactionid_genjrnline"});
				objAux.documentType = result.getValue({name: "custrecord_mts_documenttype_genjrnline"});
				objAux.documentTypeText = result.getText({name: "custrecord_mts_documenttype_genjrnline"});
				objAux.documentNo = result.getValue({name: "custrecord_mts_documentno_genjrnline"});
				objAux.externalDocumentNo = result.getValue({name: "custrecord_mts_externaldocno_genjrnline"});
				objAux.accountType = result.getValue({name: "custrecord_mts_accounttype_genjrnline"});
				objAux.accountTypeText = result.getText({name: "custrecord_mts_accounttype_genjrnline"});
				objAux.accountNo = result.getValue({name: "custrecord_mts_accountno_genjrnline"});
				objAux.recipientBank = result.getValue({name: "custrecord_mts_recipientbank_genjrnline"});
				objAux.messageToRecipient = result.getValue({name: "custrecord_mts_messagetorecip_genjrnline"});
				objAux.description = result.getValue({name: "custrecord_mts_description_genjrnline"});
				objAux.subsidiary = result.getValue({name: "custrecord_mts_subsidiary_genjrnline"});
				objAux.branchCode = result.getValue({name: "custrecord_mts_branch_genjrnline"});
				objAux.currencyCode = result.getValue({name: "custrecord_mts_currencycode_genjrnline"});
				objAux.postingGroup = result.getValue({name: "custrecord_mts_postinggrooup_genjrnline"});
				objAux.genPostingType = result.getValue({name: "custrecord_mts_genpostintype_genjrnline"});
				objAux.genPostingTypeText = result.getText({name: "custrecord_mts_genpostintype_genjrnline"});
				objAux.genBusPostingGroup = result.getValue({name: "custrecord_mts_genbuspg_genjrnline"});
				objAux.genProdPostingGroup = result.getValue({name: "custrecord_mts_genprodpg_genjrnline"});
				objAux.vatBusPostingGroup = result.getValue({name: "custrecord_mts_vatbus_genjrnline"});
				objAux.vatProdPostingGroup = result.getValue({name: "custrecord_mts_vatprodpg_genjrnline"});
				objAux.paymentMethodCode = result.getValue({name: "custrecord_mts_paymentmethod_genjrnline"});
				objAux.paymentMethodCodeText = result.getText({name: "custrecord_mts_paymentmethod_genjrnline"});
				objAux.paymentReference = result.getValue({name: "custrecord_mts_paymentreferen_genjrnline"});
				objAux.creditorNo = result.getValue({name: "custrecord_mts_creditorno_genjrnline"});
				objAux.incomingDocumentEntryNo = result.getValue({name: "custrecord_mts_incdocentryno_genjrnline"});
				objAux.duedate = result.getValue({name: "custrecord_mts_duedate_genjrnline"});
				objAux.amount = result.getValue({name: "custrecord_mts_amount_genjrnline"});
				objAux.amount= objAux.amount?parseFloat(objAux.amount):0;
				objAux.debitAmount = result.getValue({name: "custrecord_mts_debitamount_genjrnline"});
				objAux.debitAmount= objAux.debitAmount?parseFloat(objAux.debitAmount):0;
				objAux.creditAmount = result.getValue({name: "custrecord_mts_creditamount_genjrnline"});
				objAux.creditAmount= objAux.creditAmount?parseFloat(objAux.creditAmount):0;
				objAux.vatAmount = result.getValue({name: "custrecord_mts_vatamount_genjrnline"});
				objAux.vatAmount= objAux.vatAmount?parseFloat(objAux.vatAmount):0;
				objAux.vatDifference = result.getValue({name: "custrecord_mts_vatdifference_genjrnline"});
				objAux.vatDifference= objAux.vatDifference?parseFloat(objAux.vatDifference):0;
				objAux.balVatAmount = result.getValue({name: "custrecord_mts_balvatamount_genjrnline"});
				objAux.balVatAmount= objAux.balVatAmount?parseFloat(objAux.balVatAmount):0;
				objAux.balVatDifference = result.getValue({name: "custrecord_mts_balvatdiff_genjrnline"});
				objAux.balVatDifference= objAux.balVatDifference?parseFloat(objAux.balVatDifference):0;
				objAux.balGenPostingType = result.getValue({name: "custrecord_mts_balgenposttype_genjrnline"});
				objAux.balGenPostingTypeText = result.getText({name: "custrecord_mts_balgenposttype_genjrnline"});
				objAux.balGenBusPostingGroup = result.getValue({name: "custrecord_mts_balgenbuspg_genjrnline"});
				objAux.balGenProdPostingGroup = result.getValue({name: "custrecord_mts_balgenprodpg_genjrnline"});
				objAux.balVatBusPostingGroup = result.getValue({name: "custrecord_mts_balvatbuspg_genjrnline"});
				objAux.balVatProdPostingGroup = result.getValue({name: "custrecord_mts_balvatprodpg_genjrnline"});
				objAux.appliesToExtDocNo = result.getValue({name: "custrecord_mts_appliestoexdoc_genjrnline"});
				objAux.checkPrinted = result.getValue({name: "custrecord_mts_checkprinted_genjrnline"});
				objAux.reasonCode = result.getValue({name: "custrecord_mts_reasoncode_genjrnline"});
				objAux.Comment = result.getValue({name: "custrecord_mts_comment_genjrnline"});
				objAux.calcWithheldTaxedId = result.getValue({name: "custrecord_mts_calcwithheldta_genjrnline"});
				objAux.summaryPaymentFactor = result.getValue({name: "custrecord_mts_summarypay_genjrnline"});
				objAux.summaryPaymentFactor = objAux.summaryPaymentFactor?objAux.summaryPaymentFactor:0;
				objAux.salesPurchCode = result.getValue({name: "custrecord_mts_salespurch_genjrnline"});
				objAux.campaing = result.getValue({name: "custrecord_mts_campaing_genjrnline"});
				objAux.balAccountType = result.getValue({name: "custrecord_mts_balacctype_genjrnline"});
				objAux.balAccountTypeText = result.getText({name: "custrecord_mts_balacctype_genjrnline"});
				objAux.balAccountNo = result.getValue({name: "custrecord_mts_ballaccno_genjrnline"});
				objAux.isApplied = result.getValue({name: "custrecord_mts_isapplied_genjrnline"});
				objAux.appliesToDocType = result.getValue({name: "custrecord_mts_appliestodocty_genjrnline"});
				objAux.appliesToDocTypeText = result.getText({name: "custrecord_mts_appliestodocty_genjrnline"});
				objAux.appliesToDocNo = result.getValue({name: "custrecord_mts_appliestodocno_genjrnline"});
				objAux.AppliesToDocDueDate = result.getValue({name: "custrecord_mts_appdocduedate_genjrnline"});
				objAux.bankPaymentType = result.getValue({name: "custrecord_mts_bankpaytype_genjrnline"});
				objAux.bankPaymentTypeText = result.getText({name: "custrecord_mts_bankpaytype_genjrnline"});
				objAux.exportedToPaymentFile = result.getValue({name: "custrecord_mts_exportedtopay_genjrnline"});
				objAux.totalExportedAmount = result.getValue({name: "custrecord_mts_totalexportamt_genjrnline"});
				objAux.totalExportedAmount = objAux.totalExportedAmount?parseFloat(objAux.totalExportedAmount):0;
				objAux.hasPaymentExportError = result.getValue({name: "custrecord_mts_haspayexport_genjrnline"});
				objAux.brPrepayment = result.getValue({name: "custrecord_mts_brprepayment_genjrnline"});
				objAux.summarizedByVendor = result.getValue({name: 'custrecord_mts_summarizedbyv_genjrnline'});
				objAux.retentionGroupCode = result.getValue({name: 'custrecord_mts_retgroupcode_genjrnline'});
				objAux.retentionGroupCodeText = result.getText({name: 'custrecord_mts_retgroupcode_genjrnline'});
				objAux.entity = result.getValue({name: 'custrecord_mts_entity_genjrnline'});
				objAux.entityText = result.getText({name: 'custrecord_mts_entity_genjrnline'});
				objList.push(objAux);
				return true;
			});			
		}
		return objList;
	}
	function getGenJournalBatch(lvfilters) {
		var objList = [];
		var objAux = {};
		var mySearch = search.create({
			type: "customrecord_mts_genjournalbatch",//Gen. Journal Batch
			filters: lvfilters,
			columns:
				[
					search.createColumn({
						name: "name",
						sort: search.Sort.ASC
					 }),
					 "custrecord_mts_journaltemplate_genjrnbat",
					 "custrecord_mts_description_genjrnbat",
					 "custrecord_mts_balacctype_genjrnbat",
					 "custrecord_mts_balaccno_genjrnbat",
					 "custrecord_mts_noseries_genjrnbat",
					 "custrecord_mts_postingnoseries_genjrnbat",
					 "custrecord_mts_copyvat_genjrnbat",
					 "custrecord_mts_allowvat_genjrnbat",
					 "custrecord_mts_allowpaymentexp_genjrnbat",
					 "custrecord_mts_suggestbalancin_genjrnbat"
				 ]
		});
		
		var resultCount = mySearch.runPaged().count;
		if (resultCount) {
			mySearch.run().each(function(result){
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.name = result.getValue({name: "name"});
				objAux.journalTemplate = result.getValue({name: "custrecord_mts_journaltemplate_genjrnbat"});
				objAux.description = result.getValue({name: "custrecord_mts_description_genjrnbat"});
				objAux.balAccountType = result.getValue({name: "custrecord_mts_balacctype_genjrnbat"});
				objAux.balAccountTypeText = result.getText({name: "custrecord_mts_balacctype_genjrnbat"});
				objAux.balAccountNo = result.getValue({name: "custrecord_mts_balaccno_genjrnbat"});
				objAux.noSeries = result.getValue({name: "custrecord_mts_noseries_genjrnbat"});
				objAux.postingNoSeries = result.getValue({name: "custrecord_mts_postingnoseries_genjrnbat"});
				objAux.copyVatSetupToJnlLines = result.getValue({name: "custrecord_mts_copyvat_genjrnbat"});
				objAux.allowVatDifference = result.getValue({name: "custrecord_mts_allowvat_genjrnbat"});
				objAux.allowPaymentExport = result.getValue({name: "custrecord_mts_allowpaymentexp_genjrnbat"});
				objAux.suggestBalancingAmount = result.getValue({name: "custrecord_mts_suggestbalancin_genjrnbat"});
				objList.push(objAux);
				return true;
			});			
		}
		return objList;
	}

	function getGenJournalTemplate(lvfilters) {
		var objList = [];
		var objAux = {};
		var mySearch = search.create({
			type: "customrecord_mts_generaljournaltemplate",//Gen. Journal Template
			filters: lvfilters,
			columns:
				[
					"internalid",
					search.createColumn({
					   name: "name",
					   sort: search.Sort.ASC
					}),
					"custrecord_mts_description_genjrntemp",
					"custrecord_mts_type_genjrntemp",
					"custrecord_mts_noseries_genjrntemp"
				 ]
		});
		
		var resultCount = mySearch.runPaged().count;
		if (resultCount) {
			mySearch.run().each(function(result){
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.name = result.getValue({name: 'name'});
				objAux.description = result.getValue({name: 'custrecord_mts_description_genjrntemp'});
				objAux.type = result.getValue({name: 'custrecord_mts_type_genjrntemp'});
				objAux.noSeries = result.getValue({name: 'custrecord_mts_noseries_genjrntemp'});
				objList.push(objAux);
				return true;
			});			
		}
		return objList;
	}

	function getElecPaySetup() {//Elec. Pay. Setup
		var elecPaySetupObj = {};
		var searchElecPaySetup = search.create({
			   type: "customrecord_mts_elecpaysetup",
			   filters: [],
			   columns:
			   [
			      search.createColumn({
					 name: "internalid",
			         sort: search.Sort.ASC
			      }),
			   ]
			});
		
			searchElecPaySetup.run().each(function(result){
				elecPaySetupObj.id = result.getValue({ name: 'internalid' });
			
			var elecPaySetupRecLoad = getRecordLoad('customrecord_mts_elecpaysetup', elecPaySetupObj.id);
			elecPaySetupObj.recordObj=elecPaySetupRecLoad;
			elecPaySetupObj.serialNoTributeSend = elecPaySetupRecLoad.getValue({fieldId: 'custrecord_mts_serialtrsend_elecpaysetup'});
			elecPaySetupObj.serialNoTributeReturn = elecPaySetupRecLoad.getValue({fieldId: 'custrecord_mts_serialtrret_elecpaysetup'});
			elecPaySetupObj.serialNoSend = elecPaySetupRecLoad.getValue({fieldId: 'custrecord_mts_serialsend_elecpaysetup'});
			elecPaySetupObj.serialNoRet = elecPaySetupRecLoad.getValue({fieldId: 'custrecord_mts_serialret_elecpaysetup'});
			elecPaySetupObj.journalTemplateName = elecPaySetupRecLoad.getValue({fieldId: 'custrecord_mts_jrntemplname_elecpaysetup'});
			elecPaySetupObj.journalBatchName = elecPaySetupRecLoad.getValue({fieldId: 'custrecord_mts_jrnbchname_elecpaysetup'});
			elecPaySetupObj.tributeJournalTemplateName = elecPaySetupRecLoad.getValue({fieldId: 'custrecord_mts_tribjrntempl_elecpaysetup'});
			elecPaySetupObj.tributeJournalBatchName = elecPaySetupRecLoad.getValue({fieldId: 'custrecord_mts_tribjrnbatna_elecpaysetup'});
			elecPaySetupObj.activeYourNoPayment = elecPaySetupRecLoad.getValue({fieldId: 'custrecord_mts_actyournopay_elecpaysetup'});
			//Labels
			elecPaySetupObj.serialNoTributeSendLabel = elecPaySetupRecLoad.getField({fieldId: 'custrecord_mts_serialtrsend_elecpaysetup'}).label;
			elecPaySetupObj.serialNoTributeReturnLabel = elecPaySetupRecLoad.getField({fieldId: 'custrecord_mts_serialtrret_elecpaysetup'}).label;
			elecPaySetupObj.serialNoSendLabel = elecPaySetupRecLoad.getField({fieldId: 'custrecord_mts_serialsend_elecpaysetup'}).label;
			elecPaySetupObj.serialNoRetLabel = elecPaySetupRecLoad.getField({fieldId: 'custrecord_mts_serialret_elecpaysetup'}).label;
			elecPaySetupObj.journalTemplateNameLabel = elecPaySetupRecLoad.getField({fieldId: 'custrecord_mts_jrntemplname_elecpaysetup'}).label;
			elecPaySetupObj.journalBatchNameLabel = elecPaySetupRecLoad.getField({fieldId: 'custrecord_mts_jrnbchname_elecpaysetup'}).label;
			elecPaySetupObj.tributeJournalTemplateNameLabel = elecPaySetupRecLoad.getField({fieldId: 'custrecord_mts_tribjrntempl_elecpaysetup'}).label;
			elecPaySetupObj.tributeJournalBatchNameLabel = elecPaySetupRecLoad.getField({fieldId: 'custrecord_mts_tribjrnbatna_elecpaysetup'}).label;
			elecPaySetupObj.activeYourNoPaymentLabel = elecPaySetupRecLoad.getField({fieldId: 'custrecord_mts_actyournopay_elecpaysetup'}).label;
		
		});
		return elecPaySetupObj;
	}

	function getVendorBill(lvfilters) {//Bill(vendorbill) - Fatura de Compra
		var objList = [];
		var objAux = {};
		var mySearch = search.create({
			type: "vendorbill",//Vendor Bill
			filters: lvfilters,
			columns:
				[
					"internalid",
					"account",
					"approvalstatus",
					"class",
					"currency",
					"department",
					"discountamount",
					"duedate",
					"entity",
					"status",
					"terms",
					"total",
					"trandate",
					"tranid",
					"transactionnumber",
					"custbody_mts_paymentmethodcode",
					"subsidiary",
					"taxtotal",
					"taxperiod",
					"amount",
					"creditamount",
					"debitamount",
					"deferredrevenue",
					"fxamount",
					"grossamount",
					"netamountnotax",
					"netamount",
					"recognizedrevenue",
					"shippingamount",
					"amountpaid",
					"fxamountpaid",
					"amountremaining",
					"fxamountremaining",
					"posting",
					"custbody_mts_retentiongroupcode"
				 ]
		});
		
		var resultCount = mySearch.runPaged().count;
		if (resultCount) {
			mySearch.run().each(function(result){
				objAux = {};
				objAux.id = result.id;
				objAux.type = "vendorbill";
				objAux.account = result.getValue({name:"account"});
				objAux.approvalStatus = result.getValue({name:"approvalstatus"});
				objAux.class = result.getValue({name:"class"});
				objAux.currency = result.getValue({name:"currency"});
				objAux.departament = result.getValue({name:"department"});
				objAux.discountAmount = result.getValue({name:"discountamount"});
				objAux.dueDate = result.getValue({name:"duedate"});
				objAux.entity = result.getValue({name:"entity"});
				objAux.entityText = result.getText({name:"entity"});
				objAux.posting = result.getValue({name:"posting"});
				objAux.status = result.getValue({name:"status"});
				objAux.terms = result.getValue({name:"terms"});
				objAux.total = result.getValue({name:"total"});
				objAux.tranDate = result.getValue({name:"trandate"});
				objAux.tranId = result.getValue({name:"tranid"});
				objAux.transactionNumber = result.getValue({name:"transactionnumber"});
				objAux.paymentMethodCode = result.getValue({name:"custbody_mts_paymentmethodcode"});
				objAux.paymentMethodCodeText = result.getText({name:"custbody_mts_paymentmethodcode"});
				objAux.subsidiary = result.getValue({name:"subsidiary"});
				objAux.taxTotal = result.getValue({name:"taxtotal"});
				objAux.taxPeriod = result.getValue({name:"taxperiod"});
				objAux.barCode = result.getValue({name:'custbody_mts_barcode'});
				objAux.barCodeLineEditable = result.getValue({name:"custbody_mts_barcodelineeditable"});
				objAux.amount = result.getValue({name:"amount"});
				objAux.creditAmount = result.getValue({name:"creditamount"});
				objAux.debitAmount = result.getValue({name:"debitamount"});
				objAux.deferredRevenue = result.getValue({name:"deferredrevenue"});
				objAux.fxAmount = result.getValue({name:"fxamount"});
				objAux.grossAmount = result.getValue({name:"grossamount"});
				objAux.netAmountNoTax = result.getValue({name:"netamountnotax"});
				objAux.netAmount = result.getValue({name:"netamount"});
				objAux.recognizedRevenue = result.getValue({name:"recognizedrevenue"});
				objAux.shippingAmount = result.getValue({name:"shippingamount"});
				objAux.amountPaid = result.getValue({name:"amountpaid"});
				objAux.fxAmountPaid = result.getValue({name:"fxamountpaid"});
				objAux.amountRemaining = result.getValue({name:"amountremaining"});
				objAux.fxAmountRemaining = result.getValue({name:"fxamountremaining"});
				objAux.posting = result.getValue({name:"posting"});
				objAux.retentionGroupCode = result.getValue({name:"custbody_mts_retentiongroupcode"});
				objAux.retentionGroupCodeText = result.getValue({name:"custbody_mts_retentiongroupcode"});
				objList.push(objAux);
				return true;
			});			
		}
		return objList;
	}

	function getCompanyInformation() {//Company Information = Main Subsidiary
		var objAux = {};
		var objList = [];
		
		var _companyInformationSearchObj = search.create({
		   type: "subsidiary",
		   filters: [
				["parent","isempty",null]
		   ],
		   columns:
		   [
			   "internalid"
		   ]
		});
	
		var resultCount = _companyInformationSearchObj.runPaged().count;
		if (resultCount) {
			_companyInformationSearchObj.run().each(function(result){
				objAux = {};
				objAux.id = result.id;
				var companyInformationRecLoad = getRecordLoad('subsidiary', objAux.id);
				objAux.recordObj = companyInformationRecLoad;
				objAux.name = companyInformationRecLoad.getValue({fieldId: 'name'});				
				objAux.parent = companyInformationRecLoad.getValue({fieldId: 'parent'});				
				objAux.currency = companyInformationRecLoad.getValue({fieldId: 'currency'});				
				objAux.companyUen = companyInformationRecLoad.getValue({fieldId: 'custrecord_company_uen'});				
				objAux.companyBrn = companyInformationRecLoad.getValue({fieldId: 'custrecord_company_brn'});				
				objAux.zip = companyInformationRecLoad.getValue({fieldId: 'zip'});				
				objAux.address1 = companyInformationRecLoad.getValue({fieldId: 'address1'});				
				objAux.address2 = companyInformationRecLoad.getValue({fieldId: 'address2'});				
				objAux.address3 = companyInformationRecLoad.getValue({fieldId: 'address3'});				
				objAux.city = companyInformationRecLoad.getValue({fieldId: 'city'});				
				objAux.state = companyInformationRecLoad.getValue({fieldId: 'state'});				
				objAux.country = companyInformationRecLoad.getValue({fieldId: 'country'});				
				objAux.branchID = companyInformationRecLoad.getValue({fieldId: 'custrecord_subsidiary_branch_id'});				
				objAux.branchInformation = companyInformationRecLoad.getValue({fieldId: 'custrecord_mts_branch_information'});				
				objAux.caseAutomaticClosu = companyInformationRecLoad.getValue({fieldId: 'caseautomaticclosuretemplate'});				
				objAux.caseCreationTemplate = companyInformationRecLoad.getValue({fieldId: 'casecreationtemplate'});				
				objAux.caseUpdateTemplate = companyInformationRecLoad.getValue({fieldId: 'caseupdatetemplate'});				
				objAux.companyNameForSupportMessages = companyInformationRecLoad.getValue({fieldId: 'companynameforsupportmessages'});				
				objAux.defaultAcctCorpCardexp = companyInformationRecLoad.getValue({fieldId: 'defaultacctcorpcardexp'});				
				objAux.defaultAdvanceAcctForExprept = companyInformationRecLoad.getValue({fieldId: 'defaultadvanceacctforexprept'});				
				objAux.defaultCaseProfile = companyInformationRecLoad.getValue({fieldId: 'defaultcaseprofile'});				
				objAux.defaultApAccountForExprept = companyInformationRecLoad.getValue({fieldId: 'defaultapaccountforexprept'});				
				objAux.isElimination = companyInformationRecLoad.getValue({fieldId: 'iselimination'});				
				objAux.email = companyInformationRecLoad.getValue({fieldId: 'email'});				
				objAux.caseAssignmentTemplate = companyInformationRecLoad.getValue({fieldId: 'caseassignmenttemplate'});				
				objAux.employeeCaseUpdateTemplate = companyInformationRecLoad.getValue({fieldId: 'employeecaseupdatetemplate'});				
				objAux.caseCopyEmployeeTemplate = companyInformationRecLoad.getValue({fieldId: 'casecopyemployeetemplate'});				
				objAux.caseEscalationTemplate = companyInformationRecLoad.getValue({fieldId: 'caseescalationtemplate'});				
				objAux.fax = companyInformationRecLoad.getValue({fieldId: 'fax'});				
				objAux.language = companyInformationRecLoad.getValue({fieldId: 'language'});				
				objAux.legalName = companyInformationRecLoad.getValue({fieldId: 'legalname'});				
				objAux.mossApplies = companyInformationRecLoad.getValue({fieldId: 'mossapplies'});				
				objAux.mossNexus = companyInformationRecLoad.getValue({fieldId: 'mossnexus'});				
				objAux.mainSupportEmailAddress = companyInformationRecLoad.getValue({fieldId: 'mainsupportemailaddress'});				
				objAux.nameNoHierarchy = companyInformationRecLoad.getValue({fieldId: 'namenohierarchy'});				
				objAux.phone = companyInformationRecLoad.getValue({fieldId: 'phone'});				
				objAux.serviceItemForForecastReports = companyInformationRecLoad.getValue({fieldId: 'serviceitemforforecastreports'});				
				objAux.taxFiscalCalendar = companyInformationRecLoad.getValue({fieldId: 'taxfiscalcalendar'});				
				objAux.taxIdNum = companyInformationRecLoad.getValue({fieldId: 'taxidnum'});				
				objAux.taxOnoMyReference = companyInformationRecLoad.getValue({fieldId: 'custrecord_pt_sub_taxonomy_reference'});				
				objAux.tranPrefix = companyInformationRecLoad.getValue({fieldId: 'tranprefix'});				
				objAux.receiptAmount = companyInformationRecLoad.getValue({fieldId: 'receiptamount'});				
				objAux.receiptQuantityDiff = companyInformationRecLoad.getValue({fieldId: 'receiptquantitydiff'});				
				objAux.receiptQuantity = companyInformationRecLoad.getValue({fieldId: 'receiptquantity'});				
				objAux.purchaseOrderAmount = companyInformationRecLoad.getValue({fieldId: 'purchaseorderamount'});				
				objAux.url = companyInformationRecLoad.getValue({fieldId: 'url'});				
				objAux.purchaseOrderQuantity = companyInformationRecLoad.getValue({fieldId: 'purchaseorderquantity'});				
				objAux.purchaseOrderQuantityDiff = companyInformationRecLoad.getValue({fieldId: 'purchaseorderquantitydiff'});				
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}

	function getElecPayLine(lvFilters) {//Elec. Pay. Line
		var objList = [];
		var objAux = {};
		var searchElecPayLine = search.create({
			type: "customrecord_mts_elecpayline",
			filters: lvFilters,
			columns:
			[
				search.createColumn({
					name: "internalid",
					sort: search.Sort.ASC
				}),
				'custrecord_mts_paymetcode_elecpayline',
				"custrecord_mts_internalno_elecpayline",
				"custrecord_mts_statuspay_elecpayline",
				"custrecord_mts_barcode_elecpayline",
				"custrecord_mts_no_elecpayline",
				"custrecord_mts_transaction_elecpayline"
			]
		});
		var resultCount = searchElecPayLine.runPaged().count;
		if (resultCount) {
			searchElecPayLine.run().each(function(result){
				objAux = {};
				objAux.id = result.id;
				var elecPayLineRecLoad = getRecordLoad('customrecord_mts_elecpayline', objAux.id);
				objAux.recordObj = elecPayLineRecLoad;
				objAux.elecPayHeader = elecPayLineRecLoad.getValue({fieldId:"custrecord_mts_no_elecpayline"});
				objAux.paymentMethodCode = elecPayLineRecLoad.getValue({fieldId:"custrecord_mts_paymetcode_elecpayline"});
				objAux.paymentMethodCodeText = elecPayLineRecLoad.getText({fieldId:"custrecord_mts_paymetcode_elecpayline"});
				objAux.internalNo = elecPayLineRecLoad.getValue({fieldId:"custrecord_mts_internalno_elecpayline"});
				objAux.statusPayment = elecPayLineRecLoad.getValue({fieldId:"custrecord_mts_statuspay_elecpayline"});
				objAux.statusPaymentText = elecPayLineRecLoad.getText({fieldId:"custrecord_mts_statuspay_elecpayline"});
				objAux.barCode = elecPayLineRecLoad.getValue({fieldId:"custrecord_mts_barcode_elecpayline"});
				objAux.transaction = elecPayLineRecLoad.getValue({fieldId:"custrecord_mts_transaction_elecpayline"});
				//Label
				objAux.elecPayHeaderLabel = elecPayLineRecLoad.getField({fieldId:"custrecord_mts_no_elecpayline"}).label;
				objAux.paymentMethodCodeLabel = elecPayLineRecLoad.getField({fieldId:"custrecord_mts_paymetcode_elecpayline"}).label;
				objAux.internalNoLabel = elecPayLineRecLoad.getField({fieldId:"custrecord_mts_internalno_elecpayline"}).label;
				objAux.statusPaymentLabel = elecPayLineRecLoad.getField({fieldId:"custrecord_mts_statuspay_elecpayline"}).label;
				objAux.barCodeLabel = elecPayLineRecLoad.getField({fieldId:"custrecord_mts_barcode_elecpayline"}).label;
				objAux.transactionLabel = elecPayLineRecLoad.getField({fieldId:"custrecord_mts_transaction_elecpayline"}).label;
				
				objList.push(objAux);
				return true;
			});
		}
		return objList;
	}

	function getElecPayMethod(lvFilters) {//Elec. Pay. Method
		var objList = [];
		var objAux = {};
		var searchElecPayMethod = search.create({
			type: "customrecord_mts_elecpaymethod",
			filters: lvFilters,
			columns:
			[
				search.createColumn({
					name: "internalid",
					sort: search.Sort.ASC
				}),
				"name",
				"custrecord_mts_description_elecpaymethod",
				"custrecord_mts_selbank_elecpaymethod",
				"custrecord_mts_layoutfile_elecpaymethod",
				"custrecord_mts_paymethod_elecpaymethod",
				"custrecord_mts_eletpaytype_elecpaymethod"
			]
		});
		var resultCount = searchElecPayMethod.runPaged().count;
		if (resultCount) {
			searchElecPayMethod.run().each(function(result){
				objAux = {};
				objAux.id = result.id;
				objAux.name = result.getValue({name:"name"});
				objAux.description = result.getValue({name:"custrecord_mts_description_elecpaymethod"});
				objAux.selectedBank = result.getValue({name:"custrecord_mts_selbank_elecpaymethod"});
				objAux.selectedBankText = result.getText({name:"custrecord_mts_selbank_elecpaymethod"});
				objAux.layoutFile = result.getValue({name:"custrecord_mts_layoutfile_elecpaymethod"});
				objAux.layoutFileText = result.getText({name:"custrecord_mts_layoutfile_elecpaymethod"});
				objAux.paymentMethod = result.getValue({name:"custrecord_mts_paymethod_elecpaymethod"});
				objAux.paymentMethodText = result.getText({name:"custrecord_mts_paymethod_elecpaymethod"});
				objAux.eletronicPayment = result.getValue({name:"custrecord_mts_eletpaytype_elecpaymethod"});
				objAux.eletronicPaymentText = result.getText({name:"custrecord_mts_eletpaytype_elecpaymethod"});
				objList.push(objAux);
				return true;
			});
		}
		return objList;
	}

	function getRetentionGroups(lvfilters) {
		var _RetentionGroupsSearchObj = search.create({
			   type: "customrecord_mts_retentiongroups",
			   filters:lvfilters,
			   columns:
			   [
			      search.createColumn({
					 name: "internalid",
			         sort: search.Sort.ASC
				  }),
				  'name',
				  'custrecord_mts_descripti_retentiongroups',
				  'custrecord_mts_darfcode_retentiongroups',
				  'custrecord_mts_tributegr_retentiongroups',
				  'custrecord_mts_periodici_retentiongroups',
				  'custrecord_mts_fieldrein_retentiongroups'
			   ]
			});
		var objList = [];
		var objAux = {};
		var resultCount = _RetentionGroupsSearchObj.runPaged().count;
		if (resultCount) {
			_RetentionGroupsSearchObj.run().each(function(result){
				objAux = {};
				objAux.id = result.id;
				objAux.name = result.getValue({name:"name"});
				objAux.description = result.getValue({name:"custrecord_mts_descripti_retentiongroups"});
				objAux.darfCpde = result.getValue({name:"custrecord_mts_darfcode_retentiongroups"});
				objAux.tributeGroup = result.getValue({name:"custrecord_mts_tributegr_retentiongroups"});
				objAux.tributeGroupText = result.getText({name:"custrecord_mts_tributegr_retentiongroups"});
				objAux.periodicityDctf = result.getValue({name:"custrecord_mts_periodici_retentiongroups"});
				objAux.periodicityDctfText = result.getText({name:"custrecord_mts_periodici_retentiongroups"});
				objAux.reinf = result.getValue({name:"custrecord_mts_fieldrein_retentiongroups"});
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}

	function getElecPayType(lvfilters) {
		var objAux = {};
		var objList = [];
		
		var _ElecPayType= search.create({
		   type: "customrecord_mts_elecpaytype",
		   filters: lvfilters,
		   columns:
		   [
			   "internalid",
			   "name",
			   'custrecord_mts_description_elecpaytype'
		   ]
		});
	
		var resultCount = _ElecPayType.runPaged().count;
		if (resultCount) {
			_ElecPayType.run().each(function(result){
				objAux = {};
				objAux.id = result.id;
				objAux.name = result.getValue({name: 'name'});				
				objAux.description = result.getValue({name: 'custrecord_mts_description_elecpaytype'});		
				
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}
	function getTransaction (lvfilters){
		var objAux = {};
		var objList = [];
		
		var _Transaction = search.create({
		   type: "transaction",
		   filters: lvfilters,
		   columns:
		   [
			   "internalid",
			   "transactionname",
				"transactionnumber",
				search.createColumn({
					name: "entityid",
					join: "vendor"
				 }),
				 search.createColumn({
					name: "entityid",
					join: "customerMain"
				 }),
				 "recordtype",
				 "subsidiary"
		   ]
		});
	
		var resultCount = _Transaction.runPaged().count;
		if (resultCount) {
			_Transaction.run().each(function(result){
				objAux = {};
				objAux.id = result.id;
				objAux.transactionName = result.getValue({name: 'transactionname'});				
				objAux.transactionNumber = result.getValue({name: 'transactionnumber'});
				objAux.vendor = result.getValue({
					name: "entityid",
					join: "vendor"
				 }),
				 objAux.customerMain = result.getValue({
					name: "entityid",
					join: "customerMain"
				 });
				objAux.recordType = result.getValue({name: 'recordtype'});
				objAux.subsidiary = result.getValue({name: 'subsidiary'});
				objAux.subsidiaryText = result.getText({name: 'subsidiary'});
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}

	function getbankAcocuntCNAB(lvfilters) {
		var objAux = {};
		var objList = [];
		
		var _bankAccountCNAB= search.create({
		   type: "customrecord_mts_bankacccnab",
		   filters: lvfilters,
		   columns:
		   [
			"custrecord_mts_envirid_bankacccnab",
			"custrecord_mts_amountmora_bankacccnab",
			"custrecord_mts_anotherconfig_bankacccnab",
			"custrecord_mts_anotherconf2_bankacccnab",
			"custrecord_mts_archivessent_bankacccnab",
			"custrecord_mts_assignorcode_bankacccnab",
			"custrecord_mts_bankaccdv_bankacccnab",
			"custrecord_mts_bankaccno_bankacccnab",
			"custrecord_mts_bankbranchdv_bankacccnab",
			"custrecord_mts_bankbranchno_bankacccnab",
			"custrecord_mts_bankcode_bankacccnab",
			"custrecord_mts_bankname_bankacccnab",
			"custrecord_mts_bankno_bankacccnab",
			"custrecord_mts_billingdoctyp_bankacccnab",
			"custrecord_mts_cbxlicensefil_bankacccnab",
			"custrecord_mts_fieldcalculateournodv",
			"custrecord_mts_chargeoffcode_bankacccnab",
			"custrecord_mts_chargeoffdays_bankacccnab",
			"custrecord_mts_codewallet_bankacccnab",
			"custrecord_mts_compcode_bankacccnab",
			"custrecord_mts_compcodforrec_bankacccnab",
			"custrecord_mts_dailyamountbo_bankacccnab",
			"custrecord_mts_default_bankacccnab",
			"custrecord_mts_layoutfile_bankacccnab",
			"custrecord_mts_layouttype_bankacccnab",
			"custrecord_mts_selectedbank_bankacccnab",
			"custrecord_mts_sendfilepath_bankacccnab",
			"custrecord_mts_titleaccepted_bankacccnab",
			"custrecord_mts_titlemessage1_bankacccnab",
			"custrecord_mts_titlemessage2_bankacccnab",
			"custrecord_mts_titlemessage3_bankacccnab",
			"custrecord_mts_titlemessage_bankacccnab",
			"custrecord_mts_typewallet_bankacccnab",
			"custrecord_mts_unitdensity_bankacccnab",
			"custrecord_mts_wallet_bankacccnab",
			"custrecord_mts_yournopayment_bankacccnab"
		   ]
		});
	
		var resultCount = _bankAccountCNAB.runPaged().count;
		if (resultCount) {
			_bankAccountCNAB.run().each(function(result){
				objAux = {};
				objAux.id = result.id;		
				objAux.environmentID = result.getValue({name:"custrecord_mts_envirid_bankacccnab"});
				objAux.environmentIDText = result.getText({name:"custrecord_mts_envirid_bankacccnab"});
				objAux.amountMora = result.getValue({name:"custrecord_mts_amountmora_bankacccnab"});
				objAux.anotherConfiguration = result.getValue({name:"custrecord_mts_anotherconfig_bankacccnab"});
				objAux.anotherConfiguration2 = result.getValue({name:"custrecord_mts_anotherconf2_bankacccnab"});
				objAux.archivesSent = result.getValue({name:"custrecord_mts_archivessent_bankacccnab"});
				objAux.AssignorCode = result.getValue({name:"custrecord_mts_assignorcode_bankacccnab"});
				objAux.bankAccountDV = result.getValue({name:"custrecord_mts_bankaccdv_bankacccnab"});
				objAux.bankAccountNo = result.getValue({name:"custrecord_mts_bankaccno_bankacccnab"});
				objAux.bankBranchDV = result.getValue({name:"custrecord_mts_bankbranchdv_bankacccnab"});
				objAux.bankBranchnO = result.getValue({name:"custrecord_mts_bankbranchno_bankacccnab"});
				objAux.bankCode = result.getValue({name:"custrecord_mts_bankcode_bankacccnab"});
				objAux.bankName = result.getValue({name:"custrecord_mts_bankname_bankacccnab"});
				objAux.bankNo = result.getValue({name:"custrecord_mts_bankno_bankacccnab"});
				objAux.billingDocumentType = result.getValue({name:"custrecord_mts_billingdoctyp_bankacccnab"});
				objAux.cbxLicenseFile = result.getValue({name:"custrecord_mts_cbxlicensefil_bankacccnab"});
				objAux.calculateOurNoDV = result.getValue({name:"custrecord_mts_fieldcalculateournodv"});
				objAux.changeOffCode = result.getValue({name:"custrecord_mts_chargeoffcode_bankacccnab"});
				objAux.changeOffDays = result.getValue({name:"custrecord_mts_chargeoffdays_bankacccnab"});
				objAux.codeWallet = result.getValue({name:"custrecord_mts_codewallet_bankacccnab"});
				objAux.companyCode = result.getValue({name:"custrecord_mts_compcode_bankacccnab"});
				objAux.companyCodeForReceivables = result.getValue({name:"custrecord_mts_compcodforrec_bankacccnab"});
				objAux.dailyAmountBonification = result.getValue({name:"custrecord_mts_dailyamountbo_bankacccnab"});
				objAux.defaultField = result.getValue({name:"custrecord_mts_default_bankacccnab"});
				objAux.selectedBank = result.getValue({name:"custrecord_mts_selectedbank_bankacccnab"});
				objAux.selectedBankText = result.getText({name:"custrecord_mts_selectedbank_bankacccnab"});
				objAux.sendFilePath = result.getValue({name:"custrecord_mts_sendfilepath_bankacccnab"});
				objAux.titleAccepted = result.getValue({name:"custrecord_mts_titleaccepted_bankacccnab"});
				objAux.titleAccepted1 = result.getValue({name:"custrecord_mts_titlemessage1_bankacccnab"});
				objAux.titleAccepted2 = result.getValue({name:"custrecord_mts_titlemessage2_bankacccnab"});
				objAux.titleAccepted3 = result.getValue({name:"custrecord_mts_titlemessage3_bankacccnab"});
				objAux.titleAccepted4 = result.getValue({name:"custrecord_mts_titlemessage_bankacccnab"});
				objAux.typeWallet = result.getValue({name:"custrecord_mts_typewallet_bankacccnab"});
				objAux.unitDensity = result.getValue({name:"custrecord_mts_unitdensity_bankacccnab"});
				objAux.wallet = result.getValue({name:"custrecord_mts_wallet_bankacccnab"});
				objAux.yourNoPayment = result.getValue({name:"custrecord_mts_yournopayment_bankacccnab"});
				objAux.layoutFile = result.getValue({name:"custrecord_mts_layoutfile_bankacccnab"});
				objAux.layoutFileText = result.getText({name:"custrecord_mts_layoutfile_bankacccnab"});
				objAux.layoutType = result.getValue({name:"custrecord_mts_layouttype_bankacccnab"});
				objAux.layoutTypeText = result.getText({name:"custrecord_mts_layouttype_bankacccnab"});
				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}
	function getDocumentChargeByRecLoad(lvId) {
		var documentChargeRecLoad = getRecordLoad('customrecord_mts_doccharges', lvId);
		if (documentChargeRecLoad) {
			return {
				recordObj:documentChargeRecLoad,
				id: documentChargeRecLoad.id,
				transaction: documentChargeRecLoad.getValue({fieldId: 'custrecord_mts_transaction_doccharges'}),				
				transactionText: documentChargeRecLoad.getText({fieldId: 'custrecord_mts_transaction_doccharges'}),			
				vendorNo: documentChargeRecLoad.getValue({fieldId: 'custrecord_mts_vendorno_doccharges'}),	
				vendorNoText: documentChargeRecLoad.getText({fieldId: 'custrecord_mts_vendorno_doccharges'}),
				itemChargeCode: documentChargeRecLoad.getValue({fieldId: 'custrecord_mts_itemchargecode_doccharges'}),
				itemChargeCodeText: documentChargeRecLoad.getText({fieldId: 'custrecord_mts_itemchargecode_doccharges'}),
				amount: parseFloat(documentChargeRecLoad.getValue({fieldId: 'custrecord_mts_amount_doccharges'})?documentChargeRecLoad.getValue({fieldId: 'custrecord_mts_amount_doccharges'}):0),		
				optionAssignment : documentChargeRecLoad.getValue({fieldId: 'custrecord_mts_opassignment_doccharges'}),
				optionAssignmentText : documentChargeRecLoad.getText({fieldId: 'custrecord_mts_opassignment_doccharges'}),
				keepCurrencyCode: documentChargeRecLoad.getValue({fieldId: 'custrecord_mts_keepcurrencyco_doccharges'}),
				//Label
				transactionLabel: documentChargeRecLoad.getField({fieldId: 'custrecord_mts_transaction_doccharges'}).label,				
				vendorNoLabel: documentChargeRecLoad.getField({fieldId: 'custrecord_mts_vendorno_doccharges'}).label,	
				itemChargeCodeLabel: documentChargeRecLoad.getField({fieldId: 'custrecord_mts_itemchargecode_doccharges'}).label,
				amountLabel: documentChargeRecLoad.getField({fieldId: 'custrecord_mts_amount_doccharges'}).label,
				optionAssignmentLabel: documentChargeRecLoad.getField({fieldId: 'custrecord_mts_opassignment_doccharges'}).label,
				keepCurrencyCodeLabel: documentChargeRecLoad.getField({fieldId: 'custrecord_mts_keepcurrencyco_doccharges'}).label				
				
			}						
		}else{
			return;
		}	
	}
	function getDocumentCharge(lvfilters) {
		var objAux = {};
		var objList = [];
		
		var _documetCharge = search.create({
		   type: "customrecord_mts_doccharges",
		   filters: lvfilters,
		   columns:
		   [
			   "internalid",
			   "custrecord_mts_transaction_doccharges",
			   "custrecord_mts_vendorno_doccharges",
			   "custrecord_mts_itemchargecode_doccharges",
			   "custrecord_mts_amount_doccharges",
			   "custrecord_mts_opassignment_doccharges",
			   "custrecord_mts_keepcurrencyco_doccharges"

		   ]
		});
	
		var resultCount = _documetCharge.runPaged().count;
		if (resultCount) {
			_documetCharge.run().each(function(result){
				objAux = {};
				objAux.id = result.getValue({name: 'internalid'});
				objAux.transaction = result.getValue({name: 'custrecord_mts_transaction_doccharges'});				
				objAux.transactionText = result.getText({name: 'custrecord_mts_transaction_doccharges'});				
				objAux.vendorNo = result.getValue({name: 'custrecord_mts_vendorno_doccharges'});				
				objAux.vendorNoText = result.getText({name: 'custrecord_mts_vendorno_doccharges'});	
				objAux.itemChargeCode = result.getValue({name: 'custrecord_mts_itemchargecode_doccharges'});				
				objAux.itemChargeCodeText = result.getText({name: 'custrecord_mts_itemchargecode_doccharges'});	
				objAux.amount = parseFloat(result.getValue({name: 'custrecord_mts_amount_doccharges'})?result.getValue({name: 'custrecord_mts_amount_doccharges'}):0);				
				objAux.optionAssignment = result.getValue({name: 'custrecord_mts_opassignment_doccharges'});				
				objAux.optionAssignmentText = result.getText({name: 'custrecord_mts_opassignment_doccharges'});	
				objAux.keepCurrencyCode = result.getValue({name: 'custrecord_mts_keepcurrencyco_doccharges'});				

				objList.push(objAux);
				return true;
			});			
		}
		
		return objList;
	}

	function getIssSettlementFiltered(lvfilters) {//  getBrSetup([["custrecord_mts_isssettid_isssettline","anyof", variavel]])
		var _result = {};
		var arr = [];
		var issSettlementRowGroup = search.create({
			type: "customrecord_mts_isssettline",
			filters: lvfilters,
			columns:
		   	[
			  search.createColumn({
				name: "custrecord_mts_postingdate_isssettline",
				summary: "MAX",
				label: "Posting Date"
			 }),
			 search.createColumn({
				name: "custrecord_mts_paydate_isssettline",
				summary: "GROUP",
				label: "Payment Date"
			 }),
			 search.createColumn({
				name: "custrecord_mts_taxidentifica_isssettline",
				summary: "GROUP",
				label: "Tax Identification"
			 }),
			 search.createColumn({
				name: "custrecord_mts_branchcode_isssettline",
				summary: "MAX",
				label: "Branch Code"
			 }),
			 search.createColumn({
				name: "custrecord_mts_docno_isssettline",
				summary: "GROUP",
				label: "Document No."
			 }),
			 search.createColumn({
				name: "custrecord_mts_externaldocno_isssettline",
				summary: "MAX",
				label: "External Document No."
			 }),
			 search.createColumn({
				name: "custrecord_mts_billtopaytono_isssettline",
				summary: "MAX",
				label: "Bill-to/Pay-to No."
			 }),
			 search.createColumn({
				name: "custrecord_mts_amountline_isssettline",
				summary: "SUM",
				label: "Amount Line"
			 }),
			 search.createColumn({
				name: "custrecord_mts_baseamount_isssettline",
				summary: "SUM",
				label: "Base Amount"
			 }),
			 search.createColumn({
				name: "custrecord_mts_tax_isssettline",
				summary: "GROUP",
				label: "Tax %"
			 }),
			 search.createColumn({
				name: "custrecord_mts_amount_isssettline",
				summary: "SUM",
				label: "Amount"
			 })
		   ]
		});
		issSettlementRowGroup.run().each(function(result){
			_result = {};
			_result.postingDate = result.getValue({name: 'custrecord_mts_postingdate_isssettline', summary: 'MAX'});
			_result.paymentDate = result.getValue({name: 'custrecord_mts_paydate_isssettline', summary: 'GROUP'});
			_result.taxidentification = result.getValue({name: 'custrecord_mts_taxidentifica_isssettlinee', summary: 'GROUP'});
			_result.branchCode = result.getValue({name: 'custrecord_mts_branchcode_isssettline', summary: 'MAX'});
			_result.documentNo = result.getValue({name: 'custrecord_mts_docno_isssettline', summary: 'GROUP'});
			_result.externalDocumentNo = result.getValue({name: 'custrecord_mts_externaldocno_isssettline', summary: 'MAX'});
			_result.billToPayToNo = result.getValue({name: 'custrecord_mts_billtopaytono_isssettline', summary: 'MAX'});
			_result.amountLine = result.getValue({name: 'custrecord_mts_amountline_isssettline', summary: 'SUM'});
			_result.baseAmount = result.getValue({name: 'custrecord_mts_baseamount_isssettline', summary: 'SUM'});
			_result.taxPerc = result.getValue({name: 'custrecord_mts_tax_isssettline', summary: 'GROUP'});
			_result.amount = result.getValue({name: 'custrecord_mts_amount_isssettline', summary: 'SUM'});
			arr.push(_result);
			return true;
		});
		return arr;
	}
	
    return {
    	getProcessingMessages:getProcessingMessages,
		getRecordLoad: getRecordLoad,
		brsetup : getBrSetup,
    	vendor : getVendor,
		eletrItemInvoiceSetup : getEletrItemInvoiceSetup,
		getSetupLocBRMotus : getSetupLocBRMotus,
    	item : getItem,
		getBRCompanyInformation : getBRCompanyInformation,
		getServiceCode : getServiceCode,
		getServiceCodeByRecLoad:getServiceCodeByRecLoad,
		getBranchInformation: getBranchInformation,
		getBranchInformationByRecLoad: getBranchInformationByRecLoad,
    	getCalendarHoliday:getCalendarHoliday,
		getPaymentMethod: getPaymentMethod,
		getPaymentMethodByRecLoad: getPaymentMethodByRecLoad,
		getPaymentTermByRecLoad: getPaymentTermByRecLoad,
		getFiscalDocumentType: getFiscalDocumentType,
		getFiscalDocumentTypeByRecLoad:getFiscalDocumentTypeByRecLoad,
		getSubsidiary: getSubsidiary,
		getSubsidiaryByRecLoad: getSubsidiaryByRecLoad,
		getTerritories:getTerritories,
		getCountries:getCountries,
		getOperationTypeByRecLoad: getOperationTypeByRecLoad,
		getNoSerieByRecLoad:getNoSerieByRecLoad,
		getGenerateNFeXML: getGenerateNFeXML,
		getProrrogationEvent: getProrrogationEvent,
		getTagBIdent: getTagBIdent,
		getTagCIssuer: getTagCIssuer,
		getTagDFiscoIssuer: getTagDFiscoIssuer,
		getTagEAddressee: getTagEAddressee,
		getTagGShip: getTagGShip,
		getTagGA: getTagGA,
		getTagINVE: getTagINVE,
		getTagVAdditionalInformation: getTagVAdditionalInformation,
		getTagKMedicationRawMaterials:getTagKMedicationRawMaterials,
		getTagI80ItemTracking: getTagI80ItemTracking,
		getTagNICMS:getTagNICMS,
		getTagOIPI: getTagOIPI,
		getTagPII: getTagPII,
		getTagQPIS: getTagQPIS,
		getTagSCofins: getTagSCofins,
		getTagUISSQN: getTagUISSQN,
		getTagWTotals: getTagWTotals,
		getTagXDeliveryInformation: getTagXDeliveryInformation,
		getTagYReceivableInformation: getTagYReceivableInformation,
		getTagYAPaymentInformation: getTagYAPaymentInformation,
		getTagZAditionalInformation: getTagZAditionalInformation,
		getTagZAExternalInformation: getTagZAExternalInformation,
		getTagZBPurchaseInformation: getTagZBPurchaseInformation,
		getProcessCCe: getProcessCCe,
		getProcessEPEC: getProcessEPEC,
		getFolder:getFolder,
		getSpecialCharacter: getSpecialCharacter,
		getLookupField:getLookupField,
		getCustomerEntity:getCustomerEntity,
		getVendorEntity:getVendorEntity,
		getSearchTagB: getSearchTagB,
		getDetailTariffNumberNCM:getDetailTariffNumberNCM,
		getIESTCodes:getIESTCodes,
		getReturnCode: getReturnCode,
		getEletrItemInvProcess: getEletrItemInvProcess,
		getEletrInvReturn: getEletrInvReturn,
		getProcessEPECSearch: getProcessEPECSearch,
		getSpecificDueDates:getSpecificDueDates,
		getPaymentDetailOrder:getPaymentDetailOrder,
		generalLedgerSetupByRecLoad:generalLedgerSetupByRecLoad,
		getIBPTCode:getIBPTCode,
		eInvoiceCancellation: eInvoiceCancellation,
		getUnitOfMeasureLocByRecLoad:getUnitOfMeasureLocByRecLoad,
		getUnitOfMeasureLoc:getUnitOfMeasureLoc,
		getTariffNumberByRecLoad:getTariffNumberByRecLoad,
		getCustomerItems:getCustomerItems,
		getGenJournalLine:getGenJournalLine,
		getGenJournalBatch:getGenJournalBatch,
		getGenJournalTemplate:getGenJournalTemplate,
		getElecPaySetup:getElecPaySetup,
		getVendorBill:getVendorBill,
		getCompanyInformation:getCompanyInformation,
		getElecPayLine:getElecPayLine,
		getElecPayMethod:getElecPayMethod,
		getRetentionGroups:getRetentionGroups,
		getElecPayType:getElecPayType,
		getTransaction:getTransaction,
		getbankAcocuntCNAB:getbankAcocuntCNAB,
		getDocumentChargeByRecLoad:getDocumentChargeByRecLoad,
		getDocumentCharge:getDocumentCharge,
		getIssSettlementFiltered:getIssSettlementFiltered
    };
    
});
