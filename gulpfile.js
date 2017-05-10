var gulp = require("gulp");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");

gulp.task("minify", function () {
	return gulp.src("dist/realprogress.js")
		.pipe(uglify())
		.pipe(rename("realprogress.min.js"))
		.pipe(gulp.dest("dist"))
		.pipe(gulp.dest("demo"));
});

gulp.task("default", ["minify"]);