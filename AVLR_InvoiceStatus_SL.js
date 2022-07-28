/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['./AVLR_FetchStatus_Lib.js', 
        'N/search', 
        'N/encode', 
        'N/https', 
        'N/record', 
        'N/file', 
        'N/runtime', 
        'N/config', 
        'N/transaction'
        ],

function(
		eInvoiceLib, 
		search, 
		encode, 
		https, 
		record, 
		file, 
		runtime, 
		config, 
		transaction
		) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) 
    {
    	try 
    	{
    		var internalid = context.request.parameters['internalid'];
    		var recordtype = context.request.parameters['recordtype'];

    		if(context.request.method == 'GET')
    		{
    			
    			var fetchObj = {};
    			fetchObj.mode = 1;
    			fetchObj.records = [internalid]
    			
    			log.debug('internalid', internalid);
    			var responseObj = eInvoiceLib.fetchTransactions(fetchObj);
    			
    			log.debug('responseObj', responseObj);
    		}
    		else // method == 'POST'
			{
    			var _action = context.request.parameters['custscript_avlr_action'];
    			var _motivo = context.request.parameters['custscript_avlr_motivo'];
    			var _model = context.request.parameters['custscript_avlr_model'];

    			log.debug('parameters', 'internalid : ' + internalid +', recordtype : ' + recordtype);
    			//log.debug('_action', _action);
    			//log.debug('_motivo', _motivo);
    			//log.debug('_model', _model);
    			
    			var transactionLoad = record.load({ type: recordtype, id: internalid, isDynamic: true});
    				
    			var lookUpSubsidiary = search.lookupFields({
					type: search.Type.SUBSIDIARY,
					id: transactionLoad.getValue({fieldId: 'subsidiary'}),
					columns: [
					          'custrecord_enl_urlswfiscal', 
					          'custrecord_enl_avataxuser', 
					          'custrecord_enl_pwdavatax', 
					          'custrecord_enl_companyid'
				          ]
				});
    			
    			var locationId = transactionLoad.getValue({fieldId: 'location'});
				var locationLoad = record.load({type: record.Type.LOCATION, id: locationId, isDynamic: true});	

				var locationAddressSubrecord = locationLoad.getSubrecord({fieldId: 'mainaddress'});

				var _city = locationAddressSubrecord.getValue('custrecord_enl_city');
				var _state;

				if(_city)
				{
					var fieldLookUpCity = search.lookupFields({
							type: 'customrecord_enl_cities',
							id: _city, 
							columns: ['custrecord_enl_citystate']
						});
					
					
					if(fieldLookUpCity.custrecord_enl_citystate.length)
						_state = fieldLookUpCity.custrecord_enl_citystate[0].text;
				}
				
				// log.debug('_state', _state);
    			var _baseURL = lookUpSubsidiary.custrecord_enl_urlswfiscal;

    			if (!_baseURL) 
    				throw 'URL SW Fiscal não definido. Checar na configuração da subsidiária'
		      
				if(_model == 1)
				{
					if(_state == "DF")
					{
						_baseURL += '/v3/invoices/goods/' + transactionLoad.getValue({fieldId: 'custbody_enl_accesskey'});
					}
					else
					{
						var _serie = transactionLoad.getValue({fieldId: 'custbody_enl_fiscaldocumentserie'});
						var _accesskey = transactionLoad.getValue({fieldId: 'custbody_enl_accesskey'});
						_baseURL += '/v3/invoices/services/' + _serie + '/' + _accesskey;
					}
				}
				else
				{
					_baseURL += '/v3/invoices/goods/' + transactionLoad.getValue({fieldId: 'custbody_enl_accesskey'});
					
					var _body = {}
		    			_body.message = _motivo;
		    			_body.timeZone = "-03:00";
				}
    			
    			_baseURL = _baseURL.substr(0, 8).concat(_baseURL.substr(8).replace('//', '/'));
    			log.debug('url', _baseURL);
    			
    			var _headers = getHeaderRequest(transactionLoad.getValue({fieldId: 'subsidiary'}));
    			_headers.header['Avalara-Location-Code'] = locationLoad.getValue("custrecord_enl_fiscalestablishmentid");
				_headers.header['Avalara-Company-Id'] = lookUpSubsidiary.custrecord_enl_companyid
    			// log.debug('headers', _headers);
    			
    			
    			if(_action == 'correctionLetter')
				{
    				var _sequence = 1;
    				var numLines = transactionLoad.getLineCount({sublistId: 'recmachcustrecord_avlr_cancel_invoice_tran'});
    				
    				for (var int = 0; int < numLines; int++) 
    	    		{
    	    			var actionValue = transactionLoad.getSublistValue({
	    	    				sublistId: 'recmachcustrecord_avlr_cancel_invoice_tran',
	    	    				fieldId: 'custrecord_avlr_cancel_invoice_action',
	    	    				line: int
    	    				});
    	    			
    	    			if(actionValue.indexOf('FixLetter') > -1)
    	    				_sequence += 1;
					}
    				
    				_body.seq = _sequence

    				var _method = https.Method.PUT; // Fix Letter
				}
    			else // _action == 'cancel'
				{
    				var _method = https.Method.DELETE; // Cancel Invoice
				}
    			
    			log.debug('request body', _body);
    			log.debug('request method', _method);
    			
				var responseObj = https.request({
					method: _method,
					url: _baseURL,
					body: JSON.stringify(_body),
					headers: _headers.header
				});

				log.debug('response', responseObj);
				log.debug('response body', responseObj.body);
				
				var scriptObj = runtime.getCurrentScript();
				var _folderId = scriptObj.getParameter({name: 'custscript_avlr_v3_xmlfolder'});
				if(!_folderId)
					log.debug('WARNING', 'Id "Xml Folder" não definido.');
				
				if(responseObj.code == 200)
				{
					var response = JSON.parse(responseObj.body);
					if(response.status && ['101','135'].indexOf(response.status.code) > -1)
					{
						log.debug('status.code', response.status.code);
						
						if (response.xml && response.xml.base64)
						{
							var xml = encode.convert({ 
								string: response.xml.base64, 
								inputEncoding: encode.Encoding.BASE_64, 
								outputEncoding: encode.Encoding.UTF_8 
							});
							
							if(_folderId)
							{
								if(_action == 'cancel')
									var name = 'CancelInvoice' + internalid + '.xml'
									else
										var name = 'FixLetter' + internalid + '_' + _sequence + '.xml'
										
										var fileXmlId = file.create({
											name: name,
											fileType: file.Type.XMLDOC,
											contents: xml,
											folder: _folderId,
											encoding: file.Encoding.WINDOWS_1252,
											isOnline: true
										}).save();
								//log.debug('fileXmlId', fileXmlId);
								
								record.attach({
									record: {
										type: 'file',
										id: fileXmlId
									},
									to: {
										type: recordtype,
										id: internalid
									}
								});
							}
						}
						
						if(_folderId && response.pdf && response.pdf.base64)
						{
							var filePdfId = file.create({
								name: 'FixLetter' + internalid + '_' + _sequence + '.pdf',
								fileType: file.Type.PDF,
								contents: response.pdf.base64,
								folder: _folderId,
								encoding: file.Encoding.WINDOWS_1252,
								isOnline: true
							}).save();
							//log.debug('filePdfId', filePdfId);
							
							record.attach({
								record: {
									type: 'file',
									id: filePdfId
								},
								to: {
									type: recordtype,
									id: internalid
								}
							});
						}
						
						transactionLoad.setValue({fieldId: 'custbody_enl_messagespl', value: response.status.desc});
						
						transactionLoad.selectNewLine({sublistId: 'recmachcustrecord_avlr_cancel_invoice_tran'});
						
						transactionLoad.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_avlr_cancel_invoice_tran',
							fieldId: 'custrecord_avlr_cancel_invoice_action',
							value: (_action == 'cancel' ? 'CancelInvoice' : ('FixLetter_' + _sequence))
						});
						
						transactionLoad.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_avlr_cancel_invoice_tran',
							fieldId: 'custrecord_avlr_cancel_invoice_date',
							value: new Date()
						});
						
						transactionLoad.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_avlr_cancel_invoice_tran',
							fieldId: 'custrecord_avlr_cancel_invoice_motivo',
							value: _motivo
						});
						
    					transactionLoad.setCurrentSublistValue({
    						sublistId: 'recmachcustrecord_avlr_cancel_invoice_tran',
    						fieldId: 'custrecord_avlr_cancel_invoice_retorno',
    						value: JSON.stringify(response)
    					});
						
    					if(xml)
							transactionLoad.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_avlr_cancel_invoice_tran',
								fieldId: 'custrecord_avlr_cancel_invoice_xml',
								value: JSON.stringify(xml)
							});
						
						transactionLoad.commitLine({sublistId: 'recmachcustrecord_avlr_cancel_invoice_tran'});
						
						if(_action == 'cancel')
						{
							// Cancelada pelo Sefaz
							transactionLoad.setValue({fieldId: 'custbody_enl_fiscaldocstatus', value: 5});
							transactionLoad.setValue({fieldId: 'memo', value: 'void'});
							
							log.debug('Save information', transactionLoad.save({ignoreMandatoryFields: true}));
							
							// Remessa Bonificação
							if(transactionLoad.type != "customsale_remessa_bon")
							{
								// Setup -> Accounting -> Accounting Preferences
								var accountingConfig = config.load({type: "accountingpreferences"});
								
								var disabledVoid = accountingConfig.getValue({ fieldId: 'REVERSALVOIDING' });
								if (disabledVoid) 
								{
									accountingConfig.setValue({fieldId: 'REVERSALVOIDING', value: false});
									accountingConfig.save()
								}
								
								transaction.void({type: recordtype, id: internalid});
								
								if (disabledVoid) 
								{
									accountingConfig.setValue({fieldId: 'REVERSALVOIDING', value: true})
									log.debug('Save accountingConfig', accountingConfig.save());  
								}
							}   
						}// end action == 'cancel'
				        else
						{
							log.debug('Save information', transactionLoad.save());
						}

						responseObj = response;
					}
				
				}// end responseObj == 200
				
    			
			}// end POST
    		
    		//log.debug('response.write', responseObj);
			context.response.write(JSON.stringify(responseObj));
		} 
    	catch (e) 
		{
    		if (disabledVoid) 
			{
				accountingConfig.setValue({fieldId: 'REVERSALVOIDING', value: true})
				log.debug('Save accountingConfig', accountingConfig.save());  
			}
    		
    		log.debug('ERROR', JSON.stringify(e));
    		throw e;
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
        onRequest: onRequest
    };
    
});
