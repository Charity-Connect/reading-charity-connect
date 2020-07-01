<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/Audit.php';

$connection=initRest();
$method = $_SERVER['REQUEST_METHOD'];

    $audit = new Audit($connection);
if (is_admin()&&$method=="GET") {
    // querying
    if(isset($_GET["date"])){
	    $date = $_GET["date"];
        $stmt = $audit->readByDate($date);
	} else {
		$stmt = $audit->readAll();
	}
	$count = $stmt->rowCount();

	if($count > 0){

		$audits = array();
		$audits["audit_entries"] = array();
		$audits["count"] = $count;

		while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
			extract($row);
			$audit  = array(
			"id" => $id,
			"audit_date" => $audit_date,
			"user_id" => $user_id,
			"display_name" => $display_name,
			"email" => $email,
			"action" => $action,
			"object" => $object,
			"key_id" => $key_id,
			"key_code" => $key_code,
			"name" => $name
			);

			array_push($audits["audit_entries"], $audit);
		}

		echo json_encode($audits);
	} else {
		$audits = array();
		$audits["audit_entries"] = array();
		$audits["count"] = 0;

		echo json_encode($audits);
	}
    
    
} else {
	http_response_code(405);
}
?>
