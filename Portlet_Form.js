/**
 * @NApiVersion 2.x
 * @NScriptType Portlet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/format'],

function(serverWidget, format) {
   
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
    	var portletObj = params.portlet;
    	portletObj.title = 'Test Form Portlet';
    	
    	setComponentsForResize();
    	setComponentsForRefresh();
    	
    	portletObj.clientScriptModulePath = './ClientScript_PortletForm.js';
    	
    	function setComponentsForResize() 
    	{
	    	var DEFAULT_HEIGHT = '50';
	    	var DEFAULT_WIDTH = '50';
	    	
	    	var inlineHTMLField = portletObj.addField({
		    	id: 'divfield',
		    	type: 'inlinehtml',
		    	label: 'Test inline HTML'
	    	});
	    	
	    	inlineHTMLField.defaultValue = "<div id='divfield_elem' style='border: 1px dotted red; height:" 
													+ DEFAULT_HEIGHT + "px; width: " + DEFAULT_WIDTH + "px'></div>"
	    	
	    	inlineHTMLField.updateLayoutType({
	    		layoutType: 'normal'
	    	});
	    	inlineHTMLField.updateBreakType({
	    		breakType: 'startcol'
	    	});
	    	
	    	var resizeHeight = portletObj.addField({
		    	id: 'resize_height',
		    	type: 'text',
		    	label: 'Resize Height'
	    	});
	    	resizeHeight.defaultValue = DEFAULT_HEIGHT;
	    	
	    	var resizeWidth = portletObj.addField({
		    	id: 'resize_width',
		    	type: 'text',
		    	label: 'Resize Width'
	    	});
	    	resizeWidth.defaultValue = DEFAULT_WIDTH;
	    	
	    	var resizeLink = portletObj.addField({
		    	id: 'resize_link',
		    	type: serverWidget.FieldType.INLINEHTML,
		    	label: 'Resize link'
	    	});
	    	resizeLink.defaultValue = resizeLink.defaultValue = 
	    			"<style>" +
		    			".btn {" +
			    			"text-decoration: none;" +
			    			"color: #fff;" +
			    			"background-color: #337ab7;" +
			    			"display: inline-block;" +
			    			"padding: 6px 12px;" +
			    			"margin-bottom: 0;" +
			    			"font-size: 14px;" +
			    			"font-weight: normal; " +
			    			"line-height: 1.42857143;" +
			    			"text-align: center;" +
			    			"vertical-align: middle;" +
			    			"border: 1px solid transparent;" +
			    			"border-radius: 4px;" +
			    			"border-color: #2e6da4;" +
		    			"}" +
		    			".btn:hover," +
		    			".btn:focus," +
		    			".btn.focus {" +
		    			  "color: #fff;" +
		    			  "background-color: #286090;" +
		    			  "border-color: #122b40;" +
		    			  "text-decoration: none;" +
		    			"}" +
		    			".btn:active," +
		    			".btn.active {" +
		    			  "-webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);" +
		    			          "box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);" +
		    			"}" +
	    			"</style>" +
	    			
	    			"<a id='resize_link' class='btn' onclick=\"" +
	    			"require(['SuiteScripts/project_one/portletApiTestHelper'], " +
	    				"function(portletApiTestHelper) {" +
	    					"portletApiTestHelper.resizePortlet(); " +
    					"}) \"" +
					" href='#'>Resize</a><br>" ;
    	}
    	function setComponentsForRefresh() 
    	{
    		var textField = portletObj.addField({
	    			id: 'refresh_output',
	    			type: serverWidget.FieldType.TEXT,
	    			label: 'Date Now'
    			});
    			
			log.debug({title: '', details: new Date()});
			log.debug({title: '', details: format.format({value: new Date(), type: format.Type.DATETIME})});
			log.debug({title: '', details: format.format({value: new Date(), type: format.Type.TIMEOFDAY})});
			
			var datetime = format.format({value: new Date(), type: format.Type.DATETIME}).split(' ');
			log.debug({title: '', details: datetime[1].substring(0,5) +' '+ (datetime[2] ? datetime[2] : '')});
			
			textField.defaultValue = format.format({value: new Date(), type: format.Type.DATETIME});
    			
			var refreshLink = portletObj.addField({
	    			id: 'refresh_link',
	    			type: 'inlinehtml',
	    			label: 'Refresh link'
    			});
    			
    			refreshLink.defaultValue = "<a id='refresh_link' class='btn' onclick=\"" +
    					"require(['SuiteScripts/project_one/portletApiTestHelper'], " +
    						"function(portletApiTestHelper) " +
    							"{portletApiTestHelper.refreshPortlet(); " +
							"}) \" " +
    					"href='#'>Refresh</a>";
			}
    }

    return {
        render: render
    };
    
});
