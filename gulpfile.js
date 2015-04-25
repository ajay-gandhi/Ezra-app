var gulp  = require('gulp'),
    fs    = require('fs-extra'),
    spawn = require('child_process').spawn;

var copies_left   = 7,
    removals_left = 3;

// Create a subdirectory and copy actual app files
gulp.task('copy', function (next) {
  fs.mkdir('make', function () {
    // Copy files
    copy_wait('./package.json',     './make/package.json',     next);
    copy_wait('./app.js',           './make/app.js',           next);
    copy_wait('./html',             './make/html',             next);
    copy_wait('./node_modules',     './make/node_modules',     next);
    copy_wait('./server.js',        './make/server.js',        next);
    copy_wait('./setup.js',         './make/setup.js',         next);
    copy_wait('./studentcenter.js', './make/studentcenter.js', next);
  });
});

// Remove gulp and fs-extra from node_modules since they aren't needed for app
gulp.task('remove-non-app-deps', ['copy'], function (next) {
  remove_wait('./make/node_modules/gulp',     next);
  remove_wait('./make/node_modules/fs-extra', next);
  remove_wait('./make/node_modules/.bin',     next);
});

// Compile OS X app
gulp.task('compile-osx', ['remove-non-app-deps'], function (next) {
  var compile_mac = spawn('tntbuild', ['--clean', '--no-windows-build', './make/package.json']);

  // compile_mac.stdout.on('data', function (chunk) {
  //   console.log(chunk.toString());
  // });

  compile_mac.on('close', function () {
    // Return from task
    next();
  });
});

// Compile Windows app
gulp.task('compile-windows', ['remove-non-app-deps'], function (next) {
  var compile_win = spawn('tntbuild', ['--clean', '--no-osx-build', './make/package.json']);

  // compile_win.stdout.on('data', function (chunk) {
  //   console.log(chunk.toString());
  // });

  compile_win.on('close', function () {
    // Return from task
    next();
  });
});

// Compile app for all platforms
gulp.task('compile-all', ['remove-non-app-deps'], function (next) {
  var compile_all = spawn('tntbuild', ['--clean', './make/package.json']);

  compile_all.stdout.on('data', function (chunk) {
    console.log(chunk.toString());
  });

  compile_all.on('close', function () {
    // Return from task
    next();
  });
});

// Delete subdirs
gulp.task('clean', ['compile-all'], function (next) {
  var finished_one = false;

  fs.remove('./make', function () {
    if (finished_one)
      next();
    else
      finished_one = true;
  });

  fs.remove('./build/tmp', function () {
    if (finished_one)
      next();
    else
      finished_one = true;
  });
});

gulp.task('default', ['clean']);


/**
 * Runs fs.copy on the inputs. Calls callback() when all copy operations finish.
 *
 * @param {string}   src       Source
 * @param {string}   dest      Destination
 * @param {function} callback  Function to call when all copies end
 */
var copy_wait = function (src, dest, callback) {
  fs.copy(src, dest, function () {
    copies_left--;
    if (copies_left == 0) callback();
  });
}

/**
 * Runs fs.remove on the input. Calls callback() when all rm operations finish.
 *
 * @param {string}   src       File/dir to delete
 * @param {function} callback  Function to call when all copies end
 */
var remove_wait = function (src, callback) {
  fs.remove(src, function () {
    removals_left--;
    if (removals_left == 0) callback();
  });
}
