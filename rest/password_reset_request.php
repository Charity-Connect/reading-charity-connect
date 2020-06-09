<?php

include $_SERVER['DOCUMENT_ROOT'] .'/header.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';

$dbclass = new DBClass();
$connection = $dbclass->getConnection();

$email=$_POST["email"];
if(password_reset_request($email)){
 	echo "<p>Password reset e-mail sent. <a href=\"/\">Home</a></p>";
} else {
	echo "<p>We could not find an account with that e-mail address. <a href=\"javascript:history.back()\">Back</a></p>";
}
include $_SERVER['DOCUMENT_ROOT'] .'/footer.php';
