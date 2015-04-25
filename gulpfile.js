var gulp  = require('gulp'),
    fs    = require('fs-extra'),
    spawn = require('child_process').spawn;

var copies_left = 7;

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

// Compile OS X app
gulp.task('compile-os-x', ['copy'], function (next) {
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
gulp.task('compile-windows', ['copy'], function (next) {
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
gulp.task('compile-all', ['copy'], function (next) {
  var compile_all = spawn('tntbuild', ['--clean', './make/package.json']);

  // compile_all.stdout.on('data', function (chunk) {
  //   console.log(chunk.toString());
  // });

  compile_all.on('close', function () {
    // Return from task
    next();
  });
});

// Delete subdir
gulp.task('remove', ['compile-all'], function (next) {
  fs.remove('./make', function () {
    next();
  });
});

gulp.task('default', ['remove']);

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
