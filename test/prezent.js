window.addEventListener("load", function() {

	var smoothStickyMethod = new smoothSticky(".column_sticky", {
		offsetTopElements: [
			document.querySelector("#header"), 
			document.querySelector("#adminbar")
		],
		indent: {
			top: 30,
			bottom: 30
		}
	});

	return;

	//OR

	$(".column_sticky").smoothSticky({
		offsetTopElements: $("#header, #adminbar"),
		indent: {
			top: 30,
			bottom: 30
		}
	});

});