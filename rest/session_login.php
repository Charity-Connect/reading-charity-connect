<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';

global $dev_headers;

$dev_headers=true;
echo "true";
exit;

$dbclass = new DBClass();
$connection = $dbclass->getConnection();

$email=$_POST["email"];
$password=$_POST["password"];

    if(login($connection,$email,$password)){
    	echo "true";
    } else {
    	echo "false";
    }
?>
