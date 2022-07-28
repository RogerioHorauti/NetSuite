/**
 * AVLR_UtilV3.js
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/runtime', 'N/https', 'N/error'],
    
    function(runtime, https, error) 
    {
        function getHeaderRequest(subsidiary) 
        {
            var boby = {}
            boby.executionContext = runtime.executionContext;
            //log.debug('executionContext', runtime.executionContext);
            boby.subsidiaryId = subsidiary.id.toString()
            
            var headerObj = {};
                headerObj['Content-Type'] = 'application/json';
            
            var response = https.requestRestlet({
                    headers: headerObj,
                    scriptId: 'customscript_avlr_easytalk_rl',
                    deploymentId: 'customdeploy_avlr_easytalk_rl',
                    method: 'POST',
                    body: JSON.stringify(boby)
                });
            
            //log.debug('getHeaderRequest', response.code);
            if(response.code != 200)
            {
                throw response.body;
            }
            else
            {
                response = JSON.parse(response.body);
                
                var _header = {};
                _header['Authorization'] = 'Bearer ' + response.token;
                _header['Content-Type'] = 'application/json';
                
                return {header: _header, taxCodes: response.taxCodes};
            }
        }


        function getBaseURL(subsidiary) 
        {
            var baseURL = subsidiary.getValue({ fieldId: 'custrecord_enl_urlswfiscal' })

            if (!baseURL) 
                throw error.create({name: 'ERROR AvaTAxBR', message: 'SUBSIDIÁRIA - Campo "URL SW FISCAL" não está definido.', notifyOff: false});
            
            return baseURL;
        }


        function removeCharacters(str) 
        {
            if(str)
                return str.replace(/\W/g, "");
            else
                return '';
        }

        function isEmptyObj(obj) 
        {
            for ( var prop in obj) 
            {
                if(obj.hasOwnProperty(prop))
                    return false
            }
            return true
        }

        function roundRfb(value) 
        {
            var val = value;
            var total = Math.floor(value * 100) / 100;

            if (val != total) 
            {
                var result = val - total;
                var num = 0.0055;
                var n = num.toFixed(4);

                if (result > 0.0050 && result < 0.0055) 
                    return parseFloat(val.toFixed(2) - 0.01).toFixed(2);
                else
                    return val.toFixed(2);
            }
            else
                return value;
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

        function randomString(length, chars) 
        {
            var mask = '';
            if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
            if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (chars.indexOf('#') > -1) mask += '0123456789';
            if (chars.indexOf('!') > -1) mask += '~!@#$%^&*()_+-={}[]:;\<>?,./|\\';
            var result = '';
            for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
            return result;
        }

        function millisToMinutesAndSeconds(millis) 
        {
            var minutes = Math.floor(millis / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);
            return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        }

        return {
            getHeaderRequest: getHeaderRequest,
            removeCharacters: removeCharacters,
            getBaseURL: getBaseURL,
            isEmptyObj: isEmptyObj,
            doRound: doRound,
            randomString: randomString,
            millisToMinutesAndSeconds: millisToMinutesAndSeconds,
            roundRfb: roundRfb
        };

    });
