var cssFileName = 'bundle.css';
var cssDir      = 'public/css/';
var cssLibDir   = cssDir + '/lib/';
var jsFileName  = 'bundle.js';
var jsDir       = 'public/libs/';

var gulp       = require("gulp"),
    buffer     = require('vinyl-buffer'),
    source     = require("vinyl-source-stream")
    browserify = require("browserify"),
    bower      = require('main-bower-files'),
    gulpFilter = require('gulp-filter'),
    concat     = require("gulp-concat"),
    rename     = require('gulp-rename'),
    less       = require('gulp-less'),
    cssnano    = require("gulp-cssnano"),
    uglify     = require("gulp-uglify");

gulp.task('bowerCSS', function() {
  var cssFilter  = gulpFilter('**/*.css', {restore: true}),
      lessFilter = gulpFilter('**/*.less', {restore: true});
  return gulp.src( bower({
      paths: {
        bowerJson: 'bower.json'
      }
    }) )
    .pipe( cssFilter )
    .pipe( gulp.dest(cssLibDir) )
    .pipe( cssFilter.restore )
    .pipe( lessFilter )
    .pipe( less() )
    .pipe( gulp.dest(cssLibDir) )
    .pipe( lessFilter.restore );
});

gulp.task('bowerCSS.concat', ['bowerCSS'] ,function() {
  return gulp.src(cssLibDir + '*.css')
    .pipe( concat(cssFileName) )
    .pipe( gulp.dest(cssDir) )
    .pipe( cssnano() )
    .pipe( rename({
      extname: '.min.css'
    }) )
    .pipe( gulp.dest(cssDir) );
});

gulp.task('bowerJS', function() {
  return browserify({
      entries: ["./dev/libs/duo.js"]
    })
    .bundle()
    .pipe( source(jsFileName) )
    .pipe( gulp.dest(jsDir) )
    .pipe( buffer() )
    .pipe( uglify({
      preserveComments: 'some'
    }) )
    .pipe( rename({
      extname: '.min.js'
    }) )
    .pipe( gulp.dest(jsDir) );
});

// bowerのCSSとJSを取ってくるタスク
gulp.task('bower.init', ['bowerCSS', 'bowerCSS.concat','bowerJS']);

gulp.task('watch', ['bower.init'], function(){
  var js_watcher = gulp.watch('dev/**/*.js', ['log', 'bowerJS']);
  js_watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
  var css_watcher = gulp.watch('./dev/**/*.css', ['bowerCSS']);
  js_watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});
