# smooth-sticky.js


### Install

- [npm](https://www.npmjs.com/package/smooth-sticky.js): `npm i smooth-sticky.js`
- [bower](http://bower.io/search/?q=smooth-sticky.js): `bower i smooth-sticky.js`
- [git](https://github.com/dimaeromin97/smooth-sticky.js): `git clone https://github.com/dimaeromin97/smooth-sticky.js`

---

```html
<script src="node_modules/smooth-sticky.js/dist/smooth-sticky.min.js"></script>
<script src="bower_components/smooth-sticky.js/dist/smooth-sticky.min.js"></script>
```

### Usage

#### Html

```html
<div class="row">
	<div class="column column_sticky">
		Content Sticky
	</div>
	
	<div class="column one_half">
		Content Static
	</div>
	
	<div class="column column_sticky">
		Content Sticky
	</div>
</div>
```

#### Javascript

```javascript
	var smooth_sticky_options = smoothSticky(".column_sticky");
	
	//OR
	
	$(".column_sticky").smoothSticky();
```

### Options
```javascript
var options_default = {
	offsetTop: 0, //Distance from the top of the screen (#Header height)
	onScroll: new Function, //Event scroll
	resize: { min_width: 768 }, //The width at which the script runs
	method_sticky: "transform", // Method that will push from the top(transform, top, margin-top)
	indent_top: 0, //Distance from offsetTop
	indent_bottom: 0 //Distance from the bottom of the screen
};
```