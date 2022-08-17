/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/render', 'N/file', 'N/record', 'N/config', 'N/url', 'N/runtime', 'N/search'],

function(render, file, record, config, url, runtime, search) {
   
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
		switch (context.request.method) 
		{
			case 'GET':
				handleGet(context);
				break;
			case 'POST':
				handlePost(context);
				break;
			default:
				context.response.write({
					output: "Unsupported method: " + context.request.method
				})
		}// end switch
		
	} 
	
	function handleGet(context) 
	{
		try {
			var renderer = new render.create();
			
			var objAux = {};
			var mySearch = search.create({
				type: "customrecord_mts_brsetup",
				columns: ["custrecord_layout_nfce"]
			});
			
			var resultCount = mySearch.runPaged().count;
			if (resultCount) {
				mySearch.run().each(function(result){
					objAux = {};
					objAux.layoutnfce = result.getValue({name: 'custrecord_layout_nfce'});
				});			
			}
    		
    		var xmlTemplateFile = file.load(objAux.layoutnfce);
    		renderer.templateContent = xmlTemplateFile.getContents();
    		
    		var electrProcessId = context.request.parameters['eletrid'];// retrieve parameters from url
    		
    		var recElectrInvProcess = record.load({
    			type: 'customrecord_mts_eletiteminvproc',
    			id: electrProcessId
    		});
    		
    		renderer.addRecord({// add sales order
    			templateName: 'recElectrInvProcess', 
    			record: recElectrInvProcess
    		});
    		
    		var fieldLookUp = search.lookupFields({
				type: search.Type.INVOICE,
				id: recElectrInvProcess.getValue({fieldId: 'custrecord_mts_trans_eletiteminvproc'}),
				columns: ['custbody_mts_change']
			});
    		
    		renderer.addCustomDataSource({
    			format: render.DataSource.OBJECT,
    			alias: "obj",
    			data: {change: fieldLookUp.custbody_mts_change}
			});   

    		renderer.renderPdfToResponse(context.response);
      		
		} catch (e) {
			log.error({title: e.name, details: e});
			throw e;
		}
	}
	
	function handlePost(context) 
	{
		
	}


    return {
        onRequest: onRequest
    };
    
});
