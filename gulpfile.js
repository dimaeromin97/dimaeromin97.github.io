const gulp           = require('gulp');
const browserSync    = require('browser-sync').create();
const rename         = require('gulp-rename');
const uglify         = require('gulp-uglify');
const concat         = require('gulp-concat');

const paths = {
	js: {
		sources: ['sources/smooth-sticky.js']
	}
}

gulp.task('browser-sync', ["task-js"], () => {
		browserSync.init({
			server: {
				baseDir: "./"
			},
			open: false,
			notify: false
		});

	gulp.watch('test/test.html').on('change', browserSync.reload);
	gulp.watch(paths.js.sources, ["task-js"]);
});

gulp.task('task-js', () => {
	gulp.src(paths.js.sources)
		// .pipe(uglify({
		// 	mangle: true,
		// 	output: {
		// 		beautify: false,
		// 		comments: true
		// 	}
		// }))
		.pipe(concat('smooth-sticky.min.js'))
		.pipe(gulp.dest('C:/OpenServer/domains/mihalich-themes.net/wp-content/themes/mihalich/js/'));
});

gulp.task('default', ['browser-sync']);


