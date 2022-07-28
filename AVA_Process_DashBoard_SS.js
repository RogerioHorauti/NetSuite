/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/error', 'N/runtime', 'N/record', 'N/task', './AVA_eInvoice_Lib.js', './AVLR_FetchStatus_Lib.js', 'N/search'],
		
/**
 * @param {error} error
 * @param {record} record
 */
function(error, runtime, record, task, eInvoiceLib, fetchStatus, search) 
{
    function execute(context) 
    {
		try 
		{
			var begin = new Date().getTime();
			var scriptObj = runtime.getCurrentScript();
			
			var _internalId = scriptObj.getParameter({name: 'custscript_avlr_internalid_ss'});
			if(_internalId)
			{
				var _internalIdObj = JSON.parse(_internalId);
				log.debug(_internalIdObj.id + " BEGIN", "_____________BEGIN_______________");
				//log.debug(_internalIdObj.id + " begin", new Date().toISOString());
				var recordObj = record.create({type: 'customrecord_ava_einvoice_dashboard'});
				
					var _userId = scriptObj.getParameter({name: 'custscript_avlr_userid_ss'});
					if(_userId && _userId != -4)
						recordObj.setValue({fieldId: "custrecord_ava_user", value: _userId});

					recordObj.setValue({fieldId: "custrecord_ava_selected_records", value: JSON.stringify([_internalIdObj]) });
					recordObj.setValue({fieldId: "custrecord_record_status", value: 1 }); // To be Processed
					recordObj.setValue({fieldId: "custrecord_avlr_scriptdeployment", value: JSON.stringify(scriptObj) });

				var recordObjId = null;
				recordObjId = recordObj.save();
				//log.debug(_internalIdObj.id + " end", new Date().toISOString());
				log.debug({'title': _internalIdObj.id + ' customrecord_ava_einvoice_dashboard', 'details': 'id : ' + recordObjId});
			
			
				var scriptStatus = eInvoiceLib.getStatusScript(); // Fetch deployments in execution
				log.debug(_internalIdObj.id + " scriptStatus : " + scriptStatus.length, scriptStatus);
//				var _exit = true;
				var _eInvoiceDashBoard = [];
				
				var i2 = 0;

				do 
				{
					if(i2>0)
						eInvoiceLib.sleep(500) 
					
					i2++;
					_eInvoiceDashBoard = eInvoiceLib.fetchAVAeInvoiceDashBoard()
				}
				while (!(scriptStatus.length <= _eInvoiceDashBoard.length) && (i2<10))
				log.debug(_internalIdObj.id + " Tetativas : " + i2 + " _eInvoiceDashBoard : " + _eInvoiceDashBoard.length, JSON.stringify(_eInvoiceDashBoard));
					
				
				if(i2>=10)	
				{
					throw 'Excedeu o limit.';
				}
				

				for (var i4 = 0; i4 < _eInvoiceDashBoard.length; i4++) 
				{
					var _letDeploymentId = JSON.parse(_eInvoiceDashBoard[i4].getValue("custrecord_avlr_scriptdeployment"))

					if(scriptObj.deploymentId == _letDeploymentId.deploymentId || 
							_letDeploymentId.id == "customscript_ava_process_requests")
					{
						if(i4 == 0)
							break;
						else
							continue;
					}

					var _selectedRecords = _eInvoiceDashBoard[i4].getValue("custrecord_ava_selected_records")
					//log.debug("_selectedRecords", _selectedRecords);
					
					if(_selectedRecords)
					{
						var _selectedRecordsArr = JSON.parse(_selectedRecords);
						
						var _index = _selectedRecordsArr.map(function(e){return e.id == _internalIdObj.id}).indexOf(true);
						if(_index > -1)
						{
							var _values = {};
							_values['custrecord_ava_selected_records'] = JSON.stringify([]);
							_values['custrecord_record_status'] = 3 // Completed
							
							var _einvoiceDashboardId = record.submitFields({
									type: 'customrecord_ava_einvoice_dashboard',
									id: recordObjId,
									values: _values
								});
		
							log.debug(_internalIdObj.recordType + " " + _internalIdObj.id, "Ja em execucao pelo deploy : " + _letDeploymentId.deploymentId + ", _einvoiceDashboardId : " + _einvoiceDashboardId);
							log.debug(_internalIdObj.id + " END", "_____________END______________");
							
							return;
						}
					}	
					
				}// end for _eInvoiceDashBoard


				
				
				
				
	
				var _LookUpTransaction = search.lookupFields({
					type: _internalIdObj.recordType,
					id: _internalIdObj.id,
					columns: ['custbody_enl_fiscaldocnumber', 'custbody_enl_order_documenttype']
				});
				
				log.debug(_internalIdObj.id + " _LookUpTransaction", _LookUpTransaction);

				var _sequenceNumber = null;
				var _values1 = {}

				do 
				{
					try 
					{
						if(!_LookUpTransaction.custbody_enl_fiscaldocnumber)
						{
							var _fiscalDocTypeId = _LookUpTransaction.custbody_enl_order_documenttype[0].value;
							
							var _fiscalDocTypeLoad = record.load({type: 'customrecord_enl_fiscaldocumenttype', id: _fiscalDocTypeId});
							_sequenceNumber = _fiscalDocTypeLoad.getValue('custrecord_avlr_sequencenumber');
							if(_sequenceNumber)
							{
								_values1['custbody_enl_fiscaldocnumber'] =  eInvoiceLib.pad((_sequenceNumber+1), 9);
							}
							else
							{
								var _fiscalDocNo = eInvoiceLib.getFiscalDocumentNumber(_fiscalDocTypeId);
								_values1['custbody_enl_fiscaldocnumber'] =  _fiscalDocNo;
							}
						}
	
						// log.debug('values', _values1);

						if(!eInvoiceLib.isEmptyObj(_values1))
						{
							var _tranObjId = record.submitFields({
									type: _internalIdObj.recordType,
									id: _internalIdObj.id,
									values: _values1
								});
								
							if(_values1['custbody_enl_fiscaldocnumber'])
							{
								_fiscalDocTypeLoad.setValue({fieldId: 'custrecord_avlr_sequencenumber', value: _values1['custbody_enl_fiscaldocnumber']});

								//log.debug('Transaction : ' + _tranObjId,  'Generate Fiscal Document Number : ' + _values1['custbody_enl_fiscaldocnumber']);

								if(_tranObjId)
								{
									var _fiscalDocumentTypeId = _fiscalDocTypeLoad.save();
									// log.debug('_fiscalDocTypeLoad save', _fiscalDocumentTypeId);
								}
							}	
							else
							{
								var _fiscalDocumentTypeId = true;
								// log.debug('Transaction', _tranObjId);
							}	
						}
						else
						{
							var _fiscalDocumentTypeId = true;
						}
					} 
					catch (e) 
					{
						if(e.name && (e.name == "CUSTOM_RECORD_COLLISION" || e.name == "RCRD_HAS_BEEN_CHANGED")) // ENABLE OPTIMISTIC LOCKING
						{
							var _fiscalDocumentTypeId = false;
						}
						else
						{
							log.debug(_internalIdObj.id + ' Generate Sequence Number - Error', JSON.stringify(e));
							
							var _valuesError = {
								'custbody_enl_messagespl': "MENSAGEM NETSUITE : "+JSON.stringify(e),
								'custbody_enl_fiscaldocstatus': 7 // Error
							}

							if(!_sequenceNumber && !_fiscalDocumentTypeId)
								_valuesError['custbody_enl_fiscaldocnumber'] = '';

							try 
							{
								var tranObjId = record.submitFields({
									type: _internalIdObj.recordType,
									id: _internalIdObj.id,
									values: _valuesError
								});
							}
							catch (error1) {}
							
							return;
						}

					}
				} 
				while (!_fiscalDocumentTypeId);

				if(_fiscalDocumentTypeId)
				{
					if(_LookUpTransaction.custbody_enl_fiscaldocnumber)
						log.debug('Transaction : ' + _internalIdObj.id,  'Fiscal Document Number : ' + _LookUpTransaction.custbody_enl_fiscaldocnumber);
					else
						log.debug('Transaction : ' + _internalIdObj.id,  'Generate Fiscal Document Number : ' + _values1['custbody_enl_fiscaldocnumber']);
				}

				eInvoiceLib.createJSONFile(null, _internalIdObj.id);
			}
			
			log.audit(_internalIdObj.id + ' Duration', 'Total Time : ' + eInvoiceLib.millisToMinutesAndSeconds(new Date().getTime() - begin) + ' (internalid ' + _internalIdObj.id + ')');
			
			var _einvoiceDashboardId = record.submitFields({
				type: 'customrecord_ava_einvoice_dashboard',
				id: recordObjId,
				values: {
					'custrecord_record_status': 3 // Completed
				}
			});

			log.debug(_internalIdObj.id + " _einvoiceDashboardId", "Completed : " + _einvoiceDashboardId);

			
			
			remainingUsage = scriptObj.getRemainingUsage();
			log.audit(_internalIdObj.id + ' Remaining governance units: ', remainingUsage);
					
			log.debug("END", "_____________END______________");
		} 
		catch (error) 
		{
			log.debug(_internalIdObj.id + ' ERROR', JSON.stringify(error));

			var _valuesError = {
				'custbody_enl_messagespl': "MENSAGEM NETSUITE : "+JSON.stringify(error),
				'custbody_enl_fiscaldocstatus': 7 // Error
			}

			try 
			{
				var tranObjId = record.submitFields({
					type: _internalIdObj.recordType,
					id: _internalIdObj.id,
					values: _valuesError
				});
			}
			catch (error1) {}

			if(recordObjId)
			{
				var _einvoiceDashboardId = record.submitFields({
						type: 'customrecord_ava_einvoice_dashboard',
						id: recordObjId,
						values: {
							'custrecord_record_status': 4 // Error
						}
					});
				
				log.debug(_internalIdObj.id + " _einvoiceDashboardId", "Error : " + _einvoiceDashboardId);
			}
		}
    }

    return {
        execute: execute
    };
    
});
