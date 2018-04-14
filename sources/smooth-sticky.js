!(function(window){
	function smoothSticky(selector_or_node, options){
		var options_def = {
			offsetTop: 0,
			offsetTopElement: false,
			scroll: {
				delay_end: 50,
				timeout_fn: null,
			},
			method_sticky: "transform"
		};
		options = Object.assign(options_def, options);
		var sticky_element_all = getStickyBySelector(selector_or_node);
		var setStickyPositions = getMethodSticky();
		var getScreenOffsetTop = getMethodScreenOffsetTop();

		sticky_element_all.__proto__.calculateSize = function() {
			for(var index = 0; index < this.length; index+=1){
				this[index].element_size = getOffSize(this[index].element);
				this[index].parent_size = getOffSize(this[index].parent);
			}
		}

		sticky_element_all.__proto__.scroll = function() {
			scrollEnd(smoothStickyMove);
		}

		window.addEventListener('resize', stickyEventResize, false);
		window.addEventListener('scroll', stickyEventScroll, false);
		stickyEventResize();
		smoothStickyMove();

		function smoothStickyMove(){
			var scroll_top = getScreenOffsetTop();
			var scroll_bottom = window.pageYOffset + window.innerHeight;
			for(var index = 0; index < sticky_element_all.length; index+=1){
				var sticky_detalis = sticky_element_all[index];
				var sticky_parent = sticky_detalis.parent;
				var sticky_element = sticky_detalis.element;
				var sticky_offset = getOffset(sticky_element);
				var sticky_parent_offset = getOffset(sticky_parent);
				
				if(false){
					//setStickyPositions(sticky_element, (sticky_offset.top - scroll_top));

				} else if(sticky_offset.bottom < scroll_bottom && sticky_parent_offset.bottom > sticky_offset.bottom){
					setStickyPositions(sticky_element, scroll_top);

					console.log("Bottom!");
				}

			}
		}

		function getMethodScreenOffsetTop(){
			if(options.offsetTopElement && options.offsetTopElement.tagName){
				return function(){
					return  window.pageYOffset + options.offsetTopElement.offsetHeight;
				};
			}

			return  function(){
				return window.pageYOffset + options.offsetTop;
			}
		}

		function AAAAAAAAAAAAAAAAAAAAAAAAAAAA(){
			var diff = window.pageYOffset + (window.screen.availHeight);

			$stickyElement.each(function(index, item){
				var $item = $(item);
				var item_height = $item.height();
				var item_width = $item.width();
				var $parent = $item.parent();
				var parent_height = $parent.height();
				var parent_margin_side = parseFloat($parent.css("margin-right")) + parseFloat($parent.css("margin-left"));
				var parent_width = Math.floor($parent.outerWidth() + parent_margin_side);
				var pos = getOffset($parent[0]).top;
				var pos_par_bottom = getOffset($parent[0]).top + parent_height;
				var pos_bot = pos + item_height;

				if(item_width < parent_width){
					if (diff > (pos_bot)) {
						if(diff < (pos + parent_height)){
							item.style.transform = "translate(0, " + (diff - (pos_bot)) + 'px)';
						} else {
							item.style.transform = "translate(0, " + (parent_height - item_height) + 'px)';
						}
					} else {
						item.style.transform = "translate(0, " + '0)';
					}
				} else{
					item.style.transform = "";
				}
			});
		}

		function stickyEventResize(){
			sticky_element_all.calculateSize();
		}

		function stickyEventScroll(){
			sticky_element_all.scroll();
		}

		function getMethodSticky(){
			var method_sticky = (function(){
				switch(options.method_sticky){
					case "translate":
						return setStickyPositionsTranslate;
					case "top":
						return setStickyPositionsTop;
					default:
						return setStickyPositionsTop;
				}
			})();

			return (function(){
				return method_sticky;
			})();
		}

		function setStickyPositionsTop(element, x){
			element.style.top = x + "px";
		}

		function setStickyPositionsTranslate(element, x){
			var translate_css = "translate(0, " + x + "px)";

			element.style.webkitTransform = translate_css;
			element.style.MozTransform = translate_css;
			element.style.msTransform = translate_css;
			element.style.OTransform = translate_css;
			element.style.transform = translate_css;
		}

		function getStickyBySelector(selector){
			var $sticky_all = (function(){
				var selector_type = typeof selector;

				if(selector_type === "string"){
					return document.querySelectorAll(selector);
				} else if(Array.isArray(selector)){
					return selector;
				} else if(selector.tagName){
					return [selector];
				} else if(selector.item){
					return selector;
				}

				return false;
			})();
			var sticky_all_detalis = [];

			$sticky_all.forEach(function($item){
				var $item_parent = $item.parentElement;
				var item_details = {
					element: $item,
					element_size: getOffSize($item),
					parent: $item_parent,
					parent_size: getOffSize($item_parent),
				};

				sticky_all_detalis.push(item_details);
			});

			return sticky_all_detalis;
		}

		function scrollEnd(cb){
			clearTimeout(options.scroll.timeout_fn);
			options.scroll.timeout_fn = setTimeout(cb, options.scroll.delay_end);
		}

		function getOffSize(el){
			return {
				width: el.offsetWidth,
				height: el.offsetHeight
			};
		}

		function getOffset(el){
			var offsetHeight = el.offsetHeight;
			var _x = 0;
			var _y = 0;

			while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
				_x += el.offsetLeft - el.scrollLeft;
				_y += el.offsetTop - el.scrollTop;
				el = el.offsetParent;
			}
			return { 
				top: _y, 
				left: _x,
				bottom: _y + offsetHeight
			};
		}

		return sticky_element_all;
	}


	window.smoothSticky = smoothSticky;
})(window);
