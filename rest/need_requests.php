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


    $need_request->client_need_id = $data['client_need_id'];
    $need_request->organization_id = $data['organization_id'];
    $need_request->agreed = isset($data['agreed'])?$data['agreed']:'N';
    $need_request->complete = isset($data['complete'])?$data['complete']:'N';
    $need_request->target_date = $data['target_date'];
    $need_request->notes = $data['notes'];

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
		$id=$need_request->create();
        if($id>0){
            $need_request_arr  = array(
                    "id" => $need_request->id,
                    "client_need_id" => $need_request->client_need_id,
                    "organization_id" => $need_request->organization_id,
                    "agreed" => $need_request->agreed,
                    "complete" => $need_request->complete,
                    "target_date" => $need_request->target_date,
                    "notes" => $need_request->notes
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
        $stmt = $need_request->readAll();
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
                "type_name" => $type_name,
                "date_needed" => $date_needed,
                "organization_id" => $organization_id,
                "agreed" => $agreed,
                "complete" => $complete,
                "target_date" => $target_date,
                "notes" => $notes
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
