/**
 * @NApiVersion 2.x
 * @NScriptType SuiteLet
 * @NModuleScope SameAccount
 */
define([
	'N/render',
	'N/file',
	'N/record',
	'N/url',
	'N/search',
	'N/runtime',
	'./Script_Searches.js',
	'./EletrItemInvoiveProcess/Script_EletrItemInvProc_Messages.js'
],

function(
	render,
	file,
	record,
	url,
	search,
	runtime,
	scriptsearches,
	eletrItemInvProcMessages
) {

	/**
     * Definition of the SuiteLet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the SuiteLet response
     * @Since 2015.2
     */
	function onRequest(context){

		var request = context.request;
		var response = context.response;
    	var _id = request.parameters['eletrid'];    // retrieve parameters from url
		var _layout = request.parameters['layout'];
		var _savePDF = request.parameters['savePDF'];		
		var brSetup = scriptsearches.brsetup();

		doValidations(brSetup, _layout);
		
		/////////////////////////////////////////////File Link//////////////////////////////////////////////////////
    	if (_layout == 1){
    		var _file = file.load(brSetup.layoutDanfePortrait);
    	}else if(_layout == 2){
    		var _file = file.load(brSetup.layoutDanfeLandscape);
		}
		
    	////////////////////////////////////////General Renderer///////////////////////////////////////////////////
		var renderer = new render.create();
		renderer.templateContent = _file.getContents();

	  	/////////////////////////Eletro. Item Invo. Proc. Records Loader/ Renderer//////////////////////////////////
		var _eletrItemInvoiceProcess = record.load({
        	type: 'customrecord_mts_eletiteminvproc',
			id: _id
    	});

		renderer.addRecord({
			templateName: "eletrItem",
			record: _eletrItemInvoiceProcess
		});

    	////////////////////////////////////////////////////////////////////////////////////////////////////////////
    	////////////////////////////////TAG's Records Loaders/ TAG's Renderers//////////////////////////////////////
    	////////////////////////////////////////////////////////////////////////////////////////////////////////////

	    // TAG B START
    	var lvTagBCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb'});
    	if (lvTagBCount) {
	    	var lvTagBInternalId = _eletrItemInvoiceProcess.getSublistValue({
		          sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagb',
		          fieldId: 'id',
		          line: 0
			});
	    	var lvTagB;
    	}
    	if (lvTagBInternalId) {
	    	var lvTagB = record.load({
	        	type: 'customrecord_mts_nfetagb',
				id: lvTagBInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagB",
				record: lvTagB
			});
    	}
	    // TAG B   END

    	// TAG C START
    	var lvTagCCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc'});
    	if (lvTagCCount) {
	    	var lvTagCInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eleinvno_nfetagc',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagC;
    	}
    	if (lvTagCInternalId) {
	    	var lvTagC = record.load({
	        	type: 'customrecord_mts_nfetagc',
				id: lvTagCInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagC",
				record: lvTagC
			});
    	}
    	// TAG C   END

		// TAG D START
    	var lvTagDCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagd'});
    	if (lvTagDCount) {
	    	var lvTagDInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagd',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagD;
    	}
    	if (lvTagDInternalId) {
	    	var lvTagD = record.load({
	        	type: 'customrecord_mts_nfetagd',
				id: lvTagDInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagD",
				record: lvTagD
			});
    	}
    	// TAG D   END

		// TAG E START
    	var lvTagECount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage'});
    	if (lvTagECount) {
	    	var lvTagEInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetage',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagE;
    	}
    	if (lvTagEInternalId) {
	    	var lvTagE = record.load({
	        	type: 'customrecord_mts_nfetage',
				id: lvTagEInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagE",
				record: lvTagE
			});
    	}
    	// TAG E   END

		// TAG F START
    	var lvTagFCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eleinvno_nfetagf'});
    	if (lvTagFCount) {
    		var lvTagFInternalId = _eletrItemInvoiceProcess.getSublistValue({
    			sublistId: 'recmachcustrecord_mts_eleinvno_nfetagf',
    			fieldId: 'id',
    			line: 0
    		});
    		var lvTagF;
		}
    	if (lvTagFInternalId) {
    		var lvTagF = record.load({
    			type: 'customrecord_mts_nfetagf',
    			id: lvTagFInternalId
	    	});
    		renderer.addRecord({
    			templateName: "lvTagF",
    			record: lvTagF
    		});
		}
    	// TAG F   END

    	// TAG G START
    	var lvTagGCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_nfetagg'});
    	if (lvTagGCount) {
	    	var lvTagGInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletinvno_nfetagg',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagG;
    	}
    	if (lvTagGInternalId) {
	    	var lvTagG = record.load({
	        	type: 'customrecord_mts_nfetagg',
				id: lvTagGInternalId
	    	});
	    	renderer.addRecord({
				templateName: "lvTagG",
				record: lvTagG
			});
    	}
    	// TAG G   END

		// TAG GA START
    	var lvTagGACount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagga'});
    	if (lvTagGACount) {
	    	var lvTagGAInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagga',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagGA;
    	}
    	if (lvTagGAInternalId) {
	    	var lvTagGA = record.load({
	        	type: 'customrecord_mts_nfetagga',
				id: lvTagGAInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagGA",
				record: lvTagGA
			});
    	}
    	// TAG GA  END

		// TAG I START
    	var lvTagICount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_nfetagi'});
    	if (lvTagICount) {
	    	var lvTagIInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletinvno_nfetagi',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagI;
    	}
    	if (lvTagIInternalId) {
	    	var lvTagI = record.load({
	        	type: 'customrecord_mts_nfetagi',
				id: lvTagIInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagI",
				record: lvTagI
			});
    	}
    	// TAG I  END

		// TAG I NVE START
    	var lvTagINVECount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletrinvno_nfetaginve'});
    	if (lvTagINVECount) {
	    	var lvTagINVEInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletrinvno_nfetaginve',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagINVE;
    	}
    	if (lvTagINVEInternalId) {
	    	var lvTagINVE = record.load({
	        	type: 'customrecord_mts_nfetaginve',
				id: lvTagINVEInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagINVE",
				record: lvTagINVE
			});
    	}
    	// TAG I NVE  END

		// TAG I80 START
    	var lvTagI80Count = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_nfetagi80'});
    	if (lvTagI80Count) {
	    	var lvTagI80InternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletinvno_nfetagi80',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagI80;
    	}
    	if (lvTagI80InternalId) {
	    	var lvTagI80 = record.load({
	        	type: 'customrecord_mts_nfetagi80',
				id: lvTagI80InternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagI80",
				record: lvTagI80
			});
    	}
    	// TAG I80  END

		// TAG K START
    	var lvTagKCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_nfetagk'});
    	if (lvTagKCount) {
	    	var lvTagKInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletinvno_nfetagk',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagK;
    	}
    	if (lvTagKInternalId) {
	    	var lvTagK = record.load({
	        	type: 'customrecord_mts_nfetagk',
				id: lvTagKInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagK",
				record: lvTagK
			});
    	}
    	// TAG K   END

		// TAG N START
    	var lvTagNCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagn'});
    	if (lvTagNCount) {
	    	var lvTagNInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagn',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagN;
    	}
    	if (lvTagNInternalId) {
	    	var lvTagN = record.load({
	        	type: 'customrecord_mts_nfetagn',
				id: lvTagNInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagN",
				record: lvTagN
			});
    	}
    	// TAG N   END

		// TAG O START
    	var lvTagOCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetago'});
    	if (lvTagOCount) {
	    	var lvTagOInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetago',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagO;
    	}
    	if (lvTagOInternalId) {
	    	var lvTagO = record.load({
	        	type: 'customrecord_mts_nfetago',
				id: lvTagOInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagO",
				record: lvTagO
			});
    	}
    	// TAG O   END

		// TAG P START
    	var lvTagPCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletroninvno_nfetagp'});
    	if (lvTagPCount) {
	    	var lvTagPInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletroninvno_nfetagp',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagP;
    	}
    	if (lvTagPInternalId) {
	    	var lvTagP = record.load({
	        	type: 'customrecord_mts_nfetagp',
				id: lvTagPInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagP",
				record: lvTagP
			});
    	}
    	// TAG P   END

		// TAG Q START
    	var lvTagQCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_nfetagq'});
    	if (lvTagQCount) {
	    	var lvTagQInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletinvno_nfetagq',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagQ;
    	}
    	if (lvTagQInternalId) {
	    	var lvTagQ = record.load({
	        	type: 'customrecord_mts_nfetagq',
				id: lvTagQInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagQ",
				record: lvTagQ
			});
    	}
    	// TAG Q   END

		// TAG S START
    	var lvTagSCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eltronicinvoiceno_nfetags'});
    	if (lvTagSCount) {
	    	var lvTagSInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eltronicinvoiceno_nfetags',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagS;
    	}
    	if (lvTagSInternalId) {
	    	var lvTagS = record.load({
	        	type: 'customrecord_mts_nfetags',
				id: lvTagSInternalId
	    	});
	    	renderer.addRecord({
				templateName: "lvTagS",
				record: lvTagS
			});
    	}
    	// TAG S   END

		// TAG U START
    	var lvTagUCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagu'});
    	if (lvTagUCount) {
	    	var lvTagUInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletrinvno_nfetagu',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagU;
    	}
    	if (lvTagUInternalId) {
	    	var lvTagU = record.load({
	        	type: 'customrecord_mts_nfetagu',
				id: lvTagUInternalId
	    	});
	    	renderer.addRecord({
				templateName: "lvTagU",
				record: lvTagU
			});
    	}
    	// TAG U   END

        // TAG V START
        
        var tagVTexts = [];

        search.create({
            type: "customrecord_mts_nfetagi",
            filters: [
                ["custrecord_mts_eletinvno_nfetagi", "is", _id + ""],
            ],
            columns:[
                search.createColumn({name: "custrecord_mts_prodaddinfo_nfetagv", join: "CUSTRECORD_MTS_NFETAGI_NFETAGV"})
            ]
        }).run().each(function(result){
            productAdditionalInformation = result.getValue({name: "custrecord_mts_prodaddinfo_nfetagv", join: "CUSTRECORD_MTS_NFETAGI_NFETAGV"});
            tagVTexts.push(productAdditionalInformation);
            return true;
        });

        var lvTagV = {};
        lvTagV.productAdditionalInformation = tagVTexts;

        renderer.addCustomDataSource({
            format: render.DataSource.OBJECT,
            alias: "lvTagV",
            data: lvTagV
        });

    	// var lvTagVCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagv'});
    	// if (lvTagVCount) {
	    // 	var lvTagVInternalId = _eletrItemInvoiceProcess.getSublistValue({
	    //       sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagv',
	    //       fieldId: 'id',
	    //       line: 0
	    // 	});
	    // 	var lvTagV;
    	// }
    	// if (lvTagVInternalId) {
	    // 	var lvTagV = record.load({
	    //     	type: 'customrecord_mts_nfetagv',
		// 		id: lvTagVInternalId
	    // 	});
	    // 	renderer.addRecord({
		// 		templateName: "lvTagV",
		// 		record: lvTagV
		// 	});
    	// }
    	// TAG V   END

		// TAG X START
    	var lvTagXCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx'});
	    if (lvTagXCount) {
	    	var lvTagXInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletinvno_nfetagx',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagX;
    	}
	    if (lvTagXInternalId) {
	    	var lvTagX = record.load({
	        	type: 'customrecord_mts_nfetagx',
				id: lvTagXInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagX",
				record: lvTagX
			});
    	}
    	// TAG X   END

		// TAG Y START
    	var lvTagYCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletronicinvoicen_nfetagy'});
    	if (lvTagYCount) {
	    	var lvTagYInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletronicinvoicen_nfetagy',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagY;
    	}
    	if (lvTagYInternalId) {
	    	var lvTagY = record.load({
	        	type: 'customrecord_mts_nfetagy',
				id: lvTagYInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagY",
				record: lvTagY
			});
    	}
    	// TAG Y   END

		// TAG YA START
    	var lvTagYACount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_nfetagya'});
    	if (lvTagYACount) {
	    	var lvTagYAInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletinvno_nfetagya',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagYA;
    	}
    	if (lvTagYAInternalId) {
	    	var lvTagYA = record.load({
	        	type: 'customrecord_mts_nfetagya',
				id: lvTagYAInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagYA",
				record: lvTagYA
			});
    	}
    	// TAG YA   END

		// TAG Z START
    	var lvTagZCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_nfetagz'});
    	if (lvTagZCount) {
	    	var lvTagZInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletinvno_nfetagz',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagZ;
    	}
    	if (lvTagZInternalId) {
	    	var lvTagZ = record.load({
	        	type: 'customrecord_mts_nfetagz',
				id: lvTagZInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagZ",
				record: lvTagZ
			});
    	}
    	// TAG Z   END

		// TAG ZA START
    	var lvTagZACount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_nfetagza'});
    	if (lvTagZACount) {
	    	var lvTagZAInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletinvno_nfetagza',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagZA;
    	}
    	if (lvTagZAInternalId) {
	    	var lvTagZA = record.load({
	        	type: 'customrecord_mts_nfetagza',
				id: lvTagZAInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagZA",
				record: lvTagZA
			});
    	}
    	// TAG ZA   END

		// TAG ZB START
    	var lvTagZBCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagzb'});
    	if (lvTagZBCount) {
	    	var lvTagZBInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletronicinvno_nfetagzb',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagZB;
    	}
    	if (lvTagZBInternalId) {
	    	var lvTagZB = record.load({
	        	type: 'customrecord_mts_nfetagzb',
				id: lvTagZBInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagZB",
				record: lvTagZB
			});
    	}
    	// TAG ZB   END

		// TAG W START
    	var lvTagWCount = _eletrItemInvoiceProcess.getLineCount({sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw'});
    	if (lvTagWCount) {
	    	var lvTagWInternalId = _eletrItemInvoiceProcess.getSublistValue({
	          sublistId: 'recmachcustrecord_mts_eletinvno_nfetagw',
	          fieldId: 'id',
	          line: 0
	    	});
	    	var lvTagW;
    	}
    	if (lvTagWInternalId) {
	    	var lvTagW = record.load({
	        	type: 'customrecord_mts_nfetagw',
				id: lvTagWInternalId
	    	});
			renderer.addRecord({
				templateName: "lvTagW",
				record: lvTagW
			});
    	}
        // TAG W   END
        
        // WATERMARK START

        var waterMark = {};
        waterMark.imageLink = '';

        var protocol = _eletrItemInvoiceProcess.getValue({
            fieldId: 'custrecord_mts_protocol_eletiteminvproc'
        });

        var returnCodeType = '';
        var negative = false;
        var returnCode = _eletrItemInvoiceProcess.getValue({
            fieldId: 'custrecord_mts_retcode_eletiteminvproc'
        });

        if(returnCode){
            var returnCodeRec = record.load({
                type: 'customrecord_mts_returncode',
                id: returnCode
            });

            returnCodeType = returnCodeRec.getValue({
                fieldId: 'custrecord_mts_type_returncode'
            });

            negative = returnCodeRec.getValue({
                fieldId: 'custrecord_mts_negativereturn_returncode'
            });
        }

        if(!protocol || returnCodeType == 1 || negative == true){

            var output = url.resolveDomain({
                hostType: url.HostType.APPLICATION,
                accountId: runtime.accountId.toLowerCase().toString()
            });

            waterMark.imageLink = file.load(brSetup.watermarkNoFiscalValue).url.toString();
            waterMark.imageLink = "https://" + output + waterMark.imageLink;
        }

        renderer.addCustomDataSource({
            format: render.DataSource.OBJECT,
            alias: "waterMark",
            data: waterMark
        });

        // WATERMARK END

		//SUBSIDIARY START
    	var branchInfo = record.load({
    		type: 'customrecord_mts_branchinfo',
    		id: _eletrItemInvoiceProcess.getValue({fieldId: 'custrecord_mts_branch_eletiteminvproc'})
    	})

    	var subs = record.load({
    		type:'subsidiary',
    		id: branchInfo.getValue({fieldId: 'custrecord_mts_subsidiary_branchinfo'})
    	});
    	renderer.addRecord({
    		templateName: 'subsidiary',
    		record: subs
    	});
			//SUBSIDIARY END
			if(_savePDF== 'true'){
				var nfekeyacess =_eletrItemInvoiceProcess.getValue({fieldId:'custrecord_mts_nfekeyace_eletiteminvproc'})
				var invoicePdf = renderer.renderAsPdf();
				invoicePdf.name = nfekeyacess+'.pdf'
				invoicePdf.folder = -12
				var fileId = invoicePdf.save();
				_eletrItemInvoiceProcess.setValue({fieldId:'custrecord_mts_idpdf_eletiteminvproc',value:fileId,ignoreFieldChange: true});
				_eletrItemInvoiceProcess.save();
			}else{
				renderer.renderPdfToResponse(response);
			}
	}
	
	function doValidations(brSetup, danfeLayout) {
		if (danfeLayout == 1){
			if (!brSetup.layoutDanfePortrait)
				throw new Error(eletrItemInvProcMessages.getFieldEmptyInSetupTable("Layout DANFE Retrato", "BR Setup") );

    	}else if(danfeLayout == 2){
			if (!brSetup.layoutDanfeLandscape)
				throw new Error(eletrItemInvProcMessages.getFieldEmptyInSetupTable("Layout DANFE Paisagem", "BR Setup") );
		}

		if (!brSetup.watermarkNoFiscalValue)
			throw new Error(eletrItemInvProcMessages.getFieldEmptyInSetupTable("Marca D'água DANFE", "BR Setup") );
	}

	return{

		onRequest: onRequest

	};
});