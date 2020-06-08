<?php
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/UserOrganization.php';

$connection=initWeb();

$user_organization = new UserOrganization($connection);

$id=$_GET['id'];
$key=$_GET['key'];

$user_organization->id=$id;
$user_organization->read();
if($user_organization->confirmUserOrganization($key)){
    echo "<p>User organization membership confirmed. Click <a href='/'>here</a> to continue.</p>";
} else {
    echo "Error confirming user organization membership";
}