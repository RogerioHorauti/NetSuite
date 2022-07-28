/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', "N/record", "N/file", "N/runtime", "N/encode", "N/https", "N/email", "N/render"],
    
    function(search, record, file, runtime, encode, https, Nemail, render) 
    {
		function fetchTransactions(fetchObj) 
		{
		    var tranResults = [];
			// mode - 0 for MR script, 1 for SS
			try
			{
	//			log.debug('fetchTransactions', 'Inside library-fetchTransactions()');
	//			log.debug('mode', fetchObj.mode);
	
				var filters = [];

					// Remessa Bonificação
					filters.push([["formulatext: {type}","contains","Remessa Bonificação"],
								"OR",
								["type", "anyof", "VendBill", "VendCred", "CustInvc", "CustCred", "TrnfrOrd"]]);
					filters.push('AND');
					filters.push(["mainline","is","T"]);
					filters.push('AND');
					filters.push(["custbody_enl_fiscaldocstatus","anyof","2"]); // STATUS NOTA FISCAL // Pendente
					filters.push('AND');
		//			filters.push(["status","noneof","VendBill:C","VendBill:E","CustInvc:V","CustInvc:E","CustCred:V","TrnfrOrd:H"]);
					filters.push(["status","noneof","CustInvc:V","CustCred:V",]);
					filters.push('AND');
					filters.push(["custbody_enl_order_documenttype.custrecord_enl_issuereceiptdocument","is","T"]);
					filters.push('AND');
					filters.push(["subsidiary.custrecord_enl_urlswfiscal","isnotempty",""]);
					
					
				if(fetchObj.mode != 0 || fetchObj.records)
				{
	//				log.debug('records', fetchObj.records);
					filters.push('AND');
					filters.push(["internalid","anyof", fetchObj.records]);
				}
	
				var transactionSearchObj = search.create({
				   type: "transaction",
				   filters: filters,
				   columns:
				   [
				      search.createColumn({name: "internalid", sort: search.Sort.ASC, label: "Internal Id"}),
				      search.createColumn({name: "type", label: "Type"}),
				      search.createColumn({name: "custrecord_enl_companyid", join: "subsidiary", label: "Código da Empresa"}),
				      search.createColumn({name: "custrecord_enl_fiscalestablishmentid", join: "location", label: "Estabelecimento Fiscal"}),
				      search.createColumn({name: "custbody_enl_operationtypeid", label: "Tipo de Operação"}),
				      search.createColumn({name: "custrecord_enl_ot_usetype", join: "CUSTBODY_ENL_OPERATIONTYPEID", label: "Tipo de Uso"}),
				      search.createColumn({name: "custbody_enl_accesskey", label: "Chave de Acesso"}),
				      search.createColumn({name: "custbody_enl_fiscaldocumentserie", label: "Serie"}),
				      search.createColumn({name: "location", label: "Location"}),
				      search.createColumn({name: "custrecord_enl_fdt_shortname", join: "CUSTBODY_ENL_ORDER_DOCUMENTTYPE"}),
				      search.createColumn({name: "custrecord_enl_fdt_model", join: "CUSTBODY_ENL_ORDER_DOCUMENTTYPE"}),
				      search.createColumn({name: "entity"}),
				      search.createColumn({name: "custbody_enl_carrierid"}),
				      search.createColumn({ name: "isPerson", join: "customer" }),
				      search.createColumn({ name: "isPerson", join: "vendor" }),
				      search.createColumn({ name: "email", join: "customer" }),
				      search.createColumn({ name: "email", join: "vendor" }),
				      
				      search.createColumn({name: "subsidiary", label: "subsidiary"}),
				      search.createColumn({name: "custrecord_enl_avataxuser", join: "subsidiary"}),
				      search.createColumn({name: "custrecord_enl_pwdavatax", join: "subsidiary"}),
				      search.createColumn({name: "custrecord_enl_urlswfiscal", join: "subsidiary"})
				   ]
				}).runPaged();
				
				// added logic from MR
				transactionSearchObj.pageRanges.forEach(function(pageRange){
		    	    
		    	    var mayPage = transactionSearchObj.fetch({index: pageRange.index})
		    	   
		    	    mayPage.data.forEach(function(result){
		    	    	
		    	    	tranResults.push(result)
		    	        
		    	    });
		    	});
	
	
				if(fetchObj.mode != 0 && tranResults.length)
				{
					log.debug('tranResults.length', tranResults.length);
	//				log.debug('tranResults', tranResults);
					
					return checkIndividualStatus(tranResults); // consult status 
				}
				else
				{
					return tranResults;
				}
				
			}
			catch(fetchTransactionsErr)
			{
		        throw fetchTransactionsErr;
			}
		}
	
		function checkIndividualStatus(tranResults)
		{
	//		log.debug('checkIndividualStatus', 'Inside checkIndividualStatus : ' + JSON.stringify(tranResults));
			log.debug('checkIndividualStatus', 'Inside checkIndividualStatus');
			
			var scriptObj = runtime.getCurrentScript();
	    	var deployId = scriptObj.deploymentId;
	    	log.debug("deploymentId", deployId);
	    	
			var i = 0
			var remainingUsage = 0;
			
			
			for (; i < tranResults.length; i++) 
			{
				try 
				{
					var tranData = tranResults[i];
					var type = tranData.recordType;
					var tranObj = {};
					tranObj.id = tranData.id;
					tranObj.type = tranData.recordType;
					tranObj.companyId = tranData.getValue({name: 'custrecord_enl_companyid', join: 'subsidiary'});
					tranObj.establishmentId = tranData.getValue({name: 'custrecord_enl_fiscalestablishmentid', join: 'location'});
					tranObj.accessKey = tranData.getValue({name: 'custbody_enl_accesskey'});
					tranObj.documentSeries = tranData.getValue({name: 'custbody_enl_fiscaldocumentserie'});
					tranObj.subsidiary = tranData.getValue({name: 'subsidiary'});
					tranObj.documentTypeModel = tranData.getValue({name: "custrecord_enl_fdt_model", join: "CUSTBODY_ENL_ORDER_DOCUMENTTYPE"});
					tranObj.entity = tranData.getValue({name: 'entity'});
					tranObj.carrier = tranData.getValue({name: 'custbody_enl_carrierid'});
					tranObj.isPersonCustomer = tranData.getValue({ name: "isPerson", join: "customer" });
					tranObj.isPersonVendor = tranData.getValue({ name: "isPerson", join: "vendor" });
					tranObj.emailCustomer = tranData.getValue({ name: "email", join: "customer" });
					tranObj.emailVendor = tranData.getValue({ name: "email", join: "vendor" });
					tranObj.avataxUser = tranData.getValue({name: 'custrecord_enl_avataxuser', join: 'subsidiary'});
	    			tranObj.pwdAvatax = tranData.getValue({name: 'custrecord_enl_pwdavatax', join: 'subsidiary'});
	    			tranObj.urlSwFiscal = tranData.getValue({name: 'custrecord_enl_urlswfiscal', join: 'subsidiary'});
	    			
					var locationLoad = record.load({type: 'location', id: tranData.getValue({name: 'location'})});
					var locationAddressSubrecord = locationLoad.getSubrecord({fieldId: 'mainaddress'});
					var establishmentCityId = locationAddressSubrecord.getValue('custrecord_enl_city');
					if(establishmentCityId)
					{
						var cityLoad = record.load({type: 'customrecord_enl_cities', id: establishmentCityId})
						tranObj.cityCode = cityLoad.getValue('custrecord_enl_ibgecode');
						tranObj.cityState = cityLoad.getText('custrecord_enl_citystate');
					}
					
					var requestObj = fetchInvoiceStatuses(type, tranObj);
					
					remainingUsage = scriptObj.getRemainingUsage();
					log.audit('Remaining governance units: ', remainingUsage);
					if(remainingUsage <= 100)
						break;
					
				} 
				catch(checkIndividualStatusErr)
				{
					log.error("checkIndividualStatusErr", JSON.stringify(checkIndividualStatusErr));
					
					if (runtime.executionContext === runtime.ContextType.SUITELET) 
						throw checkIndividualStatusErr;
					
					if(checkIndividualStatusErr.name == "SSS_USAGE_LIMIT_EXCEEDED")
		    			break;
				}
				
			}// end for
			
			if (runtime.executionContext === runtime.ContextType.SUITELET) 
				return requestObj;
			else
				return i;
			
		}
		
		function fetchInvoiceStatuses(type, tranObj)
		{
			try
			{
				log.debug('INSIDE', 'inside fetchInvoiceStatuses');
	//			log.debug('type', type);
	//			log.debug('tranObj', tranObj);
	
				var regex = /\/\/$/g;
	    		var subst = '';
				var valuesObj = {};
	    		var scriptObj = runtime.getCurrentScript();
	//    		log.debug('scriptObj', JSON.stringify(scriptObj)); 
	    		
	    		var xmlFolder = scriptObj.getParameter({name: 'custscript_avlr_v3_xmlfolder'});
	//    		log.debug('xmlFolder', xmlFolder);
	
				var companyId = tranObj.companyId;
				var establishmentId = tranObj.establishmentId;
				var accessKey = tranObj.accessKey;
				if(!accessKey)
					throw "Chave de Acesso não encontrada."
					
				var documentSeries = tranObj.documentSeries;
	
	    		var finalUrl = tranObj.urlSwFiscal
	    		finalUrl = finalUrl.replace(regex, subst);
	
	    		
	    		if(1 == tranObj.documentTypeModel) //Service Invoice
					finalUrl += '/v3/invoices/services/' + documentSeries + '/' + accessKey;
				else
					finalUrl += '/v3/invoices/goods/' + accessKey;
				
	    		finalUrl = finalUrl.substr(0, 8).concat(finalUrl.substr(8).replace('//', '/'));
	    		
	    		log.debug('finalUrl', finalUrl);
					
		        var getResult = getHeaderRequest(tranObj.subsidiary);

				if(tranObj.cityState != "DF")
				{
					getResult.header['Avalara-Location-Code'] = establishmentId // custrecord_enl_fiscalestablishmentid
					
					if(companyId)
						getResult.header['Avalara-Company-Id'] = companyId
				}
	    		
		        // log.debug('headers', getResult.header);
			        
	        	var requestObj = https.request({ // GET Retrieve Invoice
	        		method: https.Method.GET,
	        	    url: finalUrl,
	        	    headers: getResult.header
	        	});

				// var requestObj = {"code":400,"body":"{\"error\":{\"code\":\"000\",\"message\":\"No document found.\"}}","error":null,"objectType":"nlobjServerResponse","contentType":"application/json; charset=utf-8","displayValue":"code=400","allHeaders":["Access-Control-Allow-Origin","content-length","Content-Security-Policy","Content-Type","Cross-Origin-Embedder-Policy","Cross-Origin-Opener-Policy","Cross-Origin-Resource-Policy","Date","Expect-CT","Origin-Agent-Cluster","Referrer-Policy","Strict-Transport-Security","Via","X-Content-Type-Options","X-DNS-Prefetch-Control","X-Download-Options","X-Frame-Options","X-Permitted-Cross-Domain-Policies","X-XSS-Protection"]};
	        	
	        	var responseCode, responseBody;
	        	if(requestObj)
	        	{
	        		responseCode = requestObj.code;
	        		log.debug('responseCode', responseCode);
	        		
	    			responseBody = JSON.parse(requestObj.body);
	    			log.debug('responseBody', responseBody);
	        		
	    			if(responseCode != 200)
	        		{
	        			if(responseBody.error.message && responseBody.error.message.indexOf('No document found.') > -1 && tranObj.documentTypeModel != 1)
	        			{
	        				var finalUrl = tranObj.urlSwFiscal;
	        				
	        				var invoiceNumber = accessKey.substr(25,9);
	        				var invoiceModel = accessKey.substr(20,2);
	        				
	        				finalUrl += '/v3/invoices/goods/' + documentSeries + '/' + invoiceNumber + '/' + invoiceNumber + '/' + invoiceModel;
	        				
	        				finalUrl = finalUrl.substr(0, 8).concat(finalUrl.substr(8).replace('//', '/'));
	        				log.debug("No document found.", finalUrl);
	        				
	        				var requestObj = https.request({
	        	        		method: https.Method.GET,
	        	        	    url: finalUrl,
	        	        	    headers: getResult.header
	        	        	});
	        				
	        				log.debug('responseCode', requestObj.code);
	        				log.debug('responseBody', requestObj.body);
	        				
	        				if(requestObj.code == 200)
	        				{
	        					responseBody = JSON.parse(requestObj.body)[0];
								
								if(responseBody.status.accessKey)
									valuesObj['custbody_enl_accesskey'] = responseBody.status.accessKey;

	        					setNsResponseObjSuccess();
	        				}
	        				else
	        				{
	        					responseBody = JSON.parse(requestObj.body);
	        					setNsResponseObjError();
	        				}
	        			}
	        			else
	        				setNsResponseObjError();
	        			
	        		}
	        		else
	        			setNsResponseObjSuccess();
	        		
	        		return responseBody;
	        	}
			}
			catch(fetchInvoiceStatusesErr)
			{
		        throw fetchInvoiceStatusesErr;
			}
			
			function setNsResponseObjSuccess() 
			{
				// Update transaction fields
	    		var statusCode = (responseBody.status.code == '100') ? 3 : 2;
	    		valuesObj['custbody_enl_fiscaldocstatus'] = statusCode;
	    		
				if(responseBody.pdf.link)
	    			valuesObj['custbody_enl_linknotafiscal'] = responseBody.pdf.link;
	    		
				if(responseBody.status.protocol || responseBody.invoiceProtocol)
	            	valuesObj['custbody_enl_protololnfe'] = responseBody.status.protocol || responseBody.invoiceProtocol;

				if(responseBody.status.desc)
	            	valuesObj['custbody_enl_messagespl'] = responseBody.status.desc;
			
	            if(1 == tranObj.documentTypeModel) //Service Invoice
				{
					if(tranObj.cityState = "DF")
					{
						if(responseBody.status.accessKey)
							valuesObj['custbody_enl_accesskey'] = responseBody.status.accessKey;
					}
					else
					{
						if(responseBody.status.nfseNumber)
	    					valuesObj['custbody_enl_fiscaldocnumber'] = responseBody.status.nfseNumber;
					}
				}
			
				log.debug("valuesObj", valuesObj);

	    		// UPDATE body level fields
	    		var tranUpdate = record.submitFields({
				    type: tranObj.type,
				    id: tranObj.id,
				    values: valuesObj,
	        		enableSourcing: false,
	        		ignoreMandatoryFields : true
				});
	    		log.debug('tranUpdate - after submission(Update)', tranUpdate);
	
	    		// Attach XMl file to transaction
	    		if(responseBody.xml && xmlFolder)
	    		{
	    	        var nfeXML = encode.convert({
	                    string: responseBody.xml.base64,
	                    inputEncoding: encode.Encoding.BASE_64,
	                    outputEncoding: encode.Encoding.UTF_8
	                });
	//    	        log.debug('nfeXML', nfeXML);
	    			
	    	        if(tranObj.cityCode == '3505708')
		        	{
	    	        	var fileName = "TXT_BARUERI_NFSe" + accessKey + ".txt";
	    	        	var fileObj = file.create({
	    	        		name: fileName,
	    	        		fileType: 'PLAINTEXT',
	    	        		folder: xmlFolder,
	    	        		contents: nfeXML,
	    	        		encoding: file.Encoding.WINDOWS_1252
	    	        	});
		        	}
	    	        else
		        	{
	    	        	var fileName = "XML_NFe" + accessKey + ".xml";
	    	        	var fileObj = file.create({
	    	        		name: fileName,
	    	        		fileType: 'XMLDOC',
	    	        		folder: xmlFolder,
	    	        		contents: nfeXML,
	    	        		encoding: file.Encoding.UTF_8
	    	        	});
		        	}
	    	        
		    		var fileId = fileObj.save();
	//	    		log.debug('fileId', fileId);
		    		
		    		var fileAttachId = record.attach({
		    		    record: {
		    		        type: 'file',
		    		        id: fileId
		    		    },
		    		    to: {
		    		        type: tranObj.type,
		    		        id: tranObj.id
		    		    }});
	//	    		log.debug('fileAttachId', fileAttachId);
		    		
		    		//Send Email
		    		var template = scriptObj.getParameter({name: 'custscript_avlr_v3_envioemail'});
		    		
		    		if(responseBody.status.code == '100' && template && tranObj.type == "invoice")
				   	{
		    			var resultados = [];
				  		if(tranObj.entity)
				  			resultados.push(tranObj.entity);
				  		
	    			    if(tranObj.carrier)
	    			    {
	    			    	var carregaTransportadora = record.load({type: 'customrecord_enl_transportadoras', id: tranObj.carrier});// carrega registro de transportadora 
	    			    	var fornecedor = carregaTransportadora.getValue('custrecord_enl_codigotransportadoras');    // valor id Fornecedor
	    			    	if(fornecedor)
				  				resultados.push(fornecedor);
	    				}
	    				
						var emails = new Array();
					
	    				if(tranObj.isPersonCustomer)
			  				emails.push(tranObj.emailCustomer );
			  			else
			  				if(resultados.length)
			  					fetchContact();
				  		
	//			  		log.debug('entityObj', entityObj);
				  		
				  		var emaildecopia = scriptObj.getParameter({name: 'custscript_avlr_v3_emailcopianfe'});
				  		if(emaildecopia)
				  			emails.push(emaildecopia);
	
	//			  		log.debug('emails', emails);
	
				  		var emailMerger = render.mergeEmail({
				  			templateId: template,
				  			entity: {
						  			type: 'customer',
						  			id: Number(tranObj.entity)
					  			},
				  			transactionId: Number(tranObj.id),
			  			});
				  		
				  		log.debug('emailMerger', JSON.stringify(emailMerger));
				  		
				    	var emailSender = scriptObj.getParameter({name: 'custscript_avlr_v3_emailsender'}) || runtime.getCurrentUser().id;
				
				        if(emails.length && emailSender)
				        {  
				        	Nemail.send({
				        		author: emailSender,
				        		recipients: emails,
				        		subject: emailMerger.subject,
				        		body: emailMerger.body,
				        		attachments: [fileObj],
				        		relatedRecords: {
			        		        transactionId: Number(tranObj.id)
		        		    	}
			        		});
				        }
				        else
				        	log.debug('email.send', 'Nenhum e-mail emcontrado');
				        
				    }// END if(template)
	    		}
	    		
	    		function fetchContact() 
	        	{
	        		search.create({
	    	    		   type: "contact",
	    	    		   filters:
	    	    		   [
	    	    		      ["custentity_enl_enviarnota", "is", "T"], 
	    	    		      "AND", 
	    	    		      ["email", "isnotempty", ""], 
	    	    		      "AND", 
	    	    		      ["company", "anyof", resultados]
	    	    		   ],
	    	    		   columns:["email"]
	    	    		}).run().each(function(result){
	    	    		   
	    	    			emails.push(result.getValue('email'));
	    	    			return true;
	    	    		});
	    		}
			}
			
			function setNsResponseObjError() 
			{
				// On Error
	    		var tranUpdate = record.submitFields({
				    type: type,
				    id: tranObj.id,
				    values: {
	    			    	'custbody_enl_fiscaldocstatus': 7,
	    			    	'custbody_ava_edocstatus' : 4, // Error
	    			    	'custbody_enl_messagespl': responseBody.error.message
				    	},
	        		enableSourcing: false,
	        		ignoreMandatoryFields : true
				});
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
			
			log.debug('getHeaderRequest', response.code);
			if(response.code != 200)
			{
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
		
        return {
        	fetchTransactions: fetchTransactions,
        	fetchInvoiceStatuses: fetchInvoiceStatuses
        };

    });
