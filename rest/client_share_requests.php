<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/ClientShareRequest.php';

$connection=initRest();

    $client_share_request = new ClientShareRequest($connection);
$data = json_decode(file_get_contents('php://input'), true);

if(isset($data)) {
    // doing an update
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-address, Access-Control-Allow-Headers, Authorization, X-Requested-With");


    $client_share_request->id = $data['id'];
    $client_share_request->approved = $data['approved'];
	if($client_share_request->update()){
		echo '{"status": "success"}';
	} else {
		echo '{"status": "failed"}';
	}

} else {
// querying

    $view = "";
    if(isset($_GET["view"]))
	    $view = $_GET["view"];
    if($view=="one") {
        $client_share_request->id=$_GET["id"];
        $client_share_request->read();
        echo json_encode($client_share_request);
    } else {
    	if($view=="unresponded"){
        	$stmt = $client_share_request->readFiltered("P");
		} else if($view=="agreed"){
        	$stmt = $client_share_request->readFiltered("Y");
		} else if($view=="rejected"){
        	$stmt = $client_share_request->readFiltered("N");
		} else if($view=="completed"){
        	$stmt = $client_share_request->readFiltered("A");
		} else if($view=="in_progress"){
        	$stmt = $client_share_request->readFiltered("P");
		} else {
        	$stmt = $client_share_request->readAll();
        }
        $count = $stmt->rowCount();
        if($count > 0){

            $client_share_requests = array();
            $client_share_requests["client_share_request"] = array();
            $client_share_requests["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
                extract($row);

                $client_share_request  = array(
                "id" => $id,
                "client_id" => $client_id,
                "client_name" => $client_name,
                "client_address" => $client_address,
                "client_postcode" => $client_postcode,
                "notes" => $notes,
                "organization_id" => $organization_id,
                "organization_name" => $organization_name,
                "requesting_organization_id" => $requesting_organization_id,
                "requesting_organization_name" => $requesting_organization_name,
                "approved" => $approved,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
                );

                array_push($client_share_requests["client_share_request"], $client_share_request);
            }

            echo json_encode($client_share_requests);
        } else {
            $client_share_requests = array();
            $client_share_requests["client_share_request"] = array();
            $client_share_requests["count"] = 0;

            echo json_encode($client_share_requests);
        }
    }
}

?>
