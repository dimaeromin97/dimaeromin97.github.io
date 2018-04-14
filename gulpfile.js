const gulp           = require('gulp');
const browserSync    = require('browser-sync').create();
const rename         = require('gulp-rename');
const jsmin         = require('gulp-jsmin');

const paths = {
	js: {
		sources: ['sources/**/*.js']
	}
}

gulp.task('browser-sync', () => {
		browserSync.init({
			server: {
				baseDir: "./"
			},
			notify: false
		});

	gulp.watch('test/test.html').on('change', browserSync.reload);
	gulp.watch(paths.js.sources, "task-js");
});

gulp.task('task-js', () => {
	gulp.src(paths.js.sources)
		.pipe(sourcemaps.init())
		.pipe(jsmin())
		.pipe(concat('smooth-sticky.min.js'))
		.pipe(sourcemaps.write({
			includeContent: false,
			sourceRoot: "../sources"
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('default', ['browser-sync']);


