<?php

putenv('LC_ALL=en_US.UTF-8');
setlocale(LC_ALL, null);

require "libs/packager/packager.php";
require "libs/control/control.php";
require "libs/markdown.php";
require "libs/storage.php";

$packages = YAML::decode_file('packages.yml');
if (empty($packages)) $packages = array();

$config = YAML::decode_file('config.yml');
if (empty($config['view']['theme'])) $config['view']['theme'] = 'packager';

Control::config('default_controller', 'web');

// Routes
Control::route("/load|get|download|ajax/", 'web', 'routing');
Control::route("/ajax\/[a-z0-9]{32}/", 'web', "routing");
Control::route("/load\/[a-z0-9]{32}/", 'web', "routing");
Control::route("/^[a-z0-9]{32}/", 'web', "load");
Control::route("/(get\/([a-z0-9]{32})|download\/([a-z0-9]{32}))/", 'web', "routing");

new Control();
?>
