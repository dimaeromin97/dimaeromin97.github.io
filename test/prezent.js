window.addEventListener("load", function() {

	var smoothStickyMethod = smoothSticky(".column_sticky", {
		indent_top: 32,
		indent_bottom: 32,
		onScroll: function(){
			this.options.offsetTop = document.getElementById("header").offsetHeight +  document.getElementById("adminbar").offsetHeight;
		}
	});

	return;

	//OR

	$(".column_sticky").smoothSticky({
		indent_top: 30,
		indent_bottom: 30
	});

});