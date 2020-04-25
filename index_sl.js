/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/file'],

function(search, record, file) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
   function onRequest(context) {
	
		switch (context.request.method) {
		case 'GET':
			handleGet(context);
			break;
		case 'POST':
			handlePost(context);
			break;
		default:
			context.response.write({
				output: "Metodo nao suportado: " + context.request.method
			})
		}// end switch
		
	} 
	
	function handleGet(context) {
		
		var lista = [];
		var _result={length: 0};
    	var itemSearchObj = search.create({
    		type: record.Type.INVENTORY_ITEM,
			filters: [["custitem3","anyof","6"]],
		    columns:
		    	[
		    	 	"internalid",
		    	 	"name",
		    	 	"storedisplayimage",
		    	 	"storedisplaythumbnail",
					"storedescription",
					"storedetaileddescription",
//					"custitem_mts_irrfretgroupcode",
//					"custitem_mts_pisretgroupcode",
//					"custitem_mts_cofinsretgroupcod",
//					"custitem_mts_cslretgroup",

	    	 	]
		});
    	
		var searchResultCount = itemSearchObj.runPaged().count;
		log.debug("itemSearchObj result count",searchResultCount);
		if (searchResultCount) {
			itemSearchObj.run().each(function(result){
				_result = {};
				_result.internalid = result.getValue({name: 'internalid'});
				_result.name = result.getValue({name: 'name'});
				_result.image = result.getValue({name: 'storedisplayimage'});
				_result.thumbnail = result.getValue({name: 'storedisplaythumbnail'});
				_result.webDescr = result.getValue({name: 'storedescription'});
				_result.dtlDescr = result.getValue({name: 'storedetaileddescription'});
//				_result.ibptcodeText = result.getText({name: "custitem_mts_ibptcode"});
//				_result.irrfRet = result.getValue({name:"custitem_mts_irrfretgroupcode"});
//				_result.irrfRetText = result.getText({name:"custitem_mts_irrfretgroupcode"});
//				_result.pisRet = result.getValue({name:"custitem_mts_pisretgroupcode"});
//				_result.pisRetText = result.getText({name:"custitem_mts_pisretgroupcode"});
//				_result.cofinsRet = result.getValue({name:"custitem_mts_cofinsretgroupcod"});
//				_result.cofinsRetText = result.getText({name:"custitem_mts_cofinsretgroupcod"});
//				_result.cslRet = result.getValue({name:"custitem_mts_cslretgroup"});
//				_result.cslRetText = result.getText({name:"custitem_mts_cslretgroup"});
				lista.push(_result)
				log.debug({title: 'Object', details: _result});
				return true;
			});	
		}
		log.debug({title: 'lista', details: lista});
		
	 var stHtml = '<!doctype html>';
		stHtml += '<html lang="en">';
			stHtml += '<head>';
				stHtml += '<!-- Required meta tags -->';
				stHtml += '<meta charset="utf-8">';
				stHtml += '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">';
				stHtml += '<!-- Bootstrap CSS -->';
				stHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">';
				stHtml += '<title>Brigadeiros</title>';
			stHtml += '</head>';
			stHtml += '<body>';
				
			stHtml += '<br><br>';	
			
				stHtml += '<div class="container">';
					stHtml += '<div class="row">';
					
						stHtml += '<div class="col">'
							stHtml += '<h1>Brigadeiros Bruninho</h1>';
						stHtml += '</div>';
						
						stHtml += '<div class="row">';
						var linkImgBoots = 'https://content-static.upwork.com/blog/uploads/sites/3/2016/07/18070451/bootstraplogo.png';
						stHtml += '<img class="mr-3" src="'+ linkImgBoots +'" height="80" width="200">';
					stHtml += '</div>'
						
						stHtml += '<div class="row">';
							var linkImgNS = 'https://noblue.co.uk/wp-content/uploads/2013/03/NetSuite-Featured-Logo-thegem-blog-default.jpg';
							stHtml += '<img class="mr-3" src="'+ linkImgNS +'" height="80" width="200">';
						stHtml += '</div>';
						
					stHtml += '</div>';
				stHtml += '</div>';	
					
				stHtml += '<br><br>';	
				
				stHtml += '<div class="container">';
				stHtml += '<div class="row">';
				
				stHtml += '<div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">'+
				  '<ol class="carousel-indicators">'+
				    '<li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>'+
				    '<li data-target="#carouselExampleIndicators" data-slide-to="1"></li>'+
				    '<li data-target="#carouselExampleIndicators" data-slide-to="2"></li>'+
				  '</ol>'+
				  '<div class="carousel-inner">'+
				    '<div class="carousel-item active">'+
				      '<img src="https://site-amb-s3.clubedaana.com.br/prod/imagens/receita/4829/brigadeiro-de-microondas-4722.jpg" class="d-block w-100" alt="..." height="720" width="330">'+
				    '</div>'+
				    '<div class="carousel-item">'+
				      '<img src="https://comofazerbrigadeiro.com.br/wp-content/uploads/2013/11/Brigadeiro-cereja-e-ovomaltine-011.jpg" class="d-block w-100" alt="..." height="720" width="330">'+
				    '</div>'+
				    '<div class="carousel-item">'+
				      '<img src="https://img.elo7.com.br/product/original/1510FE1/brigadeiro-gourmet-chocolate-belga-brigadeiro.jpg" class="d-block w-100" alt="..." height="720" width="330">'+
				    '</div>'+
				  '</div>'+
				  '<a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">'+
				    '<span class="carousel-control-prev-icon" aria-hidden="true"></span>'+
				    '<span class="sr-only">Previous</span>'+
				  '</a>'+
				  '<a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">'+
				    '<span class="carousel-control-next-icon" aria-hidden="true"></span>'+
				    '<span class="sr-only">Next</span>'+
				  '</a>'+
				'</div>';
				
				stHtml += '</div>';
				stHtml += '</div>';
				
				stHtml += '<br><br>';	
				
				for (var int = 0; int < lista.length; int++) {
					stHtml += '<div class="container">';
						stHtml += '<div class="row">';
							
							stHtml += '<div class="col">'
								stHtml += '<div class="media">';
									var imgURL;
									if(lista[int]['thumbnail']){
										var fileObj = file.load({id: lista[int]['thumbnail']});
										imgURL = fileObj.url;
									}else{
										imgURL = '';
									}
									stHtml += '<img class="mr-3" src="'+ imgURL +'" alt="..." height="175" width="183">';
									stHtml += '<div class="media-body">';
										stHtml += '<h5 class="mt-0">'+ lista[int]['name'] +'</h5>';
										stHtml += lista[int]['dtlDescr'];
									stHtml += '</div>';
								stHtml += '</div>';
							stHtml += '</div>';
							
							int++;
							if(int < lista.length){
								stHtml += '<div class="col">'
									stHtml += '<div class="media">';
										var imgURL;
										if(lista[int].thumbnail){
											var fileObj = file.load({id: lista[int].thumbnail});
											imgURL = fileObj.url;
										}else{
											imgURL = '';
										}
										stHtml += '<img class="mr-3" src="'+ imgURL +'" alt="..." height="175" width="183">';
										stHtml += '<div class="media-body">';
											stHtml += '<h5 class="mt-0">'+ lista[int]['name'] +'</h5>';
											stHtml += lista[int]['dtlDescr'];
										stHtml += '</div>';
									stHtml += '</div>';
								stHtml += '</div>';
							}
						stHtml += '</div>';
					stHtml += '</div>';
				}// end for (var int = 0; int < lista.length; int++)
				
				stHtml += '<!-- Optional JavaScript -->'
				stHtml += '<!-- jQuery first, then Popper.js, then Bootstrap JS -->'
				stHtml += '<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>'
				stHtml += '<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js" integrity="sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut" crossorigin="anonymous"></script>'
				stHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js" integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k" crossorigin="anonymous"></script>'
			stHtml += '</body>'
		stHtml += '</html>'
		    
		context.response.write (stHtml);
	}
	
	function handlePost(context) {
		
	}


    return {
        onRequest: onRequest
    };
    
});
