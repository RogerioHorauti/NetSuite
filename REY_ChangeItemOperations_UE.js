/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/ui/message', 'N/runtime', 'N/format', 'N/search', 'N/ui/serverWidget', 'N/https', 'N/url'],
    /**
   * @param{currentRecord} currentRecord
   * @param{query} query
   */
    (record, message, runtime, format, search, serverWidget, https, url) => {
        const AIR_CONTRACT = {
            RECORD_TYPE: 'customrecord_rey_conc_contract',
            SUBLIST_CONTRACT_LINE: 'recmachcustrecord_rey_conl_contractline_ms',

        }

        const AIR_CONTRACT_LINE = {
            RECORD_TYPE: 'customrecord_rey_conl_contractline',
            ID: 'id',
            FINAL_SERVICE_VALUE: 'custrecord_rey_valor_serv_final_cu',
            SUBLIST_HISTORY: 'recmachcustrecord_air_hist_item_ls',
            SUBLIST_HIST_ITEM: 'custrecord_air_hist_item_ls',
            SUBLIST_HIST_OLD_READJUSTMENT: 'custrecord_air_hist_oldreadjust_cr',
            SUBLIST_HIST_NEW_READJUSTMENT: 'custrecord_air_hist_newreadjust_cr',

        }

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        function beforeLoad(scriptContext)
        {
            let _form = scriptContext.form;
            let _rec = scriptContext.newRecord;
            const form = scriptContext.form;
            try 
            {
                log.debug('beforeLoad - begin', '-----------------------------------------------------------------')
                if (scriptContext.type == 'view') 
                {
                    form.addButton({
                        id: "custpage_makecopy",
                        label: 'Fazer Cópia',
                        functionName: `makeCopy(${_rec.id})`
                    });

                    form.clientScriptModulePath = "./REY_ContractFillFieldsAutomatically_CL";

                    let messageReadjustment = _rec.getValue('custrecord_rey_concl_checkreadjust_cb')
                    let messageError = _rec.getValue('custrecord_rey_concl_messageerror_cb')
                    let messageErrorAfetrSubmit = _rec.getValue('custrecord_rey_concl_messageerror_as_cb')

                    if(messageReadjustment)
                    {
                        _form.addPageInitMessage({
                            type: message.Type.CONFIRMATION,
                            title: messageReadjustment,
                            message: ''
                        })

                        record.submitFields({
                            type: _rec.type,
                            id: _rec.id,
                            values: {
                                custrecord_rey_concl_checkreadjust_cb: ''
                            },
                        })
                    }
                    else if(messageError)
                    {
                        _form.addPageInitMessage({
                            type: message.Type.ERROR,
                            title: 'ERROR Before Load',
                            message: messageError
                        })

                        record.submitFields({
                            type: _rec.type,
                            id: _rec.id,
                            values: {
                                custrecord_rey_concl_messageerror_cb: ''
                            },
                        })
                    }
                    else if(messageErrorAfetrSubmit)
                    {
                        _form.addPageInitMessage({
                            type: message.Type.ERROR,
                            title: 'ERROR After Submit',
                            message: messageErrorAfetrSubmit
                        })

                        record.submitFields({
                            type: _rec.type,
                            id: _rec.id,
                            values: {
                                custrecord_rey_concl_messageerror_as_cb: ''
                            },
                        })
                    }

                    let _vigenceList = []
                    let _inactiveRenew = false

                    search.create({
                        type: "customrecord_rey_concf_aircontractconfig",
                        columns: ["custrecord_rey_concf_inactiverenew_cb"]
                    }).run().each(function(result){
                        _inactiveRenew = result.getValue('custrecord_rey_concf_inactiverenew_cb')
                    });

                    log.debug('_inactiveRenew', _inactiveRenew)

                    search.create({
                        type: "customrecord_air_recurrency_rc",
                        filters: [["custrecord_air_vigence_rc_ls","anyof",_rec.id]],
                        columns: ["custrecord_air_enddate_rc_dt"]
                    }).run().each(function(result){
                        _vigenceList.push(result)
                        return true;
                    });
                    
                    // log.debug({ title: "beforeLoad _vigenceCount", details: _vigenceList.length });
                    if(!_vigenceList.length)
                        return

                   let _endDateVigenceText = _vigenceList[_vigenceList.length-1].getValue("custrecord_air_enddate_rc_dt")
                   let _endDateVigence = format.parse({value: _endDateVigenceText, type: format.Type.DATE})
                   log.debug({ title: "beforeLoad - DATA DE TERMINO DA VIGÊNCIA", details: _endDateVigence });
                   

                    //Hoje [TESTE]
                    let _nowDate = _rec.getValue({fieldId: 'custrecord_rey_conc_nowdate_dt'})
                    if(!_nowDate)
                        _nowDate = new Date()

                     //DATA DE TERMINO DE VIGÊNCIA DO CONTRATO
                    let _endDateContract = _rec.getValue({fieldId: 'custrecord_rey_conc_datevenc_dt'})
                    // DATA DO PRÓXIMO REAJUSTE
                    // let _dateNextReajustment = _rec.getValue({fieldId: 'custrecord_rey_conc_readjustmentdate_dt'})
                    // log.debug({ title: "beforeLoad - _dateNextReajustment", details: _dateNextReajustment });
                    let _status = _rec.getValue({fieldId: 'custrecordrey_conc_status_ms'})

                    let _renewContractId = _rec.getValue({fieldId: 'custrecord_rey_conc_renewcontractid_ls'})//Renovação
                    // DATA DE REAJUSTE DO CONTRATO
                    let _readjustmentDate1 = _rec.getValue({fieldId: 'custrecord_rey_conc_readjustmentdate_dt'})
                    // let _readjustmentDate1Text = format.format({value: _readjustmentDate1, type: format.Type.DATE})
                    // log.debug({ title: "beforeLoad - DATA DE REAJUSTE DO CONTRATO", details: _readjustmentDate1Text })
                    log.debug({ title: "beforeLoad - Reajustar", details: (_readjustmentDate1 < _endDateVigence) });
                    log.debug({ title: "beforeLoad - Reajustar 2", details:  (_status == 1 && !_renewContractId && _readjustmentDate1 && _nowDate > _readjustmentDate1 && _readjustmentDate1 < _endDateVigence)});

                    if(!_inactiveRenew && _status == 1 && !_renewContractId && _endDateContract && _nowDate > _endDateContract)
                    {
                        form.addButton({
                            id: "custpage_renew",
                            label: 'Renovar',
                            functionName: `renew(${_rec.id})`
                        });
                    }
                    else if(_status == 1 && !_renewContractId && _readjustmentDate1 && _nowDate > _readjustmentDate1 && _readjustmentDate1 < _endDateVigence)
                    {
                        form.addButton({
                            id: "custpage_calculateportion_everylines",
                            label: "Reajustar",
                            functionName: `calculateTotalAmount(${_rec.id})`
                        })
                    }
                    
                }
                else if(scriptContext.type != 'view')
                {
                    log.debug('type', scriptContext.type)
                    
                    //CONTRATO PAI
                    // let _parentContract = _rec.getValue({fieldId: 'custrecord_rey_conc_parentcontract_ls'})
                    // TIPO CONTRATO 
                    // let _contractType = _rec.getValue({fieldId: 'custrecord_rey_conc_tipocontrato_ms'})

                    // if(_parentContract)
                    // {
                    //     let _parentContractField = _form.getField("custrecord_rey_conc_parentcontract_ls")
                    //     _parentContractField.updateDisplayType({
                    //         displayType : serverWidget.FieldDisplayType.INLINE
                    //     })
                    // }
                    
                    if(scriptContext.type != 'copy')
                    {
                        //Data de Início de Faturamento
                        let _beginDateContracValue = _rec.getValue({fieldId: 'custrecord_rey_conc_datestart_dt'})
                        if(_beginDateContracValue)
                        {
                            let _beginDateContractField = _form.getField("custrecord_rey_conc_datestart_dt")
                            // log.debug('_beginDateContractField', JSON.stringify(_beginDateContractField))
                            _beginDateContractField.isMandatory = true
                            // log.debug('_beginDateContractField', JSON.stringify(_beginDateContractField))

                            let _contractLineSublist = form.getSublist({id: 'recmachcustrecord_rey_conl_contractline_ms'})
                            //Data de Início de Faturamento
                            let _beginInvoiceDateLineField = _contractLineSublist.getField({id: 'custrecord_rey_conl_begindateinvoice_dt'})
                            // log.debug('_beginInvoiceDateLineField', _beginInvoiceDateLineField)
                            _beginInvoiceDateLineField.isMandatory = true

                           
                        }
                        else
                        {
                             //DATA DE TERMINO DE VIGÊNCIA DO CONTRATO
                            let _endDateContractField =  _form.getField("custrecord_rey_conc_datevenc_dt")
                            _endDateContractField.updateDisplayType({
                                displayType : serverWidget.FieldDisplayType.HIDDEN
                            })
                        }
    
                        //Data de Termino de Vigência do Contrato
                        let _endDateContractValue = _rec.getValue({fieldId: 'custrecord_rey_conc_datevenc_dt'})
                        if(_endDateContractValue)
                        {
                            let _endDateContractField =  _form.getField("custrecord_rey_conc_datevenc_dt")
                            // log.debug('type', scriptContext.type)
                            _endDateContractField.isMandatory = true;
                        }

                        //MESES DE VIGÊNCIA 
                        // let _monthVigenceContractValue = _rec.getValue({fieldId: 'custrecord_rey_conc_monthcontract_nu'})
                        if(_beginDateContracValue)
                        {
                            let _monthVigenceContractField =  _form.getField("custrecord_rey_conc_monthcontract_nu")
                            _monthVigenceContractField.updateDisplayType({
                                displayType : serverWidget.FieldDisplayType.INLINE
                            });
                        }
                        
                        let sublistLines = _rec.getLineCount({sublistId: 'recmachcustrecord_rey_conl_contractline_ms'})
                        let _transactionList = []

                        for (let index = 0; index < sublistLines; index++) 
                        {
                            _transactionList = _rec.getSublistValue({//Lista Transação
                                    sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                    fieldId: 'custrecord_rey_conl_translist_ms',
                                    line: index
                                })
    
                            if(_transactionList)
                            {
                                log.debug('List - Pedidos de Vendas', _transactionList)
                                break
                            }
                            
                        }
                        
                        if(_transactionList.length)
                        {
                            //DATA DE INÍCIO DE FATURAMENTO
                            _form.getField("custrecord_rey_conc_datestart_dt").updateDisplayType({
                                    displayType : serverWidget.FieldDisplayType.INLINE
                                })
                        }

                        var _sublistVigence = _form.getSublist({id: 'recmachcustrecord_air_vigence_rc_ls'})
                        _sublistVigence.getField("name").updateDisplayType({
                            displayType : serverWidget.FieldDisplayType.DISABLED
                        })

                    }
                    else if(scriptContext.type == 'create')
                    {
                       
                    }
                }
                log.debug('beforeLoad - end', '-----------------------------------------------------------------')
            } 
            catch (e) 
            {
                log.error({ title: "beforeLoad Error", details: e.toString() });

                _form.addPageInitMessage({
                    type: message.Type.ERROR,
                    title: 'ERROR Before Load',
                    message: e.toString()
                })
                log.debug('beforeLoad - end', '-----------------------------------------------------------------')
            }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        function beforeSubmit (scriptContext) 
        {
            const newRec = scriptContext.newRecord;
            const oldRec = scriptContext.oldRecord;
            const type = scriptContext.type;
            
            try 
            {
                log.debug('beforeSubmit - begin', type + ' -----------------------------------------------------------------')
                let totalValue = 0;
                let _recurrentTotalValue = 0
                let _noRecurrentTotalValue = 0
                let readjustmentPercentage
                let readjustmentValue = 0
                let valueWithReadjustment = 0
                let discountTotalAmount = 0
                let percentageTotal = 0
                let qunatityPercentage = 0
                let unitValueWithReadjustment = 0
                let _quantityCreateInstalment
                let _lineCountInstalment
                let _quantityToRemoveInstallment
                
                let _beginVegenceContract = newRec.getValue({fieldId: 'custrecord_rey_begincontractdate_dt'})//DATA DE INÍCIO DE VIGÊNCIA DO CONTRATO
                let _startDate = newRec.getValue({fieldId: 'custrecord_rey_conc_datestart_dt'})//DATA DE INÍCIO DE FATURAMENTO
                let monthQuantity = newRec.getValue('custrecord_rey_conc_monthsreadjust_vl')// Meses Para Reajuste
                let _monthsReadjust = newRec.getValue({fieldId: 'custrecord_rey_conc_monthcontract_nu'})//MESES DE VIGÊNCIA
                
                let _beginDateInvoice = newRec.getValue({fieldId: 'custrecord_rey_conc_datestart_dt'})//DATA DE INÍCIO DE FATURAMENTO
                if(_beginDateInvoice)
                    _beginDateInvoice = format.format({value: _beginDateInvoice, type: format.Type.DATE})
                
                let _endDateInvoice = newRec.getValue({fieldId: 'custrecord_rey_conc_datevenc_dt'})//DATA DE TERMINO DE VIGÊNCIA DO CONTRATO
                if(_endDateInvoice)
                    _endDateInvoice = format.format({value: _endDateInvoice, type: format.Type.DATE})

                let _beginDateInvoiceOld
                let _endDateInvoiceOld

                if(oldRec)
                {
                    _beginDateInvoiceOld = oldRec.getValue({fieldId: 'custrecord_rey_conc_datestart_dt'})//DATA DE INÍCIO DE FATURAMENTO
                    if(_beginDateInvoiceOld)
                        _beginDateInvoiceOld = format.format({value: _beginDateInvoiceOld, type: format.Type.DATE})
                    
                    _endDateInvoiceOld = oldRec.getValue({fieldId: 'custrecord_rey_conc_datevenc_dt'})//DATA DE TERMINO DE VIGÊNCIA DO CONTRATO
                    if(_endDateInvoiceOld)
                        _endDateInvoiceOld = format.format({value: _endDateInvoiceOld, type: format.Type.DATE})
                }

                //Create Vigencia-------------------------------------------------------------------------------
                let _vigenceCount = newRec.getLineCount({sublistId: 'recmachcustrecord_air_vigence_rc_ls'})
                
                if(type != 'delete' && _vigenceCount == 0 && _startDate && monthQuantity && _monthsReadjust)
                {
                    newRec.setValue({//Data Inicio de Vigencia
                        fieldId: 'custrecord_rey_conc_dateincl_dt',
                        value: _startDate,
                    })

                    let _nextReadjustmentDate = addMonths(_startDate, monthQuantity)
                       
                    newRec.setValue({//Data de Reajuste
                        fieldId: 'custrecord_rey_conc_readjustmentdate_dt',
                        value: _nextReadjustmentDate,
                    })

                    newRec.setValue({//DATA ANIVERSÁRIO CONTRATO
                        fieldId: 'custrecord_rey_dtnivercontrato_ius',
                        value: _nextReadjustmentDate,
                    })

                    _startDate = newRec.getValue({fieldId: 'custrecord_rey_conc_datestart_dt'})//DATA DE INÍCIO DE FATURAMENTO
                    log.debug({ title: "Create Reajustmant Date", details: 'Quantity : ' + (_monthsReadjust/monthQuantity)});
                    // "MESES DE VIGÊNCIA" / "Meses Para Reajuste"
                    for (let int = 0; int < (_monthsReadjust/monthQuantity); int++) 
                    {
                        newRec.setSublistValue({//begin date
                            sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                            fieldId: 'custrecord_air_begindate_rc_dt',
                            value: _startDate,
                            line: int
                        })

                        let _nextReadjustmentDate = addMonths(_startDate, monthQuantity)

                        newRec.setSublistValue({//end date
                            sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                            fieldId: 'custrecord_air_enddate_rc_dt',
                            value: _nextReadjustmentDate,
                            line: int
                        })

                        let _beginDateVigence = newRec.getSublistValue({//begin date
                                sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                                fieldId: 'custrecord_air_begindate_rc_dt',
                                line: int
                            })

                        let _beginDateVigenceText = format.format({value: _beginDateVigence, type: format.Type.DATE})
                        let _nextReadjustmentDateText = format.format({value: _nextReadjustmentDate, type: format.Type.DATE})

                        newRec.setSublistValue({//name
                            sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                            fieldId: 'name',
                            value: _beginDateVigenceText +' - '+ _nextReadjustmentDateText,
                            line: int
                        })

                        newRec.setSublistValue({//quantidade
                            sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                            fieldId: 'custrecord_air_quantity_rc_dt',
                            value: (monthQuantity * (int+1)),
                            line: int
                        })

                    }// end for

                }
                else if(type == 'delete')
                {
                    for (let index1 = 0; index1 < _vigenceCount; index1++) 
                    {
                        let _id = newRec.getSublistValue({
                                sublistId:'recmachcustrecord_air_vigence_rc_ls', 
                                fieldId: 'id', 
                                line: index1
                            })

                        let _deleteId = record.delete({type: 'customrecord_air_recurrency_rc', id: _id})
                        log.debug('vigence' , _deleteId)
                        
                    }
                }
                //Create Vigencia-------------------------------------------------------------------------------


                //Data de Termino de Vigência do Contrato-------------------------------------------------------------------
                _startDate = newRec.getValue({fieldId: 'custrecord_rey_conc_datestart_dt'})//DATA DE INÍCIO DE FATURAMENTO
                //Vigência Contratual (Nº meses)
                let _dueDate = newRec.getValue({fieldId: 'custrecord_rey_conc_datevenc_dt'})

                
                if(!_dueDate && _startDate && _monthsReadjust)
                {
                    // log.debug({ title: "_startDate", details: _startDate});
                    // log.debug({ title: "_monthsReadjust", details: _monthsReadjust});
                    // log.debug({ title: "_startDate.getMonth()", details: _startDate.getMonth()});
                    let newDate = addMonths(_startDate, _monthsReadjust)
                    log.debug({ title: "new Due Date", details: newDate});

                    newRec.setValue({//Data de Termino de Vigência do Contrato
                        fieldId: 'custrecord_rey_conc_datevenc_dt',
                        value: newDate
                    })
                }
                //Data de Termino de Vigência do Contrato-------------------------------------------------------------------

                let _indexHead = newRec.getValue("custrecord_rey_conc_indice_ms")//INDICE
               

                let sublistLines = newRec.getLineCount({sublistId: 'recmachcustrecord_rey_conl_contractline_ms'})

                for (let idline = 0; idline < sublistLines; idline++) 
                {
                    newRec.setSublistValue({//Linha
                        sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                        fieldId: 'custrecord_rey_conl_line_nu',
                        value: (idline+1),
                        line: idline
                    })

                    let _quantity = newRec.getSublistValue({// QUANTIDADE DO ITEM
                        sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                        fieldId: 'custrecord_rey_conl_item_quantity_nu',
                        line: idline
                    })

                    let _recurrentBoolean = newRec.getSublistValue({// recorrente
                        sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                        fieldId: 'custrecord_rey_conl_agroup_recurrent_cb',
                        line: idline
                    })

                    log.debug('Quantity Divergence' , (_recurrentBoolean && _quantity != _monthsReadjust))
                    if(_recurrentBoolean && _quantity != _monthsReadjust)
                    {
                        newRec.setSublistValue({//QUANTIDADE DO ITEM
                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                            fieldId: 'custrecord_rey_conl_item_quantity_nu',
                            value: _monthsReadjust,
                            line: idline
                        })

                        let _unitValue = newRec.getSublistValue({// Valor do Serviço
                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                            fieldId: 'custrecord_rey_conl_amountcontract_cu',
                            line: idline
                        })

                        newRec.setSublistValue({//VALOR TOTAL DO ITEM
                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                            fieldId: 'custrecord_rey_conl_agroup_totalitem_cr',
                            value: _monthsReadjust * _unitValue,
                            line: idline
                        })

                        let _finalUnitValue = newRec.getSublistValue({// VALOR UNITÁRIO FINAL
                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                            fieldId: 'custrecord_rey_conl_amountcontractren_cu',
                            line: idline
                        })

                        newRec.setSublistValue({//VALOR TOTAL DO SERVIÇO FINAL
                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                            fieldId: 'custrecord_rey_valor_serv_final_cu',
                            value: _monthsReadjust * _finalUnitValue,
                            line: idline
                        })
                    }

                    //Discount-------------------------------------------------------------------------------------------
                    
                    let percentage_discount = newRec.getSublistValue({// Valor de Desconto
                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                            fieldId: 'custrecord_rey_desconto_dc',
                            line: idline
                        })

                    let percentageDiscount = newRec.getSublistValue({// Desconto %
                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                            fieldId: 'custrecord_rey_conl_discountpercent_pe',
                            line: idline
                        })
                    
                    if(percentageDiscount)
                        qunatityPercentage++

                    percentageTotal += percentageDiscount
                   

                    let percentageDiscountOld
                    if(oldRec)
                        percentageDiscountOld= oldRec.getSublistValue({// Desconto %
                                sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                fieldId: 'custrecord_rey_conl_discountpercent_pe',
                                line: idline
                            })

                    let percentage_discountOld
                    if(oldRec)
                        percentage_discountOld= oldRec.getSublistValue({// Valor de Desconto
                                sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                fieldId: 'custrecord_rey_desconto_dc',
                                line: idline
                            });
                    
                            
                    // If have discount--------------------------------------------------------------------------------
                    let _discountamount = 0
                    if(oldRec && ((percentage_discount && percentage_discountOld != percentage_discount) ||
                        (percentageDiscount && percentageDiscountOld != percentageDiscount)))
                    { 
                        if(percentage_discount && percentage_discountOld != percentage_discount)
                        {
                            log.debug((idline+1) + ' new - Valor de Desconto', percentage_discount)
                            log.debug((idline+1) + ' Old - Valor de Desconto', percentage_discountOld)
                        }
                        else if(percentageDiscount && percentageDiscountOld != percentageDiscount)
                        {
                            log.debug((idline+1) + ' new - Desconto %', percentageDiscount)
                            log.debug((idline+1) + ' Old - Desconto %', percentageDiscountOld)
                        }
                        
                        _discountamount = parseFloat(newRec.getSublistValue({// Valor com Reajuste
                                sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                fieldId: 'custrecord_rey_conl_amountcontractren_cu', 
                                line: idline
                            }))
                      
                    } 
                    // If have discount--------------------------------------------------------------------------------


                    // Bloqueia Faturamento -----------------------------------------------
                    let _recurrent = newRec.getSublistValue({// Bloqueia Faturamento
                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                            fieldId: 'custrecord_rey_conl_endcontractline_cb',
                            line: idline
                        })

                    let _recurrentOld = false
                    if(oldRec)
                        _recurrentOld= oldRec.getSublistValue({// Bloqueia Faturamento
                                sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                fieldId: 'custrecord_rey_conl_endcontractline_cb',
                                line: idline
                            })

                    // Bloqueia Faturamento -----------------------------------------------


                    // Preenchimento do Index do cabeçalho---------------------------------
                    newRec.setSublistValue({//Indice de reajuste
                        sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                        fieldId: 'custrecord_rey_conl_readjustmentindex_ls',
                        value: _indexHead,
                        line: idline
                    })
                    // Preenchimento do Index do cabeçalho---------------------------------
                    

                    //Data de Início de Faturamento-----------------------------------------------------------
                    let _inicioDdeVigenciaDate = newRec.getValue({fieldId: 'custrecord_rey_conc_datestart_dt'})
                    let _beginInvoiceDateLineText
                    let _beginInvoiceDateLine = newRec.getSublistValue({//Data de Início de Faturamento - line
                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                            fieldId: 'custrecord_rey_conl_begindateinvoice_dt',
                            line: idline
                        })
                    
                    
                    let _inicioDdeVigenciaDateOld
                    let _beginInvoiceDateLineOld 
                    let _beginInvoiceDateLineOldText
                    if(oldRec)
                    {
                        _inicioDdeVigenciaDateOld = oldRec.getValue({fieldId: 'custrecord_rey_conc_datestart_dt'})

                        _beginInvoiceDateLineOld= oldRec.getSublistValue({//Data de Início de Faturamento - line
                                sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                fieldId: 'custrecord_rey_conl_begindateinvoice_dt',
                                line: idline
                            })
                        
                        if(_beginInvoiceDateLineOld)
                            _beginInvoiceDateLineOldText = format.format({value: _beginInvoiceDateLineOld, type: format.Type.DATE})
                    }

                    // log.debug('Alter - _inicioDdeVigenciaDateOld' , JSON.stringify(_inicioDdeVigenciaDateOld))
                    // log.debug('Alter - _beginInvoiceDateLine' , JSON.stringify(_beginInvoiceDateLine))
                    // log.debug('Alter - Data de Início de Faturamento' ,  (_inicioDdeVigenciaDate && _inicioDdeVigenciaDateOld && _beginInvoiceDateLine && JSON.stringify(_inicioDdeVigenciaDateOld) == JSON.stringify(_beginInvoiceDateLine)))
                    if((!_beginInvoiceDateLine && _inicioDdeVigenciaDate) || 
                        (_inicioDdeVigenciaDate && _inicioDdeVigenciaDateOld && _beginInvoiceDateLine && JSON.stringify(_inicioDdeVigenciaDateOld) == JSON.stringify(_beginInvoiceDateLine)))
                    {
                        newRec.setSublistValue({//Data de Início de Faturamento - line
                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                            fieldId: 'custrecord_rey_conl_begindateinvoice_dt',
                            value: _inicioDdeVigenciaDate,
                            line: idline
                        })
                        _beginInvoiceDateLineText = format.format({value: _inicioDdeVigenciaDate, type: format.Type.DATE})
                    }
                    else
                    {
                        if(_beginInvoiceDateLine)
                            _beginInvoiceDateLineText = format.format({value: _beginInvoiceDateLine, type: format.Type.DATE})
                    }

                    // log.debug({ title: "Alteracao no inicio do faturamento - Linha", details: _beginInvoiceDateLineText +" - "+ _beginInvoiceDateLineOldText})
                    //Data de Início de Faturamento---------------------------------------------------------------


                    let _transactionList = newRec.getSublistValue({//Lista Transação
                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                            fieldId: 'custrecord_rey_conl_translist_ms',
                            line: idline
                        })

                    if(_transactionList)
                        log.debug('List - Pedidos de Vendas', _transactionList)


                    let getContracLineId = newRec.getSublistValue({
                            sublistId: AIR_CONTRACT.SUBLIST_CONTRACT_LINE,
                            fieldId: AIR_CONTRACT_LINE.ID,
                            line: idline
                        })
                    
                    // log.debug('getContracLineId', getContracLineId)
                   
                    
                    if(getContracLineId)
                    {
                        let contractLine = record.load({
                            type: AIR_CONTRACT_LINE.RECORD_TYPE,
                            id: getContracLineId,
                            isDynamic: true
                        })

                        if((_recurrentOld != _recurrent) || 
                            _discountamount || // Enable / Disable Recurrence or Discount
                            (_beginDateInvoice && _beginDateInvoiceOld && _beginDateInvoice != _beginDateInvoiceOld && _recurrentBoolean) ||
                            (_endDateInvoice && _endDateInvoiceOld && _endDateInvoice != _endDateInvoiceOld  && _recurrentBoolean) ||
                            (_beginInvoiceDateLineText && _beginInvoiceDateLineOldText && _beginInvoiceDateLineText != _beginInvoiceDateLineOldText) ||
                            type == 'delete'
                        )
                        {
                            if(_recurrentOld != _recurrent)// Bloqueia Faturamento
                                log.debug({ title: "_recurrent", details: _recurrent})
                            if(_discountamount)
                                log.debug({ title: "if _discountamount", details: doRound(_discountamount, 2)})
                            if(_beginDateInvoice && _beginDateInvoiceOld && _beginDateInvoice != _beginDateInvoiceOld && _recurrentBoolean)
                                log.debug({ title: "Alteracao no inicio do faturamento", details: _beginDateInvoice})
                            if(_endDateInvoice && _endDateInvoiceOld && _endDateInvoice != _endDateInvoiceOld  && _recurrentBoolean)
                                log.debug({ title: "Alteracao no fim do faturamento", details: _endDateInvoice})
                            if(_beginInvoiceDateLineText && _beginInvoiceDateLineOldText && _beginInvoiceDateLineText != _beginInvoiceDateLineOldText)
                                log.debug({ title: "Alteracao no inicio do faturamento - Linha", details: _beginInvoiceDateLineText +" - "+ _beginInvoiceDateLineOldText})
                            if(type == 'delete')
                                log.debug({ title: "type == 'delete'", details: type})

                            

                            // Installment-----------------------------------------------------------------------------------
                            let _beginDate = newRec.getValue({fieldId: 'custrecord_rey_conc_dateincl_dt'})
                            // log.debug({ title: "_beginDate", details: _beginDate})
                            // let _endDate = newRec.getValue({fieldId: 'custrecord_rey_conc_readjustmentdate_dt'})
                            // log.debug({ title: "_endDate installment", details: _endDate})
                            
                            

                            //Delete
                            if((_beginDateInvoice && _beginDateInvoiceOld && _beginDateInvoice != _beginDateInvoiceOld && _recurrentBoolean) ||
                                (_beginInvoiceDateLineText && _beginInvoiceDateLineOldText && _beginInvoiceDateLineText != _beginInvoiceDateLineOldText)
                            )
                            {
                                let _beginDateInvoiceLocal
                                if(_beginDateInvoice && _beginDateInvoiceOld && _beginDateInvoice != _beginDateInvoiceOld && _recurrentBoolean)
                                    _beginDateInvoiceLocal = newRec.getValue({fieldId: 'custrecord_rey_conc_datestart_dt'})//DATA DE INÍCIO DE FATURAMENTO
                                else if(_beginInvoiceDateLineText && _beginInvoiceDateLineOldText && _beginInvoiceDateLineText != _beginInvoiceDateLineOldText)
                                    _beginDateInvoiceLocal = _beginInvoiceDateLine

                                let lineCount = contractLine.getLineCount({sublistId: 'recmachcustrecord_air_fre_frequency_lr'})
                                let _quantityToRemove = 0
                                // let amountToBeInvoiced = 0
                                
                                if(_recurrentBoolean)
                                {
                                    for (let j = lineCount-1; j>= 0; j--) 
                                    {
                                        let _duedateFrequency = contractLine.getSublistValue({
                                            sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                            fieldId: 'custrecord_air_fre_duedate_dt',
                                            line: j
                                        })
                                        
                                        // clear insllments before _beginDateInvoice
                                        if(_duedateFrequency < _beginDateInvoiceLocal)
                                        {
                                            _quantityToRemove++
                                            let _frequencyId = contractLine.getSublistValue({
                                                    sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                    fieldId: 'id',
                                                    line: j
                                                })
    
                                            log.debug({ title: "remove installment lineId", details: _frequencyId});
                                            // contractLine.removeLine({sublistId: 'recmachcustrecord_air_fre_frequency_lr', line: j, ignoreRecalc: true});
    
                                            contractLine.selectLine({
                                                sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                line: j
                                            })
    
                                            contractLine.setCurrentSublistValue({//Inativo
                                                sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                fieldId: 'custrecord_air_fre_inactive_cb',
                                                value: true,
                                                // line: j
                                            })
                                            
                                            contractLine.setCurrentSublistValue({
                                                sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                fieldId: 'custrecord_rey_freq_status_lr',
                                                value: 3
                                            })

                                            contractLine.commitLine({
                                                sublistId: 'recmachcustrecord_air_fre_frequency_lr'
                                            })
                                        }
                                        // else
                                        // {
                                        //     contractLine.selectLine({
                                        //         sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                        //         line: j
                                        //     })
    
                                        //     contractLine.setCurrentSublistValue({//Inativo
                                        //         sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                        //         fieldId: 'custrecord_air_fre_inactive_cb',
                                        //         value: false,
                                        //         // line: j
                                        //     })
                                            
                                        //     contractLine.setCurrentSublistValue({
                                        //         sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                        //         fieldId: 'custrecord_rey_freq_status_lr',
                                        //         value: ''
                                        //     })

                                        //     contractLine.commitLine({
                                        //         sublistId: 'recmachcustrecord_air_fre_frequency_lr'
                                        //     })
                                        // }
                                    }
    
    
                                    newRec.setSublistValue({//Quantidade a Faturar
                                        sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                        fieldId: 'custrecord_rey_conl_quantity_nu',
                                        value: lineCount - _quantityToRemove,
                                        line: idline
                                    })
                                    
                                    newRec.setSublistValue({//Quantidade Restante a Faturar
                                        sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                        fieldId: 'custrecord_rey_conl_quantity_invoc_nu',
                                        value: lineCount - _quantityToRemove,
                                        line: idline
                                    })

                                    if(!_recurrent)// Bloqueia Faturamento
                                        newRec.setSublistValue({//Qtd.Liberada
                                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                            fieldId: 'custrecord_rey_conl_qtdliberadadem_ds',
                                            value: lineCount - _quantityToRemove,
                                            line: idline
                                        })

                                    let _totalAmountItem = newRec.getSublistValue({// Valor com Reajuste
                                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                            fieldId: 'custrecord_rey_conl_amountcontractren_cu',
                                            line: idline
                                        })
    
                                    newRec.setSublistValue({// Valor do Serviço Final
                                        sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                        fieldId: 'custrecord_rey_valor_serv_final_cu',
                                        line: idline,
                                        value: lineCount * parseFloat(_totalAmountItem)
                                    })
    
                                    let _unitValue = newRec.getSublistValue({// Valor do Serviço
                                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                            fieldId: 'custrecord_rey_conl_amountcontract_cu',
                                            line: idline
                                        })
    
                                    newRec.setSublistValue({// Valor Total do Item
                                        sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                        fieldId: 'custrecord_rey_conl_agroup_totalitem_cr',
                                        line: idline,
                                        value: lineCount * parseFloat(_unitValue)
                                    })

                                }

                            }

                            // log.debug({ title: "difrence _recurrent", details: (_recurrentOld != _recurrent)})
                            //Update// Bloqueia Faturamento
                            if((_recurrentOld != _recurrent) || _discountamount)
                            {
                                let quantityToRelease = 0
                                // Installment
                                let lineCount = contractLine.getLineCount({sublistId: 'recmachcustrecord_air_fre_frequency_lr'})
                                for (let line = 0; line < lineCount; line++)
                                {
                                    contractLine.selectLine({
                                        sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                        line: line
                                    })
                                    
                                    let _duedateFrequency = contractLine.getSublistValue({
                                            sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                            fieldId: 'custrecord_air_fre_duedate_dt',
                                            line: line
                                        })

                                    let isInactive = contractLine.getSublistValue({
                                            sublistId:'recmachcustrecord_air_fre_frequency_lr', 
                                            fieldId: 'custrecord_air_fre_inactive_cb', 
                                            line: line
                                        })

                                    
                                    if(_recurrentOld != _recurrent && !isInactive)// Bloqueia Faturamento
                                    {
                                        let _status
                                        if(_recurrentBoolean && !_recurrent)// recorrente
                                            _status = 1 // liberado
                                        else if(!_recurrentBoolean && !_recurrent)
                                            _status = 2 // Pendente
                                        else
                                            _status = ''

                                        contractLine.setCurrentSublistValue({
                                            sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                            fieldId: 'custrecord_rey_freq_status_lr',
                                            value: _status
                                        })

                                        
                                        let transaction = contractLine.getSublistValue({
                                                sublistId:'recmachcustrecord_air_fre_frequency_lr', 
                                                fieldId: 'custrecord_air_fre_transaction_lr', 
                                                line: line
                                            })
                                        // log.debug({ title: "transaction : ", details: transaction})
                                        if(_status == 1 && _duedateFrequency) // Liberado
                                        {
                                            // log.debug("beforeSubmit - quantityToRelease", quantityToRelease)
                                            quantityToRelease++
                                        }
                                    }
        
                                    // log.debug({ title: "_duedateFrequency", details: _duedateFrequency})
                                    // log.debug({ title: "_duedateFrequency new", details: new Date(_duedateFrequency)})
                                        
        
                                    if(_discountamount && _duedateFrequency >= _beginDate) //  _endDate && _endDate && && _duedateFrequency < _endDate
                                    {
                                        log.debug({ title: "_discountamount line : " + (line+1), details: _discountamount});
                                        contractLine.setCurrentSublistValue({
                                            sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                            fieldId: 'custrecord_rey_freq_value_dec',
                                            value: _discountamount
                                        })
                                    }
        
                                    contractLine.commitLine({
                                        sublistId: 'recmachcustrecord_air_fre_frequency_lr'
                                    })

                                }
                                
                                // log.debug({ title: "quantityToRelease : ", details: quantityToRelease});
                                if(quantityToRelease)
                                    newRec.setSublistValue({//Qtd.Liberada
                                        sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                        fieldId: 'custrecord_rey_conl_qtdliberadadem_ds',
                                        value: quantityToRelease,
                                        line: idline
                                    })

                            }

                            //Create
                            if(_endDateInvoice && _endDateInvoiceOld && _endDateInvoice != _endDateInvoiceOld  && _recurrentBoolean)
                            {
                                if(_recurrentBoolean)
                                {
                                    let _endDateInvoiceOldLocal = oldRec.getValue({fieldId: 'custrecord_rey_conc_datevenc_dt'})//DATA DE TERMINO DE VIGÊNCIA DO CONTRATO
                                    // log.debug({ title: "quantity month old", details: _endDateInvoiceOldLocal.getMonth()})
                                    let _endDateInvoiceLocal = newRec.getValue({fieldId: 'custrecord_rey_conc_datevenc_dt'})//DATA DE TERMINO DE VIGÊNCIA DO CONTRATO
                                    // log.debug({ title: "quantity month", details: _endDateInvoiceLocal.getMonth()})
                                    let lineCount = contractLine.getLineCount({sublistId: 'recmachcustrecord_air_fre_frequency_lr'})
                                    // log.debug({ title: "lineCount", details: lineCount})
    
                                    let lineCountSequence
                                    
                                    let _quantityCreate = monthDiff(_endDateInvoiceOldLocal, _endDateInvoiceLocal)
                                    // _endDateInvoiceLocal.getMonth() - _endDateInvoiceOldLocal.getMonth()
                                    log.debug({ title: "create installment quantity", details: _quantityCreate})
                                    
                                
                                    let _totalAmountItem = newRec.getSublistValue({// Valor com Reajuste
                                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                            fieldId: 'custrecord_rey_conl_amountcontractren_cu',
                                            line: idline
                                        })
    
                                    newRec.setSublistValue({// Valor do Serviço Final
                                        sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                        fieldId: 'custrecord_rey_valor_serv_final_cu',
                                        line: idline,
                                        value: (lineCount + _quantityCreate) * parseFloat(_totalAmountItem)
                                    })
    
                                    let _unitValue = newRec.getSublistValue({// Valor do Serviço
                                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                            fieldId: 'custrecord_rey_conl_amountcontract_cu',
                                            line: idline
                                        })
    
                                    newRec.setSublistValue({// Valor Total do Item
                                        sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                        fieldId: 'custrecord_rey_conl_agroup_totalitem_cr',
                                        line: idline,
                                        value: (lineCount + _quantityCreate) * parseFloat(_unitValue)
                                    })
    
                                    //TODO
                                    log.debug({ title: "_quantityCreate + lineCount", details: _quantityCreate + lineCount})
    
                                    for (let k = 0; k < _quantityCreate; k++) // create installment line
                                    {
                                        log.debug({ title: "create installment line", details: (k+1)})
    
                                        contractLine.selectNewLine({
                                            sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                        })
                                        
                                        
                                        if(k == 0)
                                        {
                                            let _lineFrequency = contractLine.getSublistValue({//LINHA
                                                    sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                    fieldId: 'custrecord_air_fre_line_lr',
                                                    line: (lineCount-1)
                                                })
    
                                            lineCountSequence = _lineFrequency
                                        }
    
                                        contractLine.setCurrentSublistValue({//LINHA
                                                sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                fieldId: 'custrecord_air_fre_line_lr',
                                                value: parseInt(lineCountSequence) +k+1,
                                            })
    
                                        let _vigenceIdFrequency = contractLine.getSublistValue({//VIGÊNCIA
                                                sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                fieldId: 'custrecord_air_fre_vigency_lr',
                                                line: (lineCount-1)
                                            })
    
                                        contractLine.setCurrentSublistValue({//VIGÊNCIA
                                                sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                fieldId: 'custrecord_air_fre_vigency_lr',
                                                value: _vigenceIdFrequency,
                                            })
    
                                        let _amountFrequency = contractLine.getSublistValue({//VALOR
                                                sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                fieldId: 'custrecord_rey_freq_value_dec',
                                                line: (lineCount-1)
                                            })
    
                                        contractLine.setCurrentSublistValue({//VALOR
                                                sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                fieldId: 'custrecord_rey_freq_value_dec',
                                                value: _amountFrequency,
                                            })
    
                                        // let _contractIdFrequency = contractLine.getSublistValue({//Contrato
                                        //         sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                        //         fieldId: 'custrecord_air_fre_contract_lr',
                                        //         line: (lineCount-1)
                                        //     })
    
                                        contractLine.setCurrentSublistValue({//Contrato
                                                sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                fieldId: 'custrecord_air_fre_contract_lr',
                                                value: newRec.id,
                                            })
    
                                        let _dueDateFrequency = contractLine.getSublistValue({//Data do faturamento
                                                sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                fieldId: 'custrecord_air_fre_duedate_dt',
                                                line: (lineCount-1)
                                            })
                                        
                                        let _nextDueDateFrequency = addMonths(new Date(_dueDateFrequency.getFullYear(), _dueDateFrequency.getMonth(), _beginVegenceContract.getDate()), k+1)
                                        contractLine.setCurrentSublistValue({//Data do faturamento
                                                sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                fieldId: 'custrecord_air_fre_duedate_dt',
                                                value: _nextDueDateFrequency,
                                            })

                                        // let _statusFrequency = contractLine.getSublistValue({//STATUS
                                        //         sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                        //         fieldId: 'custrecord_rey_freq_status_lr',
                                        //         line: (lineCount-1)
                                        //     })
                                        
                                        contractLine.setCurrentSublistValue({//STATUS
                                                    sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                    fieldId: 'custrecord_rey_freq_status_lr',
                                                    value: _nextDueDateFrequency >= new Date() ? 1 : 3,
                                                })
                                        
                                        contractLine.setCurrentSublistValue({//Inativo
                                                sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                fieldId: 'custrecord_air_fre_inactive_cb',
                                                value: _nextDueDateFrequency >= new Date() ? false : true,
                                            })        
                                        
                                        let _nextDueDateFrequencyText = format.format({value: _nextDueDateFrequency, type: format.Type.DATE})
                                        contractLine.setCurrentSublistValue({//Data de vencimento
                                            sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                            fieldId: 'name',
                                            value: _nextDueDateFrequencyText,
                                        })
    
                                        contractLine.commitLine({
                                            sublistId: 'recmachcustrecord_air_fre_frequency_lr'
                                        })
                                        
                                    }
    
                                    let amountToBeInvoiced = 0
                                    let _realQuantity = 0
                                    let _quantityInvoiced = 0
                                    let quantityToRelease = 0
                                    let quantityToBeInvoiced = 0
                                    
                                    for (let index = 0; index < lineCount; index++) // summary intallment
                                    {
                                        let value = contractLine.getSublistValue({
                                            sublistId:'recmachcustrecord_air_fre_frequency_lr', 
                                            fieldId: 'custrecord_rey_freq_value_dec', 
                                            line: index
                                        });
                                        // log.debug("beforeSubmit - value", value)
                                        
                                        let transaction = contractLine.getSublistValue({
                                                sublistId:'recmachcustrecord_air_fre_frequency_lr', 
                                                fieldId: 'custrecord_air_fre_transaction_lr', 
                                                line: index
                                            });
    
                                        let _status = contractLine.getSublistValue({
                                                sublistId:'recmachcustrecord_air_fre_frequency_lr', 
                                                fieldId: 'custrecord_rey_freq_status_lr', 
                                                line: index
                                            });

                                        let _dueDate = contractLine.getSublistValue({
                                                sublistId:'recmachcustrecord_air_fre_frequency_lr', 
                                                fieldId: 'custrecord_air_fre_duedate_dt', 
                                                line: index
                                            })

                                        
                                        if(_status == 1)
                                            _realQuantity++
                                        
                                        if(!transaction)
                                            amountToBeInvoiced += value
    
                                        if(transaction && _status == 1)
                                            _quantityInvoiced++

                                        if(_status != 3)//Cancelado
                                            quantityToBeInvoiced++

                                        if(_status == 1 && _dueDate) // Liberado
                                            quantityToRelease++

                                    }
    
                                    log.debug("beforeSubmit end date - _quantityCreate", _quantityCreate)
                                    newRec.setSublistValue({//Quantidade do item
                                        sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                        fieldId: 'custrecord_rey_conl_item_quantity_nu',
                                        value: _quantityCreate + lineCount,
                                        line: idline
                                    })
    
                                    log.debug("beforeSubmit end date - quantityToBeInvoiced", quantityToBeInvoiced)
                                    newRec.setSublistValue({//Quantidade a Faturar
                                        sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                        fieldId: 'custrecord_rey_conl_quantity_nu',
                                        value: _quantityCreate + quantityToBeInvoiced,
                                        line: idline
                                    })
                                    
                                    log.debug("beforeSubmit end date - _quantityInvoiced", _quantityInvoiced)
                                    newRec.setSublistValue({//Quantidade Restante a Faturar
                                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                            fieldId: 'custrecord_rey_conl_quantity_invoc_nu',
                                            value: (_quantityCreate + Math.abs(_quantityInvoiced - quantityToBeInvoiced)),
                                            line: idline
                                        })

                                    if(!_recurrent)// Bloqueia Faturamento
                                        newRec.setSublistValue({//Qtd.Liberada
                                                sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                                fieldId: 'custrecord_rey_conl_qtdliberadadem_ds',
                                                value: quantityToRelease + _quantityCreate,
                                                line: idline
                                            })
    
                                    log.debug('beforeSubmit Valor Restante a Faturar', amountToBeInvoiced + ((_quantityCreate) * parseFloat(_totalAmountItem)))
                                    newRec.setSublistValue({//Valor Restante a Faturar
                                        sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                                        fieldId: 'custrecord_rey_conl_agroup_billedrecu_nu',
                                        value: amountToBeInvoiced + ((_quantityCreate) * parseFloat(_totalAmountItem)),
                                        line: idline
                                    })

                                }
                                    
                            }

                            if(type == 'delete')
                            {
                                let lineCount = contractLine.getLineCount({sublistId: 'recmachcustrecord_air_fre_frequency_lr'})
                                for (let line = 0; line < lineCount; line++)
                                {
                                    let _installmentId = contractLine.getSublistValue({
                                            sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                            fieldId: 'id',
                                            line: line
                                        })
                                    
                                    let _deleteId = record.delete({type: 'customrecord_air_frequency', id: _installmentId})
                                    log.debug('_deleteId' , _deleteId)
                                }

                                let historyCount = contractLine.getLineCount({sublistId: 'recmachcustrecord_air_hist_item_ls'})
                                for (let index1 = 0; index1 < historyCount; index1++) 
                                {
                                    let _id = contractLine.getSublistValue({
                                            sublistId:'recmachcustrecord_air_hist_item_ls', 
                                            fieldId: 'id', 
                                            line: index1
                                        })

                                    let _deleteId = record.delete({type: 'customrecord_air_readjustmenthistory', id: _id})
                                    log.debug('_deleteId' , _deleteId)
                                    
                                }
                            }

                            // Installment-----------------------------------------------------------------------------------
                            
                            if(type != 'delete')
                            {
                                let contractLineId  = contractLine.save();
                                log.debug({ title: "Alter contractLine save", details: 'ID : ' + contractLineId});

                            }
                            else
                            {
                                let _deleteId = record.delete({type: AIR_CONTRACT_LINE.RECORD_TYPE, id: getContracLineId})
                                log.debug("delete contract line" , _deleteId)
                            }
                            

                        }

                        let lineCountInstallment = contractLine.getLineCount({sublistId: 'recmachcustrecord_air_fre_frequency_lr'})
                        // let _totalItem = 0

                        for (let index3 = 0; index3 < lineCountInstallment; index3++)
                        {
                            let _totalItem = parseFloat(contractLine.getSublistValue({
                                sublistId:'recmachcustrecord_air_fre_frequency_lr', 
                                fieldId: 'custrecord_rey_freq_value_dec', 
                                line: index3
                            }))
                            
                            totalValue += _totalItem
                            
                            if(_recurrentBoolean)
                                _recurrentTotalValue += parseFloat(_totalItem)
                            else
                                _noRecurrentTotalValue += parseFloat(_totalItem)
                        }
                        
                    }


                    // Calcular o total do contrato----------------------------------------
                    // let _totalItem = newRec.getSublistValue({// Valor do Serviço Final
                    //         sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                    //         fieldId: 'custrecord_rey_valor_serv_final_cu',
                    //         line: idline
                    //     });

                    // totalValue += parseFloat(_totalItem)

                    // if(_recurrentBoolean)
                    //     _recurrentTotalValue += parseFloat(_totalItem)
                    // else
                    //     _noRecurrentTotalValue += parseFloat(_totalItem)
                    // Calcular o total do contrato----------------------------------------

                    readjustmentPercentage = newRec.getSublistValue({//Percentual de Reajustes
                        sublistId: AIR_CONTRACT.SUBLIST_CONTRACT_LINE,
                        fieldId: 'custrecord_rey_conl_percentrenew_pe',
                        line: idline
                    })

                    readjustmentValue += newRec.getSublistValue({//Valor de Reajuste
                        sublistId: AIR_CONTRACT.SUBLIST_CONTRACT_LINE,
                        fieldId: 'custrecord_rey_conl_amountrenew_cu',
                        line: idline
                    })

                    valueWithReadjustment += newRec.getSublistValue({// VALOR DO SERVIÇO FINAL
                        sublistId: AIR_CONTRACT.SUBLIST_CONTRACT_LINE,
                        fieldId: 'custrecord_rey_valor_serv_final_cu',
                        line: idline
                    })

                    discountTotalAmount += newRec.getSublistValue({// VALOR De Desconto
                        sublistId: AIR_CONTRACT.SUBLIST_CONTRACT_LINE,
                        fieldId: 'custrecord_rey_desconto_dc',
                        line: idline
                    })

                    if(_recurrentBoolean)
                        unitValueWithReadjustment += newRec.getSublistValue({// Valor com Reajuste
                            sublistId: 'recmachcustrecord_rey_conl_contractline_ms',
                            fieldId: 'custrecord_rey_conl_amountcontractren_cu',
                            line: idline
                        })
                
                }// end for SUBLIST_CONTRACT_LINE

                // RENEW---------------------------------------------------------------------------------------
                // MESES PARA REAJUSTE
                _monthsReadjust = newRec.getValue({fieldId: 'custrecord_rey_conc_monthsreadjust_vl'})
                _vigenceCount = newRec.getLineCount({sublistId: 'recmachcustrecord_air_vigence_rc_ls'})
                log.debug({ title: "Renew Begin - Number of vigence", details: _vigenceCount})
                let renewBooleanVigence

                if (_vigenceCount > 0) // Sublist Vigence
                {
                    renewBooleanVigence = newRec.getSublistValue({// Renew
                            sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                            fieldId: 'custrecord_air_renew_rc_cb',
                            line: 0
                        })

                    let renewBooleanOld = false
                    if(oldRec)
                        renewBooleanOld = oldRec.getSublistValue({// Renew
                                sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                                fieldId: 'custrecord_air_renew_rc_cb',
                                line: 0
                            })

                    
                    if(renewBooleanVigence && renewBooleanVigence != renewBooleanOld)
                    {
                        log.debug({ title: "Update - Renew Boolean", details: renewBooleanVigence})
                        log.debug({ title: "Update - Renew Boolean Old", details: renewBooleanOld});

                        newRec.setSublistValue({// PERCENTUAL DE REAJUSTE
                            sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                            fieldId: 'custrecord_air_percentrenew_rc_dt',
                            value: readjustmentPercentage,
                            line: 0
                        })

                        newRec.setSublistValue({//VALOR DE REAJUSTE
                                sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                                fieldId: 'custrecord_air_amountrenew_rc_dt',
                                value: readjustmentValue,
                                line: 0
                            })
                        
                        newRec.setSublistValue({//VALOR COM REAJUSTE
                                sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                                fieldId: 'custrecord_air_amountcontractren_rc_dt',
                                value: valueWithReadjustment,
                                line: 0
                            })
                    }
                    else
                    {
                        log.debug({ title: "renewBooleanVigence != renewBooleanOld", details: renewBooleanVigence != renewBooleanOld})
                        for (let m = 0; m < _vigenceCount; m++) 
                        {
                            let _apply = newRec.getSublistValue({// Aplicado
                                sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                                fieldId: 'custrecord_air_apply_rc_cb',
                                line: m
                            })
    
                            let _applyOld
                            if(oldRec)
                                _applyOld = oldRec.getSublistValue({// Aplicado
                                        sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                                        fieldId: 'custrecord_air_apply_rc_cb',
                                        line: m
                                    })

                            if(_apply && _apply != _applyOld)
                            {
                                log.debug({ title: "_apply != _applyOld", details: _apply != _applyOld});   
                                let _beginDateVigence = newRec.getSublistValue({//begin date
                                        sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                                        fieldId: 'custrecord_air_begindate_rc_dt',
                                        line: m
                                    }) 
                            
                                // Data Inicio de vigência
                                newRec.setValue({fieldId: 'custrecord_rey_conc_dateincl_dt', value: _beginDateVigence})
                                let _nextBirthdayDate = addMonths(_beginDateVigence, _monthsReadjust)// MESES PARA REAJUSTE
                                log.debug({ title: "_nextBirthdayDate", details: _nextBirthdayDate});
    
                                // Data de aniversario
                                newRec.setValue({fieldId: 'custrecord_rey_dtnivercontrato_ius', value: _nextBirthdayDate})
                                // DATA DE REAJUSTE DO CONTRATO
                                newRec.setValue({fieldId: 'custrecord_rey_conc_readjustmentdate_dt', value: _nextBirthdayDate})

                                newRec.setSublistValue({// PERCENTUAL DE REAJUSTE
                                    sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                                    fieldId: 'custrecord_air_percentrenew_rc_dt',
                                    value: readjustmentPercentage,
                                    line: m
                                })
        
                                newRec.setSublistValue({//VALOR DE REAJUSTE
                                        sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                                        fieldId: 'custrecord_air_amountrenew_rc_dt',
                                        value: readjustmentValue,
                                        line: m
                                    })
                                
                                newRec.setSublistValue({//VALOR COM REAJUSTE
                                        sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                                        fieldId: 'custrecord_air_amountcontractren_rc_dt',
                                        value: valueWithReadjustment,
                                        line: m
                                    })
                            }
                        }
                    }
                    
                }

                // RENEW---------------------------------------------------------------------------------------

                let _beginValidyContract
                if (_vigenceCount > 0) // Sublist Vigence
                {
                    _beginValidyContract = newRec.getSublistValue({// INICIO DE VIGÊNCIA
                            sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                            fieldId: 'custrecord_air_begindate_rc_dt',
                            line: 0
                        })

                    //DATA DE INÍCIO DE VIGÊNCIA DO CONTRATO
                    _beginContractDate = newRec.getValue({fieldId: 'custrecord_rey_begincontractdate_dt'})
                    if(!_beginContractDate && _beginValidyContract)
                    {
                        newRec.setValue({
                            fieldId: 'custrecord_rey_begincontractdate_dt',
                            value: _beginValidyContract
                        })
                    }
                }



                if(discountTotalAmount)// put discount in vigence
                {
                    let _vigenceCount = newRec.getLineCount({sublistId: 'recmachcustrecord_air_vigence_rc_ls'})
                    let _beginDate = newRec.getValue({fieldId: 'custrecord_rey_conc_dateincl_dt'})

                    for (let int4 = 0; int4 < _vigenceCount; int4++) 
                    {
                        let _beginDateVigence = newRec.getSublistValue({//begin date
                                sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                                fieldId: 'custrecord_air_begindate_rc_dt',
                                line: int4
                            }) 

                        if(_beginDateVigence.getDate() == _beginDate.getDate() &&
                            _beginDateVigence.getMonth() == _beginDate.getMonth() && 
                            _beginDateVigence.getFullYear() == _beginDate.getFullYear())
                        {
                            newRec.setSublistValue({//Valor com Reajuste
                                sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                                fieldId: 'custrecord_air_amountcontractren_rc_dt',
                                value: valueWithReadjustment,// VALOR DO SERVIÇO FINAL
                                line: int4
                            })

                            newRec.setSublistValue({//Disconto Valor
                                sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                                fieldId: 'custrecord_air_discount_rc_cr',
                                value: doRound(discountTotalAmount, 2) ,
                                line: int4
                            })
                            
                            newRec.setSublistValue({//Disconto %
                                sublistId: 'recmachcustrecord_air_vigence_rc_ls',
                                fieldId: 'custrecord_air_discountpercent_rc_pr',
                                value: percentageTotal / qunatityPercentage,
                                line: int4
                            })
                        }
                        
                    }

                }

              
                log.debug('beforeSubmit - Valor Total do Contrato', totalValue.toFixed(2))
                newRec.setValue({
                    fieldId: 'custrecord_rey_conc_amountyearcontra_cu',
                    value: totalValue.toFixed(2)
                })

                log.debug('beforeSubmit - Valor total serviço recorrentes', _recurrentTotalValue.toFixed(2))
                newRec.setValue({
                    fieldId: 'custrecord_rey_totalrecorrente__nu',
                    value: _recurrentTotalValue.toFixed(2)
                })

                log.debug('beforeSubmit - Valor total serviço não recorrente', _noRecurrentTotalValue.toFixed(2))
                newRec.setValue({
                    fieldId: 'custrecord_rey_totalnaorecorrente__nu',
                    value: _noRecurrentTotalValue.toFixed(2)
                })

                log.debug('beforeSubmit - VALOR DA PARCELA DE SERVIÇO RECORRENTE', unitValueWithReadjustment.toFixed(2))
                newRec.setValue({
                    fieldId: 'custrecord_rey_conc_amount_contract_cu',
                    value: unitValueWithReadjustment.toFixed(2)
                })

                let governanceUsage = runtime.getCurrentScript().getRemainingUsage();
                log.debug('beforeSubmit - governança Disponível', governanceUsage)

                let _messageSucess = newRec.getValue({fieldId: 'custrecord_rey_concl_checkreadjust_cb'})

                if(!_messageSucess)
                    newRec.setValue({
                        fieldId: 'custrecord_rey_concl_checkreadjust_cb',
                        value: 'Contract salvo com sucesso.'
                    })
                    
                log.debug('beforeSubmit - end', type + ' -----------------------------------------------------------------')
            } 
            catch (error) 
            {
                log.debug('ERROR', error.toString())

                newRec.setValue({
                    fieldId: 'custrecord_rey_concl_messageerror_cb',
                    value: error.toString()
                })

                log.debug('beforeSubmit - end', '-----------------------------------------------------------------')
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        function afterSubmit (scriptContext)
        {
            const oldRec = scriptContext.oldRecord;
            const newRec = scriptContext.newRecord;
            // log.debug('afterSubmit - newRec', JSON.stringify(newRec))
            const type = scriptContext.type;
            try 
            {
                log.debug('afterSubmit - begin', '-----------------------------------------------------------------')
                
                //DATA DE INÍCIO DE FATURAMENTO
                let _startDate = newRec.getValue({fieldId: 'custrecord_rey_conc_datestart_dt'})
                if(!_startDate)
                    return
                    
                let _monthReajust = newRec.getValue("custrecord_rey_conc_monthsreadjust_vl")//MESES PARA REAJUSTE
                let _startDateContract = newRec.getValue("custrecord_rey_conc_datestart_dt")//DATA DE INÍCIO DE FATURAMENTO
                log.debug({ title: "_startDateContract", details: _startDateContract})
                //VALOR TOTAL DO CONTRATO
                let _totalContract = newRec.getValue("custrecord_rey_conc_amountyearcontra_cu")
                //VALOR TOTAL SERVIÇO RECORRENTE
                let _totalRecurrency = newRec.getValue("custrecord_rey_totalrecorrente__nu")
                //VALOR TOTAL SERVIÇO NÃO RECORRENTE
                let _totalNoRecurrency = newRec.getValue("custrecord_rey_totalnaorecorrente__nu")

                let _vigenceList = []
                let totalValue = 0
                let _recurrentTotalValue = 0
                let _noRecurrentTotalValue = 0

                search.create({
                    type: "customrecord_air_recurrency_rc",
                    filters: [["custrecord_air_vigence_rc_ls","anyof",newRec.id]],
                    columns: ["custrecord_air_begindate_rc_dt"]
                }).run().each(function(result){
                    _vigenceList.push(result)
                    return true;
                });

                if(!_vigenceList.length)
                    return

                search.create({
                    type: "customrecord_rey_conl_contractline",
                    filters: [["custrecord_rey_conl_contractline_ms", "anyof", newRec.id]],
                    columns:[]
                }).run().each(function(result){
                    log.debug('afterSubmit - result', result)

                    if(result.id)
                    {
                        let contractLine = record.load({
                                type: 'customrecord_rey_conl_contractline',
                                id: result.id,
                                isDynamic: true
                            })
                        
                        //USER EVENT dont resele other USER EVENT (same logic "REY_ChangeLineContract_UE")
                        let lineCount = contractLine.getLineCount({sublistId: 'recmachcustrecord_air_fre_frequency_lr'})
                        // log.debug('afterSubmit - lineCount_frequency', lineCount)
                        if(lineCount == 0)
                        {
                            // log.debug({ title: "_startDate", details: _startDate});
                            // let _indice = newRec.getValue({fieldId: 'custrecord_rey_conc_indice_ms'})

                            let _recurrent = contractLine.getValue({fieldId: 'custrecord_rey_conl_agroup_recurrent_cb'})// recorrente
                            let _blockedToInvoice = contractLine.getValue({fieldId: 'custrecord_rey_conl_endcontractline_cb'})// BLOQUEIA FATURAMENTO
                            // log.debug({ title: "_blockedToInvoice", details: _blockedToInvoice});
                            let _quantity = contractLine.getValue("custrecord_rey_conl_item_quantity_nu")//Quantidade do item
                            let _amount = contractLine.getValue("custrecord_rey_conl_amountcontract_cu")//Valor do Serviço
                            let _amountTotal = contractLine.getValue("custrecord_rey_valor_serv_final_cu")//Valor do Serviço Final
                            let _beginDateLineContract = contractLine.getValue({fieldId: 'custrecord_rey_conl_begindateinvoice_dt'})// Data Inicio de vigência
                            log.debug({ title: "_beginDateLineContract", details: _beginDateLineContract})
                            let _monthDifference = 0
                            let _quantityToInvoice

                            let _finalTotoalValue = contractLine.getValue({fieldId: 'custrecord_rey_valor_serv_final_cu'})
                            // log.debug({ title: "_finalTotoalValue", details: _finalTotoalValue})
                            totalValue += _finalTotoalValue
                            
                            if(_recurrent)
                                _recurrentTotalValue += parseFloat(_finalTotoalValue)
                            else
                                _noRecurrentTotalValue += parseFloat(_finalTotoalValue)

                            if(_beginDateLineContract)
                            {
                                _monthDifference = monthDiff(_startDateContract, _beginDateLineContract)
                                // log.debug({ title: "_monthDifference", details: _monthDifference});
                                _monthDifference = _monthDifference == 0 ? 0 : _monthDifference
                                _quantityToInvoice = _recurrent ? _quantity - _monthDifference : _quantity

                                if(_monthDifference)//Quantidade do item
                                {
                                    //	Quantidade do item
                                    // contractLine.setValue({fieldId: "custrecord_rey_conl_item_quantity_nu", value: _quantity})
                                    //Valor Total do Item
                                    // contractLine.setValue({fieldId: "custrecord_rey_conl_agroup_totalitem_cr", value: _quantity * _amount})
                                    //Valor do Serviço Final
                                    // contractLine.setValue({fieldId: "custrecord_rey_valor_serv_final_cu", value: _quantity * _amount})
                                }
                            }

                            log.debug({ title: "_monthDifference", details: _monthDifference})

                            contractLine.setValue({//Quantidade Restante a Faturar
                                fieldId: 'custrecord_rey_conl_quantity_invoc_nu',
                                value: !_recurrent ? _quantity : _quantityToInvoice
                            })
    
                            contractLine.setValue({//Quantidade a Faturar
                                fieldId: 'custrecord_rey_conl_quantity_nu',
                                value: _quantityToInvoice
                            })
    
                            contractLine.setValue({//Valor Restante a Faturar
                                fieldId: 'custrecord_rey_conl_agroup_billedrecu_nu',
                                value: (_quantityToInvoice * _amount).toFixed(2)
                            })

                            if(!_blockedToInvoice && _recurrent)//Qtd.Liberada
                                contractLine.setValue({
                                        fieldId: 'custrecord_rey_conl_qtdliberadadem_ds', 
                                        value: _quantityToInvoice || _quantity
                                    })

                            let _index = 0

                            for (let int = 0; int < _quantity; int++) 
                            {
                                contractLine.selectNewLine({sublistId: 'recmachcustrecord_air_fre_frequency_lr'})
                                
                                if(_recurrent && _monthDifference && _monthDifference >= int+1)
                                {
                                    contractLine.setCurrentSublistValue({//Inativo
                                        sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                        fieldId: 'custrecord_air_fre_inactive_cb',
                                        value: true
                                    })
                                    
                                    contractLine.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                        fieldId: 'custrecord_rey_freq_status_lr',
                                        value: 3
                                    })
                                }    
                                else
                                {
                                    let _status
                                    if(_recurrent && !_blockedToInvoice)// recorrente
                                        _status = 1 // liberado
                                    else if(!_recurrent && !_blockedToInvoice)
                                        _status = 2 // Pendente
                                    else
                                        _status = ''

                                    // if(!_blockedToInvoice)
                                        contractLine.setCurrentSublistValue({
                                                sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                                fieldId: 'custrecord_rey_freq_status_lr',
                                                value: _status
                                            })

                                }

                                contractLine.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                    fieldId: 'custrecord_air_fre_line_lr',
                                    value: (int+1),
                                })
                                
                                //DATA DE INÍCIO DE FATURAMENTO
                                let _startDate =_vigenceList[0].getValue('custrecord_air_begindate_rc_dt')
                                _startDate = format.parse({value: _startDate, type: format.Type.DATE})

                                let _nextMonth = addMonths(_startDate, int)
                                    
                                // log.debug({ title: int + " _nextMonth", details: _nextMonth});
                                let _dueDateText = format.format({value: _nextMonth, type: format.Type.DATE})
                                // log.debug({  title: int + " _dueDateText", details: _dueDateText});

                               
                                if(_recurrent)
                                {
                                    contractLine.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                        fieldId: 'name',
                                        value: _dueDateText
                                    })
    
                                    contractLine.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                        fieldId: 'custrecord_air_fre_duedate_dt',
                                        value: _nextMonth
                                    })
                                    
                                }
                                else
                                {
                                    contractLine.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                        fieldId: 'name',
                                        value: ''
                                    })
                                }

                                contractLine.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                    fieldId: 'custrecord_rey_freq_value_dec',
                                    value: _amount,
                                })
                                
                                // log.debug({ title: int + " vegencia", details: (int / _monthReajust) == (_index+1)});
                                // log.debug({ title: int + " (int / _monthReajust)", details: (int / _monthReajust)});

                                if((int / _monthReajust) == (_index+1))
                                    _index++
                                    
                                contractLine.setCurrentSublistValue({// Vigência
                                    sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                    fieldId: 'custrecord_air_fre_vigency_lr',
                                    value: _recurrent ? _vigenceList[_index].id : _vigenceList[0].id,
                                })

                                contractLine.setCurrentSublistValue({// Contrato
                                    sublistId: 'recmachcustrecord_air_fre_frequency_lr',
                                    fieldId: 'custrecord_air_fre_contract_lr',
                                    value: newRec.id,
                                })

                                contractLine.commitLine({sublistId: 'recmachcustrecord_air_fre_frequency_lr'})
                            }
    
                            let contractLineId  = contractLine.save()
                            log.debug('afterSubmit - Parcelamento Criado!', contractLineId)
                        }
                    }
                    else
                    {
                        log.debug('afterSubmit - getContracLineId', 'sem id')
                    }
                    
                    return true;
                })
                
                if(totalValue)
                {
                    record.submitFields({
                        type: newRec.type,
                        id: newRec.id,
                        values: {
                            custrecord_rey_conc_amountyearcontra_cu: totalValue + parseFloat(_totalContract),
                            custrecord_rey_totalrecorrente__nu: _recurrentTotalValue + parseFloat(_totalRecurrency),
                            custrecord_rey_totalnaorecorrente__nu: _noRecurrentTotalValue + parseFloat(_totalNoRecurrency)
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields : true
                        }
                    })
                }

                let governanceUsage = runtime.getCurrentScript().getRemainingUsage();
                log.debug('governança Disponível', governanceUsage)
                
                log.debug('afterSubmit - end', '-----------------------------------------------------------------')
               
            } 
            catch (error) 
            {
                log.debug('afterSubmit ERROR', error.toString())
                log.debug('afterSubmit - end', '-----------------------------------------------------------------')

                record.submitFields({
                    type: newRec.type,
                    id: newRec.id,
                    values: {
                        custrecord_rey_concl_messageerror_as_cb: error.toString()
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields : true
                    }
                })

            }
        }

        function addMonths(date, months) {
            var d = date.getDate();
            date.setMonth(date.getMonth() + +months);
            if (date.getDate() != d) {
              date.setDate(0);
            }
            return date;
        }

        function monthDiff(d1, d2) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth();
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        }

        function doRound(amount, decimalPlates) 
        {
            if (!amount)
                return 0;
                
            if (decimalPlates < 0 || decimalPlates == undefined || decimalPlates == null)
                decimalPlates = 2;

            var amountRounded = Number(Math.round(amount+'e'+decimalPlates)+'e-'+decimalPlates)

            return amountRounded;
        }

        return { beforeLoad, beforeSubmit, afterSubmit }

    });
