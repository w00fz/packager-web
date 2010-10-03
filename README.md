Packager Web
============

Packager Web is a web application that uses [Packager](http://github.com/kamicane/packager) to download scripts, frameworks, plugins and the likes that follow the MooTools-like `package.yml` manifest and yaml headers syntax.

Installation
------------

	git clone git://github.com/kamicane/packager-web.git
	git submodule init
	git submodule update

Configuration
-------------

The easiest way to get started is to copy the `config.yml.example` to `config.yml`. Most of the things will work out of the box, except for the packages and possibly the compression. For the packages, just provide paths to the `package.yml` files, like this:

	- "/Users/kamicane/Sites/mootools-core/package.yml"
	- "/Users/kamicane/Sites/mootools-more/package.yml"
	- "/Users/kamicane/Sites/some-plugin/package.yml"

For the compressors, you have to specify the path to the compressors, in which `{FILE}` will be replaced with the path to the temporary file that is to be compressed. You can leave the `compressors` option empty to just disable it. The compressed file will be read from the command's stdout or (if stdout is empty) read from the same temporary file.

Keep in mind this has to be *valid* yaml. Use two spaces before the dash in lists, not a tab. If you get a PHP exception, it means some of the specified paths don't exist, or are not parsable by [Packager](http://github.com/kamicane/packager).

Web Interface
-------------

Point your web browser to http://localhost/packager-web/. Select the desired components and click download. A file will be downloaded. Enjoy.
