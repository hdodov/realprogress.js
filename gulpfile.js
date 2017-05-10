var gulp = require("gulp");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");

gulp.task("minify", function () {
	return gulp.src("dist/xhr-progress-bar.js")
		.pipe(uglify())
		.pipe(rename("xhr-progress-bar.min.js"))
		.pipe(gulp.dest("dist"))
		.pipe(gulp.dest("demo"));
});

gulp.task("default", ["minify"]);