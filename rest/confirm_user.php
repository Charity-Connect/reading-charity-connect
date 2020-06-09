<?php
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/User.php';

global $connection;
// Initialize the session
session_start();

include $_SERVER['DOCUMENT_ROOT'] .'/header.php';

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
$dbclass = new DBClass();
$connection = $dbclass->getConnection();
$user = new User($connection);

$id=$_GET['id'];
$key=$_GET['key'];

if($user->confirmUser($id,$key)){
    echo "<p>User account confirmed. Click <a href='/'>here</a> to login.</p>";
} else {
    echo "Error confirming user account";
}
include $_SERVER['DOCUMENT_ROOT'] .'/footer.php';
