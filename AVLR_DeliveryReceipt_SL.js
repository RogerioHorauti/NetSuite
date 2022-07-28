/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/crypto', 'N/encode', 'N/file', 'N/https', 'N/record', 'N/runtime', 'N/ui/serverWidget', 'N/format'],
/**
 * @param {encode} encode
 * @param {file} file
 * @param {https} https
 * @param {record} record
 * @param {runtime} runtime
 * @param {serverWidget} serverWidget
 */
function(crypto, encode, file, https, record, runtime, serverWidget, format) 
{
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
    	if(context.request.method == 'GET')
		{
    		try 
    		{
    			var lang = runtime.getCurrentUser().getPreference ({name: 'LANGUAGE'});
    			
    			var internalid = context.request.parameters.internalid;
        		var recordtype = context.request.parameters.recordtype;
        		log.debug('onRequest',recordtype +' '+ internalid);

        		if(lang == 'pt_BR')
        		{
        			var deliveryReceiptLabel = 'Delivery Receipt';
        			var dateDeliveryLabel = 'Data de entrega';
        			var timeDeliveryLabel = 'Hora de entrega';
        			var cityDeliveryLabel = 'Cidade da entrega';
        			var latitudeLabel = 'Latitude do ponto de entrega';
        			var longitudeLabel = 'Longitude do ponto de entrega';
        			var docNumberLabel = 'Número do Documento do recebedor';
        			var nameLabel = 'Nome do recebedor';
        			var imageLabel = 'Imagem';
        			var submitLabel = 'Enviar'
        		}
        		else
    			{
        			var deliveryReceiptLabel = 'Comprovante de Entrega';
        			var dateDeliveryLabel = 'Date of delivery';
        			var timeDeliveryLabel = 'Time of delivery';
        			var cityDeliveryLabel = 'City of delivery';
        			var latitudeLabel = 'Delivery point latitude';
        			var longitudeLabel = 'Delivery point longitude';
        			var docNumberLabel = 'Recipient Document Number';
        			var nameLabel = 'Recipient Name';
        			var imageLabel = 'Image';
        			var submitLabel = 'Submit';
    			}
        		
        		var form = serverWidget.createForm({title : deliveryReceiptLabel});
        		
        		form.clientScriptModulePath = './AVRL_DeliveryReceipt_CS.js';
        		
        		var dateField = form.addField({
    	    			id : 'custpage_date',
    	    			type : serverWidget.FieldType.DATE,
    	    			label : dateDeliveryLabel
        			});
        		dateField.isMandatory = true;
        		
        		var timeField = form.addField({
    	    			id : 'custpage_time',
    	    			type : serverWidget.FieldType.TIMEOFDAY,
    	    			label : timeDeliveryLabel
    				});
        		timeField.isMandatory = true;
        		
        		var city = form.addField({
    	                id: 'custpage_city',
    	                type: serverWidget.FieldType.SELECT,
    	                label: cityDeliveryLabel,
    	                source: 'customrecord_enl_cities'
    	            });
        		//city.isMandatory = true;
        		
        		var LatitudeField = form.addField({
    	    			id : 'custpage_latitude',
    	    			type : serverWidget.FieldType.TEXT,
    	    			label : latitudeLabel
    				});
        		LatitudeField.isMandatory = true;
        		
        		var longitudeField = form.addField({
	        			id : 'custpage_longitude',
	        			type : serverWidget.FieldType.TEXT,
	        			label : longitudeLabel
	        		});
        		longitudeField.isMandatory = true;
        		
        		var numberDocumentField = form.addField({
	        			id : 'custpage_documentnumber',
	        			type : serverWidget.FieldType.TEXT,
	        			label : docNumberLabel
	        		});
        		numberDocumentField.maxLength = 20;
        		numberDocumentField.isMandatory = true;
        		
        		var nameField = form.addField({
    	    			id : 'custpage_name',
    	    			type : serverWidget.FieldType.TEXT,
    	    			label : nameLabel
    				});
        		nameField.maxLength = 60;
        		nameField.isMandatory = true;
        		
        		var imageField = form.addField({
    	    			id : 'custpage_image',
    	    			type : serverWidget.FieldType.IMAGE,
    	    			label : imageLabel
    				});
        		imageField.isMandatory = true;
        		
        		var internalIdField = form.addField({
    	    			id : 'custpage_internalid',
    	    			type : serverWidget.FieldType.TEXT,
    	    			label : 'Internal Id'
    				});
        		internalIdField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
        		internalIdField.defaultValue = internalid;
    				
    			var recordTypeField = form.addField({
    					id : 'custpage_recordtype',
    					type : serverWidget.FieldType.TEXT,
    					label : 'Record Type'
    				});
    			recordTypeField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
    			recordTypeField.defaultValue = recordtype;
        		
        		form.addSubmitButton(submitLabel);
        		//form.addSubmitButton('Cancelar');
        		
        		context.response.writePage(form);
			} 
    		catch (e) 
    		{
    			log.debug('ERROR', JSON.stringify(e));
			}
		}
    	else
		{
    		try 
    		{
    			var scriptObj = runtime.getCurrentScript();
//        		log.debug('scriptObj', JSON.stringify(scriptObj)); 
        		
        		var xmlFolder = scriptObj.getParameter({name: 'custscript_avlr_v3_xmlfolder'});
        		var folderId = scriptObj.getParameter({name: 'custscript_avlr_payloadfolder'});
        		
        		var date = context.request.parameters['custpage_date'];
        		var date = format.parse({value: date, type: format.Type.DATE})
        		//log.debug('custpage_date', date);
        		
        		var time = context.request.parameters['custpage_time'];
        		//log.debug('custpage_time', time);
        		
        		var city = context.request.parameters['custpage_city'];
        		//log.debug('custpage_city', city);
        		
        		var latitude = context.request.parameters['custpage_latitude'];
        		latitude = concatenateZeros(latitude)    		
        		//log.debug('custpage_latitude', latitude);
        			
        		var documentnumber = context.request.parameters['custpage_documentnumber'];
        		//log.debug('custpage_documentnumber', documentnumber);
        		
        		var longitude = context.request.parameters['custpage_longitude'];
        		longitude = concatenateZeros(longitude)
        		//log.debug('custpage_longitude', longitude);
        		
        		var name = context.request.parameters['custpage_name'];
        		//log.debug('custpage_name', name);
        		
        		var image = context.request.parameters['custpage_image'];
        		//log.debug('custpage_image', image);
        		
        		var internalid = context.request.parameters['custpage_internalid'];
        		//log.debug('custpage_internalid', internalid);
        		
        		var recordtype = context.request.parameters['custpage_recordtype'];
        		//log.debug('custpage_recordtype', recordtype);
        		
        		if(!internalid || !recordtype)
        			return;
        		
        		var transactionLoad = record.load({type: recordtype, id: internalid, isDynamic: true});
        		
        		var locationId = transactionLoad.getValue('location');
        		if(!locationId)
        			return;
        		
        		var locationLoad = record.load({type: record.Type.LOCATION, id: locationId, isDynamic: true});
        		
        		var deliveryReceiptObj = {};
        		
    	    		deliveryReceiptObj.companyLocation = locationLoad.getValue({fieldId: 'custrecord_enl_fiscalestablishmentid'});
    	    		
    	    		var numLines = transactionLoad.getLineCount({sublistId: 'recmachcustrecord_avlr_cancel_invoice_tran'});
    	    		var sequence = 1;
    	    		
    	    		for (var int = 0; int < numLines; int++) 
    	    		{
    	    			var actionValue = transactionLoad.getSublistValue({
	    	    				sublistId: 'recmachcustrecord_avlr_cancel_invoice_tran',
	    	    				fieldId: 'custrecord_avlr_cancel_invoice_action',
	    	    				line: int
    	    				});
    	    			
    	    			if(actionValue.indexOf('deliveryReceipt') > -1)
    	    				sequence += 1;
					}
    	    		
    	    		deliveryReceiptObj.seq = sequence;
    	    		//deliveryReceiptObj.message = "string"; // maxLength: 1000
    	    		// Data e Hora do Evento
    	    		deliveryReceiptObj.dateTime = new Date();
    	    		
    	    		deliveryReceiptObj.evCENFe = {};
    	    		
    		    		deliveryReceiptObj.evCENFe.eventDescription = "Comprovante de Entrega do NF-e";
    		    		// Número do Protocolo de autorização do CT-e
    		    		//deliveryReceiptObj.evCENFe.nProt = pad(documentnumber, 15);
    		    		 // Data e hora de conclusão da entrega da NF-e
    		    		
    		    		var subsidiaryId = transactionLoad.getValue('subsidiary');
    	        		if(!subsidiaryId)
    	        			return;
    	        		
    	        		var subsidiaryLoad = record.load({type: record.Type.SUBSIDIARY,	id: subsidiaryId, isDynamic: true});
    	        		
    	        		// deliveryDateTime -----------------------------------------------------------------------------------------
    		    		var time = format.parse({value: time, type: format.Type.TIMEOFDAY}).toUTCString();
    		    		//log.debug('custpage_time', time);
    		    		
    	        		var timezone = subsidiaryLoad.getText({fieldId: 'TIMEZONE'}).substr(5,5);
    	        		//log.debug('timezone', timezone);
    	        		
    	        		timezone = (Number(timezone.substr(0,2)) + 4).toString();
    	        		if(timezone.length == 1)
    	        			timezone = '0' + timezone;
    	        		
    	        		timezone = timezone + ':00';
    	        		//log.debug('timezone', timezone);
    	        		
    	    			var operator = subsidiaryLoad.getText({fieldId: 'TIMEZONE'}).substr(4,1);
    	    			var operatorFinal = (operator == '-') ? '+' : '-';
    	    			
    	    			//var timezoneValue = subsidiaryLoad.getValue({fieldId: 'TIMEZONE'});
    		    		//var time = format.parse({value: time, type: format.Type.TIMEOFDAY, timezone: timezoneValue});
    		    		
    	    			time = new Date(time + operatorFinal + timezone).toISOString().substr(0,19) + operator + timezone;
    	    			
    	        		//log.debug('custpage_time', time);
    	        		
    		    		deliveryReceiptObj.evCENFe.deliveryDateTime = date.toISOString().substr(0,11) + time.substr(11); //time;
    	        		// end deliveryDateTime -------------------------------------------------------------------------------------
    		    		
    		    		// Número do Documento de identificação da pessoa que recebeu a entrega
    		    		deliveryReceiptObj.evCENFe.nDoc = pad(documentnumber, 20);
    		    		//  Nome da pessoa que recebeu a entrega
    		    		deliveryReceiptObj.evCENFe.name = name;
    		    		deliveryReceiptObj.evCENFe.latitude = latitude;
    		    		deliveryReceiptObj.evCENFe.longitude = longitude;
    		    		
    		    		var fileObj = file.load({id: image});
    		    		var fileContent = fileObj.getContents();
    		    		
    		    		var base64String = crypto.createHash({algorithm: crypto.HashAlg.SHA1});
    		    		base64String.update({input: fileContent});
    		    		var digestSample = base64String.digest({outputEncoding: encode.Encoding.BASE_64});
    		    		
    		    		deliveryReceiptObj.evCENFe.deliveryReceiptHash = digestSample;
    		    		// Data e hora de geração do hash de entrega
    		    		deliveryReceiptObj.evCENFe.deliveryReceiptHashDateTime = new Date();
    		    		
    		    		//deliveryReceiptObj.evCECTe.deliveryInfo = [];
    		    		
    		    		//var deliveryInfoObj = {}
    		    		
    		    			var accessKey = transactionLoad.getValue({fieldId: 'custbody_enl_accesskey'});
    		    			//deliveryInfoObj.accessKey = accessKey;
    					  
    		    		//deliveryReceiptObj.evCECTe.deliveryInfo.push(deliveryInfoObj);
        		
    	    		
        		log.debug('deliveryReceiptObj', deliveryReceiptObj);
        		
        		var baseURL = getBaseURL(subsidiaryLoad);
        		
        		///v3​/invoices​/goods​/{key}​/deliveryReceipt

    			var url = baseURL + '/v3/invoices/goods/'+ accessKey +'/deliveryReceipt';
    			
    			url = url.substr(0, 8).concat(url.substr(8).replace('//', '/'));
    			log.debug('url', url);
        		
    			var header = getHeaderRequest(subsidiaryId);
    			header['Avalara-Location-Code'] = locationLoad.getValue({fieldId: 'custentity_enl_cnpjcpf'});
    			
    			var response = https.post({ url: url, headers: header, body: JSON.stringify(deliveryReceiptObj) });
    			log.debug('response.code', response.code);
    			
    			var responseObj = JSON.parse(response.body);
    			log.debug('responseBody', responseObj);
				    
				    
    			if(response.code == 200)
    			{
    				//if(response.status && ['101','135'].indexOf(response.status.code) > -1)
					//{
	    				var enventIssueRecord = record.create({type: 'customrecord_cancel_invoice'});
	    				
	    				enventIssueRecord.setValue({
	    					fieldId: 'custrecord_avlr_cancel_invoice_tran',
	    					value: transactionLoad.id
	    				});
	    				
	    				enventIssueRecord.setValue({
	    					fieldId: 'custrecord_avlr_cancel_invoice_action',
	    					value: 'deliveryReceipt_' + sequence
	    				});
	    				
	    				enventIssueRecord.setValue({
	    					fieldId: 'custrecord_avlr_cancel_invoice_motivo',
	    					value: documentnumber
	    				});
	    				
	    				enventIssueRecord.setValue({
	    					fieldId: 'custrecord_avlr_cancel_invoice_date',
	    					value: new Date()
	    				});
	    				
	    				enventIssueRecord.setValue({
	    					fieldId: 'custrecord_avlr_cancel_invoice_retorno',
	    					value: response.body
	    				});
						log.debug('status.code', responseObj.status.code);
						
						if (responseObj.xml && responseObj.xml.base64)
						{
							var xml = encode.convert({ 
								string: responseObj.xml.base64, 
								inputEncoding: encode.Encoding.BASE_64, 
								outputEncoding: encode.Encoding.UTF_8 
							});
							
							if(folderId)
							{
										
								var fileXmlId = file.create({
									name: 'deliveryReceipt_' + transactionLoad.id + '.xml',
									fileType: file.Type.XMLDOC,
									contents: xml,
									folder: folderId,
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
										type: transactionLoad.type,
										id: transactionLoad.id
									}
								});
							}
						}

						enventIssueRecord.setValue({
							fieldId: 'custrecord_avlr_cancel_invoice_xml',
							value: JSON.stringify(xml)
						});
					//}
    				
    			}
    			else
    			{
    				throw response.body
    			}
    	
    			var enventIssueId = enventIssueRecord.save();
    			log.debug('enventIssueId', enventIssueId);
    			   
    			if(folderId && enventIssueId && !isEmptyObj(deliveryReceiptObj))
    			{
    				var requestJsonlId = file.create({
    					name: 'request_' + transactionLoad.id +'_'+ enventIssueId + '.json',
    					fileType: file.Type.JSON,
    					contents: JSON.stringify(deliveryReceiptObj),
    					folder: folderId,
    					encoding: file.Encoding.WINDOWS_1252,
    					isOnline: true
    				}).save();
    				//log.debug('fileXmlId', fileXmlId);
    				
    				record.attach({
    					record: {
    						type: 'file',
    						id: requestJsonlId
    					},
    					to: {
    						type: 'customrecord_cancel_invoice',
    						id: enventIssueId
    					}
    				});
    			}
    			
    			if(folderId && enventIssueId)
				{
    				record.attach({
    					record: {
    						type: 'file',
    						id: image
    					},
    					to: {
    						type: 'customrecord_cancel_invoice',
    						id: enventIssueId
    					}
    				});
				}
    			
        		var html = '<body>'+
    	    					'<script type="text/javascript">'+
    	    						'top.window.location = top.window.location'+
    	    					'</script>'+
        					'<body>';
        		
        		context.response.write({output: html});
			} 
    		catch (e) 
    		{
    			throw e;
			}
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
			
			return _header;
		}
	}
    
    function getBaseURL(subsidiary) 
	{
		var baseURL = subsidiary.getValue({ fieldId: 'custrecord_enl_urlswfiscal' })

		if (!baseURL) 
			throw error.create({name: 'ERROR AvaTAxBR', message: 'SUBSIDIÁRIA - Campo "URL SW FISCAL" não está definido.', notifyOff: false});
		 
		return baseURL;
	}
    
    function removeSpecialCharacter(str) 
	{
		return str.replace(/\W/g,"");
	}
    
    function pad(n, width, z) 
	{
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}
    
    function concatenateZeros(str) 
    {
		var index = str.indexOf('.');
		if(str.substr(index+1).length < 6)
		{
			for (var int2 = 0; str.substr(index+1).length < 6; int2++) 
			{
				str += '0';
			}
		}	
		return str;
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
    
    return {
        onRequest: onRequest
    };
    
});
