// Build for breeze.server.node-breeze-client

var gulp    = require('gulp');
var changed = require('gulp-changed');
var shell = require('gulp-shell');
var rename = require('gulp-rename');

// var eventStream = require('event-stream');

var dest = './'

var srcDir = '../src/'
var buildDir = './'

// build the Typescript files
gulp.task('buildTypescript', 
  shell.task(['tsc'], { cwd: '..' })
);

gulp.task('moveFiles', ['buildTypescript'], function() {
  return gulp.src( mapPath(srcDir, ['breeze-bridge-angular2.js', 'breeze-bridge-angular2.d.ts']))
    .pipe(rename(function(path) {
      var name = path.basename;
      path.basename = 'index' + (name.indexOf('.') < 0 ? '' : name.substring(name.indexOf('.')));
    }))
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