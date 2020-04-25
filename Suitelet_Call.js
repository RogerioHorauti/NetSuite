/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 08 2019     rogerio.horauti
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	nlapiLogExecution('DEBUG','suitelet');
	var company = new nlapiLoadConfiguration('companyinformation');
	nlapiLogExecution('DEBUG','<company.companyname> '+company.getFieldValue('companyname'));
}
