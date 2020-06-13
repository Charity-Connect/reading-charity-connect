<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/NeedRequest.php';

$connection=initRest();

    $need_request = new NeedRequest($connection);
$data = json_decode(file_get_contents('php://input'), true);
if(isset($data)) {
    // doing a create or update
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-organization_id, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    $need_request->agreed = $data['agreed'];
    $need_request->complete = $data['complete'];
    $need_request->target_date = $data['target_date'];
    $need_request->request_response_notes = $data['request_response_notes'];

    if(isset($data['id'])){
        $need_request->id = $data['id'];
        if($need_request->update()){
            $need_request->read();
            echo json_encode($need_request);
        }else{
            echo '{';
                echo '"message": "Unable to update need_request-."';
            echo '}';
        }

    } else {
	    $need_request->client_need_id = $data['client_need_id'];
	    $need_request->request_organization_id = $data['request_organization_id'];
		$id=$need_request->create();
        if($id>0){
            $need_request_arr  = array(
                    "id" => $need_request->id,
                    "client_need_id" => $need_request->client_need_id,
                    "request_organization_id" => $need_request->organization_id,
                    "agreed" => $need_request->agreed,
                    "complete" => $need_request->complete,
                    "target_date" => $need_request->target_date,
                    "request_response_notes" => $need_request->request_response_notes
                    );
            echo json_encode($need_request_arr);

        }else{
            echo '{';
                echo '"message": "Unable to create need_request-."';
            echo '}';
        }
    }

} else {

    // querying

    $view = "";
    if(isset($_GET["view"]))
	    $view = $_GET["view"];
    if($view=="one") {
        $need_request->id=$_GET["id"];
        $need_request->read();
        echo json_encode($need_request);
    } else {
    	if($view=="unresponded"){
        	$stmt = $need_request->readFiltered("U","");
		} else if($view=="agreed"){
        	$stmt = $need_request->readFiltered("Y","");
		} else if($view=="rejected"){
        	$stmt = $need_request->readFiltered("N","");
		} else if($view=="completed"){
        	$stmt = $need_request->readFiltered("Y","Y");
		}else if($view=="in_progress"){
        	$stmt = $need_request->readFiltered("Y","N");
		} else {
        	$stmt = $need_request->readAll();
        }
        $count = $stmt->rowCount();
        if($count > 0){

            $need_requests = array();
            $need_requests["need_request"] = array();
            $need_requests["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
                extract($row);

                $need_request  = array(
                "id" => $id,
                "client_need_id" => $client_need_id,
                "client_name" => $client_name,
                "client_postcode" => $client_postcode,
                "type" => $type,
                "type_name" => $type_name,
                "date_needed" => $date_needed,
                "request_organization_id" => $request_organization_id,
                "agreed" => $agreed,
                "complete" => $complete,
                "target_date" => $target_date,
                "request_response_notes" => $request_response_notes,
                "need_notes" => $need_notes,
                "source_organization_name"=>$source_organization_name,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
                );

                array_push($need_requests["need_request"], $need_request);
            }

            echo json_encode($need_requests);
        } else {
            $need_requests = array();
            $need_requests["need_request"] = array();
            $need_requests["count"] = 0;

            echo json_encode($need_requests);
        }
    }

}
?>
