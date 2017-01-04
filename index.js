#!/usr/bin/env node
/* jshint: node: true */

/*
 * Watch a project, and execute PHP QA tooling as files change.
 *
 * By default, runs `composer check` when any of the following change:
 *
 * - phpunit.xml.dist
 * - phpcs.xml
 * - any PHP files under src/
 * - any PHP files under test/
 *
 * You can alter the behavior via the following flags:
 *
 * - -d|--no-notifications will disable system notifications when failures occur
 * - -w|--watch-files allows you to provide a comma separated list of files/glob
 *   patterns to watch
 * - -c|--check-command allows you to specify an alternate command to run in
 *   order to perform checks; defaults to "composer check"
 */

var chokidar = require('chokidar');
var colors = require('colors');
var exec = require('child_process').exec;
var program = require('commander');
var notifier = require('node-notifier');

var pwd = require('process').env.PWD || require('process').cwd();
var project = require('path').posix.basename(pwd);
var errorIcon = __dirname + '/error.png';
var defaultWatchFiles = ['phpunit.xml.dist', 'phpcs.xml', 'src/**/*.php', 'test/**/*.php'];
var defaultCommand = 'composer check';
var scanComplete = false;

function list(value) {
  return value.split(',');
}

function now() {
  return new Date();
}

program
  .version('0.1.1')
  .usage('[options]')
  .option(
    '-d, --no-notifications',
    'Disable notifications when test failures occur'
  )
  .option(
    '-w, --watch-files [files]',
    'Specify files/directories/globs to watch, as a comma-separated list; defaults to: "phpunit.xml.dist,phpcs.xml,src/**/*.php,test/**/*.php"',
    list,
    defaultWatchFiles
  ) 
  .option(
    '-c, --check-command [command]',
    'Specify the check command to run, with all arguments; defaults to "composer check"',
    defaultCommand
  )
  .parse(process.argv);

console.info(colors.green('[%s] Watching %s'), now().toISOString(), pwd);

var watcher = chokidar.watch(program.watchFiles, {persistent: true});

watcher.on('ready', function() {
  console.info(colors.green('[%s] Completed initial scan'), now().toISOString());
  scanComplete = true;
});

watcher.on('all', function (event, path) {
  if (! scanComplete) {
    /* Do nothing until we've finished scanning files */
    return;
  }

  if (-1 === ['add', 'change'].indexOf(event)) {
    /* Not an interesting change */
    return;
  }

  console.info(colors.green('[%s] %s changed; running checkers'), now().toISOString(), path);

  var checker = exec(program.checkCommand);

  checker.stdout.on('data', function (data) {
    process.stdout.write(data);
  });

  checker.stderr.on('data', function (data) {
    process.stderr.write(data);
  });

  checker.on('close', function (code) {
    if (0 === code || program.noNotifications) {
      return;
    }

    console.log(colors.red('[%s] %s exited with code %d'), now().toISOString(), program.checkCommand, code);

    notifier.notify({
      title: project + ' failures',
      message: 'PHP QA tooling reported failures in ' + pwd,
      icon: errorIcon
    });
  });
});
