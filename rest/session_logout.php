<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';

$dbclass = new DBClass();
$connection = $dbclass->getConnection();
logout($connection);

global $force_login;

$force_login=true;

if(isset($_GET["redirect"])&&$_GET["redirect"]!==""){
		header("location: ".$_GET["redirect"]);
		exit;
}

if(isset($_POST["redirect"])&&$_POST["redirect"]!==""){
		header("location: ".$_POST["redirect"]);
		exit;
}

echo "true";
exit;
?>
