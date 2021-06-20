/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope Public
 */
define([
    'N/https', 
    'N/record', 
    'N/runtime', 
    'N/search', 
    'N/url', 
    'N/http',
    './Searchs_Get_Vignamazzi.js',
    './Script_Util_SysPDV.js'
],

function(
    https, 
    record, 
    runtime, 
    search, 
    url, 
    http,
    getVignamazziSearchs,
    utilSysPdv
) {

    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */

    /* hmac-sha1.js
    CryptoJS v3.1.2
    code.google.com/p/crypto-js
    (c) 2009-2013 by Jeff Mott. All rights reserved.
    code.google.com/p/crypto-js/wiki/License
    */
    var CryptoJS=CryptoJS||function(g,l){var e={},d=e.lib={},m=function(){},k=d.Base={extend:function(a){m.prototype=this;var c=new m;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
        p=d.WordArray=k.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=l?c:4*a.length},toString:function(a){return(a||n).stringify(this)},concat:function(a){var c=this.words,q=a.words,f=this.sigBytes;a=a.sigBytes;this.clamp();if(f%4)for(var b=0;b<a;b++)c[f+b>>>2]|=(q[b>>>2]>>>24-8*(b%4)&255)<<24-8*((f+b)%4);else if(65535<q.length)for(b=0;b<a;b+=4)c[f+b>>>2]=q[b>>>2];else c.push.apply(c,q);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
        32-8*(c%4);a.length=g.ceil(c/4)},clone:function(){var a=k.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],b=0;b<a;b+=4)c.push(4294967296*g.random()|0);return new p.init(c,a)}}),b=e.enc={},n=b.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],f=0;f<a;f++){var d=c[f>>>2]>>>24-8*(f%4)&255;b.push((d>>>4).toString(16));b.push((d&15).toString(16))}return b.join("")},parse:function(a){for(var c=a.length,b=[],f=0;f<c;f+=2)b[f>>>3]|=parseInt(a.substr(f,
        2),16)<<24-4*(f%8);return new p.init(b,c/2)}},j=b.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],f=0;f<a;f++)b.push(String.fromCharCode(c[f>>>2]>>>24-8*(f%4)&255));return b.join("")},parse:function(a){for(var c=a.length,b=[],f=0;f<c;f++)b[f>>>2]|=(a.charCodeAt(f)&255)<<24-8*(f%4);return new p.init(b,c)}},h=b.Utf8={stringify:function(a){try{return decodeURIComponent(escape(j.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return j.parse(unescape(encodeURIComponent(a)))}},
        r=d.BufferedBlockAlgorithm=k.extend({reset:function(){this._data=new p.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=h.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,b=c.words,f=c.sigBytes,d=this.blockSize,e=f/(4*d),e=a?g.ceil(e):g.max((e|0)-this._minBufferSize,0);a=e*d;f=g.min(4*a,f);if(a){for(var k=0;k<a;k+=d)this._doProcessBlock(b,k);k=b.splice(0,a);c.sigBytes-=f}return new p.init(k,f)},clone:function(){var a=k.clone.call(this);
        a._data=this._data.clone();return a},_minBufferSize:0});d.Hasher=r.extend({cfg:k.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){r.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(b,d){return(new a.init(d)).finalize(b)}},_createHmacHelper:function(a){return function(b,d){return(new s.HMAC.init(a,
        d)).finalize(b)}}});var s=e.algo={};return e}(Math);
        (function(){var g=CryptoJS,l=g.lib,e=l.WordArray,d=l.Hasher,m=[],l=g.algo.SHA1=d.extend({_doReset:function(){this._hash=new e.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(d,e){for(var b=this._hash.words,n=b[0],j=b[1],h=b[2],g=b[3],l=b[4],a=0;80>a;a++){if(16>a)m[a]=d[e+a]|0;else{var c=m[a-3]^m[a-8]^m[a-14]^m[a-16];m[a]=c<<1|c>>>31}c=(n<<5|n>>>27)+l+m[a];c=20>a?c+((j&h|~j&g)+1518500249):40>a?c+((j^h^g)+1859775393):60>a?c+((j&h|j&g|h&g)-1894007588):c+((j^h^
        g)-899497514);l=g;g=h;h=j<<30|j>>>2;j=n;n=c}b[0]=b[0]+n|0;b[1]=b[1]+j|0;b[2]=b[2]+h|0;b[3]=b[3]+g|0;b[4]=b[4]+l|0},_doFinalize:function(){var d=this._data,e=d.words,b=8*this._nDataBytes,g=8*d.sigBytes;e[g>>>5]|=128<<24-g%32;e[(g+64>>>9<<4)+14]=Math.floor(b/4294967296);e[(g+64>>>9<<4)+15]=b;d.sigBytes=4*e.length;this._process();return this._hash},clone:function(){var e=d.clone.call(this);e._hash=this._hash.clone();return e}});g.SHA1=d._createHelper(l);g.HmacSHA1=d._createHmacHelper(l)})();
        (function(){var g=CryptoJS,l=g.enc.Utf8;g.algo.HMAC=g.lib.Base.extend({init:function(e,d){e=this._hasher=new e.init;"string"==typeof d&&(d=l.parse(d));var g=e.blockSize,k=4*g;d.sigBytes>k&&(d=e.finalize(d));d.clamp();for(var p=this._oKey=d.clone(),b=this._iKey=d.clone(),n=p.words,j=b.words,h=0;h<g;h++)n[h]^=1549556828,j[h]^=909522486;p.sigBytes=b.sigBytes=k;this.reset()},reset:function(){var e=this._hasher;e.reset();e.update(this._iKey)},update:function(e){this._hasher.update(e);return this},finalize:function(e){var d=
        this._hasher;e=d.finalize(e);d.reset();return d.finalize(this._oKey.clone().concat(e))}})})();

                        
    /*  enc-base64-min.js
    CryptoJS v3.0.2
    code.google.com/p/crypto-js
    (c) 2009-2012 by Jeff Mott. All rights reserved.
    code.google.com/p/crypto-js/wiki/License
    */
    (function(){var h=CryptoJS,i=h.lib.WordArray;h.enc.Base64={stringify:function(b){var e=b.words,f=b.sigBytes,c=this._map;b.clamp();for(var b=[],a=0;a<f;a+=3)for(var d=(e[a>>>2]>>>24-8*(a%4)&255)<<16|(e[a+1>>>2]>>>24-8*((a+1)%4)&255)<<8|e[a+2>>>2]>>>24-8*((a+2)%4)&255,g=0;4>g&&a+0.75*g<f;g++)b.push(c.charAt(d>>>6*(3-g)&63));if(e=c.charAt(64))for(;b.length%4;)b.push(e);return b.join("")},parse:function(b){var b=b.replace(/\s/g,""),e=b.length,f=this._map,c=f.charAt(64);c&&(c=b.indexOf(c),-1!=c&&(e=c));
    for(var c=[],a=0,d=0;d<e;d++)if(d%4){var g=f.indexOf(b.charAt(d-1))<<2*(d%4),h=f.indexOf(b.charAt(d))>>>6-2*(d%4);c[a>>>2]|=(g|h)<<24-8*(a%4);a++}return i.create(c,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();


    function execute(scriptContext) 
    {
        var OAuth = getOAuth('GET');
        var _headers = new Array();
            _headers['Authorization'] = OAuth.oauth;
            _headers['Content-Type'] = 'application/json';
            _headers['User-Agent-x'] = 'SuiteScript-Call';
            
        var _response = https.get({ url: OAuth.exturl, headers: _headers });
            
        var objList = JSON.parse(_response.body);
        objList = JSON.parse(objList);
        
        var _setupVignamazzi = getVignamazziSearchs.getVignamazziSetup();

        processItem(_setupVignamazzi, objList.items);
        processPaymentTerms(_setupVignamazzi, objList.paymentTerms);
        processPaymentType(_setupVignamazzi, objList.paymentType);
        processStock(_setupVignamazzi, objList.items);
        
        var scriptObj = runtime.getCurrentScript();
        log.debug("Remaining governance units: ", scriptObj.getRemainingUsage());
    }

    function getNonce(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    function getOAuth(httpMethod) // 'GET' 'POST' 'PUT' 'DELETE'
    {
        log.debug({title: 'OAuth - Begin', details: new Date()});
        var OAuth = '';
        var extUrl = '';
        var mySearch = search.create({
            type: "customrecord_vig_setupvignamazzi",
            columns:
                [
                "custrecord_vig_consumerkey_setupvmz",  // CONSUMER KEY
                "custrecord_vig_consumersecret_setupvmz",	// CONSUMER SECRET
                "custrecord_vig_tokenid_setupvmz",	// TOKEN ID
                "custrecord_vig_tokensecret_setupvmz",	// TOKEN SECRET
                "custrecord_vig_accountid_setupvmz",	// ACCOUNT ID
                "custrecord_vig_scriptid_setupvmz",	// SCRIPT ID RL
                "custrecord_vig_rlbaseurl_setupvmz",	// RESTLET BASE URL
                "custrecord_vig_httpmethod_setupvmz",	// HTTP Method
                "custrecord_vig_externalurl_setupvmz"	// External URL
                ]
        });
        var resultCount = mySearch.runPaged().count;
        if (resultCount) {
            mySearch.run().each(function(result){
            
                var CONSUMER_KEY = result.getValue({name: 'custrecord_vig_consumerkey_setupvmz'});
                var CONSUMER_SECRET = result.getValue({name: 'custrecord_vig_consumersecret_setupvmz'});
                var TOKEN_ID = result.getValue({name: 'custrecord_vig_tokenid_setupvmz'});
                var TOKEN_SECRET = result.getValue({name: 'custrecord_vig_tokensecret_setupvmz'});
                var SCRIPT_DEPLOYMENT_ID = '1';
                var OAUTH_NONCE = getNonce(32);
                var TIME_STAMP = Math.round(+new Date() / 1000);
                var OAUTH_VERSION = '1.0';
                var SCRIPT_ID = result.getValue({name: 'custrecord_vig_scriptid_setupvmz'});
                var HTTP_METHOD = httpMethod;
                var BASE_URL = result.getValue({name: 'custrecord_vig_rlbaseurl_setupvmz'});
                var NETSUITE_ACCOUNT_ID = result.getValue({name: 'custrecord_vig_accountid_setupvmz'});
        
                log.debug('CONSUMER_KEY', CONSUMER_KEY);
                log.debug('CONSUMER_SECRET', CONSUMER_SECRET);
                log.debug('TOKEN_ID', TOKEN_ID);
                log.debug('TOKEN_SECRET', TOKEN_SECRET);
                log.debug('SCRIPT_DEPLOYMENT_ID', SCRIPT_DEPLOYMENT_ID);
                log.debug('OAUTH_NONCE', OAUTH_NONCE);
                log.debug('TIME_STAMP', TIME_STAMP);
                log.debug('OAUTH_VERSION', OAUTH_VERSION);
                log.debug('SCRIPT_ID', SCRIPT_ID);
                log.debug('HTTP_METHOD', HTTP_METHOD.toUpperCase());
                log.debug('BASE_URL', BASE_URL);
                log.debug('NETSUITE_ACCOUNT_ID', NETSUITE_ACCOUNT_ID);
        
                var data = '';
                data = data + 'deploy=' + SCRIPT_DEPLOYMENT_ID + '&';
                data = data + 'oauth_consumer_key=' + CONSUMER_KEY + '&';
                data = data + 'oauth_nonce=' + OAUTH_NONCE + '&';
                data = data + 'oauth_signature_method=' + 'HMAC-SHA1' + '&';
                data = data + 'oauth_timestamp=' + TIME_STAMP + '&';
                data = data + 'oauth_token=' + TOKEN_ID + '&';
                data = data + 'oauth_version=' + OAUTH_VERSION + '&';
                data = data + 'script=' + SCRIPT_ID;
        
                var encodedData = encodeURIComponent(data);
                var completeData = HTTP_METHOD.toUpperCase() + '&' + encodeURIComponent(BASE_URL) + '&' + encodedData;
                var hmacsha1Data = CryptoJS.HmacSHA1(completeData, CONSUMER_SECRET + '&' + TOKEN_SECRET);
                var base64EncodedData = CryptoJS.enc.Base64.stringify(hmacsha1Data);
                var oauth_signature = encodeURIComponent(base64EncodedData);
        
                OAuth = 'OAuth oauth_signature="' + oauth_signature + '",';
                OAuth = OAuth + 'oauth_version="1.0",';
                OAuth = OAuth + 'oauth_nonce="' + OAUTH_NONCE + '",';
                OAuth = OAuth + 'oauth_signature_method="HMAC-SHA1",';
                OAuth = OAuth + 'oauth_consumer_key="' + CONSUMER_KEY + '",';
                OAuth = OAuth + 'oauth_token="' + TOKEN_ID + '",';
                OAuth = OAuth + 'oauth_timestamp="' + TIME_STAMP + '",';
                OAuth = OAuth + 'realm="' + NETSUITE_ACCOUNT_ID + '"';
                log.debug({title: 'OAuth', details: OAuth});
                
                log.debug({title: 'OAuth - End', details: new Date()})
                extUrl = result.getValue({name: 'custrecord_vig_externalurl_setupvmz'})
            });			
            return {
                oauth: OAuth,
                exturl:  extUrl
            };
        }else
            return {};
    }

    function processCustomer(setupVignamazzi)
    {
        var _method = "Customer";
        var lvFilters = [25];
        
        var objCustomerList = getVignamazziSearchs.getCustomer(lvFilters);
        
        var sendCustomerSysPDV = createFileCustomer(objCustomerList); 
        var isSucess = sendIntegApi(sendCustomerSysPDV, setupVignamazzi.urlenvcustomer, _method);
    }     

    function createFileCustomer(objCustomerList){

        var customerFileLines = [];
        var createCustomerList = {};

        if(objCustomerList.length){

            for(i = 0; i < objCustomerList.length; i++){

                var isNumber = 0.00;
                var istext = '';

                var codigoCliente = objCustomerList[i].id.substring(0,15);
                var descricaoCliente = objCustomerList[i].name.substring(0,40);
                var cpfcnpj = objCustomerList[i].cpfcnpj.substring(0,14);
                var endereco = objCustomerList[i].adrees.substring(0,45);
                var num = objCustomerList[i].number;
                var bairro = objCustomerList[i].country.substring(0,15);
                var cidade = objCustomerList[i].city.substring(0,20);
                var estado = objCustomerList[i].state.substring(0,2);
                var cep = objCustomerList[i].zipcode.substring(0,8);
                
                createCustomerList = //formatarDecimal(15,codigoCliente)+
                                    formatarBranco(40,descricaoCliente)+
                                    formatarDecimal(14,cpfcnpj)+
                                    formatarBranco(45,endereco +''+ num)+
                                    formatarBranco(15,bairro)+
                                    formatarBranco(20,cidade)+
                                    formatarBranco(2,estado)+
                                    formatarBranco(8,cep);
                                                    
                customerFileLines.push(createCustomerList);
            }

            log.debug({
                title: "Teste",
                details: customerFileLines
            });
        }

        return customerFileLines
        
    }

    function processItem(setupVignamazzi, objItemList)
    {
        var _method = "Item";
        var sendItemSysPDV = createFileItem(objItemList);
        var isSucess = sendIntegApi(sendItemSysPDV, setupVignamazzi.urlenvitem, _method);
    }

    function createFileItem(objItemList)
    {
        var itemArry = {
            itemFileLines:[]
        };
        
        for(i = 0; i < objItemList.length; i++)
        {
            var createItemList = new String();

            var isdecimal = '00.00';
            var isdecimal2 = '0000.00';
            var isNumber = '0';
            var istext = '';

            var priceSales1 = '';
            var priceSales2 = '';
            var priceSales3 = '';
            
            if(objItemList[i].itemid)
                createItemList = createItemList + formatarDecimal(14, objItemList[i].itemid.substring(0,14));  //01 ate 14 - Código
            else
                createItemList = createItemList + formatarDecimal(14, String(0))  //01 ate 14 - Código
                
            if(objItemList[i].purchasedescription)
                createItemList = createItemList + formatarBranco(45,objItemList[i].purchasedescription.substring(0,45)); //15 ate 59  - Descrição
            else
                createItemList = createItemList + formatarBranco(45, ''); //15 ate 59  - Descrição
            
            if(objItemList[i].displayname)
                createItemList = createItemList + formatarBranco(20, objItemList[i].displayname.substring(0,20)); //60 ate 79 - Descrição reduzida
            else
                createItemList = createItemList + formatarBranco(20, ''); //60 ate 79 - Descrição reduzida
            
            createItemList = createItemList + formatarZero(2, istext); //80 ate 81 - Código da seção
            createItemList = createItemList + formatarBranco(1, istext); //82 ate 82 - Identifica se o produto paga comissão
            createItemList = createItemList + formatarBranco(3, 'F00'); //83 ate 85 - Tributação
            createItemList = createItemList + formatarBranco(1, istext); //86 ate 86 - Peso variável
            createItemList = createItemList + formatarBranco(2, isNumber); //87 ate 88 - Código do local para Impressão
            createItemList = createItemList + formatarDecimal(5, isdecimal); //89 ate 93 - Comissão 1
            createItemList = createItemList + formatarDecimal(5, isdecimal); //94 ate 98 - Comissão 2
            createItemList = createItemList + formatarDecimal(5, isdecimal); //99 ate 103 - Comissão 3
            createItemList = createItemList + formatarDecimal(5, isdecimal); //104 ate 108 - Desconto máximo
                            
            for (var int = 0; int < objItemList[i].price.length; int++) 
            {
                var priceName = objItemList[i].price[int].pricelevelname;
                
                switch (priceName) {
                    case "Preço inicial":
                            priceSales1 = objItemList[i].price[int].price1;
                        break;
                    case "Loja Ataliba":
                            priceSales2 = objItemList[i].price[int].price2;
                        break;
                    case "Preços Varejo":
                            priceSales3 = objItemList[i].price[int].price3;
                        break;
                    default:
                        break;
                }
                
            }
            createItemList = createItemList + formatarDecimal(13, priceSales1); //109 ate 121 - Preço de venda 1
            createItemList = createItemList + formatarDecimal(13, isdecimal); //122 ate 134 - Preço de oferta 1
            createItemList = createItemList + formatarZero(3, isNumber); //135 ate 137 - Dias de validade
            createItemList = createItemList + formatarBranco(1, 'N'); //138 ate 138 - Preço variável
            createItemList = createItemList + formatarBranco(1, 'N'); //139 ate 139 - Lista para frente de loja
            createItemList = createItemList + formatarDecimal(13, isdecimal); //140 ate 152 - Estoque mínimo
            createItemList = createItemList + formatarDecimal(13, isdecimal); //153 ate 165 - Estoque máximo
            createItemList = createItemList + formatarZero(4, isNumber); //166 ate 169 - Código fornecedor
            createItemList = createItemList + formatarDecimal(13, priceSales2); //170 ate 182 - Preço de venda 2
            createItemList = createItemList + formatarDecimal(13, isdecimal); //183 ate 195 - Preço de oferta 2
            createItemList = createItemList + formatarDecimal(13, priceSales3); //196 ate 208 - Preço de venda 3
            createItemList = createItemList + formatarDecimal(13, isdecimal); //209 ate 221 - Preço de oferta 3
            createItemList = createItemList + formatarBranco(1, 'A'); //222 ate 222 - Tabela A
            createItemList = createItemList + formatarBranco(1, 'P'); //223 ate 223 - Tipo de bonificação
            createItemList = createItemList + formatarZero(13, isdecimal); //224 ate 236 - Fator de bonificação
            createItemList = createItemList + formatarZero(8, '20190902'); //237 ate 244 - Data de alteração - (Obrigatorio)
            createItemList = createItemList + formatarZero(1, '1'); // 245 ate 245 - Quantidade de etiquetas
            createItemList = createItemList + formatarBranco(3, 'UN'); //246 ate 248 - Unidade de venda
            createItemList = createItemList + formatarBranco(1, 'N'); //249 ate 249 - Identificação de produto alterado
            createItemList = createItemList + formatarDecimal(13, isdecimal); //250 ate 262 - Preço de custo
            createItemList = createItemList + formatarBranco(1, 'N'); //263 ate 263 - Controla número de série (S-Sim N-Não)
            createItemList = createItemList + formatarBranco(1, 'S'); //264 ate 265 - Controla estoque (S-Sim N-Não)
            createItemList = createItemList + formatarBranco(1, 'S'); //266 ate 266 - Permite Desconto (S-Sim N-Não)
            createItemList = createItemList + formatarBranco(1, 'N'); //267 ate 267 - S-Sim; N-Não; K- Kit de Produto; C-Componente
            createItemList = createItemList + formatarBranco(1, 'N'); //268 ate 268 - Envia para balança (S-Sim N-Não)
            createItemList = createItemList + formatarBranco(2, 'S'); //269 ate 269 - Controla Validade (S-Sim N-Não)  
            createItemList = createItemList + formatarDecimal(7, isdecimal); //270 ate 276 - Margem Venda 01*
            createItemList = createItemList + formatarDecimal(7, isdecimal); //277 ate 283 - Margem Venda 02*
            createItemList = createItemList + formatarDecimal(7, isdecimal);  //284 ate 290 - Margem Venda 03*
            createItemList = createItemList + formatarBranco(1, 'A'); //291 ate 291 - Mix do Produto  
            createItemList = createItemList + formatarZero(8, '01092019'); //292 ate 299 - Data de inclusão do produto - entrada em linha
            createItemList = createItemList + formatarZero(8, '30082019'); //300 ate 307 - Data em que o produto saiu de linha
            createItemList = createItemList + formatarZero(8, '15082019'); //308 ate 315 - Data do último reajuste preço1
            createItemList = createItemList + formatarZero(8, '01082019'); //316 ate 323 - Data do último reajuste preço2
            createItemList = createItemList + formatarZero(8, '30082019'); //324 ate 331 - Data do último reajuste preço3
            createItemList = createItemList + formatarBranco(1, 'N'); //332 ate 332 - Descrição Variável
            createItemList = createItemList + formatarBranco(20, istext); //333 ate 352 - endereço
            createItemList = createItemList + formatarDecimal(9, isdecimal); //362 ate 370 - Quantidade tipo 3
            createItemList = createItemList + formatarDecimal(9, isdecimal); //353 ate 361 - Quantidade tipo 2
            createItemList = createItemList + formatarZero(3, isNumber); //371 ate 373 -  Código do Grupo
            createItemList = createItemList + formatarZero(3, isNumber); //374 ate 376 -  Código do Subgrupo
            createItemList = createItemList + formatarDecimal(13, isdecimal); //377 ate 389 - Itens de embalagem
            createItemList = createItemList + formatarDecimal(9, isdecimal); //390 ate 398 - Quantidade Máxima Oferta
            createItemList = createItemList + formatarDecimal(9, isdecimal); //399 ate 407 - Peso Bruto
            createItemList = createItemList + formatarDecimal(9, isdecimal); //408 ate 416 - Peso Líquido
            createItemList = createItemList + formatarBranco(3, istext); //417 ate 419 - Unidade Tributada
            createItemList = createItemList + formatarDecimal(13, isdecimal); //420 ate 432 - Medida Tributada
            createItemList = createItemList + formatarZero(3, isNumber); //433 ate 435 - Código do gênero
            createItemList = createItemList + formatarBranco(35, 'Biscoitos Chocos Biscuits Bauducos'); //436 ate 470 - Complemento da descrição do produto
            createItemList = createItemList + formatarBranco(20, istext); //471 ate 490 - reservado
            createItemList = createItemList + formatarBranco(3,istext); //491 ate 493 - Unidade de compra
            createItemList = createItemList + formatarZero(3, isNumber);  //494 ate 496 - Reservado
            createItemList = createItemList + formatarZero(3, isNumber); //497 ate 499 - Natureza
            createItemList = createItemList + formatarZero(8, objItemList[i].ncm.substring(0,8)); //500 ate 507 - Código NCM
            createItemList = createItemList + formatarZero(2, isNumber); //508 ate 509 - Código Exceção NCM
            createItemList = createItemList + formatarBranco(3, istext); //510 ate 512 - Unidade de referência
            createItemList = createItemList + formatarDecimal(13, isdecimal); //513 ate 525 - Medida de referência
            createItemList = createItemList + formatarZero(7, '1234567'); //526 ate 532 - CEST
            createItemList = createItemList + formatarBranco(1,'1'); //533 ate 533 - Finalidade
            createItemList = createItemList + formatarBranco(1,'A'); //534 ate 534 - Indicador para Arredondar
            createItemList = createItemList + formatarBranco(1,'P'); //535 ate 535 - indice de produção do produto
            createItemList = createItemList + formatarBranco(1,'N'); //536 ate 536 - Produto tipo vasilhame
            createItemList = createItemList + formatarZero(14, isdecimal); //537 ate 550 - codigo do produto tipo vasilhame
            createItemList = createItemList + formatarBranco(1,'N'); //551 ate 551 = Emissão de comprovante de entrega
            createItemList = createItemList + formatarZero(2, isNumber) //552 ate 553 - CST PIS/COFINS Entrada
            createItemList = createItemList + formatarZero(2, isNumber); //554 ate 555 - CST PIS/COFINS Saida
            createItemList = createItemList + formatarDecimal(8,isdecimal); //556 ate 563 - Alíquota PIS Entrada
            createItemList = createItemList + formatarDecimal(8,isdecimal); //564 ate 571 - Alíquota PIS Saída
            createItemList = createItemList + formatarDecimal(8,isdecimal); //572 ate 579 - Alíquota COFINS Entrada
            createItemList = createItemList + formatarDecimal(8,isdecimal); //580 ate 587 - Alíquota COFINS Saída

            itemArry.itemFileLines.push(createItemList);
        }
        log.debug({title: 'createItemList', details: itemArry.itemFileLines});
        return itemArry;
    }

    function processStock(setupVignamazzi, objStockList)
    {
        var sendStockSysPDV = createFileStock(objStockList);
        var _method = "Stock";
        var isSucess = sendIntegApi(sendStockSysPDV, setupVignamazzi.urlenvstock, _method);
    }

    function createFileStock(objStockList)
    {
        var stockArry = {
                stockFileLines:[]
            };
        
        for(i = 0; i < objStockList.length; i++)
        {
            var createStockList = new String();

            createStockList = createStockList + formatarZero(14, objStockList[i].itemid); // Código do produto 14 99.99 1 14
            
            for (var int = 0; int < objStockList[i].locations.length; int++) 
            {
                var quantityonhand =+ objStockList[i].locations[int].quantityonhand;
            }
            createStockList = createStockList + formatarDecimal(15, quantityonhand); // Saldo de estoque 15 99.99 15 29
            createStockList = createStockList + '01012019'; // Data da ultima entrada 8 DDMMAAAA 30 37
            createStockList = createStockList + '09092019'; // Data da ultima saída 8 DDMMAAAA 38 45
                                                    
            stockArry.stockFileLines.push(createStockList);
        }
        log.debug({title: 'Estoque', details: stockArry.stockFileLines});
        return stockArry
    }

    function processPriceTable(setupVignamazzi, objPriceTableList)
    {
        var sendPriceTableSysPDV = createFilePriceTable(objPriceTableList);
    }

    function createFilePriceTable(objPriceTableList){

        var priceTableFileLines = [];
        
        if(objPriceTableList.length){
            
            for(i = 0; i < objPriceTableList.length; i++){

                var createPriceTableList = new String();

                var exemplo = objPriceTableList[i].id.substring(0,15);
                
                
                createPriceTableList = formatarBranco(40,exemplo)+
                                formatarDecimal(14,exemplo)+
                                formatarZero(45,exemplo);
                                
                                                    
                priceTableFileLines.push(createPriceTableList);
            }
        }
        return priceTableFileLines
    }

    function processPaymentTerms(setupVignamazzi, objPaymentTermsList)// 19 - Plano de Pagamento - SYSPPLP.TXT // Condição Pagamento // Accounting lists / Term (NetSuite)
    {
        var sendPaymentTermsSysPDV = createPaymentTerms(objPaymentTermsList);
        var _method = "Payment Terms";
        var isSucess = sendIntegApi(sendPaymentTermsSysPDV, setupVignamazzi.urlenvpayterms, _method);
    }

    function createPaymentTerms(objPaymentTermsList)
    {
        var paymentTermsArry = {
                paymentTermsFileLines:[]
            };
        //var paymentTermsFileLines = new Array();
        
        for(i = 0; i < objPaymentTermsList.length; i++)
        {
            var stringPaymentTerms = new String();

            stringPaymentTerms = stringPaymentTerms + (formatarZero(2,String(2))) ; // 1 a 2 - Código do Plano de Pagamento *
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(20,'A')) ; // 3 a 22 - Descrição do Plano *
            stringPaymentTerms = stringPaymentTerms + (formatarZero(15,String(9))) ; // 23 a 37 - Fator do Plano *
            stringPaymentTerms = stringPaymentTerms + (formatarZero(15,String(9))) ; // 38 a 52 - Valor de Entrada
            stringPaymentTerms = stringPaymentTerms + (formatarZero(3,String(9))) ; // 53 a 55 - Intervalo da Primeira Parcela *
            stringPaymentTerms = stringPaymentTerms + (formatarZero(3,String(9))) ; // 56 a 58 - Número de Parcelas *
            stringPaymentTerms = stringPaymentTerms + (formatarZero(3,String(9))) ; // 59 a 61 - Intervalo entre as parcelas *
            stringPaymentTerms = stringPaymentTerms + (formatarZero(15,String(9))) ; // 62 a 76 - Valor mínimo do plano
            stringPaymentTerms = stringPaymentTerms + (formatarZero(15,String(9))) ; // 77 a 91 - Valor de Acréscimos
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(15,'AAAAAAAAAAAAAA')) ; // 92 a 106 - Texto livre 1
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(1,'A')) ; // 107 a 107 - Máscara texto 1
            stringPaymentTerms = stringPaymentTerms + (formatarZero(2,String(9))) ; // 108 a 109 - Tamanho texto 1
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(1,'A')) ; // 110 a 110 - Obrigatório texto 1
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(15,'AAAAAAAAAAAAAA')) ; // 111 a 125 - Texto livre 2
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(1,'A')) ; // 126 a 126 - Máscara texto 2
            stringPaymentTerms = stringPaymentTerms + (formatarZero(2,String(9))) ; // 127 a 128 - Tamanho texto 2
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(1,'A')) ; // 129 a 129 - Obrigatório texto 2
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(15,'AAAAAAAAAAAAAA')) ; // 130 a 144 - Texto livre 3
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(1,'A')) ; // 145 a 145 - Máscara texto 3
            stringPaymentTerms = stringPaymentTerms + (formatarZero(2,String(9))) ; // 146 a 147 - Tamanho texto 3
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(1,'A')) ; // 148 a 148 - Obrigatório texto 3
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(15,'AAAAAAAAAAAAAA')) ; // 149 a 163 - Texto livre 4
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(1,'A')) ; // 164 a 164 - Máscara texto 4
            stringPaymentTerms = stringPaymentTerms + (formatarZero(2,String(9))) ; // 165 a 166 - Tamanho texto 4
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(1,'A')) ; // 167 a 167 - Obrigatório texto 4
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(1,'A')) ; // 168 a 168 - Imprime Documento
            stringPaymentTerms = stringPaymentTerms + (formatarBranco(1,'A')); // 169 a 169 - Prazo Cliente
                                                
            paymentTermsArry.paymentTermsFileLines.push(stringPaymentTerms);
        }
        log.debug({title: 'paymentTermsFileLines', details: paymentTermsArry.paymentTermsFileLines});
        return paymentTermsArry
    }

    function processPaymentType(setupVignamazzi, objPaymentTypeList)// 13 - Finalizadora - SYSPFZD.TXT // Forma de Pagamento // Payment Method BR (NetSuite)
    {
        var sendPaymentTypeSysPDV = createPaymentType(objPaymentTypeList);
        var _method = "Payment Type";
        var isSucess = sendIntegApi(sendPaymentTypeSysPDV, setupVignamazzi.urlenvpaytype, _method);
    }

    function createPaymentType(objPaymentTypeList)
    {
        var paymentTypeArry = {
                paymentTypeFileLines:[]
            };
        //var paymentTypeFileLines = new Array();
        

        if(objPaymentTypeList.length){
            
            for(i = 0; i < objPaymentTypeList.length; i++)
            {
                var createPaymentTyperList = new String();
                
                createPaymentTyperList = createPaymentTyperList + formatarZero(3,String(9)) ; // Código da Finalizadora	3	999	1	3 *
                createPaymentTyperList = createPaymentTyperList + formatarBranco(20,'A') ; // Descrição da Finalizadora	20	A	4	23 *
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Tipo	1	A	24	24
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Consulta cliente	1	A	25	25
                createPaymentTyperList = createPaymentTyperList + formatarZero(1,String(9)) ; // Verifica limite de crédito	1	9	26	26
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Atualiza limite de crédito	1	A	27	27
                createPaymentTyperList = createPaymentTyperList + formatarDecimal(15,String(9.99)) ; // Ponto de sangria	15	999999999999.99	28	42
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Permite troco	1	A	43	43 *
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Solicita quantidade	1	A	44	44
                createPaymentTyperList = createPaymentTyperList + formatarZero(3,String(9)) ; // Número de autenticações	3	999	45	47
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Imprime documento	1	A	48	48
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Permite recebimento	1	A	49	49
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Permite pagamento	1	A	50	50
                createPaymentTyperList = createPaymentTyperList + formatarDecimal(15,String(9.99)) ; // Troco máximo	15	999999999999.99	51	65
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Gera conta corrente	1	A	66	66
                createPaymentTyperList = createPaymentTyperList + formatarZero(3,String(9)) ; // Prazo	3	999	67	69
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Permite encerrar vendas no preço 1	1	A	70	70 *
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Permite encerrar vendas no preço 2	1	A	71	71
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Permite encerrar vendas no preço 3	1	A	72	72
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Solicita plano de pagamento	1	A	73	73
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Permite troca	1	A	74	74
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Imprime cheque	1	A	75	75
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Sangria automática	1	A	76	76
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Cheque bom para	1	A	77	77
                createPaymentTyperList = createPaymentTyperList + formatarDecimal(15,String(9.99)) ; // Valor mínimo	15	999999999999.99	78	92
                createPaymentTyperList = createPaymentTyperList + formatarDecimal(15,String(9.99)) ; // Valor máximo	15	999999999999.99	93	107
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Imprime 2ª via de documento	1	A	108	108
                createPaymentTyperList = createPaymentTyperList + formatarBranco(15,'A') ; // Texto livre 1	15	A	109	123
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Tipo texto livre 1	1	A	124	124
                createPaymentTyperList = createPaymentTyperList + formatarZero(2,String(9)) ; // Tamanho texto livre 1	2	99	125	126
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Texto livre 1 obrigatório	1	A	127	127
                createPaymentTyperList = createPaymentTyperList + formatarBranco(15,'A') ; // Texto livre 2	15	A	128	142
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Tipo texto livre 2	1	A	143	143
                createPaymentTyperList = createPaymentTyperList + formatarZero(2,String(9)) ; // Tamanho texto livre 2	2	99	144	145
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Texto livre 2 obrigatório	1	A	146	146
                createPaymentTyperList = createPaymentTyperList + formatarBranco(15,'A') ; // Texto livre 3	15	A	147	161
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Tipo texto livre 3	1	A	162	162
                createPaymentTyperList = createPaymentTyperList + formatarZero(2,String(9)) ; // Tamanho texto livre 3	2	99	163	164
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Texto livre 3 obrigatório	1	A	165	165
                createPaymentTyperList = createPaymentTyperList + formatarBranco(15,'A') ; // Texto livre 4	15	A	166	180
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Texto livre 4 obrigatório	1	A	181	181
                createPaymentTyperList = createPaymentTyperList + formatarZero(2,String(9)) ; // Tamanho texto livre 4	2	99	182	183
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Texto livre obrigatório	1	A	184	184
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Gera contas a receber	1	A	185	185
                createPaymentTyperList = createPaymentTyperList + formatarZero(2,String(9)) ; // Código da administradora	2	99	186	187
                createPaymentTyperList = createPaymentTyperList + formatarBranco(1,'A') ; // Espécie da Finalizadora	1	A	188	188
                createPaymentTyperList = createPaymentTyperList + formatarZero(2,String(9)); // Número do ECF	2	99	189	190 *

                paymentTypeArry.paymentTypeFileLines.push(createPaymentTyperList);
            }
        }
        log.debug({title: 'paymentTypeFileLines', details: paymentTypeArry.paymentTypeFileLines});
        return paymentTypeArry
    } 

    function formatarZero(tamanho, originalString)
    {
        var myLocalString;
        var zerosParaInserir;
        var zeros = '';

        if(originalString.length < tamanho)
        {
            zerosParaInserir = tamanho - originalString.length;
            for(var count = 0; count < zerosParaInserir; count ++)
                zeros = zeros + '0';

            String.prototype.insert = function(index, string){
                if (index > 0)
                    return this.substring(0, index) + string + this.substring(index, this.length);
                else
                    return string + this;
            };
            myLocalString = originalString.insert(0, zeros);
            return myLocalString;

        }else{
            return originalString;
        }
    }

    function formatarDecimal(tamanho, originalString)
    {
        var stringWithoutChars = originalString; //.replace(/\W/g, "");
        var myLocalString;
        var zerosParaInserir;
        var zeros = '';

        if(stringWithoutChars.length < tamanho)
        {
            zerosParaInserir = tamanho - stringWithoutChars.length;
            for(var count = 0; count < zerosParaInserir; count ++)
                zeros = zeros + '0';

            String.prototype.insert = function(index, string)
            {
                if (index > 0)
                    return this.substring(0, index) + string + this.substring(index, this.length);
                else
                    return string + this;
            };
            myLocalString = stringWithoutChars.insert(0, zeros);
            return myLocalString;
        }else{
            return stringWithoutChars;
        }
    }

    function formatarBranco(tamanho, originalString)
    {
        var myLocalString;
        var brancosParaInserir;
        var brancos = '';

        if(originalString.length < tamanho)
        {
            brancosParaInserir = tamanho - originalString.length;
            for(var count = 0; count < brancosParaInserir; count ++)
            {
                brancos = brancos + ' ';
            }
            myLocalString = originalString + brancos;
            return myLocalString;
        }else{
            return originalString;
        }
    }

    function sendIntegApi(sendArrySysPDV, urlSend, method)
    {
        var header = [];
        header['Content-Type'] = 'application/json';
        header['Accept'] = 'application/json';

        var respApi = http.post({
            url: urlSend,
            headers: header,
            body: JSON.stringify(sendArrySysPDV)

        });
        utilSysPdv.writeLog(respApi, method)
    }

    return {
        execute: execute
    };

});