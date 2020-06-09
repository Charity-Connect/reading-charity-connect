<?php
include $_SERVER['DOCUMENT_ROOT'] .'/header.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/UserOrganization.php';

$connection=initWeb();

$user_organization = new UserOrganization($connection);

$id=$_GET['id'];
$key=$_GET['key'];

if($user_organization->confirmUserOrganization($id,$key)){
    echo "<p>User organization membership confirmed. Click <a href='/'>here</a> to continue.</p>";
} else {
    echo "Error confirming user organization membership";
}
include $_SERVER['DOCUMENT_ROOT'] .'/footer.php';
