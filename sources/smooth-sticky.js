/*
	Smooth Sticky 
	v1.0.0
*/

!(function(window){
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
		
	})(),
	eventsManager = {
		add: function(e_type, fn, useCapture, callback){
			callback = (typeof callback === "function") ? callback : function(){};
			useCapture = (useCapture ? useCapture : false);
			var function_name = getFunctionName(fn);

			if(!this[e_type]){
				this[e_type] = {};
			}

			if(!this[e_type][function_name]){
				this[e_type][function_name] = true;
				window.addEventListener(e_type, fn, useCapture);
				callback.bind({
					e_type: e_type,
					fn: fn
				})();
			}
		},
		remove: function(e_type, fn, callback){
			callback = (typeof callback === "function") ? callback : function(){};
			var function_name = getFunctionName(fn);

			window.removeEventListener(e_type, fn, false);
			
			if(this[e_type]){
				if(this[e_type][function_name]){
					delete this[e_type][function_name]
					callback.bind({
						e_type: e_type,
						fn: fn
					})();
				}
			}
		}
	};

	function smoothSticky(selector_or_node, input_options){
		var options_default = {
			offsetTop: 0,
			scroll_delay: 66,
			scroll_timeout_fn: null,
			onScroll: new Function,
			resize: { min_width: 768 },
			method_sticky: "transform",
			indent_top: 0,
			indent_bottom: 0
		},
		// VAR
		core = {
			data: {
				scroll: window.pageYOffset
			},
			session: { 
				pageYOffset: window.pageYOffset
			},
			sticky_all: getStickyBySelector(selector_or_node),
			options: ObjectAssign(options_default, input_options),
			init: function(){
				window.addEventListener('resize', generalEventResize, false);
				registerEvents();
				generalEventResize();
			},
			doScroll: function() {
				stickyScrollEnd(); 
			},
			doMove: function(){
				var pageYOffset = this.data.scroll,
					scroll_top = pageYOffset + this.options.offsetTop,
					scroll_bottom = pageYOffset + window.innerHeight,
					scroll_to_top = (this.session.pageYOffset > pageYOffset);

				forEach(this.sticky_all, function(item_stick){
					var sticky_parent = item_stick.parent;
						sticky_element = item_stick.element, 
						sticky_post = getInfoSticky(sticky_element, sticky_parent),
						sticky_diff_height = sticky_post.that.top - sticky_post.parent.top,
						sticky_diff_scroll_top = MaxMinDiff(sticky_post.that.top, scroll_top),
						sticky_from_top = sticky_post.top_rel;

					if(sticky_post.sticky_outer_width >= sticky_post.parent_outer_width){
						setPositions(sticky_element, 0);
						return;
					}

					if(
						scroll_to_top &&
						sticky_post.that.top > scroll_top &&
						sticky_post.that.top > sticky_post.parent.top
					){
						var sticky_up = (sticky_diff_height - sticky_diff_scroll_top) + this.options.indent_top;

						if(sticky_up > 0 && sticky_up < sticky_post.it_extreme_bottom){
							sticky_from_top = sticky_up;
						} else if(sticky_up > sticky_post.it_extreme_bottom){
							sticky_from_top = sticky_post.it_extreme_bottom;
						} else{
							sticky_from_top = 0;
						}
					} else if(
						!scroll_to_top &&
						sticky_post.that.bottom < scroll_bottom &&
						sticky_post.parent.top < scroll_top
					){
						var sticky_down = (MaxMinDiff(scroll_bottom, sticky_post.that.bottom) + sticky_post.top_rel) - this.options.indent_bottom,
							innerHeight_diff_height =  sticky_post.that.height > (window.innerHeight - this.options.offsetTop);

						if(!innerHeight_diff_height){
							if(document.documentElement.scrollHeight <= scroll_bottom){
								sticky_from_top = sticky_post.it_extreme_bottom;
							} else{
								sticky_from_top = Math.min(sticky_down - ((window.innerHeight - this.options.offsetTop) - sticky_post.that.height) + (this.options.indent_top + this.options.indent_bottom), sticky_post.it_extreme_bottom);
							}
						} else if(scroll_bottom < sticky_post.parent.bottom){
							sticky_from_top = Math.max(sticky_down, 0);
						} else{
							sticky_from_top = sticky_post.it_extreme_bottom;
						}
					}

					if(sticky_from_top != sticky_post.top_rel){
						setPositions(sticky_element, sticky_from_top);
					}
				}.bind(this));

				this.session.pageYOffset = pageYOffset;
			}
		},
		setPositions = getMethodSticky();

		core.init();

		function registerEvents(){
			eventsManager.add('scroll', stickyEventScroll, false, function(){
				scrollEnd(this.fn());
			});
			eventsManager.add('resize', stickyEventResize, false, function(){
				scrollEnd(this.fn());
			});
		}

		function removeRegisteredEvents(){
			eventsManager.remove('scroll', stickyEventScroll);
			eventsManager.remove('resize', stickyEventResize, function(){
				scrollEnd(this.fn);
			});
		}

		function generalEventResize(){
			console.log("generalEventResize");
			if(core.options.resize.min_width >= window.innerWidth){
				removeRegisteredEvents();
			} else{
				registerEvents();
			}
		}

		function stickyEventScroll(){
			core.doScroll();
		}

		function stickyEventResize(){
			setTimeout(function(){
				core.session.pageYOffset-=1;
				core.doScroll();

				setTimeout(function(){
					core.session.pageYOffset+=2;
					core.doScroll();
				}, core.options.scroll_delay);
			}, core.options.scroll_delay);
		}

		function getMethodSticky(){
			switch(core.options.method_sticky){
				case "transform":
				case "translate":
					return setStickyPostTranslate;
				case "margin":
				case "margin-top":
					return setStickyPostMargin;
				case "top":
					return setStickyPostTop;
				default:
					return setStickyPostTranslate;
			}
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
				var $item_parent = $item.parentElement,
					item_details = {
					element: $item,
					parent: $item_parent
				};

				sticky_all_detalis.push(item_details);
			});

			return sticky_all_detalis;
		}

		function scrollEnd(callback){
			core.options.scroll_timeout_fn && clearTimeout(core.options.scroll_timeout_fn);
			core.options.scroll_timeout_fn = setTimeout(callback, core.options.scroll_delay);
		}

		function stickyScrollEnd(){
			scrollEnd(stickyRunMove);
		}

		function stickyRunMove() {
			core.data.scroll = window.pageYOffset;
			core.options.onScroll.bind(core)();
			core.doMove();
		}

		return core;
	}

	function forEach(input_array, callback) {
		for(var index = 0; index < input_array.length; index+=1){
			callback(input_array[index], index);
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

	function getPostOnPage(el){
		var rect = el.getBoundingClientRect(),
			pageYOffset = window.pageYOffset;

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

	function getFunctionName(fun) {
		var ret = fun.toString();

		ret = ret.substr('function '.length);
		ret = ret.substr(0, ret.indexOf('('));

		return ret;
	}

	function getInfoSticky(sticky_element, sticky_parent) {
		var that = getPostOnPage(sticky_element),
			parent = getPostOnPage(sticky_parent),
			sticky_style = getComputedStyle(sticky_element), 
			parent_style = getComputedStyle(sticky_parent),
			sticky_margin_side = parseFloat(sticky_style["margin-left"]) + parseFloat(sticky_style["margin-right"]),
			parent_margin_side = parseFloat(parent_style["margin-left"]) + parseFloat(parent_style["margin-right"]);
			
		return {
			that: that, 
			parent: parent,
			sticky_style: sticky_style,
			parent_style: parent_style,
			top_rel: that.top - parent.top, 
			it_extreme_bottom: (parent.height - that.height) -  parseInt(sticky_style["margin-bottom"], 10), 
			sticky_margin_side: sticky_margin_side,
			parent_margin_side: parent_margin_side,
			sticky_outer_width: that.width + sticky_margin_side, 
			parent_outer_width: parent.width + parent_margin_side
		}
	}

	function MaxMinDiff(first, second){
		return Math.max(first, second) - Math.min(first, second);
	}

	window.smoothSticky = smoothSticky;

	if(window.jQuery){
		(function($){
			$.fn.smoothSticky = function(options){
				return window.smoothSticky(this.toArray(), options);
			}
		})(window.jQuery);
	}
})(window);