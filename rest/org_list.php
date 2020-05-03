<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/Organization.php';

$connection=initPublicRest();


$organization = new Organization($connection);
$stmt = $organization->readAll();
$count = $stmt->rowCount();

if($count > 0){

	$organizations = array();
	$organizations["organizations"] = array();
	$organizations["count"] = $count;

	while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){

		extract($row);

		$organization  = array(
		"id" => $id,
		"name" => $name
		);

		array_push($organizations["organizations"], $organization);
	}

	echo json_encode($organizations);
} else {
	$organizations = array();
	$organizations["organizations"] = array();
	$organizations["count"] = 0;
	echo json_encode($organizations);
}

?>
