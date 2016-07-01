// Build for breeze.server.node-breeze-client

var gulp    = require('gulp');
var changed = require('gulp-changed');
var shell = require('gulp-shell');

// var eventStream = require('event-stream');

var dest = './'

var srcDir = '../src/'
var buildDir = './'

// build the Typescript files
gulp.task('buildTypescript', 
  shell.task(['tsc'], { cwd: '..' })
);

gulp.task('moveFiles', ['buildTypescript'], function() {
  return gulp.src( mapPath(srcDir, ['*.js', '*.d.ts']))
    .pipe(changed('..'))
    .pipe(gulp.dest('..'))
})

gulp.task('default', ['moveFiles'], function() {

});

function mapPath(dir, fileNames) {
  return fileNames.map(function(fileName) {
    return dir + fileName;
  });
};