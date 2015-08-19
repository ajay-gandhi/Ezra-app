var gulp  = require('gulp'),
    fs    = require('fs-extra'),
    spawn = require('child_process').spawn;

// Compile OS X app
gulp.task('compile-osx', function (next) {
  // Prints phases of tntbuild process
  var phases = ['Cleaning', 'Validating', 'Packaging', 'Linking'],
      phase  = -1;

  var compile_mac = spawn('tntbuild', ['--clean', '--no-windows-build', './package.json']);

  compile_mac.stdout.on('data', function (chunk) {
    if (phase != 3 && chunk.toString().indexOf(phases[phase + 1].toLowerCase()) != -1) {
      phase++;
      console.log(phases[phase] + '...');
    }
  });

  compile_mac.on('close', function () {
    // Return from task
    next();
  });
});

// Compile Windows app
gulp.task('compile-windows', function (next) {
  // Prints phases of tntbuild process
  var phases = ['Validating', 'Linking'],
      phase  = -1;

  var compile_win = spawn('tntbuild', ['--no-osx-build', './package.json']);

  compile_win.stdout.on('data', function (chunk) {
    if (phase != 1 && chunk.toString().indexOf(phases[phase + 1].toLowerCase()) != -1) {
      phase++;
      console.log(phases[phase] + '...');
    }
  });

  compile_win.on('close', function () {
    // Return from task
    next();
  });
});

// Compile app for all platforms
gulp.task('compile-all', function (next) {
  // Prints phases of tntbuild process
  var phases = ['Cleaning', 'Validating', 'Packaging', 'Linking'],
      phase  = -1;

  var compile_all = spawn('tntbuild', ['--clean', './package.json']);

  compile_all.stdout.on('data', function (chunk) {
    if (phase != 3 && chunk.toString().indexOf(phases[phase + 1].toLowerCase()) != -1) {
      phase++;
      console.log(phases[phase] + '...');
    }
  });

  compile_all.on('close', function () {
    // Return from task
    next();
  });
});

gulp.task('default', ['compile-all']);
