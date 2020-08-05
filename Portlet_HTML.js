/**
 * @NApiVersion 2.x
 * @NScriptType Portlet
 * @NScriptPortletType form
 * @NModuleScope SameAccount
 */
define(['./Script_HTML'],

function(html) {
   
    /**
     * Definition of the Portlet script trigger point.
     * 
     * @param {Object} params
     * @param {Portlet} params.portlet - The portlet object used for rendering
     * @param {number} params.column - Specifies whether portlet is placed in left (1), center (2) or right (3) column of the dashboard
     * @param {string} params.entity - (For custom portlets only) references the customer ID for the selected customer
     * @Since 2015.2
     */
    function render(params) 
    {
    	params.portlet.title = 'My Portlet Test';
    	var content = html();
    	
    	
    	params.portlet.html = content;
    	
    }

    return {
        render: render
    };
    
});
