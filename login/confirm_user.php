<?php
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/user.php';

global $connection;
// Initialize the session
session_start();

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
$dbclass = new DBClass();
$connection = $dbclass->getConnection();
$user = new User($connection);

$id=$_GET['id'];
$key=$_GET['key'];

$user->id=$id;
$user->read();
if($user->confirmUser($key)){
    echo "User account confirmed";
} else {
    echo "Error confirming user account";
}