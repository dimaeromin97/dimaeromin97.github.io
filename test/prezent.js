window.addEventListener("load", function() {

	var smoothStickyMethod = new smoothSticky(".column_sticky", {
		offsetTopElement: document.querySelector("#header")
	});

	return;

	//OR

	$(".column_sticky").smoothSticky({
		offsetTopElement: document.querySelector("#header")
	});

});