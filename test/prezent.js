window.addEventListener("load", function() {

	var smoothStickyMethod = new smoothSticky(".column_sticky", {
		offsetTopElement: document.querySelector("#header"),
		indent: {
			top: 30,
			bottom: 30
		}
	});

	return;

	//OR

	$(".column_sticky").smoothSticky({
		offsetTopElement: document.querySelector("#header")
	});

});