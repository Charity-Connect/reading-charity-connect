<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
session_start();

$view = "";
if(isset($_GET["view"]))
	$view = $_GET["view"];

if($view=="is_admin"){

	if(is_admin()){
		echo "true";
	} else {
		echo "false";
	}
	exit;
} else if (	$view=="is_org_admin"){

	if(is_org_admin()){
		echo "true";
	} else {
		echo "false";
	}
	exit;
} else {

	if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){
		echo "true";
		exit;
	}
	echo "false";

}

?>
