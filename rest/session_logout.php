<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
logout();

global $force_login;

$force_login=true;

$redirect=$_GET["redirect"];

if(isset($redirect)&&$redirect!==""){
		header("location: ".$redirect);
		exit;
}
$redirect=$_POST["redirect"];

if(isset($redirect)&&$redirect!==""){
		header("location: ".$redirect);
		exit;
}

echo "true";
exit;
?>
