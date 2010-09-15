<?php

class Web extends Control {

	protected function index($hash = false){
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

		if (preg_match("/^[a-f0-9]{32}$/", $hash)) $this->data('hash', $hash);
		$this->data('packages', $data);
		$this->data('config', $config['view']);
		$this->render($config['view']['theme']);
	}

	public function download($direct = false){
		global $config;

		if ($direct) return $this->get($direct);

		$post = $this->post();

		$files = isset($post['files']) ? $post['files'] : array();
		$disabled = isset($post['disabled']) ? $post['disabled'] : array();;
		$compress = isset($post['compress']) ? true : false;

		$pkg = new Packager($config['packages']);
		
		if (!count($files)) return $this->index();

		$storage = new Storage('mootools-core.sql');
		$storage->save($files);

		foreach ($disabled as $key => $package){
			if ($package) $pkg->remove_package($package);
			else unset($disabled[$key]);
		}

		$contents = $pkg->build_from_files($files);

		$useonly = count($disabled) ? $pkg->get_packages() : null;

		if ($compress) $contents = $this->compress($contents);

		header('Content-Type: ' . $config['packager']['contenttype']);
		header('Content-Disposition: attachment; filename="' . $config['packager']['exports'] . '"');

		echo $this->get_packager_command($files, $useonly);
		if ($compress) echo $this->get_headers($pkg, $files);
		echo $contents;
	}
	
	public function get($hash){
		global $config;
		
		if (!preg_match("/^[a-f0-9]{32}$/", $hash)) return $this->index();
		
		$storage = new Storage('mootools-core.sql');
		$files = $storage->load($hash);
		
		if (!$files) return $this->index();
		
		$pkg = new Packager($config['packages']);
		
		$contents = $pkg->build_from_files($files);
		
		header('Content-Type: ' . $config['packager']['contenttype']);
		header('Content-Disposition: attachment; filename="' . $config['packager']['exports'] . '"');
		
		echo $contents;
	}
	
	public function load($hash){
		global $config;
		
		if (!preg_match("/^[a-f0-9]{32}$/", $hash)) return $this->index();
		
		$storage = new Storage('mootools-core.sql');
		$files = $storage->load($hash);
		
		if (!$files) return $this->index();
		else return $this->index($hash);
	}
	
	public function ajax($hash = false){
		if (!preg_match("/^[a-f0-9]{32}$/", $hash)) return $this->index();
		
		$storage = new Storage('mootools-core.sql');
		$files = $storage->load($hash);
		
		if (!$files) echo "hash not found";
		else echo implode(";", $files);
	}
	
	public function routing($action, $hash = false){
		return $this->$action($hash);
	}

	protected function get_packager_command($files, $useonly){
		$cmd = '// packager build';

		foreach ($files as $file){
			$cmd .= " {$file}";
		}

		if ($useonly){
			$cmd .= " +use-only";
			foreach ($useonly as $name){
				$cmd .= " {$name}";
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

	protected function compress($contents){
		global $config;
		$pkgconfig = $config['packager'];

		if (empty($pkgconfig['compressor'])){
			error_log('packager-web: compressor not set');
			return $contents;
		}

		$tempfile = tempnam(sys_get_temp_dir(), 'packager_');
		if (!$tempfile){
			error_log('packager-web: failed to create tempfile: ' . $tempfile);
			return $contents;
		}

		file_put_contents($tempfile, $contents);

		$cmd = str_replace('{FILE}', $tempfile, $pkgconfig['compressor']);
		exec($cmd);

		$contents = file_get_contents($tempfile);
		unlink($tempfile);

		return $contents;
	}

}

?>
