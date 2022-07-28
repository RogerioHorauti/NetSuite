/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */

define(['N/currentRecord', 'N/url', 'N/https', 'N/ui/dialog', 'N/search', 'N/runtime'],

function(currentRecord, url, https, dialog, search, runtime) 
{
	
	function geSuitelettUrl() 
	{
		return url.resolveScript({
			scriptId: 'customscript_avlr_v3_invoicestatus_sl',
			deploymentId: 'customdeploy_avlr_v3_invoicestatus_sl',
		});
	}
	
	function processInvoiceStatus() 
	{
		var lang = runtime.getCurrentUser().getPreference ({name: 'LANGUAGE'});
		if(lang == 'pt_BR')
		{
			var msgLabel = 'Aguarde enquanto a operação é realizada';
			var msgTitleLabel = 'Consultando Status';
		}
		else
		{
			var msgLabel = 'Wait while the operation is performed';
			var msgTitleLabel = 'Consulting Status';
		}
		
		var cr = currentRecord.get();
		console.log('processInvoiceStatus  : ' + cr.type + ' ' + cr.id);
		
		var lookUpTransaction = search.lookupFields({
			type: cr.type,
			id: cr.id,
			columns: ['custbody_enl_order_documenttype']
		});
		
		var _documentTypeId = lookUpTransaction.custbody_enl_order_documenttype[0].value;
		var lookUpFiscDocType = search.lookupFields({
			type: 'customrecord_enl_fiscaldocumenttype',
			id: _documentTypeId,
			columns: ['custrecord_enl_fdt_model']
		});
		
		log.debug('Model', lookUpFiscDocType.custrecord_enl_fdt_model)
		
		var output = geSuitelettUrl();
		
		var wait = {}
	      	wait = Ext.Msg.wait(msgLabel, msgTitleLabel, { wait: false })
	      
		https.get.promise({url: output + '&internalid=' + cr.id + '&recordtype=' + cr.type}).then(function (response) 
		{
			console.log(response);
			
			var message = JSON.parse(response.body);
			if(message.status && message.status.code != 100)
			{
				Ext.MessageBox.show({
			        title: message.code,
			        msg: message.error.message,
			        buttons: Ext.MessageBox.OK,
			        icon: Ext.MessageBox.ERROR,
			        fn: function(btn){
			            if(btn == 'ok')
			            {
			            	wait.hide();
			            	location.reload();
			            } 
			            else 
			                return;
			        }
				});
			}
			else // status == 100
			{
				if (lookUpFiscDocType.custrecord_enl_fdt_model == 1) 
					Ext.MessageBox.show({
						title: message.status.code,
						msg: message.status.desc,
						width: 200,
						buttons: Ext.MessageBox.OK,
						icon: Ext.MessageBox.INFO,
						fn: function(btn){
							if(btn == 'ok')
							{
								wait.hide();
								location.reload();
							} 
							else 
								return;
						}
					});
				else
					Ext.MessageBox.show({
						title: message.status.code,
						msg: message.status.desc,
						buttons: Ext.MessageBox.OK,
						icon: Ext.MessageBox.INFO,
						fn: function(btn){
							if(btn == 'ok')
							{
								wait.hide();
								location.reload();
							} 
							else 
								return;
						}
					});
			}
    	})
    	.catch(function onRejected(reason) 
    	{
    		console.log('onRejected reason');
    		console.log(reason);
    		
    		Ext.MessageBox.show({
		        title: 'Erro',
		        msg: reason,
		        buttons: Ext.MessageBox.OK,
		        icon: Ext.MessageBox.ERROR,
		        fn: function(btn){
		            if(btn == 'ok')
		            {
		            	wait.hide();
		            	location.reload();
		            } 
		            else 
		                return;
		        }
			});
        });
	}
	
	function cancelTransaction(model) 
	{
		if(model != 1)
			var msgModel = 'NF-e';
		else
			var msgModel = 'NFS-e';

				
		var lang = runtime.getCurrentUser().getPreference ({name: 'LANGUAGE'});
		if(lang == 'pt_BR')
		{
			var msgLabel = 'Aguarde enquanto a operação é realizada';
			var msgTitleLabel = 'Consultando Status';
			var title = 'Cancelar ' + msgModel;
			var msgPrompt = 'Digite um motivo para o cancelamento:';
			var messageBoxLabel = 'Para cancelar uma '+ msgModel +', é necessário um motivo para cancelamento';
			var messageBoxTitleLabel = 'AVISO';
		}
		else
		{
			var msgLabel = 'Wait while the operation is performed';
			var msgTitleLabel = 'Consulting Status';
			var title = 'Cancel ' + msgModel;
			var msgPrompt = 'Enter a reason for cancellation:';
			var messageBoxLabel = 'To cancel an '+ msgModel +', you need a reason for cancellation.';
			var messageBoxTitleLabel = 'WARNING';
		}
		
    	var msgButton = '';
    	
	    messageBox('ok')
	    
	    function messageBox(msgButton) 
		{
	    	if(msgButton == 'ok')
				Ext.MessageBox.show({
		    		title: title,
		    		msg: msgPrompt,
		    		width: 600,
		    		buttons: Ext.MessageBox.OKCANCEL,
		    		multiline: true,
		    		fn: function (action, message) 
		    		{
		    			if (action === 'ok') 
		    				if (!message) 
		    					Ext.MessageBox.show({
		    				        title: messageBoxTitleLabel,
		    				        msg: messageBoxLabel,
		    				        buttons: Ext.MessageBox.OKCANCEL,
		    				        icon: Ext.MessageBox.WARNING,
		    				        fn: function(btn){
		    				            if(btn == 'ok'){
		    				            	messageBox(btn);
		    				            } else {
		    				                return;
		    				            }
		    				        }
		    					});
							else 
								doRequest('cancel', message, model)
		    		}
		    	});
		}
	}
	
	function correctionLetter(model) 
	{
		var lang = runtime.getCurrentUser().getPreference ({name: 'LANGUAGE'});
		if(lang == 'pt_BR')
		{
			var title = 'Carta de Correção';
			var msgLabel = 'A Carta de Correção é disciplinada pelo parágrafo 1o-A do art. 7o do Convênio S/N, de 15 de dezembro de 1970 e pode ser utilizada para regularização de erro ocorrido na emissão de documento fiscal, desde que o erro nao esteja relacionado com:<br><br>I - as variáveis que determinam o valor do imposto tais como: base de cálculo, alíquota, diferença de preço, quantidade, valor da operação ou da prestação;<br>II - a correção de dados cadastrais que implique mudança do remetente ou do destinatário;<br>III - a data de emissão ou de saída.';
			var msgPrompt = 'Digite um motivo para a carta de correção';
			var messageBoxLabel = 'O motivo precisa ter um tamanho minimo de 15 caracteres.';
			var messageBoxTitleLabel = 'AVISO';
		}
		else
		{
			var title = 'Fix Letter';
			var msgLabel = 'The Letter of Correction is regulated by paragraph 1-A of art. 7 of the Agreement S/N, of December 15, 1970 and can be used to regularize an error occurred in the issuance of a tax document, provided that the error is not related to:<br><br>I - the variables that determine the value of the tax such as: calculation basis, rate, price difference, quantity, value of the operation or provision;<br>II - correction of registration data that implies a change in the sender or recipient;<br>III - a date of issue or exit.';
			var msgPrompt = 'Enter a reason for fix letter:';
			var messageBoxLabel = 'The motif must have a minimum size of 15 characters.';
			var messageBoxTitleLabel = 'WARNING';
		}
		
		messageBox('ok') 
			
		function messageBox(msgButton) 
		{
	    	if(msgButton == 'ok')
				Ext.MessageBox.show({
		    		title: title,
		    		msg: msgLabel,
		    		width: 600,
		    		buttons: Ext.MessageBox.OKCANCEL,
		    		multiline: true,
		    		fn: function (action, message) 
		    		{
		    			if (action === 'ok') 
		    				if (!message || message.length < 15) 
		    				{
		    					if(!message)
		    						var _msg = msgPrompt;
		    					else if(message.length < 15)
		    						var _msg = messageBoxLabel;
		    					
		    					Ext.MessageBox.show({
		    				        title: messageBoxTitleLabel,
		    				        msg: _msg,
		    				        buttons: Ext.MessageBox.OKCANCEL,
		    				        icon: Ext.MessageBox.WARNING,
		    				        fn: function(btn){
		    				            if(btn == 'ok'){
		    				            	messageBox(btn);
		    				            } else {
		    				                return;
		    				            }
		    				        }
		    					});
		    				}
							else 
								doRequest('correctionLetter', message, model)
		    		}
		    	});
	    	
		}
	}
    
	function doRequest(action, message, model) 
	{
	    try 
	    {
	    	var cr = currentRecord.get();
			console.log('processInvoiceStatus  : ' + cr.type + ' ' + cr.id);
			
	    	var title = 'Sucesso'
			var parameters = {
    			custscript_avlr_action: action,
    			custscript_avlr_motivo: message,
    			custscript_avlr_model: model
	    	}
	    	
			var output = geSuitelettUrl();
	    	
	    	if(model != 1)
				var msgModel = 'NF-e';
			else
				var msgModel = 'NFS-e';
	    	
	    	var lang = runtime.getCurrentUser().getPreference ({name: 'LANGUAGE'});
			if(lang == 'pt_BR')
			{
				var msg = 'Cancelar ' + msgModel;
				var title = (action == 'cancel' ? msg : 'Carta de Correção');
				var msgLabel = 'Aguarde enquanto a operação é realizada';
			}
			else
			{
				var msg = 'Cancel ' + msgModel;
				var title = (action == 'cancel' ? msg : 'Fix Letter')
				var msgLabel = 'Wait while the operation is performed';
			}
	    	
	    		
	    	
	    	var wait = {}
	    		wait = Ext.Msg.wait(msgLabel, title, { wait: false })

    		https.post.promise({url: output + '&internalid=' + cr.id + '&recordtype=' + cr.type, body: parameters}).then(function (response) 
			{
    			
    			if(response.code == 200)
				{
    				console.log('code == 200' + response)
    				var message = JSON.parse(response.body);
    				console.log(message);
    				
    				if(message.status && ['101','135'].indexOf(message.status.code) > -1)
    				{
    					console.log('message.status.code == 200' + response)
    					Ext.MessageBox.show({
	    					title: message.status.code,
	    					msg: message.status.desc,
	    					buttons: Ext.MessageBox.OK,
	    					icon: Ext.MessageBox.INFO,
	    					fn: function(btn){
	    						if(btn == 'ok')
	    						{
	    							wait.hide()
	    							location.reload();
	    						} 
	    						else 
	    							return;
	    					}
	    				});
    				}
    				else
					{
    					console.log('message.error' + response)
    					Ext.MessageBox.show({
    						title: message.code,
    						msg: message.body,
    						buttons: Ext.MessageBox.OK,
    						icon: Ext.MessageBox.WARNING,
    						fn: function(btn){
    							if(btn == 'ok')
    								wait.hide();
    							else 
    								return;
    						}
    					});
					}
				}
    			else
				{
    				console.log('code != 200' + response)
    				Ext.MessageBox.show({
    			        title: response.code,
    			        msg: response.body,
    			        buttons: Ext.MessageBox.OK,
    			        icon: Ext.MessageBox.ERROR,
    			        fn: function(btn){
    			            if(btn == 'ok')
    			            	wait.hide();
    			            else 
    			                return;
    			        }
    				});
				}
			})
			.catch(function onRejected(reason) 
			{
				console.log('onRejected reason');
				console.log(reason);
				
				Ext.MessageBox.show({
			        title: 'Erro',
			        msg: reason,
			        buttons: Ext.MessageBox.OK,
			        icon: Ext.MessageBox.ERROR,
			        fn: function(btn){
			            if(btn == 'ok')
			            	wait.hide();
			            else 
			                return;
			        }
				});
	        })
    	} 
    	catch (e) 
    	{
    		console.log(e);
    		
    		Ext.MessageBox.show({
		        title: 'Erro',
		        msg: e,
		        buttons: Ext.MessageBox.OK,
		        icon: Ext.MessageBox.ERROR,
		        fn: function(btn){
		            if(btn == 'ok')
		            	wait.hide()
		            else 
		                return;
		        }
			});
	    }
	}
	
	function deliveryReceipt() 
	{
		var cr = currentRecord.get();
		console.log('deliveryReceipt  : ' + cr.type + ' ' + cr.id);

		var _url = url.resolveScript({
				scriptId: 'customscript_avlr_deliveryreceipt_sl',
				deploymentId: 'customdeploy_avlr_deliveryreceipt_sl',
			});
		
		nlExtOpenWindow(_url + '&internalid=' + cr.id + '&recordtype=' + cr.type, 'Delivery Receipt', 750, 350);
	}
	
	function issueNote() 
	{
		try 
		{
			var _btn = document.getElementById('tbl_custpage_issuenote')
				_btn.style.display = "none";

			//var _btn = document.getElementById('custpage_issuenote')
			var recordType 	= nlapiGetRecordType();
			var internalId 	= nlapiGetRecordId();

			// var _scriptTaskId = nlapiGetContext().getSessionObject(internalId);
			// if(_scriptTaskId)
			// {
			// 	executionStatus() 
			// 	return;
			// }
			// var wait = {}
			// 	wait = Ext.Msg.wait('Aguarde enquanto a operação é realizada', 'Emitir Nota', { wait: false })
			

			var url = nlapiResolveURL('SUITELET', 'customscript_avlr_issuenote_sl', 'customdeploy_avlr_issuenote_sl')
				+ '&internalid=' + internalId + '&recordtype=' + recordType;
			
			var _response = nlapiRequestURL(url, null, null, null, "GET");
			
			if(_response.code == 200)
			{
				console.log('response.code == 200 ' + JSON.stringify(_response))
				//_btn.value = 'Status Execução';
				
				Ext.MessageBox.show({
					title: 'Tarefa enviada com sucesso ' + _response.code,
					msg: _response.body,
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.INFO,
					fn: function(btn){}
				});
			}
			else
			{
				console.log('response.error' + JSON.stringify(_response))
				Ext.MessageBox.show({
					title: _response.code,
					msg: _response.body,
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.WARNING,
					fn: function(btn){}
				});
			}
		} 
		catch (e) 
		{
			console.log('catch.error ' + JSON.stringify(e))
			Ext.MessageBox.show({
				title: e.code,
				msg: JSON.stringify(e.details),
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.ERROR,
				fn: function(btn){}
			});
		}
		
	}

	function executionStatus() 
	{
		var _btn = document.getElementById('custpage_issuenote')
		
		// var recordType 	= nlapiGetRecordType();
		var internalId 	= nlapiGetRecordId();

		// var controlString = nlapiLookupField(recordType, internalId, 'custbody_avlr_randomstring').trim();
		// console.log('ControlString : ' + controlString);

		var _scriptTaskId = nlapiGetContext().getSessionObject(internalId);
		console.log('_scriptTaskId : ' + _scriptTaskId);
		//var resultSet = []
			
		if(_scriptTaskId)
		{
			var filters = [["taskid","contains",_scriptTaskId]];
			
			var scheduledScriptInst = nlapiSearchRecord("scheduledscriptinstance",null,
										filters, 
										[new nlobjSearchColumn("status")]
									);

			for (var i = 0; scheduledScriptInst && i < scheduledScriptInst.length; i++) 
			{
				var nessageStatus = scheduledScriptInst[i].getValue("status");
				Ext.MessageBox.show({
					title: 'Status',
					msg: nessageStatus,
					width: 200,
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.INFO,
					fn: function(btn){	
						//_btn.style.display = "none";
						// _btn.value = scheduledScriptInst[i].getValue("status");
						if(["Complete","Concluído"].indexOf(nessageStatus) > -1)
						{
							//nlapiGetContext().setSessionObject(internalId, '')
							location.reload(); 
						}
					}
				});
				
				// if(nessageStatus == "Complete")
				// 	nlapiGetContext().setSessionObject(internalId, '')	
							
						
				console.log(nessageStatus);
			}
		}
		else
		{
			var lang = nlapiGetContext().getPreference ('LANGUAGE');;
			log.debug('LANGUAGE', lang);
			
			if(lang == 'pt_BR')
				var msg = 'Nenhum processo em execução';
			else
				var msg = 'No processes running';

				Ext.MessageBox.show({
					title: 'Status',
					msg: msg,
					width: 200,
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.INFO,
				});

			//_btn.value = msg;
		}	
	}
	
	return {
    	processInvoiceStatus: processInvoiceStatus,
    	cancelTransaction: cancelTransaction,
    	correctionLetter: correctionLetter,
    	deliveryReceipt: deliveryReceipt,
    	issueNote: issueNote,
		executionStatus: executionStatus
    };
    
});
