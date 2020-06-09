<?php
include $_SERVER['DOCUMENT_ROOT'] .'/header.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/User.php';

global $connection;
// Initialize the session
session_start();

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
$dbclass = new DBClass();
$connection = $dbclass->getConnection();
$user = new User($connection);

$id=$_GET['id'];
$key=$_GET['key'];

if($user->confirmUser($id,$key)){
    echo "<p>User account confirmed. You will receive an e-mail asking you to confirm your account. When you have confirmed your account, you can login <a href='/'>here</a>.</p>";
} else {
    echo "Error confirming user account";
}
include $_SERVER['DOCUMENT_ROOT'] .'/footer.php';
