/**
 * @NApiVersion 2.x
 * @NScriptType Portlet
 * @NModuleScope SameAccount
 */
define(['N/search'],

function(search) {
   
    /**
     * Definition of the Portlet script trigger point.
     * 
     * @param {Object} params
     * @param {Portlet} params.portlet - The portlet object used for rendering
     * @param {number} params.column - Specifies whether portlet is placed in left (1), center (2) or right (3) column of the dashboard
     * @param {string} params.entity - (For custom portlets only) references the customer ID for the selected customer
     * @Since 2015.2
     */
    function render(params) {
    	
    	var isDetail = (params.column == 2);
    	
    	var portlet = params.portlet;
    	
    	portlet.title = isDetail ? "My Detailed List" : "My List";
    	
    	portlet.addColumn({
	    	id: 'internalid',
	    	type: 'text',
	    	label: 'Number',
	    	align: 'LEFT'
    	});
    	
    	portlet.addColumn({
	    	id: 'entityid',
	    	type: 'text',
	    	label: 'ID',
	    	align: 'LEFT'
    	});
    	
    	if (isDetail) {
    		
	    	portlet.addColumn({
		    	id: 'email',
		    	type: 'text',
		    	label: 'E-mail',
		    	align: 'LEFT'
	    	});
	    	
    	}
    	
    	var filter = search.createFilter({
    		name: 'email',
    		operator: search.Operator.ISNOTEMPTY
    	});
    	
    	var customerSearch = search.create({
    		type: 'customer',
    		filters: filter,
    		columns: ['internalid', 'entityid', 'email']
    	});
    	
    	var count = isDetail ? 15 : 5;
    	
    	customerSearch.run().each(function(result) {
    		
    		portlet.addRow(result.getAllValues());
    		return --count > 0;
    		
    	});
    	
    }

    return {
        render: render
    };
    
});
