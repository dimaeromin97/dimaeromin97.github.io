/*
	Smooth Sticky 
	v1.0.0
*/

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

		var options_default = {
			offsetTop: 0,
			offsetTopElement: false,
			scroll: {
				delay: 66,
				timeout_fn: null,
			},
			resize: {
				min_width: 768
			},
			method_sticky: "transform",
			indent: {
				top: 0,
				bottom: 0,
			}
		};
		options = ObjectAssign(options_default, options);
		var session = { pageYOffset: window.pageYOffset }
		var sticky_element_all = getStickyBySelector(selector_or_node);
		var setStickyPositions = getMethodSticky();
		var getScreenOffsetTop = getMethodScreenOffsetTop();

		sticky_element_all.__proto__.calculateSize = function(){
			forEach(this, function(item, index){
				var this_index = item;
				var element_style = getComputedStyle(this_index.element);
				var parent_style = getComputedStyle(this_index.parent);
				var element_margin_side = parseFloat(element_style["margin-left"]) + parseFloat(element_style["margin-right"]);
				var parent_margin_side = parseFloat(parent_style["margin-left"]) + parseFloat(parent_style["margin-right"]);
				var item_outer_width = this_index.element.offsetWidth + element_margin_side;
				var parent_outer_width = this_index.parent.offsetWidth + parent_margin_side;

				this[index].is_active = (parent_outer_width > item_outer_width);

				if(!this[index].is_active){
					setStickyPositions(this_index.element, 0);
				}

				if(window.innerWidth > options.resize.min_width){
					scrollEnd(smoothStickyMove);
				}

			}.bind(this));
		};

		sticky_element_all.__proto__.scroll = function() {
			scrollEnd(smoothStickyMove);
		}

		sticky_element_all.__proto__.options = options;

		window.addEventListener('resize', stickyEventResize, false);
		window.addEventListener('scroll', stickyEventScroll, false);
		stickyEventResize();
		smoothStickyMove();

		function smoothStickyMove(){
			var scroll_top = getScreenOffsetTop();
			var pageYOffset = window.pageYOffset;
			var scroll_bottom = pageYOffset + window.innerHeight;
			var scroll_to_top = (session.pageYOffset > pageYOffset);
			
			forEach(sticky_element_all, function(item_stick){
				if(!item_stick.is_active) return false;

				var sticky_parent = item_stick.parent;
				var sticky_element = item_stick.element;
				var sticky_offset = getPostOnPage(sticky_element);
				var sticky_parent_offset = getPostOnPage(sticky_parent);
				var sticky_top_rel = sticky_offset.top - sticky_parent_offset.top;

				if(
					scroll_to_top &&
					sticky_offset.top > scroll_top &&
					sticky_offset.top > sticky_parent_offset.top
				){
					var sticky_up = (sticky_offset.top - sticky_parent_offset.top) - (Math.max(sticky_offset.top, scroll_top) - Math.min(sticky_offset.top, scroll_top)) + options.indent.top;

					if(sticky_up > 0){
						setStickyPositions(sticky_element, sticky_up);
					} else{
						setStickyPositions(sticky_element, 0);
					}
				} else if(
					!scroll_to_top &&
					sticky_offset.bottom < scroll_bottom &&
					sticky_parent_offset.top < scroll_top
				){
					var sticky_down = Math.max(scroll_bottom, sticky_offset.bottom) - Math.min(scroll_bottom, sticky_offset.bottom) + sticky_top_rel - options.indent.bottom;

					if(scroll_bottom < sticky_parent_offset.bottom){
						setStickyPositions(sticky_element, sticky_down);
					} else{
						setStickyPositions(sticky_element, (sticky_parent_offset.height - sticky_offset.height) -  parseInt(getComputedStyle(sticky_element).marginBottom));
					}
				}
				
			});

			session.pageYOffset = pageYOffset;
		}

		function getPostOnPage(el){
			var rect = el.getBoundingClientRect();
			var pageYOffset = window.pageYOffset;

			return {
				top: Math.floor(rect.top + pageYOffset), 
				bottom: Math.floor(rect.bottom + pageYOffset), 
				left: Math.floor(rect.left), 
				right: Math.floor(rect.right), 
				width: Math.floor(rect.width),
				outerWidth: Math.floor(rect.width + (el.offsetLeft * 2)),
				height: Math.floor(rect.height)
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

		function stickyEventResize(event){
			sticky_element_all.calculateSize();
		}

		function stickyEventScroll(){
			sticky_element_all.scroll();
		}

		function getMethodSticky(){
			switch(options.method_sticky){
				case "transform":
				case "translate":
					return setStickyPostTranslate;
				case "top":
					return setStickyPostTop;
				case "margin":
				case "margin-top":
					return setStickyPostMargin;
				default:
					return setStickyPostTranslate;
			}
			
		}
		

		function setStickyPostMargin(el, x){
			el.style.marginTop = x + "px";
		}

		function setStickyPostTop(el, x){
			el.style.top = x + "px";
		}

		function setStickyPostTranslate(el, x){
			var translate_css = "translate3d(0px, " + x + "px, 0px)";

			el.style.webkitTransform = translate_css;
			el.style.MozTransform = translate_css;
			el.style.msTransform = translate_css;
			el.style.OTransform = translate_css;
			el.style.transform = translate_css;
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
				var item_post = getPostOnPage($item);
				var parent_post = getPostOnPage($item_parent);
				var item_details = {
					element: $item,
					element_size: item_post,
					parent: $item_parent,
					parent_size: parent_post,
					is_active: (item_post.width <= parent_post.width)
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
			options.scroll.timeout_fn && clearTimeout(options.scroll.timeout_fn);
			options.scroll.timeout_fn = setTimeout(callback, options.scroll.delay);
		}

		return sticky_element_all;
	}

	window.smoothSticky = smoothSticky;

	if(window.jQuery){
		(function($){
			$.fn.smoothSticky = function(options){
				window.smoothSticky(this.toArray(), options);
			}
		})(window.jQuery);
	}
})(window);