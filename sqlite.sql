# Host: localhost
# Generation Time: Monday 13th 2010f September 2010 03:32 am
# SQLite Version: 3.6.22
# PHP Version: 5.3.2
# Database: sqlite.sql
# --------------------------------------------------------

#
# Table structure for table: hashes
#
CREATE TABLE 'hashes' ( 'md5' VARCHAR(32) NOT NULL PRIMARY KEY, 'packages' TEXT NOT NULL, 'date' TINYTEXT NOT NULL );

#
# Dumping data for table: hashes
#
# --------------------------------------------------------


#
# User Defined Function properties: md5rev
#
/*
function md5_and_reverse($string) { return strrev(md5($string)); }
*/

#
# User Defined Function properties: IF
#
/*
function sqliteIf($compare, $good, $bad){ if ($compare) { return $good; } else { return $bad; } }
*/