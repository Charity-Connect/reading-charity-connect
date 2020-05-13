<?php
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/UserOrganization.php';

$connection=initRest();

$user_organization = new UserOrganization($connection);

$id=$_GET['id'];
$key=$_GET['key'];

$user_organization->id=$id;
$user_organization->read();
if($user_organization->confirmUserOrganization($key)){
    echo "User organization membership confirmed";
} else {
    echo "Error confirming user organization membership";
}