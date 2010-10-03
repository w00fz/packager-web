<?php

class Web extends Control {

	protected function index(){
		global $config;

		$pkg = new Packager($config['packages']);

		$data = array();

		foreach($pkg->get_packages() as $package){

			$data[$package] = array(
				'files' => array(),
				'package' => $package,
				'package_web' => markdown($pkg->get_package_web($package)),
				'package_authors' => markdown(implode(' & ', $pkg->get_package_authors($package))),
				'package_description' => markdown($pkg->get_package_description($package)),
				'package_license' => markdown($pkg->get_package_license($package)),
				'package_copyright' => markdown($pkg->get_package_copyright($package)),
			);


			foreach ($pkg->get_all_files($package) as $file){


				$file_meta = array(
					'name' => $pkg->get_file_name($file),
					'depends' => implode(', ', $pkg->get_file_dependancies($file)),
					'provides' => implode(', ', $pkg->get_file_provides($file)),
					'description' => markdown($pkg->get_file_description($file))
				);

				$data[$package]['files'][$file] = $file_meta;

			}

		}

		$config['view']['blocks'] = $config['packager']['blocks'];
		$config['view']['compressors'] = array_keys($config['packager']['compressors']);

		$this->data('packages', $data);
		$this->data('config', $config['view']);
		$this->render($config['view']['theme']);
	}

	public function download(){
		global $config;

		$post = $this->post();

		$files = isset($post['files']) ? $post['files'] : array();
		$disabled = isset($post['disabled']) ? $post['disabled'] : array();
		$include_blocks = isset($post['blocks']) ? $post['blocks'] : array();
		$compressor = isset($post['compressor']) ? $post['compressor'] : null;

		$pkg = new Packager($config['packages']);

		$exclude_blocks = array_diff(array_keys($config['packager']['blocks']), $include_blocks);

		foreach ($disabled as $key => $package){
			if ($package) $pkg->remove_package($package);
			else unset($disabled[$key]);
		}

		$contents = $pkg->build($files, array(), array(), $exclude_blocks);
		$useonly = count($disabled) ? $pkg->get_packages() : null;
		$headers = '';

		if ($compressor){
			$contents = $this->compress($compressor, $contents);
			$headers = $this->get_headers($pkg, $files);
		}

		$packager_cmd = $this->get_packager_command($pkg, $files, $useonly, $exclude_blocks);

		header('Content-Type: ' . $config['packager']['contenttype'] . '; charset=' . $config['packager']['charset']);
		header('Content-Disposition: attachment; filename="' . $config['packager']['exports'] . '"');

		echo $packager_cmd . $headers . $contents;
	}

	protected function get_packager_command($pkg, $files, $useonly, $blocks){
		$cmd = '// packager build';

		$packages = array();
		foreach ($files as $file){
			$package = explode('/', $file, 2);
			$package = $package[0];

			if (!isset($packages[$package])) $packages[$package] = array();

			$packages[$package][] = $file;
		}

		foreach ($packages as $name => $files){
			if (count($files) == count($pkg->get_all_files($name))) $cmd .= " {$name}/*";
			else foreach ($files as $file) $cmd .= " {$file}";
		}

		if ($useonly){
			$cmd .= " +use-only";
			foreach ($useonly as $name){
				$cmd .= " {$name}";
			}
		}

		if ($blocks){
			$cmd .= " -blocks";
			foreach ($blocks as $block){
				$cmd .= " {$block}";
			}
		}

		return $cmd . "\n";
	}

	protected function get_headers($pkg, $files){
		$header = Array();
		$header['copyrights'] = Array();
		$header['licenses'] = Array();

		if (is_array($files)) foreach ($files as $file) {
			$file_name = $pkg->get_file_name($file);
			$file_package = $pkg->get_file_package($file);
			$c = utf8_encode("\xa9");
			$header['copyrights'][] = '- ' . preg_replace("/^(?:(?:copyright|&copy;|$c)\s*)+/i", '', $pkg->get_package_copyright($file_package));
			$header['licenses'][] = "- {$pkg->get_package_license($file_package)}";
		}
		$head = "/*\n---\n";
		foreach ($header as $k => &$h) {
			$heads = Array();
			foreach ($h as $v) {
				if (!in_array($v, $heads)) {
					$heads[] = "{$v}";
				}
			}
			$h = "{$k}:\n  " . implode("\n  ", $heads) . "\n";
		}
		$head .= implode("\n", $header);
		$head .="...\n*/\n";

		return $head;
	}

	protected function compress($compressor, $contents){
		global $config;
		$pkgconfig = $config['packager'];

		if (empty($pkgconfig['compressors']) || empty($pkgconfig['compressors'][$compressor])){
			error_log("packager-web: compressor {$compressor} not found");
			return $contents;
		}

		$tempfile = tempnam(sys_get_temp_dir(), 'packager_');
		if (!$tempfile){
			error_log('packager-web: failed to create tempfile: ' . $tempfile);
			return $contents;
		}

		file_put_contents($tempfile, $contents);

		$cmd = str_replace('{FILE}', $tempfile, $pkgconfig['compressors'][$compressor]);

		$contents = shell_exec($cmd);
		if (!$contents) $contents = file_get_contents($tempfile);

		unlink($tempfile);

		return $contents;
	}

}

?>
