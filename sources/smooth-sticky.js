/*
	Smooth Sticky 
	v1.0.2
*/

(function(window){
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
		add: function(e_type, fn, useCapture, fun_run){
			useCapture = (useCapture ? useCapture : false);
			var fun_name = getFnName(fn);

			if(!this[e_type]){
				this[e_type] = {};
			}

			if(!this[e_type][fun_name]){
				this[e_type][fun_name] = true;
				window.addEventListener(e_type, fn, useCapture);
				fun_run && fn();
			}
		},
		remove: function(e_type, fn, fun_run){
			var fun_name = getFnName(fn);

			window.removeEventListener(e_type, fn, false);
			
			if(this[e_type]){
				if(this[e_type][fun_name]){
					delete this[e_type][fun_name]
					fun_run && fn();
				}
			}
		}
	},
	css_support_transform = getSupportTransform();

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
		core = {
			data: {
				scroll: window.pageYOffset
			},
			session: { 
				page_y_offset: window.pageYOffset
			},
			sticky_all: getElBySelector(selector_or_node),
			options: ObjectAssign(options_default, input_options),
			init: function(){
				eventsManager.add('resize', this.generalEventResize.bind(this), false);
				this.generalEventResize();
				this.registerEvents();
			},
			generalEventResize: function(){
				if(this.options.resize.min_width >= window.innerWidth){
					this.removeRegisteredEvents();
				} else{
					this.registerEvents();
				}
			},
			doScrollEnd: function() {
				this.scrollEnd(this.stickyRunMove.bind(this)); 
			},
			doMove: function(){
				var page_y_offset = this.data.scroll,
					scroll_top = page_y_offset + this.options.offsetTop,
					inner_height = window.innerHeight,
					scroll_bottom = page_y_offset + inner_height,
					scroll_to_top = (this.session.page_y_offset > page_y_offset);

				for(var index = 0; index < this.sticky_all.length; index+=1){
					var item_stick = this.sticky_all[index];
						sticky_parent = item_stick.parent;
						sticky_el = item_stick.element, 
						sticky_post = getInfoSticky(sticky_el, sticky_parent),
						sticky_diff_height = sticky_post.current.top - sticky_post.parent.top,
						sticky_diff_scroll_top = MaxMinDiff(sticky_post.current.top, scroll_top),
						sticky_from_top = sticky_post.top_rel;

					if(sticky_post.outer_width >= sticky_post.parent_outer_width){
						setPositions(sticky_el, 0);
						continue;
					} else if(
						scroll_to_top &&
						sticky_post.current.top > scroll_top &&
						sticky_post.current.top > sticky_post.parent.top
					){
						var sticky_up = (sticky_diff_height - sticky_diff_scroll_top) + this.options.indent_top;

						if(sticky_up > 0 && sticky_up < sticky_post.last_bottom){
							sticky_from_top = sticky_up;
						} else if(sticky_up > sticky_post.last_bottom){
							sticky_from_top = sticky_post.last_bottom;
						} else{
							sticky_from_top = 0;
						}
					} else if(
						!scroll_to_top &&
						sticky_post.current.bottom < scroll_bottom &&
						sticky_post.parent.top < scroll_top
					){
						var sticky_down = (MaxMinDiff(scroll_bottom, sticky_post.current.bottom) + sticky_post.top_rel) - this.options.indent_bottom,
							innerHeight_diff_height =  sticky_post.current.height > (inner_height - this.options.offsetTop);

						if(!innerHeight_diff_height){
							if(document.documentElement.scrollHeight <= scroll_bottom){
								sticky_from_top = sticky_post.last_bottom;
							} else{
								sticky_from_top = Math.min(sticky_down - ((inner_height - this.options.offsetTop) - sticky_post.current.height) + (this.options.indent_top + this.options.indent_bottom), sticky_post.last_bottom);
							}
						} else if(scroll_bottom < sticky_post.parent.bottom){
							sticky_from_top = Math.max(sticky_down, 0);
						} else{
							sticky_from_top = sticky_post.last_bottom;
						}
					}

					sticky_from_top != sticky_post.top_rel && setPositions(sticky_el, sticky_from_top);
				}

				this.session.page_y_offset = page_y_offset;
			},
			stickyRunMove: function () {
				this.data.scroll = window.pageYOffset;
				this.options.onScroll.bind(this)();
				this.doMove();
			},
			scrollEnd: function(callback){
				this.options.scroll_timeout_fn && clearTimeout(this.options.scroll_timeout_fn);
				this.options.scroll_timeout_fn = setTimeout(callback, this.options.scroll_delay);
			},
			stickyEventResize: function(){
				setTimeout(function(){
					this.session.page_y_offset+=2;
					this.doScrollEnd();

					setTimeout(function(){
						this.session.page_y_offset-=3;
						this.doScrollEnd();
					}.bind(this), 125);
				}.bind(this), 125);
			},
			removeRegisteredEvents: function(){
				eventsManager.remove('scroll', stickyEventScroll);
				eventsManager.remove('resize', this.stickyEventResize.bind(this), true);
			},
			registerEvents: function(){
				eventsManager.add('scroll', stickyEventScroll, false, true);
				eventsManager.add('resize', this.stickyEventResize.bind(this), false, true);
			}
		},
		setPositions = getMethodSticky(core.options.method_sticky);

		function stickyEventScroll(){
			core.doScrollEnd();
		}

		function getMethodSticky(method){
			switch(method){
				case "transform":
				case "translate":
					return setPostTranslate;
				case "margin":
				case "margin-top":
					return function(el, x){
						el.style.marginTop = x + "px";
					}
				case "top":
					return function(el, x){
						el.style.top = x + "px";
					}
				default:
					return setPostTranslate;
			}
		}

		function setPostTranslate(el, x){
			el.style[css_support_transform]= "translate(0px, " + x + "px)";
		}

		function getElBySelector(selector){
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

			for(var index = 0; index < $sticky_all.length; index+=1){
				var $item = $sticky_all[index];

				sticky_all_detalis.push({
					element: $item,
					parent: $item.parentElement
				});
			}

			return sticky_all_detalis;
		}

		core.init();

		return core;
	}

	function getSupportTransform() {
		var prefixes = 'transform webkitTransform MozTransform OTransform msTransform'.split(' ');
		var div = document.createElement('div');

		for(var i = 0; i < prefixes.length; i+=1) {
			if(div && div.style[prefixes[i]] !== undefined) {
				return prefixes[i];
			}
		}

		return false;
	}

	function getPostOnPage(el){
		var rect = el.getBoundingClientRect(),
			page_y_offset = window.pageYOffset;

		return {
			top: Math.floor(rect.top + page_y_offset), 
			bottom: Math.floor(rect.bottom + page_y_offset), 
			left: Math.floor(rect.left), 
			right: Math.floor(rect.right), 
			width: Math.floor(rect.width),
			outerWidth: Math.floor(rect.width + (el.offsetLeft * 2)),
			height: Math.floor(rect.height)
		};
	}

	function getFnName(fun) {
		var ret = fun.toString();

		ret = ret.substr('function '.length);
		ret = ret.substr(0, ret.indexOf('('));

		return ret;
	}

	function getInfoSticky(sticky_el, sticky_parent) {
		var current = getPostOnPage(sticky_el),
			parent = getPostOnPage(sticky_parent),
			style = getComputedStyle(sticky_el), 
			parent_style = getComputedStyle(sticky_parent),
			margin_side = addNum(style["margin-left"], style["margin-right"]),
			parent_margin_side = addNum(parent_style["margin-left"], parent_style["margin-right"]);
			
		return {
			current: current, 
			parent: parent,
			style: style,
			parent_style: parent_style,
			top_rel: current.top - parent.top, 
			last_bottom: (parent.height - current.height) - parseInt(style["margin-bottom"], 10), 
			margin_side: margin_side,
			parent_margin_side: parent_margin_side,
			outer_width: current.width + margin_side, 
			parent_outer_width: parent.width + parent_margin_side
		};
	}

	function addNum(arr){
		var common = 0;

		for(var index = 0; index < arr.length; index+=1){
			common += parseFloat(arr[index]);
		}

		return common;
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