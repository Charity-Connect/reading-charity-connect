<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';

$dbclass = new DBClass();
$connection = $dbclass->getConnection();

$email=$_POST["email"];
if(password_reset_request($email)){
 	echo "Password reset e-mail sent.";
} else {
	echo "We could not find an account with that e-mail address";
}