# php-qa-watch

Automate running your PHP QA toolset!

## Installation

```bash
# npm
$ npm i phly-php-qa-watch -g
# yarn
$ yarn global add phly-php-qa-watch
```

## Usage

At its most basic, execute the watcher:

```bash
$ php-qa-watch
```

By default, the script, runs `composer check` when any of the following change:

- `phpunit.xml.dist`
- `phpcs.xml`
- any PHP files under `src/`
- any PHP files under `test/`

You can alter the behavior via the following flags:

- `-d|--no-notifications` will disable system notifications when failures occur
- `-w|--watch-files` allows you to provide a comma separated list of files/glob
  patterns to watch
- `-c|--check-command` allows you to specify an alternate command to run in
  order to perform checks; defaults to "composer check"

Using either `-h` or `--help` will provide the usage message as well.

### Using alternate checkers

To use an alternate tool or pipeline for checking your project, use the `-c` or
`--check-command` flags to provide one. As an example, perhaps you want to
combine several composer scripts, without writing an aggregate:

```bash
$ php-qa-watch -c "composer cs-lint && composer unit-test && composer mess-detector"
```

Alternately, perhaps you don't have composer scripts defined; you can just
specify an `&&`'d set of commands in that case:

```bash
$ php-qa-watch -c "./vendor/bin/php-cs-fixer fix --dry-run -v --diff && phpunit --colors=always"
```

### Specifying different files to watch

The `-w` or `--watch-files` flags allow you to specify a comma-separated list of
files, directories, or glob patterns detailing what files to watch for changes.

Let's combine this with the above example:

```bash
$ php-qa-watch \
> -c "./vendor/bin/php-cs-fixer fix --dry-run -v --diff && phpunit --colors=always" \
> -w ".php_cs,phpunit.xml,phpunit.xml.dist,src/**/*.php,test/**/*.php"
```

The above adds ensures that the `.php_cs` and `phpunit.xml` files are watched,
but not the `phpcs.xml` (which is in the default set).

### Disabling notifications

By default, `php-qa-watch` will provide a system notification when the specified
checker fails. This is done to allow you to run the watcher in a hidden
terminal, and only raise it when you see a notification of a break.

If you do not want the notification, disable it with the `-d` or
`--no-notifications` flag.
