<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
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
