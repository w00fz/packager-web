<?php

Class Storage {
	
	private $db = null;
	private $options = array(
		'database' => 'packager.sql'
	);
	
	public function __construct($options){
		$this->setOptions($options);
		
		if (class_exists("SQLite3")){
			$this->db = $this->create_db($this->options['database']);			
		}
	}
	
	public function setOptions($options = array()){
		if (!count($options)) return $this->options;
		
		if (is_string($options)) $this->options['database'] = $options;
		else $this->options = array_merge($this->options, $options);
		
		return $this->options;
	}
	
	public function create_db(){
		$db_file = $this->options['database'];				
		$this->db = new SQLite3($db_file);
		
		if (!$this->db->querySingle("SELECT name FROM sqlite_master WHERE type='table' AND name='hashes'"))
			$this->db->exec("CREATE TABLE 'hashes' ( 'md5' VARCHAR(32) NOT NULL PRIMARY KEY, 'packages' TEXT NOT NULL, 'date' TINYTEXT NOT NULL );");
		
		return $this->db;
	}

	public function save($files, $hash = ""){
		if (!count($files)) return array();
		
		$serial = implode(';', $files);
		$hash = (!strlen($hash)) ? md5($serial) : $hash;

		$check = $this->db->querySingle("SELECT md5 FROM hashes WHERE md5='".$hash."'");
		if (!$check) $this->db->exec("INSERT INTO hashes (md5, packages, date) VALUES ('".$hash."', '".$serial."', '".time()."')");
		
		return array('hash' => $hash, 'serial' => $serial);
	}
	
	public function load($hash){
		$components = $this->db->querySingle("SELECT packages FROM hashes WHERE md5='".$hash."'");
		return (!$components) ? $components : explode(';', $components);
	}
}

?>