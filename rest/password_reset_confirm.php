<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';

$dbclass = new DBClass();
$connection = $dbclass->getConnection();

$email=$_POST["email"];
$key=$_POST["key"];
$password=$_POST["password"];
$password2=$_POST["password2"];
if($password!=$password2){
	return "no match";
}
if(password_reset_confirm($email,$key,$password)){
 	echo "Password reset";
} else {
	echo "We could not reset your password";
}