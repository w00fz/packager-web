<?php

putenv('LC_ALL=en_US.UTF-8');
setlocale(LC_ALL, null);

require "libs/packager/packager.php";
require "libs/control/control.php";
require "libs/markdown.php";

$packages = YAML::decode_file('packages.yml');
if (empty($packages)) $packages = array();

$config = YAML::decode_file('config.yml');
if (empty($config['view']['theme'])) $config['view']['theme'] = 'packager';
if (empty($config['packager']['blocks'])) $config['packager']['blocks'] = array();
if (empty($config['packager']['compressors'])) $config['packager']['compressors'] = array();

Control::config('default_controller', 'web');

new Control();

?>
