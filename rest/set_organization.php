<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';

initRest();

$id=$_GET["id"];
if($org_name=set_current_organizaton($id)){
	echo "{\"organization_id\":".$id.",\"organization_name\":\"".$org_name."\"}";
}
?>
