/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope Public
 */
define([
        'N/http', 
        'N/file', 
        'N/xml', 
        'N/runtime', 
        'N/record', 
        'N/https', 
        'N/search', 
        './Script_Searches', 
        'N/render', 
        'N/cache'
        ],

function(
		http, 
		file, 
		xml, 
		runtime, 
		record, 
		https, 
		search, 
		searches, 
		render, 
		cache
		) {
   
    /**
     * Function called upon sending a GET request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams) {
    	 log.debug("Called from GET", requestParams);
//    	var objList = [];
//		var objAux = {};
//		var mySearch = search.create({
//			type: "scriptdeployment",
//			filters: [["scriptid","is","CUSTOMDEPLOY_MTS_SCHEDULEGENERATETAXES"]],
//			columns:
//				[
//				 "internalid",  
//				 "scriptid",
//				 ]
//		});
//		
//		var resultCount = mySearch.runPaged().count;
//		if (resultCount) {
//			mySearch.run().each(function(result){
//				objAux = {};
//				objAux.id = result.getValue({name: 'internalid'});
//				objAux.scriptid = result.getValue({name: 'scriptid'});
//				objList.push(objAux);
//				return true;
//			});			
//		}
//		log.debug({title: 'scriptdeployment', details: objList});
//		
//    	return JSON.stringify(objList);
    	
//    	var myCache = cache.getCache({name: 'temporaryCache'}); 
//    	 
//    	var VARIAVEL = '065DJI3546JKNDD3T34R32GHFF';
//    	
//    	
//    	myCache.put({
//    		key: 'temporaryCache',
//    		value: VARIAVEL,
//    		ttl: 300
//		});
//    	
//    	var myValue = myCache.get({
//    		key: 'temporaryCache',
//    		loader: loader,
//    		ttl: 18000// in seconds
//		});
//    	
//    	log.debug({title: 'Cache', details: myValue});
    	
    	var _headers = { name: 'Accept-Language', value: 'en-us' };
    	var _headers = { 'Authorization' : 'Bearer ' +  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvbWF0aGVtYS5jb20uYnIiLCJpYXQiOjE1NzE3NTU4MjQsIm5iZiI6MTU3MTc1NTgyNCwiZXhwIjoxNTcyMzYwNjI0LCJkYXRhIjp7InVzZXIiOnsiaWQiOiIxNTcifX19.Vv95X6jdGvmnCkZtpQ0oNoyyDUUddTwUl2YB0fUNYw0' };
 		var _response = https.get({url: 'https://mathema.com.br/wp-json/wc/v3/orders', headers: _headers});
 		var _json = JSON.parse(_response.body);
 		var _response = {}; 
 		for (var int = 0; int < _json.length; int++) 
		{
 			https.get.promise({ url: _json[int]._links.customer[0].href, headers: _headers }).then(function(result){
 					var _jsonCustomer = JSON.parse(_response.body);
 					log.debug({title: 'response customer', details: _jsonCustomer});
 				});
		}
 		
    	return 'Call GET OK';
    }

	var loader = function () {
		
	}
    /**
     * Function called upon sending a PUT request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPut(requestBody) {
    	 log.debug("Called from PUT", requestBody);

    	 
//    	 var requestObj = new Object();
//    	 //requestObj.XmlNode = '';// nfeXml
//    	 
////    	 requestObj.Id = '35160242546531000639550010001360371000000136'
//    	 requestObj.Id = 'NFe43190110426974000276550010000000661000000019'
////	     requestObj.Id = '35160242546531000639550010001360371000000136'; //Nfe.ide.Id; //Id da NF Enviada. Para RPS enviar string 'Lote_x' sendo x o numero do lote
//		 
//		 requestObj.TpAmb = 2; //Nfe.ide.tpAmb; //Enviar 1 para PRD e 2 para HML
//    	 requestObj.MessageType = 'Nfe'; //Valores possiveis: Nfe,inutNFe,envEvento,consReciNFe,SendRPS,SendRPSBatch,cancelNFSe,InquireRPS,InquireRPSBatch,ReinfEvtInfoContri,ReinfEvtTabProcesso,ReinfEvtServTom,ReinfEvtServPrest,ReinfEvtCPRB,ReinfEvtPgtosDivs,ReinfEvtReabreEvPer,ReinfEvtFechaEvPer,ReinfEvtExclusao,ReinfConsultaFechaEvPer
//    	 requestObj.Timeout = 40000; //Quanto tempo o WS deve tentar ler a pasta de resposta
//	        
//    	 var _xmlReturn;
//    	 var header=[];
//    	 header['Content-Type']='application/json';
//        
//    	 //log.debug({	title: 'connector - requestObj', details: requestObj });
//        
//    	 try          
//        	{						//'http://170.78.235.3:4433/api/NfeConnector',
//                var response = http.put({
//                                url: 'http://170.78.235.3:4433/api/NfeConnector',
//                                body: JSON.stringify(requestObj),
//                                headers: header
//                });
//                //...
//        	}
//    	 catch(e){
//        	log.debug({ title: 'FunctionsBR - try catch / connector', details: e });
//        	throw e;
//    	 }
//	        
// 	    //return "Hello from PUT.\nData received:\n" + JSON.stringify(requestBody);
    	 
//----------------------------------------------------------------------------------------------    	 
//    	 var xmlStr = '< ?xml version="1.0" encoding="UTF-8"?>'
//    			 + '< !DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'
//    			 + '<#list exampleName as Lines>'
//    			 	+ '<div> ${Lines.title} ${Lines.status}</div>'
//    			 + '</#list>';
//    	 
//		 var rs = search.create({
//		 type: search.Type.TASK,
//			 columns: ['title', 'status', 'startdate'],
//			 filters: []
//		 }).run();
//
//		 var results = rs.getRange(0, 1000);
//		 
//		 var renderer = render.create();
//		 renderer.templateContent = xmlStr;
//		 
//		 renderer.addSearchResults({
//			 templateName: 'exampleName',
//			 searchResult: results
//		 });
//    			 
//		 log.debug({title: 'renderAsString', details: renderer.renderAsString()});
//        return renderer.renderAsString()
//----------------------------------------------------------------------------------------------
    	 
        //var file = require('N/file');
    	 //SuiteScripts/Localization Grvppe Solvit/ElectronicPayment/EPG05305.txt
    	 //var txtTemplate = file.load('./ElectronicPayment/EPG05305.txt');
    	 
    	 var txtTemplate = file.load(43014);
    	 log.debug({title: 'txtTemplate', details: txtTemplate});
    	 var text = txtTemplate.getContents();
    	 log.debug({title: 'util.isString', details: util.isString(text)});
    	 log.debug({title: 'text', details: text});
    	 
    	 //log.debug({title: 'indexOf', details: text.indexOf('341000')});
    	 //log.debug({title: 'search', details: text.search('341000')});
    	 
    	 var eachLine = text.split('\n');
    	 log.debug({title: 'Array', details: eachLine});
    	 
    	 //var arr = [];
    	 
    	 for(var i = 0, l = eachLine.length; i < l; i++) {
    	      log.debug({title: 'Line', details: (i+1) + ': ' + eachLine[i]});
    	      //arr.push(eachLine[i]);
    	  }
    	 
    	 //log.debug({title: 'Array', details: arr});
    	 
    	 var regex = /341000/gi, result, indices = [];
    	 while ( (result = regex.exec(text)) ) {
    	     indices.push(result.index);
    	 }
    	 log.debug({title: 'indices', details: indices});
    	 
    	 return JSON.stringify(indices);
    }


    /**
     * Function called upon sending a POST request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPost(requestBody) {
    	
//    	//------------------------------------------------------------------------------------
//    	log.debug("Called from POST", requestBody);
//	   
//    	var lvEletrItemInvoiceSetup = searches.eletrItemInvoiceSetup();
//		var attempts = lvEletrItemInvoiceSetup.attempts // Object()
//		for (var int2 = 0; int2 < attempts; int2++) {
//			sleep(3000);// Sleep for 1 second (1000 milliseconds)
//			log.debug({title: 'sleep', details: new Date().toISOString()});
//		}
//		//------------------------------------------------------------------------------------
		
//    	var issSettlement = searches.getIssSettlementFiltered();
//    	log.debug({title: 'issSettlement', details: issSettlement});
    	
//    	var customrecord_mts_isssettlineSearchObj = search.create({
//    		   type: "customrecord_mts_isssettline",
//    		   filters:
//    		   [
//    		      ["custrecord_mts_isssettid_isssettline","anyof","1"]
//    		   ],
//    		   columns:
//    		   [
//    		      search.createColumn({
//    		         name: "custrecord_mts_postingdate_isssettline",
//    		         summary: "MAX",
//    		      }),
//    		      search.createColumn({
//    		         name: "custrecord_mts_paydate_isssettline",
//    		         summary: "GROUP",
//    		      }),
//    		      search.createColumn({
//    		         name: "custrecord_mts_taxidentifica_isssettline",
//    		         summary: "GROUP",
//    		         label: "Tax Identification"
//    		      }),
//    		      search.createColumn({
//    		         name: "custrecord_mts_branchcode_isssettline",
//    		         summary: "MAX",
//    		      }),
//    		      search.createColumn({
//    		         name: "custrecord_mts_docno_isssettline",
//    		         summary: "GROUP",
//    		      }),
//    		      search.createColumn({
//    		         name: "custrecord_mts_externaldocno_isssettline",
//    		         summary: "MAX",
//    		      }),
//    		      search.createColumn({
//    		         name: "custrecord_mts_billtopaytona_isssettline",
//    		         summary: "MAX",
//    		      }),
//    		      search.createColumn({
//    		         name: "custrecord_mts_amountline_isssettline",
//    		         summary: "SUM",
//    		      }),
//    		      search.createColumn({
//    		         name: "custrecord_mts_baseamount_isssettline",
//    		         summary: "SUM",
//    		      }),
//    		      search.createColumn({
//    		         name: "custrecord_mts_tax_isssettline",
//    		         summary: "GROUP",
//    		      }),
//    		      search.createColumn({
//    		         name: "custrecord_mts_amount_isssettline",
//    		         summary: "SUM",
//    		      })
//    		   ]
//    		});
//    		var searchResultCount = customrecord_mts_isssettlineSearchObj.runPaged().count;
//    		log.debug("customrecord_mts_isssettlineSearchObj result count",searchResultCount);
//    		customrecord_mts_isssettlineSearchObj.run().each(function(result){
//    		   // .run().each has a limit of 4,000 results
//    			log.debug({title: '', details: result.getValue({name: 'custrecord_mts_postingdate_isssettline', summary: "MAX"})});
//    		   return true;
//    		});
    	
    		
    		var objAux = {};
    		var mySearch = search.create({
    			type: "customrecord_mts_elecpayline",
    			filters: [["custrecord_mts_type_elecpayline","anyof","1"],"AND",["custrecord_mts_yournodetail_elecpayline","contains","CNAB-000000000008971"]],
    			columns:
    				[
    				 "internalid",
    				 "custrecord_mts_type_elecpayline",
    				 "custrecord_mts_vendor_elecpayline",
    				 "custrecord_mts_docno_elecpayline",
    				 "custrecord_mts_appliestoid_elecpayline",
    				 "custrecord_mts_sumbyvendor_elecpayline"
    				 ]
    		});
    		
    		var resultCount = mySearch.runPaged().count;
    		if (resultCount) {
    			mySearch.run().each(function(result){
    				objAux = {};
    				objAux.id = result.getValue({name: 'internalid'});
    				objAux.type = result.getValue({name: 'custrecord_mts_type_elecpayline'});
    				objAux.vendor = result.getValue({name: 'custrecord_mts_vendor_elecpayline'});
    				objAux.documentNo = result.getValue({name: 'custrecord_mts_docno_elecpayline'});
    				objAux.appliesToId = result.getValue({name: 'custrecord_mts_appliestoid_elecpayline'});
    				objAux.summarizedByVendor = result.getValue({name: 'custrecord_mts_sumbyvendor_elecpayline'});
    			});			
    		}
    		
    		
    		
		//return "Hello from POST.\nData received:\n" + JSON.stringify(requestBody);
    	return JSON.stringify(objAux);
    }
    
    function sleep(milliseconds) {
    	var start = new Date().getTime();
    	for (var i = 0; i < 1e7; i++) {
    		if ((new Date().getTime() - start) > milliseconds){
    			break;
    		}
    	}
	}
    
    /**
     * Function called upon sending a DELETE request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doDelete(requestParams) {
    	
    	log.debug("Called from doDelete", requestParams);
    	var data2 = new Date('Wed Jan 16 2019 11:44:35 GMT-0200');
    	var str2 = 'Wed Jan 16 2019 11:44:35 GMT-0200';
    	
    	var tagb = record.load({type: 'customrecord_mts_nfetagb', id: 3});
		var data = tagb.getValue({fieldId: 'custrecord_mts_fiscaldocissdate3_nfetagb'});
		log.debug({title: 'data', details: data});
		
		var str = data.toString();
		
		var index = str2.indexOf("GMT");
		log.debug({title: 'index', details: index});
		var gmt = str2.substring(28,34);
		log.debug({title: 'gmt', details: gmt});
		
		var tempDate = data.toISOString()
		tempDate = tempDate.substring(0,19);
		log.debug({title: 'tempDate', details: tempDate});
		
		
		log.debug({title: 'data2', details: data2});
		log.debug({title: 'data2.toISOString()', details: data2.toISOString()});
		//log.debug({title: 'data.toString()', details: data2.getGMTOffset()});
		
    	return String(requestParams);
    }
        
    return {
        'get': doGet,
        put: doPut,
        post: doPost,
        'delete': doDelete
    };
    
});
