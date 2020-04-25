/**
 * @NApiVersion 2.x
 * @NScriptType BundleInstallationScript
 * @NModuleScope SameAccount
 */
define(['N/task'],

function(task) {
   
    /**
     * Executes after a bundle is installed for the first time in a target account.
     *
     * @param {Object} params
     * @param {number} params.version - Version of the bundle being installed
     *
     * @since 2016.1
     */
    function beforeInstall(params) {
    	log.debug({title: 'beforeInstall', details: params});
    }

    /**
     * Executes after a bundle in a target account is updated.
     *
     * @param {Object} params
     * @param {number} params.version - Version of the bundle being installed
     *
     * @since 2016.1
     */
    function afterInstall(params) {
    	log.debug({title: 'afterInstall', details: params});
    }

    /**
     * Executes before a bundle is installed for the first time in a target account.
     *
     * @param {Object} params
     * @param {number} params.fromVersion - Version currently installed
     * @param {number} params.toVersion -  New version of the bundle being installed
     *
     * @since 2016.1
     */
    function beforeUpdate(params) {
    	log.debug({title: 'beforeUpdate', details: params});
    }

    /**
     * Executes before a bundle is uninstalled from a target account.
     *
     * @param {Object} params
     * @param {number} params.fromVersion - Version currently installed
     * @param {number} params.toVersion -  New version of the bundle being installed
     *
     * @since 2016.1
     */
    function afterUpdate(params) {
    	log.debug({title: 'afterUpdate', details: params});
    	
    	var scriptTask = task.create({
            taskType: task.TaskType.MAP_REDUCE,
            scriptId: "customscript_ryh_update_records",
            deploymentId: "customdeploy_ryh_update_records",
        });
        var scriptTaskId = scriptTask.submit();

    	
//    	var mrTask = task.create({taskType: task.TaskType.MAP_REDUCE});
//    	mrTask.scriptId = mapReduceScriptId;
//    	mrTask.deploymentId = 1;
//    	mrTask.params = {doSomething: true};
//    	var mrTaskId = mrTask.submit();
    }

    /**
     * Executes before a bundle in a target account is updated.
     *
     * @param {Object} params
     * @param {number} params.version - Version of the bundle being unistalled
     *
     * @since 2016.1
     */
    function beforeUninstsall(params) {
    	log.debug({title: 'beforeUninstsall', details: params});
    }
    
    return {
        beforeInstall: beforeInstall,
        afterInstall: afterInstall,
        beforeUpdate: beforeUpdate,
        afterUpdate: afterUpdate,
        beforeUninstall: beforeUninstsall
    };
    
});
