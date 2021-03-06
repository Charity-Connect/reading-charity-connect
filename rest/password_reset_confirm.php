<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';

$dbclass = new DBClass();
$connection = $dbclass->getConnection();

$email=$_POST["email"];
$key=$_POST["key"];
$password=$_POST["password"];
$password2=$_POST["password2"];
include $_SERVER['DOCUMENT_ROOT'] .'/header.php';

if($password!=$password2){
	echo "<p>The passwords did not match</p>";
}
if(password_reset_confirm($email,$key,$password)){
 	echo "<p>Password reset. Click <a href='/'>here</a> to log in.</p>";
} else {
	echo "Error: we could not reset your password";
}
include $_SERVER['DOCUMENT_ROOT'] .'/footer.php';
