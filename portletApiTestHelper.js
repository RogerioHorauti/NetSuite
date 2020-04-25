define(['N/portlet'],
	function(portlet) {
		function refreshPortlet() {
			portlet.refresh(); // atualizar
		}
		
		function resizePortlet() {
			var div = document.getElementById('divfield_elem');
			var newHeight = parseInt(document.getElementById('resize_height').value);
			var newWidth = parseInt(document.getElementById('resize_width').value);
			div.style.height = newHeight + 'px';
			div.style.width = newWidth + 'px';
			portlet.resize(); // redimensionar
		}
	return {
		refreshPortlet: refreshPortlet,
		resizePortlet: resizePortlet
	};
})