/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */

define(['N/search'],
        
	function(search) {
	
	/**
	 * Marks the beginning of the Map/Reduce process and generates input data.
	 *
	 * @typedef {Object} ObjectRef
	 * @property {number} id - Internal ID of the record instance
	 * @property {string} type - Record type id
	 *
	 * @return {Array|Object|Search|RecordRef} inputSummary
	 * @since 2015.1
	 */
	function getInputData() 
	{
		try 
		{
			log.debug({title: 'getInputData', details: 'begin'});
			var mySearch = search.create({
				type: "employee",
				columns:
					[
					 "internalid", 
					 search.createColumn({
				         name: "entityid",
				         sort: search.Sort.ASC
				      }),
				      "email",
				      "phone",
				      "altphone",
				      "fax",
				      "supervisor",
				      "title",
				      "altemail"
					 ]
			});
			
			var resultCount = mySearch.runPaged().count;
			log.debug({title: 'getInputData - resultCount', details: resultCount});
			return mySearch;
		} 
		catch (e) 
		{
			log.error({title : e.name, details : e});
		}
	}
	
	/**
	 * Executes when the map entry point is triggered and applies to each key/value pair.
	 *
	 * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
	 * @since 2015.1
	 */
	function map(context) 
	{
		try 
		{
			// 1000 points
			var _employeeObj = JSON.parse(context.value);
			log.debug({title: '_employeeObj', details: _employeeObj});
			
			context.write({
				key: _employeeObj.recordType,
				value: _employeeObj
				});
		}
		catch (e) 
		{
			log.error({title : 'ERROR', details : e});
		}
	}
	
	/**
	 * Executes when the reduce entry point is triggered and applies to each group.
	 *
	 * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
	 * @since 2015.1
	 */
	function reduce(context) 
	{
		try 
		{
			// 5000 points
			log.debug({title: 'reduce - context', details: context});
			var array = context.values;
			log.debug({title: 'array', details: array.length});
			for (var int = 0; int < array.length; int++) 
			{
				log.debug({title: int, details: JSON.parse(array[int])});
			}
//			context.write({
//					key: ' ',
//					value: array
//				});
		} 
		catch (e) 
		{
			log.error({title: 'ERROR', details: e});
		} 
	}
	
	/**
	 * Executes when the summarize entry point is triggered and applies to the result set.
	 *
	 * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
	 * @since 2015.1
	 */
	function summarize(summary) 
	{
		log.debug({title: 'summarize', details: summary});
	}
	
	return {
		getInputData: getInputData,
		map: map,
		reduce: reduce,
		summarize: summarize
	};
	
});
