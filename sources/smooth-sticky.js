!(function(window){
	function smoothSticky(selector_or_node, options){
		var ObjectAssign = (function(){
				if(Object.assign){
					return Object.assign;
				}

				return function(to) {
					for (var s = 1; s < arguments.length; s += 1) {
					var from = arguments[s];

						for (var key in from) {
							if(Object.prototype.hasOwnProperty.call(from, key)){
								to[key] = from[key];
							}
						}
					}

					return to;
				};
			
		})();

		var options_def = {
			offsetTop: 0,
			offsetTopElement: false,
			scroll: {
				delay_end: 50,
				timeout_fn: null,
			},
			method_sticky: "translate"
		};

		options = ObjectAssign(options_def, options);

		var sticky_element_all = getStickyBySelector(selector_or_node);
		var setStickyPositions = getMethodSticky();
		var getScreenOffsetTop = getMethodScreenOffsetTop();

		sticky_element_all.__proto__.calculateSize = function() {
			for(var index = 0; index < this.length; index+=1){
				this[index].element_size = getPostOnPage(this[index].element);
				this[index].parent_size = getPostOnPage(this[index].parent);
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
				var sticky_offset = getPostOnPage(sticky_element);
				var sticky_parent_offset = getPostOnPage(sticky_parent);
				var sticky_top_rel = sticky_offset.top - sticky_parent_offset.top; 
				var sticky_up = (scroll_top - options.offsetTop);
				var sticky_down = (Math.max(sticky_offset.bottom, scroll_bottom) - Math.min(sticky_offset.bottom, scroll_bottom)) + sticky_top_rel;
				
				if(sticky_offset.top > scroll_top && sticky_parent_offset.top < sticky_offset.top){
					setStickyPositions(sticky_element, sticky_up);
					console.log("To Up!");
				} else if(sticky_offset.bottom < scroll_bottom){
					if(sticky_down){
						setStickyPositions(sticky_element, sticky_down);

						return;
					}

					setStickyPositions(sticky_element, sticky_down);

					console.log("To Down!");
				}

			}
		}

		function getPostOnPage(el){
			var rect = el.getBoundingClientRect();
			var pageYOffset = window.pageYOffset;

			return {
				top: rect.top + pageYOffset, 
				bottom: rect.bottom + pageYOffset, 
				left: rect.left, 
				right: rect.right, 
				width: rect.width,
				height: rect.height
			};
		}

		function getMethodScreenOffsetTop(){
			if(options.offsetTopElement && options.offsetTopElement.tagName){
				return function(){
					options.offsetTop = options.offsetTopElement.offsetHeight;

					return  window.pageYOffset + options.offsetTop;
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

			forEach($sticky_all, function($item){
				var $item_parent = $item.parentElement;
				var item_details = {
					element: $item,
					element_size: getPostOnPage($item),
					parent: $item_parent,
					parent_size: getPostOnPage($item_parent),
				};

				sticky_all_detalis.push(item_details);
			});

			return sticky_all_detalis;
		}

		function forEach(input_array, callback) {
			for(var index = 0; index < input_array.length; index+=1){
				callback(input_array[index], index);
			}
		}

		function scrollEnd(callback){
			clearTimeout(options.scroll.timeout_fn);
			options.scroll.timeout_fn = setTimeout(callback, options.scroll.delay_end);
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
