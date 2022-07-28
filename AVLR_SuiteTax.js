/**
 *@NApiVersion 2.x
 *@NScriptType taxCalculationPlugin
 *@NModuleScope Public
 */

define([
	'N/runtime', 
	'N/record',
	'./AVLR_SuiteTax_Functions.js', 
	'N/https', 
	'./AVLR_UtilV3.js',
	'./AVLR_FromTo.js'
], 
		
function(runtime, record, AVLRFunctions, https, avlrUtil, fromTo) 
{
		function calculateTax(context) 
		{
			try 
			{
				if(context.input.taxOutputOverridden)
					return;
				
				
				var begin = new Date().getTime();
				var input = context.input ;
				var subsidiaryId = input.subsidiary;
				var subsidiary = record.load({type: record.Type.SUBSIDIARY,	id: subsidiaryId, isDynamic: true});
				
				var getResult = avlrUtil.getHeaderRequest(subsidiary);
//				log.debug('getResult', JSON.stringify(getResult));
				
				var preview = context.input.preview;
//				log.debug('preview', preview);
				
				var postingTransaction = input.postingTransaction;
				log.debug('postingTransaction', postingTransaction);
				
				if(preview)
					run(context, subsidiary, getResult);
				else
					run(context, subsidiary, getResult);
				
				log.audit('Duration in minuts', avlrUtil.millisToMinutesAndSeconds(new Date().getTime() - begin));
				var scriptObj = runtime.getCurrentScript();
				log.debug('Remaining governance units', scriptObj.getRemainingUsage());
			} 
			catch (e) 
			{
				log.debug('ERROR', JSON.stringify(e));
				
				if(!getResult)
				{
					var taxCodes = AVLRFunctions.getTaxCodes();
					//log.debug('AVLRFunctions.getTaxCodes', JSON.stringify(taxCodes));
					var _index = taxCodes.map(function(e) {return e.taxAvataxBr == "";}).indexOf(true); // ERRO DE CALCULO
				}
				else
				{
					//log.debug('getResult.taxCodes', JSON.stringify(getResult.taxCodes));
					var _index = getResult.taxCodes.map(function(e) {return e.taxAvataxBr == "";}).indexOf(true); // ERRO DE CALCULO
					var taxCodes = getResult.taxCodes;
				}
				
				//log.debug('_index', _index);
				
				if(_index != -1)
				{
					var inputLines = context.input.lines;
					for (var inputLineIndex = 0; inputLineIndex < inputLines.length; inputLineIndex++) 
					{
	//					log.debug('inputLineIndex', inputLineIndex);
						var line = inputLines[inputLineIndex];
						var lineReference = line.reference;
	//					log.debug('lineReference', lineReference);
						
						var taxesForLine = context.output.createLine({lineReference: lineReference});
						//log.debug('add_details', JSON.stringify(taxesForLine));
						
						taxesForLine.addTaxDetail({
							taxCode: taxCodes[_index].taxcode,
							taxationType: taxCodes[_index].taxType,
							taxRate: 0,
							taxAmount: 0,
							taxBasis: 0,
							taxCalculationDetail: JSON.stringify(e.message)
						});
						
						
						context.output.addLine(taxesForLine);
					}
				
				
					context.output.setTaxSummaryLine({
						taxCode: taxCodes[_index].taxcode,
						taxationType: taxCodes[_index].taxType,
						taxAmount: 0
					});
				}
				else
					log.debug('ERROR-Calculations', 'AVLR - Tax Mapping "ERRO de Cálculo" não definido.');
				
				context.notifications.addWarning("MENSAGEM NETSUITE : "+e);
			}
		
		}
		
		function onTransactionEvent(context) 
		{
			log.debug('context.event', context.event);
			var event = context.event.code;
			if (event == 'void') // transaction was voided
			{
			
			}
			else if (event == 'delete') // transaction was deleted
			{
			
			}
		}
		
		function run(context, subsidiary, getResult) 
		{
			var lang = runtime.getCurrentUser().getPreference ({name: 'LANGUAGE'});;
			//log.debug('LANGUAGE', lang);
			
			var sessionObj = runtime.getCurrentSession();
			var _legacyPlugn = subsidiary.getValue({fieldId: 'custrecord_avlr_legacyplugin'});
			var totalTaxInNetAmount = 0;
			var totalTaxIncluded = 0;
			var totalWithholdind = 0;

			var txt1 = '';
			var txt2 = '';
			var txt3 = '';

			//log.debug('start');
			var input = context.input ;
			//log.debug('input', context);
			
			var transID = input.transactionId;
			//log.debug('transID', transID);
			var transType = input.recordType;
			log.debug('Transaction', 'transType : ' + transType + ', transID : ' + transID);
			
			var baseURL = avlrUtil.getBaseURL(subsidiary);
			var url = baseURL + '/v3/calculations';
			url = url.substr(0, 8).concat(url.substr(8).replace('//', '/'));
			log.debug('url', url);
			
			var request = AVLRFunctions.getJsonRequest(input, subsidiary);
			log.debug('request', request);
			
			var _randomString = input.getAdditionalFieldValue('custbody_avlr_randomstring');
			sessionObj.set({name: 'calcrequest'+_randomString, value: JSON.stringify(request)});
			
			var response = https.post({ url: url, headers: getResult.header, body: JSON.stringify(request) });
			log.debug('response.code', response.code);
			
			log.debug('response', response.body);
			var codeResponse = response.code;

			
			if(codeResponse != 200)
				context.notifications.addWarning(response.body);  // throw Error('ERROR-Calculations' + response.body)

			if(codeResponse == 200)
				sessionObj.set({name: 'calcresponse'+_randomString ,value: response.body});
			
			response = JSON.parse(response.body);
			
			var inputLines = context.input.lines;
			log.debug('inputLines', inputLines);
			
			var _taxCodes = getResult.taxCodes;
			log.debug('_taxCodes', _taxCodes);
			
			var arrayTaxDetails = [];
			for (var inputLineIndex = 0; inputLineIndex < inputLines.length; inputLineIndex++) 
			{
				var line = inputLines[inputLineIndex];
				var lineReference = line.reference;
				var taxesForLine;

				if(!_legacyPlugn) // SuiteTax
				{
					log.debug('inputLineIndex', inputLineIndex);
					log.debug('lineReference', lineReference);
					taxesForLine = context.output.createLine({lineReference: lineReference});
					log.debug('add_details', JSON.stringify(taxesForLine));
				}

				
				if(codeResponse != 200)
				{
					var _message = AVLRFunctions.getMessageError(response, inputLineIndex) 
					
					var _indexError = _taxCodes.map(function(e) {return e.taxAvataxBr == "";}).indexOf(true);
											
					if(_indexError != -1)
					{
						// log.debug('avlrUtil.isEmptyObj(taxesForLine)', avlrUtil.isEmptyObj(taxesForLine));
						if(!taxesForLine)
							taxesForLine = context.output.createLine({lineReference: lineReference});
						
						//log.debug('add_details', JSON.stringify(taxesForLine));
						
						taxesForLine.addTaxDetail({
							taxCode: _taxCodes[_indexError].taxcode,
							taxationType: _taxCodes[_indexError].taxType,
							taxRate: 0,
							taxAmount: 0,
							taxBasis: 0,
							taxCalculationDetail: _message
						});
						
					}
					else
						log.debug('ERROR-Calculations', 'AVLR - Tax Mapping "ERRO de Cálculo" não definido.');
				}
				else
				{
					var taxDetails = response.lines[inputLineIndex].taxDetails;
					var cfop = response.lines[inputLineIndex].cfop;
					
					for (var int = 0; int < taxDetails.length; int++) 
					{
//						log.debug('taxDetails'+[int], JSON.stringify(taxDetails[int]));
						
						var _accountingId = fromTo.getAccounting(taxDetails[int].taxImpact.accounting);
						var _taxType = taxDetails[int].taxType.toLowerCase();
//						log.debug('_taxType', _taxType);
						
						if(cfop < 3000 || cfop > 3999)
						{
							if(_accountingId == 3) // none
							{
								// ipi, icmsstsd, ipireturned, icmsst
								var _taxSubType = fromTo.getTaxSubType(_taxType, taxDetails[int].taxImpact.impactOnNetAmount); 
								if(!_taxSubType)
									continue;
								else
									_taxType = _taxSubType.toLowerCase();
							}
						}
						
						var rate = taxDetails[int].rate;

						if(!_legacyPlugn) // SuiteTax
						{
							_index = _taxCodes.map(function(e) {return e.name.toLowerCase() == _taxType;}).indexOf(true);
							
							if(_index != -1)
							{
								taxesForLine.addTaxDetail({
									taxCode: _taxCodes[_index].taxcode,
									taxationType: _taxCodes[_index].taxType,
									taxRate: taxDetails[int].rate, // rate
									taxAmount: taxDetails[int].tax, // tax
									taxBasis: taxDetails[int].subtotalTaxable, // subtotalTaxebal
									taxCalculationDetail: _taxCodes[_index].name
								});
							}
							else
								log.debug('ERROR-Calculations', 'AVLR - Tax Mapping "'+ _taxType +'" não definido.');
						}
						else // Legacy PlugIn
						{
							// var rate = taxDetails[int].rate;
							if(rate > 0)
							{
								_index = _taxCodes.map(function(e) {return e.name.toLowerCase() == _taxType;}).indexOf(true);
								
								if(_index != -1)
								{
									if(_taxCodes[_index].doesnotaddtototal) // "Total - Retenção"
									{
										totalWithholdind += taxDetails[int].tax;

										if(txt2.indexOf(_taxType) == -1)
											txt2 += _taxType + ' ';
									}	
									
									if(_taxCodes[_index].taxinnetamount) // "Total - Imposto incluído no valor líquido"
									{
										totalTaxInNetAmount += taxDetails[int].tax;

										if(txt1.indexOf(_taxType) == -1)
											txt1 += _taxType + ' ';
									}
									
									if(!_taxCodes[_index].taxinnetamount && !_taxCodes[_index].doesnotaddtototal) // "Total - Impostos Inclusos"
									{
										totalTaxIncluded += taxDetails[int].tax;

										if(txt3.indexOf(_taxType) == -1)
											txt3 += _taxType + ' ';
									}
							
								}	
							}
						}// Legacy PlugIn
					}// end for taxDetails	
				}// codeResponse
				
				if(!_legacyPlugn || codeResponse != 200) // Erro
				{
					//log.debug('add_details_after', JSON.stringify(taxesForLine));
					context.output.addLine(taxesForLine);
					arrayTaxDetails = arrayTaxDetails.concat(taxesForLine.taxDetails)
				}

			}// end for
			
			if(_legacyPlugn && codeResponse == 200)
			{
				for (var i1 = 0; i1 < inputLines.length; i1++) 
				{
					log.debug('legacyPlugn - inputLineIndex', inputLineIndex);
					var line = inputLines[i1];
					var lineReference = line.reference;
					log.debug('legacyPlugn - lineReference', lineReference);

					
					var taxesForLine = context.output.createLine({lineReference: lineReference});
					log.debug('legacyPlugn - add_details', JSON.stringify(taxesForLine));
					//for (var i1 = 0; i1 < inputLines.length; i1++) 
					//{

					if(i1 == 0 && (totalTaxInNetAmount || totalWithholdind || totalTaxIncluded)) // line summary
					{
						var _index3 = _taxCodes.map(function(e) {return e.taxAvataxBr == "Total - Imposto incluído no valor líquido";}).indexOf(true);
						log.debug('Total - Imposto incluído no valor líquido', totalTaxInNetAmount)
						log.debug('Total - Imposto incluído no valor líquido', txt1)
						if(_index3 != -1 && totalTaxInNetAmount)
						{
							log.debug('totalTaxInNetAmount', _taxCodes[_index3])

							taxesForLine.addTaxDetail({
								taxCode: _taxCodes[_index3].taxcode,
								taxationType: _taxCodes[_index3].taxType,
								taxRate: 0,
								taxAmount: totalTaxInNetAmount,
								taxBasis: 0,
								taxCalculationDetail: txt1
							});
						}
		
						var _index1 = _taxCodes.map(function(e) {return e.taxAvataxBr == "Total - Retenção";}).indexOf(true);
						log.debug('Total - Retenção', totalWithholdind)
						log.debug('Total - Retenção', txt2)
						if(_index1 != -1 && totalWithholdind)
						{
							log.debug('totalWithholdind', _taxCodes[_index1])

							taxesForLine.addTaxDetail({
								taxCode: _taxCodes[_index1].taxcode,
								taxationType: _taxCodes[_index1].taxType,
								taxRate: 0,
								taxAmount: totalWithholdind,
								taxBasis: 0,
								taxCalculationDetail: txt2
							});
						}
		
						var _index2 = _taxCodes.map(function(e) {return e.taxAvataxBr == "Total - Impostos Inclusos";}).indexOf(true);
						log.debug('Total - Impostos Inclusos', totalTaxIncluded)
						log.debug('Total - Impostos Inclusos', txt3)
						if(_index2 != -1 && totalTaxIncluded)
						{
							log.debug('totalTaxIncluded', _taxCodes[_index2])

							taxesForLine.addTaxDetail({
								taxCode: _taxCodes[_index2].taxcode,
								taxationType: _taxCodes[_index2].taxType,
								taxRate: 0,
								taxAmount: totalTaxIncluded,
								taxBasis: 0,
								taxCalculationDetail: txt3
							});
						}
					}
					else if(!totalTaxInNetAmount && !totalWithholdind && !totalTaxIncluded)// line summary
					{

						var _indexVazio = _taxCodes.map(function(e) {return e.taxAvataxBr == "_";}).indexOf(true);
											
						if(_indexVazio != -1)
						{
							log.debug('_', _taxCodes[_indexVazio])

							taxesForLine.addTaxDetail({
								taxCode: _taxCodes[_indexVazio].taxcode,
								taxationType: _taxCodes[_indexVazio].taxType,
								taxRate: 0,
								taxAmount: 0,
								taxBasis: 0,
								//taxCalculationDetail: _message
							});
						}
						else
							log.debug('ERROR-Calculations', 'AVLR - Tax Mapping "_" não definido.');
					}

					//log.debug('add_details_after', JSON.stringify(taxesForLine));
					context.output.addLine(taxesForLine);
					arrayTaxDetails = arrayTaxDetails.concat(taxesForLine.taxDetails)
					//return;
				} // inputLines end
			}



			if(codeResponse == 200)
			{
				log.debug('taxDetails', JSON.stringify(arrayTaxDetails));
				var summaryTaxCodes = [];
				
				for (var int1 = 0; int1 < arrayTaxDetails.length; int1++) 
				{
					var _index = summaryTaxCodes.map(function(e) {return e.taxCode == arrayTaxDetails[int1].taxCode}).indexOf(true);
					if(_index == -1)
					{
						var objTaxCode = {};
							objTaxCode.taxationType = arrayTaxDetails[int1].taxationType;
							objTaxCode.taxCode = arrayTaxDetails[int1].taxCode
							objTaxCode.taxAmount = Number(arrayTaxDetails[int1].taxAmount)
							
						summaryTaxCodes.push(objTaxCode);
					}
					else
					{
						summaryTaxCodes[_index].taxAmount = summaryTaxCodes[_index].taxAmount + Number(arrayTaxDetails[int1].taxAmount);
					}
				}
				log.debug('summaryTaxCodes', JSON.stringify(summaryTaxCodes));
				
				for (var int2 = 0; int2 < summaryTaxCodes.length; int2++) 
				{
					context.output.setTaxSummaryLine({
						taxCode: summaryTaxCodes[int2].taxCode,
						taxationType: summaryTaxCodes[int2].taxationType,
						taxAmount: avlrUtil.doRound(summaryTaxCodes[int2].taxAmount)
					});
				}
						
				if(lang == 'pt_BR')
					var _message = 'Impostos calculados com sucesso.'
				else
					var _message = 'Taxes calculated successfully.'
					
				context.notifications.addNotice(_message);
			}
			else
			{
				if(_indexError && _indexError != -1)
				{
					context.output.setTaxSummaryLine({
						taxCode: _taxCodes[_indexError].taxcode,
						taxationType: _taxCodes[_indexError].taxType,
						taxAmount: 0
					});
				}
			}

			
		}
		
		function defineAdditionalFields(context) 
		{
			context.addField({fieldId: 'trandate'});
			context.addField({fieldId: 'type'});
			context.addField({fieldId: 'ntype'});
			context.addField({fieldId: 'exchangerate'});
			context.addField({fieldId: 'custbody_enl_operationtypeid'});
			context.addField({fieldId: 'custbody_enl_order_documenttype'});
			context.addField({fieldId: 'custbody_enl_deliverylocation'});
			context.addField({fieldId: 'custbody_enl_pickuplocation'});
			context.addField({fieldId: 'custbody_enl_hascpom'});
			context.addField({fieldId: 'custbody_enl_customissrate'});
			context.addField({fieldId: 'custbody_enl_customicmsrate'});
			context.addField({fieldId: 'custbody_alvr_constrution_site'});
			context.addField({fieldId: 'custbody_avlr_randomstring'});
			
			//goods
			context.addSublistField({sublistId: 'item',	fieldId: 'description'});
			context.addSublistField({sublistId: 'item',	fieldId: 'quantity'});
			context.addSublistField({sublistId: 'item',	fieldId: 'rate'});
			context.addSublistField({sublistId: 'item',	fieldId: 'amount'});
			context.addSublistField({sublistId: 'item',	fieldId: 'itemtype'});
			//context.addSublistField({sublistId: 'item',	fieldId: 'inventorydetail'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_enl_discamount'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_enl_line_freightamount'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_enl_line_insuranceamount'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_enl_line_othersamount'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_enl_externalorder'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_eur_externallinenum'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_avlr_supplier_situation'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_avlr_untaxedothercostamount'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_avlr_partnerstsubstitute'});
			
			//service
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_enl_line_issdeduction'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_enl_line_inssdeduction'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_enl_line_irdeduction'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_avlr_publicyagency_deduction'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_enl_ref_chaveacesso'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_avlr_purposeofuse'});
			context.addSublistField({sublistId: 'item',	fieldId: 'custcol_avlr_itempurchasecost'});
		}	
		return {
			calculateTax: calculateTax,
			defineAdditionalFields: defineAdditionalFields,
			onTransactionEvent: onTransactionEvent
		}
	}
)