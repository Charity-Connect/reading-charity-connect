<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';

$dbclass = new DBClass();
$connection = $dbclass->getConnection();

$email=$_POST["email"];
$password=$_POST["password"];
$redirect=$_POST["redirect"];

    if(login($connection,$email,$password)){
    	if(isset($redirect)&&$redirect!==""){
      			header("location: ".$redirect);
	  			exit;
	  	} else {
    		echo "true";
    	}
    } else {
    	echo "false";
    }
?>
